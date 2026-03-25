// ========== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ==========
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.profile-tab');
    const contents = document.querySelectorAll('.profile-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Убираем активный класс у всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            // Добавляем текущей
            this.classList.add('active');
            
            // Скрываем весь контент
            contents.forEach(c => c.classList.remove('active'));
            
            // Показываем нужный контент
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // ========== СОХРАНЕНИЕ ПРОФИЛЯ ==========
    const profileForm = document.getElementById('profileForm');
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Собираем данные
            const profileData = {
                name: document.getElementById('profileName').value,
                lastName: document.getElementById('profileLastName').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value,
                address: document.getElementById('profileAddress').value
            };
            
            // Сохраняем в localStorage
            localStorage.setItem('healthonhand_profile', JSON.stringify(profileData));
            
            alert('Данные сохранены!');
        });
        
        // Загружаем сохранённые данные
        const savedProfile = localStorage.getItem('healthonhand_profile');
        if (savedProfile) {
            const data = JSON.parse(savedProfile);
            document.getElementById('profileName').value = data.name || '';
            document.getElementById('profileLastName').value = data.lastName || '';
            document.getElementById('profileEmail').value = data.email || '';
            document.getElementById('profilePhone').value = data.phone || '';
            document.getElementById('profileAddress').value = data.address || '';
        }
    }
    
    // ========== ВЫХОД ==========
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                // Очищаем данные профиля (но не корзину!)
                localStorage.removeItem('healthonhand_profile');
                alert('Вы вышли из аккаунта');
                
                // Редирект на главную
                window.location.href = 'index.html';
            }
        });
    }
    
    // ========== УДАЛЕНИЕ ИЗ ИЗБРАННОГО ==========
    document.querySelectorAll('.favorite-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.favorite-item');
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                item.remove();
                
                // Если избранное пустое
                const favoritesGrid = document.querySelector('.favorites-grid');
                if (favoritesGrid && favoritesGrid.children.length === 0) {
                    favoritesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Список избранного пуст</p>';
                }
            }, 300);
        });
    });
    
    // ========== ПОВТОР ЗАКАЗА ==========
    document.querySelectorAll('.order-item .btn-outline').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderItem = this.closest('.order-item');
            const orderNumber = orderItem.querySelector('.order-number').textContent;
            
            alert(`Товары из заказа ${orderNumber} добавлены в корзину!`);
            
            // Здесь можно добавить логику добавления товаров в корзину
            // Например, взять товары из order-products и добавить в глобальную корзину
        });
    });
    
    // ========== ОБНОВЛЕНИЕ СЧЁТЧИКА КОРЗИНЫ ==========
    function updateCartCountFromProfile() {
        const cartCountSpan = document.querySelector('.cart-count');
        if (cartCountSpan && typeof cart !== 'undefined') {
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCountSpan.textContent = totalItems;
        }
    }
    
    // Вызываем при загрузке
    setTimeout(updateCartCountFromProfile, 100);
});