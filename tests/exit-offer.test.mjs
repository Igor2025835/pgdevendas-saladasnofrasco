import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../dist/exit-offer.js',import.meta.url),'utf8');
function browser(options={}){
 const storage=options.storage||new Map();
 const handlers={document:new Map(),window:new Map(),offer:new Map(),close:new Map(),leave:new Map()};
 let now=0,base;
 const on=type=>(name,fn)=>{const list=handlers[type].get(name)||[];list.push(fn);handlers[type].set(name,list);};
 const emit=(type,name,event={})=>{for(const fn of handlers[type].get(name)||[])fn({isTrusted:true,defaultPrevented:false,target:{closest:()=>null},...event});};
 const details={href:''};
 const offer={open:false,shows:0,addEventListener:on('offer'),showModal(){this.open=true;this.shows++;},close(){this.open=false;emit('offer','close');},querySelector:s=>s==='.exit-offer-details'?details:{addEventListener:on(s==='.exit-offer-close'?'close':'leave')}};
 const history={state:options.state??null,pushes:0,backs:0,replaceState(s){this.state=s;base=s;},pushState(s){this.state=s;this.pushes++;},back(){this.backs++;}};
 const doc={hidden:false,focus:true,otherDialog:false,videos:[],documentElement:{style:{overflow:''}},hasFocus(){return this.focus;},addEventListener:on('document'),querySelector(s){return s==='#exit-offer'?offer:(this.otherDialog||offer.open?{}:null);},querySelectorAll(){return this.videos;}};
 const location=new URL('https://saladas.test/?utm_source=test#oferta');
 const win={addEventListener:on('window')};win.self=win.top=win;
 const context={window:win,document:doc,history,location,performance:{now:()=>now,getEntriesByType:()=>[{type:options.navigationType||'navigate'}]},sessionStorage:{getItem:k=>{if(options.noStorage)throw Error();return storage.get(k);},setItem:(k,v)=>{if(options.noStorage)throw Error();storage.set(k,v);}},URL,crypto:{randomUUID:()=> 'test-token'}};
 vm.runInNewContext(source,context);
 return {history,doc,offer,storage,details,emit,location,engage(){now=13000;emit('document','scroll');},back(){emit('window','popstate',{state:base});}};
}

test('loading, scrolling, blur, hiding the tab and mouse movement never open the offer',()=>{
 const b=browser();b.emit('document','scroll');assert.equal(b.history.pushes,0);
 b.engage();assert.equal(b.history.pushes,1);assert.equal(b.offer.shows,0);
 for(const event of ['blur','mouseout','visibilitychange'])b.emit('window',event);
 assert.equal(b.offer.shows,0);
});
test('only Back through the owned guard opens once; closing continues the original departure',()=>{
 const b=browser();b.engage();b.emit('window','popstate',{state:null});assert.equal(b.offer.shows,0);
 b.back();assert.equal(b.offer.shows,1);assert.equal(b.history.pushes,1);assert.equal(b.doc.documentElement.style.overflow,'hidden');
 b.emit('close','click');assert.equal(b.history.backs,1);assert.equal(b.doc.documentElement.style.overflow,'');
 b.back();b.engage();assert.equal(b.offer.shows,1);assert.equal(b.history.pushes,1);
 const revisit=browser({storage:b.storage});revisit.engage();assert.equal(revisit.history.pushes,0);
});
test('Escape offers the same unobstructed exit',()=>{
 const b=browser();b.engage();b.back();let prevented=false;
 b.emit('offer','cancel',{preventDefault(){prevented=true;}});assert.ok(prevented);assert.equal(b.history.backs,1);
});
test('checkout click wins and prevents offers after returning from checkout',()=>{
 const b=browser();b.engage();b.emit('document','click',{target:{closest:()=>({href:'https://pay.hotmart.com/O108101669E?checkoutMode=10'})}});
 b.back();assert.equal(b.offer.shows,0);assert.equal(b.history.backs,1);
 const revisit=browser({storage:b.storage});revisit.engage();assert.equal(revisit.history.pushes,0);
});
test('internal hash navigation and its Back traversal never open the offer',()=>{
 const b=browser();b.engage();b.location.hash='conteudo';b.emit('window','hashchange');
 b.emit('window','popstate',{state:null});assert.equal(b.offer.shows,0);
 b.location.hash='oferta';b.back();assert.equal(b.offer.shows,0);assert.equal(b.history.backs,1);
});
test('accepting the discounted offer closes the dialog without triggering another Back',()=>{
 const b=browser();b.engage();b.back();
 b.emit('document','click',{target:{closest:()=>({href:'https://pay.hotmart.com/O108101669E?off=j1f0nk4j&checkoutMode=10'})}});
 assert.equal(b.offer.open,false);assert.equal(b.history.backs,0);assert.equal(b.doc.documentElement.style.overflow,'');
 b.emit('window','pageshow',{persisted:true});b.back();assert.equal(b.offer.shows,1);
});
test('leaving the tab never restores an open offer through the back/forward cache',()=>{
 const b=browser();b.engage();b.back();b.emit('window','pagehide');
 assert.equal(b.offer.open,false);assert.equal(b.history.backs,0);
 b.emit('window','pageshow',{persisted:true});b.engage();assert.equal(b.offer.shows,1);
});
test('playing the lesson, another dialog, a hidden tab or missing focus suppresses the offer',()=>{
 for(const block of [b=>{b.doc.videos=[{paused:false,ended:false,loop:false}];},b=>{b.doc.otherDialog=true;},b=>{b.doc.hidden=true;},b=>{b.doc.focus=false;}]){
  const b=browser();b.engage();block(b);b.back();assert.equal(b.offer.shows,0);assert.equal(b.history.backs,1);
 }
});
test('muted decorative loops do not block a genuine Back action',()=>{
 const b=browser();b.doc.videos=[{paused:false,ended:false,loop:true}];b.engage();b.back();assert.equal(b.offer.shows,1);
});
test('reload, history restoration, unavailable storage and untrusted events fail closed',()=>{
 for(const options of [{navigationType:'reload'},{navigationType:'back_forward'},{noStorage:true}]){const b=browser(options);b.engage();assert.equal(b.history.pushes,0);assert.equal(b.offer.shows,0);}
 const b=browser();b.emit('document','scroll',{isTrusted:false});assert.equal(b.history.pushes,0);
});
test('Forward and a repeated popstate cannot reopen the dialog or add guard entries',()=>{
 const b=browser();b.engage();b.emit('window','popstate',{state:b.history.state});assert.equal(b.offer.shows,0);
 b.back();b.back();assert.equal(b.offer.shows,1);assert.equal(b.history.pushes,1);
});
test('reloading an existing guard skips its duplicate transparently',()=>{
 const b=browser({navigationType:'reload',state:{__saladasExitOfferV1:{token:'previous',slot:'guard'}}});
 b.emit('window','popstate',{state:{__saladasExitOfferV1:{token:'previous',slot:'base'}}});assert.equal(b.offer.shows,0);assert.equal(b.history.backs,1);
});
test('dedicated offer link preserves incoming attribution',()=>{
 const b=browser();assert.equal(b.details.href,'/backredirect?utm_source=test');
});
test('both rendered pages preserve the correct separate checkout destinations',()=>{
 const main=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const reduced=fs.readFileSync(new URL('../dist/backredirect/index.html',import.meta.url),'utf8');
 const mainCheckout='https://pay.hotmart.com/O108101669E?checkoutMode=10';
 const special='https://pay.hotmart.com/O108101669E?off=j1f0nk4j&amp;checkoutMode=10';
 assert.equal((main.match(/href="https:\/\/pay.hotmart.com\/O108101669E\?checkoutMode=10"/g)||[]).length,13);
 assert.equal((main.match(/id="exit-offer"/g)||[]).length,1);assert.ok(main.includes(special));
 const specialLinks=[...reduced.matchAll(/<a\b[^>]*href="(https:\/\/pay.hotmart.com[^\"]+)"/g)].map(m=>m[1]);
 assert.equal(specialLinks.length,3);assert.ok(specialLinks.every(h=>h===special));assert.ok(!reduced.includes('src="exit-offer.js'));
 assert.ok(reduced.includes('<base href="/">'));assert.ok(reduced.includes('lang="pt-PT"'));assert.ok(reduced.includes('<strong>7</strong><span class="plan-price-cents">,90</span>'));
 assert.ok(main.includes(mainCheckout));
 for(const page of [main,reduced]){assert.equal((page.match(/scripts\/utms\/latest.js/g)||[]).length,1);assert.equal((page.match(/scripts\/pixel\/pixel.js/g)||[]).length,1);assert.ok(page.includes('z0pryz1i8w'));}
});
