/* Phòng CSVC · Duyệt, theo dõi và xử lý sự cố
   PB-49 danh sách và chi tiết · PB-50 duyệt / từ chối + mức ưu tiên · PB-51 phân công kỹ thuật viên
   PB-52 theo dõi tiến độ + quá hạn · PB-53 ngưng sử dụng, thay thế / bảo hành
   Dữ liệu mẫu, thao tác chạy trên bộ nhớ trang */

const f = { tab: '', campus: '', prio: '', source: '', overdue: false, q: '' };
const TABS = [['', 'Tất cả'], ['wait', 'Chờ duyệt'], ['received', 'Đã tiếp nhận'], ['repairing', 'Đang sửa'], ['done', 'Đã xử lý'], ['rejected', 'Đã từ chối']];
const PRIO_ORDER = { urgent: 0, normal: 2 };   // phiếu chờ duyệt (chưa xếp mức) đứng giữa vì cần xử lý ngay
const stamp = () => ({ date: TODAY, time: NOW_TIME });
const addLog = (i, text) => i.log.push({ at: stamp(), text });
const closed = i => i.status === 'done' || i.status === 'rejected';

/* ---------- Danh sách ---------- */
function match(i, ignoreTab) {
  const q = fold(f.q.trim());
  return (ignoreTab || !f.tab || i.status === f.tab) && (!f.campus || i.campus === f.campus) && (!f.prio || (f.prio === 'none' ? !i.priority : i.priority === f.prio)) &&
    (!f.source || i.source === f.source) && (!f.overdue || incOverdue(i)) &&
    (!q || fold(i.code).includes(q) || fold(i.target).includes(q) || fold(i.place).includes(q));
}
function renderBars() {
  const base = INCIDENTS.filter(i => match(i, true));
  $('#campusHost').innerHTML = campusChipsHtml(f.campus, countBy(INCIDENTS.filter(i => (!f.tab || i.status === f.tab) && (!f.overdue || incOverdue(i)))));
  $('#tabChips').innerHTML = TABS.map(([k, l]) => {
    const n = k ? base.filter(i => i.status === k).length : base.length;
    return `<button type="button" class="chip ${f.tab === k ? 'active' : ''}" data-v="${k}" aria-pressed="${f.tab === k}">${l}<span class="n">${n}</span></button>`;
  }).join('');
  const nOver = INCIDENTS.filter(incOverdue).length;
  $('#overBtn').classList.toggle('active', f.overdue);
  $('#overBtn').setAttribute('aria-pressed', f.overdue);
  $('#overN').textContent = nOver;
}
bindChips($('#campusHost'), v => { f.campus = v; render(); });
bindChips($('#tabChips'), v => { f.tab = v; render(); });
$('#overBtn').addEventListener('click', () => { f.overdue = !f.overdue; render(); });
$('#fPrio').addEventListener('change', e => { f.prio = e.target.value; render(); });
$('#fSource').innerHTML = '<option value="">Mọi nguồn báo</option>' + SOURCES.map(s => `<option>${s}</option>`).join('');
$('#fSource').addEventListener('change', e => { f.source = e.target.value; render(); });
$('#q').addEventListener('input', e => { f.q = e.target.value; render(); });

function sortKey(i) {
  // Phiếu đang mở lên trước; trong đó Khẩn cấp trước, rồi phiếu gửi sớm nhất trước
  return [closed(i) ? 1 : 0, i.priority ? PRIO_ORDER[i.priority] : 1, new Date(`${i.times.sent.date}T${i.times.sent.time}`).getTime()];
}
function render() {
  renderBars();
  const list = INCIDENTS.filter(i => match(i)).sort((a, b) => { const x = sortKey(a), y = sortKey(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
  $('#incList').innerHTML = list.map(i => {
    const over = incOverdue(i);
    return `
    <li class="inc-item" id="inc-${i.code}">
      <div class="inc-ico ${i.priority === 'urgent' && !closed(i) ? 'urgent' : ''}">${icon(i.kind === 'room' ? 'door' : 'monitor')}</div>
      <div class="inc-main">
        <h3>${esc(i.target)} <small>${i.code}</small></h3>
        <p>${esc(i.desc)}</p>
        <div class="inc-meta">
          <span>${icon('mapPin')}${i.place.startsWith('Kho') ? esc(i.place) : i.place} · ${CAMPUS_NAME[i.campus]}</span>
          <span>${icon('user')}${esc(i.by)} <em style="font-style:normal">(${i.source})</em></span>
          <span>${icon('clock')}${fmtDT(i.times.sent)} · ${agoText(minsSince(i.times.sent))}</span>
          <span>${icon('wrench')}${i.tech ? esc(i.tech) : (i.status === 'wait' || i.status === 'rejected' ? 'Chưa phân công' : 'Chưa phân công')}</span>
        </div>
      </div>
      <div class="inc-side">
        <div>${badge(INC_BADGE[i.status], INC_TEXT[i.status])}</div>
        <div>${i.priority ? `<span class="prio ${i.priority}">${i.priority === 'urgent' ? icon('alert') : ''}${PRIO_TEXT[i.priority]}</span>` : `<span class="prio">Chưa xếp mức</span>`}</div>
        ${over ? `<span class="over-flag">${icon('clock')}Quá hạn</span>` : ''}
        ${i.cannotFix && !closed(i) ? `<span class="prio urgent">${icon('tool')}Không sửa được</span>` : ''}
        <button type="button" class="btn btn-outline btn-sm" data-code="${i.code}">Chi tiết</button>
      </div>
    </li>`;
  }).join('');
  $('#emptyHost').innerHTML = list.length ? '' : emptyState('Không có sự cố phù hợp', 'Thử đổi trạng thái, cơ sở hoặc bỏ bộ lọc.', 'check');
  $('#countText').textContent = `${list.length} / ${INCIDENTS.length} sự cố`;
}
$('#incList').addEventListener('click', e => { const b = e.target.closest('button[data-code]'); if (b) openInc(b.dataset.code); });

/* ---------- Ngăn chi tiết (PB-49, PB-52) ---------- */
function timeline(i) {
  const li = (cls, title, sub) => `<li class="${cls}"><span class="dot">${cls === 'done' || cls === 'stop' ? icon('check') : ''}</span><div><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div></li>`;
  if (i.status === 'rejected') return `<ol class="tl">${li('done', 'Đã gửi', fmtDT(i.times.sent))}${li('stop', 'Đã từ chối', esc(i.reason || ''))}</ol>`;
  const idx = STAGES.indexOf(i.status === 'wait' ? 'sent' : i.status);
  return `<ol class="tl">${STAGES.map((s, k) => li(k < idx || (k === idx && i.status === 'done') ? 'done' : k === idx ? 'now' : 'todo', STAGE_TITLE[s],
    i.times[s] ? fmtDT(i.times[s]) + (s === 'received' && i.tech ? ` · ${esc(i.tech)} phụ trách` : '') : (k === idx ? 'Đang ở bước này' : ''))).join('')}</ol>`;
}
function openInc(code) {
  const i = getInc(code); if (!i) return;
  const over = incOverdue(i);
  const prior = INCIDENTS.filter(x => x.code !== i.code && x.place === i.place && x.target === i.target);
  const hist = FIX_HISTORY[i.place] || [];
  const resultText = i.result === 'repair' ? 'Đã sửa chữa' : i.result === 'replace' ? 'Đã thay thế thiết bị' : i.result === 'warranty' ? 'Đã gửi bảo hành' : '';
  const foot = [];
  if (i.status === 'wait') foot.push(`<button type="button" class="btn btn-danger-outline" id="aReject">${icon('x')} Từ chối</button>`, `<button type="button" class="btn btn-primary" id="aApprove">${icon('check')} Duyệt</button>`);
  if (!closed(i) && i.status !== 'wait') {
    foot.push(`<button type="button" class="btn btn-outline" id="aPrio">${icon('alert')} Đổi mức ưu tiên</button>`);
    if (i.cannotFix) foot.push(`<button type="button" class="btn btn-primary" id="aReplace">${icon('tool')} Xử lý thay thế / bảo hành</button>`);
    else if (i.status === 'received') foot.push(`<button type="button" class="btn btn-primary" id="aAssign">${icon('userCheck')} ${i.tech ? 'Đổi kỹ thuật viên' : 'Phân công'}</button>`);
  }
  const sim = (i.status === 'received' && i.tech) || (i.status === 'repairing' && !i.cannotFix) ? `
    <h3 class="sect-title">Mô phỏng phía kỹ thuật <small>chỉ để demo</small></h3>
    <div class="sim-box"><p>Kỹ thuật viên cập nhật trên màn hình của họ; Phòng CSVC và người báo nhận thông báo.</p><div class="row-actions">
      ${i.status === 'received' ? '<button type="button" class="btn btn-outline btn-sm" data-sim="start">Bắt đầu sửa</button>' : ''}
      ${i.status === 'repairing' ? '<button type="button" class="btn btn-outline btn-sm" data-sim="done">Báo đã xử lý</button><button type="button" class="btn btn-danger-outline btn-sm" data-sim="cannot">Báo không khắc phục được</button>' : ''}
    </div></div>` : '';
  const m = setModal(`
    ${mHead(`${esc(i.target)}`, `${i.code} · ${i.place.startsWith('Kho') ? esc(i.place) : i.place} · ${CAMPUS_NAME[i.campus]}`)}
    <div class="m-body">
      <div class="row-actions" style="flex-wrap:wrap">${badge(INC_BADGE[i.status], INC_TEXT[i.status])}
        ${i.priority ? `<span class="prio ${i.priority}">${PRIO_TEXT[i.priority]}</span>` : '<span class="prio">Chưa xếp mức</span>'}
        ${over ? `<span class="over-flag">${icon('clock')}Quá hạn</span>` : ''}</div>
      ${over ? `<div style="margin-top:12px">${alertBox('err', 'Khẩn cấp quá 15 phút chưa được kỹ thuật tiếp nhận', `Đã ${agoText(minsSince(i.times.sent)).replace(' trước', '')} kể từ lúc gửi. Phòng CSVC đã nhận cảnh báo.`, 'clock')}</div>` : ''}
      ${i.cannotFix && !closed(i) ? `<div style="margin-top:12px">${alertBox('warn', 'Kỹ thuật báo không khắc phục được', esc(i.cannotFix), 'tool')}</div>` : ''}
      <dl class="dl" style="margin-top:16px">
        <div class="full"><dt>Mô tả</dt><dd>${esc(i.desc)}</dd></div>
        <div><dt>Người báo</dt><dd>${esc(i.by)}<br><small class="muted">${i.source}</small></dd></div>
        <div><dt>Thời gian gửi</dt><dd>${fmtDT(i.times.sent)}</dd></div>
        <div><dt>Kỹ thuật viên</dt><dd>${i.tech ? esc(i.tech) : '<span class="muted">Chưa phân công</span>'}</dd></div>
        <div><dt>Nguồn báo</dt><dd>${i.source}${i.loan ? ` · phiếu ${i.loan}` : ''}</dd></div>
      </dl>
      ${i.inUse ? alertBox('warn', 'Phòng đang có lịch sử dụng khi báo', esc(i.inUse), 'door') : alertBox('gray', '', 'Không có lịch sử dụng tại phòng vào thời điểm báo.', 'door')}
      <h3 class="sect-title">Ảnh đính kèm</h3>
      ${i.img ? fileChip(i.img) : '<p class="muted">Người báo không đính kèm ảnh.</p>'}
      ${i.proof ? `<h3 class="sect-title">Ảnh nghiệm thu của kỹ thuật</h3>${fileChip(i.proof)}` : ''}
      <h3 class="sect-title">Tiến độ xử lý</h3>
      ${timeline(i)}
      ${closed(i) && i.status === 'done' ? `<div style="margin-top:14px">${alertBox('ok', resultText, i.result === 'replace' || i.result === 'warranty' ? 'Thiết bị cũ chuyển “Ngưng sử dụng”.' : 'Thiết bị đã gỡ trạng thái “Đang hỏng”.', 'check')}</div>` : ''}
      ${sim}
      <h3 class="sect-title">Lịch sử sửa chữa của ${i.kind === 'room' ? 'phòng' : 'thiết bị'}</h3>
      ${hist.length || prior.length ? `<ul class="pair-list">${hist.map(h => `<li><span>${esc(h.text)}</span><small>${h.at}</small></li>`).join('')}${prior.map(p => `<li><span>${p.code} · ${esc(p.desc)}</span>${badge(INC_BADGE[p.status], INC_TEXT[p.status])}</li>`).join('')}</ul>` : '<p class="muted">Chưa có lần sửa chữa nào trước đây.</p>'}
      <h3 class="sect-title">Nhật ký xử lý</h3>
      ${i.log.length ? `<ul class="log">${[...i.log].reverse().map(l => `<li><time>${fmtDT(l.at)}</time><span>${esc(l.text)}</span></li>`).join('')}</ul>` : '<p class="muted">Chưa có thao tác nào.</p>'}
    </div>
    ${foot.length ? mFoot(foot.join(''), 'wrap') : mFoot('<button type="button" class="btn btn-outline" data-close>Đóng</button>')}`, 'drawer');
  $('#aApprove', m)?.addEventListener('click', () => openApprove(i));
  $('#aReject', m)?.addEventListener('click', () => rejectInc(i));
  $('#aPrio', m)?.addEventListener('click', () => openPriority(i));
  $('#aAssign', m)?.addEventListener('click', () => openAssign(i));
  $('#aReplace', m)?.addEventListener('click', () => openReplace(i));
  $$('[data-sim]', m).forEach(b => b.addEventListener('click', () => simulate(i, b.dataset.sim)));
}

/* ---------- Duyệt / từ chối + mức ưu tiên (PB-50) ---------- */
function prioCards(cur, suggest) {
  return `<div class="radio-grid">
    ${['urgent', 'normal'].map(p => `<label class="radio-card"><input type="radio" name="prio" value="${p}" ${cur === p ? 'checked' : ''}><div>${PRIO_TEXT[p]}<small>${p === 'urgent' ? 'Ảnh hưởng ca học đang diễn ra. Kỹ thuật cần tiếp nhận trong 15 phút.' : 'Xử lý theo thứ tự tiếp nhận.'}</small></div></label>`).join('')}
  </div>${suggest ? `<p class="mono-note" style="margin-top:10px">${icon('info')} Gợi ý Khẩn cấp vì phòng đang có lịch sử dụng khi báo.</p>` : ''}`;
}
function openApprove(i) {
  const m = setModal(`
    ${mHead('Duyệt sự cố', `${i.code} · ${esc(i.target)} · ${i.place}`)}
    <div class="m-body">
      <p style="margin-bottom:14px">Chọn mức ưu tiên cho phiếu. Sau khi duyệt, phiếu chuyển sang “Đã tiếp nhận” và người báo nhận thông báo.</p>
      ${prioCards(i.inUse ? 'urgent' : 'normal', !!i.inUse)}
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="apOk">Duyệt sự cố</button>')}`);
  $('#apOk', m).addEventListener('click', () => {
    i.priority = $('input[name=prio]:checked', m).value; i.status = 'received'; i.times.received = stamp();
    addLog(i, `Phòng CSVC duyệt, mức ${PRIO_TEXT[i.priority]}`);
    closeModal(); render(); openInc(i.code);
    showToast(`Đã duyệt ${i.code} (${PRIO_TEXT[i.priority]}), người báo đã nhận thông báo`);
  });
}
function rejectInc(i) {
  reasonDialog({
    title: 'Từ chối sự cố', sub: `${i.code} · ${esc(i.target)}`, label: 'Lý do từ chối', placeholder: 'VD Phiếu trùng SC1038, không phải sự cố.', confirmText: 'Từ chối',
    body: alertBox('gray', '', 'Người báo sẽ nhận thông báo kèm lý do. Thiết bị gỡ trạng thái “Đang hỏng” nếu không còn phiếu nào khác.'),
    onConfirm: reason => {
      i.status = 'rejected'; i.reason = reason; addLog(i, `Phòng CSVC từ chối: ${reason}`);
      render(); openInc(i.code);
      showToast(`Đã từ chối ${i.code}, người báo nhận thông báo kèm lý do`);
    }
  });
}
function openPriority(i) {
  const m = setModal(`
    ${mHead('Đổi mức ưu tiên', `${i.code} · ${esc(i.target)}`)}
    <div class="m-body">${prioCards(i.priority, false)}</div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="pOk">Lưu</button>')}`);
  $('#pOk', m).addEventListener('click', () => {
    const p = $('input[name=prio]:checked', m).value;
    if (p !== i.priority) { addLog(i, `Đổi mức ưu tiên: ${PRIO_TEXT[i.priority]} → ${PRIO_TEXT[p]}`); i.priority = p; }
    closeModal(); render(); openInc(i.code);
    showToast(`${i.code} chuyển sang mức ${PRIO_TEXT[p]}`);
  });
}

/* ---------- Phân công kỹ thuật viên (PB-51) ---------- */
function openAssign(i) {
  const m = setModal(`
    ${mHead(i.tech ? 'Đổi kỹ thuật viên' : 'Phân công kỹ thuật viên', `${i.code} · ${esc(i.target)} · ${CAMPUS_NAME[i.campus]}`)}
    <div class="m-body">
      <div class="check-list" id="techList">
        ${TECHS.map(t => `<label class="tech-opt"><input type="radio" name="tech" value="${t.name}" ${i.tech === t.name ? 'checked' : ''}> <b>${t.name}</b><small>${CAMPUS_NAME[t.campus]}<br>${t.area}</small></label>`).join('')}
      </div>
      <p class="err" id="techErr" hidden></p>
      <div class="f-group" style="margin-top:14px"><label for="techNote">Ghi chú cho kỹ thuật viên (không bắt buộc)</label><textarea id="techNote" placeholder="VD Mang theo bóng đèn dự phòng."></textarea></div>
      ${i.tech ? alertBox('info', '', `Kỹ thuật viên hiện tại là ${esc(i.tech)}; người này sẽ nhận thông báo khi bị thay.`) : ''}
    </div>
    ${mFoot(`<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="tOk">${i.tech ? 'Đổi người xử lý' : 'Phân công'}</button>`)}`);
  $('#tOk', m).addEventListener('click', () => {
    const sel = $('input[name=tech]:checked', m), err = $('#techErr', m);
    if (!sel) { err.hidden = false; err.textContent = 'Chọn một kỹ thuật viên.'; return; }
    const t = TECHS.find(x => x.name === sel.value);
    if (t.campus !== i.campus) { err.hidden = false; err.textContent = `${t.name} phụ trách ${CAMPUS_NAME[t.campus]} (${t.area}), không phải ${CAMPUS_NAME[i.campus]}. Chọn kỹ thuật viên đúng cơ sở.`; return; }
    if (t.name === i.tech) { closeModal(); return; }
    const old = i.tech; i.tech = t.name;
    addLog(i, old ? `Đổi kỹ thuật viên: ${old} → ${t.name}` : `Phân công ${t.name}`);
    closeModal(); render(); openInc(i.code);
    showToast(old ? `Đã chuyển phiếu cho ${t.name}; ${old} nhận thông báo` : `Đã gửi phiếu ${i.code} cho ${t.name}; người báo nhận thông báo Đã tiếp nhận`);
  });
}

/* ---------- Kỹ thuật cập nhật (mô phỏng, PB-52) ---------- */
function simulate(i, what) {
  if (what === 'start') { i.status = 'repairing'; i.times.repairing = stamp(); addLog(i, 'Kỹ thuật bắt đầu sửa'); showToast(`${i.tech} bắt đầu sửa ${i.code}; Phòng CSVC và người báo nhận thông báo`); }
  if (what === 'done') { i.status = 'done'; i.result = 'repair'; i.times.done = stamp(); i.proof = 'nghiem-thu-' + i.code.toLowerCase() + '.jpg'; addLog(i, 'Kỹ thuật báo đã xử lý, kèm ảnh nghiệm thu'); showToast(`${i.code} đã xử lý, thiết bị gỡ “Đang hỏng”`); }
  if (what === 'cannot') { i.cannotFix = 'Linh kiện hỏng nặng, không sửa được tại chỗ. Đề nghị thay thế hoặc bảo hành.'; addLog(i, 'Kỹ thuật báo không khắc phục được'); showToast('Phòng CSVC nhận thông báo: kỹ thuật không khắc phục được'); }
  render(); openInc(i.code);
}

/* ---------- Ngưng sử dụng, thay thế / bảo hành (PB-53) ---------- */
function openReplace(i) {
  const spare = DEVICES.filter(d => d.status === 'active' && d.qty - d.lent > 0 && d.name !== i.target);
  const m = setModal(`
    ${mHead('Xử lý thay thế / bảo hành', `${i.code} · ${esc(i.target)}`)}
    <div class="m-body">
      ${alertBox('warn', 'Thiết bị sẽ chuyển “Ngưng sử dụng”', 'Không cho đặt, mượn và không tính vào số lượng khả dụng.', 'alert')}
      <div class="radio-grid">
        <label class="radio-card"><input type="radio" name="plan" value="replace" checked><div>Thay thế bằng thiết bị khác<small>Lấy từ kho cùng hoặc khác cơ sở</small></div></label>
        <label class="radio-card"><input type="radio" name="plan" value="warranty"><div>Gửi bảo hành<small>Ghi ngày gửi và ghi chú</small></div></label>
      </div>
      <div id="planBody" style="margin-top:16px"></div>
      <div class="f-group"><label for="planNote">Ghi chú</label><textarea id="planNote" placeholder="VD Đổi sang loa còn bảo hành tại kho Tòa H."></textarea></div>
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="plOk">Xác nhận</button>')}`);
  const plan = () => $('input[name=plan]:checked', m).value;
  const draw = () => {
    $('#planBody', m).innerHTML = plan() === 'replace'
      ? `<div class="f-group"><label for="spare">Thiết bị thay thế *</label><select id="spare"><option value="">Chọn thiết bị</option>${spare.map(d => `<option value="${d.code}">${esc(d.name)} · ${esc(d.place)} · ${CAMPUS_NAME[d.campus]}</option>`).join('')}</select><p class="err" id="spareErr" hidden>Chọn thiết bị thay thế.</p></div>`
      : `<div class="f-group"><label for="sendDate">Ngày gửi bảo hành *</label><input type="date" id="sendDate" value="${TODAY}"><p class="err" id="dateErr" hidden>Chọn ngày gửi.</p></div>`;
  };
  draw(); $$('input[name=plan]', m).forEach(r => r.addEventListener('change', draw));
  $('#plOk', m).addEventListener('click', () => {
    const p = plan(), note = $('#planNote', m).value.trim();
    let text;
    if (p === 'replace') {
      const code = $('#spare', m).value;
      if (!code) { $('#spareErr', m).hidden = false; $('#spare', m).classList.add('invalid'); return; }
      const sp = DEVICES.find(d => d.code === code);
      text = `Thay thế bằng ${sp.name} (${sp.code}, ${sp.place}) cho ${i.place}`;
    } else {
      const d = $('#sendDate', m).value;
      if (!d) { $('#dateErr', m).hidden = false; return; }
      text = `Gửi bảo hành ngày ${fmtDate(d)}`;
    }
    const dev = DEVICES.find(d => fold(d.name) === fold(i.target));
    if (dev) dev.status = 'stopped';
    i.status = 'done'; i.result = p; i.times.done = stamp(); i.cannotFix = null;
    addLog(i, `${text}${note ? '. ' + note : ''}; thiết bị cũ chuyển Ngưng sử dụng`);
    closeModal(); render(); openInc(i.code);
    showToast(`${i.code} đã xử lý: ${p === 'replace' ? 'thay thế thiết bị' : 'gửi bảo hành'}, người báo nhận thông báo`);
  });
}

/* ---------- Mở theo #hash ---------- */
function applyHash() {
  const h = hashKey();
  if (!h) return;
  if (getInc(h)) { f.tab = ''; f.campus = ''; f.overdue = false; render(); openInc(h); return; }
  if (h === 'overdue') { f.overdue = true; render(); return; }
  if (TABS.some(t => t[0] === h)) { f.tab = h; render(); }
}
window.addEventListener('hashchange', applyHash);
render(); applyHash();
