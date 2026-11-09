(() => {
  const PAGES = ['home', 'yurty', 'o-nas', 'kontakty', 'voprosy', 'zapisatsya'];
  const body = document.body;
  const nav = document.getElementById('nav');
  const burger = document.querySelector('.burger');

  /* Мобильное меню */
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };

  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  /* Вкладки: показываем раздел, соответствующий хешу адреса */
  function showTab() {
    const hash = location.hash.slice(1);
    const tab = PAGES.includes(hash) ? hash : 'home';

    document.querySelectorAll('.page').forEach((section) => {
      section.hidden = section.id !== tab;
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      if (link.getAttribute('href') === `#${tab}`) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    body.dataset.page = tab;
    setMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  window.addEventListener('hashchange', showTab);
  showTab();

  /* Поиск по вопросам */
  const search = document.getElementById('faq-search');
  if (search) {
    const items = [...document.querySelectorAll('.faq-item')];
    const groups = [...document.querySelectorAll('.faq-group')];
    const empty = document.getElementById('faq-empty');

    search.addEventListener('input', () => {
      const query = search.value.trim().toLowerCase();

      items.forEach((item) => {
        item.hidden = query !== '' && !item.textContent.toLowerCase().includes(query);
      });

      groups.forEach((group) => {
        group.hidden = !group.querySelector('.faq-item:not([hidden])');
      });

      empty.hidden = groups.some((group) => !group.hidden);
    });
  }

  /* Проверка форм */
  document.querySelectorAll('form[data-validate]').forEach((form) => {
    const msg = form.querySelector('.msg');
    const say = (text, isError = false) => {
      msg.textContent = text;
      msg.classList.toggle('is-error', isError);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.elements.name.value.trim();
      const phone = form.elements.phone.value.replace(/\D/g, '');

      if (name.length < 2) return say('Укажите имя.', true);
      if (phone.length < 10) return say('Введите номер телефона полностью.', true);
      if (!form.elements.consent.checked) return say('Нужно согласие на обработку данных.', true);

      form.reset();
      say('Спасибо! Мы свяжемся с вами в ближайшее время.');
    });
  });
})();
