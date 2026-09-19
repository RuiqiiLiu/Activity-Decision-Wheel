const palette = ['#eea18d','#edce78','#a9c6a3','#99bcc3','#b6aaca','#e9b7c3','#afd0c8','#e7b17e'];
    const defaults = ['Tacos for dinner', 'Take a walk', 'Watch a comfort show', 'Call a friend', 'Read for 20 minutes'];
    const optionsEl = document.querySelector('#options');
    const wheel = document.querySelector('#wheel');
    const spinButton = document.querySelector('#spin');
    const result = document.querySelector('#result');
    let options = [...defaults];
    let rotation = 0;
    let spinning = false;

    function cleanOptions() { return options.map(item => item.trim()).filter(Boolean); }
    // Fresh browser-provided randomness on every spin; rejection avoids modulo bias.
    function randomIndex(count) {
      const range = 0x100000000;
      const limit = range - (range % count);
      const sample = new Uint32Array(1);
      do { crypto.getRandomValues(sample); } while (sample[0] >= limit);
      return sample[0] % count;
    }
    function renderOptions() {
      optionsEl.innerHTML = '';
      let colorIndex = 0;
      options.forEach((option, index) => {
        const row = document.createElement('div'); row.className = 'option-row';
        const swatch = document.createElement('span'); swatch.className = 'swatch';
        swatch.style.background = option.trim() ? palette[colorIndex++ % palette.length] : '#d8ddd3';
        const input = document.createElement('input');
        input.setAttribute('aria-label', `Option ${index + 1}`); input.value = option;
        const remove = document.createElement('button'); remove.className = 'remove'; remove.type = 'button';
        remove.setAttribute('aria-label', `Remove option ${index + 1}`); remove.textContent = '×';
        row.append(swatch, input, remove);
        const rowIndex = () => Array.from(optionsEl.children).indexOf(row);
        input.addEventListener('input', e => { options[rowIndex()] = e.target.value; renderWheel(); });
        input.addEventListener('blur', () => {
          const currentIndex = rowIndex();
          if (currentIndex < 0 || input.value.trim()) return;
          options.splice(currentIndex, 1);
          // Remove just this row so another focused input or clicked button stays intact.
          row.remove();
          optionsEl.querySelectorAll('.option-row').forEach((remainingRow, i) => {
            remainingRow.querySelector('input').setAttribute('aria-label', `Option ${i + 1}`);
            remainingRow.querySelector('button').setAttribute('aria-label', `Remove option ${i + 1}`);
          });
          renderWheel();
        });
        remove.addEventListener('click', () => { if (options.length > 2) { options.splice(rowIndex(), 1); renderOptions(); renderWheel(); } else { result.innerHTML = 'Keep at least <strong>two</strong> choices on the wheel.'; } });
        optionsEl.append(row);
      });
    }
    function renderWheel() {
      const choices = cleanOptions();
      document.querySelector('#choiceCount').textContent = `${choices.length} options`;
      result.textContent = 'Ready when you are.';
      let colorIndex = 0;
      optionsEl.querySelectorAll('.swatch').forEach((swatch, i) => {
        swatch.style.background = options[i].trim() ? palette[colorIndex++ % palette.length] : '#d8ddd3';
      });
      wheel.innerHTML = '';
      if (choices.length < 2) { wheel.innerHTML = '<div class="empty">Add two choices<br>to get rolling.</div>'; spinButton.disabled = true; return; }
      spinButton.disabled = spinning;
      const slice = 360 / choices.length;
      const point = (degrees, radius) => {
        const radians = (degrees - 90) * Math.PI / 180;
        return [200 + Math.cos(radians) * radius, 200 + Math.sin(radians) * radius];
      };
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 400 400');
      choices.forEach((choice, i) => {
        const center = i * slice;
        const start = center - slice / 2;
        const end = center + slice / 2;
        const [x1, y1] = point(start, 205);
        const [x2, y2] = point(end, 205);
        const wedge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wedge.setAttribute('d', `M 200 200 L ${x1} ${y1} A 205 205 0 ${slice > 180 ? 1 : 0} 1 ${x2} ${y2} Z`);
        wedge.setAttribute('fill', palette[i % palette.length]);
        svg.append(wedge);
        const [labelX, labelY] = point(center, 126);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        // The top of every label points toward the rim, consistently around the wheel.
        const labelRotation = center;
        label.setAttribute('x', labelX); label.setAttribute('y', labelY);
        label.setAttribute('text-anchor', 'middle'); label.setAttribute('dominant-baseline', 'middle');
        label.setAttribute('transform', `rotate(${labelRotation} ${labelX} ${labelY})`);
        label.textContent = choice.length > 23 ? `${choice.slice(0, 21)}…` : choice;
        svg.append(label);
      });
      wheel.append(svg);
    }
    document.querySelector('#addOption').addEventListener('click', () => {
      const blankIndex = options.findIndex(option => !option.trim());
      if (blankIndex >= 0) {
        optionsEl.children[blankIndex].querySelector('input').focus();
        return;
      }
      options.push(''); renderOptions(); renderWheel();
      optionsEl.querySelector('.option-row:last-child input').focus();
    });
    spinButton.addEventListener('click', () => {
      const choices = cleanOptions();
      if (choices.length < 2 || spinning) return;
      optionsEl.querySelectorAll('input, button').forEach(control => { control.disabled = true; });
      document.querySelector('#addOption').disabled = true;
      spinning = true; spinButton.disabled = true; result.textContent = 'The universe is considering…';
      const winner = randomIndex(choices.length);
      const slice = 360 / choices.length;
      const desired = 360 - (winner * slice); // center of selected slice lands at pointer
      const extraTurns = 6 + randomIndex(3);
      const startRotation = rotation;
      rotation += extraTurns * 360 + desired - (rotation % 360);
      const duration = 4700;
      const startedAt = performance.now();
      const animateSpin = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const currentRotation = startRotation + (rotation - startRotation) * eased;
        wheel.style.transform = `rotate(${currentRotation}deg)`;
        if (progress < 1) {
          requestAnimationFrame(animateSpin);
        } else {
          spinning = false; spinButton.disabled = false;
          optionsEl.querySelectorAll('input, button').forEach(control => { control.disabled = false; });
          document.querySelector('#addOption').disabled = false;
          const selected = document.createElement('strong'); selected.textContent = choices[winner];
          result.replaceChildren('Decision made: ', selected);
        }
      };
      requestAnimationFrame(animateSpin);
    });
    renderOptions(); renderWheel();
