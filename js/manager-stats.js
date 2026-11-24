/* Người quản lý phòng · Thống kê sử dụng phòng (dữ liệu mẫu) */

const MONTHS = [['T9/2026', '2026-09-01', '2026-09-30'], ['T10/2026', '2026-10-01', '2026-10-31'], ['T11/2026', '2026-11-01', '2026-11-23']];
const STATS = {
  'Phòng học': {
    months: [188, 214, 196],
    rooms: [['J.07.01', 82], ['B.04.02', 74], ['A.03.01', 71], ['J.06.04', 63], ['A.01.01', 58], ['J.05.02', 41]],
    units: [['Khoa Công nghệ thông tin', 164, 392], ['Khoa Kinh tế', 121, 288], ['Khoa Luật', 88, 201], ['Khoa Ngoại ngữ', 74, 166], ['Khoa Dược', 51, 130]]
  },
  'Hội trường': {
    months: [9, 14, 11],
    rooms: [['H.01.01', 68], ['H.02.01', 54], ['H.03.01', 31]],
    units: [['CLB Debate VLU', 6, 22], ['Khoa Công nghệ thông tin', 5, 24], ['Khoa Kinh tế', 4, 15], ['CLB Âm nhạc', 3, 12], ['TT Hỗ trợ SV', 3, 11]]
  },
  'Phòng họp': {
    months: [22, 27, 25],
    rooms: [['M.04.01', 77], ['M.03.01', 69], ['M.05.01', 44], ['M.03.02', 31], ['M.04.02', 18]],
    units: [['Khoa Kinh tế', 14, 26], ['Phòng CSVC', 12, 14], ['Khoa Công nghệ thông tin', 11, 19], ['Khoa Luật', 8, 13], ['Ban Giám hiệu', 7, 12]]
  }
};
const sv = { type: '' };

const dayMs = 86400000;
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / dayMs) + 1;

function compute() {
  const from = $('#sFrom').value, to = $('#sTo').value;
  if (!from || !to || from > to) return { error: !from || !to ? 'Vui lòng chọn khoảng thời gian.' : '“Từ ngày” phải trước hoặc bằng “Đến ngày”.' };
  const types = sv.type ? [sv.type] : Object.keys(STATS);
  const frac = MONTHS.map(([, a, b]) => {
    const s = from > a ? from : a, e = to < b ? to : b;
    return s > e ? 0 : days(s, e) / days(a, b);
  });
  if (frac.every(f => f === 0)) return { empty: true };
  const months = MONTHS.map((m, i) => ({ label: m[0], value: Math.round(types.reduce((s, t) => s + STATS[t].months[i], 0) * frac[i]), on: frac[i] > 0 })).filter(m => m.on);
  const total = months.reduce((s, m) => s + m.value, 0);
  const rooms = types.flatMap(t => STATS[t].rooms).sort((a, b) => b[1] - a[1]).slice(0, sv.type ? 8 : 8);
  const scale = total / types.reduce((s, t) => s + STATS[t].months.reduce((a, b) => a + b, 0), 0);
  const unitMap = {};
  types.forEach(t => STATS[t].units.forEach(([u, n, h]) => { const x = unitMap[u] = unitMap[u] || { n: 0, h: 0, types: new Set() }; x.n += n; x.h += h; x.types.add(t); }));
  const units = Object.entries(unitMap).map(([u, x]) => [u, Math.round(x.n * scale), Math.round(x.h * scale), [...x.types].join(', ')]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { months, total, rooms, units };
}

function render() {
  $('#typeChips').innerHTML = [['', 'Tất cả loại phòng'], ...ROOM_TYPES_L.map(t => [t, t])].map(([v, l]) =>
    `<button type="button" class="chip ${sv.type === v ? 'active' : ''}" data-v="${v}" aria-pressed="${sv.type === v}">${l}</button>`).join('');
  const d = compute();
  $('#statErr').innerHTML = '';
  const blank = html => { ['kpis', 'monthChart', 'roomChart', 'topRows'].forEach(id => $('#' + id).innerHTML = ''); $('#statErr').innerHTML = html; };
  if (d.error) return blank(notice('bad', `<b>${d.error}</b>`, 'alert'));
  if (d.empty) return blank(notice('warn', '<b>Không có dữ liệu trong khoảng thời gian đã chọn.</b> Hãy chọn khoảng thời gian từ 01/09/2026 trở đi.', 'info'));

  const best = d.rooms[0];
  const avg = Math.round(d.rooms.reduce((s, r) => s + r[1], 0) / d.rooms.length);
  $('#kpis').innerHTML = `
    <div class="kpi"><span class="label">Số lượt mượn đã duyệt</span><div class="value">${fmtNum(d.total)}</div><div class="meta">trong khoảng thời gian đã chọn</div></div>
    <div class="kpi"><span class="label">Tỷ lệ sử dụng trung bình</span><div class="value">${avg}<small>%</small></div><div class="meta">trên ${d.rooms.length} phòng dùng nhiều nhất</div></div>
    <div class="kpi"><span class="label">Phòng dùng nhiều nhất</span><div class="value">${best[0]}</div><div class="meta">${best[1]}% thời gian khả dụng</div></div>`;
  $('#monthChart').innerHTML = vbarsHtml(d.months.map((m, i) => ({ label: m.label, value: m.value, cur: i === d.months.length - 1 })), Math.max(10, Math.ceil(Math.max(...d.months.map(m => m.value)) * 1.1 / 20) * 20));
  $('#roomChart').innerHTML = d.rooms.map(([r, p]) => `
    <div class="hbar-row"><span class="name">${r}</span><div class="hbar-track" title="${p}%"><i style="width:${p}%"></i></div><span class="val">${p}%</span></div>`).join('');
  $('#topRows').innerHTML = d.units.map(([u, n, h, t]) => `<tr><td>${esc(u)}</td><td class="num">${fmtNum(n)}</td><td class="num">${fmtNum(h)}</td><td class="dim">${t}</td></tr>`).join('');
}
const ROOM_TYPES_L = ['Phòng học', 'Hội trường', 'Phòng họp'];

bindChips($('#typeChips'), v => { sv.type = v; render(); });
$('#sFrom').addEventListener('change', render);
$('#sTo').addEventListener('change', render);
const doExport = (btn, fmt) => {
  const d = compute();
  if (d.error || d.empty) { render(); showToast(d.empty ? 'Không có dữ liệu để xuất.' : d.error); return; }
  submitWithLoading(btn, () => showToast(`Đã xuất báo cáo ${fmt} (mẫu)`), 900);
};
$('#btnXlsx').addEventListener('click', e => doExport(e.currentTarget, 'Excel'));
$('#btnPdf').addEventListener('click', e => doExport(e.currentTarget, 'PDF'));
render();
