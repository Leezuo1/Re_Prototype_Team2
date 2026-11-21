/* js/ua3.js — Nghiệp vụ Bảo trì định kỳ phòng học & hạ tầng (UA3 - Đội ngũ Kỹ thuật) */

Object.assign(TECH_ICONS, {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  package: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>'
});

/* ===== 1. Lịch giảng dạy chính khóa (Dùng kiểm tra tránh trùng lịch theo BR1) ===== */
const CLASS_TIMETABLE = [
  { room: 'A.04-02', date: '2026-11-23', start: '07:00', end: '11:30', subject: 'Công nghệ phần mềm (Ca sáng)' },
  { room: 'A.04-02', date: '2026-11-23', start: '13:00', end: '17:00', subject: 'Phân tích thiết kế HTTT (Ca chiều)' },
  { room: 'Lab CNTT 02', date: '2026-11-23', start: '07:30', end: '11:30', subject: 'Thực hành Mạng máy tính' },
  { room: 'Hội trường Trịnh Công Sơn', date: '2026-11-24', start: '08:00', end: '11:30', subject: 'Hội thảo Khoa CNTT' }
];

/* ===== 2. Mẫu Checklist kỹ thuật theo từng loại phòng (BR3) ===== */
const CHECKLIST_TEMPLATES = {
  'Phòng lý thuyết': [
    'Máy chiếu & màn chiếu (độ sáng, cổng HDMI/VGA)',
    'Hệ thống âm thanh & micro trợ giảng',
    'Kết nối mạng LAN / Wi-Fi giảng viên',
    'Hệ thống điều hòa & đèn chiếu sáng'
  ],
  'Phòng Lab máy tính': [
    'Dàn máy tính thực hành PC Lab (khởi động, phần mềm)',
    'Hệ thống mạng LAN nội bộ & tủ Switch',
    'Máy chiếu / Màn hình trung tâm phòng Lab',
    'Hệ thống ổ cắm điện & điều hòa công suất lớn'
  ],
  'Hội trường': [
    'Hệ thống âm thanh hội trường & bàn Mixer',
    'Máy chiếu công suất lớn / Màn hình LED sân khấu',
    'Bộ micro không dây & pin dự phòng',
    'Hạ tầng Wi-Fi mật độ cao & nguồn điện sân khấu'
  ]
};

const CONSUMABLE_ITEMS = [
  'Bóng đèn máy chiếu Epson',
  'Pin AA Micro không dây (Hộp)',
  'Dây cáp HDMI 2m chống nhiễu',
  'Dây cáp mạng Cat6 bấm sẵn',
  'Ổ cắm điện kéo dài 6 lỗ'
];

/* ===== 3. Dữ liệu mẫu kế hoạch bảo trì định kỳ ===== */
const MAINT_PLANS = [
  {
    code: 'BT-304',
    room: 'Lab CNTT 02',
    roomType: 'Phòng Lab máy tính',
    building: 'Khu Lab',
    cycle: 'Định kỳ tháng',
    date: '2026-11-23',
    start: '13:30',
    end: '16:30',
    status: 'locked', // scheduled | locked | completed
    checks: [
      { id: 1, name: 'Dàn máy tính thực hành PC Lab (khởi động, phần mềm)', state: 'pass', note: '40/40 máy hoạt động ổn định' },
      { id: 2, name: 'Hệ thống mạng LAN nội bộ & tủ Switch', state: 'fix', note: '2 dây mạng bàn số 12 đứt ngầm đầu bấm' },
      { id: 3, name: 'Máy chiếu / Màn hình trung tâm phòng Lab', state: null, note: '' },
      { id: 4, name: 'Hệ thống ổ cắm điện & điều hòa công suất lớn', state: null, note: '' }
    ],
    unlockedAt: null
  },
  {
    code: 'BT-303',
    room: 'A.04-02',
    roomType: 'Phòng lý thuyết',
    building: 'Tòa A',
    cycle: 'Định kỳ tuần',
    date: '2026-11-23',
    start: '17:30',
    end: '19:30',
    status: 'scheduled',
    checks: CHECKLIST_TEMPLATES['Phòng lý thuyết'].map((name, idx) => ({ id: idx + 1, name, state: null, note: '' })),
    unlockedAt: null
  },
  {
    code: 'BT-302',
    room: 'Hội trường Trịnh Công Sơn',
    roomType: 'Hội trường',
    building: 'Tòa A',
    cycle: 'Định kỳ tháng',
    date: '2026-11-24',
    start: '13:30',
    end: '17:00',
    status: 'scheduled',
    checks: CHECKLIST_TEMPLATES['Hội trường'].map((name, idx) => ({ id: idx + 1, name, state: null, note: '' })),
    unlockedAt: null
  },
  {
    code: 'BT-301',
    room: 'B.02-05',
    roomType: 'Phòng lý thuyết',
    building: 'Tòa B',
    cycle: 'Định kỳ tuần',
    date: '2026-11-21',
    start: '13:00',
    end: '15:00',
    status: 'completed',
    checks: CHECKLIST_TEMPLATES['Phòng lý thuyết'].map((name, idx) => ({ id: idx + 1, name, state: 'pass', note: 'Đạt chuẩn' })),
    unlockedAt: '14:50 · Hôm nay'
  }
];

const SUPPLY_PROPOSALS = [
  { id: 'VT-101', planCode: 'BT-304', room: 'Lab CNTT 02', item: 'Dây cáp mạng Cat6 bấm sẵn', qty: 3, reason: 'Thay thế dây mạng đứt ngầm dãy máy 12', status: 'Chờ CSVC duyệt' }
];

const MAINT_STATUS_TEXT = {
  scheduled: 'Đã lên lịch',
  locked: 'Tạm khóa để bảo trì (BR2)',
  completed: 'Đã hoàn thành & Mở khóa'
};

let maintTab = 'all';
let drawerTrapCloser = null;
let modalTrapCloser = null;

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const getPlan = (code) => MAINT_PLANS.find((p) => p.code === code);

/* Kiểm tra trùng lịch học chính khóa (BR1) */
function findClassConflict(room, date, start, end) {
  const s = toMin(start);
  const e = toMin(end);
  return CLASS_TIMETABLE.find(
    (c) => c.room === room && c.date === date && s < toMin(c.end) && e > toMin(c.start)
  ) || null;
}

/* ===== 1. Thống kê nhanh & Danh sách kế hoạch bảo trì (F84) ===== */
function updateMaintStats() {
  const setVal = (id, n) => {
    const el = document.getElementById(id);
    if (el) el.textContent = n;
  };
  setVal('stScheduled', MAINT_PLANS.filter((p) => p.status === 'scheduled').length);
  setVal('stLocked', MAINT_PLANS.filter((p) => p.status === 'locked').length);
  setVal('stDone', MAINT_PLANS.filter((p) => p.status === 'completed').length);
  setVal('stSupplies', SUPPLY_PROPOSALS.length);
}

function setMaintTab(nextTab) {
  maintTab = nextTab;
  document.querySelectorAll('#maintTabs .tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === nextTab);
  });
  renderMaintList();
}

function renderMaintList() {
  updateMaintStats();

  const keyword = (document.getElementById('mSearch')?.value || '').trim().toLowerCase();
  const typeFilter = document.getElementById('mRoomType')?.value || 'all';

  const list = MAINT_PLANS
    .filter((p) => maintTab === 'all' || p.status === maintTab)
    .filter((p) => typeFilter === 'all' || p.roomType === typeFilter)
    .filter((p) => {
      if (!keyword) return true;
      return `${p.code} ${p.room} ${p.roomType} ${p.building}`.toLowerCase().includes(keyword);
    });

  const countEl = document.getElementById('maintCount');
  if (countEl) countEl.textContent = `Hiển thị ${list.length} / ${MAINT_PLANS.length} đợt bảo trì`;

  const container = document.getElementById('maintList');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${renderIcon('calendar')}</div>
        <h3>Không có lịch bảo trì phù hợp</h3>
        <p>Thử đổi bộ lọc loại phòng hoặc bấm "Lập lịch bảo trì" để tạo kế hoạch mới.</p>
      </div>`;
    return;
  }

  container.innerHTML = list
    .map((p) => {
      const doneCount = p.checks.filter((c) => c.state !== null).length;
      const totalCount = p.checks.length;

      let actionBtn = '';
      if (p.status === 'scheduled') {
        actionBtn = `<button type="button" class="btn btn-primary btn-sm" data-lock="${p.code}">${renderIcon('lock')} Khóa phòng &amp; Bảo trì</button>`;
      } else if (p.status === 'locked') {
        actionBtn = `<button type="button" class="btn btn-primary btn-sm" data-checklist="${p.code}">${renderIcon('checklist')} Thực hiện Checklist (${doneCount}/${totalCount})</button>`;
      } else {
        actionBtn = `<button type="button" class="btn btn-outline btn-sm" data-checklist="${p.code}">Xem kết quả bảo trì</button>`;
      }

      return `
        <article class="mt-card st-${p.status}">
          <div class="mt-top">
            <div class="mt-codes">
              <span class="order-code">#${esc(p.code)}</span>
              <span class="type-tag">${esc(p.roomType)}</span>
              <span class="cycle-tag">${esc(p.cycle)}</span>
            </div>
            <span class="badge badge-${p.status}">${MAINT_STATUS_TEXT[p.status]}</span>
          </div>

          <div class="mt-body">
            <div>
              <h3>Phòng ${esc(p.room)} · ${esc(p.building)}</h3>
              <p class="mt-time">${renderIcon('calendar')} ${fmtDate(p.date)} · ${renderIcon('clock')} ${p.start} – ${p.end}</p>
            </div>
            <div class="mt-actions">${actionBtn}</div>
          </div>

          <div class="mt-foot">
            <span>Tiến độ Checklist: <b>${doneCount}/${totalCount}</b> hạng mục</span>
            ${p.status === 'locked' ? '<span class="lock-warn">Đang chặn đặt phòng mới trên hệ thống (BR2)</span>' : ''}
            ${p.unlockedAt ? `<span class="ok-txt">Đã mở khóa vận hành lúc ${esc(p.unlockedAt)}</span>` : ''}
          </div>
        </article>`;
    })
    .join('');
}

/* =====================================================
   2. LẬP LỊCH BẢO TRÌ ĐỊNH KỲ & KIỂM TRA TRÙNG LỊCH HỌC (F84, BR1)
   ===================================================== */
function closePlanModal() {
  if (typeof modalTrapCloser === 'function') {
    modalTrapCloser();
    modalTrapCloser = null;
  }
  const root = document.getElementById('modalRoot');
  if (root) root.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

function openCreatePlanModal() {
  const root = document.getElementById('modalRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="planModalTitle">
        <div class="m-head">
          <div>
            <h2 id="planModalTitle">Lập lịch bảo trì định kỳ</h2>
            <p>Hệ thống tự động đối chiếu thời khóa biểu chính khóa (BR1)</p>
          </div>
          <button type="button" class="m-x" data-close-plan aria-label="Đóng">${renderIcon('x')}</button>
        </div>
        <div class="m-body">
          <div class="alert err" id="br1Alert" hidden></div>

          <div class="f-row">
            <div class="f-group">
              <label for="pRoom">Phòng học / Khu vực *</label>
              <select id="pRoom">
                <option value="A.04-02" data-type="Phòng lý thuyết" data-bld="Tòa A">A.04-02 (Tòa A)</option>
                <option value="Lab CNTT 02" data-type="Phòng Lab máy tính" data-bld="Khu Lab">Lab CNTT 02 (Khu Lab)</option>
                <option value="Hội trường Trịnh Công Sơn" data-type="Hội trường" data-bld="Tòa A">Hội trường Trịnh Công Sơn</option>
                <option value="B.02-05" data-type="Phòng lý thuyết" data-bld="Tòa B">B.02-05 (Tòa B)</option>
              </select>
            </div>
            <div class="f-group">
              <label for="pCycle">Chu kỳ kiểm tra *</label>
              <select id="pCycle">
                <option value="Định kỳ tuần">Định kỳ tuần</option>
                <option value="Định kỳ tháng">Định kỳ tháng</option>
              </select>
            </div>
          </div>

          <div class="f-group">
            <label for="pDate">Ngày bảo trì *</label>
            <input type="date" id="pDate" value="2026-11-23">
          </div>

          <div class="f-row">
            <div class="f-group">
              <label for="pStart">Giờ bắt đầu *</label>
              <input type="time" id="pStart" value="08:00">
            </div>
            <div class="f-group">
              <label for="pEnd">Giờ kết thúc *</label>
              <input type="time" id="pEnd" value="10:30">
            </div>
          </div>

          <div class="alert info">
            ${renderIcon('alert')}
            <span><b>Quy tắc BR1:</b> Không được xếp lịch bảo trì trùng khung giờ giảng dạy chính khóa đã có trên hệ thống.</span>
          </div>
        </div>
        <div class="m-foot">
          <button type="button" class="btn btn-outline" data-close-plan>Hủy</button>
          <button type="button" class="btn btn-primary" id="btnSavePlan">Lưu kế hoạch bảo trì</button>
        </div>
      </div>
    </div>`;

  document.body.classList.add('no-scroll');
  const dlg = root.querySelector('.modal');
  if (typeof bindDialogFocus === 'function') {
    modalTrapCloser = bindDialogFocus(dlg, closePlanModal);
  }

  root.querySelector('.overlay').addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('overlay')) closePlanModal();
  });
  root.querySelectorAll('[data-close-plan]').forEach((b) => b.addEventListener('click', closePlanModal));

  const roomEl = dlg.querySelector('#pRoom');
  const dateEl = dlg.querySelector('#pDate');
  const startEl = dlg.querySelector('#pStart');
  const endEl = dlg.querySelector('#pEnd');
  const alertEl = dlg.querySelector('#br1Alert');
  const saveBtn = dlg.querySelector('#btnSavePlan');

  const checkScheduleRule = () => {
    const s = startEl.value;
    const e = endEl.value;
    if (!dateEl.value || !s || !e || toMin(e) <= toMin(s)) {
      alertEl.hidden = false;
      alertEl.innerHTML = `${renderIcon('alert')} <span>Giờ kết thúc phải sau giờ bắt đầu.</span>`;
      saveBtn.disabled = true;
      return;
    }

    const conflict = findClassConflict(roomEl.value, dateEl.value, s, e);
    if (conflict) {
      alertEl.hidden = false;
      alertEl.innerHTML = `${renderIcon('alert')} <div><b>Trùng lịch giảng dạy chính khóa (BR1):</b> Phòng <b>${esc(conflict.room)}</b> có tiết <i>${esc(conflict.subject)}</i> từ <b>${conflict.start} – ${conflict.end}</b> ngày ${fmtDate(conflict.date)}. Vui lòng chọn khung giờ trống khác (VD: sau 17:30).</div>`;
      saveBtn.disabled = true;
    } else {
      alertEl.hidden = true;
      saveBtn.disabled = false;
    }
  };

  [roomEl, dateEl, startEl, endEl].forEach((el) => el.addEventListener('change', checkScheduleRule));
  checkScheduleRule();

  saveBtn.addEventListener('click', () => {
    const opt = roomEl.selectedOptions[0];
    const roomType = opt.dataset.type;
    const building = opt.dataset.bld;

    runWithLock(saveBtn, () => {
      const nextNum = 301 + MAINT_PLANS.length;
      const newCode = `BT-${nextNum}`;
      MAINT_PLANS.unshift({
        code: newCode,
        room: roomEl.value,
        roomType,
        building,
        cycle: dlg.querySelector('#pCycle').value,
        date: dateEl.value,
        start: startEl.value,
        end: endEl.value,
        status: 'scheduled',
        checks: CHECKLIST_TEMPLATES[roomType].map((name, idx) => ({ id: idx + 1, name, state: null, note: '' })),
        unlockedAt: null
      });
      closePlanModal();
      renderMaintList();
      notifyToast(`Đã lập lịch bảo trì #${newCode} cho phòng ${roomEl.value}`);
    });
  });
}

/* =====================================================
   3. KHÓA TẠM THỜI PHÒNG HỌC (F85, BR2)
   ===================================================== */
function lockRoomForMaintenance(code) {
  const plan = getPlan(code);
  if (!plan) return;

  plan.status = 'locked';
  renderMaintList();
  notifyToast(`Đã tạm khóa phòng ${plan.room} để bảo trì (BR2)`);
  openChecklistDrawer(code);
}

/* =====================================================
   4. NGĂN CHECKLIST KỸ THUẬT, ĐỀ XUẤT VẬT TƯ & MỞ KHÓA PHÒNG
      (F86, F87, BR3, PB-88)
   ===================================================== */
function closeChecklistDrawer() {
  if (typeof drawerTrapCloser === 'function') {
    drawerTrapCloser();
    drawerTrapCloser = null;
  }
  const root = document.getElementById('drawerRoot');
  if (root) root.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

function openChecklistDrawer(code) {
  const plan = getPlan(code);
  if (!plan) return;

  const root = document.getElementById('drawerRoot');
  if (!root) return;

  const isCompleted = plan.status === 'completed';
  const allChecked = plan.checks.every((c) => c.state !== null);
  const doneCount = plan.checks.filter((c) => c.state !== null).length;
  const relatedSupplies = SUPPLY_PROPOSALS.filter((s) => s.planCode === plan.code);

  const checklistHtml = plan.checks
    .map(
      (item) => `
      <div class="chk-card ${item.state || ''}">
        <div class="chk-row">
          <b>${item.id}. ${esc(item.name)}</b>
          <div class="chk-btns">
            <button type="button" class="pill-btn pass ${item.state === 'pass' ? 'active' : ''}"
              data-mark="${item.id}:pass" ${isCompleted ? 'disabled' : ''}>Đạt</button>
            <button type="button" class="pill-btn fix ${item.state === 'fix' ? 'active' : ''}"
              data-mark="${item.id}:fix" ${isCompleted ? 'disabled' : ''}>Cần khắc phục</button>
          </div>
        </div>
        <input type="text" class="chk-note-input" data-note="${item.id}"
          value="${esc(item.note)}" ${isCompleted ? 'disabled' : ''}
          placeholder="Ghi chú dấu hiệu xuống cấp / thông số kiểm tra...">
      </div>`
    )
    .join('');

  root.innerHTML = `
    <div class="overlay drawer">
      <aside class="modal drawer" role="dialog" aria-modal="true" aria-labelledby="chkDrawerTitle">
        <div class="m-head">
          <div>
            <h2 id="chkDrawerTitle">Checklist Bảo trì · Phòng ${esc(plan.room)}</h2>
            <p>#${esc(plan.code)} · ${esc(plan.roomType)} · ${fmtDate(plan.date)} (${plan.start} – ${plan.end})</p>
          </div>
          <button type="button" class="m-x" data-close-drawer aria-label="Đóng">${renderIcon('x')}</button>
        </div>

        <div class="m-body">
          ${
            isCompleted
              ? `<div class="alert ok">${renderIcon('check')} <span>Đợt bảo trì đã hoàn tất. Phòng <b>${esc(plan.room)}</b> đã được mở lại trạng thái <b>"Hoạt động bình thường"</b>.</span></div>`
              : `<div class="alert warn">${renderIcon('lock')} <span><b>Đang tạm khóa phòng (BR2):</b> Hệ thống đang chặn lượt đặt phòng phát sinh. Cần hoàn thành <b>${doneCount}/${plan.checks.length}</b> hạng mục Checklist (BR3) trước khi mở khóa.</span></div>`
          }

          <h4 class="sec">Danh mục kiểm tra theo chuẩn ${esc(plan.roomType)} (F86)</h4>
          <div class="chk-list">${checklistHtml}</div>

          <hr class="line">
          <h4 class="sec">Đề xuất cấp phát vật tư tiêu hao gửi CSVC (F87)</h4>
          ${
            relatedSupplies.length
              ? `<div class="sup-list">${relatedSupplies
                  .map(
                    (s) =>
                      `<div class="sup-item"><span><b>${esc(s.item)}</b> × ${s.qty} — ${esc(s.reason)}</span><span class="badge pending">${esc(s.status)}</span></div>`
                  )
                  .join('')}</div>`
              : '<p class="muted small">Chưa có phiếu đề xuất vật tư nào cho đợt bảo trì này.</p>'
          }

          ${
            !isCompleted
              ? `
            <div class="sup-form">
              <div class="f-row">
                <select id="supItem">
                  ${CONSUMABLE_ITEMS.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('')}
                </select>
                <input type="number" id="supQty" min="1" max="50" value="1" style="max-width:84px" aria-label="Số lượng">
              </div>
              <div class="f-row" style="margin-top:8px">
                <input type="text" id="supReason" placeholder="Lý do đề xuất (VD: Bóng đèn máy chiếu yếu, hết pin micro)...">
                <button type="button" class="btn btn-outline btn-sm" id="btnAddSupply">${renderIcon('package')} Tạo phiếu đề xuất</button>
              </div>
            </div>`
              : ''
          }
        </div>

        <div class="m-foot">
          <button type="button" class="btn btn-outline" data-close-drawer>Đóng</button>
          ${
            !isCompleted
              ? `<button type="button" class="btn btn-primary" id="btnUnlockRoom" ${allChecked ? '' : 'disabled'}>
                  ${renderIcon('unlock')} Hoàn tất &amp; Mở khóa phòng
                </button>`
              : ''
          }
        </div>
      </aside>
    </div>`;

  document.body.classList.add('no-scroll');
  const drawerEl = root.querySelector('.drawer');
  if (typeof bindDialogFocus === 'function') {
    drawerTrapCloser = bindDialogFocus(drawerEl, closeChecklistDrawer);
  }

  root.querySelector('.overlay').addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('overlay')) closeChecklistDrawer();
  });
  root.querySelectorAll('[data-close-drawer]').forEach((b) => b.addEventListener('click', closeChecklistDrawer));

  // Đánh dấu Đạt / Cần khắc phục cho từng hạng mục Checklist
  drawerEl.querySelectorAll('[data-mark]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [idStr, state] = btn.dataset.mark.split(':');
      const target = plan.checks.find((c) => c.id === Number(idStr));
      if (target) {
        target.state = state;
        renderMaintList();
        openChecklistDrawer(code);
      }
    });
  });

  // Lưu ghi chú từng hạng mục
  drawerEl.querySelectorAll('[data-note]').forEach((input) => {
    input.addEventListener('input', () => {
      const target = plan.checks.find((c) => c.id === Number(input.dataset.note));
      if (target) target.note = input.value;
    });
  });

  // Tạo phiếu đề xuất vật tư tiêu hao (F87 / PB-87)
  const addSupBtn = drawerEl.querySelector('#btnAddSupply');
  if (addSupBtn) {
    addSupBtn.addEventListener('click', () => {
      const item = drawerEl.querySelector('#supItem').value;
      const qty = Math.max(1, Number(drawerEl.querySelector('#supQty').value) || 1);
      const reason = drawerEl.querySelector('#supReason').value.trim() || 'Bổ sung vật tư tiêu hao sau kiểm tra định kỳ';

      runWithLock(addSupBtn, () => {
        SUPPLY_PROPOSALS.unshift({
          id: `VT-${101 + SUPPLY_PROPOSALS.length}`,
          planCode: plan.code,
          room: plan.room,
          item,
          qty,
          reason,
          status: 'Chờ CSVC duyệt'
        });
        renderMaintList();
        notifyToast(`Đã gửi phiếu đề xuất ${item} (×${qty}) về Phòng CSVC`);
        openChecklistDrawer(code);
      });
    });
  }

  // Hoàn tất đợt bảo trì & mở khóa vận hành phòng học (PB-88)
  const unlockBtn = drawerEl.querySelector('#btnUnlockRoom');
  if (unlockBtn) {
    unlockBtn.addEventListener('click', () => {
      if (!plan.checks.every((c) => c.state !== null)) return;

      runWithLock(unlockBtn, () => {
        plan.status = 'completed';
        plan.unlockedAt = 'Vừa xong · Hôm nay';
        closeChecklistDrawer();
        renderMaintList();
        notifyToast(`Đã mở lại trạng thái "Hoạt động bình thường" cho phòng ${plan.room}`);
      });
    });
  }
}

/* ===== 5. Khởi tạo trang UA3 ===== */
function initUA3() {
  renderMaintList();

  document.getElementById('btnOpenPlanModal')?.addEventListener('click', openCreatePlanModal);

  document.getElementById('maintTabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) setMaintTab(tab.dataset.tab);
  });

  ['mSearch', 'mRoomType'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(id === 'mSearch' ? 'input' : 'change', renderMaintList);
  });

  document.getElementById('maintList')?.addEventListener('click', (e) => {
    const lockBtn = e.target.closest('[data-lock]');
    if (lockBtn) return lockRoomForMaintenance(lockBtn.dataset.lock);

    const chkBtn = e.target.closest('[data-checklist]');
