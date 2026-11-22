/* =====================================================
   Hàm dùng chung cho nhóm trang Admin và Người quản lý phòng
   Cần nạp sau main.js (dùng ICONS, icon(), showToast(), trapDialog())
   ===================================================== */
Object.assign(ICONS, {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/>',
  sheet: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  userCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  refresh: '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M16 16h5v5"/>',
  edit: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  log: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 16V11M12 16V7M17 16v-3"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7M19 12H5"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  swap: '<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
  mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>'
});

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
const fmtNum = n => Number(n).toLocaleString('vi-VN');
/* Bỏ dấu tiếng Việt để tìm kiếm "nguyen" ra "Nguyễn" */
const fold = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const initials = name => name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase();
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const val = id => document.getElementById(id).value;

/* Ngày "hôm nay" cố định cho dữ liệu mẫu */
const TODAY = '2026-11-23';
const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function weekdayOf(iso) { return WEEKDAYS[new Date(iso + 'T00:00:00').getDay()]; }

const badge = (kind, text, plain) => `<span class="badge ${kind}${plain ? ' plain' : ''}">${esc(text)}</span>`;

function alertBox(kind, title, text, ic = 'info') {
  return `<div class="alert ${kind}">${icon(ic)}<div>${title ? `<b>${title}</b>` : ''}${text || ''}</div></div>`;
}
function notice(kind, html, ic = 'info') {
  return `<div class="notice ${kind}" role="status">${icon(ic)}<div class="grow">${html}</div></div>`;
}
function emptyState(title, text, ic = 'search') {
  return `<div class="empty-state">${icon(ic)}<b>${title}</b>${text || ''}</div>`;
}

/* ===== Hộp thoại (dùng #modalRoot có sẵn trên mỗi trang) ===== */
function setModal(html, variant = '', wide = false) {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="overlay ${variant}"><div class="modal ${variant}${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">${html}</div></div>`;
  document.body.classList.add('no-scroll');
  root.querySelector('.overlay').addEventListener('mousedown', e => {
    if (e.target.classList.contains('overlay')) closeModal();
  });
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  const dialog = root.querySelector('.modal');
  trapDialog(dialog, closeModal);
  return dialog;
}
function closeModal() {
  if (typeof dialogCleanup === 'function') dialogCleanup();
  const root = document.getElementById('modalRoot');
  if (root) root.innerHTML = '';
  document.body.classList.remove('no-scroll');
}
const mHead = (title, sub) => `
  <div class="m-head">
    <div><h2 id="modalTitle">${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>
    <button type="button" class="m-x" data-close aria-label="Đóng">${icon('x')}</button>
  </div>`;
const mFoot = (html, cls = '') => `<div class="m-foot ${cls}">${html}</div>`;

/* Hộp xác nhận: onConfirm() chạy khi bấm nút xác nhận */
function confirmDialog({ title, sub, body = '', confirmText = 'Xác nhận', danger = false, onConfirm }) {
  const m = setModal(`
    ${mHead(title, sub)}
    <div class="m-body">${body}</div>
    ${mFoot(`<button type="button" class="btn btn-outline" data-close>Hủy</button>
             <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cfOk" data-autofocus>${confirmText}</button>`)}
  `);
  m.querySelector('#cfOk').addEventListener('click', () => { closeModal(); onConfirm && onConfirm(); });
  return m;
}

/* Hộp nhập lý do bắt buộc (từ chối, hủy, đổi lịch) */
function reasonDialog({ title, sub, label = 'Lý do', placeholder = 'Nhập lý do…', confirmText = 'Xác nhận', danger = true, body = '', onConfirm }) {
  const m = setModal(`
    ${mHead(title, sub)}
    <div class="m-body">
      ${body}
      <div class="f-group">
        <label for="rsText">${label} *</label>
        <textarea id="rsText" placeholder="${placeholder}" data-autofocus></textarea>
        <p class="err" id="rsErr" hidden>Vui lòng nhập lý do.</p>
      </div>
    </div>
    ${mFoot(`<button type="button" class="btn btn-outline" data-close>Hủy</button>
             <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="rsOk">${confirmText}</button>`)}
  `);
  m.querySelector('#rsOk').addEventListener('click', () => {
    const v = m.querySelector('#rsText').value.trim();
    if (!v) {
      m.querySelector('#rsErr').hidden = false;
      m.querySelector('#rsText').classList.add('invalid');
      m.querySelector('#rsText').focus();
      return;
    }
    closeModal(); onConfirm && onConfirm(v);
  });
  return m;
}

/* ===== Phân trang đơn giản ===== */
function renderPager(host, { page, pages, onGo }) {
  if (pages <= 1) { host.innerHTML = ''; return; }
  const btn = (p, label, dis, act) => `<button type="button" data-p="${p}" ${dis ? 'disabled' : ''} class="${act ? 'active' : ''}" ${act ? 'aria-current="page"' : ''} aria-label="${typeof label === 'number' ? 'Trang ' + label : label === '‹' ? 'Trang trước' : 'Trang sau'}">${label}</button>`;
  let html = btn(page - 1, '‹', page === 1);
  for (let p = 1; p <= pages; p++) html += btn(p, p, false, p === page);
  html += btn(page + 1, '›', page === pages);
  host.innerHTML = html;
  host.querySelectorAll('button:not(:disabled)').forEach(b => b.addEventListener('click', () => onGo(Number(b.dataset.p))));
}

/* ===== Gắn bộ lọc dạng chip (1 lựa chọn) ===== */
function bindChips(host, onChange) {
  host.addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    host.querySelectorAll('.chip').forEach(c => { c.classList.toggle('active', c === b); c.setAttribute('aria-pressed', c === b); });
    onChange(b.dataset.v);
  });
}

/* ===== Thẻ chuyển trang con (tab) ===== */
function bindTabs(host, onChange) {
  host.setAttribute('role', 'tablist');
  host.addEventListener('click', e => {
    const b = e.target.closest('button[data-tab]');
    if (!b) return;
    host.querySelectorAll('button[data-tab]').forEach(t => { t.classList.toggle('active', t === b); t.setAttribute('aria-selected', t === b); });
    onChange(b.dataset.tab);
  });
}

/* ===== Mô phỏng thao tác tải xuống/xuất tệp ===== */
function fakeExport(btn, doneMsg) {
  submitWithLoading(btn, () => showToast(doneMsg), 900);
}

/* Biểu đồ cột dọc: items = [{label, value, cur?}] */
function vbarsHtml(items, max, unit = '') {
  const top = max || Math.max(...items.map(i => i.value));
  const axis = [100, 75, 50, 25, 0].map(p => `<span class="ax" style="bottom:${p}%">${Math.round(top * p / 100)}${unit}</span>`).join('');
  const bars = items.map(i => {
    const h = Math.max(0, Math.min(100, i.value / top * 100));
    return `<div class="vbar${i.cur ? ' cur' : ''}"><em style="bottom:calc(${h}% + 3px)">${i.value}${unit}</em><i style="height:${h}%"></i></div>`;
  }).join('');
  const labels = items.map(i => `<span>${esc(i.label)}</span>`).join('');
  return `<div class="vbars">${axis}${bars}</div><div class="vbar-labels">${labels}</div>`;
}
