/* js/main.js — Tiện ích nền & nạp layout dùng chung (Phân hệ Đội ngũ Kỹ thuật - VLU) */

const TECH_ICONS = {
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zm4 4h3v3h-3zm-4 3h3"/>',
  checklist: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4 
  exportFile: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>'
};

function renderIcon(key, extraClass = '') {
  const path = TECH_ICONS[key] || '';
  return `<svg class="icon ${extraClass}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

/* ----- 1. Nạp khung layout dùng chung từ thư mục components/ ----- */
async function fetchComponent(fileName) {
  const res = await fetch(`../components/${fileName}`);
  return res.ok ? res.text() : null;
}

function warnLocalFileMode() {
  if (document.querySelector('.layout-warning')) return;
  const banner = document.createElement('div');
  banner.className = 'layout-warning';
  banner.innerHTML =
    'Không nạp được khung giao diện dùng chung. Vui lòng chạy qua <b>Live Server</b> hoặc <code>python -m http.server</code> thay vì mở trực tiếp file HTML.';
  document.body.prepend(banner);
}

function syncSidebarState(container) {
  const currentPage = document.body.dataset.page;
  if (currentPage) {
    const activeLink = container.querySelector(`a[data-page="${currentPage}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  container.querySelectorAll('.sb-group').forEach((group) => {
    const headBtn = group.querySelector('.sb-head');
    if (!headBtn) return;

    const hasActive = Boolean(group.querySelector('a.active'));
    group.classList.toggle('open', hasActive);
    headBtn.setAttribute('aria-expanded', String(hasActive));

    headBtn.addEventListener('click', () => {
      const nextState = !group.classList.contains('open');
      group.classList.toggle('open', nextState);
      headBtn.setAttribute('aria-expanded', String(nextState));
    });
  });
}

async function bootAppLayout() {
  const headerSlot = document.getElementById('app-header');
  const sidebarSlot = document.getElementById('app-sidebar');

  try {
    const [headerMarkup, sidebarMarkup] = await Promise.all([
      fetchComponent('header.html'),
      fetchComponent('sidebar.html')
    ]);

    if (!headerMarkup || !sidebarMarkup) {
      warnLocalFileMode();
      return false;
    }

    if (headerSlot) headerSlot.innerHTML = headerMarkup;
    if (sidebarSlot) {
      sidebarSlot.innerHTML = sidebarMarkup;
      syncSidebarState(sidebarSlot);
    }
    return true;
  } catch (err) {
    console.error('Lỗi tải layout:', err);
    warnLocalFileMode();
    return false;
  }
}

const appLayoutReady = bootAppLayout();

/* ----- 2. Footer dùng chung cho phân hệ Kỹ thuật ----- */
function mountFooter() {
  const footerSlot = document.getElementById('app-footer');
  if (!footerSlot) return;

  footerSlot.innerHTML = `
    <footer class="app-footer">
      <div class="footer-inner">
        <span>Đại học Văn Lang · Hệ thống Quản lý Phòng học &amp; Thiết bị</span>
        <span>Bộ phận Kỹ thuật &amp; Bảo trì – Phòng Quản trị CSVC</span>
      </div>
    </footer>
  `;
}

/* ----- 3. Thông báo nhanh (Toast) ----- */
let activeToastTimeout;
function notifyToast(message, variant = 'default') {
  let toastEl = document.getElementById('vlu-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'vlu-toast';
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }

  toastEl.dataset.variant = variant;
  toastEl.textContent = message;
  toastEl.classList.add('show');

  clearTimeout(activeToastTimeout);
  activeToastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

/* ----- 4. Khóa nút chống gửi trùng khi thao tác nghiệp vụ ----- */
function runWithLock(button, callback, delay = 600) {
  if (!button || button.disabled) return;

  const originalHtml = button.innerHTML;
  button.disabled = true;
  button.classList.add('is-loading');
  button.innerHTML = '<span class="spinner"></span> Đang xử lý...';

  setTimeout(() => {
    callback();
    if (document.body.contains(button)) {
      button.disabled = false;
      button.classList.remove('is-loading');
      button.innerHTML = originalHtml;
    }
  }, delay);
}

/* ----- 5. Điều hướng bàn phím (Tab / Esc) cho hộp thoại Modal ----- */
let releaseModalTrap = null;

function bindDialogFocus(dialogEl, onClose) {
  if (releaseModalTrap) releaseModalTrap();
  const lastFocused = document.activeElement;
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const getTabbables = () =>
    Array.from(dialogEl.querySelectorAll(selector)).filter(
      (node) => !node.hidden && node.offsetParent !== null
    );

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;

    const list = getTabbables();
    if (!list.length) {
      e.preventDefault();
      dialogEl.focus();
      return;
    }

    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  dialogEl.setAttribute('tabindex', '-1');
  dialogEl.addEventListener('keydown', onKeyDown);

  const firstTarget = dialogEl.querySelector('[data-autofocus]') || getTabbables()[0] || dialogEl;
  setTimeout(() => firstTarget.focus(), 0);

  releaseModalTrap = () => {
    dialogEl.removeEventListener('keydown', onKeyDown);
    releaseModalTrap = null;
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  };

  return releaseModalTrap;
}

document.addEventListener('DOMContentLoaded', mountFooter);
