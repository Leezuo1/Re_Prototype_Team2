/* Đội ngũ kỹ thuật · Quản lý Modal chi tiết, cập nhật xử lý & nghiệm thu sự cố */

function setModal(html, variant = '') {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="overlay ${variant}"><div class="modal ${variant}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">${html}</div></div>`;
  document.body.classList.add('no-scroll');
  root.querySelector('.overlay').addEventListener('mousedown', e => {
    if (e.target.classList.contains('overlay')) closeModal();
  });
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  const dialog = root.querySelector('.modal');
  if (typeof trapDialog === 'function') trapDialog(dialog, closeModal);
  return dialog;
}

function closeModal() {
  if (typeof dialogCleanup === 'function') dialogCleanup();
  document.getElementById('modalRoot').innerHTML = '';
  document.body.classList.remove('no-scroll');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

const mHead = (title, sub) => `
  <div class="m-head">
    <div><h2 id="modalTitle">${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>
    <button type="button" class="m-x" data-close aria-label="Đóng">${icon('x')}</button>
  </div>`;
const mFoot = (html, cls = '') => `<div class="m-foot ${cls}">${html}</div>`;
const getTicket = code => TICKETS.find(t => t.code === code);

function sumBox(t) {
  return `
    <div class="sum">
      <h3>${esc(t.title)}</h3>
      <div class="kv">
        <p>Phòng: <b>${esc(t.room)} (${esc(t.campus)})</b></p>
        <p>Mã thiết bị: <b>${esc(t.assetId)}</b></p>
        <p>Người báo: <b>${esc(t.reporter)}</b></p>
        <p>Thời điểm: <b>${esc(t.createdAt)}</b></p>
      </div>
    </div>`;
}

/* =====================================================
1. TIẾP NHẬN & PHÂN LOẠI MỨC ĐỘ ƯU TIÊN (Bước 1-2 | F75, BR2)
   ===================================================== */
const PRIORITIES = [
  { id: 'urgent', label: 'Khẩn cấp (SLA ≤ 15p)' },
  { id: 'medium', label: 'Trung bình' },
  { id: 'low', label: 'Thấp' }
];

function openInspect(code) {
  const t = getTicket(code);
  renderInspect(t, { priority: t.priority || 'urgent', note: '' });
}

function renderInspect(t, st) {
  const histRows = (t.history || []).map(h =>
    `<tr><td>${esc(h.date)}</td><td>${esc(h.type)}</td><td>${esc(h.content)}</td></tr>`
  ).join('') || '<tr><td colspan="3">Chưa có lịch sử bảo trì trước đó.</td></tr>';

  const m = setModal(`
    ${mHead(`Tiếp nhận sự cố #${t.code}`, `${t.room} · ${t.assetName}`)}
    <div class="m-body">
      ${st.priority === 'urgent'
        ? alertBox('err', 'Cảnh báo SLA Khẩn cấp (BR2)', 'Ca học đang diễn ra, bắt buộc phản hồi và tiếp nhận trong vòng 15 phút.')
        : ''}
      ${sumBox(t)}

      <div class="f-group">
        <label>Mô tả lỗi &amp; hình ảnh hiện trường</label>
        <p class="muted">${esc(t.desc)}</p>
        ${t.photo ? `<div class="img-preview"><img src="${esc(t.photo)}" alt="Ảnh lỗi thiết bị"></div>` : ''}
      </div>

      <div class="f-group">
        <label>Lịch sử bảo trì thiết bị (${esc(t.assetId)})</label>
        <table class="hist-table">
          <thead><tr><th>Ngày</th><th>Loại</th><th>Nội dung kỹ thuật</th></tr></thead>
          <tbody>${histRows}</tbody>
        </table>
      </div>

      <div class="f-group">
        <label>Phân loại mức độ ưu tiên *</label>
        <div class="seg">
          ${PRIORITIES.map(p => `<button type="button" class="${p.id === st.priority ? 'active' : ''}" data-prio="${p.id}">${p.label}</button>`).join('')}
        </div>
      </div>
    </div>
    ${mFoot(`
      <button type="button" class="btn btn-outline" data-close>Đóng</button>
      <button type="button" class="btn btn-primary" id="btnAccept">Xác nhận tiếp nhận</button>
    `)}
  `, 'modal-lg');

  m.querySelectorAll('[data-prio]').forEach(b => b.addEventListener('click', () => {
    st.priority = b.dataset.prio;
    renderInspect(t, st);
  }));

  const btn = m.querySelector('#btnAccept');
  btn.addEventListener('click', () => submitWithLoading(btn, () => {
    t.priority = st.priority;
    t.status = 'processing';
    t.logs.push({ time: 'Vừa xong', text: `Đã tiếp nhận xử lý (Mức độ: ${PRIORITIES.find(p => p.id === st.priority).label})` });
    closeModal();
    renderTickets();
    renderAssigned();
    showAssignedBanner('ok', 'Đã tiếp nhận phiếu', `Phiếu #${t.code} đã chuyển sang trạng thái Đang xử lý.`);
  }));
}

/* =====================================================
2. CHI TIẾT & ĐIỀU PHỐI XỬ LÝ (Drawer | F76 - F78)
   ===================================================== */
function openTicketDetail(code) {
  const t = getTicket(code);
  const steps = t.logs.map(l =>
    `<li class="done"><span class="dot">${icon('check')}</span><div><b>${esc(l.text)}</b><small>${esc(l.time)}</small></div></li>`
  ).join('');

  let foot = '<button type="button" class="btn btn-outline" data-close>Đóng</button>';
  if (t.status === 'pending') {
    foot = mFoot(`<button class="btn btn-outline" data-close>Đóng</button><button class="btn btn-primary" id="dInspect">Đánh giá &amp; Tiếp nhận</button>`);
  } else if (t.status === 'processing' || t.status === 'locked') {
    foot = mFoot(`
      <button class="btn btn-outline" id="dSwap">Đổi máy dự phòng</button>
      <button class="btn btn-outline" id="dProg">Cập nhật tiến độ</button>
      <button class="btn btn-primary" id="dClose">Nghiệm thu</button>
    `);
  } else {
    foot = mFoot(foot, 'full');
  }

  const m = setModal(`
    ${mHead(`Phiếu sự cố #${t.code}`, `${t.room} · ${t.campus}`)}
    <div class="m-body">
      ${t.status === 'locked'
        ? alertBox('err', 'Thiết bị đang khóa mượn (BR3)', `Mã ${t.assetId} đã chuyển sang "Đang bảo trì / Hỏng".`)
        : ''}
      ${sumBox(t)}
      <p class="muted">${esc(t.desc)}</p>
      <h4 class="sec">Nhật ký xử lý kỹ thuật</h4>
      <ol class="tl">${steps}</ol>
    </div>
    ${foot}
  `, 'drawer');

  const bind = (id, fn) => { const el = m.querySelector(id); if (el) el.addEventListener('click', fn); };
  bind('#dInspect', () => openInspect(t.code));
  bind('#dProg', () => openProgress(t.code));
  bind('#dSwap', () => openDeviceSwap(t.code));
  bind('#dClose', () => openAcceptance(t.code));
}

/* =====================================================
3. CẬP NHẬT TIẾN ĐỘ & ĐỔI THIẾT BỊ DỰ PHÒNG (Bước 3 | F76, F77, BR3)
   ===================================================== */
function openProgress(code) {
  const t = getTicket(code);
  const m = setModal(`
    ${mHead(`Cập nhật tiến độ #${t.code}`, `${t.room} · ${t.assetId}`)}
    <div class="m-body">
      <div class="f-group">
        <label for="pMethod">Phương án xử lý *</label>
        <select id="pMethod">
          <option value="Sửa chữa tại chỗ">Sửa chữa / hiệu chỉnh tại chỗ</option>
          <option value="Thay linh kiện tiêu hao">Thay thế linh kiện tiêu hao (bóng đèn, pin, dây cáp)</option>
          <option value="Chờ linh kiện từ kho">Chờ cấp phát linh kiện thay thế</option>
        </select>
      </div>
      <div class="f-group">
        <label for="pNote">Ghi chú kỹ thuật *</label>
        <textarea id="pNote" placeholder="Mô tả thao tác đã thực hiện hoặc vật tư đã thay..."></textarea>
        <p class="err" id="pErr" hidden>Vui lòng nhập ghi chú phương án xử lý.</p>
      </div>
    </div>
    ${mFoot(`<button class="btn btn-outline" data-close>Hủy</button><button class="btn btn-primary" id="pSave">Lưu tiến độ</button>`)}
  `);

  const saveBtn = m.querySelector('#pSave');
  saveBtn.addEventListener('click', () => {
    const method = m.querySelector('#pMethod').value;
    const note = m.querySelector('#pNote').value.trim();
    if (!note) { m.querySelector('#pErr').hidden = false; return; }

    submitWithLoading(saveBtn, () => {
      t.logs.push({ time: 'Vừa xong', text: `${method}: ${note}` });
      closeModal();
      renderAssigned();
      showAssignedBanner('ok', 'Đã cập nhật tiến độ', `Lưu lịch sử xử lý cho phiếu #${t.code}.`);
    });
  });
}

function openDeviceSwap(code) {
  const t = getTicket(code);
  const m = setModal(`
    ${mHead(`Khóa thiết bị & Đổi máy dự phòng`, `Phiếu #${t.code} · ${t.assetId}`)}
    <div class="m-body">
      <div class="lock-box">
        <b>Quy tắc nghiệp vụ BR3:</b> Thiết bị <b>${esc(t.assetId)}</b> sẽ tự động khóa sang trạng thái <b>"Đang bảo trì / Hỏng"</b> để ngăn đăng ký mượn mới.
      </div>
      <div class="f-group">
        <label for="sBackup">Thiết bị dự phòng cấp bù / Đề xuất bảo hành *</label>
        <select id="sBackup">
          <option value="Cấp bù TB-DỰ-PHÒNG-01 từ Kho CS3">Cấp bù TB-DỰ-PHÒNG-01 từ Kho CS3</option>
          <option value="Cấp bù TB-DỰ-PHÒNG-02 từ Kho CS3">Cấp bù TB-DỰ-PHÒNG-02 từ Kho CS3</option>
          <option value="Lập phiếu gửi bảo hành đơn vị ngoài">Không đổi máy – Lập phiếu bảo hành ngoài</option>
        </select>
      </div>
      <div class="f-group">
        <label for="sReason">Tình trạng hư hỏng thiết bị gốc *</label>
        <textarea id="sReason" placeholder="Ghi rõ lỗi phần cứng không thể khắc phục tại chỗ..."></textarea>
        <p class="err" id="sErr" hidden>Vui lòng nhập tình trạng hư hỏng.</p>
      </div>
    </div>
    ${mFoot(`<button class="btn btn-outline" data-close>Hủy</button><button class="btn btn-danger" id="sConfirm">Khóa máy &amp; Xác nhận</button>`)}
  `);

  const btn = m.querySelector('#sConfirm');
  btn.addEventListener('click', () => {
    const reason = m.querySelector('#sReason').value.trim();
    const action = m.querySelector('#sBackup').value;
    if (!reason) { m.querySelector('#sErr').hidden = false; return; }

    submitWithLoading(btn, () => {
      t.status = 'locked';
      t.deviceLocked = true;
      t.logs.push({ time: 'Vừa xong', text: `Khóa ${t.assetId} (${reason}) · ${action}` });
      closeModal();
      renderTickets();
      renderAssigned();
      showAssignedBanner('warn', 'Đã khóa thiết bị hỏng (BR3)', `${t.assetId} đã ngừng cho mượn và ghi nhận đề xuất đổi máy.`);
    });
  });
}

/* =====================================================
4. NGHIỆM THU & ĐÓNG PHIẾU SỰ CỐ (Bước 4-5 | F78, PB-78, BR4)
   ===================================================== */
function openAcceptance(code) {
  const t = getTicket(code);
  let proofFile = null;

  const m = setModal(`
    ${mHead(`Nghiệm thu & Đóng phiếu #${t.code}`, `${t.room} · ${t.assetId}`)}
    <div class="m-body">
      ${alertBox('brand', 'Quy định nghiệm thu (BR4)', 'Bắt buộc đính kèm ảnh chụp thiết bị hoạt động bình thường hoặc biên bản xác nhận trước khi đóng phiếu.')}
      <div class="f-group">
        <label>Ảnh / Biên bản nghiệm thu *</label>
        <button type="button" class="drop" id="aDrop">
          <span id="aDropText">Nhấn để tải lên ảnh nghiệm thu hoặc biên bản</span>
          <small>JPG, PNG, PDF · Tối đa 10 MB</small>
        </button>
        <input type="file" id="aFile" accept="image/*,.pdf" hidden>
        <p class="err" id="aFileErr" hidden>Vui lòng đính kèm ảnh hoặc biên bản nghiệm thu (BR4).</p>
      </div>
      <div class="f-group">
        <label for="aNote">Kết quả kiểm tra sau sửa chữa *</label>
        <textarea id="aNote" placeholder="VD: Đã thay cáp và kiểm tra tín hiệu ổn định..."></textarea>
        <p class="err" id="aNoteErr" hidden>Vui lòng nhập kết quả nghiệm thu.</p>
      </div>
      <label style="display:flex;gap:8px;font-size:12px;">
        <input type="checkbox" id="aReady" checked>
        Khôi phục trạng thái <b>"Sẵn sàng sử dụng"</b> &amp; gửi thông báo cho người báo lỗi.
      </label>
    </div>
    ${mFoot(`<button class="btn btn-outline" data-close>Quay lại</button><button class="btn btn-primary" id="aSubmit">Hoàn tất &amp; Đóng phiếu</button>`)}
  `);

  const fileInput = m.querySelector('#aFile');
  const dropBtn = m.querySelector('#aDrop');
  dropBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f || f.size > 10 * 1024 * 1024) return;
    proofFile = f.name;
    dropBtn.classList.add('has');
    m.querySelector('#aDropText').textContent = `Đã chọn: ${f.name}`;
    m.querySelector('#aFileErr').hidden = true;
  });

  const submitBtn = m.querySelector('#aSubmit');
  submitBtn.addEventListener('click', () => {
    const note = m.querySelector('#aNote').value.trim();
    m.querySelector('#aFileErr').hidden = !!proofFile;
    m.querySelector('#aNoteErr').hidden = !!note;
    if (!proofFile || !note) return;

    submitWithLoading(submitBtn, () => {
      t.status = 'closed';
      t.deviceLocked = false;
      t.logs.push({ time: 'Vừa xong', text: `Nghiệm thu hoàn tất (${proofFile}): ${note} → Trạng thái: Sẵn sàng sử dụng` });
      closeModal();
      renderTickets();
      renderAssigned();
      showAssignedBanner('ok', 'Đã đóng phiếu sự cố', `Thiết bị ${t.assetId} đã khôi phục "Sẵn sàng sử dụng" và gửi thông báo tới ${t.reporter}.`);
    });
  });
}
