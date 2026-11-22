/* Người quản lý phòng (Phòng Đào tạo) · Duyệt đăng ký dạy bù (dữ liệu mẫu) */

const MK_ST = { wait: 'Chờ duyệt', ok: 'Đã duyệt', no: 'Từ chối' };
const MK_KIND = { [MK_ST.wait]: 'pending', [MK_ST.ok]: 'ok', [MK_ST.no]: 'rejected' };
const t2s = t => `${String(Math.floor(t)).padStart(2, '0')}:${t % 1 ? '30' : '00'}`;

/* [id, giảng viên, môn, lớp, sĩ số, buổi đã nghỉ, ngày bù, từ, đến, phòng, trạng thái, cảnh báo trùng lịch lớp, lý do từ chối] */
const MAKEUPS = [
  ['DB-0318', 'ThS. Trần Thị Bích Ngọc', 'MKT1301 · Marketing căn bản', '24KT2A', 52, '17/11/2026 · tiết 1–3', '2026-11-23', 9.5, 11, 'A.03.01', MK_ST.wait, '', ''],
  ['DB-0317', 'TS. Nguyễn Văn Phúc', 'INT3401 · Phân tích thiết kế hệ thống', '22DTH1', 38, '18/11/2026 · tiết 7–9', '2026-11-26', 15, 17.5, 'J.06.04', MK_ST.wait, 'Lớp 22DTH1 đã có học phần ENG2201 cùng ca (15:00 – 17:30) theo thời khóa biểu.', ''],
  ['DB-0316', 'ThS. Vũ Minh Tâm', 'ENG1102 · Tiếng Anh 2', '24NN2B', 41, '19/11/2026 · tiết 4–6', '2026-11-27', 13, 15.5, 'A.01.01', MK_ST.wait, '', ''],
  ['DB-0315', 'PGS.TS. Phạm Hữu Lộc', 'PHA1202 · Hóa dược 1', '24D2', 60, '12/11/2026 · tiết 1–3', '2026-11-20', 9, 11.5, 'J.07.01', MK_ST.ok, '', ''],
  ['DB-0314', 'ThS. Lê Quốc Bảo', 'INT2201 · Cơ sở dữ liệu', '23DTH1A', 45, '10/11/2026 · tiết 4–6', '2026-11-18', 13, 15.5, 'A.01.01', MK_ST.no, '', 'Buổi nghỉ này đã có buổi bù đang hiệu lực vào ngày 15/11/2026.']
].map(([id, gv, subject, cls, size, missed, date, s, e, room, status, clash, reason]) => ({ id, gv, subject, cls, size, missed, date, s, e, room, status, clash, reason }));

const mf = { st: MK_ST.wait, q: '' };

function renderChips() {
  const q = fold(mf.q.trim());
  const base = MAKEUPS.filter(m => !q || fold(m.gv + ' ' + m.subject + ' ' + m.cls).includes(q));
  $('#stChips').innerHTML = [['', 'Tất cả', base.length], ...Object.values(MK_ST).map(s => [s, s, base.filter(m => m.status === s).length])]
    .map(([v, l, n]) => `<button type="button" class="chip ${mf.st === v ? 'active' : ''}" data-v="${v}" aria-pressed="${mf.st === v}">${l}<span class="n">${n}</span></button>`).join('');
}

function render() {
  renderChips();
  const q = fold(mf.q.trim());
  const list = MAKEUPS.filter(m => (!mf.st || m.status === mf.st) && (!q || fold(m.gv + ' ' + m.subject + ' ' + m.cls).includes(q)));
  $('#mkList').innerHTML = list.map(m => `
    <article class="mk-item">
      <div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3>${esc(m.subject)} · lớp ${m.cls}</h3>${badge(MK_KIND[m.status], m.status)}</div>
        <div class="mk-meta">
          <span>${icon('user')} ${esc(m.gv)}</span>
          <span>${icon('users')} Sĩ số <b>${m.size}</b></span>
          <span>${icon('calendar')} Buổi đã nghỉ: <b>${m.missed}</b></span>
        </div>
        <div class="mk-prop">
          <span class="pill brand">Đề xuất bù</span>
          <span><b>${weekdayOf(m.date)}, ${fmtDate(m.date)}</b> · ${t2s(m.s)} – ${t2s(m.e)} · phòng <b>${m.room}</b></span>
        </div>
        ${m.clash ? `<div style="margin-top:12px">${alertBox('err', 'Trùng lịch học của lớp', esc(m.clash), 'alert')}</div>` : ''}
        ${m.status === MK_ST.no ? `<div style="margin-top:12px">${alertBox('gray', 'Lý do từ chối', esc(m.reason), 'info')}</div>` : ''}
        ${m.status === MK_ST.ok ? `<div style="margin-top:12px">${alertBox('ok', 'Đã thêm vào thời khóa biểu với nhãn “Dạy bù”', 'Giảng viên, Phòng CSVC và Bảo vệ đã được thông báo.', 'check')}</div>` : ''}
      </div>
      ${m.status === MK_ST.wait ? `
      <div class="mk-actions">
        <button type="button" class="btn btn-outline btn-sm" data-act="room" data-id="${m.id}">${icon('swap')} Đổi phòng</button>
        <button type="button" class="btn btn-danger-outline btn-sm" data-act="reject" data-id="${m.id}">Từ chối</button>
        <button type="button" class="btn btn-ok btn-sm" data-act="approve" data-id="${m.id}" ${m.clash ? 'disabled title="Không duyệt được vì lớp đã có lịch học cùng ca"' : ''}>${icon('check')} Duyệt</button>
      </div>` : '<div></div>'}
    </article>`).join('') || emptyState('Không có đăng ký dạy bù nào', 'Thử đổi trạng thái hoặc từ khóa tìm kiếm.', 'inbox');
}

$('#mkList').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b || b.disabled) return;
  const m = MAKEUPS.find(x => x.id === b.dataset.id);
  if (b.dataset.act === 'approve') confirmDialog({
    title: 'Duyệt buổi dạy bù?', sub: `${esc(m.subject)} · lớp ${m.cls}`, confirmText: 'Duyệt',
    body: `<p style="font-size:14px">Buổi bù ngày ${fmtDate(m.date)}, ${t2s(m.s)} – ${t2s(m.e)}, phòng ${m.room} sẽ được thêm vào thời khóa biểu với nhãn “Dạy bù”. Giảng viên, Phòng CSVC và Bảo vệ nhận thông báo.</p>`,
    onConfirm: () => { m.status = MK_ST.ok; render(); showToast(`Đã duyệt ${m.id}`); }
  });
  if (b.dataset.act === 'reject') reasonDialog({
    title: 'Từ chối đăng ký dạy bù', sub: `${esc(m.subject)} · ${esc(m.gv)}`, label: 'Lý do từ chối', placeholder: 'Giảng viên sẽ nhận thông báo kèm lý do này', confirmText: 'Từ chối',
    onConfirm: v => { m.status = MK_ST.no; m.reason = v; render(); showToast(`Đã từ chối ${m.id}`); }
  });
  if (b.dataset.act === 'room') openRoom(m);
});

function openRoom(m) {
  const free = ROOMS.filter(r => r.type === 'Phòng học' && r.status === 'active' && r.cap >= m.size &&
    !(DAY_SCHEDULE[r.code] || []).some(b => b[2] !== 'pending' && m.s < b[1] && m.e > b[0]));
  const mdl = setModal(`
    ${mHead('Đổi sang phòng trống khác', `${fmtDate(m.date)} · ${t2s(m.s)} – ${t2s(m.e)} · cần tối thiểu ${m.size} chỗ`)}
    <div class="m-body">
      ${free.length ? `<div class="check-list" id="rmList">${free.map(r => `<label class="check-item"><input type="radio" name="rm" value="${r.code}" ${r.code === m.room ? 'checked' : ''}> ${r.code}<small>${r.cap} chỗ · Tòa ${r.building}</small></label>`).join('')}</div>`
        : alertBox('warn', 'Không có phòng trống phù hợp', 'Không còn phòng học nào đủ chỗ trong khung giờ này.', 'alert')}
    </div>
    ${mFoot(`<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="rmOk" ${free.length ? '' : 'disabled'}>Đổi phòng</button>`)}`);
  const ok = $('#rmOk', mdl);
  ok.addEventListener('click', () => {
    const v = $('#rmList input:checked', mdl); if (!v) return;
    m.room = v.value; closeModal(); render(); showToast(`Đã đổi sang phòng ${m.room}`);
  });
}

bindChips($('#stChips'), v => { mf.st = v; render(); });
let qt; $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { mf.q = e.target.value; render(); }, 120); });
render();
