/* =========================================================
   SHEZHIRE — логика сайта
   1. Навигация по разделам (hash-роутинг)
   2. Мобильное меню
   3. Калькулятор стоимости
   4. Выбор юрты из карточки
   5. Поиск по FAQ
   6. Форма заявки (проверка + отправка)
   ========================================================= */

(() => {
  /* ---------- Общие данные ---------- */
  const PAGES = {
    home:      'SHEZHIRE — юрты и юрточные лагеря',
    yurty:     'Юрты — каталог моделей | SHEZHIRE',
    'o-nas':   'О нас | SHEZHIRE',
    kontakty:  'Контакты | SHEZHIRE',
    voprosy:   'Частые вопросы | SHEZHIRE',
    zapisatsya:'Оставить заявку | SHEZHIRE',
  };

  const body = document.body;
  const nav = document.getElementById('nav');
  const burger = document.querySelector('.burger');

  /* ---------- 1. Навигация по разделам ---------- */
  function showPage() {
    const hash = location.hash.slice(1);
    const page = Object.hasOwn(PAGES, hash) ? hash : 'home';

    document.querySelectorAll('.page').forEach((section) => {
      section.hidden = section.id !== page;
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      if (link.getAttribute('href') === `#${page}`) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    body.dataset.page = page;
    document.title = PAGES[page];
    setMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Фокус на заголовок раздела, чтобы программа чтения экрана озвучила смену страницы
    const heading = document.querySelector(`#${page} h1`);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  window.addEventListener('hashchange', showPage);

  /* ---------- 2. Мобильное меню ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  burger.addEventListener('click', () => {
    setMenu(!nav.classList.contains('is-open'));
  });

  // Клик по уже открытому разделу не меняет хеш, поэтому закрываем меню вручную
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (link.getAttribute('href') === location.hash) {
        setMenu(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- 3. Калькулятор стоимости ---------- */
  const calcSize = document.getElementById('calc-size');
  const calcSeason = document.getElementById('calc-season');
  const calcTotal = document.getElementById('calc-total');
  const calcOrder = document.getElementById('calc-order');

  // Названия моделей, которые совпадают с выпадающим списком в форме заявки
  const YURT_LABELS = ['Классическая 5 м', 'Семейная 6 м', 'Глэмпинг 7 м', 'Зимняя 6 м'];

  const formatPrice = (value) =>
    `${Math.round(value).toLocaleString('ru-RU').replace(/\s/g, ' ')} ₸`;

  function calculate() {
    if (!calcSize || !calcSeason) return;
    const base = Number(calcSize.value);
    const factor = Number(calcSeason.value);
    calcTotal.textContent = formatPrice(base * factor);
  }

  if (calcSize && calcSeason) {
    calcSize.addEventListener('change', calculate);
    calcSeason.addEventListener('change', calculate);
    calculate();
  }

  // Кнопка «Заказать расчёт» переносит выбранную конфигурацию в форму заявки
  if (calcOrder) {
    calcOrder.addEventListener('click', () => {
      const index = calcSize.selectedIndex;
      const seasonText = calcSeason.options[calcSeason.selectedIndex].text;
      selectYurt(YURT_LABELS[index]);

      const comment = document.getElementById('comment');
      if (comment) {
        comment.value =
          `Расчёт с сайта: ${calcSize.options[index].text}, ` +
          `${seasonText}, ориентировочно ${calcTotal.textContent}.`;
      }
    });
  }

  /* ---------- 4. Выбор юрты из карточки ---------- */
  function selectYurt(label) {
    const select = document.getElementById('yurt');
    if (!select || !label) return;
    for (const option of select.options) {
      if (option.text === label) {
        select.value = option.value;
        return;
      }
    }
  }

  // Карточки с data-yurt передают название модели в форму
  document.querySelectorAll('[data-yurt] a[href="#zapisatsya"]').forEach((link) => {
    link.addEventListener('click', () => {
      selectYurt(link.closest('[data-yurt]').dataset.yurt);
    });
  });

  /* ---------- 5. Поиск по FAQ ---------- */
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

  /* ---------- 6. Форма заявки ---------- */
  document.querySelectorAll('form[data-validate]').forEach((form) => {
    const msg = form.querySelector('.msg');
    const submit = form.querySelector('button[type="submit"]');

    const say = (text, isError = false) => {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.toggle('is-error', isError);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.elements.name.value.trim();
      const phone = form.elements.phone.value.replace(/\D/g, '');
      const consent = form.elements.consent;

      if (name.length < 2) return say('Укажите имя.', true);
      if (phone.length < 10) return say('Введите номер телефона полностью.', true);
      if (consent && !consent.checked) return say('Нужно согласие на обработку данных.', true);

      // Адрес сервера или сервиса (Formspree, Telegram-бот, CRM) задаётся в data-endpoint у формы
      const endpoint = form.dataset.endpoint;
      const data = Object.fromEntries(new FormData(form).entries());
      data.page = location.href;

      if (!endpoint) {
        // Режим демонстрации: без адреса отправки заявка не уходит
        console.info('Заявка (нет data-endpoint):', data);
        form.reset();
        return say('Спасибо! Мы свяжемся с вами в ближайшее время.');
      }

      submit.disabled = true;
      say('Отправляем…');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        say('Спасибо! Мы свяжемся с вами в ближайшее время.');
      } catch (error) {
        say('Не удалось отправить заявку. Позвоните нам или напишите в WhatsApp.', true);
      } finally {
        submit.disabled = false;
      }
    });
  });

  /* ---------- Старт ---------- */
  showPage();
})();
