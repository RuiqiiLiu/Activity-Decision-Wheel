const palette = ['#eea18d','#edce78','#a9c6a3','#99bcc3','#b6aaca','#e9b7c3','#afd0c8','#e7b17e'];
const optionsEl = document.querySelector('#options');
const wheel = document.querySelector('#wheel');
const spinButton = document.querySelector('#spin');
const result = document.querySelector('#result');
const addButton = document.querySelector('#addOption');
const clearButton = document.querySelector('#clearOptions');
const customOdds = document.querySelector('#customOdds');
const oddsStatus = document.querySelector('#oddsStatus');
let options = [];
let rotation = 0;
let spinning = false;

// Fresh browser randomness; rejection sampling avoids modulo bias.
function randomIndex(count) {
  const range = 0x100000000;
  const limit = range - (range % count);
  const sample = new Uint32Array(1);
  do { crypto.getRandomValues(sample); } while (sample[0] >= limit);
  return sample[0] % count;
}

// Blank percentages automatically share the remainder. Explicit percentages
// are exact hundredths of a percent, not relative weights.
function distribution() {
  const choices = options.filter(option => option.text.trim());
  if (!choices.length) return { choices: [], error: '' };
  if (!customOdds.checked) return { choices: choices.map(option => ({ option, percent: 100 / choices.length })), error: '' };
  let total = 0;
  let automatic = 0;
  for (const option of choices) {
    if (option.percent === '') { automatic++; continue; }
    const value = Number(option.percent);
    if (!Number.isFinite(value) || value < 0 || value > 100 || Math.abs(value * 100 - Math.round(value * 100)) > 1e-7) {
      return { choices: [], error: 'Use percentages from 0 to 100, with up to 2 decimals.' };
    }
    total += Math.round(value * 100);
  }
  if (total > 10000) return { choices: [], error: 'Percentages exceed 100%. Lower one to spin.' };
  if (!automatic && total !== 10000) return { choices: [], error: 'Percentages must total 100%, or leave an option on Auto.' };
  return {
    choices: choices.map(option => ({
      option,
      percent: option.percent === '' ? (10000 - total) / automatic / 100 : Number(option.percent)
    })),
    error: ''
  };
}

function segments(choices) {
  const positive = choices.filter(choice => choice.percent > 0);
  let start = positive.length ? -positive[0].percent * 3.6 / 2 : 0;
  return choices.map((choice, index) => {
    const size = choice.percent * 3.6;
    const segment = { ...choice, index, start, size, center: start + size / 2 };
    start += size;
    return segment;
  }).filter(segment => segment.size > 0);
}

function relabelRows() {
  optionsEl.querySelectorAll('.option-row').forEach((row, i) => {
    row.querySelector('.option-text').setAttribute('aria-label', `Option ${i + 1}`);
    row.querySelector('.percentage').setAttribute('aria-label', `Percentage for option ${i + 1}`);
    row.querySelector('button').setAttribute('aria-label', `Remove option ${i + 1}`);
  });
}

function renderOptions() {
  optionsEl.replaceChildren();
  options.forEach(option => {
    const row = document.createElement('div'); row.className = 'option-row';
    const swatch = document.createElement('span'); swatch.className = 'swatch';
    const input = document.createElement('input');
    input.className = 'option-text'; input.value = option.text;
    input.placeholder = 'Type an option';
    const percentWrap = document.createElement('span'); percentWrap.className = 'percentage-wrap';
    percentWrap.hidden = !customOdds.checked;
    const percentage = document.createElement('input');
    percentage.className = 'percentage'; percentage.type = 'number';
    percentage.min = '0'; percentage.max = '100'; percentage.step = '0.01';
    percentage.placeholder = 'Auto'; percentage.value = option.percent;
    const unit = document.createElement('span'); unit.textContent = '%';
    percentWrap.append(percentage, unit);
    const remove = document.createElement('button');
    remove.className = 'remove'; remove.type = 'button'; remove.textContent = '×';
    row.append(swatch, input, percentWrap, remove);
    input.addEventListener('input', () => { option.text = input.value; renderWheel(); });
    input.addEventListener('blur', event => {
      // Add reuses this draft; removing it here would shift the button mid-click.
      if (spinning || event.relatedTarget === addButton || input.value.trim() || !options.includes(option)) return;
      options.splice(options.indexOf(option), 1);
      row.remove(); relabelRows(); renderWheel();
    });
    percentage.addEventListener('input', () => {
      option.percent = percentage.validity.badInput ? 'invalid' : percentage.value;
      renderWheel();
    });
    remove.addEventListener('click', () => {
      if (spinning || !options.includes(option)) return;
      options.splice(options.indexOf(option), 1);
      renderOptions(); renderWheel();
    });
    optionsEl.append(row);
  });
  relabelRows();
  optionsEl.classList.toggle('custom-odds', customOdds.checked);
}

function renderWheel() {
  const state = distribution();
  const filled = options.filter(option => option.text.trim());
  document.querySelector('#choiceCount').textContent = `${filled.length} option${filled.length === 1 ? '' : 's'}`;
  clearButton.disabled = spinning || options.length === 0;
  document.querySelector('#oddsHelp').hidden = !customOdds.checked;
  oddsStatus.textContent = state.error || (customOdds.checked ? 'Custom chances · 100% total' : 'Equal chance for every option');
  oddsStatus.classList.toggle('invalid', Boolean(state.error));
  if (!filled.length && customOdds.checked) oddsStatus.textContent = 'Add options to set their chances';
  result.textContent = state.error ? 'Adjust the percentages to spin.' : filled.length ? 'Ready when you are.' : 'Add an option to get started.';
  optionsEl.querySelectorAll('.swatch').forEach((swatch, i) => {
    const index = filled.indexOf(options[i]);
    swatch.style.background = index < 0 ? '#d8ddd3' : palette[index % palette.length];
  });
  wheel.replaceChildren();
  rotation = 0; wheel.style.transform = 'rotate(0deg)';
  const slices = segments(state.choices);
  spinButton.disabled = spinning || !slices.length || Boolean(state.error);
  wheel.classList.toggle('is-empty', !slices.length);
  if (!slices.length) {
    const message = document.createElement('div'); message.className = 'empty';
    message.textContent = state.error ? 'Adjust your percentages' : 'Your next decision starts here.';
    wheel.append(message);
    return;
  }
  const svgElement = name => document.createElementNS('http://www.w3.org/2000/svg', name);
  const point = (degrees, radius) => {
    const radians = (degrees - 90) * Math.PI / 180;
    return [200 + Math.cos(radians) * radius, 200 + Math.sin(radians) * radius];
  };
  const svg = svgElement('svg'); svg.setAttribute('viewBox', '0 0 400 400');
  slices.forEach(({ option, percent, index, start, size, center }) => {
    let wedge;
    if (size >= 359.999999) {
      wedge = svgElement('circle');
      wedge.setAttribute('cx', 200); wedge.setAttribute('cy', 200); wedge.setAttribute('r', 205);
    } else {
      const [x1, y1] = point(start, 205);
      const [x2, y2] = point(start + size, 205);
      wedge = svgElement('path');
      wedge.setAttribute('d', `M 200 200 L ${x1} ${y1} A 205 205 0 ${size > 180 ? 1 : 0} 1 ${x2} ${y2} Z`);
    }
    wedge.setAttribute('fill', palette[index % palette.length]);
    const title = svgElement('title');
    title.textContent = `${option.text.trim()}: ${Number(percent.toFixed(2))}%`;
    wedge.append(title); svg.append(wedge);
    const [x, y] = point(center, 126);
    const label = svgElement('text');
    label.setAttribute('x', x); label.setAttribute('y', y);
    label.setAttribute('text-anchor', 'middle'); label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('transform', `rotate(${center} ${x} ${y})`);
    const text = option.text.trim();
    label.textContent = text.length > 23 ? `${text.slice(0, 21)}…` : text;
    // Keep narrow slices from spilling labels into their neighbours.
    const width = Math.min(170, 2 * 126 * Math.sin(Math.min(size, 180) * Math.PI / 360) * 0.8);
    if (width < label.textContent.length * 7) {
      label.setAttribute('textLength', Math.max(1, width));
      label.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
    svg.append(label);
  });
  wheel.append(svg);
}

addButton.addEventListener('click', () => {
  if (spinning) return;
  const blank = options.findIndex(option => !option.text.trim());
  if (blank >= 0) { optionsEl.children[blank].querySelector('.option-text').focus(); return; }
  options.push({ text: '', percent: '' });
  renderOptions(); renderWheel();
  optionsEl.lastElementChild.querySelector('.option-text').focus();
});
clearButton.addEventListener('click', () => {
  if (spinning) return;
  options = []; renderOptions(); renderWheel();
});
customOdds.addEventListener('change', () => { renderOptions(); renderWheel(); });
spinButton.addEventListener('click', () => {
  const state = distribution();
  const slices = segments(state.choices);
  if (spinning || state.error || !slices.length) return;
  let winner;
  if (!customOdds.checked) {
    winner = slices[randomIndex(slices.length)];
  } else {
    const ticket = randomIndex(10000) / 100;
    let cumulative = 0;
    winner = slices[slices.length - 1];
    for (const slice of slices) {
      cumulative += slice.percent;
      if (ticket < cumulative) { winner = slice; break; }
    }
  }
  spinning = true;
  document.querySelectorAll('.panel input, .panel button').forEach(control => { control.disabled = true; });
  spinButton.disabled = true; result.textContent = 'The universe is considering…';
  const startRotation = rotation;
  const target = ((-winner.center % 360) + 360) % 360;
  rotation += (6 + randomIndex(3)) * 360 + target - (rotation % 360);
  const startedAt = performance.now();
  const animateSpin = now => {
    const progress = Math.min((now - startedAt) / 4700, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    wheel.style.transform = `rotate(${startRotation + (rotation - startRotation) * eased}deg)`;
    if (progress < 1) { requestAnimationFrame(animateSpin); return; }
    spinning = false; spinButton.disabled = false;
    document.querySelectorAll('.panel input, .panel button').forEach(control => { control.disabled = false; });
    const selected = document.createElement('strong'); selected.textContent = winner.option.text.trim();
    result.replaceChildren('Decision made: ', selected);
  };
  requestAnimationFrame(animateSpin);
});
renderOptions(); renderWheel();
