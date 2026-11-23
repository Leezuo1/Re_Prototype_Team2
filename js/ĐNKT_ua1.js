/* Đội ngũ kỹ thuật· Logic quản lý danh sách & xử lý sự cố kỹ thuật theo cơ sở VLU */

document.addEventListener('DOMContentLoaded', () => {
  const tickets = [
    {
      id: 'SC-2026-01',
      campus: 'Cơ sở 3',
      room: 'A.04.02',
      deviceCode: 'TB-MC-042',
      deviceName: 'Máy chiếu Epson EB-X51',
      priority: 'Khẩn cấp',
      status: 'Chờ tiếp nhận',
      slaMinutesLeft: 11,
      reporter: 'GV. Lê Gia Hiếu',
      reportedAt: '08:15 23/11/2026',
      description: 'Máy chiếu không nhận tín hiệu HDMI từ bục giảng khi đang vào ca học.',
      lastMaintenance: '15/10/2026 - Vệ sinh lưới lọc',
      techNote: ''
    },
    {
      id: 'SC-2026-02',
      campus: 'Cơ sở 1',
      room: 'LAB.02.05',
      deviceCode: 'TB-NET-108',
      deviceName: 'Switch mạng Cisco 24-Port',
      priority: 'Trung bình',
      status: 'Đang xử lý',
      slaMinutesLeft: null,
      reporter: 'SV. Nguyễn Đình Thuần',
      reportedAt: '07:45 23/11/2026',
      description: 'Dãy máy tính bàn số 3 mất kết nối mạng LAN.',
      lastMaintenance: '02/09/2026 - Kiểm tra định kỳ',
      techNote: 'Đang kiểm tra đầu bấm cáp RJ45 và port số 12.'
    }
  ];

  // Cho phép UA2 đẩy phiếu sự cố mới sang UA1 khi thiết bị trả bị hư hỏng
  window.UA1Store = {
    addIncident(incident) {
      tickets.unshift(incident);
      renderTickets();
    }
  };

  const tableBody = document.getElementById('ua1-ticket-tbody');
  const campusFilter = document.getElementById('ua1-filter-campus');
  const statusFilter = document.getElementById('ua1-filter-status');

  function renderTickets() {
    if (!tableBody) return;
    const campusVal = campusFilter ? campusFilter.value : 'ALL';
    const statusVal = statusFilter ? statusFilter.value : 'ALL';

    const filtered = tickets.filter((t) =>
      (campusVal === 'ALL' || t.campus === campusVal) &&
      (statusVal === 'ALL' || t.status === statusVal)
    );

    tableBody.innerHTML = filtered.map((t) => `
      <tr>
        <td><strong>${t.id}</strong></td>
        <td>${t.campus} - ${t.room}</td>
        <td>${t.deviceName} <small>(${t.deviceCode})</small></td>
        <td>
          <span class="badge-${t.priority === 'Khẩn cấp' ? 'err' : 'warn'}">${t.priority}</span>
          ${t.priority === 'Khẩn cấp' && t.status === 'Chờ tiếp nhận' ? `<small style="color:#c8102e;display:block;">SLA còn ${t.slaMinutesLeft}p</small>` : ''}
        </td>
        <td>${t.status}</td>
        <td>
          <button class="btn-vlu" data-action="detail" data-id="${t.id}">Chi tiết</button>
          ${t.status !== 'Đã hoàn thành' ? `<button class="btn-vlu" data-action="process" data-id="${t.id}">Xử lý</button>` : ''}
          ${t.status !== 'Đã hoàn thành' ? `<button class="btn-vlu" data-action="close" data-id="${t.id}">Nghiệm thu</button>` : ''}
        </td>
      </tr>
    `).join('');
  }

  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const ticket = tickets.find((item) => item.id === btn.dataset.id);
      if (!ticket || typeof UA1Modals === 'undefined') return;

      if (btn.dataset.action === 'detail') {
        UA1Modals.openDetailModal(ticket, (id, priority) => {
          ticket.priority = priority;
          renderTickets();
        });
      } else if (btn.dataset.action === 'process') {
        UA1Modals.openProcessModal(ticket, (id, payload) => {
          ticket.status = payload.status;
          ticket.techNote = `${payload.method}: ${payload.techNote}`;
          if (payload.lockBorrowing) {
            alert(`Đã khóa tính năng cho mượn đối với thiết bị ${ticket.deviceCode} (BR3).`);
          }
          renderTickets();
        });
      } else if (btn.dataset.action === 'close') {
        UA1Modals.openCloseModal(ticket, (id, payload) => {
          ticket.status = 'Đã hoàn thành';
          ticket.techNote = `${payload.closeNote} (Tệp: ${payload.proofFileName})`;
          alert(`Đã đóng phiếu ${id}, cập nhật thiết bị về "Sẵn sàng sử dụng" và gửi thông báo tới ${ticket.reporter}.`);
          renderTickets();
        });
      }
    });
  }

  [campusFilter, statusFilter].forEach((el) => el && el.addEventListener('change', renderTickets));
  renderTickets();
});
