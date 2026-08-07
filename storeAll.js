/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً في الواجهة الرئيسية
 * تم ربطه بملف store.js لجلب العناصر داخل تبويب "دامة" وإظهارها فوراً
 */

document.addEventListener('DOMContentLoaded', () => {
    const storeContainer = document.getElementById('nav-section-store');
    
    if (storeContainer) {
        
        // فصل الحاوية لتكون متمركزة في الأعلى (تحت الرصيد والملف الشخصي مباشرة)
        storeContainer.style.position = 'absolute';
        storeContainer.style.top = '0';
        storeContainer.style.left = '0';
        storeContainer.style.width = '100%';
        storeContainer.style.height = '100%';
        storeContainer.style.justifyContent = 'flex-start'; 
        storeContainer.style.paddingTop = '95px'; 
        
        // 1. إضافة ستايلات التبويبات والمحتوى ديناميكياً
        if (!document.getElementById('store-tabs-style')) {
            const style = document.createElement('style');
            style.id = 'store-tabs-style';
            style.innerHTML = `
                /* التبويبات الرئيسية (العلوية) */
                .store-tabs-container {
                    display: flex; gap: 8px; 
                    background: rgba(15, 18, 25, 0.6); padding: 6px;
                    border-radius: 50px; border: 1px solid rgba(255,255,255,0.08);
                    width: 90%; max-width: 350px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                    z-index: 10; margin-bottom: 10px;
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
                .store-tab-content { display: none; width: 90%; max-width: 350px; animation: fadeIn 0.4s ease; }
                .store-tab-content.active-content { display: block; }

                /* التبويبات الفرعية (دامة / طاولة) - أنحف وبدون صور */
                .store-sub-tabs-container {
                    display: flex; gap: 5px; margin-bottom: 15px; 
                    background: rgba(15, 18, 25, 0.5); padding: 4px; 
                    border-radius: 50px; border: 1px solid rgba(255,255,255,0.05);
                    width: 100%; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                }
                .store-sub-tab-btn {
                    flex: 1; background: transparent; border: none; color: var(--text-secondary);
                    padding: 6px 10px; border-radius: 50px; font-weight: 700; font-size: 13px; 
                    cursor: pointer; transition: var(--transition);
                }
                .store-sub-tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                .store-sub-tab-btn.active {
                    background: rgba(255,255,255,0.1); color: white; 
                    border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                .store-sub-tab-content { display: none; animation: fadeIn 0.3s ease; }
                .store-sub-tab-content.active-content { display: block; }

                /* تصنيفات متجر الدامة الداخلية (خلفيات، إطارات، الخ) */
                .dama-cats-container {
                    display: flex; gap: 6px; margin-bottom: 15px; overflow-x: auto; padding-bottom: 5px;
                }
                .dama-cats-container::-webkit-scrollbar { height: 0; display: none; }
                .dama-cat-btn {
                    flex: 1; min-width: 65px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05);
                    color: var(--text-secondary); padding: 8px 10px; border-radius: 12px;
                    font-size: 12px; font-weight: 700; cursor: pointer; transition: var(--transition);
                    white-space: nowrap; text-align: center;
                }
                .dama-cat-btn:hover { background: rgba(255,255,255,0.1); color: white; }
                .dama-cat-btn.active {
                    background: rgba(255,255,255,0.15); color: white; border-color: rgba(255,255,255,0.2);
                }

                /* منطقة التمرير للمنتجات */
                .store-scrollable-area {
                    max-height: 52vh; overflow-y: auto; overflow-x: hidden; padding-right: 5px;
                }
                .store-scrollable-area::-webkit-scrollbar { width: 4px; }
                .store-scrollable-area::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
                .store-scrollable-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
                
                /* شبكة المنتجات (تنسيقات العناصر التي يبنيها store.js) */
                .store-items-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
                .store-item-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; padding: 10px 5px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
                .store-buy-btn-small { height: 32px; font-size: 12px; border-radius: 10px; width: 90%; background: rgba(255,255,255,0.1); color: white; border: none; cursor: pointer; transition: 0.2s;}
                .store-buy-btn-small:hover { background: rgba(255,255,255,0.2); }
            `;
            document.head.appendChild(style);
        }

        // 2. بناء هيكل المتجر بالكامل
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

                <!-- صندوق المحتوى الفعلي للألعاب -->
                <div class="store-group-box" style="padding: 15px 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-card);">
                    
                    <!-- 💡 محتوى متجر دامة (يتم تعبئته بواسطة store.js) -->
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
                <div class="store-group-box" style="text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-card); padding: 15px;">
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
                <div class="store-group-box" style="text-align: center; border-color: rgba(245,166,35,0.4); background: linear-gradient(180deg, rgba(245,166,35,0.05), transparent); border-radius: var(--radius-card); padding: 15px;">
                    <span style="font-size: 50px; display: block; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(245, 166, 35, 0.5));">💎</span>
                    <h4 style="color: var(--accent); font-size: 18px; margin-bottom: 10px;" data-i18n="store_topup">شحن الرصيد</h4>
                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
                        اشحن رصيدك الآن للمشاركة في البطولات الكبرى والمراهنات الفاخرة.
                    </p>
                    <button class="store-btn premium" style="justify-content: center; width: 100%; margin: 0; background: linear-gradient(135deg, rgba(245,166,35,0.2), rgba(211,84,0,0.2)); border: 1px solid rgba(245,166,35,0.4); color: #f5a623; border-radius: 16px; padding: 15px; font-weight: 600;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                </div>
            </div>
        `;
        
        // 3. تحديث الترجمات على العناصر الجديدة مباشرة
        if (typeof updateTranslations === 'function') {
            updateTranslations();
        }

        // 4. إجبار السكربت على ضخ المنتجات وفتح تبويب الخلفيات افتراضياً بعد بناء العناصر
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
        targetContent.style.display = 'block'; targetContent.classList.add('active-content');
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
