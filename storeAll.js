/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً
 * التحديث: تحويل أزرار دامة وطاولة لتصبح شريطاً جانبياً (Side Tabs) بجوار المنتجات
 */

document.addEventListener('DOMContentLoaded', () => {
    const storeContainer = document.getElementById('nav-section-store');
    
    if (storeContainer) {
        
        // ضبط الحاوية الأساسية للمتجر لتبدأ من تحت الرصيد
        storeContainer.style.position = 'absolute';
        storeContainer.style.top = '0';
        storeContainer.style.left = '0';
        storeContainer.style.width = '100%';
        storeContainer.style.height = '100%';
        storeContainer.style.justifyContent = 'flex-start'; 
        storeContainer.style.paddingTop = '95px'; 
        
        // 1. حقن ستايلات المتجر
        if (!document.getElementById('store-tabs-style')) {
            const style = document.createElement('style');
            style.id = 'store-tabs-style';
            style.innerHTML = `
                /* التبويبات العلوية الرئيسية */
                .store-tabs-container {
                    display: flex; gap: 8px; 
                    background: rgba(15, 18, 25, 0.6); padding: 6px;
                    border-radius: 50px; border: 1px solid rgba(255,255,255,0.08);
                    width: 95%; max-width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                    z-index: 10; margin-bottom: 10px; margin-left: auto; margin-right: auto;
                }
                .store-tab-btn {
                    flex: 1; background: transparent; border: none; color: var(--text-secondary);
                    padding: 10px 5px; border-radius: 50px; font-weight: 700; font-size: 13px;
                    cursor: pointer; transition: var(--transition); white-space: nowrap;
                    display: flex; align-items: center; justify-content: center; gap: 5px;
                }
                .store-tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                .store-tab-btn.active { background: rgba(255,255,255,0.15); color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
                .store-tab-btn.premium-tab.active { background: linear-gradient(135deg, rgba(245,166,35,0.3), rgba(211,84,0,0.3)); color: var(--accent); border: 1px solid rgba(245,166,35,0.4); }
                
                /* حاوية المحتوى الرئيسية - معدلة لتناسب التصميم الجانبي */
                .store-tab-content { 
                    display: none; width: 95%; max-width: 400px; margin: 0 auto;
                    height: calc(100dvh - 180px); /* ارتفاع ثابت يحمي المنتجات من الشريط السفلي */
                    animation: fadeIn 0.4s ease; 
                }
                .store-tab-content.active-content { display: flex; flex-direction: row; gap: 8px; }

                /* 🌟 الأزرار الجانبية (دامة وطاولة) - التصميم الجديد 🌟 */
                .store-side-tabs {
                    display: flex; flex-direction: column; gap: 10px;
                    width: 60px; /* عرض ثابت للشريط الجانبي */
                    flex-shrink: 0;
                }
                .store-side-tab-btn {
                    background: rgba(15, 18, 25, 0.6);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    color: var(--text-secondary);
                    font-weight: 700; font-size: 13px;
                    height: 80px; /* زر طولي احترافي */
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.3s;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }
                .store-side-tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                .store-side-tab-btn.active {
                    background: rgba(10, 12, 16, 0.95); /* نفس لون الصندوق المظلم ليبدو متصلاً به */
                    color: white; 
                    border: 1px solid rgba(255,255,255,0.2); 
                    box-shadow: 0 0 15px rgba(255,255,255,0.1);
                }

                /* محتوى التبويب الجانبي */
                .store-sub-tab-content { display: none; height: 100%; animation: fadeIn 0.3s ease; }
                .store-sub-tab-content.active-content { display: flex; flex-direction: column; width: 100%; }

                /* 🌟 الصندوق المظلم الثابت (الآن يملأ المساحة المتبقية بجوار الأزرار) */
                .store-group-box-dark {
                    flex: 1; /* يأخذ المساحة المتبقية بجانب الأزرار */
                    padding: 12px 8px 5px 8px !important;
                    background: rgba(10, 12, 16, 0.95) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 24px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    height: 100% !important; /* يأخذ ارتفاع الحاوية الأب */
                    overflow: hidden !important;
                }

                /* تصنيفات المتجر الداخلية (خلفيات، إطارات..) */
                .dama-cats-container { display: flex; gap: 6px; margin-bottom: 5px; overflow-x: auto; padding-bottom: 5px; flex-shrink: 0; }
                .dama-cats-container::-webkit-scrollbar { height: 0; display: none; }
                .dama-cat-btn {
                    flex: 1; min-width: 60px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05);
                    color: var(--text-secondary); padding: 8px 5px; border-radius: 12px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; text-align: center;
                }
                .dama-cat-btn.active { background: rgba(255,255,255,0.15); color: white; border-color: rgba(255,255,255,0.2); }

                /* 🌟 منطقة التمرير للمنتجات */
                .store-scrollable-area {
                    flex: 1 !important;
                    overflow-y: auto !important; 
                    overflow-x: hidden !important; 
                    padding-right: 5px !important;
                    padding-top: 5px !important;
                    padding-bottom: 60px !important; /* مساحة لعدم القص */
                }
                .store-scrollable-area::-webkit-scrollbar { width: 4px; }
                .store-scrollable-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
                
                /* شبكة الكروت (تم تصغير الجاب والبادينج لتناسب العرض الجديد) */
                .store-items-grid { 
                    display: grid !important; 
                    grid-template-columns: repeat(3, 1fr) !important; 
                    gap: 6px !important; 
                    width: 100% !important;
                }
                .store-item-card { 
                    background: rgba(25, 30, 35, 0.98) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important; 
                    border-radius: 16px !important; 
                    padding: 8px 4px !important; /* حشوة أصغر */
                    display: flex !important; flex-direction: column !important; align-items: center !important; gap: 6px !important; 
                    text-align: center !important;
                }
                .store-buy-btn-small { 
                    height: 30px !important; font-size: 11px !important; border-radius: 10px !important; width: 90% !important; 
                    background: rgba(255,255,255,0.1) !important; color: white !important; border: none !important; cursor: pointer !important;
                }
            `;
            document.head.appendChild(style);
        }

        // 2. بناء هيكل المتجر بالكامل (HTML)
        storeContainer.innerHTML = `
            <!-- التبويبات العلوية الرئيسية -->
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

            <!-- حاوية محتوى الألعاب (تصميم جانبي جديد) -->
            <div id="store-games-content" class="store-tab-content active-content">
                
                <!-- الأزرار الجانبية العمودية (دامة وطاولة) -->
                <div class="store-side-tabs">
                    <button class="store-side-tab-btn active" onclick="window.switchSubStoreTab('store-dama-items', this)">
                        <span data-i18n="store_dama">دامة</span>
                    </button>
                    <button class="store-side-tab-btn" onclick="window.switchSubStoreTab('store-tawla-items', this)">
                        <span data-i18n="store_tawla">طاولة</span>
                    </button>
                </div>

                <!-- الصندوق الداكن الفعلي للألعاب (بجانب الأزرار) -->
                <div class="store-group-box-dark">
                    
                    <!-- محتوى متجر دامة -->
                    <div id="store-dama-items" class="store-sub-tab-content active-content">
                        <!-- تصنيفات الدامة -->
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
            <div id="store-popularity-content" class="store-tab-content" style="display: none;">
                <div class="store-group-box-dark" style="width: 100%; text-align: center; justify-content: center;">
                    <span style="font-size: 50px; display: block; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(255, 69, 58, 0.5));">🔥</span>
                    <h4 style="color: white; font-size: 18px; margin-bottom: 10px;" data-i18n="store_popularity">باقات الشعبية</h4>
                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
                        ادعم أصدقاءك أو تصدر قائمة الأكثر شعبية باقتناء باقات نادرة!
                    </p>
                    <button class="btn btn-primary" style="width: 100%; margin: 0;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                </div>
            </div>

            <!-- حاوية محتوى الشحن -->
            <div id="store-topup-content" class="store-tab-content" style="display: none;">
                <div class="store-group-box-dark" style="width: 100%; text-align: center; justify-content: center; border-color: rgba(245,166,35,0.4) !important; background: linear-gradient(180deg, rgba(245,166,35,0.1), rgba(10,12,16,0.95)) !important;">
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

// دوال التنقل
window.switchStoreContentTab = function(contentId, btnElement) {
    document.querySelectorAll('.store-tab-content').forEach(el => {
        el.style.display = 'none'; el.classList.remove('active-content');
    });
    document.querySelectorAll('.store-tab-btn').forEach(el => { el.classList.remove('active'); });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        // إذا كان التبويب هو "الألعاب"، يجب عرضة كـ flex row ليظهر الشريط الجانبي بجوار الصندوق
        targetContent.style.display = (contentId === 'store-games-content') ? 'flex' : 'block'; 
        targetContent.classList.add('active-content');
    }
    if (btnElement) btnElement.classList.add('active');
};

window.switchSubStoreTab = function(contentId, btnElement) {
    const parentTab = btnElement.closest('.store-tab-content');
    parentTab.querySelectorAll('.store-sub-tab-content').forEach(el => {
        el.style.display = 'none'; el.classList.remove('active-content');
    });
    parentTab.querySelectorAll('.store-side-tab-btn').forEach(el => { el.classList.remove('active'); });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        targetContent.style.display = 'flex'; targetContent.classList.add('active-content');
    }
    if (btnElement) btnElement.classList.add('active');
};

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
