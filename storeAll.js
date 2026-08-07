/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً في الواجهة الرئيسية
 */

document.addEventListener('DOMContentLoaded', () => {
    const storeContainer = document.getElementById('nav-section-store');
    
    if (storeContainer) {
        // بناء هيكل المتجر بالكامل وحقنه في الحاوية
        storeContainer.innerHTML = `
            <h2 style="color:white; margin-bottom: 25px;" data-i18n="nav_store">المتجر</h2>
            
            <div class="store-menu-container">
                <!-- 1. زر الألعاب (مجموعة فرعية) -->
                <div class="store-group-box">
                    <h4 class="store-group-title" data-i18n="store_games">الألعاب</h4>
                    <div class="store-games-grid">
                        <button class="store-sub-btn" onclick="triggerAlertSoon()">
                            <span class="store-sub-icon">♟️</span>
                            <span data-i18n="store_dama">دامة</span>
                        </button>
                        <button class="store-sub-btn" onclick="triggerAlertSoon()">
                            <span class="store-sub-icon">🎲</span>
                            <span data-i18n="store_tawla">طاولة</span>
                        </button>
                    </div>
                </div>

                <!-- 2. زر الشعبية -->
                <button class="store-btn" onclick="triggerAlertSoon()">
                    <span class="store-btn-icon">🔥</span>
                    <span data-i18n="store_popularity">الشعبية</span>
                </button>

                <!-- 3. زر الشحن -->
                <button class="store-btn premium" onclick="triggerAlertSoon()">
                    <span class="store-btn-icon">💎</span>
                    <span data-i18n="store_topup">شحن</span>
                </button>
            </div>
        `;
    }
});
