(() => {
  // Giữ nguyên mã dữ liệu để những lịch đã lưu vẫn khớp với phòng.
  function formatRoomCodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const formatted = node.nodeValue.replace(/\b([A-Z])\.(\d)(\d{2})\b/g, '$1.0$2.$3');
      if (formatted !== node.nodeValue) node.nodeValue = formatted;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || /^(SCRIPT|STYLE)$/.test(node.tagName)) return;
    node.childNodes.forEach(formatRoomCodes);
  }

  document.addEventListener('DOMContentLoaded', () => {
    formatRoomCodes(document.body);
    new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') formatRoomCodes(record.target);
        else record.addedNodes.forEach(formatRoomCodes);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  });
})();
