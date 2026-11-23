/* js/ua1.js — Logic chính trang Tiếp nhận & xử lý sự cố (UA1 - Đội ngũ Kỹ thuật) */

Object.assign(TECH_ICONS, {
  building: '<path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>'
});
 
/* ===== Dữ liệu mẫu phiếu báo sự cố (Khớp schema với ua1-modals.js) ===== */
const ASSIGNED_CAMPUS = 'Cơ sở chính'; // Quy tắc BR1: chỉ hiển thị phiếu thuộc cơ sở phụ trách

const TICKETS = [
  {
    id: 'SC-204',
    room: 'A.04-02',
    building: 'Tòa A',
    campus: 'Cơ sở chính',
    deviceName: 'Máy chiếu Epson EB-X51',
    assetCode: 'VLU-MC-102',
    description: 'Máy chiếu bật không lên hình, đèn báo nguồn nhấp nháy đỏ giữa ca học.',
    reporter: 'GV. Lê Gia Hiếu',
    createdAt: '09:45 · Hôm nay',
    slaMinutesLeft: 7,
    status: 'pending',
    priority: 'urgent',
    planNote: '',
    lastMaintenance: '10/09/2026 – Vệ sinh lưới lọc bụi định kỳ',
    deviceLocked: false,
    acceptProof: null,
    resolvedAt: null
  },
  {
    id: 'SC-203',
    room: 'B.02-05',
    building: 'Tòa B',
    campus: 'Cơ sở chính',
    deviceName: 'Bộ Micro không dây Shure BLX288',
    assetCode: 'VLU-AT-209',
    description: 'Micro cầm tay số 1 mất sóng liên tục dù đã thay pin mới.',
    reporter: 'SV. Nguyễn Đình Thuần',
    createdAt: '08:50 · Hôm nay',
    slaMinutesLeft: null,
    status: 'processing',
    priority: 'medium',
    planNote: 'Đang kiểm tra bộ thu sóng tại tủ kỹ thuật phòng B.02-05',
    lastMaintenance: '22/08/2026 – Thay đầu chụp micro',
    deviceLocked: false,
    acceptProof: null,
    resolvedAt: null
  },
  {
    id: 'SC-202',
    room: 'Lab CNTT 02',
    building: 'Khu Lab',
    campus: 'Cơ sở chính',
    deviceName: 'Switch mạng Cisco 24-Port',
    assetCode: 'VLU-NW-014',
    description: 'Mất kết nối mạng LAN toàn bộ dãy máy thực hành số 2.',
    reporter: 'GV. Trần Minh Tâm',
    createdAt: '08:15 · Hôm nay',
    slaMinutesLeft: null,
    status: 'waiting_parts',
    priority: 'urgent',
    planNote: 'Hỏng nguồn bo mạch chính, đã khóa mượn và đề xuất cấp Switch dự phòng',
    lastMaintenance: '05/05/2026 – Kiểm tra port RJ45',
    deviceLocked: true,
    acceptProof: null,
    resolvedAt: null
  },
  {
    id: 'SC-201',
    room: 'A.02-08',
    building: 'Tòa A',
    campus: 'Cơ sở chính',
    deviceName: 'Màn hình tương tác 75 inch',
    assetCode: 'VLU-TV-088',
    description: 'Cảm ứng lệch điểm chạm ở góc phải màn hình.',
    reporter: 'Phòng CSVC',
    createdAt: '07:40 · Hôm nay',
    slaMinutesLeft: null,
    status: 'resolved',
    priority: 'low',
    planNote: 'Đã hiệu chỉnh lại tọa độ cảm ứng và cập nhật driver',
    lastMaintenance: 'Hôm nay – Hiệu chỉnh cảm ứng màn hình',
    deviceLocked: false,
    acceptProof: 'nghiem-thu-A0208.jpg',
    resolvedAt: '08:25 · Hôm nay'
  },
  {
    id: 'SC-199',
    room: 'C.03-01',
    building: 'Tòa C',
    campus: 'Cơ sở 1',
    deviceName: 'Loa treo tường JBL',
    assetCode: 'VLU-AT-051',
    description: 'Loa rè khi mở âm lượng trên 60%.',
    reporter: 'SV. Trần Khánh Hưng',
    createdAt: 'Hôm qua',
    slaMinutesLeft: null,
    status: 'pending',
    priority: 'low',
    planNote: '',
    lastMaintenance: '',
    deviceLocked: false,
    acceptProof: null,
    resolvedAt: null
  }
];

const TECH_NOTIFS = [
  { id: 'N1', ticketId: 'SC-204', title: 'Sự cố khẩn cấp tại A.04-02', desc: 'Máy chiếu không lên hình · Còn 7 phút phản hồi (BR2)', time: '2 phút trước', unread: true, urgent: true },
  { id: 'N2', ticketId: 'SC-203', title: 'Phiếu mới #SC-203 · B.02-05', desc: 'SV. Nguyễn Đình Thuần báo lỗi Micro không dây', time: '35 phút trước', unread: true, urgent: false },
  { id: 'N3', ticketId: 'SC-202', title: 'Đã khóa thiết bị VLU-NW-014', desc: 'Chờ xuất Switch dự phòng cho Lab CNTT 02', time: '1 giờ trước', unread: false, urgent: false }
];

const PRI_LABELS = { urgent: 'Khẩn cấp', medium: 'Trung bình', low: 'Thấp' };
const STATUS_LABELS = {
  pending: 'Chờ tiếp nhận',
  processing: 'Đang xử lý',
  waiting_parts: 'Chờ linh kiện',
  resolved: 'Đã hoàn tất'
};

let statusFilter = 'all';
let slaDismissed = false;

const escapeHtml = (str) =>
  String(str ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/* ===== 1. Thống kê nhanh đầu trang ===== */
function renderTicketStats(scopedList) {
  const setVal = (id, num) => {
    const el = document.getElementById(id);
    if (el) el.textContent = num;
  };

  setVal('statPending', scopedList.filter((t) => t.status === 'pending').length);
  setVal('statActive', scopedList.filter((t) => t.status === 'processing' || t.status === 'waiting_parts').length);
  setVal('statUrgent', scopedList.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length);
  setVal('statDone', scopedList.filter((t) => t.status === 'resolved').length);
}

/* ===== 2. Danh sách phiếu báo sự cố (BR1, BR2, BR3) ===== */
function setStatusTab(nextStatus) {
  statusFilter = nextStatus;
  document.querySelectorAll('#ticketTabs .tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.status === nextStatus);
  });
  renderTickets();
}

function renderTickets() {
  // BR1: Chỉ lọc các phiếu thuộc cơ sở kỹ thuật viên được phân công
  const campusTickets = TICKETS.filter((t) => t.campus === ASSIGNED_CAMPUS);
  renderTicketStats(campusTickets);

  const keyword = (document.getElementById('qSearch')?.value || '').trim().toLowerCase();
  const building = document.getElementById('qBuilding')?.value || 'all';
  const priority = document.getElementById('qPriority')?.value || 'all';

  const filtered = campusTickets
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => building === 'all' || t.building === building)
    .filter((t) => priority === 'all' || t.priority === priority)
    .filter((t) => {
      if (!keyword) return true;
      const haystack = `${t.id} ${t.room} ${t.deviceName} ${t.assetCode} ${t.reporter}`.toLowerCase();
      return haystack.includes(keyword);
    })
    .sort((a, b) => {
      // Ưu tiên phiếu Chờ tiếp nhận & Khẩn cấp lên đầu danh sách
      const score = (x) => (x.status === 'pending' ? 0 : x.status === 'resolved' ? 2 : 1) * 10 + (x.priority === 'urgent' ? 0 : 1);
      return score(a) - score(b);
    });

  const countEl = document.getElementById('ticketCount');
  if (countEl) countEl.textContent = `${filtered.length} / ${campusTickets.length} phiếu (${ASSIGNED_CAMPUS})`;

  const listBox = document.getElementById('ticketList');
  if (!listBox) return;

  if (!filtered.length) {
    listBox.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${renderIcon('wrench')}</div>
        <h3>Không có phiếu sự cố phù hợp</h3>
        <p>Thử đổi bộ lọc tòa nhà, mức độ ưu tiên hoặc từ khóa mã thiết bị.</p>
      </div>`;
    return;
  }

  listBox.innerHTML = filtered
    .map((t) => {
      const isUrgentPending = t.priority === 'urgent' && t.status === 'pending';
      const primaryBtn =
        t.status === 'pending'
          ? `<button type="button" class="btn btn-primary btn-sm" data-triage="${t.id}">Tiếp nhận ngay</button>`
          : `<button type="button" class="btn btn-outline btn-sm" data-drawer="${t.id}">Chi tiết &amp; Xử lý</button>`;

      return `
        <article class="ticket-card ${isUrgentPending ? 'is-urgent' : ''}">
          <div class="ticket-top">
            <div class="ticket-id-group">
              <span class="ticket-code">#${escapeHtml(t.id)}</span>
              <span class="badge pri-${t.priority}">${PRI_LABELS[t.priority]}</span>
              ${t.deviceLocked ? `<span class="badge locked">${renderIcon('lock')} Đã khóa mượn (BR3)</span>` : ''}
            </div>
            <span class="badge st-${t.status}">${STATUS_LABELS[t.status]}</span>
          </div>

          <div class="ticket-main">
            <div>
              <h3>Phòng ${escapeHtml(t.room)} · ${escapeHtml(t.deviceName)} <code>${escapeHtml(t.assetCode)}</code></h3>
              <p class="ticket-desc">${escapeHtml(t.description)}</p>
            </div>
            <div class="ticket-actions">
              ${primaryBtn}
            </div>
          </div>

          <div class="ticket-meta">
            <span>${renderIcon('building')} ${escapeHtml(t.building)} (${escapeHtml(t.campus)})</span>
            <span>${renderIcon('clock')} ${escapeHtml(t.createdAt)} · Báo bởi: ${escapeHtml(t.reporter)}</span>
            ${
              isUrgentPending && t.slaMinutesLeft
                ? `<span class="sla-warn">${renderIcon('bolt')} Cần phản hồi trong ${t.slaMinutesLeft} phút (BR2)</span>`
                : ''
            }
          </div>

          ${t.planNote ? `<div class="ticket-note"><b>Tiến độ:</b> ${escapeHtml(t.planNote)}</div>` : ''}
        </article>`;
    })
    .join('');

  renderSlaBanner();
}

/* ===== 3. Cảnh báo SLA 15 phút cho ca Khẩn cấp (BR2) ===== */
function renderSlaBanner() {
  const holder = document.getElementById('slaAlert');
  if (!holder) return;

  const urgentTicket = TICKETS.find(
    (t) => t.campus === ASSIGNED_CAMPUS && t.priority === 'urgent' && t.status === 'pending'
  );

  if (!urgentTicket || slaDismissed) {
    holder.innerHTML = '';
    return;
  }

  holder.innerHTML = `
    <div class="sla-banner" role="alert">
      <div class="sla-ico">${renderIcon('bolt')}</div>
      <div class="sla-copy">
        <b>Cảnh báo khẩn cấp (BR2): Phòng ${escapeHtml(urgentTicket.room)} đang có tiết học</b>
        <p>#${escapeHtml(urgentTicket.id)} · ${escapeHtml(urgentTicket.deviceName)} (${escapeHtml(urgentTicket.assetCode)}) cần tiếp nhận trong vòng 15 phút.</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm" data-quick-triage="${urgentTicket.id}">Tiếp nhận</button>
      <button type="button" class="sla-close" data-sla-dismiss aria-label="Ẩn cảnh báo">${renderIcon('x')}</button>
    </div>`;
}

/* ===== 4. Bảng thông báo gắn vào chuông trên Header ===== */
function renderBellPopover() {
  const panel = document.getElementById('techNotifPanel');
  if (!panel) return;

  const unreadCount = TECH_NOTIFS.filter((n) => n.unread).length;
  const badge = document.querySelector('.vlu-topbar .notif-count');
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount ? 'inline-block' : 'none';
  }

  const listHtml = TECH_NOTIFS.map(
    (n) => `
      <div class="np-item ${n.unread ? 'unread' : ''} ${n.urgent ? 'urgent' : ''}" data-open-ticket="${n.ticketId}">
        <div class="np-ico">${renderIcon(n.urgent ? 'bolt' : 'bell')}</div>
        <div class="np-body">
          <b>${escapeHtml(n.title)}</b>
          <p>${escapeHtml(n.desc)}</p>
          <small>${escapeHtml(n.time)}</small>
        </div>
      </div>`
  ).join('');

  panel.innerHTML = `
    <div class="np-head">
      <strong>Thông báo sự cố kỹ thuật</strong>
      ${unreadCount ? `<span class="np-badge">${unreadCount} mới</span>` : ''}
    </div>
    <div class="np-list">${listHtml || '<div class="np-empty">Không có thông báo mới.</div>'}</div>`;
}

function initHeaderBell() {
  const bellBtn = document.querySelector('.vlu-topbar .notif-trigger');
  const actionsWrap = document.querySelector('.vlu-topbar .topbar-actions');
  if (!bellBtn || !actionsWrap) return;

  actionsWrap.style.position = 'relative';

  const panel = document.createElement('div');
  panel.id = 'techNotifPanel';
  panel.className = 'notif-popover';
  panel.hidden = true;
  actionsWrap.appendChild(panel);
  renderBellPopover();

  bellBtn.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    panel.hidden = !panel.hidden;
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== bellBtn) panel.hidden = true;
  });

  panel.addEventListener('click', (e) => {
    const item = e.target.closest('[data-open-ticket]');
    if (!item) return;

    const found = TECH_NOTIFS.find((x) => x.ticketId === item.dataset.openTicket);
    if (found) found.unread = false;
    panel.hidden = true;
    renderBellPopover();
    if (typeof openTicketDrawer === 'function') openTicketDrawer(item.dataset.openTicket);
  });
}

/* ===== 5. Khởi tạo trang UA1 ===== */
function initUA1() {
  renderTickets();

  document.getElementById('ticketTabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) setStatusTab(tab.dataset.status);
  });

  document.getElementById('filterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    renderTickets();
  });

  ['qSearch', 'qBuilding', 'qPriority'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(id === 'qSearch' ? 'input' : 'change', renderTickets);
  });

  document.getElementById('ticketList')?.addEventListener('click', (e) => {
    const triageBtn = e.target.closest('[data-triage]');
    if (triageBtn && typeof openTriageModal === 'function') {
      openTriageModal(triageBtn.dataset.triage);
      return;
    }

    const drawerBtn = e.target.closest('[data-drawer]');
    if (drawerBtn && typeof openTicketDrawer === 'function') {
      openTicketDrawer(drawerBtn.dataset.drawer);
    }
  });

  document.getElementById('slaAlert')?.addEventListener('click', (e) => {
    if (e.target.closest('[data-sla-dismiss]')) {
      slaDismissed = true;
      renderSlaBanner();
      return;
    }
    const quickBtn = e.target.closest('[data-quick-triage]');
    if (quickBtn && typeof openTriageModal === 'function') {
      openTriageModal(quickBtn.dataset.quickTriage);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initUA1();
  if (typeof appLayoutReady !== 'undefined') {
    appLayoutReady.then(initHeaderBell);
  }
});
