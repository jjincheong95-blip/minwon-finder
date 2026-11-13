import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const serviceKey=process.env.DATA_GO_SERVICE_KEY;
if(!serviceKey)throw new Error('DATA_GO_SERVICE_KEY secret is required');

async function fetchPage(pageNo){
  const url=new URL('https://apis.data.go.kr/1741000/kiosk_info/installation_info');
  url.searchParams.set('serviceKey',serviceKey);
  url.searchParams.set('pageNo',String(pageNo));
  url.searchParams.set('numOfRows','100');
  url.searchParams.set('returnType','json');
  const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw new Error(`Public data API returned HTTP ${response.status}`);
  const json=await response.json();
  const apiResponse=json?.response;
  if(apiResponse?.header?.resultCode!=='0')throw new Error(apiResponse?.header?.resultMsg||'Public data API error');
  const body=apiResponse.body||{};
  const raw=body.items?.item||[];
  return {rows:Array.isArray(raw)?raw:(raw?[raw]:[]),total:Number(body.totalCount||0)};
}

const first=await fetchPage(1);
const rows=[...first.rows];
const pageCount=Math.ceil(first.total/100);
for(let start=2;start<=pageCount;start+=5){
  const pages=Array.from({length:Math.min(5,pageCount-start+1)},(_,i)=>start+i);
  const batches=await Promise.all(pages.map(fetchPage));
  for(const page of batches)rows.push(...page.rows);
}

const output={items:rows,total:first.total,asOf:new Date().toISOString()};
const dataDir=path.join(root,'public-site','data');
await mkdir(dataDir,{recursive:true});
await writeFile(path.join(dataDir,'kiosks.json'),JSON.stringify(output));
console.log(`Saved ${rows.length} nationwide kiosk records.`);

