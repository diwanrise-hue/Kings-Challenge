/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً
 * 🌟 التحديث: سحب الأزرار الجانبية للأعلى بقوة باستخدام (margin-top سالب) لتتطابق تماماً
 */

document.addEventListener('DOMContentLoaded', () => {
    const storeContainer = document.getElementById('nav-section-store');
    
    if (storeContainer) {
        
        // ضبط الحاوية الأساسية
        storeContainer.style.position = 'absolute';
        storeContainer.style.top = '0';
        storeContainer.style.left = '0';
        storeContainer.style.width = '100%';
        storeContainer.style.height = '100%';
        storeContainer.style.display = 'flex';
        storeContainer.style.flexDirection = 'column';
        storeContainer.style.alignItems = 'center';
        storeContainer.style.paddingTop = '75px'; 
        
        // 1. حقن الستايلات
        if (!document.getElementById('store-tabs-style')) {
            const style = document.createElement('style');
            style.id = 'store-tabs-style';
            style.innerHTML = `
                /* 🌟 التبويبات العلوية الرئيسية */
                .store-tabs-container {
                    display: flex; gap: 4px; 
                    background: #060907 !important; 
                    padding: 3px !important; 
                    border-radius: 40px !important; 
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    width: 95%; max-width: 450px; 
                    box-shadow: 0 5px 15px rgba(0,0,0,0.6) !important;
                    z-index: 10; margin-bottom: 10px !important; direction: ltr; 
                }
                .store-tab-btn {
                    flex: 1; background: transparent; border: 1px solid transparent; color: var(--text-secondary);
                    padding: 4px 5px !important; 
                    border-radius: 40px !important; font-weight: 700; font-size: 12px !important;
                    cursor: pointer; transition: 0.3s;
                    display: flex; align-items: center; justify-content: center; gap: 5px !important;
                }
                .store-tab-btn.active { 
                    background: #0f3d17 !important; 
                    color: white !important; 
                    border: 1px solid #2e8b34 !important; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important; 
                }

                /* 🌟 حاوية الأقسام السفلية */
                .store-tab-content { 
                    display: none !important; width: 95%; max-width: 450px; 
                    height: calc(100dvh - 180px) !important; 
                    animation: fadeIn 0.4s ease; direction: rtl;
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
                    /* 🌟 التعديل هنا: استخدام قيمة سالبة لسحبها للأعلى بالقوة 🌟 */
                    margin-top: -15px !important; 
                    position: relative;
                    right: 2px; 
                    z-index: 5; 
                }
                .store-side-tab-btn {
                    background: rgba(15, 20, 24, 0.8) !important; 
                    border: 1px solid #4a3e1c !important; 
                    border-left: none !important; 
                    border-radius: 0 12px 12px 0 !important; 
                    color: var(--text-secondary);
                    font-weight: 700; font-size: 11px !important; 
                    height: 95px !important; 
                    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px !important;
                    cursor: pointer; transition: 0.3s; 
                }
                .store-side-tab-btn span.emoji-icon { 
                    font-size: 24px !important; 
                    filter: grayscale(100%) opacity(0.7); transition: 0.3s; margin-bottom: 0 !important; 
                }
                
                /* الزر الجانبي المفعل */
                .store-side-tab-btn.active {
                    background: #0b120d !important; 
                    color: #fff !important; 
                    border: 1px solid #b38d36 !important; 
                    border-left: 2px solid #0b120d !important; 
                    box-shadow: 4px 0 10px rgba(0,0,0,0.3) !important;
                }
                .store-side-tab-btn.active span.emoji-icon { filter: grayscale(0%) opacity(1); filter: drop-shadow(0 0 5px rgba(255,215,0,0.6)); }

                /* ======================================================== */
                /* 🌟 الصندوق الأيسر الكبير (نافذة المنتجات) 🌟 */
                /* ======================================================== */
                .store-group-box-dark {
                    flex: 1; 
                    padding: 12px 6px; 
                    background: #0b120d !important; 
                    border: 1px solid #b38d36 !important; 
                    border-radius: 18px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.9) !important;
                    display: flex; flex-direction: column; height: 100%; overflow: hidden;
                    z-index: 1; 
                }

                .store-sub-tab-content { display: none !important; height: 100%; flex-direction: column; animation: fadeIn 0.3s ease; }
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
                }
                .dama-cat-btn span.cat-icon { font-size: 12px !important; filter: grayscale(100%); transition: 0.3s; } 
                .dama-cat-btn.active { 
                    background: #0f3d17 !important; 
                    color: white !important; 
                    border: 1px solid #2e8b34 !important; 
                }
                .dama-cat-btn.active span.cat-icon { filter: grayscale(0%); }

                /* 🌟 منطقة التمرير للمنتجات */
                .store-scrollable-area {
                    flex: 1; overflow-y: auto; overflow-x: hidden; 
                    padding-right: 2px; padding-top: 5px; padding-bottom: 60px; 
                }
                .store-scrollable-area::-webkit-scrollbar { width: 3px; }
                .store-scrollable-area::-webkit-scrollbar-thumb { background: rgba(179, 141, 54, 0.5); border-radius: 10px; }
                
                /* 🌟 شبكة الكروت */
                .store-items-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 6px !important; width: 100% !important; }
                
                /* 🌟 شكل كارت المنتج */
                .store-item-card { 
                    background: #080d09 !important; 
                    border: 1px solid #a68331 !important; 
                    border-radius: 10px !important; 
                    padding: 8px 4px !important; 
                    display: flex !important; flex-direction: column !important; align-items: center !important; gap: 5px !important; 
                    text-align: center !important; position: relative;
                }
                
                /* 🌟 زر الشراء */
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
                            <button id="store-btn-tab-offers" class="dama-cat-btn" onclick="window.switchStoreTabCategory('offers', this)">
                                عروضات <span class="cat-icon">🏷️</span>
                            </button>
                            <button id="store-btn-tab-pieces" class="dama-cat-btn" onclick="window.switchStoreTabCategory('pieces', this)">
                                أحجار <span class="cat-icon">💎</span>
                            </button>
                            <button id="store-btn-tab-frames" class="dama-cat-btn" onclick="window.switchStoreTabCategory('frames', this)">
                                إطارات <span class="cat-icon">🖼️</span>
                            </button>
                            <button id="store-btn-tab-bg" class="dama-cat-btn active" onclick="window.switchStoreTabCategory('bg', this)">
                                خلفيات <span class="cat-icon">🎨</span>
                            </button>
                        </div>

                        <!-- منطقة التمرير للمنتجات -->
                        <div class="store-scrollable-area">
                            <div id="store-section-bg" class="store-items-grid"></div>
                            <div id="store-section-frames" class="store-items-grid" style="display: none;"></div>
                            <div id="store-section-pieces" class="store-items-grid" style="display: none;"></div>
                            <div id="store-section-offers" class="store-items-grid" style="display: none;"></div>
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
        const sec = document.getElementById('store-section-' + tab); 
        const btn = document.getElementById('store-btn-tab-' + tab);
        if(sec) sec.style.display = 'none'; 
        if(btn) btn.classList.remove('active');
    });
    
    const activeSec = document.getElementById('store-section-' + category);
    if(activeSec) activeSec.style.setProperty('display', 'grid', 'important'); 
    
    if(btnElement) {
        btnElement.classList.add('active');
    } else {
        const fallbackBtn = document.getElementById('store-btn-tab-' + category);
        if(fallbackBtn) fallbackBtn.classList.add('active');
    }
};
