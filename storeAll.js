/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً في الواجهة الرئيسية
 */

document.addEventListener('DOMContentLoaded', () => {
    const storeContainer = document.getElementById('nav-section-store');
    
    if (storeContainer) {
        
        // فصل الحاوية عن التوسيط التلقائي الخاص بالواجهة الرئيسية وجعلها تملأ الشاشة
        storeContainer.style.position = 'absolute';
        storeContainer.style.top = '0';
        storeContainer.style.left = '0';
        storeContainer.style.width = '100%';
        storeContainer.style.height = '100%';
        storeContainer.style.justifyContent = 'flex-start'; 
        storeContainer.style.paddingTop = '95px'; 
        
        // 1. إضافة ستايلات التبويبات ديناميكياً
        if (!document.getElementById('store-tabs-style')) {
            const style = document.createElement('style');
            style.id = 'store-tabs-style';
            style.innerHTML = `
                /* ستايل التبويبات الرئيسية (العلوية) */
                .store-tabs-container {
                    display: flex; gap: 8px; 
                    background: rgba(15, 18, 25, 0.6); padding: 6px;
                    border-radius: 50px; border: 1px solid rgba(255,255,255,0.08);
                    width: 90%; max-width: 350px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                    z-index: 10;
                    margin-bottom: 10px; /* مسافة قليلة جداً بين الشريطين */
                }
                .store-tab-btn {
                    flex: 1; background: transparent; border: none; color: var(--text-secondary);
                    padding: 10px 5px; border-radius: 50px; font-weight: 700; font-size: 13px;
                    cursor: pointer; transition: var(--transition); white-space: nowrap;
                    display: flex; align-items: center; justify-content: center; gap: 5px;
                }
                .store-tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                .store-tab-btn.active {
                    background: rgba(255,255,255,0.15); color: white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }
                .store-tab-btn.premium-tab.active {
                    background: linear-gradient(135deg, rgba(245,166,35,0.3), rgba(211,84,0,0.3));
                    color: var(--accent); border: 1px solid rgba(245,166,35,0.4);
                }
                .store-tab-content { 
                    display: none; width: 90%; max-width: 350px; 
                    animation: fadeIn 0.4s ease; 
                }
                .store-tab-content.active-content { display: block; }

                /* ستايل التبويبات الفرعية (دامة / طاولة) - أصبحت شريطاً مستقلاً */
                .store-sub-tabs-container {
                    display: flex; gap: 5px; margin-bottom: 20px; 
                    background: rgba(15, 18, 25, 0.5); padding: 4px; 
                    border-radius: 50px; border: 1px solid rgba(255,255,255,0.05);
                    width: 100%; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                }
                .store-sub-tab-btn {
                    flex: 1; background: transparent; border: none; color: var(--text-secondary);
                    padding: 6px 10px; 
                    border-radius: 50px; font-weight: 700; font-size: 13px; 
                    cursor: pointer; transition: var(--transition);
                }
                .store-sub-tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                .store-sub-tab-btn.active {
                    background: rgba(255,255,255,0.1); color: white; 
                    border: 1px solid rgba(255,255,255,0.15);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                .store-sub-tab-content { display: none; animation: fadeIn 0.3s ease; }
                .store-sub-tab-content.active-content { display: block; }
            `;
            document.head.appendChild(style);
        }

        // 2. بناء هيكل المتجر
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
                
                <!-- أزرار التبويبات الفرعية (تم إخراجها قبل الصندوق لتكون فوق الخط الأحمر) -->
                <div class="store-sub-tabs-container">
                    <button class="store-sub-tab-btn active" onclick="window.switchSubStoreTab('store-dama-items', this)">
                        <span data-i18n="store_dama">دامة</span>
                    </button>
                    <button class="store-sub-tab-btn" onclick="window.switchSubStoreTab('store-tawla-items', this)">
                        <span data-i18n="store_tawla">طاولة</span>
                    </button>
                </div>

                <!-- صندوق المحتوى الفعلي (بعد الخط الأحمر) -->
                <div class="store-group-box">
                    
                    <!-- محتوى متجر دامة -->
                    <div id="store-dama-items" class="store-sub-tab-content active-content">
                        <p style="color: var(--text-secondary); font-size: 13px; text-align: center; margin: 10px 0 20px 0;">
                            ملحقات وأزياء خاصة بلعبة الدامة
                        </p>
                        <button class="btn btn-primary" style="width: 100%; margin: 0;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                    </div>

                    <!-- محتوى متجر طاولة -->
                    <div id="store-tawla-items" class="store-sub-tab-content">
                        <p style="color: var(--text-secondary); font-size: 13px; text-align: center; margin: 10px 0 20px 0;">
                            ملحقات وأزياء خاصة بلعبة الطاولة
                        </p>
                        <button class="btn btn-primary" style="width: 100%; margin: 0;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                    </div>

                </div>
            </div>

            <!-- حاوية محتوى الشعبية (مخفية) -->
            <div id="store-popularity-content" class="store-tab-content">
                <div class="store-group-box" style="text-align: center;">
                    <span style="font-size: 50px; display: block; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(255, 69, 58, 0.5));">🔥</span>
                    <h4 style="color: white; font-size: 18px; margin-bottom: 10px;" data-i18n="store_popularity">باقات الشعبية</h4>
                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
                        ادعم أصدقاءك أو تصدر قائمة الأكثر شعبية باقتناء باقات نادرة!
                    </p>
                    <button class="btn btn-primary" style="width: 100%; margin: 0;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                </div>
            </div>

            <!-- حاوية محتوى الشحن (مخفية) -->
            <div id="store-topup-content" class="store-tab-content">
                <div class="store-group-box" style="text-align: center; border-color: rgba(245,166,35,0.4); background: linear-gradient(180deg, rgba(245,166,35,0.05), transparent);">
                    <span style="font-size: 50px; display: block; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(245, 166, 35, 0.5));">💎</span>
                    <h4 style="color: var(--accent); font-size: 18px; margin-bottom: 10px;" data-i18n="store_topup">شحن الرصيد</h4>
                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
                        اشحن رصيدك الآن للمشاركة في البطولات الكبرى والمراهنات الفاخرة.
                    </p>
                    <button class="store-btn premium" style="justify-content: center; width: 100%; margin: 0;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                </div>
            </div>
        `;
        
        // 3. تحديث الترجمات على العناصر الجديدة مباشرة
        if (typeof updateTranslations === 'function') {
            updateTranslations();
        }
    }
});

// 4. دالة التبديل بين التبويبات العلوية الرئيسية
window.switchStoreContentTab = function(contentId, btnElement) {
    document.querySelectorAll('.store-tab-content').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active-content');
    });
    
    document.querySelectorAll('.store-tab-btn').forEach(el => {
        el.classList.remove('active');
    });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        targetContent.style.display = 'block';
        targetContent.classList.add('active-content');
    }
    
    if (btnElement) {
        btnElement.classList.add('active');
    }
};

// 5. دالة التبديل بين التبويبات الفرعية (دامة / طاولة)
window.switchSubStoreTab = function(contentId, btnElement) {
    // تم التعديل هنا ليعمل مع الهيكل الجديد (لأن الأزرار أصبحت خارج الصندوق)
    const parentTab = btnElement.closest('.store-tab-content');
    
    // إخفاء جميع محتويات التبويبات الفرعية
    parentTab.querySelectorAll('.store-sub-tab-content').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active-content');
    });
    
    // إزالة التفعيل عن الأزرار الفرعية
    parentTab.querySelectorAll('.store-sub-tab-btn').forEach(el => {
        el.classList.remove('active');
    });
    
    // إظهار المحتوى المطلوب
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        targetContent.style.display = 'block';
        targetContent.classList.add('active-content');
    }
    
    // تفعيل الزر الذي تم الضغط عليه
    if (btnElement) {
        btnElement.classList.add('active');
    }
};
