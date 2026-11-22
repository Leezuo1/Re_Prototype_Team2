/* Người quản lý phòng · Duyệt yêu cầu mượn phòng (dữ liệu mẫu, thao tác chạy trên bộ nhớ trang) */

const ST = { wait: 'Chờ duyệt', more: 'Chờ bổ sung', ok: 'Đã duyệt', no: 'Từ chối' };
const ST_KIND = { [ST.wait]: 'pending', [ST.more]: 'info', [ST.ok]: 'ok', [ST.no]: 'rejected' };

/* [id, loại, phòng, người mượn, đơn vị, mục đích, ngày, bắt đầu, kết thúc, số người, trạng thái, gửi lúc, quyết định, ghi chú] */
const REQUESTS = [
  ['YC-2057', 'Phòng họp', 'M.03.01', 'TS. Nguyễn Văn Phúc', 'Khoa Công nghệ thông tin', 'Họp hội đồng đồ án tốt nghiệp', '2026-11-24', 10, 11.5, 8, ST.wait, '23/11 08:20', null, ''],
  ['YC-2056', 'Phòng họp', 'M.04.01', 'ThS. Vũ Minh Tâm', 'Khoa Ngoại ngữ', 'Họp triển khai đề tài nghiên cứu', '2026-11-23', 13, 14.5, 10, ST.wait, '22/11 19:45', null, 'Chờ hơn 12 giờ'],
  ['YC-2055', 'Hội trường', 'H.01.01', 'Bùi Quang Huy', 'CLB Thiết kế', 'Triển lãm đồ án cuối kỳ', '2026-11-23', 9, 11, 120, ST.wait, '22/11 15:10', { name: 'QD-CLB-0457.pdf', size: '640 KB' }, ''],
  ['YC-2054', 'Hội trường', 'H.02.01', 'Hoàng Thu Trang', 'CLB Âm nhạc', 'Đêm nhạc Giáng sinh', '2026-11-26', 18, 21, 150, ST.wait, '22/11 10:02', null, ''],
  ['YC-2053', 'Hội trường', 'H.01.01', 'Nguyễn Văn Phúc', 'Khoa Công nghệ thông tin', 'Hội thảo AI trong giáo dục', '2026-11-23', 14, 17, 300, ST.wait, '21/11 14:30', { name: 'QD-BGH-1182.pdf', size: '1,2 MB' }, 'Chờ hơn 24 giờ'],
  ['YC-2052', 'Phòng học', 'J.07.01', 'ThS. Lê Quốc Bảo', 'Khoa Công nghệ thông tin', 'Workshop Kỹ năng số', '2026-11-25', 13, 16, 100, ST.ok, '20/11 16:05', null, ''],
  ['YC-2051', 'Phòng học', 'B.04.02', 'Lý Tuấn Kiệt', 'Lớp 23DTH2 · Khoa CNTT', 'Seminar nhóm đồ án', '2026-11-23', 13, 15, 40, ST.wait, '22/11 21:12', null, 'Chờ hơn 8 giờ'],
  ['YC-2050', 'Hội trường', 'H.02.01', 'Phan Thị Yến Nhi', 'CLB Debate VLU', 'Chung kết CLB Debate', '2026-11-24', 9, 11, 180, ST.ok, '19/11 09:40', { name: 'QD-CLB-0431.pdf', size: '510 KB' }, ''],
  ['YC-2049', 'Phòng học', 'A.01.02', 'Dương Khánh Linh', 'Lớp 24KT1 · Khoa Kiến trúc', 'Họp lớp cuối tuần', '2026-11-24', 15.5, 17, 35, ST.no, '19/11 08:15', null, ''],
  ['YC-2048', 'Hội trường', 'H.03.01', 'Trần Thị Bích Ngọc', 'Khoa Kinh tế', 'Tọa đàm khởi nghiệp sinh viên', '2026-11-23', 16, 18, 90, ST.more, '20/11 11:22', { name: 'to-trinh-tam-khoi-nghiep.pdf', size: '320 KB' }, ''],
  ['YC-2047', 'Phòng học', 'A.03.01', 'Phan Thị Yến Nhi', 'Lớp 24LU1 · Khoa Luật', 'Ôn tập nhóm trước kiểm tra', '2026-11-23', 8, 9.5, 45, ST.wait, '22/11 20:30', null, ''],
  ['YC-2046', 'Phòng học', 'J.06.04', 'Trần Minh Khôi', 'Lớp 24DTH3 · Khoa CNTT', 'Ôn thi giữa kỳ', '2026-11-23', 10.5, 12, 30, ST.ok, '20/11 14:00', null, ''],
  ['YC-2045', 'Phòng họp', 'M.04.01', 'Nguyễn Thị Lan Anh', 'Khoa Kinh tế', 'Họp hội đồng khoa', '2026-11-23', 9, 11, 14, ST.ok, '19/11 16:48', null, ''],
  ['YC-2044', 'Phòng họp', 'M.04.02', 'Từ Thị Hoa', 'Khoa Luật', 'Họp bộ môn Luật dân sự', '2026-11-27', 14, 15.5, 8, ST.no, '18/11 10:09', null, '']
].map(([id, type, room, who, unit, purpose, date, s, e, people, status, sent, file, flag]) =>
  ({ id, type, room, who, unit, purpose, date, s, e, people, status, sent, file, flag, reason: status === ST.no ? (type === 'Phòng họp' ? 'Phòng đang bảo trì, vui lòng chọn phòng họp khác.' : 'Phòng được giữ cho buổi học bù của lớp.') : '', ask: status === ST.more ? 'Bổ sung bản đăng ký tham dự có chữ ký của trưởng khoa.' : '' }));

const EQUIP = {
  'Phòng học': [['Máy chiếu', 1], ['Micro', 1], ['Điều hòa', 1]],
  'Hội trường': [['Hệ thống âm thanh', 1], ['Máy chiếu', 1], ['Micro không dây (4)', 1]],
  'Phòng họp': [['TV', 1], ['Micro', 1], ['Máy chiếu', 1]]
};
const EQUIP_BAD = { 'J.06.04': 'Máy chiếu', 'M.04.01': 'Camera hội nghị' };

const TYPE_CHIPS = [['', 'Tất cả'], ['Phòng học', 'Phòng học'], ['Hội trường', 'Hội trường'], ['Phòng họp', 'Phòng họp']];
const f = { type: '', status: ST.wait, date: '', q: '' };
let selected = null;

const t2s = t => `${String(Math.floor(t)).padStart(2, '0')}:${t % 1 ? '30' : '00'}`;
const slot = r => `${t2s(r.s)} – ${t2s(r.e)}`;
const roomInfo = r => ROOMS.find(x => x.code === r.room);
const narrow = () => matchMedia('(max-width: 1000px)').matches;

function conflictsOf(r) {
  if (r.status !== ST.wait && r.status !== ST.more) return [];
  return (DAY_SCHEDULE[r.room] || []).filter(b => b[2] !== 'pending' && r.s < b[1] && r.e > b[0]);
}
const missingFile = r => r.type === 'Hội trường' && !r.file;
const blocked = r => conflictsOf(r).length > 0 || missingFile(r);

function match(r, ignoreType) {
  const q = fold(f.q.trim());
  return (ignoreType || !f.type || r.type === f.type) &&
    (!f.status || r.status === f.status) && (!f.date || r.date === f.date) &&
    (!q || fold(r.who + ' ' + r.unit + ' ' + r.room + ' ' + r.purpose + ' ' + r.id).includes(q));
}

/* ---------- Danh sách ---------- */
function renderChips() {
  $('#typeChips').innerHTML = TYPE_CHIPS.map(([v, label]) =>
    `<button type="button" class="chip ${f.type === v ? 'active' : ''}" data-v="${v}" aria-pressed="${f.type === v}">${label}<span class="n">${REQUESTS.filter(r => (!v || r.type === v) && match(r, true)).length}</span></button>`).join('');
}
function renderList() {
  renderChips();
  const list = REQUESTS.filter(r => match(r));
  $('#reqItems').innerHTML = list.map(r => `
    <button type="button" class="req-item" role="option" data-id="${r.id}" aria-selected="${r.id === selected}">
      <div class="r1"><span class="who">${esc(r.who)}</span>${badge(ST_KIND[r.status], r.status)}</div>
      <div class="what">${esc(r.purpose)}</div>
      <div class="when">
        <span>${icon('building')} ${r.room} · ${r.type}</span>
        <span>${icon('calendar')} ${fmtDate(r.date)}</span>
        <span>${icon('clock')} ${slot(r)}</span>
      </div>
      ${conflictsOf(r).length ? `<div class="flag">${icon('alert')} Trùng lịch</div>` : missingFile(r) ? `<div class="flag">${icon('paperclip')} Thiếu quyết định</div>` : r.flag ? `<div class="flag" style="color:var(--soon-text)">${icon('clock')} ${r.flag}</div>` : ''}
    </button>`).join('') || emptyState('Không có yêu cầu nào', 'Thử đổi bộ lọc loại phòng, trạng thái hoặc ngày.', 'inbox');
  if (!list.some(r => r.id === selected)) selected = narrow() ? null : (list[0] ? list[0].id : null);
  $$('#reqItems .req-item').forEach(b => b.setAttribute('aria-selected', b.dataset.id === selected));
  renderDetail();
}

/* ---------- Chi tiết ---------- */
function dayLine(r) {
  const blocks = (DAY_SCHEDULE[r.room] || []).filter(b => b[2] !== 'pending');
  const pos = (a, b) => `left:${(a - 7) / 14 * 100}%;width:${(b - a) / 14 * 100}%`;
  const kindOf = k => ({ class: 'class', loan: 'loan', event: 'event', makeup: 'class' }[k]);
  return `
    <div class="day-line" aria-label="Lịch phòng ${r.room} trong ngày">
      ${blocks.filter(b => !(r.status === ST.ok && b[0] === r.s && b[1] === r.e)).map(b => `<span class="seg-b ${kindOf(b[2])}" style="${pos(b[0], b[1])}" title="${esc(b[3])} · ${t2s(b[0])}–${t2s(b[1])}">${esc(b[3])}</span>`).join('')}
      <span class="seg-b req" style="${pos(r.s, r.e)}" title="Yêu cầu này">Yêu cầu</span>
    </div>
    <div class="day-ticks" aria-hidden="true">${[7, 10, 13, 16, 19].map(h => `<span style="left:${(h - 7) / 14 * 100}%">${String(h).padStart(2, '0')}:00</span>`).join('')}</div>
    <div class="legend" style="margin-top:8px"><span><i style="background:#cfe0f4"></i>Lịch học</span><span><i style="background:#ffd9b3"></i>Lịch mượn</span><span><i style="background:#d9dce3"></i>Sự kiện trường</span><span><i style="background:var(--primary)"></i>Yêu cầu này</span></div>`;
}

function renderDetail() {
  const host = $('#detail');
  const r = REQUESTS.find(x => x.id === selected);
  if (!r) { host.innerHTML = emptyState('Chọn một yêu cầu để xem chi tiết', 'Kiểm tra lịch phòng và thiết bị trước khi duyệt.', 'inbox'); host.classList.remove('open'); return; }
  const ri = roomInfo(r);
  const cf = conflictsOf(r);
  const bad = EQUIP_BAD[r.room];
  const actionable = r.status === ST.wait;
  const hint = cf.length ? 'Không duyệt được vì trùng lịch' : missingFile(r) ? 'Không duyệt được vì thiếu quyết định phê duyệt' : '';
  host.innerHTML = `
    <div class="detail-head">
      <div>
        <button type="button" class="btn btn-ghost btn-sm detail-back" id="dBack" style="margin:-6px 0 6px -10px">${icon('arrowLeft')} Danh sách</button>
        <h2>${esc(r.purpose)}</h2>
        <p>${r.id} · gửi lúc ${r.sent} · người duyệt: ${ROOM_OWNER[r.type]}</p>
      </div>
      ${badge(ST_KIND[r.status], r.status)}
    </div>
    <div class="detail-body">
      ${cf.length ? alertBox('err', 'Khung giờ trùng lịch', cf.map(b => `${esc(b[3])} (${t2s(b[0])} – ${t2s(b[1])})`).join('<br>'), 'alert') : ''}
      ${missingFile(r) ? alertBox('err', 'Thiếu quyết định phê duyệt', 'Yêu cầu mượn hội trường bắt buộc có quyết định của trường. Hãy yêu cầu người mượn bổ sung.', 'paperclip') : ''}
      ${r.status === ST.more ? alertBox('info', 'Đang chờ người mượn bổ sung', esc(r.ask), 'info') : ''}
      ${r.status === ST.no ? alertBox('err', 'Lý do từ chối', esc(r.reason), 'info') : ''}
      <dl class="dl">
        <div><dt>Người mượn</dt><dd>${esc(r.who)}</dd></div>
        <div><dt>Đơn vị</dt><dd>${esc(r.unit)}</dd></div>
        <div><dt>Phòng</dt><dd>${r.room} · ${r.type}${ri ? ` · ${ri.cap} chỗ` : ''}</dd></div>
        <div><dt>Số người tham dự</dt><dd>${r.people}${ri && r.people > ri.cap ? ' (vượt sức chứa)' : ''}</dd></div>
        <div><dt>Ngày</dt><dd>${weekdayOf(r.date)}, ${fmtDate(r.date)}</dd></div>
        <div><dt>Thời gian</dt><dd>${slot(r)}</dd></div>
      </dl>
      ${r.type === 'Phòng học' && /^Lớp|SV/.test(r.unit) ? notice('gray', 'Yêu cầu của sinh viên đã được Thư ký khoa xác nhận.', 'check') : ''}

      <div class="sect-title">Lịch phòng trong ngày <small>${r.room} · ${fmtDate(r.date)}</small></div>
      ${dayLine(r)}

      <div class="sect-title">Tình trạng thiết bị <small>${r.room}</small></div>
      <ul class="eq-list">
        ${EQUIP[r.type].map(([n]) => `<li><span>${n}</span>${bad && n === bad ? badge('rejected', 'Đang sự cố') : badge('ok', 'Hoạt động')}</li>`).join('')}
        ${bad && !EQUIP[r.type].some(e => e[0] === bad) ? `<li><span>${bad}</span>${badge('pending', 'Đang bảo trì')}</li>` : ''}
      </ul>

      ${r.type === 'Hội trường' ? `
        <div class="sect-title">Quyết định phê duyệt đính kèm</div>
        ${r.file
          ? `<div class="file-card">${icon('file')}<div class="grow">${esc(r.file.name)}<small>PDF · ${r.file.size}</small></div><button type="button" class="btn btn-outline btn-sm" data-act="view">Xem</button><button type="button" class="btn btn-outline btn-sm" data-act="dl">${icon('download')} Tải về</button></div>`
          : `<div class="file-card missing">${icon('paperclip')}<div class="grow">Thiếu quyết định<small style="color:inherit">Người mượn chưa đính kèm tệp</small></div></div>`}` : ''}
    </div>
    ${actionable ? `
    <div class="detail-foot">
      ${hint ? `<span class="mono-note" style="margin-right:auto;color:var(--bad-text)">${icon('alert')} ${hint}</span>` : ''}
      <button type="button" class="btn btn-danger-outline" data-act="reject">Từ chối</button>
      ${r.type === 'Hội trường' ? `<button type="button" class="btn btn-outline" data-act="more">Yêu cầu bổ sung</button>` : ''}
      <button type="button" class="btn btn-ok" data-act="approve" ${blocked(r) ? 'disabled' : ''}>${icon('check')} Duyệt</button>
    </div>` : r.status === ST.more ? `
    <div class="detail-foot"><button type="button" class="btn btn-danger-outline" data-act="reject">Từ chối</button></div>` : ''}
  `;
  host.classList.toggle('open', narrow() && !!selected);
}

/* ---------- Tương tác ---------- */
$('#reqItems').addEventListener('click', e => {
  const b = e.target.closest('.req-item'); if (!b) return;
  selected = b.dataset.id;
  $$('#reqItems .req-item').forEach(x => x.setAttribute('aria-selected', x === b));
  renderDetail();
  if (narrow()) $('#detail').classList.add('open');
});
$('#detail').addEventListener('click', e => {
  if (e.target.closest('#dBack')) { selected = null; $('#detail').classList.remove('open'); $$('#reqItems .req-item').forEach(x => x.setAttribute('aria-selected', 'false')); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const r = REQUESTS.find(x => x.id === selected);
  const act = b.dataset.act;
  if (act === 'view') showToast('Mở xem quyết định (bản mẫu, không có tệp thật).');
  if (act === 'dl') showToast('Đã tải quyết định (mẫu).');
  if (act === 'approve') confirmDialog({
    title: 'Duyệt yêu cầu?', sub: `${r.id} · ${r.room} · ${fmtDate(r.date)} · ${slot(r)}`, confirmText: 'Duyệt',
    body: '<p style="font-size:14px">Lịch phòng được khóa và người mượn nhận thông báo. Thao tác được ghi vào nhật ký hoạt động.</p>',
    onConfirm: () => { r.status = ST.ok; r.flag = ''; renderList(); showToast(`Đã duyệt ${r.id}, lịch phòng đã được khóa`); }
  });
  if (act === 'reject') reasonDialog({
    title: 'Từ chối yêu cầu', sub: `${r.id} · ${esc(r.who)} · ${r.room}`, label: 'Lý do từ chối', placeholder: 'Người mượn sẽ nhận thông báo kèm lý do này', confirmText: 'Từ chối',
    onConfirm: v => { r.status = ST.no; r.reason = v; r.flag = ''; renderList(); showToast(`Đã từ chối ${r.id}`); }
  });
  if (act === 'more') reasonDialog({
    title: 'Yêu cầu bổ sung', sub: `${r.id} · ${esc(r.who)} · ${r.room}`, label: 'Nội dung cần bổ sung', placeholder: 'VD: Bổ sung quyết định phê duyệt có chữ ký', confirmText: 'Gửi yêu cầu bổ sung', danger: false,
    onConfirm: v => { r.status = ST.more; r.ask = v; r.flag = ''; renderList(); showToast(`Đã yêu cầu ${r.who} bổ sung`); }
  });
});

bindChips($('#typeChips'), v => { f.type = v; renderList(); });
$('#fStatus').innerHTML = [['', 'Mọi trạng thái'], ...Object.values(ST).map(s => [s, s])].map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
$('#fStatus').value = f.status;
$('#fStatus').addEventListener('change', e => { f.status = e.target.value; renderList(); });
$('#fDate').addEventListener('change', e => { f.date = e.target.value; renderList(); });
let qt; $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { f.q = e.target.value; renderList(); }, 120); });

renderList();
