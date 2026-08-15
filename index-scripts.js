// ملف: index-scripts.js

// دالة تحويل الأرقام الضخمة إلى K و M 🌟
function formatCompactNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
}

// 🌟 إدارة فتح وإغلاق النوافذ (المودال) 🌟
window.openAppModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        // 🌟 إجبار الخلفيات على الظهور تلقائياً عند فتح الحقيبة
        if (modalId === 'themes-grid-overlay') {
            if (typeof window.switchThemeGridTabCategory === 'function') {
                window.switchThemeGridTabCategory('bg');
            }
        }
        
        // 🌟 إجبار الخلفيات على الظهور تلقائياً عند فتح نافذة المتجر الجانبية
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

// دالة لتمكين ملفات أخرى من عرض نافذة التنبيه
window.triggerCustomAlertNotification = function(msg) {
    showCustomPopup(msg);
};

// 🌟 دالة فتح نافذة تأكيد الشراء بالتصميم الجديد 🌟
let currentPurchaseItem = null;

window.openPurchaseModal = function(itemId, itemName, price, itemType) {
    currentPurchaseItem = { id: itemId, type: itemType, price: price };
    
    const nameEl = document.getElementById('modal-item-name');
    const costEl = document.getElementById('modal-item-cost');
    const previewEl = document.getElementById('modal-item-preview');
    
    if(nameEl) nameEl.innerText = itemName;
    if(costEl) costEl.innerText = price; 
    
    // جلب الأيقونة أو الصورة لتلائم التصميم الجديد
    if (previewEl) {
        let iconHtml = '🎁'; 
        
        // جلب أيقونة المتجر إذا كانت من المتجر العام
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
        // جلب أيقونة الشعبية
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
        } else if (itemType === 'consumable') {
            iconHtml = '💡';
        }
        
        previewEl.innerHTML = iconHtml;
    }
    
    window.openAppModal('purchase-modal');
};

// 🌟 ربط زر تأكيد الشراء بالسيرفر 🌟
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

            window.closeAppModal('purchase-modal');

            if (typeof socket !== 'undefined' && socket.connected) {
                showLoadingPopup("جاري معالجة الشراء...");
                socket.emit('requestPurchase', { 
                    userId: profile.id, 
                    itemId: currentPurchaseItem.id 
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

// 🌟 دالة التنقل في الشريط السفلي
window.switchNavTab = function(tabName) {
    document.querySelectorAll('.nav-section-container').forEach(el => {
        el.classList.remove('active-section');
    });
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });

    document.getElementById(`nav-section-${tabName}`).classList.add('active-section');
    event.currentTarget.classList.add('active');

    // إجبار الخلفيات على الظهور تلقائياً عند فتح المتجر من الشريط السفلي
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
        } else {
            document.getElementById('auth-modal-title').innerText = t.register_tab_title;
            document.getElementById('auth-modal-desc').innerText = t.register_tab_desc;
            document.getElementById('auth-primary-submit-btn').innerText = t.register_tab_btn;
            toggleLink.innerText = t.register_tab_toggle;
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
                socket.emit('deviceFingerprint', { guestId: profile.id });
            }
        } catch(e) {}
    }
});

// 🌟 تم تحديث الدالة لتدعم نظام الـ VIP
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
        vipLevel: 0,   // مستوى الـ VIP الافتراضي
        vipPoints: 0   // نقاط الـ VIP الافتراضية
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

socket.on('auth_success', (data) => {
    const msg = safeParseAuthMessage(data.message);
    showCustomPopup(msg);
    localStorage.setItem('hub_user_profile', JSON.stringify(data.profile));
    if(document.getElementById('profile-modal').style.display === 'flex') {
        syncHubProfile();
    } else {
        checkUserAuthentication();
    }
});

socket.on('profileUpdated', (updatedProfile) => {
    localStorage.setItem('hub_user_profile', JSON.stringify(updatedProfile));
    syncHubProfile();
    updateHubPopularity(); 
    
    // تحديث شريط تقدم VIP إذا تم التحديث
    if (typeof window.updateVipProgressBarUI === 'function') {
        window.updateVipProgressBarUI();
    }
    
    const gameIframe = document.getElementById('game-frame');
    if (gameIframe && gameIframe.contentWindow) {
        gameIframe.contentWindow.postMessage({ type: 'PROFILE_UPDATED', profile: updatedProfile }, '*');
    }
});

socket.on('auth_failed', (data) => {
    const msg = safeParseAuthMessage(data.message);
    showCustomPopup(data.message);
});

socket.on('purchaseSuccess', (msg) => {
    document.getElementById('custom-popup-modal').style.display = 'none';
    showCustomPopup(msg || "تمت عملية الشراء بنجاح!");
    
    if (window.storeManager && typeof window.storeManager.renderUI === 'function') {
        window.storeManager.renderUI();
    }
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

window.loginWithFacebook = function() {
    if (typeof FB === 'undefined') { showCustomPopup(translations[currentLang].msg_fb_connect); return; }

    FB.login(function(response) {
        if (response.authResponse) {
            const loadingMsg = currentLang === 'ar' ? "جاري جلب البيانات من فيسبوك..." : (currentLang === 'ku' ? "داتاکان لە فەیسبووکەوە دەهێنرێن..." : "Fetching Facebook data...");
            showLoadingPopup(loadingMsg);

            FB.api('/me?fields=id,name,picture.width(200).height(200)', function(fbUser) {
                if (fbUser && !fbUser.error) {
                    const payload = {
                        id: fbUser.id,
                        name: fbUser.name,
                        picture: (fbUser.picture && fbUser.picture.data && fbUser.picture.data.url) ? fbUser.picture.data.url : null
                    };
                    
                    if (socket && socket.connected) {
                        socket.emit('login_facebook_direct', payload);
                    } else {
                        socket.connect();
                        const onConnectFb = () => {
                            socket.emit('login_facebook_direct', payload);
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
            const loadingMsg = currentLang === 'ar' ? "جاري ربط الحساب..." : (currentLang === 'ku' ? "بەستنەوەی هەژمار..." : "Linking account...");
            showLoadingPopup(loadingMsg);

            FB.api('/me?fields=id,name,picture.width(200).height(200)', function(fbUser) {
                if (fbUser && !fbUser.error) {
                    const profile = getSafeProfile();
                    const payload = {
                        guestId: profile.id,
                        id: fbUser.id,
                        name: fbUser.name,
                        picture: (fbUser.picture && fbUser.picture.data && fbUser.picture.data.url) ? fbUser.picture.data.url : null
                    };

                    if (socket && socket.connected) {
                        socket.emit('link_facebook_direct', payload);
                    } else {
                        socket.connect();
                        const onConnectLink = () => {
                            socket.emit('link_facebook_direct', payload);
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

window.safeParseAuthMessage = function(msgStr) {
    if (typeof msgStr === 'string' && msgStr.startsWith('{')) {
        try {
            const parsed = JSON.parse(msgStr);
            return parsed[currentLang] || parsed.en || msgStr;
        } catch(e) { return msgStr; }
    }
    return msgStr;
};

window.toggleAuthMode = function() {
    isLoginMode = !isLoginMode;
    const titleEl = document.getElementById('auth-modal-title');
    const descEl = document.getElementById('auth-modal-desc');
    const submitBtn = document.getElementById('auth-primary-submit-btn');
    const toggleLink = document.getElementById('auth-toggle-mode-link');
    const avatarGroup = document.getElementById('avatar-select-group');

    const t = translations[currentLang];

    if (isLoginMode) {
        titleEl.innerText = t.login_tab_title;
        descEl.innerText = t.login_tab_desc;
        submitBtn.innerText = t.login_tab_btn;
        toggleLink.innerText = t.login_tab_toggle;
        avatarGroup.style.display = 'none'; 
    } else {
        titleEl.innerText = t.register_tab_title;
        descEl.innerText = t.register_tab_desc;
        submitBtn.innerText = t.register_tab_btn;
        toggleLink.innerText = t.register_tab_toggle;
        avatarGroup.style.display = 'block';
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

window.submitManualAuthForm = function() {
    const nameInput = document.getElementById('login-name-input').value.trim();
    const passInput = document.getElementById('login-password-input').value;
    const avatarSelect = document.getElementById('login-avatar-select').value;

    if (!nameInput) return showCustomPopup(translations[currentLang].msg_no_name);
    if (!passInput) return showCustomPopup(translations[currentLang].msg_no_pass);

    if (!socket || !socket.connected) {
        showCustomPopup(translations[currentLang].msg_server_fail);
        socket.connect(); 
        return;
    }

    if (isLoginMode) {
        socket.emit('login_manual', { username: nameInput, password: passInput });
    } else {
        socket.emit('register_manual', { username: nameInput, password: passInput, avatar: avatarSelect });
    }
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
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('game-selector').style.display = 'flex';
            document.getElementById('bottom-nav-bar').style.display = 'flex';
            syncHubProfile();
        } catch (e) {
            localStorage.removeItem('hub_user_profile');
            document.getElementById('game-selector').style.display = 'none';
            document.getElementById('bottom-nav-bar').style.display = 'none';
            document.getElementById('login-modal').style.display = 'flex';
        }
    } else {
        document.getElementById('game-selector').style.display = 'none';
        document.getElementById('bottom-nav-bar').style.display = 'none';
        document.getElementById('login-modal').style.display = 'flex';
    }
};

window.loginAsGuest = function() {
    const guestName = (typeof translations !== 'undefined') ? translations[currentLang].guest_name : "Guest_";
    const randomId = "GUEST-" + Math.floor(100000 + Math.random() * 900000);
    const randomName = guestName + Math.floor(1000 + Math.random() * 9000);
    
    const guestProfile = {
        id: randomId, name: randomName, avatar: 'Photo/1000132081.webp',
        isCustomAvatar: false,
        tokens: 10000, gamesPlayed: 0, wins: 0, losses: 0, friends: [], popularity: 0,
        purchasedItems: [], equippedBg: 'bg_wood', equippedFr: 'fr_classic', equippedPc: 'pc_original',
        vipLevel: 0, vipPoints: 0
    };

    try {
        localStorage.setItem('hub_user_profile', JSON.stringify(guestProfile));
        checkUserAuthentication();
    } catch (err) {}
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
    
    if (document.getElementById('profile-display-name')) document.getElementById('profile-display-name').innerText = profile.name;
    if (document.getElementById('profile-display-id')) document.getElementById('profile-display-id').innerText = profile.id;
    
    let finalAvatarSrc = profile.avatar || 'Photo/1000132081.webp';
    const isFullUrl = finalAvatarSrc.startsWith('http://') || finalAvatarSrc.startsWith('https://') || finalAvatarSrc.startsWith('data:image');
    if (!isFullUrl) {
        let cleanName = finalAvatarSrc.replace(/\.\.\//g, '').replace('Photo/', '');
        finalAvatarSrc = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + cleanName;
    }

    const fallbackImg = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/1000132081.webp";

    const renderAvatarLocal = (elementId) => {
        const el = document.getElementById(elementId);
        if (el) el.innerHTML = `<img src="${finalAvatarSrc}" onerror="this.onerror=null; this.src='${fallbackImg}';" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
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
        linkFbBtn.style.display = (profile.id && !profile.id.startsWith('FB-')) ? 'flex' : 'none';
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
            if (res) { socket.emit('logout_guest_clean', { id: profile.id }); executeLogout(isSwitching); }
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
    }
});

// ===================================================================
// 🌟 دوال التنقل وإدارة الحقيبة 🌟
// ===================================================================

// 1. دالة التنقل وتحديث التبويبات الفرعية للممتلكات
window.switchThemeGridTabCategory = function(category) {
    const tabs = ['bg', 'frames', 'pieces', 'profile-frames', 'gifts'];
    
    tabs.forEach(tab => { 
        document.querySelectorAll('[id="theme-btn-tab-' + tab + '"]').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('[id="theme-grid-section-' + tab + '"]').forEach(sec => sec.style.display = 'none');
    });
    
    document.querySelectorAll('[id="theme-btn-tab-' + category + '"]').forEach(activeBtn => activeBtn.classList.add('active'));
    document.querySelectorAll('[id="theme-grid-section-' + category + '"]').forEach(activeSec => activeSec.style.display = 'grid');
};

// 2. دالة التنقل بين الأقسام الرئيسية للحقيبة (الألعاب / العام)
window.switchBagMainTab = function(tabId, btnElement) {
    document.querySelectorAll('.bag-main-tab').forEach(el => el.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    document.querySelectorAll('[id="bag-view-games"]').forEach(el => el.style.display = 'none');
    document.querySelectorAll('[id="bag-view-general"]').forEach(el => el.style.display = 'none');

    document.querySelectorAll('[id="bag-view-' + tabId + '"]').forEach(el => el.style.display = 'flex');

    if (tabId === 'general') {
        if (typeof window.renderGiftsInBag === 'function') window.renderGiftsInBag();
        // إجبار تبويب الهدايا على التفعيل عند الدخول لقسم عام
        if (typeof window.switchThemeGridTabCategory === 'function') window.switchThemeGridTabCategory('gifts');
    } else if (tabId === 'games') {
        // العودة لخلفيات الألعاب عند الدخول لقسم الألعاب
        if (typeof window.switchThemeGridTabCategory === 'function') window.switchThemeGridTabCategory('bg');
    }
};

// 3. دالة التنقل بين ألعاب الحقيبة
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

// 1. الدالة التي يضغط عليها اللاعب لشراء باقة
window.purchaseRealMoney = function(packageId, price) {
    const profile = getSafeProfile();
    
    // منع الزوار المؤقتين من الشراء بمال حقيقي لضمان حفظ حقوقهم
    if (profile.id === "GUEST-DEFAULT" || profile.id.startsWith('GUEST-')) {
        showCustomPopup("يرجى إنشاء حساب أو تسجيل الدخول بحساب دائم لحفظ مشترياتك بأمان.");
        return;
    }

    // التحقق مما إذا كان اللاعب داخل التطبيق ويوجد جسر اتصال (Android Bridge)
    if (typeof AndroidBridge !== 'undefined' && typeof AndroidBridge.startGooglePurchase === 'function') {
        showLoadingPopup("جاري فتح بوابة الدفع الآمنة...");
        
        // استدعاء نظام الأندرويد لبدء نافذة جوجل بلاي
        AndroidBridge.startGooglePurchase(packageId);
    } else {
        // إذا كان يلعب من المتصفح العادي
        showCustomPopup("عذراً، الشراء متاح فقط عبر تطبيق اللعبة الرسمي لضمان أمان الدفع عبر Google Play.");
    }
};

// 2. دالة يستدعيها التطبيق (الأندرويد) عند نجاح الدفع
window.onGooglePurchaseSuccess = function(purchaseToken, packageId) {
    showLoadingPopup("تم الدفع بنجاح! جاري إضافة الرصيد لحسابك...");
    
    const profile = getSafeProfile();
    
    // إرسال التوكن السري للسيرفر للتحقق منه وإضافة الموارد
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

// 3. دالة يستدعيها التطبيق (الأندرويد) في حال إلغاء الدفع أو فشله
window.onGooglePurchaseFailed = function(errorMessage) {
    document.getElementById('custom-popup-modal').style.display = 'none'; // إخفاء نافذة التحميل
    showCustomPopup("لم تكتمل عملية الشراء: " + errorMessage);
};

// 4. استماع رد السيرفر بعد التأكد من الدفع
socket.on('googlePurchaseVerified', (data) => {
    document.getElementById('custom-popup-modal').style.display = 'none';
    
    // تحديث ملف اللاعب بالرصيد والـ VIP الجديد
    localStorage.setItem('hub_user_profile', JSON.stringify(data.updatedProfile));
    syncHubProfile();
    updateVipProgressBarUI();
    
    // إشعار تهنئة
    showCustomPopup(`تم الشحن بنجاح!\nتم إضافة ${data.addedTokens} 🪙\nوحصلت على ${data.addedVipPoints} نقطة VIP.`);
});

// 5. دالة تحديث شريط تقدم الـ VIP بصرياً في المتجر
window.updateVipProgressBarUI = function() {
    const profile = getSafeProfile();
    let currentVip = profile.vipLevel || 0;
    let currentPoints = profile.vipPoints || 0;
    
    // حساب النقاط المطلوبة لكل مستوى (كمثال بسيط: 500 للمستوى 1، 2000 للمستوى 2، إلخ)
    const vipThresholds = [0, 500, 2000, 10000, 50000, 100000]; 
    let nextVip = currentVip + 1;
    if (nextVip >= vipThresholds.length) nextVip = vipThresholds.length - 1; // الحد الأقصى
    
    let requiredPoints = vipThresholds[nextVip];
    let prevRequiredPoints = vipThresholds[currentVip];
    
    // حساب النسبة المئوية للتقدم
    let progressPercent = 100;
    if (currentVip < vipThresholds.length - 1) {
        let pointsInCurrentLevel = currentPoints - prevRequiredPoints;
        let pointsNeededForNext = requiredPoints - prevRequiredPoints;
        progressPercent = Math.min(100, (pointsInCurrentLevel / pointsNeededForNext) * 100);
    }
    
    // تطبيق البيانات على الواجهة إذا كانت موجودة
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
            // كل 100 نقطة تمثل 1 دولار تقريباً في اقتصادنا الافتراضي
            let remainingPoints = requiredPoints - currentPoints;
            let remainingDollars = (remainingPoints / 100).toFixed(2);
            remainingEl.innerText = `$${remainingDollars}`;
        }
    }
};

// تشغيل التحديث عند فتح الصفحة
window.addEventListener('load', () => {
    setTimeout(updateVipProgressBarUI, 1000);
});
