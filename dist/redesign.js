// This is a local interactive example of the product flow, not the purchased app.
// Approximate per-100-g values derived from USDA Nutritive Value of Foods, table 9.
const foods = {
  chicken: { name:'Frango cozido', kcal:142/86*100, protein:27/86*100, type:'protein', grams:120, animal:true },
  tuna: { name:'Atum em água, escorrido', kcal:99/85*100, protein:22/85*100, type:'protein', grams:100, animal:true },
  egg: { name:'Ovo cozido', kcal:211/136*100, protein:17/136*100, type:'protein', grams:100 },
  tomato: { name:'Tomate', kcal:38/180*100, protein:2/180*100, type:'vegetable', grams:80 },
  pasta: { name:'Massa cozida', kcal:197/140*100, protein:7/140*100, type:'base', grams:80 },
  chickpea: { name:'Grão-de-bico cozido', kcal:269/164*100, protein:15/164*100, type:'base', grams:80 },
  cheese: { name:'Muçarela', kcal:80/28*100, protein:6/28*100, type:'protein', grams:30 },
  cucumber: { name:'Pepino', kcal:14/104*100, protein:1/104*100, type:'vegetable', grams:80 }
};
const form = document.querySelector('#salad-form');
const error = document.querySelector('#form-error');
const result = document.querySelector('#salad-result');
const ingredientInputs = [...form.querySelectorAll('input[name="ingredient"]')];
const goals = { light:'Sua combinação mais leve.', protein:'Proteína, textura e muito sabor.', filling:'Uma salada com mais substância.', quick:'Prática, colorida e cheia de sabor.', vegetarian:'Vegetariana. Cheia de possibilidades.' };

function setVegetarian() {
  const goal = new FormData(form).get('goal');
  for (const input of ingredientInputs) {
    input.disabled = goal === 'vegetarian' && Boolean(foods[input.value].animal);
    if (input.disabled) input.checked = false;
  }
  error.textContent = '';
}
form.querySelectorAll('input[name="goal"]').forEach(input => input.addEventListener('change', setVegetarian));
form.addEventListener('change', () => { error.textContent = ''; });

function makeSalad({initial = false} = {}) {
  const data = new FormData(form);
  const goal = data.get('goal');
  const selected = data.getAll('ingredient').filter(id => foods[id] && !(goal === 'vegetarian' && foods[id].animal));
  if (selected.length < 2) {
    error.textContent = 'Escolha pelo menos 2 ingredientes para montar uma combinação.';
    return;
  }
  const hasProtein = selected.some(id => foods[id].type === 'protein' || id === 'chickpea');
  if ((goal === 'protein' || goal === 'filling') && !hasProtein) {
    error.textContent = 'Inclua uma fonte de proteína, como frango, atum, ovo, queijo ou grão-de-bico.';
    return;
  }
  if (goal === 'vegetarian' && !selected.some(id => ['chickpea','egg','cheese'].includes(id))) {
    error.textContent = 'Para completar a opção vegetariana, selecione grão-de-bico, ovo ou queijo.';
    return;
  }
  const serving = selected.map(id => {
    const food = foods[id];
    let grams = food.grams;
    if (goal === 'light' && food.type === 'base') grams = 50;
    if (goal === 'light' && food.type === 'vegetable') grams = 120;
    if (goal === 'protein' && ['chicken','tuna'].includes(id)) grams = 150;
    if (goal === 'protein' && id === 'egg') grams = 100;
    if (goal === 'filling' && food.type === 'base') grams = 120;
    if (goal === 'vegetarian' && id === 'chickpea') grams = 130;
    return {id, ...food, grams};
  });
  // Basic dressing: 5 g olive oil + 15 g cider vinegar + 5 g water.
  let calories = 1909/216*5 + 2;
  let protein = 0;
  for (const item of serving) { calories += item.kcal * item.grams / 100; protein += item.protein * item.grams / 100; }
  document.querySelector('#result-title').textContent = goals[goal];
  document.querySelector('#result-description').textContent = 'Seus ingredientes + molho de azeite e vinagre.';
  document.querySelector('#result-calories').textContent = '≈ ' + Math.round(calories);
  document.querySelector('#result-protein').textContent = '≈ ' + Math.round(protein) + ' g';
  const chips = serving.map(item => {
    const span = document.createElement('span');
    span.textContent = `${item.grams} g de ${item.name.toLocaleLowerCase('pt-BR')}`;
    return span;
  });
  const dressing = document.createElement('span');
  dressing.textContent = '25 g de molho';
  document.querySelector('#result-ingredients').replaceChildren(...chips, dressing);
  // This example follows the base, protein and complement order shown on the page.
  const layers = ['Molho de azeite e vinagre'];
  const groups = [serving.filter(x=>x.type==='base'),serving.filter(x=>x.type==='protein'),serving.filter(x=>x.type==='vegetable')];
  for (const group of groups) if (group.length) layers.push(group.map(x=>x.name).join(' + '));
  document.querySelector('#result-layers').textContent = layers.join(' → ') + '. Monte em um pote limpo que feche bem.';
  document.querySelector('#result-preparation').textContent = 'Com os ingredientes higienizados e os grãos, massas e proteínas já cozidos e resfriados, corte os vegetais. Misture o molho e monte as camadas. Feche o pote e refrigere a 4 °C ou menos. Consuma em 3 a 4 dias, seguindo a conservação de cada ingrediente.';
  error.textContent = '';
  result.setAttribute('data-updated','true');
  if (!initial && window.innerWidth <= 600) result.scrollIntoView({ behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth', block:'start' });
}
form.addEventListener('submit', event => { event.preventDefault(); makeSalad(); });
makeSalad({initial:true});

const categoryChoices = [...document.querySelectorAll('[data-category-index]')];
let chosenCategory = null;
const track = document.querySelector('#category-track');
const buttons = [...document.querySelectorAll('[data-slide]')];
function updateSlider() {
  buttons[0].disabled = track.scrollLeft <= 2;
  buttons[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 3;
  const cards = [...track.querySelectorAll('.category-card')];
  const firstLeft = cards[0].offsetLeft;
  let nearest = 0;
  cards.forEach((card, index) => { if (Math.abs(card.offsetLeft-firstLeft-track.scrollLeft) < Math.abs(cards[nearest].offsetLeft-firstLeft-track.scrollLeft)) nearest = index; });
  categoryChoices.forEach((choice,index) => choice.setAttribute('aria-pressed', String(index === (chosenCategory ?? nearest))));
}
buttons.forEach(button => button.addEventListener('click', () => {
  chosenCategory = null;
  const card = track.querySelector('.category-card');
  const gap = parseFloat(getComputedStyle(track).gap) || 22;
  track.scrollBy({ left:Number(button.dataset.slide)*(card.getBoundingClientRect().width+gap), behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth' });
}));
track.addEventListener('scroll', updateSlider, {passive:true});
window.addEventListener('resize', updateSlider);
updateSlider();

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

categoryChoices.forEach(choice => choice.addEventListener('click', () => {
  const cards = [...track.querySelectorAll('.category-card')];
  const target = cards[Number(choice.dataset.categoryIndex)];
  if (!target) return;
  chosenCategory = Number(choice.dataset.categoryIndex);
  categoryChoices.forEach((button,index) => button.setAttribute('aria-pressed', String(index === chosenCategory)));
  track.scrollTo({left:target.offsetLeft-cards[0].offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}));

for (const eventName of ['pointerdown','wheel','keydown']) track.addEventListener(eventName, () => { chosenCategory = null; });
