let allLocations=[];
let activeFilter='all', activeRegion='all', query='', showAll=false, sortBy='updated';
const list=document.querySelector('#locations'), count=document.querySelector('#resultCount'), toast=document.querySelector('#toast');

function minutes(value){
  if(!value)return null;
  const s=String(value).replace(/[^0-9:]/g,'');
  if(s==='2400')return 1440;
  if(s.includes(':')){const [h,m]=s.split(':').map(Number);return h*60+(m||0)}
  if(/^\d{3,4}$/.test(s)){const padded=s.padStart(4,'0');return Number(padded.slice(0,2))*60+Number(padded.slice(2))}
  return null;
}
function currentHours(x){const holiday=[0,6].includes(new Date().getDay());return {start:holiday?x.holidayStart:x.weekStart,end:holiday?x.holidayEnd:x.weekEnd,holiday}}
function currentlyAvailable(x){if(x.use!=='사용')return false;const {start,end}=currentHours(x);if(start==null||end==null)return /24\s*시간/.test(x.reference||'');const now=new Date(), t=now.getHours()*60+now.getMinutes();return end===1440?t>=start:t>=start&&t<end}
function isAllDay(x){return x.weekStart===0&&x.weekEnd===1440}
function regionFromCode(code,address=''){
  const byCode={'6110000':'서울특별시','6130000':'전남광주통합특별시','6200000':'세종특별자치시','6260000':'부산광역시','6270000':'대구광역시','6280000':'인천광역시','6300000':'대전광역시','6310000':'울산광역시','6410000':'경기도','6430000':'충청북도','6440000':'충청남도','6470000':'경상북도','6480000':'경상남도','6500000':'제주특별자치도','6530000':'강원특별자치도','6540000':'전북특별자치도'};
  if(byCode[code])return byCode[code];
  return String(address).match(/^(전남광주통합특별시|서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도|전북특별자치도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)/)?.[0]||'기타';
}
function timeLabel(m){if(m==null)return '정보 없음';if(m===1440)return '24:00';return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}
function todayHours(x){const schedule=(start,end)=>start==null||end==null?'미등록':`${timeLabel(start)}–${timeLabel(end)}`;return `평일 ${schedule(x.weekStart,x.weekEnd)} · 공휴일 ${schedule(x.holidayStart,x.holidayEnd)}`}
function directionsUrl(x){return `https://map.naver.com/p/search/${encodeURIComponent(`${x.name} ${x.address}`)}`}
function updateRegionalCounts(){const metro=allLocations.filter(x=>['서울특별시','경기도','인천광역시'].includes(regionFromCode(x.regionCode,x.address))).length;const regions=new Set(allLocations.map(x=>regionFromCode(x.regionCode,x.address)).filter(x=>x!=='기타')).size;document.getElementById('countAll').textContent=allLocations.length.toLocaleString('ko-KR');document.getElementById('countMetro').textContent=metro.toLocaleString('ko-KR');document.getElementById('countRegions').textContent=regions.toLocaleString('ko-KR')}
function render(){
  const matches=allLocations.filter(x=>{
    const hay=`${x.name} ${x.address} ${x.detail} ${x.manager} ${x.operator}`.toLowerCase();
    const region=activeRegion==='all'||(activeRegion==='metro'?['서울특별시','경기도','인천광역시'].includes(regionFromCode(x.regionCode,x.address)):regionFromCode(x.regionCode,x.address)===activeRegion);
    const hit=!query||hay.includes(query.toLowerCase())||(query.includes('24')&&isAllDay(x));
    const fil=activeFilter==='all'||(activeFilter==='open'&&currentlyAvailable(x))||(activeFilter==='24'&&isAllDay(x))||(activeFilter==='holiday'&&((x.holidayStart!=null&&x.holidayEnd!=null)||/연중무휴/.test(x.reference||'')));
    return region&&hit&&fil;
  });
  matches.sort((a,b)=>sortBy==='updated'?(b.updatedAt||'').localeCompare(a.updatedAt||''):((a.name||'').localeCompare(b.name||'','ko')));
  const shown=showAll?matches:matches.slice(0,12);count.textContent=matches.length.toLocaleString('ko-KR');
  list.innerHTML=shown.length?shown.map(x=>{const open=currentlyAvailable(x), region=regionFromCode(x.regionCode,x.address);return `<article class="location-card"><div class="card-top"><span class="status ${open?'':'closed'}"><i></i>${open?'API 시간표상 운영':'API 시간표 외 시간'}</span><span class="distance">${region} · ${x.updatedAt||'갱신일 정보 없음'}</span></div><h3>${escapeHtml(x.name||'무인민원발급기')}</h3><div class="address">${escapeHtml(x.address||'주소 정보 없음')}${x.detail?` · ${escapeHtml(x.detail)}`:''}</div><div class="card-bottom"><span class="hours">◷ ${todayHours(x)}</span><span class="card-link"><a href="${directionsUrl(x)}" target="_blank" rel="noreferrer">길찾기 ↗</a></span></div><div class="card-extra">등기사항증명서 ${escapeHtml(x.registryDocs||'정보 없음')} · 가족관계등록부 ${escapeHtml(x.familyDocs||'정보 없음')}<br>관리기관 ${escapeHtml(x.manager||'정보 없음')} · 점포·건물 휴무일에는 발급기 이용이 어려울 수 있습니다.</div></article>`}).join(''):`<div class="empty">조건에 맞는 발급기가 없어요.<br><small>다른 지역이나 검색어를 선택해 보세요.</small></div>`;
  document.querySelector('#moreBtn').style.display=matches.length>12&&!showAll?'block':'none';
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.remove('show'),2800)}
function search(){query=document.querySelector('#search').value.trim();showAll=false;render()}
function normalizeRecord(r){return {name:r.ISSUMCHN_NM,address:r.INSTL_PLC_ADDR,detail:r.INSTL_PLC_DTL_PSTN,manager:r.MNG_INST_NM,operator:r.INSTL_PLC_PSTN,regionCode:r.CTPV_CD,use:r.USE_YN_NM,weekStart:minutes(r.WKDY_OPER_BGNG_TM),weekEnd:minutes(r.WKDY_OPER_END_TM),holidayStart:minutes(r.LHLDY_OPER_BGNG_TM),holidayEnd:minutes(r.LHLDY_OPER_END_TM),reference:r.OPER_HR_REF_CN,updatedAt:(r.DAT_UPDT_PNT||'').slice(0,10),registryDocs:r.RG_MTTR_PRDOC_ISSU_SE,familyDocs:r.FAM_REL_DEL_ISSU_SE}}
async function loadData(){
  const status=document.querySelector('#dataStatus');
  try{status.textContent='공공데이터 불러오는 중';const response=await fetch(new URL('data/kiosks.json',document.baseURI));const payload=await response.json();if(!response.ok)throw new Error(payload.error||'데이터 응답 오류');allLocations=(payload.items||[]).map(normalizeRecord);updateRegionalCounts();status.textContent=`공공데이터 · ${payload.asOf||'최신 응답'}`;document.querySelector('#currentTime').textContent=`${payload.asOf?new Date(payload.asOf).toLocaleString('ko-KR'):'갱신 시각 정보 없음'} 기준 · API 시간표`;render();
  }catch(error){status.textContent='데이터 연결 오류';list.innerHTML=`<div class="empty">공공데이터를 불러오지 못했어요.<br><small>${escapeHtml(error.message)} · 잠시 후 다시 방문해 주세요.</small></div>`;count.textContent='0';notify('데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');}
}
document.querySelector('#searchBtn').addEventListener('click',search);
document.querySelector('#search').addEventListener('keydown',e=>{if(e.key==='Enter')search()});
document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#search').value=b.dataset.query;search()}));
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeFilter=b.dataset.filter;showAll=false;render()}));
document.querySelectorAll('.region-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.region-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector('#regionSelect').value='';activeRegion=b.dataset.region;showAll=false;render()}));
document.querySelector('#regionSelect').addEventListener('change',e=>{activeRegion=e.target.value||'all';document.querySelectorAll('.region-tab').forEach(x=>x.classList.remove('active'));if(activeRegion==='all')document.querySelector('[data-region="all"]').classList.add('active');showAll=false;render()});
document.querySelector('#moreBtn').addEventListener('click',()=>{showAll=true;render()});
document.querySelector('#nearby').addEventListener('click',()=>notify('현재 API에는 좌표가 없어 주소 기반 위치 검색을 제공합니다.'));
document.querySelector('#sortBtn').addEventListener('click',e=>{sortBy=sortBy==='updated'?'name':'updated';e.currentTarget.innerHTML=`${sortBy==='updated'?'최신 갱신순':'이름순'} <span>⌄</span>`;showAll=false;render()});
loadData();

