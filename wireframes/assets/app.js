// Minimal interactivity for the wireframes. No framework.
(function () {
  // ---- Drawer toggle (mobile nav) ----
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-drawer-toggle]');
    if (btn) {
      const drawer = document.querySelector('#mobile-drawer');
      if (drawer) drawer.classList.toggle('is-open');
      return;
    }
    const drawer = document.querySelector('#mobile-drawer.is-open');
    if (drawer && e.target === drawer) drawer.classList.remove('is-open');
  });

  // ---- Tabs ----
  document.addEventListener('click', function (e) {
    const tab = e.target.closest('[data-tab]');
    if (!tab) return;
    const list = tab.closest('.fui-tablist');
    if (!list) return;
    list.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    const panelId = tab.getAttribute('data-tab');
    const container = list.parentElement;
    container.querySelectorAll('[data-panel]').forEach(p => {
      p.style.display = p.getAttribute('data-panel') === panelId ? '' : 'none';
    });
  });

  // ---- Hub device toggle + tile preview ----
  const hub = document.querySelector('.hub');
  if (!hub) return;

  let currentDevice = 'desktop';
  const preview = hub.querySelector('.hub__preview');
  const iframe = hub.querySelector('.hub__preview__frame iframe');
  const label = hub.querySelector('.hub__preview__label');

  function setDevice(dev) {
    currentDevice = dev;
    if (!preview) return;
    preview.classList.remove('hub__preview--phone', 'hub__preview--tablet', 'hub__preview--desktop');
    preview.classList.add('hub__preview--' + dev);
    hub.querySelectorAll('[data-device]').forEach(b => {
      b.classList.toggle('fui-btn--primary', b.getAttribute('data-device') === dev);
      b.classList.toggle('fui-btn--secondary', b.getAttribute('data-device') !== dev);
    });
  }

  hub.addEventListener('click', function (e) {
    const devBtn = e.target.closest('[data-device]');
    if (devBtn) {
      setDevice(devBtn.getAttribute('data-device'));
      return;
    }
    const tile = e.target.closest('[data-preview]');
    if (tile) {
      e.preventDefault();
      const url = tile.getAttribute('data-preview');
      if (iframe) iframe.src = url;
      if (label) label.textContent = tile.getAttribute('data-title') + ' — ' + currentDevice;
      if (preview) preview.classList.add('is-open');
      preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  setDevice('desktop');
})();
