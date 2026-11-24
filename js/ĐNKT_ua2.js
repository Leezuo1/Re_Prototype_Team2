/* Đội ngũ kỹ thuật · Kiểm tra kỹ thuật xuất kho, quét QR đối chiếu & thu hồi thiết bị mượn/trả */

Object.assign(ICONS, {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/>',
  box: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>'
});

/* ===== Dữ liệu mẫu đơn mượn / trả thiết bị VLU (F79 - F83) ===== */
const REQUESTS = [
  {
    code: 'TB1031', campus: 'CS3', type: 'handover',
    borrower: 'ThS. Lê Gia Hiếu', userId: 'GV-CNTT-042', room: 'A.0502',
    time: '09:00 – 11:30 · 24/11/2026',
    assetCode: 'TB-MC-014', assetName: 'Máy chiếu di động Epson EB-E01',
    assetState: 'Sẵn sàng',
    accessories: ['01 Dây nguồn 3m', '01 Cáp HDMI 2m', '01 Remote điều khiển', '01 Túi chống sốc']
  },
  {
    code: 'TB1030', campus: 'CS3', type: 'handover',
    borrower: 'Nguyễn Đình Thuần', userId: '2274802010123', room: 'G.0201',
    time: '13:00 – 16:00 · 24/11/2026',
    assetCode: 'TB-AT-008', assetName: 'Bộ micro không dây Shure BLX288',
    assetState: 'Sẵn sàng',
    accessories: ['02 Micro cầm tay', '01 Bộ thu sóng', '01 Adapter nguồn', '04 Pin sạc AA']
  },
  {
    code: 'TB1029', campus: 'CS3', type: 'return',
    borrower: 'Nguyễn Đình Thuần', userId: '2274802010123', room: 'B.0205',
    time: '08:00 – 11:00 · 24/11/2026',
    assetCode: 'TB-HB-021', assetName: 'Bộ Hub USB-C & Ổ điện kéo dài 5m',
    assetState: 'Đang được mượn',
    accessories: ['01 Hub USB-C 6-in-1', '01 Ổ điện 6 lỗ dây 5m']
  },
  {
    code: 'TB1028', campus: 'CS1', type: 'handover',
    borrower: 'Trần Khánh Hưng', userId: 'NV-CSVC-011', room: 'A.0201 (CS1)',
    time: '10:00 – 12:00 · 24/11/2026',
    assetCode: 'TB-CM-003', assetName: 'Webcam hội nghị Logitech C922',
    assetState: 'Sẵn sàng',
    accessories: ['01 Webcam C922', '01 Chân đế Tripod']
  }
];

const CHECK_ITEMS = [
  'Ngoại quan vỏ máy nguyên vẹn, không nứt vỡ',
  'Nguồn điện / dung lượng pin đạt chuẩn hoạt động',
  'Tín hiệu kết nối (HDMI / âm thanh / cổng giao tiếp) ổn định',
  'Đầy đủ toàn bộ phụ kiện đi kèm theo danh mục'
];

let mode = 'handover';        // 'handover' (Xuất kho) | 'return' (Thu hồi)
let campusFilter = 'CS3';
let selectedCode = 'TB1031';
let qrVerified = false;
let checks = [false, false, false, false];
let showDamageForm = false;

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getReq = code => REQUESTS.find(r => r.code === code);

function alertBox(kind, title, text, ic = 'alert') {
  return `<div class="alert ${kind}">${icon(ic)}<div>${title ? `<b>${title}</b>` : ''}${text || ''}</div></div>`;
}

/* ===== Modal đối chiếu QR & Lập biên bản (BR2, BR3) ===== */
function setModal(html) {
  const root = $('modalRoot');
  root.innerHTML = `<div class="overlay"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  document.body.classList.add('no-scroll');
  root.querySelector('.overlay').addEventListener('mousedown', e => { if (e.target.classList.contains('overlay')) closeModal(); });
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
}
function closeModal() { $('modalRoot').innerHTML = ''; document.body.classList.remove('no-scroll'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ===== Cột trái: Danh sách đơn đã duyệt & Quét QR (F79, F80, F82) ===== */
function renderQueue() {
  const list = REQUESTS.filter(r => r.type === mode && r.campus === campusFilter);
  if (!list.find(r => r.code === selectedCode)) {
    selectedCode = list.length ? list[0].code : null;
    resetInspection();
  }

  $('handoverQueue').innerHTML = `
    <div class="card-head">
      <h2>${mode === 'handover' ? 'Đơn mượn đã duyệt trong ngày' : 'Thiết bị đang mượn chờ thu hồi'}</h2>
      <span class="count">${list.length} đơn · ${campusFilter}</span>
    </div>

    <div class="seg-tabs">
      <button type="button" class="${mode === 'handover' ? 'active' : ''}" data-mode="handover">1. Kiểm tra &amp; Xuất kho</button>
      <button type="button" class="${mode === 'return' ? 'active' : ''}" data-mode="return">2. Tiếp nhận &amp; Thu hồi</button>
    </div>

    <div class="scan-bar">
      <select id="fCampus" aria-label="Cơ sở VLU">
        <option value="CS3" ${campusFilter === 'CS3' ? 'selected' : ''}>Cơ sở 3</option>
        <option value="CS1" ${campusFilter === 'CS1' ? 'selected' : ''}>Cơ sở 1</option>
        <option value="CS2" ${campusFilter === 'CS2' ? 'selected' : ''}>Cơ sở 2</option>
      </select>
      <input type="text" id="scanInput" placeholder="Quét hoặc nhập mã QR thiết bị (VD: TB-MC-014)...">
      <button type="button" class="btn btn-primary" id="btnScanQr">${icon('qr')} Quét QR</button>
    </div>

    ${list.length ? `
      <div class="req-list">
        ${list.map(r => `
          <article class="req-card ${r.code === selectedCode ? 'selected' : ''}" data-select="${r.code}">
            <div class="req-top">
              <span class="order-code">#${r.code} · <code>${esc(r.assetCode)}</code></span>
              <span class="badge ${r.type === 'handover' ? 'ok' : 'blue'}">${esc(r.assetState)}</span>
            </div>
            <h3 class="req-title">${esc(r.assetName)}</h3>
            <p class="req-meta">Người mượn: <b>${esc(r.borrower)}</b> (${esc(r.userId)}) · Phòng ${esc(r.room)}</p>
            <div class="req-tags">
              <span class="eq-tag">${esc(r.time)}</span>
              <span class="eq-tag">${r.accessories.length} phụ kiện</span>
            </div>
          </article>
        `).join('')}
      </div>
    ` : `<div class="empty">Không có đơn ${mode === 'handover' ? 'chờ xuất kho' : 'chờ thu hồi'} tại ${campusFilter}.</div>`}

    <p class="note">${icon('info')} BR1: Chỉ xuất kho thiết bị trạng thái "Sẵn sàng". BR3: Bắt buộc quét đúng mã QR trước khi bàn giao hoặc nhận trả.</p>
  `;
}

/* ===== Cột phải: Kiểm tra ngoại quan & Xác nhận giao/nhận (F80 - F83) ===== */
function resetInspection() {
  qrVerified = false;
  checks = [false, false, false, false];
  showDamageForm = false;
}

function renderInspection() {
  const panel = $('inspectionPanel');
  const r = getReq(selectedCode);
  if (!r) {
    panel.innerHTML = `<div class="card-head"><h2>Chi tiết kiểm tra kỹ thuật</h2></div><div class="empty">Chọn một đơn ở danh sách bên trái để kiểm tra.</div>`;
    return;
  }

  const allChecked = checks.every(Boolean);
  const canHandover = qrVerified && allChecked && r.assetState === 'Sẵn sàng';
  const canReturnOk = qrVerified && allChecked;

  panel.innerHTML = `
    <div class="card-head">
      <h2>${r.type === 'handover' ? 'Kiểm tra xuất kho' : 'Kiểm tra thiết bị trả'}</h2>
      <span class="count">#${r.code}</span>
    </div>

    <div class="qr-status ${qrVerified ? 'ok' : 'wait'}">
      <span>${qrVerified ? `Đã đối chiếu QR: ${r.assetCode}` : `Chưa quét mã QR thiết bị (${r.assetCode})`}</span>
      <button type="button" class="btn btn-outline" id="btnVerifyModal">${icon('qr')} ${qrVerified ? 'Quét lại' : 'Đối chiếu QR'}</button>
    </div>

    <div class="acc-box">
      <h4>Phụ kiện đi kèm cần kiểm đếm (${r.accessories.length})</h4>
      ${r.accessories.map(a => `<div class="acc-row"><span>${esc(a)}</span><b>Đủ</b></div>`).join('')}
    </div>

    <div class="chk-list">
      ${CHECK_ITEMS.map((label, idx) => `
        <label class="chk-item">
          <span>${label}</span>
          <input type="checkbox" data-chk="${idx}" ${checks[idx] ? 'checked' : ''}>
        </label>
      `).join('')}
    </div>

    ${r.type === 'return' && showDamageForm ? `
      <div class="damage-box">
        <label for="damageNote">Biên bản hư hỏng / thiếu phụ kiện (BR2 → Tự động tạo phiếu sự cố UA1) *</label>
        <textarea id="damageNote" placeholder="Ghi rõ bộ phận hư hỏng hoặc phụ kiện bị thiếu..."></textarea>
      </div>
    ` : ''}

    <div class="panel-actions">
      ${r.type === 'handover' ? `
        <button type="button" class="btn btn-primary btn-block" id="btnConfirmHandover" ${canHandover ? '' : 'disabled'}>
          Xác nhận xuất kho &amp; Bàn giao
        </button>
      ` : `
        <button type="button" class="btn btn-primary btn-block" id="btnConfirmReturn" ${canReturnOk && !showDamageForm ? '' : 'disabled'}>
          Xác nhận đã trả (Đạt chuẩn &rarr; Sẵn sàng)
        </button>
        <button type="button" class="btn btn-outline btn-block" id="btnReportDamage" ${qrVerified ? '' : 'disabled'}>
          ${showDamageForm ? 'Gửi biên bản hư hỏng &amp; Chuyển UA1' : 'Ghi nhận hư hỏng / Thiếu phụ kiện (F83)'}
        </button>
      `}
    </div>
  `;
}

function renderAll() { renderQueue(); renderInspection(); }

/* ===== Xử lý nghiệp vụ Quét QR, Bàn giao & Thu hồi ===== */
function verifyQrCode(inputVal) {
  const r = getReq(selectedCode);
  if (!r) return;
  const code = (inputVal || '').trim().toUpperCase();
  if (code !== r.assetCode && code !== r.code) {
    $('pageNotice').innerHTML = alertBox('err', 'Sai mã QR thiết bị (BR3)', `Mã quét "${esc(code || 'trống')}" không khớp với thiết bị <b>${r.assetCode}</b> của đơn #${r.code}.`);
    return;
  }
  qrVerified = true;
  $('pageNotice').innerHTML = alertBox('ok', 'Đối chiếu QR thành công', `Đã xác thực đúng mã tài sản <b>${r.assetCode}</b> (${r.assetName}).`, 'check');
  renderInspection();
}

function openQrModal() {
  const r = getReq(selectedCode);
  if (!r) return;
  setModal(`
    <div class="m-head"><div><h2>Đối chiếu mã QR thiết bị (BR3)</h2><p>Đơn #${r.code} · Người mượn: ${esc(r.borrower)}</p></div><button type="button" class="m-x" data-close>${icon('x')}</button></div>
    <div class="m-body">
      <div class="qr-verify">
        <small>Mã tài sản cần đối chiếu trên tem thiết bị</small>
        <code>${esc(r.assetCode)}</code>
      </div>
      <div class="f-group">
        <label for="mQrInput">Nhập hoặc quét mã QR *</label>
        <input type="text" id="mQrInput" value="${esc(r.assetCode)}">
      </div>
    </div>
    <div class="m-foot">
      <button type="button" class="btn btn-outline" data-close>Đóng</button>
      <button type="button" class="btn btn-primary" id="mQrOk">Xác nhận khớp mã</button>
    </div>
  `);
  $('mQrOk').addEventListener('click', () => {
    const val = $('mQrInput').value;
    closeModal();
    verifyQrCode(val);
  });
}

function completeHandover() {
  const r = getReq(selectedCode);
  r.type = 'return';
  r.assetState = 'Đang được mượn';
  resetInspection();
  $('pageNotice').innerHTML = alertBox('ok', 'Bàn giao thiết bị thành công (F81)', `Đã xuất kho <b>${r.assetCode}</b> cho ${esc(r.borrower)}. Trạng thái cập nhật sang <b>"Đang được mượn"</b>.`, 'check');
  renderAll();
}

function completeReturnOk() {
  const r = getReq(selectedCode);
  const idx = REQUESTS.indexOf(r);
  if (idx > -1) REQUESTS.splice(idx, 1);
  resetInspection();
  $('pageNotice').innerHTML = alertBox('ok', 'Thu hồi thiết bị hoàn tất (F82)', `Thiết bị <b>${r.assetCode}</b> đạt chuẩn kỹ thuật và đã khôi phục trạng thái <b>"Sẵn sàng"</b>.`, 'check');
  renderAll();
}

function completeReturnDamaged() {
  const r = getReq(selectedCode);
  if (!showDamageForm) {
    showDamageForm = true;
    renderInspection();
    return;
  }
  const note = ($('damageNote')?.value || '').trim();
  if (!note) {
    $('pageNotice').innerHTML = alertBox('err', 'Thiếu nội dung biên bản (BR2)', 'Vui lòng mô tả chi tiết hư hỏng hoặc phụ kiện bị thiếu trước khi xác nhận.');
    return;
  }
  const idx = REQUESTS.indexOf(r);
  if (idx > -1) REQUESTS.splice(idx, 1);
  resetInspection();
  $('pageNotice').innerHTML = alertBox('warn', 'Đã lập biên bản hư hỏng & chuyển sang UA1 (F83)', `Thiết bị <b>${r.assetCode}</b> đã khóa mượn và tự động sinh phiếu sự cố: "${esc(note)}".`);
  renderAll();
}

/* ===== Khởi tạo trang UA2 ===== */
function initUA2() {
  $('dateChip').innerHTML = `${icon('calendar')} Thứ Ba, 24/11/2026`;
  $('pageAlert').innerHTML = alertBox('brand', 'Quy trình kiểm tra & bàn giao kỹ thuật (BR1 – BR3)', 'Quét mã QR thiết bị, kiểm tra ngoại quan và phụ kiện đi kèm trước khi xác nhận xuất kho hoặc thu hồi.');

  renderAll();

  $('handoverQueue').addEventListener('click', e => {
    const tabBtn = e.target.closest('[data-mode]');
    const card = e.target.closest('[data-select]');
    if (tabBtn) { mode = tabBtn.dataset.mode; $('pageNotice').innerHTML = ''; resetInspection(); renderAll(); }
    if (card) { selectedCode = card.dataset.select; resetInspection(); renderAll(); }
    if (e.target.closest('#btnScanQr')) verifyQrCode($('scanInput').value);
  });

  $('handoverQueue').addEventListener('change', e => {
    if (e.target.id === 'fCampus') { campusFilter = e.target.value; resetInspection(); renderAll(); }
  });

  $('inspectionPanel').addEventListener('change', e => {
    if (e.target.dataset.chk !== undefined) {
      checks[Number(e.target.dataset.chk)] = e.target.checked;
      renderInspection();
    }
  });

  $('inspectionPanel').addEventListener('click', e => {
    if (e.target.closest('#btnVerifyModal')) openQrModal();
    if (e.target.closest('#btnConfirmHandover')) completeHandover();
    if (e.target.closest('#btnConfirmReturn')) completeReturnOk();
    if (e.target.closest('#btnReportDamage')) completeReturnDamaged();
  });
}

document.addEventListener('DOMContentLoaded', initUA2);
