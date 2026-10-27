import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../dist/hero-media.js',import.meta.url),'utf8');
function page(options={}){
 const handlers={window:new Map(),document:new Map(),video:new Map()},classes=new Set(),raf=[],idle=[];
 let intersection;
 const on=type=>(name,fn)=>{const fns=handlers[type].get(name)||[];fns.push(fn);handlers[type].set(name,fns);};
 const emit=(type,name,event={})=>{for(const fn of handlers[type].get(name)||[])fn(event);};
 const frame={classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}};
 const video={dataset:{srcSmall:'small.mp4',srcLarge:'large.mp4'},muted:false,defaultMuted:false,playsInline:false,src:'',loads:0,plays:0,pauses:0,rect:{top:20,bottom:520},closest:()=>frame,hasAttribute(name){return name==='src'&&!!this.src;},load(){this.loads++;},play(){this.plays++;return options.blockAutoplay?Promise.reject(Error('Blocked')):Promise.resolve();},pause(){this.pauses++;},addEventListener:on('video'),getBoundingClientRect(){return this.rect;}};
 const doc={hidden:false,readyState:options.loaded?'complete':'loading',querySelector:()=>video,addEventListener:on('document')};
 const win={innerHeight:800,matchMedia:()=>({matches:!!options.mobile}),addEventListener:on('window')};
 if(!options.noIdle)win.requestIdleCallback=fn=>idle.push(fn);
 const context={document:doc,window:win,navigator:{connection:{saveData:!!options.saveData}},requestAnimationFrame:fn=>raf.push(fn),setTimeout:fn=>idle.push(fn)};
 if(!options.noObserver)context.IntersectionObserver=class{constructor(fn){intersection=fn;}observe(target){assert.equal(target,video);}};
 vm.runInNewContext(source,context);
 return{video,doc,classes,emit,visible(value=true){intersection([{isIntersecting:value,intersectionRatio:value?1:0}]);},load(){doc.readyState='complete';emit('window','load');},paint(){while(raf.length)raf.shift()();},idle(){while(idle.length)idle.shift()();}};
}
test('no video bytes before page load, two paint frames and the idle callback',()=>{
 const p=page();p.visible();assert.equal(p.video.src,'');p.emit('document','pointerdown');assert.equal(p.video.src,'');p.load();assert.equal(p.video.src,'');p.paint();assert.equal(p.video.src,'');p.idle();assert.equal(p.video.src,'large.mp4');assert.equal(p.video.loads,1);
});
test('load completion offscreen does not request media until the hero enters view',()=>{
 const p=page();p.visible(false);p.load();p.paint();p.idle();assert.equal(p.video.src,'');p.visible();assert.equal(p.video.src,'large.mp4');
});
test('mobile and data-saving visitors get the smaller file',()=>{
 for(const options of [{mobile:true},{saveData:true}]){const p=page(options);p.visible();p.load();p.paint();p.idle();assert.equal(p.video.src,'small.mp4');}
});
test('playback is muted and inline, and appears only when actual frames play',()=>{
 const p=page();p.visible();p.load();p.paint();p.idle();assert.ok(p.video.muted&&p.video.defaultMuted&&p.video.playsInline);assert.equal(p.classes.has('is-playing'),false);p.emit('video','playing');assert.equal(p.classes.has('is-playing'),true);
});
test('leaving the screen or hiding the tab pauses decoding; returning resumes without reloading',()=>{
 const p=page();p.visible();p.load();p.paint();p.idle();const pauses=p.video.pauses;p.visible(false);assert.ok(p.video.pauses>pauses);const plays=p.video.plays;p.doc.hidden=true;p.visible();assert.equal(p.video.plays,plays);p.doc.hidden=false;p.emit('document','visibilitychange');assert.ok(p.video.plays>plays);assert.equal(p.video.loads,1);
});
test('a hidden tab never starts downloading the video',()=>{
 const p=page();p.doc.hidden=true;p.visible();p.load();p.paint();p.idle();assert.equal(p.video.src,'');p.doc.hidden=false;p.emit('document','visibilitychange');assert.equal(p.video.loads,1);
});
test('blocked autoplay and media errors keep the reserved area clear without adding controls',async()=>{
 const p=page({blockAutoplay:true});p.visible();p.load();p.paint();p.idle();await Promise.resolve();assert.equal(p.classes.has('is-playing'),false);
 const q=page();q.visible();q.load();q.paint();q.idle();q.emit('video','playing');q.emit('video','error');assert.equal(q.classes.has('is-playing'),false);const plays=q.video.plays;q.visible();assert.equal(q.video.plays,plays);
});
test('bfcache restores visible playback without fetching another source',()=>{
 const p=page();p.visible();p.load();p.paint();p.idle();p.emit('window','pagehide');const plays=p.video.plays;p.emit('window','pageshow',{persisted:true});assert.ok(p.video.plays>plays);assert.equal(p.video.loads,1);
});
test('older browsers use viewport checks and a delayed fallback after paint',()=>{
 const p=page({noObserver:true,noIdle:true});p.load();p.paint();assert.equal(p.video.src,'');p.idle();assert.equal(p.video.loads,1);p.video.rect={top:900,bottom:1400};const pauses=p.video.pauses;p.emit('window','scroll');assert.ok(p.video.pauses>pauses);
});
test('frozen V2 hero reserves the native video ratio without a cover image or eager source',()=>{
 const html=fs.readFileSync(new URL('../dist/v2/index.html',import.meta.url),'utf8');
 const video=html.match(/<video\b[^>]*id="hero-preview-video"[^>]*>/)?.[0];assert.ok(video);
 assert.ok(!/\s(?:src|poster)=/.test(video));for(const token of ['autoplay','muted','loop','playsinline','preload="none"','width="1080"','height="1584"'])assert.ok(video.includes(token),token);
 assert.ok(html.includes('class="hero-main-image hero-media"'));assert.ok(!html.includes('class="hero-video-poster"'));
 const css=fs.readFileSync(new URL('../dist/review.css',import.meta.url),'utf8');assert.ok(css.includes('.hero .hero-media{position:relative;aspect-ratio:15/22;overflow:hidden}'));assert.match(css,/\.hero-media \.hero-preview-video\{[^}]*object-fit:contain;/);
 for(const filename of ['hero-saladas-preparacao-v1-480.mp4','hero-saladas-preparacao-v1-640.mp4']){
  const file=fs.readFileSync(new URL('../dist/assets/'+filename,import.meta.url));assert.ok(file.length<6000000);assert.ok(file.indexOf(Buffer.from('moov'))<file.indexOf(Buffer.from('mdat')));
 }
});
