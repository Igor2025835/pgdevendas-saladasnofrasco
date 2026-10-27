import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../dist/exit-offer.js',import.meta.url),'utf8');
function browser(options={}){
 const storage=options.storage||new Map(),timers=new Map();
 const handlers={document:new Map(),window:new Map(),offer:new Map(),close:new Map(),leave:new Map()};
 let now=0,base,timerId=0;
 const on=type=>(name,fn)=>{const list=handlers[type].get(name)||[];list.push(fn);handlers[type].set(name,list);};
 const emit=(type,name,event={})=>{for(const fn of handlers[type].get(name)||[])fn({isTrusted:true,defaultPrevented:false,target:{closest:()=>null},...event});};
 const details={href:''};
 const offer={open:false,shows:0,addEventListener:on('offer'),showModal(){this.open=true;this.shows++;},close(){this.open=false;emit('offer','close');},querySelector:s=>s==='.exit-offer-details'?details:{addEventListener:on(s==='.exit-offer-close'?'close':'leave')}};
 const history={state:options.state??null,pushes:0,backs:0,replaceState(s){this.state=s;base=s;},pushState(s){this.state=s;this.pushes++;},back(){this.backs++;}};
 const doc={hidden:false,focus:true,otherDialog:false,videos:[],documentElement:{style:{overflow:''}},hasFocus(){return this.focus;},addEventListener:on('document'),querySelector:s=>s==='#exit-offer'?offer:null,querySelectorAll(s){return s==='dialog[open]'?[...(this.otherDialog?[{}]:[]),...(offer.open?[offer]:[])]:this.videos;}};
 const location=new URL('https://saladas.test/?utm_source=test#oferta');
 location.replacements=[];location.replace=url=>location.replacements.push(url);
 const win={addEventListener:on('window'),innerWidth:options.mobile?390:1280,matchMedia:()=>({matches:!options.mobile})};win.self=win.top=win;
 const context={window:win,document:doc,history,location,performance:{now:()=>now},sessionStorage:{getItem:k=>{if(options.noStorage)throw Error();return storage.get(k);},setItem:(k,v)=>{if(options.noStorage)throw Error();storage.set(k,v);}},URL,crypto:{randomUUID:()=> 'test-token'},setTimeout(fn,ms){timers.set(++timerId,{fn,at:now+ms});return timerId;},clearTimeout(id){timers.delete(id);}};
 vm.runInNewContext(source,context);
 return {history,doc,offer,storage,details,emit,location,handlers,context,engage(){emit('document','pointerdown');},back(){emit('window','popstate',{state:base});},advance(ms){now+=ms;for(const [id,t] of [...timers])if(t.at<=now){timers.delete(id);t.fn();}},mouseExit(){emit('document','mousemove',{clientX:1200,clientY:50});emit('document','mouseout',{clientX:1200,clientY:0,relatedTarget:null,buttons:0});}};
}
const checkoutClick=b=>b.emit('document','click',{target:{closest:()=>({href:'https://pay.hotmart.com/O108101669E?checkoutMode=10'})}});

test('first real interaction arms Back immediately, without opening or redirecting',()=>{
 const b=browser();assert.equal(b.history.pushes,0);b.engage();assert.equal(b.history.pushes,1);assert.equal(b.offer.shows,0);assert.equal(b.location.replacements.length,0);
});
test('Back goes directly to the offer page with attribution, never a pop-up',()=>{
 const b=browser();b.engage();b.back();assert.deepEqual(b.location.replacements,['https://saladas.test/backredirect?utm_source=test']);assert.equal(b.offer.shows,0);b.back();b.engage();assert.equal(b.location.replacements.length,1);assert.equal(b.history.pushes,1);
});
test('reload adopts an existing guard instead of disabling Back or stacking another',()=>{
 const b=browser({state:{__saladasExitOfferV1:{token:'previous',slot:'guard'}}});b.engage();assert.equal(b.history.pushes,0);
 b.emit('window','popstate',{state:{__saladasExitOfferV1:{token:'previous',slot:'base'}}});assert.equal(b.location.replacements.length,1);
});
test('old pop-up seen flags do not disable the upgraded redirect',()=>{
 const b=browser({storage:new Map([['saladas:exit-offer:seen:v1','1']])});b.engage();b.back();assert.equal(b.location.replacements.length,1);
});
test('unrelated popstate, initial popstate and Forward do not trigger offers',()=>{
 const b=browser();b.emit('window','popstate',{state:null});b.engage();b.emit('window','popstate',{state:b.history.state});b.emit('window','popstate',{state:null});assert.equal(b.location.replacements.length,0);assert.equal(b.offer.shows,0);
});
test('checkout wins; returning from it cannot trigger either recovery flow',()=>{
 const b=browser();b.engage();checkoutClick(b);b.back();assert.equal(b.location.replacements.length,0);assert.equal(b.history.backs,1);b.advance(6000);b.mouseExit();b.advance(300);assert.equal(b.offer.shows,0);
 const revisit=browser({storage:b.storage});revisit.engage();assert.equal(revisit.history.pushes,0);
});
test('internal hash navigation is not mistaken for an exit',()=>{
 const b=browser();b.engage();b.location.hash='conteudo';b.emit('window','hashchange');b.location.hash='oferta';b.back();assert.equal(b.location.replacements.length,0);assert.equal(b.history.backs,1);
});
test('mouse pop-up requires desktop, elapsed reading time and a fresh top-right exit',()=>{
 const b=browser();b.mouseExit();b.advance(300);assert.equal(b.offer.shows,0);
 b.advance(6000);b.mouseExit();assert.equal(b.offer.shows,0);b.advance(200);assert.equal(b.offer.shows,1);assert.equal(b.location.replacements.length,0);
});
test('mobile and touch widths never show a mouse exit pop-up',()=>{
 const b=browser({mobile:true});b.advance(6000);b.mouseExit();b.advance(300);assert.equal(b.offer.shows,0);b.engage();b.back();assert.equal(b.location.replacements.length,1);
});
test('ordinary mouse exits, internal element transitions and stale motion do nothing',()=>{
 for(const event of [{clientX:100,clientY:0,relatedTarget:null},{clientX:1200,clientY:20,relatedTarget:null},{clientX:1200,clientY:0,relatedTarget:{}},{clientX:1200,clientY:0,relatedTarget:null,buttons:1}]){
  const b=browser();b.advance(6000);b.emit('document','mousemove',{clientX:1200,clientY:50});b.emit('document','mouseout',event);b.advance(300);assert.equal(b.offer.shows,0);
 }
 const b=browser();b.advance(6000);b.emit('document','mousemove',{clientY:50});b.advance(900);b.emit('document','mouseout',{clientX:1200,clientY:0,relatedTarget:null});b.advance(300);assert.equal(b.offer.shows,0);
});
test('blur, tab switches and mouse re-entry cancel pending desktop intent',()=>{
 for(const [surface,event] of [['window','blur'],['document','visibilitychange'],['document','mouseenter'],['document','mousemove']]){
  const b=browser();b.advance(6000);b.mouseExit();b.emit(surface,event,{clientY:40});b.advance(300);assert.equal(b.offer.shows,0);
 }
});
test('lesson playback, another dialog, hidden tab or lost focus blocks mouse offers',()=>{
 for(const block of [b=>{b.doc.videos=[{paused:false,ended:false,loop:false}];},b=>{b.doc.otherDialog=true;},b=>{b.doc.hidden=true;},b=>{b.doc.focus=false;}]){
  const b=browser();b.advance(6000);block(b);b.mouseExit();b.advance(300);assert.equal(b.offer.shows,0);
 }
});
test('closing a desktop offer never navigates or repeats it',()=>{
 const b=browser();b.engage();b.advance(6000);b.mouseExit();b.advance(200);assert.equal(b.offer.shows,1);b.emit('close','click');assert.equal(b.offer.open,false);assert.equal(b.history.backs,0);assert.equal(b.doc.documentElement.style.overflow,'');b.mouseExit();b.advance(300);assert.equal(b.offer.shows,1);b.back();assert.equal(b.location.replacements.length,0);assert.equal(b.history.backs,1);
});
test('accepting the desktop offer preserves checkout navigation and clears the dialog',()=>{
 const b=browser();b.advance(6000);b.mouseExit();b.advance(200);checkoutClick(b);assert.equal(b.offer.open,false);assert.equal(b.history.backs,0);assert.equal(b.doc.documentElement.style.overflow,'');
});
test('Back takes priority over a pending desktop offer',()=>{
 const b=browser();b.engage();b.advance(6000);b.mouseExit();b.back();b.advance(300);assert.equal(b.offer.shows,0);assert.equal(b.location.replacements.length,1);
});
test('pagehide and bfcache restoration cannot reopen an offer',()=>{
 const b=browser();b.advance(6000);b.mouseExit();b.advance(200);b.emit('window','pagehide');assert.equal(b.offer.open,false);b.emit('window','pageshow',{persisted:true});b.mouseExit();b.advance(300);assert.equal(b.offer.shows,1);
});
test('blocked storage and untrusted events fail closed, without native unload prompts',()=>{
 const b=browser({noStorage:true});b.engage();b.advance(6000);b.mouseExit();b.advance(300);assert.equal(b.offer.shows,0);assert.equal(b.history.pushes,0);
 const c=browser();c.emit('document','pointerdown',{isTrusted:false});assert.equal(c.history.pushes,0);assert.equal(c.handlers.window.has('beforeunload'),false);
});
test('dedicated page is terminal for recovery and decline uses normal Back',()=>{
 const b=browser();let decline;
 b.doc.querySelector=s=>s==='.bd-decline'?{addEventListener:(name,fn)=>decline=fn}:null;
 b.history.length=2;vm.runInNewContext(fs.readFileSync(new URL('../dist/backredirect.js',import.meta.url),'utf8'),b.context);
 assert.equal(b.storage.get('saladas:exit-redirect:used:v2'),'1');decline();assert.equal(b.history.backs,1);
});
test('rendered pages retain distinct prices, checkout destinations, images and tracking',()=>{
 const main=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const reduced=fs.readFileSync(new URL('../dist/backredirect/index.html',import.meta.url),'utf8');
 const special='https://pay.hotmart.com/O108101669E?off=j1f0nk4j&amp;checkoutMode=10&amp;src=backredirect';
 assert.equal((main.match(/href="https:\/\/pay.hotmart.com\/O108101669E\?checkoutMode=10"/g)||[]).length,1);
 assert.equal((main.match(/href="#oferta"/g)||[]).length,11);
 assert.ok(main.includes('<strong>11</strong><span class="plan-price-cents">,90</span>'));
 const specialLinks=[...reduced.matchAll(/<a\b[^>]*href="(https:\/\/pay.hotmart.com[^\"]+)"/g)].map(m=>m[1]);
 assert.equal(specialLinks.length,2);assert.ok(specialLinks.every(h=>h===special));assert.ok(!reduced.includes('src="exit-offer.js'));
 assert.ok(reduced.includes('backredirect-superdesconto-frascos-v1-1200.webp'));assert.ok(!reduced.includes('plan-card'));assert.ok(!reduced.includes('bd-faq'));
 assert.ok(reduced.includes('<base href="/">'));assert.ok(reduced.includes('lang="pt-PT"'));assert.ok(reduced.includes('<p class="bd-now">7,90 <span>€</span></p>'));
 assert.equal((reduced.match(/<h1[ >]/g)||[]).length,1);
 for(const page of [main,reduced]){assert.equal((page.match(/scripts\/utms\/latest.js/g)||[]).length,1);assert.equal((page.match(/scripts\/pixel\/pixel.js/g)||[]).length,1);assert.ok(page.includes('z0pryz1i8w'));}
});
