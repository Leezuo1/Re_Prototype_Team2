/* js/ua1-modals.js — Các hộp thoại xử lý sự cố (UA1 - Đội ngũ Kỹ thuật) */

let activeDialogCloser = null;

function openModalBox(contentHtml, mode = '') {
  const host = document.getElementById('modalRoot');
  if (!host) return null;

  host.innerHTML = `
    <div class="overlay ${mode}">
      <div class="modal ${mode}" role="dialog" aria-modal="true" aria-labelledby="dlgTitle">
        ${contentHtml}
      </div>
    </div>`;

  document.body.classList.add('no-scroll');

  host.querySelector('.overlay').addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('overlay')) closeModalBox();
  });
  host.querySelectorAll('[data-dismiss]').forEach((btn) => {
    btn.addEventListener('click', closeModalBox);
  });

  const dialog = host.querySelector('.modal');
  if (typeof bindDialogFocus === 'function') {
    activeDialogCloser = bindDialogFocus(dialog, closeModalBox);
  }
  return dialog;
}

function closeModalBox() {
  if (typeof activeDialogCloser === 'function') {
    activeDialogCloser();
    activeDialogCloser = null;
  }
  const host = document.getElementById('modalRoot');
  if (host) host.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

const modalHeader = (title, subtitle = '') => `
  <div class="m-head">
    <div>
      <h2 id="dlgTitle">${title}</h2>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
    <button type="button" class="m-x" data-dismiss aria-label="Đóng">✕</button>
  </div>`;

const modalFooter = (buttonsHtml, extraClass = '') =>
  `<div class="m-foot ${extraClass}">${buttonsHtml}</div>`;

const findTicket = (id) => TICKETS.find((t) => t.id === id);

const PRIORITY_TEXT = {
  urgent: 'Khẩn cấp (Đang có tiết)',
  medium: 'Trung bình',
  low: 'Thấp'
};

const TICKET_STATUS_TEXT = {
  pending: 'Chờ tiếp nhận',
  processing: 'Đang xử lý',
  waiting_parts: 'Chờ linh kiện / Đổi thiết bị',
  resolved: 'Đã hoàn tất'
};

/* =====================================================
   1. NGĂN CHI TIẾT PHIẾU SỰ CỐ & LỊCH SỬ BẢO TRÌ (F75, F88)
   ===================================================== */
function buildTicketSteps(t) {
  const row = (state, iconName, label, timeText) => `
    <li class="${state}">
      <span class="dot">${iconName ? renderIcon(iconName) : ''}</span>
      <div><b>${label}</b><small>${timeText}</small></div>
    </li>`;

  let html = row('done', 'bell', 'Tiếp nhận báo hỏng', `${t.createdAt} · ${t.reporter}`);

  if (t.status === 'pending') {
    html += row('todo', '', 'Đánh giá & phân loại mức độ', 'Chưa phân công xử lý');
    html += row('todo', '', 'Nghiệm thu & đóng phiếu', 'Cần ảnh/biên bản xác nhận (BR4)');
  } else if (t.status === 'processing' || t.status === 'waiting_parts') {
    html += row('done', 'wrench', 'Đang khắc phục sự cố', t.planNote || 'Kỹ thuật viên đang kiểm tra tại phòng');
    html += row('todo', '', 'Nghiệm thu & đóng phiếu', 'Chờ cập nhật ảnh sau sửa chữa');
  } else {
    html += row('done', 'wrench', 'Đã khắc phục', t.planNote || 'Hoàn tất sửa chữa');
    html += row('done', 'check', 'Đã nghiệm thu & đóng phiếu', `${t.resolvedAt || 'Vừa xong'} · Đã báo người gửi`);
  }

  return `<h4 class="sec">Tiến trình xử lý sự cố</h4><ol class="tl">${html}</ol>`;
}

function openTicketDrawer(ticketId, bannerMsg = '') {
  const t = findTicket(ticketId);
  if (!t) return;

  let body = '';
  if (bannerMsg) {
    body += `<div class="alert ok">${renderIcon('check')} <span>${bannerMsg}</span></div>`;
  }

  body += `
    <div class="status-line">
      <span class="badge st-${t.status}">${TICKET_STATUS_TEXT[t.status]}</span>
      <span class="badge pri-${t.priority}">${PRIORITY_TEXT[t.priority]}</span>
    </div>

    <div class="sum">
      <h3>Phòng ${t.room} · ${t.campus}</h3>
      <p><b>Thiết bị:</b> ${t.deviceName} (<code>${t.assetCode}</code>)</p>
      <p><b>Mô tả lỗi:</b> ${t.description}</p>
      <small>Người báo: ${t.reporter} · Lúc ${t.createdAt}</small>
    </div>

    <div class="kv">
      <p><b>Lịch sử bảo trì gần nhất của ${t.assetCode}:</b></p>
      <p class="muted">${t.lastMaintenance || 'Chưa ghi nhận lần sửa chữa nào trước đó.'}</p>
    </div>`;

  if (t.deviceLocked) {
    body += `
      <div class="alert warn">
        ${renderIcon('lock')}
        <span>Thiết bị <b>${t.assetCode}</b> đang ở trạng thái <b>Đang bảo trì / Hỏng</b> (tự động khóa mượn theo BR3).</span>
      </div>`;
  }

  if (t.acceptProof) {
    body += `<div class="file-row">${renderIcon('check')} Minh chứng nghiệm thu: <b>${t.acceptProof}</b></div>`;
  }

  body += `<hr class="line">${buildTicketSteps(t)}`;

  let footerBtns = '<button type="button" class="btn btn-outline" data-dismiss>Đóng</button>';
  if (t.status === 'pending') {
    footerBtns = `
      <button type="button" class="btn btn-outline" data-dismiss>Để sau</button>
      <button type="button" class="btn btn-primary" id="btnStartTriage">Tiếp nhận &amp; Phân loại</button>`;
  } else if (t.status === 'processing' || t.status === 'waiting_parts') {
    footerBtns = `
      <button type="button" class="btn btn-outline" id="btnUpdatePlan">Cập nhật phương án</button>
      <button type="button" class="btn btn-primary" id="btnCloseTicket">Nghiệm thu &amp; Đóng phiếu</button>`;
  }

  const dlg = openModalBox(
    `${modalHeader(`Phiếu sự cố #${t.id}`, `Cơ sở phụ trách: ${t.campus}`)}
     <div class="m-body">${body}</div>
     ${modalFooter(footerBtns)}`,
    'drawer'
  );

  const bind = (selector, handler) => {
    const el = dlg.querySelector(selector);
    if (el) el.addEventListener('click', handler);
  };

  bind('#btnStartTriage', () => openTriageModal(t.id));
  bind('#btnUpdatePlan', () => openPlanModal(t.id));
  bind('#btnCloseTicket', () => openAcceptModal(t.id));
}

/* =====================================================
   2. TIẾP NHẬN & PHÂN LOẠI MỨC ĐỘ ƯU TIÊN (F75, BR1, BR2)
   ===================================================== */
function openTriageModal(ticketId) {
  const t = findTicket(ticketId);
  if (!t) return;

  const dlg = openModalBox(`
    ${modalHeader('Tiếp nhận & Phân loại sự cố', `#${t.id} · Phòng ${t.room} (${t.assetCode})`)}
    <div class="m-body">
      <div class="alert info">
        ${renderIcon('alert')}
        <span><b>Quy tắc BR2:</b> Sự cố mức <b>Khẩn cấp</b> (ảnh hưởng ca học đang diễn ra) phải được tiếp nhận và phản hồi trong vòng <b>15 phút</b>.</span>
      </div>

      <div class="f-group">
        <label for="tPriority">Mức độ ưu tiên xử lý *</label>
        <select id="tPriority">
          <option value="urgent" ${t.priority === 'urgent' ? 'selected' : ''}>Khẩn cấp (Phòng đang có lớp học)</option>
          <option value="medium" ${t.priority === 'medium' ? 'selected' : ''}>Trung bình (Xử lý trong buổi)</option>
          <option value="low" ${t.priority === 'low' ? 'selected' : ''}>Thấp (Bảo trì bổ sung)</option>
        </select>
      </div>

      <div class="f-group">
        <label for="tInitialNote">Ghi chú kiểm tra ban đầu</label>
        <textarea id="tInitialNote" placeholder="VD: Đã tiếp nhận phiếu, mang theo cáp HDMI và bóng đèn dự phòng lên phòng ${t.room}"></textarea>
      </div>
    </div>
    ${modalFooter(`
      <button type="button" class="btn btn-outline" id="tBack">Quay lại</button>
      <button type="button" class="btn btn-primary" id="tConfirm">Xác nhận tiếp nhận</button>`)}
  `);

  dlg.querySelector('#tBack').addEventListener('click', () => openTicketDrawer(t.id));

  const confirmBtn = dlg.querySelector('#tConfirm');
  confirmBtn.addEventListener('click', () => {
    const chosenPriority = dlg.querySelector('#tPriority').value;
    const note = dlg.querySelector('#tInitialNote').value.trim();

    runWithLock(confirmBtn, () => {
      t.priority = chosenPriority;
      t.status = 'processing';
      t.planNote = note || 'Kỹ thuật viên đã tiếp nhận và đang di chuyển kiểm tra';
      if (typeof renderTickets === 'function') renderTickets();
      notifyToast(`Đã tiếp nhận phiếu #${t.id}`);
      openTicketDrawer(t.id, 'Đã chuyển trạng thái sang "Đang xử lý" và gửi phản hồi cho người báo.');
    });
  });
}

/* =====================================================
   3. CẬP NHẬT PHƯƠNG ÁN & ĐỔI THIẾT BỊ DỰ PHÒNG (F76, F77, BR3)
   ===================================================== */
function openPlanModal(ticketId) {
  const t = findTicket(ticketId);
  if (!t) return;

  const dlg = openModalBox(`
    ${modalHeader('Cập nhật tiến trình & Phương án xử lý', `#${t.id} · ${t.deviceName} (${t.assetCode})`)}
    <div class="m-body">
      <div class="f-group">
        <label for="pAction">Phương án kỹ thuật *</label>
        <select id="pAction">
          <option value="onsite">Sửa chữa / hiệu chỉnh trực tiếp tại phòng</option>
          <option value="replace_part">Thay thế linh kiện từ kho vật tư</option>
          <option value="swap_backup">Lỗi nặng – Khóa thiết bị &amp; đề xuất đổi máy dự phòng</option>
        </select>
      </div>

      <div class="alert warn" id="br3Hint" hidden>
        ${renderIcon('lock')}
        <span><b>Quy tắc BR3:</b> Hệ thống sẽ tự động khóa trạng thái <b>${t.assetCode}</b> sang <b>"Đang bảo trì / Hỏng"</b> để chặn lượt mượn mới và tạo phiếu xuất thiết bị dự phòng.</span>
      </div>

      <div class="f-group">
        <label for="pDetail">Nội dung thực hiện / Linh kiện cần cấp *</label>
        <textarea id="pDetail" placeholder="Nhập chi tiết phương án xử lý hoặc mã thiết bị dự phòng thay thế..."></textarea>
        <p class="err" id="pErr" hidden>Vui lòng nhập nội dung phương án xử lý.</p>
      </div>
    </div>
    ${modalFooter(`
      <button type="button" class="btn btn-outline" id="pBack">Quay lại</button>
      <button type="button" class="btn btn-primary" id="pSave">Lưu tiến trình</button>`)}
  `);

  const actionSelect = dlg.querySelector('#pAction');
  const br3Hint = dlg.querySelector('#br3Hint');
  const errEl = dlg.querySelector('#pErr');

  actionSelect.addEventListener('change', () => {
    br3Hint.hidden = actionSelect.value !== 'swap_backup';
  });

  dlg.querySelector('#pBack').addEventListener('click', () => openTicketDrawer(t.id));

  const saveBtn = dlg.querySelector('#pSave');
  saveBtn.addEventListener('click', () => {
    const detail = dlg.querySelector('#pDetail').value.trim();
    if (!detail) {
      errEl.hidden = false;
      return;
    }
    errEl.hidden = true;

    const isHeavyFault = actionSelect.value === 'swap_backup';
    runWithLock(saveBtn, () => {
      t.status = isHeavyFault ? 'waiting_parts' : 'processing';
      t.deviceLocked = isHeavyFault;
      t.planNote = detail;
      if (typeof renderTickets === 'function') renderTickets();
      notifyToast(isHeavyFault ? `Đã khóa thiết bị ${t.assetCode} & tạo phiếu đổi máy` : 'Đã cập nhật tiến độ xử lý');
      openTicketDrawer(
        t.id,
        isHeavyFault
          ? `Đã khóa cho mượn đối với ${t.assetCode} và gửi yêu cầu cấp thiết bị dự phòng.`
          : 'Đã lưu phương án xử lý lên hệ thống.'
      );
    });
  });
}

/* =====================================================
   4. NGHIỆM THU & ĐÓNG PHIẾU SỰ CỐ (F78, BR4)
   ===================================================== */
function openAcceptModal(ticketId) {
  const t = findTicket(ticketId);
  if (!t) return;
  let uploadedFile = null;

  const dlg = openModalBox(`
    ${modalHeader('Nghiệm thu & Đóng phiếu sự cố', `#${t.id} · Phòng ${t.room}`)}
    <div class="m-body">
      <div class="alert info">
        ${renderIcon('check')}
        <span><b>Quy tắc BR4:</b> Phiếu sự cố chỉ được đóng khi có ảnh chụp nghiệm thu sau sửa chữa hoặc biên bản xác nhận của giảng viên/quản lý phòng.</span>
      </div>

      <div class="f-group">
        <label for="aFile">Ảnh nghiệm thu / Biên bản xác nhận *</label>
        <input type="file" id="aFile" accept=".jpg,.jpeg,.png,.pdf">
        <small class="muted" id="aFileName">Chưa chọn tệp (Hỗ trợ JPG, PNG, PDF)</small>
        <p class="err" id="aFileErr" hidden>Bắt buộc đính kèm ảnh nghiệm thu hoặc biên bản trước khi đóng phiếu (BR4).</p>
      </div>

      <div class="f-group">
        <label for="aSummary">Kết quả khắc phục lưu hồ sơ thiết bị *</label>
        <textarea id="aSummary" placeholder="VD: Đã thay cáp tín hiệu HDMI và kiểm tra hình ảnh máy chiếu hoạt động ổn định."></textarea>
      </div>
    </div>
    ${modalFooter(`
      <button type="button" class="btn btn-outline" id="aBack">Quay lại</button>
      <button type="button" class="btn btn-primary" id="aFinish">Hoàn tất &amp; Đóng phiếu</button>`)}
  `);

  const fileInput = dlg.querySelector('#aFile');
  const fileLabel = dlg.querySelector('#aFileName');
  const fileErr = dlg.querySelector('#aFileErr');

  fileInput.addEventListener('change', () => {
    uploadedFile = fileInput.files[0] || null;
    fileLabel.textContent = uploadedFile ? `Đã chọn: ${uploadedFile.name}` : 'Chưa chọn tệp (Hỗ trợ JPG, PNG, PDF)';
    if (uploadedFile) fileErr.hidden = true;
  });

  dlg.querySelector('#aBack').addEventListener('click', () => openTicketDrawer(t.id));

  const finishBtn = dlg.querySelector('#aFinish');
  finishBtn.addEventListener('click', () => {
    if (!uploadedFile) {
      fileErr.hidden = false;
      return;
    }

    const summary = dlg.querySelector('#aSummary').value.trim();
    runWithLock(finishBtn, () => {
      t.status = 'resolved';
      t.deviceLocked = false;
      t.acceptProof = uploadedFile.name;
      t.resolvedAt = 'Hôm nay';
      if (summary) {
        t.planNote = summary;
        t.lastMaintenance = `Hôm nay – ${summary}`;
      }
      if (typeof renderTickets === 'function') renderTickets();
      notifyToast(`Đã đóng phiếu #${t.id} & mở lại trạng thái Sẵn sàng`);
      openTicketDrawer(t.id, `Thiết bị ${t.assetCode} đã chuyển về trạng thái "Sẵn sàng sử dụng" và gửi thông báo cho ${t.reporter}.`);
    });
  });
}
