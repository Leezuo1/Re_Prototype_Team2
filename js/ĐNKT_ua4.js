/* Đội ngũ kỹ thuật · Tra cứu hồ sơ kỹ thuật, điều chuyển vị trí thiết bị & trích xuất báo cáo */

document.addEventListener('DOMContentLoaded', () => {
  const equipmentCatalog = [
    {
      code: 'TB-A402-01',
      name: 'Máy chiếu Epson EB-X51',
      campus: 'Cơ sở 3',
      room: 'A.04.02',
      specs: '3800 ANSI Lumens, XGA, HDMI/VGA',
      warrantyUntil: '12/2027',
      status: 'Đang bảo trì',
      note: 'Đã thay bóng đèn tháng 08/2026'
    },
    {
      code: 'TB-G201-03',
      name: 'Màn hình tương tác Samsung Flip 65"',
      campus: 'Cơ sở 3',
      room: 'G.02.01',
      specs: '4K UHD, Cảm ứng đa điểm, Wifi',
      warrantyUntil: '06/2028',
      status: 'Hoạt động tốt',
      note: 'Hoạt động ổn định'
    },
    {
      code: 'TB-CS1-09',
      name: 'Amply & Loa hội trường JBL',
      campus: 'Cơ sở 1',
      room: 'HT.Trịnh Công Sơn',
      specs: 'Công suất 1200W, 4 kênh',
      warrantyUntil: '03/2027',
      status: 'Hỏng',
      note: 'Chờ linh kiện mạch công suất'
    }
  ];

  const tbody = document.getElementById('ua4-equipment-tbody');
  const searchInput = document.getElementById('ua4-search-input');
  const statusSelect = document.getElementById('ua4-status-select');
  const exportBtn = document.getElementById('ua4-btn-export');

  function getBadgeClass(status) {
    if (status === 'Hoạt động tốt') return 'badge-ok';
    if (status === 'Đang bảo trì') return 'badge-warn';
    return 'badge-err';
  }

  function renderCatalog() {
    if (!tbody) return;
    const keyword = (searchInput?.value || '').toLowerCase().trim();
    const statusFilter = statusSelect?.value || 'ALL';

    const list = equipmentCatalog.filter((eq) => {
      const matchKey = !keyword || eq.code.toLowerCase().includes(keyword) || eq.name.toLowerCase().includes(keyword) || eq.room.toLowerCase().includes(keyword);
      const matchStatus = statusFilter === 'ALL' || eq.status === statusFilter;
      return matchKey && matchStatus;
    });

    tbody.innerHTML = list.map((eq) => `
      <tr>
        <td><strong>${eq.code}</strong></td>
        <td>
          ${eq.name}
          <div style="font-size:12px;color:#666;">${eq.specs} · BH: ${eq.warrantyUntil}</div>
        </td>
        <td>${eq.room} (${eq.campus})</td>
        <td><span class="${getBadgeClass(eq.status)}">${eq.status}</span></td>
        <td>
          <button class="btn-vlu" data-action="edit" data-code="${eq.code}">Cập nhật hồ sơ</button>
          <button class="btn-secondary" data-action="transfer" data-code="${eq.code}">Điều chuyển</button>
        </td>
      </tr>
    `).join('');
  }

  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const eq = equipmentCatalog.find((item) => item.code === btn.dataset.code);
      if (!eq) return;

      if (btn.dataset.action === 'edit') {
        // BR1: Cho phép cập nhật thông số, hạn bảo hành, trạng thái; không cho phép xóa tài sản
        const newSpecs = prompt(`Cập nhật thông số kỹ thuật cho ${eq.code}:`, eq.specs);
        if (newSpecs === null) return;
        const newStatus = prompt('Trạng thái (Hoạt động tốt / Đang bảo trì / Hỏng):', eq.status);
        if (newSpecs.trim()) eq.specs = newSpecs.trim();
        if (newStatus && ['Hoạt động tốt', 'Đang bảo trì', 'Hỏng'].includes(newStatus.trim())) {
          eq.status = newStatus.trim();
        }
        renderCatalog();
      } else if (btn.dataset.action === 'transfer') {
        // BR2: Điều chuyển thiết bị cố định giữa các phòng và cập nhật ngay vị trí mới
        const targetRoom = prompt(`Điều chuyển ${eq.name} từ phòng ${eq.room} sang phòng đích:`, 'A.05.04');
        if (!targetRoom || !targetRoom.trim()) return;
        const oldRoom = eq.room;
        eq.room = targetRoom.trim();
        eq.note = `Điều chuyển từ ${oldRoom} sang ${eq.room}`;
        alert(`Đã cập nhật sơ đồ thiết bị: ${eq.code} chuyển từ ${oldRoom} → ${eq.room}.`);
        renderCatalog();
      }
    });
  }

  // Trích xuất báo cáo tình trạng kỹ thuật (CSV/Excel) gửi Phòng CSVC
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const headers = ['Ma_TB', 'Ten_Thiet_Bi', 'Co_So', 'Phong', 'Trang_Thai', 'Han_Bao_Hanh'];
      const rows = equipmentCatalog.map((e) => [e.code, e.name, e.campus, e.room, e.status, e.warrantyUntil].join(','));
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', 'Bao_Cao_Tinh_Trang_Ky_Thuat_VLU.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  [searchInput, statusSelect].forEach((el) => el && el.addEventListener('input', renderCatalog));
  renderCatalog();
});
