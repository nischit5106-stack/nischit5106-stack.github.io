/* Decorative project entrances only. No requests, storage or scientific changes. */
(() => {
  'use strict';
  const init = () => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const records = [];
    const motionPaused = () => preference.matches
      || document.documentElement.classList.contains('motion-paused');

    const hide = record => {
      window.clearTimeout(record.timer);
      record.timer = null;
      record.active = false;
      record.intro.hidden = true;
      record.intro.classList.remove('is-playing');
      // Keep secondary content still until the dialog closes, avoiding a second entrance.
    };
    const start = record => {
      hide(record);
      if (motionPaused()) return;
      if (record.dialog) record.dialog.classList.add('project-has-intro');
      record.intro.hidden = false;
      void record.intro.offsetWidth;
      record.intro.classList.add('is-playing');
      record.active = true;
      record.timer = window.setTimeout(() => hide(record), 4200);
    };
    const register = (intro, dialog = null) => {
      if (!intro) return null;
      const record = { intro, dialog, active: false, timer: null };
      records.push(record);
      intro.setAttribute('aria-hidden', 'true');
      intro.addEventListener('animationend', event => {
        if (event.target === intro && event.animationName === 'project-launch-exit') hide(record);
      });
      // Dismiss on the completed click so the same tap cannot activate content underneath.
      intro.addEventListener('pointerdown', event => {
        if (!record.active) return;
        event.preventDefault();
        event.stopPropagation();
      });
      intro.addEventListener('click', event => {
        if (!record.active) return;
        event.preventDefault();
        event.stopPropagation();
        hide(record);
      });
      if (dialog) {
        dialog.addEventListener('close', () => {
          hide(record);
          dialog.classList.remove('project-has-intro');
        });
      }
      return record;
    };

    document.querySelectorAll('[data-page-project-intro]').forEach(intro => start(register(intro)));
    ['veritas', 'orbit'].forEach(project => {
      const dialog = document.getElementById(project + '-preview');
      if (!dialog) return;
      const record = register(dialog.querySelector('[data-project-intro]'), dialog);
      if (!record) return;
      document.querySelectorAll('[data-' + project + '-preview]').forEach(button => {
        // Capture runs before the existing controller's showModal listener.
        button.addEventListener('click', () => start(record), { capture: true });
      });
    });
    if (!records.length) return;

    document.addEventListener('keydown', event => {
      if (event.key === 'Tab') records.forEach(hide);
      if (event.key === 'Escape') records.filter(record => !record.dialog).forEach(hide);
      // Preserve native Tab navigation and the dialog controllers' Escape handling.
    }, { capture: true });
    document.addEventListener('focusin', () => {
      records.filter(record => !record.dialog && record.active).forEach(hide);
    });
    const pauseActive = () => {
      if (motionPaused()) records.forEach(hide);
    };
    if (preference.addEventListener) preference.addEventListener('change', pauseActive);
    else preference.addListener(pauseActive);
    new MutationObserver(pauseActive).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
