// ملف: dama-scripts.js
// يحتوي على جميع الدوال البرمجية الخاصة بواجهة لعبة الدامة (إدارة المتجر، الأصدقاء، الخلفية، والاتصال)

// ==========================================
// 🌟 دالة تحويل الأرقام الضخمة إلى K و M
// ==========================================
function formatCompactNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
}

// ===============================================
// 🌟 دوال الواجهة الجديدة (التكبير والتنسيق) 🌟
// ===============================================

// دالة آمنة لتغيير الأرقام داخل العناصر (للخبرة والعملات) دون مسح الأيقونات
function formatHTMLNumbers(el) {
    if (!el) return;
    for (let i = 0; i < el.childNodes.length; i++) {
        let node = el.childNodes[i];
        if (node.nodeType === 3) { // 3 تعني Text Node
            node.nodeValue = node.nodeValue.replace(/[0-9,]+/g, match => {
                let num = parseInt(match.replace(/,/g, ''), 10);
                if (isNaN(num)) return match;
                return formatCompactNumber(num);
            });
        } else if (node.nodeType === 1) { // 1 تعني Element (مثل span)
            formatHTMLNumbers(node);
        }
    }
}

// دالة التصغير المركزي (للاسم والـ LV) للحفاظ على تناسق الإطار
window.autoFitCenterOnly = function(elementSelector, maxWidth, baseTransform = '') {
    const el = document.querySelector(elementSelector);
    if (!el) return;

    // ضمان أن نقطة الارتكاز هي المنتصف ليصغر دون أن ينزاح
    el.style.setProperty('transform-origin', 'center center', 'important');
    el.style.setProperty('white-space', 'nowrap', 'important');
    el.style.setProperty('display', 'inline-block', 'important');

    // إرجاع العنصر لحجمه الأساسي لقياس العرض
    el.style.setProperty('transform', baseTransform, 'important');
    const scrollWidth = el.scrollWidth;

    // التصغير إذا لزم الأمر
    if (scrollWidth > maxWidth) {
        const scaleFactor = maxWidth / scrollWidth;
        el.style.setProperty('transform', `${baseTransform} scale(${scaleFactor})`, 'important');
    }
};

// تحديث قياسات وتنسيقات البروفايل الجديد برمجياً
window.refreshProfileUIStyles = function() {
    formatHTMLNumbers(document.getElementById('profile-stat-tokens-badge-container'));
    formatHTMLNumbers(document.getElementById('xp-text-element'));

    window.autoFitCenterOnly('.player-name', 65, '');        
    window.autoFitCenterOnly('#badge-level', 21, '');        
    window.autoFitCenterOnly('#badge-next-level', 15.5, ''); 
};

// تشغيل التنسيق عند تحميل الصفحة لضمان ترتيب العناصر
window.addEventListener('load', () => {
    setTimeout(window.refreshProfileUIStyles, 500);
});

// ==========================================
// 1. تجاوز (Override) وتصحيح مسارات LocalStorage
// ==========================================
const originalGetItem = localStorage.getItem;
localStorage.getItem = function(key) {
    let value = originalGetItem.call(this, key);
    if (key === 'hub_user_profile' && value) {
        try {
            let profile = JSON.parse(value);
            if (profile && profile.avatar && !profile.avatar.startsWith('http') && !profile.avatar.startsWith('data:') && !profile.avatar.startsWith('../')) {
                profile.avatar = '../' + profile.avatar;
                return JSON.stringify(profile);
            }
        } catch(e) {}
    }
    return value;
};

const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    if (key === 'hub_user_profile' && value) {
        try {
            let profile = JSON.parse(value);
            if (profile && profile.avatar && profile.avatar.startsWith('../')) {
                profile.avatar = profile.avatar.replace('../', '');
                value = JSON.stringify(profile);
            }
        } catch(e) {}
        
        if(window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
        }

        // تحديث واجهة البروفايل الجديدة برمجياً عند أي تغيير في البيانات
        setTimeout(() => {
            if(typeof window.refreshProfileUIStyles === 'function') {
                window.refreshProfileUIStyles();
            }
        }, 150);
    }
    originalSetItem.call(this, key, value);
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
    if (key === 'hub_user_profile') {
        if(window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
        }
    }
    originalRemoveItem.call(this, key);
};

// ==========================================
// 2. إدارة الأصدقاء والتحديات المباشرة
// ==========================================
window.sendFriendReqById = function() {
    const idInput = document.getElementById('add-friend-id-input');
    if(idInput && idInput.value.trim() !== '') {
        if(window.socket && window.socket.connected) {
            let targetId = idInput.value.trim();
            window.socket.emit('sendFriendReq', { targetId: targetId });
            const toast = document.getElementById('toast-notification');
            if (toast) { toast.innerText = '📨 تم إرسال طلب الصداقة!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
            idInput.value = '';
        } else {
            const toast = document.getElementById('toast-notification');
            if (toast) { toast.innerText = '❌ يجب أن تكون متصلاً بالإنترنت!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
        }
    }
};

window.challengeTargetFriendId = null;

window.challengeFriend = function(friendId) {
    window.challengeTargetFriendId = friendId;
    window.openAppModal('challenge-bet-modal');
};

window.confirmChallenge = function(betAmount, element) {
    document.querySelectorAll('#challenge-bet-modal .bet-option-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected'); 
    
    setTimeout(() => {
        window.closeAppModal('challenge-bet-modal');
        if (window.challengeTargetFriendId && window.socketManager) {
            window.socketManager.sendChallenge(window.challengeTargetFriendId, parseInt(betAmount));
            window.challengeTargetFriendId = null; 
        }
    }, 250);
};

// ==========================================
// 3. متجر الدامة، حقيبة الهدايا، وبروفايل الخصم
// ==========================================
window.switchDamaGameStoreTab = function(category) {
    const tabs = ['bg', 'fr', 'pc', 'offers', 'pop'];
    tabs.forEach(tab => {
        const btn = document.getElementById('dama-tab-' + tab);
        let secId = 'store-section-' + (tab === 'fr' ? 'frames' : tab === 'pc' ? 'pieces' : tab === 'pop' ? 'popularity' : tab);
        const sec = document.getElementById(secId);
        if (btn) btn.classList.remove('active');
        if (sec) sec.style.display = 'none';
    });

    const activeBtn = document.getElementById('dama-tab-' + category);
    let activeSecId = 'store-section-' + (category === 'fr' ? 'frames' : category === 'pc' ? 'pieces' : category === 'pop' ? 'popularity' : category);
    const activeSec = document.getElementById(activeSecId);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeSec) {
        activeSec.style.display = 'grid';
        if (category === 'pop') {
            window.renderDamaPopularityStore();
        }
    }
};

window.renderDamaPopularityStore = function() {
    const grid = document.getElementById('store-section-popularity');
    if (!grid) return;
    grid.innerHTML = '';

    if (window.POPULARITY_ITEMS && window.POPULARITY_ITEMS.length > 0) {
        window.POPULARITY_ITEMS.forEach(gift => {
            const card = document.createElement('div');
            card.className = 'store-item-card';
            card.style.padding = '8px 4px';
            card.style.position = 'relative';
            
            card.innerHTML = `
                <div style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <img src="${gift.imagePath}" style="max-width: 85%; max-height: 85%; object-fit: contain;">
                </div>
                <span style="color: white; font-size: 11px; font-weight: bold; line-height: 1.2; text-align: center; margin-top: 4px;">${gift.nameAr}</span>
                
                <div style="color: #00d2ff; font-size: 10px; font-weight: bold; margin-top: 2px; display: flex; align-items: center; justify-content: center; gap: 3px; filter: drop-shadow(0 0 2px rgba(0, 210, 255, 0.4));">
                    +${formatCompactNumber(gift.popValue)} <span style="font-size: 12px; filter: hue-rotate(210deg) drop-shadow(0 0 2px rgba(0, 210, 255, 0.6));">🔥</span>
                </div>

                <div style="color: #f5a623; font-size: 12px; font-weight: bold; margin-top: auto; margin-bottom: 2px;">🪙 ${formatCompactNumber(gift.price)}</div>
                <button class="store-buy-btn store-buy-btn-small" onclick="window.openPurchaseModal('${gift.id}', '${gift.nameAr}', ${gift.price}, 'popularity')">شراء</button>
            `;
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = '<p style="color: #a1a1aa; text-align: center; grid-column: span 3; padding: 15px;">لا توجد عناصر شعبية حالياً.</p>';
    }
};

window.givePopularity = function() {
    const profile = (window.storeManager && window.storeManager.getProfile) ? window.storeManager.getProfile() : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
    const inventory = profile.inventory || {};
    const grid = document.getElementById('my-gifts-selection-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    let availableCount = 0;

    (window.POPULARITY_ITEMS || []).forEach(gift => {
        const count = inventory[gift.id] || 0;
        if (count > 0) {
            availableCount++;
            const itemEl = document.createElement('div');
            itemEl.className = 'store-item-card';
            itemEl.style.padding = '8px';
            itemEl.style.display = 'flex';
            itemEl.style.flexDirection = 'column';
            itemEl.style.alignItems = 'center';
            itemEl.style.gap = '5px';
            
            itemEl.innerHTML = `
                <img src="${gift.imagePath}" style="width: 40px; height: 40px; object-fit: contain;">
                <span style="color: white; font-size: 11px; font-weight: bold; text-align: center;">${gift.nameAr}</span>
                
                <div style="color: #00d2ff; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 3px; filter: drop-shadow(0 0 2px rgba(0, 210, 255, 0.4));">
                    +${formatCompactNumber(gift.popValue)} <span style="font-size: 12px; filter: hue-rotate(210deg) drop-shadow(0 0 2px rgba(0, 210, 255, 0.6));">🔥</span>
                </div>

                <span style="color: #f5a623; font-size: 10px;">لديك: x${count}</span>
                <button class="store-buy-btn-small" onclick="window.confirmSendGift('${gift.id}', ${gift.popValue || gift.price || 10})" style="width: 100%; height: 26px; font-size: 11px; margin-top: auto;">إرسال 🚀</button>
            `;
            grid.appendChild(itemEl);
        }
    });

    if (availableCount === 0) {
        grid.innerHTML = '<p style="color: #a1a1aa; font-size: 13px; text-align: center; grid-column: span 3; padding: 15px;">حقيبتك فارغة من الهدايا! اذهب للمتجر لشراء الشعبية.</p>';
    }

    if (typeof window.openAppModal === 'function') window.openAppModal('send-gift-modal');
};

window.confirmSendGift = function(giftId, popValue) {
    let profile = (window.storeManager && window.storeManager.getProfile) ? window.storeManager.getProfile() : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
    if (!profile.inventory || !profile.inventory[giftId] || profile.inventory[giftId] <= 0) return;

    profile.inventory[giftId] -= 1;
    localStorage.setItem('hub_user_profile', JSON.stringify(profile));

    if (window.socket && window.socket.connected) {
        window.socket.emit('sendPopularityGift', {
            giftId: giftId,
            popValue: popValue,
            targetOpponentId: window.challengeTargetFriendId || window.currentOpponentId
        });
    }

    if (typeof window.closeAppModal === 'function') {
        window.closeAppModal('send-gift-modal');
        window.closeAppModal('in-game-profile-modal');
    }

    const toast = document.getElementById('toast-notification');
    if (toast) {
        toast.innerText = `✨ تم إرسال الهدية بنجاح! (+${formatCompactNumber(popValue)} شعبية)`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
};

window.showOpponentProfile = function() {
    if (!window.currentOpponentData) return;
    
    const opp = window.currentOpponentData;
    
    document.getElementById('igp-name').innerText = opp.name || "الخصم";
    document.getElementById('igp-id-display').innerText = opp.guestId || "---";
    
    let avatarSrc = opp.avatar || "1000132081.webp";
    if (!avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:')) {
        let cleanName = avatarSrc.replace(/\.\.\//g, '').replace('Photo/', '');
        avatarSrc = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + cleanName;
    }
    document.getElementById('igp-avatar').innerHTML = `<img src="${avatarSrc}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    
    document.getElementById('igp-level').innerText = `Lv.${opp.level || '?'}`;
    // 🌟 تطبيق دالة اختصار الأرقام هنا لكي يظهر الرقم بشكل مختصر
    document.getElementById('igp-popularity-val').innerText = formatCompactNumber(opp.popularity || 0);
    
    document.getElementById('own-profile-actions').style.display = 'none';
    document.getElementById('other-profile-actions').style.display = 'flex';
    
    window.openAppModal('in-game-profile-modal');
};

// ==========================================
// 4. نظام مزامنة الخلفية مع الواجهة الرئيسية
// ==========================================
function syncGlobalBackground() {
    const bg = localStorage.getItem('custom_app_bg'); 
    if (bg) {
        let bgUrl = bg; 
        if (!bg.startsWith('http') && !bg.startsWith('data:') && !bg.startsWith('../')) { 
            bgUrl = '../' + bg; 
        }
        
        document.body.style.setProperty('background-image', `url('${bgUrl}')`, 'important');
        document.body.style.setProperty('background-size', 'cover', 'important');
        document.body.style.setProperty('background-position', 'center', 'important');
        document.body.style.setProperty('background-attachment', 'fixed', 'important');
        document.body.style.setProperty('background-color', 'transparent', 'important');
    } else {
        document.body.style.setProperty('background-image', 'none', 'important');
        document.body.style.setProperty('background-color', '#2c3e50', 'important'); 
    }
}

window.addEventListener('DOMContentLoaded', syncGlobalBackground);
window.addEventListener('load', syncGlobalBackground);

window.addEventListener('storage', (e) => {
    if (e.key === 'custom_app_bg') { 
        syncGlobalBackground(); 
    }
});

const bgObserver = new MutationObserver(() => {
    const bg = localStorage.getItem('custom_app_bg');
    if (bg) {
        let expectedUrl = bg.startsWith('http') || bg.startsWith('data:') || bg.startsWith('../') ? bg : '../' + bg;
        if (!document.body.style.backgroundImage.includes(expectedUrl)) {
            syncGlobalBackground();
        }
    }
});
bgObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });

// ==========================================
// 5. إدارة حالة الاتصال وإخفاء البينج (Online/Offline)
// ==========================================
(function() {
    let hidePingTimer = null;

    function handleOfflineState() {
        const radar = document.getElementById('mini-disconnect-radar');
        if (radar) radar.style.setProperty('display', 'flex', 'important');
        
        clearTimeout(hidePingTimer);
        hidePingTimer = setTimeout(() => {
            const pingEl = document.getElementById('real-ping-indicator');
            if (pingEl) pingEl.style.opacity = '0';
        }, 30000);
    }

    function handleOnlineState() {
        const radar = document.getElementById('mini-disconnect-radar');
        if (radar) radar.style.setProperty('display', 'none', 'important');

        clearTimeout(hidePingTimer);
        const pingEl = document.getElementById('real-ping-indicator');
        if (pingEl) pingEl.style.opacity = '0.95'; 
    }

    window.addEventListener('offline', handleOfflineState);
    window.addEventListener('online', handleOnlineState);

    window.addEventListener('load', () => {
        if (!navigator.onLine) {
            handleOfflineState();
        }
    });
    
    const observer = new MutationObserver(() => {
        if (!navigator.onLine) {
            const radar = document.getElementById('mini-disconnect-radar');
            if (radar && radar.style.display !== 'flex') {
                radar.style.setProperty('display', 'flex', 'important');
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
