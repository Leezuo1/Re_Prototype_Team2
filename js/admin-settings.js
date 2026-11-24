/* Admin · Cấu hình quy định mượn (dữ liệu mẫu) */

const FIELDS = [
  { id: 'maxDevices', group: 'grpDevice', label: 'Số thiết bị tối đa mỗi người mượn cùng lúc', unit: 'thiết bị', saved: 3, help: 'Áp dụng cho từng sinh viên, giảng viên tại một thời điểm.' },
  { id: 'loanHours', group: 'grpDevice', label: 'Thời hạn mượn thiết bị', unit: 'giờ', saved: 24, help: 'Sau thời hạn này phiếu được tính là quá hạn trả.' },
  { id: 'remindMin', group: 'grpRoom', label: 'Nhắc trước giờ kết thúc', unit: 'phút', saved: 10, help: 'Hệ thống nhắc người đang sử dụng phòng trước khi hết giờ.' },
  { id: 'extendMin', group: 'grpRoom', label: 'Thời gian gia hạn tối đa mỗi lần', unit: 'phút', saved: 30, help: 'Chỉ gia hạn được khi phòng không có lịch kế tiếp.' },
  { id: 'waitHours', group: 'grpRoom', label: 'Thời gian chờ duyệt tối đa', unit: 'giờ', saved: 24, help: 'Quá thời gian này, yêu cầu được chuyển thêm cho người duyệt dự phòng.' }
];
FIELDS.forEach(f => f.cur = String(f.saved));

function draw() {
  ['grpDevice', 'grpRoom'].forEach(g => {
    $('#' + g).innerHTML = FIELDS.filter(f => f.group === g).map(f => `
      <div class="f-field" id="fg-${f.id}">
        <label for="${f.id}">${f.label}</label>
        <div class="unit-input"><input class="input" id="${f.id}" inputmode="numeric" value="${f.cur}" aria-describedby="h-${f.id} e-${f.id}"><span>${f.unit}</span></div>
        <p class="now-val">Đang áp dụng: <b>${f.saved} ${f.unit}</b></p>
        <p class="help" id="h-${f.id}">${f.help}</p>
        <p class="error" id="e-${f.id}" role="alert">Nhập số nguyên lớn hơn 0.</p>
      </div>`).join('');
  });
}

const valid = v => /^\d+$/.test(v.trim()) && Number(v) > 0;
const dirtyList = () => FIELDS.filter(f => f.cur.trim() !== String(f.saved));

function sync() {
  const d = dirtyList().length > 0;
  $('#savebar').hidden = !d;
  $('#saveText').textContent = `${dirtyList().length} thay đổi chưa lưu`;
}

['grpDevice', 'grpRoom'].forEach(g => {
  $('#' + g).addEventListener('input', e => {
    const f = FIELDS.find(x => x.id === e.target.id); if (!f) return;
    f.cur = e.target.value;
    $('#fg-' + f.id).classList.toggle('has-error', f.cur.trim() !== '' && !valid(f.cur));
    sync();
  });
});
draw();

$('#btnReset').addEventListener('click', () => { FIELDS.forEach(f => f.cur = String(f.saved)); draw(); sync(); });

$('#btnSave').addEventListener('click', () => {
  let bad = null;
  FIELDS.forEach(f => {
    const ok = valid(f.cur);
    $('#fg-' + f.id).classList.toggle('has-error', !ok);
    if (!ok && !bad) bad = f;
  });
  if (bad) { $('#' + bad.id).focus(); return; }
  const list = dirtyList();
  confirmDialog({
    title: 'Áp dụng quy định mới?', confirmText: 'Áp dụng',
    body: `<div>${list.map(f => `<div class="diff"><span class="lbl">${f.label}</span><span class="from">${f.saved} ${f.unit}</span><span aria-hidden="true">→</span><span class="to">${Number(f.cur)} ${f.unit}</span></div>`).join('')}</div>
           <div style="margin-top:14px">${alertBox('info', '', 'Quy định mới chỉ áp dụng cho phiếu mượn và lịch tạo sau thời điểm lưu. Phiếu đã tạo giữ quy định cũ.')}</div>`,
    onConfirm: () => {
      list.forEach(f => { f.saved = Number(f.cur); f.cur = String(f.saved); });
      draw(); sync();
      $('#cfgBanner').innerHTML = notice('ok', '<b>Đã lưu cấu hình.</b> Thay đổi được ghi vào nhật ký hoạt động.', 'check');
      showToast('Đã lưu cấu hình quy định');
    }
  });
});
