/* Đội ngũ kỹ thuật · Quản lý Modal chi tiết, cập nhật xử lý & nghiệm thu sự cố */

const UA1Modals = (() => {
  const modalRoot = document.getElementById('ua1-modal-root') || document.body;

  function closeModal() {
    const existing = document.getElementById('vlu-ua1-modal');
    if (existing) existing.remove();
  }

  function renderShell(title, bodyHtml, footerHtml) {
    closeModal();
    const wrapper = document.createElement('div');
    wrapper.id = 'vlu-ua1-modal';
    wrapper.className = 'vlu-modal-backdrop';
    wrapper.innerHTML = `
      <div class="vlu-modal-box">
        <div class="vlu-modal-head">
          <h3>${title}</h3>
          <button type="button" class="btn-close-modal" aria-label="Đóng">&times;</button>
        </div>
        <div class="vlu-modal-body">${bodyHtml}</div>
        <div class="vlu-modal-foot">${footerHtml}</div>
      </div>
    `;
    wrapper.addEventListener('click', (e) => {
      if (e.target === wrapper || e.target.closest('.btn-close-modal')) closeModal();
    });
    modalRoot.appendChild(wrapper);
    return wrapper;
  }

  // Modal 1: Xem chi tiết & phân loại mức độ ưu tiên (BR1, BR2)
  function openDetailModal(ticket, onSavePriority) {
    const body = `
      <p><strong>Mã phiếu:</strong> ${ticket.id} | <strong>Cơ sở:</strong> ${ticket.campus}</p>
      <p><strong>Phòng / Thiết bị:</strong> ${ticket.room} - ${ticket.deviceName} (${ticket.deviceCode})</p>
      <p><strong>Người báo cáo:</strong> ${ticket.reporter} (${ticket.reportedAt})</p>
      <p><strong>Mô tả lỗi:</strong> ${ticket.description}</p>
      <p><strong>Lịch sử bảo trì gần nhất:</strong> ${ticket.lastMaintenance || 'Chưa có ghi nhận'}</p>
      <label class="vlu-label">Phân loại mức độ ưu tiên (SLA 15p cho Khẩn cấp):</label>
      <select id="modal-priority-select" class="vlu-input">
        <option value="Khẩn cấp" ${ticket.priority === 'Khẩn cấp' ? 'selected' : ''}>Khẩn cấp (Ảnh hưởng ca học)</option>
        <option value="Trung bình" ${ticket.priority === 'Trung bình' ? 'selected' : ''}>Trung bình</option>
        <option value="Thấp" ${ticket.priority === 'Thấp' ? 'selected' : ''}>Thấp</option>
      </select>
    `;
    const foot = `
      <button type="button" class="btn-secondary btn-close-modal">Đóng</button>
      <button type="button" class="btn-vlu" id="btn-save-priority">Lưu phân loại</button>
    `;
    const modal = renderShell(`Chi tiết sự cố ${ticket.id}`, body, foot);
    modal.querySelector('#btn-save-priority').onclick = () => {
      const priority = modal.querySelector('#modal-priority-select').value;
      onSavePriority(ticket.id, priority);
      closeModal();
    };
  }

  // Modal 2: Cập nhật tiến trình & phương án khắc phục (BR3: Khóa thiết bị nếu hỏng nặng)
  function openProcessModal(ticket, onUpdateProcess) {
    const body = `
      <p><strong>Đối tượng:</strong> ${ticket.deviceName} (${ticket.room})</p>
      <label class="vlu-label">Trạng thái xử lý:</label>
      <select id="modal-status-select" class="vlu-input">
        <option value="Đang xử lý" ${ticket.status === 'Đang xử lý' ? 'selected' : ''}>Đang xử lý</option>
        <option value="Chờ linh kiện" ${ticket.status === 'Chờ linh kiện' ? 'selected' : ''}>Chờ linh kiện / Đổi thiết bị dự phòng</option>
      </select>
      <label class="vlu-label">Phương án kỹ thuật:</label>
      <select id="modal-method-select" class="vlu-input">
        <option value="Sửa tại chỗ">Sửa tại chỗ</option>
        <option value="Thay linh kiện">Thay linh kiện</option>
        <option value="Đề xuất đổi thiết bị dự phòng">Lỗi nặng - Khóa mượn & Đề xuất đổi thiết bị dự phòng</option>
      </select>
      <label class="vlu-label">Ghi chú kỹ thuật:</label>
      <textarea id="modal-tech-note" class="vlu-input" rows="3" placeholder="Nhập chi tiết tình trạng và hướng xử lý...">${ticket.techNote || ''}</textarea>
    `;
    const foot = `
      <button type="button" class="btn-secondary btn-close-modal">Hủy</button>
      <button type="button" class="btn-vlu" id="btn-confirm-process">Cập nhật tiến độ</button>
    `;
    const modal = renderShell(`Cập nhật xử lý - ${ticket.id}`, body, foot);
    modal.querySelector('#btn-confirm-process').onclick = () => {
      const status = modal.querySelector('#modal-status-select').value;
      const method = modal.querySelector('#modal-method-select').value;
      const techNote = modal.querySelector('#modal-tech-note').value.trim();
      const lockBorrowing = method === 'Đề xuất đổi thiết bị dự phòng' || status === 'Chờ linh kiện';
      onUpdateProcess(ticket.id, { status, method, techNote, lockBorrowing });
      closeModal();
    };
  }

  // Modal 3: Nghiệm thu & đóng phiếu (BR4: Bắt buộc có ảnh/biên bản nghiệm thu)
  function openCloseModal(ticket, onConfirmClose) {
    const body = `
      <p>Xác nhận hoàn tất khắc phục sự cố cho <strong>${ticket.deviceName}</strong> tại phòng <strong>${ticket.room}</strong>.</p>
      <label class="vlu-label">Ảnh / Biên bản nghiệm thu sau sửa chữa (*):</label>
      <input type="file" id="modal-proof-file" class="vlu-input" accept="image/*,.pdf">
      <label class="vlu-label">Kết quả nghiệm thu:</label>
      <input type="text" id="modal-close-note" class="vlu-input" value="Thiết bị đã hoạt động bình thường, mở lại trạng thái Sẵn sàng sử dụng.">
      <p id="modal-close-error" style="color:#c8102e;font-size:12px;margin-top:6px;"></p>
    `;
    const foot = `
      <button type="button" class="btn-secondary btn-close-modal">Quay lại</button>
      <button type="button" class="btn-vlu" id="btn-finish-ticket">Hoàn tất & Đóng phiếu</button>
    `;
    const modal = renderShell(`Nghiệm thu đóng phiếu ${ticket.id}`, body, foot);
    modal.querySelector('#btn-finish-ticket').onclick = () => {
      const fileInput = modal.querySelector('#modal-proof-file');
      const errEl = modal.querySelector('#modal-close-error');
      if (!fileInput.files || fileInput.files.length === 0) {
        errEl.textContent = 'Vui lòng đính kèm hình ảnh hoặc biên bản nghiệm thu trước khi đóng phiếu (BR4).';
        return;
      }
      const closeNote = modal.querySelector('#modal-close-note').value.trim();
      onConfirmClose(ticket.id, { proofFileName: fileInput.files[0].name, closeNote });
      closeModal();
    };
  }

  return { openDetailModal, openProcessModal, openCloseModal, closeModal };
})();
