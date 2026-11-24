/* Admin · Nhật ký hoạt động & xuất báo cáo thống kê (dữ liệu mẫu) */

const LA = 'Vũ Tuấn Linh (Admin)', NHAN = 'Tuyền Quang Minh Nhân (Phòng Đào tạo)', DUYEN = 'Lê Thị Mỹ Duyên (TT Hỗ trợ SV)', TOAN = 'Phạm Quốc Toàn (Quản lý CSVC)';
const LOG = [
  ['2026-11-23 10:42', LA, 'Cấu hình quy định', 'Thời gian nhắc trước giờ kết thúc: 15 → 10 phút'],
  ['2026-11-23 09:15', NHAN, 'Duyệt yêu cầu', 'Duyệt yêu cầu mượn J.07.01 ngày 25/11/2026 (Workshop Kỹ năng số)'],
  ['2026-11-23 08:58', TOAN, 'Từ chối yêu cầu', 'Từ chối yêu cầu mượn M.04.02, lý do: phòng đang bảo trì'],
  ['2026-11-22 16:20', LA, 'Phân quyền', 'Lương Thùy Dung: Sinh viên → Sinh viên, Thư ký khoa / Trợ lý CTSV'],
  ['2026-11-22 14:05', DUYEN, 'Duyệt yêu cầu', 'Duyệt yêu cầu mượn H.02.01 ngày 24/11/2026 (Chung kết CLB Debate)'],
  ['2026-11-22 11:30', LA, 'Đổi trạng thái phòng / thiết bị', 'A.02.04: Hoạt động → Đang bảo trì (4 lịch đặt bị ảnh hưởng)'],
  ['2026-11-21 17:02', LA, 'Xuất báo cáo', 'Báo cáo “Tần suất sử dụng phòng” 01/09 – 20/11/2026 (Excel)'],
  ['2026-11-21 15:48', NHAN, 'Import thời khóa biểu', 'Học kỳ 1 năm 2026–2027: 14.380 buổi học được tạo'],
  ['2026-11-21 10:12', LA, 'Khóa / mở khóa tài khoản', 'Khóa tài khoản Võ Thành Đạt (còn 1 lịch đặt phòng)'],
  ['2026-11-20 16:40', DUYEN, 'Yêu cầu bổ sung', 'Yêu cầu bổ sung quyết định phê duyệt cho hội thảo của Khoa CNTT'],
  ['2026-11-20 09:33', LA, 'Phân công người duyệt', 'Hội trường: người duyệt chính Trương Văn Hiếu → Lê Thị Mỹ Duyên'],
  ['2026-11-19 14:25', LA, 'Đồng bộ tài khoản', 'Thêm 3 tài khoản mới từ email trường'],
  ['2026-11-19 11:08', TOAN, 'Hủy / đổi lịch', 'Đổi lịch họp bộ môn M.03.01 từ 14:00 sang 15:00 ngày 20/11/2026, lý do: trùng lịch Ban Giám hiệu'],
  ['2026-11-18 15:50', LA, 'Import danh mục', 'danh-muc-hoc-ky-1-2026.xlsx: 46 dòng thành công, 4 dòng lỗi'],
  ['2026-11-18 10:21', NHAN, 'Duyệt dạy bù', 'Duyệt dạy bù MKT1301 ngày 23/11/2026 tại A.03.01'],
  ['2026-11-17 16:12', LA, 'Cấu hình quy định', 'Số thiết bị tối đa mỗi người: 2 → 3 thiết bị'],
  ['2026-11-17 09:44', DUYEN, 'Giữ chỗ sự kiện', 'Giữ chỗ H.01.01 ngày 23/11/2026: Lễ khai giảng học kỳ'],
  ['2026-11-16 13:30', LA, 'Phân quyền', 'Đặng Ngọc Mai: Sinh viên → Sinh viên, Thư ký khoa / Trợ lý CTSV'],
  ['2026-11-14 15:02', TOAN, 'Duyệt yêu cầu', 'Duyệt yêu cầu mượn M.05.01 ngày 17/11/2026 (Phỏng vấn thực tập)'],
  ['2026-11-12 10:05', LA, 'Xuất báo cáo', 'Báo cáo “Mượn – trả thiết bị” 01/10 – 31/10/2026 (PDF)'],
  ['2026-11-10 14:18', LA, 'Đổi trạng thái phòng / thiết bị', 'TB-0007: Hoạt động → Đang bảo trì'],
  ['2026-11-05 09:27', NHAN, 'Từ chối yêu cầu', 'Từ chối yêu cầu mượn A.03.01 ngày 07/11/2026, lý do: trùng thời khóa biểu'],
  ['2026-11-03 11:40', LA, 'Khóa / mở khóa tài khoản', 'Mở khóa tài khoản Lý Tuấn Kiệt'],
  ['2026-11-02 08:50', LA, 'Đồng bộ tài khoản', 'Không có tài khoản mới']
].map(([ts, actor, action, text]) => ({ date: ts.slice(0, 10), time: ts.slice(11), actor, action, text }));

const PAGE = 10;
const lv = { action: '', actor: '', from: '2026-11-01', to: '2026-11-23', page: 1 };

[...new Set(LOG.map(l => l.action))].forEach(a => $('#fAction').insertAdjacentHTML('beforeend', `<option>${a}</option>`));
[...new Set(LOG.map(l => l.actor))].forEach(a => $('#fActor').insertAdjacentHTML('beforeend', `<option>${a}</option>`));

const ACTION_KIND = a => /Từ chối/.test(a) ? 'bad' : /Duyệt|Giữ chỗ/.test(a) ? 'ok' : /Khóa|Đổi trạng thái|Hủy/.test(a) ? 'pending' : /Phân quyền|Phân công|Cấu hình/.test(a) ? 'info' : 'neutral';

function renderLog() {
  const list = LOG.filter(l => (!lv.action || l.action === lv.action) && (!lv.actor || l.actor === lv.actor) && (!lv.from || l.date >= lv.from) && (!lv.to || l.date <= lv.to));
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  lv.page = Math.min(lv.page, pages);
  const slice = list.slice((lv.page - 1) * PAGE, lv.page * PAGE);
  $('#logRows').innerHTML = slice.map(l => `
    <tr>
      <td class="nowrap"><b style="font-weight:600">${fmtDate(l.date)}</b> <span class="dim">${l.time}</span></td>
      <td>${esc(l.actor)}</td>
      <td class="nowrap">${badge(ACTION_KIND(l.action), l.action, true)}</td>
      <td>${esc(l.text)}</td>
    </tr>`).join('');
  $('#logEmpty').innerHTML = list.length ? '' : emptyState('Không có bản ghi khớp bộ lọc', 'Thử mở rộng khoảng thời gian hoặc bỏ bộ lọc.', 'log');
  $('#logCount').textContent = `${list.length} bản ghi, mới nhất ở trên cùng`;
  renderPager($('#logPager'), { page: lv.page, pages, onGo: p => { lv.page = p; renderLog(); } });
}
[['fAction', 'action'], ['fActor', 'actor'], ['fFrom', 'from'], ['fTo', 'to']].forEach(([id, k]) =>
  $('#' + id).addEventListener('change', e => { lv[k] = e.target.value; lv.page = 1; renderLog(); }));

/* ---------- Báo cáo ---------- */
const REPORTS = [
  ['room', 'Tần suất sử dụng phòng', 'Số lượt mượn và tỷ lệ sử dụng từng phòng'],
  ['device', 'Mượn – trả thiết bị', 'Số phiếu mượn, trả đúng hạn và quá hạn'],
  ['broken', 'Thiết bị hay hỏng', 'Thiết bị có nhiều báo cáo sự cố nhất'],
  ['incident', 'Sự cố và thời gian xử lý', 'Số sự cố theo trạng thái, thời gian xử lý trung bình']
];
let repType = 'room', repFmt = 'Excel';
const recent = [
  { name: 'Tần suất sử dụng phòng', range: '01/09 – 20/11/2026', fmt: 'Excel', at: '21/11/2026 17:02' },
  { name: 'Mượn – trả thiết bị', range: '01/10 – 31/10/2026', fmt: 'PDF', at: '12/11/2026 10:05' }
];

$('#repTypes').innerHTML = REPORTS.map(([k, t, d]) => `
  <label class="radio-card"><input type="radio" name="rep" value="${k}" ${k === repType ? 'checked' : ''}><span>${t}<small>${d}</small></span></label>`).join('');
$('#repTypes').addEventListener('change', e => { repType = e.target.value; });
$('#fmtSeg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#fmtSeg button').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
  repFmt = b.dataset.v;
});

function renderRecent() {
  $('#recentExports').innerHTML = recent.map(r => `
    <li><span class="attn-ico neutral">${icon('sheet')}</span>
    <div class="attn-main"><b>${esc(r.name)}</b><span>${r.range} · ${r.fmt} · ${r.at}</span></div></li>`).join('');
}
renderRecent();

$('#btnExport').addEventListener('click', e => {
  const from = $('#rFrom').value, to = $('#rTo').value;
  $('#repBanner').innerHTML = '';
  const bad = !from || !to || from > to;
  $('#fgFrom').classList.toggle('has-error', bad);
  if (bad) { $('#rErr').textContent = !from || !to ? 'Vui lòng chọn khoảng thời gian.' : '“Từ ngày” phải trước hoặc bằng “Đến ngày”.'; $('#rFrom').focus(); return; }
  if (to < '2026-08-15' || from > '2026-11-23') {
    $('#repBanner').innerHTML = notice('warn', '<b>Không có dữ liệu trong khoảng thời gian đã chọn.</b> Hệ thống không tạo tệp rỗng, hãy chọn khoảng thời gian khác.', 'alert');
    return;
  }
  const btn = e.currentTarget, label = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Đang tạo báo cáo...';
  setTimeout(() => {
    btn.disabled = false; btn.innerHTML = label;
    const name = REPORTS.find(r => r[0] === repType)[1];
    recent.unshift({ name, range: `${fmtDate(from).slice(0, 5)} – ${fmtDate(to)}`, fmt: repFmt, at: '23/11/2026 ' + new Date().toTimeString().slice(0, 5) });
    renderRecent();
    $('#repBanner').innerHTML = notice('ok', `<b>Đã xuất báo cáo “${esc(name)}” (${repFmt}).</b> Lần xuất được ghi vào nhật ký hoạt động.`, 'check');
  }, 1000);
});

/* ---------- Chuyển tab ---------- */
bindTabs($('#tabs'), t => { $('#paneLog').hidden = t !== 'log'; $('#paneReport').hidden = t !== 'report'; });
renderLog();
