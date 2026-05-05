// healthTracker.js — единый модуль трекинга для healthOnHand

(function() {
  'use strict';

  // --- 1. UTM-парсинг и хранение ---
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || ''
    };
  }

  function saveUtm() {
    const utm = getUrlParams();
    const hasUtm = Object.values(utm).some(v => v !== '');
    
    if (hasUtm) {
      // Последнее касание (sessionStorage)
      sessionStorage.setItem('hh_utm_last', JSON.stringify(utm));
      
      // Первое касание (localStorage) — только если ещё нет
      if (!localStorage.getItem('hh_utm_first')) {
        localStorage.setItem('hh_utm_first', JSON.stringify(utm));
      }
    }
  }

  function getLastUtm() {
    const last = sessionStorage.getItem('hh_utm_last');
    return last ? JSON.parse(last) : {};
  }

  function getFirstUtm() {
    const first = localStorage.getItem('hh_utm_first');
    return first ? JSON.parse(first) : {};
  }

  // --- 2. Отправка событий в dataLayer ---
  function pushEvent(eventName, params = {}) {
    const lastUtm = getLastUtm();
    const firstUtm = getFirstUtm();
    
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
      utm_source: lastUtm.utm_source || '',
      utm_medium: lastUtm.utm_medium || '',
      utm_campaign: lastUtm.utm_campaign || '',
      first_utm_source: firstUtm.utm_source || '',
      first_utm_medium: firstUtm.utm_medium || ''
    });
    
    console.log(`[healthTracker] ${eventName}`, params);
  }

  // --- 3. Отслеживание товаров (кнопки "Купить") ---
  function initProductTracking() {
    // Ищем все кнопки "Купить" — адаптируйте селектор под ваш сайт
    const buyButtons = document.querySelectorAll('.buy-btn, .product-card button, .popular-item button, .btn-buy');
    
    buyButtons.forEach(btn => {
      btn.removeEventListener('click', productClickHandler);
      btn.addEventListener('click', productClickHandler);
    });
  }

  function productClickHandler(e) {
    const card = this.closest('.product-card, .popular-item, .tracker-card');
    if (!card) return;
    
    const nameEl = card.querySelector('h3, .product-title');
    const priceEl = card.querySelector('.price, .product-price');
    
    const productName = nameEl ? nameEl.innerText.trim() : 'Неизвестный товар';
    const priceText = priceEl ? priceEl.innerText.match(/\d+/)?.[0] : '0';
    const price = parseInt(priceText, 10);
    
    pushEvent('add_to_cart', {
      ecommerce: {
        items: [{
          item_name: productName,
          price: price,
          quantity: 1
        }]
      },
      product_name: productName,
      price: price
    });
    
    // Демо-уведомление (можно убрать)
    alert(`Товар "${productName}" добавлен в корзину (демо)`);
  }

  // --- 4. Отслеживание контактов (телефон, email) ---
  function initContactTracking() {
    document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(link => {
      link.removeEventListener('click', contactHandler);
      link.addEventListener('click', contactHandler);
    });
  }

  function contactHandler(e) {
    const type = this.href.startsWith('tel:') ? 'phone' : 'email';
    pushEvent('contact_click', {
      contact_type: type,
      contact_value: this.href.replace(/^\w+:/, '')
    });
  }

  // --- 5. Отслеживание глубины скролла ---
  let scrollSent = { 25: false, 50: false, 75: false, 90: false };
  
  function initScrollTracking() {
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      [25, 50, 75, 90].forEach(threshold => {
        if (scrollPercent >= threshold && !scrollSent[threshold]) {
          scrollSent[threshold] = true;
          pushEvent('scroll_depth', { percent: threshold });
        }
      });
    });
  }

  // --- 6. Отслеживание времени на странице ---
  let timeSent = { 30: false, 60: false, 120: false };
  let startTime = Date.now();
  
  function initTimeTracking() {
    setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      [30, 60, 120].forEach(threshold => {
        if (seconds >= threshold && !timeSent[threshold]) {
          timeSent[threshold] = true;
          pushEvent('time_on_page', { seconds: threshold });
        }
      });
    }, 5000);
  }

  // --- 7. Intent to leave (уход с курсором) ---
  function initExitIntent() {
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0) {
        pushEvent('exit_intent', {});
      }
    });
  }

  // --- 8. Инициализация всего ---
  function init() {
    saveUtm();
    pushEvent('page_view', { page_title: document.title });
    
    // Ждём загрузку DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initProductTracking();
        initContactTracking();
        initScrollTracking();
        initTimeTracking();
        initExitIntent();
      });
    } else {
      initProductTracking();
      initContactTracking();
      initScrollTracking();
      initTimeTracking();
      initExitIntent();
    }
  }
  
  init();
})();
