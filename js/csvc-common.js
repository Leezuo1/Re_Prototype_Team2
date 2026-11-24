/* =====================================================
   Phòng CSVC · phần dùng chung cho các trang csvc-*.html
   Cần nạp sau main.js, mgmt.js, mgmt-data.js, csvc-data.js
   ===================================================== */
Object.assign(ICONS, {
  plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  hub: '<rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 9V6M12 9V6M17 9V6M7 13h.01M12 13h.01M17 13h.01"/>',
  cable: '<path d="M4 9a2 2 0 0 1-2-2V5h6v2a2 2 0 0 1-2 2Z"/><path d="M3 5V3M7 5V3M19 15V6.5a3.5 3.5 0 0 0-7 0v11a3.5 3.5 0 0 1-7 0V9"/><path d="M17 21v-2M21 21v-2M22 19h-6v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z"/>',
  remote: '<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M12 6h.01M12 10h.01M10 14h4M10 18h4"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/>',
  box: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01"/><path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56z"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l4 2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  home: '<path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M10 21v-6h4v6"/>'
});

/* ---------- Header: đổi người dùng thành cán bộ Phòng CSVC ---------- */
function setHeaderUser() {
  const name = $('.user-name'), role = $('.user-role'), av = $('.avatar');
  if (name) name.textContent = ME;
  if (role) role.textContent = 'Phòng CSVC';
  if (av) av.textContent = initials(ME);
}

/* ---------- Chuông thông báo ---------- */
const READ_KEY = 'csvc.notifs.read';
function loadRead() {
  try { return JSON.parse(sessionStorage.getItem(READ_KEY) || '[]'); } catch (e) { return []; }
}
function saveRead(ids) {
  try { sessionStorage.setItem(READ_KEY, JSON.stringify(ids)); } catch (e) { /* không lưu được thì thôi */ }
}
const NT_ICON = { loan: 'box', incident: 'alert', overdue: 'clock', report: 'clipboard', late: 'door', progress: 'wrench' };
let ntFilter = 'all';

function renderNotifs() {
  const panel = $('#notifPanel');
  if (!panel) return;
  const unread = NOTIFS.filter(n => n.unread).length;
  const badgeEl = $('.bell-badge');
  if (badgeEl) { badgeEl.textContent = unread; badgeEl.style.display = unread ? 'flex' : 'none'; }
  const list = NOTIFS.filter(n => ntFilter === 'all' || n.unread);
  panel.innerHTML = `
    <div class="np-head">
      <h3 id="npTitle">Thông báo ${unread ? `<span class="np-pill">${unread} mới</span>` : ''}</h3>
      <button type="button" class="m-x" data-np-close aria-label="Đóng">${icon('x')}</button>
    </div>
    <div class="nt-tools">
      <div class="chips" role="group" aria-label="Lọc thông báo">
        <button type="button" class="chip ${ntFilter === 'all' ? 'active' : ''}" data-nf="all" aria-pressed="${ntFilter === 'all'}">Tất cả</button>
        <button type="button" class="chip ${ntFilter === 'unread' ? 'active' : ''}" data-nf="unread" aria-pressed="${ntFilter === 'unread'}">Chưa đọc<span class="n">${unread}</span></button>
      </div>
      <button type="button" class="link-btn" data-np-all ${unread ? '' : 'disabled'}>Đánh dấu tất cả đã đọc</button>
    </div>
    <div class="nt-list">
      ${list.length ? list.map(n => `
        <div class="nt ${n.unread ? 'unread' : ''}" role="button" tabindex="0" data-n="${n.id}">
          <div class="nt-ico ${n.type}">${icon(NT_ICON[n.type])}</div>
          <div class="nt-main">
            <b>${esc(n.title)}</b>
            <p>${esc(n.text)}</p>
            <div class="nt-bot"><small>${n.time}</small><span class="nt-link">Xem chi tiết</span></div>
          </div>
          ${n.unread ? '<i class="nt-dot" aria-label="Chưa đọc"></i>' : ''}
        </div>`).join('') : `
        <div class="nt-empty">${icon('bell')}<b>${ntFilter === 'unread' ? 'Đã đọc hết thông báo' : 'Chưa có thông báo'}</b><p>Phiếu mượn, sự cố và biên bản trả phòng mới sẽ hiện ở đây.</p></div>`}
    </div>`;
}

function openNotif(n) {
  n.unread = false;
  saveRead(NOTIFS.filter(x => !x.unread).map(x => x.id));
  const [file, hash] = n.href.split('#');
  const here = location.pathname.split('/').pop();
  if (file === here) {
    closeNotifPanel();
    renderNotifs();
    if (location.hash === '#' + hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = hash;
  } else {
    location.href = n.href;
  }
}
function closeNotifPanel() { const p = $('#notifPanel'); if (p) p.hidden = true; }

function initBell() {
  const bell = $('.bell'), holder = $('.header-inner');
  if (!bell || !holder) return;
  const read = loadRead();
  NOTIFS.forEach(n => { if (read.includes(n.id)) n.unread = false; });
  bell.setAttribute('aria-haspopup', 'dialog');
  const panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.className = 'notif-panel wide';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'npTitle');
  panel.hidden = true;
  holder.appendChild(panel);
  renderNotifs();

  bell.addEventListener('click', e => { e.stopPropagation(); panel.hidden = !panel.hidden; bell.setAttribute('aria-expanded', String(!panel.hidden)); });
  document.addEventListener('click', e => { const path = e.composedPath(); if (!path.includes(panel) && !path.includes(bell)) panel.hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { panel.hidden = true; bell.focus(); } });
  panel.addEventListener('click', e => {
    if (e.target.closest('[data-np-close]')) { panel.hidden = true; return; }
    const f = e.target.closest('[data-nf]');
    if (f) { ntFilter = f.dataset.nf; renderNotifs(); return; }
    if (e.target.closest('[data-np-all]')) {
      NOTIFS.forEach(n => { n.unread = false; });
      saveRead(NOTIFS.map(n => n.id));
      renderNotifs();
      showToast('Đã đánh dấu tất cả thông báo là đã đọc');
      return;
    }
    const item = e.target.closest('[data-n]');
    if (item) openNotif(NOTIFS.find(n => n.id === item.dataset.n));
  });
  panel.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-n]')) { e.preventDefault(); openNotif(NOTIFS.find(n => n.id === e.target.dataset.n)); }
  });
}

layoutReady.then(ok => { if (!ok) return; setHeaderUser(); initBell(); });

/* ---------- Bộ chọn cơ sở dùng chung ---------- */
/* counts: { all, cs1, cs2, cs3 } (tùy chọn). Trả về html của dãy chip */
function campusChipsHtml(selected, counts, label = 'Cơ sở') {
  const one = (v, text) => `<button type="button" class="chip ${selected === v ? 'active' : ''}" data-v="${v}" aria-pressed="${selected === v}">${text}${counts ? `<span class="n">${counts[v || 'all']}</span>` : ''}</button>`;
  return `<div class="chips" role="group" aria-label="${label}">${one('', 'Tất cả cơ sở')}${CAMPUSES.map(c => one(c.id, c.name)).join('')}</div>`;
}
const countBy = (list, key = 'campus') => {
  const c = { all: list.length };
  CAMPUSES.forEach(x => { c[x.id] = list.filter(i => i[key] === x.id).length; });
  return c;
};
const campusTag = id => `<span class="pill">${CAMPUS_NAME[id]}</span>`;

/* Giữ lại bộ lọc theo #hash (VD #wait) giữa các trang */
const hashKey = () => decodeURIComponent(location.hash.slice(1));

/* Ảnh đính kèm giả lập: không tải file thật, chỉ ghi tên file mẫu */
const SAMPLE_IMAGES = ['anh-hien-truong-01.jpg', 'anh-hien-truong-02.jpg', 'anh-chup-thiet-bi.jpg'];
let sampleImgIdx = 0;
const nextSampleImage = () => SAMPLE_IMAGES[sampleImgIdx++ % SAMPLE_IMAGES.length];
const fileChip = (name, size = '1,1 MB') => `<div class="file-card">${icon('image')}<div class="grow">${esc(name)}<small>${size}</small></div></div>`;

/* Thanh trượt số lượng nhỏ */
function qtyHtml(id, value, max) {
  return `<div class="qty" data-qty="${id}" data-max="${max}">
    <button type="button" data-d="-1" aria-label="Giảm">−</button><output id="${id}" aria-live="polite">${value}</output><button type="button" data-d="1" aria-label="Tăng">+</button></div>`;
}
function bindQty(root, onChange) {
  root.querySelectorAll('.qty').forEach(q => q.addEventListener('click', e => {
    const b = e.target.closest('button[data-d]');
    if (!b) return;
    const out = q.querySelector('output');
    const max = Number(q.dataset.max);
    const v = Math.min(max, Math.max(0, Number(out.textContent) + Number(b.dataset.d)));
    out.textContent = v;
    onChange && onChange(q.dataset.qty, v);
  }));
}
