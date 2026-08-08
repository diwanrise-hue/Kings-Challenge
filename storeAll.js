/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً
 * 🌟 التصميم النهائي: أزرار جانبية متصلة بالنافذة تماماً (بدون فراغات) + مطابقة ألوان الصورة المرجعية 100%
 */

document.addEventListener('DOMContentLoaded', () => {
    const storeContainer = document.getElementById('nav-section-store');
    
    if (storeContainer) {
        
        // ضبط الحاوية الأساسية لتملأ الشاشة وتتمركز
        storeContainer.style.position = 'absolute';
        storeContainer.style.top = '0';
        storeContainer.style.left = '0';
        storeContainer.style.width = '100%';
        storeContainer.style.height = '100%';
        storeContainer.style.display = 'flex';
        storeContainer.style.flexDirection = 'column';
        storeContainer.style.alignItems = 'center';
        storeContainer.style.paddingTop = '95px'; 
        
        // 1. حقن الستايلات (الالتصاق، الألوان الخضراء/الذهبية، والتصميم)
        if (!document.getElementById('store-tabs-style')) {
            const style = document.createElement('style');
            style.id = 'store-tabs-style';
            style.innerHTML = `
                /* 🌟 التبويبات العلوية الرئيسية (خلفية داكنة جداً) */
                .store-tabs-container {
                    display: flex; gap: 8px; 
                    background: rgba(10, 14, 18, 0.95); padding: 6px;
                    border-radius: 50px; border: 1px solid rgba(255,255,255,0.08);
                    width: 95%; max-width: 450px; box-shadow: 0 5px 15px rgba(0,0,0,0.6);
                    z-index: 10; margin-bottom: 15px; direction: ltr; /* الترتيب: ألعاب يمين، شحن يسار */
                }
                .store-tab-btn {
                    flex: 1; background: transparent; border: none; color: var(--text-secondary);
                    padding: 8px 5px; border-radius: 50px; font-weight: 700; font-size: 14px;
                    cursor: pointer; transition: var(--transition);
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .store-tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                .store-tab-btn.active { 
                    background: #0f361a !important; /* أخضر داكن */
                    color: white !important; 
                    border: 1px solid #1c6b32 !important; /* حافة خضراء */
                    box-shadow: 0 4px 10px rgba(0,0,0,0.5) !important; 
                }

                /* 🌟 حاوية الأقسام السفلية (Flex Row لجعل القائمة يمين والصندوق يسار) */
                .store-tab-content { 
                    display: none !important; width: 95%; max-width: 450px; 
                    height: calc(100dvh - 200px); 
                    animation: fadeIn 0.4s ease; direction: rtl;
                }
                /* السر هنا: gap: 0 لجعل الأزرار تلتصق بالنافذة */
                #store-games-content.active-content { display: flex !important; flex-direction: row !important; gap: 0 !important; align-items: flex-start; }
                #store-popularity-content.active-content { display: block !important; }
                #store-topup-content.active-content { display: block !important; }

                /* 🌟 الشريط الجانبي الأيمن (دامة / طاولة) */
                .store-side-tabs {
                    display: flex; flex-direction: column; gap: 8px;
                    width: 75px; flex-shrink: 0;
                    margin-top: 15px; /* نزول بسيط ليتماشى مع التبويبات الداخلية */
                    z-index: 2; /* ليبقى فوق الصندوق قليلاً */
                }
                .store-side-tab-btn {
                    background: rgba(15, 20, 25, 0.95); 
                    border: 1px solid #d4af37; /* حافة ذهبية خافتة */
                    border-left: none; /* إزالة الحافة اليسرى للالتصاق التام */
                    border-radius: 0 20px 20px 0; /* مسطح من اليسار، دائري من اليمين */
                    color: var(--text-secondary);
                    font-weight: 700; font-size: 14px; height: 100px; 
                    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
                    cursor: pointer; transition: 0.3s; box-shadow: 2px 4px 10px rgba(0,0,0,0.3);
                }
                .store-side-tab-btn span.emoji-icon { font-size: 32px; filter: grayscale(100%) opacity(0.7); transition: 0.3s; margin-bottom: 2px; }
                .store-side-tab-btn.active {
                    background: #0f361a !important; /* أخضر داكن */
                    color: #fff !important; 
                    border: 1px solid #d4af37 !important; /* حافة ذهبية قوية */
                    border-left: none !important; /* يبقى ملتصقاً بالصندوق */
                    box-shadow: 4px 0 15px rgba(212, 175, 55, 0.15) !important;
                }
                .store-side-tab-btn.active span.emoji-icon { filter: grayscale(0%) opacity(1); filter: drop-shadow(0 0 8px rgba(255,215,0,0.6)); }

                /* 🌟 الصندوق الأيسر الكبير (نافذة المنتجات) */
                .store-group-box-dark {
                    flex: 1; padding: 12px;
                    background: rgba(15, 20, 24, 0.98) !important; /* أسود/كحلي داكن جداً */
                    border: 1px solid #d4af37 !important; /* حافة ذهبية صلبة للصندوق بالكامل */
                    border-radius: 20px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
                    display: flex; flex-direction: column; height: 100%; overflow: hidden;
                    z-index: 1;
                }

                /* محتوى التبويب الفرعي للصندوق الأيسر */
                .store-sub-tab-content { display: none !important; height: 100%; flex-direction: column; animation: fadeIn 0.3s ease; }
                .store-sub-tab-content.active-content { display: flex !important; }

                /* 🌟 شريط تصنيفات الدامة (خلفيات، إطارات..) */
                .dama-cats-container { 
                    display: flex; gap: 6px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 5px; flex-shrink: 0; 
                    direction: rtl; 
                }
                .dama-cats-container::-webkit-scrollbar { height: 0; display: none; }
                .dama-cat-btn {
                    flex: 1; min-width: 70px; background: rgba(25, 30, 35, 0.6); border: 1px solid rgba(255,255,255,0.05);
                    color: var(--text-secondary); padding: 6px 4px; border-radius: 25px; font-size: 13px; font-weight: 700; 
                    cursor: pointer; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 5px;
                }
                .dama-cat-btn.active { 
                    background: #0f361a !important; /* أخضر داكن */
                    color: white !important; 
                    border: 1px solid #4caf50 !important; /* حافة خضراء فاتحة */
                }

                /* 🌟 منطقة التمرير للمنتجات */
                .store-scrollable-area {
                    flex: 1; overflow-y: auto; overflow-x: hidden; 
                    padding-right: 2px; padding-top: 5px; padding-bottom: 60px;
                }
                .store-scrollable-area::-webkit-scrollbar { width: 3px; }
                .store-scrollable-area::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.5); border-radius: 10px; }
                
                /* 🌟 شبكة الكروت (3 أعمدة) */
                .store-items-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; width: 100% !important; }
                
                /* 🌟 شكل كارت المنتج (حواف ذهبية) */
                .store-item-card { 
                    background: rgba(10, 15, 18, 0.95) !important; /* أسود مخضر داكن */
                    border: 1px solid #d4af37 !important; /* 🌟 حافة ذهبية صلبة كما في الصورة */
                    border-radius: 14px !important; 
                    padding: 10px 5px !important; 
                    display: flex !important; flex-direction: column !important; align-items: center !important; gap: 6px !important; 
                    text-align: center !important; position: relative;
                }
                
                /* 🌟 زر الشراء الأخضر (كما في الصورة تماماً) */
                .store-buy-btn-small { 
                    height: 28px !important; font-size: 12px !important; font-weight: bold !important; border-radius: 20px !important; width: 85% !important; 
                    background: #145224 !important; /* أخضر نقي */
                    color: white !important; border: 1px solid #2e7d32 !important; cursor: pointer !important; transition: 0.2s;
                    margin-bottom: 2px !important;
                }
                .store-buy-btn-small:hover { background: #1b6e31 !important; }
            `;
            document.head.appendChild(style);
        }

        // 2. بناء هيكل المتجر بالكامل (HTML)
        storeContainer.innerHTML = `
            <!-- التبويبات العلوية الرئيسية (معكوسة الترتيب لتناسب الصورة) -->
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

            <!-- حاوية محتوى الألعاب (Flex Row: شريط جانبي يمين، وصندوق يسار) -->
            <div id="store-games-content" class="store-tab-content active-content">
                
                <!-- 🌟 الشريط الجانبي الأيمن (دامة وطاولة) موضوع أولاً ليكون على اليمين بسبب RTL -->
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

                <!-- 🌟 الصندوق الأيسر الكبير للمنتجات (ملتصق تماماً بالأزرار) -->
                <div class="store-group-box-dark">
                    
                    <!-- محتوى متجر دامة -->
                    <div id="store-dama-items" class="store-sub-tab-content active-content">
                        <!-- تصنيفات الدامة مع الأيقونات -->
                        <div class="dama-cats-container">
                            <button id="store-btn-tab-offers" class="dama-cat-btn" onclick="window.switchStoreTabCategory('offers', this)">
                                عروضات
                            </button>
                            <button id="store-btn-tab-pieces" class="dama-cat-btn" onclick="window.switchStoreTabCategory('pieces', this)">
                                أحجار
                            </button>
                            <button id="store-btn-tab-frames" class="dama-cat-btn" onclick="window.switchStoreTabCategory('frames', this)">
                                إطارات
                            </button>
                            <button id="store-btn-tab-bg" class="dama-cat-btn active" onclick="window.switchStoreTabCategory('bg', this)">
                                خلفيات <span style="font-size: 14px;">🎨</span>
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
                        <span style="font-size: 50px; display: block; text-align: center; margin-top: 40px; margin-bottom: 10px;">🎲</span>
                        <p style="color: var(--text-secondary); font-size: 15px; text-align: center; margin: 10px 0 20px 0;">
                            ملحقات وأزياء خاصة بلعبة الطاولة
                        </p>
                        <button class="store-buy-btn-small" style="width: 70%; margin: 0 auto; height: 40px !important; font-size: 15px !important;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
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
                    <button class="store-buy-btn-small" style="width: 80%; height: 45px !important; font-size: 15px !important;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
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
                    <button class="store-buy-btn-small" style="background: linear-gradient(135deg, rgba(245,166,35,0.2), rgba(211,84,0,0.2)) !important; border: 1px solid rgba(245,166,35,0.4) !important; color: #f5a623 !important; width: 80%; height: 45px !important; font-size: 15px !important;" onclick="triggerAlertSoon()" data-i18n="soon">قريباً</button>
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
    
    // إخفاء المحتويات وإزالة التفعيل من الأزرار
    tabs.forEach(tab => { 
        const sec = document.getElementById('store-section-' + tab); 
        const btn = document.getElementById('store-btn-tab-' + tab);
        if(sec) sec.style.display = 'none'; 
        if(btn) btn.classList.remove('active');
    });
    
    // إظهار المحتوى المطلوب
    const activeSec = document.getElementById('store-section-' + category);
    if(activeSec) activeSec.style.setProperty('display', 'grid', 'important'); 
    
    // تفعيل الزر المضغوط
    if(btnElement) {
        btnElement.classList.add('active');
    } else {
        const fallbackBtn = document.getElementById('store-btn-tab-' + category);
        if(fallbackBtn) fallbackBtn.classList.add('active');
    }
};
