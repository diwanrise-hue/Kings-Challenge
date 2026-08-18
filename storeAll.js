/**
 * storeAll.js
 * مسؤول عن توليد وإدارة محتويات قسم المتجر (Store) ديناميكياً
 * 🌟 التحديث: إضافة إطارات البروفايل وتصميم الشحن الجديد (الشبكة وزر التعجب)
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
                    border: 1px solid var(--accent) !important; 
                    width: 95%; max-width: 450px; 
                    box-shadow: 0 5px 15px rgba(0,0,0,0.6) !important;
                    z-index: 10; 
                    margin-bottom: 6px !important; 
                    direction: ltr; 
                }
                .store-tab-btn {
                    flex: 1; background: transparent; color: var(--text-secondary);
                    padding: 6px 2px !important; 
                    border-radius: 40px !important; 
                    font-weight: 700; font-size: 11.5px !important;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 3px !important;
                    border: 1px solid transparent !important; 
                    position: relative;
                    white-space: nowrap;
                }
                
                /* 🌟 خط فاصل ذهبي قصير */
                .store-tab-btn:not(:first-child)::before {
                    content: '';
                    position: absolute;
                    left: -2px;
                    top: 15%; 
                    height: 70%; 
                    width: 1px;
                    background-color: var(--accent);
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
                    border: 1px solid var(--accent) !important; 
                    box-shadow: 
                        inset 0 2px 1px rgba(255, 255, 255, 0.5), 
                        inset 0 -4px 10px rgba(0, 0, 0, 0.9),     
                        0 4px 10px rgba(0, 0, 0, 0.8),            
                        0 0 8px rgba(197, 155, 66, 0.2) !important; 
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
                #store-profile-frames-content.active-content { display: block !important; }

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
                    border: 1px solid var(--accent) !important; 
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
                    border: 1px solid var(--accent) !important; 
                    border-radius: 8px !important;
                    box-shadow: 
                        inset 0 2px 1px rgba(255, 255, 255, 0.5), 
                        inset 0 -4px 10px rgba(0, 0, 0, 0.9), 
                        0 0 8px rgba(197, 155, 66, 0.2) !important;
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
                .store-side-tab-btn.active span.emoji-icon { filter: grayscale(0%) opacity(1) drop-shadow(0 0 5px rgba(197, 155, 66, 0.6)); }

                /* ======================================================== */
                /* 🌟 الصندوق الأيسر الكبير 🌟 */
                /* ======================================================== */
                .store-group-box-dark {
                    flex: 1; 
                    margin-top: 0 !important; 
                    padding: 12px 6px; 
                    background: #0b120d !important; 
                    border: 1px solid var(--accent) !important; 
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
                .store-scrollable-area::-webkit-scrollbar-thumb { background: rgba(197, 155, 66, 0.5); border-radius: 10px; }
                
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
                    border: 1px solid rgba(197, 155, 66, 0.4) !important; 
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
                    <span>شعبية</span> <span style="font-size: 13px; filter: hue-rotate(210deg) drop-shadow(0 0 3px rgba(0,210,255,0.6)); margin-right: 3px;">🔥</span>
                </button>
                <button class="store-tab-btn" onclick="window.switchStoreContentTab('store-profile-frames-content', this)">
                    <span>إطار شخصي</span> <span style="font-size: 13px; margin-right: 3px;">🖼️</span>
                </button>
                <button class="store-tab-btn active" onclick="window.switchStoreContentTab('store-games-content', this)">
                    <span data-i18n="store_games">الألعاب</span> 
                    <span style="width: 14px; height: 14px; display: inline-block; margin-right: 3px;">
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
                    <div style="text-align: center; margin-bottom: 12px; flex-shrink: 0;">
                        <span style="font-size: 20px; filter: hue-rotate(210deg) drop-shadow(0 0 5px rgba(0, 210, 255, 0.5));">🔥</span>
                        <span style="color: white; font-size: 15px; font-weight: bold; margin-right: 5px;">هدايا شعبية</span>
                    </div>
                    <div class="store-scrollable-area" style="padding-top: 0; flex: 1;">
                        <div id="store-popularity-grid" class="store-items-grid"></div>
                    </div>
                </div>
            </div>

            <!-- 🌟 حاوية محتوى إطارات البروفايل 🌟 -->
            <div id="store-profile-frames-content" class="store-tab-content">
                <div class="store-group-box-dark" style="width: 100%; border-radius: 18px !important; padding: 12px; display: flex; flex-direction: column;">
                    <div style="text-align: center; margin-bottom: 12px; flex-shrink: 0;">
                        <span style="font-size: 20px; filter: drop-shadow(0 0 5px rgba(197, 155, 66, 0.5));">🖼️</span>
                        <span style="color: white; font-size: 15px; font-weight: bold; margin-right: 5px;">إطارات شخصية</span>
                    </div>
                    <div class="store-scrollable-area" style="padding-top: 0; flex: 1;">
                        <div id="store-profile-frames-grid" class="store-items-grid">
                            <!-- سيتم حقن إطارات البروفايل هنا برمجياً -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🌟 حاوية محتوى الشحن و VIP بالمال الحقيقي 🌟 -->
            <div id="store-topup-content" class="store-tab-content">
                <div class="store-group-box-dark" style="width: 100%; border-radius: 18px !important; display: flex; flex-direction: column; padding: 15px; border-color: var(--accent) !important; overflow-y: auto;">
                    
                    <!-- 🌟 بطاقة تقدم الـ VIP (VIP Progress Card) مع زر التعجب (!) -->
                    <div style="background: linear-gradient(135deg, rgba(27, 94, 32, 0.4), rgba(8, 33, 11, 0.9)); border: 1px solid var(--accent); border-radius: 16px; padding: 15px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <button onclick="window.openAppModal('vip-info-modal')" style="background: transparent; border: 1px solid var(--accent); color: var(--accent); width: 22px; height: 22px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; cursor: pointer; font-size: 12px; padding: 0;">!</button>
                                <span id="current-vip-badge" style="color: var(--accent); font-size: 18px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">VIP 0</span>
                            </div>
                            <span id="next-vip-badge" style="color: white; font-size: 14px; font-weight: bold;">VIP 1</span>
                        </div>
                        
                        <!-- شريط التقدم -->
                        <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.6); border-radius: 10px; overflow: hidden; margin-bottom: 8px; border: 1px solid rgba(197, 155, 66, 0.3);">
                            <div id="vip-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(to right, #8b5a2b, var(--accent)); box-shadow: 0 0 8px rgba(197, 155, 66, 0.6); transition: width 0.5s ease;"></div>
                        </div>
                        
                        <div style="text-align: center; color: var(--text-secondary); font-size: 11px;">
                            اشحن بـ <span id="vip-remaining-amount" style="color: #00d2ff; font-weight: bold;">$5.00</span> للوصول إلى المستوى القادم
                        </div>
                    </div>

                    <h4 style="color: white; font-size: 16px; margin-bottom: 15px; text-align: center;">باقات العملات (Tokens)</h4>
                    
                    <!-- 🌟 شبكة باقات الشحن بالمال الحقيقي عبر Google Play (2x2 Grid) 🌟 -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        
                        <!-- باقة 1 -->
                        <div class="store-item-card" style="border-color: rgba(255,255,255,0.1) !important; padding: 15px 10px !important;">
                            <span style="font-size: 35px; margin: 5px 0;">🪙</span>
                            <span style="color: #fff; font-size: 16px; font-weight: bold;">5,000</span>
                            <span style="color: var(--text-secondary); font-size: 10px; margin-bottom: 10px;">+ 99 نقطة VIP</span>
                            <button class="store-buy-btn-small" style="background: rgba(255,255,255,0.05) !important; border-color: rgba(0, 210, 255, 0.3) !important; color: #00d2ff !important; height: 32px !important; font-size: 13px !important;" onclick="purchaseRealMoney('package_099', 0.99)">
                                $0.99
                            </button>
                        </div>

                        <!-- باقة 2 -->
                        <div class="store-item-card" style="border-color: rgba(197, 155, 66, 0.3) !important; background: linear-gradient(to bottom, rgba(197, 155, 66, 0.05), transparent) !important; padding: 15px 10px !important;">
                            <span style="font-size: 35px; margin: 5px 0;">💰</span>
                            <span style="color: var(--accent); font-size: 16px; font-weight: bold;">25,000</span>
                            <span style="color: var(--text-secondary); font-size: 10px; margin-bottom: 10px;">+ 499 نقطة VIP</span>
                            <button class="store-buy-btn-small" style="background: rgba(197, 155, 66, 0.1) !important; border-color: var(--accent) !important; color: var(--accent) !important; height: 32px !important; font-size: 13px !important;" onclick="purchaseRealMoney('package_499', 4.99)">
                                $4.99
                            </button>
                        </div>

                        <!-- باقة 3 (الأكثر مبيعاً) -->
                        <div class="store-item-card" style="border-color: #ff453a !important; background: linear-gradient(to bottom, rgba(255,69,58,0.05), transparent) !important; position: relative; padding: 15px 10px !important;">
                            <div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: #ff453a; color: white; font-size: 9px; padding: 2px 8px; border-radius: 10px; font-weight: bold; white-space: nowrap;">الأكثر مبيعاً</div>
                            <span style="font-size: 35px; margin: 5px 0; filter: drop-shadow(0 0 5px rgba(255,69,58,0.5));">💎</span>
                            <span style="color: #ff453a; font-size: 16px; font-weight: bold;">100,000</span>
                            <span style="color: var(--text-secondary); font-size: 10px; margin-bottom: 10px;">+ 1999 نقطة VIP</span>
                            <button class="store-buy-btn-small" style="background: rgba(255, 69, 58, 0.1) !important; border-color: #ff453a !important; color: #ff453a !important; height: 32px !important; font-size: 13px !important;" onclick="purchaseRealMoney('package_1999', 19.99)">
                                $19.99
                            </button>
                        </div>
                        
                        <!-- 👑 الباقة 4: $39.99 (الجديدة) -->
                        <div class="store-item-card" style="border-color: var(--accent) !important; background: linear-gradient(135deg, rgba(197,155,66,0.1) 0%, transparent 100%) !important; position: relative; box-shadow: inset 0 0 15px rgba(197,155,66,0.1) !important; padding: 15px 10px !important;">
                            <span style="font-size: 35px; margin: 5px 0; filter: drop-shadow(0 0 5px rgba(197,155,66,0.5));">👑</span>
                            <span style="color: var(--accent); font-size: 16px; font-weight: bold; text-shadow: 0 0 5px rgba(197,155,66,0.5);">220,000</span>
                            <span style="color: var(--text-secondary); font-size: 10px; margin-bottom: 10px;">+ 3999 نقطة VIP</span>
                            <button class="store-buy-btn-small" style="background: linear-gradient(to right, rgba(197,155,66,0.3), rgba(197,155,66,0.1)) !important; border-color: var(--accent) !important; color: var(--accent) !important; height: 32px !important; font-size: 13px !important;" onclick="purchaseRealMoney('package_3999', 39.99)">
                                $39.99
                            </button>
                        </div>

                    </div>
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
            
            // 🌟 استدعاء الشعبية والإطارات الشخصية
            if (typeof window.renderPopularityItems === 'function') {
                window.renderPopularityItems();
            }

            if (typeof window.renderProfileFrames === 'function') {
                window.renderProfileFrames();
            }
            
        }, 300);
    }
});

// ==========================================
// دوال التنقل داخل المتجر
// ==========================================
window.switchStoreContentTab = function(contentId, btnElement) {
    document.querySelectorAll('.store-tab-content').forEach(el => { el.classList.remove('active-content'); });
    document.querySelectorAll('.store-tab-btn').forEach(el => { el.classList.remove('active'); });
    
    const targetContent = document.getElementById(contentId);
    if (targetContent) { targetContent.classList.add('active-content'); }
    if (btnElement) btnElement.classList.add('active');

    if (contentId === 'store-games-content') {
        if (typeof window.switchStoreTabCategory === 'function') {
            window.switchStoreTabCategory('bg');
        }
    }
    
    if (contentId === 'store-topup-content') {
        if (typeof window.updateVipProgressBarUI === 'function') {
            window.updateVipProgressBarUI();
        }
    }
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
        document.querySelectorAll('[id="store-section-' + tab + '-container"]').forEach(sec => sec.style.display = 'none');
        document.querySelectorAll('[id="store-btn-tab-' + tab + '"]').forEach(btn => btn.classList.remove('active'));
    });
    
    document.querySelectorAll('[id="store-section-' + category + '-container"]').forEach(sec => sec.style.setProperty('display', 'flex', 'important'));
    
    if(btnElement) {
        btnElement.classList.add('active');
    } else {
        document.querySelectorAll('[id="store-btn-tab-' + category + '"]').forEach(btn => btn.classList.add('active'));
    }
};

// 🌟 تجاوز عرض الحقيبة لتحديث الإطارات الشخصية عند فتحها
const originalSwitchThemeGridTabCategory = window.switchThemeGridTabCategory;
window.switchThemeGridTabCategory = function(category) {
    if(originalSwitchThemeGridTabCategory) originalSwitchThemeGridTabCategory(category);
    if (category === 'profile-frames' && typeof window.renderProfileFramesInBag === 'function') {
        window.renderProfileFramesInBag();
    }
};

// ==========================================
// 🌟 دالة مساعدة لاختصار الأرقام
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
// 🌟 دوال عرض منتجات الشعبية
// ==========================================
window.renderPopularityItems = function() {
    const grid = document.getElementById('store-popularity-grid');
    if (!grid) return;
    
    grid.innerHTML = ''; 
    
    if (window.POPULARITY_ITEMS && window.POPULARITY_ITEMS.length > 0) {
        window.POPULARITY_ITEMS.forEach(item => {
            const card = document.createElement('div');
            card.className = 'store-item-card';
            
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

window.triggerAlertSoon = function() {
    if (window.socketManager && typeof window.socketManager._showToast === 'function') {
        window.socketManager._showToast("⏳ هذه الميزة ستتوفر قريباً!");
    } else {
        alert("قريباً!");
    }
};

// ==========================================
// 🌟 دوال عرض وشراء إطارات البروفايل الشخصية 🌟
// ==========================================

const GITHUB_PROFILE_BASE = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/storeAll/profile/";

// 1. قاعدة بيانات إطارات البروفايل (حسب الأسماء المرفوعة)
window.PROFILE_FRAMES_ITEMS = [
    { id: 'pf_ruby', nameAr: 'إطار الياقوت الملكي', price: 15000, imagePath: GITHUB_PROFILE_BASE + 'Profil2.webp' },
    { id: 'pf_dragon', nameAr: 'إطار التنين الذهبي', price: 35000, imagePath: GITHUB_PROFILE_BASE + 'Profile4.webp' },
    { id: 'pf_noble', nameAr: 'إطار النبلاء الأسود', price: 10000, imagePath: GITHUB_PROFILE_BASE + 'Profile7.webp' }
];

// 2. دالة رسم الإطارات داخل تبويب "إطار شخصي"
window.renderProfileFrames = function() {
    const grid = document.getElementById('store-profile-frames-grid');
    if (!grid) return;
    
    grid.innerHTML = ''; 
    
    if (window.PROFILE_FRAMES_ITEMS && window.PROFILE_FRAMES_ITEMS.length > 0) {
        window.PROFILE_FRAMES_ITEMS.forEach(item => {
            const card = document.createElement('div');
            card.className = 'store-item-card';
            
            card.innerHTML = `
                <div style="height: 70px; width: 100%; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; background: rgba(0,0,0,0.4); border-radius: 12px; position: relative;">
                    <img src="https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/1000132081.webp" style="position: absolute; width: 45px; height: 45px; border-radius: 50%; opacity: 0.5;">
                    <img src="${item.imagePath}" alt="${item.nameAr}" style="position: relative; width: 65px; height: 65px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.8)); z-index: 2;">
                </div>
                <span style="color: #fff; font-size: 12px; font-weight: bold; margin-bottom: 8px; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.nameAr}</span>
                
                <button class="store-buy-btn-small" style="background: linear-gradient(to right, rgba(197, 155, 66, 0.2), transparent) !important; border: 1px solid var(--accent) !important; color: var(--accent) !important;" onclick="buyProfileFrameItem('${item.id}')">
                    ${localFormatCompactNumber(item.price)} <span style="font-size: 11px;">🪙</span>
                </button>
            `;
            grid.appendChild(card);
        });
    }
};

// 3. دالة الشراء (التي تفتح نافذة التأكيد)
window.buyProfileFrameItem = function(itemId) {
    const item = window.PROFILE_FRAMES_ITEMS.find(i => i.id === itemId);
    if(item) {
        if (typeof window.openPurchaseModal === 'function') {
            window.openPurchaseModal(item.id, item.nameAr, item.price, 'profile_frame');
        } 
    }
};

// ==========================================
// 🌟 دوال عرض إطارات البروفايل داخل الحقيبة وتفعيلها 🌟
// ==========================================

window.renderProfileFramesInBag = function() {
    const container = document.getElementById('theme-grid-section-profile-frames');
    if (!container) return;
    
    container.innerHTML = '';

    const profile = typeof window.getSafeProfile === 'function' ? window.getSafeProfile() : (window.storeManager ? window.storeManager.getProfile() : {});
    const purchasedItems = profile.purchasedItems || [];
    const framesList = window.PROFILE_FRAMES_ITEMS || [];

    let hasFrames = false;

    framesList.forEach(frame => {
        if (purchasedItems.includes(frame.id)) {
            hasFrames = true;
            
            const isEquipped = profile.equippedProfileFrame === frame.id;
            const frameCard = document.createElement('div');
            frameCard.className = `theme-grid-item ${isEquipped ? 'active' : ''}`;
            
            frameCard.onclick = () => {
                window.equipProfileFrame(frame.id);
            };

            frameCard.innerHTML = `
                <div style="height: 50px; width: 100%; display: flex; align-items: center; justify-content: center; position: relative;">
                    <img src="https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/1000132081.webp" style="position: absolute; width: 35px; height: 35px; border-radius: 50%; opacity: 0.5;">
                    <img src="${frame.imagePath}" style="position: relative; width: 50px; height: 50px; object-fit: contain; z-index: 2; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                </div>
                <span class="theme-grid-title" style="margin-top: 8px;">${frame.nameAr}</span>
            `;
            container.appendChild(frameCard);
        }
    });

    if (!hasFrames) {
        container.innerHTML = '<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">لا تملك إطارات للبروفايل حالياً</div>';
    }
};

window.equipProfileFrame = function(frameId) {
    let profile = typeof window.getSafeProfile === 'function' ? window.getSafeProfile() : (window.storeManager ? window.storeManager.getProfile() : {});
    if (!profile || !profile.id) return;

    profile.equippedProfileFrame = frameId;
    localStorage.setItem('hub_user_profile', JSON.stringify(profile));

    window.renderProfileFramesInBag();

    if (typeof window.syncHubProfile === 'function') {
        window.syncHubProfile();
    }

    if (typeof socket !== 'undefined' && socket.connected) {
        socket.emit('syncProfile', { id: profile.id, equippedProfileFrame: frameId });
    }
};
