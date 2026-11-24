/* Phòng CSVC · Lịch sử người mượn
   PB-56 tìm một người mượn, xem thống kê và lịch sử mượn - trả, sử dụng phòng, vi phạm, sự cố; xuất hồ sơ để đối chiếu khi có bất trắc
   Lịch sử chỉ xem, không sửa hoặc xóa. Dữ liệu mẫu */

const view = { q: '', role: '', code: '', tab: 'loans', period: 'term', campus: '' };
const PERIODS = { term: ['Học kỳ này (từ 01/09/2026)', '2026-09-01'], d30: ['30 ngày gần nhất', '2026-10-24'], all: ['Tất cả thời gian', '0000-00-00'] };
const COND = { ok: 'Bình thường', broken: 'Hỏng', lost: 'Thiếu hoặc mất' };

/* ---------- Người mượn: lấy từ danh sách tài khoản SV / GV ---------- */
const PEOPLE = ACCOUNTS.filter(a => a.roles.includes('Sinh viên') || a.roles.includes('Giảng viên')).map(a => ({
  name: a.name, code: a.code, dept: a.dept, kind: a.roles.includes('Giảng viên') ? 'GV' : 'SV'
}));
const personOf = code => PEOPLE.find(p => p.code === code);

/* ---------- Lịch sử mẫu (ngoài các phiếu trong csvc-data.js) ---------- */
const mkLoan = (code, whoCode, items, room, date, b, d, o = {}) => {
  const p = personOf(whoCode);
  const t = { code, who: { name: p.name, code: p.code, kind: p.kind, dept: p.dept }, items, room, b: { date, time: b }, d: { date, time: d }, status: o.status || 'returned', created: '08:00',
    handed: { date, time: b }, handedBy: o.by || 'Châu Minh Quân', cond: Object.fromEntries(items.map(i => [i.id, 'Bình thường'])),
    returned: { date, time: o.back || d }, returnedBy: o.by || 'Châu Minh Quân', late: o.late || 0,
    retCond: Object.fromEntries(items.map(i => [i.id, { qty: o.state && o.state !== 'ok' ? Math.max(0, i.qty - 1) : i.qty, state: o.state || 'ok', note: o.note || '' }])), campus: campusOfRoom(room) };
  if (o.incident) t.incident = o.incident;
  return t;
};
const EXTRA_LOANS = [
  mkLoan('TB1031', '2474802010204', [{ id: 'odien', qty: 1 }], 'A.01.02', '2026-11-18', '13:00', '15:00', { late: 18, back: '15:18' }),
  mkLoan('TB1027', '2474802010204', [{ id: 'hdmi', qty: 1 }], 'B.04.02', '2026-11-10', '18:00', '20:00'),
  mkLoan('TB1019', '2474802010204', [{ id: 'hub', qty: 1 }], 'A.03.05', '2026-10-02', '09:00', '11:00', { status: 'issue', state: 'broken', note: 'Cổng USB-C bị cong, không nhận thiết bị.', incident: 'SC1011' }),
  mkLoan('TB1029', '2374802010388', [{ id: 'odien', qty: 2 }], 'A.01.02', '2026-11-12', '13:00', '15:00'),
  mkLoan('TB1022', '2374802010388', [{ id: 'remote', qty: 1 }], 'J.05.02', '2026-10-20', '09:00', '11:30', { status: 'issue', state: 'lost', note: 'Người mượn báo làm mất remote.', incident: 'SC1015' }),
  mkLoan('TB1033', '2374801060318', [{ id: 'hdmi', qty: 1 }], 'J.07.01', '2026-11-19', '09:00', '11:00'),
  mkLoan('TB1025', '2274801050412', [{ id: 'odien', qty: 1 }], 'B.02.07', '2026-11-05', '14:00', '16:00', { late: 35, back: '16:35' }),
  mkLoan('TB1036', 'GV0231', [{ id: 'odien', qty: 2 }], 'A.03.01', '2026-11-20', '07:00', '09:30'),
  mkLoan('TB1034', 'GV0231', [{ id: 'hub', qty: 1 }], 'A.03.01', '2026-11-13', '07:00', '09:30'),
  mkLoan('TB1030', 'GV0142', [{ id: 'hdmi', qty: 1 }], 'J.06.04', '2026-11-17', '08:00', '10:30'),
  mkLoan('TB1016', 'GV0142', [{ id: 'remote', qty: 1 }], 'J.06.04', '2026-09-24', '08:00', '10:30')
];
const ALL_LOANS = [...LOANS, ...EXTRA_LOANS];
const ROOM_HISTORY = [
  { who: 'GV0142', room: 'J.06.04', date: TODAY, s: '08:00', e: '10:30', purpose: 'INT1306 · 23DTH2A', st: 'over' },
  { who: 'GV0231', room: 'A.01.01', date: TODAY, s: '07:00', e: '09:30', back: '09:30', purpose: 'INT2201 · 23DTH1A', st: 'missing', rep: 'BB-0235', detail: 'Thiếu 1 Remote trình chiếu' },
  { who: 'GV0064', room: 'A.03.01', date: TODAY, s: '07:00', e: '09:30', back: '09:50', late: 20, purpose: 'LAW1105 · 24LU1', st: 'missing', rep: 'BB-0234', detail: 'Micro không dây Shure bị hỏng' },
  { who: '2374801060318', room: 'J.06.04', date: TODAY, s: '10:30', e: '12:00', purpose: 'Ôn thi giữa kỳ', st: 'using' },
  { who: 'GV0253', room: 'H.01.01', date: TODAY, s: '08:00', e: '12:00', purpose: 'Lễ khai giảng học kỳ', st: 'using' },
  { who: '2474801040211', room: 'M.03.02', date: '2026-11-21', s: '14:00', e: '16:00', back: '16:00', purpose: 'Họp CLB học thuật', st: 'ok', rep: 'BB-0228' },
  { who: 'GV0198', room: 'M.04.01', date: '2026-11-20', s: '09:00', e: '11:00', back: '11:12', late: 12, purpose: 'Họp tổ bộ môn', st: 'ok', rep: 'BB-0226' },
  { who: '2474802010204', room: 'B.04.02', date: '2026-11-19', s: '18:00', e: '20:00', back: '20:25', late: 25, purpose: 'Ôn thi nhóm', st: 'ok', rep: 'BB-0225' },
  { who: '2374802010388', room: 'A.01.02', date: '2026-11-18', s: '13:00', e: '15:00', back: '15:00', purpose: 'Làm đồ án nhóm', st: 'ok', rep: 'BB-0223' },
  { who: '2474801060145', room: 'B.02.01', date: '2026-11-17', s: '08:00', e: '10:00', back: '10:00', purpose: 'Seminar kinh tế', st: 'ok', rep: 'BB-0221' },
  { who: '2474802010204', room: 'A.03.05', date: '2026-10-02', s: '09:00', e: '11:00', back: '11:00', purpose: 'Họp nhóm đồ án', st: 'ok', rep: 'BB-0188' }
].map(r => ({ ...r, campus: campusOfRoom(r.room) }));
const ROOM_ST = { ok: ['ok', 'Trả đủ'], missing: ['rejected', 'Thiếu hoặc hỏng thiết bị'], using: ['info', 'Đang sử dụng'], over: ['rejected', 'Quá giờ, chưa trả'] };

/* ---------- Gom lịch sử của một người theo kỳ và cơ sở ---------- */
const afterPeriod = d => d >= PERIODS[view.period][1];
const okCampus = c => !view.campus || c === view.campus;
function historyOf(code) {
  const loans = ALL_LOANS.filter(t => t.who.code === code && afterPeriod(t.b.date) && okCampus(t.campus));
  const rooms = ROOM_HISTORY.filter(r => r.who === code && afterPeriod(r.date) && okCampus(r.campus));
  const p = personOf(code);
  const incs = INCIDENTS.filter(i => i.by === p.name && afterPeriod(i.times.sent.date) && okCampus(i.campus));
  const viol = [];
  loans.forEach(t => {
    const lm = loanLateMin(t);
    if (lm > 0) viol.push({ type: 'Trả trễ thiết bị', date: t.b.date, ref: t.code, text: `Trả trễ ${lm} phút · ${loanItemsLine(t.items)}`, open: () => openLoan(t) });
    Object.entries(t.retCond || {}).forEach(([id, r]) => { if (r.state !== 'ok') viol.push({ type: r.state === 'lost' ? 'Thiết bị thiếu hoặc mất' : 'Thiết bị hỏng', date: t.b.date, ref: t.code, text: `${eqType(id).name}: ${r.note || COND[r.state]}`, open: () => openLoan(t) }); });
  });
  rooms.forEach(r => {
    if (r.late) viol.push({ type: 'Trả phòng trễ', date: r.date, ref: r.rep || r.room, text: `${r.room} trả trễ ${r.late} phút`, open: () => openRoom(r) });
    if (r.st === 'missing') viol.push({ type: 'Phòng thiếu hoặc hỏng thiết bị', date: r.date, ref: r.rep, text: `${r.room}: ${r.detail}`, open: () => openRoom(r) });
    if (r.st === 'over') viol.push({ type: 'Quá giờ chưa trả phòng', date: r.date, ref: r.room, text: `${r.room} hết giờ ${r.e}, chưa có biên bản trả phòng`, open: () => openRoom(r) });
  });
  viol.sort((a, b) => b.date.localeCompare(a.date));
  return { loans, rooms, incs, viol };
}
const violCount = code => { const keep = { p: view.period, c: view.campus }; view.period = 'all'; view.campus = ''; const n = historyOf(code).viol.length; view.period = keep.p; view.campus = keep.c; return n; };

/* ---------- Danh sách bên trái ---------- */
function renderList() {
  const q = fold(view.q.trim());
  const list = PEOPLE.filter(p => (!view.role || p.kind === view.role) && (!q || fold(p.name).includes(q) || fold(p.code).includes(q)));
  $('#whoList').innerHTML = list.map(p => {
    const n = violCount(p.code);
    return `<button type="button" class="who-item" role="option" data-code="${p.code}" aria-selected="${p.code === view.code}">
      <span class="avatar">${initials(p.name)}</span><span><b>${esc(p.name)}</b><small>${p.kind} · ${esc(p.code)}</small></span>${n ? `<span class="flagn" title="Số vi phạm">${n} vi phạm</span>` : ''}</button>`;
  }).join('') || emptyState('Không tìm thấy người mượn', 'Thử họ tên, MSSV hoặc mã giảng viên khác.', 'search');
  $('#whoCount').textContent = `${list.length} / ${PEOPLE.length} người`;
}
$('#whoList').addEventListener('click', e => { const b = e.target.closest('.who-item'); if (b) select(b.dataset.code); });
$('#q').addEventListener('input', e => { view.q = e.target.value; renderList(); });
bindChips($('#roleChips'), v => { view.role = v; renderList(); });

/* ---------- Hồ sơ bên phải ---------- */
function select(code) {
  view.code = code; view.tab = 'loans';
  renderList(); renderProfile();
  if (window.matchMedia('(max-width: 1000px)').matches) $('#profile').scrollIntoView({ block: 'start' });
}
function renderProfile() {
  const p = personOf(view.code);
  if (!p) { $('#profile').innerHTML = `<div class="card-body">${emptyState('Chọn một người mượn', 'Tìm theo họ tên, MSSV hoặc mã giảng viên ở danh sách bên trái.', 'user')}</div>`; return; }
  const h = historyOf(p.code);
  const stats = [['Phiếu mượn thiết bị', h.loans.length], ['Lần sử dụng phòng', h.rooms.length], ['Lần trả trễ', h.viol.filter(v => v.type.includes('trễ')).length],
    ['Hỏng, thiếu hoặc mất', h.viol.filter(v => v.type.includes('hỏng') || v.type.includes('thiếu')).length], ['Sự cố đã báo', h.incs.length]];
  const tabs = [['loans', 'Mượn – trả thiết bị', h.loans.length], ['rooms', 'Sử dụng phòng', h.rooms.length], ['viol', 'Vi phạm', h.viol.length], ['incs', 'Sự cố đã báo', h.incs.length]];
  $('#profile').innerHTML = `
    <div class="profile-head">
      <span class="avatar">${initials(p.name)}</span>
      <div class="grow"><h2>${esc(p.name)}</h2><p>${p.kind === 'GV' ? 'Giảng viên' : 'Sinh viên'} · ${esc(p.code)} · ${esc(p.dept)}</p></div>
      <button type="button" class="btn btn-primary" id="exportProfile">${icon('download')} Xuất hồ sơ (PDF)</button>
    </div>
    <div class="profile-tools">
      <label class="mono-note" for="period">Thống kê theo</label>
      <select class="select" id="period">${Object.entries(PERIODS).map(([k, v]) => `<option value="${k}" ${view.period === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select>
      <select class="select" id="campusSel" aria-label="Cơ sở"><option value="">Tất cả cơ sở</option>${CAMPUSES.map(c => `<option value="${c.id}" ${view.campus === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
      <span class="spacer"></span><span class="mono-note">${icon('lock')} Chỉ xem, không sửa hoặc xóa</span>
    </div>
    <div class="profile-stats" role="group" aria-label="Thống kê">
      ${stats.map(([l, v], k) => `<div class="mini-stat ${k >= 2 && k <= 3 && v ? 'bad' : ''}"><div class="value">${v}</div><div class="label">${l}</div></div>`).join('')}
    </div>
    <div class="profile-body">
      <div class="tabs-line" id="ptabs" role="tablist">${tabs.map(([k, l, n]) => `<button type="button" role="tab" data-tab="${k}" class="${view.tab === k ? 'active' : ''}" aria-selected="${view.tab === k}">${l} <span class="n">${n}</span></button>`).join('')}</div>
      <div class="tbl-wrap"><table class="tbl" id="ptbl"></table></div>
      <div id="pEmpty"></div>
    </div>`;
  $('#period').addEventListener('change', e => { view.period = e.target.value; renderList(); renderProfile(); });
  $('#campusSel').addEventListener('change', e => { view.campus = e.target.value; renderList(); renderProfile(); });
  bindTabs($('#ptabs'), t => { view.tab = t; drawTable(h); });
  $('#exportProfile').addEventListener('click', e => fakeExport(e.currentTarget, `Đã xuất hồ sơ của ${p.name}: ${PERIODS[view.period][0].toLowerCase()} (PDF, mẫu)`));
  drawTable(h);
}
function drawTable(h) {
  const t = view.tab; let rows, head, empty;
  if (t === 'loans') {
    head = ['Mã phiếu', 'Ngày', 'Thiết bị × số lượng', 'Phòng', 'Mượn – trả', 'Trạng thái'];
    rows = h.loans.slice().sort((a, b) => b.b.date.localeCompare(a.b.date)).map(x => [`<button type="button" class="link-btn" data-i="loans:${x.code}">${x.code}</button>`, fmtDate(x.b.date), loanItemsLine(x.items), `${x.room} · ${CAMPUS_NAME[x.campus]}`,
      `${x.b.time} – ${x.returned ? x.returned.time : x.d.time}`, badge(LOAN_BADGE[x.status], LOAN_TEXT[x.status]) + (loanLateMin(x) ? ' ' + badge('bad', 'Trả trễ ' + loanLateMin(x) + ' phút', true) : '')]);
    empty = 'Chưa có phiếu mượn thiết bị trong kỳ này.';
  } else if (t === 'rooms') {
    head = ['Ngày', 'Phòng', 'Khung giờ', 'Mục đích', 'Giờ trả thực tế', 'Kết quả'];
    rows = h.rooms.slice().sort((a, b) => b.date.localeCompare(a.date)).map((x, k) => [fmtDate(x.date), `<button type="button" class="link-btn" data-i="rooms:${ROOM_HISTORY.indexOf(x)}">${x.room}</button><div class="muted" style="font-size:12px">${CAMPUS_NAME[x.campus]}</div>`, `${x.s} – ${x.e}`, esc(x.purpose), x.back ? x.back + (x.late ? ` (trễ ${x.late} phút)` : '') : '–', badge(ROOM_ST[x.st][0], ROOM_ST[x.st][1])]);
    empty = 'Chưa có lượt sử dụng phòng trong kỳ này.';
  } else if (t === 'viol') {
    head = ['Ngày', 'Loại vi phạm', 'Chi tiết', 'Tham chiếu'];
    rows = h.viol.map((x, k) => [fmtDate(x.date), badge('rejected', x.type, true), esc(x.text), `<button type="button" class="link-btn" data-i="viol:${k}">${esc(x.ref)}</button>`]);
    empty = 'Không có vi phạm nào trong kỳ này.';
  } else {
    head = ['Mã phiếu', 'Ngày báo', 'Đối tượng', 'Mô tả', 'Trạng thái'];
    rows = h.incs.map(x => [`<a class="link-btn" href="csvc-incidents.html#${x.code}">${x.code}</a>`, fmtDate(x.times.sent.date), esc(x.target), esc(x.desc), badge(INC_BADGE[x.status], INC_TEXT[x.status])]);
    empty = 'Người này chưa báo sự cố nào trong kỳ này.';
  }
  $('#ptbl').innerHTML = `<thead><tr>${head.map(c => `<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, k) => `<td class="${k === 0 && t !== 'rooms' && t !== 'viol' ? 'code' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
  $('#pEmpty').innerHTML = rows.length ? '' : emptyState('Không có bản ghi', empty, 'history');
  $('#ptbl').onclick = e => {
    const b = e.target.closest('[data-i]'); if (!b) return;
    const [kind, key] = b.dataset.i.split(':');
    if (kind === 'loans') openLoan(ALL_LOANS.find(x => x.code === key));
    if (kind === 'rooms') openRoom(ROOM_HISTORY[Number(key)]);
    if (kind === 'viol') h.viol[Number(key)].open();
  };
}

/* ---------- Chi tiết bản ghi để đối chiếu ---------- */
function openLoan(t) {
  const give = id => (t.cond && t.cond[id]) || '–';
  const back = id => { const r = t.retCond && t.retCond[id]; return r ? `${COND[r.state]} (${r.qty}/${t.items.find(i => i.id === id).qty})${r.note ? ' · ' + esc(r.note) : ''}` : '–'; };
  setModal(`
    ${mHead(`Phiếu ${t.code}`, `${esc(t.who.name)} · ${CAMPUS_NAME[t.campus]} · ${t.room}`)}
    <div class="m-body">
      <div>${badge(LOAN_BADGE[t.status], LOAN_TEXT[t.status])} ${loanLateMin(t) ? badge('bad', 'Trả trễ ' + loanLateMin(t) + ' phút', true) : ''}</div>
      <dl class="dl" style="margin-top:16px">
        <div><dt>Mượn – trả dự kiến</dt><dd>${t.b.time} – ${t.d.time}, ${fmtDate(t.b.date)}</dd></div>
        <div><dt>Phòng sử dụng</dt><dd>${t.room}</dd></div>
        <div><dt>Bàn giao</dt><dd>${t.handed ? `${fmtDT(t.handed)}<br><small class="muted">bởi ${esc(t.handedBy)}</small>` : '–'}</dd></div>
        <div><dt>Nhận trả</dt><dd>${t.returned ? `${fmtDT(t.returned)}<br><small class="muted">bởi ${esc(t.returnedBy)}</small>` : '–'}</dd></div>
      </dl>
      <h3 class="sect-title">Đối chiếu tình trạng thiết bị</h3>
      <div class="tbl-wrap" style="border:1px solid var(--border);border-radius:12px"><table class="tbl" style="min-width:0"><thead><tr><th scope="col">Thiết bị</th><th scope="col">Lúc giao</th><th scope="col">Lúc trả</th></tr></thead>
        <tbody>${t.items.map(i => `<tr><td>${esc(eqType(i.id).name)} × ${i.qty}</td><td>${give(i.id)}</td><td>${back(i.id)}</td></tr>`).join('')}</tbody></table></div>
      ${t.incident ? `<div style="margin-top:14px">${alertBox('warn', `Phiếu sự cố ${t.incident}`, 'Phát sinh từ lần nhận trả này.', 'alert')}</div>` : ''}
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Đóng</button>')}`, 'drawer');
}
function openRoom(r) {
  const p = personOf(r.who);
  const rep = REPORTS.find(x => x.id === r.rep);
  setModal(`
    ${mHead(`${r.room} · ${esc(r.purpose)}`, `${esc(p.name)} · ${CAMPUS_NAME[r.campus]}`)}
    <div class="m-body">
      <div>${badge(ROOM_ST[r.st][0], ROOM_ST[r.st][1])} ${r.late ? badge('bad', 'Trả trễ ' + r.late + ' phút', true) : ''}</div>
      <dl class="dl" style="margin-top:16px">
        <div><dt>Ngày</dt><dd>${fmtDate(r.date)}</dd></div><div><dt>Khung giờ</dt><dd>${r.s} – ${r.e}</dd></div>
        <div><dt>Giờ trả thực tế</dt><dd>${r.back || '–'}</dd></div><div><dt>Biên bản</dt><dd>${r.rep ? esc(r.rep) : '–'}</dd></div>
        ${rep ? `<div><dt>Bảo vệ lập biên bản</dt><dd>${esc(rep.guard)}</dd></div>` : ''}
        ${r.detail ? `<div class="full"><dt>Ghi nhận</dt><dd>${esc(r.detail)}</dd></div>` : ''}
      </dl>
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Đóng</button>')}`, 'drawer');
}

/* Mở sẵn hồ sơ có nhiều dữ liệu để thấy ngay thống kê; #MSSV hoặc #mã GV mở đúng người */
const hash = hashKey();
renderList();
select(personOf(hash) ? hash : '2474802010204');
