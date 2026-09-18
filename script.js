const glyphs = {
  "Монитор":"165",
  "Клавиатура":"⌨",
  "Мышь":"G",
  "Наушники":"G435",
  "Кресло":"↟",
  "Коврик":"MAT"
};

function specRow(item){
  return `<div class="spec-row">
    <div class="spec-kind">${item.category}</div>
    <div class="spec-name">
      ${item.name}
      <span class="spec-meta">${item.meta || ''}</span>
    </div>
    <span class="spec-state">${item.statusLabel}</span>
  </div>`;
}

function gearCard(item, index){
  const wide = index < 2 ? ' wide' : '';
  const glyph = glyphs[item.category] || item.category.slice(0,3).toUpperCase();
  const small = glyph.length > 3 ? ' small' : '';
  return `<article class="gear-card${wide}">
    <div class="gear-media">
      <div class="gear-glyph${small}">${glyph}</div>
    </div>
    <div class="gear-body">
      <span class="gear-category">${item.category}</span>
      <h3>${item.name}</h3>
      <p>${item.meta || ''}</p>
      <span class="gear-badge">${item.statusLabel}</span>
    </div>
  </article>`;
}

fetch('./data/setup.json')
  .then(r => r.json())
  .then(data => {
    document.querySelector('#pc-list').innerHTML = data.pc.map(specRow).join('');

    const gear = data.peripherals.filter(x => !['Монитор','Кресло','Коврик'].includes(x.category));
    document.querySelector('#gear-grid').innerHTML = gear.map(gearCard).join('');

    document.querySelector('#connections-list').innerHTML = data.connections.map(x => `
      <div class="connection">
        <div><strong>${x.device}</strong><small>${x.detail}</small></div>
        <div class="arrow">→</div>
        <div><strong>${x.target}</strong><small>${x.port}</small></div>
      </div>`).join('');

    document.querySelector('#upgrade-list').innerHTML = data.upgrades.map(x => `
      <div class="upgrade-item">
        <div class="upgrade-num">${x.n}</div>
        <div><strong>${x.name}</strong><p>${x.why}</p></div>
        <span class="upgrade-when">${x.when}</span>
      </div>`).join('');

    document.querySelector('#updated').textContent = 'Обновлено: ' + data.updated;
  })
  .catch(err => console.error('setup data:', err));
