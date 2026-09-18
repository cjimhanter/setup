function gearCard(x){return `<a class="gear-card" href="${x.url}" target="_blank" rel="noreferrer"><div class="gear-media"><img src="${x.image}" alt="${x.name}" loading="lazy"></div><div class="gear-body"><span class="gear-kind">${x.category}</span><h3>${x.name}</h3><p>${x.meta}</p></div></a>`}
function specRow(x){return `<div class="spec-row"><div class="spec-kind">${x.category}</div><div class="spec-name">${x.name}<span class="spec-meta">${x.meta}</span></div></div>`}
fetch('./data/setup.json').then(r=>r.json()).then(d=>{
 document.querySelector('#gear-grid').innerHTML=d.gear.map(gearCard).join('');
 document.querySelector('#pc-list').innerHTML=d.pc.map(specRow).join('');
 document.querySelector('#connections-list').innerHTML=d.connections.map(x=>`<div class="connection"><div><strong>${x.device}</strong><small>${x.detail}</small></div><div class="arrow">→</div><div><strong>${x.target}</strong><small>${x.port}</small></div></div>`).join('');
 document.querySelector('#upgrade-list').innerHTML=d.upgrades.map(x=>`<div class="upgrade"><div><strong>${x.name}</strong><small>${x.why}</small></div></div>`).join('');
 document.querySelector('#updated').textContent='Обновлено: '+d.updated;
 document.querySelectorAll('details').forEach(x=>x.open=false);
});