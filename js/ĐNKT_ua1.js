/* Đội ngũ kỹ thuật· Logic quản lý danh sách & xử lý sự cố kỹ thuật theo cơ sở VLU */

Object.assign(ICONS, {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'
});

/* ===== Dữ liệu mẫu phiếu sự cố VLU (Cơ sở phân công: CS3 - BR1) ===== */
const ASSIGNED_CAMPUS = 'CS3';

const TICKETS = [
  {
    code: 'SC-104', campus: 'CS3', building: 'A', room: 'A.0502',
    assetId: 'TB-MC-A0502', assetName: 'Máy chiếu Epson EB-X51',
    title: 'Máy chiếu không nhận tín hiệu HDMI',
    desc: 'Đèn Temp nhấp nháy đỏ, lớp học bù 90 SV đang diễn ra (tiết 2-3).',
    reporter: 'ThS. Lê Gia Hiếu (GV CNTT)', createdAt: '24/11/2026 · 09:05',
    priority: 'urgent', status: 'pending', slaLeft: '09 phút 42 giây',
    history: [{ date: '12/09/2026', type: 'Bảo trì định kỳ', content: 'Vệ sinh lưới lọc bụi (1.850 giờ)' }],
    logs: [{ time: '09:05', text: 'Tiếp nhận phiếu báo hỏng từ cổng Giảng viên' }]
  },
  {
    code: 'SC-103', campus: 'CS3', building: 'LV', room: 'LV.0401',
    assetId: 'TB-PC-LV04', assetName: 'Cụm Switch mạng Cisco 24-Port',
    title: 'Mất kết nối mạng LAN dãy máy thực hành số 2',
    desc: '15 máy trạm phòng Lab không truy cập được Internet nội bộ.',
    reporter: 'Nguyễn Dương Quốc Bảo (KTV)', createdAt: '24/11/2026 · 08:50',
    priority: 'medium', status: 'pending', slaLeft: 'Trong ca sáng',
    history: [],
    logs: [{ time: '08:50', text: 'Hệ thống giám sát hạ tầng tạo phiếu tự động' }]
  },
  {
    code: 'SC-101', campus: 'CS3', building: 'G', room: 'G.0201',
    assetId: 'TB-AT-G0201', assetName: 'Bộ micro không dây Shure',
    title: 'Micro cầm tay số 2 bị rè và ngắt tiếng',
    desc: 'Âm thanh chập chờn khi di chuyển cách bục phát biểu hơn 5m.',
    reporter: 'Nguyễn Đình Thuần (CLB Cờ vua)', createdAt: '24/11/2026 · 08:10',
    priority: 'medium', status: 'processing', slaLeft: 'Đang xử lý',
    history: [{ date: '04/10/2026', type: 'Xử lý sự cố', content: 'Thay bộ pin sạc và đồng bộ tần số' }],
    logs: [
      { time: '08:10', text: 'Tiếp nhận phiếu báo sự cố' },
      { time: '08:18', text: 'Đã tiếp nhận xử lý (Mức độ: Trung bình)' }
    ]
  },
  {
    code: 'SC-098', campus: 'CS3', building: 'H', room: 'H.0304',
    assetId: 'TB-MH-H0304', assetName: 'Màn hình tương tác 75 inch',
    title: 'Hỏng bo nguồn màn hình tương tác',
    desc: 'Màn hình không lên nguồn, đã khóa mượn thiết bị theo BR3.',
    reporter: 'Phòng CSVC', createdAt: '23/11/2026 · 15:20',
    priority: 'low', status: 'locked', deviceLocked: true, slaLeft: 'Chờ bảo hành',
    history: [],
    logs: [
      { time: '15:20', text: 'Tiếp nhận phiếu báo hỏng' },
      { time: '15:45', text: 'Khóa TB-MH-H0304 (Cháy bo nguồn) · Lập phiếu bảo hành ngoài' }
    ]
  },
  {
    code: 'SC-095', campus: 'CS3', building: 'A', room: 'A.0301',
    assetId: 'TB-DH-A0301', assetName: 'Máy điều hòa Daikin 2.5HP',
    title: 'Điều hòa chảy nước dàn lạnh',
    desc: 'Đã thông ống thoát nước ngưng và vệ sinh lưới lọc.',
    reporter: 'ThS. Lê Gia Hiếu', createdAt: '23/11/2026 · 10:00',
    priority: 'low', status: 'closed', slaLeft: 'Hoàn tất',
    history: [],
    logs: [{ time: '11:05', text: 'Nghiệm thu hoàn tất (bien_ban_A0301.jpg) → Sẵn sàng sử dụng' }]
  }
];

const NOTIFS = [
  { code: 'SC-104', title: 'Sự cố KHẨN CẤP #SC-104 (Phòng A.0502)', desc: 'Lớp đang có tiết · Còn 09p42s phản hồi SLA', time: 'Vừa xong', unread: true },
  { code: 'SC-103', title: 'Phiếu sự cố mới #SC-103 (Phòng LV.0401)', desc: 'Mất kết nối mạng LAN phòng Lab', time: '15 phút trước', unread: true }
];

const PRIO_TEXT  = { urgent: 'Khẩn cấp', medium: 'Trung bình', low: 'Thấp' };
const PRIO_CLASS = { urgent: 'rejected', medium: 'soon', low: 'pending' };
const STATUS_TEXT  = { pending: 'Chờ tiếp nhận', processing: 'Đang xử lý', locked: 'Khóa bảo trì (BR3)', closed: 'Đã nghiệm thu' };
const STATUS_CLASS = { pending: 'pending', processing: 'soon', locked: 'rejected', closed: 'ok' };

let currentStatusFilter = 'all';
let reminderDismissed = false;

/* ===== Tiện ích dùng chung ===== */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function alertBox(kind, title, text, ic = 'alert') {
  return `<div class="alert ${kind}">${icon(ic)}<div>${title ? `<b>${title}</b>` : ''}${text || ''}</div></div>`;
}

/* ===== Cột trái: Danh sách phiếu sự cố theo cơ sở phụ trách (BR1, BR2) ===== */
function renderTickets() {
  const campus = document.getElementById('fCampus').value;
  const building = document.getElementById('fBuilding').value;
  const priority = document.getElementById('fPriority').value;

  const banner = document.getElementById('ticketBanner');
  banner.innerHTML = campus !== ASSIGNED_CAMPUS
    ? alertBox('warn', 'Giới hạn phân công (BR1)', `Tài khoản của bạn phụ trách trực tiếp <b>Cơ sở 3</b>. Phiếu ở ${campus} chỉ hiển thị để tham khảo.`)
    : '';

  const list = TICKETS.filter(t =>
    t.campus === campus &&
    (building === 'all' || t.building === building) &&
    (priority === 'all' || t.priority === priority) &&
    t.status !== 'closed'
  );

  document.getElementById('resCount').textContent = `${list.length} phiếu sự cố đang mở`;
  document.getElementById('slaTime').textContent = `Khu vực: ${campus}`;

  const grid = document.getElementById('ticketGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty">Không có phiếu sự cố nào khớp bộ lọc hiện tại.</div>`;
    return;
  }

  grid.innerHTML = list.map(t => `
    <article class="ticket-card ${t.priority === 'urgent' ? 'urgent' : ''}">
      <div class="ticket-top">
        <span class="badge ${PRIO_CLASS[t.priority]}">${PRIO_TEXT[t.priority]}</span>
        <span class="ticket-code">#${t.code}</span>
      </div>
      <h3 class="ticket-title">${esc(t.title)}</h3>
      <div class="ticket-meta">${esc(t.room)} · <code>${esc(t.assetId)}</code></div>
      <p class="ticket-desc">${esc(t.desc)}</p>
      ${t.status === 'pending'
        ? `<button type="button" class="btn btn-primary" data-inspect="${t.code}">${icon('wrench')} Đánh giá &amp; Tiếp nhận</button>`
        : `<button type="button" class="btn btn-outline" data-detail="${t.code}">${icon('sliders')} Xử lý (${STATUS_TEXT[t.status]})</button>`}
    </article>
  `).join('');
}

/* ===== Cột phải: Phiếu tôi phụ trách (F76 - F78) ===== */
function setTicketFilter(f) {
  currentStatusFilter = f;
  document.querySelectorAll('#ticketTabs .tab').forEach(tab => tab.classList.toggle('active', tab.dataset.filter === f));
  renderAssigned();
}

function renderAssigned() {
  const list = currentStatusFilter === 'all'
    ? TICKETS
    : TICKETS.filter(t => t.status === currentStatusFilter);

  document.getElementById('assignedCount').textContent = `${TICKETS.length} phiếu`;
  const box = document.getElementById('assignedList');

  if (!list.length) {
    box.innerHTML = '<div class="empty">Chưa có phiếu nào ở trạng thái này.</div>';
    return;
  }

  box.innerHTML = list.map(t => `
    <article class="order ${t.status === 'locked' ? 'locked' : ''}">
      <div class="order-top">
        <span class="order-code">#${t.code} · ${esc(t.room)}</span>
        <span class="badge ${STATUS_CLASS[t.status]}">${STATUS_TEXT[t.status]}</span>
      </div>
      <div class="order-row">
        <h3>${esc(t.title)}</h3>
        <button type="button" class="detail-link" data-detail="${t.code}">Chi tiết ${icon('chevron')}</button>
      </div>
      <div class="order-meta">
        <span>${esc(t.assetId)}</span> · <span>${esc(t.createdAt)}</span>
      </div>
      ${t.priority === 'urgent' && t.status === 'pending'
        ? `<div class="order-foot"><span class="warn-text">SLA: Còn ${esc(t.slaLeft)} (BR2)</span></div>`
        : ''}
    </article>
  `).join('');
}

function showAssignedBanner(kind, title, text) {
  document.getElementById('assignedBanner').innerHTML = alertBox(kind, title, text, 'check');
}

/* ===== Thông báo chuông & Cảnh báo SLA 15 phút (BR2) ===== */
function renderNotifs() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  const unread = NOTIFS.filter(n => n.unread).length;
  const badge = document.querySelector('.bell-badge');
  if (badge) { badge.textContent = unread; badge.style.display = unread ? 'flex' : 'none'; }

  panel.innerHTML = `
    <div class="np-head">
      <h3>Thông báo sự cố</h3>
      ${unread ? `<span class="np-pill">${unread} mới</span>` : ''}
    </div>
    ${NOTIFS.map(n => `
      <div class="np-item soon">
        <div class="np-ico">${icon('alarm')}</div>
        <div class="np-main">
          <b>${esc(n.title)}</b>
          <p>${esc(n.desc)}</p>
          <small>${esc(n.time)} · <button type="button" class="link-btn" data-np-ticket="${n.code}">Mở phiếu</button></small>
        </div>
      </div>
    `).join('') || '<div class="np-empty">Không có thông báo mới.</div>'}`;
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
    const btn = e.target.closest('[data-np-ticket]');
    if (!btn) return;
    const item = NOTIFS.find(x => x.code === btn.dataset.npTicket);
    if (item) item.unread = false;
    panel.hidden = true;
    renderNotifs();
    openInspect(btn.dataset.npTicket);
  });
}

function showReminder() {
  const urgent = TICKETS.find(t => t.priority === 'urgent' && t.status === 'pending');
  if (!urgent || reminderDismissed) return;
  const box = document.getElementById('reminder');
  box.innerHTML = `
    <div class="reminder">
      <div class="rm-ico">${icon('alarm')}</div>
      <div class="rm-main">
        <b>Cảnh báo SLA 15 phút (BR2)</b>
        <p>#${urgent.code} · Phòng ${urgent.room} còn ${urgent.slaLeft}</p>
      </div>
      <button type="button" class="rm-x" data-rm-close aria-label="Đóng">${icon('x')}</button>
    </div>`;
  box.querySelector('[data-rm-close]').onclick = () => { reminderDismissed = true; box.innerHTML = ''; };
}

/* ===== Khởi tạo trang UA1 ===== */
function initUA1() {
  document.getElementById('dateChip').innerHTML = `${icon('calendar')} Thứ Ba, 24/11/2026`;
  document.getElementById('slaHint').innerHTML = `${icon('alarm')} SLA Khẩn cấp: Phản hồi ≤ 15 phút (BR2)`;
  document.getElementById('btnFilter').innerHTML = `${icon('search')} Lọc phiếu`;
  document.getElementById('noteBr').innerHTML = `${icon('info')} BR1: Chỉ tiếp nhận phiếu thuộc cơ sở được phân công. BR3: Thiết bị lỗi nặng tự động khóa mượn.`;
  document.getElementById('noteAcceptance').innerHTML = `${icon('lock')} BR4: Bắt buộc tải ảnh/biên bản nghiệm thu trước khi đóng phiếu.`;

  renderTickets();
  renderAssigned();
  setTimeout(showReminder, 800);

  document.getElementById('ticketFilterForm').addEventListener('submit', e => {
    e.preventDefault();
    renderTickets();
  });

  document.getElementById('ticketTabs').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) setTicketFilter(tab.dataset.filter);
  });

  document.getElementById('ticketGrid').addEventListener('click', e => {
    const ins = e.target.closest('[data-inspect]');
    const det = e.target.closest('[data-detail]');
    if (ins) openInspect(ins.dataset.inspect);
    if (det) openTicketDetail(det.dataset.detail);
  });

  document.getElementById('assignedList').addEventListener('click', e => {
    const det = e.target.closest('[data-detail]');
    if (det) openTicketDetail(det.dataset.detail);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initUA1();
  if (typeof layoutReady !== 'undefined') layoutReady.then(initBell);
});
