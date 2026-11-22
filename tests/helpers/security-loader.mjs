import {mkdtempSync,readFileSync,writeFileSync,readdirSync,mkdirSync,rmSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
export function sourceLoader(){
 const dir=mkdtempSync(resolve('.security-runtime-'));
 function compile(folder){for(const entry of readdirSync(folder,{withFileTypes:true})){const path=resolve(folder,entry.name);if(entry.isDirectory()){compile(path);continue;}if(!path.endsWith('.ts'))continue;let source=readFileSync(path,'utf8').replace(/templateUrl:\s*(['"])(.*?)\1/g,(_,q,p)=>'template:'+JSON.stringify(readFileSync(resolve(dirname(path),p),'utf8'))).replace(/styleUrl:\s*(['"])(.*?)\1/g,'styles:[]');let code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022,experimentalDecorators:true}}).outputText.replace(/from (['"])([.][^'"]+)\1/g,(_,q,p)=>`from '${p}.mjs'`).replace(/import\((['"])([.][^'"]+)\1\)/g,(_,q,p)=>`import('${p}.mjs')`);const output=resolve(dir,relative(resolve('src'),path).replace(/\.ts$/,'.mjs'));mkdirSync(dirname(output),{recursive:true});writeFileSync(output,code);}}
 compile(resolve('src'));process.on('exit',()=>rmSync(dir,{recursive:true,force:true}));return name=>import(pathToFileURL(resolve(dir,'app',name+'.mjs')));
}
