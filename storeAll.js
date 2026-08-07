/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً في الواجهة الرئيسية
 * تم ربطه بملف store.js لجلب العناصر داخل تبويب "دامة"
 */

document.addEventListener('DOMContentLoaded', () => {
    const storeContainer = document.getElementById('nav-section-store');
    
    if (storeContainer) {
        // بناء هيكل المتجر بالكامل (التنسيقات أصبحت موجودة في index.html)
        storeContainer.innerHTML = `
            <!-- أزرار التبويبات العلوية الرئيسية -->
            <div class="store-tabs-container">
                <button class="store-tab-btn active" onclick="window.switchStoreContentTab('store-games-content', this)">
                    <span>🎮</span> <span data-i18n="store_games">الألعاب</span>
                </button>
                <button class="store-tab-btn" onclick="window.switchStoreContentTab('store-popularity-content', this)">
                    <span>🔥</span> <span data-i18n="store_popularity">الشعبية</span>
                </button>
                <button class="store-tab-btn premium-tab" onclick="window.switchStoreContentTab('store-topup-content', this)">
                    <span>💎</span> <span data-i18n="store_topup">شحن</span>
                </button>
            </div>

            <!-- حاوية محتوى الألعاب (مفتوحة افتراضياً) -->
            <div id="store-games-content" class="store-tab-content active-content">
                
                <!-- أزرار التبويبات الفرعية (دامة وطاولة) -->
                <div class="store-sub-tabs-container">
                    <button class="store-sub-tab-btn active" onclick="window.switchSubStoreTab('store-dama-items', this)">
                        <span data-i18n="store_dama">دامة</span>
                    </button>
                    <button class="store-sub-tab-btn" onclick="window.switchSubStoreTab('store-tawla-items', this)">
                        <span data-i18n="store_tawla">طاولة</span>
                    </button>
                </div>

                <!-- صندوق المحتوى الفعلي للألعاب (الصندوق المظلم الثابت) -->
                <div class="store-group-box-dark">
                    
                    <!-- 💡 محتوى متجر دامة -->
                    <div id="store-dama-items" class="store-sub-tab-content active-content">
                        
                        <!-- أزرار التصنيفات الداخلية للدامة -->
                        <div class="dama-cats-container">
                            <button id="store-btn-tab-bg" class="dama-cat-btn active" onclick="window.switchStoreTabCategory('bg')">خلفيات</button>
                            <button id="store-btn-tab-frames" class="dama-cat-btn" onclick="window.switchStoreTabCategory('frames')">إطارات</button>
                            <button id="store-btn-tab-pieces" class="dama-cat-btn" onclick="window.switchStoreTabCategory('pieces')">أحجار</button>
                            <button id="store-btn-tab-offers" class="dama-cat-btn" onclick="window.switchStoreTabCategory('offers')">عروضات</button>
                        </div>

                        <!-- الحاويات المستهدفة من store.js لضخ العناصر -->
                        <div class="store-scrollable-area">
                            <div id="store-section-bg" class="store-items-grid"></div>
                            <div id="store-section-frames" class="store-items-grid" style="display: none;"></div>
                            <div id="store-section-pieces" class="store-items-grid" style="display: none;"></div>
                            <div id="store-section-offers" class="store-items-grid" style="display: none;"></div>
                        </div>

                    </div>

                    <!-- محتوى متجر طاولة -->
                    <div id="store-tawla-items" class="store-sub-tab-content">
                        <span style="font-size: 40px; display: block; text-align: center; margin-bottom: 10px;">🎲</span>
                        <p style="color: var(--text-secondary); font-size: 13px; text-align: center; margin: 10px 0 20px 0;">
                            ملحقات وأزياء خاصة بلعبة الطاولة
                        </p>
                        <button class="btn btn-primary" style="width: 100%; margin: 0;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                    </div>

                </div>
            </div>

            <!-- حاوية محتوى الشعبية -->
            <div id="store-popularity-content" class="store-tab-content">
                <div class="store-group-box-dark" style="text-align: center; height: auto; justify-content: center;">
                    <span style="font-size: 50px; display: block; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(255, 69, 58, 0.5));">🔥</span>
                    <h4 style="color: white; font-size: 18px; margin-bottom: 10px;" data-i18n="store_popularity">باقات الشعبية</h4>
                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
                        ادعم أصدقاءك أو تصدر قائمة الأكثر شعبية باقتناء باقات نادرة!
                    </p>
                    <button class="btn btn-primary" style="width: 100%; margin: 0;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                </div>
            </div>

            <!-- حاوية محتوى الشحن -->
            <div id="store-topup-content" class="store-tab-content">
                <div class="store-group-box-dark" style="text-align: center; height: auto; justify-content: center; border-color: rgba(245,166,35,0.4); background: linear-gradient(180deg, rgba(245,166,35,0.1), rgba(10,12,16,0.95)) !important;">
                    <span style="font-size: 50px; display: block; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(245, 166, 35, 0.5));">💎</span>
                    <h4 style="color: var(--accent); font-size: 18px; margin-bottom: 10px;" data-i18n="store_topup">شحن الرصيد</h4>
                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
                        اشحن رصيدك الآن للمشاركة في البطولات الكبرى والمراهنات الفاخرة.
                    </p>
                    <button class="store-btn premium" style="justify-content: center; width: 100%; margin: 0; background: linear-gradient(135deg, rgba(245,166,35,0.2), rgba(211,84,0,0.2)); border: 1px solid rgba(245,166,35,0.4); color: #f5a623; border-radius: 16px; padding: 15px; font-weight: 600;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                </div>
            </div>
        `;
        
        // تحديث الترجمات
        if (typeof updateTranslations === 'function') {
            updateTranslations();
        }

        // إجبار السكربت على ضخ المنتجات وفتح تبويب الخلفيات افتراضياً بعد بناء العناصر
        setTimeout(() => {
            if (window.storeManager && typeof window.storeManager.renderUI === 'function') {
                window.storeManager.renderUI();
            }
            if (typeof window.switchStoreTabCategory === 'function') {
                window.switchStoreTabCategory('bg'); 
            }
        }, 300);
    }
});

// دوال التنقل بين التبويبات العلوية الرئيسية
window.switchStoreContentTab = function(contentId, btnElement) {
    document.querySelectorAll('.store-tab-content').forEach(el => {
        el.style.display = 'none'; el.classList.remove('active-content');
    });
    document.querySelectorAll('.store-tab-btn').forEach(el => { el.classList.remove('active'); });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        targetContent.style.display = 'block'; targetContent.classList.add('active-content');
    }
    if (btnElement) btnElement.classList.add('active');
};

// دالة التبديل بين التبويبات الفرعية (دامة / طاولة)
window.switchSubStoreTab = function(contentId, btnElement) {
    const parentTab = btnElement.closest('.store-tab-content');
    parentTab.querySelectorAll('.store-sub-tab-content').forEach(el => {
        el.style.display = 'none'; el.classList.remove('active-content');
    });
    parentTab.querySelectorAll('.store-sub-tab-btn').forEach(el => { el.classList.remove('active'); });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        targetContent.style.display = 'flex'; targetContent.classList.add('active-content');
    }
    if (btnElement) btnElement.classList.add('active');
};

// دالة التبديل بين تصنيفات الدامة (خلفيات، إطارات، الخ)
window.switchStoreTabCategory = function(category) {
    const tabs = ['bg', 'frames', 'pieces', 'offers'];
    tabs.forEach(tab => { 
        const btn = document.getElementById('store-btn-tab-' + tab); 
        const sec = document.getElementById('store-section-' + tab); 
        if(btn) btn.classList.remove('active'); 
        if(sec) sec.style.display = 'none'; 
    });
    const activeBtn = document.getElementById('store-btn-tab-' + category); 
    const activeSec = document.getElementById('store-section-' + category);
    
    if(activeBtn) activeBtn.classList.add('active'); 
    if(activeSec) activeSec.style.display = 'grid'; 
};
