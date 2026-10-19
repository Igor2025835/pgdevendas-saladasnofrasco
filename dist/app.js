const track = document.querySelector('#recipe-track');
const slideButtons = [...document.querySelectorAll('[data-slide]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function updateSlider() {
  slideButtons[0].disabled = track.scrollLeft <= 2;
  slideButtons[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 3;
}
slideButtons.forEach(button => button.addEventListener('click', () => {
  const card = track.querySelector('.recipe-card');
  const gap = parseFloat(getComputedStyle(track).gap) || 20;
  track.scrollBy({ left: Number(button.dataset.slide) * (card.getBoundingClientRect().width + gap), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}));
track.addEventListener('scroll', updateSlider, { passive: true });
window.addEventListener('resize', updateSlider);
updateSlider();

const dialog = document.querySelector('.video-dialog');
const videoContainer = dialog.querySelector('.video-container');
document.querySelector('.video-trigger').addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/2-A2chrN41w?rel=0';
  iframe.title = 'Tutorial das Camadas — Aurora Prado';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  videoContainer.replaceChildren(iframe);
  dialog.showModal();
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => videoContainer.replaceChildren());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
document.querySelector('#video-offer').addEventListener('click', () => dialog.close());

const mobileOffer = document.querySelector('.mobile-offer');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => mobileOffer.classList.toggle('hidden', entry.intersectionRatio >= 0.8));
}, { threshold: 0.8 });
observer.observe(document.querySelector('.checkout-link'));
document.querySelector('#year').textContent = new Date().getFullYear();
