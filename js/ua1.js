/* ===== Icon bổ sung (dùng chung hàm icon() trong main.js) ===== */
Object.assign(ICONS, {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3M6 19l-2 2M18 19l2 2"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>',
  upload: '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>',
  calx: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M10 14l4 4M14 14l-4 4"/>',
  xcircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01"/><path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56z"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'
});

/* ===== Dữ liệu mock (ngày dạng yyyy-mm-dd) ===== */
const TODAY = '2026-10-26';

const ROOMS = [
  { name: 'A.301',        cap: 40,  type: 'Phòng học',  building: 'Tòa A', floor: 'Tầng 3', eq: 'Máy chiếu · Điều hòa · Bảng viết', icon: 'board' },
  { name: 'B.205',        cap: 15,  type: 'Phòng họp',  building: 'Tòa B', floor: 'Tầng 2', eq: 'Màn hình · Điều hòa · Bảng viết',  icon: 'users' },
  { name: 'Hội trường A', cap: 300, type: 'Hội trường', building: 'Tòa A', floor: 'Tầng 1', eq: 'Âm thanh · Máy chiếu · Sân khấu',  icon: 'hall' },
  { name: 'A.302',        cap: 60,  type: 'Phòng học',  building: 'Tòa A', floor: 'Tầng 3', eq: 'Máy chiếu · Điều hòa · Bảng viết', icon: 'board' },
  { name: 'C.402',        cap: 50,  type: 'Phòng học',  building: 'Tòa C', floor: 'Tầng 4', eq: 'Máy chiếu · Điều hòa · Bảng viết', icon: 'board' },
  { name: 'B.206',        cap: 20,  type: 'Phòng họp',  building: 'Tòa B', floor: 'Tầng 2', eq: 'Màn hình · Điều hòa · Mic họp',    icon: 'users' }
];

// Lịch đã có người đặt sẵn (ngoài các đơn của mình)
const BOOKED = [
  { room: 'Hội trường A', date: '2026-10-30', start: '15:00', end: '16:00' },
  { room: 'B.205',        date: '2026-10-26', start: '11:30', end: '12:30' }
];

const ORDERS = [
  { code: 'MT1024', room: 'B.205',        date: '2026-10-26', start: '10:00', end: '11:00', purpose: 'Họp nhóm đồ án CNTT',      status: 'soon' },
  { code: 'MT1025', room: 'A.301',        date: '2026-10-29', start: '09:00', end: '11:00', purpose: 'Ôn tập môn Cơ sở dữ liệu', status: 'approved' },
  { code: 'MT1026', room: 'Hội trường A', date: '2026-10-28', start: '14:00', end: '16:00', purpose: 'Sinh hoạt CLB Công nghệ',  status: 'pending', sent: '10:30', file: 'Quyet-dinh-CLB-Cong-nghe.pdf' },
  { code: 'MT1023', room: 'C.402',        date: '2026-10-27', start: '14:00', end: '16:00', purpose: 'Thảo luận bài tập nhóm',   status: 'rejected', reason: 'Phòng bảo trì thiết bị trong khung giờ đã chọn.' },
  { code: 'MT1022', room: 'A.302',        date: '2026-10-29', start: '08:00', end: '10:00', purpose: 'Sinh hoạt lớp CNTT',       status: 'pending', sent: '10:05' }
];

const NOTIFS = [
  { type: 'soon',     code: 'MT1024', time: 'Hôm nay, 10:50', unread: true },
  { type: 'approved', code: 'MT1025', time: 'Hôm nay, 09:40', unread: true },
  { type: 'rejected', code: 'MT1023', time: 'Hôm nay, 09:20', unread: false }
];

const STATUS_TEXT  = { soon: 'Sắp hết giờ', approved: 'Đã duyệt', pending: 'Chờ duyệt', rejected: 'Bị từ chối', cancelled: 'Đã hủy' };
const STATUS_CLASS = { soon: 'soon', approved: 'ok', pending: 'pending', rejected: 'rejected', cancelled: 'cancelled' };

let currentFilter = 'all';
let highlightCode = null;
let reminderDismissed = false;

/* ===== Tiện ích ===== */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate  = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };   // 2026-10-27 -> 27/10/2026
const fmtShort = iso => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;                          // 2026-10-27 -> 27/10
const toMin  = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toTime = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
const getRoom = name => ROOMS.find(r => r.name === name);
const logOf = o => ({ sent: o.sent || '09:15', review: o.review || '09:20', result: o.result || '09:40' });

function alertBox(kind, title, text, ic = 'alert') {
  return `<div class="alert ${kind}">${icon(ic)}<div>${title ? `<b>${title}</b>` : ''}${text || ''}</div></div>`;
}

// Tìm lịch trùng của 1 phòng trong khoảng giờ (bỏ qua đơn ignoreCode). Trả về lịch trùng đầu tiên hoặc null
function findConflict(room, date, start, end, ignoreCode) {
  const s = toMin(start), e = toMin(end);
  const slots = BOOKED.concat(
    ORDERS.filter(o => ['approved', 'pending', 'soon'].includes(o.status) && o.code !== ignoreCode)
  );
  return slots
    .filter(x => x.room === room && x.date === date && s < toMin(x.end) && e > toMin(x.start))
    .sort((a, b) => toMin(a.start) - toMin(b.start))[0] || null;
}

/* ===== Danh sách phòng ===== */
function renderRooms() {
  const minCap = Number(document.getElementById('fCap').value);
  const date = document.getElementById('fDate').value;
  const start = document.getElementById('fStart').value;
  const end = document.getElementById('fEnd').value;

  const list = ROOMS.filter(r => r.cap >= minCap && !findConflict(r.name, date, start, end));

  document.getElementById('resCount').textContent = `${list.length} phòng phù hợp`;
  document.getElementById('resTime').textContent = `${fmtDate(date)} · ${start} – ${end}`;

  const grid = document.getElementById('roomGrid');
  if (list.length === 0) {
    const capTxt = minCap ? `đáp ứng ${minCap} chỗ ` : '';
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${icon('door')}</div>
        <h3>Chưa có phòng phù hợp</h3>
        <p>Không có phòng còn trống ${capTxt}trong khung giờ đã chọn. Hãy giảm sức chứa hoặc chọn ngày, giờ khác.</p>
        <button type="button" class="btn btn-primary" id="btnRefilter">${icon('sliders')} Chọn lại</button>
        ${alertBox('info', 'Chỉ hiển thị phòng còn trống', 'Chọn lại để điều chỉnh ngày, giờ và sức chứa trong bộ lọc Tìm phòng.', 'info')}
      </div>`;
    return;
  }

  grid.innerHTML = list.map(r => `
    <article class="room-card">
      <div class="room-top">
        <div class="room-icon">${icon(r.icon)}</div>
        <span class="badge ok">Còn trống</span>
      </div>
      <div class="room-title">
        <h3>${r.name}</h3>
        <span class="room-cap">${icon('users')} ${r.cap} chỗ</span>
      </div>
      <div class="room-loc">${r.type} · ${r.building} · ${r.floor}</div>
      <div class="room-eq">${r.eq}</div>
      <button class="btn btn-primary" data-book="${r.name}">${icon('plus')} Đặt phòng</button>
    </article>
  `).join('');
}

/* ===== Đơn của tôi ===== */
function setOrderFilter(f) {
  currentFilter = f;
  document.querySelectorAll('#orderTabs .tab').forEach(t => t.classList.toggle('active', t.dataset.filter === f));
  renderOrders();
}

function renderOrders() {
  const list = currentFilter === 'all' ? ORDERS : ORDERS.filter(o => o.status === currentFilter);
  document.getElementById('orderCount').textContent = `${ORDERS.length} đơn`;

  const box = document.getElementById('orderList');
  if (list.length === 0) {
    box.innerHTML = '<div class="empty">Chưa có đơn nào ở trạng thái này.</div>';
    return;
  }

  box.innerHTML = list.map(o => `
    <article class="order ${o.status === 'soon' ? 'soon' : ''} ${o.code === highlightCode ? 'new' : ''}">
      <div class="order-top">
        <span class="order-code">#${o.code}</span>
        <span class="badge ${STATUS_CLASS[o.status]}">${STATUS_TEXT[o.status]}</span>
      </div>
      <div class="order-row">
        <h3>${o.room}</h3>
        <button class="detail-link" data-detail="${o.code}">Chi tiết ${icon('chevron')}</button>
      </div>
      <div class="order-meta">${icon('calendar')} ${fmtDate(o.date)} · ${o.start} – ${o.end}</div>
      <p class="order-purpose">${esc(o.purpose)}</p>
      ${o.reason ? `<p class="order-reason">Lý do: ${o.reason}</p>` : ''}
      ${o.status === 'soon' ? `
        <div class="order-foot">
          <span class="warn-text">Còn 10 phút là hết giờ</span>
        </div>` : ''}
    </article>
  `).join('');
}

function showOrderBanner(kind, title, text) {
  document.getElementById('orderBanner').innerHTML = alertBox(kind, title, text, 'check');
}

/* Từ đơn bị từ chối -> mở lại bộ lọc Tìm phòng */
function reSearchFrom(o) {
  document.getElementById('fDate').value = o.date;
  document.getElementById('fStart').value = o.start;
  document.getElementById('fEnd').value = o.end;
  const caps = [...document.querySelectorAll('#fCap option')].map(x => Number(x.value)).filter(v => v > 0 && v <= getRoom(o.room).cap);
  document.getElementById('fCap').value = caps.length ? String(Math.max(...caps)) : '0';
  renderRooms();
  document.getElementById('searchBanner').innerHTML = alertBox(
    'brand', `Chọn lại từ đơn bị từ chối #${o.code}`,
    `Bộ lọc Tìm phòng được mở lại với ${fmtDate(o.date)}, ${o.start} – ${o.end}. Bạn có thể thay đổi thời gian để tìm phòng khác.`
  );
  document.getElementById('searchCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ===== Thông báo (chuông) + nhắc nhở nổi ===== */
function dropNotif(code) {
  for (let i = NOTIFS.length - 1; i >= 0; i--) if (NOTIFS[i].code === code) NOTIFS.splice(i, 1);
}

function renderNotifs() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  const unread = NOTIFS.filter(n => n.unread).length;

  const badge = document.querySelector('.bell-badge');
  if (badge) { badge.textContent = unread; badge.style.display = unread ? 'flex' : 'none'; }

  const items = NOTIFS.map(n => {
    const o = ORDERS.find(x => x.code === n.code);
    if (!o) return '';
    if (n.type === 'soon') {
      return `
        <div class="np-item soon">
          <div class="np-ico">${icon('alarm')}</div>
          <div class="np-main">
            <b>Còn 10 phút là hết giờ</b>
            <p>${o.room} · #${o.code} · Kết thúc lúc ${o.end}</p>
            <small>${n.time}</small>
          </div>
        </div>`;
    }
    if (n.type === 'rejected') {
      return `
        <div class="np-item">
          <div class="np-ico bad">${icon('xcircle')}</div>
          <div class="np-main">
            <b>Yêu cầu #${o.code} bị từ chối</b>
            <p>${o.room} · ${fmtDate(o.date)} · ${o.start} – ${o.end}</p>
            <p class="np-reason">Lý do: ${esc(o.reason || 'Không có lý do cụ thể.')}</p>
            <small>${n.time} · <button class="link-btn" data-np-detail="${o.code}">Xem chi tiết</button></small>
          </div>
        </div>`;
    }
    return `
      <div class="np-item">
        <div class="np-ico ok">${icon('check')}</div>
        <div class="np-main">
          <b>Yêu cầu #${o.code} đã được duyệt</b>
          <p>${o.room} · ${fmtDate(o.date)} · ${o.start} – ${o.end}</p>
          <small>${n.time} · <button class="link-btn" data-np-detail="${o.code}">Xem chi tiết</button></small>
        </div>
      </div>`;
  }).join('');

  panel.innerHTML = `
    <div class="np-head">
      <h3>Thông báo</h3>
      ${unread ? `<span class="np-pill">${unread} thông báo mới</span>` : ''}
    </div>
    ${items || '<div class="np-empty">Không có thông báo nào.</div>'}`;
}

function initBell() {
  const bell = document.querySelector('.bell');
  const holder = document.querySelector('.header-inner');
  if (!bell || !holder) return;

  const panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.className = 'notif-panel';
  panel.hidden = true;
  holder.appendChild(panel);
  renderNotifs();

  bell.addEventListener('click', e => { e.stopPropagation(); panel.hidden = !panel.hidden; });
  document.addEventListener('click', e => { if (!panel.contains(e.target)) panel.hidden = true; });

  panel.addEventListener('click', e => {
    const det = e.target.closest('[data-np-detail]');
    if (det) {
      const n = NOTIFS.find(x => x.code === det.dataset.npDetail);
      if (n) n.unread = false;
      panel.hidden = true;
      renderNotifs();
      openDetail(det.dataset.npDetail);
    }
  });
}

function hideReminder() { document.getElementById('reminder').innerHTML = ''; }

function showReminder() {
  const o = ORDERS.find(x => x.status === 'soon');
  if (!o || reminderDismissed) return;
  const box = document.getElementById('reminder');
  box.innerHTML = `
    <div class="reminder">
      <div class="rm-ico">${icon('alarm')}</div>
      <div class="rm-main">
        <b>Còn 10 phút là hết giờ</b>
        <p>${o.room} · Hôm nay · Kết thúc lúc ${o.end}</p>
      </div>
      <button class="rm-x" data-rm-close aria-label="Đóng">${icon('x')}</button>
    </div>`;
  box.querySelector('[data-rm-close]').onclick = () => { reminderDismissed = true; hideReminder(); };
}

/* ===== Khởi tạo ===== */
function initUA1() {
  document.getElementById('dateChip').innerHTML = `${icon('calendar')} Thứ Hai, 26/10/2026`;
  document.getElementById('hintOk').innerHTML = `${icon('check')} Chỉ hiển thị phòng còn trống`;
  document.getElementById('btnSearch').innerHTML = `${icon('search')} Tìm phòng trống`;
  document.getElementById('noteCheck').innerHTML = `${icon('info')} Phòng trống được kiểm tra lại khi bạn gửi yêu cầu.`;
  document.getElementById('noteKey').innerHTML = `${icon('key')} Nhận và trả phòng trực tiếp tại Phòng CSVC`;

  renderRooms();
  renderOrders();
  initBell();
  setTimeout(showReminder, 1200);

  // Tìm phòng trống
  document.getElementById('searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const start = document.getElementById('fStart').value;
    const end = document.getElementById('fEnd').value;
    if (!start || !end || end <= start) {
      showToast('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }
    document.getElementById('searchBanner').innerHTML = '';
    renderRooms();
  });

  // Tab lọc đơn
  document.getElementById('orderTabs').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) setOrderFilter(tab.dataset.filter);
  });

  // Đặt phòng / Chọn lại bộ lọc
  document.getElementById('roomGrid').addEventListener('click', e => {
    const btn = e.target.closest('[data-book]');
    if (btn) openBooking(btn.dataset.book);
    if (e.target.closest('#btnRefilter')) {
      document.getElementById('searchForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('fCap').focus();
    }
  });

  // Chi tiết
  document.getElementById('orderList').addEventListener('click', e => {
    const detail = e.target.closest('[data-detail]');
    if (detail) openDetail(detail.dataset.detail);
  });
}

document.addEventListener('DOMContentLoaded', initUA1);