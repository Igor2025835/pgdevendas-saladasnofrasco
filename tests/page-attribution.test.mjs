import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync('dist/page-attribution.js','utf8');
function setup(path,href,recovery=false){
 const link={href,hasAttribute:()=>recovery},handlers=new Map();let notify;
 vm.runInNewContext(source,{URL,location:new URL('https://s.test'+path),document:{querySelectorAll:()=>[link],addEventListener:(event,fn,capture)=>{assert.equal(capture,true);handlers.set(event,fn);}},MutationObserver:class{constructor(fn){notify=fn;}observe(){}}});
 return {link,handlers,notify:()=>notify([{target:link}])};
}
test('normal checkouts carry the page SRC and preserve offer, UTMs, SCK and XCOD',()=>{
 for(const [path,variant] of [['/?src=pg1','pg1'],['/gro?src=gro','gro'],['/gro/','gro'],['/gro/index.html','gro']]){
  const initial='https://pay.hotmart.com/O108101669E?checkoutMode=10&src=campaign&utm_source=meta&sck=abc&xcod=xyz';
  const b=setup(path,initial),url=new URL(b.link.href);
  assert.equal(url.searchParams.get('src'),variant);assert.equal(url.searchParams.getAll('src').length,1);
  for(const [key,value] of new URL(initial).searchParams)if(key!=='src')assert.equal(url.searchParams.get(key),value);
  b.link.href=initial;b.notify();assert.equal(new URL(b.link.href).searchParams.get('src'),variant);
  for(const event of ['click','auxclick','contextmenu']){
   b.link.href=initial;b.handlers.get(event)({target:{closest:()=>b.link}});assert.equal(new URL(b.link.href).searchParams.get('src'),variant);
  }
 }
});
test('incoming campaign parameters fill missing values while recovery and unrelated checkouts stay intact',()=>{
 const b=setup('/gro?utm_source=meta&utm_campaign=test&ad_src=campaign','https://pay.hotmart.com/O108101669E?checkoutMode=10&utm_source=existing');
 const url=new URL(b.link.href);assert.equal(url.searchParams.get('utm_source'),'existing');assert.equal(url.searchParams.get('utm_campaign'),'test');assert.equal(url.searchParams.get('ad_src'),'campaign');
 for(const [href,recovery] of [['https://pay.hotmart.com/O108101669E?off=abc&src=backredirect',false],['https://pay.hotmart.com/O108101669E?off=abc',true],['https://example.com/?src=existing',false],['https://pay.hotmart.com/OTHER?src=existing',false]])assert.equal(setup('/gro',href,recovery).link.href,href);
});
