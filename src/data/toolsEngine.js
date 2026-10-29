import { t } from "./i18n";

/* ======================================================================
   TOOLKIT PRO — 100 client-side tools. No network calls, no AI, no
   tracking. Everything below runs entirely inside this page.
   ====================================================================== */
"use strict";

/* ---------- tiny DOM / util helpers ---------- */
function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
function flash(btn,msg){ const o=btn.textContent; btn.textContent=msg; btn.disabled=true; setTimeout(()=>{btn.textContent=o; btn.disabled=false;},900); }
/* Translation shorthand -- backed by the language engine script tag above.
   Falls back to the English key itself if the engine hasn't loaded yet. */
function T(key){ return window.tpT ? window.tpT(key, window.tpCurLang ? window.tpCurLang() : 'en') : key; }

async function saveFile(filename, data, mime){
  try{
    if(window.claude && typeof window.claude.use === 'function'){
      const dl = await window.claude.use('downloads');
      if(dl){ await dl.save({filename, data}); return true; }
    }
  }catch(e){ /* fall through */ }
  try{
    const blob = (data instanceof Blob) ? data : new Blob([data], {type: mime||'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 3000);
    return true;
  }catch(e){ return false; }
}

async function safeCopy(text){
  const str = String(text != null ? text : '');
  let ok = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(str);
      ok = true;
    }
  } catch(e){}
  if (!ok) {
    try {
      const ta = document.createElement('textarea');
      ta.value = str;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ok = document.execCommand('copy');
      ta.remove();
    } catch(e){}
  }
  return !!ok;
}

function copyBtn(getText){
  const b=document.createElement('button');
  b.type='button'; b.className='btn ghost small'; b.textContent=T('ui.copy');
  b.addEventListener('click', async ()=>{
    const text = typeof getText === 'function' ? getText() : getText;
    const ok = await safeCopy(text);
    if (ok) flash(b, T('ui.copied'));
    else flash(b, T('ui.couldNotCopy'));
  });
  return b;
}

/* ======================================================================
   CATEGORY DEFINITIONS + ICONS
   ====================================================================== */
const ICONS = {
  text:'<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0 0-3L18 6a2.1 2.1 0 0 0-3 0L4.5 16.5z"/><path d="m13 7 4 4"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5.5-5.5a2 2 0 0 0-2.8 0L4 19"/>',
  calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8"/><circle cx="8.3" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="15.7" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="8.3" cy="16" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="16" r=".9" fill="currentColor" stroke="none"/><circle cx="15.7" cy="16" r=".9" fill="currentColor" stroke="none"/>',
  dev:'<path d="m8 7-5 5 5 5"/><path d="m16 7 5 5-5 5"/>',
  converters:'<path d="M7 8h11l-3.2-3.2"/><path d="M17 16H6l3.2 3.2"/>',
  security:'<path d="M12 3l7 3.5v5c0 4.6-3 8.4-7 9.5-4-1.1-7-4.9-7-9.5v-5L12 3z"/><path d="m9.3 12.2 1.9 1.9 3.5-3.9"/>',
  pdf:'<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3zm0 3v2"/><path d="M13.5 13H15v5h-1.5zM13.5 15.5H15"/><path d="M17 13h1.8M17 13v5M17 15.8h1.5"/>',
  productivity:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7 12 3 3 7-7"/>',
  color:'<path d="M12 2a10 10 0 1 0 4.5 18.9c1.1-.5 1-2 .2-2.8-.6-.6-.4-1.6.4-1.9.9-.3 1.9-.6 1.9-1.7A10 10 0 0 0 12 2Z"/><circle cx="7.5" cy="10.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="9.5" cy="6.8" r="1.3" fill="currentColor" stroke="none"/><circle cx="14.2" cy="6.8" r="1.3" fill="currentColor" stroke="none"/><circle cx="16.3" cy="10.5" r="1.3" fill="currentColor" stroke="none"/>',
  seo:'<circle cx="10.2" cy="10.2" r="6.2"/><path d="m19.5 19.5-4.2-4.2"/><path d="M7 11.5l1.5-2.2 1.4 1 2.1-3"/>'
};
function iconSvg(name){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}
const CATS = {
  text:{label:'Text & Writing', icon:'text', varName:'--cat-text'},
  image:{label:'Image & Design', icon:'image', varName:'--cat-image'},
  calc:{label:'Calculators & Converters', icon:'calc', varName:'--cat-calc'},
  dev:{label:'Dev Tools', icon:'dev', varName:'--cat-dev'},
  converters:{label:'Unit Converters', icon:'converters', varName:'--cat-converters'},
  security:{label:'Security', icon:'security', varName:'--cat-security'},
  pdf:{label:'PDF Tools', icon:'pdf', varName:'--cat-pdf'},
  productivity:{label:'Productivity', icon:'productivity', varName:'--cat-productivity'},
  color:{label:'Color & CSS', icon:'color', varName:'--cat-color'},
  seo:{label:'SEO & Marketing', icon:'seo', varName:'--cat-seo'}
};
/* Language-aware category label (falls back to the English CATS[k].label
   until the language engine script has loaded). */
function catLabel(k){ return (window.tpT ? T('cat.'+k) : (CATS[k]&&CATS[k].label)) || (CATS[k]&&CATS[k].label) || k; }

/* ======================================================================
   GENERIC TOOL-UI BUILDERS
   ====================================================================== */

/** Textarea in -> one or more transform buttons -> textarea out */
function textTool(container, opts){
  container.innerHTML = `
    <div class="field"><label>${opts.inLabel||T('ui.input')}</label>
      <textarea class="ta" id="tIn" rows="${opts.rows||6}" placeholder="${esc(opts.placeholder||'')}">${esc(opts.inDefault||'')}</textarea>
    </div>
    <div class="actions" id="tActs"></div>
    <div class="field"><label>${opts.outLabel||T('ui.output')}</label>
      <textarea class="ta out" id="tOut" rows="${opts.rows||6}" readonly placeholder="${esc(opts.outPlaceholder||T('ui.resultPlaceholder'))}"></textarea>
    </div>
    ${opts.note?`<p class="hint">${opts.note}</p>`:''}
  `;
  const $in=container.querySelector('#tIn'), $out=container.querySelector('#tOut'), acts=container.querySelector('#tActs');
  (opts.actions||[]).forEach(a=>{
    const b=document.createElement('button');
    b.type='button'; b.className='btn '+(a.primary?'primary':'ghost'); b.textContent=a.label;
    b.addEventListener('click', async ()=>{
      try{
        const res = a.run($in.value);
        $out.value = (res instanceof Promise) ? await res : res;
      }catch(e){ $out.value = 'Error: '+e.message; }
    });
    acts.appendChild(b);
  });
  acts.appendChild(copyBtn(()=>$out.value));
  if(opts.live && opts.actions && opts.actions[0]){
    $in.addEventListener('input', async ()=>{
      try{ const r=opts.actions[0].run($in.value); $out.value = (r instanceof Promise)? await r : r; }catch(e){ $out.value='Error: '+e.message; }
    });
    if(opts.inDefault) opts.actions[0].run($in.value);
  }
  return {in:$in,out:$out};
}

/** Single textarea -> live stat tiles */
function statsTool(container, computeStats, placeholder){
  container.innerHTML = `
    <div class="field"><label>${T('ui.text')}</label><textarea class="ta" id="sIn" rows="8" placeholder="${esc(placeholder||T('ui.textPlaceholder'))}"></textarea></div>
    <div class="stat-grid" id="sOut"></div>
  `;
  const $in=container.querySelector('#sIn'), $out=container.querySelector('#sOut');
  function upd(){ $out.innerHTML = computeStats($in.value).map(s=>`<div class="stat"><span class="stat-val">${esc(String(s.v))}</span><span class="stat-lbl">${esc(s.l)}</span></div>`).join(''); }
  $in.addEventListener('input', upd); upd();
}

/** Structured numeric/select form -> live computed result */
function formTool(container, opts){
  container.innerHTML = `<div class="form-grid" id="fFields"></div><div class="result-box" id="fResult">—</div>${opts.note?`<p class="hint">${opts.note}</p>`:''}`;
  const wrap=container.querySelector('#fFields'), resEl=container.querySelector('#fResult');
  const inputs={};
  opts.fields.forEach(f=>{
    const id='f_'+f.key;
    const w=document.createElement('div'); w.className='field'+(f.wide?' wide':'');
    if(f.type==='select'){
      w.innerHTML = `<label>${f.label}</label><select id="${id}">${f.options.map(o=>`<option value="${esc(o.v)}" ${o.v===f.default?'selected':''}>${esc(o.l)}</option>`).join('')}</select>`;
    } else {
      w.innerHTML = `<label>${f.label}</label><input id="${id}" type="${f.type||'number'}" placeholder="${esc(f.placeholder||'')}" ${f.step?`step="${f.step}"`:''} ${f.value!==undefined?`value="${esc(String(f.value))}"`:''}>`;
    }
    wrap.appendChild(w);
    inputs[f.key]=w.querySelector('#'+id);
    if(f.type!=='select' && f.default!==undefined) inputs[f.key].value=f.default;
  });
  function upd(){
    const vals={};
    opts.fields.forEach(f=>{ const strTypes=['select','text','date','time']; vals[f.key] = strTypes.includes(f.type) ? inputs[f.key].value : parseFloat(inputs[f.key].value); });
    try{ resEl.innerHTML = opts.compute(vals); }
    catch(e){ resEl.innerHTML = `<span class="muted">${esc(T('ui.enterValidValues'))}</span>`; }
  }
  Object.values(inputs).forEach(i=>i.addEventListener('input',upd));
  upd();
  return {inputs, refresh:upd};
}

/** Generic file->canvas image workspace */
function imageWorkspace(container, opts){
  container.innerHTML = `
    <div class="field"><label>${opts.label||'Choose an image'}</label><input type="file" id="wFile" accept="image/*"></div>
    <div class="form-grid" id="wCtl"></div>
    <div class="img-row">
      <div class="img-box"><span class="img-cap">Original</span><div class="img-frame"><img id="wOrig" alt=""></div></div>
      <div class="img-box"><span class="img-cap">Result</span><div class="img-frame"><canvas id="wCanvas"></canvas></div></div>
    </div>
    <div class="actions">
      ${opts.autoRun?'':'<button class="btn primary" id="wRun" type="button">'+(opts.buttonLabel||'Apply')+'</button>'}
      <button class="btn ghost" id="wDownload" type="button" disabled>Download ${(opts.downloadExt||'png').toUpperCase()}</button>
    </div>
    <p class="hint" id="wHint">Choose an image file to begin.</p>
  `;
  const fileEl=container.querySelector('#wFile'), origImg=container.querySelector('#wOrig'), canvas=container.querySelector('#wCanvas');
  const ctx=canvas.getContext('2d'), dlBtn=container.querySelector('#wDownload'), hint=container.querySelector('#wHint'), ctlWrap=container.querySelector('#wCtl');
  const inputs={};
  (opts.controls||[]).forEach(f=>{
    const id='c_'+f.key;
    const w=document.createElement('div'); w.className='field'+(f.wide?' wide':'');
    if(f.type==='select') w.innerHTML=`<label>${f.label}</label><select id="${id}">${f.options.map(o=>`<option value="${esc(o.v)}">${esc(o.l)}</option>`).join('')}</select>`;
    else if(f.type==='checkbox') w.innerHTML=`<label class="chk"><input type="checkbox" id="${id}" ${f.default?'checked':''}>${f.label}</label>`;
    else w.innerHTML=`<label>${f.label}${f.type==='range'?' <span id="${id}_v" class="mono"></span>':''}</label><input id="${id}" type="${f.type||'number'}" ${f.min!==undefined?`min="${f.min}"`:''} ${f.max!==undefined?`max="${f.max}"`:''} ${f.step?`step="${f.step}"`:''}>`;
    ctlWrap.appendChild(w);
    inputs[f.key]=w.querySelector('#'+id);
    if(f.type!=='checkbox' && f.type!=='select' && f.default!==undefined) inputs[f.key].value=f.default;
  });
  let img=null;
  function getVals(){ const v={}; (opts.controls||[]).forEach(f=>{ const e2=inputs[f.key]; const strTypes=['select','color','text']; v[f.key]= f.type==='checkbox'?e2.checked:(strTypes.includes(f.type)?e2.value:parseFloat(e2.value)); if(f.type==='range'){ const disp=ctlWrap.querySelector('#c_'+f.key+'_v'); if(disp) disp.textContent=e2.value; } }); return v; }
  function process(){
    if(!img) return;
    try{ opts.run(ctx,canvas,img,getVals()); dlBtn.disabled=false; hint.textContent=canvas.width+' × '+canvas.height+' px'; }
    catch(e){ hint.textContent='Could not process this image: '+e.message; }
  }
  fileEl.addEventListener('change', ()=>{
    const file=fileEl.files[0]; if(!file) return;
    const url=URL.createObjectURL(file);
    origImg.onload=()=>{ img=origImg; if(opts.setup) opts.setup(img,inputs); process(); };
    origImg.src=url;
  });
  const runBtn=container.querySelector('#wRun');
  if(runBtn) runBtn.addEventListener('click', process);
  if(opts.autoRun) Object.values(inputs).forEach(i=>i.addEventListener('input', process));
  dlBtn.addEventListener('click', async ()=>{
    const ext=opts.downloadExt||'png';
    canvas.toBlob(async blob=>{
      if(!blob){ hint.textContent='Nothing to download yet.'; return; }
      const ok = await saveFile((opts.filePrefix||'toolkit-pro')+'.'+ext, blob);
      hint.textContent = ok? 'Image saved.' : 'Download did not complete.';
    }, 'image/'+(ext==='jpg'?'jpeg':ext), opts.quality!==undefined?opts.quality:0.92);
  });
}

/* ---- shared helpers for the Advanced Text / SEO & Marketing batch ---- */
function estimateSyllables(word){
  word = word.toLowerCase().replace(/[^a-z]/g,'');
  if(!word) return 0;
  let syl = (word.match(/[aeiouy]+/g)||[]).length;
  if(word.endsWith('e') && !word.endsWith('le') && syl>1) syl--;
  return Math.max(1, syl);
}
function xorCipher(text, key){
  if(!key) throw new Error('Enter a password to encrypt or decrypt.');
  let out='';
  for(let i=0;i<text.length;i++){
    out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return out;
}
/** Structured form fields -> live-generated code/text output with a copy button. */
function codeGenTool(container, opts){
  container.innerHTML = `<div class="form-grid" id="cgFields"></div><div class="field"><label>${opts.outLabel||'Generated Code'}</label><textarea class="ta out" id="cgOut" rows="${opts.rows||8}" readonly></textarea></div><div class="actions" id="cgActs"></div>${opts.note?`<p class="hint">${opts.note}</p>`:''}`;
  const wrap=container.querySelector('#cgFields'), $out=container.querySelector('#cgOut'), acts=container.querySelector('#cgActs');
  const inputs={};
  opts.fields.forEach(f=>{
    const id='cg_'+f.key;
    const w=document.createElement('div'); w.className='field'+(f.wide?' wide':'');
    if(f.type==='select'){
      w.innerHTML = `<label>${f.label}</label><select id="${id}">${f.options.map(o=>`<option value="${esc(o.v)}" ${o.v===f.default?'selected':''}>${esc(o.l)}</option>`).join('')}</select>`;
    } else if(f.type==='textarea'){
      w.innerHTML = `<label>${f.label}</label><textarea class="ta" id="${id}" rows="${f.rows||3}" placeholder="${esc(f.placeholder||'')}">${esc(f.default||'')}</textarea>`;
    } else {
      w.innerHTML = `<label>${f.label}</label><input id="${id}" type="${f.type||'text'}" placeholder="${esc(f.placeholder||'')}" ${f.step?`step="${f.step}"`:''}>`;
    }
    wrap.appendChild(w);
    inputs[f.key]=w.querySelector('#'+id);
    if(f.type!=='select' && f.type!=='textarea' && f.default!==undefined) inputs[f.key].value=f.default;
  });
  function upd(){
    const vals={};
    opts.fields.forEach(f=>{ const numTypes=['number','range']; vals[f.key] = numTypes.includes(f.type) ? parseFloat(inputs[f.key].value) : inputs[f.key].value; });
    try{ $out.value = opts.generate(vals); }
    catch(e){ $out.value = ''; }
  }
  Object.values(inputs).forEach(i=>i.addEventListener('input', upd));
  acts.appendChild(copyBtn(()=>$out.value));
  upd();
  return {inputs, refresh:upd};
}

/* ---- shared data for the "important tools" batch (22 new everyday-utility tools) ---- */

const CSS_NAMED_COLORS = [
  ['AliceBlue','#F0F8FF'],['AntiqueWhite','#FAEBD7'],['Aqua','#00FFFF'],['Aquamarine','#7FFFD4'],['Azure','#F0FFFF'],
  ['Beige','#F5F5DC'],['Bisque','#FFE4C4'],['Black','#000000'],['BlanchedAlmond','#FFEBCD'],['Blue','#0000FF'],
  ['BlueViolet','#8A2BE2'],['Brown','#A52A2A'],['BurlyWood','#DEB887'],['CadetBlue','#5F9EA0'],['Chartreuse','#7FFF00'],
  ['Chocolate','#D2691E'],['Coral','#FF7F50'],['CornflowerBlue','#6495ED'],['Cornsilk','#FFF8DC'],['Crimson','#DC143C'],
  ['Cyan','#00FFFF'],['DarkBlue','#00008B'],['DarkCyan','#008B8B'],['DarkGoldenrod','#B8860B'],['DarkGray','#A9A9A9'],
  ['DarkGreen','#006400'],['DarkKhaki','#BDB76B'],['DarkMagenta','#8B008B'],['DarkOliveGreen','#556B2F'],['DarkOrange','#FF8C00'],
  ['DarkOrchid','#9932CC'],['DarkRed','#8B0000'],['DarkSalmon','#E9967A'],['DarkSeaGreen','#8FBC8F'],['DarkSlateBlue','#483D8B'],
  ['DarkSlateGray','#2F4F4F'],['DarkTurquoise','#00CED1'],['DarkViolet','#9400D3'],['DeepPink','#FF1493'],['DeepSkyBlue','#00BFFF'],
  ['DimGray','#696969'],['DodgerBlue','#1E90FF'],['Firebrick','#B22222'],['FloralWhite','#FFFAF0'],['ForestGreen','#228B22'],
  ['Fuchsia','#FF00FF'],['Gainsboro','#DCDCDC'],['GhostWhite','#F8F8FF'],['Gold','#FFD700'],['Goldenrod','#DAA520'],
  ['Gray','#808080'],['Green','#008000'],['GreenYellow','#ADFF2F'],['Honeydew','#F0FFF0'],['HotPink','#FF69B4'],
  ['IndianRed','#CD5C5C'],['Indigo','#4B0082'],['Ivory','#FFFFF0'],['Khaki','#F0E68C'],['Lavender','#E6E6FA'],
  ['LavenderBlush','#FFF0F5'],['LawnGreen','#7CFC00'],['LemonChiffon','#FFFACD'],['LightBlue','#ADD8E6'],['LightCoral','#F08080'],
  ['LightCyan','#E0FFFF'],['LightGoldenrodYellow','#FAFAD2'],['LightGray','#D3D3D3'],['LightGreen','#90EE90'],['LightPink','#FFB6C1'],
  ['LightSalmon','#FFA07A'],['LightSeaGreen','#20B2AA'],['LightSkyBlue','#87CEFA'],['LightSlateGray','#778899'],['LightSteelBlue','#B0C4DE'],
  ['LightYellow','#FFFFE0'],['Lime','#00FF00'],['LimeGreen','#32CD32'],['Linen','#FAF0E6'],['Magenta','#FF00FF'],
  ['Maroon','#800000'],['MediumAquamarine','#66CDAA'],['MediumBlue','#0000CD'],['MediumOrchid','#BA55D3'],['MediumPurple','#9370DB'],
  ['MediumSeaGreen','#3CB371'],['MediumSlateBlue','#7B68EE'],['MediumSpringGreen','#00FA9A'],['MediumTurquoise','#48D1CC'],['MediumVioletRed','#C71585'],
  ['MidnightBlue','#191970'],['MintCream','#F5FFFA'],['MistyRose','#FFE4E1'],['Moccasin','#FFE4B5'],['NavajoWhite','#FFDEAD'],
  ['Navy','#000080'],['OldLace','#FDF5E6'],['Olive','#808000'],['OliveDrab','#6B8E23'],['Orange','#FFA500'],
  ['OrangeRed','#FF4500'],['Orchid','#DA70D6'],['PaleGoldenrod','#EEE8AA'],['PaleGreen','#98FB98'],['PaleTurquoise','#AFEEEE'],
  ['PaleVioletRed','#DB7093'],['PapayaWhip','#FFEFD5'],['PeachPuff','#FFDAB9'],['Peru','#CD853F'],['Pink','#FFC0CB'],
  ['Plum','#DDA0DD'],['PowderBlue','#B0E0E6'],['Purple','#800080'],['RebeccaPurple','#663399'],['Red','#FF0000'],
  ['RosyBrown','#BC8F8F'],['RoyalBlue','#4169E1'],['SaddleBrown','#8B4513'],['Salmon','#FA8072'],['SandyBrown','#F4A460'],
  ['SeaGreen','#2E8B57'],['Seashell','#FFF5EE'],['Sienna','#A0522D'],['Silver','#C0C0C0'],['SkyBlue','#87CEEB'],
  ['SlateBlue','#6A5ACD'],['SlateGray','#708090'],['Snow','#FFFAFA'],['SpringGreen','#00FF7F'],['SteelBlue','#4682B4'],
  ['Tan','#D2B48C'],['Teal','#008080'],['Thistle','#D8BFD8'],['Tomato','#FF6347'],['Turquoise','#40E0D0'],
  ['Violet','#EE82EE'],['Wheat','#F5DEB3'],['White','#FFFFFF'],['WhiteSmoke','#F5F5F5'],['Yellow','#FFFF00'],['YellowGreen','#9ACD32']
];

const QUOTES_LIST = [
  {q:'The only way to do great work is to love what you do.', a:'Steve Jobs'},
  {q:'Life is what happens when you’re busy making other plans.', a:'John Lennon'},
  {q:'It does not matter how slowly you go as long as you do not stop.', a:'Confucius'},
  {q:'Believe you can and you’re halfway there.', a:'Theodore Roosevelt'},
  {q:'The future belongs to those who believe in the beauty of their dreams.', a:'Eleanor Roosevelt'},
  {q:'Whether you think you can or you think you can’t, you’re right.', a:'Henry Ford'},
  {q:'The journey of a thousand miles begins with a single step.', a:'Lao Tzu'},
  {q:'In the middle of difficulty lies opportunity.', a:'Albert Einstein'},
  {q:'What we think, we become.', a:'Buddha'},
  {q:'The best way to predict the future is to create it.', a:'Peter Drucker'},
  {q:'Success is not final, failure is not fatal: it is the courage to continue that counts.', a:'Winston Churchill'},
  {q:'You miss 100% of the shots you don’t take.', a:'Wayne Gretzky'},
  {q:'A person who never made a mistake never tried anything new.', a:'Albert Einstein'},
  {q:'The only limit to our realization of tomorrow is our doubts of today.', a:'Franklin D. Roosevelt'},
  {q:'It is never too late to be what you might have been.', a:'George Eliot'},
  {q:'Do not go where the path may lead; go instead where there is no path and leave a trail.', a:'Ralph Waldo Emerson'},
  {q:'Happiness is not something ready made. It comes from your own actions.', a:'Dalai Lama'},
  {q:'The mind is everything. What you think you become.', a:'Buddha'},
  {q:'Knowing yourself is the beginning of all wisdom.', a:'Aristotle'},
  {q:'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', a:'Will Durant, on Aristotle'},
  {q:'Simplicity is the ultimate sophistication.', a:'Leonardo da Vinci'},
  {q:'An unexamined life is not worth living.', a:'Socrates'},
  {q:'That which does not kill us makes us stronger.', a:'Friedrich Nietzsche'},
  {q:'Turn your wounds into wisdom.', a:'Oprah Winfrey'},
  {q:'Little by little, one travels far.', a:'J.R.R. Tolkien'},
  {q:'Not all those who wander are lost.', a:'J.R.R. Tolkien'},
  {q:'The best time to plant a tree was 20 years ago. The second best time is now.', a:'Chinese Proverb'},
  {q:'A smooth sea never made a skilled sailor.', a:'Proverb'},
  {q:'Fall seven times, stand up eight.', a:'Japanese Proverb'},
  {q:'Well done is better than well said.', a:'Benjamin Franklin'},
  {q:'Genius is one percent inspiration and ninety-nine percent perspiration.', a:'Thomas Edison'},
  {q:'If you want to lift yourself up, lift up someone else.', a:'Booker T. Washington'},
  {q:'Either you run the day, or the day runs you.', a:'Jim Rohn'},
  {q:'The two most important days in your life are the day you are born and the day you find out why.', a:'Mark Twain'},
  {q:'Twenty years from now you will be more disappointed by the things you didn’t do than by the ones you did do.', a:'Mark Twain'},
  {q:'Keep your face always toward the sunshine, and shadows will fall behind you.', a:'Walt Whitman'},
  {q:'You are never too old to set another goal or to dream a new dream.', a:'C.S. Lewis'},
  {q:'Everything you can imagine is real.', a:'Pablo Picasso'},
  {q:'Do what you can, with what you have, where you are.', a:'Theodore Roosevelt'},
  {q:'The only impossible journey is the one you never begin.', a:'Tony Robbins'}
];

/* ~150 simple everyday words (letters only, lowercase) used for the Passphrase Generator */
const PASSPHRASE_WORDS = ('river mountain forest ocean garden bridge candle window pillow harbor '+
  'canyon valley meadow desert island volcano glacier cottage castle village market kitchen library '+
  'blanket lantern compass anchor voyage sunrise sunset thunder rainbow crystal diamond emerald sapphire '+
  'silver bronze copper ribbon feather pebble boulder timber orchard vineyard harvest bakery pottery '+
  'jasmine lavender cinnamon saffron mustard pepper walnut almond coconut mango papaya banana orange '+
  'lemon cherry apple grape peach plum melon berry maple willow cedar bamboo cactus tulip daisy '+
  'sunflower jasmine violet crimson amber ivory copper granite marble quartz canvas fabric velvet '+
  'cotton flannel denim leather buckle zipper button needle thimble hammer wrench pliers ladder '+
  'shovel bucket lantern torch compass anchor rudder sailor pirate wizard dragon phoenix falcon '+
  'eagle sparrow robin heron otter beaver badger rabbit turtle dolphin whale walrus penguin panther '+
  'tiger jaguar leopard cheetah gazelle giraffe elephant camel horse donkey rooster peacock swan '+
  'meadowlark cardinal cricket firefly butterfly ladybug dragonfly starfish seahorse coral pebble').split(' ').filter(Boolean);

/* Emoji picker data: [emoji, search keywords] */
const EMOJI_LIST = [
  {e:'\u{1F600}',k:'grinning face happy smile'},{e:'\u{1F602}',k:'joy laughing tears funny'},{e:'\u{1F60D}',k:'heart eyes love crush'},
  {e:'\u{1F60E}',k:'sunglasses cool'},{e:'\u{1F914}',k:'thinking hmm'},{e:'\u{1F622}',k:'crying sad tear'},
  {e:'\u{1F62D}',k:'sobbing crying loud'},{e:'\u{1F621}',k:'angry mad rage'},{e:'\u{1F631}',k:'scream shocked fear'},
  {e:'\u{1F970}',k:'smiling hearts love adore'},{e:'\u{1F929}',k:'star struck excited wow'},{e:'\u{1F973}',k:'party celebrate hooray'},
  {e:'\u{1F644}',k:'eye roll annoyed'},{e:'\u{1F634}',k:'sleeping zzz tired'},{e:'\u{1F92F}',k:'mind blown shocked wow'},
  {e:'\u{1F60C}',k:'relieved calm peaceful'},{e:'\u{1F613}',k:'sweat nervous worried'},{e:'\u{1F60F}',k:'smirk sly'},
  {e:'\u{1F642}',k:'slight smile'},{e:'\u{1F643}',k:'upside down silly'},{e:'\u{1F609}',k:'wink flirt'},
  {e:'❤️',k:'red heart love'},{e:'\u{1F49B}',k:'yellow heart love'},{e:'\u{1F49A}',k:'green heart love'},
  {e:'\u{1F499}',k:'blue heart love'},{e:'\u{1F49C}',k:'purple heart love'},{e:'\u{1F5A4}',k:'black heart love'},
  {e:'\u{1F494}',k:'broken heart sad breakup'},{e:'\u{1F495}',k:'two hearts love'},{e:'\u{1F525}',k:'fire lit hot trending'},
  {e:'✨',k:'sparkles shine magic'},{e:'\u{1F31F}',k:'glowing star'},{e:'⭐',k:'star favorite'},
  {e:'\u{1F389}',k:'party popper celebration confetti'},{e:'\u{1F38A}',k:'confetti ball party'},{e:'\u{1F381}',k:'gift present birthday'},
  {e:'\u{1F44D}',k:'thumbs up like yes good'},{e:'\u{1F44E}',k:'thumbs down dislike no bad'},{e:'\u{1F44F}',k:'clapping applause'},
  {e:'\u{1F64F}',k:'pray please thanks hands'},{e:'\u{1F91D}',k:'handshake deal agreement'},{e:'✌️',k:'peace victory sign'},
  {e:'\u{1F44B}',k:'wave hello bye'},{e:'\u{1F4AA}',k:'muscle strong flex gym'},{e:'\u{1F64C}',k:'raised hands celebrate praise'},
  {e:'\u{1F60A}',k:'blush happy smile shy'},{e:'\u{1F636}',k:'no mouth silent quiet'},{e:'\u{1F92D}',k:'hand over mouth giggle oops'},
  {e:'\u{1F415}',k:'dog animal pet'},{e:'\u{1F408}',k:'cat animal pet'},{e:'\u{1F42D}',k:'mouse animal'},
  {e:'\u{1F430}',k:'rabbit bunny animal'},{e:'\u{1F98A}',k:'fox animal'},{e:'\u{1F43B}',k:'bear animal'},
  {e:'\u{1F43C}',k:'panda animal'},{e:'\u{1F428}',k:'koala animal'},{e:'\u{1F42F}',k:'tiger animal'},
  {e:'\u{1F981}',k:'lion animal'},{e:'\u{1F42E}',k:'cow animal farm'},{e:'\u{1F437}',k:'pig animal farm'},
  {e:'\u{1F438}',k:'frog animal'},{e:'\u{1F435}',k:'monkey animal'},{e:'\u{1F414}',k:'chicken animal farm'},
  {e:'\u{1F427}',k:'penguin animal bird'},{e:'\u{1F426}',k:'bird animal'},{e:'\u{1F41D}',k:'bee insect honey'},
  {e:'\u{1F41F}',k:'fish animal ocean'},{e:'\u{1F419}',k:'octopus animal ocean'},{e:'\u{1F433}',k:'whale animal ocean'},
  {e:'\u{1F34E}',k:'apple fruit food'},{e:'\u{1F34C}',k:'banana fruit food'},{e:'\u{1F347}',k:'grapes fruit food'},
  {e:'\u{1F349}',k:'watermelon fruit food'},{e:'\u{1F353}',k:'strawberry fruit food'},{e:'\u{1F34D}',k:'pineapple fruit food'},
  {e:'\u{1F34B}',k:'lemon fruit food'},{e:'\u{1F345}',k:'tomato fruit food vegetable'},{e:'\u{1F955}',k:'carrot vegetable food'},
  {e:'\u{1F33D}',k:'corn vegetable food'},{e:'\u{1F35E}',k:'bread food'},{e:'\u{1F9C0}',k:'cheese food'},
  {e:'\u{1F355}',k:'pizza food'},{e:'\u{1F354}',k:'burger food'},{e:'\u{1F35F}',k:'fries food'},
  {e:'\u{1F32D}',k:'hot dog food'},{e:'\u{1F32E}',k:'taco food'},{e:'\u{1F363}',k:'sushi food'},
  {e:'\u{1F368}',k:'ice cream dessert food'},{e:'\u{1F369}',k:'donut dessert food'},{e:'\u{1F36A}',k:'cookie dessert food'},
  {e:'\u{1F382}',k:'birthday cake food'},{e:'☕',k:'coffee hot drink'},{e:'\u{1F375}',k:'tea hot drink'},
  {e:'\u{1F37A}',k:'beer drink'},{e:'\u{1F377}',k:'wine drink'},{e:'\u{1F9CB}',k:'water glass drink'},
  {e:'⚽',k:'soccer football sport'},{e:'\u{1F3C0}',k:'basketball sport'},{e:'\u{1F3C8}',k:'american football sport'},
  {e:'⚾',k:'baseball sport'},{e:'\u{1F3BE}',k:'tennis sport'},{e:'\u{1F3D3}',k:'ping pong table tennis sport'},
  {e:'\u{1F3C6}',k:'trophy award winner'},{e:'⚡',k:'lightning bolt fast energy'},{e:'\u{1F30D}',k:'earth globe world'},
  {e:'☀️',k:'sun sunny weather'},{e:'\u{1F319}',k:'moon night'},{e:'☁️',k:'cloud weather'},
  {e:'\u{1F327}️',k:'rain weather'},{e:'❄️',k:'snowflake snow winter'},{e:'\u{1F308}',k:'rainbow'},
  {e:'\u{1F697}',k:'car vehicle transport'},{e:'✈️',k:'airplane flight travel'},{e:'\u{1F680}',k:'rocket launch space startup'},
  {e:'⛵',k:'boat sailboat travel'},{e:'\u{1F3E0}',k:'house home'},{e:'\u{1F3E2}',k:'office building work'},
  {e:'\u{1F4B0}',k:'money bag cash'},{e:'\u{1F4B5}',k:'dollar money cash'},{e:'\u{1F4B3}',k:'credit card payment'},
  {e:'\u{1F4E7}',k:'email mail message'},{e:'\u{1F4F1}',k:'phone mobile smartphone'},{e:'\u{1F4BB}',k:'laptop computer'},
  {e:'\u{1F5A5}️',k:'desktop computer'},{e:'⌨️',k:'keyboard type'},{e:'\u{1F5B1}️',k:'mouse computer click'},
  {e:'\u{1F4CE}',k:'paperclip attachment'},{e:'\u{1F4CC}',k:'pin pushpin location'},{e:'\u{1F4CD}',k:'location pin map'},
  {e:'\u{1F511}',k:'key unlock password'},{e:'\u{1F512}',k:'lock secure closed'},{e:'\u{1F513}',k:'unlock open'},
  {e:'\u{1F50D}',k:'search magnifying glass find'},{e:'❓',k:'question mark help'},{e:'❗',k:'exclamation mark important'},
  {e:'✅',k:'check mark done correct'},{e:'❌',k:'cross mark wrong no'},{e:'\u{1F4A1}',k:'idea light bulb'},
  {e:'\u{1F4DA}',k:'books study library'},{e:'\u{1F4DD}',k:'memo notes writing'},{e:'\u{1F4C5}',k:'calendar date'},
  {e:'⏰',k:'alarm clock time'},{e:'\u{1F3AF}',k:'target goal dart'},{e:'\u{1F3B5}',k:'music note song'},
  {e:'\u{1F3A7}',k:'headphones music listening'},{e:'\u{1F4F7}',k:'camera photo picture'},{e:'\u{1F3AC}',k:'movie clapper film'},
  {e:'\u{1F98B}',k:'butterfly insect'},{e:'\u{1F33B}',k:'sunflower flower'},{e:'\u{1F339}',k:'rose flower'},
  {e:'\u{1F340}',k:'four leaf clover luck'},{e:'\u{1F332}',k:'tree evergreen'},{e:'\u{1F334}',k:'palm tree beach'},
  {e:'\u{1F30A}',k:'wave ocean sea'},{e:'⛰️',k:'mountain'},{e:'\u{1F3D6}️',k:'beach island'}
];

/* Adjective + noun lists for the Random Username Generator */
const USERNAME_ADJECTIVES = ('swift silent brave clever quiet bold gentle bright cosmic mystic golden silver '+
  'crimson shadow electric frozen blazing lucky mighty rapid stellar wild calm sunny lunar solar '+
  'noble royal humble witty daring vivid dusty misty rustic urban arctic tropical velvet crystal '+
  'iron obsidian amber jade coral sapphire').split(' ').filter(Boolean);
const USERNAME_NOUNS = ('falcon tiger wolf otter panther eagle dragon phoenix comet meteor voyager ranger '+
  'pioneer nomad wanderer explorer artisan maverick sailor pilot ninja samurai knight wizard alchemist '+
  'raven sparrow heron badger panda koala fox lynx cheetah puma orca dolphin turtle stallion griffin '+
  'harbor summit canyon meadow river').split(' ').filter(Boolean);

/* ======================================================================
   SHARED DATA / ALGORITHMS
   ====================================================================== */
const MORSE_MAP = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.':'.-.-.-',',':'--..--','?':'..--..',"'":'.----.','!':'-.-.--','/':'-..-.','(':'-.--.',')':'-.--.-','&':'.-...',':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.','-':'-....-','_':'..--.-','"':'.-..-.','$':'...-..-','@':'.--.-.'};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE_MAP).map(([k,v])=>[v,k]));

const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
function loremSentence(minW,maxW){
  const n = minW + Math.floor(Math.random()*(maxW-minW+1));
  const words=[]; for(let i=0;i<n;i++) words.push(LOREM_WORDS[Math.floor(Math.random()*LOREM_WORDS.length)]);
  let s = words.join(' '); return s.charAt(0).toUpperCase()+s.slice(1)+'.';
}
function loremParagraph(sentences){
  const arr=[]; for(let i=0;i<sentences;i++) arr.push(loremSentence(5,14));
  return arr.join(' ');
}

/** Longest-common-subsequence line diff. Returns [{t:'same'|'add'|'del', v:line}] */
function lineDiff(a,b){
  const A=a.split('\n'), B=b.split('\n');
  const n=A.length, m=B.length;
  const dp = Array.from({length:n+1}, ()=> new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--){
    for(let j=m-1;j>=0;j--){
      dp[i][j] = A[i]===B[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j], dp[i][j+1]);
    }
  }
  let i=0,j=0; const out=[];
  while(i<n && j<m){
    if(A[i]===B[j]){ out.push({t:'same',v:A[i]}); i++; j++; }
    else if(dp[i+1][j] >= dp[i][j+1]){ out.push({t:'del',v:A[i]}); i++; }
    else { out.push({t:'add',v:B[j]}); j++; }
  }
  while(i<n){ out.push({t:'del',v:A[i]}); i++; }
  while(j<m){ out.push({t:'add',v:B[j]}); j++; }
  return out;
}
function renderDiff(container, diffArr){
  container.innerHTML = diffArr.map(d=>{
    const prefix = d.t==='add' ? '+ ' : d.t==='del' ? '- ' : '  ';
    const cls = d.t==='add' ? 'diff-add' : d.t==='del' ? 'diff-del' : '';
    return `<div class="diff-line ${cls}">${esc(prefix+d.v)}</div>`;
  }).join('') || '<p class="hint">No differences.</p>';
}

/* ---- color helpers (shared by several Image/Design + Dev tools) ---- */
function hexToRgb(hex){
  hex=String(hex).replace('#','').trim();
  if(hex.length===3) hex=hex.split('').map(ch=>ch+ch).join('');
  const num=parseInt(hex,16);
  if(hex.length!==6 || isNaN(num)) return null;
  return {r:(num>>16)&255, g:(num>>8)&255, b:num&255};
}
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join(''); }
function rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s; const l=(max+min)/2;
  if(max===min){ h=0; s=0; }
  else{
    const d=max-min; s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=(g-b)/d+(g<b?6:0); break;
      case g: h=(b-r)/d+2; break;
      default: h=(r-g)/d+4;
    }
    h/=6;
  }
  return {h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100)};
}
function hslToRgb(h,s,l){
  h=((h%360)+360)%360/360; s/=100; l/=100;
  let r,g,b;
  if(s===0){ r=g=b=l; }
  else{
    const hue2rgb=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p; };
    const q = l<0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l-q;
    r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3);
  }
  return {r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255)};
}
function relLuminance(r,g,b){
  const conv = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  const rs=conv(r), gs=conv(g), bs=conv(b);
  return 0.2126*rs + 0.7152*gs + 0.0722*bs;
}
function contrastRatio(hexA, hexB){
  const a=hexToRgb(hexA), b=hexToRgb(hexB);
  if(!a || !b) return null;
  const La=relLuminance(a.r,a.g,a.b), Lb=relLuminance(b.r,b.g,b.b);
  const light=Math.max(La,Lb), dark=Math.min(La,Lb);
  return (light+0.05)/(dark+0.05);
}
function colorSwatchHtml(hex, label){
  return `<div class="swatch"><div class="swatch-chip" style="background:${hex}"></div><code>${esc(hex)}</code>${label?`<span class="hint" style="margin:0">${esc(label)}</span>`:''}</div>`;
}

/* ---- number/word helpers (shared by Calculator tools) ---- */
const ONES_WORDS=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const TENS_WORDS=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
function threeDigitWords(n){
  let s='';
  if(n>=100){ s+=ONES_WORDS[Math.floor(n/100)]+' Hundred'; n%=100; if(n) s+=' '; }
  if(n>=20){ s+=TENS_WORDS[Math.floor(n/10)]; if(n%10) s+='-'+ONES_WORDS[n%10]; }
  else if(n>0){ s+=ONES_WORDS[n]; }
  return s;
}
function numberToWords(num){
  if(num===0) return 'Zero';
  const neg = num<0; num=Math.abs(Math.round(num));
  const scales=['','Thousand','Million','Billion','Trillion'];
  const groups=[]; let n=num;
  while(n>0){ groups.push(n%1000); n=Math.floor(n/1000); }
  const parts=[];
  for(let i=groups.length-1;i>=0;i--){
    if(groups[i]===0) continue;
    parts.push(threeDigitWords(groups[i]) + (scales[i]?' '+scales[i]:''));
  }
  return (neg?'Negative ':'')+parts.join(' ');
}
const ROMAN_MAP=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
function toRoman(num){ if(!Number.isInteger(num) || num<=0 || num>3999) return null; let s=''; for(const [v,r] of ROMAN_MAP){ while(num>=v){ s+=r; num-=v; } } return s; }
function fromRoman(str){
  str=String(str).toUpperCase().trim();
  const vals={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  if(!/^[IVXLCDM]+$/.test(str)) return null;
  let total=0;
  for(let i=0;i<str.length;i++){
    const cur=vals[str[i]], next=vals[str[i+1]];
    if(next && cur<next) total-=cur; else total+=cur;
  }
  if(toRoman(total)!==str) return null;
  return total;
}
function dateDiffParts(d1,d2){
  let [early,late] = d1<=d2 ? [d1,d2] : [d2,d1];
  let years=late.getFullYear()-early.getFullYear();
  let months=late.getMonth()-early.getMonth();
  let days=late.getDate()-early.getDate();
  if(days<0){ months--; days += new Date(late.getFullYear(), late.getMonth(), 0).getDate(); }
  if(months<0){ years--; months+=12; }
  const totalDays = Math.round((late-early)/86400000);
  return {years,months,days,totalDays};
}
function shapeCalcTool(container, shapes, selectLabel){
  container.innerHTML = `<div class="field"><label>${esc(selectLabel)}</label><select id="shSel">${Object.entries(shapes).map(([k,v])=>`<option value="${k}">${esc(v.label)}</option>`).join('')}</select></div><div id="shFields"></div><div class="result-box" id="shResult">—</div>`;
  const sel=container.querySelector('#shSel'), fieldsWrap=container.querySelector('#shFields'), resEl=container.querySelector('#shResult');
  function build(){
    const shape=shapes[sel.value];
    fieldsWrap.innerHTML = `<div class="form-grid">${shape.fields.map(f=>`<div class="field"><label>${esc(f.label)}</label><input type="number" id="sf_${f.key}" step="any" min="0"></div>`).join('')}</div>`;
    const inputs={}; shape.fields.forEach(f=> inputs[f.key]=fieldsWrap.querySelector('#sf_'+f.key));
    function upd(){
      const vals={}; shape.fields.forEach(f=> vals[f.key]=parseFloat(inputs[f.key].value));
      try{ resEl.innerHTML = shape.compute(vals); } catch(e){ resEl.innerHTML='<span class="muted">Enter valid values.</span>'; }
    }
    Object.values(inputs).forEach(i=>i.addEventListener('input',upd));
    upd();
  }
  sel.addEventListener('change', build);
  build();
}
function numStats(text){
  const nums = (text.match(/-?\d+(\.\d+)?/g)||[]).map(Number);
  if(!nums.length) return null;
  const sorted=[...nums].sort((a,b)=>a-b);
  const sum = nums.reduce((a,b)=>a+b,0);
  const avg = sum/nums.length;
  const mid=Math.floor(sorted.length/2);
  const median = sorted.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
  const freq={}; nums.forEach(n=>freq[n]=(freq[n]||0)+1);
  const maxFreq=Math.max(...Object.values(freq));
  const modes = maxFreq>1 ? Object.keys(freq).filter(k=>freq[k]===maxFreq).map(Number) : [];
  return {nums, count:nums.length, sum, avg, median, modes, min:sorted[0], max:sorted[sorted.length-1]};
}

/* ---- encoding / parsing helpers (shared by Dev tools) ---- */
function utf8ToB64(str){
  const bytes = new TextEncoder().encode(str);
  let binary=''; for(let i=0;i<bytes.length;i++) binary+=String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function b64ToUtf8(b64){
  const binary = atob(b64.replace(/\s+/g,''));
  const bytes = new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function b64urlToB64(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return s; }
function parseCSV(text){
  const rows=[]; let row=[]; let field=''; let inQuotes=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(inQuotes){
      if(ch==='"'){ if(text[i+1]==='"'){ field+='"'; i++; } else inQuotes=false; }
      else field+=ch;
    } else {
      if(ch==='"') inQuotes=true;
      else if(ch===','){ row.push(field); field=''; }
      else if(ch==='\n'){ row.push(field); rows.push(row); row=[]; field=''; }
      else if(ch==='\r'){ /* skip */ }
      else field+=ch;
    }
  }
  row.push(field); rows.push(row);
  return rows.filter(r=>!(r.length===1 && r[0]===''));
}
function toCSVField(v){
  const s = v===undefined||v===null ? '' : String(v);
  return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
}
const HTTP_STATUS_CODES = [
  [100,'Continue','The server has received the request headers and the client should proceed to send the body.'],
  [101,'Switching Protocols','The requester asked the server to switch protocols.'],
  [200,'OK','The request succeeded.'],
  [201,'Created','The request succeeded and a new resource was created.'],
  [202,'Accepted','The request was accepted for processing, but is not complete.'],
  [204,'No Content','The request succeeded but there is no content to return.'],
  [206,'Partial Content','Only part of the resource was delivered, per a Range header.'],
  [300,'Multiple Choices','The request has more than one possible response.'],
  [301,'Moved Permanently','The resource has been permanently moved to a new URL.'],
  [302,'Found','The resource temporarily resides at a different URL.'],
  [303,'See Other','The response can be found at another URL using GET.'],
  [304,'Not Modified','The cached version of the resource is still valid.'],
  [307,'Temporary Redirect','Repeat the request at another URL, keeping the method.'],
  [308,'Permanent Redirect','Resource permanently moved; keep the method for future requests.'],
  [400,'Bad Request','The server could not understand the request due to invalid syntax.'],
  [401,'Unauthorized','Authentication is required and has failed or not been provided.'],
  [402,'Payment Required','Reserved for future use.'],
  [403,'Forbidden','The client does not have access rights to the content.'],
  [404,'Not Found','The server can not find the requested resource.'],
  [405,'Method Not Allowed','The request method is not supported for this resource.'],
  [406,'Not Acceptable','No content matching the request’s Accept headers.'],
  [407,'Proxy Authentication Required','Authentication with the proxy is required.'],
  [408,'Request Timeout','The server timed out waiting for the request.'],
  [409,'Conflict','The request conflicts with the current state of the resource.'],
  [410,'Gone','The resource is no longer available and will not return.'],
  [411,'Length Required','The Content-Length header is required.'],
  [412,'Precondition Failed','A precondition in the request headers was not met.'],
  [413,'Payload Too Large','The request body is larger than the server will process.'],
  [414,'URI Too Long','The requested URI is longer than the server will interpret.'],
  [415,'Unsupported Media Type','The media format is not supported.'],
  [416,'Range Not Satisfiable','The requested range cannot be fulfilled.'],
  [417,'Expectation Failed','The Expect header could not be met.'],
  [418,'I’m a Teapot','A joke status from the Hyper Text Coffee Pot Control Protocol.'],
  [422,'Unprocessable Entity','The request was well-formed but semantically incorrect.'],
  [423,'Locked','The resource being accessed is locked.'],
  [425,'Too Early','The server is unwilling to process a possibly replayed request.'],
  [426,'Upgrade Required','The client should switch to a different protocol.'],
  [428,'Precondition Required','The origin server requires the request to be conditional.'],
  [429,'Too Many Requests','The client has sent too many requests in a given time.'],
  [431,'Request Header Fields Too Large','The header fields are too large.'],
  [451,'Unavailable For Legal Reasons','The resource is unavailable for legal reasons.'],
  [500,'Internal Server Error','The server encountered an unexpected condition.'],
  [501,'Not Implemented','The server does not support the functionality required.'],
  [502,'Bad Gateway','The server got an invalid response from an upstream server.'],
  [503,'Service Unavailable','The server is not ready to handle the request.'],
  [504,'Gateway Timeout','The upstream server failed to respond in time.'],
  [505,'HTTP Version Not Supported','The HTTP version used is not supported.'],
  [507,'Insufficient Storage','The server cannot store the representation needed.'],
  [508,'Loop Detected','The server detected an infinite loop processing the request.'],
  [511,'Network Authentication Required','The client needs to authenticate to gain network access.']
];

/* ======================================================================
   TOOL LIBRARIES (populated below)
   ====================================================================== */
const TEXT_TOOLS = [];
const IMAGE_TOOLS = [];
const CALC_TOOLS = [];
const DEV_TOOLS = [];
const CONVERTER_TOOLS = [];
const SECURITY_TOOLS = [];
const PRODUCTIVITY_TOOLS = [];
const COLOR_TOOLS = [];
const SEO_TOOLS = [];

TEXT_TOOLS.push({
  id:'t01', cat:'text', name:'Word & Character Counter', desc:'Live word, character, sentence and paragraph counts plus reading time.', keywords:'stats length count',
  mount(c){
    statsTool(c, text=>{
      const words = (text.match(/\S+/g)||[]).length;
      const chars = text.length;
      const charsNoSpace = text.replace(/\s/g,'').length;
      const sentences = (text.match(/[^.!?]*[.!?]+/g)||[]).filter(s=>s.trim()).length || (text.trim()?1:0);
      const paras = text.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean).length || (text.trim()?1:0);
      const readMin = Math.max(1, Math.round(words/200)) ;
      const speakMin = Math.max(1, Math.round(words/130));
      return [
        {v:words,l:'Words'},{v:chars,l:'Characters'},{v:charsNoSpace,l:'No Spaces'},
        {v:sentences,l:'Sentences'},{v:paras,l:'Paragraphs'},
        {v:text.trim()?readMin+' min':'0 min',l:'Reading Time'},
        {v:text.trim()?speakMin+' min':'0 min',l:'Speaking Time'}
      ];
    });
  }
});

TEXT_TOOLS.push({
  id:'t02', cat:'text', name:'Case Converter', desc:'Switch between UPPER, lower, Title, Sentence, camelCase and snake_case.', keywords:'uppercase lowercase title camel snake',
  mount(c){
    textTool(c, {
      inLabel:'Input text', outLabel:'Converted text', placeholder:'Type or paste text…',
      actions:[
        {label:'UPPERCASE', run:s=>s.toUpperCase()},
        {label:'lowercase', run:s=>s.toLowerCase()},
        {label:'Title Case', run:s=>s.toLowerCase().replace(/\b\w/g,ch=>ch.toUpperCase())},
        {label:'Sentence case', run:s=>{ s=s.toLowerCase(); return s.replace(/(^\s*\w|[.!?]\s+\w)/g,ch=>ch.toUpperCase()); }},
        {label:'camelCase', run:s=>{ const w=s.trim().split(/[^a-zA-Z0-9]+/).filter(Boolean); return w.map((x,i)=> i===0? x.toLowerCase() : x[0].toUpperCase()+x.slice(1).toLowerCase()).join(''); }},
        {label:'snake_case', run:s=>s.trim().split(/[^a-zA-Z0-9]+/).filter(Boolean).map(x=>x.toLowerCase()).join('_')}
      ]
    });
  }
});

TEXT_TOOLS.push({
  id:'t03', cat:'text', name:'Text Truncator', desc:'Cut text down to a character or word limit with an optional ellipsis.', keywords:'limit shorten excerpt ellipsis',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Input text</label><textarea class="ta" id="trIn" rows="6" placeholder="Paste text to truncate…"></textarea></div>
      <div class="form-grid">
        <div class="field"><label>Limit</label><input type="number" id="trLimit" value="100" min="1"></div>
        <div class="field"><label>Unit</label><select id="trUnit"><option value="chars">Characters</option><option value="words">Words</option></select></div>
      </div>
      <div class="field"><label class="chk"><input type="checkbox" id="trEllipsis" checked> Add “…” when truncated</label></div>
      <div class="actions" id="trActs"></div>
      <div class="field"><label>Result</label><textarea class="ta out" id="trOut" rows="6" readonly></textarea></div>
    `;
    const $in=c.querySelector('#trIn'), $limit=c.querySelector('#trLimit'), $unit=c.querySelector('#trUnit'), $ell=c.querySelector('#trEllipsis'), $out=c.querySelector('#trOut');
    function run(){
      const n=Math.max(1, parseInt($limit.value,10)||1);
      const text=$in.value;
      let out;
      if($unit.value==='chars'){ out = text.length>n ? text.slice(0,n) + ($ell.checked?'…':'') : text; }
      else { const words=text.match(/\S+/g)||[]; out = words.length>n ? words.slice(0,n).join(' ') + ($ell.checked?'…':'') : text; }
      $out.value=out;
    }
    [$in,$limit,$unit,$ell].forEach(e=>e.addEventListener('input',run));
    c.querySelector('#trActs').appendChild((()=>{ const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Truncate'; b.addEventListener('click',run); return b; })());
    c.querySelector('#trActs').appendChild(copyBtn(()=>$out.value));
    run();
  }
});

TEXT_TOOLS.push({
  id:'t04', cat:'text', name:'Whitespace Cleaner', desc:'Trim lines, collapse repeated spaces and squash extra blank lines.', keywords:'trim spaces newline clean',
  mount(c){
    textTool(c, {
      inLabel:'Messy text', outLabel:'Cleaned text', placeholder:'Paste text with extra spaces or blank lines…', live:true,
      actions:[{label:'Clean', primary:true, run:s=> s.split('\n').map(l=>l.replace(/[ \t]+/g,' ').trim()).join('\n').replace(/\n{3,}/g,'\n\n').trim()}]
    });
  }
});

TEXT_TOOLS.push({
  id:'t05', cat:'text', name:'Find & Replace', desc:'Replace every match of a word or pattern, with optional case match or regex.', keywords:'search substitute regex',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Source text</label><textarea class="ta" id="frIn" rows="6" placeholder="Paste text…"></textarea></div>
      <div class="form-grid">
        <div class="field"><label>Find</label><input type="text" id="frFind" placeholder="text to find"></div>
        <div class="field"><label>Replace with</label><input type="text" id="frRep" placeholder="replacement"></div>
      </div>
      <div class="form-grid">
        <div class="field"><label class="chk"><input type="checkbox" id="frCase"> Match case</label></div>
        <div class="field"><label class="chk"><input type="checkbox" id="frRegex"> Treat “Find” as regex</label></div>
      </div>
      <div class="actions" id="frActs"></div>
      <div class="field"><label>Result</label><textarea class="ta out" id="frOut" rows="6" readonly></textarea></div>
      <p class="hint" id="frHint"></p>
    `;
    const $in=c.querySelector('#frIn'), $find=c.querySelector('#frFind'), $rep=c.querySelector('#frRep'), $case=c.querySelector('#frCase'), $regex=c.querySelector('#frRegex'), $out=c.querySelector('#frOut'), $hint=c.querySelector('#frHint');
    function run(){
      if(!$find.value){ $out.value=$in.value; $hint.textContent=''; return; }
      try{
        let pattern = $regex.checked ? $find.value : $find.value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        const re = new RegExp(pattern, 'g'+($case.checked?'':'i'));
        let count=0;
        const out = $in.value.replace(re, ()=>{ count++; return $rep.value; });
        $out.value = out;
        $hint.textContent = count+' replacement'+(count===1?'':'s')+' made.';
      }catch(e){ $hint.textContent = 'Invalid pattern: '+e.message; }
    }
    [$in,$find,$rep,$case,$regex].forEach(e=>e.addEventListener('input',run));
    c.querySelector('#frActs').appendChild(copyBtn(()=>$out.value));
  }
});

TEXT_TOOLS.push({
  id:'t06', cat:'text', name:'Text Diff Checker', desc:'Compare two blocks of text line by line and highlight what changed.', keywords:'compare changes versions',
  mount(c){
    c.innerHTML = `
      <div class="form-grid" style="grid-template-columns:1fr">
        <div class="field"><label>Original</label><textarea class="ta" id="dfA" rows="6" placeholder="Original text…"></textarea></div>
        <div class="field"><label>Modified</label><textarea class="ta" id="dfB" rows="6" placeholder="Modified text…"></textarea></div>
      </div>
      <div class="actions"><button class="btn primary" id="dfRun" type="button">Compare</button></div>
      <div class="result-box" id="dfOut" style="padding:8px"><span class="muted" style="padding:8px;display:block">Diff will appear here.</span></div>
    `;
    const $a=c.querySelector('#dfA'), $b=c.querySelector('#dfB'), $out=c.querySelector('#dfOut');
    c.querySelector('#dfRun').addEventListener('click', ()=> renderDiff($out, lineDiff($a.value,$b.value)));
  }
});

TEXT_TOOLS.push({
  id:'t07', cat:'text', name:'Duplicate Line Remover', desc:'Keep only the first occurrence of each line.', keywords:'dedupe unique lines',
  mount(c){
    textTool(c, {
      inLabel:'Lines', outLabel:'Unique lines', placeholder:'One item per line…', live:true,
      actions:[{label:'Remove Duplicates', primary:true, run:s=>[...new Set(s.split('\n'))].join('\n')}]
    });
  }
});

TEXT_TOOLS.push({
  id:'t08', cat:'text', name:'Line Sorter', desc:'Sort lines A→Z, Z→A, by length, or shuffle them randomly.', keywords:'alphabetical order random',
  mount(c){
    textTool(c, {
      inLabel:'Lines', outLabel:'Sorted lines', placeholder:'One item per line…',
      actions:[
        {label:'A → Z', primary:true, run:s=>s.split('\n').sort((a,b)=>a.localeCompare(b)).join('\n')},
        {label:'Z → A', run:s=>s.split('\n').sort((a,b)=>b.localeCompare(a)).join('\n')},
        {label:'By Length', run:s=>s.split('\n').sort((a,b)=>a.length-b.length).join('\n')},
        {label:'Shuffle', run:s=>{ const arr=s.split('\n'); for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr.join('\n'); }}
      ]
    });
  }
});

TEXT_TOOLS.push({
  id:'t09', cat:'text', name:'Lorem Ipsum Generator', desc:'Generate placeholder paragraphs for mockups and layouts.', keywords:'placeholder dummy filler',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Paragraphs</label><input type="number" id="loP" value="3" min="1" max="20"></div>
        <div class="field"><label>Sentences / paragraph</label><input type="number" id="loS" value="5" min="1" max="20"></div>
      </div>
      <div class="actions" id="loActs"></div>
      <div class="field"><label>Generated text</label><textarea class="ta out" id="loOut" rows="8" readonly></textarea></div>
    `;
    const $p=c.querySelector('#loP'), $s=c.querySelector('#loS'), $out=c.querySelector('#loOut');
    function run(){
      const p=Math.min(20,Math.max(1,parseInt($p.value,10)||1)), s=Math.min(20,Math.max(1,parseInt($s.value,10)||1));
      const paras=[]; for(let i=0;i<p;i++) paras.push(loremParagraph(s));
      $out.value = paras.join('\n\n');
    }
    const genBtn=document.createElement('button'); genBtn.type='button'; genBtn.className='btn primary'; genBtn.textContent='Generate'; genBtn.addEventListener('click',run);
    c.querySelector('#loActs').appendChild(genBtn);
    c.querySelector('#loActs').appendChild(copyBtn(()=>$out.value));
    run();
  }
});

TEXT_TOOLS.push({
  id:'t10', cat:'text', name:'Slug Generator', desc:'Turn a title into a clean, URL-friendly slug.', keywords:'url friendly permalink dash',
  mount(c){
    textTool(c, {
      inLabel:'Title', outLabel:'Slug', placeholder:'e.g. My First Blog Post!', live:true, rows:2,
      actions:[{label:'Slugify', primary:true, run:s=> s.toLowerCase().trim().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}]
    });
  }
});

TEXT_TOOLS.push({
  id:'t11', cat:'text', name:'Text ⇄ Binary', desc:'Convert plain text to 8-bit binary and back again.', keywords:'binary code convert 01',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Output', placeholder:'Type text, or paste binary…',
      actions:[
        {label:'Text → Binary', primary:true, run:s=> [...new TextEncoder().encode(s)].map(b=>b.toString(2).padStart(8,'0')).join(' ')},
        {label:'Binary → Text', run:s=>{
          try{ const bytes = s.trim().split(/\s+/).filter(Boolean).map(b=>parseInt(b,2)); if(bytes.some(isNaN)) throw new Error(); return new TextDecoder().decode(new Uint8Array(bytes)); }
          catch(e){ return 'Invalid binary — expected space-separated 8-bit groups.'; }
        }}
      ]
    });
  }
});

TEXT_TOOLS.push({
  id:'t12', cat:'text', name:'Text ⇄ Morse Code', desc:'Encode text to Morse code, or decode Morse back to text.', keywords:'dots dashes telegraph',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Output', placeholder:'Type text, or paste morse (space between letters, / between words)…',
      actions:[
        {label:'Text → Morse', primary:true, run:s=> s.toUpperCase().split('').map(ch=> ch===' ' ? '/' : (MORSE_MAP[ch]||'')).filter(Boolean).join(' ')},
        {label:'Morse → Text', run:s=> s.trim().split(/\s+/).map(code=> code==='/' ? ' ' : (MORSE_REV[code]||'')).join('')}
      ]
    });
  }
});

TEXT_TOOLS.push({
  id:'t13', cat:'text', name:'Palindrome Checker', desc:'Check whether a word or phrase reads the same backwards.', keywords:'reverse symmetric',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="paIn" rows="3" placeholder="e.g. A man, a plan, a canal, Panama"></textarea></div>
      <div class="result-box" id="paOut"><span class="muted">Type something to check.</span></div>
    `;
    const $in=c.querySelector('#paIn'), $out=c.querySelector('#paOut');
    $in.addEventListener('input', ()=>{
      const cleaned = $in.value.toLowerCase().replace(/[^a-z0-9]/g,'');
      if(!cleaned){ $out.innerHTML='<span class="muted">Type something to check.</span>'; return; }
      const isPal = cleaned === cleaned.split('').reverse().join('');
      $out.innerHTML = `<div class="result-big" style="color:${isPal?'var(--success)':'var(--danger)'}">${isPal?'Yes, it’s a palindrome':'Not a palindrome'}</div><p class="hint">Normalized: <span class="mono">${esc(cleaned)}</span></p>`;
    });
  }
});

TEXT_TOOLS.push({
  id:'t14', cat:'text', name:'Word Frequency Counter', desc:'Count how many times each word appears and rank the most common.', keywords:'keyword density top words',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="wfIn" rows="7" placeholder="Paste text…"></textarea></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Word</th><th>Count</th><th>%</th></tr></thead><tbody id="wfBody"></tbody></table></div>
    `;
    const $in=c.querySelector('#wfIn'), $body=c.querySelector('#wfBody');
    $in.addEventListener('input', ()=>{
      const words = ($in.value.toLowerCase().match(/[a-z0-9']+/g))||[];
      const freq={}; words.forEach(w=> freq[w]=(freq[w]||0)+1);
      const rows = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,30);
      $body.innerHTML = rows.length ? rows.map(([w,n])=>`<tr><td>${esc(w)}</td><td>${n}</td><td>${(n/words.length*100).toFixed(1)}%</td></tr>`).join('') : '<tr><td colspan="3" class="hint">Nothing to count yet.</td></tr>';
    });
  }
});

TEXT_TOOLS.push({
  id:'t15', cat:'text', name:'Text Shuffler', desc:'Randomly shuffle the words or characters in a block of text.', keywords:'random scramble mix',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Shuffled', placeholder:'Type text…',
      actions:[
        {label:'Shuffle Words', primary:true, run:s=>{ const arr=s.split(/(\s+)/); const words=arr.filter((_,i)=>i%2===0); for(let i=words.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [words[i],words[j]]=[words[j],words[i]]; } return words.join(' '); }},
        {label:'Shuffle Characters', run:s=>{ const arr=s.split(''); for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr.join(''); }}
      ]
    });
  }
});

TEXT_TOOLS.push({
  id:'t16', cat:'text', name:'ROT13 / Caesar Cipher', desc:'Shift letters by any amount — the classic substitution cipher.', keywords:'encode decode shift cipher',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="caIn" rows="5" placeholder="Type text…"></textarea></div>
      <div class="field"><label>Shift amount</label><input type="number" id="caShift" value="13" min="1" max="25"></div>
      <div class="actions" id="caActs"></div>
      <div class="field"><label>Result</label><textarea class="ta out" id="caOut" rows="5" readonly></textarea></div>
    `;
    const $in=c.querySelector('#caIn'), $shift=c.querySelector('#caShift'), $out=c.querySelector('#caOut');
    function shiftText(s,n){
      n=((n%26)+26)%26;
      return s.replace(/[a-zA-Z]/g, ch=>{
        const base = ch<='Z' ? 65 : 97;
        return String.fromCharCode((ch.charCodeAt(0)-base+n)%26+base);
      });
    }
    function make(dir){ return ()=>{ $out.value = shiftText($in.value, dir*(parseInt($shift.value,10)||0)); }; }
    const encB=document.createElement('button'); encB.type='button'; encB.className='btn primary'; encB.textContent='Encode'; encB.addEventListener('click',make(1));
    const decB=document.createElement('button'); decB.type='button'; decB.className='btn ghost'; decB.textContent='Decode'; decB.addEventListener('click',make(-1));
    c.querySelector('#caActs').append(encB,decB,copyBtn(()=>$out.value));
  }
});

TEXT_TOOLS.push({
  id:'t17', cat:'text', name:'Text ⇄ ASCII Codes', desc:'Convert text to decimal character codes and back.', keywords:'charcode decimal convert',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Output', placeholder:'Type text, or paste codes like 72 101 108 108 111…',
      actions:[
        {label:'Text → Codes', primary:true, run:s=> [...s].map(ch=>ch.charCodeAt(0)).join(' ')},
        {label:'Codes → Text', run:s=>{ try{ return s.trim().split(/\s+/).map(n=>String.fromCharCode(parseInt(n,10))).join(''); }catch(e){ return 'Invalid codes.'; } }}
      ]
    });
  }
});

TEXT_TOOLS.push({
  id:'t18', cat:'text', name:'HTML Tag Stripper', desc:'Remove all HTML tags and leave just the plain text.', keywords:'strip clean markup',
  mount(c){
    textTool(c, {
      inLabel:'HTML', outLabel:'Plain text', placeholder:'<p>Paste HTML here…</p>', live:true,
      actions:[{label:'Strip Tags', primary:true, run:s=> s.replace(/<[^>]*>/g,'').replace(/[ \t]{2,}/g,' ')}]
    });
  }
});

TEXT_TOOLS.push({
  id:'t19', cat:'text', name:'Line Prefixer & Numberer', desc:'Add line numbers, bullets or a custom prefix to every line.', keywords:'numbered list bullet',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Lines</label><textarea class="ta" id="lpIn" rows="6" placeholder="One item per line…"></textarea></div>
      <div class="form-grid">
        <div class="field"><label>Style</label><select id="lpMode"><option value="num">1. Numbered</option><option value="bul">• Bullet</option><option value="custom">Custom prefix</option></select></div>
        <div class="field"><label>Custom prefix</label><input type="text" id="lpPrefix" value="- " placeholder="e.g. - "></div>
      </div>
      <div class="actions" id="lpActs"></div>
      <div class="field"><label>Result</label><textarea class="ta out" id="lpOut" rows="6" readonly></textarea></div>
    `;
    const $in=c.querySelector('#lpIn'), $mode=c.querySelector('#lpMode'), $prefix=c.querySelector('#lpPrefix'), $out=c.querySelector('#lpOut');
    function run(){
      const lines=$in.value.split('\n');
      $out.value = lines.map((l,i)=> $mode.value==='num' ? `${i+1}. ${l}` : $mode.value==='bul' ? `• ${l}` : `${$prefix.value}${l}`).join('\n');
    }
    [$in,$mode,$prefix].forEach(e=>e.addEventListener('input',run));
    c.querySelector('#lpActs').appendChild(copyBtn(()=>$out.value));
    run();
  }
});

TEXT_TOOLS.push({
  id:'t20', cat:'text', name:'Text Repeater', desc:'Repeat a block of text a set number of times with a separator.', keywords:'duplicate repeat multiply',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="rpIn" rows="4" placeholder="Type text…"></textarea></div>
      <div class="form-grid">
        <div class="field"><label>Repeat count</label><input type="number" id="rpN" value="5" min="1" max="1000"></div>
        <div class="field"><label>Separator</label><input type="text" id="rpSep" value="\\n" placeholder="\\n for new line"></div>
      </div>
      <div class="actions" id="rpActs"></div>
      <div class="field"><label>Result</label><textarea class="ta out" id="rpOut" rows="6" readonly></textarea></div>
    `;
    const $in=c.querySelector('#rpIn'), $n=c.querySelector('#rpN'), $sep=c.querySelector('#rpSep'), $out=c.querySelector('#rpOut');
    function run(){
      const n=Math.min(1000,Math.max(1,parseInt($n.value,10)||1));
      const sep=$sep.value.replace(/\\n/g,'\n').replace(/\\t/g,'\t');
      $out.value = Array(n).fill($in.value).join(sep);
    }
    [$in,$n,$sep].forEach(e=>e.addEventListener('input',run));
    c.querySelector('#rpActs').appendChild(copyBtn(()=>$out.value));
    run();
  }
});

TEXT_TOOLS.push({
  id:'t21', cat:'text', name:'Acronym Generator', desc:'Build an acronym from the first letter of each word.', keywords:'initials abbreviation',
  mount(c){
    textTool(c, {
      inLabel:'Phrase', outLabel:'Acronym', placeholder:'e.g. As Soon As Possible', live:true, rows:2,
      actions:[{label:'Generate', primary:true, run:s=> s.trim().split(/\s+/).filter(Boolean).map(w=>w[0]).join('').toUpperCase()}]
    });
  }
});

TEXT_TOOLS.push({
  id:'t22', cat:'text', name:'Anagram Checker', desc:'See if two words or phrases are anagrams of each other.', keywords:'letters rearrange match',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>First phrase</label><input type="text" id="anA" placeholder="listen"></div>
        <div class="field"><label>Second phrase</label><input type="text" id="anB" placeholder="silent"></div>
      </div>
      <div class="result-box" id="anOut"><span class="muted">Enter two phrases to compare.</span></div>
    `;
    const $a=c.querySelector('#anA'), $b=c.querySelector('#anB'), $out=c.querySelector('#anOut');
    function norm(s){ return s.toLowerCase().replace(/[^a-z0-9]/g,'').split('').sort().join(''); }
    function run(){
      if(!$a.value || !$b.value){ $out.innerHTML='<span class="muted">Enter two phrases to compare.</span>'; return; }
      const isAna = norm($a.value)===norm($b.value) && norm($a.value).length>0;
      $out.innerHTML = `<div class="result-big" style="color:${isAna?'var(--success)':'var(--danger)'}">${isAna?'Yes, anagrams!':'Not anagrams'}</div>`;
    }
    [$a,$b].forEach(e=>e.addEventListener('input',run));
  }
});

TEXT_TOOLS.push({
  id:'t23', cat:'text', name:'Text Wrap Formatter', desc:'Wrap long text to a fixed line width — handy for code comments or plain-text email.', keywords:'wrap column width monospace',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="wrIn" rows="6" placeholder="Paste a long paragraph…"></textarea></div>
      <div class="field"><label>Line width (characters)</label><input type="number" id="wrW" value="72" min="10" max="300"></div>
      <div class="actions" id="wrActs"></div>
      <div class="field"><label>Wrapped text</label><textarea class="ta out mono" id="wrOut" rows="8" readonly></textarea></div>
    `;
    const $in=c.querySelector('#wrIn'), $w=c.querySelector('#wrW'), $out=c.querySelector('#wrOut');
    function wrap(text,width){
      return text.split('\n').map(paragraph=>{
        if(!paragraph) return '';
        const words = paragraph.split(/\s+/).filter(Boolean);
        const lines=[]; let cur='';
        words.forEach(word=>{
          if((cur+' '+word).trim().length>width){ if(cur) lines.push(cur); cur=word; }
          else cur = (cur? cur+' ':'')+word;
        });
        if(cur) lines.push(cur);
        return lines.join('\n');
      }).join('\n');
    }
    function run(){ $out.value = wrap($in.value, Math.max(10,parseInt($w.value,10)||72)); }
    [$in,$w].forEach(e=>e.addEventListener('input',run));
    c.querySelector('#wrActs').appendChild(copyBtn(()=>$out.value));
    run();
  }
});

TEXT_TOOLS.push({
  id:'t24', cat:'text', name:'Remove Emoji & Special Characters', desc:'Strip emoji or non-alphanumeric symbols out of a block of text.', keywords:'clean symbols unicode filter',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Output', placeholder:'Type or paste text with emoji 🎉 or symbols…',
      actions:[
        {label:'Remove Emoji', primary:true, run:s=> s.replace(/\p{Extended_Pictographic}/gu,'').replace(/‍/g,'')},
        {label:'Keep Only Letters/Numbers/Spaces', run:s=> s.replace(/[^\p{L}\p{N}\s.,!?'-]/gu,'')}
      ]
    });
  }
});

TEXT_TOOLS.push({
  id:'t25', cat:'text', name:'Smart Quotes & Dash Converter', desc:'Turn straight quotes into curly quotes and “--” into proper dashes.', keywords:'typography curly quotes emdash',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Typeset text', placeholder:'He said "hello" -- it\'s nice...', live:true,
      actions:[{label:'Convert', primary:true, run:s=>{
        let out=s;
        out = out.replace(/(^|[-—\s(["])'/g, '$1‘').replace(/'/g,'’');
        out = out.replace(/(^|[-—\s(["])"/g, '$1“').replace(/"/g,'”');
        out = out.replace(/---/g,'—').replace(/--/g,'–').replace(/\.\.\./g,'…');
        return out;
      }}]
    });
  }
});

TEXT_TOOLS.push({
  id:'t26', cat:'text', name:'Readability Score Checker', desc:'Estimate how easy your text is to read using the Flesch Reading Ease and Flesch-Kincaid Grade Level formulas.', keywords:'readability flesch kincaid grade level score',
  mount(c){
    statsTool(c, text=>{
      const words=(text.match(/[A-Za-z']+/g)||[]);
      const sentences=(text.match(/[^.!?]*[.!?]+/g)||[]).filter(s=>s.trim()).length || (text.trim()?1:0);
      const syl = words.reduce((s,w)=>s+estimateSyllables(w),0);
      const wc=words.length;
      let ease=0, grade=0;
      if(wc>0 && sentences>0){
        ease = 206.835 - 1.015*(wc/sentences) - 84.6*(syl/wc);
        grade = 0.39*(wc/sentences) + 11.8*(syl/wc) - 15.59;
      }
      let label='—';
      if(text.trim()){
        if(ease>=90) label='Very Easy';
        else if(ease>=70) label='Easy';
        else if(ease>=60) label='Standard';
        else if(ease>=50) label='Fairly Difficult';
        else if(ease>=30) label='Difficult';
        else label='Very Confusing';
      }
      return [
        {v:wc,l:'Words'},{v:sentences,l:'Sentences'},{v:syl,l:'Syllables'},
        {v:text.trim()?ease.toFixed(1):'—',l:'Reading Ease'},
        {v:text.trim()?grade.toFixed(1):'—',l:'Grade Level'},
        {v:label,l:'Difficulty'}
      ];
    }, 'Paste an article, essay or paragraph to check its readability...');
  }
});

TEXT_TOOLS.push({
  id:'t27', cat:'text', name:'Duplicate Word & Phrase Finder', desc:'Finds words that repeat too often in your text, with counts, so you can vary your wording.', keywords:'duplicate repeated words frequency writing',
  mount(c){
    textTool(c, {
      inLabel:'Text', outLabel:'Repeated Words (2+ times)', rows:8,
      placeholder:'Paste your text here...',
      live:true,
      actions:[{label:'Find Duplicates', primary:true, run(text){
        const words=(text.toLowerCase().match(/[a-z']+/g)||[]);
        const counts={};
        words.forEach(w=>{ if(w.length>2) counts[w]=(counts[w]||0)+1; });
        const dups=Object.entries(counts).filter(([w,n])=>n>=2).sort((a,b)=>b[1]-a[1]);
        if(!dups.length) return text.trim() ? 'No repeated words found.' : '';
        return dups.map(([w,n])=>`${w} — ${n} times`).join('\n');
      }}]
    });
  }
});

TEXT_TOOLS.push({
  id:'t28', cat:'text', name:'Text to Speech Reader', desc:'Have your browser read text out loud, with adjustable voice, speed and pitch.', keywords:'tts speech synthesis read aloud voice',
  mount(c){
    if(!('speechSynthesis' in window)){
      c.innerHTML = '<p class="hint">Text-to-speech is not supported in this browser.</p>';
      return;
    }
    c.innerHTML = `
      <div class="field"><label>Text to read</label><textarea class="ta" id="ttsIn" rows="6" placeholder="Type or paste text to hear it read aloud...">Toolkit Pro turns your browser into a toolbox — no sign-up, no server uploads.</textarea></div>
      <div class="form-grid">
        <div class="field"><label>Voice</label><select id="ttsVoice"></select></div>
        <div class="field"><label>Rate <span id="ttsRateV" class="mono">1.0×</span></label><input type="range" id="ttsRate" min="0.5" max="2" step="0.1" value="1"></div>
        <div class="field"><label>Pitch <span id="ttsPitchV" class="mono">1.0</span></label><input type="range" id="ttsPitch" min="0" max="2" step="0.1" value="1"></div>
      </div>
      <div class="actions">
        <button class="btn primary" id="ttsPlay" type="button">Play</button>
        <button class="btn ghost" id="ttsPause" type="button">Pause</button>
        <button class="btn ghost" id="ttsStop" type="button">Stop</button>
      </div>
      <p class="hint" id="ttsHint">Available voices depend on your device and browser.</p>
    `;
    const $in=c.querySelector('#ttsIn'), $voice=c.querySelector('#ttsVoice'), $rate=c.querySelector('#ttsRate'), $rateV=c.querySelector('#ttsRateV');
    const $pitch=c.querySelector('#ttsPitch'), $pitchV=c.querySelector('#ttsPitchV'), hint=c.querySelector('#ttsHint');
    let voices=[];
    function loadVoices(){
      voices = speechSynthesis.getVoices();
      $voice.innerHTML = voices.map((v,i)=>`<option value="${i}">${esc(v.name)} (${esc(v.lang)})</option>`).join('') || '<option>Default</option>';
    }
    loadVoices();
    if('onvoiceschanged' in speechSynthesis) speechSynthesis.onvoiceschanged = loadVoices;
    $rate.addEventListener('input', ()=>{ $rateV.textContent = parseFloat($rate.value).toFixed(1)+'×'; });
    $pitch.addEventListener('input', ()=>{ $pitchV.textContent = parseFloat($pitch.value).toFixed(1); });
    c.querySelector('#ttsPlay').addEventListener('click', ()=>{
      if(!$in.value.trim()){ hint.textContent='Type some text first.'; return; }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance($in.value);
      if(voices[$voice.value]) u.voice = voices[$voice.value];
      u.rate = parseFloat($rate.value); u.pitch = parseFloat($pitch.value);
      u.onend = ()=>{ hint.textContent='Finished reading.'; };
      u.onerror = ()=>{ hint.textContent='Could not read this text.'; };
      speechSynthesis.speak(u);
      hint.textContent='Reading...';
    });
    c.querySelector('#ttsPause').addEventListener('click', ()=>{
      if(speechSynthesis.speaking && !speechSynthesis.paused){ speechSynthesis.pause(); hint.textContent='Paused.'; }
      else if(speechSynthesis.paused){ speechSynthesis.resume(); hint.textContent='Reading...'; }
    });
    c.querySelector('#ttsStop').addEventListener('click', ()=>{ speechSynthesis.cancel(); hint.textContent='Stopped.'; });
    onToolCleanup(()=>{ try{ speechSynthesis.cancel(); }catch(e){} });
  }
});

TEXT_TOOLS.push({
  id:'t29', cat:'text', name:'Character Frequency Analyzer', desc:'Counts how often each letter appears in your text — handy for puzzles, ciphers and cryptic crosswords.', keywords:'letter frequency count cipher cryptogram',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="cfIn" rows="8" placeholder="Paste text to analyze letter frequency..."></textarea></div>
      <div id="cfOut"><p class="hint">Type some text above.</p></div>
    `;
    const $in=c.querySelector('#cfIn'), $out=c.querySelector('#cfOut');
    function upd(){
      const text=$in.value.toLowerCase();
      const counts={};
      let total=0;
      for(const ch of text){ if(/[a-z]/.test(ch)){ counts[ch]=(counts[ch]||0)+1; total++; } }
      if(!total){ $out.innerHTML='<p class="hint">Type some text above.</p>'; return; }
      const rows = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
      const max = rows[0][1];
      $out.innerHTML = `<table class="data-table"><thead><tr><th>Letter</th><th>Count</th><th>% of Letters</th><th></th></tr></thead><tbody>` +
        rows.map(([ch,n])=>`<tr><td class="mono">${esc(ch.toUpperCase())}</td><td>${n}</td><td>${(n/total*100).toFixed(1)}%</td><td><div style="background:var(--accent);height:8px;border-radius:4px;width:${Math.max(4,Math.round(n/max*100))}px"></div></td></tr>`).join('') +
        `</tbody></table>`;
    }
    $in.addEventListener('input', upd); upd();
  }
});

TEXT_TOOLS.push({
  id:'t30', cat:'text', name:'Text Encryptor / Decryptor', desc:'Encrypt or decrypt short text with a password, using a reversible XOR cipher. For fun and light obfuscation, not serious security.', keywords:'encrypt decrypt password cipher xor',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="xcIn" rows="5" placeholder="Type text to encrypt, or paste encrypted text to decrypt..."></textarea></div>
      <div class="field"><label>Password</label><input type="text" id="xcKey" placeholder="Enter a password"></div>
      <div class="actions" id="xcActs">
        <button class="btn primary" id="xcEnc" type="button">Encrypt</button>
        <button class="btn ghost" id="xcDec" type="button">Decrypt</button>
      </div>
      <div class="field"><label>Result</label><textarea class="ta out" id="xcOut" rows="5" readonly placeholder="Result will appear here..."></textarea></div>
      <p class="hint">This is a simple reversible cipher meant for casual privacy (notes, games) — not for protecting sensitive data.</p>
    `;
    const $in=c.querySelector('#xcIn'), $key=c.querySelector('#xcKey'), $out=c.querySelector('#xcOut'), acts=c.querySelector('#xcActs');
    c.querySelector('#xcEnc').addEventListener('click', ()=>{
      try{
        const cipher = xorCipher($in.value, $key.value);
        $out.value = btoa(unescape(encodeURIComponent(cipher)));
      }catch(e){ $out.value = 'Error: '+e.message; }
    });
    c.querySelector('#xcDec').addEventListener('click', ()=>{
      try{
        const raw = decodeURIComponent(escape(atob($in.value.trim())));
        $out.value = xorCipher(raw, $key.value);
      }catch(e){ $out.value = 'Could not decrypt — check the text and password.'; }
    });
    acts.appendChild(copyBtn(()=>$out.value));
  }
});

TEXT_TOOLS.push({
  id:'t31', cat:'text', name:'Speech to Text (Voice Typewriter)', desc:'Dictate out loud and have your browser type it for you — great for drafting notes hands-free.', keywords:'speech recognition voice typing dictation microphone',
  mount(c){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){
      c.innerHTML = '<p class="hint">Speech recognition is not supported in this browser. Try Chrome or Edge on desktop or Android.</p>';
      return;
    }
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Language</label>
          <select id="sttLang">
            <option value="en-US" selected>English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">Hindi</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
          </select>
        </div>
      </div>
      <div class="field"><label>Transcript</label><textarea class="ta" id="sttOut" rows="8" placeholder="Press Start and speak — your words will appear here..."></textarea></div>
      <div class="actions">
        <button class="btn primary" id="sttStart" type="button">Start Listening</button>
        <button class="btn ghost" id="sttStop" type="button" disabled>Stop</button>
        <button class="btn ghost" id="sttClear" type="button">Clear</button>
      </div>
      <p class="hint" id="sttHint">Your browser will ask for microphone permission. Audio is processed by your browser/OS and never uploaded by this site.</p>
    `;
    const $lang=c.querySelector('#sttLang'), $out=c.querySelector('#sttOut'), hint=c.querySelector('#sttHint');
    const $start=c.querySelector('#sttStart'), $stop=c.querySelector('#sttStop'), $clear=c.querySelector('#sttClear');
    let recog=null, listening=false, finalText='';
    function makeRecognizer(){
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = $lang.value;
      r.onresult = (e)=>{
        let interim='';
        for(let i=e.resultIndex;i<e.results.length;i++){
          const res=e.results[i];
          if(res.isFinal) finalText += res[0].transcript + ' ';
          else interim += res[0].transcript;
        }
        $out.value = finalText + interim;
      };
      r.onerror = (e)=>{ hint.textContent = 'Error: '+(e.error||'could not access microphone.'); stopListening(); };
      r.onend = ()=>{ if(listening){ try{ r.start(); }catch(e){} } };
      return r;
    }
    function startListening(){
      finalText = $out.value ? $out.value + ' ' : '';
      recog = makeRecognizer();
      try{ recog.start(); }catch(e){}
      listening = true; $start.disabled=true; $stop.disabled=false; hint.textContent='Listening...';
    }
    function stopListening(){
      listening = false;
      if(recog){ try{ recog.onend=null; recog.stop(); }catch(e){} }
      $start.disabled=false; $stop.disabled=true; hint.textContent='Stopped.';
    }
    $start.addEventListener('click', startListening);
    $stop.addEventListener('click', stopListening);
    $clear.addEventListener('click', ()=>{ $out.value=''; finalText=''; });
    onToolCleanup(()=>{ stopListening(); });
  }
});

TEXT_TOOLS.push({
  id:'t32', cat:'text', name:'Word Cloud Generator', desc:'Turn any block of text into a visual word cloud, sized by how often each word appears.', keywords:'word cloud tag cloud text visualization',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="wcIn" rows="7" placeholder="Paste an article, essay or notes here...">Toolkit Pro is a free toolkit. Toolkit Pro tools run in your browser. Free tools, free forever, no sign up, no upload, just useful free tools for everyone.</textarea></div>
      <div class="form-grid">
        <div class="field"><label>Max words</label><input type="number" id="wcMax" min="5" max="150" value="60" step="5"></div>
        <div class="field"><label class="chk"><input type="checkbox" id="wcStop" checked> Skip common words (the, and, is...)</label></div>
      </div>
      <div class="actions"><button class="btn primary" id="wcGo" type="button">Generate Cloud</button>
        <button class="btn ghost" id="wcDownload" type="button" disabled>Download PNG</button>
      </div>
      <div class="img-frame" style="max-width:100%;overflow:auto"><canvas id="wcCanvas" width="800" height="480" style="width:100%;height:auto;background:var(--card-bg,#fff)"></canvas></div>
      <p class="hint" id="wcHint">Bigger words appeared more often in your text.</p>
    `;
    const STOP = new Set('a an the and or but of to in on at for with is are was were be been being this that these those it its as by from not no yes you your i we our they he she his her them us'.split(' '));
    const $in=c.querySelector('#wcIn'), $max=c.querySelector('#wcMax'), $stop=c.querySelector('#wcStop');
    const canvas=c.querySelector('#wcCanvas'), ctx=canvas.getContext('2d'), hint=c.querySelector('#wcHint'), dlBtn=c.querySelector('#wcDownload');
    function wordFreq(text, skipStop, max){
      const words = (text.toLowerCase().match(/[a-z0-9']+/g)||[]).filter(w=>w.length>1 && (!skipStop || !STOP.has(w)));
      const freq={};
      words.forEach(w=>{ freq[w]=(freq[w]||0)+1; });
      return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,max);
    }
    function overlaps(box, placed){
      return placed.some(p => !(box.x2 < p.x1 || box.x1 > p.x2 || box.y2 < p.y1 || box.y1 > p.y2));
    }
    function render(){
      const list = wordFreq($in.value, $stop.checked, parseInt($max.value,10)||60);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.textBaseline='middle'; ctx.textAlign='center';
      if(!list.length){ hint.textContent='Add some text first.'; dlBtn.disabled=true; return; }
      const maxCount = list[0][1];
      const cx=canvas.width/2, cy=canvas.height/2;
      const placed=[];
      const colors=['#2563EB','#DC2626','#059669','#D97706','#7C3AED','#DB2777','#0891B2'];
      let plotted=0;
      list.forEach(([word,count],idx)=>{
        const size = 14 + Math.round((count/maxCount) * 46);
        ctx.font = `700 ${size}px Poppins, sans-serif`;
        const w = ctx.measureText(word).width, h = size;
        let placedOk=false, x=cx, y=cy;
        for(let a=0, r=0; a<800; a++, r+=0.4){
          const angle = a*0.5;
          x = cx + r*Math.cos(angle); y = cy + r*Math.sin(angle);
          const box={x1:x-w/2-3, x2:x+w/2+3, y1:y-h/2-2, y2:y+h/2+2};
          if(box.x1<0||box.x2>canvas.width||box.y1<0||box.y2>canvas.height) continue;
          if(!overlaps(box, placed)){ placed.push(box); placedOk=true; break; }
        }
        if(!placedOk) return;
        ctx.fillStyle = colors[idx % colors.length];
        ctx.fillText(word, x, y);
        plotted++;
      });
      hint.textContent = plotted+' words plotted.';
      dlBtn.disabled=false;
    }
    c.querySelector('#wcGo').addEventListener('click', render);
    dlBtn.addEventListener('click', async ()=>{
      canvas.toBlob(async blob=>{
        const ok = await saveFile('word-cloud.png', blob);
        hint.textContent = ok? 'Image saved.' : 'Download did not complete.';
      });
    });
    render();
  }
});

TEXT_TOOLS.push({
  id:'t33', cat:'text', name:'Emoji Picker & Copy Tool', desc:'Search hundreds of emoji by keyword and copy them straight to your clipboard.', keywords:'emoji picker copy paste symbols emoticons',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Search</label><input type="text" id="ejSearch" placeholder="Try: happy, heart, fire, food, cat..."></div>
      <div id="ejGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:6px;margin-top:12px;max-height:360px;overflow:auto"></div>
      <p class="hint" id="ejHint">Click any emoji to copy it.</p>
    `;
    const $search=c.querySelector('#ejSearch'), $grid=c.querySelector('#ejGrid'), hint=c.querySelector('#ejHint');
    function renderList(filter){
      const f = filter.trim().toLowerCase();
      const list = f ? EMOJI_LIST.filter(e=>e.k.includes(f)) : EMOJI_LIST;
      $grid.innerHTML = list.slice(0,300).map(e=>`<button type="button" class="btn ghost ejBtn" data-e="${esc(e.e)}" title="${esc(e.k)}" style="font-size:22px;padding:8px 0">${e.e}</button>`).join('') || '<p class="hint">No matches.</p>';
      $grid.querySelectorAll('.ejBtn').forEach(btn=>{
        btn.addEventListener('click', async ()=>{
          const ok = await safeCopy(btn.dataset.e);
          hint.textContent = ok ? 'Copied ' + btn.dataset.e : 'Could not copy.';
        });
      });
    }
    $search.addEventListener('input', ()=>renderList($search.value));
    renderList('');
  }
});

TEXT_TOOLS.push({
  id:'t34', cat:'text', name:'Text Table / Column Aligner', desc:'Paste comma, tab or pipe-separated text and get a neatly aligned, monospace table.', keywords:'align columns table csv tsv formatter ascii table',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Delimited text</label><textarea class="ta" id="taIn" rows="6" placeholder="Name,Age,City">Name,Age,City
Amit,29,Delhi
Priya,34,Mumbai</textarea></div>
      <div class="form-grid">
        <div class="field"><label>Delimiter</label>
          <select id="taDelim">
            <option value="auto" selected>Auto-detect</option>
            <option value=",">Comma (,)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
        <div class="field"><label class="chk"><input type="checkbox" id="taBorders" checked> Add borders</label></div>
      </div>
      <div class="actions" id="taActs"></div>
      <textarea class="ta out mono" id="taOut" rows="8" readonly></textarea>
    `;
    const $in=c.querySelector('#taIn'), $delim=c.querySelector('#taDelim'), $borders=c.querySelector('#taBorders'), $out=c.querySelector('#taOut'), acts=c.querySelector('#taActs');
    function detectDelim(text){
      const first = text.split('\n')[0]||'';
      const counts = {',':(first.match(/,/g)||[]).length, '\t':(first.match(/\t/g)||[]).length, '|':(first.match(/\|/g)||[]).length};
      return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0] || ',';
    }
    function align(){
      const text = $in.value;
      if(!text.trim()){ $out.value=''; return; }
      const delim = $delim.value==='auto' ? detectDelim(text) : $delim.value;
      const rows = text.split('\n').filter(r=>r.length).map(r=>r.split(delim).map(cell=>cell.trim()));
      const cols = Math.max(...rows.map(r=>r.length));
      const widths = new Array(cols).fill(0);
      rows.forEach(r=>{ for(let i=0;i<cols;i++) widths[i] = Math.max(widths[i], (r[i]||'').length); });
      const pad = (s,w)=> s + ' '.repeat(Math.max(0, w - s.length));
      const sep = widths.map(w=>'-'.repeat(w+2)).join($borders.checked?'+':' ');
      const lines = rows.map(r=>{
        const cells = widths.map((w,i)=> ' '+pad(r[i]||'', w)+' ').join($borders.checked?'|':' ');
        return $borders.checked ? '|'+cells+'|' : cells;
      });
      if($borders.checked){
        const border = '+'+sep+'+';
        lines.splice(1,0,border);
        lines.unshift(border); lines.push(border);
      }
      $out.value = lines.join('\n');
    }
    $in.addEventListener('input', align);
    $delim.addEventListener('change', align);
    $borders.addEventListener('change', align);
    acts.appendChild(copyBtn(()=>$out.value));
    align();
  }
});
/* ===== TEXT_TOOLS_MARKER ===== */
IMAGE_TOOLS.push({
  id:'i01', cat:'image', name:'Image Resizer', desc:'Resize an image to exact pixel dimensions, with optional locked aspect ratio.', keywords:'resize dimensions scale pixels',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose an image</label><input type="file" id="rsFile" accept="image/*"></div>
      <div class="form-grid">
        <div class="field"><label>Width (px)</label><input type="number" id="rsW" min="1"></div>
        <div class="field"><label>Height (px)</label><input type="number" id="rsH" min="1"></div>
      </div>
      <div class="field"><label class="chk"><input type="checkbox" id="rsLock" checked> Lock aspect ratio</label></div>
      <div class="img-row">
        <div class="img-box"><span class="img-cap">Original</span><div class="img-frame"><img id="rsOrig" alt=""></div></div>
        <div class="img-box"><span class="img-cap">Resized</span><div class="img-frame"><canvas id="rsCanvas"></canvas></div></div>
      </div>
      <div class="actions">
        <button class="btn primary" id="rsRun" type="button">Resize</button>
        <button class="btn ghost" id="rsDownload" type="button" disabled>Download PNG</button>
      </div>
      <p class="hint" id="rsHint">Choose an image to begin.</p>
    `;
    const fileEl=c.querySelector('#rsFile'), $w=c.querySelector('#rsW'), $h=c.querySelector('#rsH'), $lock=c.querySelector('#rsLock');
    const orig=c.querySelector('#rsOrig'), canvas=c.querySelector('#rsCanvas'), ctx=canvas.getContext('2d');
    const dlBtn=c.querySelector('#rsDownload'), hint=c.querySelector('#rsHint');
    let ratio=1;
    fileEl.addEventListener('change', ()=>{
      const file=fileEl.files[0]; if(!file) return;
      orig.onload=()=>{ ratio=orig.naturalWidth/orig.naturalHeight; $w.value=orig.naturalWidth; $h.value=orig.naturalHeight; hint.textContent='Original: '+orig.naturalWidth+' × '+orig.naturalHeight+' px'; };
      orig.src=URL.createObjectURL(file);
    });
    $w.addEventListener('input', ()=>{ if($lock.checked && $w.value) $h.value=Math.round($w.value/ratio); });
    $h.addEventListener('input', ()=>{ if($lock.checked && $h.value) $w.value=Math.round($h.value*ratio); });
    c.querySelector('#rsRun').addEventListener('click', ()=>{
      if(!orig.src){ hint.textContent='Choose an image first.'; return; }
      const w=Math.max(1,parseInt($w.value,10)||1), h=Math.max(1,parseInt($h.value,10)||1);
      canvas.width=w; canvas.height=h; ctx.clearRect(0,0,w,h); ctx.drawImage(orig,0,0,w,h);
      dlBtn.disabled=false; hint.textContent='Resized to '+w+' × '+h+' px';
    });
    dlBtn.addEventListener('click', async ()=>{
      canvas.toBlob(async blob=>{ const ok=await saveFile('resized.png', blob); hint.textContent = ok?'Image saved.':'Download did not complete.'; }, 'image/png');
    });
  }
});

IMAGE_TOOLS.push({
  id:'i02', cat:'image', name:'Image Compressor', desc:'Reduce a JPEG’s file size by adjusting quality, with a live size estimate.', keywords:'compress quality jpeg optimize',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose an image</label><input type="file" id="cpFile" accept="image/*"></div>
      <div class="field"><label>Quality <span id="cpQVal" class="mono"></span></label><input type="range" id="cpQ" min="0.05" max="1" step="0.05" value="0.7"></div>
      <div class="img-row">
        <div class="img-box"><span class="img-cap">Original <span id="cpOrigSize" class="hint" style="margin:0"></span></span><div class="img-frame"><img id="cpOrig" alt=""></div></div>
        <div class="img-box"><span class="img-cap">Compressed <span id="cpNewSize" class="hint" style="margin:0"></span></span><div class="img-frame"><canvas id="cpCanvas"></canvas></div></div>
      </div>
      <div class="actions"><button class="btn ghost" id="cpDownload" type="button" disabled>Download JPG</button></div>
      <p class="hint" id="cpHint">Choose an image to begin.</p>
    `;
    const fileEl=c.querySelector('#cpFile'), $q=c.querySelector('#cpQ'), $qv=c.querySelector('#cpQVal');
    const orig=c.querySelector('#cpOrig'), canvas=c.querySelector('#cpCanvas'), ctx=canvas.getContext('2d');
    const dlBtn=c.querySelector('#cpDownload'), hint=c.querySelector('#cpHint'), origSize=c.querySelector('#cpOrigSize'), newSize=c.querySelector('#cpNewSize');
    let workCanvas=document.createElement('canvas'), workCtx=workCanvas.getContext('2d'), fileSize=0, lastBlob=null;
    function fmt(bytes){ return bytes<1024? bytes+' B' : (bytes/1024).toFixed(1)+' KB'; }
    function recompress(){
      if(!orig.src) return;
      workCanvas.toBlob(blob=>{
        if(!blob) return;
        lastBlob=blob;
        newSize.textContent = '· '+fmt(blob.size)+(fileSize? ' ('+Math.round(100-blob.size/fileSize*100)+'% smaller)':'');
        const img=new Image();
        img.onload=()=>{ canvas.width=img.width; canvas.height=img.height; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
        img.src=URL.createObjectURL(blob);
        dlBtn.disabled=false;
      }, 'image/jpeg', parseFloat($q.value));
    }
    fileEl.addEventListener('change', ()=>{
      const file=fileEl.files[0]; if(!file) return;
      fileSize=file.size; origSize.textContent='· '+fmt(fileSize);
      orig.onload=()=>{ workCanvas.width=orig.naturalWidth; workCanvas.height=orig.naturalHeight; workCtx.drawImage(orig,0,0); hint.textContent=orig.naturalWidth+' × '+orig.naturalHeight+' px'; recompress(); };
      orig.src=URL.createObjectURL(file);
    });
    $q.addEventListener('input', ()=>{ $qv.textContent=Math.round($q.value*100)+'%'; recompress(); });
    $qv.textContent='70%';
    dlBtn.addEventListener('click', async ()=>{ if(!lastBlob) return; const ok=await saveFile('compressed.jpg', lastBlob); hint.textContent= ok?'Image saved.':'Download did not complete.'; });
  }
});

IMAGE_TOOLS.push({
  id:'i03', cat:'image', name:'Image Format Converter', desc:'Convert an image between PNG, JPEG and WebP.', keywords:'png jpg webp convert export',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', buttonLabel:'Convert', filePrefix:'converted',
      controls:[{key:'format', label:'Output format', type:'select', options:[{v:'png',l:'PNG'},{v:'jpeg',l:'JPEG'},{v:'webp',l:'WebP'}]}, {key:'quality', label:'Quality (JPEG/WebP)', type:'range', min:0.1, max:1, step:0.05, default:0.9}],
      downloadExt:'png',
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0);
        const dlBtn=c.querySelector('#wDownload');
        const ext = vals.format==='jpeg' ? 'jpg' : vals.format;
        dlBtn.textContent='Download '+ext.toUpperCase();
        dlBtn.onclick = async ()=>{
          canvas.toBlob(async blob=>{
            if(!blob){ c.querySelector('#wHint').textContent='Could not export in that format.'; return; }
            const ok=await saveFile('converted.'+ext, blob);
            c.querySelector('#wHint').textContent= ok?'Image saved.':'Download did not complete.';
          }, 'image/'+vals.format, vals.quality);
        };
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i04', cat:'image', name:'Image Cropper', desc:'Drag a rectangle over your image and export just that area.', keywords:'crop trim select area',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose an image</label><input type="file" id="crFile" accept="image/*"></div>
      <p class="hint">Drag on the image below to select a crop area.</p>
      <div class="img-frame" id="crFrame" style="position:relative;cursor:crosshair;touch-action:none;">
        <img id="crImg" alt="" style="max-width:100%;display:block;user-select:none;">
        <div id="crSel" style="position:absolute;border:2px dashed var(--accent);background:color-mix(in srgb, var(--accent) 20%, transparent);display:none;pointer-events:none;"></div>
      </div>
      <div class="img-box" style="margin-top:12px"><span class="img-cap">Cropped result</span><div class="img-frame"><canvas id="crCanvas"></canvas></div></div>
      <div class="actions" style="margin-top:10px">
        <button class="btn primary" id="crApply" type="button" disabled>Crop</button>
        <button class="btn ghost" id="crDownload" type="button" disabled>Download PNG</button>
      </div>
      <p class="hint" id="crHint">Choose an image to begin.</p>
    `;
    const fileEl=c.querySelector('#crFile'), frame=c.querySelector('#crFrame'), img=c.querySelector('#crImg'), sel=c.querySelector('#crSel');
    const canvas=c.querySelector('#crCanvas'), ctx=canvas.getContext('2d'), applyBtn=c.querySelector('#crApply'), dlBtn=c.querySelector('#crDownload'), hint=c.querySelector('#crHint');
    let dragging=false, startX=0, startY=0, rect=null;
    fileEl.addEventListener('change', ()=>{
      const file=fileEl.files[0]; if(!file) return;
      img.onload=()=>{ hint.textContent=img.naturalWidth+' × '+img.naturalHeight+' px — drag to select an area'; sel.style.display='none'; rect=null; applyBtn.disabled=true; };
      img.src=URL.createObjectURL(file);
    });
    function pos(e){ const r=frame.getBoundingClientRect(); const p = e.touches? e.touches[0]:e; return {x:Math.min(Math.max(p.clientX-r.left,0),r.width), y:Math.min(Math.max(p.clientY-r.top,0),r.height)}; }
    function start(e){ if(!img.src) return; dragging=true; const p=pos(e); startX=p.x; startY=p.y; sel.style.display='block'; updateSel(p); e.preventDefault(); }
    function move(e){ if(!dragging) return; updateSel(pos(e)); e.preventDefault(); }
    function end(){ if(!dragging) return; dragging=false; applyBtn.disabled = !rect || rect.w<4 || rect.h<4; }
    function updateSel(p){
      const x=Math.min(startX,p.x), y=Math.min(startY,p.y), w=Math.abs(p.x-startX), h=Math.abs(p.y-startY);
      sel.style.left=x+'px'; sel.style.top=y+'px'; sel.style.width=w+'px'; sel.style.height=h+'px';
      rect={x,y,w,h};
    }
    frame.addEventListener('mousedown',start); frame.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
    frame.addEventListener('touchstart',start,{passive:false}); frame.addEventListener('touchmove',move,{passive:false}); window.addEventListener('touchend',end);
    applyBtn.addEventListener('click', ()=>{
      if(!rect) return;
      const scaleX = img.naturalWidth/img.getBoundingClientRect().width;
      const scaleY = img.naturalHeight/img.getBoundingClientRect().height;
      const sx=rect.x*scaleX, sy=rect.y*scaleY, sw=rect.w*scaleX, sh=rect.h*scaleY;
      canvas.width=Math.max(1,Math.round(sw)); canvas.height=Math.max(1,Math.round(sh));
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      dlBtn.disabled=false; hint.textContent='Cropped to '+canvas.width+' × '+canvas.height+' px';
    });
    dlBtn.addEventListener('click', async ()=>{ canvas.toBlob(async blob=>{ const ok=await saveFile('cropped.png', blob); hint.textContent= ok?'Image saved.':'Download did not complete.'; }); });
  }
});

IMAGE_TOOLS.push({
  id:'i05', cat:'image', name:'Color Picker From Image', desc:'Click anywhere on an uploaded image to read that pixel’s color.', keywords:'eyedropper sample pixel hex',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose an image</label><input type="file" id="cpiFile" accept="image/*"></div>
      <p class="hint">Click anywhere on the image to sample its color.</p>
      <div class="img-frame" id="cpiFrame" style="cursor:crosshair;">
        <img id="cpiImg" alt="" style="max-width:100%;display:block;">
      </div>
      <div class="result-box" id="cpiOut" style="margin-top:12px"><span class="muted">Sample a pixel to see its color.</span></div>
    `;
    const fileEl=c.querySelector('#cpiFile'), img=c.querySelector('#cpiImg'), out=c.querySelector('#cpiOut');
    const work=document.createElement('canvas'), wctx=work.getContext('2d',{willReadFrequently:true});
    fileEl.addEventListener('change', ()=>{
      const file=fileEl.files[0]; if(!file) return;
      img.onload=()=>{ work.width=img.naturalWidth; work.height=img.naturalHeight; wctx.drawImage(img,0,0); };
      img.src=URL.createObjectURL(file);
    });
    img.addEventListener('click', e=>{
      if(!img.src) return;
      const r=img.getBoundingClientRect();
      const x=Math.round((e.clientX-r.left)*(img.naturalWidth/r.width));
      const y=Math.round((e.clientY-r.top)*(img.naturalHeight/r.height));
      const [red,green,blue]=wctx.getImageData(x,y,1,1).data;
      const hex=rgbToHex(red,green,blue), hsl=rgbToHsl(red,green,blue);
      out.innerHTML = `<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div class="swatch-chip" style="width:56px;height:56px;background:${hex}"></div>
        <div class="mono" style="font-size:12.5px;line-height:1.8">
          HEX ${esc(hex)}<br>RGB ${red}, ${green}, ${blue}<br>HSL ${hsl.h}, ${hsl.s}%, ${hsl.l}%
        </div></div>`;
    });
  }
});

IMAGE_TOOLS.push({
  id:'i06', cat:'image', name:'Color Converter', desc:'Convert a color between HEX, RGB and HSL — all three stay in sync.', keywords:'hex rgb hsl convert',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>HEX</label><input type="text" id="ccHex" value="#2563EB"></div>
      <div class="form-grid">
        <div class="field"><label>R</label><input type="number" id="ccR" min="0" max="255"></div>
        <div class="field"><label>G</label><input type="number" id="ccG" min="0" max="255"></div>
        <div class="field"><label>B</label><input type="number" id="ccB" min="0" max="255"></div>
      </div>
      <div class="form-grid">
        <div class="field"><label>H</label><input type="number" id="ccH" min="0" max="360"></div>
        <div class="field"><label>S%</label><input type="number" id="ccS" min="0" max="100"></div>
        <div class="field"><label>L%</label><input type="number" id="ccL" min="0" max="100"></div>
      </div>
      <div class="swatch-row"><div class="swatch-chip" id="ccSwatch" style="width:100%;height:64px"></div></div>
    `;
    const $hex=c.querySelector('#ccHex'), $r=c.querySelector('#ccR'), $g=c.querySelector('#ccG'), $b=c.querySelector('#ccB');
    const $h=c.querySelector('#ccH'), $s=c.querySelector('#ccS'), $l=c.querySelector('#ccL'), swatch=c.querySelector('#ccSwatch');
    function fromRgb(r,g,b){
      const hex=rgbToHex(r,g,b), hsl=rgbToHsl(r,g,b);
      $hex.value=hex; $r.value=r; $g.value=g; $b.value=b; $h.value=hsl.h; $s.value=hsl.s; $l.value=hsl.l;
      swatch.style.background=hex;
    }
    $hex.addEventListener('input', ()=>{ const rgb=hexToRgb($hex.value); if(rgb) fromRgb(rgb.r,rgb.g,rgb.b); });
    [$r,$g,$b].forEach(inp=>inp.addEventListener('input', ()=>{ fromRgb(parseInt($r.value)||0, parseInt($g.value)||0, parseInt($b.value)||0); }));
    [$h,$s,$l].forEach(inp=>inp.addEventListener('input', ()=>{ const rgb=hslToRgb(parseFloat($h.value)||0, parseFloat($s.value)||0, parseFloat($l.value)||0); fromRgb(rgb.r,rgb.g,rgb.b); }));
    const rgb0=hexToRgb($hex.value); fromRgb(rgb0.r,rgb0.g,rgb0.b);
  }
});

IMAGE_TOOLS.push({
  id:'i07', cat:'image', name:'Color Palette Generator', desc:'Generate tints, shades and complementary colors from one base color.', keywords:'shades tints scheme complementary',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Base color</label><input type="color" id="pgColor" value="#2563EB"></div>
      <p class="hint" style="margin-top:0">Tints & Shades</p>
      <div class="swatch-row" id="pgTints" style="margin-bottom:16px"></div>
      <p class="hint">Color Scheme</p>
      <div class="swatch-row" id="pgScheme"></div>
    `;
    const $color=c.querySelector('#pgColor'), tints=c.querySelector('#pgTints'), scheme=c.querySelector('#pgScheme');
    function run(){
      const base=hexToRgb($color.value); if(!base) return;
      const hsl=rgbToHsl(base.r,base.g,base.b);
      const tintSwatches=[];
      for(let i=-4;i<=4;i++){
        const l=Math.max(4,Math.min(96, hsl.l + i*11));
        const rgb=hslToRgb(hsl.h,hsl.s,l);
        tintSwatches.push(colorSwatchHtml(rgbToHex(rgb.r,rgb.g,rgb.b)));
      }
      tints.innerHTML = tintSwatches.join('');
      const schemeDefs=[
        {name:'Base', h:hsl.h},{name:'Complementary', h:hsl.h+180},
        {name:'Analogous 1', h:hsl.h+30},{name:'Analogous 2', h:hsl.h-30},
        {name:'Triadic 1', h:hsl.h+120},{name:'Triadic 2', h:hsl.h+240}
      ];
      scheme.innerHTML = schemeDefs.map(d=>{
        const rgb=hslToRgb(d.h,hsl.s,hsl.l);
        return colorSwatchHtml(rgbToHex(rgb.r,rgb.g,rgb.b), d.name);
      }).join('');
    }
    $color.addEventListener('input', run);
    run();
  }
});

IMAGE_TOOLS.push({
  id:'i08', cat:'image', name:'Random Color Generator', desc:'Generate random colors with one click, and keep a history to compare.', keywords:'random hex generator palette',
  mount(c){
    c.innerHTML = `
      <div class="swatch-chip" id="rcMain" style="width:100%;height:96px;margin-bottom:10px"></div>
      <div class="result-box mono" id="rcInfo" style="margin-bottom:12px"></div>
      <div class="actions"><button class="btn primary" id="rcGen" type="button">Generate Random Color</button></div>
      <p class="hint">History</p>
      <div class="swatch-row" id="rcHistory"></div>
    `;
    const main=c.querySelector('#rcMain'), info=c.querySelector('#rcInfo'), history=c.querySelector('#rcHistory');
    const hist=[];
    function gen(){
      const hex = '#'+Array.from({length:6},()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('');
      const rgb=hexToRgb(hex), hsl=rgbToHsl(rgb.r,rgb.g,rgb.b);
      main.style.background=hex;
      info.innerHTML = `HEX ${esc(hex)}<br>RGB ${rgb.r}, ${rgb.g}, ${rgb.b}<br>HSL ${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
      hist.unshift(hex); if(hist.length>12) hist.pop();
      history.innerHTML = hist.map(h=>colorSwatchHtml(h)).join('');
    }
    c.querySelector('#rcGen').addEventListener('click', gen);
    gen();
  }
});

IMAGE_TOOLS.push({
  id:'i09', cat:'image', name:'Image ⇄ Base64', desc:'Convert an image file to a Base64 data URI, or preview a data URI as an image.', keywords:'dataurl encode embed css',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose an image to encode</label><input type="file" id="b64File" accept="image/*"></div>
      <div class="actions" id="b64Acts"></div>
      <div class="field"><label>Base64 data URI</label><textarea class="ta out" id="b64Out" rows="6" readonly placeholder="Data URI will appear here"></textarea></div>
      <hr style="border:none;border-top:1px solid var(--border);margin:16px 0">
      <div class="field"><label>Paste a data URI to preview it</label><textarea class="ta" id="b64In" rows="3" placeholder="data:image/png;base64,…"></textarea></div>
      <div class="img-frame"><img id="b64Preview" alt="" style="max-width:100%;"></div>
    `;
    const fileEl=c.querySelector('#b64File'), out=c.querySelector('#b64Out'), $in=c.querySelector('#b64In'), preview=c.querySelector('#b64Preview');
    fileEl.addEventListener('change', ()=>{
      const file=fileEl.files[0]; if(!file) return;
      const reader=new FileReader();
      reader.onload = ()=>{ out.value = reader.result; };
      reader.readAsDataURL(file);
    });
    c.querySelector('#b64Acts').appendChild(copyBtn(()=>out.value));
    $in.addEventListener('input', ()=>{ preview.src = $in.value.trim(); });
  }
});

IMAGE_TOOLS.push({
  id:'i10', cat:'image', name:'Image Filters', desc:'Apply grayscale, sepia or color-inversion filters to an image.', keywords:'grayscale sepia invert effect',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', autoRun:true, filePrefix:'filtered',
      controls:[{key:'filter', label:'Filter', type:'select', options:[{v:'gray',l:'Grayscale'},{v:'sepia',l:'Sepia'},{v:'invert',l:'Invert'},{v:'none',l:'None'}]}],
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0);
        if(vals.filter==='none') return;
        const data=ctx.getImageData(0,0,canvas.width,canvas.height);
        const d=data.data;
        for(let i=0;i<d.length;i+=4){
          const r=d[i],g=d[i+1],b=d[i+2];
          if(vals.filter==='gray'){ const v=0.299*r+0.587*g+0.114*b; d[i]=d[i+1]=d[i+2]=v; }
          else if(vals.filter==='sepia'){ d[i]=Math.min(255,r*0.393+g*0.769+b*0.189); d[i+1]=Math.min(255,r*0.349+g*0.686+b*0.168); d[i+2]=Math.min(255,r*0.272+g*0.534+b*0.131); }
          else if(vals.filter==='invert'){ d[i]=255-r; d[i+1]=255-g; d[i+2]=255-b; }
        }
        ctx.putImageData(data,0,0);
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i11', cat:'image', name:'Image Rotator', desc:'Rotate an image by 90°, 180° or 270°.', keywords:'rotate turn orientation',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', autoRun:true, filePrefix:'rotated',
      controls:[{key:'deg', label:'Rotation', type:'select', options:[{v:'0',l:'0°'},{v:'90',l:'90°'},{v:'180',l:'180°'},{v:'270',l:'270°'}]}],
      run(ctx,canvas,img,vals){
        const deg=parseInt(vals.deg,10);
        const w=img.naturalWidth, h=img.naturalHeight;
        canvas.width = (deg===90||deg===270) ? h : w;
        canvas.height = (deg===90||deg===270) ? w : h;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(deg*Math.PI/180);
        ctx.drawImage(img, -w/2, -h/2);
        ctx.restore();
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i12', cat:'image', name:'Image Flipper', desc:'Mirror an image horizontally or vertically.', keywords:'mirror flip reflect',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', autoRun:true, filePrefix:'flipped',
      controls:[{key:'dir', label:'Direction', type:'select', options:[{v:'h',l:'Horizontal'},{v:'v',l:'Vertical'}]}],
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.save();
        if(vals.dir==='h'){ ctx.translate(canvas.width,0); ctx.scale(-1,1); } else { ctx.translate(0,canvas.height); ctx.scale(1,-1); }
        ctx.drawImage(img,0,0);
        ctx.restore();
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i13', cat:'image', name:'Favicon Generator', desc:'Turn any image into 16×16, 32×32 and 180×180 favicon PNGs.', keywords:'favicon icon site',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a square-ish image</label><input type="file" id="fvFile" accept="image/*"></div>
      <div class="img-row" style="grid-template-columns:repeat(3,1fr)">
        <div class="img-box"><span class="img-cap">16 × 16</span><div class="img-frame"><canvas id="fv16" width="16" height="16"></canvas></div><button class="btn ghost small" id="fvDl16" type="button" disabled>Download</button></div>
        <div class="img-box"><span class="img-cap">32 × 32</span><div class="img-frame"><canvas id="fv32" width="32" height="32"></canvas></div><button class="btn ghost small" id="fvDl32" type="button" disabled>Download</button></div>
        <div class="img-box"><span class="img-cap">180 × 180</span><div class="img-frame"><canvas id="fv180" width="180" height="180"></canvas></div><button class="btn ghost small" id="fvDl180" type="button" disabled>Download</button></div>
      </div>
      <p class="hint" id="fvHint">Choose an image to begin.</p>
    `;
    const fileEl=c.querySelector('#fvFile'), hint=c.querySelector('#fvHint');
    [16,32,180].forEach(size=>{
      const canvas=c.querySelector('#fv'+size), dlBtn=c.querySelector('#fvDl'+size);
      fileEl.addEventListener('change', ()=>{
        const file=fileEl.files[0]; if(!file) return;
        const img=new Image();
        img.onload=()=>{
          const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,size,size);
          const side=Math.min(img.naturalWidth,img.naturalHeight);
          const sx=(img.naturalWidth-side)/2, sy=(img.naturalHeight-side)/2;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
          dlBtn.disabled=false; hint.textContent='Favicons ready.';
        };
        img.src=URL.createObjectURL(file);
      });
      dlBtn.addEventListener('click', async ()=>{ canvas.toBlob(async blob=>{ const ok=await saveFile('favicon-'+size+'.png', blob); hint.textContent= ok?'Saved.':'Download did not complete.'; }); });
    });
  }
});

IMAGE_TOOLS.push({
  id:'i14', cat:'image', name:'Image Watermark Tool', desc:'Stamp a custom text watermark onto an image.', keywords:'watermark text overlay stamp',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', autoRun:true, filePrefix:'watermarked',
      controls:[
        {key:'text', label:'Watermark text', type:'text', default:'© Toolkit Pro'},
        {key:'position', label:'Position', type:'select', options:[{v:'br',l:'Bottom Right'},{v:'bl',l:'Bottom Left'},{v:'tr',l:'Top Right'},{v:'tl',l:'Top Left'},{v:'cc',l:'Center'}]},
        {key:'size', label:'Font size (px)', type:'number', default:28, min:8},
        {key:'opacity', label:'Opacity', type:'range', min:0.1, max:1, step:0.05, default:0.6}
      ],
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0);
        const size=vals.size||28;
        ctx.font = size+'px "IBM Plex Sans", sans-serif';
        ctx.fillStyle = `rgba(255,255,255,${vals.opacity})`;
        ctx.strokeStyle = `rgba(0,0,0,${vals.opacity*0.6})`;
        ctx.lineWidth = Math.max(1, size/16);
        const text = vals.text || '';
        const metrics = ctx.measureText(text);
        const pad = size*0.6;
        let x,y;
        if(vals.position==='br'){ x=canvas.width-metrics.width-pad; y=canvas.height-pad; }
        else if(vals.position==='bl'){ x=pad; y=canvas.height-pad; }
        else if(vals.position==='tr'){ x=canvas.width-metrics.width-pad; y=pad+size; }
        else if(vals.position==='tl'){ x=pad; y=pad+size; }
        else { x=(canvas.width-metrics.width)/2; y=(canvas.height+size)/2; }
        ctx.strokeText(text,x,y); ctx.fillText(text,x,y);
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i15', cat:'image', name:'Dominant Color Palette Extractor', desc:'Pull the most common colors out of an uploaded image.', keywords:'palette dominant colors histogram',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose an image</label><input type="file" id="dcFile" accept="image/*"></div>
      <div class="img-frame" style="margin-bottom:12px"><img id="dcImg" alt="" style="max-width:100%;max-height:220px;"></div>
      <p class="hint" id="dcHint">Choose an image to begin.</p>
      <div class="swatch-row" id="dcOut"></div>
    `;
    const fileEl=c.querySelector('#dcFile'), img=c.querySelector('#dcImg'), out=c.querySelector('#dcOut'), hint=c.querySelector('#dcHint');
    const work=document.createElement('canvas'), wctx=work.getContext('2d',{willReadFrequently:true});
    fileEl.addEventListener('change', ()=>{
      const file=fileEl.files[0]; if(!file) return;
      img.onload=()=>{
        const scale=Math.min(1, 120/Math.max(img.naturalWidth,img.naturalHeight));
        work.width=Math.max(1,Math.round(img.naturalWidth*scale)); work.height=Math.max(1,Math.round(img.naturalHeight*scale));
        wctx.drawImage(img,0,0,work.width,work.height);
        const data=wctx.getImageData(0,0,work.width,work.height).data;
        const buckets={};
        for(let i=0;i<data.length;i+=4){
          const r=Math.round(data[i]/32)*32, g=Math.round(data[i+1]/32)*32, b=Math.round(data[i+2]/32)*32;
          const key=r+','+g+','+b;
          buckets[key]=(buckets[key]||0)+1;
        }
        const top=Object.entries(buckets).sort((a,b)=>b[1]-a[1]).slice(0,8);
        out.innerHTML = top.map(([key])=>{ const [r,g,b]=key.split(',').map(Number); return colorSwatchHtml(rgbToHex(r,g,b)); }).join('');
        hint.textContent = img.naturalWidth+' × '+img.naturalHeight+' px — top colors below';
      };
      img.src=URL.createObjectURL(file);
    });
  }
});

IMAGE_TOOLS.push({
  id:'i16', cat:'image', name:'ASCII Art Generator', desc:'Turn a photo into text-based ASCII art you can copy anywhere.', keywords:'ascii text art retro',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose an image</label><input type="file" id="asFile" accept="image/*"></div>
      <div class="field"><label>Output width (characters)</label><input type="number" id="asW" value="90" min="20" max="220"></div>
      <div class="actions" id="asActs"></div>
      <textarea class="ta out mono" id="asOut" rows="16" readonly style="font-size:6px;line-height:6px;white-space:pre;"></textarea>
    `;
    const fileEl=c.querySelector('#asFile'), $w=c.querySelector('#asW'), out=c.querySelector('#asOut');
    const RAMP = '@%#*+=-:. ';
    const work=document.createElement('canvas'), wctx=work.getContext('2d',{willReadFrequently:true});
    let currentImg=null;
    function render(){
      if(!currentImg) return;
      const w=Math.max(20,Math.min(220,parseInt($w.value,10)||90));
      const h=Math.max(1, Math.round(w * (currentImg.naturalHeight/currentImg.naturalWidth) * 0.5));
      work.width=w; work.height=h;
      wctx.drawImage(currentImg,0,0,w,h);
      const data=wctx.getImageData(0,0,w,h).data;
      let lines=[];
      for(let y=0;y<h;y++){
        let line='';
        for(let x=0;x<w;x++){
          const i=(y*w+x)*4;
          const bright = (0.299*data[i]+0.587*data[i+1]+0.114*data[i+2])/255;
          line += RAMP[Math.min(RAMP.length-1, Math.floor((1-bright)*RAMP.length))];
        }
        lines.push(line);
      }
      out.value = lines.join('\n');
    }
    fileEl.addEventListener('change', ()=>{
      const file=fileEl.files[0]; if(!file) return;
      const img=new Image(); img.onload=()=>{ currentImg=img; render(); }; img.src=URL.createObjectURL(file);
    });
    $w.addEventListener('input', render);
    c.querySelector('#asActs').appendChild(copyBtn(()=>out.value));
  }
});

IMAGE_TOOLS.push({
  id:'i17', cat:'image', name:'CSS Gradient Generator', desc:'Design a linear or radial gradient and copy the ready-to-use CSS.', keywords:'linear radial background css',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Type</label><select id="grType"><option value="linear">Linear</option><option value="radial">Radial</option></select></div>
        <div class="field"><label>Angle (linear)</label><input type="number" id="grAngle" value="90" min="0" max="360"></div>
        <div class="field"><label>Color 1</label><input type="color" id="grC1" value="#2563EB"></div>
        <div class="field"><label>Color 2</label><input type="color" id="grC2" value="#2C7A76"></div>
      </div>
      <div class="img-frame" id="grPreview" style="height:120px;margin-bottom:12px"></div>
      <div class="actions" id="grActs"></div>
      <textarea class="ta out" id="grOut" rows="3" readonly></textarea>
    `;
    const $type=c.querySelector('#grType'), $angle=c.querySelector('#grAngle'), $c1=c.querySelector('#grC1'), $c2=c.querySelector('#grC2');
    const preview=c.querySelector('#grPreview'), out=c.querySelector('#grOut');
    function run(){
      const css = $type.value==='linear'
        ? `linear-gradient(${parseInt($angle.value,10)||0}deg, ${$c1.value}, ${$c2.value})`
        : `radial-gradient(circle, ${$c1.value}, ${$c2.value})`;
      preview.style.background = css;
      out.value = `background: ${css};`;
    }
    [$type,$angle,$c1,$c2].forEach(e=>e.addEventListener('input',run));
    c.querySelector('#grActs').appendChild(copyBtn(()=>out.value));
    run();
  }
});

IMAGE_TOOLS.push({
  id:'i18', cat:'image', name:'Box Shadow Generator', desc:'Build a CSS box-shadow visually and copy the code.', keywords:'shadow depth css elevation',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Offset X</label><input type="number" id="bsX" value="0"></div>
        <div class="field"><label>Offset Y</label><input type="number" id="bsY" value="8"></div>
        <div class="field"><label>Blur</label><input type="number" id="bsBlur" value="24" min="0"></div>
        <div class="field"><label>Spread</label><input type="number" id="bsSpread" value="0"></div>
        <div class="field"><label>Color</label><input type="color" id="bsColor" value="#000000"></div>
        <div class="field"><label>Opacity</label><input type="range" id="bsOpacity" min="0" max="1" step="0.05" value="0.25"></div>
      </div>
      <div class="field"><label class="chk"><input type="checkbox" id="bsInset"> Inset</label></div>
      <div class="img-frame" style="height:140px;background:var(--surface);margin-bottom:12px">
        <div style="width:100px;height:70px;background:var(--surface);border-radius:10px" id="bsBox"></div>
      </div>
      <div class="actions" id="bsActs"></div>
      <textarea class="ta out" id="bsOut" rows="2" readonly></textarea>
    `;
    const ids=['bsX','bsY','bsBlur','bsSpread','bsColor','bsOpacity','bsInset'];
    const inp={}; ids.forEach(id=>inp[id]=c.querySelector('#'+id));
    const box=c.querySelector('#bsBox'), out=c.querySelector('#bsOut');
    function run(){
      const rgb=hexToRgb(inp.bsColor.value);
      const rgba=`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${inp.bsOpacity.value})`;
      const css=`${inp.bsInset.checked?'inset ':''}${inp.bsX.value}px ${inp.bsY.value}px ${inp.bsBlur.value}px ${inp.bsSpread.value}px ${rgba}`;
      box.style.boxShadow=css;
      out.value = `box-shadow: ${css};`;
    }
    ids.forEach(id=>inp[id].addEventListener('input',run));
    c.querySelector('#bsActs').appendChild(copyBtn(()=>out.value));
    run();
  }
});

IMAGE_TOOLS.push({
  id:'i19', cat:'image', name:'Border Radius Generator', desc:'Fine-tune each corner’s roundness and copy the CSS.', keywords:'rounded corners radius css',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Top Left</label><input type="number" id="brTL" value="24" min="0"></div>
        <div class="field"><label>Top Right</label><input type="number" id="brTR" value="24" min="0"></div>
        <div class="field"><label>Bottom Right</label><input type="number" id="brBR" value="24" min="0"></div>
        <div class="field"><label>Bottom Left</label><input type="number" id="brBL" value="24" min="0"></div>
      </div>
      <div class="img-frame" style="height:140px;margin-bottom:12px">
        <div id="brBox" style="width:140px;height:100px;background:var(--accent-soft);border:2px solid var(--accent)"></div>
      </div>
      <div class="actions" id="brActs"></div>
      <textarea class="ta out" id="brOut" rows="2" readonly></textarea>
    `;
    const ids=['brTL','brTR','brBR','brBL']; const inp={}; ids.forEach(id=>inp[id]=c.querySelector('#'+id));
    const box=c.querySelector('#brBox'), out=c.querySelector('#brOut');
    function run(){
      const css = `${inp.brTL.value}px ${inp.brTR.value}px ${inp.brBR.value}px ${inp.brBL.value}px`;
      box.style.borderRadius = css;
      out.value = `border-radius: ${css};`;
    }
    ids.forEach(id=>inp[id].addEventListener('input',run));
    c.querySelector('#brActs').appendChild(copyBtn(()=>out.value));
    run();
  }
});

IMAGE_TOOLS.push({
  id:'i20', cat:'image', name:'Color Contrast Checker', desc:'Check foreground/background contrast against WCAG AA and AAA.', keywords:'wcag accessibility a11y ratio',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Text color</label><input type="color" id="ctFg" value="#101828"></div>
        <div class="field"><label>Background color</label><input type="color" id="ctBg" value="#F4F7FC"></div>
      </div>
      <div class="img-frame" id="ctPreview" style="height:110px;flex-direction:column;gap:2px;">
        <span style="font-size:22px;font-weight:700">Aa Sample Text</span>
        <span style="font-size:13px">The quick brown fox jumps over the lazy dog.</span>
      </div>
      <div class="result-box" id="ctOut" style="margin-top:12px"></div>
    `;
    const $fg=c.querySelector('#ctFg'), $bg=c.querySelector('#ctBg'), preview=c.querySelector('#ctPreview'), out=c.querySelector('#ctOut');
    function badge(pass){ return `<span class="mono" style="color:${pass?'var(--success)':'var(--danger)'}">${pass?'PASS':'FAIL'}</span>`; }
    function run(){
      preview.style.background=$bg.value; preview.style.color=$fg.value;
      const ratio = contrastRatio($fg.value,$bg.value);
      out.innerHTML = `<div class="result-big">${ratio.toFixed(2)}:1</div>
        <table class="data-table" style="margin-top:8px">
          <tr><td>Normal text — AA (4.5:1)</td><td>${badge(ratio>=4.5)}</td></tr>
          <tr><td>Normal text — AAA (7:1)</td><td>${badge(ratio>=7)}</td></tr>
          <tr><td>Large text — AA (3:1)</td><td>${badge(ratio>=3)}</td></tr>
          <tr><td>Large text — AAA (4.5:1)</td><td>${badge(ratio>=4.5)}</td></tr>
        </table>`;
    }
    [$fg,$bg].forEach(e=>e.addEventListener('input',run));
    run();
  }
});

IMAGE_TOOLS.push({
  id:'i21', cat:'image', name:'Image Adjuster', desc:'Tune brightness, contrast, saturation and blur, then export the result.', keywords:'brightness contrast saturation blur edit',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', autoRun:true, filePrefix:'adjusted',
      controls:[
        {key:'brightness', label:'Brightness %', type:'range', min:0, max:200, step:1, default:100},
        {key:'contrast', label:'Contrast %', type:'range', min:0, max:200, step:1, default:100},
        {key:'saturate', label:'Saturation %', type:'range', min:0, max:200, step:1, default:100},
        {key:'blur', label:'Blur (px)', type:'range', min:0, max:12, step:0.5, default:0}
      ],
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        ctx.filter = `brightness(${vals.brightness}%) contrast(${vals.contrast}%) saturate(${vals.saturate}%) blur(${vals.blur}px)`;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0);
        ctx.filter='none';
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i22', cat:'image', name:'SVG to PNG Converter', desc:'Paste SVG markup and export it as a PNG at any size.', keywords:'vector raster export',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>SVG markup</label><textarea class="ta mono" id="svIn" rows="8" placeholder="&lt;svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'&gt;&lt;circle cx='50' cy='50' r='40' fill='#2563EB'/&gt;&lt;/svg&gt;"></textarea></div>
      <div class="form-grid">
        <div class="field"><label>Output width (px)</label><input type="number" id="svW" value="512" min="16"></div>
        <div class="field"><label>Output height (px)</label><input type="number" id="svH" value="512" min="16"></div>
      </div>
      <div class="img-frame"><canvas id="svCanvas"></canvas></div>
      <div class="actions" style="margin-top:10px">
        <button class="btn primary" id="svRun" type="button">Render</button>
        <button class="btn ghost" id="svDownload" type="button" disabled>Download PNG</button>
      </div>
      <p class="hint" id="svHint">Paste SVG markup above, then render.</p>
    `;
    const $svg=c.querySelector('#svIn'), $w=c.querySelector('#svW'), $h=c.querySelector('#svH');
    const canvas=c.querySelector('#svCanvas'), ctx=canvas.getContext('2d'), dlBtn=c.querySelector('#svDownload'), hint=c.querySelector('#svHint');
    c.querySelector('#svRun').addEventListener('click', ()=>{
      const w=Math.max(16,parseInt($w.value,10)||512), h=Math.max(16,parseInt($h.value,10)||512);
      const blob = new Blob([$svg.value], {type:'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = ()=>{
        canvas.width=w; canvas.height=h; ctx.clearRect(0,0,w,h); ctx.drawImage(img,0,0,w,h);
        URL.revokeObjectURL(url); dlBtn.disabled=false; hint.textContent='Rendered at '+w+' × '+h+' px';
      };
      img.onerror = ()=>{ hint.textContent='Could not parse that SVG markup.'; };
      img.src = url;
    });
    dlBtn.addEventListener('click', async ()=>{ canvas.toBlob(async blob=>{ const ok=await saveFile('rendered.png', blob); hint.textContent= ok?'Image saved.':'Download did not complete.'; }); });
  }
});

IMAGE_TOOLS.push({
  id:'i23', cat:'image', name:'Image Dimensions & File Size Inspector', desc:'Check an image’s exact pixel size, aspect ratio, file size and type.', keywords:'metadata info dimensions inspect',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose an image</label><input type="file" id="diFile" accept="image/*"></div>
      <div class="img-frame" style="margin-bottom:12px"><img id="diImg" alt="" style="max-width:100%;max-height:220px;"></div>
      <div class="stat-grid" id="diOut"></div>
    `;
    const fileEl=c.querySelector('#diFile'), img=c.querySelector('#diImg'), out=c.querySelector('#diOut');
    function gcd(a,b){ return b===0?a:gcd(b,a%b); }
    fileEl.addEventListener('change', ()=>{
      const file=fileEl.files[0]; if(!file) return;
      img.onload=()=>{
        const w=img.naturalWidth, h=img.naturalHeight, g=gcd(w,h)||1;
        const kb = (file.size/1024).toFixed(1);
        out.innerHTML = [
          {v:w+'×'+h,l:'Dimensions'}, {v:(w/g)+':'+(h/g),l:'Aspect Ratio'},
          {v:kb+' KB',l:'File Size'}, {v:(file.type||'—').split('/')[1]||file.type,l:'Type'}
        ].map(s=>`<div class="stat"><span class="stat-val" style="font-size:16px">${esc(String(s.v))}</span><span class="stat-lbl">${esc(s.l)}</span></div>`).join('');
      };
      img.src=URL.createObjectURL(file);
    });
  }
});

IMAGE_TOOLS.push({
  id:'i24', cat:'image', name:'Placeholder Image Generator', desc:'Create a solid-color placeholder image with custom text and size.', keywords:'placeholder mock dummy image size',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Width</label><input type="number" id="phW" value="600" min="16"></div>
        <div class="field"><label>Height</label><input type="number" id="phH" value="400" min="16"></div>
        <div class="field"><label>Background</label><input type="color" id="phBg" value="#E1E9F7"></div>
        <div class="field"><label>Text color</label><input type="color" id="phFg" value="#5B6472"></div>
      </div>
      <div class="field"><label>Label</label><input type="text" id="phText" value="600 × 400"></div>
      <div class="img-frame"><canvas id="phCanvas"></canvas></div>
      <div class="actions" style="margin-top:10px"><button class="btn ghost" id="phDownload" type="button">Download PNG</button></div>
    `;
    const ids=['phW','phH','phBg','phFg','phText']; const inp={}; ids.forEach(id=>inp[id]=c.querySelector('#'+id));
    const canvas=c.querySelector('#phCanvas'), ctx=canvas.getContext('2d');
    function run(){
      const w=Math.max(16,parseInt(inp.phW.value,10)||600), h=Math.max(16,parseInt(inp.phH.value,10)||400);
      canvas.width=w; canvas.height=h;
      ctx.fillStyle=inp.phBg.value; ctx.fillRect(0,0,w,h);
      ctx.fillStyle=inp.phFg.value; ctx.font=`600 ${Math.max(12,Math.round(Math.min(w,h)/9))}px "IBM Plex Sans", sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(inp.phText.value || (w+' × '+h), w/2, h/2);
    }
    ids.forEach(id=>inp[id].addEventListener('input',run));
    c.querySelector('#phDownload').addEventListener('click', async ()=>{ canvas.toBlob(async blob=>{ await saveFile('placeholder.png', blob); }); });
    run();
  }
});

IMAGE_TOOLS.push({
  id:'i25', cat:'image', name:'Color Blindness Simulator', desc:'Preview how an image looks under protanopia, deuteranopia or tritanopia.', keywords:'accessibility colorblind daltonize simulate',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', autoRun:true, filePrefix:'colorblind-sim',
      controls:[{key:'type', label:'Simulate', type:'select', options:[{v:'protanopia',l:'Protanopia (red-weak)'},{v:'deuteranopia',l:'Deuteranopia (green-weak)'},{v:'tritanopia',l:'Tritanopia (blue-weak)'}]}],
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0);
        const M = {
          protanopia:   [0.567,0.433,0, 0.558,0.442,0, 0,0.242,0.758],
          deuteranopia: [0.625,0.375,0, 0.7,0.3,0,     0,0.3,0.7],
          tritanopia:   [0.95,0.05,0,   0,0.433,0.567, 0,0.475,0.525]
        }[vals.type];
        const data=ctx.getImageData(0,0,canvas.width,canvas.height); const d=data.data;
        for(let i=0;i<d.length;i+=4){
          const r=d[i],g=d[i+1],b=d[i+2];
          d[i]  = r*M[0]+g*M[1]+b*M[2];
          d[i+1]= r*M[3]+g*M[4]+b*M[5];
          d[i+2]= r*M[6]+g*M[7]+b*M[8];
        }
        ctx.putImageData(data,0,0);
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i26', cat:'image', name:'Image Background Color Remover', desc:'Make a solid-color background transparent — great for logos and product photos with a plain white or green background.', keywords:'background remove transparent chroma key png',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', buttonLabel:'Remove Background', filePrefix:'transparent-bg', downloadExt:'png', autoRun:true,
      controls:[
        {key:'color', label:'Background color', type:'color', default:'#ffffff'},
        {key:'tolerance', label:'Tolerance', type:'range', min:0, max:150, step:5, default:40}
      ],
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0);
        const target = hexToRgb(vals.color) || {r:255,g:255,b:255};
        const data = ctx.getImageData(0,0,canvas.width,canvas.height);
        const px = data.data, tol = vals.tolerance;
        for(let i=0;i<px.length;i+=4){
          const dr=px[i]-target.r, dg=px[i+1]-target.g, db=px[i+2]-target.b;
          const dist = Math.sqrt(dr*dr+dg*dg+db*db);
          if(dist <= tol) px[i+3]=0;
        }
        ctx.putImageData(data,0,0);
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i27', cat:'image', name:'Image Collage Maker', desc:'Combine two or four photos into a single grid collage you can download as one image.', keywords:'collage grid combine multiple photos layout',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Layout</label><select id="colLayout">
          <option value="2h">2 photos — side by side</option>
          <option value="2v">2 photos — stacked</option>
          <option value="4">4 photos — grid</option>
        </select></div>
        <div class="field"><label>Gap (px)</label><input type="number" id="colGap" min="0" max="40" value="8"></div>
      </div>
      <div class="form-grid" id="colFiles"></div>
      <div class="img-box"><span class="img-cap">Collage</span><div class="img-frame"><canvas id="colCanvas"></canvas></div></div>
      <div class="actions">
        <button class="btn primary" id="colRun" type="button">Create Collage</button>
        <button class="btn ghost" id="colDownload" type="button" disabled>Download PNG</button>
      </div>
      <p class="hint" id="colHint">Choose your photos, then create the collage.</p>
    `;
    const $layout=c.querySelector('#colLayout'), $gap=c.querySelector('#colGap'), filesWrap=c.querySelector('#colFiles');
    const canvas=c.querySelector('#colCanvas'), ctx=canvas.getContext('2d'), dlBtn=c.querySelector('#colDownload'), hint=c.querySelector('#colHint');
    const imgs=[null,null,null,null];
    function renderFileInputs(){
      const n = $layout.value==='4' ? 4 : 2;
      filesWrap.innerHTML = Array.from({length:n},(_,i)=>`<div class="field"><label>Photo ${i+1}</label><input type="file" accept="image/*" data-idx="${i}" class="colFile"></div>`).join('');
      filesWrap.querySelectorAll('.colFile').forEach(inp=>{
        inp.addEventListener('change', ()=>{
          const idx=+inp.dataset.idx, file=inp.files[0]; if(!file) return;
          const im=new Image();
          im.onload=()=>{ imgs[idx]=im; };
          im.src=URL.createObjectURL(file);
        });
      });
    }
    $layout.addEventListener('change', renderFileInputs);
    renderFileInputs();
    c.querySelector('#colRun').addEventListener('click', ()=>{
      const n = $layout.value==='4' ? 4 : 2;
      const chosen = imgs.slice(0,n);
      if(chosen.some(im=>!im)){ hint.textContent='Choose all '+n+' photos first.'; return; }
      const gap = Math.max(0, parseInt($gap.value,10)||0);
      const cellW=400, cellH=300;
      let cols,rows;
      if($layout.value==='2h'){ cols=2; rows=1; }
      else if($layout.value==='2v'){ cols=1; rows=2; }
      else { cols=2; rows=2; }
      canvas.width = cols*cellW + (cols-1)*gap;
      canvas.height = rows*cellH + (rows-1)*gap;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      chosen.forEach((im,i)=>{
        const col=i%cols, row=Math.floor(i/cols);
        const x=col*(cellW+gap), y=row*(cellH+gap);
        const scale = Math.max(cellW/im.naturalWidth, cellH/im.naturalHeight);
        const w=im.naturalWidth*scale, h=im.naturalHeight*scale;
        ctx.save();
        ctx.beginPath(); ctx.rect(x,y,cellW,cellH); ctx.clip();
        ctx.drawImage(im, x+(cellW-w)/2, y+(cellH-h)/2, w, h);
        ctx.restore();
      });
      dlBtn.disabled=false; hint.textContent='Collage created — '+canvas.width+' × '+canvas.height+' px';
    });
    dlBtn.addEventListener('click', async ()=>{
      canvas.toBlob(async blob=>{ const ok=await saveFile('collage.png', blob); hint.textContent = ok?'Image saved.':'Download did not complete.'; }, 'image/png');
    });
  }
});

IMAGE_TOOLS.push({
  id:'i28', cat:'image', name:'Meme Generator', desc:'Add bold top and bottom captions to any image, classic meme-style.', keywords:'meme caption text image funny',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', buttonLabel:'Add Captions', filePrefix:'meme', downloadExt:'png', autoRun:true,
      controls:[
        {key:'top', label:'Top text', type:'text', default:'TOP TEXT'},
        {key:'bottom', label:'Bottom text', type:'text', default:'BOTTOM TEXT'},
        {key:'size', label:'Font size', type:'range', min:16, max:72, step:2, default:36}
      ],
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0);
        const size=vals.size;
        ctx.font = `bold ${size}px Impact, Arial, sans-serif`;
        ctx.textAlign='center'; ctx.lineWidth=size/12; ctx.strokeStyle='#000'; ctx.fillStyle='#fff';
        function wrap(text){
          const words=text.toUpperCase().split(' ');
          const maxW=canvas.width*0.92;
          const lines=[]; let cur='';
          words.forEach(w=>{
            const test=cur?cur+' '+w:w;
            if(ctx.measureText(test).width>maxW && cur){ lines.push(cur); cur=w; } else cur=test;
          });
          if(cur) lines.push(cur);
          return lines;
        }
        function drawLines(lines,startY){
          lines.forEach((line,i)=>{
            const ly = startY + i*(size*1.1);
            ctx.strokeText(line, canvas.width/2, ly);
            ctx.fillText(line, canvas.width/2, ly);
          });
        }
        if(vals.top){ drawLines(wrap(vals.top), size+10); }
        if(vals.bottom){
          const lines=wrap(vals.bottom);
          drawLines(lines, canvas.height - size*1.1*(lines.length-1) - 16);
        }
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i29', cat:'image', name:'Image Pixelator', desc:'Apply a blocky mosaic / pixelate effect to an image, with adjustable block size.', keywords:'pixelate mosaic blocky retro effect',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', buttonLabel:'Pixelate', filePrefix:'pixelated', downloadExt:'png', autoRun:true,
      controls:[{key:'block', label:'Block size (px)', type:'range', min:2, max:60, step:2, default:12}],
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        const block=Math.max(2, Math.round(vals.block));
        const w=canvas.width, h=canvas.height;
        const small=document.createElement('canvas');
        small.width=Math.max(1, Math.round(w/block)); small.height=Math.max(1, Math.round(h/block));
        const sctx=small.getContext('2d');
        sctx.drawImage(img, 0,0, small.width, small.height);
        ctx.imageSmoothingEnabled=false;
        ctx.clearRect(0,0,w,h);
        ctx.drawImage(small, 0,0, small.width, small.height, 0,0, w, h);
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i30', cat:'image', name:'Image Border / Frame Adder', desc:'Add a solid-color border or frame around an image, with adjustable width and color.', keywords:'border frame padding photo edge',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', buttonLabel:'Add Border', filePrefix:'framed', downloadExt:'png', autoRun:true,
      controls:[
        {key:'width', label:'Border width (px)', type:'range', min:2, max:100, step:2, default:20},
        {key:'color', label:'Border color', type:'color', default:'#0B1220'}
      ],
      run(ctx,canvas,img,vals){
        const bw=Math.max(0, Math.round(vals.width));
        canvas.width=img.naturalWidth + bw*2; canvas.height=img.naturalHeight + bw*2;
        ctx.fillStyle=vals.color;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img, bw, bw);
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i31', cat:'image', name:'Image Rounded Corners Generator', desc:'Round the corners of an image and export it as a transparent PNG.', keywords:'rounded corners radius transparent png',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', buttonLabel:'Round Corners', filePrefix:'rounded', downloadExt:'png', autoRun:true,
      controls:[{key:'radius', label:'Corner radius (px)', type:'range', min:0, max:150, step:2, default:30}],
      run(ctx,canvas,img,vals){
        canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
        const w=canvas.width, h=canvas.height;
        const r=Math.min(vals.radius, w/2, h/2);
        ctx.clearRect(0,0,w,h);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(r,0); ctx.arcTo(w,0,w,h,r); ctx.arcTo(w,h,0,h,r); ctx.arcTo(0,h,0,0,r); ctx.arcTo(0,0,w,0,r);
        ctx.closePath(); ctx.clip();
        ctx.drawImage(img,0,0);
        ctx.restore();
      }
    });
  }
});

IMAGE_TOOLS.push({
  id:'i32', cat:'image', name:'Image Upscaler', desc:'Enlarge an image by 2×, 3× or 4×, with a choice of smooth or pixel-sharp scaling.', keywords:'upscale enlarge bigger resize resolution scale up',
  mount(c){
    imageWorkspace(c, {
      label:'Choose an image', buttonLabel:'Upscale', filePrefix:'upscaled', downloadExt:'png', autoRun:true,
      controls:[
        {key:'scale', label:'Scale factor', type:'select', options:[{v:'2',l:'2× (double size)'},{v:'3',l:'3×'},{v:'4',l:'4×'}], default:'2'},
        {key:'smooth', label:'Scaling style', type:'select', options:[{v:'smooth',l:'Smooth (interpolated)'},{v:'sharp',l:'Sharp (pixel edges kept crisp)'}], default:'smooth'}
      ],
      run(ctx,canvas,img,vals){
        let w = img.naturalWidth*(parseInt(vals.scale,10)||2), h = img.naturalHeight*(parseInt(vals.scale,10)||2);
        const MAX_PIXELS = 40000000; // safety cap so very large photos don't lock up the browser
        if(w*h > MAX_PIXELS){
          const factor = Math.sqrt(MAX_PIXELS/(w*h));
          w = Math.max(1, Math.round(w*factor));
          h = Math.max(1, Math.round(h*factor));
        }
        canvas.width=w; canvas.height=h;
        ctx.imageSmoothingEnabled = vals.smooth==='smooth';
        if(ctx.imageSmoothingEnabled) ctx.imageSmoothingQuality='high';
        ctx.clearRect(0,0,w,h);
        ctx.drawImage(img,0,0,w,h);
      }
    });
  }
});

/* ===== IMAGE_TOOLS_MARKER ===== */
const UNITS_LENGTH = {m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, yd:0.9144, ft:0.3048, in:0.0254};
CALC_TOOLS.push({
  id:'c01', cat:'calc', name:'Length Converter', desc:'Convert between metres, kilometres, feet, miles and more.', keywords:'unit distance meter feet mile',
  mount(c){
    formTool(c, {
      fields:[
        {key:'value', label:'Value', type:'number', default:1, step:'any'},
        {key:'from', label:'From', type:'select', default:'m', options:[{v:'m',l:'Metres'},{v:'km',l:'Kilometres'},{v:'cm',l:'Centimetres'},{v:'mm',l:'Millimetres'},{v:'mi',l:'Miles'},{v:'yd',l:'Yards'},{v:'ft',l:'Feet'},{v:'in',l:'Inches'}]},
        {key:'to', label:'To', type:'select', default:'ft', options:[{v:'m',l:'Metres'},{v:'km',l:'Kilometres'},{v:'cm',l:'Centimetres'},{v:'mm',l:'Millimetres'},{v:'mi',l:'Miles'},{v:'yd',l:'Yards'},{v:'ft',l:'Feet'},{v:'in',l:'Inches'}]}
      ],
      compute(v){ const r = v.value*UNITS_LENGTH[v.from]/UNITS_LENGTH[v.to]; return `<div class="result-big">${r.toLocaleString(undefined,{maximumFractionDigits:6})}</div>`; }
    });
  }
});

const UNITS_WEIGHT = {kg:1, g:0.001, mg:0.000001, lb:0.453592, oz:0.0283495, t:1000};
CALC_TOOLS.push({
  id:'c02', cat:'calc', name:'Weight Converter', desc:'Convert between kilograms, pounds, ounces and more.', keywords:'mass kg lb oz unit',
  mount(c){
    formTool(c, {
      fields:[
        {key:'value', label:'Value', type:'number', default:1, step:'any'},
        {key:'from', label:'From', type:'select', default:'kg', options:[{v:'kg',l:'Kilograms'},{v:'g',l:'Grams'},{v:'mg',l:'Milligrams'},{v:'lb',l:'Pounds'},{v:'oz',l:'Ounces'},{v:'t',l:'Metric Tons'}]},
        {key:'to', label:'To', type:'select', default:'lb', options:[{v:'kg',l:'Kilograms'},{v:'g',l:'Grams'},{v:'mg',l:'Milligrams'},{v:'lb',l:'Pounds'},{v:'oz',l:'Ounces'},{v:'t',l:'Metric Tons'}]}
      ],
      compute(v){ const r=v.value*UNITS_WEIGHT[v.from]/UNITS_WEIGHT[v.to]; return `<div class="result-big">${r.toLocaleString(undefined,{maximumFractionDigits:6})}</div>`; }
    });
  }
});

CALC_TOOLS.push({
  id:'c03', cat:'calc', name:'Temperature Converter', desc:'Convert between Celsius, Fahrenheit and Kelvin.', keywords:'celsius fahrenheit kelvin degrees',
  mount(c){
    formTool(c, {
      fields:[
        {key:'value', label:'Value', type:'number', default:0, step:'any'},
        {key:'from', label:'From', type:'select', default:'C', options:[{v:'C',l:'Celsius'},{v:'F',l:'Fahrenheit'},{v:'K',l:'Kelvin'}]},
        {key:'to', label:'To', type:'select', default:'F', options:[{v:'C',l:'Celsius'},{v:'F',l:'Fahrenheit'},{v:'K',l:'Kelvin'}]}
      ],
      compute(v){
        let cel = v.from==='C'? v.value : v.from==='F'? (v.value-32)*5/9 : v.value-273.15;
        let out = v.to==='C'? cel : v.to==='F'? cel*9/5+32 : cel+273.15;
        return `<div class="result-big">${out.toLocaleString(undefined,{maximumFractionDigits:2})}°${v.to}</div>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c04', cat:'calc', name:'Age Calculator', desc:'Find your exact age in years, months and days, plus days to your next birthday.', keywords:'birthday dob years old',
  mount(c){
    formTool(c, {
      fields:[{key:'dob', label:'Date of birth', type:'date', wide:true}],
      compute(v){
        if(!v.dob) throw new Error('no date');
        const dob=new Date(v.dob+'T00:00:00'), now=new Date();
        if(isNaN(dob) || dob>now) throw new Error('bad date');
        const {years,months,days} = dateDiffParts(dob, now);
        let next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
        if(next<now) next.setFullYear(now.getFullYear()+1);
        const toNext = Math.ceil((next-now)/86400000);
        return `<div class="result-big">${years}y ${months}m ${days}d</div><p class="hint">${toNext} day${toNext===1?'':'s'} until next birthday</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c05', cat:'calc', name:'BMI Calculator', desc:'Calculate Body Mass Index from weight and height, in metric or imperial.', keywords:'body mass index health',
  mount(c){
    formTool(c, {
      note:'In metric, enter weight in kg and height in cm. In imperial, enter weight in lb and height in inches.',
      fields:[
        {key:'units', label:'Units', type:'select', default:'metric', options:[{v:'metric',l:'Metric (kg / cm)'},{v:'imperial',l:'Imperial (lb / in)'}]},
        {key:'weight', label:'Weight', type:'number', default:70, step:'any'},
        {key:'height', label:'Height', type:'number', default:170, step:'any'}
      ],
      compute(v){
        const bmi = v.units==='metric' ? v.weight/((v.height/100)**2) : 703*v.weight/(v.height**2);
        const cat = bmi<18.5?'Underweight':bmi<25?'Normal weight':bmi<30?'Overweight':'Obese';
        return `<div class="result-big">${bmi.toFixed(1)}</div><p class="hint">${cat}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c06', cat:'calc', name:'Percentage Calculator', desc:'Find a percentage of a number, what percent one number is of another, or percent change.', keywords:'percent proportion increase decrease',
  mount(c){
    formTool(c, {
      fields:[
        {key:'mode', label:'Calculate', type:'select', default:'of', options:[{v:'of',l:'X% of Y'},{v:'isWhat',l:'X is what % of Y'},{v:'change',l:'% change from X to Y'}]},
        {key:'x', label:'X', type:'number', default:20, step:'any'},
        {key:'y', label:'Y', type:'number', default:200, step:'any'}
      ],
      compute(v){
        let r, suffix='';
        if(v.mode==='of'){ r=(v.x/100)*v.y; }
        else if(v.mode==='isWhat'){ r=(v.x/v.y)*100; suffix='%'; }
        else { r=((v.y-v.x)/v.x)*100; suffix='%'; }
        return `<div class="result-big">${r.toLocaleString(undefined,{maximumFractionDigits:4})}${suffix}</div>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c07', cat:'calc', name:'EMI / Loan Calculator', desc:'Work out your monthly loan payment, total interest and total payment.', keywords:'loan mortgage installment interest',
  mount(c){
    formTool(c, {
      fields:[
        {key:'principal', label:'Loan amount', type:'number', default:500000, step:'any'},
        {key:'rate', label:'Annual interest %', type:'number', default:9, step:'any'},
        {key:'months', label:'Tenure (months)', type:'number', default:60, step:'1'}
      ],
      compute(v){
        const r = v.rate/12/100;
        const n = v.months;
        const emi = r===0 ? v.principal/n : v.principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
        const total = emi*n, interest = total-v.principal;
        return `<div class="result-big">${emi.toLocaleString(undefined,{maximumFractionDigits:2})} / mo</div>
          <table class="data-table" style="margin-top:8px"><tr><td>Total payment</td><td>${total.toLocaleString(undefined,{maximumFractionDigits:2})}</td></tr><tr><td>Total interest</td><td>${interest.toLocaleString(undefined,{maximumFractionDigits:2})}</td></tr></table>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c08', cat:'calc', name:'Simple Interest Calculator', desc:'Calculate simple interest and the total amount owed or earned.', keywords:'interest principal rate time',
  mount(c){
    formTool(c, {
      fields:[
        {key:'p', label:'Principal', type:'number', default:10000, step:'any'},
        {key:'r', label:'Annual rate %', type:'number', default:6, step:'any'},
        {key:'t', label:'Time (years)', type:'number', default:2, step:'any'}
      ],
      compute(v){
        const si = v.p*v.r*v.t/100;
        return `<div class="result-big">${si.toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">Total amount: ${(v.p+si).toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c09', cat:'calc', name:'Compound Interest Calculator', desc:'See how an investment grows with compounding interest over time.', keywords:'invest growth compounding',
  mount(c){
    formTool(c, {
      fields:[
        {key:'p', label:'Principal', type:'number', default:10000, step:'any'},
        {key:'r', label:'Annual rate %', type:'number', default:6, step:'any'},
        {key:'t', label:'Time (years)', type:'number', default:5, step:'any'},
        {key:'n', label:'Compounds / year', type:'number', default:12, step:'1'}
      ],
      compute(v){
        const a = v.p*Math.pow(1+v.r/(100*v.n), v.n*v.t);
        const ci = a-v.p;
        return `<div class="result-big">${a.toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">Interest earned: ${ci.toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c10', cat:'calc', name:'Discount Calculator', desc:'Work out the sale price and savings from a percentage discount.', keywords:'sale off price save',
  mount(c){
    formTool(c, {
      fields:[
        {key:'price', label:'Original price', type:'number', default:1999, step:'any'},
        {key:'discount', label:'Discount %', type:'number', default:25, step:'any'}
      ],
      compute(v){
        const saved = v.price*v.discount/100, final = v.price-saved;
        return `<div class="result-big">${final.toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">You save ${saved.toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c11', cat:'calc', name:'Tip & Bill Split Calculator', desc:'Add a tip and split the total evenly between any number of people.', keywords:'restaurant gratuity split share',
  mount(c){
    formTool(c, {
      fields:[
        {key:'bill', label:'Bill amount', type:'number', default:1000, step:'any'},
        {key:'tip', label:'Tip %', type:'number', default:10, step:'any'},
        {key:'people', label:'Number of people', type:'number', default:2, step:'1'}
      ],
      compute(v){
        const tipAmt = v.bill*v.tip/100, total = v.bill+tipAmt, per = total/Math.max(1,v.people);
        return `<div class="result-big">${per.toLocaleString(undefined,{maximumFractionDigits:2})} / person</div><p class="hint">Tip: ${tipAmt.toLocaleString(undefined,{maximumFractionDigits:2})} · Total: ${total.toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c12', cat:'calc', name:'GST / Sales Tax Calculator', desc:'Add tax to a price, or work out the pre-tax price from a tax-inclusive total.', keywords:'vat tax gst inclusive exclusive',
  mount(c){
    formTool(c, {
      fields:[
        {key:'amount', label:'Amount', type:'number', default:1000, step:'any'},
        {key:'rate', label:'Tax rate %', type:'number', default:18, step:'any'},
        {key:'mode', label:'Amount is', type:'select', default:'excl', options:[{v:'excl',l:'Before tax (add tax)'},{v:'incl',l:'Already includes tax (remove tax)'}]}
      ],
      compute(v){
        if(v.mode==='excl'){
          const tax=v.amount*v.rate/100;
          return `<div class="result-big">${(v.amount+tax).toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">Tax added: ${tax.toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
        } else {
          const base=v.amount/(1+v.rate/100), tax=v.amount-base;
          return `<div class="result-big">${base.toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">Tax portion: ${tax.toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
        }
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c13', cat:'calc', name:'Currency Converter (Manual Rate)', desc:'Convert an amount using an exchange rate you enter — no live rates, fully offline.', keywords:'forex exchange money convert',
  mount(c){
    formTool(c, {
      note:'This tool has no internet connection to a rates service — enter today’s rate yourself.',
      fields:[
        {key:'amount', label:'Amount', type:'number', default:100, step:'any'},
        {key:'rate', label:'Exchange rate (1 unit = ? target units)', type:'number', default:83, step:'any'}
      ],
      compute(v){ return `<div class="result-big">${(v.amount*v.rate).toLocaleString(undefined,{maximumFractionDigits:4})}</div>`; }
    });
  }
});

CALC_TOOLS.push({
  id:'c14', cat:'calc', name:'Date Difference Calculator', desc:'Find the exact number of years, months and days between two dates.', keywords:'days between duration count',
  mount(c){
    formTool(c, {
      fields:[{key:'d1', label:'Start date', type:'date'}, {key:'d2', label:'End date', type:'date'}],
      compute(v){
        if(!v.d1 || !v.d2) throw new Error('missing');
        const a=new Date(v.d1+'T00:00:00'), b=new Date(v.d2+'T00:00:00');
        const {years,months,days,totalDays} = dateDiffParts(a,b);
        return `<div class="result-big">${totalDays} days</div><p class="hint">${years}y ${months}m ${days}d · ${(totalDays/7).toFixed(1)} weeks</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c15', cat:'calc', name:'Date Add / Subtract', desc:'Add or subtract days, weeks, months or years from a date.', keywords:'date math future past',
  mount(c){
    formTool(c, {
      fields:[
        {key:'base', label:'Start date', type:'date'},
        {key:'amount', label:'Amount', type:'number', default:30, step:'1'},
        {key:'unit', label:'Unit', type:'select', default:'days', options:[{v:'days',l:'Days'},{v:'weeks',l:'Weeks'},{v:'months',l:'Months'},{v:'years',l:'Years'}]},
        {key:'dir', label:'Direction', type:'select', default:'add', options:[{v:'add',l:'Add'},{v:'subtract',l:'Subtract'}]}
      ],
      compute(v){
        if(!v.base) throw new Error('missing');
        const d=new Date(v.base+'T00:00:00');
        const amt = v.dir==='add' ? v.amount : -v.amount;
        if(v.unit==='days') d.setDate(d.getDate()+amt);
        else if(v.unit==='weeks') d.setDate(d.getDate()+amt*7);
        else if(v.unit==='months') d.setMonth(d.getMonth()+amt);
        else d.setFullYear(d.getFullYear()+amt);
        return `<div class="result-big">${d.toLocaleDateString(undefined,{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c16', cat:'calc', name:'Time Zone Offset Converter', desc:'Convert a clock time between two UTC offsets.', keywords:'timezone utc gmt offset',
  mount(c){
    const offsets=[]; for(let h=-12;h<=14;h++) offsets.push({v:String(h), l:'UTC'+(h>=0?'+':'')+h});
    formTool(c, {
      fields:[
        {key:'time', label:'Time (24h)', type:'time', default:'12:00'},
        {key:'from', label:'From', type:'select', default:'0', options:offsets},
        {key:'to', label:'To', type:'select', default:'5', options:offsets}
      ],
      compute(v){
        if(!v.time) throw new Error('missing');
        const [h,m]=v.time.split(':').map(Number);
        let total = h*60+m + (parseFloat(v.to)-parseFloat(v.from))*60;
        let dayShift = Math.floor(total/1440);
        total = ((total%1440)+1440)%1440;
        const hh=Math.floor(total/60), mm=total%60;
        const dayNote = dayShift>0 ? ` (+${dayShift} day${dayShift>1?'s':''})` : dayShift<0 ? ` (${dayShift} day${dayShift<-1?'s':''})` : '';
        return `<div class="result-big">${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}</div><p class="hint">${dayNote||'Same day'}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c17', cat:'calc', name:'Salary / Hourly Wage Calculator', desc:'Convert between an hourly rate and an annual salary.', keywords:'wage income pay hourly annual',
  mount(c){
    formTool(c, {
      fields:[
        {key:'mode', label:'Direction', type:'select', default:'h2a', options:[{v:'h2a',l:'Hourly → Annual'},{v:'a2h',l:'Annual → Hourly'}]},
        {key:'rate', label:'Hourly rate / Annual salary', type:'number', default:25, step:'any'},
        {key:'hours', label:'Hours per week', type:'number', default:40, step:'any'},
        {key:'weeks', label:'Weeks per year', type:'number', default:52, step:'any'}
      ],
      compute(v){
        if(v.mode==='h2a'){ const annual=v.rate*v.hours*v.weeks; return `<div class="result-big">${annual.toLocaleString(undefined,{maximumFractionDigits:2})} / yr</div>`; }
        const hourly=v.rate/(v.hours*v.weeks); return `<div class="result-big">${hourly.toLocaleString(undefined,{maximumFractionDigits:2})} / hr</div>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c18', cat:'calc', name:'Fuel Cost Calculator', desc:'Estimate fuel needed and trip cost from distance and efficiency.', keywords:'petrol gas mileage trip cost',
  mount(c){
    formTool(c, {
      fields:[
        {key:'distance', label:'Distance (km)', type:'number', default:200, step:'any'},
        {key:'efficiency', label:'Efficiency (km per litre)', type:'number', default:15, step:'any'},
        {key:'price', label:'Price per litre', type:'number', default:100, step:'any'}
      ],
      compute(v){
        const liters=v.distance/v.efficiency, cost=liters*v.price;
        return `<div class="result-big">${cost.toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">${liters.toFixed(2)} litres needed</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c19', cat:'calc', name:'Speed / Distance / Time Calculator', desc:'Solve for speed, distance or time when you know the other two.', keywords:'velocity travel physics',
  mount(c){
    formTool(c, {
      fields:[
        {key:'solve', label:'Solve for', type:'select', default:'speed', options:[{v:'speed',l:'Speed'},{v:'distance',l:'Distance'},{v:'time',l:'Time'}]},
        {key:'distance', label:'Distance (km)', type:'number', default:120, step:'any'},
        {key:'time', label:'Time (hours)', type:'number', default:2, step:'any'},
        {key:'speed', label:'Speed (km/h)', type:'number', default:60, step:'any'}
      ],
      compute(v){
        if(v.solve==='speed'){ return `<div class="result-big">${(v.distance/v.time).toFixed(2)} km/h</div>`; }
        if(v.solve==='distance'){ return `<div class="result-big">${(v.speed*v.time).toFixed(2)} km</div>`; }
        return `<div class="result-big">${(v.distance/v.speed).toFixed(2)} hours</div>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c20', cat:'calc', name:'Area Calculator', desc:'Calculate the area of rectangles, circles, triangles and trapezoids.', keywords:'geometry square shape',
  mount(c){
    shapeCalcTool(c, {
      rectangle:{ label:'Rectangle', fields:[{key:'w',label:'Width'},{key:'h',label:'Height'}], compute:v=>`<div class="result-big">${(v.w*v.h).toFixed(2)}</div><p class="hint">Area (square units)</p>` },
      circle:{ label:'Circle', fields:[{key:'r',label:'Radius'}], compute:v=>`<div class="result-big">${(Math.PI*v.r*v.r).toFixed(2)}</div><p class="hint">Area (square units)</p>` },
      triangle:{ label:'Triangle', fields:[{key:'b',label:'Base'},{key:'h',label:'Height'}], compute:v=>`<div class="result-big">${(0.5*v.b*v.h).toFixed(2)}</div><p class="hint">Area (square units)</p>` },
      trapezoid:{ label:'Trapezoid', fields:[{key:'b1',label:'Base 1'},{key:'b2',label:'Base 2'},{key:'h',label:'Height'}], compute:v=>`<div class="result-big">${(0.5*(v.b1+v.b2)*v.h).toFixed(2)}</div><p class="hint">Area (square units)</p>` }
    }, 'Shape');
  }
});

CALC_TOOLS.push({
  id:'c21', cat:'calc', name:'Volume Calculator', desc:'Calculate the volume of a cube, cylinder, sphere or cone.', keywords:'geometry solid capacity',
  mount(c){
    shapeCalcTool(c, {
      cube:{ label:'Cube', fields:[{key:'s',label:'Side'}], compute:v=>`<div class="result-big">${(v.s**3).toFixed(2)}</div><p class="hint">Volume (cubic units)</p>` },
      cylinder:{ label:'Cylinder', fields:[{key:'r',label:'Radius'},{key:'h',label:'Height'}], compute:v=>`<div class="result-big">${(Math.PI*v.r*v.r*v.h).toFixed(2)}</div><p class="hint">Volume (cubic units)</p>` },
      sphere:{ label:'Sphere', fields:[{key:'r',label:'Radius'}], compute:v=>`<div class="result-big">${((4/3)*Math.PI*v.r**3).toFixed(2)}</div><p class="hint">Volume (cubic units)</p>` },
      cone:{ label:'Cone', fields:[{key:'r',label:'Radius'},{key:'h',label:'Height'}], compute:v=>`<div class="result-big">${((1/3)*Math.PI*v.r*v.r*v.h).toFixed(2)}</div><p class="hint">Volume (cubic units)</p>` }
    }, 'Shape');
  }
});

CALC_TOOLS.push({
  id:'c22', cat:'calc', name:'Number to Words Converter', desc:'Spell out any whole number in English words.', keywords:'spell numeral written',
  mount(c){
    formTool(c, {
      fields:[{key:'n', label:'Number', type:'number', default:1234567, step:'1', wide:true}],
      compute(v){ if(!Number.isFinite(v.n)) throw new Error('bad'); return `<div class="result-big" style="font-size:20px">${esc(numberToWords(v.n))}</div>`; }
    });
  }
});

CALC_TOOLS.push({
  id:'c23', cat:'calc', name:'Roman Numeral Converter', desc:'Convert whole numbers to Roman numerals and back.', keywords:'roman mcmxciv ancient',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Output', placeholder:'Type a number (1–3999) or a Roman numeral…', rows:2,
      actions:[
        {label:'Number → Roman', primary:true, run:s=>{ const r=toRoman(parseInt(s,10)); return r || 'Enter a whole number from 1 to 3999.'; }},
        {label:'Roman → Number', run:s=>{ const n=fromRoman(s); return n!==null ? String(n) : 'Not a valid Roman numeral.'; }}
      ]
    });
  }
});

CALC_TOOLS.push({
  id:'c24', cat:'calc', name:'Average, Median & Mode Calculator', desc:'Paste a list of numbers to get the mean, median, mode and range.', keywords:'mean statistics dataset',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Numbers (comma, space or newline separated)</label><textarea class="ta" id="avIn" rows="5" placeholder="4, 8, 15, 16, 23, 42"></textarea></div>
      <div class="stat-grid" id="avOut"></div>
    `;
    const $in=c.querySelector('#avIn'), out=c.querySelector('#avOut');
    function run(){
      const s=numStats($in.value);
      if(!s){ out.innerHTML='<div class="hint">Enter some numbers above.</div>'; return; }
      out.innerHTML = [
        {v:s.count,l:'Count'}, {v:s.sum.toFixed(2),l:'Sum'}, {v:s.avg.toFixed(2),l:'Mean'},
        {v:s.median.toFixed(2),l:'Median'}, {v:s.modes.length?s.modes.join(', '):'None',l:'Mode'},
        {v:s.min,l:'Min'}, {v:s.max,l:'Max'}, {v:(s.max-s.min).toFixed(2),l:'Range'}
      ].map(x=>`<div class="stat"><span class="stat-val" style="font-size:17px">${esc(String(x.v))}</span><span class="stat-lbl">${esc(x.l)}</span></div>`).join('');
    }
    $in.addEventListener('input',run);
  }
});

CALC_TOOLS.push({
  id:'c25', cat:'calc', name:'Standard Deviation Calculator', desc:'Calculate population and sample variance and standard deviation.', keywords:'variance statistics spread',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Numbers (comma, space or newline separated)</label><textarea class="ta" id="sdIn" rows="5" placeholder="4, 8, 15, 16, 23, 42"></textarea></div>
      <div class="stat-grid" id="sdOut"></div>
    `;
    const $in=c.querySelector('#sdIn'), out=c.querySelector('#sdOut');
    function run(){
      const s=numStats($in.value);
      if(!s || s.count<2){ out.innerHTML='<div class="hint">Enter at least two numbers above.</div>'; return; }
      const sqDiffs = s.nums.map(n=>(n-s.avg)**2);
      const sumSq = sqDiffs.reduce((a,b)=>a+b,0);
      const popVar = sumSq/s.count, sampVar = sumSq/(s.count-1);
      out.innerHTML = [
        {v:Math.sqrt(popVar).toFixed(4),l:'Population Std Dev'}, {v:popVar.toFixed(4),l:'Population Variance'},
        {v:Math.sqrt(sampVar).toFixed(4),l:'Sample Std Dev'}, {v:sampVar.toFixed(4),l:'Sample Variance'}
      ].map(x=>`<div class="stat"><span class="stat-val" style="font-size:17px">${esc(String(x.v))}</span><span class="stat-lbl">${esc(x.l)}</span></div>`).join('');
    }
    $in.addEventListener('input',run);
  }
});

/* ===================================================================
   Phase 1b: Advanced Calculators (c26-c40) + Date & Time (c41-c47)
   =================================================================== */
function gcdShared(a,b){ a=Math.abs(Math.round(a)); b=Math.abs(Math.round(b)); while(b){ [a,b]=[b,a%b]; } return a||1; }
function isoWeekInfo(d){
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay()+6)%7; // Mon=0..Sun=6
  date.setUTCDate(date.getUTCDate()-dayNum+3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(),0,4));
  const week = 1 + Math.round(((date-firstThursday)/86400000 - 3 + ((firstThursday.getUTCDay()+6)%7))/7);
  return {week, year: date.getUTCFullYear()};
}
const WORLD_CLOCK_ZONES = [
  {label:'New York', tz:'America/New_York'},
  {label:'London', tz:'Europe/London'},
  {label:'Dubai', tz:'Asia/Dubai'},
  {label:'New Delhi', tz:'Asia/Kolkata'},
  {label:'Singapore', tz:'Asia/Singapore'},
  {label:'Tokyo', tz:'Asia/Tokyo'},
  {label:'Sydney', tz:'Australia/Sydney'},
  {label:'Los Angeles', tz:'America/Los_Angeles'}
];

CALC_TOOLS.push({
  id:'c26', cat:'calc', name:'Loan Amortization Schedule Calculator', desc:'See a full month-by-month breakdown of principal, interest and remaining balance for a loan.', keywords:'amortization schedule loan payoff table',
  mount(c){
    formTool(c, {
      fields:[
        {key:'principal', label:'Loan amount', type:'number', default:500000, step:'any'},
        {key:'rate', label:'Annual interest %', type:'number', default:9, step:'any'},
        {key:'months', label:'Tenure (months)', type:'number', default:24, step:'1'}
      ],
      compute(v){
        if(!(v.principal>0) || !(v.months>0) || v.months>600) throw new Error('Enter a loan amount and a tenure of up to 600 months.');
        const r = v.rate/12/100;
        const n = Math.round(v.months);
        const emi = r===0 ? v.principal/n : v.principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
        let bal = v.principal, rows='';
        for(let m=1;m<=n;m++){
          const interest = bal*r, princ = emi-interest;
          bal = Math.max(0, bal-princ);
          rows += `<tr><td>${m}</td><td>${emi.toLocaleString(undefined,{maximumFractionDigits:2})}</td><td>${princ.toLocaleString(undefined,{maximumFractionDigits:2})}</td><td>${interest.toLocaleString(undefined,{maximumFractionDigits:2})}</td><td>${bal.toLocaleString(undefined,{maximumFractionDigits:2})}</td></tr>`;
        }
        return `<div class="result-big">${emi.toLocaleString(undefined,{maximumFractionDigits:2})} / mo</div>
          <div style="max-height:340px;overflow:auto;margin-top:10px">
          <table class="data-table"><thead><tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>${rows}</tbody></table>
          </div>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c27', cat:'calc', name:'Mortgage Calculator', desc:'Estimate your monthly mortgage payment from home price, down payment and interest rate.', keywords:'home loan house payment down payment',
  mount(c){
    formTool(c, {
      fields:[
        {key:'price', label:'Home price', type:'number', default:3000000, step:'any'},
        {key:'down', label:'Down payment %', type:'number', default:20, step:'any'},
        {key:'rate', label:'Annual interest %', type:'number', default:8.5, step:'any'},
        {key:'years', label:'Loan term (years)', type:'number', default:20, step:'1'}
      ],
      compute(v){
        if(!(v.price>0) || v.down<0 || v.down>=100 || !(v.years>0)) throw new Error('Enter a valid home price, down payment and term.');
        const loan = v.price*(1-v.down/100);
        const r = v.rate/12/100, n = v.years*12;
        const pay = r===0 ? loan/n : loan*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
        const total = pay*n, interest = total-loan;
        return `<div class="result-big">${pay.toLocaleString(undefined,{maximumFractionDigits:2})} / mo</div>
          <table class="data-table" style="margin-top:8px"><tr><td>Loan amount</td><td>${loan.toLocaleString(undefined,{maximumFractionDigits:2})}</td></tr><tr><td>Total interest</td><td>${interest.toLocaleString(undefined,{maximumFractionDigits:2})}</td></tr><tr><td>Total paid</td><td>${total.toLocaleString(undefined,{maximumFractionDigits:2})}</td></tr></table>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c28', cat:'calc', name:'Retirement Savings Calculator', desc:'Project how your retirement savings will grow with regular monthly contributions and compound growth.', keywords:'retirement 401k pension savings growth',
  mount(c){
    formTool(c, {
      fields:[
        {key:'current', label:'Current savings', type:'number', default:500000, step:'any'},
        {key:'monthly', label:'Monthly contribution', type:'number', default:10000, step:'any'},
        {key:'rate', label:'Expected annual return %', type:'number', default:10, step:'any'},
        {key:'years', label:'Years until retirement', type:'number', default:25, step:'1'}
      ],
      compute(v){
        if(v.current<0 || v.monthly<0 || !(v.years>0)) throw new Error('Enter valid savings, contribution and years.');
        const i = v.rate/12/100, n = v.years*12;
        const fvCurrent = v.current*Math.pow(1+i,n);
        const fvContrib = i===0 ? v.monthly*n : v.monthly*((Math.pow(1+i,n)-1)/i);
        const total = fvCurrent+fvContrib;
        const contributed = v.current + v.monthly*n;
        return `<div class="result-big">${total.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
          <table class="data-table" style="margin-top:8px"><tr><td>Total contributed</td><td>${contributed.toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr><tr><td>Growth earned</td><td>${(total-contributed).toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr></table>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c29', cat:'calc', name:'Investment Return (CAGR) Calculator', desc:'Calculate the Compound Annual Growth Rate of an investment between two values.', keywords:'cagr growth rate return investment',
  mount(c){
    formTool(c, {
      fields:[
        {key:'initial', label:'Initial value', type:'number', default:100000, step:'any'},
        {key:'final', label:'Final value', type:'number', default:250000, step:'any'},
        {key:'years', label:'Number of years', type:'number', default:5, step:'any'}
      ],
      compute(v){
        if(!(v.initial>0) || !(v.years>0) || v.final<0) throw new Error('Enter a positive initial value and years.');
        const cagr = (Math.pow(v.final/v.initial, 1/v.years)-1)*100;
        return `<div class="result-big">${cagr.toFixed(2)}%</div><p class="hint">Annualized growth rate over ${v.years} years</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c30', cat:'calc', name:'Break-Even Point Calculator', desc:'Find how many units you need to sell to cover your fixed and variable costs.', keywords:'business breakeven units revenue',
  mount(c){
    formTool(c, {
      fields:[
        {key:'fixed', label:'Fixed costs', type:'number', default:50000, step:'any'},
        {key:'price', label:'Price per unit', type:'number', default:500, step:'any'},
        {key:'variable', label:'Variable cost per unit', type:'number', default:300, step:'any'}
      ],
      compute(v){
        const margin = v.price-v.variable;
        if(!(v.fixed>=0) || margin<=0) throw new Error('Price per unit must be greater than variable cost per unit.');
        const units = v.fixed/margin;
        return `<div class="result-big">${Math.ceil(units).toLocaleString()} units</div><p class="hint">Break-even revenue: ${(units*v.price).toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c31', cat:'calc', name:'Profit Margin Calculator', desc:'Calculate gross profit, profit margin and markup from revenue and cost.', keywords:'margin profit business revenue cost',
  mount(c){
    formTool(c, {
      fields:[
        {key:'revenue', label:'Revenue', type:'number', default:10000, step:'any'},
        {key:'cost', label:'Cost', type:'number', default:7000, step:'any'}
      ],
      compute(v){
        const profit = v.revenue-v.cost;
        const margin = v.revenue!==0 ? (profit/v.revenue)*100 : 0;
        const markup = v.cost!==0 ? (profit/v.cost)*100 : 0;
        return `<div class="result-big">${profit.toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">Margin: ${margin.toFixed(2)}% · Markup: ${markup.toFixed(2)}%</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c32', cat:'calc', name:'Markup Calculator', desc:'Work out the selling price and profit from a cost and a markup percentage.', keywords:'markup pricing cost sell',
  mount(c){
    formTool(c, {
      fields:[
        {key:'cost', label:'Cost price', type:'number', default:500, step:'any'},
        {key:'markup', label:'Markup %', type:'number', default:40, step:'any'}
      ],
      compute(v){
        const sell = v.cost*(1+v.markup/100), profit = sell-v.cost;
        return `<div class="result-big">${sell.toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">Profit: ${profit.toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c33', cat:'calc', name:'Sales Commission Calculator', desc:'Calculate commission earned on sales, plus total earnings with an optional base salary.', keywords:'commission sales earnings salary',
  mount(c){
    formTool(c, {
      fields:[
        {key:'sales', label:'Sales amount', type:'number', default:200000, step:'any'},
        {key:'rate', label:'Commission rate %', type:'number', default:5, step:'any'},
        {key:'base', label:'Base salary (optional)', type:'number', default:0, step:'any'}
      ],
      compute(v){
        const commission = v.sales*v.rate/100;
        return `<div class="result-big">${commission.toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">Total earnings (with base): ${(commission+v.base).toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c34', cat:'calc', name:'Overtime Pay Calculator', desc:'Calculate regular pay, overtime pay and total pay from hours worked.', keywords:'overtime wages hourly pay',
  mount(c){
    formTool(c, {
      fields:[
        {key:'rate', label:'Hourly rate', type:'number', default:200, step:'any'},
        {key:'regular', label:'Regular hours', type:'number', default:40, step:'any'},
        {key:'ot', label:'Overtime hours', type:'number', default:5, step:'any'},
        {key:'mult', label:'Overtime multiplier', type:'number', default:1.5, step:'any'}
      ],
      compute(v){
        const regPay = v.rate*v.regular, otPay = v.rate*v.mult*v.ot;
        return `<div class="result-big">${(regPay+otPay).toLocaleString(undefined,{maximumFractionDigits:2})}</div><p class="hint">Regular: ${regPay.toLocaleString(undefined,{maximumFractionDigits:2})} · Overtime: ${otPay.toLocaleString(undefined,{maximumFractionDigits:2})}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c35', cat:'calc', name:'BMR & Calorie Calculator', desc:'Estimate your Basal Metabolic Rate and daily calorie needs using the Mifflin-St Jeor formula.', keywords:'bmr tdee calories metabolism diet',
  mount(c){
    formTool(c, {
      fields:[
        {key:'gender', label:'Gender', type:'select', default:'male', options:[{v:'male',l:'Male'},{v:'female',l:'Female'}]},
        {key:'weight', label:'Weight (kg)', type:'number', default:70, step:'any'},
        {key:'height', label:'Height (cm)', type:'number', default:170, step:'any'},
        {key:'age', label:'Age (years)', type:'number', default:30, step:'1'},
        {key:'activity', label:'Activity level', type:'select', default:'1.2', options:[
          {v:'1.2',l:'Sedentary (little/no exercise)'},{v:'1.375',l:'Light exercise (1-3 days/wk)'},
          {v:'1.55',l:'Moderate exercise (3-5 days/wk)'},{v:'1.725',l:'Heavy exercise (6-7 days/wk)'},
          {v:'1.9',l:'Athlete (2x/day)'}
        ]}
      ],
      compute(v){
        if(!(v.weight>0) || !(v.height>0) || !(v.age>0)) throw new Error('Enter a valid weight, height and age.');
        const bmr = v.gender==='male' ? 10*v.weight+6.25*v.height-5*v.age+5 : 10*v.weight+6.25*v.height-5*v.age-161;
        const tdee = bmr*parseFloat(v.activity);
        return `<div class="result-big">${Math.round(tdee).toLocaleString()} cal/day</div><p class="hint">BMR (at rest): ${Math.round(bmr).toLocaleString()} cal/day</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c36', cat:'calc', name:'Body Fat Percentage Calculator', desc:'Estimate body fat percentage using the U.S. Navy tape-measure method.', keywords:'body fat navy method fitness',
  mount(c){
    formTool(c, {
      note:'Hip measurement is only used for the female formula.',
      fields:[
        {key:'gender', label:'Gender', type:'select', default:'male', options:[{v:'male',l:'Male'},{v:'female',l:'Female'}]},
        {key:'height', label:'Height (cm)', type:'number', default:170, step:'any'},
        {key:'neck', label:'Neck (cm)', type:'number', default:38, step:'any'},
        {key:'waist', label:'Waist (cm)', type:'number', default:85, step:'any'},
        {key:'hip', label:'Hip (cm, female only)', type:'number', default:95, step:'any'}
      ],
      compute(v){
        if(!(v.height>0) || !(v.neck>0) || !(v.waist>0)) throw new Error('Enter valid body measurements.');
        let bf;
        if(v.gender==='male'){
          if(v.waist-v.neck<=0) throw new Error('Waist measurement must be greater than neck measurement.');
          bf = 495/(1.0324 - 0.19077*Math.log10(v.waist-v.neck) + 0.15456*Math.log10(v.height)) - 450;
        } else {
          if(v.waist+v.hip-v.neck<=0) throw new Error('Check your waist, hip and neck measurements.');
          bf = 495/(1.29579 - 0.35004*Math.log10(v.waist+v.hip-v.neck) + 0.22100*Math.log10(v.height)) - 450;
        }
        if(!isFinite(bf)) throw new Error('Check your measurements and try again.');
        return `<div class="result-big">${bf.toFixed(1)}%</div><p class="hint">Estimated body fat percentage</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c37', cat:'calc', name:'GPA / CGPA Calculator', desc:'Calculate your weighted grade point average from course grade points and credit hours.', keywords:'gpa cgpa grades credits college',
  mount(c){
    c.innerHTML = `
      <p class="hint" style="margin-bottom:10px">Enter each course's grade points (e.g. on a 4.0 scale) and credit hours.</p>
      <div id="gpaRows"></div>
      <div class="actions" style="margin:10px 0"><button type="button" class="btn ghost" id="gpaAdd">+ Add Course</button></div>
      <div class="result-box" id="gpaOut">—</div>
    `;
    const rowsWrap = c.querySelector('#gpaRows'), out = c.querySelector('#gpaOut');
    function addRow(gp, cr){
      const div = document.createElement('div');
      div.className = 'form-grid gpa-row';
      div.style.cssText = 'grid-template-columns:1fr 1fr auto;align-items:end;margin-bottom:8px';
      div.innerHTML = `
        <div class="field"><label>Grade points</label><input type="number" class="gpa-gp" min="0" max="10" step="any" value="${gp!==undefined?gp:''}" placeholder="e.g. 3.7"></div>
        <div class="field"><label>Credit hours</label><input type="number" class="gpa-cr" min="0" step="any" value="${cr!==undefined?cr:''}" placeholder="e.g. 3"></div>
        <button type="button" class="btn ghost gpa-del" aria-label="Remove course">Remove</button>
      `;
      rowsWrap.appendChild(div);
      div.querySelectorAll('input').forEach(i=>i.addEventListener('input', run));
      div.querySelector('.gpa-del').addEventListener('click', ()=>{ div.remove(); run(); });
    }
    function run(){
      const gps = Array.from(rowsWrap.querySelectorAll('.gpa-gp')).map(i=>parseFloat(i.value));
      const crs = Array.from(rowsWrap.querySelectorAll('.gpa-cr')).map(i=>parseFloat(i.value));
      let sumWeighted=0, sumCredits=0, valid=0;
      for(let i=0;i<gps.length;i++){
        if(!isNaN(gps[i]) && !isNaN(crs[i]) && crs[i]>0){ sumWeighted+=gps[i]*crs[i]; sumCredits+=crs[i]; valid++; }
      }
      if(valid===0 || sumCredits===0){ out.innerHTML = '<span class="muted">Add at least one course with valid grade points and credit hours.</span>'; return; }
      out.innerHTML = `<div class="result-big">${(sumWeighted/sumCredits).toFixed(3)}</div><p class="hint">Weighted GPA across ${sumCredits} credit hours</p>`;
    }
    c.querySelector('#gpaAdd').addEventListener('click', ()=>addRow());
    addRow(4.0, 3); addRow(3.7, 3); addRow(3.3, 4);
    run();
  }
});

CALC_TOOLS.push({
  id:'c38', cat:'calc', name:'Fraction Calculator', desc:'Add, subtract, multiply or divide two fractions, with the result simplified automatically.', keywords:'fraction simplify numerator denominator',
  mount(c){
    formTool(c, {
      fields:[
        {key:'n1', label:'Numerator 1', type:'number', default:1, step:'1'},
        {key:'d1', label:'Denominator 1', type:'number', default:2, step:'1'},
        {key:'op', label:'Operation', type:'select', default:'+', options:[{v:'+',l:'+ Add'},{v:'-',l:'− Subtract'},{v:'*',l:'× Multiply'},{v:'/',l:'÷ Divide'}]},
        {key:'n2', label:'Numerator 2', type:'number', default:1, step:'1'},
        {key:'d2', label:'Denominator 2', type:'number', default:3, step:'1'}
      ],
      compute(v){
        if(!v.d1 || !v.d2) throw new Error('Denominators cannot be zero.');
        let rn, rd;
        if(v.op==='+'){ rn = v.n1*v.d2 + v.n2*v.d1; rd = v.d1*v.d2; }
        else if(v.op==='-'){ rn = v.n1*v.d2 - v.n2*v.d1; rd = v.d1*v.d2; }
        else if(v.op==='*'){ rn = v.n1*v.n2; rd = v.d1*v.d2; }
        else { if(!v.n2) throw new Error('Cannot divide by a fraction with a zero numerator.'); rn = v.n1*v.d2; rd = v.d1*v.n2; }
        if(rd===0) throw new Error('Result has a zero denominator.');
        if(rd<0){ rn=-rn; rd=-rd; }
        const g = gcdShared(rn, rd);
        return `<div class="result-big">${rn/g} / ${rd/g}</div><p class="hint">Decimal: ${(rn/rd).toFixed(6)}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c39', cat:'calc', name:'LCM & GCD Calculator', desc:'Find the Least Common Multiple and Greatest Common Divisor of two numbers.', keywords:'lcm gcd hcf factors multiple',
  mount(c){
    formTool(c, {
      fields:[
        {key:'a', label:'First number', type:'number', default:12, step:'1'},
        {key:'b', label:'Second number', type:'number', default:18, step:'1'}
      ],
      compute(v){
        const a=Math.round(v.a), b=Math.round(v.b);
        if(a===0 || b===0) throw new Error('Enter two non-zero whole numbers.');
        const g = gcdShared(a,b), l = Math.abs(a*b)/g;
        return `<table class="data-table"><tr><td>GCD (HCF)</td><td>${g}</td></tr><tr><td>LCM</td><td>${l}</td></tr></table>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c40', cat:'calc', name:'Quadratic Equation Solver', desc:'Solve ax² + bx + c = 0 for real or complex roots, with the discriminant shown.', keywords:'quadratic roots equation algebra',
  mount(c){
    formTool(c, {
      fields:[
        {key:'a', label:'a', type:'number', default:1, step:'any'},
        {key:'b', label:'b', type:'number', default:-3, step:'any'},
        {key:'c', label:'c', type:'number', default:2, step:'any'}
      ],
      compute(v){
        if(v.a===0) throw new Error('“a” cannot be zero — that would not be a quadratic equation.');
        const disc = v.b*v.b - 4*v.a*v.c;
        if(disc>0){
          const r1=(-v.b+Math.sqrt(disc))/(2*v.a), r2=(-v.b-Math.sqrt(disc))/(2*v.a);
          return `<div class="result-big">x = ${r1.toFixed(4)}, ${r2.toFixed(4)}</div><p class="hint">Discriminant: ${disc.toFixed(4)} (two real roots)</p>`;
        } else if(disc===0){
          const r=-v.b/(2*v.a);
          return `<div class="result-big">x = ${r.toFixed(4)}</div><p class="hint">Discriminant: 0 (one repeated root)</p>`;
        } else {
          const re=(-v.b/(2*v.a)).toFixed(4), im=(Math.sqrt(-disc)/(2*v.a)).toFixed(4);
          return `<div class="result-big">x = ${re} ± ${im}i</div><p class="hint">Discriminant: ${disc.toFixed(4)} (complex roots)</p>`;
        }
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c41', cat:'calc', name:'Countdown to Date Calculator', desc:'Count down the days, hours, minutes and seconds remaining until any future date.', keywords:'countdown event days until timer',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Target date</label><input type="date" id="cdDate"></div>
        <div class="field"><label>Target time (optional)</label><input type="time" id="cdTime" value="00:00"></div>
      </div>
      <div class="result-box" id="cdOut" style="margin-top:12px">—</div>
    `;
    const $date=c.querySelector('#cdDate'), $time=c.querySelector('#cdTime'), out=c.querySelector('#cdOut');
    const d=new Date(); $date.value = new Date(d.getTime()+7*86400000).toISOString().slice(0,10);
    function tick(){
      if(!$date.value){ out.innerHTML='<span class="muted">Pick a target date.</span>'; return; }
      const target = new Date(`${$date.value}T${$time.value||'00:00'}:00`);
      if(isNaN(target.getTime())){ out.innerHTML='<span class="muted">Pick a valid date.</span>'; return; }
      const diff = target.getTime() - Date.now();
      if(diff<=0){ out.innerHTML = `<div class="result-big">It's here!</div><p class="hint">Target time has passed.</p>`; return; }
      const days=Math.floor(diff/86400000), hrs=Math.floor(diff%86400000/3600000), mins=Math.floor(diff%3600000/60000), secs=Math.floor(diff%60000/1000);
      out.innerHTML = `<div class="result-big">${days}d ${hrs}h ${mins}m ${secs}s</div><p class="hint">Until ${target.toLocaleString()}</p>`;
    }
    $date.addEventListener('input', tick); $time.addEventListener('input', tick);
    tick();
    const iv = setInterval(tick, 1000);
    onToolCleanup(()=>clearInterval(iv));
  }
});

CALC_TOOLS.push({
  id:'c42', cat:'calc', name:'Business Days Calculator', desc:'Count the number of weekdays (Monday–Friday) between two dates, excluding weekends.', keywords:'working days weekdays business',
  mount(c){
    formTool(c, {
      fields:[{key:'d1', label:'Start date', type:'date'}, {key:'d2', label:'End date', type:'date'}],
      compute(v){
        if(!v.d1 || !v.d2) throw new Error('Pick both a start date and an end date.');
        let a=new Date(v.d1+'T00:00:00'), b=new Date(v.d2+'T00:00:00');
        if(isNaN(a.getTime()) || isNaN(b.getTime())) throw new Error('Pick valid dates.');
        if(a>b) [a,b]=[b,a];
        let count=0, cur=new Date(a);
        while(cur<=b){
          const dow=cur.getDay();
          if(dow!==0 && dow!==6) count++;
          cur.setDate(cur.getDate()+1);
        }
        const totalDays = Math.round((b-a)/86400000)+1;
        return `<div class="result-big">${count} business days</div><p class="hint">${totalDays} total calendar days in range</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c43', cat:'calc', name:'Day of the Week Finder', desc:'Find out what day of the week any past or future date falls on.', keywords:'weekday date lookup calendar',
  mount(c){
    formTool(c, {
      fields:[{key:'d', label:'Date', type:'date'}],
      compute(v){
        if(!v.d) throw new Error('Pick a date.');
        const d=new Date(v.d+'T00:00:00');
        if(isNaN(d.getTime())) throw new Error('Pick a valid date.');
        const dayName = d.toLocaleDateString(undefined,{weekday:'long'});
        const today=new Date(); today.setHours(0,0,0,0);
        const diffDays = Math.round((d-today)/86400000);
        const rel = diffDays===0 ? 'Today' : diffDays>0 ? `${diffDays} day(s) from today` : `${-diffDays} day(s) ago`;
        return `<div class="result-big">${dayName}</div><p class="hint">${rel}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c44', cat:'calc', name:'ISO Week Number Calculator', desc:'Find the ISO 8601 week number for any date.', keywords:'week number iso calendar',
  mount(c){
    formTool(c, {
      fields:[{key:'d', label:'Date', type:'date'}],
      compute(v){
        if(!v.d) throw new Error('Pick a date.');
        const d=new Date(v.d+'T00:00:00');
        if(isNaN(d.getTime())) throw new Error('Pick a valid date.');
        const {week,year} = isoWeekInfo(d);
        return `<div class="result-big">Week ${week}</div><p class="hint">ISO week-year ${year}</p>`;
      }
    });
  }
});

CALC_TOOLS.push({
  id:'c45', cat:'calc', name:'World Clock', desc:'See the current time in major cities around the world, updated live.', keywords:'timezone world clock cities live',
  mount(c){
    c.innerHTML = `<div class="stat-grid" id="wcGrid"></div><p class="hint">Times update automatically every second, using your device's clock.</p>`;
    const grid = c.querySelector('#wcGrid');
    function render(){
      const now = new Date();
      grid.innerHTML = WORLD_CLOCK_ZONES.map(z=>{
        let timeStr, dateStr;
        try{
          timeStr = new Intl.DateTimeFormat(undefined,{timeZone:z.tz, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true}).format(now);
          dateStr = new Intl.DateTimeFormat(undefined,{timeZone:z.tz, weekday:'short', month:'short', day:'numeric'}).format(now);
        }catch(e){ timeStr='—'; dateStr=''; }
        return `<div class="stat"><span class="stat-val" style="font-size:16px">${esc(timeStr)}</span><span class="stat-lbl">${esc(z.label)} · ${esc(dateStr)}</span></div>`;
      }).join('');
    }
    render();
    const iv = setInterval(render, 1000);
    onToolCleanup(()=>clearInterval(iv));
  }
});

CALC_TOOLS.push({
  id:'c46', cat:'calc', name:'Stopwatch & Lap Timer', desc:'A simple stopwatch with lap timing, running entirely in your browser tab.', keywords:'timer stopwatch lap seconds',
  mount(c){
    c.innerHTML = `
      <div class="result-box" id="swDisplay" style="font-size:34px;text-align:center;font-family:'IBM Plex Mono',monospace">00:00:00.0</div>
      <div class="actions" style="justify-content:center;margin-top:12px">
        <button type="button" class="btn primary" id="swStartStop">Start</button>
        <button type="button" class="btn ghost" id="swLap" disabled>Lap</button>
        <button type="button" class="btn ghost" id="swReset">Reset</button>
      </div>
      <ol id="swLaps" style="margin-top:16px;padding-left:20px"></ol>
    `;
    const disp=c.querySelector('#swDisplay'), startStopBtn=c.querySelector('#swStartStop'), lapBtn=c.querySelector('#swLap'), resetBtn=c.querySelector('#swReset'), lapsEl=c.querySelector('#swLaps');
    let running=false, startedAt=0, elapsedBefore=0, laps=[], iv=null;
    function fmt(ms){
      const h=Math.floor(ms/3600000), m=Math.floor(ms%3600000/60000), s=Math.floor(ms%60000/1000), t=Math.floor(ms%1000/100);
      const pad=(n,l=2)=>String(n).padStart(l,'0');
      return `${pad(h)}:${pad(m)}:${pad(s)}.${t}`;
    }
    function render(){ disp.textContent = fmt(running ? elapsedBefore + (Date.now()-startedAt) : elapsedBefore); }
    function startTick(){ iv = setInterval(render, 100); }
    startStopBtn.addEventListener('click', ()=>{
      if(!running){
        running=true; startedAt=Date.now(); startTick();
        startStopBtn.textContent='Stop';
        lapBtn.disabled=false;
      } else {
        running=false; elapsedBefore += Date.now()-startedAt; clearInterval(iv);
        startStopBtn.textContent='Start';
        render();
      }
    });
    lapBtn.addEventListener('click', ()=>{
      const cur = running ? elapsedBefore+(Date.now()-startedAt) : elapsedBefore;
      laps.unshift(cur);
      lapsEl.innerHTML = laps.map((l,i)=>`<li>Lap ${laps.length-i}: ${fmt(l)}</li>`).join('');
    });
    resetBtn.addEventListener('click', ()=>{
      running=false; clearInterval(iv); elapsedBefore=0; laps=[];
      startStopBtn.textContent='Start';
      lapBtn.disabled=true; lapsEl.innerHTML=''; render();
    });
    onToolCleanup(()=>{ running=false; clearInterval(iv); });
    render();
  }
});

CALC_TOOLS.push({
  id:'c47', cat:'calc', name:'Time Duration Adder', desc:'Add up multiple time durations (hours, minutes, seconds) to get a total — handy for totaling work shifts or clips.', keywords:'duration sum hours minutes add time',
  mount(c){
    c.innerHTML = `
      <div id="tdRows"></div>
      <div class="actions" style="margin:10px 0"><button type="button" class="btn ghost" id="tdAdd">+ Add Duration</button></div>
      <div class="result-box" id="tdOut">—</div>
    `;
    const rowsWrap=c.querySelector('#tdRows'), out=c.querySelector('#tdOut');
    function addRow(h,m,s){
      const div=document.createElement('div');
      div.className='form-grid td-row';
      div.style.cssText='grid-template-columns:1fr 1fr 1fr auto;align-items:end;margin-bottom:8px';
      div.innerHTML = `
        <div class="field"><label>Hours</label><input type="number" class="td-h" min="0" value="${h!==undefined?h:0}"></div>
        <div class="field"><label>Minutes</label><input type="number" class="td-m" min="0" max="59" value="${m!==undefined?m:0}"></div>
        <div class="field"><label>Seconds</label><input type="number" class="td-s" min="0" max="59" value="${s!==undefined?s:0}"></div>
        <button type="button" class="btn ghost td-del" aria-label="Remove row">Remove</button>
      `;
      rowsWrap.appendChild(div);
      div.querySelectorAll('input').forEach(i=>i.addEventListener('input', run));
      div.querySelector('.td-del').addEventListener('click', ()=>{ div.remove(); run(); });
    }
    function run(){
      let totalSec=0;
      rowsWrap.querySelectorAll('.td-row').forEach(row=>{
        const h=parseFloat(row.querySelector('.td-h').value)||0, m=parseFloat(row.querySelector('.td-m').value)||0, s=parseFloat(row.querySelector('.td-s').value)||0;
        totalSec += h*3600+m*60+s;
      });
      const hh=Math.floor(totalSec/3600), mm=Math.floor(totalSec%3600/60), ss=Math.floor(totalSec%60);
      const pad=n=>String(n).padStart(2,'0');
      out.innerHTML = `<div class="result-big">${pad(hh)}:${pad(mm)}:${pad(ss)}</div><p class="hint">Total: ${totalSec.toLocaleString()} seconds</p>`;
    }
    c.querySelector('#tdAdd').addEventListener('click', ()=>addRow());
    addRow(1,30,0); addRow(0,45,0);
    run();
  }
});

CALC_TOOLS.push({
  id:'c48', cat:'calc', name:'Aspect Ratio Calculator', desc:'Find the simplified aspect ratio of a width and height, or scale one dimension to match the other.', keywords:'aspect ratio calculator video image dimensions 16:9',
  mount(c){
    formTool(c, {
      fields:[
        {key:'w', label:'Width', type:'number', value:1920, step:1},
        {key:'h', label:'Height', type:'number', value:1080, step:1},
        {key:'newW', label:'New width (optional)', type:'number', placeholder:'e.g. 1280'}
      ],
      compute(v){
        if(!(v.w>0) || !(v.h>0)) throw new Error('bad');
        function gcd(a,b){ return b ? gcd(b,a%b) : a; }
        const g = gcd(Math.round(v.w), Math.round(v.h));
        const ratioW = Math.round(v.w)/g, ratioH = Math.round(v.h)/g;
        let scaledLine = '';
        if(v.newW>0){
          const newH = v.newW * (v.h/v.w);
          scaledLine = `<div class="stat"><span class="stat-val">${Math.round(newH)}</span><span class="stat-lbl">Height at Width ${v.newW}</span></div>`;
        }
        return `<div class="stat-grid">
          <div class="stat"><span class="stat-val">${ratioW}:${ratioH}</span><span class="stat-lbl">Simplified Ratio</span></div>
          <div class="stat"><span class="stat-val">${(v.w/v.h).toFixed(4)}</span><span class="stat-lbl">Decimal Ratio</span></div>
          ${scaledLine}
        </div>`;
      },
      note:'Enter a new width to see the matching height that keeps the same proportions.'
    });
  }
});

CALC_TOOLS.push({
  id:'c49', cat:'calc', name:'Unit Price / Better Deal Comparator', desc:'Compare two package sizes and prices to see which one is actually the better deal per unit.', keywords:'unit price comparator better deal calculator price per unit',
  mount(c){
    formTool(c, {
      fields:[
        {key:'priceA', label:'Product A price', type:'number', value:120, step:0.01},
        {key:'qtyA', label:'Product A quantity', type:'number', value:1, step:0.01},
        {key:'priceB', label:'Product B price', type:'number', value:200, step:0.01},
        {key:'qtyB', label:'Product B quantity', type:'number', value:2, step:0.01}
      ],
      compute(v){
        if(!(v.priceA>=0) || !(v.qtyA>0) || !(v.priceB>=0) || !(v.qtyB>0)) throw new Error('bad');
        const perA = v.priceA/v.qtyA, perB = v.priceB/v.qtyB;
        const better = perA<perB ? 'A' : perB<perA ? 'B' : 'Tie';
        return `<div class="stat-grid">
          <div class="stat"><span class="stat-val">${perA.toFixed(4)}</span><span class="stat-lbl">Product A — Price per Unit</span></div>
          <div class="stat"><span class="stat-val">${perB.toFixed(4)}</span><span class="stat-lbl">Product B — Price per Unit</span></div>
          <div class="stat"><span class="stat-val">${better==='Tie'?'Tie':'Product '+better}</span><span class="stat-lbl">Better Deal</span></div>
        </div>`;
      },
      note:'Use the same quantity unit for both products (e.g. both in grams, or both in millilitres).'
    });
  }
});

CALC_TOOLS.push({
  id:'c50', cat:'calc', name:'Grade / Weighted Average Calculator', desc:'Add your assignments, tests and their weights to calculate your overall weighted grade.', keywords:'grade calculator weighted average gpa exam score',
  mount(c){
    c.innerHTML = `
      <div id="gwRows"></div>
      <div class="actions"><button class="btn ghost" id="gwAdd" type="button">+ Add Item</button></div>
      <div class="result-box" id="gwOut">—</div>
    `;
    const $rows=c.querySelector('#gwRows');
    function addRow(name, score, weight){
      const row=document.createElement('div');
      row.className='form-grid gwRow';
      row.innerHTML = `
        <div class="field wide"><label>Item</label><input type="text" class="gwName" value="${esc(name||'')}" placeholder="e.g. Midterm"></div>
        <div class="field"><label>Score (%)</label><input type="number" class="gwScore" value="${score!==undefined?score:''}" min="0" max="100" step="0.1"></div>
        <div class="field"><label>Weight (%)</label><input type="number" class="gwWeight" value="${weight!==undefined?weight:''}" min="0" step="0.1"></div>
        <div class="field"><label>&nbsp;</label><button type="button" class="btn ghost gwRemove">Remove</button></div>
      `;
      $rows.appendChild(row);
      row.querySelectorAll('input').forEach(i=>i.addEventListener('input', update));
      row.querySelector('.gwRemove').addEventListener('click', ()=>{ row.remove(); update(); });
    }
    function update(){
      const rows = Array.from($rows.querySelectorAll('.gwRow')).map(r=>({
        score: parseFloat(r.querySelector('.gwScore').value),
        weight: parseFloat(r.querySelector('.gwWeight').value)
      })).filter(r=>!isNaN(r.score) && !isNaN(r.weight) && r.weight>0);
      const out = c.querySelector('#gwOut');
      if(!rows.length){ out.innerHTML='<span class="muted">Add at least one item with a score and weight.</span>'; return; }
      const totalWeight = rows.reduce((s,r)=>s+r.weight,0);
      const weighted = rows.reduce((s,r)=>s+r.score*r.weight,0)/totalWeight;
      out.innerHTML = `<div class="stat-grid">
        <div class="stat"><span class="stat-val">${weighted.toFixed(2)}%</span><span class="stat-lbl">Weighted Average</span></div>
        <div class="stat"><span class="stat-val">${totalWeight.toFixed(1)}%</span><span class="stat-lbl">Total Weight Used</span></div>
      </div>`;
    }
    c.querySelector('#gwAdd').addEventListener('click', ()=>addRow());
    addRow('Assignments', 85, 30);
    addRow('Midterm', 78, 30);
    addRow('Final Exam', 90, 40);
    update();
  }
});
/* ===== CALC_TOOLS_MARKER ===== */
DEV_TOOLS.push({
  id:'d01', cat:'dev', name:'JSON Formatter & Validator', desc:'Pretty-print, minify and validate JSON, with clear error messages.', keywords:'json format validate pretty',
  mount(c){
    textTool(c, {
      inLabel:'JSON input', outLabel:'Result', placeholder:'{"hello":"world"}', rows:8,
      actions:[
        {label:'Format', primary:true, run:s=>{ try{ return JSON.stringify(JSON.parse(s), null, 2); }catch(e){ return 'Invalid JSON — '+e.message; } }},
        {label:'Minify', run:s=>{ try{ return JSON.stringify(JSON.parse(s)); }catch(e){ return 'Invalid JSON — '+e.message; } }}
      ]
    });
  }
});

DEV_TOOLS.push({
  id:'d02', cat:'dev', name:'JSON ⇄ CSV Converter', desc:'Convert an array of JSON objects to CSV, or CSV back to JSON.', keywords:'spreadsheet table convert data',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Input</label><textarea class="ta mono" id="jcIn" rows="8" placeholder='[{"name":"Alice","age":30}]'></textarea></div>
      <div class="actions" id="jcActs"></div>
      <div class="field"><label>Output</label><textarea class="ta out mono" id="jcOut" rows="8" readonly></textarea></div>
    `;
    const $in=c.querySelector('#jcIn'), $out=c.querySelector('#jcOut');
    function toCsv(){
      try{
        const arr=JSON.parse($in.value);
        if(!Array.isArray(arr) || !arr.length) throw new Error('Expected a non-empty JSON array of objects.');
        const headers=[...new Set(arr.flatMap(o=>Object.keys(o)))];
        const lines=[headers.map(toCSVField).join(',')];
        arr.forEach(o=> lines.push(headers.map(h=>toCSVField(o[h])).join(',')));
        $out.value=lines.join('\n');
      }catch(e){ $out.value='Error: '+e.message; }
    }
    function toJson(){
      try{
        const rows=parseCSV($in.value);
        if(rows.length<2) throw new Error('Need a header row and at least one data row.');
        const headers=rows[0];
        const arr=rows.slice(1).map(r=>{ const o={}; headers.forEach((h,i)=>o[h]=r[i]??''); return o; });
        $out.value=JSON.stringify(arr,null,2);
      }catch(e){ $out.value='Error: '+e.message; }
    }
    const b1=document.createElement('button'); b1.type='button'; b1.className='btn primary'; b1.textContent='JSON → CSV'; b1.addEventListener('click',toCsv);
    const b2=document.createElement('button'); b2.type='button'; b2.className='btn ghost'; b2.textContent='CSV → JSON'; b2.addEventListener('click',toJson);
    c.querySelector('#jcActs').append(b1,b2,copyBtn(()=>$out.value));
  }
});

DEV_TOOLS.push({
  id:'d03', cat:'dev', name:'Base64 Encoder / Decoder', desc:'Encode text to Base64 or decode Base64 back to text (UTF-8 safe).', keywords:'encode decode b64',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Output', placeholder:'Type text, or paste Base64…',
      actions:[
        {label:'Encode', primary:true, run:s=> utf8ToB64(s)},
        {label:'Decode', run:s=>{ try{ return b64ToUtf8(s); }catch(e){ return 'Invalid Base64 input.'; } }}
      ]
    });
  }
});

DEV_TOOLS.push({
  id:'d04', cat:'dev', name:'URL Encoder / Decoder', desc:'Percent-encode text for URLs, or decode a percent-encoded string.', keywords:'uri encode decode percent',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Output', placeholder:'Type text or a URL…',
      actions:[
        {label:'Encode', primary:true, run:s=> encodeURIComponent(s)},
        {label:'Decode', run:s=>{ try{ return decodeURIComponent(s); }catch(e){ return 'Invalid percent-encoding.'; } }}
      ]
    });
  }
});

DEV_TOOLS.push({
  id:'d05', cat:'dev', name:'HTML Entity Encoder / Decoder', desc:'Escape special characters to HTML entities, or decode them back.', keywords:'entities escape unescape html',
  mount(c){
    textTool(c, {
      inLabel:'Input', outLabel:'Output', placeholder:'Type text or paste HTML…',
      actions:[
        {label:'Encode', primary:true, run:s=> s.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))},
        {label:'Decode', run:s=> s.replace(/&(amp|lt|gt|quot|apos|nbsp);|&#(\d+);|&#x([0-9a-fA-F]+);/g,(m,name,dec,hex)=>{
          if(name) return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[name];
          if(dec) return String.fromCharCode(parseInt(dec,10));
          if(hex) return String.fromCharCode(parseInt(hex,16));
          return m;
        })}
      ]
    });
  }
});

DEV_TOOLS.push({
  id:'d06', cat:'dev', name:'Regex Tester', desc:'Test a regular expression against sample text and see every match.', keywords:'regexp pattern match test',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field wide"><label>Pattern</label><input type="text" id="rgPattern" class="mono" placeholder="\\b[A-Z][a-z]+\\b"></div>
        <div class="field"><label>Flags</label><input type="text" id="rgFlags" class="mono" value="g"></div>
      </div>
      <div class="field"><label>Test string</label><textarea class="ta" id="rgText" rows="6" placeholder="Paste text to test against…"></textarea></div>
      <p class="hint" id="rgHint"></p>
      <div class="field"><label>Highlighted</label><div class="result-box mono" id="rgHighlight" style="white-space:pre-wrap;word-break:break-word;"></div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Match</th><th>Index</th></tr></thead><tbody id="rgBody"></tbody></table></div>
    `;
    const $p=c.querySelector('#rgPattern'), $f=c.querySelector('#rgFlags'), $t=c.querySelector('#rgText'), hint=c.querySelector('#rgHint'), hl=c.querySelector('#rgHighlight'), body=c.querySelector('#rgBody');
    function run(){
      if(!$p.value){ hint.textContent=''; hl.innerHTML=''; body.innerHTML=''; return; }
      try{
        const re=new RegExp($p.value, $f.value.includes('g')?$f.value:$f.value+'g');
        const text=$t.value;
        let m, matches=[], last=0, htmlParts=[];
        while((m=re.exec(text))){
          matches.push(m);
          htmlParts.push(esc(text.slice(last,m.index)) + '<mark class="hit">'+esc(m[0]||'')+'</mark>');
          last=m.index+(m[0].length||1);
          if(m[0].length===0) re.lastIndex++;
          if(matches.length>500) break;
        }
        htmlParts.push(esc(text.slice(last)));
        hl.innerHTML = htmlParts.join('') || '<span class="muted">No text to test.</span>';
        hint.textContent = matches.length+' match'+(matches.length===1?'':'es');
        body.innerHTML = matches.length ? matches.map((mm,i)=>`<tr><td>${i+1}</td><td class="mono">${esc(mm[0])}</td><td>${mm.index}</td></tr>`).join('') : '<tr><td colspan="3" class="hint">No matches.</td></tr>';
      }catch(e){ hint.textContent='Invalid pattern: '+e.message; hl.innerHTML=''; body.innerHTML=''; }
    }
    [$p,$f,$t].forEach(e=>e.addEventListener('input',run));
  }
});

DEV_TOOLS.push({
  id:'d07', cat:'dev', name:'UUID Generator', desc:'Generate one or many RFC-4122 version 4 UUIDs.', keywords:'guid unique identifier',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>How many?</label><input type="number" id="uuN" value="5" min="1" max="200"></div>
      <div class="actions" id="uuActs"></div>
      <textarea class="ta out mono" id="uuOut" rows="8" readonly></textarea>
    `;
    const $n=c.querySelector('#uuN'), out=c.querySelector('#uuOut');
    function gen(){
      const n=Math.min(200,Math.max(1,parseInt($n.value,10)||1));
      const list=[]; for(let i=0;i<n;i++) list.push(crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,ch=>{ const r=Math.random()*16|0; return (ch==='x'?r:(r&0x3|0x8)).toString(16); }));
      out.value=list.join('\n');
    }
    const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Generate'; b.addEventListener('click',gen);
    c.querySelector('#uuActs').append(b, copyBtn(()=>out.value));
    gen();
  }
});

DEV_TOOLS.push({
  id:'d08', cat:'dev', name:'Password Generator', desc:'Generate a strong random password with a live strength estimate.', keywords:'random secure passphrase',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Length <span id="pwLenVal" class="mono"></span></label><input type="range" id="pwLen" min="6" max="64" value="16"></div>
      <div class="form-grid">
        <div class="field"><label class="chk"><input type="checkbox" id="pwUpper" checked> Uppercase (A–Z)</label></div>
        <div class="field"><label class="chk"><input type="checkbox" id="pwLower" checked> Lowercase (a–z)</label></div>
        <div class="field"><label class="chk"><input type="checkbox" id="pwNum" checked> Numbers (0–9)</label></div>
        <div class="field"><label class="chk"><input type="checkbox" id="pwSym" checked> Symbols (!@#…)</label></div>
      </div>
      <div class="actions" id="pwActs"></div>
      <textarea class="ta out mono" id="pwOut" rows="2" readonly></textarea>
      <p class="hint" id="pwStrength"></p>
    `;
    const $len=c.querySelector('#pwLen'), $lenVal=c.querySelector('#pwLenVal'), $u=c.querySelector('#pwUpper'), $l=c.querySelector('#pwLower'), $n=c.querySelector('#pwNum'), $s=c.querySelector('#pwSym');
    const out=c.querySelector('#pwOut'), strength=c.querySelector('#pwStrength');
    const SETS={u:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', l:'abcdefghijklmnopqrstuvwxyz', n:'0123456789', s:'!@#$%^&*()-_=+[]{}'};
    function gen(){
      $lenVal.textContent=$len.value;
      let pool=''; if($u.checked) pool+=SETS.u; if($l.checked) pool+=SETS.l; if($n.checked) pool+=SETS.n; if($s.checked) pool+=SETS.s;
      if(!pool){ out.value=''; strength.textContent='Select at least one character set.'; return; }
      const len=parseInt($len.value,10);
      const bytes=new Uint32Array(len); crypto.getRandomValues(bytes);
      let pw=''; for(let i=0;i<len;i++) pw+=pool[bytes[i]%pool.length];
      out.value=pw;
      const bits = len*Math.log2(pool.length);
      const label = bits<40?'Weak':bits<64?'Fair':bits<90?'Strong':'Very strong';
      strength.textContent = `~${Math.round(bits)} bits of entropy — ${label}`;
    }
    [$len,$u,$l,$n,$s].forEach(e=>e.addEventListener('input',gen));
    const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Generate'; b.addEventListener('click',gen);
    c.querySelector('#pwActs').append(b, copyBtn(()=>out.value));
    gen();
  }
});

DEV_TOOLS.push({
  id:'d09', cat:'dev', name:'Hash Generator', desc:'Compute SHA-1, SHA-256, SHA-384 or SHA-512 hashes of any text.', keywords:'sha checksum digest',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="hsIn" rows="5" placeholder="Type or paste text…"></textarea></div>
      <div class="field"><label>Algorithm</label><select id="hsAlgo"><option value="SHA-1">SHA-1</option><option value="SHA-256" selected>SHA-256</option><option value="SHA-384">SHA-384</option><option value="SHA-512">SHA-512</option></select></div>
      <div class="actions" id="hsActs"></div>
      <textarea class="ta out mono" id="hsOut" rows="3" readonly></textarea>
    `;
    const $in=c.querySelector('#hsIn'), $algo=c.querySelector('#hsAlgo'), out=c.querySelector('#hsOut');
    async function run(){
      if(!$in.value){ out.value=''; return; }
      const buf = await crypto.subtle.digest($algo.value, new TextEncoder().encode($in.value));
      out.value = [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    [$in,$algo].forEach(e=>e.addEventListener('input',run));
    c.querySelector('#hsActs').appendChild(copyBtn(()=>out.value));
  }
});

DEV_TOOLS.push({
  id:'d10', cat:'dev', name:'CSS Minifier', desc:'Strip comments and extra whitespace from a CSS file.', keywords:'minify compress stylesheet',
  mount(c){
    textTool(c, {
      inLabel:'CSS', outLabel:'Minified CSS', placeholder:'body {\n  color: red;\n}', rows:8, live:true,
      actions:[{label:'Minify', primary:true, run:s=> s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;,])\s*/g,'$1').replace(/;}/g,'}').replace(/\s+/g,' ').trim()}]
    });
  }
});

DEV_TOOLS.push({
  id:'d11', cat:'dev', name:'JS Minifier (Basic)', desc:'Strip comments and blank lines from JavaScript — safe on strings, no token squashing.', keywords:'minify compress javascript comments',
  mount(c){
    textTool(c, {
      inLabel:'JavaScript', outLabel:'Cleaned JavaScript', placeholder:'// a comment\nfunction hi(){\n  return 1;\n}', rows:8,
      note:'This strips comments and blank lines only — it will not rename variables or squash code onto one line, which keeps it safe around strings and template literals.',
      actions:[{label:'Clean', primary:true, run:s=>{
        let out=''; let i=0; const n=s.length;
        let inStr=null, inTemplate=false, inLine=false, inBlock=false;
        while(i<n){
          const ch=s[i], next=s[i+1];
          if(inLine){ if(ch==='\n'){ inLine=false; out+=ch; } i++; continue; }
          if(inBlock){ if(ch==='*'&&next==='/'){ inBlock=false; i+=2; } else i++; continue; }
          if(inStr){ out+=ch; if(ch==='\\'){ out+=next||''; i+=2; continue; } if(ch===inStr) inStr=null; i++; continue; }
          if(inTemplate){ out+=ch; if(ch==='\\'){ out+=next||''; i+=2; continue; } if(ch==='`') inTemplate=false; i++; continue; }
          if(ch==='/' && next==='/'){ inLine=true; i+=2; continue; }
          if(ch==='/' && next==='*'){ inBlock=true; i+=2; continue; }
          if(ch==='"'||ch==="'"){ inStr=ch; out+=ch; i++; continue; }
          if(ch==='`'){ inTemplate=true; out+=ch; i++; continue; }
          out+=ch; i++;
        }
        return out.split('\n').map(l=>l.replace(/[ \t]+$/,'')).filter((l,idx,arr)=> !(l.trim()==='' && arr[idx-1] && arr[idx-1].trim()==='')).join('\n').trim();
      }}]
    });
  }
});

DEV_TOOLS.push({
  id:'d12', cat:'dev', name:'XML Formatter', desc:'Pretty-print minified or single-line XML with proper indentation.', keywords:'xml pretty indent format',
  mount(c){
    textTool(c, {
      inLabel:'XML', outLabel:'Formatted XML', placeholder:'<root><item>1</item></root>', rows:8,
      actions:[{label:'Format', primary:true, run:s=>{
        let xml = s.replace(/>\s*</g,'><').trim();
        if(!xml) return '';
        let formatted=''; let indent=0;
        xml.split(/(?=<)/).filter(Boolean).forEach(node=>{
          if(/^<\/\w/.test(node)) indent=Math.max(0,indent-1);
          formatted += '  '.repeat(indent) + node.trim() + '\n';
          if(/^<\w[^>]*[^/?]>$/.test(node) && !/^<\?/.test(node)) indent++;
        });
        return formatted.trim();
      }}]
    });
  }
});

DEV_TOOLS.push({
  id:'d13', cat:'dev', name:'Markdown Previewer', desc:'Write Markdown on the left and see the rendered preview on the right.', keywords:'md render preview write',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Markdown</label><textarea class="ta mono" id="mdIn" rows="10" placeholder="# Heading\n\nSome **bold** and _italic_ text with a [link](https://example.com).\n\n- item one\n- item two"></textarea></div>
      <div class="field"><label>Preview</label><div class="result-box" id="mdOut" style="min-height:80px"></div></div>
    `;
    const $in=c.querySelector('#mdIn'), out=c.querySelector('#mdOut');
    function mdToHtml(src){
      let s = esc(src);
      s = s.replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>');
      s = s.replace(/^&gt; (.*)$/gm,'<blockquote>$1</blockquote>');
      s = s.replace(/^---$/gm,'<hr>');
      s = s.replace(/`([^`]+)`/g,'<code>$1</code>');
      s = s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
      s = s.replace(/_([^_]+)_/g,'<em>$1</em>');
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
      s = s.replace(/^(?:- .*(?:\n|$))+/gm, block => '<ul>'+block.trim().split('\n').map(l=>'<li>'+l.replace(/^- /,'')+'</li>').join('')+'</ul>');
      s = s.split(/\n{2,}/).map(p=> /^<(h1|h2|h3|ul|blockquote|hr)/.test(p.trim()) ? p : (p.trim()?`<p>${p.trim().replace(/\n/g,'<br>')}</p>`:'')).join('\n');
      return s;
    }
    function run(){ out.innerHTML = $in.value.trim() ? mdToHtml($in.value) : '<span class="muted">Preview appears here.</span>'; }
    $in.addEventListener('input',run); run();
  }
});

DEV_TOOLS.push({
  id:'d14', cat:'dev', name:'CSS Unit Converter', desc:'Convert a length between px, em, rem, pt and %, based on a chosen base font size.', keywords:'px em rem pt percent',
  mount(c){
    formTool(c, {
      fields:[
        {key:'base', label:'Base font size (px)', type:'number', default:16, step:'any'},
        {key:'value', label:'Value', type:'number', default:1, step:'any'},
        {key:'unit', label:'Unit', type:'select', default:'rem', options:[{v:'px',l:'px'},{v:'em',l:'em'},{v:'rem',l:'rem'},{v:'pt',l:'pt'},{v:'pct',l:'%'}]}
      ],
      compute(v){
        const factor = {px:1, em:v.base, rem:v.base, pt:96/72, pct:v.base/100};
        const px = v.value*factor[v.unit];
        const rows = Object.keys(factor).map(u=>`<tr><td>${u==='pct'?'%':u}</td><td>${(px/factor[u]).toLocaleString(undefined,{maximumFractionDigits:4})}</td></tr>`).join('');
        return `<table class="data-table">${rows}</table>`;
      }
    });
  }
});

DEV_TOOLS.push({
  id:'d15', cat:'dev', name:'Number Base Converter', desc:'Convert a number between binary, octal, decimal and hexadecimal live.', keywords:'binary hex octal decimal',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Value</label><input type="text" id="nbVal" class="mono" value="255"></div>
        <div class="field"><label>Base</label><select id="nbBase"><option value="2">Binary (2)</option><option value="8">Octal (8)</option><option value="10" selected>Decimal (10)</option><option value="16">Hex (16)</option></select></div>
      </div>
      <div class="stat-grid" id="nbOut"></div>
    `;
    const $v=c.querySelector('#nbVal'), $b=c.querySelector('#nbBase'), out=c.querySelector('#nbOut');
    function run(){
      const n = parseInt($v.value, parseInt($b.value,10));
      if(isNaN(n) || n<0){ out.innerHTML='<div class="hint">Enter a valid non-negative number for the selected base.</div>'; return; }
      out.innerHTML = [
        {v:n.toString(2),l:'Binary'}, {v:n.toString(8),l:'Octal'}, {v:n.toString(10),l:'Decimal'}, {v:n.toString(16).toUpperCase(),l:'Hex'}
      ].map(x=>`<div class="stat"><span class="stat-val mono" style="font-size:15px">${esc(x.v)}</span><span class="stat-lbl">${esc(x.l)}</span></div>`).join('');
    }
    [$v,$b].forEach(e=>e.addEventListener('input',run));
    run();
  }
});

DEV_TOOLS.push({
  id:'d16', cat:'dev', name:'Random Number Generator', desc:'Generate random integers in a range, with an optional uniqueness constraint.', keywords:'random range integer lottery',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Min</label><input type="number" id="rnMin" value="1"></div>
        <div class="field"><label>Max</label><input type="number" id="rnMax" value="100"></div>
        <div class="field"><label>How many</label><input type="number" id="rnCount" value="5" min="1"></div>
        <div class="field"><label class="chk"><input type="checkbox" id="rnUnique"> Unique values</label></div>
      </div>
      <div class="actions" id="rnActs"></div>
      <textarea class="ta out mono" id="rnOut" rows="3" readonly></textarea>
      <p class="hint" id="rnHint"></p>
    `;
    const $min=c.querySelector('#rnMin'), $max=c.querySelector('#rnMax'), $count=c.querySelector('#rnCount'), $uniq=c.querySelector('#rnUnique'), out=c.querySelector('#rnOut'), hint=c.querySelector('#rnHint');
    function gen(){
      const min=Math.round(parseFloat($min.value)), max=Math.round(parseFloat($max.value)), count=Math.max(1,parseInt($count.value,10)||1);
      if(isNaN(min)||isNaN(max)||min>max){ hint.textContent='Min must be less than or equal to Max.'; return; }
      const range=max-min+1;
      if($uniq.checked && count>range){ hint.textContent='Cannot generate '+count+' unique values from a range of '+range+'.'; return; }
      hint.textContent='';
      let results=[];
      if($uniq.checked){
        const pool=Array.from({length:range},(_,i)=>i+min);
        for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
        results=pool.slice(0,count);
      } else {
        for(let i=0;i<count;i++) results.push(min+Math.floor(Math.random()*range));
      }
      out.value=results.join(', ');
    }
    const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Generate'; b.addEventListener('click',gen);
    c.querySelector('#rnActs').append(b, copyBtn(()=>out.value));
    gen();
  }
});

DEV_TOOLS.push({
  id:'d17', cat:'dev', name:'Random String / Token Generator', desc:'Generate random alphanumeric strings for tokens, IDs or test data.', keywords:'token id key random string',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Length</label><input type="number" id="tkLen" value="24" min="1" max="256"></div>
        <div class="field"><label>How many</label><input type="number" id="tkCount" value="5" min="1" max="200"></div>
      </div>
      <div class="form-grid">
        <div class="field"><label class="chk"><input type="checkbox" id="tkLetters" checked> Letters</label></div>
        <div class="field"><label class="chk"><input type="checkbox" id="tkDigits" checked> Digits</label></div>
      </div>
      <div class="actions" id="tkActs"></div>
      <textarea class="ta out mono" id="tkOut" rows="6" readonly></textarea>
    `;
    const $len=c.querySelector('#tkLen'), $count=c.querySelector('#tkCount'), $letters=c.querySelector('#tkLetters'), $digits=c.querySelector('#tkDigits'), out=c.querySelector('#tkOut');
    function gen(){
      let pool=''; if($letters.checked) pool+='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; if($digits.checked) pool+='0123456789';
      if(!pool){ out.value='Select at least one character set.'; return; }
      const len=Math.max(1,parseInt($len.value,10)||24), count=Math.max(1,Math.min(200,parseInt($count.value,10)||1));
      const lines=[];
      for(let n=0;n<count;n++){
        const bytes=new Uint32Array(len); crypto.getRandomValues(bytes);
        let s=''; for(let i=0;i<len;i++) s+=pool[bytes[i]%pool.length];
        lines.push(s);
      }
      out.value=lines.join('\n');
    }
    const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Generate'; b.addEventListener('click',gen);
    c.querySelector('#tkActs').append(b, copyBtn(()=>out.value));
    gen();
  }
});

DEV_TOOLS.push({
  id:'d18', cat:'dev', name:'Fake JSON Data Generator', desc:'Generate placeholder JSON records for testing UIs and APIs.', keywords:'mock seed dummy fixtures',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>How many records</label><input type="number" id="fkN" value="5" min="1" max="200"></div>
      <div class="actions" id="fkActs"></div>
      <textarea class="ta out mono" id="fkOut" rows="10" readonly></textarea>
    `;
    const FIRST=['Aarav','Diya','Kabir','Meera','Ishaan','Zara','Rohan','Anaya','Vikram','Nina','Sam','Priya','Leo','Tara','Omar'];
    const LAST=['Sharma','Khan','Patel','Iyer','Gupta','Rao','Verma','Nair','Das','Reddy','Singh','Bose','Mehta','Chowdhury'];
    const DOMAINS=['example.com','mail.dev','inbox.io','workspace.co'];
    const CITIES=['Mumbai','Delhi','Bengaluru','Pune','Jaipur','Kolkata','Hyderabad','Chennai'];
    const $n=c.querySelector('#fkN'), out=c.querySelector('#fkOut');
    function gen(){
      const n=Math.max(1,Math.min(200,parseInt($n.value,10)||5));
      const records=[];
      for(let i=0;i<n;i++){
        const f=FIRST[Math.floor(Math.random()*FIRST.length)], l=LAST[Math.floor(Math.random()*LAST.length)];
        records.push({
          id: i+1,
          name: f+' '+l,
          email: (f+'.'+l+Math.floor(Math.random()*90+10)).toLowerCase()+'@'+DOMAINS[Math.floor(Math.random()*DOMAINS.length)],
          city: CITIES[Math.floor(Math.random()*CITIES.length)],
          active: Math.random()>0.3,
          createdAt: new Date(Date.now()-Math.floor(Math.random()*3.15e10)).toISOString().slice(0,10)
        });
      }
      out.value = JSON.stringify(records, null, 2);
    }
    const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Generate'; b.addEventListener('click',gen);
    c.querySelector('#fkActs').append(b, copyBtn(()=>out.value));
    gen();
  }
});

DEV_TOOLS.push({
  id:'d19', cat:'dev', name:'JWT Decoder', desc:'Decode a JSON Web Token’s header and payload — no signature verification.', keywords:'jwt token decode auth',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>JWT</label><textarea class="ta mono" id="jwIn" rows="4" placeholder="eyJhbGciOi...header.payload.signature"></textarea></div>
      <div class="field"><label>Header</label><textarea class="ta out mono" id="jwHead" rows="4" readonly></textarea></div>
      <div class="field"><label>Payload</label><textarea class="ta out mono" id="jwPayload" rows="6" readonly></textarea></div>
      <p class="hint">This only decodes the token — it does not verify the signature, which needs the secret or public key.</p>
    `;
    const $in=c.querySelector('#jwIn'), head=c.querySelector('#jwHead'), payload=c.querySelector('#jwPayload');
    function run(){
      const parts=$in.value.trim().split('.');
      if(parts.length<2){ head.value=''; payload.value=''; return; }
      try{ head.value = JSON.stringify(JSON.parse(b64ToUtf8(b64urlToB64(parts[0]))), null, 2); }catch(e){ head.value='Could not decode header.'; }
      try{ payload.value = JSON.stringify(JSON.parse(b64ToUtf8(b64urlToB64(parts[1]))), null, 2); }catch(e){ payload.value='Could not decode payload.'; }
    }
    $in.addEventListener('input', run);
  }
});

DEV_TOOLS.push({
  id:'d20', cat:'dev', name:'Unix Timestamp Converter', desc:'Convert between Unix timestamps and human-readable dates.', keywords:'epoch time date convert',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Unix timestamp</label><input type="number" id="tsIn" class="mono"></div>
        <div class="field"><label>Unit</label><select id="tsUnit"><option value="s">Seconds</option><option value="ms">Milliseconds</option></select></div>
      </div>
      <div class="actions" id="tsActs"></div>
      <div class="result-box" id="tsOut">—</div>
    `;
    const $ts=c.querySelector('#tsIn'), $unit=c.querySelector('#tsUnit'), out=c.querySelector('#tsOut');
    function run(){
      const v=parseFloat($ts.value);
      if(isNaN(v)){ out.innerHTML='<span class="muted">Enter a timestamp, or click “Now”.</span>'; return; }
      const ms = $unit.value==='s' ? v*1000 : v;
      const d=new Date(ms);
      if(isNaN(d.getTime())){ out.innerHTML='<span class="muted">Invalid timestamp.</span>'; return; }
      out.innerHTML = `<div class="result-big" style="font-size:19px">${d.toISOString()}</div><p class="hint">${d.toString()}</p>`;
    }
    [$ts,$unit].forEach(e=>e.addEventListener('input',run));
    const nowBtn=document.createElement('button'); nowBtn.type='button'; nowBtn.className='btn ghost'; nowBtn.textContent='Now';
    nowBtn.addEventListener('click', ()=>{ $unit.value='s'; $ts.value=Math.floor(Date.now()/1000); run(); });
    c.querySelector('#tsActs').appendChild(nowBtn);
  }
});

DEV_TOOLS.push({
  id:'d21', cat:'dev', name:'Cron Expression Explainer', desc:'Break down a 5-field cron expression into plain English.', keywords:'schedule crontab explain',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Cron expression (minute hour day-of-month month day-of-week)</label><input type="text" id="crIn" class="mono" value="0 9 * * 1-5"></div>
      <div class="actions" id="crActs"></div>
      <div class="result-box" id="crOut"></div>
      <div class="table-wrap" style="margin-top:10px"><table class="data-table"><tbody id="crTable"></tbody></table></div>
    `;
    const $in=c.querySelector('#crIn'), out=c.querySelector('#crOut'), table=c.querySelector('#crTable');
    const DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    function describeField(val, names){
      if(val==='*') return 'every '+(names?'value':'unit');
      if(val.includes('/')){ const [base,step]=val.split('/'); return 'every '+step+ (base==='*'?'':' starting at '+base); }
      if(val.includes('-')){ const [a,b]=val.split('-'); return 'between '+(names?names[+a]:a)+' and '+(names?names[+b]:b); }
      if(val.includes(',')) return 'at '+val.split(',').map(v=>names?names[+v]:v).join(', ');
      return (names? names[+val] : val);
    }
    function run(){
      const parts=$in.value.trim().split(/\s+/);
      if(parts.length!==5){ out.innerHTML='<span class="muted">Enter exactly 5 fields: minute hour day month weekday.</span>'; table.innerHTML=''; return; }
      const [min,hr,dom,mon,dow]=parts;
      const sentence = `Runs at minute ${describeField(min)} of hour ${describeField(hr)}, on day-of-month ${describeField(dom)}, in month ${describeField(mon)}, on ${describeField(dow, DOW)}.`;
      out.innerHTML = `<p style="margin:0">${esc(sentence)}</p>`;
      table.innerHTML = [
        ['Minute (0-59)', min], ['Hour (0-23)', hr], ['Day of month (1-31)', dom], ['Month (1-12)', mon], ['Day of week (0-6, Sun=0)', dow]
      ].map(([l,v])=>`<tr><td>${l}</td><td class="mono">${esc(v)}</td></tr>`).join('');
    }
    $in.addEventListener('input', run);
    const presets=[['Every minute','* * * * *'],['Hourly','0 * * * *'],['Daily at midnight','0 0 * * *'],['Weekdays at 9am','0 9 * * 1-5']];
    presets.forEach(([label,val])=>{
      const b=document.createElement('button'); b.type='button'; b.className='btn ghost small'; b.textContent=label;
      b.addEventListener('click', ()=>{ $in.value=val; run(); });
      c.querySelector('#crActs').appendChild(b);
    });
    run();
  }
});

DEV_TOOLS.push({
  id:'d22', cat:'dev', name:'Code Diff Viewer', desc:'Compare two versions of a code snippet line by line.', keywords:'diff compare code version',
  mount(c){
    c.innerHTML = `
      <div class="form-grid" style="grid-template-columns:1fr">
        <div class="field"><label>Version A</label><textarea class="ta mono" id="cdA" rows="7" placeholder="Original code…"></textarea></div>
        <div class="field"><label>Version B</label><textarea class="ta mono" id="cdB" rows="7" placeholder="Changed code…"></textarea></div>
      </div>
      <div class="actions"><button class="btn primary" id="cdRun" type="button">Compare</button></div>
      <div class="result-box" id="cdOut" style="padding:8px"><span class="muted" style="padding:8px;display:block">Diff will appear here.</span></div>
    `;
    const $a=c.querySelector('#cdA'), $b=c.querySelector('#cdB'), out=c.querySelector('#cdOut');
    c.querySelector('#cdRun').addEventListener('click', ()=> renderDiff(out, lineDiff($a.value,$b.value)));
  }
});

DEV_TOOLS.push({
  id:'d23', cat:'dev', name:'Query String Parser & Builder', desc:'Break a URL’s query string into a table, or build one from key/value pairs.', keywords:'url params querystring',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>URL or query string</label><input type="text" id="qsIn" placeholder="https://example.com/search?q=shoes&sort=price"></div>
      <div class="actions"><button class="btn primary" id="qsParse" type="button">Parse</button><button class="btn ghost" id="qsAddRow" type="button">Add Row</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Key</th><th>Value</th><th></th></tr></thead><tbody id="qsBody"></tbody></table></div>
      <div class="actions"><button class="btn primary" id="qsBuild" type="button">Rebuild Query String</button></div>
      <textarea class="ta out mono" id="qsOut" rows="2" readonly></textarea>
    `;
    const $in=c.querySelector('#qsIn'), body=c.querySelector('#qsBody'), out=c.querySelector('#qsOut');
    function addRow(k,v){
      const tr=document.createElement('tr');
      tr.innerHTML = `<td><input type="text" class="mono qsKey" value="${esc(k||'')}"></td><td><input type="text" class="mono qsVal" value="${esc(v||'')}"></td><td><button class="btn ghost small qsDel" type="button">✕</button></td>`;
      tr.querySelector('.qsDel').addEventListener('click', ()=>tr.remove());
      body.appendChild(tr);
    }
    c.querySelector('#qsParse').addEventListener('click', ()=>{
      body.innerHTML='';
      const raw=$in.value.split('?')[1] ?? $in.value;
      if(!raw){ addRow('',''); return; }
      raw.split('&').filter(Boolean).forEach(pair=>{
        const [k,v='']=pair.split('=');
        addRow(decodeURIComponent(k||''), decodeURIComponent(v.replace(/\+/g,' ')||''));
      });
      if(!body.children.length) addRow('','');
    });
    c.querySelector('#qsAddRow').addEventListener('click', ()=>addRow('',''));
    c.querySelector('#qsBuild').addEventListener('click', ()=>{
      const pairs=[...body.querySelectorAll('tr')].map(tr=>{
        const k=tr.querySelector('.qsKey').value, v=tr.querySelector('.qsVal').value;
        return k ? encodeURIComponent(k)+'='+encodeURIComponent(v) : null;
      }).filter(Boolean);
      out.value = pairs.join('&');
    });
    addRow('q','shoes'); addRow('sort','price');
  }
});

DEV_TOOLS.push({
  id:'d24', cat:'dev', name:'HTTP Status Code Lookup', desc:'Search HTTP status codes and see what each one means.', keywords:'status codes reference http',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Search by code or name</label><input type="text" id="scSearch" placeholder="e.g. 404, unauthorized…"></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Code</th><th>Name</th><th>Meaning</th></tr></thead><tbody id="scBody"></tbody></table></div>
    `;
    const $s=c.querySelector('#scSearch'), body=c.querySelector('#scBody');
    function run(){
      const q=$s.value.trim().toLowerCase();
      const rows = HTTP_STATUS_CODES.filter(([code,name])=> !q || String(code).includes(q) || name.toLowerCase().includes(q));
      body.innerHTML = rows.length ? rows.map(([code,name,desc])=>`<tr><td class="mono">${code}</td><td>${esc(name)}</td><td>${esc(desc)}</td></tr>`).join('') : '<tr><td colspan="3" class="hint">No matching status codes.</td></tr>';
    }
    $s.addEventListener('input',run); run();
  }
});

DEV_TOOLS.push({
  id:'d25', cat:'dev', name:'Color Code Snippet Generator', desc:'Turn a hex color into CSS variable, SCSS, RGBA and Tailwind-style snippets.', keywords:'css scss variable snippet color',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Color</label><input type="color" id="csColor" value="#2563EB"></div>
        <div class="field"><label>Variable name</label><input type="text" id="csName" value="brand-accent"></div>
      </div>
      <textarea class="ta out mono" id="csOut" rows="8" readonly></textarea>
      <div class="actions" id="csActs"></div>
    `;
    const $color=c.querySelector('#csColor'), $name=c.querySelector('#csName'), out=c.querySelector('#csOut');
    function run(){
      const hex=$color.value, rgb=hexToRgb(hex), hsl=rgbToHsl(rgb.r,rgb.g,rgb.b);
      const name=($name.value||'color').trim().replace(/\s+/g,'-');
      out.value = [
        `--${name}: ${hex};`,
        `$${name}: ${hex};`,
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
        `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        `bg-[${hex}]  /* Tailwind arbitrary value */`
      ].join('\n');
    }
    [$color,$name].forEach(e=>e.addEventListener('input',run));
    c.querySelector('#csActs').appendChild(copyBtn(()=>out.value));
    run();
  }
});

DEV_TOOLS.push({
  id:'d26', cat:'dev', name:'Subnet / CIDR Calculator', desc:'Enter an IPv4 address and CIDR prefix to get the subnet mask, network range and usable host count.', keywords:'subnet cidr calculator ip network mask netmask',
  mount(c){
    formTool(c, {
      fields:[
        {key:'ip', label:'IPv4 address', type:'text', value:'192.168.1.10'},
        {key:'cidr', label:'CIDR prefix (0-32)', type:'number', value:24, step:1}
      ],
      compute(v){
        const parts = String(v.ip).trim().split('.');
        if(parts.length!==4 || parts.some(p=>!/^\d+$/.test(p) || +p<0 || +p>255)) throw new Error('bad ip');
        const cidr = Math.round(v.cidr);
        if(!(cidr>=0 && cidr<=32)) throw new Error('bad cidr');
        const ipNum = parts.reduce((acc,p)=> (acc*256)+ (+p), 0) >>> 0;
        const maskNum = cidr===0 ? 0 : (0xFFFFFFFF << (32-cidr)) >>> 0;
        const netNum = (ipNum & maskNum) >>> 0;
        const bcastNum = (netNum | (~maskNum >>> 0)) >>> 0;
        const toIp = n => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
        const totalHosts = Math.pow(2, 32-cidr);
        const usable = cidr>=31 ? totalHosts : Math.max(0, totalHosts-2);
        const firstHost = cidr>=31 ? toIp(netNum) : toIp(netNum+1);
        const lastHost = cidr>=31 ? toIp(bcastNum) : toIp(bcastNum-1);
        return `<div class="stat-grid">
          <div class="stat"><span class="stat-val">${toIp(maskNum)}</span><span class="stat-lbl">Subnet Mask</span></div>
          <div class="stat"><span class="stat-val">${toIp(netNum)}</span><span class="stat-lbl">Network Address</span></div>
          <div class="stat"><span class="stat-val">${toIp(bcastNum)}</span><span class="stat-lbl">Broadcast Address</span></div>
          <div class="stat"><span class="stat-val">${firstHost} – ${lastHost}</span><span class="stat-lbl">Usable Host Range</span></div>
          <div class="stat"><span class="stat-val">${usable.toLocaleString()}</span><span class="stat-lbl">Usable Hosts</span></div>
        </div>`;
      },
      note:'Works for IPv4 only. /31 and /32 are treated as point-to-point / single-host per RFC 3021.'
    });
  }
});

DEV_TOOLS.push({
  id:'d27', cat:'dev', name:'Credit Card Number Validator (Luhn)', desc:'Check whether a card number passes the Luhn checksum used by real card issuers — handy for testing payment forms.', keywords:'credit card validator luhn algorithm checksum test',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Card number</label><input type="text" id="ccIn" inputmode="numeric" placeholder="4111 1111 1111 1111"></div>
      <div class="result-box" id="ccOut">Enter a number above.</div>
      <p class="hint">This only checks the Luhn checksum (a mathematical format check) — it does not verify that a card is real, active or has funds.</p>
    `;
    const $in=c.querySelector('#ccIn'), $out=c.querySelector('#ccOut');
    function luhnValid(numStr){
      let sum=0, alt=false;
      for(let i=numStr.length-1;i>=0;i--){
        let d = numStr.charCodeAt(i)-48;
        if(alt){ d*=2; if(d>9) d-=9; }
        sum+=d; alt=!alt;
      }
      return sum%10===0;
    }
    function detectType(digits){
      if(/^4/.test(digits)) return 'Visa';
      if(/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) return 'Mastercard';
      if(/^3[47]/.test(digits)) return 'American Express';
      if(/^6(?:011|5)/.test(digits)) return 'Discover';
      if(/^35/.test(digits)) return 'JCB';
      return 'Unknown / other';
    }
    $in.addEventListener('input', ()=>{
      const digits = $in.value.replace(/\D/g,'');
      if(!digits){ $out.innerHTML = 'Enter a number above.'; return; }
      if(digits.length<8){ $out.innerHTML = '<span class="muted">Keep typing...</span>'; return; }
      const valid = luhnValid(digits);
      $out.innerHTML = valid
        ? `<span style="color:#059669">✓ Valid Luhn checksum</span> — likely type: ${detectType(digits)}`
        : `<span style="color:#DC2626">✗ Fails Luhn checksum</span> — not a valid card number format`;
    });
  }
});

DEV_TOOLS.push({
  id:'d28', cat:'dev', name:'Screen Resolution & Viewport Info', desc:'See your screen resolution, browser viewport size, pixel ratio and other display details at a glance.', keywords:'screen resolution viewport size pixel ratio browser info',
  mount(c){
    c.innerHTML = `<div class="stat-grid" id="srOut"></div><p class="hint">Updates live as you resize your browser window.</p>`;
    const $out=c.querySelector('#srOut');
    function render(){
      const stats=[
        {v: window.screen.width+' × '+window.screen.height, l:'Screen Resolution'},
        {v: window.innerWidth+' × '+window.innerHeight, l:'Viewport Size'},
        {v: (window.devicePixelRatio||1)+'×', l:'Device Pixel Ratio'},
        {v: (window.screen.colorDepth||'—')+'-bit', l:'Color Depth'},
        {v: navigator.language || '—', l:'Browser Language'},
        {v: (screen.orientation && screen.orientation.type) || (window.innerWidth>window.innerHeight?'landscape':'portrait'), l:'Orientation'}
      ];
      $out.innerHTML = stats.map(s=>`<div class="stat"><span class="stat-val">${esc(String(s.v))}</span><span class="stat-lbl">${esc(s.l)}</span></div>`).join('');
    }
    render();
    const onResize = ()=>render();
    window.addEventListener('resize', onResize);
    onToolCleanup(()=>window.removeEventListener('resize', onResize));
  }
});

DEV_TOOLS.push({
  id:'d29', cat:'dev', name:'Download Time Estimator', desc:'Estimate how long a file will take to download (or upload) at a given internet speed.', keywords:'download time calculator internet speed file size estimator',
  mount(c){
    formTool(c, {
      fields:[
        {key:'size', label:'File size', type:'number', value:1, step:0.1},
        {key:'sizeUnit', label:'Size unit', type:'select', default:'GB', options:[{v:'KB',l:'KB'},{v:'MB',l:'MB'},{v:'GB',l:'GB'}]},
        {key:'speed', label:'Connection speed', type:'number', value:50, step:1},
        {key:'speedUnit', label:'Speed unit', type:'select', default:'Mbps', options:[{v:'Kbps',l:'Kbps'},{v:'Mbps',l:'Mbps'},{v:'Gbps',l:'Gbps'}]}
      ],
      compute(v){
        if(!(v.size>0) || !(v.speed>0)) throw new Error('bad');
        const sizeBytesMap={KB:1024, MB:1024*1024, GB:1024*1024*1024};
        const speedBpsMap={Kbps:1000, Mbps:1000*1000, Gbps:1000*1000*1000};
        const totalBits = v.size * sizeBytesMap[v.sizeUnit] * 8;
        const bps = v.speed * speedBpsMap[v.speedUnit];
        const seconds = totalBits / bps;
        function fmt(s){
          if(s<60) return s.toFixed(1)+' sec';
          if(s<3600) return Math.floor(s/60)+' min '+Math.round(s%60)+' sec';
          const h=Math.floor(s/3600), m=Math.round((s%3600)/60);
          return h+' hr '+m+' min';
        }
        return `<div class="stat-grid">
          <div class="stat"><span class="stat-val">${fmt(seconds)}</span><span class="stat-lbl">Estimated Time</span></div>
          <div class="stat"><span class="stat-val">${(bps/8/1024/1024).toFixed(2)} MB/s</span><span class="stat-lbl">Effective Speed</span></div>
        </div>`;
      },
      note:'Assumes a steady connection with no overhead — real-world speeds are usually a bit lower.'
    });
  }
});
/* ===== DEV_TOOLS_MARKER ===== */

/* ======================================================================
   CONVERTER_TOOLS -- Unit Converters (Phase 1a of the site upgrade)
   All computation is local, vanilla JS, no libraries, no network calls.
   ====================================================================== */
function makeUnitConverterTool(unitsTable, opts){
  opts = opts||{};
  return function(c){
    const keys = Object.keys(unitsTable);
    const optionsList = keys.map(k=>({v:k, l:(opts.labels&&opts.labels[k])||k}));
    formTool(c, {
      note: opts.note,
      fields:[
        {key:'value', label:'Value', type:'number', default: opts.defaultValue!==undefined?opts.defaultValue:1, step:'any'},
        {key:'from', label:'From', type:'select', default: opts.defaultFrom||keys[0], options:optionsList},
        {key:'to', label:'To', type:'select', default: opts.defaultTo||keys[1]||keys[0], options:optionsList}
      ],
      compute(v){
        if(isNaN(v.value)) throw new Error('bad value');
        const r = v.value*unitsTable[v.from]/unitsTable[v.to];
        const decimals = opts.decimals!==undefined?opts.decimals:6;
        return `<div class="result-big">${r.toLocaleString(undefined,{maximumFractionDigits:decimals})}</div>`;
      }
    });
    const row=document.createElement('div'); row.className='actions';
    row.appendChild(copyBtn(()=>{ const el=c.querySelector('#fResult'); return el?el.innerText:''; }));
    c.appendChild(row);
  };
}

const UNITS_TIME = {ms:0.001, s:1, min:60, hr:3600, day:86400, week:604800, month:2629800, year:31557600};
CONVERTER_TOOLS.push({
  id:'u01', cat:'converters', name:'Time Converter', desc:'Convert between milliseconds, seconds, minutes, hours, days, weeks, months and years.', keywords:'time unit duration seconds minutes hours days convert',
  mount: makeUnitConverterTool(UNITS_TIME, {
    labels:{ms:'Milliseconds', s:'Seconds', min:'Minutes', hr:'Hours', day:'Days', week:'Weeks', month:'Months (avg)', year:'Years'},
    defaultFrom:'min', defaultTo:'hr', defaultValue:90, decimals:6,
    note:'Months and years use average calendar lengths (30.44 and 365.25 days).'
  })
});

const UNITS_DATA = {bit:0.125, byte:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776, PB:1125899906842624};
CONVERTER_TOOLS.push({
  id:'u02', cat:'converters', name:'Data Storage Converter', desc:'Convert between bits, bytes, KB, MB, GB, TB and PB using binary (1024-based) units.', keywords:'data storage bytes megabytes gigabytes file size convert',
  mount: makeUnitConverterTool(UNITS_DATA, {
    labels:{bit:'Bits', byte:'Bytes', KB:'Kilobytes (KB)', MB:'Megabytes (MB)', GB:'Gigabytes (GB)', TB:'Terabytes (TB)', PB:'Petabytes (PB)'},
    defaultFrom:'MB', defaultTo:'GB', defaultValue:500, decimals:8,
    note:'Uses binary units (1 KB = 1024 bytes), matching how operating systems report file sizes.'
  })
});

const UNITS_ENERGY = {J:1, kJ:1000, cal:4.184, kcal:4184, Wh:3600, kWh:3600000, BTU:1055.06};
CONVERTER_TOOLS.push({
  id:'u03', cat:'converters', name:'Energy Converter', desc:'Convert between joules, calories, watt-hours, kilowatt-hours and BTU.', keywords:'energy joules calories kwh btu convert',
  mount: makeUnitConverterTool(UNITS_ENERGY, {
    labels:{J:'Joules', kJ:'Kilojoules', cal:'Calories', kcal:'Kilocalories', Wh:'Watt-hours', kWh:'Kilowatt-hours', BTU:'BTU'},
    defaultFrom:'kcal', defaultTo:'kJ', defaultValue:250, decimals:4
  })
});

const UNITS_PRESSURE = {Pa:1, kPa:1000, bar:100000, psi:6894.76, atm:101325, mmHg:133.322};
CONVERTER_TOOLS.push({
  id:'u04', cat:'converters', name:'Pressure Converter', desc:'Convert between pascals, bar, PSI, atmospheres and mmHg.', keywords:'pressure psi bar pascal atmosphere convert',
  mount: makeUnitConverterTool(UNITS_PRESSURE, {
    labels:{Pa:'Pascals', kPa:'Kilopascals', bar:'Bar', psi:'PSI', atm:'Atmospheres', mmHg:'mmHg'},
    defaultFrom:'psi', defaultTo:'bar', defaultValue:30, decimals:6
  })
});

const UNITS_POWER = {W:1, kW:1000, MW:1000000, hp:745.7, BTUh:0.293071};
CONVERTER_TOOLS.push({
  id:'u05', cat:'converters', name:'Power Converter', desc:'Convert between watts, kilowatts, horsepower and BTU per hour.', keywords:'power watts kilowatts horsepower convert',
  mount: makeUnitConverterTool(UNITS_POWER, {
    labels:{W:'Watts', kW:'Kilowatts', MW:'Megawatts', hp:'Horsepower', BTUh:'BTU/hour'},
    defaultFrom:'hp', defaultTo:'kW', defaultValue:100, decimals:6
  })
});

const UNITS_FREQ = {Hz:1, kHz:1000, MHz:1000000, GHz:1000000000};
CONVERTER_TOOLS.push({
  id:'u06', cat:'converters', name:'Frequency Converter', desc:'Convert between hertz, kilohertz, megahertz and gigahertz.', keywords:'frequency hertz hz mhz ghz convert',
  mount: makeUnitConverterTool(UNITS_FREQ, {
    labels:{Hz:'Hertz', kHz:'Kilohertz', MHz:'Megahertz', GHz:'Gigahertz'},
    defaultFrom:'MHz', defaultTo:'GHz', defaultValue:2400, decimals:8
  })
});

const UNITS_ANGLE = {deg:1, rad:180/Math.PI, grad:0.9, arcmin:1/60, arcsec:1/3600};
CONVERTER_TOOLS.push({
  id:'u07', cat:'converters', name:'Angle Converter', desc:'Convert between degrees, radians, gradians, arcminutes and arcseconds.', keywords:'angle degrees radians gradians convert',
  mount: makeUnitConverterTool(UNITS_ANGLE, {
    labels:{deg:'Degrees', rad:'Radians', grad:'Gradians', arcmin:'Arcminutes', arcsec:'Arcseconds'},
    defaultFrom:'deg', defaultTo:'rad', defaultValue:180, decimals:8
  })
});

const UNITS_FORCE = {N:1, kN:1000, lbf:4.44822, dyn:0.00001, kgf:9.80665};
CONVERTER_TOOLS.push({
  id:'u08', cat:'converters', name:'Force Converter', desc:'Convert between newtons, kilonewtons, pound-force, dyne and kilogram-force.', keywords:'force newton pound dyne convert',
  mount: makeUnitConverterTool(UNITS_FORCE, {
    labels:{N:'Newtons', kN:'Kilonewtons', lbf:'Pound-force', dyn:'Dyne', kgf:'Kilogram-force'},
    defaultFrom:'N', defaultTo:'lbf', defaultValue:100, decimals:6
  })
});

const UNITS_TORQUE = {Nm:1, kNm:1000, lbft:1.35582, lbin:0.112985, kgfm:9.80665};
CONVERTER_TOOLS.push({
  id:'u09', cat:'converters', name:'Torque Converter', desc:'Convert between newton-metres, pound-feet, pound-inches and kilogram-force metres.', keywords:'torque newton metre pound foot convert',
  mount: makeUnitConverterTool(UNITS_TORQUE, {
    labels:{Nm:'Newton-metres', kNm:'Kilonewton-metres', lbft:'Pound-feet (lb·ft)', lbin:'Pound-inches (lb·in)', kgfm:'Kilogram-force metres'},
    defaultFrom:'Nm', defaultTo:'lbft', defaultValue:50, decimals:6
  })
});

const UNITS_ACCEL = {ms2:1, fts2:0.3048, g:9.80665, gal:0.01};
CONVERTER_TOOLS.push({
  id:'u10', cat:'converters', name:'Acceleration Converter', desc:'Convert between m/s², ft/s², standard gravity (g) and Gal.', keywords:'acceleration gravity g-force convert',
  mount: makeUnitConverterTool(UNITS_ACCEL, {
    labels:{ms2:'m/s²', fts2:'ft/s²', g:'g (standard gravity)', gal:'Gal (cm/s²)'},
    defaultFrom:'g', defaultTo:'ms2', defaultValue:1, decimals:6
  })
});

CONVERTER_TOOLS.push({
  id:'u11', cat:'converters', name:'Fuel Economy Converter', desc:'Convert between MPG (US), MPG (UK/Imperial), km per litre and litres per 100km.', keywords:'fuel economy mileage mpg litres consumption convert',
  mount(c){
    formTool(c, {
      note:'L/100km is a consumption figure (lower is better); MPG and km/L are efficiency figures (higher is better).',
      fields:[
        {key:'value', label:'Value', type:'number', default:30, step:'any'},
        {key:'from', label:'From', type:'select', default:'mpgus', options:[{v:'mpgus',l:'MPG (US)'},{v:'mpguk',l:'MPG (UK/Imperial)'},{v:'kmpl',l:'km per litre'},{v:'l100km',l:'L / 100 km'}]},
        {key:'to', label:'To', type:'select', default:'l100km', options:[{v:'mpgus',l:'MPG (US)'},{v:'mpguk',l:'MPG (UK/Imperial)'},{v:'kmpl',l:'km per litre'},{v:'l100km',l:'L / 100 km'}]}
      ],
      compute(v){
        if(!(v.value>0)) throw new Error('bad value');
        let l100;
        if(v.from==='mpgus') l100 = 235.214583/v.value;
        else if(v.from==='mpguk') l100 = 282.480936/v.value;
        else if(v.from==='kmpl') l100 = 100/v.value;
        else l100 = v.value;
        if(!(l100>0)) throw new Error('bad value');
        let out;
        if(v.to==='mpgus') out = 235.214583/l100;
        else if(v.to==='mpguk') out = 282.480936/l100;
        else if(v.to==='kmpl') out = 100/l100;
        else out = l100;
        return `<div class="result-big">${out.toLocaleString(undefined,{maximumFractionDigits:3})}</div>`;
      }
    });
    const row=document.createElement('div'); row.className='actions';
    row.appendChild(copyBtn(()=>{ const el=c.querySelector('#fResult'); return el?el.innerText:''; }));
    c.appendChild(row);
  }
});

const UNITS_LUX = {lux:1, fc:10.7639};
CONVERTER_TOOLS.push({
  id:'u12', cat:'converters', name:'Illuminance Converter', desc:'Convert between lux and foot-candles.', keywords:'illuminance lux foot-candle light level convert',
  mount: makeUnitConverterTool(UNITS_LUX, {
    labels:{lux:'Lux', fc:'Foot-candles'},
    defaultFrom:'lux', defaultTo:'fc', defaultValue:500, decimals:6
  })
});

const UNITS_RATE = {bps:1, kbps:1000, Mbps:1000000, Gbps:1000000000, Bps:8, KBps:8000, MBps:8000000};
CONVERTER_TOOLS.push({
  id:'u13', cat:'converters', name:'Digital Data Rate Converter', desc:'Convert between bps, kbps, Mbps, Gbps and bytes/KB/MB per second.', keywords:'data rate bandwidth mbps gbps internet speed convert',
  mount: makeUnitConverterTool(UNITS_RATE, {
    labels:{bps:'bits/s (bps)', kbps:'kilobits/s (kbps)', Mbps:'megabits/s (Mbps)', Gbps:'gigabits/s (Gbps)', Bps:'bytes/s', KBps:'kilobytes/s (KB/s)', MBps:'megabytes/s (MB/s)'},
    defaultFrom:'Mbps', defaultTo:'MBps', defaultValue:100, decimals:6,
    note:'Uses decimal (SI) units common in networking -- 1 kbps = 1000 bps.'
  })
});

const UNITS_RADIATION = {Gy:1, rad:0.01, Sv:1, rem:0.01};
CONVERTER_TOOLS.push({
  id:'u14', cat:'converters', name:'Radiation Dose Converter', desc:'Convert between gray, rad, sievert and rem.', keywords:'radiation dose gray sievert rem rad convert',
  mount: makeUnitConverterTool(UNITS_RADIATION, {
    labels:{Gy:'Gray (Gy)', rad:'Rad', Sv:'Sievert (Sv)', rem:'Rem'},
    defaultFrom:'Sv', defaultTo:'rem', defaultValue:1, decimals:6,
    note:'Assumes a radiation quality factor of 1 (e.g. X-rays, gamma, beta), where gray and sievert are numerically equivalent. For other radiation types, consult a specialist reference.'
  })
});

CONVERTER_TOOLS.push({
  id:'u15', cat:'converters', name:'Decibel (dB) Calculator', desc:'Convert between a power or amplitude ratio and decibels (dB).', keywords:'decibel db sound level gain logarithmic ratio convert',
  mount(c){
    formTool(c, {
      note:'Power ratios (e.g. energy, wattage) use 10·log10(ratio). Amplitude ratios (e.g. voltage, sound pressure) use 20·log10(ratio).',
      fields:[
        {key:'kind', label:'Quantity type', type:'select', default:'power', options:[{v:'power',l:'Power ratio (10·log10)'},{v:'amplitude',l:'Amplitude / voltage ratio (20·log10)'}]},
        {key:'direction', label:'Convert', type:'select', default:'toDb', options:[{v:'toDb',l:'Ratio → dB'},{v:'toRatio',l:'dB → Ratio'}]},
        {key:'value', label:'Value', type:'number', default:2, step:'any'}
      ],
      compute(v){
        const mult = v.kind==='power'?10:20;
        if(v.direction==='toDb'){
          if(!(v.value>0)) throw new Error('ratio must be > 0');
          const db = mult*Math.log10(v.value);
          return `<div class="result-big">${db.toLocaleString(undefined,{maximumFractionDigits:3})} dB</div>`;
        } else {
          const ratio = Math.pow(10, v.value/mult);
          return `<div class="result-big">${ratio.toLocaleString(undefined,{maximumFractionDigits:6})}×</div>`;
        }
      }
    });
    const row=document.createElement('div'); row.className='actions';
    row.appendChild(copyBtn(()=>{ const el=c.querySelector('#fResult'); return el?el.innerText:''; }));
    c.appendChild(row);
  }
});

/* ===== CONVERTER_TOOLS_MARKER ===== */

/* ======================================================================
   SECURITY_TOOLS -- Security & Privacy tools (Phase 1a)
   All hashing/generation happens locally; nothing is ever uploaded.
   MD5 is implemented by hand below because the Web Crypto API does not
   support it (it is only offered for legacy-compatibility checks).
   ====================================================================== */
function tpMD5Bytes(bytes){
  function rotl(x,n){ return (x<<n)|(x>>>(32-n)); }
  const bitLenLow = (bytes.length*8)>>>0;
  const bitLenHigh = Math.floor(bytes.length / 536870912);
  const totalLen = Math.ceil((bytes.length+9)/64)*64;
  const buf = new Uint8Array(totalLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(totalLen-8, bitLenLow, true);
  dv.setUint32(totalLen-4, bitLenHigh, true);
  const words = [];
  for(let i=0;i<totalLen;i+=4) words.push(dv.getUint32(i,true));
  const K = new Int32Array([
    -680876936,-389564586,606105819,-1044525330,-176418897,1200080426,-1473231341,-45705983,
    1770035416,-1958414417,-42063,-1990404162,1804603682,-40341101,-1502002290,1236535329,
    -165796510,-1069501632,643717713,-373897302,-701558691,38016083,-660478335,-405537848,
    568446438,-1019803690,-187363961,1163531501,-1444681467,-51403784,1735328473,-1926607734,
    -378558,-2022574463,1839030562,-35309556,-1530992060,1272893353,-155497632,-1094730640,
    681279174,-358537222,-722521979,76029189,-640364487,-421815835,530742520,-995338651,
    -198630844,1126891415,-1416354905,-57434055,1700485571,-1894986606,-1051523,-2054922799,
    1873313359,-30611744,-1560198380,1309151649,-145523070,-1120210379,718787259,-343485551
  ]);
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
             5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
             6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  let a0=1732584193, b0=-271733879, c0=-1732584194, d0=271733878;
  for(let chunk=0; chunk<words.length; chunk+=16){
    let A=a0,B=b0,C=c0,D=d0;
    for(let i=0;i<64;i++){
      let F,g;
      if(i<16){ F=(B&C)|(~B&D); g=i; }
      else if(i<32){ F=(D&B)|(~D&C); g=(5*i+1)%16; }
      else if(i<48){ F=B^C^D; g=(3*i+5)%16; }
      else { F=C^(B|~D); g=(7*i)%16; }
      F = (F + A + K[i] + words[chunk+g])|0;
      A=D; D=C; C=B;
      B = (B + rotl(F, S[i]))|0;
    }
    a0=(a0+A)|0; b0=(b0+B)|0; c0=(c0+C)|0; d0=(d0+D)|0;
  }
  function toHexLE(n){
    const bytes=[n&0xff,(n>>>8)&0xff,(n>>>16)&0xff,(n>>>24)&0xff];
    return bytes.map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  return toHexLE(a0>>>0)+toHexLE(b0>>>0)+toHexLE(c0>>>0)+toHexLE(d0>>>0);
}
function tpMD5(str){ return tpMD5Bytes(new TextEncoder().encode(str)); }

SECURITY_TOOLS.push({
  id:'s01', cat:'security', name:'Password Strength Checker', desc:'Check how strong an existing password is, with a criteria checklist and estimated crack time.', keywords:'password strength entropy security check',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Password</label>
        <div style="display:flex; gap:8px;">
          <input type="password" id="pwIn" class="ta" style="flex:1" autocomplete="off" placeholder="Type or paste a password">
          <button class="btn ghost" id="pwToggle" type="button">Show</button>
        </div>
      </div>
      <div class="result-box" id="pwResult">—</div>
      <ul id="pwChecklist" style="list-style:none; padding:0; margin:10px 0 0; display:grid; gap:4px;"></ul>
      <p class="hint" id="pwNote"></p>
    `;
    const $in=c.querySelector('#pwIn'), $toggle=c.querySelector('#pwToggle'), $res=c.querySelector('#pwResult'), $list=c.querySelector('#pwChecklist'), $note=c.querySelector('#pwNote');
    $toggle.addEventListener('click', ()=>{
      const show = $in.type==='password';
      $in.type = show?'text':'password';
      $toggle.textContent = show?'Hide':'Show';
    });
    function humanizeDuration(seconds){
      if(seconds<1) return 'instantly';
      const units = [['year',31557600],['day',86400],['hour',3600],['minute',60],['second',1]];
      for(const [name,secs] of units){
        if(seconds>=secs){
          const val = seconds/secs;
          if(val>1e6) return 'centuries';
          const rounded = Math.round(val);
          return rounded.toLocaleString()+' '+name+(rounded===1?'':'s');
        }
      }
      return 'instantly';
    }
    function check(){
      const pw = $in.value;
      const common = ['password','123456','qwerty','letmein','111111','12345678','iloveyou','admin','welcome','abc123'];
      const rules = [
        {label:'At least 8 characters', pass: pw.length>=8},
        {label:'At least 12 characters (recommended)', pass: pw.length>=12},
        {label:'Contains a lowercase letter', pass: /[a-z]/.test(pw)},
        {label:'Contains an uppercase letter', pass: /[A-Z]/.test(pw)},
        {label:'Contains a number', pass: /[0-9]/.test(pw)},
        {label:'Contains a symbol', pass: /[^A-Za-z0-9]/.test(pw)},
        {label:'Not a common or repeated pattern', pass: pw.length>0 && !/^(.)\1+$/.test(pw) && !common.includes(pw.toLowerCase())}
      ];
      $list.innerHTML = rules.map(r=>`<li>${r.pass?'✅':'⬜'} ${esc(r.label)}</li>`).join('');
      if(!pw){ $res.innerHTML = '<span class="muted">Enter a password to check its strength.</span>'; $note.textContent=''; return; }
      let poolSize = 0;
      if(/[a-z]/.test(pw)) poolSize+=26;
      if(/[A-Z]/.test(pw)) poolSize+=26;
      if(/[0-9]/.test(pw)) poolSize+=10;
      if(/[^A-Za-z0-9]/.test(pw)) poolSize+=32;
      const entropy = pw.length * Math.log2(poolSize||1);
      let label, col;
      if(entropy<28){ label='Very Weak'; col='#DC2626'; }
      else if(entropy<36){ label='Weak'; col='#F97316'; }
      else if(entropy<60){ label='Fair'; col='#EAB308'; }
      else if(entropy<80){ label='Strong'; col='#16A34A'; }
      else { label='Very Strong'; col='#0891B2'; }
      const guesses = Math.pow(2, entropy);
      const seconds = guesses / 1e10 / 2; // 10B guesses/sec offline fast-hash assumption
      $res.innerHTML = `<div class="result-big" style="color:${col}">${label}</div><p class="hint">Estimated entropy: ${entropy.toFixed(1)} bits · Estimated crack time (offline attack): ${esc(humanizeDuration(seconds))}</p>`;
      $note.textContent = 'This check happens entirely in your browser -- your password is never sent anywhere.';
    }
    $in.addEventListener('input', check);
    check();
  }
});

SECURITY_TOOLS.push({
  id:'s02', cat:'security', name:'PIN Generator', desc:'Generate secure random numeric PINs, with an option to avoid repeating or sequential digits.', keywords:'pin code numeric random atm passcode generator',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>PIN length</label><input type="number" id="pinLen" value="4" min="3" max="12"></div>
        <div class="field"><label>How many</label><input type="number" id="pinCount" value="5" min="1" max="100"></div>
        <div class="field"><label class="chk"><input type="checkbox" id="pinAvoid" checked> Avoid repeating/sequential digits</label></div>
      </div>
      <div class="actions" id="pinActs"></div>
      <textarea class="ta out mono" id="pinOut" rows="6" readonly></textarea>
      <p class="hint" id="pinHint"></p>
    `;
    const $len=c.querySelector('#pinLen'), $count=c.querySelector('#pinCount'), $avoid=c.querySelector('#pinAvoid'), out=c.querySelector('#pinOut'), hint=c.querySelector('#pinHint');
    function isWeak(pin){
      if(/^(\d)\1+$/.test(pin)) return true;
      let asc=true, desc=true;
      for(let i=1;i<pin.length;i++){
        if(+pin[i]!==+pin[i-1]+1) asc=false;
        if(+pin[i]!==+pin[i-1]-1) desc=false;
      }
      return asc||desc;
    }
    function genOne(len){
      let pin, tries=0;
      do{
        const bytes=new Uint32Array(len); crypto.getRandomValues(bytes);
        pin = Array.from(bytes, b=>b%10).join('');
        tries++;
      } while($avoid.checked && isWeak(pin) && tries<50);
      return pin;
    }
    function gen(){
      const len=Math.max(3,Math.min(12,parseInt($len.value,10)||4));
      const count=Math.max(1,Math.min(100,parseInt($count.value,10)||1));
      const lines=[];
      for(let i=0;i<count;i++) lines.push(genOne(len));
      out.value=lines.join('\n');
      hint.textContent = 'Generated with the Web Crypto API (cryptographically secure).';
    }
    const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Generate'; b.addEventListener('click',gen);
    c.querySelector('#pinActs').append(b, copyBtn(()=>out.value));
    [$len,$count,$avoid].forEach(e=>e.addEventListener('change',gen));
    gen();
  }
});

SECURITY_TOOLS.push({
  id:'s03', cat:'security', name:'MD5 Generator', desc:'Compute the MD5 hash of any text. Provided for legacy compatibility -- MD5 is not secure for passwords.', keywords:'md5 hash checksum digest legacy generator',
  mount(c){
    textTool(c, {
      inLabel:'Text', outLabel:'MD5 hash', rows:6, live:true,
      note:'MD5 is broken for security purposes (collisions are easy to produce). Use SHA-256 or better for anything security-sensitive -- see the Hash Generator tool.',
      actions:[{label:'Generate MD5', primary:true, run:(t)=> t? tpMD5(t) : ''}]
    });
  }
});

SECURITY_TOOLS.push({
  id:'s04', cat:'security', name:'Secret Key Generator', desc:'Generate cryptographically secure secret keys in hex or Base64, for API secrets and encryption keys.', keywords:'api key secret encryption key generator crypto',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Key length</label>
          <select id="skBits">
            <option value="128">128-bit</option>
            <option value="192">192-bit</option>
            <option value="256" selected>256-bit</option>
            <option value="512">512-bit</option>
          </select>
        </div>
        <div class="field"><label>Format</label>
          <select id="skFmt">
            <option value="hex" selected>Hex</option>
            <option value="base64">Base64</option>
            <option value="base64url">Base64 (URL-safe)</option>
          </select>
        </div>
      </div>
      <div class="actions" id="skActs"></div>
      <textarea class="ta out mono" id="skOut" rows="3" readonly></textarea>
      <p class="hint">Generated with the Web Crypto API (crypto.getRandomValues) -- never sent anywhere.</p>
    `;
    const $bits=c.querySelector('#skBits'), $fmt=c.querySelector('#skFmt'), out=c.querySelector('#skOut');
    function toBase64(bytes, urlSafe){
      let bin=''; bytes.forEach(b=>bin+=String.fromCharCode(b));
      let b64 = btoa(bin);
      if(urlSafe) b64 = b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      return b64;
    }
    function gen(){
      const bytes = new Uint8Array(parseInt($bits.value,10)/8);
      crypto.getRandomValues(bytes);
      let key;
      if($fmt.value==='hex') key = Array.from(bytes, b=>b.toString(16).padStart(2,'0')).join('');
      else if($fmt.value==='base64') key = toBase64(bytes,false);
      else key = toBase64(bytes,true);
      out.value = key;
    }
    const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Generate key'; b.addEventListener('click',gen);
    c.querySelector('#skActs').append(b, copyBtn(()=>out.value));
    [$bits,$fmt].forEach(e=>e.addEventListener('change',gen));
    gen();
  }
});

SECURITY_TOOLS.push({
  id:'s05', cat:'security', name:'File Checksum Generator', desc:'Compute the MD5, SHA-1, SHA-256 or SHA-512 checksum of a local file to verify its integrity.', keywords:'file hash checksum verify integrity sha md5',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a file</label><input type="file" id="fcFile"></div>
      <div class="field"><label>Algorithm</label>
        <select id="fcAlgo">
          <option value="MD5">MD5</option>
          <option value="SHA-1">SHA-1</option>
          <option value="SHA-256" selected>SHA-256</option>
          <option value="SHA-512">SHA-512</option>
        </select>
      </div>
      <div class="actions" id="fcActs"></div>
      <textarea class="ta out mono" id="fcOut" rows="3" readonly></textarea>
      <p class="hint" id="fcHint">The file is read and hashed entirely in your browser -- it is never uploaded anywhere.</p>
    `;
    const $file=c.querySelector('#fcFile'), $algo=c.querySelector('#fcAlgo'), out=c.querySelector('#fcOut'), hint=c.querySelector('#fcHint');
    async function run(){
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a file first.'; return; }
      hint.textContent='Hashing '+file.name+' ('+(file.size/1024).toFixed(1)+' KB)...';
      out.value='';
      try{
        const buf = await file.arrayBuffer();
        let hex;
        if($algo.value==='MD5'){
          hex = tpMD5Bytes(new Uint8Array(buf));
        } else {
          const digest = await crypto.subtle.digest($algo.value, buf);
          hex = Array.from(new Uint8Array(digest), b=>b.toString(16).padStart(2,'0')).join('');
        }
        out.value = hex;
        hint.textContent = file.name+' ('+(file.size/1024).toFixed(1)+' KB) -- hashed locally, never uploaded.';
      }catch(e){ hint.textContent = 'Could not hash this file: '+e.message; }
    }
    const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Compute checksum'; b.addEventListener('click',run);
    c.querySelector('#fcActs').append(b, copyBtn(()=>out.value));
  }
});

SECURITY_TOOLS.push({
  id:'s06', cat:'security', name:'Hash Comparison Tool', desc:'Compare two hash or checksum strings to verify they match, ignoring case and extra whitespace.', keywords:'compare hash checksum verify match diff',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Hash 1</label><textarea class="ta mono" id="hc1" rows="3" placeholder="Paste the first hash"></textarea></div>
      <div class="field"><label>Hash 2</label><textarea class="ta mono" id="hc2" rows="3" placeholder="Paste the second hash"></textarea></div>
      <div class="result-box" id="hcResult">—</div>
    `;
    const $h1=c.querySelector('#hc1'), $h2=c.querySelector('#hc2'), res=c.querySelector('#hcResult');
    function norm(s){ return s.trim().toLowerCase().replace(/\s+/g,''); }
    function check(){
      const a=norm($h1.value), b=norm($h2.value);
      if(!a || !b){ res.innerHTML='<span class="muted">Paste both hashes to compare.</span>'; return; }
      if(a===b) res.innerHTML='<div class="result-big" style="color:#16A34A">✅ Match</div><p class="hint">Both hashes are identical.</p>';
      else res.innerHTML='<div class="result-big" style="color:#DC2626">❌ No match</div><p class="hint">These hashes are different -- the file or text may have been altered, or one hash is from a different algorithm.</p>';
    }
    [$h1,$h2].forEach(e=>e.addEventListener('input',check));
    check();
  }
});

SECURITY_TOOLS.push({
  id:'s07', cat:'security', name:'Secure Random Number Generator', desc:'Generate cryptographically secure random integers using the Web Crypto API, free of modulo bias.', keywords:'crypto random secure number generator unbiased',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Min</label><input type="number" id="srMin" value="1"></div>
        <div class="field"><label>Max</label><input type="number" id="srMax" value="100"></div>
        <div class="field"><label>How many</label><input type="number" id="srCount" value="5" min="1" max="500"></div>
      </div>
      <div class="actions" id="srActs"></div>
      <textarea class="ta out mono" id="srOut" rows="4" readonly></textarea>
      <p class="hint" id="srHint"></p>
    `;
    const $min=c.querySelector('#srMin'), $max=c.querySelector('#srMax'), $count=c.querySelector('#srCount'), out=c.querySelector('#srOut'), hint=c.querySelector('#srHint');
    function secureRandomInt(min,max){
      const range = max-min+1;
      const bitsNeeded = Math.ceil(Math.log2(range));
      const bytesNeeded = Math.max(1,Math.ceil(bitsNeeded/8));
      const mask = Math.pow(2, bytesNeeded*8)-1;
      let x;
      do{
        const buf = new Uint8Array(bytesNeeded);
        crypto.getRandomValues(buf);
        x=0; for(let i=0;i<bytesNeeded;i++) x = x*256+buf[i];
        x = x & mask;
      } while(x>=range);
      return min+x;
    }
    function gen(){
      const min=Math.round(parseFloat($min.value)), max=Math.round(parseFloat($max.value)), count=Math.max(1,Math.min(500,parseInt($count.value,10)||1));
      if(isNaN(min)||isNaN(max)||min>max){ hint.textContent='Min must be less than or equal to Max.'; return; }
      hint.textContent='Generated with crypto.getRandomValues, using rejection sampling to avoid modulo bias.';
      const results=[];
      for(let i=0;i<count;i++) results.push(secureRandomInt(min,max));
      out.value=results.join(', ');
    }
    const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent='Generate'; b.addEventListener('click',gen);
    c.querySelector('#srActs').append(b, copyBtn(()=>out.value));
    gen();
  }
});

SECURITY_TOOLS.push({
  id:'s08', cat:'security', name:'Passphrase Generator', desc:'Generate strong, memorable passphrases made of random dictionary words — easier to type and recall than random characters.', keywords:'passphrase generator diceware memorable password words',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Number of words</label><input type="number" id="ppWords" min="3" max="10" value="4" step="1"></div>
        <div class="field"><label>Separator</label>
          <select id="ppSep">
            <option value="-" selected>Hyphen (-)</option>
            <option value=" ">Space</option>
            <option value=".">Dot (.)</option>
            <option value="_">Underscore (_)</option>
          </select>
        </div>
        <div class="field"><label class="chk"><input type="checkbox" id="ppNum" checked> Add a random number</label></div>
        <div class="field"><label class="chk"><input type="checkbox" id="ppCap" checked> Capitalize each word</label></div>
      </div>
      <div class="actions"><button class="btn primary" id="ppGo" type="button">Generate</button></div>
      <div class="actions" id="ppActs"></div>
      <textarea class="ta out mono" id="ppOut" rows="2" readonly></textarea>
      <p class="hint">Generated with the Web Crypto API (crypto.getRandomValues) — never sent anywhere.</p>
    `;
    const $words=c.querySelector('#ppWords'), $sep=c.querySelector('#ppSep'), $num=c.querySelector('#ppNum'), $cap=c.querySelector('#ppCap'), $out=c.querySelector('#ppOut'), acts=c.querySelector('#ppActs');
    function secureIndex(max){
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] % max;
    }
    function gen(){
      const n = Math.max(3, Math.min(10, parseInt($words.value,10)||4));
      const words=[];
      for(let i=0;i<n;i++){
        let w = PASSPHRASE_WORDS[secureIndex(PASSPHRASE_WORDS.length)];
        if($cap.checked) w = w.charAt(0).toUpperCase()+w.slice(1);
        words.push(w);
      }
      let phrase = words.join($sep.value);
      if($num.checked) phrase += $sep.value + (secureIndex(900)+100);
      $out.value = phrase;
    }
    c.querySelector('#ppGo').addEventListener('click', gen);
    acts.appendChild(copyBtn(()=>$out.value));
    gen();
  }
});
/* ===== SECURITY_TOOLS_MARKER ===== */

/* ======================================================================
   PDF_TOOLS -- Phase 2a of the site upgrade.
   pdf-lib (structure: merge/split/rotate/watermark/metadata/forms) and
   pdf.js (render/extract text) are self-hosted as flat root-level files
   (pdf-lib.min.js, pdf.min.mjs, pdf.worker.min.mjs -- kept out of a
   subfolder so the site stays a single flat folder to upload) and are
   lazy-loaded the first time a PDF tool actually mounts -- never on the
   homepage or any non-PDF tool page. Nothing is ever uploaded; every
   operation runs on File/ArrayBuffer data already in the browser.
   ====================================================================== */
let _pdfLibPromise = null;
function loadPdfLib(){
  if(_pdfLibPromise) return _pdfLibPromise;
  _pdfLibPromise = new Promise((resolve, reject) => {
    if(window.PDFLib){ resolve(window.PDFLib); return; }
    const s = document.createElement('script');
    s.src = '/pdf-lib.min.js';
    s.onload = () => window.PDFLib ? resolve(window.PDFLib) : reject(new Error('The PDF engine failed to start.'));
    s.onerror = () => reject(new Error('Could not load the PDF engine. Check your connection and try again.'));
    document.head.appendChild(s);
  });
  return _pdfLibPromise;
}
let _pdfJsPromise = null;
function loadPdfJs(){
  if(_pdfJsPromise) return _pdfJsPromise;
  const importModule = new Function('path', 'return import(path)');
  _pdfJsPromise = importModule('/pdf.min.mjs').then(mod=>{
    mod.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    return mod;
  }, ()=>{ throw new Error('Could not load the PDF engine. Check your connection and try again.'); });
  return _pdfJsPromise;
}
function pdfHumanError(e){
  const msg = (e && e.message) || String(e);
  if(/encrypt/i.test(msg)) return 'This PDF is password-protected. Remove the password in another program first, then try again -- this tool can\'t open encrypted PDFs.';
  if(/Invalid PDF structure|Failed to parse|not a valid PDF|corrupt|InvalidPDFException/i.test(msg)) return 'This doesn\'t look like a valid PDF file. Please choose a different file.';
  if(/no fillable|no form/i.test(msg)) return msg;
  // Our own validation messages (e.g. "Enter valid page numbers between 1
  // and 3.") already end with a period and read as plain instructions --
  // show those as-is. Anything else gets a short lead-in for context.
  if(/[.!]$/.test(msg.trim())) return msg;
  return 'Something went wrong: ' + msg;
}
function pdfBaseName(filename){
  return (filename || 'document').replace(/\.pdf$/i, '');
}
/** Parses a page selector like "all", "2,4-6", "3". Returns a Set of
 *  zero-based page indices, clamped to [0,total). Throws a friendly
 *  error on empty/invalid input when requireExplicit is true. */
function parsePageSelector(str, total, requireExplicit){
  str = (str||'').trim();
  if(!str){
    if(requireExplicit) throw new Error('Enter at least one page number.');
    return new Set(Array.from({length:total},(_,i)=>i));
  }
  if(!requireExplicit && /^all$/i.test(str)) return new Set(Array.from({length:total},(_,i)=>i));
  const idx = new Set();
  str.split(',').forEach(part=>{
    part = part.trim();
    if(!part) return;
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if(range){
      let a=parseInt(range[1],10), b=parseInt(range[2],10);
      if(a>b){ const t=a; a=b; b=t; }
      for(let i=a;i<=b;i++){ if(i>=1 && i<=total) idx.add(i-1); }
    } else {
      const n = parseInt(part,10);
      if(!isNaN(n) && n>=1 && n<=total) idx.add(n-1);
    }
  });
  if(!idx.size) throw new Error('Enter valid page numbers between 1 and '+total+'.');
  return idx;
}
function pdfReorderList(container, items, onChange){
  container.innerHTML = items.map((label,i)=>`
    <li style="display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:8px;padding:6px 10px;">
      <span style="flex:1;font-size:13px;">${i+1}. ${esc(label)}</span>
      <button type="button" class="btn ghost small" data-act="up" data-i="${i}" ${i===0?'disabled':''}>↑</button>
      <button type="button" class="btn ghost small" data-act="down" data-i="${i}" ${i===items.length-1?'disabled':''}>↓</button>
      <button type="button" class="btn ghost small" data-act="remove" data-i="${i}">Remove</button>
    </li>`).join('');
}

const PDF_TOOLS = [];

PDF_TOOLS.push({
  id:'p01', cat:'pdf', name:'PDF Merger', desc:'Combine multiple PDF files into a single PDF, in the order you choose.', keywords:'merge combine join pdf files',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose 2 or more PDF files</label><input type="file" id="pmFiles" accept="application/pdf" multiple></div>
      <ul id="pmList" style="list-style:none;padding:0;margin:10px 0;display:grid;gap:6px;"></ul>
      <div class="actions" id="pmActs">
        <button type="button" class="btn primary" id="pmMerge">Merge PDFs</button>
        <button type="button" class="btn ghost" id="pmReset">Reset</button>
      </div>
      <p class="hint" id="pmHint">Files are merged entirely in your browser -- nothing is uploaded.</p>
    `;
    const $files=c.querySelector('#pmFiles'), $list=c.querySelector('#pmList'), hint=c.querySelector('#pmHint');
    let items = [];
    function renderList(){
      $list.innerHTML = items.map((f,i)=>`
        <li style="display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:8px;padding:6px 10px;">
          <span style="flex:1;font-size:13px;">${i+1}. ${esc(f.name)} (${(f.size/1024).toFixed(0)} KB)</span>
          <button type="button" class="btn ghost small" data-act="up" data-i="${i}" ${i===0?'disabled':''}>↑</button>
          <button type="button" class="btn ghost small" data-act="down" data-i="${i}" ${i===items.length-1?'disabled':''}>↓</button>
          <button type="button" class="btn ghost small" data-act="remove" data-i="${i}">Remove</button>
        </li>`).join('');
    }
    $files.addEventListener('change', ()=>{
      items = items.concat(Array.from($files.files));
      $files.value='';
      renderList();
    });
    $list.addEventListener('click', (e)=>{
      const btn = e.target.closest('button[data-act]');
      if(!btn) return;
      const i = parseInt(btn.dataset.i,10);
      if(btn.dataset.act==='remove') items.splice(i,1);
      else if(btn.dataset.act==='up' && i>0){ const t=items[i-1]; items[i-1]=items[i]; items[i]=t; }
      else if(btn.dataset.act==='down' && i<items.length-1){ const t=items[i+1]; items[i+1]=items[i]; items[i]=t; }
      renderList();
    });
    c.querySelector('#pmMerge').addEventListener('click', async ()=>{
      if(items.length<2){ hint.textContent='Choose at least 2 PDF files to merge.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        hint.textContent='Merging '+items.length+' files…';
        const outDoc = await PDFLib.PDFDocument.create();
        for(const file of items){
          const buf = await file.arrayBuffer();
          const srcDoc = await PDFLib.PDFDocument.load(buf);
          const pages = await outDoc.copyPages(srcDoc, srcDoc.getPageIndices());
          pages.forEach(p=>outDoc.addPage(p));
        }
        const bytes = await outDoc.save();
        await saveFile('merged.pdf', bytes, 'application/pdf');
        hint.textContent='Done -- merged '+items.length+' files into merged.pdf ('+outDoc.getPageCount()+' pages).';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
    c.querySelector('#pmReset').addEventListener('click', ()=>{ items=[]; renderList(); hint.textContent='Files are merged entirely in your browser -- nothing is uploaded.'; });
  }
});

PDF_TOOLS.push({
  id:'p02', cat:'pdf', name:'PDF Splitter', desc:'Split a PDF into individual single-page files, or extract a page range into a new PDF.', keywords:'split pdf pages separate extract',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="psFile" accept="application/pdf"></div>
      <div class="form-grid">
        <div class="field"><label>Mode</label>
          <select id="psMode">
            <option value="all">Split every page into its own PDF</option>
            <option value="range">Extract a page range into one PDF</option>
          </select>
        </div>
        <div class="field" id="psRangeField" style="display:none;"><label>Page range (e.g. 2-5)</label><input type="text" id="psRange" placeholder="e.g. 2-5"></div>
      </div>
      <div class="actions" id="psActs">
        <button type="button" class="btn primary" id="psRun">Split PDF</button>
      </div>
      <p class="hint" id="psHint">Splitting happens entirely in your browser -- nothing is uploaded. "Split every page" downloads one file per page.</p>
    `;
    const $file=c.querySelector('#psFile'), $mode=c.querySelector('#psMode'), $rangeField=c.querySelector('#psRangeField'), $range=c.querySelector('#psRange'), hint=c.querySelector('#psHint');
    $mode.addEventListener('change', ()=>{ $rangeField.style.display = $mode.value==='range' ? '' : 'none'; });
    c.querySelector('#psRun').addEventListener('click', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a PDF file first.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await file.arrayBuffer();
        const srcDoc = await PDFLib.PDFDocument.load(buf);
        const total = srcDoc.getPageCount();
        const base = pdfBaseName(file.name);
        if($mode.value==='range'){
          const idxSet = parsePageSelector($range.value, total, true);
          const m = $range.value.trim().match(/^(\d+)\s*-\s*(\d+)$/);
          if(!m) throw new Error('Enter a range like 2-5.');
          const idx = Array.from(idxSet).sort((a,b)=>a-b);
          const outDoc = await PDFLib.PDFDocument.create();
          const pages = await outDoc.copyPages(srcDoc, idx);
          pages.forEach(p=>outDoc.addPage(p));
          const bytes = await outDoc.save();
          await saveFile(base+'-pages-'+$range.value.replace(/\s+/g,'')+'.pdf', bytes, 'application/pdf');
          hint.textContent='Done -- extracted '+idx.length+' page(s).';
        } else {
          hint.textContent='Splitting '+total+' pages…';
          for(let i=0;i<total;i++){
            const outDoc = await PDFLib.PDFDocument.create();
            const copied = await outDoc.copyPages(srcDoc, [i]);
            outDoc.addPage(copied[0]);
            const bytes = await outDoc.save();
            await saveFile(base+'-page-'+(i+1)+'.pdf', bytes, 'application/pdf');
            await new Promise(r=>setTimeout(r, 150));
          }
          hint.textContent='Done -- downloaded '+total+' single-page PDFs.';
        }
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p03', cat:'pdf', name:'PDF Compressor', desc:"Shrink a PDF's file size by re-encoding its pages as compressed images. Best for scanned or image-heavy PDFs.", keywords:'compress shrink reduce pdf file size',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="pcFile" accept="application/pdf"></div>
      <div class="form-grid">
        <div class="field"><label>Image quality</label>
          <select id="pcQuality">
            <option value="0.5">Smaller file (lower quality)</option>
            <option value="0.7" selected>Balanced</option>
            <option value="0.85">Higher quality (larger file)</option>
          </select>
        </div>
      </div>
      <div class="actions" id="pcActs"><button type="button" class="btn primary" id="pcRun">Compress PDF</button></div>
      <p class="hint" id="pcHint">This re-encodes each page as a compressed image, so it works best on scanned/image-heavy PDFs -- text-based PDFs will lose selectable text after compressing. Nothing is uploaded.</p>
    `;
    const $file=c.querySelector('#pcFile'), $q=c.querySelector('#pcQuality'), hint=c.querySelector('#pcHint');
    c.querySelector('#pcRun').addEventListener('click', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a PDF file first.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const [PDFLib, pdfjsLib] = await Promise.all([loadPdfLib(), loadPdfJs()]);
        const originalSize = file.size;
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: buf}).promise;
        const outDoc = await PDFLib.PDFDocument.create();
        const quality = parseFloat($q.value);
        for(let i=1;i<=pdf.numPages;i++){
          hint.textContent = 'Compressing page '+i+' of '+pdf.numPages+'…';
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({scale: 1.5});
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({canvasContext: ctx, viewport}).promise;
          const jpgDataUrl = canvas.toDataURL('image/jpeg', quality);
          const jpgImage = await outDoc.embedJpg(jpgDataUrl);
          const pageViewport = page.getViewport({scale:1});
          const outPage = outDoc.addPage([pageViewport.width, pageViewport.height]);
          outPage.drawImage(jpgImage, {x:0, y:0, width: pageViewport.width, height: pageViewport.height});
        }
        const bytes = await outDoc.save();
        await saveFile(pdfBaseName(file.name)+'-compressed.pdf', bytes, 'application/pdf');
        const pct = Math.round((1 - bytes.length/originalSize)*100);
        hint.textContent = 'Done -- '+(originalSize/1024).toFixed(0)+' KB → '+(bytes.length/1024).toFixed(0)+' KB'+(pct>0?' ('+pct+'% smaller)':' (larger -- try a lower quality setting)')+'.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p04', cat:'pdf', name:'PDF to JPG Converter', desc:'Render each page of a PDF as a downloadable JPG or PNG image.', keywords:'pdf to image jpg png convert pages',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="pjFile" accept="application/pdf"></div>
      <div class="form-grid">
        <div class="field"><label>Image format</label>
          <select id="pjFormat"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select>
        </div>
        <div class="field"><label>Resolution</label>
          <select id="pjScale"><option value="1">Standard</option><option value="2" selected>High (2x)</option><option value="3">Very high (3x)</option></select>
        </div>
      </div>
      <div class="actions" id="pjActs"><button type="button" class="btn primary" id="pjRun">Convert to Images</button></div>
      <p class="hint" id="pjHint">Each page downloads as a separate image. Nothing is uploaded -- rendering happens in your browser.</p>
    `;
    const $file=c.querySelector('#pjFile'), $fmt=c.querySelector('#pjFormat'), $scale=c.querySelector('#pjScale'), hint=c.querySelector('#pjHint');
    c.querySelector('#pjRun').addEventListener('click', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a PDF file first.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const pdfjsLib = await loadPdfJs();
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data:buf}).promise;
        const base = pdfBaseName(file.name);
        const ext = $fmt.value==='image/png' ? 'png' : 'jpg';
        for(let i=1;i<=pdf.numPages;i++){
          hint.textContent = 'Rendering page '+i+' of '+pdf.numPages+'…';
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({scale: parseFloat($scale.value)});
          const canvas = document.createElement('canvas');
          canvas.width=viewport.width; canvas.height=viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({canvasContext:ctx, viewport}).promise;
          const blob = await new Promise(res=>canvas.toBlob(res, $fmt.value, 0.9));
          await saveFile(base+'-page-'+i+'.'+ext, blob, $fmt.value);
          await new Promise(r=>setTimeout(r,150));
        }
        hint.textContent = 'Done -- downloaded '+pdf.numPages+' image(s).';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p05', cat:'pdf', name:'Image to PDF Converter', desc:'Combine one or more JPG/PNG images into a single PDF, one image per page.', keywords:'jpg png image to pdf convert combine',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose image(s)</label><input type="file" id="ipFiles" accept="image/jpeg,image/png" multiple></div>
      <ul id="ipList" style="list-style:none;padding:0;margin:10px 0;display:grid;gap:6px;"></ul>
      <div class="form-grid">
        <div class="field"><label>Page size</label>
          <select id="ipSize"><option value="fit" selected>Fit to image</option><option value="a4">A4</option><option value="letter">Letter</option></select>
        </div>
      </div>
      <div class="actions" id="ipActs">
        <button type="button" class="btn primary" id="ipRun">Create PDF</button>
        <button type="button" class="btn ghost" id="ipReset">Reset</button>
      </div>
      <p class="hint" id="ipHint">Images are combined entirely in your browser -- nothing is uploaded.</p>
    `;
    const $files=c.querySelector('#ipFiles'), $list=c.querySelector('#ipList'), $size=c.querySelector('#ipSize'), hint=c.querySelector('#ipHint');
    let items=[];
    function renderList(){
      $list.innerHTML = items.map((f,i)=>`
        <li style="display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:8px;padding:6px 10px;">
          <span style="flex:1;font-size:13px;">${i+1}. ${esc(f.name)} (${(f.size/1024).toFixed(0)} KB)</span>
          <button type="button" class="btn ghost small" data-act="up" data-i="${i}" ${i===0?'disabled':''}>↑</button>
          <button type="button" class="btn ghost small" data-act="down" data-i="${i}" ${i===items.length-1?'disabled':''}>↓</button>
          <button type="button" class="btn ghost small" data-act="remove" data-i="${i}">Remove</button>
        </li>`).join('');
    }
    $files.addEventListener('change', ()=>{ items = items.concat(Array.from($files.files)); $files.value=''; renderList(); });
    $list.addEventListener('click', (e)=>{
      const btn = e.target.closest('button[data-act]'); if(!btn) return;
      const i = parseInt(btn.dataset.i,10);
      if(btn.dataset.act==='remove') items.splice(i,1);
      else if(btn.dataset.act==='up' && i>0){ const t=items[i-1]; items[i-1]=items[i]; items[i]=t; }
      else if(btn.dataset.act==='down' && i<items.length-1){ const t=items[i+1]; items[i+1]=items[i]; items[i]=t; }
      renderList();
    });
    c.querySelector('#ipReset').addEventListener('click', ()=>{ items=[]; renderList(); hint.textContent='Images are combined entirely in your browser -- nothing is uploaded.'; });
    c.querySelector('#ipRun').addEventListener('click', async ()=>{
      if(!items.length){ hint.textContent='Choose at least one image.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        const outDoc = await PDFLib.PDFDocument.create();
        const PAGE_SIZES = { a4:[595.28,841.89], letter:[612,792] };
        for(const file of items){
          const buf = await file.arrayBuffer();
          const isPng = /png/i.test(file.type) || /\.png$/i.test(file.name);
          const img = isPng ? await outDoc.embedPng(buf) : await outDoc.embedJpg(buf);
          let pw, ph;
          if($size.value==='fit'){ pw=img.width; ph=img.height; }
          else { const s = PAGE_SIZES[$size.value]; pw=s[0]; ph=s[1]; }
          const page = outDoc.addPage([pw,ph]);
          if($size.value==='fit'){
            page.drawImage(img, {x:0,y:0,width:pw,height:ph});
          } else {
            const scale = Math.min(pw/img.width, ph/img.height);
            const w = img.width*scale, h = img.height*scale;
            page.drawImage(img, {x:(pw-w)/2, y:(ph-h)/2, width:w, height:h});
          }
        }
        const bytes = await outDoc.save();
        await saveFile('images.pdf', bytes, 'application/pdf');
        hint.textContent = 'Done -- created a '+items.length+'-page PDF.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p06', cat:'pdf', name:'PDF Page Rotator', desc:'Rotate all or selected pages of a PDF by 90, 180 or 270 degrees.', keywords:'rotate pdf pages orientation',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="prFile" accept="application/pdf"></div>
      <div class="form-grid">
        <div class="field"><label>Rotate</label>
          <select id="prAngle"><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise (90° counter-clockwise)</option></select>
        </div>
        <div class="field"><label>Pages</label><input type="text" id="prPages" placeholder="all, or e.g. 1,3,5-6"></div>
      </div>
      <div class="actions" id="prActs"><button type="button" class="btn primary" id="prRun">Rotate PDF</button></div>
      <p class="hint" id="prHint">Leave Pages set to "all" to rotate every page, or enter specific page numbers/ranges. Nothing is uploaded.</p>
    `;
    const $file=c.querySelector('#prFile'), $angle=c.querySelector('#prAngle'), $pages=c.querySelector('#prPages'), hint=c.querySelector('#prHint');
    $pages.value='all';
    c.querySelector('#prRun').addEventListener('click', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a PDF file first.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await file.arrayBuffer();
        const doc = await PDFLib.PDFDocument.load(buf);
        const total = doc.getPageCount();
        const idxSet = parsePageSelector($pages.value, total, false);
        const angle = parseInt($angle.value,10);
        doc.getPages().forEach((page,i)=>{
          if(idxSet.has(i)){
            const cur = page.getRotation().angle;
            page.setRotation(PDFLib.degrees((cur+angle)%360));
          }
        });
        const bytes = await doc.save();
        await saveFile(pdfBaseName(file.name)+'-rotated.pdf', bytes, 'application/pdf');
        hint.textContent = 'Done -- rotated '+idxSet.size+' page(s).';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p07', cat:'pdf', name:'PDF Page Reorder', desc:'Rearrange the pages of a PDF into a new order using page thumbnails.', keywords:'reorder rearrange pdf pages order',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="proFile" accept="application/pdf"></div>
      <div id="proGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:10px;margin:14px 0;"></div>
      <div class="actions" id="proActs">
        <button type="button" class="btn primary" id="proRun" disabled>Save Reordered PDF</button>
      </div>
      <p class="hint" id="proHint">Choose a PDF, then use the ↑ / ↓ buttons on each thumbnail to change its position.</p>
    `;
    const $file=c.querySelector('#proFile'), $grid=c.querySelector('#proGrid'), $run=c.querySelector('#proRun'), hint=c.querySelector('#proHint');
    let order = [];
    let thumbs = [];
    let srcFile = null;
    function renderGrid(){
      $grid.innerHTML = order.map((origIdx,pos)=>`
        <div style="border:1px solid var(--border);border-radius:8px;padding:6px;text-align:center;">
          <img src="${thumbs[origIdx]}" style="width:100%;border-radius:4px;border:1px solid var(--border);" alt="Page ${origIdx+1}">
          <div style="font-size:11px;margin:4px 0;">Page ${origIdx+1}</div>
          <div style="display:flex;gap:4px;justify-content:center;">
            <button type="button" class="btn ghost small" data-act="up" data-pos="${pos}" ${pos===0?'disabled':''}>↑</button>
            <button type="button" class="btn ghost small" data-act="down" data-pos="${pos}" ${pos===order.length-1?'disabled':''}>↓</button>
          </div>
        </div>`).join('');
    }
    $grid.addEventListener('click',(e)=>{
      const btn = e.target.closest('button[data-act]'); if(!btn) return;
      const pos = parseInt(btn.dataset.pos,10);
      if(btn.dataset.act==='up' && pos>0){ const t=order[pos-1]; order[pos-1]=order[pos]; order[pos]=t; }
      else if(btn.dataset.act==='down' && pos<order.length-1){ const t=order[pos+1]; order[pos+1]=order[pos]; order[pos]=t; }
      renderGrid();
    });
    $file.addEventListener('change', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file) return;
      srcFile = file;
      hint.textContent='Loading PDF engine…';
      $run.disabled = true;
      try{
        const pdfjsLib = await loadPdfJs();
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data:buf}).promise;
        thumbs = [];
        for(let i=1;i<=pdf.numPages;i++){
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({scale:0.3});
          const canvas = document.createElement('canvas');
          canvas.width=viewport.width; canvas.height=viewport.height;
          await page.render({canvasContext:canvas.getContext('2d'), viewport}).promise;
          thumbs.push(canvas.toDataURL('image/jpeg',0.7));
        }
        order = thumbs.map((_,i)=>i);
        renderGrid();
        $run.disabled=false;
        hint.textContent = pdf.numPages+' page(s) loaded. Reorder them, then save.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
    $run.addEventListener('click', async ()=>{
      if(!srcFile) return;
      hint.textContent='Saving…';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await srcFile.arrayBuffer();
        const srcDoc = await PDFLib.PDFDocument.load(buf);
        const outDoc = await PDFLib.PDFDocument.create();
        const pages = await outDoc.copyPages(srcDoc, order);
        pages.forEach(p=>outDoc.addPage(p));
        const bytes = await outDoc.save();
        await saveFile(pdfBaseName(srcFile.name)+'-reordered.pdf', bytes, 'application/pdf');
        hint.textContent = 'Done -- saved the reordered PDF.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p08', cat:'pdf', name:'PDF Page Delete / Extract', desc:'Remove specific pages from a PDF, or extract only the pages you choose into a new file.', keywords:'delete remove extract pdf pages',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="pdFile" accept="application/pdf"></div>
      <div class="form-grid">
        <div class="field"><label>Action</label>
          <select id="pdAction"><option value="delete">Delete these pages</option><option value="extract">Extract only these pages</option></select>
        </div>
        <div class="field"><label>Pages (e.g. 2,4-5)</label><input type="text" id="pdPages" placeholder="e.g. 2,4-5"></div>
      </div>
      <div class="actions" id="pdActs"><button type="button" class="btn primary" id="pdRun">Process PDF</button></div>
      <p class="hint" id="pdHint">Nothing is uploaded -- everything runs in your browser.</p>
    `;
    const $file=c.querySelector('#pdFile'), $action=c.querySelector('#pdAction'), $pages=c.querySelector('#pdPages'), hint=c.querySelector('#pdHint');
    c.querySelector('#pdRun').addEventListener('click', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a PDF file first.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await file.arrayBuffer();
        const srcDoc = await PDFLib.PDFDocument.load(buf);
        const total = srcDoc.getPageCount();
        const selected = parsePageSelector($pages.value, total, true);
        const outDoc = await PDFLib.PDFDocument.create();
        let keepIdx;
        if($action.value==='extract'){
          keepIdx = Array.from(selected).sort((a,b)=>a-b);
        } else {
          keepIdx = [];
          for(let i=0;i<total;i++) if(!selected.has(i)) keepIdx.push(i);
          if(!keepIdx.length) throw new Error("You can't delete every page -- the result would be an empty PDF.");
        }
        const pages = await outDoc.copyPages(srcDoc, keepIdx);
        pages.forEach(p=>outDoc.addPage(p));
        const bytes = await outDoc.save();
        const suffix = $action.value==='extract' ? '-extracted.pdf' : '-pages-removed.pdf';
        await saveFile(pdfBaseName(file.name)+suffix, bytes, 'application/pdf');
        hint.textContent = 'Done -- output has '+keepIdx.length+' page(s).';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p09', cat:'pdf', name:'PDF Watermark Adder', desc:'Stamp a text watermark across every page of a PDF, with adjustable size, opacity and position.', keywords:'watermark stamp pdf text overlay',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="pwFile" accept="application/pdf"></div>
      <div class="form-grid">
        <div class="field wide"><label>Watermark text</label><input type="text" id="pwText" value="CONFIDENTIAL"></div>
        <div class="field"><label>Font size</label><input type="number" id="pwSize" value="48" min="8" max="200"></div>
        <div class="field"><label>Opacity</label><input type="number" id="pwOpacity" value="0.3" min="0.05" max="1" step="0.05"></div>
        <div class="field"><label>Rotation (°)</label><input type="number" id="pwRotate" value="45" min="-180" max="180"></div>
        <div class="field"><label>Color</label><input type="color" id="pwColor" value="#FF0000"></div>
      </div>
      <div class="actions" id="pwActs"><button type="button" class="btn primary" id="pwRun">Add Watermark</button></div>
      <p class="hint" id="pwHint">Nothing is uploaded -- everything runs in your browser.</p>
    `;
    const $file=c.querySelector('#pwFile'), $text=c.querySelector('#pwText'), $size=c.querySelector('#pwSize'), $op=c.querySelector('#pwOpacity'), $rot=c.querySelector('#pwRotate'), $color=c.querySelector('#pwColor'), hint=c.querySelector('#pwHint');
    c.querySelector('#pwRun').addEventListener('click', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a PDF file first.'; return; }
      if(!$text.value.trim()){ hint.textContent='Enter watermark text.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await file.arrayBuffer();
        const doc = await PDFLib.PDFDocument.load(buf);
        const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
        const hex = $color.value.replace('#','');
        const r = parseInt(hex.substring(0,2),16)/255, g = parseInt(hex.substring(2,4),16)/255, b = parseInt(hex.substring(4,6),16)/255;
        const size = parseFloat($size.value)||48;
        const opacity = parseFloat($op.value)||0.3;
        const rotate = parseFloat($rot.value)||0;
        const text = $text.value;
        const textWidth = font.widthOfTextAtSize(text, size);
        doc.getPages().forEach(page=>{
          const dims = page.getSize();
          page.drawText(text, {
            x: dims.width/2 - textWidth/2, y: dims.height/2, size, font,
            color: PDFLib.rgb(r,g,b), opacity,
            rotate: PDFLib.degrees(rotate)
          });
        });
        const bytes = await doc.save();
        await saveFile(pdfBaseName(file.name)+'-watermarked.pdf', bytes, 'application/pdf');
        hint.textContent = 'Done -- watermark added to '+doc.getPageCount()+' page(s).';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p10', cat:'pdf', name:'PDF Text Extractor', desc:'Pull the plain text content out of a PDF so you can copy or search it.', keywords:'extract text pdf to text copy',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="peFile" accept="application/pdf"></div>
      <div class="actions" id="peActs"></div>
      <div class="field"><label>Extracted text</label><textarea class="ta out" id="peOut" rows="14" readonly placeholder="Extracted text appears here"></textarea></div>
      <p class="hint" id="peHint">Nothing is uploaded -- text is extracted entirely in your browser.</p>
    `;
    const $file=c.querySelector('#peFile'), $out=c.querySelector('#peOut'), hint=c.querySelector('#peHint'), acts=c.querySelector('#peActs');
    acts.appendChild(copyBtn(()=>$out.value));
    const dlBtn = document.createElement('button'); dlBtn.type='button'; dlBtn.className='btn ghost'; dlBtn.textContent='Download .txt';
    dlBtn.addEventListener('click', async ()=>{ if($out.value) await saveFile('extracted-text.txt', $out.value, 'text/plain'); });
    acts.appendChild(dlBtn);
    $file.addEventListener('change', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file) return;
      $out.value=''; hint.textContent='Loading PDF engine…';
      try{
        const pdfjsLib = await loadPdfJs();
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data:buf}).promise;
        let full = '';
        for(let i=1;i<=pdf.numPages;i++){
          hint.textContent = 'Extracting page '+i+' of '+pdf.numPages+'…';
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(it=>it.str).join(' ');
          full += (i>1?'\n\n':'') + '--- Page '+i+' ---\n' + pageText;
        }
        $out.value = full.trim();
        hint.textContent = $out.value ? ('Extracted text from '+pdf.numPages+' page(s).') : 'No extractable text found -- this PDF may be a scanned image.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p11', cat:'pdf', name:'PDF Metadata Editor', desc:"View and edit a PDF's title, author, subject and keywords.", keywords:'metadata title author pdf properties edit',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="pmeFile" accept="application/pdf"></div>
      <div class="form-grid">
        <div class="field wide"><label>Title</label><input type="text" id="pmeTitle"></div>
        <div class="field wide"><label>Author</label><input type="text" id="pmeAuthor"></div>
        <div class="field wide"><label>Subject</label><input type="text" id="pmeSubject"></div>
        <div class="field wide"><label>Keywords (comma-separated)</label><input type="text" id="pmeKeywords"></div>
      </div>
      <div class="actions" id="pmeActs"><button type="button" class="btn primary" id="pmeRun" disabled>Save PDF with Updated Metadata</button></div>
      <p class="hint" id="pmeHint">Choose a PDF to load its current metadata. Nothing is uploaded.</p>
    `;
    const $file=c.querySelector('#pmeFile'), $title=c.querySelector('#pmeTitle'), $author=c.querySelector('#pmeAuthor'), $subject=c.querySelector('#pmeSubject'), $keywords=c.querySelector('#pmeKeywords'), $run=c.querySelector('#pmeRun'), hint=c.querySelector('#pmeHint');
    let srcFile=null, srcDoc=null;
    $file.addEventListener('change', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file) return;
      srcFile=file; $run.disabled=true;
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await file.arrayBuffer();
        srcDoc = await PDFLib.PDFDocument.load(buf);
        $title.value = srcDoc.getTitle() || '';
        $author.value = srcDoc.getAuthor() || '';
        $subject.value = srcDoc.getSubject() || '';
        $keywords.value = srcDoc.getKeywords() || '';
        $run.disabled=false;
        hint.textContent = 'Loaded. Edit the fields above, then save.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
    c.querySelector('#pmeRun').addEventListener('click', async ()=>{
      if(!srcDoc || !srcFile) return;
      try{
        srcDoc.setTitle($title.value);
        srcDoc.setAuthor($author.value);
        srcDoc.setSubject($subject.value);
        srcDoc.setKeywords($keywords.value.split(',').map(s=>s.trim()).filter(Boolean));
        srcDoc.setModificationDate(new Date());
        const bytes = await srcDoc.save();
        await saveFile(pdfBaseName(srcFile.name)+'-updated.pdf', bytes, 'application/pdf');
        hint.textContent = 'Done -- metadata updated.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p12', cat:'pdf', name:'PDF Page Number Adder', desc:'Stamp page numbers onto every page of a PDF, in the position and format you choose.', keywords:'page numbers pdf add stamp',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="pnFile" accept="application/pdf"></div>
      <div class="form-grid">
        <div class="field"><label>Position</label>
          <select id="pnPos">
            <option value="bottom-center" selected>Bottom center</option>
            <option value="bottom-right">Bottom right</option>
            <option value="bottom-left">Bottom left</option>
            <option value="top-center">Top center</option>
            <option value="top-right">Top right</option>
          </select>
        </div>
        <div class="field"><label>Format</label>
          <select id="pnFormat">
            <option value="n">1, 2, 3…</option>
            <option value="n-of-total">Page 1 of N</option>
          </select>
        </div>
        <div class="field"><label>Start at</label><input type="number" id="pnStart" value="1" min="0"></div>
      </div>
      <div class="actions" id="pnActs"><button type="button" class="btn primary" id="pnRun">Add Page Numbers</button></div>
      <p class="hint" id="pnHint">Nothing is uploaded -- everything runs in your browser.</p>
    `;
    const $file=c.querySelector('#pnFile'), $pos=c.querySelector('#pnPos'), $fmt=c.querySelector('#pnFormat'), $start=c.querySelector('#pnStart'), hint=c.querySelector('#pnHint');
    c.querySelector('#pnRun').addEventListener('click', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a PDF file first.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await file.arrayBuffer();
        const doc = await PDFLib.PDFDocument.load(buf);
        const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
        const start = parseInt($start.value,10)||1;
        const total = doc.getPageCount();
        const size = 11, margin = 28;
        doc.getPages().forEach((page,i)=>{
          const n = start+i;
          const label = $fmt.value==='n-of-total' ? ('Page '+n+' of '+total) : String(n);
          const dims = page.getSize();
          const textWidth = font.widthOfTextAtSize(label, size);
          let x, y;
          if($pos.value.indexOf('right')>-1) x = dims.width - margin - textWidth;
          else if($pos.value.indexOf('left')>-1) x = margin;
          else x = dims.width/2 - textWidth/2;
          y = $pos.value.indexOf('top')===0 ? dims.height - margin : margin;
          page.drawText(label, {x, y, size, font, color: PDFLib.rgb(0,0,0)});
        });
        const bytes = await doc.save();
        await saveFile(pdfBaseName(file.name)+'-numbered.pdf', bytes, 'application/pdf');
        hint.textContent = 'Done -- page numbers added.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p13', cat:'pdf', name:'PDF to Grayscale Converter', desc:'Convert every page of a PDF to grayscale, ready for black-and-white printing.', keywords:'grayscale black white pdf convert print',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="pgFile" accept="application/pdf"></div>
      <div class="actions" id="pgActs"><button type="button" class="btn primary" id="pgRun">Convert to Grayscale</button></div>
      <p class="hint" id="pgHint">This re-renders each page as a grayscale image, so text will no longer be selectable in the output. Nothing is uploaded.</p>
    `;
    const $file=c.querySelector('#pgFile'), hint=c.querySelector('#pgHint');
    c.querySelector('#pgRun').addEventListener('click', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a PDF file first.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const [PDFLib, pdfjsLib] = await Promise.all([loadPdfLib(), loadPdfJs()]);
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data:buf}).promise;
        const outDoc = await PDFLib.PDFDocument.create();
        for(let i=1;i<=pdf.numPages;i++){
          hint.textContent = 'Converting page '+i+' of '+pdf.numPages+'…';
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({scale:1.5});
          const canvas = document.createElement('canvas');
          canvas.width=viewport.width; canvas.height=viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({canvasContext:ctx, viewport}).promise;
          const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
          const d = imgData.data;
          for(let p=0;p<d.length;p+=4){
            const gray = 0.299*d[p] + 0.587*d[p+1] + 0.114*d[p+2];
            d[p]=gray; d[p+1]=gray; d[p+2]=gray;
          }
          ctx.putImageData(imgData,0,0);
          const jpgUrl = canvas.toDataURL('image/jpeg',0.85);
          const jpgImage = await outDoc.embedJpg(jpgUrl);
          const pv = page.getViewport({scale:1});
          const outPage = outDoc.addPage([pv.width, pv.height]);
          outPage.drawImage(jpgImage, {x:0,y:0,width:pv.width,height:pv.height});
        }
        const bytes = await outDoc.save();
        await saveFile(pdfBaseName(file.name)+'-grayscale.pdf', bytes, 'application/pdf');
        hint.textContent = 'Done -- converted '+pdf.numPages+' page(s) to grayscale.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p14', cat:'pdf', name:'PDF Page Count & Info Viewer', desc:"See a PDF's page count, page size, and document metadata at a glance.", keywords:'pdf info page count properties viewer',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="piFile" accept="application/pdf"></div>
      <div class="result-box" id="piResult">—</div>
      <p class="hint">Nothing is uploaded -- the file is inspected entirely in your browser.</p>
    `;
    const $file=c.querySelector('#piFile'), $res=c.querySelector('#piResult');
    $file.addEventListener('change', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file) return;
      $res.innerHTML = '<span class="muted">Loading…</span>';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await file.arrayBuffer();
        const doc = await PDFLib.PDFDocument.load(buf);
        const pages = doc.getPages();
        const first = pages[0];
        const dims = first ? first.getSize() : {width:0,height:0};
        const rows = [
          ['File name', esc(file.name)],
          ['File size', (file.size/1024).toFixed(1)+' KB'],
          ['Page count', String(doc.getPageCount())],
          ['First page size', dims.width.toFixed(0)+' × '+dims.height.toFixed(0)+' pt ('+(dims.width/72).toFixed(2)+' × '+(dims.height/72).toFixed(2)+' in)'],
          ['Title', esc(doc.getTitle()||'—')],
          ['Author', esc(doc.getAuthor()||'—')],
          ['Subject', esc(doc.getSubject()||'—')],
          ['Creator', esc(doc.getCreator()||'—')],
          ['Producer', esc(doc.getProducer()||'—')]
        ];
        $res.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:13.5px;">' +
          rows.map(function(r){ return '<tr><td style="padding:6px 8px;color:var(--text-dim);border-bottom:1px solid var(--border);">'+r[0]+'</td><td style="padding:6px 8px;border-bottom:1px solid var(--border);">'+r[1]+'</td></tr>'; }).join('') +
          '</table>';
      }catch(e){ $res.innerHTML = '<span class="muted">'+esc(pdfHumanError(e))+'</span>'; }
    });
  }
});

PDF_TOOLS.push({
  id:'p15', cat:'pdf', name:'PDF Blank Page Inserter', desc:'Insert one or more blank pages into a PDF at a position you choose.', keywords:'insert blank page pdf add',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a PDF file</label><input type="file" id="pbFile" accept="application/pdf"></div>
      <div class="form-grid">
        <div class="field"><label>Insert after page</label><input type="number" id="pbAfter" value="0" min="0"></div>
        <div class="field"><label>Number of blank pages</label><input type="number" id="pbCount" value="1" min="1" max="50"></div>
        <div class="field"><label>Page size</label>
          <select id="pbSize"><option value="match" selected>Match adjacent page</option><option value="a4">A4</option><option value="letter">Letter</option></select>
        </div>
      </div>
      <div class="actions" id="pbActs"><button type="button" class="btn primary" id="pbRun">Insert Blank Page(s)</button></div>
      <p class="hint" id="pbHint">Set "Insert after page" to 0 to add blank pages at the very start. Nothing is uploaded.</p>
    `;
    const $file=c.querySelector('#pbFile'), $after=c.querySelector('#pbAfter'), $count=c.querySelector('#pbCount'), $size=c.querySelector('#pbSize'), hint=c.querySelector('#pbHint');
    c.querySelector('#pbRun').addEventListener('click', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file){ hint.textContent='Choose a PDF file first.'; return; }
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await file.arrayBuffer();
        const doc = await PDFLib.PDFDocument.load(buf);
        const total = doc.getPageCount();
        const after = Math.max(0, Math.min(total, parseInt($after.value,10)||0));
        const count = Math.max(1, Math.min(50, parseInt($count.value,10)||1));
        const PAGE_SIZES = { a4:[595.28,841.89], letter:[612,792] };
        let size;
        if($size.value==='match'){
          if(total>0){
            const refIndex = Math.min(after>0 ? after-1 : 0, total-1);
            const refPage = doc.getPage(refIndex);
            size = [refPage.getWidth(), refPage.getHeight()];
          } else {
            size = PAGE_SIZES.a4;
          }
        } else size = PAGE_SIZES[$size.value];
        for(let i=0;i<count;i++){ doc.insertPage(after+i, size); }
        const bytes = await doc.save();
        await saveFile(pdfBaseName(file.name)+'-with-blank-pages.pdf', bytes, 'application/pdf');
        hint.textContent = 'Done -- inserted '+count+' blank page(s).';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PDF_TOOLS.push({
  id:'p16', cat:'pdf', name:'PDF Form Filler', desc:'Fill in the fillable form fields of a PDF (text boxes, checkboxes, dropdowns) and save a completed copy.', keywords:'form fill pdf acroform fillable',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Choose a fillable PDF form</label><input type="file" id="pfFile" accept="application/pdf"></div>
      <div id="pfFields" style="display:grid;gap:12px;margin:14px 0;"></div>
      <div class="form-grid">
        <div class="field"><label class="chk"><input type="checkbox" id="pfFlatten"> Flatten form (make it non-editable)</label></div>
      </div>
      <div class="actions" id="pfActs"><button type="button" class="btn primary" id="pfRun" disabled>Save Filled PDF</button></div>
      <p class="hint" id="pfHint">Choose a PDF that has fillable form fields (e.g. an official form). Nothing is uploaded.</p>
    `;
    const $file=c.querySelector('#pfFile'), $fields=c.querySelector('#pfFields'), $flatten=c.querySelector('#pfFlatten'), $run=c.querySelector('#pfRun'), hint=c.querySelector('#pfHint');
    let doc=null, form=null, fieldList=[], srcFile=null;
    $file.addEventListener('change', async ()=>{
      const file = $file.files && $file.files[0];
      if(!file) return;
      srcFile=file; $fields.innerHTML=''; $run.disabled=true;
      hint.textContent='Loading PDF engine…';
      try{
        const PDFLib = await loadPdfLib();
        const buf = await file.arrayBuffer();
        doc = await PDFLib.PDFDocument.load(buf);
        form = doc.getForm();
        fieldList = form.getFields();
        if(!fieldList.length){ hint.textContent = 'This PDF has no fillable form fields.'; return; }
        $fields.innerHTML = fieldList.map((f,i)=>{
          const name = f.getName();
          if(f instanceof PDFLib.PDFTextField){
            return '<div class="field"><label>'+esc(name)+'</label><input type="text" data-field="'+i+'" data-type="text"></div>';
          } else if(f instanceof PDFLib.PDFCheckBox){
            return '<div class="field"><label class="chk"><input type="checkbox" data-field="'+i+'" data-type="checkbox"> '+esc(name)+'</label></div>';
          } else if(f instanceof PDFLib.PDFDropdown){
            const opts = f.getOptions();
            return '<div class="field"><label>'+esc(name)+'</label><select data-field="'+i+'" data-type="dropdown"><option value="">-- choose --</option>'+opts.map(function(o){return '<option value="'+esc(o)+'">'+esc(o)+'</option>';}).join('')+'</select></div>';
          } else if(f instanceof PDFLib.PDFRadioGroup){
            const opts = f.getOptions();
            return '<div class="field"><label>'+esc(name)+'</label><select data-field="'+i+'" data-type="radio"><option value="">-- choose --</option>'+opts.map(function(o){return '<option value="'+esc(o)+'">'+esc(o)+'</option>';}).join('')+'</select></div>';
          }
          return '<div class="field"><label>'+esc(name)+'</label><p class="hint">(Unsupported field type -- left as-is)</p></div>';
        }).join('');
        $run.disabled=false;
        hint.textContent = 'Found '+fieldList.length+' field(s). Fill them in, then save.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
    c.querySelector('#pfRun').addEventListener('click', async ()=>{
      if(!doc || !form) return;
      try{
        $fields.querySelectorAll('[data-field]').forEach(el=>{
          const i = parseInt(el.dataset.field,10);
          const field = fieldList[i];
          const type = el.dataset.type;
          try{
            if(type==='text') field.setText(el.value||'');
            else if(type==='checkbox'){ if(el.checked) field.check(); else field.uncheck(); }
            else if(type==='dropdown' && el.value) field.select(el.value);
            else if(type==='radio' && el.value) field.select(el.value);
          }catch(err){ /* skip fields that reject this value */ }
        });
        if($flatten.checked) form.flatten();
        const bytes = await doc.save();
        await saveFile(pdfBaseName(srcFile.name)+'-filled.pdf', bytes, 'application/pdf');
        hint.textContent = 'Done -- saved the filled PDF.';
      }catch(e){ hint.textContent = pdfHumanError(e); }
    });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr01', cat:'productivity', name:'Pomodoro Timer', desc:'A focus timer with work and break cycles, based on the classic 25/5 Pomodoro technique.', keywords:'pomodoro focus timer work break productivity',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Work minutes</label><input type="number" id="pmWork" min="1" max="120" value="25"></div>
        <div class="field"><label>Break minutes</label><input type="number" id="pmBreak" min="1" max="60" value="5"></div>
      </div>
      <div class="result-box" id="pmClock" style="font-size:2.2rem;text-align:center">25:00</div>
      <p class="hint" id="pmPhase" style="text-align:center">Work session</p>
      <div class="actions" style="justify-content:center">
        <button class="btn primary" id="pmStart" type="button">Start</button>
        <button class="btn ghost" id="pmPause" type="button" disabled>Pause</button>
        <button class="btn ghost" id="pmReset" type="button">Reset</button>
      </div>
    `;
    const $work=c.querySelector('#pmWork'), $break=c.querySelector('#pmBreak'), $clock=c.querySelector('#pmClock'), $phase=c.querySelector('#pmPhase');
    const $start=c.querySelector('#pmStart'), $pause=c.querySelector('#pmPause'), $reset=c.querySelector('#pmReset');
    let phase='work', secsLeft=25*60, iv=null, running=false;
    function fmt(s){ const m=Math.floor(s/60), sec=s%60; return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'); }
    function render(){ $clock.textContent=fmt(Math.max(0,secsLeft)); $phase.textContent = phase==='work' ? 'Work session' : 'Break time'; }
    function tick(){
      secsLeft--;
      if(secsLeft<0){
        phase = phase==='work' ? 'break' : 'work';
        secsLeft = (phase==='work' ? (parseInt($work.value,10)||25) : (parseInt($break.value,10)||5)) * 60;
      }
      render();
    }
    function start(){
      if(running) return;
      running=true; $start.disabled=true; $pause.disabled=false;
      iv=setInterval(tick,1000);
    }
    function pause(){ running=false; $start.disabled=false; $pause.disabled=true; if(iv) clearInterval(iv); iv=null; }
    function reset(){ pause(); phase='work'; secsLeft=(parseInt($work.value,10)||25)*60; render(); }
    $start.addEventListener('click', start);
    $pause.addEventListener('click', pause);
    $reset.addEventListener('click', reset);
    $work.addEventListener('change', ()=>{ if(!running && phase==='work') reset(); });
    render();
    onToolCleanup(()=>{ if(iv) clearInterval(iv); });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr02', cat:'productivity', name:'To-Do List', desc:'A simple checklist that saves itself in your browser — add, check off and remove tasks.', keywords:'todo list tasks checklist',
  mount(c){
    c.innerHTML = `
      <div class="field" style="display:flex;gap:8px;align-items:flex-end">
        <div style="flex:1"><label>New task</label><input type="text" id="todoInput" placeholder="What do you need to do?"></div>
        <button class="btn primary" id="todoAdd" type="button">Add</button>
      </div>
      <div id="todoList" style="margin-top:12px"></div>
      <p class="hint">Saved in this browser only — nothing is uploaded anywhere.</p>
    `;
    const KEY='tp_todo_list_v1';
    const $input=c.querySelector('#todoInput'), $add=c.querySelector('#todoAdd'), $list=c.querySelector('#todoList');
    let items=[];
    try{ items=JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){ items=[]; }
    function save(){ try{ localStorage.setItem(KEY, JSON.stringify(items)); }catch(e){} }
    function render(){
      if(!items.length){ $list.innerHTML='<p class="hint">No tasks yet — add one above.</p>'; return; }
      $list.innerHTML = items.map((it,i)=>`
        <div class="field" style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <label class="chk" style="flex:1;${it.done?'text-decoration:line-through;opacity:.6':''}">
            <input type="checkbox" data-i="${i}" class="todoChk" ${it.done?'checked':''}> ${esc(it.text)}
          </label>
          <button class="btn ghost todoDel" data-i="${i}" type="button">✕</button>
        </div>`).join('');
      $list.querySelectorAll('.todoChk').forEach(chk=>chk.addEventListener('change', ()=>{ items[+chk.dataset.i].done=chk.checked; save(); render(); }));
      $list.querySelectorAll('.todoDel').forEach(btn=>btn.addEventListener('click', ()=>{ items.splice(+btn.dataset.i,1); save(); render(); }));
    }
    function addItem(){
      const text=$input.value.trim(); if(!text) return;
      items.push({text, done:false}); $input.value=''; save(); render();
    }
    $add.addEventListener('click', addItem);
    $input.addEventListener('keydown', e=>{ if(e.key==='Enter') addItem(); });
    render();
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr03', cat:'productivity', name:'Notepad (Auto-Saving)', desc:'A distraction-free scratchpad that automatically saves what you type in this browser.', keywords:'notepad notes autosave scratchpad',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Notes</label><textarea class="ta" id="npText" rows="12" placeholder="Start typing — your notes save automatically..."></textarea></div>
      <div class="actions"><button class="btn ghost" id="npClear" type="button">Clear</button></div>
      <p class="hint" id="npHint">Saved in this browser only.</p>
    `;
    const KEY='tp_notepad_v1';
    const $text=c.querySelector('#npText'), hint=c.querySelector('#npHint');
    try{ $text.value = localStorage.getItem(KEY) || ''; }catch(e){}
    let t=null;
    $text.addEventListener('input', ()=>{
      clearTimeout(t);
      t=setTimeout(()=>{ try{ localStorage.setItem(KEY, $text.value); hint.textContent='Saved just now.'; }catch(e){ hint.textContent='Could not save (storage unavailable).'; } }, 400);
    });
    c.querySelector('#npClear').addEventListener('click', ()=>{
      if(!$text.value || confirm('Clear all notes?')){ $text.value=''; try{ localStorage.removeItem(KEY); }catch(e){} hint.textContent='Cleared.'; }
    });
    onToolCleanup(()=>{ clearTimeout(t); });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr04', cat:'productivity', name:'Countdown Timer', desc:'A simple minutes-and-seconds countdown timer for quick tasks, cooking or breaks.', keywords:'timer countdown minutes seconds kitchen',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Minutes</label><input type="number" id="ctMin" min="0" max="180" value="5"></div>
        <div class="field"><label>Seconds</label><input type="number" id="ctSec" min="0" max="59" value="0"></div>
      </div>
      <div class="result-box" id="ctClock" style="font-size:2.2rem;text-align:center">05:00</div>
      <div class="actions" style="justify-content:center">
        <button class="btn primary" id="ctStart" type="button">Start</button>
        <button class="btn ghost" id="ctPause" type="button" disabled>Pause</button>
        <button class="btn ghost" id="ctReset" type="button">Reset</button>
      </div>
      <p class="hint" id="ctHint" style="text-align:center"></p>
    `;
    const $min=c.querySelector('#ctMin'), $sec=c.querySelector('#ctSec'), $clock=c.querySelector('#ctClock');
    const $start=c.querySelector('#ctStart'), $pause=c.querySelector('#ctPause'), $reset=c.querySelector('#ctReset'), hint=c.querySelector('#ctHint');
    let total=300, left=300, iv=null, running=false;
    function fmt(s){ const m=Math.floor(s/60), sec=s%60; return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'); }
    function render(){ $clock.textContent=fmt(Math.max(0,left)); }
    function setFromInputs(){ total = Math.max(0,(parseInt($min.value,10)||0)*60 + (parseInt($sec.value,10)||0)); left=total; render(); }
    function tick(){
      left--;
      if(left<=0){ left=0; render(); pause(); hint.textContent="Time's up!"; return; }
      render();
    }
    function start(){
      if(running || left<=0) return;
      running=true; $start.disabled=true; $pause.disabled=false; hint.textContent='';
      iv=setInterval(tick,1000);
    }
    function pause(){ running=false; $start.disabled=false; $pause.disabled=true; if(iv) clearInterval(iv); iv=null; }
    function reset(){ pause(); setFromInputs(); hint.textContent=''; }
    $start.addEventListener('click', start);
    $pause.addEventListener('click', pause);
    $reset.addEventListener('click', reset);
    $min.addEventListener('change', ()=>{ if(!running) setFromInputs(); });
    $sec.addEventListener('change', ()=>{ if(!running) setFromInputs(); });
    setFromInputs();
    onToolCleanup(()=>{ if(iv) clearInterval(iv); });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr05', cat:'productivity', name:'Random Decision Maker', desc:'Can’t decide? List your options, one per line, and let chance pick for you.', keywords:'random decision picker choice spinner',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Options (one per line)</label><textarea class="ta" id="rdmIn" rows="6" placeholder="Pizza
Sushi
Burgers
Tacos">Yes
No</textarea></div>
      <div class="actions"><button class="btn primary" id="rdmGo" type="button">Decide</button></div>
      <div class="result-box" id="rdmOut" style="font-size:1.6rem;text-align:center">—</div>
    `;
    const $in=c.querySelector('#rdmIn'), $out=c.querySelector('#rdmOut');
    c.querySelector('#rdmGo').addEventListener('click', ()=>{
      const opts=$in.value.split('\n').map(s=>s.trim()).filter(Boolean);
      if(opts.length<2){ $out.textContent='Add at least 2 options.'; return; }
      $out.textContent = opts[Math.floor(Math.random()*opts.length)];
    });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr06', cat:'productivity', name:'Meeting Cost Calculator', desc:'Estimate what a meeting actually costs, based on attendees, their average pay rate and the meeting length.', keywords:'meeting cost salary time money',
  mount(c){
    formTool(c, {
      fields:[
        {key:'people', label:'Number of attendees', type:'number', value:6, step:1},
        {key:'rate', label:'Average hourly rate ($)', type:'number', value:40, step:1},
        {key:'minutes', label:'Meeting length (minutes)', type:'number', value:30, step:5}
      ],
      compute(v){
        if(!(v.people>0) || !(v.rate>=0) || !(v.minutes>0)) throw new Error('bad');
        const cost = v.people * v.rate * (v.minutes/60);
        const perMin = cost / v.minutes;
        return `<div class="stat-grid">
          <div class="stat"><span class="stat-val">$${cost.toFixed(2)}</span><span class="stat-lbl">Total Cost</span></div>
          <div class="stat"><span class="stat-val">$${perMin.toFixed(2)}</span><span class="stat-lbl">Cost per Minute</span></div>
        </div>`;
      },
      note:'Uses an average hourly rate across all attendees — a rough but useful estimate.'
    });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr07', cat:'productivity', name:'Typing Speed Test (WPM)', desc:'Test how fast and accurately you type — get your words-per-minute and accuracy score.', keywords:'typing speed test wpm words per minute accuracy',
  mount(c){
    const PASSAGES = [
      'The quick brown fox jumps over the lazy dog near the riverbank every single morning without fail.',
      'Practice makes perfect, and typing quickly is a skill that improves the more consistently you use it.',
      'A journey of a thousand miles begins with a single step, and so does learning to type faster.',
      'Toolkit Pro puts dozens of handy tools right in your browser, with nothing to install and nothing to sign up for.',
      'Good habits, once formed, are hard to break -- the same is true for good typing technique and posture.'
    ];
    c.innerHTML = `
      <div class="result-box" id="tstPassage" style="text-align:left;line-height:1.6"></div>
      <div class="field"><label>Type the passage above</label><textarea class="ta" id="tstIn" rows="4" placeholder="Start typing here..."></textarea></div>
      <div class="actions">
        <button class="btn primary" id="tstFinish" type="button">Finish</button>
        <button class="btn ghost" id="tstRestart" type="button">New Passage</button>
      </div>
      <div class="stat-grid" id="tstStats"></div>
    `;
    const $passageEl=c.querySelector('#tstPassage'), $in=c.querySelector('#tstIn'), $stats=c.querySelector('#tstStats');
    let passage='', startTime=null, finished=false;
    function renderPassage(){
      const typed = $in.value;
      $passageEl.innerHTML = passage.split('').map((ch,i)=>{
        if(i>=typed.length) return `<span>${esc(ch)}</span>`;
        return typed[i]===ch ? `<span style="color:#059669">${esc(ch)}</span>` : `<span style="color:#DC2626;text-decoration:underline">${esc(ch)}</span>`;
      }).join('');
    }
    function newPassage(){
      passage = PASSAGES[Math.floor(Math.random()*PASSAGES.length)];
      startTime=null; finished=false; $in.value=''; $in.disabled=false; $stats.innerHTML='';
      renderPassage();
    }
    function finish(){
      if(finished || !startTime) return;
      finished = true; $in.disabled = true;
      const minutes = Math.max((Date.now()-startTime)/60000, 1/60000);
      const typed = $in.value;
      let correct=0;
      for(let i=0;i<Math.min(typed.length,passage.length);i++) if(typed[i]===passage[i]) correct++;
      const wpm = Math.round((correct/5)/minutes);
      const accuracy = typed.length ? Math.round((correct/typed.length)*100) : 0;
      $stats.innerHTML = `
        <div class="stat"><span class="stat-val">${wpm}</span><span class="stat-lbl">Words per Minute</span></div>
        <div class="stat"><span class="stat-val">${accuracy}%</span><span class="stat-lbl">Accuracy</span></div>
        <div class="stat"><span class="stat-val">${Math.round((Date.now()-startTime)/1000)}s</span><span class="stat-lbl">Time Taken</span></div>
      `;
    }
    $in.addEventListener('input', ()=>{
      if(finished) return;
      if(!startTime) startTime = Date.now();
      renderPassage();
      if($in.value.length >= passage.length) finish();
    });
    c.querySelector('#tstFinish').addEventListener('click', finish);
    c.querySelector('#tstRestart').addEventListener('click', newPassage);
    newPassage();
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr08', cat:'productivity', name:'Random Team / Group Generator', desc:'Paste a list of names and instantly split them into a chosen number of random, balanced groups.', keywords:'random team generator group splitter groups shuffle names',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Names (one per line)</label><textarea class="ta" id="grpIn" rows="8" placeholder="Amit
Priya
Rahul
Sara">Amit
Priya
Rahul
Sara
Neha
Vikram
Ishaan
Ananya</textarea></div>
      <div class="form-grid">
        <div class="field"><label>Number of groups</label><input type="number" id="grpN" min="2" max="30" value="2" step="1"></div>
      </div>
      <div class="actions"><button class="btn primary" id="grpGo" type="button">Shuffle Into Groups</button></div>
      <div id="grpOut" class="form-grid"></div>
    `;
    const $in=c.querySelector('#grpIn'), $n=c.querySelector('#grpN'), $out=c.querySelector('#grpOut');
    function shuffle(arr){
      const a=arr.slice();
      for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
      return a;
    }
    c.querySelector('#grpGo').addEventListener('click', ()=>{
      const names = $in.value.split('\n').map(s=>s.trim()).filter(Boolean);
      const n = Math.max(2, Math.min(30, parseInt($n.value,10)||2));
      if(names.length < n){ $out.innerHTML = `<p class="hint">Add at least ${n} names for ${n} groups.</p>`; return; }
      const shuffled = shuffle(names);
      const groups = Array.from({length:n}, ()=>[]);
      shuffled.forEach((name,i)=> groups[i%n].push(name));
      $out.innerHTML = groups.map((g,i)=>`
        <div class="field"><label>Group ${i+1} (${g.length})</label>
          <div class="result-box" style="text-align:left">${g.map(x=>esc(x)).join('<br>')}</div>
        </div>`).join('');
    });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr09', cat:'productivity', name:'Dice Roller & Coin Flip', desc:'Roll one or more virtual dice, or flip a coin — for games, decisions or classroom activities.', keywords:'dice roller coin flip random game d6 d20',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Number of dice</label><input type="number" id="drCount" min="1" max="10" value="2" step="1"></div>
        <div class="field"><label>Sides per die</label>
          <select id="drSides">
            <option value="4">D4</option>
            <option value="6" selected>D6</option>
            <option value="8">D8</option>
            <option value="10">D10</option>
            <option value="12">D12</option>
            <option value="20">D20</option>
            <option value="100">D100</option>
          </select>
        </div>
      </div>
      <div class="actions">
        <button class="btn primary" id="drRoll" type="button">Roll Dice</button>
        <button class="btn ghost" id="drCoin" type="button">Flip Coin</button>
      </div>
      <div class="result-box" id="drOut" style="font-size:1.6rem;text-align:center">—</div>
    `;
    const $count=c.querySelector('#drCount'), $sides=c.querySelector('#drSides'), $out=c.querySelector('#drOut');
    c.querySelector('#drRoll').addEventListener('click', ()=>{
      const n = Math.max(1, Math.min(10, parseInt($count.value,10)||1));
      const sides = parseInt($sides.value,10);
      const rolls = Array.from({length:n}, ()=> 1+Math.floor(Math.random()*sides));
      const total = rolls.reduce((a,b)=>a+b,0);
      $out.innerHTML = `${rolls.map(r=>`<span class="mono" style="display:inline-block;min-width:2.2em;padding:4px 8px;margin:2px;border:1px solid var(--border,#ccc);border-radius:6px">${r}</span>`).join('')}<div class="hint" style="margin-top:8px">Total: ${total}</div>`;
    });
    c.querySelector('#drCoin').addEventListener('click', ()=>{
      $out.textContent = Math.random()<0.5 ? 'Heads' : 'Tails';
    });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr10', cat:'productivity', name:'Random Quote Generator', desc:'Get an inspiring or thought-provoking quote at the click of a button, ready to copy or share.', keywords:'random quote generator inspirational motivational',
  mount(c){
    c.innerHTML = `
      <div class="result-box" id="rqOut" style="text-align:left;font-size:1.2rem;font-style:italic">—</div>
      <div class="actions">
        <button class="btn primary" id="rqNext" type="button">New Quote</button>
        <button class="btn ghost" id="rqCopy" type="button">Copy</button>
      </div>
    `;
    const $out=c.querySelector('#rqOut');
    let current='';
    function next(){
      const q = QUOTES_LIST[Math.floor(Math.random()*QUOTES_LIST.length)];
      current = '"'+q.q+'" — '+q.a;
      $out.innerHTML = `“${esc(q.q)}”<div class="hint" style="margin-top:8px;font-style:normal">— ${esc(q.a)}</div>`;
    }
    c.querySelector('#rqNext').addEventListener('click', next);
    c.querySelector('#rqCopy').addEventListener('click', async (e)=>{
      const ok = await safeCopy(current);
      if (ok) flash(e.currentTarget, T('ui.copied'));
      else flash(e.currentTarget, T('ui.couldNotCopy'));
    });
    next();
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr11', cat:'productivity', name:'Online Whiteboard / Sketchpad', desc:'A simple freehand drawing canvas — sketch ideas, diagrams or doodles and save them as an image.', keywords:'whiteboard sketchpad drawing canvas doodle draw online',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Color</label><input type="color" id="wbColor" value="#2563EB"></div>
        <div class="field"><label>Brush size <span id="wbSizeV" class="mono">4</span></label><input type="range" id="wbSize" min="1" max="30" value="4"></div>
      </div>
      <div class="img-frame" style="max-width:100%;overflow:auto">
        <canvas id="wbCanvas" width="800" height="480" style="width:100%;height:auto;background:#fff;touch-action:none;cursor:crosshair"></canvas>
      </div>
      <div class="actions">
        <button class="btn ghost" id="wbClear" type="button">Clear</button>
        <button class="btn ghost" id="wbUndo" type="button">Undo</button>
        <button class="btn primary" id="wbDownload" type="button">Download PNG</button>
      </div>
      <p class="hint">Draw with your mouse, finger or stylus. Saved only when you download.</p>
    `;
    const canvas=c.querySelector('#wbCanvas'), ctx=canvas.getContext('2d');
    const $color=c.querySelector('#wbColor'), $size=c.querySelector('#wbSize'), $sizeV=c.querySelector('#wbSizeV');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.lineCap='round'; ctx.lineJoin='round';
    let drawing=false, lastX=0, lastY=0;
    const history=[];
    function saveHistory(){ try{ history.push(ctx.getImageData(0,0,canvas.width,canvas.height)); if(history.length>20) history.shift(); }catch(e){} }
    function pos(e){
      const r=canvas.getBoundingClientRect();
      const cx = (e.touches?e.touches[0].clientX:e.clientX) - r.left;
      const cy = (e.touches?e.touches[0].clientY:e.clientY) - r.top;
      return { x: cx * (canvas.width/r.width), y: cy * (canvas.height/r.height) };
    }
    function start(e){ e.preventDefault(); saveHistory(); drawing=true; const p=pos(e); lastX=p.x; lastY=p.y; }
    function move(e){
      if(!drawing) return; e.preventDefault();
      const p=pos(e);
      ctx.strokeStyle=$color.value; ctx.lineWidth=parseFloat($size.value);
      ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(p.x,p.y); ctx.stroke();
      lastX=p.x; lastY=p.y;
    }
    function end(){ drawing=false; }
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, {passive:false});
    canvas.addEventListener('touchmove', move, {passive:false});
    canvas.addEventListener('touchend', end);
    $size.addEventListener('input', ()=>{ $sizeV.textContent = $size.value; });
    c.querySelector('#wbClear').addEventListener('click', ()=>{ saveHistory(); ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); });
    c.querySelector('#wbUndo').addEventListener('click', ()=>{ const img=history.pop(); if(img) ctx.putImageData(img,0,0); });
    c.querySelector('#wbDownload').addEventListener('click', ()=>{
      canvas.toBlob(async blob=>{ await saveFile('whiteboard-sketch.png', blob); });
    });
    onToolCleanup(()=>{ window.removeEventListener('mouseup', end); });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr12', cat:'productivity', name:'Invoice Generator (Printable)', desc:'Fill in your business and client details, add line items, and print or save a clean invoice as a PDF.', keywords:'invoice generator maker bill printable pdf',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Your business name</label><input type="text" id="invFrom" value="Your Business Name"></div>
        <div class="field"><label>Bill to</label><input type="text" id="invTo" value="Client Name"></div>
        <div class="field"><label>Invoice #</label><input type="text" id="invNum" value="INV-0001"></div>
        <div class="field"><label>Date</label><input type="date" id="invDate"></div>
        <div class="field"><label>Tax rate (%)</label><input type="number" id="invTax" value="0" min="0" step="0.1"></div>
        <div class="field"><label>Currency symbol</label><input type="text" id="invCur" value="$" maxlength="3"></div>
      </div>
      <div id="invItems"></div>
      <div class="actions"><button class="btn ghost" id="invAddItem" type="button">+ Add Line Item</button></div>
      <div class="result-box" id="invTotal" style="text-align:right"></div>
      <div class="actions"><button class="btn primary" id="invPrint" type="button">Print / Save as PDF</button></div>
      <p class="hint">Opens a clean, print-ready invoice in a new tab — use your browser's "Save as PDF" print destination.</p>
    `;
    const $items=c.querySelector('#invItems');
    function addItem(desc, qty, rate){
      const row=document.createElement('div');
      row.className='form-grid invItemRow';
      row.innerHTML = `
        <div class="field wide"><label>Description</label><input type="text" class="invDesc" value="${esc(desc||'')}" placeholder="Item or service"></div>
        <div class="field"><label>Qty</label><input type="number" class="invQty" value="${qty!==undefined?qty:1}" min="0" step="1"></div>
        <div class="field"><label>Rate</label><input type="number" class="invRate" value="${rate!==undefined?rate:0}" min="0" step="0.01"></div>
        <div class="field"><label>&nbsp;</label><button type="button" class="btn ghost invRemove">Remove</button></div>
      `;
      $items.appendChild(row);
      row.querySelectorAll('input').forEach(i=>i.addEventListener('input', updateTotal));
      row.querySelector('.invRemove').addEventListener('click', ()=>{ row.remove(); updateTotal(); });
    }
    function readItems(){
      return Array.from($items.querySelectorAll('.invItemRow')).map(row=>({
        desc: row.querySelector('.invDesc').value,
        qty: parseFloat(row.querySelector('.invQty').value)||0,
        rate: parseFloat(row.querySelector('.invRate').value)||0
      }));
    }
    function updateTotal(){
      const items = readItems();
      const subtotal = items.reduce((s,it)=>s+it.qty*it.rate,0);
      const taxRate = parseFloat(c.querySelector('#invTax').value)||0;
      const tax = subtotal * (taxRate/100);
      const cur = c.querySelector('#invCur').value || '$';
      c.querySelector('#invTotal').innerHTML = `Subtotal: ${cur}${subtotal.toFixed(2)}<br>Tax: ${cur}${tax.toFixed(2)}<br><strong>Total: ${cur}${(subtotal+tax).toFixed(2)}</strong>`;
    }
    c.querySelector('#invAddItem').addEventListener('click', ()=>addItem());
    c.querySelector('#invTax').addEventListener('input', updateTotal);
    c.querySelector('#invCur').addEventListener('input', updateTotal);
    const $date=c.querySelector('#invDate'); $date.value = new Date().toISOString().slice(0,10);
    addItem('Design services', 10, 50);
    addItem('Consulting', 2, 100);
    updateTotal();
    c.querySelector('#invPrint').addEventListener('click', ()=>{
      const items = readItems();
      const subtotal = items.reduce((s,it)=>s+it.qty*it.rate,0);
      const taxRate = parseFloat(c.querySelector('#invTax').value)||0;
      const tax = subtotal * (taxRate/100);
      const cur = c.querySelector('#invCur').value || '$';
      const from = c.querySelector('#invFrom').value, to = c.querySelector('#invTo').value;
      const num = c.querySelector('#invNum').value, date = $date.value;
      const rows = items.map(it=>`<tr><td>${esc(it.desc)}</td><td style="text-align:right">${it.qty}</td><td style="text-align:right">${cur}${it.rate.toFixed(2)}</td><td style="text-align:right">${cur}${(it.qty*it.rate).toFixed(2)}</td></tr>`).join('');
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(num)}</title>
        <style>
          body{font-family:Arial,sans-serif;color:#111;max-width:700px;margin:40px auto;padding:0 20px}
          h1{font-size:22px;margin-bottom:0}
          table{width:100%;border-collapse:collapse;margin-top:20px}
          th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}
          .totals{text-align:right;margin-top:16px;font-size:15px}
          .totals strong{font-size:18px}
          .meta{color:#555;margin:4px 0 20px}
        </style></head><body>
        <h1>Invoice</h1>
        <p class="meta">From: ${esc(from)}<br>Bill To: ${esc(to)}<br>Invoice #: ${esc(num)} &nbsp; Date: ${esc(date)}</p>
        <table><thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <div class="totals">Subtotal: ${cur}${subtotal.toFixed(2)}<br>Tax: ${cur}${tax.toFixed(2)}<br><strong>Total: ${cur}${(subtotal+tax).toFixed(2)}</strong></div>
        <script>window.onload=()=>window.print();<\/script>
        </body></html>`;
      const w = window.open('', '_blank');
      if(w){ w.document.open(); w.document.write(html); w.document.close(); }
      else { alert('Please allow pop-ups to print the invoice.'); }
    });
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr13', cat:'productivity', name:'Habit Tracker', desc:'Track daily habits with a simple 7-day grid and see your current streak — saved in this browser.', keywords:'habit tracker streak daily checklist routine',
  mount(c){
    c.innerHTML = `
      <div class="field" style="display:flex;gap:8px;align-items:flex-end">
        <div style="flex:1"><label>New habit</label><input type="text" id="habInput" placeholder="e.g. Drink water, Read, Exercise"></div>
        <button class="btn primary" id="habAdd" type="button">Add</button>
      </div>
      <div id="habList" style="margin-top:14px;overflow-x:auto"></div>
      <p class="hint">Saved in this browser only — nothing is uploaded anywhere.</p>
    `;
    const KEY='tp_habit_tracker_v1';
    const $input=c.querySelector('#habInput'), $add=c.querySelector('#habAdd'), $list=c.querySelector('#habList');
    let habits=[];
    try{ habits=JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){ habits=[]; }
    function save(){ try{ localStorage.setItem(KEY, JSON.stringify(habits)); }catch(e){} }
    function last7Dates(){
      const arr=[];
      for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); arr.push(d.toISOString().slice(0,10)); }
      return arr;
    }
    function streak(dates){
      let s=0;
      for(let i=0;i<365;i++){
        const d=new Date(); d.setDate(d.getDate()-i);
        const iso=d.toISOString().slice(0,10);
        if(dates.includes(iso)) s++; else break;
      }
      return s;
    }
    function render(){
      if(!habits.length){ $list.innerHTML='<p class="hint">No habits yet — add one above.</p>'; return; }
      const days = last7Dates();
      const dayLabels = days.map(d=> new Date(d+'T00:00:00').toLocaleDateString(undefined,{weekday:'short'}));
      $list.innerHTML = `
        <table style="border-collapse:collapse;width:100%">
          <thead><tr><th style="text-align:left;padding:6px">Habit</th>${dayLabels.map(l=>`<th style="padding:6px;text-align:center;font-size:12px">${esc(l)}</th>`).join('')}<th style="padding:6px">Streak</th><th></th></tr></thead>
          <tbody>${habits.map((h,hi)=>`
            <tr>
              <td style="padding:6px">${esc(h.name)}</td>
              ${days.map(d=>`<td style="text-align:center;padding:6px"><input type="checkbox" class="habChk" data-h="${hi}" data-d="${d}" ${h.dates.includes(d)?'checked':''}></td>`).join('')}
              <td style="text-align:center;padding:6px">${streak(h.dates)} \u{1F525}</td>
              <td style="text-align:center;padding:6px"><button type="button" class="btn ghost small habDel" data-h="${hi}">✕</button></td>
            </tr>`).join('')}</tbody>
        </table>`;
      $list.querySelectorAll('.habChk').forEach(chk=>chk.addEventListener('change', ()=>{
        const hi=+chk.dataset.h, d=chk.dataset.d, h=habits[hi];
        if(chk.checked){ if(!h.dates.includes(d)) h.dates.push(d); }
        else { h.dates = h.dates.filter(x=>x!==d); }
        save(); render();
      }));
      $list.querySelectorAll('.habDel').forEach(btn=>btn.addEventListener('click', ()=>{ habits.splice(+btn.dataset.h,1); save(); render(); }));
    }
    function addHabit(){
      const name = $input.value.trim(); if(!name) return;
      habits.push({name, dates:[]}); $input.value=''; save(); render();
    }
    $add.addEventListener('click', addHabit);
    $input.addEventListener('keydown', e=>{ if(e.key==='Enter') addHabit(); });
    render();
  }
});

PRODUCTIVITY_TOOLS.push({
  id:'pr14', cat:'productivity', name:'Random Username Generator', desc:'Generate fun, available-sounding usernames by combining adjectives, nouns and numbers.', keywords:'username generator random nickname handle name',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>How many usernames</label><input type="number" id="unCount" min="1" max="20" value="5" step="1"></div>
        <div class="field"><label class="chk"><input type="checkbox" id="unNum" checked> Add a random number</label></div>
        <div class="field"><label>Separator</label>
          <select id="unSep">
            <option value="">None</option>
            <option value="_" selected>Underscore (_)</option>
            <option value="-">Hyphen (-)</option>
            <option value=".">Dot (.)</option>
          </select>
        </div>
      </div>
      <div class="actions"><button class="btn primary" id="unGo" type="button">Generate</button></div>
      <textarea class="ta out" id="unOut" rows="6" readonly></textarea>
      <div class="actions" id="unActs"></div>
    `;
    const $count=c.querySelector('#unCount'), $num=c.querySelector('#unNum'), $sep=c.querySelector('#unSep'), $out=c.querySelector('#unOut'), acts=c.querySelector('#unActs');
    function gen(){
      const n = Math.max(1, Math.min(20, parseInt($count.value,10)||1));
      const list=[];
      for(let i=0;i<n;i++){
        const adj = USERNAME_ADJECTIVES[Math.floor(Math.random()*USERNAME_ADJECTIVES.length)];
        const noun = USERNAME_NOUNS[Math.floor(Math.random()*USERNAME_NOUNS.length)];
        let name = adj + $sep.value + noun;
        if($num.checked) name += $sep.value + (10 + Math.floor(Math.random()*90));
        list.push(name);
      }
      $out.value = list.join('\n');
    }
    c.querySelector('#unGo').addEventListener('click', gen);
    acts.appendChild(copyBtn(()=>$out.value));
    gen();
  }
});
/* ===== PRODUCTIVITY_TOOLS_MARKER ===== */
COLOR_TOOLS.push({
  id:'cl01', cat:'color', name:'CSS Flexbox Generator', desc:'Pick flex-direction, justify-content and align-items visually, and copy the generated CSS.', keywords:'flexbox css flex layout generator',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Direction</label><select id="fxDir"><option value="row">row</option><option value="row-reverse">row-reverse</option><option value="column">column</option><option value="column-reverse">column-reverse</option></select></div>
        <div class="field"><label>Justify content</label><select id="fxJustify"><option value="flex-start">flex-start</option><option value="center">center</option><option value="flex-end">flex-end</option><option value="space-between">space-between</option><option value="space-around">space-around</option><option value="space-evenly">space-evenly</option></select></div>
        <div class="field"><label>Align items</label><select id="fxAlign"><option value="stretch">stretch</option><option value="flex-start">flex-start</option><option value="center">center</option><option value="flex-end">flex-end</option></select></div>
        <div class="field"><label>Gap (px)</label><input type="number" id="fxGap" min="0" max="60" value="10"></div>
      </div>
      <div id="fxPreview" style="display:flex;min-height:140px;border:1px dashed var(--border);border-radius:var(--radius-m);padding:10px;background:var(--surface-2)"></div>
      <div class="field" style="margin-top:10px"><label>Generated CSS</label><textarea class="ta out" id="fxOut" rows="6" readonly></textarea></div>
      <div class="actions" id="fxActs"></div>
    `;
    const $dir=c.querySelector('#fxDir'), $justify=c.querySelector('#fxJustify'), $align=c.querySelector('#fxAlign'), $gap=c.querySelector('#fxGap');
    const $preview=c.querySelector('#fxPreview'), $out=c.querySelector('#fxOut'), acts=c.querySelector('#fxActs');
    $preview.innerHTML = [1,2,3].map(n=>`<div style="background:var(--accent);color:var(--accent-text);width:60px;height:44px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px">${n}</div>`).join('');
    function upd(){
      $preview.style.flexDirection=$dir.value; $preview.style.justifyContent=$justify.value; $preview.style.alignItems=$align.value; $preview.style.gap=$gap.value+'px';
      $out.value = `.flex-container {\n  display: flex;\n  flex-direction: ${$dir.value};\n  justify-content: ${$justify.value};\n  align-items: ${$align.value};\n  gap: ${$gap.value}px;\n}`;
    }
    [$dir,$justify,$align,$gap].forEach(el=>el.addEventListener('input', upd));
    acts.appendChild(copyBtn(()=>$out.value));
    upd();
  }
});

COLOR_TOOLS.push({
  id:'cl02', cat:'color', name:'CSS Grid Generator', desc:'Build a CSS Grid layout visually — set columns, rows and gap, and copy the code.', keywords:'css grid layout generator columns rows',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Columns</label><input type="number" id="gdCols" min="1" max="8" value="3"></div>
        <div class="field"><label>Rows</label><input type="number" id="gdRows" min="1" max="6" value="2"></div>
        <div class="field"><label>Gap (px)</label><input type="number" id="gdGap" min="0" max="60" value="10"></div>
      </div>
      <div id="gdPreview" style="display:grid;min-height:140px;border:1px dashed var(--border);border-radius:var(--radius-m);padding:10px;background:var(--surface-2)"></div>
      <div class="field" style="margin-top:10px"><label>Generated CSS</label><textarea class="ta out" id="gdOut" rows="6" readonly></textarea></div>
      <div class="actions" id="gdActs"></div>
    `;
    const $cols=c.querySelector('#gdCols'), $rows=c.querySelector('#gdRows'), $gap=c.querySelector('#gdGap');
    const $preview=c.querySelector('#gdPreview'), $out=c.querySelector('#gdOut'), acts=c.querySelector('#gdActs');
    function upd(){
      const cols=Math.max(1,parseInt($cols.value,10)||1), rows=Math.max(1,parseInt($rows.value,10)||1), gap=Math.max(0,parseInt($gap.value,10)||0);
      $preview.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      $preview.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      $preview.style.gap = gap+'px';
      $preview.innerHTML = Array.from({length:cols*rows},(_,i)=>`<div style="background:var(--accent);color:var(--accent-text);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;min-height:36px">${i+1}</div>`).join('');
      $out.value = `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(${cols}, 1fr);\n  grid-template-rows: repeat(${rows}, 1fr);\n  gap: ${gap}px;\n}`;
    }
    [$cols,$rows,$gap].forEach(el=>el.addEventListener('input', upd));
    acts.appendChild(copyBtn(()=>$out.value));
    upd();
  }
});

COLOR_TOOLS.push({
  id:'cl03', cat:'color', name:'CSS Animation (Keyframes) Generator', desc:'Create a simple CSS @keyframes animation — pick a transform, duration and easing, preview it live, and copy the code.', keywords:'css animation keyframes transition generator',
  mount(c){
    const EFFECTS = {
      bounce: {name:'tpBounce', frames:'0%,100%{transform:translateY(0);} 50%{transform:translateY(-24px);}'},
      spin: {name:'tpSpin', frames:'from{transform:rotate(0deg);} to{transform:rotate(360deg);}'},
      pulse: {name:'tpPulse', frames:'0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.25);opacity:.75;}'},
      slide: {name:'tpSlide', frames:'from{transform:translateX(-60px);opacity:0;} to{transform:translateX(0);opacity:1;}'},
      fade: {name:'tpFade', frames:'from{opacity:0;} to{opacity:1;}'}
    };
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Effect</label><select id="anEffect">
          <option value="bounce">Bounce</option><option value="spin">Spin</option><option value="pulse">Pulse</option><option value="slide">Slide In</option><option value="fade">Fade In</option>
        </select></div>
        <div class="field"><label>Duration (s)</label><input type="number" id="anDur" min="0.2" max="10" step="0.1" value="1.2"></div>
        <div class="field"><label>Easing</label><select id="anEase">
          <option value="ease">ease</option><option value="ease-in">ease-in</option><option value="ease-out">ease-out</option><option value="ease-in-out">ease-in-out</option><option value="linear">linear</option>
        </select></div>
        <div class="field"><label class="chk"><input type="checkbox" id="anLoop" checked> Loop infinitely</label></div>
      </div>
      <div style="min-height:100px;display:flex;align-items:center;justify-content:center;border:1px dashed var(--border);border-radius:var(--radius-m);background:var(--surface-2)">
        <div id="anBox" style="width:56px;height:56px;border-radius:10px;background:var(--accent)"></div>
      </div>
      <div class="field" style="margin-top:10px"><label>Generated CSS</label><textarea class="ta out" id="anOut" rows="10" readonly></textarea></div>
      <div class="actions" id="anActs"><button class="btn ghost" id="anReplay" type="button">Replay</button></div>
    `;
    const $effect=c.querySelector('#anEffect'), $dur=c.querySelector('#anDur'), $ease=c.querySelector('#anEase'), $loop=c.querySelector('#anLoop');
    const $box=c.querySelector('#anBox'), $out=c.querySelector('#anOut'), acts=c.querySelector('#anActs');
    const styleEl = document.createElement('style'); document.head.appendChild(styleEl);
    function upd(){
      const eff = EFFECTS[$effect.value];
      styleEl.textContent = `@keyframes ${eff.name} { ${eff.frames} }`;
      $box.style.animation = `${eff.name} ${$dur.value}s ${$ease.value} ${$loop.checked?'infinite':'1'}`;
      $out.value = `@keyframes ${eff.name} {\n  ${eff.frames.replace(/\} /g,'}\n  ')}\n}\n\n.element {\n  animation: ${eff.name} ${$dur.value}s ${$ease.value}${$loop.checked?' infinite':''};\n}`;
    }
    [$effect,$dur,$ease,$loop].forEach(el=>el.addEventListener('input', upd));
    c.querySelector('#anReplay').addEventListener('click', ()=>{ $box.style.animation='none'; void $box.offsetWidth; upd(); });
    acts.appendChild(copyBtn(()=>$out.value));
    upd();
    onToolCleanup(()=>{ styleEl.remove(); });
  }
});

COLOR_TOOLS.push({
  id:'cl04', cat:'color', name:'CSS Clip-Path Generator', desc:'Pick a shape and get the matching CSS clip-path code, with a live preview.', keywords:'css clip-path shape generator polygon',
  mount(c){
    const SHAPES = {
      circle: 'circle(50% at 50% 50%)',
      ellipse: 'ellipse(50% 35% at 50% 50%)',
      triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      arrow: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)'
    };
    c.innerHTML = `
      <div class="field"><label>Shape</label><select id="cpShape">
        ${Object.keys(SHAPES).map(k=>`<option value="${k}">${k.charAt(0).toUpperCase()+k.slice(1)}</option>`).join('')}
      </select></div>
      <div style="min-height:180px;display:flex;align-items:center;justify-content:center;border:1px dashed var(--border);border-radius:var(--radius-m);background:var(--surface-2)">
        <div id="cpBox" style="width:160px;height:160px;background:var(--accent)"></div>
      </div>
      <div class="field" style="margin-top:10px"><label>Generated CSS</label><textarea class="ta out" id="cpOut" rows="3" readonly></textarea></div>
      <div class="actions" id="cpActs"></div>
    `;
    const $shape=c.querySelector('#cpShape'), $box=c.querySelector('#cpBox'), $out=c.querySelector('#cpOut'), acts=c.querySelector('#cpActs');
    function upd(){
      const val = SHAPES[$shape.value];
      $box.style.clipPath = val; $box.style.webkitClipPath = val;
      $out.value = `.element {\n  clip-path: ${val};\n}`;
    }
    $shape.addEventListener('change', upd);
    acts.appendChild(copyBtn(()=>$out.value));
    upd();
  }
});

COLOR_TOOLS.push({
  id:'cl05', cat:'color', name:'Color Shades & Tints Generator', desc:'Enter a base color and get a full scale of lighter tints and darker shades, ready to use as a palette.', keywords:'color shades tints scale palette hex',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Base color</label><input type="color" id="stColor" value="#2563eb"></div>
      <div id="stOut"></div>
    `;
    const $color=c.querySelector('#stColor'), $out=c.querySelector('#stOut');
    function upd(){
      const rgb = hexToRgb($color.value); if(!rgb){ return; }
      const hsl = rgbToHsl(rgb.r,rgb.g,rgb.b);
      const steps = [95,85,75,65,55,45,35,25,15,5];
      $out.innerHTML = '<div class="swatch-row">' + steps.map(l=>{
        const c2 = hslToRgb(hsl.h, hsl.s, l);
        const hex = rgbToHex(c2.r,c2.g,c2.b);
        return colorSwatchHtml(hex, l+'% L');
      }).join('') + '</div>';
    }
    $color.addEventListener('input', upd);
    upd();
  }
});

COLOR_TOOLS.push({
  id:'cl06', cat:'color', name:'Color Name Finder', desc:'Enter a hex or RGB color and find its closest standard CSS color name.', keywords:'color name finder hex to name css color identifier',
  mount(c){
    c.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Color</label><input type="color" id="cnfPicker" value="#6495ED"></div>
        <div class="field"><label>Hex value</label><input type="text" id="cnfHex" value="#6495ED"></div>
      </div>
      <div class="result-box" id="cnfOut">—</div>
    `;
    const $picker=c.querySelector('#cnfPicker'), $hex=c.querySelector('#cnfHex'), $out=c.querySelector('#cnfOut');
    function nearest(hex){
      const rgb = hexToRgb(hex);
      if(!rgb) return null;
      let best=null, bestDist=Infinity;
      CSS_NAMED_COLORS.forEach(([name,nhex])=>{
        const nrgb = hexToRgb(nhex);
        const d = Math.pow(rgb.r-nrgb.r,2)+Math.pow(rgb.g-nrgb.g,2)+Math.pow(rgb.b-nrgb.b,2);
        if(d<bestDist){ bestDist=d; best={name,hex:nhex}; }
      });
      return best;
    }
    function render(hex){
      const match = nearest(hex);
      if(!match){ $out.innerHTML = '<span class="muted">Enter a valid hex color.</span>'; return; }
      $out.innerHTML = `${colorSwatchHtml(hex, 'Your color')}${colorSwatchHtml(match.hex, 'Closest: '+match.name)}`;
    }
    $picker.addEventListener('input', ()=>{ $hex.value=$picker.value; render($picker.value); });
    $hex.addEventListener('input', ()=>{ const rgb=hexToRgb($hex.value); if(rgb){ $picker.value=rgbToHex(rgb.r,rgb.g,rgb.b); render($hex.value); } });
    render($hex.value);
  }
});
/* ===== COLOR_TOOLS_MARKER ===== */
SEO_TOOLS.push({
  id:'se01', cat:'seo', name:'Meta Tag Generator', desc:'Generate the essential HTML meta tags — title, description, keywords and author — ready to paste into your page head.', keywords:'meta tags html head seo generator',
  mount(c){
    codeGenTool(c, {
      fields:[
        {key:'title', label:'Page title', type:'text', placeholder:'My Page Title'},
        {key:'desc', label:'Meta description', type:'textarea', rows:3, placeholder:'A short, compelling summary of the page (150-160 characters).'},
        {key:'keywords', label:'Keywords (comma-separated)', type:'text', placeholder:'keyword one, keyword two'},
        {key:'author', label:'Author', type:'text', placeholder:'Your Name'}
      ],
      outLabel:'Generated HTML',
      generate(v){
        const lines=[];
        if(v.title) lines.push(`<title>${esc(v.title)}</title>`);
        if(v.desc) lines.push(`<meta name="description" content="${esc(v.desc)}">`);
        if(v.keywords) lines.push(`<meta name="keywords" content="${esc(v.keywords)}">`);
        if(v.author) lines.push(`<meta name="author" content="${esc(v.author)}">`);
        return lines.join('\n');
      }
    });
  }
});

SEO_TOOLS.push({
  id:'se02', cat:'seo', name:'Open Graph Tag Generator', desc:'Generate Open Graph meta tags so your page looks right when shared on Facebook, LinkedIn and other platforms.', keywords:'open graph og tags facebook social share',
  mount(c){
    codeGenTool(c, {
      fields:[
        {key:'title', label:'og:title', type:'text', placeholder:'Page title'},
        {key:'desc', label:'og:description', type:'textarea', rows:2, placeholder:'Short description'},
        {key:'url', label:'og:url', type:'text', placeholder:'https://example.com/page'},
        {key:'image', label:'og:image', type:'text', placeholder:'https://example.com/image.jpg'},
        {key:'type', label:'og:type', type:'select', options:[{v:'website',l:'website'},{v:'article',l:'article'},{v:'product',l:'product'}], default:'website'}
      ],
      outLabel:'Generated HTML',
      generate(v){
        const lines=[];
        if(v.title) lines.push(`<meta property="og:title" content="${esc(v.title)}">`);
        if(v.desc) lines.push(`<meta property="og:description" content="${esc(v.desc)}">`);
        if(v.url) lines.push(`<meta property="og:url" content="${esc(v.url)}">`);
        if(v.image) lines.push(`<meta property="og:image" content="${esc(v.image)}">`);
        lines.push(`<meta property="og:type" content="${esc(v.type)}">`);
        return lines.join('\n');
      }
    });
  }
});

SEO_TOOLS.push({
  id:'se03', cat:'seo', name:'Twitter Card Tag Generator', desc:'Generate Twitter/X Card meta tags so your links preview correctly when shared.', keywords:'twitter card meta tags x social share',
  mount(c){
    codeGenTool(c, {
      fields:[
        {key:'card', label:'Card type', type:'select', options:[{v:'summary',l:'summary'},{v:'summary_large_image',l:'summary_large_image'}], default:'summary_large_image'},
        {key:'title', label:'Title', type:'text', placeholder:'Page title'},
        {key:'desc', label:'Description', type:'textarea', rows:2, placeholder:'Short description'},
        {key:'image', label:'Image URL', type:'text', placeholder:'https://example.com/image.jpg'},
        {key:'site', label:'Site @handle', type:'text', placeholder:'@yoursite'}
      ],
      outLabel:'Generated HTML',
      generate(v){
        const lines=[`<meta name="twitter:card" content="${esc(v.card)}">`];
        if(v.title) lines.push(`<meta name="twitter:title" content="${esc(v.title)}">`);
        if(v.desc) lines.push(`<meta name="twitter:description" content="${esc(v.desc)}">`);
        if(v.image) lines.push(`<meta name="twitter:image" content="${esc(v.image)}">`);
        if(v.site) lines.push(`<meta name="twitter:site" content="${esc(v.site)}">`);
        return lines.join('\n');
      }
    });
  }
});

SEO_TOOLS.push({
  id:'se04', cat:'seo', name:'Robots.txt Generator', desc:'Build a robots.txt file with allow/disallow rules and a sitemap reference.', keywords:'robots.txt crawler generator sitemap',
  mount(c){
    codeGenTool(c, {
      fields:[
        {key:'agent', label:'User-agent', type:'text', default:'*'},
        {key:'disallow', label:'Disallow paths (one per line)', type:'textarea', rows:3, placeholder:'/admin/\n/private/'},
        {key:'allow', label:'Allow paths (one per line, optional)', type:'textarea', rows:2, placeholder:'/public/'},
        {key:'sitemap', label:'Sitemap URL', type:'text', placeholder:'https://example.com/sitemap.xml'}
      ],
      outLabel:'robots.txt', rows:10,
      generate(v){
        const lines=[`User-agent: ${v.agent||'*'}`];
        (v.disallow||'').split('\n').map(s=>s.trim()).filter(Boolean).forEach(p=>lines.push(`Disallow: ${p}`));
        (v.allow||'').split('\n').map(s=>s.trim()).filter(Boolean).forEach(p=>lines.push(`Allow: ${p}`));
        if(!(v.disallow||'').trim()) lines.push('Disallow:');
        if(v.sitemap) { lines.push(''); lines.push(`Sitemap: ${v.sitemap}`); }
        return lines.join('\n');
      }
    });
  }
});

SEO_TOOLS.push({
  id:'se05', cat:'seo', name:'XML Sitemap Generator', desc:'Turn a list of page URLs into a valid sitemap.xml file, ready to submit to search engines.', keywords:'sitemap xml generator urls seo',
  mount(c){
    codeGenTool(c, {
      fields:[
        {key:'urls', label:'Page URLs (one per line)', type:'textarea', rows:6, placeholder:'https://example.com/\nhttps://example.com/about'},
        {key:'freq', label:'Change frequency', type:'select', options:[{v:'always',l:'always'},{v:'hourly',l:'hourly'},{v:'daily',l:'daily'},{v:'weekly',l:'weekly'},{v:'monthly',l:'monthly'},{v:'yearly',l:'yearly'},{v:'never',l:'never'}], default:'weekly'},
        {key:'priority', label:'Priority (0.0 - 1.0)', type:'number', default:0.8, step:0.1}
      ],
      outLabel:'sitemap.xml', rows:12,
      generate(v){
        const urls=(v.urls||'').split('\n').map(s=>s.trim()).filter(Boolean);
        if(!urls.length) return '';
        const pr = isNaN(v.priority) ? 0.8 : v.priority;
        const body = urls.map(u=>`  <url>\n    <loc>${esc(u)}</loc>\n    <changefreq>${v.freq}</changefreq>\n    <priority>${pr.toFixed(1)}</priority>\n  </url>`).join('\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
      }
    });
  }
});

SEO_TOOLS.push({
  id:'se06', cat:'seo', name:'Keyword Density Checker', desc:'Check how often a keyword or phrase appears in your text, and its density as a percentage of total words.', keywords:'keyword density seo text analysis',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Text</label><textarea class="ta" id="kdText" rows="8" placeholder="Paste your article or page content here..."></textarea></div>
      <div class="field"><label>Keyword or phrase</label><input type="text" id="kdKeyword" placeholder="e.g. online tools"></div>
      <div class="stat-grid" id="kdOut"></div>
    `;
    const $text=c.querySelector('#kdText'), $kw=c.querySelector('#kdKeyword'), $out=c.querySelector('#kdOut');
    function upd(){
      const text=$text.value, kw=$kw.value.trim().toLowerCase();
      const words=(text.match(/\S+/g)||[]);
      const total=words.length;
      let count=0;
      if(kw && total){
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
        count = (text.match(re)||[]).length;
      }
      const kwWordCount = kw ? (kw.split(/\s+/).filter(Boolean).length||1) : 1;
      const density = total ? (count*kwWordCount/total*100) : 0;
      $out.innerHTML = [
        {v:total,l:'Total Words'},
        {v:count,l:'Keyword Occurrences'},
        {v:kw?density.toFixed(2)+'%':'—',l:'Keyword Density'}
      ].map(s=>`<div class="stat"><span class="stat-val">${esc(String(s.v))}</span><span class="stat-lbl">${esc(s.l)}</span></div>`).join('');
    }
    $text.addEventListener('input', upd); $kw.addEventListener('input', upd); upd();
  }
});

SEO_TOOLS.push({
  id:'se07', cat:'seo', name:'SEO Title Tag Length Checker', desc:'Check whether your page title fits within Google’s search result display before it gets truncated.', keywords:'title tag length seo character limit google',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Page title</label><input type="text" id="ttIn" placeholder="Type your page title..." maxlength="200"></div>
      <div class="stat-grid" id="ttStats"></div>
      <p class="hint">Google typically shows up to about 60 characters before truncating a title.</p>
      <div style="border:1px solid var(--border);border-radius:var(--radius-m);padding:12px;margin-top:8px">
        <div id="ttTitle" style="color:#1a0dab;font-size:18px;line-height:1.3"></div>
      </div>
    `;
    const $in=c.querySelector('#ttIn'), $stats=c.querySelector('#ttStats'), $title=c.querySelector('#ttTitle');
    function upd(){
      const text=$in.value, len=text.length, limit=60;
      const truncated = len>limit ? text.slice(0,limit-1).trim()+'…' : text;
      $stats.innerHTML = [
        {v:len,l:'Characters'},
        {v:len<=limit?'Good':'Too Long', l:'Status'}
      ].map(s=>`<div class="stat"><span class="stat-val">${esc(String(s.v))}</span><span class="stat-lbl">${esc(s.l)}</span></div>`).join('');
      $title.textContent = truncated || 'Your title preview will appear here';
    }
    $in.addEventListener('input', upd); upd();
  }
});

SEO_TOOLS.push({
  id:'se08', cat:'seo', name:'Meta Description Length Checker', desc:'Check whether your meta description fits Google’s search snippet before it gets cut off.', keywords:'meta description length seo character limit',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Meta description</label><textarea class="ta" id="mdIn" rows="4" placeholder="Type your meta description..." maxlength="400"></textarea></div>
      <div class="stat-grid" id="mdStats"></div>
      <p class="hint">Google typically shows up to about 155-160 characters before truncating a description.</p>
      <div style="border:1px solid var(--border);border-radius:var(--radius-m);padding:12px;margin-top:8px">
        <div id="mdPreview" style="color:var(--text-dim);font-size:14px;line-height:1.4"></div>
      </div>
    `;
    const $in=c.querySelector('#mdIn'), $stats=c.querySelector('#mdStats'), $preview=c.querySelector('#mdPreview');
    function upd(){
      const text=$in.value, len=text.length, limit=160;
      const truncated = len>limit ? text.slice(0,limit-1).trim()+'…' : text;
      $stats.innerHTML = [
        {v:len,l:'Characters'},
        {v:len<=limit?'Good':'Too Long', l:'Status'}
      ].map(s=>`<div class="stat"><span class="stat-val">${esc(String(s.v))}</span><span class="stat-lbl">${esc(s.l)}</span></div>`).join('');
      $preview.textContent = truncated || 'Your description preview will appear here';
    }
    $in.addEventListener('input', upd); upd();
  }
});

SEO_TOOLS.push({
  id:'se09', cat:'seo', name:'Canonical Tag Generator', desc:'Generate a canonical link tag to tell search engines the preferred URL for a page.', keywords:'canonical tag seo duplicate content url',
  mount(c){
    codeGenTool(c, {
      fields:[{key:'url', label:'Canonical URL', type:'text', placeholder:'https://example.com/page'}],
      outLabel:'Generated HTML', rows:2,
      generate(v){ return v.url ? `<link rel="canonical" href="${esc(v.url)}">` : ''; }
    });
  }
});

SEO_TOOLS.push({
  id:'se10', cat:'seo', name:'Google SERP Snippet Preview', desc:'See a live mockup of how your page title, URL and description will look in Google search results.', keywords:'serp preview google search snippet',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Page URL</label><input type="text" id="spUrl" placeholder="https://example.com/page"></div>
      <div class="field"><label>Page title</label><input type="text" id="spTitle" placeholder="Your Page Title"></div>
      <div class="field"><label>Meta description</label><textarea class="ta" id="spDesc" rows="3" placeholder="Your meta description..."></textarea></div>
      <div style="border:1px solid var(--border);border-radius:var(--radius-m);padding:14px;margin-top:10px;font-family:arial,sans-serif">
        <div id="spUrlOut" style="color:#202124;font-size:13px"></div>
        <div id="spTitleOut" style="color:#1a0dab;font-size:19px;line-height:1.3;margin:2px 0"></div>
        <div id="spDescOut" style="color:#4d5156;font-size:13px;line-height:1.4"></div>
      </div>
    `;
    const $url=c.querySelector('#spUrl'), $title=c.querySelector('#spTitle'), $desc=c.querySelector('#spDesc');
    const $urlOut=c.querySelector('#spUrlOut'), $titleOut=c.querySelector('#spTitleOut'), $descOut=c.querySelector('#spDescOut');
    function trunc(s,n){ return s.length>n ? s.slice(0,n-1).trim()+'…' : s; }
    function upd(){
      $urlOut.textContent = $url.value || 'https://example.com/page';
      $titleOut.textContent = trunc($title.value || 'Your Page Title', 60);
      $descOut.textContent = trunc($desc.value || 'Your meta description will appear here, showing how it looks when truncated by Google.', 160);
    }
    [$url,$title,$desc].forEach(el=>el.addEventListener('input', upd));
    upd();
  }
});

SEO_TOOLS.push({
  id:'se11', cat:'seo', name:'UTM Campaign URL Builder', desc:'Build a trackable campaign URL with UTM source, medium, campaign and optional term/content parameters.', keywords:'utm campaign url builder tracking marketing',
  mount(c){
    codeGenTool(c, {
      fields:[
        {key:'url', label:'Website URL', type:'text', placeholder:'https://example.com/page'},
        {key:'source', label:'Campaign source', type:'text', placeholder:'newsletter'},
        {key:'medium', label:'Campaign medium', type:'text', placeholder:'email'},
        {key:'campaign', label:'Campaign name', type:'text', placeholder:'summer_sale'},
        {key:'term', label:'Campaign term (optional)', type:'text', placeholder:''},
        {key:'content', label:'Campaign content (optional)', type:'text', placeholder:''}
      ],
      outLabel:'Generated URL', rows:4,
      generate(v){
        if(!v.url) return '';
        let base; try{ base=new URL(v.url); }catch(e){ return 'Enter a valid URL (including https://).'; }
        const params=[];
        if(v.source) params.push('utm_source='+encodeURIComponent(v.source));
        if(v.medium) params.push('utm_medium='+encodeURIComponent(v.medium));
        if(v.campaign) params.push('utm_campaign='+encodeURIComponent(v.campaign));
        if(v.term) params.push('utm_term='+encodeURIComponent(v.term));
        if(v.content) params.push('utm_content='+encodeURIComponent(v.content));
        if(!params.length) return base.toString();
        const sep = base.search ? '&' : '?';
        return base.toString() + sep + params.join('&');
      }
    });
  }
});

SEO_TOOLS.push({
  id:'se12', cat:'seo', name:'Ad Character Counter', desc:'Check your headline and description against common ad character limits for Google and Facebook ads.', keywords:'ad character counter google facebook limit',
  mount(c){
    c.innerHTML = `
      <div class="field"><label>Headline</label><input type="text" id="adHead" placeholder="Your ad headline" maxlength="200"></div>
      <div class="field"><label>Description / Primary Text</label><textarea class="ta" id="adDesc" rows="4" placeholder="Your ad description" maxlength="500"></textarea></div>
      <table class="data-table">
        <thead><tr><th>Platform</th><th>Field</th><th>Limit</th><th>Your Length</th><th>Status</th></tr></thead>
        <tbody id="adRows"></tbody>
      </table>
    `;
    const LIMITS = [
      {platform:'Google Search Ads', field:'Headline', limit:30, source:'head'},
      {platform:'Google Search Ads', field:'Description', limit:90, source:'desc'},
      {platform:'Facebook / Instagram Ads', field:'Headline', limit:40, source:'head'},
      {platform:'Facebook / Instagram Ads', field:'Primary Text', limit:125, source:'desc'}
    ];
    const $head=c.querySelector('#adHead'), $desc=c.querySelector('#adDesc'), $rows=c.querySelector('#adRows');
    function upd(){
      const len = {head:$head.value.length, desc:$desc.value.length};
      $rows.innerHTML = LIMITS.map(r=>{
        const l=len[r.source];
        const ok = l<=r.limit;
        return `<tr><td>${esc(r.platform)}</td><td>${esc(r.field)}</td><td>${r.limit}</td><td>${l}</td><td style="color:${ok?'var(--success)':'var(--danger)'}">${ok?'OK':'Over limit'}</td></tr>`;
      }).join('');
    }
    $head.addEventListener('input', upd); $desc.addEventListener('input', upd); upd();
  }
});

SEO_TOOLS.push({
  id:'se13', cat:'seo', name:'A/B Test Sample Size Calculator', desc:'Estimate how many visitors per variant you need for a statistically meaningful A/B test.', keywords:'ab test sample size calculator statistics conversion',
  mount(c){
    formTool(c, {
      fields:[
        {key:'baseline', label:'Baseline conversion rate (%)', type:'number', value:5, step:0.1},
        {key:'mde', label:'Minimum detectable effect (percentage points)', type:'number', value:1, step:0.1}
      ],
      compute(v){
        if(!(v.baseline>0 && v.baseline<100) || !(v.mde>0)) throw new Error('bad');
        const p = v.baseline/100, delta = v.mde/100;
        const n = Math.ceil(16 * p * (1-p) / (delta*delta));
        return `<div class="stat-grid">
          <div class="stat"><span class="stat-val">${n.toLocaleString()}</span><span class="stat-lbl">Visitors per Variant</span></div>
          <div class="stat"><span class="stat-val">${(n*2).toLocaleString()}</span><span class="stat-lbl">Total Visitors (2 variants)</span></div>
        </div>`;
      },
      note:'Rule-of-thumb estimate for roughly 95% significance and 80% power — for a rigorous test, confirm with a dedicated statistics tool.'
    });
  }
});

SEO_TOOLS.push({
  id:'se14', cat:'seo', name:'Hashtag Formatter', desc:'Turn a list of keywords or phrases into clean, ready-to-use hashtags — with duplicates removed and casing normalized.', keywords:'hashtag generator formatter social media instagram twitter',
  mount(c){
    codeGenTool(c, {
      fields:[
        {key:'input', label:'Keywords or phrases (one per line, or comma-separated)', type:'textarea', rows:5, placeholder:'digital marketing\nsmall business\nfree tools'},
        {key:'case', label:'Casing', type:'select', default:'camel', options:[{v:'camel',l:'CamelCase (#SmallBusiness)'},{v:'lower',l:'lowercase (#smallbusiness)'},{v:'upper',l:'UPPERCASE (#SMALLBUSINESS)'}]}
      ],
      outLabel:'Formatted Hashtags',
      generate(v){
        const raw = String(v.input||'').split(/[\n,]/).map(s=>s.trim()).filter(Boolean);
        const seen = new Set();
        const tags = [];
        raw.forEach(phrase=>{
          const words = phrase.replace(/[^a-zA-Z0-9\s]/g,'').split(/\s+/).filter(Boolean);
          if(!words.length) return;
          let tag;
          if(v.case==='lower') tag = words.join('').toLowerCase();
          else if(v.case==='upper') tag = words.join('').toUpperCase();
          else tag = words.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join('');
          const full = '#'+tag;
          const key = full.toLowerCase();
          if(!seen.has(key)){ seen.add(key); tags.push(full); }
        });
        return tags.join(' ');
      },
      note:'Duplicate hashtags (regardless of casing) are removed automatically.'
    });
  }
});
/* ===== SEO_TOOLS_MARKER ===== */
/* ===== PDF_TOOLS_MARKER ===== */



const TOOLS = [...TEXT_TOOLS, ...IMAGE_TOOLS, ...CALC_TOOLS, ...DEV_TOOLS, ...CONVERTER_TOOLS, ...SECURITY_TOOLS, ...PDF_TOOLS, ...PRODUCTIVITY_TOOLS, ...COLOR_TOOLS, ...SEO_TOOLS];

/* Maps each tool id to its dedicated SEO landing-page filename
   (tool-<slug>.html). Used so home/grid cards link straight to that
   tool's own page instead of only opening inside this SPA. */
const TOOL_SLUGS = {t01:'word-counter', t02:'case-converter', t03:'text-truncator', t04:'whitespace-cleaner', t05:'find-and-replace', t06:'text-diff-checker', t07:'duplicate-line-remover', t08:'line-sorter', t09:'lorem-ipsum-generator', t10:'slug-generator', t11:'text-to-binary', t12:'text-to-morse-code', t13:'palindrome-checker', t14:'word-frequency-counter', t15:'text-shuffler', t16:'rot13-caesar-cipher', t17:'text-to-ascii-codes', t18:'html-tag-stripper', t19:'line-prefixer-and-numberer', t20:'text-repeater', t21:'acronym-generator', t22:'anagram-checker', t23:'text-wrap-formatter', t24:'remove-emoji-and-special-characters', t25:'smart-quotes-and-dash-converter', i01:'image-resizer', i02:'image-compressor', i03:'image-format-converter', i04:'image-cropper', i05:'color-picker-from-image', i06:'color-converter', i07:'color-palette-generator', i08:'random-color-generator', i09:'image-to-base64', i10:'image-filters', i11:'image-rotator', i12:'image-flipper', i13:'favicon-generator', i14:'image-watermark-tool', i15:'dominant-color-palette-extractor', i16:'ascii-art-generator', i17:'css-gradient-generator', i18:'box-shadow-generator', i19:'border-radius-generator', i20:'color-contrast-checker', i21:'image-adjuster', i22:'svg-to-png-converter', i23:'image-dimensions-and-file-size-inspector', i24:'placeholder-image-generator', i25:'color-blindness-simulator', c01:'length-converter', c02:'weight-converter', c03:'temperature-converter', c04:'age-calculator', c05:'bmi-calculator', c06:'percentage-calculator', c07:'emi-calculator', c08:'simple-interest-calculator', c09:'compound-interest-calculator', c10:'discount-calculator', c11:'tip-and-bill-split-calculator', c12:'gst-sales-tax-calculator', c13:'currency-converter-manual-rate', c14:'date-difference-calculator', c15:'date-add-subtract', c16:'time-zone-offset-converter', c17:'salary-hourly-wage-calculator', c18:'fuel-cost-calculator', c19:'speed-distance-time-calculator', c20:'area-calculator', c21:'volume-calculator', c22:'number-to-words-converter', c23:'roman-numeral-converter', c24:'average-median-and-mode-calculator', c25:'standard-deviation-calculator', d01:'json-formatter', d02:'json-to-csv-converter', d03:'base64-encoder-decoder', d04:'url-encoder-decoder', d05:'html-entity-encoder-decoder', d06:'regex-tester', d07:'uuid-generator', d08:'password-generator', d09:'hash-generator', d10:'css-minifier', d11:'js-minifier-basic', d12:'xml-formatter', d13:'markdown-previewer', d14:'css-unit-converter', d15:'number-base-converter', d16:'random-number-generator', d17:'random-string-token-generator', d18:'fake-json-data-generator', d19:'jwt-decoder', d20:'unix-timestamp-converter', d21:'cron-expression-explainer', d22:'code-diff-viewer', d23:'query-string-parser-and-builder', d24:'http-status-code-lookup', d25:'color-code-snippet-generator', u01:'time-converter', u02:'data-storage-converter', u03:'energy-converter', u04:'pressure-converter', u05:'power-converter', u06:'frequency-converter', u07:'angle-converter', u08:'force-converter', u09:'torque-converter', u10:'acceleration-converter', u11:'fuel-economy-converter', u12:'illuminance-converter', u13:'digital-data-rate-converter', u14:'radiation-dose-converter', u15:'decibel-calculator', s01:'password-strength-checker', s02:'pin-generator', s03:'md5-generator', s04:'secret-key-generator', s05:'file-checksum-generator', s06:'hash-comparison-tool', s07:'secure-random-number-generator', p01:'pdf-merger', p02:'pdf-splitter', p03:'pdf-compressor', p04:'pdf-to-jpg-converter', p05:'image-to-pdf-converter', p06:'pdf-page-rotator', p07:'pdf-page-reorder', p08:'pdf-page-delete-extract', p09:'pdf-watermark-adder', p10:'pdf-text-extractor', p11:'pdf-metadata-editor', p12:'pdf-page-number-adder', p13:'pdf-to-grayscale-converter', p14:'pdf-page-count-info-viewer', p15:'pdf-blank-page-inserter', p16:'pdf-form-filler', c26:'loan-amortization-schedule-calculator', c27:'mortgage-calculator', c28:'retirement-savings-calculator', c29:'investment-return-cagr-calculator', c30:'break-even-point-calculator', c31:'profit-margin-calculator', c32:'markup-calculator', c33:'sales-commission-calculator', c34:'overtime-pay-calculator', c35:'bmr-calorie-calculator', c36:'body-fat-percentage-calculator', c37:'gpa-cgpa-calculator', c38:'fraction-calculator', c39:'lcm-gcd-calculator', c40:'quadratic-equation-solver', c41:'countdown-to-date-calculator', c42:'business-days-calculator', c43:'day-of-the-week-finder', c44:'iso-week-number-calculator', c45:'world-clock', c46:'stopwatch-lap-timer', c47:'time-duration-adder', t26:'readability-score-checker', t27:'duplicate-word-and-phrase-finder', t28:'text-to-speech-reader', t29:'character-frequency-analyzer', t30:'text-encryptor-decryptor', i26:'image-background-color-remover', i27:'image-collage-maker', i28:'meme-generator', i29:'image-pixelator', i30:'image-border-frame-adder', i31:'image-rounded-corners-generator', pr01:'pomodoro-timer', pr02:'to-do-list', pr03:'notepad-auto-saving', pr04:'countdown-timer', pr05:'random-decision-maker', pr06:'meeting-cost-calculator', cl01:'css-flexbox-generator', cl02:'css-grid-generator', cl03:'css-animation-keyframes-generator', cl04:'css-clip-path-generator', cl05:'color-shades-and-tints-generator', se01:'meta-tag-generator', se02:'open-graph-tag-generator', se03:'twitter-card-tag-generator', se04:'robots-txt-generator', se05:'xml-sitemap-generator', se06:'keyword-density-checker', se07:'seo-title-tag-length-checker', se08:'meta-description-length-checker', se09:'canonical-tag-generator', se10:'google-serp-snippet-preview', se11:'utm-campaign-url-builder', se12:'ad-character-counter', se13:'ab-test-sample-size-calculator', i32:'image-upscaler', t31:'speech-to-text-voice-typewriter', t32:'word-cloud-generator', t33:'emoji-picker-and-copy-tool', t34:'text-table-column-aligner', pr07:'typing-speed-test-wpm', pr08:'random-team-group-generator', pr09:'dice-roller-and-coin-flip', pr10:'random-quote-generator', pr11:'online-whiteboard-sketchpad', pr12:'invoice-generator-printable', pr13:'habit-tracker', pr14:'random-username-generator', d26:'subnet-cidr-calculator', d27:'credit-card-number-validator-luhn', d28:'screen-resolution-viewport-info', d29:'download-time-estimator', s08:'passphrase-generator', c48:'aspect-ratio-calculator', c49:'unit-price-better-deal-comparator', c50:'grade-weighted-average-calculator', cl06:'color-name-finder', se14:'hashtag-formatter'};
function toolHref(id){
  const slug = TOOL_SLUGS[id];
  return slug ? `tools/tool-${slug}.html` : `#tool=${id}`;
}

/* Keep the on-page tool-count displays (hero stat tile + "Browse All"
   button) always in sync with the live TOOLS registry, instead of a
   hard-coded number that goes stale as tools are added. Re-applied on
   every language switch since tpApplyLanguage() re-renders data-i18n
   text from the static dictionary. */
function tpUpdateToolCounts(){
  const isHi = (window.tpCurLang && window.tpCurLang()) === 'hi';
  const countEl = document.getElementById('statsItem1Title');
  if(countEl) countEl.textContent = isHi ? (TOOLS.length + '+ टूल्स') : (TOOLS.length + '+ Tools');
  const browseBtn = document.getElementById('browseAllBtn');
  if(browseBtn) browseBtn.textContent = isHi ? ('सभी ' + TOOLS.length + ' टूल्स देखें →') : ('Browse All ' + TOOLS.length + ' Tools →');
}
tpUpdateToolCounts();
document.addEventListener('tp:langchange', tpUpdateToolCounts);



let toolCleanupFns = [];
export function onToolCleanup(fn){ toolCleanupFns.push(fn); }
export function runToolCleanup(){ toolCleanupFns.forEach(fn=>{ try{ fn(); }catch(e){} }); toolCleanupFns=[]; }

export const TRENDING_IDS = ["t01","t02","i01","i02","i06","c05","c07","c06","d01","d03","d08","d07"];

export { TOOLS, CATS, TOOL_SLUGS, ICONS };

