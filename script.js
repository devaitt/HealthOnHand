// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let cart = JSON.parse(localStorage.getItem('healthonhand_cart')) || [];
let favorites = JSON.parse(localStorage.getItem('healthonhand_favorites')) || [];

// Элементы
const cartIcon = document.querySelector('.cart');
const cartPopup = document.getElementById('cartPopup');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartPopup');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartCountSpan = document.querySelector('.cart-count');
const cartTotalSpan = document.getElementById('cartTotalAmount');

// Элементы поп-апа товара
const productPopup = document.getElementById('productPopup');
const productOverlay = document.getElementById('productOverlay');
const closeProductBtn = document.getElementById('closeProductPopup');
const productPopupBody = document.getElementById('productPopupBody');

// ========== СОХРАНЕНИЕ ==========
function saveCart() {
    localStorage.setItem('healthonhand_cart', JSON.stringify(cart));
    updateCartCount();
}

function saveFavorites() {
    localStorage.setItem('healthonhand_favorites', JSON.stringify(favorites));
}

// ========== ОБНОВЛЕНИЕ СЧЁТЧИКА КОРЗИНЫ ==========
function updateCartCount() {
    if (cartCountSpan) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountSpan.textContent = totalItems;
    }
}

// ========== РЕНДЕР КОРЗИНЫ ==========
function renderCart() {
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
        if (cartTotalSpan) cartTotalSpan.textContent = '0 BYN';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item__image">⌚</div>
                <div class="cart-item__info">
                    <div class="cart-item__title">${item.title}</div>
                    <div class="cart-item__price">${item.price} BYN</div>
                    <div class="cart-item__controls">
                        <button class="cart-item__qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="cart-item__qty">${item.quantity}</span>
                        <button class="cart-item__qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="cart-item__remove" onclick="removeItem(${item.id})">✕</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
    if (cartTotalSpan) cartTotalSpan.textContent = total + ' BYN';
}

// ========== ИЗМЕНЕНИЕ КОЛИЧЕСТВА В КОРЗИНЕ ==========
window.updateQuantity = function(id, delta) {
    const item = cart.find(i => i.id == id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id != id);
        }
        saveCart();
        renderCart();
    }
};

// ========== УДАЛЕНИЕ ТОВАРА ИЗ КОРЗИНЫ ==========
window.removeItem = function(id) {
    cart = cart.filter(i => i.id != id);
    saveCart();
    renderCart();
};

// ========== ОТКРЫТИЕ/ЗАКРЫТИЕ КОРЗИНЫ ==========
if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        if (cartPopup) cartPopup.classList.add('show');
        renderCart();
    });
}

function closeCart() {
    if (cartPopup) cartPopup.classList.remove('show');
}

if (cartOverlay) cartOverlay?.addEventListener('click', closeCart);
if (closeCartBtn) closeCartBtn?.addEventListener('click', closeCart);

// ========== ОТКРЫТИЕ/ЗАКРЫТИЕ ПОП-АПА ТОВАРА ==========
function showProductPopup(product) {
    if (!productPopup || !productPopupBody) return;
    
    productPopupBody.innerHTML = `
        <div class="product-popup__image">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="product-popup__info">
            <h3>${product.title}</h3>
            <div class="product-popup__price">
                ${product.price} BYN
                ${product.oldPrice ? `<small>${product.oldPrice} BYN</small>` : ''}
            </div>
            <p class="product-popup__desc">${product.desc}</p>
            <p><strong>Бренд:</strong> ${product.brand}</p>
            <p><strong>Экран:</strong> AMOLED</p>
            <p><strong>Защита:</strong> Водонепроницаемый</p>
            <p><strong>Совместимость:</strong> iOS, Android</p>
            <button class="btn btn-primary product-popup__btn" onclick="addFromPopup(${product.id})">В корзину</button>
        </div>
    `;
    
    productPopup.classList.add('show');
}

function closeProductPopup() {
    if (productPopup) productPopup.classList.remove('show');
}

if (productOverlay) productOverlay?.addEventListener('click', closeProductPopup);
if (closeProductBtn) closeProductBtn?.addEventListener('click', closeProductPopup);

// Добавление из поп-апа
window.addFromPopup = function(id) {
    const product = allProducts?.find(p => p.id === id);
    if (product) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: '⌚',
                quantity: 1
            });
        }
        saveCart();
        alert('Товар добавлен в корзину!');
        closeProductPopup();
    }
};

// ========== ИЗБРАННОЕ: ДОБАВЛЕНИЕ/УДАЛЕНИЕ ==========
function toggleFavorite(product) {
    const index = favorites.findIndex(fav => fav.id === product.id);
    if (index === -1) {
        favorites.push({
            id: product.id,
            title: product.title,
            price: product.price,
            oldPrice: product.oldPrice,
            brand: product.brand,
            desc: product.desc,
            image: product.image
        });
    } else {
        favorites.splice(index, 1);
    }
    saveFavorites();
    return index === -1;
}

function isFavorite(productId) {
    return favorites.some(fav => fav.id === productId);
}

// ========== АККОРДЕОН ДЛЯ FAQ ==========
function initAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            answer.style.display = 'none';
            question.addEventListener('click', () => {
                if (answer.style.display === 'none') {
                    answer.style.display = 'block';
                } else {
                    answer.style.display = 'none';
                }
            });
        }
    });
}

// ========== ОФОРМЛЕНИЕ ЗАКАЗА ==========
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    alert('Заказ оформлен! Спасибо за покупку 🎉');
    cart = [];
    saveCart();
    renderCart();
    closeCart();
});

// ========== ТОВАРЫ КАТАЛОГА ==========
if (window.location.pathname.includes('catalog.html')) {
    
    const allProducts = [
        { id: 1, title: "Xiaomi Mi Band 8", price: 159, oldPrice: 199, brand: "Xiaomi", desc: "1.62' AMOLED, пульсометр, SpO2, 16 дней работы", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRbjN-9XOUmqJmjlkWyhaJ9XvNYbfcLjYQ_5tNyYBRSDuIGCTA0ukeMNFfMfsTHpe2tcy8W1MMk3p1cAwYwkhiCHg-G6I1jvJTYaG2oXFg&usqp=CAc", popular: 120 },
        { id: 2, title: "Xiaomi Mi Band 8 Pro", price: 259, oldPrice: null, brand: "Xiaomi", desc: "1.74' AMOLED, GPS, NFC, пульсометр", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSmrT1KqH3cQeSSCKvG7UmgwQoLBvrXr52TNfjCyBc-T_DDve4rSREnWkKKCmYdLnBI4l_WdshJD6YSsGOmtt-JYpUCc6hzmJjfj-3IKkU&usqp=CAc", popular: 95 },
        { id: 3, title: "Samsung Galaxy Fit 3", price: 289, oldPrice: 349, brand: "Samsung", desc: "1.6' AMOLED, 5ATM, пульсометр, стресс", image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQrWJ7a3g0V9r-EM2NRl7DnSgdrgWrrrKYOpWME-bNpyeFNTA-yQbXB_Lkml9UMM-4GDKuJ31-VzRrhhllTr3pOuzArNXO8TsCrurlC3QZwQY98gYW2OSfvpC54z2--&usqp=CAc", popular: 80 },
        { id: 4, title: "Huawei Band 8", price: 129, oldPrice: null, brand: "Huawei", desc: "1.47' AMOLED, пульсометр, SpO2, 14 дней", image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS6FHcNN-VU3dLMcCjj4GJkz2pOhI0Dog5EAmpJneRdRaH2vXosidVaCPnzvhCmBs4CapFMF5KJkllXO4lP9VF3KB8uUUBCLTW82BGAr1c&usqp=CAc", popular: 110 },
        { id: 5, title: "Garmin Venu 3", price: 1249, oldPrice: null, brand: "Garmin", desc: "1.4' AMOLED, GPS, NFC, до 14 дней", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu1NnRsNqqZ5nwKclutXVAMd93NGfITaiBUQ&s", popular: 45 },
        { id: 6, title: "Apple Watch SE", price: 999, oldPrice: null, brand: "Apple", desc: "GPS, пульсометр, ECG, водонепроницаемые", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTRQ2wsuyGwWvtUYV1xrWinL5gCNy8AVQfd-pgLEsnv6fHBosWRrVcAVMwgkQc80REJXyQxexD0kJxmncL8DFT4-lvJZtBj0mPM11VcvF_lwVoBFAhDmBpFaTqPPYvmlg&usqp=CAc", popular: 200 },
        { id: 7, title: "Amazfit GTS 4", price: 499, oldPrice: null, brand: "Amazfit", desc: "1.75' AMOLED, GPS, пульсометр, 8 дней", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSFr2WcsuVi0JAhFeqjwIE1gM9gHG_wfsbG2TsBK8ZyOkEr4MxwemplKGhBI1HKDu_MLbadlyVwHMq6y5e51G_IhhlbPrTlN19iM0XU8XtI&usqp=CAc", popular: 60 },
        { id: 8, title: "Garmin Instinct 2", price: 899, oldPrice: null, brand: "Garmin", desc: "GPS, ударопрочный, 100м водонепроницаемость", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSPJAj5a69fNGlcFkbPeD6DJfKHq7iCErtALE5msBYWM-k74wQqVzVGL87mXGnvAA7XMkYYo_PGiI4-_GgoMoVdJWsLHoQB80ubTi56zcdyHwxhos5ZA7G_Vh07hS90&usqp=CAc", popular: 55 },
        { id: 9, title: "Huawei Watch GT 3", price: 699, oldPrice: 799, brand: "Huawei", desc: "1.43' AMOLED, GPS, пульсометр, 14 дней", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZAtXlr7UETySxtc7zh8PbUKIH9PMiFVN_-w&s", popular: 70 },
        { id: 10, title: "Xiaomi Mi Band 7", price: 99, oldPrice: 129, brand: "Xiaomi", desc: "1.56' AMOLED, пульсометр, SpO2", image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR0t0SCguKXEa-nVmE5UvVebtj37eoSCaWlTjCUsrk6tvqhIiCBD9LWndtahv75fWGH-0YFfxxrFwE9zkwOfLImg6h5CizFJGIfoyZrTNI&usqp=CAc", popular: 150 }
    ];

    let filteredProducts = [...allProducts];

    function renderProducts(products) {
        const grid = document.getElementById('productsGrid');
        const countEl = document.getElementById('productsCount');
        if (!grid) return;
        
        countEl.textContent = `Найдено: ${products.length} товаров`;
        
        if (products.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Товары не найдены</p>';
            return;
        }
        
        grid.innerHTML = products.map(product => {
            const discount = product.oldPrice ? Math.round((1 - product.price/product.oldPrice)*100) : 0;
            const isFav = isFavorite(product.id);
            return `
                <div class="product-card" data-id="${product.id}" data-brand="${product.brand}" data-price="${product.price}" data-popular="${product.popular}">
                    ${discount ? `<div class="product-card__badge">-${discount}%</div>` : ''}
                    <div class="product-card__image">
                        <img src="${product.image}" alt="${product.title}" loading="lazy">
                    </div>
                    <h3 class="product-card__title">${product.title}</h3>
                    <p class="product-card__desc">${product.desc}</p>
                    <div class="product-card__price">
                        ${product.price} BYN
                        ${product.oldPrice ? `<small>${product.oldPrice} BYN</small>` : ''}
                    </div>
                    <button class="product-card__btn">В корзину</button>
                    <button class="product-card__favorite ${isFav ? 'active' : ''}" data-id="${product.id}">❤️</button>
                    <button class="product-card__details">Подробнее</button>
                </div>
            `;
        }).join('');
        
        attachProductEvents();
    }

    function attachProductEvents() {
        document.querySelectorAll('.product-card__btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.product-card');
                const id = parseInt(card.dataset.id);
                const product = allProducts.find(p => p.id === id);
                
                const existingItem = cart.find(item => item.id === id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: '⌚',
                        quantity: 1
                    });
                }
                
                saveCart();
                
                this.textContent = '✓ Добавлено';
                setTimeout(() => {
                    this.textContent = 'В корзину';
                }, 1000);
            });
        });
        
        document.querySelectorAll('.product-card__favorite').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const card = this.closest('.product-card');
                const id = parseInt(card.dataset.id);
                const product = allProducts.find(p => p.id === id);
                
                const added = toggleFavorite(product);
                if (added) {
                    this.classList.add('active');
                } else {
                    this.classList.remove('active');
                }
                
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });
        });
        
        document.querySelectorAll('.product-card__details').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.product-card');
                const id = parseInt(card.dataset.id);
                const product = allProducts.find(p => p.id === id);
                showProductPopup(product);
            });
        });
    }

    function filterProducts() {
        const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
        const selectedBrands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(cb => cb.value);
        
        filteredProducts = allProducts.filter(p => {
            const priceMatch = p.price >= minPrice && p.price <= maxPrice;
            const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
            return priceMatch && brandMatch;
        });
        
        applySort();
    }

    function applySort() {
        const sortType = document.getElementById('sortSelect')?.value || 'default';
        
        if (sortType === 'priceAsc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortType === 'priceDesc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortType === 'popular') {
            filteredProducts.sort((a, b) => b.popular - a.popular);
        } else {
            filteredProducts.sort((a, b) => a.id - b.id);
        }
        
        renderProducts(filteredProducts);
    }

    function resetFilters() {
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.querySelectorAll('.brand-filter').forEach(cb => cb.checked = false);
        filteredProducts = [...allProducts];
        document.getElementById('sortSelect').value = 'default';
        renderProducts(allProducts);
    }

    document.addEventListener('DOMContentLoaded', function() {
        renderProducts(allProducts);
        document.getElementById('applyPriceFilter')?.addEventListener('click', filterProducts);
        document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
        document.querySelectorAll('.brand-filter').forEach(cb => cb.addEventListener('change', filterProducts));
        document.getElementById('sortSelect')?.addEventListener('change', applySort);
    });
}

// ========== ТОВАРЫ НА ГЛАВНОЙ СТРАНИЦЕ ==========
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
    
    const mainProducts = [
        { id: 1, title: "Xiaomi Mi Band 8", price: 159, oldPrice: 199, brand: "Xiaomi", desc: "1.62' AMOLED, пульсометр, SpO2", image: "https://i01.appmifile.com/webfile/globalimg/products/pc/mi-smart-band-8/specs.png" },
        { id: 2, title: "Xiaomi Mi Band 8 Pro", price: 259, oldPrice: null, brand: "Xiaomi", desc: "GPS, NFC, пульсометр, 1.74\"", image: "https://i01.appmifile.com/webfile/globalimg/products/pc/mi-smart-band-8-pro/specs.png" },
        { id: 3, title: "Samsung Galaxy Fit 3", price: 289, oldPrice: 349, brand: "Samsung", desc: "5ATM, пульсометр, стресс", image: "https://images.samsung.com/is/image/samsung/p6pim/ru/feature/164703450?$FB_TYPE_A_JPG$" },
        { id: 4, title: "Huawei Band 8", price: 129, oldPrice: null, brand: "Huawei", desc: "1.47' AMOLED, пульсометр, SpO2", image: "https://consumer.huawei.com/content/dam/huawei-cbg-site/common/mkt/plp/wearables/huawei-band-8/black/overview.png" }
    ];

    function attachMainProductEvents() {
        const buttons = document.querySelectorAll('.product-card__btn');
        if (buttons.length === 0) return;
        
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.product-card');
                const title = card.querySelector('.product-card__title')?.textContent;
                const product = mainProducts.find(p => p.title === title);
                if (!product) return;
                
                const existingItem = cart.find(item => item.id === product.id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: '⌚',
                        quantity: 1
                    });
                }
                
                saveCart();
                
                this.textContent = '✓ Добавлено';
                setTimeout(() => {
                    this.textContent = 'В корзину';
                }, 1000);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        attachMainProductEvents();
        updateCartCount();
    });
}

// ========== СТРАНИЦА ПРОФИЛЯ ==========
if (window.location.pathname.includes('profile.html')) {
    
    function renderFavoritesInProfile() {
        const favoritesContainer = document.querySelector('.favorites-grid');
        if (!favoritesContainer) return;
        
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Избранное пусто. Добавьте товары в избранное в каталоге!</p>';
            return;
        }
        
        favoritesContainer.innerHTML = favorites.map(fav => `
            <div class="favorite-item" data-id="${fav.id}">
                <div class="favorite-image">⌚</div>
                <div class="favorite-info">
                    <h4>${fav.title}</h4>
                    <div class="favorite-price">${fav.price} BYN</div>
                </div>
                <button class="favorite-remove" onclick="removeFromFavorites(${fav.id})">✕</button>
            </div>
        `).join('');
    }
    
    window.removeFromFavorites = function(id) {
        favorites = favorites.filter(fav => fav.id !== id);
        saveFavorites();
        renderFavoritesInProfile();
    };
    
    function addAllFavoritesToCart() {
        if (favorites.length === 0) {
            alert('Избранное пусто!');
            return;
        }
        
        let addedCount = 0;
        
        favorites.forEach(fav => {
            const existingItem = cart.find(item => item.id === fav.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: fav.id,
                    title: fav.title,
                    price: fav.price,
                    image: '⌚',
                    quantity: 1
                });
            }
            addedCount++;
        });
        
        saveCart();
        alert(`✅ ${addedCount} товар(ов) добавлен(о) в корзину!`);
    }
    
    const addToCartBtn = document.getElementById('favoritesAddToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addAllFavoritesToCart);
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        renderFavoritesInProfile();
    });
}

// ========== СТРАНИЦА БЛОГА ==========
if (window.location.pathname.includes('blog.html')) {
    
    const articles = [
        {
            id: 1,
            title: "Как выбрать фитнес-трекер: полный гид",
            category: "guides",
            date: "15 марта 2026",
            excerpt: "Рассказываем на что обратить внимание при выборе трекера: пульсометр, GPS, NFC, водозащита и другие важные функции.",
            content: "<p>Выбор фитнес-трекера может показаться сложным из-за огромного количества моделей на рынке. В этом гиде мы разберем ключевые параметры, на которые стоит обратить внимание.</p><h3>1. Пульсометр</h3><p>Точность измерения пульса — один из главных критериев. Современные трекеры используют оптические датчики, которые хорошо работают в покое и при умеренной активности.</p><h3>2. GPS</h3><p>Если вы бегаете или катаетесь на велосипеде без телефона — выбирайте трекер со встроенным GPS.</p><h3>3. NFC</h3><p>Для бесконтактной оплаты через Google Pay или Samsung Pay нужен модуль NFC.</p><h3>4. Водозащита</h3><p>Степень защиты 5ATM позволяет плавать в бассейне и принимать душ без снятия трекера.</p>",
            emoji: "📖"
        },
        {
            id: 2,
            title: "Топ-5 фитнес-трекеров для бега",
            category: "reviews",
            date: "10 марта 2026",
            excerpt: "Лучшие модели с точным GPS, пульсометром и долгим временем работы для бегунов любого уровня.",
            content: "<p>Бег требует точных данных о дистанции, темпе и пульсе. Мы собрали 5 лучших трекеров для бегунов.</p><h3>1. Garmin Forerunner 265</h3><p>Профессиональные часы для бега с точным GPS и аналитикой восстановления.</p><h3>2. Xiaomi Mi Band 8 Pro</h3><p>Бюджетный вариант со встроенным GPS и хорошим временем работы.</p><h3>3. Huawei Band 8</h3><p>Лёгкий трекер с точным пульсометром и отслеживанием беговых тренировок.</p><h3>4. Samsung Galaxy Fit 3</h3><p>Автоматическое распознавание бега и 5ATM водозащита.</p><h3>5. Apple Watch SE</h3><p>Идеальный выбор для владельцев iPhone с детальным анализом тренировок.</p>",
            emoji: "🏃"
        },
        {
            id: 3,
            title: "Как улучшить качество сна с помощью трекера",
            category: "tips",
            date: "5 марта 2026",
            excerpt: "Советы по анализу сна и привычки, которые помогут спать лучше с данными вашего фитнес-трекера.",
            content: "<p>Многие трекеры отслеживают фазы сна: глубокий, быстрый (REM) и легкий сон. Вот как использовать эти данные.</p><h3>1. Следите за продолжительностью</h3><p>Взрослому человеку нужно 7-9 часов сна. Трекер покажет вашу реальную цифру.</p><h3>2. Анализируйте фазы</h3><p>Глубокий сон восстанавливает тело, а REM — мозг. Если вы мало спите в этих фазах — пора менять режим.</p><h3>3. Регулярность</h3><p>Ложитесь и вставайте в одно и то же время. Трекер поможет отслеживать стабильность режима.</p>",
            emoji: "😴"
        },
        {
            id: 4,
            title: "Сравнение Huawei Band 8 и Xiaomi Mi Band 8",
            category: "reviews",
            date: "28 февраля 2026",
            excerpt: "Детальное сравнение двух самых популярных бюджетных трекеров: дизайн, функции, точность и автономность.",
            content: "<p>Huawei Band 8 и Xiaomi Mi Band 8 — главные конкуренты в бюджетном сегменте. Разбираем плюсы и минусы каждого.</p><h3>Дизайн</h3><p>Huawei Band 8 — тонкий и легкий (8.99 мм), Xiaomi Mi Band 8 — классический капсульный дизайн.</p><h3>Дисплей</h3><p>У обоих AMOLED, но у Xiaomi ярче и насыщеннее.</p><h3>Функции</h3><p>Xiaomi предлагает больше сторонних приложений и циферблатов. Huawei точнее в пульсометре.</p><h3>Автономность</h3><p>Оба работают около 14 дней, у Huawei быстрее зарядка.</p>",
            emoji: "⚖️"
        },
        {
            id: 5,
            title: "5 скрытых функций вашего трекера, о которых вы не знали",
            category: "tips",
            date: "20 февраля 2026",
            excerpt: "Рассказываем о полезных функциях, которые делают трекер ещё удобнее: уведомления, напоминания и не только.",
            content: "<p>Ваш трекер умеет больше, чем просто считать шаги. Вот 5 функций, которые стоит попробовать.</p><h3>1. Напоминание о движении</h3><p>Включается в приложении — трекер вибрирует, если вы сидите больше часа.</p><h3>2. Управление музыкой</h3><p>На многих моделях можно переключать треки прямо с экрана.</p><h3>3. Напоминание о питье воды</h3><p>Настраиваете интервал — трекер напоминает выпить стакан воды.</p><h3>4. Поиск телефона</h3><p>Если потеряли телефон — функция поможет его найти.</p><h3>5. Кастомные тренировки</h3><p>Создайте свои тренировки в приложении и следите за их выполнением.</p>",
            emoji: "🔍"
        },
        {
            id: 6,
            title: "Новинки 2026: какие трекеры вышли в этом году",
            category: "news",
            date: "15 февраля 2026",
            excerpt: "Обзор самых интересных новинок рынка фитнес-трекеров: от бюджетных до премиальных моделей.",
            content: "<p>2026 год принёс несколько интересных новинок. Рассказываем о главных.</p><h3>Xiaomi Mi Band 9</h3><p>Улучшенный дисплей, более точный пульсометр и до 20 дней работы.</p><h3>Samsung Galaxy Fit 4</h3><p>Новый дизайн, улучшенный GPS и интеграция с Samsung Health.</p><h3>Garmin Venu 4</h3><p>Премиальная модель с AMOLED-экраном и аналитикой тренировок на основе ИИ.</p>",
            emoji: "🆕"
        }
    ];

    let currentCategory = "all";

    function getCategoryName(category) {
        const names = {
            reviews: "Обзор",
            guides: "Гайд",
            tips: "Совет",
            news: "Новость"
        };
        return names[category] || category;
    }

    function renderArticles() {
        const grid = document.getElementById('blogGrid');
        if (!grid) return;
        
        let filtered = currentCategory === "all" 
            ? articles 
            : articles.filter(a => a.category === currentCategory);
        
        if (filtered.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Статей в этой категории пока нет</p>';
            return;
        }
        
        grid.innerHTML = filtered.map((article, index) => {
            return `
                <div class="blog-card" data-id="${article.id}" data-category="${article.category}">
                    <div class="blog-card__image" data-color="${index % 6}">
                        ${article.emoji}
                    </div>
                    <div class="blog-card__content">
                        <span class="blog-card__category">${getCategoryName(article.category)}</span>
                        <h3 class="blog-card__title">${article.title}</h3>
                        <p class="blog-card__excerpt">${article.excerpt}</p>
                        <div class="blog-card__meta">
                            <span class="blog-card__date">📅 ${article.date}</span>
                        </div>
                        <button class="blog-card__btn" onclick="openArticle(${article.id})">Читать →</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.openArticle = function(id) {
        const article = articles.find(a => a.id === id);
        if (!article) return;
        
        const popup = document.getElementById('articlePopup');
        const body = document.getElementById('articlePopupBody');
        
        body.innerHTML = `
            <h2>${article.title}</h2>
            <div class="article-meta">
                <span>📅 ${article.date}</span>
                <span>🏷️ ${getCategoryName(article.category)}</span>
            </div>
            <div class="article-content">
                ${article.content}
            </div>
        `;
        
        popup.classList.add('show');
    };

    function closeArticlePopup() {
        const popup = document.getElementById('articlePopup');
        if (popup) popup.classList.remove('show');
    }

    document.addEventListener('DOMContentLoaded', function() {
        renderArticles();
        
        const filterBtns = document.querySelectorAll('.blog-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.dataset.category;
                renderArticles();
            });
        });
        
        const overlay = document.getElementById('articleOverlay');
        const closeBtn = document.getElementById('closeArticlePopup');
        
        if (overlay) overlay.addEventListener('click', closeArticlePopup);
        if (closeBtn) closeBtn.addEventListener('click', closeArticlePopup);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const popup = document.getElementById('articlePopup');
                if (popup?.classList.contains('show')) closeArticlePopup();
            }
        });
    });
}

// ========== ЗАПУСК АККОРДЕОНА И СЧЁТЧИКА ==========
document.addEventListener('DOMContentLoaded', function() {
    initAccordion();
    updateCartCount();
});

// ========== ЗАКРЫТИЕ ПО ESC ==========
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (cartPopup?.classList.contains('show')) closeCart();
        if (productPopup?.classList.contains('show')) closeProductPopup();
    }
});