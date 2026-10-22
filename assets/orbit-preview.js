/* Visual project teaser only. No data, requests, tracking or scientific computation. */
(() => {
  'use strict';
  const preview = document.getElementById('orbit-preview');
  if (!preview) return;
  let trigger = null;
  let closeTimer = null;
  const finishClose = () => { if (preview.open) preview.close(); };
  const closePreview = () => {
    if (!preview.open || preview.classList.contains('is-leaving')) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.classList.contains('motion-paused');
    if (reducedMotion) {
      finishClose();
      return;
    }
    preview.classList.add('is-leaving');
    // Also finish if a browser interrupts the exit animation.
    closeTimer = window.setTimeout(finishClose, 450);
  };
  document.querySelectorAll('[data-orbit-preview]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      preview.showModal();
    });
  });
  preview.querySelector('[data-close-preview]').addEventListener('click', closePreview);
  preview.addEventListener('cancel', event => {
    event.preventDefault();
    closePreview();
  });
  const finishAnimation = event => {
    if (event.target === preview && event.animationName === 'orbit-surface-out') finishClose();
  };
  preview.addEventListener('animationend', finishAnimation);
  preview.addEventListener('animationcancel', finishAnimation);
  preview.addEventListener('close', () => {
    window.clearTimeout(closeTimer);
    preview.classList.remove('is-leaving');
    if (trigger) trigger.focus();
  });
})();
