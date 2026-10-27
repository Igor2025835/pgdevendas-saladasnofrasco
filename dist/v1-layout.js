// Compact reviews stay scrollable with touch, keyboard and the two arrow buttons.
(() => {
  const track = document.querySelector('#reviews-track');
  if (!track) return;
  const previous = document.querySelector('.reviews-previous');
  const next = document.querySelector('.reviews-next');
  const update = () => {
    previous.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  const move = direction => {
    track.scrollBy({
      left: direction * track.clientWidth * .85,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', update, { passive: true });
  if (typeof ResizeObserver === 'function') new ResizeObserver(update).observe(track);
  else window.addEventListener('resize', update);
  update();
})();
