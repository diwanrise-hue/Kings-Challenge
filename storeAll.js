/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً
 * 🌟 التحديث النهائي: معالجة الزوايا المشطوفة، دمج منتجات الشعبية، وتطبيق نظام اختصار الأرقام (K, M).
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
                /* 🌟 حاوية الأقسام السفلية */
                /* ======================================================== */
                .store-tab-content { 
                    display: none !important; 
                    width: 95%; max-width: 450px; 
                    height: calc(100dvh - 235px) !important; 
                    margin-bottom: 10px !important; 
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
                    margin-top: 0 !important; 
                    margin-left: -1px !important; 
                    position: relative;
                    z-index: 5; 
                }
                .store-side-tab-btn {
                    background: rgba(15, 20, 24, 0.8) !important; 
                    border: 1px solid #4a3e1c !important; 
                    border-left: 1px solid transparent !important; 
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
                    border-left: 1px solid #0b120d !important; 
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
                    height: 100%; 
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
                
                /* 🌟 حاوية القسم الواحد */
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
            <!-- التبويبات العلوية الرئيسية للمتجر -->
            <div class="store-tabs-container">
                <button class="store-tab-btn" onclick="window.switchStoreContentTab('store-topup-content', this)">
                    <span data-i18n="store_topup">شحن</span>
                </button>
                <button class="store-tab-btn" onclick="window.switchStoreContentTab('store-popularity-content', this)">
                    <span>شعبية</span> <span style="font-size: 15px; filter: hue-rotate(210deg) drop-shadow(0 0 3px rgba(0,210,255,0.6)); margin-right: 5px;">🔥</span>
                </button>
                <button class="store-tab-btn active" onclick="window.switchStoreContentTab('store-games-content', this)">
                    <span data-i18n="store_games">الألعاب</span> 
                    <span style="width: 16px; height: 16px; display: inline-block; margin-right: 4px;">
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;">
                            <defs>
                                <linearGradient id="gameBlueStore" x1="8" y1="8" x2="56" y2="56"><stop offset="0%" stop-color="#66F2FF"/><stop offset="35%" stop-color="#19B9FF"/><stop offset="70%" stop-color="#536EFF"/><stop offset="100%" stop-color="#743BFF"/></linearGradient>
                                <radialGradient id="gameGlowStore"><stop offset="0%" stop-color="#35DFFF" stop-opacity=".3"/><stop offset="100%" stop-color="#2764FF" stop-opacity="0"/></radialGradient>
                                <filter id="gameShadowStore" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#1667FF" flood-opacity=".35"/></filter>
                            </defs>
                            <ellipse cx="32" cy="32" rx="30" ry="26" fill="url(#gameGlowStore)"/>
                            <path d="M17 17 C21 14 26.5 12.8 32 12.8 C37.5 12.8 43 14 47 17 C51.5 20.2 55.2 30.8 56.7 38.3 C58 44.5 53.2 48.9 48.7 45.7 L41 40H23L15.3 45.7 C10.8 48.9 6 44.5 7.3 38.3 C8.8 30.8 12.5 20.2 17 17Z" fill="url(#gameBlueStore)" stroke="#9AF4FF" stroke-width="1.7" stroke-linejoin="round" filter="url(#gameShadowStore)"/>
                            <path d="M18 18 C22 15.5 27 14.5 32 14.5 C37 14.5 42 15.5 46 18" stroke="#D9FBFF" stroke-width="2.5" stroke-linecap="round" opacity=".65"/>
                            <path d="M14 27H20V21H26V27H32V33H26V39H20V33H14Z" fill="#F0FDFF"/>
                            <circle cx="42" cy="27" r="3.5" fill="#FF527E"/><circle cx="42" cy="27" r="1.3" fill="#FFD3DE"/>
                            <circle cx="49" cy="34" r="3.5" fill="#FFD449"/><circle cx="49" cy="34" r="1.3" fill="#FFF3B0"/>
                        </svg>
                    </span>
                </button>
            </div>

            <!-- حاوية الألعاب -->
            <div id="store-games-content" class="store-tab-content active-content">
                
                <!-- الشريط الجانبي الأيمن -->
                <div class="store-side-tabs">
                    <button class="store-side-tab-btn active" onclick="window.switchSubStoreTab('store-dama-items', this)">
                        <span class="emoji-icon">👑</span>
                        <span data-i18n="store_dama">دامة</span>
                    </button>
                    <button class="store-side-tab-btn" onclick="window.switchSubStoreTab('store-tawla-items', this)">
                        <span class="emoji-icon">🎲</span>
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
                <div class="store-group-box-dark" style="width: 100%; border-radius: 18px !important; padding: 12px; display: flex; flex-direction: column;">
                    
                    <!-- ترويسة بسيطة لقسم الشعبية -->
                    <div style="text-align: center; margin-bottom: 12px; flex-shrink: 0;">
                        <span style="font-size: 20px; filter: hue-rotate(210deg) drop-shadow(0 0 5px rgba(0, 210, 255, 0.5));">🔥</span>
                        <span style="color: white; font-size: 15px; font-weight: bold; margin-right: 5px;">هدايا شعبية</span>
                    </div>
                    
                    <!-- منطقة التمرير للمنتجات -->
                    <div class="store-scrollable-area" style="padding-top: 0; flex: 1;">
                        <div id="store-popularity-grid" class="store-items-grid">
                            <!-- سيتم حقن المنتجات هنا عبر الجافاسكربت -->
                        </div>
                    </div>

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
            
            if (typeof window.renderPopularityItems === 'function') {
                window.renderPopularityItems();
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

// ==========================================
// 🌟 دالة مساعدة لاختصار الأرقام (تأمين إضافي) 🌟
// ==========================================
function localFormatCompactNumber(num) {
    if (typeof window.formatCompactNumber === 'function') {
        return window.formatCompactNumber(num);
    }
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num;
}

// ==========================================
// دوال عرض منتجات الشعبية
// ==========================================
window.renderPopularityItems = function() {
    const grid = document.getElementById('store-popularity-grid');
    if (!grid) return;
    
    grid.innerHTML = ''; 
    
    if (window.POPULARITY_ITEMS && window.POPULARITY_ITEMS.length > 0) {
        window.POPULARITY_ITEMS.forEach(item => {
            const card = document.createElement('div');
            card.className = 'store-item-card';
            
            // تم استخدام دالة localFormatCompactNumber لضغط الأرقام الكبيرة
            card.innerHTML = `
                <div style="height: 60px; width: 100%; display: flex; align-items: center; justify-content: center; margin-bottom: 5px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <img src="${item.imagePath}" alt="${item.nameAr}" style="max-width: 80%; max-height: 80%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">
                </div>
                <span style="color: #fff; font-size: 11px; font-weight: bold; margin-bottom: 2px; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.nameAr}</span>
                
                <div style="color: #00d2ff; font-size: 10px; font-weight: bold; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 3px;">
                    +${localFormatCompactNumber(item.popValue)} <span style="font-size: 12px; filter: hue-rotate(210deg) drop-shadow(0 0 2px rgba(0, 210, 255, 0.6));">🔥</span>
                </div>

                <button class="store-buy-btn-small" onclick="buyPopularityItem('${item.id}')">
                    ${localFormatCompactNumber(item.price)} <span style="color: gold; font-size: 10px;">🪙</span>
                </button>
            `;
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: span 3; margin-top: 20px;">جاري تحميل الهدايا...</p>';
    }
};

// ==========================================
// 🌟 دوال التنبيهات والشراء والتفعيل 
// ==========================================
window.triggerAlertSoon = function() {
    if (window.socketManager && typeof window.socketManager._showToast === 'function') {
        window.socketManager._showToast("⏳ هذه الميزة ستتوفر قريباً!");
    } else {
        alert("قريباً!");
    }
};

window.buyPopularityItem = function(itemId) {
    const item = window.POPULARITY_ITEMS.find(i => i.id === itemId);
    if(item) {
        if (typeof window.openPurchaseModal === 'function') {
            window.openPurchaseModal(item.id, item.nameAr, item.price, 'popularity');
        } else if (window.socketManager && typeof window.socketManager._showToast === 'function') {
            window.socketManager._showToast(`تم طلب شراء ${item.nameAr} بـ ${item.price} 🪙`);
        }
    }
};
