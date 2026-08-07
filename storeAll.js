/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً
 * تم إصلاح نظام العرض ليكون شريط الألعاب الجانبي بجوار المنتجات تماماً
 */

document.addEventListener('DOMContentLoaded', () => {
    const storeContainer = document.getElementById('nav-section-store');
    
    if (storeContainer) {
        
        // ضبط الحاوية الأساسية للمتجر لتبدأ من الأعلى
        storeContainer.style.position = 'absolute';
        storeContainer.style.top = '0';
        storeContainer.style.left = '0';
        storeContainer.style.width = '100%';
        storeContainer.style.height = '100%';
        storeContainer.style.justifyContent = 'flex-start'; 
        storeContainer.style.paddingTop = '95px'; 
        
        // 1. حقن ستايلات المتجر الصارمة لمنع التداخل
        if (!document.getElementById('store-tabs-style')) {
            const style = document.createElement('style');
            style.id = 'store-tabs-style';
            style.innerHTML = `
                /* 🌟 التبويبات العلوية الرئيسية */
                .store-tabs-container {
                    display: flex; gap: 8px; 
                    background: rgba(15, 18, 25, 0.6); padding: 6px;
                    border-radius: 50px; border: 1px solid rgba(255,255,255,0.08);
                    width: 90%; max-width: 380px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                    z-index: 10; margin-bottom: 15px; margin-left: auto; margin-right: auto;
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
                
                /* 🌟 إخفاء الأقسام وإظهارها بنظام صارم */
                .store-tab-content { display: none !important; width: 95%; max-width: 400px; margin: 0 auto; height: calc(100dvh - 200px); animation: fadeIn 0.4s ease; }
                
                /* السر هنا: إجبار قسم الألعاب على العرض بشكل أفقي (جنباً إلى جنب) */
                #store-games-content.active-content { display: flex !important; flex-direction: row !important; gap: 8px !important; }
                #store-popularity-content.active-content { display: block !important; }
                #store-topup-content.active-content { display: block !important; }

                /* 🌟 الشريط الجانبي (أزرار دامة / طاولة) */
                .store-side-tabs {
                    display: flex; flex-direction: column; gap: 8px;
                    width: 70px; /* عرض ثابت للأزرار لتكون في اليمين */
                    flex-shrink: 0;
                }
                .store-side-tab-btn {
                    background: rgba(15, 18, 25, 0.6);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    color: var(--text-secondary);
                    font-weight: 700; font-size: 13px;
                    height: 80px; 
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.3s;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }
                .store-side-tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                .store-side-tab-btn.active {
                    background: rgba(10, 12, 16, 0.95);
                    color: white; 
                    border: 1px solid rgba(255,255,255,0.2); 
                    box-shadow: inset 0 0 10px rgba(255,255,255,0.05);
                }

                /* 🌟 الصندوق المظلم (نافذة المنتجات المجاورة للأزرار) */
                .store-group-box-dark {
                    flex: 1; /* يتمدد ليأخذ باقي المساحة المجاورة للأزرار */
                    padding: 12px 6px 5px 6px !important;
                    background: rgba(10, 12, 16, 0.95) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    height: 100% !important;
                    overflow: hidden !important;
                }

                /* 🌟 محتوى التبويب الفرعي */
                .store-sub-tab-content { display: none !important; height: 100%; flex-direction: column; animation: fadeIn 0.3s ease; }
                .store-sub-tab-content.active-content { display: flex !important; }

                /* 🌟 تصنيفات المتجر (خلفيات، إطارات..) */
                .dama-cats-container { display: flex; gap: 4px; margin-bottom: 5px; overflow-x: auto; padding-bottom: 5px; flex-shrink: 0; }
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
                    padding-right: 3px !important;
                    padding-top: 5px !important;
                    padding-bottom: 60px !important; /* مساحة لضمان عدم قص المنتجات */
                }
                .store-scrollable-area::-webkit-scrollbar { width: 3px; }
                .store-scrollable-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
                
                /* 🌟 شبكة الكروت */
                .store-items-grid { 
                    display: grid !important; 
                    grid-template-columns: repeat(3, 1fr) !important; /* 3 أعمدة */
                    gap: 6px !important; 
                    width: 100% !important;
                }
                .store-item-card { 
                    background: rgba(25, 30, 35, 0.98) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important; 
                    border-radius: 14px !important; 
                    padding: 8px 4px !important; 
                    display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important; 
                    text-align: center !important;
                }
                .store-buy-btn-small { 
                    height: 28px !important; font-size: 11px !important; border-radius: 8px !important; width: 95% !important; 
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

            <!-- 🌟 حاوية محتوى الألعاب (دامة وطاولة) - مصممة كـ Flex Row -->
            <div id="store-games-content" class="store-tab-content active-content">
                
                <!-- الأزرار الجانبية العمودية -->
                <div class="store-side-tabs">
                    <button class="store-side-tab-btn active" onclick="window.switchSubStoreTab('store-dama-items', this)">
                        <span data-i18n="store_dama">دامة</span>
                    </button>
                    <button class="store-side-tab-btn" onclick="window.switchSubStoreTab('store-tawla-items', this)">
                        <span data-i18n="store_tawla">طاولة</span>
                    </button>
                </div>

                <!-- الصندوق الداكن الفعلي للألعاب بجانب الأزرار -->
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
            <div id="store-popularity-content" class="store-tab-content">
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
            <div id="store-topup-content" class="store-tab-content">
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

        // إجبار السكربت على ضخ المنتجات
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

// دوال التنقل (تم إزالة التحكم بـ display عبر الجافا سكريبت للاعتماد على CSS !important)
window.switchStoreContentTab = function(contentId, btnElement) {
    document.querySelectorAll('.store-tab-content').forEach(el => {
        el.classList.remove('active-content');
    });
    document.querySelectorAll('.store-tab-btn').forEach(el => { 
        el.classList.remove('active'); 
    });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        targetContent.classList.add('active-content');
    }
    if (btnElement) btnElement.classList.add('active');
};

window.switchSubStoreTab = function(contentId, btnElement) {
    const parentTab = btnElement.closest('.store-tab-content');
    parentTab.querySelectorAll('.store-sub-tab-content').forEach(el => {
        el.classList.remove('active-content');
    });
    parentTab.querySelectorAll('.store-side-tab-btn').forEach(el => { 
        el.classList.remove('active'); 
    });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        targetContent.classList.add('active-content');
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
    // إرجاعها إلى نظام الشبكة Grid
    if(activeSec) activeSec.style.setProperty('display', 'grid', 'important'); 
};
