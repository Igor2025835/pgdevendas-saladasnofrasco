import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync('dist/hero-lesson.js','utf8');
function page(options={}){
 const events={window:new Map(),document:new Map(),video:new Map(),button:new Map()},raf=[],idle=[];
 const on=target=>(name,fn)=>{const fns=events[target].get(name)||[];fns.push(fn);events[target].set(name,fns);};
 const emit=(target,name,event={})=>{for(const fn of events[target].get(name)||[])fn(event);};
 let intersection;
 const hint={textContent:''};
 const button={hidden:false,addEventListener:on('button'),querySelector:()=>hint};
 const frame={querySelector:()=>button};
 const video={src:'',dataset:{previewSrc:'preview.mp4',fullSrc:'lesson.mp4'},currentTime:0,plays:0,pauses:0,loads:0,rect:{top:20,bottom:700},attributes:{},closest:()=>frame,hasAttribute(name){return name==='src'&&!!this.src;},setAttribute(name,value){this.attributes[name]=value;},getBoundingClientRect(){return this.rect;},addEventListener:on('video'),load(){this.loads++;},play(){this.plays++;return options.blockPlay?Promise.reject(Error('Blocked')):Promise.resolve();},pause(){this.pauses++;}};
 const document={hidden:false,readyState:options.loaded?'complete':'loading',querySelector:()=>video,addEventListener:on('document')};
 const window={innerHeight:800,requestIdleCallback:fn=>idle.push(fn),addEventListener:on('window')};
 const context={window,document,requestAnimationFrame:fn=>raf.push(fn),setTimeout:fn=>idle.push(fn)};
 if(!options.noObserver)context.IntersectionObserver=class{constructor(fn){intersection=fn;}observe(){}};
 vm.runInNewContext(source,context);
 return {video,button,hint,document,emit,visible(value=true){intersection([{isIntersecting:value,intersectionRatio:value?1:0}]);},load(){document.readyState='complete';emit('window','load');},paint(){while(raf.length)raf.shift()();},idle(){while(idle.length)idle.shift()();},click(){emit('button','click');}};
}
test('only the excerpt loads after page paint and only when visible',()=>{
 const p=page();p.visible();assert.equal(p.video.src,'');p.load();assert.equal(p.video.src,'');p.paint();assert.equal(p.video.src,'');p.idle();assert.equal(p.video.src,'preview.mp4');assert.ok(p.video.muted&&p.video.defaultMuted&&p.video.loop);assert.equal(p.button.hidden,false);
 const q=page();q.visible(false);q.load();q.paint();q.idle();assert.equal(q.video.src,'');q.visible();assert.equal(q.video.src,'preview.mp4');
});
test('click replaces the silent loop with the complete lesson at zero with sound and controls',()=>{
 const p=page();p.visible();p.load();p.paint();p.idle();p.video.currentTime=4;p.click();assert.equal(p.video.src,'lesson.mp4');assert.equal(p.video.currentTime,0);assert.equal(p.video.muted,false);assert.equal(p.video.defaultMuted,false);assert.equal(p.video.loop,false);assert.equal(p.video.controls,true);assert.equal(p.video.volume,1);assert.equal(p.button.hidden,true);
});
test('click before the lazy loader finishes cannot be overwritten by the excerpt',()=>{
 const p=page();p.click();p.load();p.paint();p.idle();p.visible();assert.equal(p.video.src,'lesson.mp4');assert.equal(p.video.loads,1);assert.equal(p.video.muted,false);assert.equal(p.video.loop,false);
});
test('offscreen, hidden and pagehide pause; returning only auto-resumes the silent excerpt',()=>{
 const p=page();p.visible();p.load();p.paint();p.idle();const pauses=p.video.pauses;p.visible(false);assert.ok(p.video.pauses>pauses);let plays=p.video.plays;p.visible();assert.ok(p.video.plays>plays);p.document.hidden=true;p.emit('document','visibilitychange');plays=p.video.plays;p.document.hidden=false;p.emit('document','visibilitychange');assert.ok(p.video.plays>plays);p.click();plays=p.video.plays;p.visible(false);p.visible();p.emit('window','pagehide');p.emit('window','pageshow',{persisted:true});assert.equal(p.video.plays,plays);assert.equal(p.video.src,'lesson.mp4');
});
test('blocked autoplay still permits an explicit click; blocked full playback offers retry',async()=>{
 const p=page({blockPlay:true});p.visible();p.load();p.paint();p.idle();await Promise.resolve();assert.equal(p.button.hidden,false);p.click();await Promise.resolve();assert.equal(p.button.hidden,false);assert.equal(p.hint.textContent,'Clica para reproduzir');
});
test('errors and completion expose a working replay button',()=>{
 const p=page();p.visible();p.load();p.paint();p.idle();p.emit('video','error');const plays=p.video.plays;p.visible();assert.equal(p.video.plays,plays);assert.equal(p.button.hidden,false);p.click();assert.equal(p.video.src,'lesson.mp4');p.emit('video','ended');assert.equal(p.button.hidden,false);p.video.currentTime=66;p.click();assert.equal(p.video.currentTime,0);assert.equal(p.button.hidden,true);
});
test('fallback visibility checks work without IntersectionObserver',()=>{
 const p=page({noObserver:true});p.load();p.paint();p.idle();assert.equal(p.video.src,'preview.mp4');p.video.rect={top:900,bottom:1600};const pauses=p.video.pauses;p.emit('window','scroll');assert.ok(p.video.pauses>pauses);
});
test('V1 has the lesson hero and moved callout, with valid deferred media and independent V2',()=>{
 const html=fs.readFileSync('dist/index.html','utf8'),hero=html.match(/<section class="hero">[\s\S]*?<\/section>/)[0];
 const video=hero.match(/<video\b[^>]*>/)[0];assert.match(video,/id="hero-lesson-video"/);assert.ok(!/\s(?:src|poster|controls)=/.test(video));
 for(const attr of ['width="540"','height="960"','autoplay','muted','loop','playsinline','preload="none"'])assert.ok(video.includes(attr),attr);
 assert.ok(hero.includes('class="hero-lesson-play"'));assert.ok(hero.includes('Deixa as saladas da semana prontas em'));assert.ok(hero.includes('E descobre como conservá-las sem murcharem.'));
 assert.ok(hero.indexOf('class="method-callout"')>hero.indexOf('</video>'));assert.ok(hero.indexOf('class="method-callout"')<hero.indexOf('class="hero-action"'));
 assert.equal((html.match(/class="method-callout"/g)||[]).length,1);assert.ok(html.includes('hero-lesson.js?v='));assert.ok(!hero.includes('hero-saladas-preparacao'));
 const excerpt=fs.readFileSync('dist/assets/hero-aula-loop-5s-v1.mp4');assert.ok(excerpt.length<600000);assert.ok(excerpt.indexOf(Buffer.from('moov'))<excerpt.indexOf(Buffer.from('mdat')));
 const v2=fs.readFileSync('dist/v2/index.html','utf8');assert.ok(!v2.includes('hero-lesson.js'));assert.ok(v2.includes('id="hero-preview-video"'));
});
