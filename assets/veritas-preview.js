/* Visual project teaser only. No data, requests, tracking or scientific computation. */
(() => {
  'use strict';
  const preview = document.getElementById('veritas-preview');
  if (!preview) return;
  let trigger = null;
  document.querySelectorAll('[data-veritas-preview]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      preview.showModal();
    });
  });
  preview.querySelector('[data-close-preview]').addEventListener('click', () => preview.close());
  preview.addEventListener('close', () => { if (trigger) trigger.focus(); });
})();
