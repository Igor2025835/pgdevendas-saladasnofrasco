import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../dist/recovery-attribution.js',import.meta.url),'utf8');
function setup(urls){
 const links=urls.map(href=>({href})),handlers=new Map(),observed=[];
 let notify;
 const location=new URL('https://saladas.test/backredirect?src=original_ad&utm_source=facebook');
 vm.runInNewContext(source,{URL,location,document:{querySelectorAll:()=>links,addEventListener:(name,fn,capture)=>{assert.equal(capture,true);handlers.set(name,fn);}},MutationObserver:class{constructor(fn){notify=fn;}observe(link,options){observed.push(link);assert.deepEqual([...options.attributeFilter],['href']);}}});
 return {links,handlers,observed,location,notify:link=>notify([{target:link}])};
}
test('recovery SRC is exact and all offer/ad attribution parameters remain intact',()=>{
 const original=new URL('https://pay.hotmart.com/O108101669E?off=j1f0nk4j&checkoutMode=10&src=original_ad&utm_source=facebook&utm_campaign=camp123&utm_medium=adset456&utm_content=ad789&utm_term=saladas&sck=vendor_encoded&xcod=vendor_encoded&fbclid=click123');
 const b=setup([original.href]);const tagged=new URL(b.links[0].href);
 assert.equal(tagged.searchParams.get('src'),'backredirect');assert.equal(tagged.searchParams.getAll('src').length,1);
 for(const [key,value]of original.searchParams)if(key!=='src')assert.equal(tagged.searchParams.get(key),value);
 assert.equal(b.location.searchParams.get('src'),'original_ad');
});
test('a later UTMify link rewrite cannot replace the recovery SRC',()=>{
 const b=setup(['https://pay.hotmart.com/O108101669E?off=j1f0nk4j&checkoutMode=10']);
 b.links[0].href='https://pay.hotmart.com/O108101669E?off=j1f0nk4j&checkoutMode=10&src=ad_previous&utm_campaign=kept&sck=kept&xcod=kept';b.notify(b.links[0]);
 const u=new URL(b.links[0].href);assert.equal(u.searchParams.get('src'),'backredirect');assert.equal(u.searchParams.get('sck'),'kept');assert.equal(u.searchParams.get('utm_campaign'),'kept');
 const before=b.links[0].href;b.notify(b.links[0]);assert.equal(b.links[0].href,before);
});
test('immediate, middle and right clicks correct SRC before navigation',()=>{
 const b=setup(['https://pay.hotmart.com/O108101669E?off=j1f0nk4j&checkoutMode=10']);
 for(const event of ['click','auxclick','contextmenu']){
  b.links[0].href='https://pay.hotmart.com/O108101669E?off=j1f0nk4j&src=old';b.handlers.get(event)({target:{closest:()=>b.links[0]}});
  assert.equal(new URL(b.links[0].href).searchParams.get('src'),'backredirect');
 }
});
test('ordinary links are untouched and other hosts are never tagged',()=>{
 const b=setup(['https://example.com/?src=existing']);assert.equal(b.links[0].href,'https://example.com/?src=existing');
 assert.doesNotThrow(()=>b.handlers.get('click')({target:{closest:()=>null}}));
});
test('only the recovery buttons contain the static source tag in the generated pages',()=>{
 const main=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const reduced=fs.readFileSync(new URL('../dist/backredirect/index.html',import.meta.url),'utf8');
 assert.equal((main.match(/data-recovery-checkout/g)||[]).length,1);assert.equal((reduced.match(/data-recovery-checkout/g)||[]).length,2);
 for(const page of [main,reduced])assert.equal((page.match(/src="recovery-attribution.js\?/g)||[]).length,1);
});
