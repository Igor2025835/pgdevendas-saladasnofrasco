import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('dist/v1-layout.js','utf8');
function page(options={}){
 const events=new Map(),frames=new Map(),timers=new Map();let sequence=0,intersection;
 const on=target=>(name,fn)=>{const key=target+':'+name;events.set(key,[...(events.get(key)||[]),fn]);};
 const emit=(target,name,event={})=>{for(const fn of events.get(target+':'+name)||[])fn(event);};
 const media={matches:!!options.reduced,addEventListener:on('media')};
 const dialog={open:false,addEventListener:on('dialog')};
 const previous={addEventListener:on('previous')},next={addEventListener:on('next')};
 const toggle={dataset:{},addEventListener:on('toggle'),setAttribute(name,value){this[name]=value;}};
 const track={scrollLeft:0,clientWidth:300,addEventListener:on('track'),contains:()=>false,getBoundingClientRect:()=>({top:20,bottom:500}),querySelector:selector=>({getBoundingClientRect:()=>({left:(selector.includes('aria-hidden')?1000:0)-track.scrollLeft})})};
 const document={hidden:false,addEventListener:on('document'),querySelector:selector=>({'#reviews-track':track,'#conversation-dialog':dialog,'.reviews-previous':previous,'.reviews-next':next,'.reviews-toggle':toggle})[selector]};
 const window={innerHeight:800,addEventListener:on('window'),matchMedia:query=>query.includes('reduced')?media:{matches:!!options.hover}};
 const context={document,window,requestAnimationFrame:fn=>{const id=++sequence;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:fn=>{const id=++sequence;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)};
 if(!options.noObserver)context.IntersectionObserver=class{constructor(fn){intersection=fn;}observe(){}};
 vm.runInNewContext(source,context);
 return{track,document,dialog,media,toggle,emit,frames,visible(value=true){intersection([{isIntersecting:value}]);},step(time){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));},resume(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());}};
}
test('reviews advance automatically and wrap through repeated cycles without an end stop',()=>{
 const p=page();assert.equal(p.frames.size,0);p.visible();let wrapped=0,last=0;
 for(let i=0;i<5000;i++){p.step(i*16);assert.ok(p.track.scrollLeft>=0&&p.track.scrollLeft<1000);if(p.track.scrollLeft<last)wrapped++;last=p.track.scrollLeft;}
 assert.ok(wrapped>=2);assert.equal(p.frames.size,1);
});
test('offscreen, hidden tabs, hover, focus and enlarged reviews stop animation',()=>{
 const p=page({hover:true});p.visible();p.step(0);p.step(16);assert.ok(p.track.scrollLeft>0);
 p.visible(false);assert.equal(p.frames.size,0);p.visible();assert.equal(p.frames.size,1);
 p.document.hidden=true;p.emit('document','visibilitychange');assert.equal(p.frames.size,0);p.document.hidden=false;p.emit('document','visibilitychange');
 p.emit('track','pointerenter');assert.equal(p.frames.size,0);p.emit('track','pointerleave');assert.equal(p.frames.size,1);
 p.emit('track','focusin');assert.equal(p.frames.size,0);p.emit('track','focusout');
 p.dialog.open=true;p.step(100);assert.equal(p.frames.size,0);p.dialog.open=false;p.emit('dialog','close');assert.equal(p.frames.size,1);
});
test('manual arrows wrap backwards and forwards, then resume automatically',()=>{
 const p=page();p.visible();p.emit('previous','click');assert.equal(p.track.scrollLeft,745);assert.equal(p.frames.size,0);
 p.emit('next','click');assert.equal(p.track.scrollLeft,0);p.resume();assert.equal(p.frames.size,1);p.step(0);p.step(32);assert.ok(p.track.scrollLeft>0);
 p.emit('track','wheel');assert.equal(p.frames.size,0);p.resume();assert.equal(p.frames.size,1);
});
test('reduced motion disables autoplay while manual navigation remains available',()=>{
 const p=page({reduced:true,noObserver:true});assert.equal(p.frames.size,0);p.emit('next','click');assert.equal(p.track.scrollLeft,255);p.resume();assert.equal(p.frames.size,0);
 p.media.matches=false;p.emit('media','change');assert.equal(p.frames.size,1);
 p.emit('window','pagehide');assert.equal(p.frames.size,0);p.emit('window','pageshow');assert.equal(p.frames.size,1);
});
test('the visible play/pause control enables motion by choice and remembers a manual pause',()=>{
 const p=page({reduced:true});p.visible();assert.equal(p.frames.size,0);assert.equal(p.toggle['aria-label'],'Iniciar rolagem automática');
 p.emit('toggle','click');assert.equal(p.frames.size,1);assert.equal(p.toggle['aria-label'],'Pausar rolagem automática');p.step(0);p.step(32);assert.ok(p.track.scrollLeft>0);
 p.emit('toggle','click');assert.equal(p.frames.size,0);p.visible(false);p.visible();assert.equal(p.frames.size,0);
 p.emit('toggle','click');assert.equal(p.frames.size,1);p.emit('media','change');assert.equal(p.frames.size,0);
});
