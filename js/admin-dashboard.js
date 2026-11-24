/* Admin · Tổng quan: chỉ số, việc cần chú ý, biểu đồ (dữ liệu mẫu) */

const activeRooms = ROOMS.filter(r => r.status === 'active').length;
const inUse = 9;

const KPIS = [
  { label: 'Yêu cầu phòng chờ duyệt', value: '7', meta: '3 yêu cầu quá hạn chờ', bad: true, href: 'manager-requests.html' },
  { label: 'Phòng đang sử dụng', value: `${inUse}<small> / ${activeRooms}</small>`, meta: `${Math.round(inUse / activeRooms * 100)}% phòng đang hoạt động`, meter: Math.round(inUse / activeRooms * 100), href: 'admin-catalog.html' },
  { label: 'Thiết bị đang cho mượn', value: '37', meta: '5 phiếu quá hạn trả', bad: true, href: 'admin-catalog.html' },
  { label: 'Sự cố đang mở', value: '5', meta: '2 sự cố ở phòng đang có lớp', bad: true, alerting: true, href: null }
];

const ATTN_TYPES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'incident', label: 'Sự cố ở phòng đang có lớp', ic: 'tool', cls: 'bad' },
  { key: 'request', label: 'Yêu cầu quá hạn duyệt', ic: 'clock', cls: '' },
  { key: 'device', label: 'Thiết bị quá hạn trả', ic: 'monitor', cls: '' },
  { key: 'account', label: 'Tài khoản khóa còn lịch', ic: 'lock', cls: 'info' },
  { key: 'config', label: 'Thiếu cấu hình', ic: 'userCheck', cls: 'neutral' }
];

const ATTN = [
  { t: 'incident', title: 'Máy chiếu không lên hình tại J.06.04', desc: 'Đang có lớp INT1306 · 08:00 – 10:30 · báo lúc 08:12', href: null },
  { t: 'incident', title: 'Mất kết nối mạng tại A.03.01', desc: 'Đang có lớp LAW1105 · 07:00 – 09:30 · báo lúc 07:40', href: null },
  { t: 'request', title: 'Yêu cầu mượn H.01.01 chờ duyệt hơn 24 giờ', desc: 'Khoa CNTT · Hội thảo AI trong giáo dục · người duyệt: TT Hỗ trợ SV', href: 'manager-requests.html' },
  { t: 'request', title: 'Yêu cầu mượn M.04.01 chờ duyệt hơn 12 giờ', desc: 'ThS. Vũ Minh Tâm · Họp triển khai đề tài · người duyệt: Quản lý CSVC', href: 'manager-requests.html' },
  { t: 'request', title: 'Yêu cầu mượn B.04.02 chờ duyệt hơn 8 giờ', desc: 'Lý Tuấn Kiệt · Seminar nhóm · người duyệt: Phòng Đào tạo', href: 'manager-requests.html' },
  { t: 'device', title: 'Laptop Dell Latitude 3440 quá hạn trả 2 ngày', desc: 'Lê Hoài An · phiếu MT1042 · hẹn trả 21/11/2026', href: 'admin-catalog.html' },
  { t: 'device', title: 'Micro không dây Shure (2 chiếc) quá hạn trả 1 ngày', desc: 'Lý Tuấn Kiệt · phiếu MT1051 · hẹn trả 22/11/2026', href: 'admin-catalog.html' },
  { t: 'account', title: 'Tài khoản Võ Thành Đạt đã khóa nhưng còn 1 lịch đặt phòng', desc: 'Lịch đặt J.06.04 ngày 25/11/2026 vẫn đang hiệu lực', href: 'admin-accounts.html' },
  { t: 'config', title: 'Hội trường chưa có người duyệt dự phòng', desc: 'Yêu cầu có thể bị kẹt khi người duyệt chính vắng mặt', href: 'admin-approvers.html' }
];

function renderKpis() {
  $('#kpis').innerHTML = KPIS.map(k => {
    const inner = `
      <span class="label">${k.label}</span>
      <div class="value">${k.value}</div>
      ${k.meter != null ? `<div class="meter" role="img" aria-label="${k.meter}% phòng đang sử dụng"><i style="width:${k.meter}%"></i></div>` : ''}
      <div class="meta ${k.bad ? 'bad' : ''}">${k.meta}</div>`;
    return k.href
      ? `<a class="kpi" href="${k.href}">${inner}</a>`
      : `<a class="kpi" href="#" data-soon="1">${inner}</a>`;
  }).join('');
  $$('[data-soon]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    showToast('Chi tiết sự cố nằm ở màn hình của Phòng CSVC.');
  }));
}

let attnFilter = 'all';
function renderAttn() {
  const counts = {};
  ATTN.forEach(a => counts[a.t] = (counts[a.t] || 0) + 1);
  $('#attnChips').innerHTML = ATTN_TYPES.map(t => {
    const n = t.key === 'all' ? ATTN.length : (counts[t.key] || 0);
    return `<button type="button" class="chip ${t.key === attnFilter ? 'active' : ''}" data-v="${t.key}" aria-pressed="${t.key === attnFilter}">${t.label}<span class="n">${n}</span></button>`;
  }).join('');

  const list = attnFilter === 'all' ? ATTN : ATTN.filter(a => a.t === attnFilter);
  $('#attnCount').textContent = `${list.length} mục`;
  $('#attnList').innerHTML = list.map(a => {
    const t = ATTN_TYPES.find(x => x.key === a.t);
    return `
      <li>
        <span class="attn-ico ${t.cls}">${icon(t.ic)}</span>
        <div class="attn-main"><b>${esc(a.title)}</b><span>${esc(a.desc)}</span></div>
        ${a.href ? `<a class="link-btn" href="${a.href}">Xem</a>` : `<button type="button" class="link-btn" data-soon="1">Xem</button>`}
      </li>`;
  }).join('') || `<li>${emptyState('Không có mục nào cần chú ý', 'Mọi thứ đang ổn.', 'check')}</li>`;
  $$('#attnList [data-soon]').forEach(b => b.addEventListener('click', () => showToast('Chi tiết sự cố nằm ở màn hình của Phòng CSVC.')));
}
bindChips($('#attnChips'), v => { attnFilter = v; renderAttn(); });

function renderCharts() {
  const weeks = [['28/9', 62], ['5/10', 68], ['12/10', 71], ['19/10', 66], ['26/10', 74], ['2/11', 79], ['9/11', 72], ['16/11', 68]];
  $('#usageChart').innerHTML = vbarsHtml(weeks.map(([label, value], i) => ({ label, value, cur: i === weeks.length - 1 })), 100, '%');

  const types = [
    ['Phòng học', 120, 8, 20],
    ['Hội trường', 28, 3, 5],
    ['Phòng họp', 52, 1, 11]
  ];
  const max = Math.max(...types.map(t => t[1] + t[2] + t[3]));
  $('#typeChart').innerHTML = types.map(([name, ok, wait, no]) => `
    <div class="hbar-row">
      <span class="name">${name}</span>
      <div class="hbar-track" title="Đã duyệt ${ok} · Chờ duyệt ${wait} · Từ chối ${no}">
        <i style="width:${ok / max * 100}%"></i><i class="b" style="width:${wait / max * 100}%"></i><i class="c" style="width:${no / max * 100}%"></i>
      </div>
      <span class="val">${ok + wait + no}</span>
    </div>`).join('');
}

function tickClock() {
  const d = new Date();
  $('#liveTime').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

renderKpis(); renderAttn(); renderCharts(); tickClock();
setInterval(tickClock, 30000);
