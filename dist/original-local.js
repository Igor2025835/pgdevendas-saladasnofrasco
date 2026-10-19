const dialog = document.querySelector('.video-dialog');
const videoContainer = dialog.querySelector('.video-container');
document.querySelectorAll('.video-trigger').forEach(button => button.addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/2-A2chrN41w?rel=0';
  iframe.title = 'Tutorial das Camadas — Aurora Prado';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  videoContainer.replaceChildren(iframe);
  dialog.showModal();
}));
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => videoContainer.replaceChildren());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
document.querySelector('#video-offer').addEventListener('click', () => dialog.close());
document.querySelector('#year').textContent = new Date().getFullYear();

// Keep the original accordion layout without requiring WordPress scripts.
document.querySelectorAll('.elementor-tab-title[role="button"]').forEach(title => {
 title.tabIndex=0;
 const content=document.getElementById(title.getAttribute('aria-controls'));
 if(!content)return;
 content.hidden=true;
 const toggle=()=>{const open=title.getAttribute('aria-expanded')!=='true';title.setAttribute('aria-expanded',String(open));title.classList.toggle('elementor-active',open);content.classList.toggle('elementor-active',open);content.hidden=!open;content.style.display=open?'block':'none';};
 title.addEventListener('click',event=>{event.preventDefault();toggle();});
 title.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
});
document.querySelectorAll('.elementor-widget-image-carousel').forEach(widget=>{
 const track=widget.querySelector('.swiper-wrapper');if(!track)return;
 track.tabIndex=0;
 track.setAttribute('aria-label','Mensagens publicadas na página original');
 for(const [selector,direction] of [['.elementor-swiper-button-prev',-1],['.elementor-swiper-button-next',1]]){
 const button=widget.querySelector(selector);if(!button)continue;
 button.tabIndex=0;button.setAttribute('role','button');button.setAttribute('aria-label',direction===1?'Próximas mensagens':'Mensagens anteriores');
 const move=()=>track.scrollBy({left:direction*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 button.addEventListener('click',move);button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();move();}});
 }
});

// Continuous automatic carousel; an identical second group makes the wrap seamless.
const objectiveViewport = document.querySelector('.objectives-viewport');
if (objectiveViewport) {
  const marquee = objectiveViewport.querySelector('.objectives-marquee');
  const originalGroup = marquee?.querySelector('.objectives-group');
  if (marquee && originalGroup) {
    const pixelsPerSecond = 32;
    let distance = 0;
    let offset = 0;
    let previousTime = null;
    let frameId = null;
    let inView = typeof IntersectionObserver !== 'function';
    const render = () => {
      marquee.style.transform = `translate3d(-${offset.toFixed(3)}px,0,0)`;
    };
    const measure = () => {
      distance = originalGroup.getBoundingClientRect().width;
      if (distance > 0) offset %= distance;
      render();
    };
    const shouldRun = () => inView && !document.hidden;
    const tick = timestamp => {
      frameId = null;
      if (!shouldRun()) { previousTime = null; return; }
      const elapsed = previousTime === null ? 0 : Math.min(timestamp - previousTime, 64);
      previousTime = timestamp;
      if (distance > 0) {
        offset = (offset + pixelsPerSecond * elapsed / 1000) % distance;
        render();
      }
      frameId = window.requestAnimationFrame(tick);
    };
    const syncPlayback = () => {
      if (shouldRun()) {
        if (frameId === null) { previousTime = null; frameId = window.requestAnimationFrame(tick); }
      } else {
        if (frameId !== null) window.cancelAnimationFrame(frameId);
        frameId = null;
        previousTime = null;
      }
    };
    measure();
    if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(originalGroup);
    else window.addEventListener('resize', measure);
    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        syncPlayback();
      }).observe(objectiveViewport);
    }
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pageshow', syncPlayback);
    syncPlayback();
  }
}

// Fetch inline loops on entry, and decode only while their frames are visible.
const sauceVideos = [...document.querySelectorAll('.sauce-video[data-src], .contents-video[data-src]')];
if (sauceVideos.length) {
  const visibleSauces = new Set();
  const syncSauce = video => {
    if (visibleSauces.has(video) && !document.hidden) {
      video.muted = true;
      if (!video.hasAttribute('src')) {
        video.src = video.dataset.src;
        video.load();
      }
      video.play()?.catch(() => {});
    } else video.pause();
  };
  sauceVideos.forEach(video => video.addEventListener('play', () => {
    if (!visibleSauces.has(video) || document.hidden) video.pause();
  }));
  if (typeof IntersectionObserver === 'function') {
    const sauceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.1) visibleSauces.add(entry.target);
        else visibleSauces.delete(entry.target);
        syncSauce(entry.target);
      });
    }, { threshold: [0, 0.1] });
    sauceVideos.forEach(video => sauceObserver.observe(video));
  } else {
    const checkSauces = () => {
      sauceVideos.forEach(video => {
        const rect = video.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) visibleSauces.add(video);
        else visibleSauces.delete(video);
        syncSauce(video);
      });
    };
    window.addEventListener('scroll', checkSauces, { passive: true });
    window.addEventListener('resize', checkSauces);
    checkSauces();
  }
  document.addEventListener('visibilitychange', () => sauceVideos.forEach(syncSauce));
  window.addEventListener('pageshow', () => sauceVideos.forEach(syncSauce));
}

// Larger view for compact illustrative message screenshots.
const conversationDialog = document.querySelector('#conversation-dialog');
if (conversationDialog) {
  const fullConversation = conversationDialog.querySelector('img');
  document.querySelectorAll('.conversation-open').forEach(button => {
    button.addEventListener('click', () => {
      const thumbnail = button.querySelector('img');
      fullConversation.src = button.dataset.conversationImage;
      fullConversation.alt = thumbnail.alt;
      fullConversation.width = thumbnail.width;
      fullConversation.height = thumbnail.height;
      conversationDialog.showModal();
    });
  });
  conversationDialog.querySelector('.conversation-close').addEventListener('click', () => conversationDialog.close());
  conversationDialog.addEventListener('click', event => {
    if (event.target !== conversationDialog) return;
    const rect = conversationDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) conversationDialog.close();
  });
  conversationDialog.addEventListener('close', () => fullConversation.removeAttribute('src'));
}

// Load and play the lesson only after an explicit click.
const methodPreviewVideo = document.querySelector('#method-preview-video');
if (methodPreviewVideo) {
  const methodAudioButton = document.querySelector('.method-audio-button');
  const status = methodAudioButton.querySelector('.method-audio-status');
  const hint = methodAudioButton.querySelector('.method-audio-hint');
  let inView = false;
  const ensureSource = () => {
    if (!methodPreviewVideo.hasAttribute('src')) {
      methodPreviewVideo.src = methodPreviewVideo.dataset.src;
      methodPreviewVideo.load();
    }
  };
  const playMethod = () => {
    const result = methodPreviewVideo.play();
    result?.catch(() => {
      methodAudioButton.hidden = false;
      status.textContent = 'Assista à prévia da aula';
      hint.textContent = 'Clique para reproduzir';
    });
  };
  const syncMethod = () => {
    if (!inView || document.hidden) {
      methodPreviewVideo.pause();
      return;
    }
  };
  methodPreviewVideo.addEventListener('play', () => {
    if (!inView || document.hidden) methodPreviewVideo.pause();
  });
  methodAudioButton.addEventListener('click', () => {
    inView = true;
    ensureSource();
    methodPreviewVideo.muted = false;
    methodPreviewVideo.volume = 1;
    methodPreviewVideo.controls = true;
    methodPreviewVideo.loop = false;
    methodAudioButton.hidden = true;
    playMethod();
  });
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.15);
      syncMethod();
    }, { threshold: [0, 0.15] }).observe(methodPreviewVideo);
  } else {
    const checkMethod = () => {
      const rect = methodPreviewVideo.getBoundingClientRect();
      inView = rect.top < window.innerHeight && rect.bottom > 0;
      syncMethod();
    };
    window.addEventListener('scroll', checkMethod, { passive: true });
    window.addEventListener('resize', checkMethod);
    checkMethod();
  }
  document.addEventListener('visibilitychange', syncMethod);
  window.addEventListener('pageshow', syncMethod);
}
