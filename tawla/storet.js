/**
 * storet.js
 * النسخة الأساسية (المفرغة من المنتجات) + متوافقة 100% مع الـ 3D الجديد
 */

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/";

export const STORE_ITEMS = {
    // ===================================
    // العناصر الافتراضية الأساسية (ضرورية لعمل اللعبة ولا يمكن مسحها)
    // ===================================
    
    'bg_wood': { 
        type: 'bg', isDefault: true, nameAr: 'الخشب الفاخر', nameEn: 'Premium Wood', light: '#DEB887', dark: '#8B4513',
        linkedScore: 'score_default'
    },

    'fr_classic': { 
        type: 'fr', isDefault: true, nameAr: 'إطار خشبي كلاسيكي', nameEn: 'Classic Wood Frame',
        cssBoard: 'border: none; border-image: none;', 
        customCSS: `
            /* الحاويات الأم: تصفير لإلغاء أي إطار موروث */
            .tawla-container, #tawla-board-wrapper {
                background: transparent !important;
                background-image: none !important;
                border: none !important;
                border-image: none !important;
                padding: 0 !important;
                box-shadow: none !important;
            }

            /* الطاولة: الإطار الخارجي الخشبي الموحد والعميق */
            #tawla-board { 
                border: 18px solid #200c04 !important; 
                border-image: none !important;
                border-image-source: none !important;
                border-radius: 12px !important; 
                box-shadow: 
                    0 0 0 2px #d4af37,              
                    0 20px 40px rgba(0,0,0,0.95),    
                    inset 0 0 0 2px #b8860b,          
                    inset 0 0 50px rgba(0,0,0,0.95),  
                    inset 0 2px 6px rgba(255,255,255,0.12) !important; 
                box-sizing: border-box !important;
                position: relative !important;
                left: auto !important;
                transform: rotateX(5deg) translateY(0px) !important;
                margin: 0 auto !important;
                padding: 0 !important;
                aspect-ratio: auto !important;
                transition: all 0.5s ease; 
            }
            
            /* إيقاف العناصر الوهمية لمنع التداخلات */
            #tawla-board::before, #tawla-board::after { display: none !important; }
        `
    },

    'pc_original': { 
        type: 'pc', isDefault: true, nameAr: 'النمط الأصلي', nameEn: 'Original', icon: '⚪' 
    },

    'score_default': { 
        type: 'score', isDefault: true, nameAr: 'الشريط الافتراضي', nameEn: 'Default Bar', 
        scoreBg1: 'linear-gradient(to bottom, #757b8a, #585d6b)', 
        scoreBg2: 'linear-gradient(to bottom, #99a0b3, #7a8194)',
        scoreBorder1: 'none', scoreBorder2: 'none' 
    }

    // يمكنك إضافة منتجاتك الجديدة والمعدلة هنا لاحقاً...
};

window.STORE_ITEMS = STORE_ITEMS;

window.addPopularityToBag = function(itemId, amount = 1) {
    let profile = storeManager.getProfile();
    if (!profile) return;

    if (!profile.inventory || typeof profile.inventory !== 'object') {
        profile.inventory = {};
    }
    
    profile.inventory[itemId] = (profile.inventory[itemId] || 0) + amount;

    localStorage.setItem('hub_user_profile', JSON.stringify(profile));
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
    }

    if (typeof window.renderGiftsInBag === 'function') {
        window.renderGiftsInBag();
    }
    storeManager.renderUI();
};

window.renderGiftsInBag = function() {
    const container = document.getElementById('theme-grid-section-gifts');
    if (!container) return;
    container.innerHTML = '';

    const profile = storeManager.getProfile();
    const inventory = profile.inventory || {};
    const giftsList = window.POPULARITY_ITEMS || [];

    let hasGifts = false;

    giftsList.forEach(gift => {
        const count = inventory[gift.id] || 0;
        if (count > 0) {
            hasGifts = true;
            const giftCard = document.createElement('div');
            giftCard.className = 'theme-grid-item';
            giftCard.innerHTML = `
                <div style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <img src="${gift.imagePath}" style="max-width: 85%; max-height: 85%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));" alt="${gift.nameAr}">
                </div>
                <span class="theme-grid-title" style="font-size: 11px; margin-top: 4px;">${gift.nameAr}</span>
                <span style="color: #30d158; font-size: 11px; font-weight: bold;">العدد: x${count}</span>
            `;
            container.appendChild(giftCard);
        }
    });

    if (!hasGifts) {
        container.innerHTML = '<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">لا تملك هدايا شعبية حالياً. اشترِ من المتجر!</div>';
    }
};

export const storeManager = {
    
    startGapKiller() {
        if (window.__gapKillerActive) return;
        window.__gapKillerActive = true;

        const applyGapKillerStyles = () => {
            const board = document.getElementById('tawla-board');
            if (!board) return;

            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                board.style.setProperty('width', '100vw', 'important');
                board.style.setProperty('height', '100vw', 'important');
                board.style.setProperty('max-width', '100vw', 'important');
            } else {
                board.style.removeProperty('width');
                board.style.removeProperty('height');
                board.style.removeProperty('max-width');
            }
            
            board.style.setProperty('position', 'relative', 'important');
            board.style.setProperty('margin', '50px auto', 'important'); 
            board.style.removeProperty('left');      
            board.style.removeProperty('transform'); 
            board.style.setProperty('box-sizing', 'border-box', 'important');

            let el = board.parentElement;
            while (el && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
                el.style.setProperty('overflow', 'visible', 'important');
                el = el.parentElement;
            }
            document.body.style.setProperty('overflow-x', 'hidden', 'important');
        };

        applyGapKillerStyles();
        
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(applyGapKillerStyles, 250);
        });
    },

    injectLegendaryAnimations() {
        if (document.getElementById('store-legendary-styles')) return;
        const style = document.createElement('style');
        style.id = 'store-legendary-styles';
        style.innerHTML = `
            .legendary-card { 
                animation: none !important; 
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(0, 0, 0, 0.6)) !important; 
                border: 1px solid #ffd700 !important; 
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5) !important;
            }
            .legendary-icon { filter: none !important; }
            .legendary-text { color: #ffd700 !important; text-shadow: none !important; animation: none !important; }
            .legendary-btn { background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2)) !important; border: 1px solid #ffd700 !important; color: #fff !important; }
            .legendary-btn:hover { background: linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 140, 0, 0.4)) !important; transform: scale(1.02) !important; }
        `;
        document.body.appendChild(style);
    },

    injectDynamicPieceStyles() {
        if (document.getElementById('dynamic-pieces-css')) return;

        let pieceStyles = `
            @keyframes goldenVaporAura { 0% { transform: scale(1); opacity: 0.8; filter: blur(2px); } 100% { transform: scale(1.6); opacity: 0; filter: blur(8px); } }
        `;

        Object.keys(STORE_ITEMS).forEach(key => {
            const item = STORE_ITEMS[key];
            if (item.type === 'pc' && key !== 'pc_original') {
                if (item.isImage) {
                    let whiteImg = item.imagePathWhite || item.imagePath || '';
                    let blackImg = item.imagePathBlack || item.imagePath || '';
                    let whiteDamaImg = item.damaImagePathWhite || whiteImg;
                    let blackDamaImg = item.damaImagePathBlack || blackImg;

                    pieceStyles += `
                        body[data-piece-style="${key}"] .piece.white { background-image: url('${whiteImg}') !important; background-size: cover !important; background-position: center !important; }
                        body[data-piece-style="${key}"] .piece.black { background-image: url('${blackImg}') !important; background-size: cover !important; background-position: center !important; }
                        body[data-piece-style="${key}"] .piece.white.tawla { background-image: url('${whiteDamaImg}') !important; border: 2px solid #FFD700 !important; box-shadow: 0 0 15px #FFD700, inset 0 0 10px rgba(255,215,0,0.5) !important; }
                        body[data-piece-style="${key}"] .piece.black.tawla { background-image: url('${blackDamaImg}') !important; border: 2px solid #FFD700 !important; box-shadow: 0 0 15px #FFD700, inset 0 0 10px rgba(255,215,0,0.5) !important; }
                        body[data-piece-style="${key}"] .piece.tawla::after {
                            content: '' !important; display: block !important; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                            border-radius: 50%; background: radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,140,0,0) 70%);
                            z-index: -1; animation: goldenVaporAura 1.5s infinite ease-out; pointer-events: none;
                        }
                    `;
                } else if (item.wCss && item.bCss) {
                    pieceStyles += `
                        body[data-piece-style="${key}"] .piece.white { ${item.wCss} }
                        body[data-piece-style="${key}"] .piece.black { ${item.bCss} }
                        body[data-piece-style="${key}"] .piece.tawla { ${item.dCss || ''} }
                    `;
                }
                if (item.customPseudoCss) { pieceStyles += item.customPseudoCss; }
            }
        });

        let styleEl = document.createElement('style');
        styleEl.id = 'dynamic-pieces-css';
        styleEl.innerHTML = pieceStyles;
        document.head.appendChild(styleEl);
    },

    applyBoardThemeCSS(bgKey) {
        const item = STORE_ITEMS[bgKey];
        if (!item || item.type !== 'bg') return;

        let styleEl = document.getElementById('dynamic-board-css');
        if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dynamic-board-css'; document.head.appendChild(styleEl); }

        if (item.isImage) {
            styleEl.innerHTML = `
                #tawla-board { 
                    background-image: url('${item.imagePath}') !important; 
                    background-size: 100% 100% !important; 
                    background-position: center !important; 
                    background-origin: content-box !important; 
                    background-clip: content-box !important;   
                }
                .cell.light { background-color: transparent !important; border: none !important; transition: all 0.5s ease; }
                .cell.dark { background-color: rgba(0,0,0,0.1) !important; border: none !important; transition: all 0.5s ease; }
            `;
        } else if (item.cssLight && item.cssDark) {
            styleEl.innerHTML = `
                #tawla-board { background-image: none !important; background-color: transparent !important; }
                .cell.light { ${item.cssLight} !important; transition: all 0.5s ease; } 
                .cell.dark { ${item.cssDark} !important; transition: all 0.5s ease; }
            `;
        } else {
            document.documentElement.style.setProperty('--light-cell', item.light); document.documentElement.style.setProperty('--dark-cell', item.dark);
            styleEl.innerHTML = '';
        }
    },

    applyFrameThemeCSS(frKey) {
        const item = STORE_ITEMS[frKey];
        if (!item || item.type !== 'fr') return;

        let styleEl = document.getElementById('dynamic-frame-css');
        if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dynamic-frame-css'; document.head.appendChild(styleEl); }

        if (item.customCSS) {
            let cleanCSS = item.customCSS
                .replace(/left:\s*50%\s*!important;/g, '')
                .replace(/transform:\s*translateX\(-50\%\)\s*!important;/g, '')
                .replace(/margin:\s*0\s*!important;/g, 'margin: 50px auto !important;');
            styleEl.innerHTML = cleanCSS;
        } else {
            styleEl.innerHTML = '';
        }
    },

    applyScoreThemeCSS(scoreKey) {
        const item = STORE_ITEMS[scoreKey];
        const root = document.documentElement;
        if (item && item.type === 'score') {
            root.style.setProperty('--my-score-bg', item.scoreBg1 || 'rgba(30, 32, 40, 0.6)');
            root.style.setProperty('--opp-score-bg', item.scoreBg2 || 'rgba(30, 32, 40, 0.6)');
            root.style.setProperty('--my-score-border', item.scoreBorder1 || 'none');
            root.style.setProperty('--opp-score-border', item.scoreBorder2 || 'none');
        }
    },

    getProfile() {
        let profile = null;
        if (window.gameState && window.gameState.userProfile) {
            profile = window.gameState.userProfile;
        } else {
            let p = localStorage.getItem('hub_user_profile');
            if (p) {
                try { profile = JSON.parse(p); } catch(e) {}
            }
        }

        if (profile) {
            if (!Array.isArray(profile.purchasedItems)) profile.purchasedItems = [];
            if (!profile.inventory || typeof profile.inventory !== 'object') profile.inventory = {};
            
            if (!profile.equippedBg || !STORE_ITEMS[profile.equippedBg]) profile.equippedBg = 'bg_wood';
            if (!profile.equippedFr || !STORE_ITEMS[profile.equippedFr]) profile.equippedFr = 'fr_classic';
            if (!profile.equippedPc || !STORE_ITEMS[profile.equippedPc]) profile.equippedPc = 'pc_original';
            if (!profile.equippedScore || !STORE_ITEMS[profile.equippedScore]) profile.equippedScore = 'score_default';

            if (window.gameState) {
                window.gameState.userProfile = profile;
            }
            return profile;
        }
        
        return { purchasedItems: [], inventory: {}, equippedPc: 'pc_original', equippedBg: 'bg_wood', equippedFr: 'fr_classic', equippedScore: 'score_default' };
    },

    buyItem(itemId, itemType = 'item') {
        let profile = this.getProfile();
        const currentLang = localStorage.getItem('app_lang') || localStorage.getItem('appLang') || 'ar';
        const isAr = currentLang !== 'en';
        
        if (!profile || !profile.id) { 
            const msg = isAr ? "يرجى تسجيل الدخول أولاً!" : "Please login first!";
            if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(msg);
            else alert(msg);
            return; 
        }
        
        let item = STORE_ITEMS[itemId];
        if (!item && window.POPULARITY_ITEMS) {
            item = window.POPULARITY_ITEMS.find(p => p.id === itemId);
            if (item) {
                item = { cost: item.price, type: 'popularity', nameAr: item.nameAr };
            }
        }
        
        if (!item) return;
        
        const processMsg = isAr ? "جاري معالجة الشراء عبر السيرفر..." : "Processing purchase...";
        if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(processMsg);
        
        if (window['socket'] && window['socket'].connected) { 
            window['socket'].emit('requestPurchase', { guestId: profile.id, userId: profile.id, itemId: itemId, cost: item.cost, itemType: itemType || item.type }); 
        } else { 
            const errorMsg = isAr ? "يجب أن تكون متصلاً بالسيرفر لإتمام عملية الشراء وحفظها بأمان!" : "You must be online to purchase items safely!";
            if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(errorMsg);
            else alert(errorMsg);
        }
    },

    equipItem(itemId) {
        let profile = this.getProfile();
        const currentLang = localStorage.getItem('app_lang') || localStorage.getItem('appLang') || 'ar';
        const isAr = currentLang !== 'en';

        if (!profile || !profile.id) { 
            const msg = isAr ? "يرجى تسجيل الدخول أولاً لاستخدام العناصر!" : "Please login first to equip items!";
            if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(msg);
            else alert(msg);
            return; 
        }
        
        const item = STORE_ITEMS[itemId];

        if (window['socket'] && window['socket'].connected) { 
            window['socket'].emit('requestEquip', { guestId: profile.id, userId: profile.id, itemId: itemId, itemType: item ? item.type : 'pc' }); 
            if (item) {
                if (item.type === 'bg') { profile.equippedBg = itemId; if(item.linkedScore) profile.equippedScore = item.linkedScore; }
                else if (item.type === 'fr') profile.equippedFr = itemId;
                else if (item.type === 'pc') profile.equippedPc = itemId;
                else if (item.type === 'score') profile.equippedScore = itemId;
                
                if (window.gameState) window.gameState.userProfile = profile;
                if (window.applyTheme) window.applyTheme(profile);
                this.renderUI();
            }
        } else {
            if (!item) return;
            
            if (item.type === 'bg') { 
                profile.equippedBg = itemId; 
                if (item.linkedScore) {
                    profile.equippedScore = item.linkedScore;
                }
            } 
            else if (item.type === 'fr') { profile.equippedFr = itemId; } 
            else if (item.type === 'pc') { profile.equippedPc = itemId; }
            else if (item.type === 'score') { profile.equippedScore = itemId; }
            
            if (window.gameState) {
                window.gameState.userProfile = profile; 
            }
            if (window.applyTheme) {
                window.applyTheme(profile);
            }
            
            localStorage.setItem('hub_user_profile', JSON.stringify(profile));
            this.renderUI();
        }
    },

    renderUI() {
        const storeBg = document.getElementById('store-section-bg'); 
        const storeFr = document.getElementById('store-section-frames'); 
        const storePc = document.getElementById('store-section-pieces');
        const storeOffers = document.getElementById('store-section-offers');

        const bagBg = document.getElementById('theme-grid-section-bg'); 
        const bagFr = document.getElementById('theme-grid-section-frames'); 
        const bagPc = document.getElementById('theme-grid-section-pieces');

        if(storeBg) storeBg.innerHTML = ''; 
        if(storeFr) storeFr.innerHTML = ''; 
        if(storePc) storePc.innerHTML = '';
        if(storeOffers) storeOffers.innerHTML = '';

        if(bagBg) bagBg.innerHTML = ''; 
        if(bagFr) bagFr.innerHTML = ''; 
        if(bagPc) bagPc.innerHTML = '';

        if (typeof window.renderGiftsInBag === 'function') {
            window.renderGiftsInBag();
        }

        const profile = this.getProfile(); 
        const currentLang = localStorage.getItem('app_lang') || localStorage.getItem('appLang') || 'ar';
        const isAr = currentLang !== 'en';
        let storePcEmpty = true, storeBgEmpty = true, storeFrEmpty = true;

        const sortedKeys = Object.keys(STORE_ITEMS).sort((a, b) => {
            const itemA = STORE_ITEMS[a];
            const itemB = STORE_ITEMS[b];
            
            const legA = itemA.isLegendary ? 1 : 0;
            const legB = itemB.isLegendary ? 1 : 0;
            if (legA !== legB) return legB - legA;
            
            const costA = itemA.cost || 0;
            const costB = itemB.cost || 0;
            return costB - costA;
        });

        sortedKeys.forEach(key => {
            const item = STORE_ITEMS[key];
            const targetSection = item.type; 

            if (targetSection === 'score') return;
            
            const safePurchased = Array.isArray(profile.purchasedItems) ? profile.purchasedItems : [];
            const isPurchased = item.isDefault || safePurchased.includes(key);
            
            const isEquipped = (profile.equippedBg === key || profile.equippedPc === key || profile.equippedFr === key);
            const name = isAr ? item.nameAr : item.nameEn;

            const legendaryClassCard = item.isLegendary ? 'legendary-card' : ''; 
            const legendaryClassIcon = item.isLegendary ? 'legendary-icon' : ''; 
            const legendaryClassText = item.isLegendary ? 'legendary-text' : ''; 
            const legendaryClassBtn = item.isLegendary ? 'legendary-btn' : '';
            const legendaryTag = item.isLegendary ? `<span style="position: absolute; top: -5px; right: -5px; background: linear-gradient(45deg, #ff007f, #7f00ff); color: white; font-size: 10px; padding: 3px 8px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 10px #ff007f;">أسطوري</span>` : '';
            const legendaryBagBadge = item.isLegendary ? `<div style="font-size:10px; color:#ffd700; margin-bottom:5px; font-weight:bold;">★ أسطوري ★</div>` : '';

            let visualHtml = '';
            let bagVisualHtml = '';

            if (item.isImage && item.type !== 'fr') {
                let showImg = item.imagePathWhite || item.imagePath || '';
                visualHtml = `<div style="width: 50px; height: 50px; border-radius: 8px; background-image: url('${showImg}'); background-size: cover; background-position: center; margin: 5px 0; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.1)'};" class="${legendaryClassIcon}"></div>`;
            } else if (item.type === 'bg') {
                let bgStyle = (item.cssLight && item.cssDark) ? `<div style="display:flex; flex:1;"><div style="flex:1; ${item.cssLight}"></div><div style="flex:1; ${item.cssDark}"></div></div><div style="display:flex; flex:1;"><div style="flex:1; ${item.cssDark}"></div><div style="flex:1; ${item.cssLight}"></div></div>` : `<div style="display:flex; flex:1; background:${item.light};"></div><div style="flex:1; background:${item.dark};"></div>`;
                visualHtml = `<div style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; margin: 5px 0; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.1)'};" class="${legendaryClassIcon}">${bgStyle}</div>`;
            } else if (item.type === 'fr') {
                let framePreview = '';
                if (item.isImage) {
                    framePreview = `<div style="width: 32px; height: 32px; background: rgba(0,0,0,0.7); background-clip: padding-box; border: 6px solid transparent; border-image: url('${item.imagePath}') 15% stretch;" class="${legendaryClassIcon}"></div>`;
                } else {
                    framePreview = `<div style="width: 32px; height: 32px; background: rgba(0,0,0,0.7); ${item.cssBoard || ''} border-width: 6px !important; border-radius: 4px;" class="${legendaryClassIcon}"></div>`;
                }
                visualHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border-radius: 8px; margin: 5px auto; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.2)'}; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                    ${framePreview}
                </div>`;
            } else if (item.type === 'pc') {
                let customPcStyle = item.wCss ? item.wCss : '';
                visualHtml = `<div style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; position: relative; ${customPcStyle}" class="${legendaryClassIcon}">${item.icon || ''}</div>`;
            } else if (item.type === 'consumable') {
                visualHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: rgba(255,255,255,0.05); border-radius: 8px; margin: 5px 0; border: 1px solid rgba(255,255,255,0.1);" class="${legendaryClassIcon}">${item.icon || '💡'}</div>`;
            }

            bagVisualHtml = visualHtml;

            if (isPurchased) {
                const gridItem = document.createElement('div');
                gridItem.className = `theme-grid-item ${isEquipped ? 'active' : ''} ${legendaryClassCard}`;
                gridItem.onclick = () => {
                    this.equipItem(key);
                    if (window.showEquipNotification) {
                        window.showEquipNotification(item.type);
                    }
                };
                
                if (item.type === 'bg') {
                    if (item.isImage) {
                        bagVisualHtml = `<div class="theme-grid-preview ${legendaryClassIcon}" style="width: 50px; height: 50px; border-radius: 8px; background-image: url('${item.imagePath}'); background-size: cover; background-position: center; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.2)'}; box-shadow: 0 5px 15px rgba(0,0,0,0.5);"></div>`;
                    } else {
                        let bgStyle = (item.cssLight && item.cssDark) ? `<div style="display:flex; flex:1;"><div style="flex:1; ${item.cssLight}"></div><div style="flex:1; ${item.cssDark}"></div></div><div style="display:flex; flex:1;"><div style="flex:1; ${item.cssDark}"></div><div style="flex:1; ${item.cssLight}"></div></div>` : `<div style="display:flex; flex:1; background:${item.light};"></div><div style="flex:1; background:${item.dark};"></div>`;
                        bagVisualHtml = `<div class="theme-grid-preview ${legendaryClassIcon}" style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.2)'}; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">${bgStyle}</div>`;
                    }
                }
                
                gridItem.innerHTML = `${legendaryBagBadge}${bagVisualHtml} <span class="theme-grid-title ${legendaryClassText}" style="margin-top:8px;">${name}</span>`;
                
                if (targetSection === 'bg' && bagBg) bagBg.appendChild(gridItem); 
                else if (targetSection === 'fr' && bagFr) bagFr.appendChild(gridItem); 
                else if (targetSection === 'pc' && bagPc) bagPc.appendChild(gridItem);
            } else {
                const storeCard = document.createElement('div');
                storeCard.className = `store-item-card ${legendaryClassCard}`; storeCard.style.position = 'relative'; 
                
                if (item.hasPurpleBorder) {
                    storeCard.style.border = '1px solid rgba(168, 85, 247, 0.6)'; 
                    storeCard.style.boxShadow = '0 0 12px rgba(168, 85, 247, 0.15), inset 0 0 6px rgba(0,0,0,0.9)';
                }

                storeCard.innerHTML = `${legendaryTag} <div class="${legendaryClassText}" style="color: white; font-weight: 600; font-size: 14px; text-align: center; margin-top: ${item.isLegendary ? '10px' : '0'}; line-height: 1.2;">${name}</div> ${visualHtml} <div style="color: #f5a623; font-size: 13px; font-weight: bold; margin-bottom: 2px; margin-top: auto;"><img src="../Photo/coin.webp" class="app-coin-icon"> ${item.cost}</div>`;
                
                const buyBtn = document.createElement('button');
                buyBtn.className = `store-buy-btn store-buy-btn-small ${legendaryClassBtn}`; buyBtn.innerText = isAr ? 'شراء' : 'Buy';
                buyBtn.onclick = () => { 
                    if (window['openPurchaseModal']) { 
                        window['openPurchaseModal'](key, name, item.cost, item.type); 
                    } else { 
                        this.buyItem(key, item.type); 
                    } 
                };
                
                storeCard.appendChild(buyBtn);

                if (targetSection === 'bg') { 
                    if(storeBg) storeBg.appendChild(storeCard); storeBgEmpty = false; 
                } else if (targetSection === 'fr') { 
                    if(storeFr) storeFr.appendChild(storeCard); storeFrEmpty = false; 
                } else if (targetSection === 'consumable') {
                    if(storeOffers) storeOffers.appendChild(storeCard); 
                } else { 
                    if(storePc) storePc.appendChild(storeCard); storePcEmpty = false; 
                }
            }
        });

        if (storeBg && storeBgEmpty) storeBg.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
        if (storeFr && storeFrEmpty) storeFr.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
        if (storePc && storePcEmpty) storePc.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
    },

    init() {
        if (window.__STORE_RUNNING__) return;
        window.__STORE_RUNNING__ = true;

        this.injectLegendaryAnimations(); 
        this.injectDynamicPieceStyles();
        this.startGapKiller();

        let prof = this.getProfile();
        if (prof) {
            if (window.applyTheme) {
                window.applyTheme(prof);
            }
        }

        let socketAttempts = 0; const maxAttempts = 20;

        const socketCheck = setInterval(() => {
            socketAttempts++;
            if (window['socket']) {
                clearInterval(socketCheck); 
                
                if (!window.__STORE_SOCKET_INIT) {
                    window.__STORE_SOCKET_INIT = true;
                    
                    window['socket'].on('profileUpdated', (updatedProfile) => {
                        if (updatedProfile && window.gameState) {
                            window.gameState.userProfile = { ...window.gameState.userProfile, ...updatedProfile };
                            localStorage.setItem('hub_user_profile', JSON.stringify(window.gameState.userProfile));
                            
                            if (typeof window.applyTheme === 'function') {
                                window.applyTheme(window.gameState.userProfile);
                            }
                        }
                        this.renderUI();
                    });
                    
                    window['socket'].on('purchaseFailed', (msg) => { 
                        if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(msg); 
                        else if (window['triggerCustomAlertNotification']) window['triggerCustomAlertNotification'](msg); 
                    });
                    
                    window['socket'].on('purchaseSuccess', (data) => { 
                        let msg = typeof data === 'string' ? data : (data.message || 'تم الشراء بنجاح! 🎉');
                        
                        if (window.ui && typeof window.ui.showCustomAlert === 'function') {
                            window.ui.playSound(window.ui.sfx.coinsCollect); 
                            const title = window.t ? window.t('alert_store') : "إشعار المتجر 🛒";
                            
                            window.ui.showCustomAlert(msg, title, () => {
                                if (typeof window.ui.spawnCoinShower === 'function') {
                                    window.ui.spawnCoinShower();
                                }
                            });
                        } else if (window['triggerCustomAlertNotification']) {
                            window['triggerCustomAlertNotification'](msg); 
                        }
                        
                        if (typeof window.triggerPurchaseCelebration === 'function') {
                            window.triggerPurchaseCelebration();
                        }
                        
                        if (prof && prof.id) window['socket'].emit('syncProfile', { id: prof.id });
                        this.renderUI();
                    });

                }
                
            } else if (socketAttempts >= maxAttempts) { 
                clearInterval(socketCheck); 
            }
        }, 500);

        setTimeout(() => { this.renderUI(); }, 200);
    }
};

window.storeManager = storeManager;

window.applyTheme = function(profile) {
    if (!profile) return;
    
    if (profile.equippedBg) {
        storeManager.applyBoardThemeCSS(profile.equippedBg);
        
        let bgItem = STORE_ITEMS[profile.equippedBg];
        if (bgItem && bgItem.linkedScore) {
            storeManager.applyScoreThemeCSS(bgItem.linkedScore);
        } else if (profile.equippedScore) {
            storeManager.applyScoreThemeCSS(profile.equippedScore);
        }
    } else if (profile.equippedScore) {
        storeManager.applyScoreThemeCSS(profile.equippedScore);
    }
    
    if (profile.equippedFr) {
        storeManager.applyFrameThemeCSS(profile.equippedFr);
    }
    if (profile.equippedPc) {
        document.body.setAttribute('data-piece-style', profile.equippedPc);
    }
};

window.switchThemeGridTabCategory = function(category) {
    const allTabs = ['bg', 'frames', 'pieces', 'profile-frames', 'gifts'];
    allTabs.forEach(tab => { 
        const btn = document.getElementById('theme-btn-tab-' + tab); 
        const sec = document.getElementById('theme-grid-section-' + tab); 
        if(btn) btn.classList.remove('active'); 
        if(sec) sec.style.display = 'none'; 
    });
    
    const activeBtn = document.getElementById('theme-btn-tab-' + category); 
    const activeSec = document.getElementById('theme-grid-section-' + category);
    
    if(activeBtn) activeBtn.classList.add('active'); 
    if(activeSec) {
        activeSec.style.display = 'grid';
        if (category === 'gifts') {
            window.renderGiftsInBag();
        }
    }
};

window.openPurchaseModal = function(itemId, itemName, price, itemType) {
    window.currentPurchaseItem = { id: itemId, type: itemType, price: price };
    
    const nameEl = document.getElementById('modal-item-name');
    const costEl = document.getElementById('modal-item-cost');
    const previewEl = document.getElementById('modal-item-preview');
    const discountContainer = document.getElementById('discount-container');
    const discountSelect = document.getElementById('modal-discount-select');
    
    const profile = storeManager.getProfile();
    
    if(nameEl) nameEl.innerText = itemName;

    if(discountSelect && discountContainer) {
        discountSelect.innerHTML = '<option value="0">بدون خصم (حفظ القسائم)</option>';
        discountSelect.value = "0";
        discountContainer.style.display = 'none';

        if (itemType !== 'popularity' && itemType !== 'consumable') {
            let hasTickets = false;
            if (profile.discountTickets && Array.isArray(profile.discountTickets) && profile.discountTickets.length > 0) {
                profile.discountTickets.forEach(ticket => {
                    let val = typeof ticket === 'object' ? ticket.rate : ticket;
                    let title = typeof ticket === 'object' ? ticket.title : `خصم ${val}%`;
                    let opt = document.createElement('option');
                    opt.value = val;
                    opt.text = title;
                    discountSelect.appendChild(opt);
                });
                hasTickets = true;
            } else if (profile.discountTicket && profile.discountTicket > 0) {
                let opt = document.createElement('option');
                opt.value = profile.discountTicket;
                opt.text = `خصم ${profile.discountTicket}%`;
                discountSelect.appendChild(opt);
                hasTickets = true;
            }
            if (hasTickets) discountContainer.style.display = 'block';
        }
    }

    let vipLevel = profile.vipLevel || 0;
    let passiveDiscount = 0;
    if (vipLevel === 3) passiveDiscount = 5;       
    else if (vipLevel === 4) passiveDiscount = 10; 
    else if (vipLevel >= 5) passiveDiscount = 15;  

    function formatCompact(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num;
    }

    function updatePriceDisplay() {
        if(!costEl) return;
        let ticketDiscount = (discountSelect && discountContainer && discountContainer.style.display !== 'none') ? (parseInt(discountSelect.value) || 0) : 0;
        let priceHtml = '';
        
        const coinPath = window.location.pathname.includes('/tawla/') ? '../Photo/coin.webp' : 'Photo/coin.webp';
        
        if (itemType !== 'popularity' && (passiveDiscount > 0 || ticketDiscount > 0) && price > 0) {
            let totalDiscount = passiveDiscount + ticketDiscount;
            if (totalDiscount > 100) totalDiscount = 100;
            
            let finalPrice = Math.floor(price * (1 - (totalDiscount / 100)));
            
            priceHtml = `
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <span style="font-size:14px; text-decoration:line-through; color:#a1a1aa;">${formatCompact(price)}</span>
                    <span style="color:#34c759;">${formatCompact(finalPrice)} <img src="${coinPath}" class="app-coin-icon"> <span style="font-size:12px;">(خصم ${totalDiscount}%)</span></span>
                </div>
            `;
        } else {
            priceHtml = `${formatCompact(price)} <img src="${coinPath}" class="app-coin-icon">`;
        }
        costEl.innerHTML = priceHtml;
    }

    if(discountSelect) discountSelect.onchange = updatePriceDisplay;
    updatePriceDisplay();
    
    if (previewEl) {
        let iconHtml = '🎁'; 
        if (STORE_ITEMS[itemId]) {
            const item = STORE_ITEMS[itemId];
            if (item.isImage) {
                let imgSrc = item.imagePathWhite || item.imagePath;
                iconHtml = `<img src="${imgSrc}" style="max-width: 85%; max-height: 85%; object-fit: contain;">`;
            } else if (item.icon) {
                iconHtml = item.icon;
            } else if (itemType === 'consumable') {
                iconHtml = '💡';
            }
        } 
        previewEl.innerHTML = iconHtml;
    }

    const confirmBuyBtn = document.getElementById('confirm-buy-btn');
    if (confirmBuyBtn) {
        confirmBuyBtn.onclick = function() {
            if (!profile || !profile.id) return;
            if (!window.currentPurchaseItem) return;
            
            let appliedDiscountRate = 0;
            if (discountSelect && discountContainer && discountContainer.style.display !== 'none') {
                appliedDiscountRate = parseInt(discountSelect.value) || 0;
            }

            const purchaseModal = document.getElementById('purchase-modal');
            if(purchaseModal) purchaseModal.style.display = 'none';

            if (window['socket'] && window['socket'].connected) {
                if (window.socketManager && typeof window.socketManager._showToast === 'function') {
                    window.socketManager._showToast("جاري معالجة الشراء...");
                }
                window['socket'].emit('requestPurchase', { 
                    guestId: profile.id, 
                    userId: profile.id,
                    itemId: window.currentPurchaseItem.id,
                    appliedDiscountRate: appliedDiscountRate
                });
            } else {
                 if (window.socketManager && typeof window.socketManager._showToast === 'function') {
                    window.socketManager._showToast("السيرفر غير متصل حالياً!");
                }
            }
        };
    }
    
    const purchaseModal = document.getElementById('purchase-modal');
    if(purchaseModal) purchaseModal.style.display = 'flex';
};
