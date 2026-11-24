/* Đội ngũ kỹ thuật · Kiểm tra kỹ thuật xuất kho, quét QR đối chiếu & thu hồi thiết bị mượn/trả */

document.addEventListener('DOMContentLoaded', () => {
  const borrowOrders = [
    {
      orderId: 'PM-2026-105',
      borrower: 'Nguyễn Đình Thuần (2274802010123)',
      campus: 'Cơ sở 3',
      room: 'G.03.05',
      deviceCode: 'QR-TB-009',
      deviceName: 'Bộ Micro không dây & Hub USB-C',
      timeSlot: '09:00 - 11:30 (23/11/2026)',
      status: 'Chờ xuất kho'
    },
    {
      orderId: 'PM-2026-102',
      borrower: 'GV. Lê Gia Hiếu (VLU-GV088)',
      campus: 'Cơ sở 3',
      room: 'F.05.01',
      deviceCode: 'QR-TB-014',
      deviceName: 'Cáp HDMI 5m & Remote máy chiếu',
      timeSlot: '07:00 - 09:30 (23/11/2026)',
      status: 'Đang được mượn'
    }
  ];

  const orderTbody = document.getElementById('ua2-orders-tbody');
  const qrInput = document.getElementById('ua2-qr-input');
  const scanBtn = document.getElementById('ua2-btn-scan-qr');
  const scanFeedback = document.getElementById('ua2-qr-feedback');

  function renderOrders() {
    if (!orderTbody) return;
    orderTbody.innerHTML = borrowOrders.map((o) => `
      <tr>
        <td><strong>${o.orderId}</strong></td>
        <td>${o.borrower}</td>
        <td>${o.deviceName} <small>[${o.deviceCode}]</small></td>
        <td>${o.campus} - ${o.room}</td>
        <td>${o.status}</td>
        <td>
          ${o.status === 'Chờ xuất kho' ? `<button class="btn-vlu" data-action="handover" data-id="${o.orderId}">Kiểm tra & Bàn giao</button>` : ''}
          ${o.status === 'Đang được mượn' ? `<button class="btn-vlu" data-action="return-ok" data-id="${o.orderId}">Thu hồi đạt chuẩn</button>
          <button class="btn-secondary" data-action="return-defect" data-id="${o.orderId}">Báo lỗi / Thiếu đồ</button>` : ''}
        </td>
      </tr>
    `).join('');
  }

  // BR3: Đối chiếu mã QR/Barcode thiết bị trước khi xuất kho hoặc nhận trả
  function verifyQrMatch(expectedCode) {
    const scanned = qrInput ? qrInput.value.trim() : '';
    if (scanned !== expectedCode) {
      const msg = `Mã QR không khớp! Yêu cầu quét đúng mã [${expectedCode}] trước khi xác nhận (BR3).`;
      if (scanFeedback) scanFeedback.textContent = msg;
      alert(msg);
      return false;
    }
    if (scanFeedback) scanFeedback.textContent = `Đã xác thực mã thiết bị ${expectedCode}.`;
    return true;
  }

  if (scanBtn && qrInput) {
    scanBtn.addEventListener('click', () => {
      const code = qrInput.value.trim();
      const found = borrowOrders.find((o) => o.deviceCode === code);
      scanFeedback.textContent = found
        ? `Khớp đơn ${found.orderId} - ${found.deviceName} (${found.status}).`
        : 'Không tìm thấy phiếu mượn tương ứng với mã QR này.';
    });
  }

  if (orderTbody) {
    orderTbody.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const order = borrowOrders.find((o) => o.orderId === btn.dataset.id);
      if (!order || !verifyQrMatch(order.deviceCode)) return;

      if (btn.dataset.action === 'handover') {
        // BR1: Xác nhận đạt chuẩn ngoại quan, pin, dây cáp, tín hiệu trước khi xuất kho
        order.status = 'Đang được mượn';
        alert(`Đã kiểm tra đạt chuẩn kỹ thuật và bàn giao ${order.deviceName} cho ${order.borrower}.`);
      } else if (btn.dataset.action === 'return-ok') {
        order.status = 'Đã trả (Sẵn sàng)';
        alert(`Đã thu hồi ${order.deviceName}. Trạng thái thiết bị cập nhật về "Sẵn sàng".`);
      } else if (btn.dataset.action === 'return-defect') {
        // BR2: Lập biên bản hư hỏng/thiếu phụ kiện và chuyển sang luồng UA1
        const issueNote = prompt('Nhập mô tả hư hỏng hoặc phụ kiện bị thiếu:', 'Thiếu dây sạc / hư đầu cắm tín hiệu');
        if (!issueNote) return;
        order.status = 'Đã lập biên bản sự cố';
        if (window.UA1Store) {
          window.UA1Store.addIncident({
            id: `SC-${Date.now().toString().slice(-4)}`,
            campus: order.campus,
            room: order.room,
            deviceCode: order.deviceCode,
            deviceName: order.deviceName,
            priority: 'Trung bình',
            status: 'Chờ tiếp nhận',
            slaMinutesLeft: null,
            reporter: `Biên bản trả thiết bị (${order.orderId})`,
            reportedAt: 'Vừa xong',
            description: issueNote,
            lastMaintenance: 'Chuyển từ UA2',
            techNote: ''
          });
        }
        alert('Đã lập biên bản ghi nhận hư hỏng và chuyển phiếu sự cố sang UA1.');
      }
      renderOrders();
    });
  }

  renderOrders();
});
