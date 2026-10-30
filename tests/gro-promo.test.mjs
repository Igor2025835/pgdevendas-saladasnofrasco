import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('dist/gro-promo.js','utf8');
const key='saladas:gro:anniversary:deadline:v1';
const start=Date.UTC(2026,9,30,12);
function page(options={}){
 let now=options.now??start;
 const saved=options.saved??new Map();
 const handlers=new Map(),intervals=new Map(),styles=new Map();let next=0;
 const counter={textContent:'01:53:00',setAttribute(name,value){this[name]=value;}};
 const timerWrap={hidden:false},message={textContent:'Acesso vitalício + 70% de desconto + bónus'};
 const bar={querySelector:s=>s==='[data-gro-timer-wrap]'?timerWrap:message,getBoundingClientRect:()=>({height:78})};
 const document={hidden:false,querySelector:s=>s==='.gro-announcement'?bar:counter,documentElement:{style:{setProperty:(k,v)=>styles.set(k,v)}},addEventListener:(name,fn)=>handlers.set('document:'+name,fn)};
 const storage={getItem:k=>{if(options.blocked)throw Error('Unavailable');return saved.get(k)??null;},setItem:(k,v)=>{if(options.blocked||options.readOnly)throw Error('Blocked');saved.set(k,v);}};
 const window={localStorage:storage,sessionStorage:storage,addEventListener:(name,fn)=>handlers.set('window:'+name,fn)};
 vm.runInNewContext(source,{document,window,Date:{now:()=>now},setInterval(fn){intervals.set(++next,fn);return next;},clearInterval:id=>intervals.delete(id)});
 return {counter,timerWrap,message,saved,styles,document,intervals,advance(ms){now+=ms;for(const fn of [...intervals.values()])fn();},emit:(target,name,event={})=>handlers.get(target+':'+name)?.(event),now:()=>now};
}

test('anniversary timer starts at 1h53 and reload preserves elapsed time',()=>{
 const p=page();assert.equal(p.counter.textContent,'01:53:00');
 p.advance(60000);assert.equal(p.counter.textContent,'01:52:00');
 const q=page({now:p.now(),saved:p.saved});assert.equal(q.counter.textContent,'01:52:00');
});
test('expired anniversary timer stays expired after reload and removes the countdown claim',()=>{
 const p=page();p.advance(113*60*1000);
 assert.equal(p.counter.textContent,'00:00:00');assert.equal(p.timerWrap.hidden,true);assert.equal(p.intervals.size,0);
 assert.equal(p.message.textContent,'Prazo da promoção terminado.');
 const q=page({now:p.now(),saved:p.saved});assert.equal(q.counter.textContent,'00:00:00');assert.equal(q.timerWrap.hidden,true);
});
test('hidden tabs and restored pages use real elapsed time rather than pausing the deadline',()=>{
 const p=page();p.document.hidden=true;p.emit('document','visibilitychange');assert.equal(p.intervals.size,0);
 p.advance(10*60*1000);p.document.hidden=false;p.emit('document','visibilitychange');assert.equal(p.counter.textContent,'01:43:00');
 p.emit('window','pagehide');assert.equal(p.intervals.size,0);
 p.advance(60*1000);p.emit('window','pageshow');assert.equal(p.counter.textContent,'01:42:00');assert.equal(p.intervals.size,1);
});
test('blocked storage falls back gracefully and read-only storage never resets an existing expiry',()=>{
 const p=page({blocked:true});p.advance(1000);assert.equal(p.counter.textContent,'01:52:59');
 const q=page({saved:new Map([[key,String(start-1000)]]),readOnly:true});assert.equal(q.counter.textContent,'00:00:00');
});
test('another tab can synchronize an earlier deadline without extending the promotion',()=>{
 const p=page();p.emit('window','storage',{key,newValue:String(start+60000)});assert.equal(p.counter.textContent,'00:01:00');
 p.emit('window','storage',{key,newValue:String(start+113*60*1000)});assert.equal(p.counter.textContent,'00:01:00');
});
