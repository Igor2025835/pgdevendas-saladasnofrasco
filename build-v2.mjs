import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

// This approved snapshot preserves the previous V1 independently of later edits.
const snapshot=await fs.readFile('reference-original/v2-page.html','utf8');
const cssHash=createHash('sha256').update(await fs.readFile('dist/v2-page.css')).digest('hex').slice(0,10);
let html=snapshot
 .replace('class="elementor-kit-5 sales-v1"','class="elementor-kit-5 sales-v1 variant-v2"')
 .replace(/href="v1\.css\?v=[^"]+"/,`href="v2-page.css?v=${cssHash}"`);
// Keep #oferta on this page, and resolve all files correctly at /v2 and /v2/.
html=html.replace(/\b(src|href|poster|data-src|data-src-small|data-src-large|data-conversation-image)="((?:assets|reference-css)\/[^" ]+|(?:[\w-]+\.(?:css|js))(?:\?[^" ]*)?)"/g,'$1="/$2"')
 .replace(/\bsrcset="([^"]+)"/g,(_,list)=>`srcset="${list.replace(/(^|,\s*)(assets\/)/g,'$1/$2')}"`)
 .replace(/[ \t]+(?=\r?$)/gm,'');
await fs.mkdir('dist/v2',{recursive:true});
await fs.writeFile('dist/v2/index.html',html);
console.log('V2 montada a partir da versão aprovada, com o título anterior da V1.');
