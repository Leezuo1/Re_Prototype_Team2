/* js/ua2.js — Nghiệp vụ Kiểm tra kỹ thuật & Bàn giao thiết bị (UA2 - Đội ngũ Kỹ thuật) */

Object.assign(TECH_ICONS, {
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/>',
  box: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>'
});

/* ===== Dữ liệu mẫu đơn mượn đã duyệt & trạng thái bàn giao (F79) ===== */
const HANDOVER_LIST = [
  {
    code: 'TB1032',
    borrowerName: 'Nguyễn Đình Thuần',
    borrowerId: '2474802010377',
    borrowerRole: 'Sinh viên CNTT',
    room: 'A.04-02',
    campus: 'Cơ sở chính',
    assetCode: 'VLU-MC-105',
    deviceName: 'Máy chiếu di động Epson EB-E01',
    sysStatus: 'Sẵn sàng', // BR1: chỉ xuất kho khi trạng thái là Sẵn sàng
    accessories: ['Dây nguồn 3m', 'Cáp HDMI 2m', 'Remote điều khiển', 'Túi chống sốc'],
    borrowSlot: '13:00 – 15:30 · Hôm nay',
    status: 'ready_out',
    handedAt: null,
    returnedAt: null,
    note: ''
  },
  {
    code: 'TB1031',
    borrowerName: 'GV. Lê Gia Hiếu',
    borrowerId: 'GV-CNTT-019',
    borrowerRole: 'Giảng viên',
    room: 'B.02-05',
    campus: 'Cơ sở chính',
    assetCode: 'VLU-AT-212',
    deviceName: 'Bộ Micro không dây Shure BLX288',
    sysStatus: 'Sẵn sàng',
    accessories: ['2 Tay micro không dây', 'Đầu thu tín hiệu', 'Adapter nguồn', '4 Pin AA'],
    borrowSlot: '13:30 – 16:30 · Hôm nay',
    status: 'ready_out',
    handedAt: null,
    returnedAt: null,
    note: ''
  },
  {
    code: 'TB1029',
    borrowerName: 'Trần Khánh Hưng',
    borrowerId: '2474802010157',
    borrowerRole: 'Sinh viên CNTT',
    room: 'Lab CNTT 02',
    campus: 'Cơ sở chính',
    assetCode: 'VLU-HB-034',
    deviceName: 'Bộ Hub chuyển đổi USB-C & Cáp trình chiếu',
    sysStatus: 'Đang được mượn',
    accessories: ['Hub USB-C 7-in-1', 'Cáp HDMI 2m', 'Ổ cắm kéo dài 5m'],
    borrowSlot: '08:00 – 11:30 · Hôm nay',
    status: 'borrowed',
    handedAt: '07:55 · Hôm nay',
    returnedAt: null,
    note: 'Đã kiểm tra đủ 3 phụ kiện, tín hiệu xuất hình ổn định.'
  },
  {
    code: 'TB1027',
    borrowerName: 'Nguyễn Quang Vũ',
    borrowerId: '2474802010445',
    borrowerRole: 'Sinh viên CNTT',
    room: 'A.03-01',
    campus: 'Cơ sở chính',
    assetCode: 'VLU-AT-118',
    deviceName: 'Loa trợ giảng di động Sony',
    sysStatus: 'Đang bảo trì / Hỏng',
    accessories: ['Loa chính', 'Micro cài áo', 'Dây sạc'],
    borrowSlot: '07:30 – 10:00 · Hôm nay',
    status: 'damaged',
    handedAt: '07:25 · Hôm nay',
    returnedAt: '10:05 · Hôm nay',
    incidentId: 'SC-205',
    note: 'Thiếu dây sạc đi kèm và màng loa rè. Đã lập biên bản chuyển UA1 (#SC-205).'
  }
];

const HANDOVER_STATUS_TEXT = {
  ready_out: 'Chờ kiểm tra xuất kho',
  borrowed: 'Đang được mượn',
  returned: 'Đã thu hồi đạt chuẩn',
  damaged: 'Ghi nhận hư hỏng (BR2)'
};

let activeTab = 'all';
let modalTrapCloser = null;

const escHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const getReq = (code) => HANDOVER_LIST.find((item) => item.code === code);

/* ===== Khung Modal / Drawer dùng chung trong UA2 ===== */
function openHandoverModal(innerHtml, variant = '') {
  const root = document.getElementById('modalRoot');
  if (!root) return null;

  root.innerHTML = `
    <div class="overlay ${variant}">
      <div class="modal ${variant}" role="dialog" aria-modal="true" aria-labelledby="ua2ModalTitle">
        ${innerHtml}
      </div>
    </div>`;

  document.body.classList.add('no-scroll');

  root.querySelector('.overlay').addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('overlay')) closeHandoverModal();
  });
  root.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', closeHandoverModal);
  });

  const dialog = root.querySelector('.modal');
  if (typeof bindDialogFocus === 'function') {
    modalTrapCloser = bindDialogFocus(dialog, closeHandoverModal);
  }
  return dialog;
}

function closeHandoverModal() {
  if (typeof modalTrapCloser === 'function') {
    modalTrapCloser();
    modalTrapCloser = null;
  }
  const root = document.getElementById('modalRoot');
  if (root) root.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

const buildHead = (title, sub = '') => `
  <div class="m-head">
    <div>
      <h2 id="ua2ModalTitle">${title}</h2>
      ${sub ? `<p>${sub}</p>` : ''}
    </div>
    <button type="button" class="m-x" data-close-modal aria-label="Đóng">${renderIcon('x')}</button>
  </div>`;

const buildFoot = (btns, cls = '') => `<div class="m-foot ${cls}">${btns}</div>`;

/* ===== 1. Thống kê & Danh sách yêu cầu mượn/trả trong ngày (F79) ===== */
function updateHandoverStats() {
  const setNum = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setNum('stReadyOut', HANDOVER_LIST.filter((x) => x.status === 'ready_out').length);
  setNum('stBorrowed', HANDOVER_LIST.filter((x) => x.status === 'borrowed').length);
  setNum('stReturned', HANDOVER_LIST.filter((x) => x.status === 'returned').length);
  setNum('stDamaged', HANDOVER_LIST.filter((x) => x.status === 'damaged').length);
}

function setHandoverTab(nextTab) {
  activeTab = nextTab;
  document.querySelectorAll('#handoverTabs .tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === nextTab);
  });
  renderHandoverList();
}

function renderHandoverList() {
  updateHandoverStats();

  const q = (document.getElementById('hSearch')?.value || '').trim().toLowerCase();
  const roleFilter = document.getElementById('hRole')?.value || 'all';

  const list = HANDOVER_LIST
    .filter((item) => activeTab === 'all' || item.status === activeTab)
    .filter((item) => roleFilter === 'all' || item.borrowerRole.includes(roleFilter))
    .filter((item) => {
      if (!q) return true;
      const text = `${item.code} ${item.assetCode} ${item.deviceName} ${item.borrowerName} ${item.borrowerId} ${item.room}`.toLowerCase();
      return text.includes(q);
    });

  const countEl = document.getElementById('handoverCount');
  if (countEl) countEl.textContent = `Hiển thị ${list.length} / ${HANDOVER_LIST.length} phiếu trong ngày`;

  const container = document.getElementById('handoverList');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${renderIcon('box')}</div>
        <h3>Không có phiếu bàn giao phù hợp</h3>
        <p>Thử thay đổi từ khóa MSSV/Mã GV, mã thiết bị hoặc chọn tab trạng thái khác.</p>
      </div>`;
    return;
  }

  container.innerHTML = list
    .map((item) => {
      let actionHtml = `<button type="button" class="btn btn-outline btn-sm" data-view="${item.code}">Chi tiết</button>`;
      if (item.status === 'ready_out') {
        actionHtml = `
          <button type="button" class="btn btn-outline btn-sm" data-view="${item.code}">Chi tiết</button>
          <button type="button" class="btn btn-primary btn-sm" data-outbound="${item.code}">${renderIcon('qr')} Kiểm tra &amp; Xuất kho</button>`;
      } else if (item.status === 'borrowed') {
        actionHtml = `
          <button type="button" class="btn btn-outline btn-sm" data-view="${item.code}">Chi tiết</button>
          <button type="button" class="btn btn-primary btn-sm" data-return="${item.code}">${renderIcon('qr')} Quét QR nhận trả</button>`;
      }

      return `
        <article class="ho-card st-${item.status}">
          <div class="ho-top">
            <div class="ho-codes">
              <span class="order-code">#${escHtml(item.code)}</span>
              <code>${escHtml(item.assetCode)}</code>
              <span class="sys-tag">Kho: ${escHtml(item.sysStatus)}</span>
            </div>
            <span class="badge badge-${item.status}">${HANDOVER_STATUS_TEXT[item.status]}</span>
          </div>

          <div class="ho-body">
            <div>
              <h3>${escHtml(item.deviceName)} · Phòng ${escHtml(item.room)}</h3>
              <p class="ho-acc">Phụ kiện đi kèm (${item.accessories.length}): ${item.accessories.map(escHtml).join(', ')}</p>
            </div>
            <div class="ho-actions">${actionHtml}</div>
          </div>

          <div class="ho-meta">
            <span>${renderIcon('user')} <b>${escHtml(item.borrowerName)}</b> (${escHtml(item.borrowerId)} · ${escHtml(item.borrowerRole)})</span>
            <span>${renderIcon('clock')} ${escHtml(item.borrowSlot)}</span>
          </div>

          ${item.note ? `<div class="ho-note">${escHtml(item.note)}</div>` : ''}
        </article>`;
    })
    .join('');
}

/* =====================================================
   2. KIỂM TRA CHẤT LƯỢNG & XUẤT KHO BÀN GIAO (F80, F81, BR1)
   ===================================================== */
function openOutboundModal(code) {
  const req = getReq(code);
  if (!req) return;

  const isSystemReady = req.sysStatus === 'Sẵn sàng'; // BR1
  let qrVerified = false;

  const checks = [
    { id: 'chkBody', label: 'Ngoại quan thiết bị nguyên vẹn, không nứt vỡ' },
    { id: 'chkPower', label: 'Nguồn điện / pin đầy, khởi động ổn định' },
    { id: 'chkSignal', label: 'Tín hiệu kết nối (HDMI / Audio / Wireless) hoạt động tốt' },
    { id: 'chkAcc', label: `Đủ ${req.accessories.length} phụ kiện đi kèm (${req.accessories.join(', ')})` }
  ];

  const dlg = openHandoverModal(`
    ${buildHead('Kiểm tra kỹ thuật & Xuất kho bàn giao', `Phiếu #${req.code} · Người nhận: ${req.borrowerName} (${req.borrowerId})`)}
    <div class="m-body">
      <div class="alert ${isSystemReady ? 'info' : 'err'}">
        ${renderIcon('shield')}
        <span><b>Quy tắc BR1:</b> Chỉ xuất kho khi trạng thái hệ thống là <b>"Sẵn sàng"</b> (Hiện tại: <b>${req.sysStatus}</b>) và đạt checklist kỹ thuật.</span>
      </div>

      <div class="f-group">
        <label>Bước 1: Đối chiếu mã QR / Barcode thiết bị xuất kho *</label>
        <div class="qr-verify-row">
          <input type="text" id="outQrInput" placeholder="Quét hoặc nhập mã tài sản (VD: ${req.assetCode})">
          <button type="button" class="btn btn-outline btn-sm" id="btnSimScanOut">${renderIcon('qr')} Quét mẫu</button>
        </div>
        <small id="outQrMsg" class="muted">Cần khớp đúng mã tài sản <b>${req.assetCode}</b> trước khi bàn giao.</small>
      </div>

      <div class="f-group">
        <label>Bước 2: Checklist kiểm tra kỹ thuật trước bàn giao (F80) *</label>
        <div class="chk-box">
          ${checks
            .map(
              (c) => `
            <label class="chk-item">
              <input type="checkbox" class="out-chk" id="${c.id}">
              <span>${escHtml(c.label)}</span>
            </label>`
            )
            .join('')}
        </div>
      </div>

      <div class="f-group">
        <label for="outNote">Ghi chú tình trạng bàn giao</label>
        <input type="text" id="outNote" placeholder="VD: Đã test máy chiếu với laptop, đủ 4 phụ kiện">
      </div>
    </div>
    ${buildFoot(`
      <button type="button" class="btn btn-outline" data-close-modal>Hủy</button>
      <button type="button" class="btn btn-outline" id="btnFailOut">Không đạt · Khóa thiết bị</button>
      <button type="button" class="btn btn-primary" id="btnConfirmOut" disabled>Xác nhận xuất kho &amp; Bàn giao</button>`)}
  `);

  const qrInput = dlg.querySelector('#outQrInput');
  const qrMsg = dlg.querySelector('#outQrMsg');
  const checkBoxes = Array.from(dlg.querySelectorAll('.out-chk'));
  const confirmBtn = dlg.querySelector('#btnConfirmOut');

  const evaluateReady = () => {
    qrVerified = qrInput.value.trim().toUpperCase() === req.assetCode;
    if (qrInput.value.trim()) {
      qrMsg.innerHTML = qrVerified
        ? `<span style="color:#047857">✔ Khớp đúng mã tài sản <b>${req.assetCode}</b></span>`
        : `<span style="color:#d71920">✘ Sai mã tài sản (Yêu cầu: <b>${req.assetCode}</b>)</span>`;
    }
    const allChecked = checkBoxes.every((cb) => cb.checked);
    confirmBtn.disabled = !(isSystemReady && qrVerified && allChecked);
  };

  qrInput.addEventListener('input', evaluateReady);
  checkBoxes.forEach((cb) => cb.addEventListener('change', evaluateReady));

  dlg.querySelector('#btnSimScanOut').addEventListener('click', () => {
    qrInput.value = req.assetCode;
    evaluateReady();
  });

  // Nếu thiết bị kiểm tra thực tế không đạt -> khóa không cho mượn (BR1)
  dlg.querySelector('#btnFailOut').addEventListener('click', () => {
    runWithLock(dlg.querySelector('#btnFailOut'), () => {
      req.sysStatus = 'Đang bảo trì / Hỏng';
      req.status = 'damaged';
      req.note = 'Kiểm tra xuất kho không đạt chuẩn kỹ thuật. Đã khóa thiết bị để bảo trì.';
      closeHandoverModal();
      renderHandoverList();
      notifyToast(`Đã khóa thiết bị ${req.assetCode} do không đạt kiểm tra`);
    });
  });

  // Xác nhận bàn giao (F81)
  confirmBtn.addEventListener('click', () => {
    const noteText = dlg.querySelector('#outNote').value.trim();
    runWithLock(confirmBtn, () => {
      req.status = 'borrowed';
      req.sysStatus = 'Đang được mượn';
      req.handedAt = 'Vừa xong · Hôm nay';
      req.note = noteText || 'Đã quét QR xác thực & kiểm tra đạt chuẩn kỹ thuật trước bàn giao.';
      closeHandoverModal();
      renderHandoverList();
      notifyToast(`Đã bàn giao thiết bị ${req.assetCode} cho ${req.borrowerName}`);
    });
  });
}

/* =====================================================
   3. TIẾP NHẬN & KIỂM TRA THIẾT BỊ HOÀN TRẢ (F82, F83, BR2, BR3)
   ===================================================== */
function openReturnModal(code) {
  const req = getReq(code);
  if (!req) return;

  const dlg = openHandoverModal(`
    ${buildHead('Tiếp nhận & Kiểm tra thiết bị hoàn trả', `Phiếu #${req.code} · Đã xuất kho lúc ${req.handedAt || 'hôm nay'}`)}
    <div class="m-body">
      <div class="alert info">
        ${renderIcon('qr')}
        <span><b>Quy tắc BR3:</b> Bắt buộc quét đối chiếu đúng mã QR/Barcode <b>${req.assetCode}</b> đã xuất kho trước khi xác nhận thu hồi.</span>
      </div>

      <div class="f-group">
        <label>Bước 1: Quét mã QR thiết bị người dùng mang trả (BR3) *</label>
        <div class="qr-verify-row">
          <input type="text" id="retQrInput" placeholder="Quét mã QR trên thân thiết bị...">
          <button type="button" class="btn btn-outline btn-sm" id="btnScanRight">Quét đúng mã</button>
          <button type="button" class="btn btn-outline btn-sm" id="btnScanWrong">Thử quét nhầm</button>
        </div>
        <small id="retQrStatus" class="muted">Chưa quét mã thiết bị hoàn trả.</small>
      </div>

      <div class="f-group">
        <label>Bước 2: Kiểm đếm phụ kiện hoàn trả (F82)</label>
        <div class="chk-box">
          ${req.accessories
            .map(
              (acc, idx) => `
            <label class="chk-item">
              <input type="checkbox" class="ret-acc" data-acc="${escHtml(acc)}" id="rAcc${idx}" checked>
              <span>${escHtml(acc)}</span>
            </label>`
            )
            .join('')}
        </div>
      </div>

      <div class="f-group">
        <label for="retCondition">Bước 3: Đánh giá tình trạng vận hành thực tế *</label>
        <select id="retCondition">
          <option value="ok">Đạt chuẩn – Thiết bị &amp; phụ kiện nguyên vẹn</option>
          <option value="fault">Có hư hỏng / Thiếu phụ kiện (Lập biên bản BR2)</option>
        </select>
      </div>

      <div class="f-group" id="damageBox" hidden>
        <label for="damageDesc">Nội dung biên bản hư hỏng / thiếu phụ kiện (BR2) *</label>
        <textarea id="damageDesc" placeholder="Ghi rõ bộ phận hư hỏng hoặc phụ kiện bị thiếu để chuyển sang quy trình xử lý sự cố (UA1)..."></textarea>
        <p class="err" id="damageErr" hidden>Vui lòng nhập chi tiết hư hỏng/thiếu phụ kiện trước khi lập biên bản.</p>
      </div>
    </div>
    ${buildFoot(`
      <button type="button" class="btn btn-outline" data-close-modal>Hủy</button>
      <button type="button" class="btn btn-primary" id="btnCompleteReturn" disabled>Xác nhận đã trả về kho</button>`)}
  `);

  const qrInput = dlg.querySelector('#retQrInput');
  const qrStatus = dlg.querySelector('#retQrStatus');
  const accChecks = Array.from(dlg.querySelectorAll('.ret-acc'));
  const condSelect = dlg.querySelector('#retCondition');
  const damageBox = dlg.querySelector('#damageBox');
  const damageDesc = dlg.querySelector('#damageDesc');
  const damageErr = dlg.querySelector('#damageErr');
  const submitBtn = dlg.querySelector('#btnCompleteReturn');

  const syncReturnForm = () => {
    const val = qrInput.value.trim().toUpperCase();
    const isMatched = val === req.assetCode;

    if (!val) {
      qrStatus.innerHTML = '<span class="muted">Chưa quét mã thiết bị hoàn trả.</span>';
    } else if (isMatched) {
      qrStatus.innerHTML = `<span style="color:#047857">✔ Đối chiếu chính xác mã thiết bị <b>${req.assetCode}</b></span>`;
    } else {
      qrStatus.innerHTML = `<span style="color:#d71920">✘ Không khớp mã đã xuất kho (<b>${val}</b> ≠ <b>${req.assetCode}</b>) — Bị chặn theo BR3</span>`;
    }

    const missingAcc = accChecks.filter((c) => !c.checked).map((c) => c.dataset.acc);
    if (missingAcc.length && condSelect.value === 'ok') {
      condSelect.value = 'fault';
    }

    const isFault = condSelect.value === 'fault' || missingAcc.length > 0;
    damageBox.hidden = !isFault;

    if (isFault) {
      submitBtn.textContent = 'Ghi nhận hư hỏng & Chuyển UA1';
      if (missingAcc.length && !damageDesc.value.trim()) {
        damageDesc.value = `Thiếu phụ kiện khi trả: ${missingAcc.join(', ')}.`;
      }
    } else {
      submitBtn.textContent = 'Xác nhận đã trả về kho';
      damageErr.hidden = true;
    }

    // BR3: Không cho phép xác nhận nếu chưa khớp mã QR
    submitBtn.disabled = !isMatched;
  };

  qrInput.addEventListener('input', syncReturnForm);
  accChecks.forEach((c) => c.addEventListener('change', syncReturnForm));
  condSelect.addEventListener('change', syncReturnForm);

  dlg.querySelector('#btnScanRight').addEventListener('click', () => {
    qrInput.value = req.assetCode;
    syncReturnForm();
  });

  dlg.querySelector('#btnScanWrong').addEventListener('click', () => {
    qrInput.value = 'VLU-MC-999';
    syncReturnForm();
  });

  submitBtn.addEventListener('click', () => {
    const isFault = condSelect.value === 'fault' || accChecks.some((c) => !c.checked);
    const detail = damageDesc.value.trim();

    if (isFault && !detail) {
      damageErr.hidden = false;
      damageDesc.focus();
      return;
    }

    runWithLock(submitBtn, () => {
      req.returnedAt = 'Vừa xong · Hôm nay';
      if (!isFault) {
        req.status = 'returned';
        req.sysStatus = 'Sẵn sàng';
        req.note = 'Đã đối chiếu QR, thu hồi đủ phụ kiện và đưa thiết bị về trạng thái Sẵn sàng.';
        notifyToast(`Đã thu hồi ${req.assetCode} về trạng thái Sẵn sàng`);
      } else {
        const newIncidentCode = 'SC-' + (205 + Math.floor(Math.random() * 20));
        req.status = 'damaged';
        req.sysStatus = 'Đang bảo trì / Hỏng';
        req.incidentId = newIncidentCode;
        req.note = `${detail} (Đã tạo phiếu sự cố #${newIncidentCode} chuyển sang UA1).`;
        notifyToast(`Đã lập biên bản hư hỏng & tạo phiếu #${newIncidentCode}`);
      }
      closeHandoverModal();
      renderHandoverList();
    });
  });
}

/* =====================================================
   4. NGĂN CHI TIẾT PHIẾU BÀN GIAO (DRAWER)
   ===================================================== */
function openHandoverDetail(code) {
  const req = getReq(code);
  if (!req) return;

  const dlg = openHandoverModal(
    `${buildHead(`Chi tiết bàn giao #${req.code}`, `${req.campus} · Phòng ${req.room}`)}
     <div class="m-body">
       <div class="status-line">
         <span class="badge badge-${req.status}">${HANDOVER_STATUS_TEXT[req.status]}</span>
         <span class="sys-tag">Trạng thái kho: ${escHtml(req.sysStatus)}</span>
       </div>

       <div class="sum">
         <h3>${escHtml(req.deviceName)} (<code>${escHtml(req.assetCode)}</code>)</h3>
         <p><b>Người mượn:</b> ${escHtml(req.borrowerName)} (${escHtml(req.borrowerId)})</p>
         <p><b>Khung giờ đăng ký:</b> ${escHtml(req.borrowSlot)}</p>
         ${req.handedAt ? `<p><b>Thời điểm xuất kho:</b> ${escHtml(req.handedAt)}</p>` : ''}
         ${req.returnedAt ? `<p><b>Thời điểm thu hồi:</b> ${escHtml(req.returnedAt)}</p>` : ''}
       </div>

       <div class="kv">
         <p><b>Danh mục phụ kiện chuẩn (${req.accessories.length}):</b></p>
         <p class="muted">${req.accessories.map(escHtml).join(' · ')}</p>
       </div>

       ${
         req.incidentId
           ? `<div class="alert err">${renderIcon('alert')} <span>Đã liên kết phiếu xử lý sự cố <b>#${escHtml(req.incidentId)}</b> tại phân hệ UA1.</span></div>`
           : ''
       }
       ${req.note ? `<div class="alert info">${renderIcon('shield')} <span>${escHtml(req.note)}</span></div>` : ''}
     </div>
     ${buildFoot('<button type="button" class="btn btn-outline" data-close-modal>Đóng</button>', 'full')}`,
    'drawer'
  );

  return dlg;
}

/* =====================================================
   5. KHỞI TẠO TRANG UA2
   ===================================================== */
function initUA2() {
  renderHandoverList();

  document.getElementById('handoverTabs')?.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab');
    if (tabBtn) setHandoverTab(tabBtn.dataset.tab);
  });

  ['hSearch', 'hRole'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(id === 'hSearch' ? 'input' : 'change', renderHandoverList);
  });

  document.getElementById('handoverList')?.addEventListener('click', (e) => {
    const outBtn = e.target.closest('[data-outbound]');
    if (outBtn) return openOutboundModal(outBtn.dataset.outbound);

    const retBtn = e.target.closest('[data-return]');
    if (retBtn) return openReturnModal(retBtn.dataset.return);

    const viewBtn = e.target.closest('[data-view]');
    if (viewBtn) return openHandoverDetail(viewBtn.dataset.view);
  });
}

document.addEventListener('DOMContentLoaded', initUA2);
