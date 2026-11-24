/* Đội ngũ kỹ thuật · Kế hoạch bảo trì định kỳ, khóa tạm phòng, checklist kỹ thuật & đề xuất vật tư */

Object.assign(ICONS, {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  clipboardCheck: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'
});

/* ===== Dữ liệu mẫu Bảo trì định kỳ VLU (F84 - F87, BR1 - BR3) ===== */
const CLASS_TIMETABLE = [
  { room: 'A.0502', date: '2026-11-24', slot: '07:00 - 11:30', subject: 'Kỹ thuật lấy yêu cầu (71ITSE40203)' },
  { room: 'LV.0401', date: '2026-11-24', slot: '13:00 - 17:00', subject: 'Thực hành Mạng máy tính' },
  { room: 'G.0201', date: '2026-11-25', slot: '08:00 - 11:30', subject: 'Hội thảo Khoa CNTT' }
];

const CHECKLIST_BY_TYPE = {
  'Phòng lý thuyết': [
    { id: 'proj', name: 'Máy chiếu & Màn chiếu', spec: 'Độ sáng bóng đèn, cổng tín hiệu HDMI/VGA' },
    { id: 'sound', name: 'Hệ thống âm thanh', spec: 'Micro không dây, loa treo tường, ampli' },
    { id: 'net', name: 'Mạng LAN / Wi-Fi', spec: 'Tốc độ truy cập, điểm phát sóng AP' },
    { id: 'ac', name: 'Máy lạnh & Hệ thống điện', spec: 'Nhiệt độ làm mát, ổ cắm bục giảng' }
  ],
  'Phòng Lab máy tính': [
    { id: 'pclab', name: 'Cụm máy trạm PC Lab (40 máy)', spec: 'Khởi động OS, phần mềm thực hành, chuột/phím' },
    { id: 'switch', name: 'Switch mạng & Cáp LAN', spec: 'Tín hiệu 24-Port, kết nối server nội bộ' },
    { id: 'proj', name: 'Máy chiếu trung tâm', spec: 'Hiển thị sắc nét, không báo lỗi nhiệt' },
    { id: 'ac', name: 'Hệ thống điều hòa & UPS', spec: 'Nguồn lưu điện ổn định, tản nhiệt phòng máy' }
  ],
  'Hội trường': [
    { id: 'hall_sound', name: 'Dàn âm thanh hội trường', spec: 'Mixer, 4 micro không dây, chống hú rít' },
    { id: 'led', name: 'Màn hình LED / Máy chiếu công suất lớn', spec: 'Điểm ảnh, bộ chia tín hiệu sân khấu' },
    { id: 'net', name: 'Hạ tầng Wi-Fi mật độ cao', spec: 'Chịu tải sự kiện > 300 người' },
    { id: 'light', name: 'Hệ thống chiếu sáng & Máy lạnh trung tâm', spec: 'Đèn sân khấu, làm mát toàn khu vực' }
  ]
};

const MAINT_PLANS = [
  {
    code: 'BT-204', campus: 'CS3', room: 'LV.0401', roomType: 'Phòng Lab máy tính',
    date: '2026-11-24', slot: '17:30 - 19:30', status: 'locked',
    results: { pclab: 'pass', switch: 'fix', proj: 'pass', ac: null },
    supplyNote: 'Đề xuất 05 đầu bấm mạng RJ45 và 01 dây nhảy Cat6'
  },
  {
    code: 'BT-205', campus: 'CS3', room: 'A.0502', roomType: 'Phòng lý thuyết',
    date: '2026-11-24', slot: '11:30 - 13:00', status: 'scheduled',
    results: { proj: null, sound: null, net: null, ac: null },
    supplyNote: ''
  },
  {
    code: 'BT-201', campus: 'CS3', room: 'G.0201', roomType: 'Hội trường',
    date: '2026-11-22', slot: '17:30 - 20:00', status: 'done',
    results: { hall_sound: 'pass', led: 'pass', net: 'pass', light: 'pass' },
    supplyNote: 'Đã thay 04 pin sạc AA cho micro hội trường'
  }
];

const ST_TEXT  = { scheduled: 'Sắp tới', locked: 'Đang bảo trì (BR2)', done: 'Đã hoàn thành' };
const ST_CLASS = { scheduled: 'gray', locked: 'rejected', done: 'ok' };

let leftMode = 'checklist'; // 'checklist' (F86-F87) | 'schedule' (F84)
let filterTab = 'all';
let selectedCode = 'BT-204';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
const getPlan = code => MAINT_PLANS.find(p => p.code === code);

function alertBox(kind, title, text, ic = 'alert') {
  return `<div class="alert ${kind}">${icon(ic)}<div>${title ? `<b>${title}</b>` : ''}${text || ''}</div></div>`;
}

function progressOf(p) {
  const items = CHECKLIST_BY_TYPE[p.roomType] || [];
  const done = items.filter(it => p.results[it.id]).length;
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

/* ===== Cột trái: Thực hiện Checklist (F86, F87, BR3) & Lập lịch bảo trì (F84, BR1) ===== */
function renderLeftCard() {
  const card = $('checklistCard');
  const p = getPlan(selectedCode) || MAINT_PLANS[0];

  const switcher = `
    <div class="tabs" style="margin-bottom:16px">
      <button type="button" class="tab ${leftMode === 'checklist' ? 'active' : ''}" data-lmode="checklist">1. Checklist &amp; Vật tư (F86)</button>
      <button type="button" class="tab ${leftMode === 'schedule' ? 'active' : ''}" data-lmode="schedule">2. Lập lịch bảo trì (F84)</button>
    </div>`;

  if (leftMode === 'schedule') {
    card.innerHTML = `
      <h2>Lập kế hoạch bảo trì định kỳ</h2>
      <p class="fsub">Hệ thống tự động đối chiếu thời khóa biểu chính khóa (BR1) để tránh trùng giờ giảng dạy.</p>
      ${switcher}
      <form id="scheduleForm">
        <div class="fl">
          <label for="sRoom">Phòng học / Hạ tầng cần bảo trì <span class="req">*</span></label>
          <select id="sRoom">
            <option value="A.0502|Phòng lý thuyết">Phòng A.0502 · Phòng lý thuyết (Cơ sở 3)</option>
            <option value="LV.0401|Phòng Lab máy tính">Phòng LV.0401 · Phòng Lab máy tính (Cơ sở 3)</option>
            <option value="G.0201|Hội trường">Hội trường G.0201 · Hội trường (Cơ sở 3)</option>
          </select>
        </div>
        <div class="fl-row">
          <div class="fl">
            <label for="sDate">Ngày bảo trì <span class="req">*</span></label>
            <input type="date" id="sDate" value="2026-11-24" required>
          </div>
          <div class="fl">
            <label for="sSlot">Khung giờ dự kiến <span class="req">*</span></label>
            <select id="sSlot">
              <option value="07:00 - 11:30">07:00 - 11:30 (Ca sáng - thử trùng TKB)</option>
              <option value="11:30 - 13:00" selected>11:30 - 13:00 (Giờ nghỉ trưa)</option>
              <option value="17:30 - 19:30">17:30 - 19:30 (Sau giờ học)</option>
            </select>
          </div>
        </div>
        <div id="scheduleConflict"></div>
        <button type="submit" class="btn btn-primary btn-block">Lưu kế hoạch bảo trì</button>
      </form>
      <p class="note">${icon('info')} BR2: Khi bắt đầu bảo trì, phòng học tự động chuyển trạng thái "Tạm khóa để bảo trì".</p>`;
    return;
  }

  const items = CHECKLIST_BY_TYPE[p.roomType] || [];
  const prog = progressOf(p);
  const canComplete = p.status === 'locked' && prog.done === prog.total;

  card.innerHTML = `
    <h2>Checklist bảo trì: ${esc(p.room)}</h2>
    <p class="fsub">#${p.code} · Loại phòng: <b>${esc(p.roomType)}</b> · Hoàn thành ${prog.done}/${prog.total} hạng mục (BR3)</p>
    ${switcher}

    ${p.status === 'scheduled' ? `
      <div class="alert warn">${icon('lock')}<div><b>Phòng chưa tạm khóa bảo trì</b>Bấm "Kích hoạt tạm khóa phòng (BR2)" bên dưới để chặn lượt mượn phòng phát sinh trước khi kiểm tra.</div></div>
      <button type="button" class="btn btn-primary btn-block" id="btnLockStart">Kích hoạt tạm khóa phòng &amp; Bắt đầu (BR2)</button>
    ` : `
      <div class="chk-list">
        ${items.map(it => {
          const st = p.results[it.id];
          return `
            <div class="chk-item">
              <div class="chk-info">
                <b>${esc(it.name)}</b>
                <small>${esc(it.spec)}</small>
              </div>
              <div class="chk-toggle">
                <button type="button" class="chk-btn pass ${st === 'pass' ? 'active' : ''}" data-chk="${it.id}" data-val="pass" ${p.status === 'done' ? 'disabled' : ''}>Đạt</button>
                <button type="button" class="chk-btn fix ${st === 'fix' ? 'active' : ''}" data-chk="${it.id}" data-val="fix" ${p.status === 'done' ? 'disabled' : ''}>Cần khắc phục</button>
              </div>
            </div>`;
        }).join('')}
      </div>

      <div class="supply-box">
        <h4>Đề xuất vật tư tiêu hao thay thế (F87)</h4>
        <div class="fl" style="margin-bottom:0">
          <textarea id="supplyInput" placeholder="Ghi nhận thiết bị xuống cấp & đề xuất vật tư (bóng đèn máy chiếu, pin micro, dây mạng...)" ${p.status === 'done' ? 'readonly' : ''}>${esc(p.supplyNote)}</textarea>
        </div>
      </div>

      ${p.status === 'locked'
        ? `<button type="button" class="btn btn-primary btn-block" id="btnFinishMaint" ${canComplete ? '' : 'disabled'}>
            Xác nhận hoàn thành &amp; Mở khóa phòng (PB-88)
          </button>`
        : `<div class="alert ok">${icon('check')}<div><b>Đợt bảo trì đã nghiệm thu</b>Phòng ${esc(p.room)} đã mở lại trạng thái "Hoạt động bình thường".</div></div>`}
    `}`;
}

/* ===== Cột phải: Kế hoạch bảo trì định kỳ (F85, BR2) ===== */
function renderMaintList() {
  const list = filterTab === 'all' ? MAINT_PLANS : MAINT_PLANS.filter(p => p.status === filterTab);
  $('maintCount').textContent = `${MAINT_PLANS.length} đợt bảo trì`;
  document.querySelectorAll('#maintTabs .tab').forEach(t => t.classList.toggle('active', t.dataset.filter === filterTab));

  const box = $('maintList');
  if (!list.length) {
    box.innerHTML = `<div class="empty-block"><h3>Không có lịch bảo trì</h3><p>Chưa có đợt bảo trì nào ở trạng thái này.</p></div>`;
    return;
  }

  box.innerHTML = list.map(p => {
    const prog = progressOf(p);
    return `
      <article class="maint-card ${p.status === 'locked' ? 'locked' : ''}" data-pick="${p.code}">
        <div class="maint-top">
          <span class="order-code">#${p.code} · ${esc(p.roomType)}</span>
          <span class="badge ${ST_CLASS[p.status]}">${ST_TEXT[p.status]}</span>
        </div>
        <div class="maint-title">
          <h3>Phòng ${esc(p.room)} (${esc(p.campus)})</h3>
          <button type="button" class="detail-link" data-drawer="${p.code}">Biên bản ${icon('chevron')}</button>
        </div>
        <p class="maint-meta">${fmtDate(p.date)} · Khung giờ: ${esc(p.slot)}</p>
        <div class="prog-bar"><div class="prog-fill" style="width:${prog.pct}%"></div></div>
        <div class="maint-foot">
          <span>Tiến độ Checklist: <b>${prog.done}/${prog.total}</b></span>
          <span>${p.code === selectedCode ? 'Đang chọn' : 'Nhấn để mở'}</span>
        </div>
      </article>`;
  }).join('');
}

/* ===== Ngăn chi tiết trượt từ phải: Biên bản & Phiếu vật tư (Drawer) ===== */
function openMaintDrawer(code) {
  const p = getPlan(code);
  const items = CHECKLIST_BY_TYPE[p.roomType] || [];
  $('drawerRoot').innerHTML = `
    <div class="drawer-overlay" id="dOverlay">
      <aside class="drawer" role="dialog" aria-modal="true">
        <div class="d-head">
          <div><h2>Biên bản bảo trì #${p.code}</h2><p>Phòng ${esc(p.room)} · ${esc(p.roomType)}</p></div>
          <button type="button" class="d-x" id="dClose">${icon('x')}</button>
        </div>
        <div class="d-body">
          <span class="badge ${ST_CLASS[p.status]}">${ST_TEXT[p.status]}</span>
          <h4 class="d-sec">Kết quả kiểm tra Checklist (BR3)</h4>
          ${items.map(it => {
            const val = p.results[it.id];
            const lbl = val === 'pass' ? 'Đạt chuẩn' : val === 'fix' ? 'Cần khắc phục' : 'Chưa kiểm tra';
            return `<div class="d-note"><b>${esc(it.name)}</b><p>Trạng thái: ${lbl}</p></div>`;
          }).join('')}
          <h4 class="d-sec">Phiếu đề xuất vật tư tiêu hao (F87)</h4>
          <div class="d-note"><p>${esc(p.supplyNote || 'Không phát sinh vật tư thay thế.')}</p></div>
        </div>
      </aside>
    </div>`;
  document.body.classList.add('no-scroll');
  $('dClose').onclick = () => { $('drawerRoot').innerHTML = ''; document.body.classList.remove('no-scroll'); };
  $('dOverlay').addEventListener('mousedown', e => { if (e.target.id === 'dOverlay') $('dClose').click(); });
}

function renderAll() { renderLeftCard(); renderMaintList(); }

/* ===== Khởi tạo trang UA3 ===== */
function initUA3() {
  $('dateChip').innerHTML = `${icon('calendar')} Thứ Ba, 24/11/2026`;
  $('pageAlert').innerHTML = alertBox('brand', 'Quy định bảo trì định kỳ (BR1 – BR3)', 'Lịch bảo trì phải tránh trùng thời khóa biểu chính khóa (BR1). Phòng đang bảo trì tự động khóa đặt phòng (BR2) và bắt buộc hoàn tất 100% Checklist trước khi mở lại (BR3).');
  $('noteMaint').innerHTML = `${icon('clipboardCheck')} Phiếu đề xuất vật tư sau bảo trì được chuyển tự động về Phòng Cơ sở vật chất.`;

  renderAll();

  $('checklistCard').addEventListener('click', e => {
    const modeBtn = e.target.closest('[data-lmode]');
    if (modeBtn) { leftMode = modeBtn.dataset.lmode; renderLeftCard(); return; }

    const p = getPlan(selectedCode);
    if (e.target.closest('#btnLockStart')) {
      p.status = 'locked';
      $('pageNotice').innerHTML = alertBox('warn', `Đã tạm khóa Phòng ${p.room} (BR2)`, 'Hệ thống đã chặn toàn bộ lượt đăng ký mượn phòng trong khung giờ bảo trì.');
      renderAll();
    }

    const chkBtn = e.target.closest('[data-chk]');
    if (chkBtn && p.status === 'locked') {
      p.results[chkBtn.dataset.chk] = chkBtn.dataset.val;
      p.supplyNote = $('supplyInput')?.value || p.supplyNote;
      renderAll();
    }

    if (e.target.closest('#btnFinishMaint')) {
      p.supplyNote = ($('supplyInput')?.value || '').trim();
      p.status = 'done';
      $('pageNotice').innerHTML = alertBox('ok', `Hoàn tất bảo trì Phòng ${p.room} (PB-88)`, 'Đã lưu Checklist, gửi phiếu đề xuất vật tư (nếu có) và mở lại trạng thái "Hoạt động bình thường".', 'check');
      renderAll();
    }
  });

  $('checklistCard').addEventListener('submit', e => {
    if (e.target.id !== 'scheduleForm') return;
    e.preventDefault();
    const [room, roomType] = $('sRoom').value.split('|');
    const date = $('sDate').value;
    const slot = $('sSlot').value;

    const conflict = CLASS_TIMETABLE.find(c => c.room === room && c.date === date && c.slot === slot);
    if (conflict) {
      $('scheduleConflict').innerHTML = alertBox('err', 'Trùng lịch giảng dạy chính khóa (BR1)', `Phòng ${room} đang có lớp <b>${conflict.subject}</b> (${conflict.slot}). Vui lòng chọn khung giờ khác.`);
      return;
    }

    const code = 'BT-' + (200 + MAINT_PLANS.length + 2);
    const results = {};
    (CHECKLIST_BY_TYPE[roomType] || []).forEach(it => { results[it.id] = null; });
    MAINT_PLANS.unshift({ code, campus: 'CS3', room, roomType, date, slot, status: 'scheduled', results, supplyNote: '' });
    selectedCode = code;
    leftMode = 'checklist';
    $('pageNotice').innerHTML = alertBox('ok', `Đã lập lịch bảo trì #${code} (F84)`, `Phòng ${room} (${fmtDate(date)} · ${slot}) hợp lệ, không trùng lịch học.`, 'check');
    renderAll();
  });

  $('maintTabs').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) { filterTab = tab.dataset.filter; renderMaintList(); }
  });

  $('maintList').addEventListener('click', e => {
    const drw = e.target.closest('[data-drawer]');
    if (drw) { openMaintDrawer(drw.dataset.drawer); return; }
    const card = e.target.closest('[data-pick]');
    if (card) { selectedCode = card.dataset.pick; leftMode = 'checklist'; renderAll(); }
  });
}

document.addEventListener('DOMContentLoaded', initUA3);
