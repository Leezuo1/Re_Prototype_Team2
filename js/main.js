/* ===== Icon dùng chung (SVG inline) ===== */
const ICONS = {
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  board: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
  hall: '<path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6"/>'
};

function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24">${ICONS[name]}</svg>`;
}

/* =====================================================
   HEADER + SIDEBAR: nạp từ thư mục components/
   Nạp đồng bộ ngay khi script chạy để header/sidebar có sẵn
   trước khi code của từng trang (ua1.js, ua2.js, ua3.js...) khởi tạo.
   Lưu ý: phải mở web bằng Live Server (không bấm đúp file .html)
   ===================================================== */
function loadPartial(file) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../components/' + file, false);   // false = đồng bộ
    xhr.send();
    const ok = xhr.status === 200 || (xhr.status === 0 && xhr.responseText);
    return ok ? xhr.responseText : null;
  } catch (err) {
    return null;
  }
}

function showLayoutError() {
  const box = document.createElement('div');
  box.className = 'layout-error';
  box.innerHTML = 'Không tải được <b>components/header.html</b> và <b>sidebar.html</b>. ' +
    'Hãy mở web bằng <b>Live Server</b> (VS Code) hoặc chạy <code>python -m http.server</code> trong thư mục project, ' +
    'đừng bấm đúp mở file .html trực tiếp.';
  document.body.prepend(box);
}

function setGroupOpen(group, open) {
  group.classList.toggle('open', open);
  group.querySelector('.sb-head').setAttribute('aria-expanded', String(open));
}

function initSidebar(root) {
  const current = document.body.dataset.page;

  // Mục của trang hiện tại sáng lên
  const active = root.querySelector(`a[data-page="${current}"]`);
  if (active) {
    active.classList.add('active');
    active.setAttribute('aria-current', 'page');
  }

  // Thẻ lớn: bấm để mở / đóng. Thẻ nào chứa trang hiện tại thì tự mở sẵn
  root.querySelectorAll('.sb-group').forEach(group => {
    setGroupOpen(group, !!group.querySelector('a.active'));
    group.querySelector('.sb-head').addEventListener('click', () => {
      setGroupOpen(group, !group.classList.contains('open'));
    });
  });
}

function mountLayout() {
  const headerHolder = document.getElementById('app-header');
  const sideHolder = document.getElementById('app-sidebar');
  const headerHtml = loadPartial('header.html');
  const sideHtml = loadPartial('sidebar.html');

  if (headerHtml === null || sideHtml === null) { showLayoutError(); return; }
  if (headerHolder) headerHolder.innerHTML = headerHtml;
  if (sideHolder) { sideHolder.innerHTML = sideHtml; initSidebar(sideHolder); }
}

mountLayout();

/* ===== Footer ===== */
function renderFooter() {
  const holder = document.getElementById('app-footer');
  if (!holder) return;
  holder.innerHTML = `
    <footer class="app-footer">
      <div class="footer-inner">
        <span>Đại học Văn Lang · Hệ thống Quản lý phòng học & thiết bị</span>
        <span>Nhận và trả phòng trực tiếp tại Phòng CSVC</span>
      </div>
    </footer>
  `;
}

/* ===== Toast thông báo nhỏ ===== */
let toastTimer;
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ===== Mô phỏng gửi lên máy chủ: khóa nút + hiện loading rồi mới chạy work() =====
   Chống bấm nhiều lần. Nếu work() vẽ lại giao diện (nút bị thay mới) thì không cần trả nút về. */
function submitWithLoading(btn, work, delay = 700) {
  if (!btn || btn.disabled) return;
  const label = btn.innerHTML;
  btn.disabled = true;
  btn.classList.add('loading');
  btn.innerHTML = '<span class="spinner"></span> Đang gửi...';
  setTimeout(() => {
    work();
    if (document.body.contains(btn)) {          // nút còn đó -> trả về trạng thái ban đầu
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.innerHTML = label;
    }
  }, delay);
}

document.addEventListener('DOMContentLoaded', renderFooter);