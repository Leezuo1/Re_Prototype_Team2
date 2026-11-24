/* Phòng CSVC · Xuất báo cáo thống kê
   PB-57 chọn loại báo cáo, cơ sở, khoảng thời gian, xem trước, xuất Excel hoặc PDF
   Không tạo file thật: nút xuất chỉ giả lập. Số liệu xem trước sinh từ dữ liệu mẫu */

const DATA_FROM = '2026-09-01';   // dữ liệu mẫu có từ ngày này đến hôm nay
const REPORT_TYPES = [
  { id: 'room', name: 'Tần suất sử dụng phòng', desc: 'Số lượt và tỷ lệ sử dụng của từng phòng.', icon: 'door' },
  { id: 'loan', name: 'Mượn – trả thiết bị', desc: 'Số phiếu, số lượng mượn, trả trễ theo loại thiết bị.', icon: 'box' },
  { id: 'broken', name: 'Thiết bị hay hỏng', desc: 'Thiết bị có nhiều sự cố nhất trong kỳ.', icon: 'tool' },
  { id: 'incident', name: 'Sự cố và thời gian xử lý', desc: 'Số sự cố và thời gian xử lý trung bình theo cơ sở.', icon: 'alert' },
  { id: 'violation', name: 'Vi phạm của người mượn', desc: 'Trả trễ, thiết bị hỏng, thiếu hoặc mất theo từng người.', icon: 'clipboard' }
];
const recent = [
  { name: 'Sự cố và thời gian xử lý', meta: 'Tất cả cơ sở · 01/11 – 22/11/2026 · Excel', at: '22/11/2026 16:40' },
  { name: 'Tần suất sử dụng phòng', meta: 'Cơ sở 2 · 01/10 – 31/10/2026 · PDF', at: '02/11/2026 09:15' }
];

/* Sinh số giả lập nhưng ổn định theo chuỗi khóa */
const seed = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);
const rnd = (key, lo, hi) => lo + seed(key) % (hi - lo + 1);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000) + 1;

function overlapDays(from, to) {
  const a = from > DATA_FROM ? from : DATA_FROM, b = to < TODAY ? to : TODAY;
  return a > b ? 0 : daysBetween(a, b);
}
function buildPreview(type, campus, from, to) {
  const days = overlapDays(from, to);
  if (!days) return null;
  const k = days / 30, ck = `${type}|${campus}|${from}`;
  const roomsIn = ROOMS.filter(r => !campus || r.campus === campus);
  if (type === 'room') {
    const rows = roomsIn.map(r => { const n = Math.max(1, Math.round(rnd(r.code + ck, 6, 38) * k)); return [r.code, CAMPUS_NAME[r.campus], n, `${Math.round(n * 1.9)} giờ`, `${Math.min(96, rnd(r.code, 38, 92))}%`]; }).sort((a, b) => b[2] - a[2]).slice(0, 8);
    return { head: ['Phòng', 'Cơ sở', 'Số lượt', 'Giờ sử dụng', 'Tỷ lệ sử dụng'], rows, total: roomsIn.length, noun: 'phòng' };
  }
  if (type === 'loan') {
    const rows = EQUIP_TYPES.map(t => { const n = Math.max(1, Math.round(rnd(t.id + ck, 14, 60) * k)); return [t.name, n, Math.round(n * 1.4), Math.round(n * 0.08), Math.round(n * 0.04)]; });
    return { head: ['Loại thiết bị', 'Số phiếu', 'Số lượng mượn', 'Trả trễ', 'Có vấn đề'], rows, total: rows.length, noun: 'loại thiết bị' };
  }
  if (type === 'broken') {
    const devs = DEVICES.filter(d => !campus || d.campus === campus);
    const rows = devs.map(d => [d.code + ' · ' + d.name, CAMPUS_NAME[d.campus], Math.max(0, Math.round(rnd(d.code + ck, 0, 6) * k)), `${rnd(d.code, 1, 9)} lần`]).filter(r => r[2] > 0).sort((a, b) => b[2] - a[2]).slice(0, 8);
    return { head: ['Thiết bị', 'Cơ sở', 'Số sự cố', 'Lần sửa gần nhất cách đây'], rows, total: rows.length, noun: 'thiết bị' };
  }
  if (type === 'incident') {
    const rows = CAMPUSES.filter(c => !campus || c.id === campus).map(c => { const n = Math.max(1, Math.round(rnd(c.id + ck, 9, 26) * k)); const done = Math.round(n * 0.8); return [c.name, n, done, n - done, `${rnd(c.id, 22, 70)} phút`]; });
    return { head: ['Cơ sở', 'Số sự cố', 'Đã xử lý', 'Đang mở', 'Thời gian xử lý trung bình'], rows, total: rows.length, noun: 'cơ sở' };
  }
  const rows = PEOPLE_FOR_REPORT.filter((_, i) => !campus || i % 3 === Number(campus.slice(2)) - 1).map(p => [p.name, p.code, Math.max(0, Math.round(rnd(p.code + ck, 0, 4) * k)), Math.max(0, Math.round(rnd(p.code + 'b' + ck, 0, 2) * k))]).filter(r => r[2] + r[3] > 0).sort((a, b) => b[2] + b[3] - a[2] - a[3]).slice(0, 8);
  return { head: ['Người mượn', 'MSSV / mã GV', 'Trả trễ', 'Hỏng, thiếu hoặc mất'], rows, total: rows.length, noun: 'người mượn' };
}
const PEOPLE_FOR_REPORT = ACCOUNTS.filter(a => a.roles.includes('Sinh viên') || a.roles.includes('Giảng viên'));

/* ---------- Danh sách loại báo cáo ---------- */
function renderTypes() {
  $('#types').innerHTML = REPORT_TYPES.map(t => `
    <button type="button" class="type-card" data-type="${t.id}">
      <span class="attn-ico info">${icon(t.icon)}</span>
      <span class="grow"><b>${t.name}</b><small>${t.desc}</small></span>
      <span class="link-btn">Xuất</span>
    </button>`).join('');
  $('#recent').innerHTML = recent.map(r => `
    <li><span class="attn-ico neutral">${icon('file')}</span><div class="attn-main"><b>${esc(r.name)}</b><span>${esc(r.meta)} · ${r.at}</span></div></li>`).join('');
}
$('#types').addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (b) openExport(b.dataset.type); });
$('#btnExport').addEventListener('click', () => openExport(REPORT_TYPES[0].id));

/* ---------- Form xuất báo cáo ---------- */
function openExport(preType) {
  const st = { type: preType, campus: '', from: '2026-11-01', to: TODAY, fmt: 'Excel' };
  const m = setModal(`
    ${mHead('Xuất báo cáo', 'Chọn loại, cơ sở, khoảng thời gian rồi xem trước số liệu.')}
    <div class="m-body">
      <fieldset class="fs"><legend>Loại báo cáo *</legend>
        <div class="radio-grid" id="rType">${REPORT_TYPES.map(t => `<label class="radio-card"><input type="radio" name="rtype" value="${t.id}" ${t.id === st.type ? 'checked' : ''}><div>${t.name}<small>${t.desc}</small></div></label>`).join('')}</div>
      </fieldset>
      <div class="f-row" style="margin-top:16px">
        <div class="f-group"><label for="rFrom">Từ ngày *</label><input type="date" id="rFrom" value="${st.from}"></div>
        <div class="f-group"><label for="rTo">Đến ngày *</label><input type="date" id="rTo" value="${st.to}"></div>
      </div>
      <p class="err" id="rErr" hidden></p>
      <div class="f-row" style="margin-top:8px;align-items:end">
        <div class="f-group"><span class="lbl" id="lblCs">Cơ sở</span><div id="rCampus">${campusChipsHtml('', null, 'Cơ sở')}</div></div>
        <div class="f-group"><span class="lbl" id="lblF">Định dạng</span><div class="fmt-seg" role="group" aria-labelledby="lblF" id="rFmt"><button type="button" class="active" data-v="Excel" aria-pressed="true">Excel</button><button type="button" data-v="PDF" aria-pressed="false">PDF</button></div></div>
      </div>
      <div id="rPrev" aria-live="polite"></div>
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="rGo">' + icon('download') + ' Xuất báo cáo</button>')}`, '', true);

  const validate = () => {
    st.from = $('#rFrom', m).value; st.to = $('#rTo', m).value;
    const err = $('#rErr', m);
    const msg = !st.from || !st.to ? 'Vui lòng chọn khoảng thời gian.' : st.from > st.to ? 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.' : '';
    err.hidden = !msg; err.textContent = msg;
    $('#rFrom', m).classList.toggle('invalid', !st.from || (!!st.to && st.from > st.to)); $('#rTo', m).classList.toggle('invalid', !st.to);
    return !msg;
  };
  const drawPreview = () => {
    if (!validate()) { $('#rPrev', m).innerHTML = ''; return null; }
    const p = buildPreview(st.type, st.campus, st.from, st.to);
    const name = REPORT_TYPES.find(t => t.id === st.type).name;
    if (!p) { $('#rPrev', m).innerHTML = `<div style="margin-top:16px">${alertBox('warn', 'Không có dữ liệu trong khoảng này', `Dữ liệu mẫu có từ ${fmtDate(DATA_FROM)} đến ${fmtDate(TODAY)}. Hệ thống sẽ không tạo file rỗng.`, 'info')}</div>`; return null; }
    $('#rPrev', m).innerHTML = `
      <h3 class="sect-title">Xem trước · ${name}</h3>
      <div class="prev-wrap"><div class="tbl-wrap"><table class="tbl"><thead><tr>${p.head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>
        <tbody>${p.rows.map(r => `<tr>${r.map((c, i) => `<td class="${typeof c === 'number' ? 'num' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <div class="prev-foot">${fmtDate(st.from)} – ${fmtDate(st.to)} · ${st.campus ? CAMPUS_NAME[st.campus] : 'Tất cả cơ sở'} · hiển thị ${p.rows.length} dòng đầu, file xuất có đủ dữ liệu</div></div>`;
    return p;
  };
  bindChips($('#rCampus', m), v => { st.campus = v; drawPreview(); });
  $('#rFmt', m).addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; st.fmt = b.dataset.v; $$('#rFmt button', m).forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); }); });
  $('#rType', m).addEventListener('change', e => { st.type = e.target.value; drawPreview(); });
  ['#rFrom', '#rTo'].forEach(id => $(id, m).addEventListener('change', drawPreview));
  drawPreview();
  $('#rGo', m).addEventListener('click', () => {
    const p = drawPreview();
    if (!validate()) return;
    if (!p) { $('#rPrev', m).scrollIntoView({ block: 'nearest' }); return; }
    const name = REPORT_TYPES.find(t => t.id === st.type).name;
    const cs = st.campus ? CAMPUS_NAME[st.campus] : 'Tất cả cơ sở';
    const fileName = `${fold(name).replace(/\s+/g, '-')}_${st.campus || 'tat-ca-co-so'}_${st.from}_${st.to}.${st.fmt === 'Excel' ? 'xlsx' : 'pdf'}`;
    submitWithLoading($('#rGo', m), () => {
      recent.unshift({ name, meta: `${cs} · ${fmtDate(st.from)} – ${fmtDate(st.to)} · ${st.fmt}`, at: `${fmtDate(TODAY)} ${NOW_TIME}` });
      closeModal(); renderTypes();
      showToast(`Đã xuất ${fileName} (file mẫu)`);
    }, 900);
  });
}
renderTypes();
