/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً
 * 🌟 التحديث النهائي: ضبط الارتفاع بدقة لرفع الصندوق الأسود فوق الشريط السفلي
 */

document.addEventListener('DOMContentLoaded', () => {
    const storeContainer = document.getElementById('nav-section-store');
    
    if (storeContainer) {
        
        // 🌟 ضبط الحاوية الأساسية 
        storeContainer.style.width = '100%';
        storeContainer.style.height = '100%';
        storeContainer.style.flexDirection = 'column';
        storeContainer.style.alignItems = 'center';
        storeContainer.style.paddingTop = '65px'; 
        storeContainer.style.boxSizing = 'border-box'; 
        
        // 1. حقن الستايلات 
        if (!document.getElementById('store-tabs-style')) {
            const style = document.createElement('style');
            style.id = 'store-tabs-style';
            style.innerHTML = `
                /* 🌟 التبويبات العلوية الرئيسية */
                .store-tabs-container {
                    display: flex; gap: 0; 
                    background: #060907 !important; 
                    padding: 4px !important; 
                    border-radius: 40px !important; 
                    border: 1px solid #b38d36 !important; 
                    width: 95%; max-width: 450px; 
                    box-shadow: 0 5px 15px rgba(0,0,0,0.6) !important;
                    z-index: 10; 
                    margin-bottom: 6px !important; 
                    direction: ltr; 
                }
                .store-tab-btn {
                    flex: 1; background: transparent; color: var(--text-secondary);
                    padding: 6px 5px !important; 
                    border-radius: 40px !important; 
                    font-weight: 700; font-size: 12px !important;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 5px !important;
                    border: 1px solid transparent !important; 
                    position: relative;
                }
                
                /* 🌟 خط فاصل ذهبي قصير */
                .store-tab-btn:not(:first-child)::before {
                    content: '';
                    position: absolute;
                    left: -2.5px;
                    top: 15%; 
                    height: 70%; 
                    width: 1px;
                    background-color: #b38d36;
                    opacity: 0.6;
                    pointer-events: none;
                }
                
                /* إخفاء الخط الفاصل بجانب الزر المفعل */
                .store-tab-btn.active::before { display: none !important; }
                .store-tab-btn.active + .store-tab-btn::before { display: none !important; }

                /* 🌟 الزر المفعل */
                .store-tab-btn.active { 
                    background: linear-gradient(to bottom, #1b5e20 0%, #08210b 100%) !important; 
                    color: white !important; 
                    border: 1px solid #ffd700 !important; 
                    box-shadow: 
                        inset 0 2px 1px rgba(255, 255, 255, 0.5), 
                        inset 0 -4px 10px rgba(0, 0, 0, 0.9),     
                        0 4px 10px rgba(0, 0, 0, 0.8),            
                        0 0 8px rgba(255, 215, 0, 0.2) !important; 
                    border-radius: 40px !important;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                    z-index: 5;
                }

                /* ======================================================== */
                /* 🌟 حاوية الأقسام السفلية (تم التعديل هنا لرفع الصندوق) 🌟 */
                /* ======================================================== */
                .store-tab-content { 
                    display: none !important; 
                    width: 95%; max-width: 450px; 
                    /* 🌟 حساب دقيق: تم الخصم أكثر (235px) لضمان ظهوره فوق الشريط السفلي تماماً 🌟 */
                    height: calc(100dvh - 235px) !important; 
                    margin-bottom: 10px !important; /* مساحة أمان من الأسفل */
                    direction: rtl;
                }
                #store-games-content.active-content { display: flex !important; flex-direction: row !important; gap: 0 !important; align-items: flex-start; }
                #store-popularity-content.active-content { display: block !important; }
                #store-topup-content.active-content { display: block !important; }

                /* ======================================================== */
                /* 🌟 الشريط الجانبي الأيمن 🌟 */
                /* ======================================================== */
                .store-side-tabs {
                    display: flex; flex-direction: column; gap: 6px; 
                    width: 50px; 
                    flex-shrink: 0;
                    margin-top: 0px !important; 
                    margin-left: -2px !important; 
                    position: relative;
                    z-index: 5; 
                }
                .store-side-tab-btn {
                    background: rgba(15, 20, 24, 0.8) !important; 
                    border: 1px solid #4a3e1c !important; 
                    border-left: 2px solid transparent !important; 
                    border-radius: 0 8px 8px 0 !important; 
                    color: var(--text-secondary);
                    font-weight: 700; font-size: 11px !important; 
                    height: 95px !important; 
                    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px !important;
                    cursor: pointer;
                    position: relative; 
                }
                .store-side-tab-btn span.emoji-icon { 
                    font-size: 24px !important; 
                    filter: grayscale(100%) opacity(0.7); margin-bottom: 0 !important; 
                }
                
                /* 🌟 الزر الجانبي المفعل */
                .store-side-tab-btn.active {
                    background: #0b120d !important; 
                    color: #fff !important; 
                    border: 1px solid #b38d36 !important; 
                    border-left: 2px solid #0b120d !important; 
                    box-shadow: 4px 0 10px rgba(0,0,0,0.3) !important;
                    z-index: 5;
                }

                /* 🌟 الإطار الداخلي الصلب */
                .store-side-tab-btn::before {
                    content: '';
                    position: absolute;
                    top: 6px; bottom: 6px; left: 4px; right: 6px; 
                    background: linear-gradient(to bottom, #1b5e20 0%, #08210b 100%) !important; 
                    border: 1px solid #ffd700 !important; 
                    border-radius: 8px !important;
                    box-shadow: 
                        inset 0 2px 1px rgba(255, 255, 255, 0.5), 
                        inset 0 -4px 10px rgba(0, 0, 0, 0.9), 
                        0 0 8px rgba(255, 215, 0, 0.2) !important;
                    z-index: 0;
                    pointer-events: none;
                    display: none; 
                }

                .store-side-tab-btn.active::before {
                    display: block; 
                }

                .store-side-tab-btn.active span {
                    position: relative;
                    z-index: 2;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                }
                .store-side-tab-btn.active span.emoji-icon { filter: grayscale(0%) opacity(1) drop-shadow(0 0 5px rgba(255,215,0,0.6)); }

                /* ======================================================== */
                /* 🌟 الصندوق الأيسر الكبير 🌟 */
                /* ======================================================== */
                .store-group-box-dark {
                    flex: 1; 
                    margin-top: 0 !important; 
                    padding: 12px 6px; 
                    background: #0b120d !important; 
                    border: 1px solid #b38d36 !important; 
                    border-radius: 18px 0 18px 18px !important; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.9) !important;
                    display: flex; flex-direction: column; 
                    height: 100%; /* يعتمد على ارتفاع الحاوية الأب المضبوطة */
                    overflow: hidden;
                    z-index: 1; 
                }

                .store-sub-tab-content { display: none !important; height: 100%; flex-direction: column; }
                .store-sub-tab-content.active-content { display: flex !important; }

                /* 🌟 شريط تصنيفات الدامة الداخلي */
                .dama-cats-container { 
                    display: flex; gap: 4px; margin-bottom: 10px; overflow-x: auto; padding-bottom: 4px; flex-shrink: 0; 
                    direction: rtl; 
                    background: transparent !important;
                }
                .dama-cats-container::-webkit-scrollbar { height: 0; display: none; }
                .dama-cat-btn {
                    flex: 1; min-width: max-content !important; 
                    background: transparent !important; border: 1px solid rgba(255,255,255,0.08) !important;
                    color: var(--text-secondary); 
                    padding: 5px 10px !important; 
                    border-radius: 15px !important; 
                    font-size: 11px !important; 
                    font-weight: 700; 
                    cursor: pointer; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 3px !important;
                    position: relative;
                }
                .dama-cat-btn span.cat-icon { font-size: 12px !important; filter: grayscale(100%); margin-left: 3px !important; } 
                
                .dama-cat-btn.active { 
                    background: linear-gradient(to bottom, #1b5e20 0%, #08210b 100%) !important; 
                    color: white !important; 
                    border: 1px solid #ffd700 !important; 
                    box-shadow: 
                        inset 0 2px 1px rgba(255, 255, 255, 0.5), 
                        inset 0 -4px 10px rgba(0, 0, 0, 0.9),     
                        0 4px 10px rgba(0, 0, 0, 0.8),            
                        0 0 8px rgba(255, 215, 0, 0.2) !important;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                    z-index: 5;
                }
                .dama-cat-btn.active span.cat-icon { filter: grayscale(0%); }

                /* 🌟 منطقة التمرير للمنتجات */
                .store-scrollable-area {
                    flex: 1; overflow-y: auto; overflow-x: hidden; 
                    padding-right: 2px; padding-top: 5px; 
                    padding-bottom: 15px; 
                }
                .store-scrollable-area::-webkit-scrollbar { width: 3px; }
                .store-scrollable-area::-webkit-scrollbar-thumb { background: rgba(179, 141, 54, 0.5); border-radius: 10px; }
                
                /* 🌟 حاوية القسم الواحد (صندوق المنتجات المحتفظ بالإطار الداخلي بدون نصوص) 🌟 */
                .category-section-container {
                    display: none; 
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.02); 
                    border: 1px solid rgba(179, 141, 54, 0.3); 
                    border-radius: 12px;
                    padding: 6px; 
                    margin-bottom: 10px;
                }

                .store-items-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 6px !important; width: 100% !important; }
                
                .store-item-card { 
                    background: #080d09 !important; 
                    border: 1px solid rgba(166, 131, 49, 0.4) !important; 
                    border-radius: 10px !important; 
                    padding: 8px 4px !important; 
                    display: flex !important; flex-direction: column !important; align-items: center !important; gap: 5px !important; 
                    text-align: center !important; position: relative;
                    box-shadow: inset 0 0 6px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.4) !important; 
                }
                
                .store-buy-btn-small { 
                    height: 26px !important; font-size: 11px !important; font-weight: bold !important; 
                    border-radius: 15px !important; width: 95% !important; 
                    background: #104a1b !important; 
                    color: white !important; border: 1px solid #1c7a2b !important; cursor: pointer !important; transition: 0.2s;
                    margin-bottom: 2px !important;
                }
                .store-buy-btn-small:hover { background: #166324 !important; }
            `;
            document.head.appendChild(style);
        }

        // 2. بناء هيكل المتجر بالكامل (HTML) 
        storeContainer.innerHTML = `
            <!-- التبويبات العلوية الرئيسية -->
            <div class="store-tabs-container">
                <button class="store-tab-btn" onclick="window.switchStoreContentTab('store-topup-content', this)">
                    <span data-i18n="store_topup">شحن</span> <span>💎</span>
                </button>
                <button class="store-tab-btn" onclick="window.switchStoreContentTab('store-popularity-content', this)">
                    <span data-i18n="store_popularity">الشعبية</span> <span>🔥</span>
                </button>
                <button class="store-tab-btn active" onclick="window.switchStoreContentTab('store-games-content', this)">
                    <span data-i18n="store_games">الألعاب</span> <span>🎮</span>
                </button>
            </div>

            <!-- حاوية الألعاب (الشريط يمين والصندوق يسار) -->
            <div id="store-games-content" class="store-tab-content active-content">
                
                <!-- الشريط الجانبي الأيمن -->
                <div class="store-side-tabs">
                    <button class="store-side-tab-btn active" onclick="window.switchSubStoreTab('store-dama-items', this)">
                        <span class="emoji-icon">👑</span>
                        <span data-i18n="store_dama">دامة</span>
                    </button>
                    <button class="store-side-tab-btn" onclick="window.switchSubStoreTab('store-tawla-items', this)">
                        <span class="emoji-icon">🛍️</span>
                        <span data-i18n="store_tawla">طاولة</span>
                    </button>
                </div>

                <!-- الصندوق الأيسر للمنتجات -->
                <div class="store-group-box-dark">
                    
                    <!-- محتوى متجر دامة -->
                    <div id="store-dama-items" class="store-sub-tab-content active-content">
                        <!-- تصنيفات الدامة -->
                        <div class="dama-cats-container">
                            <button id="store-btn-tab-bg" class="dama-cat-btn active" onclick="window.switchStoreTabCategory('bg', this)">
                                خلفيات <span class="cat-icon">🎨</span>
                            </button>
                            <button id="store-btn-tab-frames" class="dama-cat-btn" onclick="window.switchStoreTabCategory('frames', this)">
                                إطارات <span class="cat-icon">🖼️</span>
                            </button>
                            <button id="store-btn-tab-pieces" class="dama-cat-btn" onclick="window.switchStoreTabCategory('pieces', this)">
                                أحجار <span class="cat-icon">💎</span>
                            </button>
                            <button id="store-btn-tab-offers" class="dama-cat-btn" onclick="window.switchStoreTabCategory('offers', this)">
                                عروضات <span class="cat-icon">🏷️</span>
                            </button>
                        </div>

                        <!-- منطقة التمرير للمنتجات -->
                        <div class="store-scrollable-area">
                            <!-- 🌟 حاويات الأقسام 🌟 -->
                            <div id="store-section-bg-container" class="category-section-container">
                                <div id="store-section-bg" class="store-items-grid"></div>
                            </div>
                            
                            <div id="store-section-frames-container" class="category-section-container" style="display: none;">
                                <div id="store-section-frames" class="store-items-grid"></div>
                            </div>
                            
                            <div id="store-section-pieces-container" class="category-section-container" style="display: none;">
                                <div id="store-section-pieces" class="store-items-grid"></div>
                            </div>
                            
                            <div id="store-section-offers-container" class="category-section-container" style="display: none;">
                                <div id="store-section-offers" class="store-items-grid"></div>
                            </div>
                        </div>
                    </div>

                    <!-- محتوى متجر طاولة -->
                    <div id="store-tawla-items" class="store-sub-tab-content">
                        <span style="font-size: 50px; display: block; text-align: center; margin-top: 50px; margin-bottom: 10px;">🎲</span>
                        <p style="color: var(--text-secondary); font-size: 15px; text-align: center; margin: 10px 0 20px 0;">
                            ملحقات وأزياء خاصة بلعبة الطاولة
                        </p>
                        <button class="store-buy-btn-small" style="width: 70%; margin: 0 auto; height: 35px !important; font-size: 14px !important;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                    </div>

                </div>

            </div>

            <!-- حاوية محتوى الشعبية -->
            <div id="store-popularity-content" class="store-tab-content">
                <div class="store-group-box-dark" style="width: 100%; text-align: center; align-items: center; justify-content: center;">
                    <span style="font-size: 60px; display: block; margin-bottom: 15px; filter: drop-shadow(0 0 10px rgba(255, 69, 58, 0.5));">🔥</span>
                    <h4 style="color: white; font-size: 20px; margin-bottom: 10px;" data-i18n="store_popularity">باقات الشعبية</h4>
                    <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 25px; max-width: 80%;">
                        ادعم أصدقاءك أو تصدر قائمة الأكثر شعبية باقتناء باقات نادرة!
                    </p>
                    <button class="store-buy-btn-small" style="width: 80%; height: 40px !important; font-size: 14px !important;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                </div>
            </div>

            <!-- حاوية محتوى الشحن -->
            <div id="store-topup-content" class="store-tab-content">
                <div class="store-group-box-dark" style="width: 100%; text-align: center; align-items: center; justify-content: center; border-color: rgba(245,166,35,0.4) !important; background: linear-gradient(180deg, rgba(245,166,35,0.1), rgba(10,12,16,0.95)) !important;">
                    <span style="font-size: 60px; display: block; margin-bottom: 15px; filter: drop-shadow(0 0 15px rgba(245, 166, 35, 0.5));">💎</span>
                    <h4 style="color: var(--accent); font-size: 20px; margin-bottom: 10px;" data-i18n="store_topup">شحن الرصيد</h4>
                    <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 25px; max-width: 80%;">
                        اشحن رصيدك الآن للمشاركة في البطولات الكبرى والمراهنات الفاخرة.
                    </p>
                    <button class="store-buy-btn-small" style="background: linear-gradient(135deg, rgba(245,166,35,0.2), rgba(211,84,0,0.2)) !important; border: 1px solid rgba(245,166,35,0.4) !important; color: #f5a623 !important; width: 80%; height: 40px !important; font-size: 14px !important;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
                </div>
            </div>
        `;
        
        // 3. تحديث الترجمات
        if (typeof updateTranslations === 'function') {
            updateTranslations();
        }

        // 4. إجبار السكربت على ضخ المنتجات
        setTimeout(() => {
            if (window.storeManager && typeof window.storeManager.renderUI === 'function') {
                window.storeManager.renderUI();
            }
            if (typeof window.switchStoreTabCategory === 'function') {
                const firstBtn = document.getElementById('store-btn-tab-bg');
                window.switchStoreTabCategory('bg', firstBtn); 
            }
        }, 300);
    }
});

// ==========================================
// دوال التنقل
// ==========================================
window.switchStoreContentTab = function(contentId, btnElement) {
    document.querySelectorAll('.store-tab-content').forEach(el => { el.classList.remove('active-content'); });
    document.querySelectorAll('.store-tab-btn').forEach(el => { el.classList.remove('active'); });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) { targetContent.classList.add('active-content'); }
    if (btnElement) btnElement.classList.add('active');
};

window.switchSubStoreTab = function(contentId, btnElement) {
    const parentTab = btnElement.closest('.store-tab-content');
    parentTab.querySelectorAll('.store-sub-tab-content').forEach(el => { el.classList.remove('active-content'); });
    parentTab.querySelectorAll('.store-side-tab-btn').forEach(el => { el.classList.remove('active'); });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) { targetContent.classList.add('active-content'); }
    if (btnElement) btnElement.classList.add('active');
};

window.switchStoreTabCategory = function(category, btnElement) {
    const tabs = ['bg', 'frames', 'pieces', 'offers'];
    
    tabs.forEach(tab => { 
        const secContainer = document.getElementById('store-section-' + tab + '-container'); 
        const btn = document.getElementById('store-btn-tab-' + tab);
        if(secContainer) secContainer.style.display = 'none'; 
        if(btn) btn.classList.remove('active');
    });
    
    const activeSecContainer = document.getElementById('store-section-' + category + '-container');
    if(activeSecContainer) activeSecContainer.style.setProperty('display', 'flex', 'important'); 
    
    if(btnElement) {
        btnElement.classList.add('active');
    } else {
        const fallbackBtn = document.getElementById('store-btn-tab-' + category);
        if(fallbackBtn) fallbackBtn.classList.add('active');
    }
};
