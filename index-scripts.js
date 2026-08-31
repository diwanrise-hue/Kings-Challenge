// ملف: index-scripts.js
// 🌟 النسخة المحدثة والمتوافقة بالكامل مع السيرفر المركزي وجدار الحماية (AuthToken) 🌟
// 🛡️ (مُحدّث): حماية أزرار التسجيل من الـ Spam.
// 🛡️ (مُحدّث): التحقق الصارم من كلمات المرور وتأمين حسابات الزوار.
// 🛠️ (مُحدّث): تحديث معرّفات (IDs) نافذة الدخول لمنع التضارب.
// 💰 (مُحدّث): توحيد منطق الخصومات العادلة.

function formatCompactNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
}

window.openAppModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        if (modalId === 'themes-grid-overlay') {
            if (typeof window.hubSwitchThemeGridTabCategory === 'function') {
                window.hubSwitchThemeGridTabCategory('bg');
            } else if (typeof window.switchThemeGridTabCategory === 'function') {
                window.switchThemeGridTabCategory('bg');
            }
        }
        
        if (modalId === 'store-modal') {
            if (typeof window.switchStoreTabCategory === 'function') {
                window.switchStoreTabCategory('bg');
            }
        }
    }
};

window.closeAppModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
};

window.triggerCustomAlertNotification = function(msg) {
    showCustomPopup(msg);
};

// 🌟 قاعدة بيانات الإطارات محقونة مباشرة لضمان عدم ضياعها
const GITHUB_PROFILE_BASE = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/storeAll/profile/";
window.PROFILE_FRAMES_ITEMS = [
    { id: 'pf_ruby', nameAr: 'إطار الياقوت الملكي', price: 15000, imagePath: GITHUB_PROFILE_BASE + 'Profil2.webp' },
    { id: 'pf_dragon', nameAr: 'إطار التنين الذهبي', price: 35000, imagePath: GITHUB_PROFILE_BASE + 'Profile4.webp' },
    { id: 'pf_noble', nameAr: 'إطار النبلاء الأسود', price: 10000, imagePath: GITHUB_PROFILE_BASE + 'Profile7.webp' }
];

// 🌟 دالة فتح نافذة تأكيد الشراء (تدعم الآن الشعبية وإطارات البروفايل مع توحيد الخصم)
let currentPurchaseItem = null;

window.openPurchaseModal = function(itemId, itemName, price, itemType) {
    currentPurchaseItem = { id: itemId, type: itemType, price: price };
    
    const nameEl = document.getElementById('modal-item-name');
    const costEl = document.getElementById('modal-item-cost');
    const previewEl = document.getElementById('modal-item-preview');
    const discountContainer = document.getElementById('discount-container');
    const discountSelect = document.getElementById('modal-discount-select');
    
    const profile = getSafeProfile();
    
    if(nameEl) nameEl.innerText = itemName;

    if(discountSelect && discountContainer) {
        discountSelect.innerHTML = '<option value="0">بدون خصم (حفظ القسائم)</option>';
        discountSelect.value = "0";
        discountContainer.style.display = 'none';

        if (itemType !== 'consumable') {
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

    // 🛡️ (مُحدّث): حل خلل حساب التخفيض المزدوج لتكون الخصومات عادلة للاعب
    function updatePriceDisplay() {
        if(!costEl) return;
        let ticketDiscount = (discountSelect && discountContainer && discountContainer.style.display !== 'none') ? (parseInt(discountSelect.value) || 0) : 0;
        let priceHtml = '';
        
        if (itemType !== 'popularity' && (passiveDiscount > 0 || ticketDiscount > 0) && price > 0) {
            let totalDiscount = passiveDiscount + ticketDiscount;
            if (totalDiscount > 100) totalDiscount = 100;
            
            let finalPrice = Math.floor(price * (1 - (totalDiscount / 100)));
            
            priceHtml = `
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <span style="font-size:14px; text-decoration:line-through; color:var(--text-secondary);">${formatCompactNumber(price)}</span>
                    <span style="color:#34c759;">${formatCompactNumber(finalPrice)} 🪙 <span style="font-size:12px;">(خصم ${totalDiscount}%)</span></span>
                </div>
            `;
        } else {
            priceHtml = `${formatCompactNumber(price)} 🪙`;
        }
        costEl.innerHTML = priceHtml;
    }

    if(discountSelect) discountSelect.onchange = updatePriceDisplay;
    updatePriceDisplay();
    
    if (previewEl) {
        let iconHtml = '🎁'; 
        if (window.STORE_ITEMS && window.STORE_ITEMS[itemId]) {
            const item = window.STORE_ITEMS[itemId];
            if (item.isImage) {
                let imgSrc = item.imagePathWhite || item.imagePath;
                iconHtml = `<img src="${imgSrc}" style="max-width: 85%; max-height: 85%; object-fit: contain;">`;
            } else if (item.icon) {
                iconHtml = item.icon;
            } else if (itemType === 'consumable') {
                iconHtml = '💡';
            }
        } 
        else if (itemType === 'popularity' || (window.POPULARITY_ITEMS && window.POPULARITY_ITEMS.some(p => p.id === itemId))) {
             if (window.POPULARITY_ITEMS) {
                 const popItem = window.POPULARITY_ITEMS.find(p => p.id === itemId);
                 if (popItem) {
                     if (popItem.mediaType === 'video') {
                         iconHtml = `<video src="${popItem.videoPath}" autoplay loop muted playsinline style="max-width: 100%; max-height: 100%; object-fit: cover;"></video>`;
                     } else {
                         iconHtml = `<img src="${popItem.imagePath}" style="max-width: 85%; max-height: 85%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">`;
                     }
                 } else {
                     iconHtml = '<span style="filter: hue-rotate(210deg);">🔥</span>';
                 }
             }
        } 
        else if (itemType === 'profile_frame' && window.PROFILE_FRAMES_ITEMS) {
             const pfItem = window.PROFILE_FRAMES_ITEMS.find(p => p.id === itemId);
             if (pfItem) {
                 iconHtml = `<div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                                <img src="Photo/1000132081.webp" style="position: absolute; width: 60%; height: 60%; border-radius: 50%; opacity: 0.5;">
                                <img src="${pfItem.imagePath}" style="position: relative; width: 90%; height: 90%; object-fit: contain; z-index: 2;">
                             </div>`;
             }
        }
        else if (itemType === 'consumable') {
            iconHtml = '💡';
        }
        
        previewEl.innerHTML = iconHtml;
    }
    
    window.openAppModal('purchase-modal');
};

document.addEventListener('DOMContentLoaded', () => {
    const confirmBuyBtn = document.getElementById('confirm-buy-btn');
    if (confirmBuyBtn) {
        confirmBuyBtn.addEventListener('click', () => {
            const profile = getSafeProfile();
            
            if (!profile || !profile.id || profile.id === "GUEST-DEFAULT") {
                showCustomPopup((typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang].msg_must_login) ? translations[currentLang].msg_must_login : "يرجى تسجيل الدخول أولاً!");
                return;
            }

            if (!currentPurchaseItem) return;
            
            let appliedDiscountRate = 0;
            const discountSelect = document.getElementById('modal-discount-select');
            const discountContainer = document.getElementById('discount-container');
            if (discountSelect && discountContainer && discountContainer.style.display !== 'none') {
                appliedDiscountRate = parseInt(discountSelect.value) || 0;
            }

            window.closeAppModal('purchase-modal');

            if (typeof socket !== 'undefined' && socket.connected) {
                showLoadingPopup("جاري معالجة الشراء...");
                socket.emit('requestPurchase', { 
                    guestId: profile.id, 
                    userId: profile.id,
                    itemId: currentPurchaseItem.id,
                    appliedDiscountRate: appliedDiscountRate 
                });
            } else {
                showCustomPopup("السيرفر غير متصل حالياً!");
            }
        });
    }
});

// ==========================================
window.fbAsyncInit = function() {
    FB.init({
        appId      : '2054342995162540', 
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
    });
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

const langs = ['ar', 'en', 'ku'];
let currentLang = localStorage.getItem('app_lang') || 'ar';
if (!langs.includes(currentLang)) currentLang = 'ar';
let isLoginMode = false; 

window.switchNavTab = function(tabName) {
    document.querySelectorAll('.nav-section-container').forEach(el => {
        el.classList.remove('active-section');
    });
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });

    document.getElementById(`nav-section-${tabName}`).classList.add('active-section');
    event.currentTarget.classList.add('active');

    if (tabName === 'store') {
        if (typeof window.switchStoreTabCategory === 'function') {
            window.switchStoreTabCategory('bg');
        }
    }
};

window.toggleHamburgerMenu = function() {
    document.getElementById('side-drawer-overlay').classList.add('show');
    document.getElementById('side-drawer').classList.add('show');
};

window.closeHamburgerMenu = function() {
    document.getElementById('side-drawer-overlay').classList.remove('show');
    document.getElementById('side-drawer').classList.remove('show');
};

window.openLangModal = function() { document.getElementById('lang-select-modal').style.display = 'flex'; };
window.closeLangModal = function() { document.getElementById('lang-select-modal').style.display = 'none'; };

window.openBgModal = function() { document.getElementById('bg-select-modal').style.display = 'flex'; };
window.closeBgModal = function() { document.getElementById('bg-select-modal').style.display = 'none'; };

window.setPredefinedBackground = function(bgValue) {
    if (bgValue === 'default') {
        document.body.style.backgroundImage = 'radial-gradient(circle at 50% 0%, #1a1a24 0%, var(--bg-deep) 80%)';
        localStorage.removeItem('custom_app_bg');
    } else {
        document.body.style.backgroundImage = `url('${bgValue}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        localStorage.setItem('custom_app_bg', bgValue);
    }
    closeBgModal();
};

window.toggleRadio = function() {
    const radioModal = document.getElementById('radio-modal');
    if (radioModal) {
        radioModal.style.display = radioModal.style.display === 'flex' ? 'none' : 'flex';
    } else if (typeof window.toggleRadioUi === 'function') {
        window.toggleRadioUi();
    }
};

window.changeAppBackground = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgUrl = e.target.result;
            document.body.style.backgroundImage = `url('${imgUrl}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            localStorage.setItem('custom_app_bg', imgUrl);
        };
        reader.readAsDataURL(file);
    }
};

window.selectLanguage = function(lang) {
    if (!langs.includes(lang)) return;
    currentLang = lang;
    
    localStorage.setItem('app_lang', currentLang);
    localStorage.setItem('appLang', currentLang);

    document.documentElement.lang = currentLang;
    document.documentElement.dir = (currentLang === 'ar' || currentLang === 'ku') ? 'rtl' : 'ltr';
    
    if (typeof updateTranslations === 'function') {
        updateTranslations();
    }

    const gameIframe = document.getElementById('game-frame');
    if (gameIframe && gameIframe.contentWindow) {
        gameIframe.contentWindow.postMessage({ type: 'LANGUAGE_CHANGED', lang: currentLang }, '*');
    }
    
    if (typeof window.setRadioLanguage === 'function') {
        window.setRadioLanguage(currentLang);
    }

    closeLangModal();
};

window.updateTranslations = function() {
    if (typeof translations === 'undefined') return;
    const t = translations[currentLang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
    
    const toggleLink = document.getElementById('auth-toggle-mode-link');
    if(toggleLink) {
        if(isLoginMode) {
            document.getElementById('auth-modal-title').innerText = t.login_tab_title;
            document.getElementById('auth-modal-desc').innerText = t.login_tab_desc;
            document.getElementById('auth-primary-submit-btn').innerText = t.login_tab_btn;
            toggleLink.innerText = t.login_tab_toggle;
            
            const nameLabel = document.querySelector('label[data-i18n="login_name_label"]');
            if (nameLabel) nameLabel.innerText = "المعرف الخاص بك (ID)";
        } else {
            document.getElementById('auth-modal-title').innerText = t.register_tab_title;
            document.getElementById('auth-modal-desc').innerText = t.register_tab_desc;
            document.getElementById('auth-primary-submit-btn').innerText = t.register_tab_btn;
            toggleLink.innerText = t.register_tab_toggle;
            
            const nameLabel = document.querySelector('label[data-i18n="login_name_label"]');
            if (nameLabel) nameLabel.innerText = t.login_name_label || "الاسم";
        }
    }

    forceUpdateRadioUI();
    syncHubProfile(); 
};

window.forceUpdateRadioUI = function() {
    const radioModal = document.getElementById('radio-modal');
    if (radioModal && typeof RADIO_TRANSLATIONS !== 'undefined') {
        const rt = RADIO_TRANSLATIONS[currentLang];
        if (rt) {
            radioModal.setAttribute('dir', rt.direction);
            
            const titleEl = document.getElementById('ui-radio-title');
            if(titleEl) titleEl.innerText = rt.title;
            
            const enBtn = document.getElementById('btn-station-english');
            if(enBtn) enBtn.innerText = rt.cat_english;
            
            const arBtn = document.getElementById('btn-station-arabic');
            if(arBtn) arBtn.innerText = rt.cat_arabic;
            
            const kuBtn = document.getElementById('btn-station-kurdish');
            if(kuBtn) kuBtn.innerText = rt.cat_kurdish;
            
            const actionBtn = document.getElementById('radio-toggle-action-btn');
            if (actionBtn) {
                if (actionBtn.classList.contains('stop-btn')) {
                    actionBtn.innerText = rt.stop_btn;
                } else {
                    actionBtn.innerText = rt.play_btn;
                }
            }
        }
    }
};

const socket = io('https://diwanrise-dama-game-diwan.hf.space/dama', { transports: ['websocket', 'polling'] });
window.socket = socket; 

socket.on('connect', () => {
    console.log('تم الاتصال بالسيرفر بنجاح!');
    const profileRaw = localStorage.getItem('hub_user_profile');
    if (profileRaw) {
        try {
            const profile = JSON.parse(profileRaw);
            if (profile && profile.id) {
                socket.emit('deviceFingerprint', { guestId: profile.id, authToken: profile.authToken });
            }
        } catch(e) {}
    }
});

window.getSafeProfile = function() {
    const guestName = (typeof translations !== 'undefined') ? translations[currentLang].guest_name : "Guest_";
    const defaultProfile = {
        id: "GUEST-DEFAULT",
        name: guestName + "0000",
        avatar: 'Photo/1000132081.webp',
        isCustomAvatar: false,
        tokens: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        friends: [],
        purchasedItems: [],
        equippedBg: 'bg_wood',
        equippedFr: 'fr_classic',
        equippedPc: 'pc_original',
        popularity: 0,
        vipLevel: 0,   
        vipPoints: 0   
    };

    try {
        const profileRaw = localStorage.getItem('hub_user_profile');
        if (!profileRaw) return defaultProfile;
        const parsed = JSON.parse(profileRaw);
        if (parsed && typeof parsed === 'object') {
            if (parsed.popularity === undefined) parsed.popularity = 0;
            if (parsed.vipLevel === undefined) parsed.vipLevel = 0;
            if (parsed.vipPoints === undefined) parsed.vipPoints = 0;
            return parsed;
        }
    } catch (e) { }
    return defaultProfile;
};

// 🌟 أحداث الاستجابة الجديدة للسيرفر بعد الجدار الناري 🌟
socket.on('authRegisterSuccess', (data) => {
    const btn = document.getElementById('auth-primary-submit-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; } // إعادة تفعيل الزر
    
    document.getElementById('custom-popup-modal').style.display = 'none';
    showCustomPopup(data.msg);
    localStorage.setItem('hub_user_profile', JSON.stringify(data.profile));
    
    // إخفاء نافذة الـ Login المحدثة
    window.closeAppModal('hub-login-modal');
    window.checkUserAuthentication();
});

socket.on('authLoginSuccess', (data) => {
    const btn = document.getElementById('auth-primary-submit-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; } // إعادة تفعيل الزر
    
    document.getElementById('custom-popup-modal').style.display = 'none';
    showCustomPopup(data.msg);
    localStorage.setItem('hub_user_profile', JSON.stringify(data.profile));
    
    window.closeAppModal('hub-login-modal');
    window.checkUserAuthentication();
});

socket.on('authError', (data) => {
    const btn = document.getElementById('auth-primary-submit-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; } // إعادة تفعيل الزر
    
    document.getElementById('custom-popup-modal').style.display = 'none';
    showCustomPopup(data.msg);
});

socket.on('profileUpdated', (updatedProfile) => {
    localStorage.setItem('hub_user_profile', JSON.stringify(updatedProfile));
    syncHubProfile();
    updateHubPopularity(); 
    
    if (typeof window.updateVipProgressBarUI === 'function') {
        window.updateVipProgressBarUI();
    }
    
    if (typeof window.hubRenderProfileFramesInBag === 'function') {
        window.hubRenderProfileFramesInBag();
    }

    if (window.storeManager && typeof window.storeManager.renderUI === 'function') {
        window.storeManager.renderUI();
    }
    
    const gameIframe = document.getElementById('game-frame');
    if (gameIframe && gameIframe.contentWindow) {
        gameIframe.contentWindow.postMessage({ type: 'PROFILE_UPDATED', profile: updatedProfile }, '*');
    }
});

socket.on('royalEntrance', (data) => {
    if(document.getElementById('vip-entrance-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'vip-entrance-banner';
    banner.className = 'royal-entrance-banner';
    
    let roleMsg = data.type === 'spectator' ? 'لمشاهدة المباراة 🍿' : 'إلى الساحة ⚔️';
    
    let badge = data.vipLevel >= 4 ? '💎' : '👑';
    let color = data.vipLevel >= 4 ? 'rgba(0, 210, 255, 0.8)' : 'rgba(212, 175, 55, 0.8)';
    let glow = data.vipLevel >= 4 ? 'rgba(0, 210, 255, 0.6)' : 'rgba(255, 215, 0, 0.6)';
    
    banner.style.background = `linear-gradient(90deg, transparent, ${color}, transparent)`;
    banner.style.boxShadow = `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${glow}`;
    
    banner.innerHTML = `
        <span style="font-size: 26px; filter: drop-shadow(0 0 5px white);">${badge}</span> 
        دخل الـ VIP <span style="color:#fff; font-weight:900; margin:0 5px; text-shadow: 0 0 5px white;">${data.name}</span> ${roleMsg}
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
        if(banner && banner.parentNode) banner.parentNode.removeChild(banner);
    }, 4000);
});

socket.on('purchaseSuccess', (msg) => {
    document.getElementById('custom-popup-modal').style.display = 'none';
    if(typeof msg === 'string') {
        showCustomPopup(msg);
    } else if(msg && msg.message) {
        showCustomPopup(msg.message);
    } else {
        showCustomPopup("تمت عملية الشراء بنجاح!");
    }
    
    if (window.storeManager && typeof window.storeManager.renderUI === 'function') {
        window.storeManager.renderUI();
    }
    
    setTimeout(() => {
        if (typeof window.hubRenderProfileFramesInBag === 'function') {
            window.hubRenderProfileFramesInBag();
        }
    }, 500);
});

socket.on('purchaseFailed', (msg) => {
    document.getElementById('custom-popup-modal').style.display = 'none';
    showCustomPopup(msg || "فشلت عملية الشراء!");
});

window.showLoadingPopup = function(msg) {
    document.getElementById('custom-popup-modal').style.display = 'flex';
    document.getElementById('custom-popup-msg').innerText = msg;
    document.getElementById('custom-popup-input-group').style.display = 'none';
    document.getElementById('custom-popup-ok').style.display = 'none'; 
    document.getElementById('custom-popup-cancel').style.display = 'none';
    customPopupCallback = null;
};

// 🛡️ (مُحدّث): حل مشكلة تعطل السيرفر عند غياب الصورة، وتمرير الـ Token 
window.loginWithFacebook = function() {
    if (typeof FB === 'undefined') { showCustomPopup(translations[currentLang].msg_fb_connect); return; }

    FB.login(function(response) {
        if (response.authResponse) {
            const loadingMsg = currentLang === 'ar' ? "جاري جلب البيانات من فيسبوك..." : "Fetching Facebook data...";
            showLoadingPopup(loadingMsg);

            FB.api('/me?fields=id,name,picture.width(200).height(200)', function(fbUser) {
                if (fbUser && !fbUser.error) {
                    let profileRaw = localStorage.getItem('hub_user_profile');
                    let myAuthToken = null;
                    if (profileRaw) { try { myAuthToken = JSON.parse(profileRaw).authToken; } catch(e){} }
                    if (!myAuthToken) myAuthToken = 'tk_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

                    const avatarUrl = fbUser.picture?.data?.url || 'Photo/1000132081.webp';

                    const payload = {
                        fbId: fbUser.id,
                        name: fbUser.name,
                        avatar: avatarUrl,
                        newAuthToken: myAuthToken
                    };
                    
                    if (socket && socket.connected) {
                        socket.emit('loginWithFacebook', payload);
                    } else {
                        socket.connect();
                        const onConnectFb = () => {
                            socket.emit('loginWithFacebook', payload);
                            socket.off('connect', onConnectFb);
                        };
                        socket.on('connect', onConnectFb);
                        
                        setTimeout(() => {
                            if (!socket.connected) {
                                showCustomPopup(translations[currentLang].msg_server_fail);
                                socket.off('connect', onConnectFb);
                            }
                        }, 10000);
                    }
                } else {
                    showCustomPopup(currentLang === 'ar' ? "فشل جلب بيانات فيسبوك من المتصفح." : "Failed to fetch data from browser.");
                }
            });
        }
    }); 
};

window.linkGuestWithFacebook = function() {
    if (typeof FB === 'undefined') { showCustomPopup(translations[currentLang].msg_fb_connect); return; }
    
    FB.login(function(response) {
        if (response.authResponse) {
            const loadingMsg = currentLang === 'ar' ? "جاري ربط الحساب..." : "Linking account...";
            showLoadingPopup(loadingMsg);

            FB.api('/me?fields=id,name,picture.width(200).height(200)', function(fbUser) {
                if (fbUser && !fbUser.error) {
                    const profile = getSafeProfile();
                    const avatarUrl = fbUser.picture?.data?.url || 'Photo/1000132081.webp';

                    const payload = {
                        guestId: profile.id,
                        fbId: fbUser.id,
                        name: fbUser.name,
                        avatar: avatarUrl,
                        newAuthToken: profile.authToken 
                    };

                    if (socket && socket.connected) {
                        socket.emit('loginWithFacebook', payload); 
                    } else {
                        socket.connect();
                        const onConnectLink = () => {
                            socket.emit('loginWithFacebook', payload);
                            socket.off('connect', onConnectLink);
                        };
                        socket.on('connect', onConnectLink);
                        
                        setTimeout(() => {
                            if (!socket.connected) {
                                showCustomPopup(translations[currentLang].msg_server_fail);
                                socket.off('connect', onConnectLink);
                            }
                        }, 10000);
                    }
                } else {
                    showCustomPopup(currentLang === 'ar' ? "فشل جلب بيانات فيسبوك من المتصفح." : "Failed to fetch data from browser.");
                }
            });
        }
    }); 
};

window.toggleAuthMode = function() {
    isLoginMode = !isLoginMode;
    const titleEl = document.getElementById('auth-modal-title');
    const descEl = document.getElementById('auth-modal-desc');
    const submitBtn = document.getElementById('auth-primary-submit-btn');
    const toggleLink = document.getElementById('auth-toggle-mode-link');
    const avatarGroup = document.getElementById('avatar-select-group');
    const nameLabel = document.querySelector('label[data-i18n="login_name_label"]');

    const t = translations[currentLang];

    if (isLoginMode) {
        titleEl.innerText = t.login_tab_title;
        descEl.innerText = t.login_tab_desc;
        submitBtn.innerText = t.login_tab_btn;
        toggleLink.innerText = t.login_tab_toggle;
        avatarGroup.style.display = 'none'; 
        if (nameLabel) nameLabel.innerText = "المعرف الخاص بك (ID)";
    } else {
        titleEl.innerText = t.register_tab_title;
        descEl.innerText = t.register_tab_desc;
        submitBtn.innerText = t.register_tab_btn;
        toggleLink.innerText = t.register_tab_toggle;
        avatarGroup.style.display = 'block';
        if (nameLabel) nameLabel.innerText = t.login_name_label || "الاسم";
    }
};

let customPopupCallback = null;

window.showCustomPopup = function(msg, isPrompt = false, defaultValue = "", showCancel = false, callback = null) {
    document.getElementById('custom-popup-modal').style.display = 'flex';
    document.getElementById('custom-popup-msg').innerText = msg;
    
    const inputContainer = document.getElementById('custom-popup-input-group');
    const inputEl = document.getElementById('custom-popup-input');
    const cancelBtn = document.getElementById('custom-popup-cancel');
    const okBtn = document.getElementById('custom-popup-ok');
    
    okBtn.style.display = 'block'; 

    if (isPrompt) {
        inputContainer.style.display = 'block';
        inputEl.value = defaultValue;
        inputEl.focus();
        cancelBtn.style.display = 'block';
    } else {
        inputContainer.style.display = 'none';
        cancelBtn.style.display = showCancel ? 'block' : 'none';
    }
    
    if (typeof translations !== 'undefined') {
        okBtn.innerText = translations[currentLang].btn_ok;
        cancelBtn.innerText = translations[currentLang].btn_cancel;
    }
    customPopupCallback = callback;
};

window.closeCustomPopup = function(isOk) {
    document.getElementById('custom-popup-modal').style.display = 'none';
    if (customPopupCallback) {
        const isPrompt = document.getElementById('custom-popup-input-group').style.display === 'block';
        const inputVal = document.getElementById('custom-popup-input').value;
        if (isPrompt) customPopupCallback(isOk ? inputVal : null);
        else customPopupCallback(isOk);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const customPopupOk = document.getElementById('custom-popup-ok');
    if (customPopupOk) customPopupOk.addEventListener('click', () => closeCustomPopup(true));
    
    const customPopupCancel = document.getElementById('custom-popup-cancel');
    if (customPopupCancel) customPopupCancel.addEventListener('click', () => closeCustomPopup(false));
});

window.triggerAlertSoon = function() { 
    if(typeof translations !== 'undefined') {
        showCustomPopup(translations[currentLang].msg_soon); 
    } else {
        showCustomPopup("قريباً");
    }
};

// 🛡️ (مُحدّث): حماية زر التسجيل من الـ Spam والتوافق مع الـ IDs الجديدة
window.submitManualAuthForm = function() {
    const nameOrIdInput = document.getElementById('hub-login-name-input').value.trim();
    const passInput = document.getElementById('hub-login-password-input').value;
    const avatarSelect = document.getElementById('hub-login-avatar-select').value;

    if (!nameOrIdInput) return showCustomPopup(isLoginMode ? "الرجاء إدخال المعرف (ID)" : (translations[currentLang].msg_no_name || "الرجاء إدخال الاسم"));
    if (!passInput) return showCustomPopup(translations[currentLang].msg_no_pass || "الرجاء إدخال كلمة المرور");
    
    if (!isLoginMode && String(passInput).trim().length < 6) {
        return showCustomPopup("كلمة المرور ضعيفة! يجب أن تتكون من 6 أحرف/أرقام على الأقل.");
    }

    if (!socket || !socket.connected) {
        showCustomPopup(translations[currentLang].msg_server_fail || "السيرفر غير متصل، جاري المحاولة...");
        socket.connect(); 
        return;
    }

    const btn = document.getElementById('auth-primary-submit-btn');
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }

    let profileRaw = localStorage.getItem('hub_user_profile');
    let myAuthToken = null;
    if (profileRaw) {
        try { myAuthToken = JSON.parse(profileRaw).authToken; } catch(e){}
    }
    if (!myAuthToken) {
        myAuthToken = 'tk_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }

    showLoadingPopup(currentLang === 'ar' ? "جاري المعالجة..." : "Processing...");

    if (isLoginMode) {
        socket.emit('loginAccount', { 
            id: nameOrIdInput, 
            password: passInput, 
            newAuthToken: myAuthToken 
        });
    } else {
        socket.emit('registerAccount', { 
            name: nameOrIdInput, 
            password: passInput, 
            authToken: myAuthToken,
            avatar: avatarSelect 
        });
    }
    
    setTimeout(() => {
        if (btn && btn.disabled) {
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }, 5000);
};

window.addEventListener('load', () => {
    history.replaceState({ view: 'hub' }, '');
    
    if (!localStorage.getItem('appLang')) {
        localStorage.setItem('appLang', currentLang);
    }
    
    document.documentElement.lang = currentLang;
    document.documentElement.dir = (currentLang === 'ar' || currentLang === 'ku') ? 'rtl' : 'ltr';
    
    if (typeof updateTranslations === 'function') {
        updateTranslations();
    }

    const savedBg = localStorage.getItem('custom_app_bg');
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
    }

    const splash = document.getElementById('splash-screen');
    setTimeout(() => {
        splash.style.opacity = '0';
        splash.style.visibility = 'hidden';
        setTimeout(() => { 
            splash.style.display = 'none'; 
            checkUserAuthentication(); 
            updateHubPopularity(); 
        }, 800);
    }, 2000);
});

window.checkUserAuthentication = function() {
    let globalProfile = localStorage.getItem('hub_user_profile');
    if (globalProfile) {
        try {
            JSON.parse(globalProfile);
            document.getElementById('hub-login-modal').style.display = 'none';
            document.getElementById('game-selector').style.display = 'flex';
            document.getElementById('bottom-nav-bar').style.display = 'flex';
            syncHubProfile();
        } catch (e) {
            localStorage.removeItem('hub_user_profile');
            document.getElementById('game-selector').style.display = 'none';
            document.getElementById('bottom-nav-bar').style.display = 'none';
            document.getElementById('hub-login-modal').style.display = 'flex';
        }
    } else {
        document.getElementById('game-selector').style.display = 'none';
        document.getElementById('bottom-nav-bar').style.display = 'none';
        document.getElementById('hub-login-modal').style.display = 'flex';
    }
};

window.loginAsGuest = function() {
    const guestName = (typeof translations !== 'undefined') ? translations[currentLang].guest_name : "Guest_";
    const randomId = "GUEST-" + Math.floor(100000 + Math.random() * 900000);
    const randomName = guestName + Math.floor(1000 + Math.random() * 9000);
    const newAuthToken = 'tk_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    
    const guestProfile = {
        id: randomId, name: randomName, avatar: 'Photo/1000132081.webp',
        authToken: newAuthToken, 
        isCustomAvatar: false,
        tokens: 10000, gamesPlayed: 0, wins: 0, losses: 0, friends: [], popularity: 0,
        purchasedItems: [], equippedBg: 'bg_wood', equippedFr: 'fr_classic', equippedPc: 'pc_original',
        vipLevel: 0, vipPoints: 0
    };

    try {
        localStorage.setItem('hub_user_profile', JSON.stringify(guestProfile));
        checkUserAuthentication();
        if (socket && socket.connected) {
            socket.emit('deviceFingerprint', { guestId: randomId, authToken: newAuthToken });
        }
    } catch (err) {}
};

window.showEquipNotification = function(itemType) {
    const toast = document.getElementById('toast-notification'); if (!toast) return;
    let msg = window.t ? window.t('toast_default') : "تم تجهيز العنصر بنجاح";
    if (itemType === 'bg') msg = window.t ? window.t('toast_bg') : "تم تغيير الساحة بنجاح";
    else if (itemType === 'fr') msg = window.t ? window.t('toast_fr') : "تم تغيير الإطار بنجاح";
    else if (itemType === 'pc') msg = window.t ? window.t('toast_pc') : "تم تغيير الحجر بنجاح";
    else if (itemType === 'score') msg = window.t ? window.t('toast_score') : "تم تغيير شكل الشريط بنجاح";
    toast.innerText = '✨ ' + msg; toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); }, 2500);

    setTimeout(() => {
        try {
            let profStr = localStorage.getItem('hub_user_profile');
            if (profStr) {
                let prof = JSON.parse(profStr);

                if (typeof window.applyTheme === 'function') window.applyTheme(prof);
                if (window.ui && typeof window.ui.renderBoard === 'function') window.ui.renderBoard(true);

                const gameIframe = document.getElementById('game-frame');
                if (gameIframe && gameIframe.contentWindow) {
                    gameIframe.contentWindow.postMessage({ type: 'PROFILE_UPDATED', profile: prof }, '*');
                }
            }
        } catch(e) {}
    }, 50);
};

window.syncHubProfile = function() {
    let globalProfile = localStorage.getItem('hub_user_profile');
    if (!globalProfile) return;
    
    const profile = getSafeProfile();
    const tokenVal = profile.tokens || 0;
    const tokenWord = (typeof translations !== 'undefined') ? translations[currentLang].token_word : " Tokens";
    const tokenText = tokenVal + tokenWord;

    if (document.getElementById('hub-token-count')) document.getElementById('hub-token-count').innerText = tokenVal;
    if (document.getElementById('profile-stat-tokens')) document.getElementById('profile-stat-tokens').innerText = tokenText;
    if (document.getElementById('profile-stat-tokens-store')) document.getElementById('profile-stat-tokens-store').innerText = tokenVal;
    
    const nameEl = document.getElementById('profile-display-name');
    if (nameEl) {
        if (profile.vipLevel > 0) {
            nameEl.innerHTML = `<span style="color:#ffd700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);">👑 ${profile.name}</span>`;
        } else {
            nameEl.innerText = profile.name;
        }
    }
    
    if (document.getElementById('profile-display-id')) document.getElementById('profile-display-id').innerText = profile.id;
    
    let finalAvatarSrc = profile.avatar || 'Photo/1000132081.webp';
    const isFullUrl = finalAvatarSrc.startsWith('http://') || finalAvatarSrc.startsWith('https://') || finalAvatarSrc.startsWith('data:image');
    if (!isFullUrl) {
        let cleanName = finalAvatarSrc.replace(/\.\.\//g, '').replace('Photo/', '');
        finalAvatarSrc = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + cleanName;
    }

    const fallbackImg = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/1000132081.webp";

    let frameUrl = "Photo/Profile1.webp"; 
    
    if (profile.equippedProfileFrame && window.PROFILE_FRAMES_ITEMS) {
        const selectedFrame = window.PROFILE_FRAMES_ITEMS.find(f => f.id === profile.equippedProfileFrame);
        if (selectedFrame) {
            frameUrl = selectedFrame.imagePath;
        }
    }

    const renderAvatarLocal = (elementId) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.style.setProperty('overflow', 'visible', 'important');
            el.style.setProperty('border', 'none', 'important');
            el.style.setProperty('background', 'transparent', 'important');
            
            const frameScale = elementId === 'hub-profile-avatar' ? '145%' : '130%';

            el.innerHTML = `
                <div style="position: relative !important; width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important;">
                    <img src="${finalAvatarSrc}" onerror="this.onerror=null; this.src='${fallbackImg}';" alt="Avatar" style="width: 100% !important; height: 100% !important; border-radius: 50% !important; object-fit: cover !important; display: block !important; position: relative !important; z-index: 1 !important;">
                    <img src="${frameUrl}" onerror="this.style.display='none'" style="position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; width: ${frameScale} !important; height: ${frameScale} !important; z-index: 2 !important; pointer-events: none !important; object-fit: contain !important; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)) !important; border: none !important; background: transparent !important; border-radius: 0 !important;">
                </div>
            `;
        }
    };
    
    renderAvatarLocal('hub-profile-avatar');
    renderAvatarLocal('profile-display-avatar');

    const gameIframe = document.getElementById('game-frame');
    if (gameIframe && gameIframe.contentWindow) {
        gameIframe.contentWindow.postMessage({ type: 'INJECT_AVATAR_DIRECT', avatarHtml: finalAvatarSrc }, '*');
        gameIframe.contentWindow.postMessage({ type: 'PROFILE_UPDATED', profile: profile }, '*');
    }

    const linkFbBtn = document.getElementById('link-facebook-guest-btn');
    if (linkFbBtn) {
        linkFbBtn.style.display = (profile.id && !profile.id.startsWith('FB-') && !profile.id.startsWith('USER-')) ? 'flex' : 'none';
    }
};

window.updateHubPopularity = function() {
    try {
        const profileStr = localStorage.getItem('hub_user_profile');
        if (profileStr) {
            const profile = JSON.parse(profileStr);
            const popularityVal = profile.popularity || 0;
            
            const popElement = document.getElementById('hub-popularity-val');
            if (popElement) {
                popElement.innerText = formatCompactNumber(popularityVal);
            }
        }
    } catch (e) {
        console.error("لم يتم العثور على بيانات الشعبية", e);
    }
};

window.addEventListener('storage', (event) => {
    if (event.key === 'hub_user_profile') {
        updateHubPopularity();
    }
});

window.changePlayerName = function() {
    let profile = getSafeProfile();
    if(!profile) return;
    
    showCustomPopup(translations[currentLang].msg_prompt_name, true, profile.name, true, (newName) => {
        if (newName && newName.trim() !== "") {
            profile.name = newName.trim();
            try {
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                syncHubProfile();
                if (socket && socket.connected) {
                    socket.emit('syncProfile', { id: profile.id, name: profile.name });
                }
            } catch (err) {}
        }
    });
};

window.changeAvatarFromDropdown = function(val) {
    if(!val) return;
    let profile = getSafeProfile();
    profile.avatar = val;
    profile.isCustomAvatar = false; 
    try {
        localStorage.setItem('hub_user_profile', JSON.stringify(profile));
        syncHubProfile();
        document.getElementById('edit-avatar-select').selectedIndex = 0; 
        showCustomPopup(translations[currentLang].msg_avatar_success);
        if (socket && socket.connected) {
            socket.emit('syncProfile', { id: profile.id, avatar: profile.avatar });
        }
    } catch (err) {}
};

window.uploadImageFromPhone = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxDim = 180;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
                } else {
                    if (height > maxDim) { height = Math.round((width * maxDim) / height); height = maxDim; }
                }
                
                canvas.width = width; canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                
                let profile = getSafeProfile();
                profile.avatar = compressedDataUrl;
                profile.isCustomAvatar = true; 
                
                try {
                    localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                    syncHubProfile();
                    showCustomPopup(translations[currentLang].msg_img_success);
                    if (socket && socket.connected) {
                        socket.emit('syncProfile', { id: profile.id, avatar: profile.avatar });
                    }
                } catch (error) {}
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

window.copyPlayerID = function() {
    const idText = document.getElementById('profile-display-id').innerText;
    if(navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(idText).then(() => {
            showCustomPopup(translations[currentLang].msg_copy_success + idText);
        }).catch(() => { fallbackCopyText(idText); });
    } else { fallbackCopyText(idText); }
};

window.fallbackCopyText = function(text) {
    let textArea = document.createElement("textarea");
    textArea.value = text; document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try {
        document.execCommand('copy');
        showCustomPopup(translations[currentLang].msg_copy_success + text);
    } catch (err) { showCustomPopup(translations[currentLang].msg_copy_fail); }
    document.body.removeChild(textArea);
};

window.openProfileModal = function() { 
    syncHubProfile();
    updateHubPopularity(); 
    document.getElementById('profile-modal').style.display = 'flex'; 
    history.pushState({ view: 'profile' }, '');
};

window.closeProfileModal = function() { 
    if (history.state && history.state.view === 'profile') history.back(); 
    else document.getElementById('profile-modal').style.display = 'none';
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('profile-modal').style.display === 'flex') closeProfileModal();
        if (document.getElementById('lang-select-modal').style.display === 'flex') closeLangModal();
        if (document.getElementById('bg-select-modal').style.display === 'flex') closeBgModal();
        if (document.getElementById('side-drawer').classList.contains('show')) closeHamburgerMenu();
    }
});

window.startGame = function() {
    if (socket && socket.connected) {
        socket.disconnect(); 
    }
    
    document.getElementById('game-selector').style.display = 'none';
    document.getElementById('bottom-nav-bar').style.display = 'none'; 
    document.getElementById('game-interface').style.display = 'block';
    const gameFrame = document.getElementById('game-frame');
    gameFrame.src = 'dama/dama.html';
    history.pushState({ view: 'game' }, '');
    
    gameFrame.onload = function() {
        syncHubProfile();
        gameFrame.contentWindow.postMessage({ type: 'LANGUAGE_CHANGED', lang: currentLang }, '*');
    };
};

window.exitGame = function() {
    document.getElementById('game-interface').style.display = 'none';
    if(localStorage.getItem('hub_user_profile')) {
        document.getElementById('game-selector').style.display = 'flex';
        document.getElementById('bottom-nav-bar').style.display = 'flex';
    }
    setTimeout(() => { document.getElementById('game-frame').src = ''; }, 300);
    history.pushState({ view: 'hub' }, '');
    syncHubProfile();
    updateHubPopularity(); 
    
    if (socket && !socket.connected) {
        socket.connect();
    }
};

window.addEventListener('popstate', function(e) {
    if (document.getElementById('custom-popup-modal').style.display === 'flex') document.getElementById('custom-popup-modal').style.display = 'none';
    if (document.getElementById('profile-modal').style.display === 'flex') document.getElementById('profile-modal').style.display = 'none';
    if (document.getElementById('lang-select-modal').style.display === 'flex') document.getElementById('lang-select-modal').style.display = 'none';
    if (document.getElementById('bg-select-modal').style.display === 'flex') document.getElementById('bg-select-modal').style.display = 'none';
    if (document.getElementById('side-drawer').classList.contains('show')) closeHamburgerMenu();

    if (document.getElementById('game-interface').style.display === 'block') {
        if (e.state && e.state.view === 'hub') {
            document.getElementById('game-interface').style.display = 'none';
            if(localStorage.getItem('hub_user_profile')) {
                document.getElementById('game-selector').style.display = 'flex';
                document.getElementById('bottom-nav-bar').style.display = 'flex';
            }
            setTimeout(() => { document.getElementById('game-frame').src = ''; }, 300);
            syncHubProfile();
            updateHubPopularity();
            if (socket && !socket.connected) socket.connect(); 
        }
    }
});

window.handleAccountExit = function(isSwitching) {
    const profileRaw = localStorage.getItem('hub_user_profile');
    if (!profileRaw) return;
    let profile;
    try { profile = JSON.parse(profileRaw); } catch (e) { profile = getSafeProfile(); }
    const isGuest = profile.id && profile.id.startsWith('GUEST-');

    if (!isGuest) executeLogout(isSwitching);
    else {
        showCustomPopup(translations[currentLang].msg_logout_confirm, false, "", true, (res) => {
            if (res) { executeLogout(isSwitching); }
        });
    }
};

window.executeLogout = function(isSwitching) {
    const profileRaw = localStorage.getItem('hub_user_profile');
    let isFacebookUser = false;
    if (profileRaw) {
        try { isFacebookUser = JSON.parse(profileRaw).id?.startsWith('FB-'); } catch(e) {}
    }

    localStorage.removeItem('hub_user_profile');
    document.getElementById('profile-modal').style.display = 'none';
    
    document.getElementById('game-interface').style.display = 'none';
    const gameFrame = document.getElementById('game-frame');
    if (gameFrame) gameFrame.src = '';
    
    checkUserAuthentication();

    if (isFacebookUser && typeof FB !== 'undefined') {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                FB.logout(function() { });
            }
        });
    }
};

window.triggerLogout = function() { handleAccountExit(false); };

window.addEventListener('message', (event) => {
    if (!event.data) return;
    
    if (event.data.type === 'SYNC_PROFILE') {
        syncHubProfile();
        updateHubPopularity();
    } else if (event.data.type === 'EXIT_GAME') {
        exitGame();
    } else if (event.data.type === 'TOGGLE_RADIO') {
        if (typeof toggleRadioPlayState === 'function') toggleRadioPlayState();
    } else if (event.data.type === 'PLAY_RADIO') {
        if (typeof triggerPlayRadio === 'function') triggerPlayRadio();
    } else if (event.data.type === 'STOP_RADIO') {
        if (typeof stopRadio === 'function') stopRadio();
    } else if (event.data.type === 'OPEN_RADIO_MODAL') {
        if (typeof openRadioModal === 'function') openRadioModal();
    } else if (event.data.type === 'LOWER_RADIO_VOLUME') {
        if (typeof audioInstance !== 'undefined' && audioInstance) {
            audioInstance.volume = 0.15;
        }
    } else if (event.data.type === 'RESTORE_RADIO_VOLUME') {
        if (typeof audioInstance !== 'undefined' && audioInstance) {
            audioInstance.volume = (typeof radioVolume !== 'undefined') ? radioVolume : 0.3;
        }
    }
});

// ===================================================================
// 🌟 دوال التنقل وإدارة الحقيبة المعزولة للواجهة الرئيسية 🌟
// ===================================================================

window.hubSwitchThemeGridTabCategory = function(category) {
    const tabs = ['bg', 'frames', 'pieces', 'profile-frames', 'gifts'];
    
    tabs.forEach(tab => { 
        document.querySelectorAll('[id="theme-btn-tab-' + tab + '"]').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('[id="theme-grid-section-' + tab + '"]').forEach(sec => sec.style.display = 'none');
    });
    
    document.querySelectorAll('[id="theme-btn-tab-' + category + '"]').forEach(activeBtn => activeBtn.classList.add('active'));
    document.querySelectorAll('[id="theme-grid-section-' + category + '"]').forEach(activeSec => activeSec.style.display = 'grid');

    if (category === 'profile-frames') {
        window.hubRenderProfileFramesInBag();
        const p = typeof window.getSafeProfile === 'function' ? window.getSafeProfile() : null;
        if (window.socket && window.socket.connected && p && p.id) {
            window.socket.emit('syncProfile', { id: p.id }); 
        }
    }
};

window.hubRenderProfileFramesInBag = function() {
    const containers = document.querySelectorAll('#theme-grid-section-profile-frames');
    if (!containers || containers.length === 0) return;

    let profileStr = localStorage.getItem('hub_user_profile');
    let profile = {};
    if (profileStr) {
        try { profile = JSON.parse(profileStr); } catch(e){}
    }

    let rawPurchased = profile.purchasedItems || [];
    let purchasedItems = Array.isArray(rawPurchased) ? rawPurchased : [];

    const framesList = window.PROFILE_FRAMES_ITEMS || [];

    containers.forEach(container => {
        container.innerHTML = '';
        let hasFrames = false;

        framesList.forEach(frame => {
            const isPurchased = purchasedItems.some(item => 
                String(item).trim() === String(frame.id).trim() || 
                (item && typeof item === 'object' && String(item.id).trim() === String(frame.id).trim())
            );
            
            if (isPurchased) {
                hasFrames = true;
                
                const isEquipped = profile.equippedProfileFrame === frame.id;
                const frameCard = document.createElement('div');
                frameCard.className = `theme-grid-item ${isEquipped ? 'active' : ''}`;
                
                frameCard.onclick = () => {
                    window.hubEquipProfileFrame(frame.id);
                };

                frameCard.innerHTML = `
                    <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        <img src="Photo/1000132081.webp" style="position: absolute; width: 35px; height: 35px; border-radius: 50%; opacity: 0.5;">
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
    });
};

window.hubEquipProfileFrame = function(frameId) {
    let profileStr = localStorage.getItem('hub_user_profile');
    let profile = {};
    if (profileStr) {
        try { profile = JSON.parse(profileStr); } catch(e){}
    }
    if (!profile || !profile.id) return;

    profile.equippedProfileFrame = frameId;
    localStorage.setItem('hub_user_profile', JSON.stringify(profile));

    window.hubRenderProfileFramesInBag();

    if (typeof window.syncHubProfile === 'function') {
        window.syncHubProfile();
    }

    if (typeof window.socket !== 'undefined' && window.socket.connected) {
        window.socket.emit('syncProfile', { id: profile.id, equippedProfileFrame: frameId });
    }
};

window.switchBagMainTab = function(tabId, btnElement) {
    document.querySelectorAll('.bag-main-tab').forEach(el => el.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    document.querySelectorAll('[id="bag-view-games"]').forEach(el => el.style.display = 'none');
    document.querySelectorAll('[id="bag-view-general"]').forEach(el => el.style.display = 'none');

    document.querySelectorAll('[id="bag-view-' + tabId + '"]').forEach(el => el.style.display = 'flex');

    if (tabId === 'general') {
        if (typeof window.renderGiftsInBag === 'function') window.renderGiftsInBag();
        if (typeof window.hubSwitchThemeGridTabCategory === 'function') {
            window.hubSwitchThemeGridTabCategory('gifts');
        } else if (typeof window.switchThemeGridTabCategory === 'function') {
            window.switchThemeGridTabCategory('gifts');
        }
    } else if (tabId === 'games') {
        if (typeof window.hubSwitchThemeGridTabCategory === 'function') {
            window.hubSwitchThemeGridTabCategory('bg');
        } else if (typeof window.switchThemeGridTabCategory === 'function') {
            window.switchThemeGridTabCategory('bg');
        }
    }
};

window.switchBagGameTab = function(gameId, btnElement) {
    document.querySelectorAll('.bag-game-content').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
    });
    
    document.querySelectorAll('.bag-game-btn, .bag-side-btn').forEach(el => el.classList.remove('active'));

    document.querySelectorAll('[id="bag-content-' + gameId + '"]').forEach(targetContent => {
        targetContent.classList.add('active');
        targetContent.style.display = 'flex';
    });
    
    if (btnElement) btnElement.classList.add('active');
};

// ===================================================================
// 🌟 دوال الشراء بالأموال الحقيقية والـ VIP (Google Play Billing) 🌟
// ===================================================================

window.purchaseRealMoney = function(packageId, price) {
    const profile = getSafeProfile();
    
    if (profile.id === "GUEST-DEFAULT" || profile.id.startsWith('GUEST-')) {
        showCustomPopup("يرجى إنشاء حساب أو تسجيل الدخول بحساب دائم لحفظ مشترياتك بأمان.");
        return;
    }

    showLoadingPopup("جاري محاكاة بوابة الدفع (وضع الاختبار)...");
    
    setTimeout(() => {
        const fakeToken = "TEST_TOKEN_" + Math.random().toString(36).substring(2, 15);
        if (typeof window.onGooglePurchaseSuccess === 'function') {
            window.onGooglePurchaseSuccess(fakeToken, packageId);
        }
    }, 1500); 
};

window.onGooglePurchaseSuccess = function(purchaseToken, packageId) {
    showLoadingPopup("تم الدفع بنجاح! جاري إضافة الرصيد لحسابك...");
    
    const profile = getSafeProfile();
    
    if (typeof socket !== 'undefined' && socket.connected) {
        socket.emit('verify_google_purchase', {
            userId: profile.id,
            packageId: packageId,
            purchaseToken: purchaseToken 
        });
    } else {
        showCustomPopup("حدث خطأ في الاتصال بالسيرفر! يرجى التأكد من الإنترنت أو مراسلة الدعم.");
    }
};

window.onGooglePurchaseFailed = function(errorMessage) {
    document.getElementById('custom-popup-modal').style.display = 'none'; 
    showCustomPopup("لم تكتمل عملية الشراء: " + errorMessage);
};

socket.on('googlePurchaseVerified', (data) => {
    document.getElementById('custom-popup-modal').style.display = 'none';
    
    localStorage.setItem('hub_user_profile', JSON.stringify(data.updatedProfile));
    syncHubProfile();
    updateVipProgressBarUI();
    
    showCustomPopup(`تم الشحن بنجاح!\nتم إضافة ${data.addedTokens} 🪙\nوحصلت على ${data.addedVipPoints} نقطة VIP.`);
});

window.updateVipProgressBarUI = function() {
    const profile = getSafeProfile();
    let currentVip = profile.vipLevel || 0;
    let currentPoints = profile.vipPoints || 0;
    
    const vipThresholds = [0, 500, 2000, 10000, 50000, 100000]; 
    let nextVip = currentVip + 1;
    if (nextVip >= vipThresholds.length) nextVip = vipThresholds.length - 1; 
    
    let requiredPoints = vipThresholds[nextVip];
    let prevRequiredPoints = vipThresholds[currentVip];
    
    let progressPercent = 100;
    if (currentVip < vipThresholds.length - 1) {
        let pointsInCurrentLevel = currentPoints - prevRequiredPoints;
        let pointsNeededForNext = requiredPoints - prevRequiredPoints;
        progressPercent = Math.min(100, (pointsInCurrentLevel / pointsNeededForNext) * 100);
    }
    
    const badgeEl = document.getElementById('current-vip-badge');
    const nextBadgeEl = document.getElementById('next-vip-badge');
    const progressBarEl = document.getElementById('vip-progress-bar');
    const remainingEl = document.getElementById('vip-remaining-amount');
    
    if (badgeEl) badgeEl.innerText = `VIP ${currentVip}`;
    if (nextBadgeEl) nextBadgeEl.innerText = currentVip === nextVip ? "Max VIP" : `VIP ${nextVip}`;
    if (progressBarEl) progressBarEl.style.width = `${progressPercent}%`;
    
    if (remainingEl) {
        if (currentVip === nextVip) {
            remainingEl.innerText = "لقد وصلت إلى أقصى مستوى VIP!";
            remainingEl.style.color = "#ffd700";
        } else {
            let remainingPoints = requiredPoints - currentPoints;
            let remainingDollars = (remainingPoints / 100).toFixed(2);
            remainingEl.innerText = `$${remainingDollars}`;
        }
    }
};

window.addEventListener('load', () => {
    setTimeout(updateVipProgressBarUI, 1000);
});

// 🌟 استرجاع اللاعب للمباراة تلقائياً عند تحديث الصفحة
socket.on('gameStart', (data) => {
    if (document.getElementById('game-interface').style.display !== 'block') {
        showLoadingPopup(currentLang === 'ar' ? "تم العثور على مباراة نشطة! جاري إعادتك للساحة..." : "Active match found! Reconnecting...");
        setTimeout(() => {
            document.getElementById('custom-popup-modal').style.display = 'none';
            startGame();
        }, 1500);
    }
});

socket.on('matchCountdown', (data) => {
    if (document.getElementById('game-interface').style.display !== 'block') {
        showLoadingPopup(currentLang === 'ar' ? "مباراتك ستبدأ بعد قليل! جاري إعادتك..." : "Match starting soon! Reconnecting...");
        setTimeout(() => {
            document.getElementById('custom-popup-modal').style.display = 'none';
            startGame();
        }, 1500);
    }
});

// ==========================================
// 🔊 نظام الصوت الشامل لجميع الأزرار (Global Click Sound)
// يعمل بشكل مستقل دون التأثير على أي كود آخر
// ==========================================
(function() {
    // الرابط المباشر لملف الصوت من مستودعك
    const clickSoundUrl = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Sounds/click.wav";
    const clickAudio = new Audio(clickSoundUrl);
    clickAudio.volume = 0.6; // مستوى الصوت (يمكنك تعديله من 0.0 إلى 1.0)

    document.addEventListener('click', function(event) {
        // التحقق مما إذا كان العنصر المضغوط هو زر، أو يمتلك onclick، أو من العناصر التفاعلية المعروفة
        const isClickable = event.target.closest('button, [onclick], .dama-card, .nav-item, .drawer-item, .theme-grid-item, .lb-avatar, .profile-avatar, .bet-option-item, .custom-tab-button');
        
        if (isClickable) {
            try {
                // استنساخ الصوت للسماح بالضغط السريع المتتالي دون تقطيع
                let soundClone = clickAudio.cloneNode();
                soundClone.volume = clickAudio.volume;
                let playPromise = soundClone.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => { 
                        // صمت الأخطاء إذا منع المتصفح التشغيل التلقائي قبل تفاعل المستخدم
                    });
                }
            } catch (e) {}
        }
    });
})();
