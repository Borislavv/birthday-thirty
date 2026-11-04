import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire('/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const sharp=require('sharp');
const root=path.resolve(import.meta.dirname,'..');
const map=JSON.parse(await fs.readFile(path.join(root,'data/art-map.json'),'utf8'));
const files=[...new Set(Object.values(map).map(x=>x.file))];
const reuseAssets=process.argv.includes('--reuse-assets');
await fs.mkdir(path.join(root,'assets/optimized'),{recursive:true});
const packed={};
for(const file of files){
  const optimizedPath=path.join(root,'assets/optimized',file.replace(/\.png$/,'.webp'));
  let output;
  if(reuseAssets){
    output=await fs.readFile(optimizedPath);
  }else{
    const raw=await fs.readFile(path.join(root,'assets',file));
    output=await sharp(raw).webp({quality:90,effort:5}).toBuffer();
    await fs.writeFile(optimizedPath,output);
  }
  packed[file]='data:image/webp;base64,'+output.toString('base64');
  console.log(file,Math.round(output.length/1024)+' KiB');
}
// Reuse each embedded atlas string once rather than serializing duplicate data URLs.
const compact='window.NOVEL_IMAGES = '+JSON.stringify(packed)+';\nwindow.NOVEL_ART = '+JSON.stringify(map)+';\nfor(const cfg of Object.values(window.NOVEL_ART))cfg.src=window.NOVEL_IMAGES[cfg.file];';
let html=await fs.readFile(path.join(root,'src/index.template.html'),'utf8');
for(const [token,file] of [['CSS','css/style.css'],['STORY','data/story.js'],['AUDIO','js/audio.js'],['ENGINE','js/engine.js']]){
  let text=await fs.readFile(path.join(root,file),'utf8');
  if(token!=='CSS')text=text.replace(/<\/script/gi,'<\\/script');
  html=html.replace('/*__'+token+'__*/',()=>text);
}
html=html.replace('/*__ART__*/',()=>compact);
await fs.writeFile(path.join(root,'index.html'),html);
console.log('index.html',Math.round(Buffer.byteLength(html)/1024)+' KiB, self-contained, '+files.length+' image files, '+Object.keys(map).length+' scene keys');
