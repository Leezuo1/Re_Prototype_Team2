(() => {
  const rooms = [
    { id: 'A.301', type: 'classroom', label: 'Phòng học', capacity: 40, building: 'Cơ sở 1 · Tòa A', gear: ['Máy chiếu', 'Máy lạnh', 'Bảng trắng'], approver: 'Phòng Đào tạo' },
    { id: 'B.205', type: 'classroom', label: 'Phòng học', capacity: 60, building: 'Cơ sở 1 · Tòa B', gear: ['Máy chiếu', 'Máy lạnh', 'Loa'], approver: 'Phòng Đào tạo' },
    { id: 'C.701', type: 'meeting', label: 'Phòng họp', capacity: 20, building: 'Cơ sở 2 · Tòa C', gear: ['Màn hình trình chiếu', 'Bàn họp'], approver: 'Quản lý CSVC' },
    { id: 'H.201', type: 'hall', label: 'Hội trường', capacity: 180, building: 'Cơ sở 1 · Tòa H', gear: ['Âm thanh', 'Máy chiếu', 'Sân khấu'], approver: 'Trung tâm Hỗ trợ Sinh viên' },
    { id: 'H.001', type: 'hall', label: 'Hội trường', capacity: 300, building: 'Cơ sở 3 · Tòa H', gear: ['Âm thanh', 'Màn hình LED', 'Sân khấu'], approver: 'Trung tâm Hỗ trợ Sinh viên' },
    { id: 'A.402', type: 'classroom', label: 'Phòng học', capacity: 35, building: 'Cơ sở 2 · Tòa A', gear: ['Máy chiếu', 'Máy lạnh'], approver: 'Phòng Đào tạo' }
  ];
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const types = {classroom:'Phòng học',hall:'Hội trường',meeting:'Phòng họp'};
  const labels = {pending:'Chờ duyệt',approved:'Đã duyệt',rejected:'Từ chối',cancelled:'Đã hủy',returned:'Đã trả'};
  const iso = date => [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  const mins = time => Number(time.slice(0,2))*60+Number(time.slice(3));
  const clock = value => String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');
  const stamp = (date,time) => new Date(date+'T'+time+':00').getTime();
  const fmt = date => date.split('-').reverse().join('/');
  const roomById = id => rooms.find(room => room.id === id);
  const key = 'vlu.teacher.room-workflow.v2';
  const now = new Date(), today = iso(now);
  const tomorrowDate = new Date(now); tomorrowDate.setDate(now.getDate()+1);
  const tomorrow = iso(tomorrowDate);
  const minute = now.getHours()*60+now.getMinutes();
  const activeEnd = Math.min(minute+30,1380), nextStart = Math.min(activeEnd+30,1410);
  const base = (id,room,date,start,end,purpose,status) => ({
    id,room,date,start,end,purpose,status,proposal:'To-trinh.pdf',
    approver:roomById(room).approver,decision:roomById(room).type==='hall'?'Quyet-dinh.pdf':'',
    history:[{at:new Date().toLocaleString('vi-VN'),text:status==='approved'?'Đã duyệt; khóa lịch và thông báo lịch mở cửa cho Bảo vệ.':'Đã gửi trực tiếp đến '+roomById(room).approver+'.'}]
  });
  let state;
  try { state=JSON.parse(localStorage.getItem(key)); } catch {}
  if (!state || state.version!==2 || !Array.isArray(state.requests)) {
    state={version:2,requests:[
      base('GV-018','A.301',tomorrow,'07:30','09:30','Dạy bù môn Phân tích thiết kế','pending'),
      base('GV-015','B.205',tomorrow,'13:00','15:00','Sinh hoạt chuyên đề bộ môn','approved'),
      base('GV-011','C.701',today,clock(Math.max(0,minute-30)),clock(activeEnd),'Họp nhóm nghiên cứu','approved')
    ],schedule:[
      {room:'C.701',date:today,start:clock(nextStart),end:'23:59',source:'Lịch phòng kế tiếp'},
      {room:'A.301',date:tomorrow,start:'09:30',end:'11:30',source:'Thời khóa biểu'},
      {room:'B.205',date:tomorrow,start:'15:30',end:'17:30',source:'Thời khóa biểu'}
    ]};
  }
  let filter='all', booking=null, toastTimer, returnFocus;
  const save = () => { try { localStorage.setItem(key,JSON.stringify(state)); } catch { toast('Không lưu được trên trình duyệt.'); } };
  const log = (r,text) => r.history.push({at:new Date().toLocaleString('vi-VN'),text});
  function toast(text) {
    $('app-toast').textContent=text; $('app-toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('app-toast').classList.remove('show'),4500);
  }
  const occupied = ignore => state.schedule.concat(state.requests.filter(r=>['approved','pending'].includes(r.status)&&r.id!==ignore));
  function conflict(room,date,start,end,ignore) {
    return occupied(ignore).find(r=>r.room===room&&r.date===date&&mins(start)<mins(r.end)&&mins(end)>mins(r.start));
  }
  function validTime(date,start,end) {
    if(!date||!start||!end||start>=end) return 'Giờ kết thúc phải sau giờ bắt đầu.';
    if(stamp(date,start)<Date.now()) return 'Chọn thời gian bắt đầu trong tương lai.';
    return '';
  }
  function canChange(r) { return ['pending','approved'].includes(r.status)&&stamp(r.date,r.start)>Date.now(); }
  function canExtend(r) { return r.status==='approved'&&stamp(r.date,r.start)<=Date.now()&&Date.now()<stamp(r.date,r.end); }
  function searchValues() { return {date:$('teacherDate').value,start:$('teacherStart').value,end:$('teacherEnd').value}; }
  function renderRooms() {
    const q=searchValues(),error=validTime(q.date,q.start,q.end);
    $('teacherSearchSummary').textContent=error||fmt(q.date)+' · '+q.start+' – '+q.end;
    $('teacherSearchSummary').classList.toggle('teacher-error',!!error);
    const list=error?[]:rooms.filter(r=>($('teacherRoomType').value==='all'||r.type===$('teacherRoomType').value)&&r.capacity>=Number($('teacherCapacity').value)&&!conflict(r.id,q.date,q.start,q.end,booking?.editId));
    $('teacherRoomCount').textContent=list.length+' phòng';
    $('teacherRoomGrid').innerHTML=list.map(r=>'<article class="teacher-room-card"><div class="teacher-room-top"><div><div class="teacher-room-name">'+esc(r.id)+'</div><div class="teacher-room-kind">'+types[r.type]+' · '+esc(r.building)+'</div></div><span class="teacher-available">Còn trống</span></div><div class="teacher-room-meta"><span>'+r.capacity+' chỗ</span></div><div class="teacher-room-gear">'+r.gear.map(esc).join(' · ')+'</div><div class="teacher-room-footer"><span class="teacher-manager">Đơn vị duyệt<b>'+esc(r.approver)+'</b></span><button class="teacher-button teacher-button-primary" data-book-room="'+r.id+'">Đăng ký phòng</button></div></article>').join('')||'<div class="teacher-empty">Không có phòng phù hợp với ngày, giờ và bộ lọc đã chọn.</div>';
  }
  $('teacherShowAll').addEventListener('click', () => {
    filter = 'all';
    renderRequests();
    document.querySelector('#teacherRequestTabs [data-filter="all"]').focus();
  });
  function renderRequests() {
    $('teacherShowAll').hidden = filter === 'all';
    document.querySelectorAll('#teacherRequestTabs button').forEach(b=>{
      b.classList.toggle('selected',b.dataset.filter===filter);
      b.querySelector('span').textContent=state.requests.filter(r=>b.dataset.filter==='all'||r.status===b.dataset.filter).length;
    });
    $('teacherRequestList').innerHTML=state.requests.filter(r=>filter==='all'||r.status===filter).map(r=>{
      const active=canExtend(r),soon=active&&stamp(r.date,r.end)-Date.now()<=30*60000;
      return '<article class="teacher-request-row"><div class="teacher-request-main"><b>'+esc(r.purpose)+'</b><small>'+esc(r.id)+'</small></div><div class="teacher-request-cell"><strong>'+esc(r.room)+'</strong>'+fmt(r.date)+'</div><div class="teacher-request-cell"><strong>'+r.start+' – '+r.end+'</strong>'+(soon?'Sắp hết giờ':active?'Đang sử dụng':'')+'</div><div class="teacher-request-cell"><span class="teacher-status '+r.status+'">'+labels[r.status]+'</span><small class="teacher-sub">'+esc(r.approver)+'</small></div><div class="teacher-row-actions"><button data-detail="'+r.id+'">Chi tiết</button>'+(canChange(r)?'<button data-change="'+r.id+'">Đổi lịch</button><button data-cancel="'+r.id+'">Hủy lịch</button>':'')+(active?'<button data-extend="'+r.id+'">Gia hạn</button>':'')+'</div></article>';
    }).join('')||'<div class="teacher-no-requests">Chưa có lịch trong mục này.</div>';
  }
  function openLayer(id) { returnFocus=document.activeElement; $(id).hidden=false; document.body.style.overflow='hidden'; $(id).querySelector('button,input')?.focus(); }
  function closeLayer(id) { $(id).hidden=true; document.body.style.overflow=''; returnFocus?.focus(); }
  function openBooking(roomId,editId=null) {
    const room=roomById(roomId),r=state.requests.find(r=>r.id===editId);
    booking={room:roomId,...(r?{date:r.date,start:r.start,end:r.end}:searchValues()),editId};
    $('teacherBookingForm').reset();
    $('teacherFormRoom').innerHTML=rooms.map(item=>'<option value="'+item.id+'">'+item.id+' · '+types[item.type]+'</option>').join('');
    $('teacherFormRoom').value=room.id;
    $('teacherModalTitle').textContent=r?'Đổi lịch mượn phòng':'Đăng ký mượn phòng';
    $('teacherModalRoom').textContent=room.id+' · '+room.building;
    $('teacherFormType').value=types[room.type];
    $('teacherFormDate').value=booking.date;
    $('teacherFormStart').value=booking.start;
    $('teacherFormEnd').value=booking.end;
    $('teacherPurpose').value=r?.purpose||'';
    $('teacherProposal').required=!r?.proposal;
    $('teacherDecisionWrap').hidden=room.type!=='hall';
    $('teacherDecision').required=room.type==='hall'&&!r?.decision;
    $('teacherExistingFiles').textContent=r?'Tệp đang dùng: '+r.proposal+(r.decision?' · '+r.decision:''):'';
    $('teacherRoutingMessage').textContent='Đơn vị tiếp nhận: '+room.approver;
    $('teacherFormError').textContent='';
    openLayer('teacherModal');
  }
  function fileError(input) {
    const f=input.files[0];
    if(!f) return input.required?'Vui lòng đính kèm tệp bắt buộc.':'';
    return !/\.(pdf|doc|docx)$/i.test(f.name)?'Chỉ nhận PDF, DOC, DOCX.':f.size>10*1024*1024?'Tệp không được vượt quá 10 MB.':'';
  }
  function detailBody(r) {
    const room=roomById(r.room);
    return '<dl class="teacher-detail-grid"><dt>Phòng</dt><dd>'+esc(r.room)+' · '+types[room.type]+'</dd><dt>Thời gian</dt><dd>'+fmt(r.date)+' · '+r.start+' – '+r.end+'</dd><dt>Mục đích</dt><dd>'+esc(r.purpose)+'</dd><dt>Trạng thái</dt><dd>'+labels[r.status]+'</dd><dt>Đơn vị duyệt</dt><dd>'+esc(r.approver)+'</dd><dt>Tờ trình</dt><dd>'+esc(r.proposal||'—')+'</dd>'+(r.decision?'<dt>Quyết định</dt><dd>'+esc(r.decision)+'</dd>':'')+'</dl><ol class="teacher-history">'+r.history.map(h=>'<li><small>'+esc(h.at)+'</small><p>'+esc(h.text)+'</p></li>').join('')+'</ol>';
  }
  function actionModal(r,mode) {
    $('teacherActionTitle').textContent=mode==='extend'?'Gia hạn sử dụng phòng':mode==='cancel'?'Hủy lịch mượn':'Chi tiết '+r.id;
    let body=detailBody(r);
    if(mode==='extend') {
      const next=occupied(r.id).filter(x=>x.room===r.room&&x.date===r.date&&x.start>=r.end).sort((a,b)=>a.start.localeCompare(b.start))[0];
      body='<p class="teacher-action-summary">'+esc(r.room)+' · '+fmt(r.date)+' · Kết thúc hiện tại: '+r.end+'</p><form id="teacherExtensionForm"><label class="teacher-field"><span>Giờ kết thúc mới *</span><input type="time" id="teacherExtensionEnd" required value="'+clock(Math.min(mins(r.end)+15,1439))+'"></label><label class="teacher-field"><span>Lý do gia hạn *</span><textarea id="teacherExtensionReason" required rows="3"></textarea></label>'+(next?'<p>Lịch kế tiếp bắt đầu lúc <b>'+next.start+'</b>.</p>':'')+'<p id="teacherExtensionError" class="teacher-form-error" role="alert"></p><button class="teacher-button teacher-button-primary">Gửi yêu cầu gia hạn</button></form>';
    }
    if(mode==='cancel') body+='<form id="teacherCancellationForm"><label class="teacher-field"><span>Lý do hủy *</span><textarea id="teacherCancellationReason" required rows="2"></textarea></label><p id="teacherCancellationError" class="teacher-form-error" role="alert"></p><button class="teacher-button teacher-button-primary">Xác nhận hủy lịch</button></form>';
    $('teacherActionBody').innerHTML=body;
    openLayer('teacherActionModal');
    $('teacherExtensionForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      const end=$('teacherExtensionEnd').value,reason=$('teacherExtensionReason').value.trim();
      let error=!canExtend(r)?'Chỉ gia hạn trong thời gian sử dụng của lịch đã được duyệt.':!reason?'Nhập lý do gia hạn.':!end||end<=r.end?'Giờ mới phải sau giờ kết thúc hiện tại.':'';
      const hit=!error&&conflict(r.room,r.date,r.end,end,r.id);
      if(hit) error='Không thể gia hạn: phòng có lịch '+hit.start+' – '+hit.end+'. Giờ kết thúc vẫn là '+r.end+'.';
      if(error) {
        $('teacherExtensionError').textContent=error;
        if(hit) {log(r,'Gia hạn đến '+end+' bị từ chối do trùng lịch. Lý do yêu cầu: '+reason);save();}
        return;
      }
      const previous=r.end;r.end=end;
      log(r,'Tự động gia hạn từ '+previous+' đến '+end+'. Lý do: '+reason+'. Đã cập nhật lịch và thông báo Giảng viên, Bảo vệ.');
      save();renderRequests();renderRooms();closeLayer('teacherActionModal');toast('Đã gia hạn đến '+end+'. Đã cập nhật thông báo cho Bảo vệ.');
    });
    $('teacherCancellationForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      const reason=$('teacherCancellationReason').value.trim();
      if(!canChange(r)||!reason) { $('teacherCancellationError').textContent='Cần lý do hủy và lịch chưa bắt đầu.';return; }
      r.status='cancelled'; log(r,'Đã hủy lịch, giải phóng phòng và thông báo Bảo vệ. Lý do: '+reason);
      save();renderRequests();renderRooms();closeLayer('teacherActionModal');toast('Đã hủy lịch '+r.id+'.');
    });
  }
  $('teacherDate').value=tomorrow;
  $('teacherDate').min=today;
  $('teacherFormDate').min=today;
  $('teacherSearchForm').addEventListener('submit',e=>{e.preventDefault();renderRooms();});
  $('teacherReset').addEventListener('click',()=>{$('teacherDate').value=tomorrow;$('teacherStart').value='09:00';$('teacherEnd').value='11:00';$('teacherRoomType').value='all';$('teacherCapacity').value='0';renderRooms();});
  $('teacherRoomGrid').addEventListener('click',e=>{const b=e.target.closest('[data-book-room]');if(b)openBooking(b.dataset.bookRoom);});
  $('teacherRequestTabs').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;renderRequests();}});
  $('teacherRequestList').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    const mode=['detail','change','cancel','extend'].find(m=>b.dataset[m]);
    const r=mode&&state.requests.find(r=>r.id===b.dataset[mode]);if(!r)return;
    if(mode==='change')openBooking(r.room,r.id);else actionModal(r,mode);
  });
  $('teacherBookingForm').addEventListener('submit',e=>{
    e.preventDefault(); if(!booking)return;
    const room=roomById(booking.room),date=$('teacherFormDate').value,start=$('teacherFormStart').value,end=$('teacherFormEnd').value,purpose=$('teacherPurpose').value.trim();
    const old=state.requests.find(r=>r.id===booking.editId);
    let error=validTime(date,start,end)||(!purpose?'Nhập mục đích sử dụng.':'')||fileError($('teacherProposal'))||(room.type==='hall'?fileError($('teacherDecision')):'');
    if(old&&!canChange(old))error='Lịch này không còn được phép đổi.';
    const hit=!error&&conflict(room.id,date,start,end,old?.id);
    if(hit)error='Phòng có lịch '+hit.start+' – '+hit.end+'. Chọn khung giờ khác.';
    if(error){$('teacherFormError').textContent=error;return;}
    const r=old||base('GV-'+Date.now(),room.id,date,start,end,purpose,'pending');
    if(old)log(r,'Đã gửi đổi lịch từ '+fmt(r.date)+' '+r.start+' – '+r.end+'. Giải phóng lịch cũ và thông báo Bảo vệ; lịch mới chờ '+room.approver+' duyệt.');
    Object.assign(r,{room:room.id,approver:room.approver,date,start,end,purpose,status:'pending',proposal:$('teacherProposal').files[0]?.name||r.proposal,decision:room.type==='hall'?($('teacherDecision').files[0]?.name||r.decision):''});
    if(!old)state.requests.unshift(r);
    save();filter='all';renderRequests();closeLayer('teacherModal');booking=null;renderRooms();
    toast('Đã gửi trực tiếp đến '+room.approver+'.');
  });
  $('teacherModalClose').onclick=$('teacherCancel').onclick=()=>{closeLayer('teacherModal');booking=null;};
  $('teacherFormRoom').addEventListener('change',()=>{
    const room=roomById($('teacherFormRoom').value),old=state.requests.find(r=>r.id===booking.editId);
    booking.room=room.id;
    $('teacherModalRoom').textContent=room.id+' · '+room.building;
    $('teacherFormType').value=types[room.type];
    $('teacherDecisionWrap').hidden=room.type!=='hall';
    $('teacherDecision').required=room.type==='hall'&&!old?.decision;
    $('teacherRoutingMessage').textContent='Đơn vị tiếp nhận: '+room.approver;
  });
  $('teacherActionClose').onclick=()=>closeLayer('teacherActionModal');
  for(const id of ['teacherModal','teacherActionModal']) $(id).addEventListener('click',e=>{if(e.target===$(id)){closeLayer(id);if(id==='teacherModal')booking=null;}});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')for(const id of ['teacherModal','teacherActionModal'])if(!$(id).hidden){closeLayer(id);if(id==='teacherModal')booking=null;}
    if(e.key==='Tab') {
      const layer=['teacherModal','teacherActionModal'].map($).find(el=>!el.hidden);
      if(!layer)return;
      const controls=[...layer.querySelectorAll('button,input,textarea,select,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  document.addEventListener('DOMContentLoaded',()=>{
    const footer=document.querySelector('#app-footer .footer-inner span:last-child');
    if(footer)footer.textContent='Bảo vệ mở cửa và xác nhận trả phòng theo lịch.';
  });
  renderRooms();renderRequests();
  setInterval(renderRequests,60000);
})();
