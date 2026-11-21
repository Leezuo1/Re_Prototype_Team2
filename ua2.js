/* ===== Icon bổ sung (dùng chung hàm icon() trong main.js) ===== */
Object.assign(ICONS, {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  xcircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  hub: '<path d="m19 5 3-3M2 22l3-3M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="M7.5 13.5 10 11M10.5 16.5 13 14M12 6l6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/>',
  cable: '<path d="M4 9a2 2 0 0 1-2-2V5h6v2a2 2 0 0 1-2 2Z"/><path d="M3 5V3M7 5V3M19 15V6.5a3.5 3.5 0 0 0-7 0v11a3.5 3.5 0 0 1-7 0V9"/><path d="M17 21v-2M21 21v-2M22 19h-6v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z"/>',
  wifi: '<path d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.859a10 10 0 0 1 14 0M8.5 16.429a5 5 0 0 1 7 0"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/>',
  box: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  searchx: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M13.5 8.5l-5 5M8.5 8.5l5 5"/>'
});

/* ===== Dữ liệu mock ===== */
const TODAY = '2026-10-26';

const EQUIP = [
  { id: 'odien',  name: 'Ổ điện kéo dài',   short: 'Ổ điện',    desc: 'Ổ cắm 6 lỗ · Dây dài 5 m',            icon: 'plug' },
  { id: 'hub',    name: 'Hub USB-C',        short: 'Hub USB-C', desc: 'Đa cổng · HDMI / USB / USB-C',        icon: 'hub' },
  { id: 'hdmi',   name: 'Dây cáp HDMI',     short: 'HDMI',      desc: 'Kết nối trình chiếu · Dài 2 m',        icon: 'cable' },
  { id: 'remote', name: 'Remote máy chiếu', short: 'Remote',    desc: 'Điều khiển cầm tay · Mượn thêm',       icon: 'wifi' }
];
const BASE  = { odien: 12, hub: 5, hdmi: 2, remote: 0 };
const STOCK = { ...BASE };

const ROOM_OPTS = [
  ['A.301', 'A.301 · Tòa A · Tầng 3'], ['A.302', 'A.302 · Tòa A · Tầng 3'], ['A.303', 'A.303 · Tòa A · Tầng 3'],
  ['B.205', 'B.205 · Tòa B · Tầng 2'], ['B.206', 'B.206 · Tòa B · Tầng 2'], ['C.402', 'C.402 · Tòa C · Tầng 4']
];

// status: wait (Chờ nhận) | borrowed (Đang mượn) | returned (Đã trả) | issue (Thiết bị có vấn đề)
// old: true => chỉ hiện ở Lịch sử, không hiện ở tab "Phiếu mượn của tôi"
const TICKETS = [
  { code: 'TB1030', items: [{ id: 'hdmi', qty: 1 }],                          room: 'A.302', b: { date: '2026-10-26', time: '13:00' }, d: { date: '2026-10-26', time: '15:00' }, status: 'wait',     created: '08:10' },
  { code: 'TB1029', items: [{ id: 'odien', qty: 1 }, { id: 'hub', qty: 1 }],   room: 'B.205', b: { date: '2026-10-26', time: '08:00' }, d: { date: '2026-10-26', time: '11:00' }, status: 'borrowed', created: '07:45', handed: '08:05' },
  { code: 'TB1028', items: [{ id: 'hub', qty: 1 }],                           room: 'A.301', b: { date: '2026-10-23', time: '09:00' }, d: { date: '2026-10-23', time: '11:00' }, status: 'returned' },
  { code: 'TB1027', items: [{ id: 'hdmi', qty: 1 }],                          room: 'C.402', b: { date: '2026-10-22', time: '14:00' }, d: { date: '2026-10-22', time: '16:00' }, status: 'issue' },
  { code: 'TB1026', items: [{ id: 'odien', qty: 2 }],                         room: 'A.303', b: { date: '2026-10-21', time: '10:00' }, d: { date: '2026-10-21', time: '12:00' }, status: 'returned' },
  { code: 'TB1025', items: [{ id: 'hdmi', qty: 1 }],                          room: 'A.301', b: { date: '2026-10-20', time: '08:00' }, d: { date: '2026-10-20', time: '10:00' }, status: 'returned', old: true },
  { code: 'TB1024', items: [{ id: 'hub', qty: 1 }],                           room: 'B.206', b: { date: '2026-10-19', time: '13:00' }, d: { date: '2026-10-19', time: '15:00' }, status: 'returned', old: true },
  { code: 'TB1023', items: [{ id: 'odien', qty: 1 }],                         room: 'A.302', b: { date: '2026-10-16', time: '09:00' }, d: { date: '2026-10-16', time: '11:00' }, status: 'returned', old: true },
  { code: 'TB1022', items: [{ id: 'hdmi', qty: 1 }],                          room: 'C.402', b: { date: '2026-10-15', time: '14:00' }, d: { date: '2026-10-15', time: '16:00' }, status: 'returned', old: true }
];

const ST_TEXT  = { wait: 'Chờ nhận', borrowed: 'Đang mượn', returned: 'Đã trả', issue: 'Thiết bị có vấn đề' };
const ST_CLASS = { wait: 'pending', borrowed: 'blue', returned: 'ok', issue: 'rejected' };

const cart = {};          // id -> số lượng đang chọn trong "Phiếu mượn đang chọn"
const cardQty = {};       // id -> số lượng trên thẻ danh mục
let tab = 'mine';         // 'mine' | 'hist'
let hl = null;            // phiếu vừa tạo
let lastReturned = null;  // phiếu vừa trả (tô xanh trong lịch sử)
let hq = '', hs = '';     // tìm kiếm + lọc trạng thái ở lịch sử

/* ===== Tiện ích ===== */
const $ = id => document.getElementById(id);
const fmtDate = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
const fmtDT = (o) => `${o.time} · ${fmtDate(o.date)}`;
const lf = s => s.charAt(0).toLowerCase() + s.slice(1);
const eq = id => EQUIP.find(e => e.id === id);
const num = c => Number(c.slice(2));
const sortedTickets = () => [...TICKETS].sort((a, b) => num(b.code) - num(a.code));
const nextCode = () => 'TB' + (Math.max(...TICKETS.map(t => num(t.code))) + 1);
const getTicket = code => TICKETS.find(t => t.code === code);
const itemsLine = items => items.map(i => `${eq(i.id).name} × ${i.qty}`).join(' · ');
const itemsPhrase = items => {
  const p = items.map(i => `${i.qty} ${lf(eq(i.id).name)}`);
  return p.length > 1 ? p.slice(0, -1).join(', ') + ' và ' + p[p.length - 1] : p[0];
};
const stockLine = () => EQUIP.map(e => STOCK[e.id]).join(' / ');

function stockBadge(n) {
  if (n === 0) return ['rejected', 'Hết hàng'];
  if (n <= 2) return ['pending', 'Sắp hết'];
  return ['ok', 'Còn hàng'];
}

function alertBox(kind, title, text, ic = 'info') {
  return `<div class="alert ${kind}">${icon(ic)}<div>${title ? `<b>${title}</b>` : ''}${text || ''}</div></div>`;
}

const stepper = (dec, inc, q, over) => `
  <div class="stepper ${over ? 'over' : ''}">
    <button type="button" ${dec} aria-label="Giảm">−</button><span>${q}</span><button type="button" ${inc} aria-label="Tăng">+</button>
  </div>`;

/* ===== Khung modal ===== */
// variant = 'drawer' => ngăn trượt từ bên phải (dùng cho chi tiết phiếu)
function setModal(html, variant = '') {
  const root = $('modalRoot');
  root.innerHTML = `<div class="overlay ${variant}"><div class="modal ${variant}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">${html}</div></div>`;
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
  $('modalRoot').innerHTML = '';
  document.body.classList.remove('no-scroll');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

const xBtn = `<button type="button" class="m-x" data-close aria-label="Đóng">${icon('x')}</button>`;
const mHead = (title, sub) => `<div class="m-head"><div><h2 id="modalTitle">${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${xBtn}</div>`;
const mFoot = (html, cls = '') => `<div class="m-foot ${cls}">${html}</div>`;

/* ===== Danh mục thiết bị (cột trái) ===== */
function renderCatalog() {
  const el = $('catalog');

  // Tab lịch sử: danh mục gọn
  if (tab === 'hist') {
    const restored = EQUIP.every(e => STOCK[e.id] === BASE[e.id]);
    el.innerHTML = `
      <div class="card-head"><h2>Danh mục thiết bị</h2></div>
      <div class="eq-compact">
        ${EQUIP.map(e => {
          const [c, t] = stockBadge(STOCK[e.id]);
          return `<div class="ec-row"><b>${e.name}</b><div><strong>${STOCK[e.id]}</strong><span class="badge ${c}">${t}</span></div></div>`;
        }).join('')}
      </div>
      <p class="ok-note">${restored ? `Khả dụng đã khôi phục về ${stockLine()} sau khi trả đủ thiết bị.` : `Khả dụng hiện tại: ${stockLine()}. Số lượng được hoàn lại khi trả thiết bị.`}</p>`;
    return;
  }

  EQUIP.forEach(e => {
    const s = STOCK[e.id];
    cardQty[e.id] = s === 0 ? 0 : Math.min(Math.max(cardQty[e.id] || 1, 1), s);
  });

  const cartItems = EQUIP.filter(e => cart[e.id] > 0);
  const total = cartItems.reduce((n, e) => n + cart[e.id], 0);

  el.innerHTML = `
    <div class="card-head"><h2>Danh mục thiết bị</h2><span class="count">4 loại thiết bị mượn thêm</span></div>
    <div class="eq-grid">
      ${EQUIP.map(e => {
        const s = STOCK[e.id], [c, t] = stockBadge(s), q = cardQty[e.id];
        return `
        <article class="eq-card">
          <div class="eq-top"><div class="room-icon">${icon(e.icon)}</div><span class="badge ${c}">${t}</span></div>
          <h3>${e.name}</h3>
          <p class="eq-desc">${e.desc}</p>
          <div class="eq-mid">
            <div><small>Hiện có thể mượn</small><strong class="${s ? '' : 'zero'}">${s} thiết bị</strong></div>
            <div class="stepper ${s ? '' : 'off'}">
              <button type="button" data-card-dec="${e.id}" ${q <= 1 ? 'disabled' : ''} aria-label="Giảm">−</button><span>${q}</span><button type="button" data-card-inc="${e.id}" ${q >= s ? 'disabled' : ''} aria-label="Tăng">+</button>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-block" data-add="${e.id}" ${s ? '' : 'disabled'}>${s ? icon('plus') + ' ' : ''}Thêm vào phiếu mượn</button>
        </article>`;
      }).join('')}
    </div>

    <div class="cart">
      <div class="cart-head">
        <b>Phiếu mượn đang chọn</b>
        <span class="${cartItems.length ? 'cart-sum' : 'cart-sum none'}">${cartItems.length ? `${cartItems.length} loại · ${total} thiết bị` : 'Chưa chọn thiết bị'}</span>
      </div>
      ${cartItems.length
        ? cartItems.map(e => `
            <div class="cart-row"><span>${e.name}</span>${stepper(`data-cart-dec="${e.id}"`, `data-cart-inc="${e.id}"`, cart[e.id], cart[e.id] > STOCK[e.id])}</div>`).join('')
        : '<p class="muted small cart-empty">Chọn thiết bị từ danh mục để tạo phiếu mượn tiếp theo.</p>'}
      <button type="button" class="btn btn-primary btn-block" data-create ${cartItems.length ? '' : 'disabled'}>Tạo yêu cầu mượn</button>
    </div>

    <p class="note">${icon('info')} Số lượng khả dụng được kiểm tra lại khi gửi yêu cầu. Chỉ đăng ký thiết bị mượn thêm, không đăng ký thiết bị có sẵn trong phòng.</p>`;
}

/* ===== Cột phải: Phiếu mượn của tôi / Lịch sử ===== */
const tabsHtml = () => `
  <div class="seg-tabs">
    <button type="button" class="${tab === 'mine' ? 'active' : ''}" data-tab="mine">Phiếu mượn của tôi</button>
    <button type="button" class="${tab === 'hist' ? 'active' : ''}" data-tab="hist">Lịch sử mượn - trả</button>
  </div>`;

function ticketCard(t) {
  const dueLine = t.status === 'returned'
    ? `<p class="tk-line">Đã trả: ${fmtDT(t.ret || t.d)}</p>`
    : `<p class="tk-line">Trả dự kiến: ${fmtDT(t.d)}</p>`;
  return `
    <article class="tk ${t.code === hl ? 'new' : ''}">
      <div class="tk-top">
        <span class="order-code">#${t.code}${t.code === hl ? ' · Vừa tạo' : ''}</span>
        <span class="badge ${ST_CLASS[t.status]}">${ST_TEXT[t.status]}</span>
      </div>
      <div class="tk-title"><h3>${itemsLine(t.items)}</h3><button type="button" class="detail-link" data-detail="${t.code}">Chi tiết ${icon('chevron')}</button></div>
      <p class="tk-room">Phòng sử dụng: ${t.room}</p>
      <p class="tk-line">Mượn: ${fmtDT(t.b)}</p>
      ${dueLine}
      ${t.status === 'wait' ? `<button type="button" class="qr-link" data-qr="${t.code}">${icon('qr')} Xem mã QR</button>` : ''}
    </article>`;
}

function histMatches() {
  const q = hq.trim().toLowerCase().replace('#', '');
  return sortedTickets().filter(t => (t.status === 'returned' || t.status === 'issue')
    && (!hs || t.status === hs)
    && (!q || t.code.toLowerCase().includes(q) || t.items.some(i => eq(i.id).name.toLowerCase().includes(q))));
}

function renderHistResult() {
  const all = TICKETS.filter(t => t.status === 'returned' || t.status === 'issue');
  const list = histMatches();
  const filtering = hq.trim() || hs;

  $('histCount').textContent = filtering ? `${list.length} kết quả phù hợp` : '';
  $('histClear').hidden = !hq;

  if (!list.length) {
    const sTxt = hs ? ` với trạng thái ${ST_TEXT[hs]}` : '';
    $('histBody').innerHTML = `
      <div class="empty-block">
        <div class="empty-ico brand">${icon('searchx')}</div>
        <h3>Không tìm thấy phiếu phù hợp</h3>
        <p>Không có kết quả${hq.trim() ? ` cho “${hq.trim()}”` : ''}${sTxt}. Thử mã phiếu, tên thiết bị khác hoặc bỏ bộ lọc.</p>
        <button type="button" class="btn btn-outline" data-hreset>Xóa tìm kiếm và bộ lọc</button>
      </div>`;
    $('histFoot').textContent = '';
    return;
  }

  $('histBody').innerHTML = `
    <div class="tbl-wrap">
      <table class="tbl">
        <thead><tr><th>Mã phiếu</th><th>Thiết bị</th><th>Số lượng</th><th>Thời gian mượn</th><th>Thời gian trả</th><th>Trạng thái</th></tr></thead>
        <tbody>
          ${list.map(t => {
            const r = t.ret || t.d;
            return `<tr class="${t.code === lastReturned ? 'hot' : ''}">
              <td><button type="button" class="code-link" data-detail="${t.code}">#${t.code}</button></td>
              <td>${t.items.map(i => `<div>${eq(i.id).name}</div>`).join('')}</td>
              <td>${t.items.map(i => `<div>${i.qty}</div>`).join('')}</td>
              <td><b>${t.b.time}</b><small>${fmtDate(t.b.date)}</small></td>
              <td><b>${r.time}</b><small>${fmtDate(r.date)}</small></td>
              <td><span class="badge ${ST_CLASS[t.status]}">${ST_TEXT[t.status]}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  $('histFoot').textContent = `Hiển thị ${list.length} / ${all.length} phiếu · Phiếu gặp vấn đề được ghi nhận bởi Phòng CSVC và chuyển Đội ngũ Kỹ thuật.`;
}

function renderPanel() {
  const el = $('panel');
  $('layout').classList.toggle('hist', tab === 'hist');

  if (tab === 'mine') {
    const list = sortedTickets().filter(t => !t.old);
    el.innerHTML = `
      <div class="card-head"><h2>Phiếu mượn của tôi</h2><span class="count">${list.length} phiếu</span></div>
      ${tabsHtml()}
      ${list.length ? `<div class="tk-list">${list.map(ticketCard).join('')}</div>` : `
        <div class="empty-block">
          <div class="empty-ico brand">${icon('clipboard')}</div>
          <h3>Bạn chưa có phiếu mượn</h3>
          <p>Chọn thiết bị mượn thêm từ danh mục, sau đó tạo yêu cầu để nhận mã QR tại Phòng CSVC.</p>
        </div>`}
      <p class="note">${icon('qr')} Xuất trình mã QR tại Phòng CSVC để nhận và trả thiết bị. Không cần để thẻ sinh viên hoặc ghi sổ tay.</p>`;
    return;
  }

  const total = TICKETS.filter(t => t.status === 'returned' || t.status === 'issue').length;
  el.innerHTML = `
    ${tabsHtml()}
    <div class="card-head hh"><h2>Lịch sử mượn - trả</h2><span class="count">${total} phiếu</span></div>
    <div class="hist-filter">
      <div class="search-box">
        ${icon('search')}
        <input type="text" id="hSearch" placeholder="Tìm theo mã phiếu hoặc tên thiết bị" value="${hq.replace(/"/g, '&quot;')}">
        <button type="button" class="clear-x" id="histClear" hidden aria-label="Xóa">${icon('x')}</button>
      </div>
      <select id="hStatus">
        <option value="">Tất cả trạng thái</option>
        <option value="returned" ${hs === 'returned' ? 'selected' : ''}>Đã trả</option>
        <option value="issue" ${hs === 'issue' ? 'selected' : ''}>Thiết bị có vấn đề</option>
      </select>
    </div>
    <p class="muted small" id="histCount"></p>
    <div id="histBody"></div>
    <p class="note" id="histFoot"></p>`;
  renderHistResult();
}

function renderAll() { renderCatalog(); renderPanel(); }

function setTab(t) { tab = t; renderAll(); }
function setNotice(html) { $('pageNotice').innerHTML = html; }

/* =====================================================
   1. TẠO YÊU CẦU MƯỢN
   ===================================================== */
function validate(st) {
  const e = {};
  EQUIP.forEach(x => { if (cart[x.id] > STOCK[x.id]) e.stock = true; });
  if (!st.room) e.room = 'Vui lòng chọn phòng sử dụng.';
  if (!st.bd) e.bd = 'Vui lòng chọn ngày mượn.';
  if (!st.bt) e.bt = 'Vui lòng chọn giờ mượn.';
  if (!st.rd) e.rd = 'Vui lòng chọn ngày trả.';
  if (!st.rt) e.rt = 'Vui lòng chọn giờ trả.';
  if (!e.bd && !e.bt && !e.rd && !e.rt && `${st.rd}T${st.rt}` <= `${st.bd}T${st.bt}`) e.order = 'Thời gian trả phải sau thời gian mượn.';
  return e;
}

function openCreate(st) {
  st = st || { room: '', bd: TODAY, bt: '09:00', rd: TODAY, rt: '11:00', show: false };
  const items = EQUIP.filter(e => cart[e.id] > 0);
  if (!items.length) { closeModal(); renderAll(); return; }

  const e = validate(st), sh = st.show, bad = Object.keys(e).length > 0;
  const inv = k => (sh && e[k] ? 'invalid' : '');
  const err = k => (sh && e[k] ? `<p class="err">${e[k]}</p>` : '');

  const m = setModal(`
    ${mHead('Tạo yêu cầu mượn', 'Kiểm tra thiết bị và thời gian sử dụng trước khi gửi yêu cầu.')}
    <div class="m-body">
      ${sh && bad ? alertBox('err', '', 'Chưa thể gửi yêu cầu. Vui lòng kiểm tra số lượng và điền đủ thông tin bắt buộc.', 'alert') : ''}

      <div class="sel-box">
        <h4>Thiết bị đã chọn</h4>
        ${items.map(x => {
          const q = cart[x.id], over = q > STOCK[x.id];
          return `<div class="ci">
            <div class="ci-row"><div><b>${x.name}</b><small>Khả dụng: ${STOCK[x.id]}</small></div>${stepper(`data-m-dec="${x.id}"`, `data-m-inc="${x.id}"`, q, over)}</div>
            ${over ? `<p class="err">Số lượng vượt quá khả dụng. Chỉ còn ${STOCK[x.id]} ${lf(x.name)}; vui lòng chọn tối đa ${STOCK[x.id]}.</p>` : ''}
          </div>`;
        }).join('')}
      </div>

      <div class="f-group">
        <label>Phòng sử dụng *</label>
        <select id="cRoom" class="${inv('room')}">
          <option value="">Chọn phòng sử dụng</option>
          ${ROOM_OPTS.map(([v, l]) => `<option value="${v}" ${st.room === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        ${err('room')}
      </div>

      <div class="f-row">
        <div class="f-group"><label>Ngày mượn *</label><input type="date" id="cBd" value="${st.bd}" class="${inv('bd')}">${err('bd')}</div>
        <div class="f-group"><label>Giờ mượn *</label><input type="time" id="cBt" value="${st.bt}" class="${inv('bt')}">${err('bt')}</div>
      </div>
      <div class="f-row">
        <div class="f-group"><label>Ngày trả *</label><input type="date" id="cRd" value="${st.rd}" class="${inv('rd')}">${err('rd')}</div>
        <div class="f-group"><label>Giờ trả *</label><input type="time" id="cRt" value="${st.rt}" class="${inv('rt')}">${err('rt')}</div>
      </div>
      ${err('order')}
      <p class="req-note">Thời gian trả phải sau thời gian mượn. Số lượng khả dụng được kiểm tra lại khi gửi yêu cầu.</p>
    </div>
    ${mFoot(`<button type="button" class="btn btn-outline" data-close>Hủy</button>
             <button type="button" class="btn btn-primary ${bad ? 'is-disabled' : ''}" id="cSend">Gửi yêu cầu</button>`, 'wide')}
  `);

  const bind = (id, key) => m.querySelector(id).addEventListener('change', ev => { st[key] = ev.target.value; openCreate(st); });
  bind('#cRoom', 'room'); bind('#cBd', 'bd'); bind('#cBt', 'bt'); bind('#cRd', 'rd'); bind('#cRt', 'rt');

  m.querySelectorAll('[data-m-dec]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.mDec; cart[id] -= 1; if (cart[id] <= 0) delete cart[id];
    renderCatalog(); openCreate(st);
  }));
  m.querySelectorAll('[data-m-inc]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.mInc; cart[id] = Math.min((cart[id] || 0) + 1, 99);
    renderCatalog(); openCreate(st);
  }));

  const sendBtn = m.querySelector('#cSend');
  sendBtn.addEventListener('click', () => {
    if (Object.keys(validate(st)).length) { st.show = true; openCreate(st); return; }

    // Thông tin đủ -> khóa nút, hiện loading rồi lưu phiếu (mô phỏng máy chủ)
    submitWithLoading(sendBtn, () => {
      // Kiểm tra lại số lượng khả dụng tại thời điểm gửi
      if (Object.keys(validate(st)).length) { st.show = true; openCreate(st); return; }
      const code = nextCode();
      const list = EQUIP.filter(x => cart[x.id] > 0).map(x => ({ id: x.id, qty: cart[x.id] }));
      list.forEach(i => { STOCK[i.id] -= i.qty; });
      TICKETS.push({
        code, items: list, room: st.room,
        b: { date: st.bd, time: st.bt }, d: { date: st.rd, time: st.rt },
        status: 'wait', created: '08:30', cd: TODAY
      });
      Object.keys(cart).forEach(k => delete cart[k]);
      tab = 'mine'; hl = code;
      setNotice(alertBox('ok', '', `Tạo yêu cầu thành công. Đã kiểm tra số lượng khả dụng, lưu phiếu #${code} và tạo mã QR.`, 'check'));
      renderAll();
      openQR(code, true);
    });
  });
}

/* =====================================================
   2. MÃ QR (mẫu, không mã hóa dữ liệu thật)
   ===================================================== */
function qrSvg(seed) {
  const N = 25;
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
  const m = Array.from({ length: N }, () => Array.from({ length: N }, () => (rnd() < 0.5 ? 1 : 0)));
  const finder = (ox, oy) => {
    for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) {
      const X = ox + x, Y = oy + y;
      if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
      const inside = x >= 0 && x <= 6 && y >= 0 && y <= 6;
      const edge = x === 0 || x === 6 || y === 0 || y === 6;
      const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      m[Y][X] = inside && (edge || core) ? 1 : 0;
    }
  };
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
  let rects = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (m[y][x]) rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  return `<svg viewBox="0 0 ${N} ${N}" class="qr-svg" shape-rendering="crispEdges" fill="#1f2430">${rects}</svg>`;
}

function openQR(code, fresh) {
  const t = getTicket(code);
  const m = setModal(`
    ${mHead('Mã QR của phiếu mượn')}
    <div class="m-body">
      ${fresh ? alertBox('ok', '', `Tạo yêu cầu thành công · Phiếu #${t.code} đã được lưu.`, 'check') : ''}
      <div class="qr-wrap">
        <span class="badge ${ST_CLASS[t.status]}">${ST_TEXT[t.status]}</span>
        <div class="qr-box">${qrSvg(t.code)}</div>
        <h3 class="qr-code">#${t.code}</h3>
        <small class="muted">Mã QR minh họa</small>
      </div>
      <div class="qr-info">
        <b>${itemsLine(t.items)}</b>
        <p>Phòng sử dụng: ${t.room}</p>
        <p class="muted">Mượn: ${fmtDT(t.b)}</p>
        <p class="muted">Trả dự kiến: ${fmtDT(t.d)}</p>
      </div>
      <p class="qr-hint">Đến Phòng CSVC và xuất trình mã QR để nhận thiết bị</p>
      <button type="button" class="btn btn-primary btn-block" id="qSave">${icon('download')} Lưu ảnh QR</button>
      <p class="muted small" style="margin-top:12px">Minh họa giao diện tĩnh: nút lưu ảnh không tải tệp. Có thể xem lại mã QR trong chi tiết phiếu.</p>
    </div>
  `);
  m.querySelector('#qSave').addEventListener('click', () => showToast('Đã lưu ảnh QR (minh họa)'));
}

/* =====================================================
   3. CHI TIẾT PHIẾU MƯỢN
   ===================================================== */
function ticketTimeline(t) {
  const created = `${t.created || '08:00'} · ${fmtDate(t.cd || t.b.date)}`;
  const step = (done, title, sub) =>
    `<li class="${done ? 'done' : 'todo'}"><span class="dot">${done ? icon('check') : ''}</span><div><b>${title}</b><small>${sub}</small></div></li>`;
  const got = t.status !== 'wait';
  const back = t.status === 'returned' || t.status === 'issue';
  let s = step(true, 'Đã tạo phiếu', created);
  s += got ? step(true, 'Đã nhận thiết bị', `${t.handed || '08:55'} · ${fmtDate(t.b.date)}`)
           : step(false, 'Đã nhận thiết bị', 'Chờ CSVC quét QR bàn giao');
  s += back ? step(true, 'Đã trả', `${fmtDT(t.ret || t.d)} · ${t.status === 'returned' ? 'Đủ thiết bị, bình thường' : 'Có thiết bị gặp vấn đề'}`)
            : step(false, 'Đã trả', `Dự kiến ${fmtDT(t.d)}`);
  return `<h4 class="sec">Tiến trình phiếu</h4><ol class="tl tl-brand">${s}</ol>`;
}

const availBox = note => `
  <div class="avail">
    <h4>Khả dụng sau trạng thái này</h4>
    <div class="cells">${EQUIP.map(e => `<div class="cell"><small>${e.short}</small><b>${STOCK[e.id]}</b></div>`).join('')}</div>
    <p class="muted small">${note}</p>
  </div>`;

function openDetail(code) {
  const t = getTicket(code);
  let body = `<div class="dt-top"><h3>#${t.code}</h3><span class="badge ${ST_CLASS[t.status]}">${ST_TEXT[t.status]}</span></div>`;
  if (t.status === 'borrowed') {
    body += `<div class="hand"><span class="badge blue">Đã bàn giao</span><small>CSVC đã quét QR lúc ${t.handed || '08:55'} · ${fmtDate(t.b.date)}</small></div>`;
  }
  body += `
    <div class="sum">
      <h4>Thiết bị trong phiếu</h4>
      ${t.items.map(i => `<div class="it"><span>${eq(i.id).name}</span><b>× ${i.qty}</b></div>`).join('')}
    </div>
    <p class="dt-room">Phòng sử dụng: ${t.room}</p>
    <p class="dt-line">Mượn: ${fmtDT(t.b)}</p>
    <p class="dt-line">Trả dự kiến: ${fmtDT(t.d)}</p>
    <p class="muted small">Người mượn: Nguyễn Đình Thuần · SV Khoa CNTT</p>
    ${ticketTimeline(t)}`;

  if (t.status === 'wait') body += `<div class="alert info lg">${icon('box')}<div>Thiết bị đã được chuẩn bị sẵn tại Phòng CSVC</div></div>`;
  if (t.status === 'returned') {
    body += alertBox('ok', '', 'Trả thiết bị thành công. Phiếu đã được chuyển vào Lịch sử mượn - trả.', 'check');
    body += availBox(`Đã hoàn lại ${itemsPhrase(t.items)} vào số lượng khả dụng.`);
  }
  if (t.status === 'issue') {
    const bad = t.items[t.items.length - 1], ok = t.items.slice(0, -1);
    body += alertBox('err', '', 'Phòng CSVC đã tạo phiếu sự cố chuyển Đội ngũ Kỹ thuật', 'alert');
    body += `<p class="issue-text">${eq(bad.id).name} × ${bad.qty} được Phòng CSVC ghi nhận gặp sự cố khi trả. Thiết bị này chưa khả dụng cho đến khi được xử lý${ok.length ? `; ${itemsPhrase(ok)} đã trả bình thường` : ''}.</p>`;
    body += availBox(`${eq(bad.id).name} gặp vấn đề không được cộng lại vào số lượng có thể mượn.`);
  }

  let foot = '';
  if (t.status === 'wait') foot = `<button type="button" class="btn btn-outline btn-block" data-qr-open>${icon('qr')} Mở lại mã QR</button>
                                   <button type="button" class="btn btn-outline btn-block" id="dHand">Giả lập Phòng CSVC quét QR bàn giao</button>`;
  if (t.status === 'borrowed') foot = `<button type="button" class="btn btn-outline btn-block" data-qr-open>${icon('qr')} Mở lại mã QR</button>
                                       <button type="button" class="btn btn-outline btn-block" id="dRet">Giả lập Phòng CSVC quét QR nhận trả</button>`;

  const m = setModal(`${mHead('Chi tiết phiếu mượn')}<div class="m-body">${body}${foot ? `<div class="dt-actions">${foot}</div>` : ''}
    <p class="muted small" style="margin-top:12px">Nhận và trả trực tiếp tại Phòng CSVC bằng QR.</p></div>`, 'drawer');

  const on = (sel, fn) => { const el = m.querySelector(sel); if (el) el.addEventListener('click', fn); };
  on('[data-qr-open]', () => openQR(t.code, false));
  on('#dHand', () => {
    t.status = 'borrowed'; t.handed = '08:55';
    renderAll(); openDetail(t.code);
  });
  on('#dRet', () => openReturnSim(t.code));
}

/* =====================================================
   4. GIẢ LẬP PHÒNG CSVC NHẬN TRẢ (2 kết quả thay thế nhau)
   ===================================================== */
function openReturnSim(code) {
  const t = getTicket(code);
  const m = setModal(`
    ${mHead('Giả lập Phòng CSVC nhận trả', `#${t.code} · ${fmtDate(t.d.date)} lúc ${t.d.time}`)}
    <div class="m-body">
      ${alertBox('brand', '', `Từ trạng thái Đang mượn: ${itemsPhrase(t.items)}. Khả dụng trước trả: ${stockLine()}.`)}
      <p class="muted small">Chọn một trong hai kết quả thay thế nhau. Chức năng chỉ dùng để minh họa luồng.</p>
    </div>
    ${mFoot(`<button type="button" class="btn btn-outline" id="rBad">Có vấn đề · Hub chưa thể mượn lại</button><button type="button" class="btn btn-primary" id="rOk">Trả bình thường</button>`, 'col')}
  `);
  // nhãn nút "có vấn đề" theo thiết bị cuối của phiếu
  m.querySelector('#rBad').textContent = `Có vấn đề · ${eq(t.items[t.items.length - 1].id).name} chưa thể mượn lại`;

  m.querySelector('#rOk').addEventListener('click', () => {
    t.items.forEach(i => { STOCK[i.id] += i.qty; });
    t.status = 'returned'; t.ret = { ...t.d };
    lastReturned = t.code; hq = ''; hs = '';
    tab = 'hist';
    setNotice(alertBox('ok', '', `Trả thiết bị thành công. Đã hoàn lại ${itemsPhrase(t.items)} vào số lượng khả dụng.`, 'check'));
    renderAll(); openDetail(t.code);
  });
  m.querySelector('#rBad').addEventListener('click', () => {
    const bad = t.items[t.items.length - 1];
    t.items.slice(0, -1).forEach(i => { STOCK[i.id] += i.qty; });
    t.status = 'issue'; t.ret = { ...t.d };
    lastReturned = t.code; hq = ''; hs = '';
    tab = 'hist';
    setNotice(alertBox('err', '', `Trả thiết bị có vấn đề. Phiếu #${t.code} đã chuyển Đội ngũ Kỹ thuật; ${lf(eq(bad.id).name)} chưa được cộng lại vào số lượng khả dụng.`, 'alert'));
    renderAll(); openDetail(t.code);
  });
}

/* =====================================================
   KHỞI TẠO
   ===================================================== */
function initUA2() {
  $('dateChip').innerHTML = `${icon('calendar')} Thứ Hai, 26/10/2026`;
  $('pageAlert').innerHTML = alertBox('brand', '', 'Chỉ mượn thiết bị mượn thêm. Thiết bị có sẵn trong phòng (máy chiếu, màn chiếu, máy lạnh...) không cần đăng ký. Nhận và trả trực tiếp tại Phòng CSVC bằng mã QR, không cần để thẻ sinh viên.');

  const fr = document.querySelector('.footer-inner span:last-child');
  if (fr) fr.textContent = 'Nhận và trả thiết bị trực tiếp tại Phòng CSVC';

  renderAll();

  // Danh mục + phiếu đang chọn
  $('catalog').addEventListener('click', e => {
    const g = sel => e.target.closest(sel);
    let b;
    if ((b = g('[data-card-dec]'))) { const id = b.dataset.cardDec; cardQty[id] = Math.max(1, cardQty[id] - 1); renderCatalog(); }
    else if ((b = g('[data-card-inc]'))) { const id = b.dataset.cardInc; cardQty[id] = Math.min(STOCK[id], cardQty[id] + 1); renderCatalog(); }
    else if ((b = g('[data-add]'))) {
      const id = b.dataset.add, q = cardQty[id];
      if (!q) return;
      cart[id] = (cart[id] || 0) + q;
      renderCatalog();
      showToast(`Đã thêm ${eq(id).name} × ${q} vào phiếu mượn`);
    }
    else if ((b = g('[data-cart-dec]'))) { const id = b.dataset.cartDec; cart[id] -= 1; if (cart[id] <= 0) delete cart[id]; renderCatalog(); }
    else if ((b = g('[data-cart-inc]'))) { const id = b.dataset.cartInc; cart[id] = Math.min(cart[id] + 1, 99); renderCatalog(); }
    else if (g('[data-create]')) openCreate();
  });

  // Cột phải
  $('panel').addEventListener('click', e => {
    const tb = e.target.closest('[data-tab]'), d = e.target.closest('[data-detail]'),
          q = e.target.closest('[data-qr]'), r = e.target.closest('[data-hreset]');
    if (tb) { setNotice(''); setTab(tb.dataset.tab); }
    if (d) openDetail(d.dataset.detail);
    if (q) openQR(q.dataset.qr, false);
    if (r) { hq = ''; hs = ''; renderPanel(); }
    if (e.target.closest('#histClear')) { hq = ''; $('hSearch').value = ''; renderHistResult(); $('hSearch').focus(); }
  });
  $('panel').addEventListener('input', e => { if (e.target.id === 'hSearch') { hq = e.target.value; renderHistResult(); } });
  $('panel').addEventListener('change', e => { if (e.target.id === 'hStatus') { hs = e.target.value; renderHistResult(); } });
}

document.addEventListener('DOMContentLoaded', initUA2);
