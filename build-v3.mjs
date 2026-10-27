import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Preserve V1 at edc844a, immediately before the badge removal and larger H1.
let html=await fs.readFile('reference-original/v3-page.html','utf8');
html=html.replace('class="elementor-kit-5 sales-v1"','class="elementor-kit-5 sales-v1 variant-v3"');
for(const [oldName,newName,attribute] of [
 ['v1.css','v3-page.css','href'],
 ['hero-lesson.js','v3-hero.js','src'],
 ['v1-layout.js','v3-layout.js','src']
]){
 const hash=createHash('sha256').update(await fs.readFile('dist/'+newName)).digest('hex').slice(0,10);
 const pattern=new RegExp(attribute+'="'+oldName.replaceAll('.','\\.')+'\\?v=[^"]+"');
 html=html.replace(pattern,`${attribute}="${newName}?v=${hash}"`);
}
// Local anchors stay on V3; files resolve at /v3, /v3/ and /v3/index.html.
html=html.replace(/\b(src|href|poster|data-src|data-preview-src|data-full-src|data-src-small|data-src-large|data-conversation-image)="((?:assets|reference-css)\/[^" ]+|(?:[\w-]+\.(?:css|js))(?:\?[^" ]*)?)"/g,'$1="/$2"')
 .replace(/\bsrcset="([^"]+)"/g,(_,list)=>`srcset="${list.replace(/(^|,\s*)(assets\/)/g,'$1/$2')}"`)
 .replace(/[ \t]+(?=\r?$)/gm,'');
await fs.mkdir('dist/v3',{recursive:true});
await fs.writeFile('dist/v3/index.html',html);
console.log('V3 criada a partir da V1 em edc844a.');
