/* Phòng CSVC · Tổng quan (dashboard theo cơ sở)
   PB-54 chỉ số, thiết bị mượn thêm, biểu đồ, mục cần chú ý, bấm vào chỉ số để xem danh sách
   Số liệu tính từ dữ liệu mẫu trong csvc-data.js nên khớp với các màn hình khác */

let campus = '';
const WEEK_LABELS = ['26/10', '2/11', '9/11', '16/11', '23/11'];
const WEEK_USAGE = { cs1: [62, 68, 71, 66, 74], cs2: [55, 59, 64, 61, 69], cs3: [48, 52, 50, 57, 60] };
const DAY_LABELS = ['T3 17', 'T4 18', 'T5 19', 'T6 20', 'T7 21', 'CN 22', 'T2 23'];
const DAY_LOANS = { cs1: [5, 7, 6, 8, 4, 2, 6], cs2: [4, 5, 7, 6, 5, 1, 5], cs3: [2, 3, 2, 4, 3, 0, 3] };
const INC_COLORS = { wait: 'var(--warn-text)', received: 'var(--info-text)', repairing: 'var(--primary)', done: 'var(--ok-text)', rejected: '#b9bec9' };
const inScope = (c, x) => !c || x.campus === c;

function metrics(c) {
  const rooms = ROOMS.filter(r => inScope(c, r));
  const use = USAGE.filter(u => inScope(c, u));
  const usedRooms = new Set(use.filter(u => u.st !== 'returned').map(u => u.room));
  const off = rooms.filter(r => r.status !== 'active').length;
  const inUse = rooms.filter(r => r.status === 'active' && usedRooms.has(r.code)).length;
  const inc = INCIDENTS.filter(i => inScope(c, i));
  const loans = LOANS.filter(t => inScope(c, t));
  return {
    total: rooms.length, off, inUse, free: rooms.length - off - inUse,
    rate: Math.round(inUse / Math.max(1, rooms.length - off) * 100),
    over: use.filter(u => u.st === 'over').length,
    wait: loans.filter(t => t.status === 'wait').length, borrowed: loans.filter(t => t.status === 'borrowed').length,
    incWait: inc.filter(i => i.status === 'wait').length, incWork: inc.filter(i => i.status === 'received' || i.status === 'repairing').length,
    incOver: inc.filter(incOverdue).length,
    badReports: REPORTS.filter(r => inScope(c, r) && r.result === 'missing' && !r.handled)
  };
}
const sum = (arrs) => arrs[0].map((_, k) => arrs.reduce((s, a) => s + a[k], 0));
const avg = (arrs) => arrs[0].map((_, k) => Math.round(arrs.reduce((s, a) => s + a[k], 0) / arrs.length));

function renderKpis() {
  const m = metrics(campus);
  const k = [
    { label: 'Phòng đang sử dụng', value: `${m.inUse}<small> / ${m.total}</small>`, meter: m.rate, meta: `${m.free} phòng trống · ${m.off} đang bảo trì`, href: 'csvc-rooms.html' },
    { label: 'Phiếu mượn đang mở', value: m.wait + m.borrowed, meta: `${m.wait} chờ nhận · ${m.borrowed} đang mượn`, href: 'csvc-equipment.html' },
    { label: 'Sự cố cần xử lý', value: m.incWait + m.incWork, meta: `${m.incWait} chờ duyệt · ${m.incWork} đang xử lý${m.incOver ? ` · ${m.incOver} quá hạn` : ''}`, bad: m.incOver > 0, alerting: m.incOver > 0, href: 'csvc-incidents.html' },
    { label: 'Phòng quá giờ', value: m.over, meta: m.over ? 'Chưa có biên bản trả phòng' : 'Không có phòng quá giờ', bad: m.over > 0, alerting: m.over > 0, href: 'csvc-rooms.html#over' }
  ];
  $('#kpis').innerHTML = k.map(x => `
    <a class="kpi ${x.alerting ? 'alerting' : ''}" href="${x.href}" aria-label="${x.label}: ${String(x.value).replace(/<[^>]+>/g, '')}. Mở danh sách">
      <span class="label">${x.label}</span>
      <div class="value">${x.value}</div>
      ${x.meter != null ? `<div class="meter" role="img" aria-label="${x.meter}% phòng đang sử dụng"><i style="width:${x.meter}%"></i></div>` : ''}
      <div class="meta ${x.bad ? 'bad' : ''}">${x.meta}</div>
    </a>`).join('');
}

function renderStock() {
  const ids = campus ? [campus] : CAMPUSES.map(c => c.id);
  $('#stock').innerHTML = EQUIP_TYPES.map(t => {
    const n = ids.reduce((s, c) => s + STOCK[c][t.id], 0);
    const [k, label] = stockBadge(n);
    return `
      <div class="stock">
        <div class="head">${icon(t.icon)}${t.name}</div>
        <div class="value">${n}</div>
        ${badge(k, label)}
        ${ids.length > 1 ? `<div class="by">${CAMPUSES.map(c => `${c.name.replace('Cơ sở ', 'CS')}: ${STOCK[c.id][t.id]}`).join(' · ')}</div>` : ''}
      </div>`;
  }).join('');
}

function attnItems() {
  const items = [];
  INCIDENTS.filter(i => inScope(campus, i) && incOverdue(i)).forEach(i => items.push({ t: 'bad', ic: 'clock', title: `Sự cố Khẩn cấp quá hạn · ${i.place}`, desc: `${i.target} · gửi ${agoText(minsSince(i.times.sent))}, chưa có kỹ thuật tiếp nhận`, href: `csvc-incidents.html#${i.code}` }));
  USAGE.filter(u => inScope(campus, u) && u.st === 'over').forEach(u => items.push({ t: 'bad', ic: 'door', title: `Phòng quá giờ · ${u.room}`, desc: `${u.title} đã hết giờ lúc ${hm(u.e)}, quá ${-u.left} phút, chưa có biên bản trả phòng`, href: 'csvc-rooms.html#over' }));
  REPORTS.filter(r => inScope(campus, r) && r.result === 'missing' && !r.handled).forEach(r => items.push({ t: 'info', ic: 'clipboard', title: `Biên bản báo thiếu hoặc hỏng · ${r.room}`, desc: `${r.missing.map(i => i.name).join(', ')} (${r.id}) chưa tạo phiếu sự cố`, href: `csvc-rooms.html#${r.id}` }));
  INCIDENTS.filter(i => inScope(campus, i) && i.status === 'wait').forEach(i => items.push({ t: 'info', ic: 'alert', title: `Sự cố chờ duyệt · ${i.place}`, desc: `${i.target} · ${i.by} báo ${agoText(minsSince(i.times.sent))}`, href: `csvc-incidents.html#${i.code}` }));
  INCIDENTS.filter(i => inScope(campus, i) && i.cannotFix && i.status !== 'done').forEach(i => items.push({ t: 'info', ic: 'tool', title: `Kỹ thuật không sửa được · ${i.target}`, desc: 'Cần quyết định thay thế hoặc bảo hành', href: `csvc-incidents.html#${i.code}` }));
  LOANS.filter(t => inScope(campus, t) && t.status === 'borrowed' && loanLateMin(t) > 0).forEach(t => items.push({ t: 'neutral', ic: 'box', title: `Phiếu mượn quá giờ trả · ${t.code}`, desc: `${t.who.name} chưa trả ${loanItemsLine(t.items)}, quá ${loanLateMin(t)} phút`, href: `csvc-equipment.html#${t.code}` }));
  const stockOut = [];
  (campus ? [campus] : CAMPUSES.map(c => c.id)).forEach(c => EQUIP_TYPES.forEach(t => { if (STOCK[c][t.id] === 0) stockOut.push(`${t.name} (${CAMPUS_NAME[c]})`); }));
  if (stockOut.length) items.push({ t: 'neutral', ic: 'plug', title: 'Thiết bị mượn thêm đã hết', desc: stockOut.join(', '), href: 'csvc-catalog.html#devices' });
  return items;
}
const ATTN_TYPES = [{ key: 'all', label: 'Tất cả' }, { key: 'bad', label: 'Khẩn' }, { key: 'info', label: 'Cần xử lý' }, { key: 'neutral', label: 'Theo dõi' }];
let attnFilter = 'all';
function renderAttn() {
  const all = attnItems();
  const counts = { all: all.length, bad: 0, info: 0, neutral: 0 };
  all.forEach(a => counts[a.t]++);
  $('#attnChips').innerHTML = ATTN_TYPES.map(t => `<button type="button" class="chip ${t.key === attnFilter ? 'active' : ''}" data-v="${t.key}" aria-pressed="${t.key === attnFilter}">${t.label}<span class="n">${counts[t.key]}</span></button>`).join('');
  const list = attnFilter === 'all' ? all : all.filter(a => a.t === attnFilter);
  $('#attnCount').textContent = `${list.length} mục`;
  $('#attnList').innerHTML = list.map(a => `
    <li><span class="attn-ico ${a.t}">${icon(a.ic)}</span>
      <div class="attn-main"><b>${esc(a.title)}</b><span>${esc(a.desc)}</span></div>
      <a class="link-btn" href="${a.href}">Xem</a></li>`).join('') || `<li>${emptyState('Không có mục nào cần chú ý', 'Mọi thứ đang ổn.', 'check')}</li>`;
}
bindChips($('#attnChips'), v => { attnFilter = v; renderAttn(); });

function renderCharts() {
  const ids = campus ? [campus] : CAMPUSES.map(c => c.id);
  const weeks = campus ? WEEK_USAGE[campus] : avg(ids.map(c => WEEK_USAGE[c]));
  $('#usageChart').innerHTML = vbarsHtml(WEEK_LABELS.map((label, i) => ({ label, value: weeks[i], cur: i === WEEK_LABELS.length - 1 })), 100, '%');
  const days = campus ? DAY_LOANS[campus] : sum(ids.map(c => DAY_LOANS[c]));
  $('#loanChart').innerHTML = vbarsHtml(DAY_LABELS.map((label, i) => ({ label, value: days[i], cur: i === DAY_LABELS.length - 1 })), Math.max(8, Math.max(...days) + 2));

  /* So sánh 3 cơ sở: tỷ lệ sử dụng hôm nay và sự cố theo trạng thái */
  const rows = CAMPUSES.map(c => ({ c, m: metrics(c.id), inc: INCIDENTS.filter(i => i.campus === c.id) }));
  const max = Math.max(...rows.map(r => r.inc.length), 1);
  $('#compare').innerHTML = rows.map(({ c, m, inc }) => `
    <div class="hbar-row ${campus === c.id ? 'cur' : ''}" style="grid-template-columns:84px minmax(0,1fr) 92px">
      <span class="name">${c.name}</span>
      <div class="hbar-track" role="img" aria-label="${c.name}: ${inc.length} sự cố">
        ${Object.keys(INC_TEXT).map(s => { const n = inc.filter(i => i.status === s).length; return n ? `<i style="width:${n / max * 100}%;background:${INC_COLORS[s]}" title="${INC_TEXT[s]}: ${n}"></i>` : ''; }).join('')}
      </div>
      <span class="val" style="text-align:right">${inc.length} · ${m.rate}%</span>
    </div>`).join('');
  $('#compareLegend').innerHTML = Object.entries(INC_TEXT).map(([s, t]) => `<span><i style="background:${INC_COLORS[s]}"></i>${t}</span>`).join('') + '<span class="muted">Số cuối dòng: tổng sự cố · tỷ lệ phòng đang sử dụng</span>';
}

function renderAll() { renderKpis(); renderStock(); renderAttn(); renderCharts(); }
$('#campusHost').innerHTML = campusChipsHtml(campus);
bindChips($('#campusHost'), v => { campus = v; renderAll(); });

function tickClock() { $('#liveTime').textContent = NOW_TIME; }
renderAll(); tickClock();
