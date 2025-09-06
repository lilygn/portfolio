// slider.js
window.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.slider-track');
    const viewport = document.querySelector('.slider-viewport');
    const prevBtn = document.querySelector('.navbtn.prev');
    const nextBtn = document.querySelector('.navbtn.next');
    const dotsWrap = document.querySelector('.dots');
    const slides = Array.from(document.querySelectorAll('.slide'));
  
    let idx = 0, perView = 1, gap = 24, slideW = 0;
  
    function measure(){
      const styles = getComputedStyle(track);
      gap = parseFloat(styles.columnGap || styles.gap || 24);
      slideW = slides[0].getBoundingClientRect().width + gap;
      const vw = viewport.clientWidth;
      perView = Math.max(1, Math.round(vw / slideW));
  
      const pages = Math.max(1, Math.ceil(slides.length / perView));
      dotsWrap.innerHTML = '';
      for (let i=0;i<pages;i++){
        const d = document.createElement('span');
        d.className = 'dot' + (i===idx?' active':'');
        d.addEventListener('click', ()=>{ idx = i; snap(); });
        dotsWrap.appendChild(d);
      }
      idx = Math.min(idx, pages-1);
      snap();
    }
  
    function snap(){
      const x = -(idx * slideW * perView);
      track.style.transition = 'transform .35s cubic-bezier(.22,.61,.36,1)';
      track.style.transform = `translateX(${x}px)`;
      const pages = Math.max(1, Math.ceil(slides.length / perView));
      prevBtn.disabled = (idx <= 0);
      nextBtn.disabled = (idx >= pages - 1);
      dotsWrap.querySelectorAll('.dot').forEach((d,i)=> d.classList.toggle('active', i===idx));
    }
  
    prevBtn.addEventListener('click', ()=>{ idx = Math.max(0, idx-1); snap(); });
    nextBtn.addEventListener('click', ()=>{ const pages = Math.ceil(slides.length / perView); idx = Math.min(pages-1, idx+1); snap(); });
    viewport.addEventListener('keydown', (e)=>{ if (e.key==='ArrowLeft') prevBtn.click(); if (e.key==='ArrowRight') nextBtn.click(); });
  
    // Swipe / drag
    let dragging = false, startX = 0, startTX = 0;
    const getTX = el => { const t = getComputedStyle(el).transform; if (t === 'none') return 0; try { return new DOMMatrix(t).m41; } catch { return 0; } };
    function startDrag(x){ dragging = true; startX = x; startTX = getTX(track); track.style.transition='none'; viewport.classList.add('dragging'); }
    function moveDrag(x){ if(!dragging) return; track.style.transform = `translateX(${startTX + (x - startX)}px)`; }
    function endDrag(x){
      if(!dragging) return; dragging = false; viewport.classList.remove('dragging');
      const dx = x - startX, threshold = Math.max(60, slideW*0.2);
      if (dx >  threshold) idx = Math.max(0, idx-1);
      else if (dx < -threshold) idx = Math.min(Math.ceil(slides.length/perView)-1, idx+1);
      snap();
    }
  
    viewport.addEventListener('pointerdown', e => { if (e.pointerType==='mouse' && e.button!==0) return; viewport.setPointerCapture(e.pointerId); startDrag(e.clientX); });
    viewport.addEventListener('pointermove', e => moveDrag(e.clientX));
    viewport.addEventListener('pointerup',   e => endDrag(e.clientX));
    viewport.addEventListener('pointercancel', () => { dragging=false; viewport.classList.remove('dragging'); snap(); });
  
    // Touch fallback (older Safari)
    viewport.addEventListener('touchstart', e => { if (e.touches.length) startDrag(e.touches[0].clientX); }, {passive:true});
    viewport.addEventListener('touchmove',  e => { if (e.touches.length) moveDrag(e.touches[0].clientX); }, {passive:true});
    viewport.addEventListener('touchend',   e => { endDrag((e.changedTouches[0]||{}).clientX || startX); });
  
    window.addEventListener('resize', measure);
    measure();
  });
  