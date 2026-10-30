// A visitor's 1h53 window survives reloads. Expired timers never start over.
(() => {
  const bar=document.querySelector('.gro-announcement');
  const counter=document.querySelector('#gro-countdown');
  if(!bar||!counter)return;
  const duration=113*60*1000;
  const key='saladas:gro:anniversary:deadline:v1';
  const timerWrap=bar.querySelector('[data-gro-timer-wrap]');
  const message=bar.querySelector('[data-gro-promo-message]');
  let deadline;
  for(const storageName of ['localStorage','sessionStorage']){
    try{
      const storage=window[storageName];
      const stored=Number(storage.getItem(key));
      deadline=Number.isFinite(stored)&&stored>0?stored:Date.now()+duration;
      try{storage.setItem(key,String(deadline));}catch{/* Preserve a readable deadline even if writes are blocked. */}
      break;
    }catch{/* The counter still works if browser storage is unavailable. */}
  }
  deadline??=Date.now()+duration;
  let interval=null;
  const stop=()=>{if(interval!==null)clearInterval(interval);interval=null;};
  const render=()=>{
    const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));
    const hours=Math.floor(remaining/3600);
    const minutes=Math.floor((remaining%3600)/60);
    const seconds=remaining%60;
    counter.textContent=[hours,minutes,seconds].map(value=>String(value).padStart(2,'0')).join(':');
    counter.setAttribute('aria-label',`${hours} horas, ${minutes} minutos e ${seconds} segundos`);
    if(remaining===0){
      stop();
      timerWrap.hidden=true;
      message.textContent='Prazo da promoção terminado.';
    }
    return remaining;
  };
  const resume=()=>{
    stop();
    if(render()>0&&!document.hidden)interval=setInterval(render,1000);
  };
  window.addEventListener('storage',event=>{
    if(event.key!==key)return;
    const updated=Number(event.newValue);
    if(Number.isFinite(updated)&&updated>0){deadline=Math.min(deadline,updated);resume();}
  });
  document.addEventListener('visibilitychange',resume);
  window.addEventListener('pagehide',stop);
  window.addEventListener('pageshow',resume);
  resume();
})();
