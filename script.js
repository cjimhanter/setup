const statusClass = s => ['owned','planned','tbd'].includes(s) ? s : 'tbd';

function card(item){
  return `<article class="card">
    <div class="card-top">
      <span class="category">${item.category}</span>
      <span class="badge ${statusClass(item.status)}">${item.statusLabel}</span>
    </div>
    <h3>${item.name}</h3>
    <p class="meta">${item.meta || ''}</p>
    <div class="bottom"><span class="price">${item.price || ''}</span></div>
  </article>`;
}

fetch('./data/setup.json')
  .then(r => r.json())
  .then(data => {
    document.querySelector('#pc-grid').innerHTML = data.pc.map(card).join('');
    document.querySelector('#peripheral-grid').innerHTML = data.peripherals.map(card).join('');

    document.querySelector('#connections-list').innerHTML = data.connections.map(x => `
      <div class="connection">
        <div><strong>${x.device}</strong><small>${x.detail}</small></div>
        <div class="arrow">→</div>
        <div><strong>${x.target}</strong><small>${x.port}</small></div>
      </div>`).join('');

    document.querySelector('#upgrade-list').innerHTML = data.upgrades.map(x => `
      <article class="roadmap-item">
        <div class="roadmap-num">${x.n}</div>
        <div><strong>${x.name}</strong><p>${x.why}</p></div>
        <strong>${x.when}</strong>
      </article>`).join('');

    document.querySelector('#updated').textContent = 'Обновлено: ' + data.updated;
  })
  .catch(err => {
    console.error(err);
    document.querySelector('#pc-grid').innerHTML = '<p>Не удалось загрузить data/setup.json</p>';
  });
