/**
 * dama-scripts.js
 * المساعد العام للتنسيق والمزامنة وإدارة ساحة التحديات ونظام الرتب
 * 🔒 تم التحديث: تفعيل الأقفال وحماية الرصيد في ساحة التحديات.
 * 🧮 (مُحدّث جذرياً): نظام الفجوة (Gap) بين الطبقات (Tiers) مع مصفوفة tierScores الدقيقة.
 * ♾️ (مُحدّث جذرياً): إزالة Infinity من الرتبة الأسطورية ليعمل شريط التقدم بشكل صحيح 100%.
 */

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

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

window.sendFriendReqById = function() {
    const idInput = document.getElementById('add-friend-id-input');
    if(idInput && idInput.value.trim() !== '') {
        if(window.socket && window.socket.connected) {
            let targetId = idInput.value.trim();
            window.socket.emit('sendFriendReq', { targetId: targetId });
            const toast = document.getElementById('toast-notification');
            if (toast) { toast.innerHTML = '📨 تم إرسال طلب الصداقة!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
            idInput.value = '';
        } else {
            const toast = document.getElementById('toast-notification');
            if (toast) { toast.innerHTML = '❌ يجب أن تكون متصلاً بالإنترنت!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
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
            const safeName = escapeHTML(gift.nameAr);
            card.innerHTML = `
                <div style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <img src="${gift.imagePath}" style="max-width: 85%; max-height: 85%; object-fit: contain;">
                </div>
                <span style="color: white; font-size: 11px; font-weight: bold; line-height: 1.2; text-align: center; margin-top: 4px;">${safeName}</span>
                <div style="color: #00d2ff; font-size: 10px; font-weight: bold; margin-top: 2px; display: flex; align-items: center; justify-content: center; gap: 3px; filter: drop-shadow(0 0 2px rgba(0, 210, 255, 0.4));">
                    +${formatCompactNumber(gift.popValue)} <span style="font-size: 12px; filter: hue-rotate(210deg) drop-shadow(0 0 2px rgba(0, 210, 255, 0.6));">🔥</span>
                </div>
                <div style="color: #f5a623; font-size: 12px; font-weight: bold; margin-top: auto; margin-bottom: 2px;"><img src="../Photo/coin.webp" class="app-coin-icon"> ${formatCompactNumber(gift.price)}</div>
                <button class="store-buy-btn store-buy-btn-small" onclick="window.openPurchaseModal('${gift.id}', '${safeName}', ${gift.price}, 'popularity')">شراء</button>
            `;
            grid.appendChild(card);
        });
    } else { grid.innerHTML = '<p style="color: #a1a1aa; text-align: center; grid-column: span 3; padding: 15px;">لا توجد عناصر شعبية حالياً.</p>'; }
};

// ==========================================

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

window.openRadioModal = function() { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'OPEN_RADIO_MODAL' }, '*'); };
window.exitDamaGame = function() { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'EXIT_GAME' }, '*'); };

window.openBetSelectorForEdit = function() { 
    window.isEditingBet = true; 
    if (typeof window.openAppModal === 'function') window.openAppModal('bet-selector-modal'); 
};

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
    
    const originalCloseAppModal = window.closeAppModal;
    window.closeAppModal = function(id) {
        if (id === 'leaderboard-modal') {
            window.lastFetchedWinsData = null;
            window.lastFetchedXpData = null;
        }
        if (originalCloseAppModal) originalCloseAppModal(id);
    };
});
window.startSeasonCountdown = startSeasonCountdown;

window.requestSpectatorList = function() {
    if (!window.gameState || !window.gameState.onlineRoomID) return;
    
    const container = document.getElementById('spectators-items-container');
    const desc = document.getElementById('spectators-list-desc');
    
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
    
    let isHost = (window.gameState && window.gameState.userProfile && window.matchPlayer1Id === window.gameState.userProfile.id);
    let isVipAdmin = (window.gameState && window.gameState.userProfile && window.gameState.userProfile.vipLevel >= 4);
    let canKick = isHost && isVipAdmin;

    spectators.forEach(spec => {
        let specAvatar = spec.avatar || '1000132081.webp';
        if (!specAvatar.startsWith('http') && !specAvatar.startsWith('data:')) {
            specAvatar = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + specAvatar.replace(/\.\.\//g, '').replace('Photo/', '');
        }
        
        let vipIcon = spec.vipLevel > 0 ? `<img src="Media/VIP/vip${spec.vipLevel}.webp" style="width: 16px; height: 16px; margin-right: 4px;" onerror="this.style.display='none';">` : '';

        const safeName = escapeHTML(spec.name);
        const safeId = escapeHTML(spec.id);

        let kickBtnHTML = canKick ? `
            <button onclick="window.kickSpectator('${safeId}', '${safeName.replace(/'/g, "\\'")}')" title="طرد المشاهد" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.4); color: #ff453a; border-radius: 8px; width: 32px; height: 32px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s;" onmouseover="this.style.background='rgba(255, 69, 58, 0.3)'" onmouseout="this.style.background='rgba(255, 69, 58, 0.15)'">
                🚷
            </button>
        ` : '';

        let itemEl = document.createElement('div');
        itemEl.style.cssText = "display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);";
        
        itemEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                <img src="${specAvatar}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.2);">
                <div style="display: flex; flex-direction: column; overflow: hidden;">
                    <span style="color: white; font-size: 13px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center;">${safeName} ${vipIcon}</span>
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

// ==========================================
// 📊 نظام شريط الرتبة التفاعلي (مُحدّث بالكامل) 
// ==========================================
// تمت إضافة الفجوة (Gap) عبر مصفوفة tierScores
// وتم تصحيح المدى الأقصى للرتبة الأسطورية (6500)
const RANK_SYSTEM = [
    { id: 'bronze', name: 'برونزي', min: 0, max: 149, tierScores: [0, 50, 100, 140], icon: 'Media/front/Bronze.webp', tierRewards: ['50 <img src="../Photo/coin.webp" class="app-coin-icon">', '50 <img src="../Photo/coin.webp" class="app-coin-icon">', '50 <img src="../Photo/coin.webp" class="app-coin-icon">', '50 <img src="../Photo/coin.webp" class="app-coin-icon">'] },
    { id: 'silver', name: 'فضي', min: 150, max: 499, tierScores: [150, 266, 383, 479], icon: 'Media/front/silver.webp', tierRewards: ['100 <img src="../Photo/coin.webp" class="app-coin-icon">', '100 <img src="../Photo/coin.webp" class="app-coin-icon">', '100 <img src="../Photo/coin.webp" class="app-coin-icon">', '100 <img src="../Photo/coin.webp" class="app-coin-icon">'] },
    { id: 'gold', name: 'ذهبي', min: 500, max: 1199, tierScores: [500, 733, 966, 1149], icon: 'Media/front/golden.webp', tierRewards: ['300 <img src="../Photo/coin.webp" class="app-coin-icon">', '300 <img src="../Photo/coin.webp" class="app-coin-icon">', '300 <img src="../Photo/coin.webp" class="app-coin-icon">', '300 <img src="../Photo/coin.webp" class="app-coin-icon">'] },
    { id: 'diamond', name: 'ماسي', min: 1200, max: 2499, tierScores: [1200, 1633, 2066, 2399], icon: 'Media/front/diamond.webp', tierRewards: ['500 <img src="../Photo/coin.webp" class="app-coin-icon">', '500 <img src="../Photo/coin.webp" class="app-coin-icon">', '500 <img src="../Photo/coin.webp" class="app-coin-icon">', '500 <img src="../Photo/coin.webp" class="app-coin-icon">'] },
    { id: 'royal', name: 'ملكي', min: 2500, max: 4999, tierScores: [2500, 3333, 4166, 4799], icon: 'Media/front/legendary.webp', tierRewards: ['800 <img src="../Photo/coin.webp" class="app-coin-icon">', '800 <img src="../Photo/coin.webp" class="app-coin-icon">', '800 <img src="../Photo/coin.webp" class="app-coin-icon">', '800 <img src="../Photo/coin.webp" class="app-coin-icon">'] }, 
    { id: 'legendary', name: 'أسطوري', min: 5000, max: 6500, tierScores: [5000, 5500, 6000, 6500], icon: 'Media/front/os6ory.webp', tierRewards: ['1000 <img src="../Photo/coin.webp" class="app-coin-icon">', '1000 <img src="../Photo/coin.webp" class="app-coin-icon">', '1000 <img src="../Photo/coin.webp" class="app-coin-icon">', '1000 <img src="../Photo/coin.webp" class="app-coin-icon">'] } 
];

window.currentViewedRankIndex = 0;
window.actualPlayerRankIndex = 0;
window.highestPlayerRankIndex = 0;
window.actualPlayerScore = 0;
window.highestPlayerScore = 0;

window.initMatchmakingRankBar = function() {
    const profile = window.gameState && window.gameState.userProfile ? window.gameState.userProfile : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
    
    window.actualPlayerScore = parseInt(profile.score) || parseInt(profile.xp) || 0;
    window.highestPlayerScore = parseInt(profile.highestScoreReached) || window.actualPlayerScore;

    window.actualPlayerRankIndex = 0;
    window.highestPlayerRankIndex = 0;

    for (let i = 0; i < RANK_SYSTEM.length; i++) {
        if (window.actualPlayerScore >= RANK_SYSTEM[i].min && window.actualPlayerScore <= RANK_SYSTEM[i].max) {
            window.actualPlayerRankIndex = i;
        }
        if (window.highestPlayerScore >= RANK_SYSTEM[i].min && window.highestPlayerScore <= RANK_SYSTEM[i].max) {
            window.highestPlayerRankIndex = i;
        }
    }
    
    if(window.highestPlayerScore >= RANK_SYSTEM[RANK_SYSTEM.length-1].min) window.highestPlayerRankIndex = RANK_SYSTEM.length - 1;
    if(window.actualPlayerScore >= RANK_SYSTEM[RANK_SYSTEM.length-1].min) window.actualPlayerRankIndex = RANK_SYSTEM.length - 1;

    window.currentViewedRankIndex = window.actualPlayerRankIndex;
    window.renderRankTrack();
};

window.changeRankView = function(dir) {
    let newIndex = window.currentViewedRankIndex + dir;
    if (newIndex >= 0 && newIndex < RANK_SYSTEM.length) {
        window.currentViewedRankIndex = newIndex;
        window.renderRankTrack();
    }
};

window.renderRankTrack = function() {
    const container = document.getElementById('mm-tiers-container');
    const fillBar = document.getElementById('mm-rank-fill-bar');
    const prevBtn = document.getElementById('rank-prev-btn');
    const nextBtn = document.getElementById('rank-next-btn');

    if (!container || !fillBar) return;

    const rankData = RANK_SYSTEM[window.currentViewedRankIndex];
    const romanTiers = ["I", "II", "III", "IV"];
    
    if(prevBtn) prevBtn.disabled = window.currentViewedRankIndex === 0;
    if(nextBtn) nextBtn.disabled = window.currentViewedRankIndex === RANK_SYSTEM.length - 1;

    let html = '';

    // حساب نسبة التعبئة البصرية للشريط بدقة عالية (بدون Infinity)
    let fillPercent = 0;
    if (window.currentViewedRankIndex < window.actualPlayerRankIndex) {
        fillPercent = 100; // رتبة سابقة، إذن الشريط ممتلئ
    } else if (window.currentViewedRankIndex > window.actualPlayerRankIndex) {
        fillPercent = 0; // رتبة لم يصلها بعد، إذن الشريط فارغ
    } else {
        const rankRange = rankData.max - rankData.min; // المدى الكلي للرتبة المعروضة
        const scoreInRank = window.actualPlayerScore - rankData.min;
        // نسبة التعبئة = (السكور داخل الرتبة / المدى) * 100
        fillPercent = Math.min(100, Math.max(0, (scoreInRank / rankRange) * 100));
    }

    fillBar.style.width = `${fillPercent}%`;

    // رسم النقاط الـ 4 والجوائز بناءً على النقاط المحددة مسبقاً (tierScores)
    for (let i = 0; i < 4; i++) {
        const requiredScoreForTier = rankData.tierScores[i];
        
        let isReached = window.highestPlayerScore >= requiredScoreForTier;
        let reachedClass = isReached ? 'reached' : '';
        
        let iconFilter = '';
        if (rankData.id === 'royal' || rankData.id === 'legendary') {
            iconFilter = 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));'; 
        }

        let tierRewardText = (rankData.tierRewards && rankData.tierRewards[i]) ? rankData.tierRewards[i] : `50 <img src="../Photo/coin.webp" class="app-coin-icon">`;
        let opacityStyle = isReached ? 'opacity: 0.45; filter: grayscale(40%);' : 'opacity: 1; filter: none;';
        
        let checkmark = isReached ? `<div style="position: absolute; top: -6px; left: -8px; background: #0a84ff; color: white; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; box-shadow: 0 0 4px rgba(10,132,255,0.8); z-index: 999;">✓</div>` : '';

        // تموضع النقطة على الشريط البصري (نقوم بتوزيعها شكلياً بنسب شبه متساوية)
        let visualPosition = i * 33.33; 
        
        let rewardDisplayHtml = `
            <div style="display: flex !important; flex-direction: column; align-items: center; width: 100%; visibility: visible !important; ${opacityStyle}">
                <div style="width: 28px; height: 2px; background: rgba(255, 255, 255, 0.3); margin: 3px 0 2px 0; position: relative; display: block !important;">
                    ${checkmark}
                </div>
                <span style="display: block !important; color: #ffd700; font-weight: 800; font-size: 11px; text-shadow: 0 1px 2px rgba(0,0,0,0.8); white-space: nowrap; visibility: visible !important; margin-top: 2px;">
                    ${tierRewardText}
                </span>
            </div>
        `;

        html += `
            <div class="mm-tier-node ${reachedClass}" style="display: flex; flex-direction: column; align-items: center; position: absolute; left: ${visualPosition}%; transform: translateX(-50%);">
                <img class="mm-tier-img" src="${rankData.icon}" style="${iconFilter}; margin-bottom: 2px;" onerror="this.outerHTML='<span style=\\'font-size:26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)); margin-bottom: 2px;\\'>👑</span>'">
                <div class="mm-tier-dot" style="margin-bottom: 2px;"></div>
                <span class="mm-tier-label" style="font-size: 11px; font-weight: bold; white-space: nowrap; margin-bottom: 0px;">${rankData.name} ${romanTiers[i]}</span>
                ${rewardDisplayHtml}
            </div>
        `;
    }

    container.style.position = 'relative';
    container.style.height = '70px'; 
    container.innerHTML = html;
};

// ==========================================
// 🎡 أكواد التمرير للكروت (Carousel)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('mm-carousel-scroller');
    const cards = scroller ? scroller.querySelectorAll('.mm-card') : [];
    if (!scroller || cards.length === 0) return;

    let isScrolling;
    
    const updateActiveCard = () => {
        const scrollerRect = scroller.getBoundingClientRect();
        const scrollerCenter = scrollerRect.left + (scrollerRect.width / 2);
        
        let closestCard = null;
        let closestDistance = Infinity;

        const distances = Array.from(cards).map(card => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + (rect.width / 2);
            return { card, distance: Math.abs(scrollerCenter - cardCenter) };
        });

        distances.forEach(item => {
            if (item.distance < closestDistance) {
                closestDistance = item.distance;
                closestCard = item.card;
            }
        });

        cards.forEach(c => {
            if (c === closestCard) {
                if (!c.classList.contains('active')) c.classList.add('active');
            } else {
                if (c.classList.contains('active')) c.classList.remove('active');
            }
        });
    };

    scroller.addEventListener('scroll', () => {
        if (isScrolling) window.cancelAnimationFrame(isScrolling);
        isScrolling = window.requestAnimationFrame(updateActiveCard);
    }, { passive: true });

    const updateMatchmakingLocks = () => {
        let profile = (window.gameState && window.gameState.userProfile) ? window.gameState.userProfile : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
        let userTokens = parseInt(profile.tokens) || 0;
        
        const bets = [50, 250, 500, 1000, 2500, 5000, 10000];
        
        bets.forEach(bet => {
            const lockEl = document.getElementById('mm-lock-' + bet);
            const btnEl = document.getElementById('mm-btn-' + bet);
            
            if (lockEl) {
                if (userTokens < bet) {
                    lockEl.style.display = 'flex';
                    if (btnEl) btnEl.style.pointerEvents = 'none'; 
                } else {
                    lockEl.style.display = 'none';
                    if (btnEl) btnEl.style.pointerEvents = 'auto';
                }
            }
        });
    };

    const modal = document.getElementById('matchmaking-stakes-modal');
    let initialScrollDone = false;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.style.display === 'flex' || mutation.target.style.display === 'block') {
                updateMatchmakingLocks();

                if (!initialScrollDone) {
                    setTimeout(() => {
                        const lastBet = localStorage.getItem('last_selected_mm_bet');
                        let targetCard = null;

                        if (lastBet !== null) {
                            targetCard = Array.from(cards).find(card => {
                                const btn = card.querySelector('.mm-card-btn');
                                return btn && btn.getAttribute('onclick') === `window.startMatchmakingWithBet(${lastBet})`;
                            });
                        }

                        if (!targetCard) { targetCard = cards[0]; }

                        const scrollPos = targetCard.offsetLeft - (scroller.clientWidth / 2) + (targetCard.clientWidth / 2);
                        
                        scroller.style.scrollBehavior = 'smooth';
                        scroller.scrollTo({ left: scrollPos });
                        
                        setTimeout(() => {
                            scroller.style.scrollBehavior = 'auto'; 
                            updateActiveCard();
                        }, 300);
                        
                        initialScrollDone = true; 
                    }, 50);
                }
            } else {
                initialScrollDone = false; 
            }
        });
    });
    
    if (modal) observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
});

window.scrollMmCarousel = function(direction) {
    const scroller = document.getElementById('mm-carousel-scroller');
    if(scroller) {
        const cardWidth = 290; 
        const margin = -40;
        scroller.style.scrollBehavior = 'smooth';
        scroller.scrollBy({ left: direction * (cardWidth + (margin * 2)) });
        setTimeout(() => { scroller.style.scrollBehavior = 'auto'; }, 300);
    }
};

window.startMatchmakingWithBet = function(betAmount) {
    let profile = (window.gameState && window.gameState.userProfile) ? window.gameState.userProfile : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
    let userTokens = parseInt(profile.tokens) || 0;
    
    // منع الحسابات الجديدة من الرهان لأكثر من 50 حتى لو امتلكوا الرصيد
    if (betAmount > 50 && (profile.gamesPlayed || 0) < 5) {
        if (window.ui && typeof window.ui.showCustomAlert === 'function') {
            window.ui.showCustomAlert("يجب أن تلعب 5 مباريات على الأقل لفتح ساحات المراهنات الكبيرة!");
        } else {
            alert("يجب أن تلعب 5 مباريات على الأقل!");
        }
        return;
    }

    if (betAmount > 0 && userTokens < betAmount) {
        if (window.ui && typeof window.ui.showCustomAlert === 'function') {
            window.ui.showCustomAlert("رصيدك غير كافٍ لدخول هذه الساحة!");
        } else {
            alert("رصيدك غير كافٍ!");
        }
        return; 
    }

    localStorage.setItem('last_selected_mm_bet', betAmount);
    
    if (typeof window.closeAppModal === 'function') window.closeAppModal('matchmaking-stakes-modal');
    else document.getElementById('matchmaking-stakes-modal').style.display = 'none';
    
    const timerEl = document.getElementById('mm-timer');
    if (timerEl) timerEl.textContent = '00:00';
    
    if (window.gameState) {
        window.gameState.mmStartTime = Date.now();
        if (window.gameState.mmInterval) clearInterval(window.gameState.mmInterval);
        window.gameState.mmInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - window.gameState.mmStartTime) / 1000);
            const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const s = String(elapsed % 60).padStart(2, '0');
            if (timerEl) timerEl.textContent = `${m}:${s}`;
        }, 1000);
    }

    if (typeof window.openAppModal === 'function') window.openAppModal('matchmaking-modal');
    else document.getElementById('matchmaking-modal').style.display = 'flex';
    
    if (window.socketManager && typeof window.socketManager.handleRoomAction === 'function') {
        window.socketManager.handleRoomAction('joinMatchmakingPool', null, null, betAmount);
    }
};

// ==========================================
// 👑 نظام فتح نافذة الألقاب الشاملة
// ==========================================
window.openTitlesModal = function() {
    let profile = null;
    try {
        if (window.gameState && window.gameState.userProfile) {
            profile = window.gameState.userProfile;
        } else {
            profile = JSON.parse(localStorage.getItem('hub_user_profile'));
        }
    } catch(e) { console.error("Error loading profile", e); }

    if (!profile) return;

    if (!profile.unlockedTitles) profile.unlockedTitles = ['novice'];
    if (!profile.equippedTitle) profile.equippedTitle = 'novice';

    let unlockedHtml = '';
    let lockedHtml = '';
    let unlockedCount = 0;
    let totalCount = window.TITLES_DB ? Object.keys(window.TITLES_DB).length : 0;

    if (window.TITLES_DB) {
        Object.keys(window.TITLES_DB).forEach(tKey => {
            const tObj = window.TITLES_DB[tKey];
            const isUnlocked = profile.unlockedTitles && profile.unlockedTitles.includes(tKey);
            const isEquipped = profile.equippedTitle === tKey;

            if (isUnlocked) {
                unlockedCount++;
                let borderStyle = isEquipped ? '1.5px solid #30d158' : '1px solid rgba(255,255,255,0.2)';
                let bgStyle = isEquipped ? 'rgba(48,209,88,0.1)' : 'rgba(255,255,255,0.05)';
                let textStatus = isEquipped ? '<span style="color: #30d158; font-size: 11px; font-weight: bold; background: rgba(48,209,88,0.15); padding: 4px 8px; border-radius: 8px;">مُستخدَم ✔️</span>' : '<span style="color: #a1a1aa; font-size: 11px; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 8px;">تحديد</span>';

                unlockedHtml += `
                    <div id="title-card-${tKey}" onclick="window.equipTitle('${tKey}')" style="display: flex; flex-direction: column; padding: 14px 15px; background: ${bgStyle}; border: ${borderStyle}; border-radius: 16px; cursor: pointer; transition: 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="color: white; font-weight: 900; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${tObj.name}</span>
                            <div id="title-status-${tKey}">${textStatus}</div>
                        </div>
                        <span style="color: #a1a1aa; font-size: 12px; text-align: right; line-height: 1.5; font-weight: 500;">${tObj.desc}</span>
                    </div>
                `;
            } else {
                lockedHtml += `
                    <div style="display: flex; flex-direction: column; padding: 14px 15px; background: rgba(0,0,0,0.6); border: 1px dashed rgba(255,69,58,0.4); border-radius: 16px; opacity: 0.85;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="color: #8e8e93; font-weight: 900; font-size: 16px;">${tObj.name}</span>
                            <span style="color: #ff453a; font-size: 16px; filter: drop-shadow(0 0 4px rgba(255,69,58,0.6));" title="مقفل">🔒</span>
                        </div>
                        <span style="color: #ff453a; font-size: 12px; text-align: right; line-height: 1.5; font-weight: 600;">الشرط: ${tObj.desc}</span>
                    </div>
                `;
            }
        });
    }

    const existingModal = document.getElementById('custom-titles-modal');
    if (existingModal) existingModal.remove();

    if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-titles-modal';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = 'display: flex; z-index: 10000; align-items: center; justify-content: center; padding: 0;';

    modalOverlay.innerHTML = `
        <div class="settings-card" dir="auto" style="width: 90vw; height: 90vh; max-width: 500px; max-height: 800px; padding: 25px 15px; display: flex; flex-direction: column; position: relative; border-radius: 24px !important;">
            <button class="modal-close-btn" onclick="document.getElementById('custom-titles-modal').remove()" style="left:15px; right:auto; background: rgba(255,255,255,0.08) !important;">✕</button>
            <h3 style="color: #ffd700; margin-bottom: 5px; font-size: 24px; text-shadow: 0 2px 10px rgba(255,215,0,0.4);">سجل الألقاب 🏆</h3>
            <p id="titles-header-count" style="color: #a1a1aa; font-size: 13px; margin-bottom: 20px; font-weight: 600;">أكملت <span style="color: #30d158;">${unlockedCount}</span> من أصل ${totalCount} ألقاب</p>

            <div class="custom-nav-tabs" style="margin-bottom: 20px; height: 45px; padding: 5px; flex-shrink: 0;">
                <button id="titles-tab-unlocked-btn" class="custom-tab-button active" onclick="window.switchTitlesTab('unlocked')" style="font-size: 14px; border-radius: 12px !important;">مكتملة (${unlockedCount})</button>
                <button id="titles-tab-locked-btn" class="custom-tab-button" onclick="window.switchTitlesTab('locked')" style="font-size: 14px; border-radius: 12px !important;">قيد الإنجاز (${totalCount - unlockedCount})</button>
            </div>

            <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                <div id="titles-unlocked-list" class="scrollable-content" style="display:flex; flex-direction:column; gap:10px; flex: 1; padding-right: 5px;">
                    ${unlockedHtml}
                </div>
                <div id="titles-locked-list" class="scrollable-content" style="display:none; flex-direction:column; gap:10px; flex: 1; padding-right: 5px;">
                    ${lockedHtml}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);
};

window.switchTitlesTab = function(tab) {
    document.getElementById('titles-tab-unlocked-btn').classList.remove('active');
    document.getElementById('titles-tab-locked-btn').classList.remove('active');
    document.getElementById('titles-unlocked-list').style.display = 'none';
    document.getElementById('titles-locked-list').style.display = 'none';

    document.getElementById('titles-tab-' + tab + '-btn').classList.add('active');
    document.getElementById('titles-' + tab + '-list').style.display = 'flex';
};

window.equipTitle = function(titleKey) {
    let profile = null;
    try {
        profile = (window.gameState && window.gameState.userProfile) ? window.gameState.userProfile : JSON.parse(localStorage.getItem('hub_user_profile'));
    } catch(e) {}

    if (profile) {
        profile.equippedTitle = titleKey;
        if (window.gameState) window.gameState.userProfile = profile;

        if (typeof window.ui !== 'undefined' && typeof window.ui.saveAndSyncProfile === 'function') {
            window.ui.saveAndSyncProfile(profile);
            window.ui.updateProfileUI();

            const toast = document.getElementById('toast-notification');
            if (toast) { 
                toast.innerHTML = '✨ تم اختيار اللقب بنجاح!'; 
                toast.classList.add('show'); 
                setTimeout(() => toast.classList.remove('show'), 2500); 
            }

            if (window.TITLES_DB) {
                Object.keys(window.TITLES_DB).forEach(tKey => {
                    const card = document.getElementById('title-card-' + tKey);
                    const status = document.getElementById('title-status-' + tKey);
                    
                    if (card && status) {
                        if (tKey === titleKey) {
                            card.style.border = '1.5px solid #30d158';
                            card.style.background = 'rgba(48,209,88,0.1)';
                            status.innerHTML = '<span style="color: #30d158; font-size: 11px; font-weight: bold; background: rgba(48,209,88,0.15); padding: 4px 8px; border-radius: 8px;">مُستخدَم ✔️</span>';
                        } else {
                            card.style.border = '1px solid rgba(255,255,255,0.2)';
                            card.style.background = 'rgba(255,255,255,0.05)';
                            status.innerHTML = '<span style="color: #a1a1aa; font-size: 11px; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 8px;">تحديد</span>';
                        }
                    }
                });
            }
        }
    }
};

window.openCreatorSettings = function(roomId, currentBet) {
    const roomIdInput = document.getElementById('creator-target-room-id');
    const betInput = document.getElementById('edit-room-bet-input');
    const betDisplay = document.getElementById('edit-room-bet-display');
    
    if (roomIdInput) roomIdInput.value = roomId;
    if (betInput) betInput.value = currentBet;
    
    if (betDisplay) {
        let betText = "بدون رهان (مجاني)";
        if (currentBet == 50) betText = "50 <img src='../Photo/coin.webp' class='app-coin-icon'>";
        else if (currentBet == 100) betText = "100 <img src='../Photo/coin.webp' class='app-coin-icon'>";
        else if (currentBet == 200) betText = "200 <img src='../Photo/coin.webp' class='app-coin-icon'>";
        else if (currentBet == 500) betText = "500 <img src='../Photo/coin.webp' class='app-coin-icon'> (الحد الأقصى)";
        else if (currentBet == 1000) betText = "1000 <img src='../Photo/coin.webp' class='app-coin-icon'> (الحد الأقصى)";
        betDisplay.innerHTML = betText;
    }
    
    window.openAppModal('creator-room-settings-modal');
};

window.deleteMyRoom = function(roomId) {
    if (typeof window.ui !== 'undefined' && typeof window.ui.showCustomAlert === 'function') {
        window.ui.showCustomAlert(
            "هل أنت متأكد من رغبتك في إغلاق وحذف هذه الغرفة نهائياً؟",
            "حذف الغرفة 🗑️",
            () => {
                if (typeof window.socket !== 'undefined' && window.socket && window.socket.connected) {
                    window.socket.emit('leaveRoom', { roomID: roomId });
                }
            },
            true, "إلغاء", "نعم، احذفها"
        );
    }
};

window.confirmSpectatorBet = function() {
    const roomId = document.getElementById('spectator-bet-room-id')?.value || (window.gameState && window.gameState.onlineRoomID);
    const color = document.getElementById('spectator-bet-color')?.value;
    const amount = parseInt(document.getElementById('spectator-bet-amount')?.value) || 0;

    if (!roomId) {
        if (typeof window.ui.showCustomAlert === 'function') window.ui.showCustomAlert("خطأ في تحديد الغرفة للمراهنة!");
        return;
    }
    if (!color) {
        if (typeof window.ui.showCustomAlert === 'function') window.ui.showCustomAlert("الرجاء اختيار اللاعب المتوقع فوزه أولاً (أبيض أو أسود)!");
        return;
    }
    if (amount <= 0) {
        if (typeof window.ui.showCustomAlert === 'function') window.ui.showCustomAlert("الرجاء تحديد مبلغ الرهان!");
        return;
    }

    if (window.socket && window.socket.connected) {
        const profile = (window.gameState && window.gameState.userProfile) ? window.gameState.userProfile : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
        
        window.socket.emit('placeSpectatorBet', {
            roomID: String(roomId).trim(),
            color: color,
            amount: amount,
            guestId: profile.id
        });
        
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('spectator-bet-modal');
        }
    } else {
        if (typeof window.ui.showCustomAlert === 'function') window.ui.showCustomAlert("يرجى الاتصال بالإنترنت أولاً!");
    }
};
