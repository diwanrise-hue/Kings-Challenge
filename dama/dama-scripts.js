/**
 * dama-scripts.js
 * المساعد العام للتنسيق والمزامنة
 * 🌟 (مُحدّث): سقف مراهنات الـ VIP العالي للمشاهدين، ودالة تأكيد الرهان.
 * 🌟 (مُحدّث أمني): تشفير هوية الخصم (Masked ID) لمنع انتحال الشخصية.
 * 🚷 (مُحدّث جديد): إضافة دوال جلب قائمة المشاهدين وطرد الهاكرز (VIP 4+).
 * 🛡️ (مُحدّث جذرياً): إزالة تجاوزات localStorage الخطيرة لمنع تسرب الذاكرة (Memory Leak).
 */

function formatCompactNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num;
}

function formatHTMLNumbers(el) {
    if (!el) return;
    for (let i = 0; i < el.childNodes.length; i++) {
        let node = el.childNodes[i];
        if (node.nodeType === 3) { 
            node.nodeValue = node.nodeValue.replace(/[0-9,]+/g, match => {
                let num = parseInt(match.replace(/,/g, ''), 10);
                if (isNaN(num)) return match;
                return formatCompactNumber(num);
            });
        } else if (node.nodeType === 1) { 
            formatHTMLNumbers(node);
        }
    }
}

window.autoFitCenterOnly = function(elementSelector, maxWidth, baseTransform = '') {
    const el = document.querySelector(elementSelector);
    if (!el) return;
    el.style.setProperty('transform-origin', 'center center', 'important');
    el.style.setProperty('white-space', 'nowrap', 'important');
    el.style.setProperty('display', 'inline-block', 'important');
    el.style.setProperty('transform', baseTransform, 'important');
    const scrollWidth = el.scrollWidth;
    if (scrollWidth > maxWidth) {
        const scaleFactor = maxWidth / scrollWidth;
        el.style.setProperty('transform', `${baseTransform} scale(${scaleFactor})`, 'important');
    }
};

window.applyAutoShrink = function() {
    document.querySelectorAll('.text-boundary').forEach(container => {
        const textEl = container.querySelector('.shrink-text');
        if (!textEl) return;
        
        textEl.style.removeProperty('transform');
        
        const computedStyle = window.getComputedStyle(textEl);
        let baseScale = 1;
        if (computedStyle.transform !== 'none') {
            const matrix = computedStyle.transform.match(/matrix\(([^,]+)/);
            if (matrix) baseScale = parseFloat(matrix[1]);
        }
        
        const availableWidth = container.clientWidth;
        const rawWidth = textEl.scrollWidth;
        const actualWidth = rawWidth * baseScale;
        
        if (actualWidth > availableWidth && actualWidth > 0) {
            const scaleFactor = availableWidth / actualWidth;
            const finalScale = baseScale * scaleFactor;
            textEl.style.setProperty('transform', `scale(${finalScale})`, 'important');
        } else {
            textEl.style.setProperty('transform', `scale(${baseScale})`, 'important');
        }
    });
};

window.refreshProfileUIStyles = function() {
    const xpTextEl = document.getElementById('xp-text-element');
    const xpBarFill = document.getElementById('xp-bar-fill');
    
    try {
        let profileStr = localStorage.getItem('hub_user_profile');
        if (profileStr) {
            let p = JSON.parse(profileStr);
            if (p.xp !== undefined) {
                let currentXp = parseInt(p.xp) || 0;
                let level = Math.floor(Math.sqrt(currentXp / 50)) + 1;
                let xpForCurrentLevel = Math.pow(level - 1, 2) * 50;
                let xpForNextLevel = Math.pow(level, 2) * 50;
                
                let progressXp = currentXp - xpForCurrentLevel;
                let requiredXp = xpForNextLevel - xpForCurrentLevel;
                let percent = Math.min(100, Math.max(0, (progressXp / requiredXp) * 100));
                
                if (xpTextEl) {
                    xpTextEl.innerText = `${progressXp} / ${requiredXp} XP`;
                }
                
                if (xpBarFill) {
                    xpBarFill.style.setProperty('width', percent + '%', 'important');
                }
            }
        }
    } catch(e) {}

    const tokensContainer = document.getElementById('profile-stat-tokens-badge-container');
    if (tokensContainer) {
        formatHTMLNumbers(tokensContainer);
    }
    
    if (typeof window.applyAutoShrink === 'function') {
        window.applyAutoShrink();
    }
    
    window.autoFitCenterOnly('.player-name:not(.shrink-text)', 65, '');        
};

window.addEventListener('load', () => { setTimeout(window.refreshProfileUIStyles, 500); });

// ==========================================
// 💡 تم إزالة دالة الاختراق لـ localStorage لأنها كانت تسبب تسرب الذاكرة (Memory Leak)
// سيتم الاعتماد على الأحداث الصريحة للتحديث بدلاً من اعتراض دوال المتصفح الأصلية
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
    if (activeSec) { activeSec.style.display = 'grid'; if (category === 'pop') window.renderDamaPopularityStore(); }
};

window.renderDamaPopularityStore = function() {
    const grid = document.getElementById('store-section-popularity');
    if (!grid) return;
    grid.innerHTML = '';
    if (window.POPULARITY_ITEMS && window.POPULARITY_ITEMS.length > 0) {
        window.POPULARITY_ITEMS.forEach(gift => {
            const card = document.createElement('div'); card.className = 'store-item-card'; card.style.padding = '8px 4px'; card.style.position = 'relative';
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
    } else { grid.innerHTML = '<p style="color: #a1a1aa; text-align: center; grid-column: span 3; padding: 15px;">لا توجد عناصر شعبية حالياً.</p>'; }
};

// ==========================================
// 🛡️ التشفير الجذري لمعرف الخصم لمنع الاختراق
// ==========================================
window.showOpponentProfile = function() {
    if (!window.currentOpponentData) return;
    const opp = window.currentOpponentData;
    document.getElementById('igp-name').innerText = opp.name || "الخصم";
    
    // تشفير الـ ID لمنع السرقات (تظهر أول 3 حروف، وتشفير الباقي مع إظهار آخر 4 أرقام)
    let safeId = "---";
    if (opp.guestId) {
        let parts = opp.guestId.split('-');
        if (parts.length > 1) {
            let prefix = parts[0];
            let numPart = parts[1];
            let visibleNum = numPart.length > 4 ? numPart.substring(numPart.length - 4) : numPart;
            safeId = prefix + "-***" + visibleNum;
        } else {
            safeId = opp.guestId.substring(0, 3) + "***" + opp.guestId.substring(opp.guestId.length - 3);
        }
    }
    
    document.getElementById('igp-id-display').innerText = safeId;
    
    let avatarSrc = opp.avatar || "1000132081.webp";
    if (!avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:')) {
        let cleanName = avatarSrc.replace(/\.\.\//g, '').replace('Photo/', '');
        avatarSrc = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + cleanName;
    }
    document.getElementById('igp-avatar').innerHTML = `<img src="${avatarSrc}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    document.getElementById('igp-level').innerText = `Lv.${opp.level || '?'}`;
    document.getElementById('igp-popularity-val').innerText = formatCompactNumber(opp.popularity || 0);
    
    document.getElementById('own-profile-actions').style.display = 'none';
    document.getElementById('other-profile-actions').style.display = 'flex';
    window.openAppModal('in-game-profile-modal');
};

function syncGlobalBackground() {
    const bg = localStorage.getItem('custom_app_bg'); 
    if (bg) {
        let bgUrl = bg; 
        if (!bg.startsWith('http') && !bg.startsWith('data:') && !bg.startsWith('../')) bgUrl = '../' + bg; 
        if (document.body) {
            document.body.style.setProperty('background-image', `url('${bgUrl}')`, 'important');
            document.body.style.setProperty('background-size', 'cover', 'important');
            document.body.style.setProperty('background-position', 'center', 'important');
            document.body.style.setProperty('background-attachment', 'fixed', 'important');
            document.body.style.backgroundColor = 'transparent';
        }
    } else {
        if (document.body) {
            document.body.style.setProperty('background-image', 'none', 'important');
            document.body.style.backgroundColor = '#2c3e50'; 
        }
    }
}
window.addEventListener('DOMContentLoaded', syncGlobalBackground);
window.addEventListener('load', syncGlobalBackground);
window.addEventListener('storage', (e) => { if (e.key === 'custom_app_bg') syncGlobalBackground(); });

// ==========================================
// 💡 حل مشكلة رادار الانقطاع الوهمي
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
        if (!navigator.onLine) handleOfflineState(); 
    });
})();

window.selectSpectatorBetColor = function(color) {
    document.getElementById('spectator-bet-color').value = color;
    if (color === 'white') {
        document.getElementById('bet-p1-card').style.border = '2px solid #34c759'; document.getElementById('bet-p2-card').style.border = '2px solid transparent';
    } else {
        document.getElementById('bet-p2-card').style.border = '2px solid #34c759'; document.getElementById('bet-p1-card').style.border = '2px solid transparent';
    }
};

// ==========================================
// 🎯 دالة تأكيد رهان المشاهدين (متوافقة مع VIP)
// ==========================================
window.confirmSpectatorBet = function() {
    if (!window.gameState || !window.gameState.onlineRoomID) return;

    const colorInput = document.getElementById('spectator-bet-color');
    let selectedColor = colorInput ? colorInput.value : null;

    if (!selectedColor) {
        if (window.ui && typeof window.ui.showCustomAlert === 'function') window.ui.showCustomAlert("يرجى اختيار اللاعب الذي تتوقع فوزه أولاً!", "تنبيه");
        return;
    }

    const modal = document.getElementById('spectator-bet-modal') || document;
    let amountInput = document.getElementById('spectator-bet-amount') || modal.querySelector('input[type="number"]');
    let amount = amountInput ? parseInt(amountInput.value) : 0;

    // 🌟 حساب الحد الأقصى للرهان بناءً على مستوى الـ VIP
    let vipLevel = window.gameState.userProfile ? (window.gameState.userProfile.vipLevel || 0) : 0;
    let maxBet = 500; // الافتراضي
    if (vipLevel === 3) maxBet = 2500;
    else if (vipLevel === 4) maxBet = 10000;
    else if (vipLevel >= 5) maxBet = 50000;

    if (isNaN(amount) || amount <= 0 || amount > maxBet) {
        if (window.ui && typeof window.ui.showCustomAlert === 'function') {
            window.ui.showCustomAlert(`مبلغ الرهان غير صالح! (الحد الأقصى لمستواك هو ${formatCompactNumber(maxBet)} 🪙)`, "عذراً");
        }
        return;
    }

    if (window.socketManager && typeof window.socketManager.placeSpectatorBet === 'function') {
        window.socketManager.placeSpectatorBet(window.gameState.onlineRoomID, selectedColor, amount);
        
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('spectator-bet-modal');
        } else {
            let modalEl = document.getElementById('spectator-bet-modal');
            if (modalEl) modalEl.style.display = 'none';
        }
    }
};

window.openRadioModal = function() { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'OPEN_RADIO_MODAL' }, '*'); };
window.exitDamaGame = function() { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'EXIT_GAME' }, '*'); };
window.openBetSelectorForEdit = function() { window.isEditingBet = true; if (typeof window.openAppModal === 'function') window.openAppModal('bet-selector-modal'); };

// ==========================================
// ⏱️ عداد نهاية الموسم للوحة الشرف
// ==========================================
let seasonTimerInterval = null;

function startSeasonCountdown() {
    const timerElement = document.getElementById('season-countdown-timer');
    if (!timerElement) return;

    if (seasonTimerInterval) clearInterval(seasonTimerInterval);

    function updateTimer() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const diff = nextMonth - now;

        if (diff <= 0) {
            timerElement.innerText = "تحديث خلال : جاري توزيع الجوائز...";
            clearInterval(seasonTimerInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        let timeText = "تحديث خلال : ";
        if (days > 0) timeText += `${days} يوم و `;
        
        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

        timeText += `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        timerElement.innerText = timeText;
    }

    updateTimer();
    seasonTimerInterval = setInterval(updateTimer, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    startSeasonCountdown();
});
window.startSeasonCountdown = startSeasonCountdown;

// ==========================================
// 🚷 نظام إدارة وطرد المشاهدين (VIP 4+)
// ==========================================
window.requestSpectatorList = function() {
    if (!window.gameState || !window.gameState.onlineRoomID) return;
    
    const container = document.getElementById('spectators-items-container');
    const desc = document.getElementById('spectators-list-desc');
    
    // إنشاء الوصف ديناميكياً لتجنب مشكلة الـ null في الواجهة
    if (!desc) {
        const modalContent = document.getElementById('spectators-list-content');
        if (modalContent && modalContent.parentElement) {
            const newDesc = document.createElement('p');
            newDesc.id = 'spectators-list-desc';
            newDesc.style.cssText = "color: #a1a1aa; font-size: 12px; margin-bottom: 15px; text-align: center;";
            modalContent.parentElement.insertBefore(newDesc, modalContent);
        }
    }
    const safeDesc = document.getElementById('spectators-list-desc');

    if (container) container.innerHTML = '';
    if (safeDesc) safeDesc.innerText = "جاري جلب القائمة...";
    
    window.openAppModal('spectators-list-modal');
    
    if (window.socket && window.socket.connected) {
        window.socket.emit('requestSpectatorsList', { roomID: window.gameState.onlineRoomID });
    }
};

window.renderSpectatorsList = function(spectators) {
    let container = document.getElementById('spectators-items-container');
    
    // تأمين ظهور الحاوية
    if (!container) {
        container = document.getElementById('spectators-list-content');
    }
    
    const desc = document.getElementById('spectators-list-desc');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!spectators || spectators.length === 0) {
        if (desc) desc.innerText = "لا يوجد مشاهدين حالياً.";
        else container.innerHTML = '<p style="text-align: center; color: #a1a1aa; font-size: 13px;">لا يوجد مشاهدين حالياً.</p>';
        return;
    }
    
    if (desc) desc.innerText = `عدد المشاهدين الحاليين: ${spectators.length}`;
    
    // التحقق مما إذا كان المستخدم هو صاحب الغرفة و VIP 4 أو 5
    let isHost = (window.gameState && window.gameState.userProfile && window.matchPlayer1Id === window.gameState.userProfile.id);
    let isVipAdmin = (window.gameState && window.gameState.userProfile && window.gameState.userProfile.vipLevel >= 4);
    let canKick = isHost && isVipAdmin;

    spectators.forEach(spec => {
        let specAvatar = spec.avatar || '1000132081.webp';
        if (!specAvatar.startsWith('http') && !specAvatar.startsWith('data:')) {
            specAvatar = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + specAvatar.replace(/\.\.\//g, '').replace('Photo/', '');
        }
        
        let vipIcon = spec.vipLevel > 0 ? `<img src="Media/VIP/vip${spec.vipLevel}.webp" style="width: 16px; height: 16px; margin-right: 4px;" onerror="this.style.display='none';">` : '';

        let kickBtnHTML = canKick ? `
            <button onclick="window.kickSpectator('${spec.id}', '${spec.name}')" title="طرد المشاهد" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.4); color: #ff453a; border-radius: 8px; width: 32px; height: 32px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s;" onmouseover="this.style.background='rgba(255, 69, 58, 0.3)'" onmouseout="this.style.background='rgba(255, 69, 58, 0.15)'">
                🚷
            </button>
        ` : '';

        let itemEl = document.createElement('div');
        itemEl.style.cssText = "display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);";
        
        itemEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                <img src="${specAvatar}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.2);">
                <div style="display: flex; flex-direction: column; overflow: hidden;">
                    <span style="color: white; font-size: 13px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center;">${spec.name} ${vipIcon}</span>
                </div>
            </div>
            ${kickBtnHTML}
        `;
        container.appendChild(itemEl);
    });
};

window.kickSpectator = function(targetId, targetName) {
    if (!window.gameState || !window.gameState.onlineRoomID) return;
    
    if (window.ui && typeof window.ui.showCustomAlert === 'function') {
        window.ui.showCustomAlert(
            `هل أنت متأكد من طرد المشاهد "${targetName}"؟\nلن يتمكن من العودة لهذه المباراة مجدداً.`,
            "طرد مشاهد 🚷",
            () => {
                if (window.socket && window.socket.connected) {
                    window.socket.emit('kickSpectator', { roomID: window.gameState.onlineRoomID, targetId: targetId });
                }
            },
            true, "إلغاء", "طرد"
        );
    }
};
