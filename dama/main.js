/**
 * main.js
 * العقل المدبر المحلي للعبة: إدارة الأزرار، والمهام، وعجلة الحظ، ونظام الأصدقاء،
 * النوافذ المنبثقة، وتوجيه أحداث واجهة المستخدم (UI) بشكل كامل.
 */
import { gameState } from './gameState.js';
import { ui } from './uiController.js';
import { socket, socketManager } from './socketManager.js';
import { gameEngine } from './gameEngine.js';
import { t } from './i18n.js';

// ==========================================
// 💡 المتغيرات العامة وإعدادات البيئة
// ==========================================
window.modalStack = [];
window.isEditingBet = false;
window.pendingChallengeId = null;

let guestId = localStorage.getItem('guestId');
if (!guestId) { 
    guestId = 'guest_' + Date.now() + Math.random(); 
    localStorage.setItem('guestId', guestId); 
}

export function getUserId() { 
    try { let profile = JSON.parse(localStorage.getItem('hub_user_profile')); return profile ? profile.id : guestId; } 
    catch(e) { return guestId; } 
}

// ==========================================
// 💡 الإصلاحات الذكية وتصحيح الصوت (الشاشة البيضاء، البينج، الصوت)
// ==========================================
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        setTimeout(() => {
            document.body.style.display = 'none';
            void document.body.offsetHeight;
            document.body.style.display = 'flex';
            window.dispatchEvent(new Event('resize')); 
            document.body.style.transform = 'scale(1)';
            document.body.style.opacity = '0.99';
            window.requestAnimationFrame(() => { document.body.style.opacity = '1'; });
        }, 50);
    }
});

socket.on('connect', () => {
    setTimeout(() => {
        const pingText = document.getElementById('ping-text');
        const pingEl = document.getElementById('real-ping-indicator');
        if (pingText && pingText.innerText.includes('999')) {
            pingText.innerText = '... ms';
            if (pingEl) pingEl.style.color = '#66bb6a';
        }
        if (window.socketManager && typeof window.socketManager._hideDisconnectUI === 'function') {
            window.socketManager._hideDisconnectUI();
        }
        socket.volatile.emit('clientPing', Date.now());
    }, 300);
});

const originalAudioPlay = HTMLAudioElement.prototype.play;
HTMLAudioElement.prototype.play = function() { 
    const savedVol = localStorage.getItem('sfx_volume') || localStorage.getItem('dama_sfx_volume') || '0.7'; 
    this.volume = parseFloat(savedVol); 
    return originalAudioPlay.call(this); 
};

window.addEventListener('popstate', function(event) {
    if (window.isSpinning) { return; }
    if (window.modalStack.length > 0) { const topModalId = window.modalStack.pop(); const topModal = document.getElementById(topModalId); if (topModal) topModal.style.display = 'none'; return; }
    if (window.isMatchRunning) { const resignBtn = document.getElementById('resign-btn'); if (resignBtn) resignBtn.click(); return; }
    if (window.ui && window.ui.showCustomAlert) { window.ui.showCustomAlert( window.t ? window.t('confirm_exit_msg') : "هل أنت متأكد من رغبتك بإلغاء المباراة والعودة؟", window.t ? window.t('confirm_exit_title') : "تأكيد الخروج", () => { window.parent.postMessage({ type: 'EXIT_GAME' }, '*'); }, true, window.t ? window.t('cancel_btn') : "إلغاء", window.t ? window.t('ok_btn') : "تأكيد" ); }
});

// ==========================================
// 💡 التخزين (تم التخلص من حفظ المباراة محلياً لتنظيف المشروع)
// ==========================================
export function saveGameState() {}
export async function loadGameState() { return false; }

// ==========================================
// 🌟 إدارة النوافذ المنبثقة والتبويبات
// ==========================================
window.openAppModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) { 
        modal.style.display = 'flex'; 
        if (!window.modalStack.includes(id)) window.modalStack.push(id);
        if (id === 'online-modal' && window.socket && window.socket.connected) {
            window.socket.emit('requestActiveRooms');
        }
    }
};

window.closeAppModal = function(id) {
    if (id === 'lucky-spin-modal' && window.isSpinning) return; 
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none'; 
        window.modalStack = window.modalStack.filter(m => m !== id);
    }
};

window.toggleSideMenu = function() {
    const overlay = document.getElementById('side-menu-overlay');
    if (overlay.classList.contains('open')) overlay.classList.remove('open');
    else overlay.classList.add('open');
};

window.switchQuestTab = function(tab) {
    document.getElementById('quest-tab-daily').classList.remove('active');
    document.getElementById('quest-tab-weekly').classList.remove('active');
    document.getElementById('quests-list-container-daily').style.display = 'none';
    document.getElementById('quests-list-container-weekly').style.display = 'none';
    document.getElementById('quest-tab-' + tab).classList.add('active');
    document.getElementById('quests-list-container-' + tab).style.display = 'flex';
    if (window.questsManager) {
        window.questsManager.currentTab = tab;
        window.questsManager.updateTimerDisplay();
    }
};

window.switchStoreTabCategory = function(category) {
    const tabs = ['bg', 'frames', 'pieces', 'offers'];
    tabs.forEach(tab => { const btn = document.getElementById('store-btn-tab-' + tab); const sec = document.getElementById('store-section-' + tab); if(btn) btn.classList.remove('active'); if(sec) sec.style.display = 'none'; });
    const activeBtn = document.getElementById('store-btn-tab-' + category); const activeSec = document.getElementById('store-section-' + category);
    if(activeBtn) activeBtn.classList.add('active'); if(activeSec) activeSec.style.display = 'grid';
};

window.switchThemeGridTabCategory = function(category) {
    const tabs = ['bg', 'frames', 'pieces'];
    tabs.forEach(tab => { const btn = document.getElementById('theme-btn-tab-' + tab); const sec = document.getElementById('theme-grid-section-' + tab); if(btn) btn.classList.remove('active'); if(sec) sec.style.display = 'none'; });
    const activeBtn = document.getElementById('theme-btn-tab-' + category); const activeSec = document.getElementById('theme-grid-section-' + category);
    if(activeBtn) activeBtn.classList.add('active'); if(activeSec) activeSec.style.display = 'grid';
};

window.switchRoomTab = function(tab) {
    document.getElementById('room-tab-play').classList.remove('active'); document.getElementById('room-tab-bet').classList.remove('active');
    document.getElementById('active-rooms-list').style.display = 'none'; document.getElementById('spectate-rooms-list').style.display = 'none';
    document.getElementById('room-tab-' + tab).classList.add('active'); 
    if (tab === 'play') { document.getElementById('active-rooms-list').style.display = 'block'; } 
    else { document.getElementById('spectate-rooms-list').style.display = 'block'; }
};

window.switchLbTab = function(tab) {
    document.getElementById('lb-tab-wins').classList.remove('active'); document.getElementById('lb-tab-xp').classList.remove('active'); document.getElementById('lb-tab-tokens').classList.remove('active');
    document.getElementById('leaderboard-list-wins').style.display = 'none'; document.getElementById('leaderboard-list-xp').style.display = 'none'; document.getElementById('leaderboard-list-tokens').style.display = 'none';
    document.getElementById('lb-tab-' + tab).classList.add('active'); document.getElementById('leaderboard-list-' + tab).style.display = 'flex';
};

window.selectBetAmount = function(value, displayText, element) {
    if (window.isEditingBet) {
        document.getElementById('edit-room-bet-input').value = value; document.getElementById('edit-room-bet-display').innerText = displayText;
    } else {
        document.getElementById('room-bet-input').value = value; document.getElementById('custom-bet-display').innerText = displayText;
    }
    document.querySelectorAll('.bet-option-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    setTimeout(() => window.closeAppModal('bet-selector-modal'), 150);
};

// ==========================================
// 🌟 نظام الأصدقاء والملف الشخصي
// ==========================================
function cleanExpiredRequests(profile) {
    if (!profile.friendRequests) profile.friendRequests = [];
    const now = Date.now(); const threeDays = 3 * 24 * 60 * 60 * 1000;
    profile.friendRequests = profile.friendRequests.filter(req => (now - req.timestamp) < threeDays);
    return profile;
}

function renderFriendsList(friendsArr) {
    const listContainer = document.getElementById('igp-friends-list');
    if (!listContainer) return;
    if (!friendsArr || friendsArr.length === 0) { listContainer.innerHTML = 'لا يوجد أصدقاء حالياً'; return; }
    listContainer.innerHTML = '';
    friendsArr.forEach(friend => {
        let div = document.createElement('div');
        div.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:12px; margin-bottom:8px; border:1px solid rgba(255,255,255,0.05);";
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${friend.avatar || '../Photo/1000132081.webp'}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" onerror="this.src='../Photo/1000132081.webp'">
                <div style="text-align:right;">
                    <div style="font-weight:bold; color:white; font-size:14px;">${friend.name}</div>
                    <div style="font-size:10px; color:#a1a1aa;">${friend.id}</div>
                </div>
            </div>
            <div style="font-size:16px;">🤝</div>
        `;
        listContainer.appendChild(div);
    });
}

function renderFriendRequests() {
    let profStr = localStorage.getItem('hub_user_profile'); if (!profStr) return;
    let prof = cleanExpiredRequests(JSON.parse(profStr)); localStorage.setItem('hub_user_profile', JSON.stringify(prof));
    let container = document.getElementById('friend-requests-container'); let badge = document.getElementById('friend-requests-badge');
    let reqs = prof.friendRequests || [];

    if(badge) { if(reqs.length > 0) { badge.style.display = 'inline-block'; badge.innerText = reqs.length; } else { badge.style.display = 'none'; } }
    if (!container) return; container.innerHTML = '';
    
    if (reqs.length === 0) { container.innerHTML = '<div style="text-align:center; color:#a1a1aa; padding:20px;">لا توجد طلبات صداقة حالياً.</div>'; return; }

    reqs.forEach(req => {
        let div = document.createElement('div');
        div.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.05); padding:10px; border-radius:14px; border:1px solid rgba(255,255,255,0.05);";
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${req.avatar || '../Photo/1000132081.webp'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.src='../Photo/1000132081.webp'">
                <div style="text-align:right;">
                    <div style="font-weight:bold; color:white; font-size:14px;">${req.name}</div>
                    <div style="font-size:10px; color:#a1a1aa;">طلب صداقة</div>
                </div>
            </div>
            <div style="display:flex; gap:6px;">
                <button onclick="window.acceptFriendReq('${req.id}')" style="background:rgba(48,209,88,0.2); border:1px solid rgba(48,209,88,0.4); color:#30d158; width:34px; height:34px; border-radius:10px; font-size:16px; cursor:pointer;">✓</button>
                <button onclick="window.rejectFriendReq('${req.id}')" style="background:rgba(255,69,58,0.15); border:1px solid rgba(255,69,58,0.3); color:#ff453a; width:34px; height:34px; border-radius:10px; font-size:16px; cursor:pointer;">✕</button>
            </div>
        `;
        container.appendChild(div);
    });
}

window.acceptFriendReq = function(reqId) {
    let profStr = localStorage.getItem('hub_user_profile'); if(!profStr) return;
    let prof = JSON.parse(profStr); if(!prof.friends) prof.friends = [];
    let reqIndex = prof.friendRequests.findIndex(r => r.id === reqId);
    if(reqIndex !== -1) {
        let acceptedUser = prof.friendRequests[reqIndex];
        if(!prof.friends.find(f => f.id === reqId)) { prof.friends.push({ id: acceptedUser.id, name: acceptedUser.name, avatar: acceptedUser.avatar }); }
        prof.friendRequests.splice(reqIndex, 1);
        localStorage.setItem('hub_user_profile', JSON.stringify(prof));
        renderFriendRequests(); renderFriendsList(prof.friends);
        const toast = document.getElementById('toast-notification'); if (toast) { toast.innerText = '✅ تمت إضافة الصديق بنجاح!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
    }
};

window.rejectFriendReq = function(reqId) {
    let profStr = localStorage.getItem('hub_user_profile'); if(!profStr) return;
    let prof = JSON.parse(profStr); prof.friendRequests = prof.friendRequests.filter(r => r.id !== reqId);
    localStorage.setItem('hub_user_profile', JSON.stringify(prof)); renderFriendRequests();
};

window.sendFriendRequest = function() {
    if(!window.currentViewedPlayer) return;
    const toast = document.getElementById('toast-notification'); if (toast) { toast.innerText = '📨 تم إرسال طلب الصداقة بنجاح!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
    const btn = document.getElementById('send-friend-req-btn');
    if(btn) { btn.innerHTML = '✓ تم الإرسال'; btn.style.background = 'rgba(255,255,255,0.1) !important'; btn.style.color = '#a1a1aa !important'; btn.style.borderColor = 'rgba(255,255,255,0.2) !important'; btn.disabled = true; }
};

window.givePopularity = function() {
    if(!window.currentViewedPlayer) return;
    const toast = document.getElementById('toast-notification'); if (toast) { toast.innerText = '🔥 تم منح الشعبية بنجاح!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
    const valEl = document.getElementById('igp-popularity-val'); if(valEl) valEl.innerText = parseInt(valEl.innerText) + 1;
    const btn = document.getElementById('give-pop-btn');
    if(btn) { btn.innerHTML = '🔥 تم المنح'; btn.style.background = 'rgba(255,255,255,0.1) !important'; btn.style.color = '#a1a1aa !important'; btn.style.borderColor = 'rgba(255,255,255,0.2) !important'; btn.disabled = true; }
};

window.openMyProfile = function() {
    const xpCont = document.getElementById('igp-xp-container'); const statGrid = document.getElementById('igp-stats-grid'); const lvlBadge = document.getElementById('igp-level');
    if(xpCont) xpCont.style.display = 'block'; if(statGrid) statGrid.style.display = 'grid'; if(lvlBadge) lvlBadge.style.display = 'block';
    document.getElementById('own-profile-actions').style.display = 'block'; document.getElementById('other-profile-actions').style.display = 'none';
    
    let globalProfile = localStorage.getItem('hub_user_profile');
    if (globalProfile) {
        let prof = cleanExpiredRequests(JSON.parse(globalProfile)); localStorage.setItem('hub_user_profile', JSON.stringify(prof)); 
        window.applyProfileDataToUI(prof);
        const avatarContainer = document.getElementById('igp-avatar');
        let imgSrc = prof.avatar || '../Photo/1000132081.webp';
        if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:image')) { let cleanName = imgSrc.replace(/\.\.\//g, '').replace('Photo/', ''); imgSrc = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName; }
        avatarContainer.style.backgroundImage = 'none'; avatarContainer.innerHTML = `<img src="${imgSrc}" onerror="this.style.display='none'; this.parentNode.textContent='👤';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        
        let level = Math.floor(Math.sqrt(Math.max(0, prof.xp || 0) / 50)) + 1;
        if(lvlBadge) lvlBadge.innerText = `Lv.${level}`;
        
        let xpBar = document.getElementById('igp-xp-fill'); let xpText = document.getElementById('igp-xp-text');
        if(xpBar && xpText) {
            let currentLevelXp = Math.pow(level - 1, 2) * 50; let nextLevelXp = Math.pow(level, 2) * 50;
            let progress = ((prof.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
            xpBar.style.width = Math.min(100, Math.max(0, progress)) + '%'; xpText.innerText = `${prof.xp || 0} / ${nextLevelXp} XP`;
        }
        document.getElementById('igp-popularity-val').innerText = prof.popularity || 0;
        renderFriendsList(prof.friends); renderFriendRequests();
    }
    window.openAppModal('in-game-profile-modal');
};

window.showPlayerProfileFromLB = function(player) {
    window.currentViewedPlayer = player; 
    const xpContainer = document.getElementById('igp-xp-container'); const statsGrid = document.getElementById('igp-stats-grid'); const levelBadge = document.getElementById('igp-level');
    if(xpContainer) xpContainer.style.display = 'none'; if(statsGrid) statsGrid.style.display = 'none'; if(levelBadge) levelBadge.style.display = 'none';
    document.getElementById('own-profile-actions').style.display = 'none'; document.getElementById('other-profile-actions').style.display = 'flex';
    
    const reqBtn = document.getElementById('send-friend-req-btn'); if(reqBtn) { reqBtn.innerHTML = '➕ إرسال طلب صداقة'; reqBtn.style.cssText = "background: rgba(48,209,88,0.15) !important; color: #30d158 !important; border-color: rgba(48,209,88,0.3) !important; margin: 0;"; reqBtn.disabled = false; }
    const popBtn = document.getElementById('give-pop-btn'); if(popBtn) { popBtn.innerHTML = '🔥 منح شعبية'; popBtn.style.cssText = "background: rgba(255,77,77,0.15) !important; color: #ff4d4d !important; border-color: rgba(255,77,77,0.3) !important; margin: 0;"; popBtn.disabled = false; }

    document.getElementById('igp-name').innerText = player.name || 'لاعب مجهول'; document.getElementById('igp-id-display').innerText = player.id || 'غير متوفر';
    document.getElementById('igp-popularity-val').innerText = player.popularity || Math.floor(Math.random() * 800) + 50;

    const avatarContainer = document.getElementById('igp-avatar');
    let imgSrc = player.avatar || '../Photo/1000132081.webp';
    if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:image')) { let cleanName = imgSrc.replace(/\.\.\//g, '').replace('Photo/', ''); imgSrc = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName; }
    avatarContainer.style.backgroundImage = 'none'; avatarContainer.innerHTML = `<img src="${imgSrc}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    
    if (player.rankInfo) { document.getElementById('igp-rank-title').innerText = `الرتبة: ${player.rankInfo.icon} ${player.rankInfo.title}`; } else { document.getElementById('igp-rank-title').innerText = `الرتبة: 🥉 برونزي`; }
    window.openAppModal('in-game-profile-modal');
};

function fallbackCopyText(text, callback) {
    const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); if (callback) callback(); } catch (err) {}
    document.body.removeChild(textArea);
}

window.copyMyId = function() {
    const idText = document.getElementById('igp-id-display').innerText;
    if (idText && idText !== '...') {
        const showToast = () => { const toast = document.getElementById('toast-notification'); if (toast) { toast.innerText = '📋 تم نسخ الـ ID بنجاح'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); } };
        if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(idText).then(showToast).catch(() => { fallbackCopyText(idText, showToast); }); } else { fallbackCopyText(idText, showToast); }
    }
};

// ==========================================
// 🌟 لوحة الشرف (Leaderboard)
// ==========================================
window.createLbItemHTML = function(rank, playerObj, type) {
    let score = playerObj.score; let name = playerObj.name; let avatarStr = playerObj.avatar; let playerRankInfo = playerObj.rankInfo;
    let prefix = type === 'tokens' ? '🪙 ' : (type === 'xp' ? '🌟 ' : '');
    let suffix = type === 'wins' ? ' ' + (window.t ? window.t('igp_wins') : 'فوز') : (type === 'xp' ? ' XP' : '');
    
    if (type === 'xp') {
        let level = Math.floor(Math.sqrt(Math.max(0, score) / 50)) + 1; if (level > 200) level = 200;
        prefix = `<span style="color:#87ceeb; font-weight:800; margin-left:6px; background: rgba(135,206,235,0.15); border: 1px solid rgba(135,206,235,0.3); padding: 2px 6px; border-radius: 6px;">Lv.${level}</span> 🌟 `;
    }

    const div = document.createElement('div'); div.className = 'lb-item';
    let rankIconHTML = playerRankInfo && playerRankInfo.icon ? `<span class="rank-icon-small" title="${playerRankInfo.title}">${playerRankInfo.icon}</span>` : '';
    const nameEl = document.createElement('div'); nameEl.className = 'lb-name'; nameEl.innerHTML = `<span>${name}</span>${rankIconHTML}`;
    div.innerHTML = `
        <div class="lb-rank">#${rank}</div>
        <div class="lb-avatar" style="padding:0; border:2px solid rgba(255,255,255,0.1); display:flex; justify-content:center; align-items:center; overflow:hidden; cursor:pointer; transition:all 0.2s;" title="عرض الملف الشخصي"></div>
        <div class="lb-info">
            <div class="lb-name-container"></div>
            <div class="lb-score" style="display:flex; align-items:center; justify-content:flex-end;">${prefix}${score}${suffix}</div>
        </div>
    `;
    div.querySelector('.lb-name-container').replaceWith(nameEl);
    const avatarContainer = div.querySelector('.lb-avatar');
    
    avatarContainer.onclick = function() { if(window.showPlayerProfileFromLB) window.showPlayerProfileFromLB(playerObj); };
    avatarContainer.onmouseover = () => { avatarContainer.style.transform = 'scale(1.1)'; avatarContainer.style.borderColor = '#3498db'; };
    avatarContainer.onmouseout = () => { avatarContainer.style.transform = 'scale(1)'; avatarContainer.style.borderColor = 'rgba(255,255,255,0.1)'; };

    if (avatarStr && avatarStr !== 'null' && avatarStr !== 'undefined') {
        let imgSrc = avatarStr;
        if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:image')) { let cleanName = imgSrc.replace(/\.\.\//g, '').replace('Photo/', ''); imgSrc = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName; }
        const img = document.createElement('img'); img.style.cssText = "width: 100%; height: 100%; border-radius: 50%; object-fit: cover;";
        img.onerror = function() { avatarContainer.innerHTML = '<span style="font-size: 22px;">👤</span>'; };
        img.src = imgSrc; avatarContainer.appendChild(img);
    } else { avatarContainer.innerHTML = '<span style="font-size: 22px;">👤</span>'; }
    return div;
};

window.populateLeaderboards = function(winsData, xpData, tokensData) {
    const winsList = document.getElementById('leaderboard-list-wins'); const xpList = document.getElementById('leaderboard-list-xp'); const tokensList = document.getElementById('leaderboard-list-tokens');
    winsList.innerHTML = ''; xpList.innerHTML = ''; tokensList.innerHTML = '';
    const emptyText = window.t ? window.t('lb_empty') : 'لا توجد بيانات حالياً';

    const renderList = (container, data, type) => {
        if (!data || data.length === 0) { container.innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px; font-weight: 600;">${emptyText}</div>`; return; }
        for (let i = 0; i < data.length; i++) { container.appendChild(window.createLbItemHTML(i + 1, data[i], type)); }
    };
    renderList(winsList, winsData, 'wins'); renderList(xpList, xpData, 'xp'); renderList(tokensList, tokensData, 'tokens');
};

window.showLeaderboard = function() {
    window.openAppModal('leaderboard-modal'); 
    const loadingText = window.t ? window.t('lb_loading') : 'جاري التحميل...';
    document.getElementById('leaderboard-list-wins').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    document.getElementById('leaderboard-list-xp').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    document.getElementById('leaderboard-list-tokens').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    if(window.socket && window.socket.connected) window.socket.emit('getLeaderboard');
};

// ==========================================
// 🌟 المتجر، المشتريات والتخصيص
// ==========================================
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
            }
        } catch(e) {}
    }, 50);
};

window.triggerCustomAlertNotification = function(msg) {
    if (typeof showCustomAlert === 'function') { showCustomAlert(msg); } else {
        const alertModal = document.getElementById('custom-alert-modal'); const alertMsg = document.getElementById('custom-alert-message'); const alertOk = document.getElementById('custom-alert-ok'); const alertCancel = document.getElementById('custom-alert-cancel');
        if (alertModal && alertMsg && alertOk) { document.getElementById('custom-alert-title').innerText = window.t ? window.t('alert_store') : 'إشعار المتجر'; alertMsg.innerText = msg; if(alertCancel) alertCancel.style.display = 'none'; window.openAppModal('custom-alert-modal'); alertOk.onclick = () => window.closeAppModal('custom-alert-modal'); } else { alert(msg); }
    }
};

window.triggerGridThemeChange = function(index, lightHex, darkHex) {
    document.documentElement.style.setProperty('--light-cell', lightHex); document.documentElement.style.setProperty('--dark-cell', darkHex);
    if (index !== -1) { const items = document.querySelectorAll('#theme-grid-section-bg .theme-grid-item'); items.forEach((item, idx) => { if (idx === index) item.classList.add('active'); else item.classList.remove('active'); }); }
    let p = localStorage.getItem('hub_user_profile');
    if (p && index !== -1) { let prof = JSON.parse(p); prof.equippedBg = null; localStorage.setItem('hub_user_profile', JSON.stringify(prof)); if(window.updateInventoryUI) window.updateInventoryUI(); }
};

window.openPurchaseModal = function(itemId, itemName, cost, itemType) {
    const nameEl = document.getElementById('modal-item-name'); const costEl = document.getElementById('modal-item-cost'); const previewEl = document.getElementById('modal-item-preview'); const buyBtn = document.getElementById('confirm-buy-btn');
    nameEl.innerText = itemName; costEl.innerText = '🪙 ' + cost; const itemData = window.STORE_ITEMS ? window.STORE_ITEMS[itemId] : null; previewEl.innerHTML = ''; previewEl.style.background = 'rgba(255,255,255,0.05)'; previewEl.style.backgroundImage = 'none';
    if(itemData) {
        previewEl.style.border = itemData.isLegendary ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)'; previewEl.className = itemData.isLegendary ? 'purchase-preview-box legendary-icon' : 'purchase-preview-box';
        if (itemData.isImage) { let imgUrl = itemData.imagePath || itemData.imagePathWhite || ''; previewEl.style.backgroundImage = `url('${imgUrl}')`; previewEl.style.backgroundSize = 'cover'; previewEl.style.backgroundPosition = 'center'; } else if(itemType === 'pc') { previewEl.innerHTML = itemData.icon || '💎'; } else if(itemType === 'score') { previewEl.innerHTML = `<div style="width: 80%; height: 35px; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.2);"><div style="flex: 1; background: ${itemData.scoreBg2}; border-bottom: 1px solid rgba(255,255,255,0.1);"></div><div style="flex: 1; background: ${itemData.scoreBg1};"></div></div>`; } else if(itemType === 'bg' || itemType === 'fr') { if (itemData.cssLight && itemData.cssDark) { previewEl.innerHTML = `<div style="display:flex; flex:1;"><div style="flex:1; ${itemData.cssLight}"></div><div style="flex:1; ${itemData.cssDark}"></div></div><div style="display:flex; flex:1;"><div style="flex:1; ${itemData.cssDark}"></div><div style="flex:1; ${itemData.cssLight}"></div></div>`; } else if (itemData.cssBoard) { previewEl.innerHTML = `<div style="width:100%; height:100%; ${itemData.cssBoard} border-width:6px;"></div>`; } else { previewEl.style.background = `linear-gradient(135deg, ${itemData.light || '#DEB887'} 50%, ${itemData.dark || '#8B4513'} 50%)`; } }
    } else { previewEl.innerHTML = '🎁'; previewEl.className = 'purchase-preview-box'; }
    buyBtn.onclick = () => { window.closeAppModal('purchase-modal'); setTimeout(() => { if (window.socket && typeof getUserId === 'function' && window.socket.connected) { window.socket.emit('requestPurchase', { userId: getUserId(), itemId: itemId }); } else { const msg = window.t ? window.t('alert_no_store') : "نظام الشراء غير متاح حالياً، يرجى الاتصال بالإنترنت أولاً."; if (typeof window.triggerCustomAlertNotification === 'function') window.triggerCustomAlertNotification(msg); else alert(msg); } }, 120); };
    window.openAppModal('purchase-modal');
};

// ==========================================
// 🌟 حماية الصورة وتحديث البروفايل للواجهة
// ==========================================
function forceLockedGlobalAvatar() {
    let globalProfile = localStorage.getItem('hub_user_profile');
    let avatarSrc = "../Photo/1000132081.webp"; let isImage = true;
    if (globalProfile) { try { const parsedHub = JSON.parse(globalProfile); if (parsedHub.avatar) { avatarSrc = parsedHub.avatar; isImage = avatarSrc.includes('.') || avatarSrc.startsWith('data:image') || avatarSrc.startsWith('http'); } } catch(e) {} }
    if (isImage && !avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:image')) { let cleanName = avatarSrc.replace(/\.\.\//g, '').replace('Photo/', ''); avatarSrc = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName; }
    
    const targetAvatars = ['badge-avatar', 'card-my-avatar', 'mm-my-avatar'];
    targetAvatars.forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        if (isImage) { const existingImg = el.querySelector('img'); if (!existingImg || existingImg.getAttribute('src') !== avatarSrc) { el.style.backgroundImage = 'none'; el.innerHTML = `<img src="${avatarSrc}" onerror="this.style.display='none'; this.parentNode.textContent='👤';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`; } } else { if (el.textContent !== avatarSrc) { el.innerHTML = ''; el.textContent = avatarSrc; } }
    });
}

const avatarGuardObserver = new MutationObserver((mutations) => { let shouldProtect = false; for (let mutation of mutations) { if (mutation.type === 'childList') { const hasImg = Array.from(mutation.target.children).some(el => el.tagName === 'IMG'); if (!hasImg && mutation.target.textContent !== "👤") { shouldProtect = true; break; } } } if (shouldProtect) { avatarGuardObserver.disconnect(); forceLockedGlobalAvatar(); startAvatarGuard(); } });
function startAvatarGuard() { const targets = ['badge-avatar', 'card-my-avatar', 'mm-my-avatar']; targets.forEach(id => { const el = document.getElementById(id); if (el) { avatarGuardObserver.observe(el, { childList: true, attributes: false }); } }); }

window.applyProfileDataToUI = function(profile) {
    const currentTokens = profile.tokens !== undefined ? profile.tokens : 0;
    const currentId = profile.id || getUserId();
    const textElements = { 'badge-username-display-game': profile.name, 'card-my-name': profile.name, 'mm-my-name': profile.name, 'profile-stat-tokens-badge': currentTokens, 'profile-stat-tokens-store': currentTokens, 'igp-name': profile.name, 'igp-id-display': currentId, 'igp-games': profile.gamesPlayed !== undefined ? profile.gamesPlayed : (profile.games !== undefined ? profile.games : 0), 'igp-wins': profile.wins !== undefined ? profile.wins : 0, 'igp-losses': profile.losses !== undefined ? profile.losses : 0 };
    
    for (let id in textElements) { const el = document.getElementById(id); if (el) { el.innerText = textElements[id]; } }
    forceLockedGlobalAvatar(); if(window.updateInventoryUI) window.updateInventoryUI(); 
    if (typeof window.applyTheme === 'function') { window.applyTheme(profile); }
};

// ==========================================
// 🌟 دوال مساعدة (ترجمة، راديو، خلفية)
// ==========================================
window.currentLang = 'ar';
window.updateHtmlTexts = function() {
    if (!window.t) return;
    const setTxt = (id, key) => { const el = document.getElementById(id); if (el) el.innerText = window.t(key); };
    setTxt('menu-title-text', 'menu_title'); setTxt('menu-bag-text', 'menu_bag'); setTxt('menu-radio-text', 'menu_radio'); setTxt('menu-room-text', 'menu_room'); setTxt('menu-leaderboard-text', 'menu_leaderboard'); setTxt('menu-settings-text', 'menu_settings'); setTxt('menu-exit-text', 'menu_exit'); setTxt('lb-title-text', 'lb_title'); setTxt('lb-tab-wins', 'lb_wins'); setTxt('lb-tab-tokens', 'lb_tokens'); setTxt('tutorial-mode-label', 'tutorial_mode'); setTxt('menu-quests-text', 'menu_quests');
    if (document.getElementById('matchmaking-modal').style.display === 'flex') setTxt('mm-status-label', 'searching');
};

window.toggleRadioMusic = function() {
    const dot = document.getElementById('dama-radio-status'); let isActive = false;
    if (dot) { isActive = dot.classList.toggle('active'); }
    if (isActive) { window.parent.postMessage({ type: 'PLAY_RADIO' }, '*'); } else { window.parent.postMessage({ type: 'STOP_RADIO' }, '*'); }
};

function syncRadioStatusDot() { 
    const statusDot = document.getElementById('dama-radio-status'); 
    if (statusDot) { 
        const isPlaying = localStorage.getItem('hub_music_enabled') === 'true'; 
        if (isPlaying) statusDot.classList.add('active'); else statusDot.classList.remove('active'); 
    } 
}

function syncGlobalBackground() {
    const bg = localStorage.getItem('custom_app_bg'); 
    if (bg) {
        let bgUrl = bg; if (!bg.startsWith('http') && !bg.startsWith('data:') && !bg.startsWith('../')) { bgUrl = '../' + bg; }
        document.body.style.backgroundImage = `url('${bgUrl}')`; document.body.style.backgroundSize = 'cover'; document.body.style.backgroundPosition = 'center'; document.body.style.backgroundAttachment = 'fixed'; document.body.style.backgroundColor = 'transparent';
    } else { document.body.style.backgroundColor = '#2c3e50'; document.body.style.backgroundImage = 'none'; }
}

window.addEventListener('storage', (e) => {
    if (e.key === 'hub_music_enabled') { syncRadioStatusDot(); }
    if (e.key === 'custom_app_bg') { syncGlobalBackground(); }
    if (e.key === 'hub_user_profile') { forceLockedGlobalAvatar(); }
});

// ==========================================
// 💡 دوال اللعبة القديمة المستمرة
// ==========================================
export function startOnlineHintSystem() {
    if (gameState.originalHints === null) { gameState.originalHints = gameState.userProfile.hints !== undefined ? gameState.userProfile.hints : 5; }
    gameState.userProfile.hints = 2;
    ui.updateProfileUI();
}

export function restoreOfflineHintSystem() {
    if (gameState.originalHints !== null) {
        gameState.userProfile.hints = gameState.originalHints;
        gameState.originalHints = null;
        try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e) { }
        ui.updateProfileUI();
    }
}

let spinTimerInterval = null;
export function updateSpinTimerDisplay(nextFreeTime) {
    if (spinTimerInterval) clearInterval(spinTimerInterval);
    const tick = () => {
        const now = Date.now();
        const timerEl = document.getElementById('spin-timer');
        const freeBtn = document.getElementById('spin-free-btn');
        const paidBtn = document.getElementById('spin-paid-btn');
        const menuNotifyBadge = document.getElementById('menu-spin-notify-badge');

        if (!nextFreeTime || now >= nextFreeTime) {
            if (timerEl) timerEl.innerText = "اللفة المجانية جاهزة! 🎁";
            if (freeBtn) { freeBtn.style.display = 'flex'; }
            if (paidBtn) paidBtn.style.display = 'none';
            if (menuNotifyBadge) menuNotifyBadge.style.display = 'block';
            clearInterval(spinTimerInterval); spinTimerInterval = null;
        } else {
            let diff = Math.floor((nextFreeTime - now) / 1000);
            let h = String(Math.floor(diff / 3600)).padStart(2, '0');
            let m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
            let s = String(diff % 60).padStart(2, '0');
            if (timerEl) timerEl.innerText = `اللفة المجانية القادمة بعد: ${h}:${m}:${s}`;
            if (freeBtn) freeBtn.style.display = 'none';
            if (paidBtn) { paidBtn.style.display = 'flex'; }
            if (menuNotifyBadge) menuNotifyBadge.style.display = 'none';
        }
    };
    tick();
    if (nextFreeTime && nextFreeTime > Date.now()) { spinTimerInterval = setInterval(tick, 1000); }
}

// ==========================================
// 🌟 تشغيل اللعبة الأساسي (Initialization)
// ==========================================
window.addEventListener('load', async () => {
    history.replaceState({ screen: 'dama-game' }, '');
    
    let savedAppLang = localStorage.getItem('appLang') || localStorage.getItem('lang') || 'ar';
    document.documentElement.lang = savedAppLang; document.documentElement.dir = savedAppLang === 'ar' ? 'rtl' : 'ltr'; window.currentLang = savedAppLang;

    syncGlobalBackground();
    syncRadioStatusDot();

    ui.initProfileSystem();
    ui.drawEmptyBoard();
    if (window.updateHtmlTexts) window.updateHtmlTexts();

    socketManager.init();

    if (gameState.userProfile && gameState.userProfile.nextFreeSpin) { updateSpinTimerDisplay(gameState.userProfile.nextFreeSpin); } else { updateSpinTimerDisplay(0); }
    if (!socket.connected) socket.connect();
    
    setTimeout(() => { const profileStr = localStorage.getItem('hub_user_profile'); if (profileStr && socket && socket.connected) { socket.emit('syncProfile', JSON.parse(profileStr)); } }, 1000);

    let globalProfile = localStorage.getItem('hub_user_profile');
    if (globalProfile) window.applyProfileDataToUI(JSON.parse(globalProfile));
    
    forceLockedGlobalAvatar(); startAvatarGuard();
    
    const sfxSlider = document.getElementById('sfx-volume');
    if(sfxSlider) { const savedVol = localStorage.getItem('sfx_volume') || localStorage.getItem('dama_sfx_volume') || '0.7'; sfxSlider.value = savedVol; sfxSlider.addEventListener('input', (e) => { const vol = parseFloat(e.target.value); localStorage.setItem('sfx_volume', vol); localStorage.setItem('dama_sfx_volume', vol); }); }
    const btnSaveSettings = document.getElementById('save-settings-btn');
    if(btnSaveSettings) btnSaveSettings.onclick = () => window.closeAppModal('settings-overlay');

    const optoutCheck = document.getElementById('sync-theme-optout');
    if (optoutCheck) {
        let savedProfile = {}; try { savedProfile = JSON.parse(localStorage.getItem('hub_user_profile')) || {}; } catch(e) {}
        let isOptOut = savedProfile.syncThemeOptOut; if (isOptOut === undefined) { isOptOut = localStorage.getItem('dama_sync_optout') === 'true'; }
        optoutCheck.checked = isOptOut;
        optoutCheck.addEventListener('change', (e) => {
            let isChecked = e.target.checked; localStorage.setItem('dama_sync_optout', isChecked);
            if (window.gameState && window.gameState.userProfile) {
                window.gameState.userProfile.syncThemeOptOut = isChecked;
                try { localStorage.setItem('hub_user_profile', JSON.stringify(window.gameState.userProfile)); if (window.socket && window.socket.connected) { window.socket.emit('syncProfile', window.gameState.userProfile); } } catch(err) {}
            }
        });
    }

    socket.on('luckySpinResult', (data) => {
        const freeBtn = document.getElementById('spin-free-btn'); if (freeBtn) freeBtn.innerText = "لفة مجانية 🆓";
        const paidBtn = document.getElementById('spin-paid-btn'); if (paidBtn) paidBtn.innerText = "لفة إضافية (200 🪙)";
        if (data.success) {
            ui.animateLuckySpin(data.prizeIndex, () => {
                ui.showCustomAlert(data.message, "🎉 مبروك!");
                if (data.nextFreeSpinTime) {
                    gameState.userProfile.nextFreeSpin = data.nextFreeSpinTime;
                    try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}
                    updateSpinTimerDisplay(data.nextFreeSpinTime);
                }
            });
        } else { ui.showCustomAlert(data.message, "عذراً"); }
    });

    socket.on('profileUpdated', (profile) => {
        if (!profile) return;
        gameState.userProfile = { ...gameState.userProfile, ...profile };
        try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}

        if (gameState.userProfile.syncThemeOptOut !== undefined) {
            const optCb = document.getElementById('sync-theme-optout');
            if (optCb) optCb.checked = gameState.userProfile.syncThemeOptOut;
        }

        if (typeof window.applyProfileDataToUI === 'function') { window.applyProfileDataToUI(gameState.userProfile); }
        ui.updateProfileUI();
        if (profile.nextFreeSpin) { updateSpinTimerDisplay(profile.nextFreeSpin); }
    });

    socket.on('gameStart', (data) => { gameState.roomBet = data.roomBet || 0; });

    const lobbyCreateBtn = document.querySelector('#online-modal .save-settings-btn');
    if (lobbyCreateBtn) {
        lobbyCreateBtn.onclick = () => {
            window.isEditingBet = false; 
            window.pendingChallengeId = null;
            document.getElementById('create-room-password-input').style.display = 'block';
            document.getElementById('create-room-password-input').previousElementSibling.style.display = 'block';
            document.getElementById('online-create-btn').innerText = "تأكيد وإنشاء";
            if (typeof window.openAppModal === 'function') window.openAppModal('create-room-modal');
        };
    }
    
    window.addEventListener('message', (event) => {
        if (!event.data) return;
        if (event.data.type === 'LANGUAGE_CHANGED') { const newLang = event.data.lang; document.documentElement.lang = newLang; document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'; window.currentLang = newLang; if (typeof window.updateUITranslations === 'function') window.updateUITranslations(); if (typeof window.updateHtmlTexts === 'function') window.updateHtmlTexts(); if (document.getElementById('leaderboard-modal').style.display === 'flex') { if(window.socket && window.socket.connected) window.socket.emit('getLeaderboard'); } }
        if (event.data.type === 'PROFILE_UPDATED' && event.data.profile) window.applyProfileDataToUI(event.data.profile);
    });

    setInterval(() => {
        if (window.ui && window.ui.showCustomAlert && !window.ui._alertPatched) {
            const originalShowAlert = window.ui.showCustomAlert;
            window.ui.showCustomAlert = function(msg, title, onConfirm, showCancel, customCancelText, customOkText, onCancel) {
                if (msg && msg.includes("السيرفر غير متصل، يرجى الانتظار قليلاً...")) { msg = "جاري الاتصال، يرجى انتظار قليلاً...."; }
                originalShowAlert.call(window.ui, msg, title, onConfirm, showCancel, customCancelText, customOkText, onCancel);
            };
            window.ui._alertPatched = true;
        }
        
        const matchCard = document.getElementById('match-players-card'); const isOnline = (matchCard && matchCard.style.display !== 'none');
        if (isOnline) document.body.classList.add('online-mode-active'); else document.body.classList.remove('online-mode-active');
    }, 500);
});

// ==========================================
// 💡 إدارة التحديات والأحداث
// ==========================================
window.challengeFriend = function(friendId) {
    if (!gameState.userProfile) return;
    if (!socket || !socket.connected) return ui.showCustomAlert(t('sys_offline') || "يجب الاتصال بالإنترنت أولاً");

    ui.setDisplay('in-game-profile-modal', 'none');
    window.pendingChallengeId = friendId;

    document.getElementById('create-room-password-input').style.display = 'none';
    document.getElementById('create-room-password-input').previousElementSibling.style.display = 'none';

    const createBtn = document.getElementById('online-create-btn');
    createBtn.innerText = "إرسال التحدي ⚔️";

    if (typeof window.openAppModal === 'function') window.openAppModal('create-room-modal');
};

document.addEventListener('click', (e) => {
    if (e.target.id === 'spin-free-btn' || e.target.id === 'spin-paid-btn') {
        setTimeout(() => { if (window.isSpinning && window.questsManager) { window.questsManager.updateProgress('spin'); } }, 500);
    }
});

ui.onClick('diff-quick-select', saveGameState);
ui.onClick('start-white-btn', () => { gameState.playerColor = 'white'; ui.initBoard(); ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('start-black-btn', () => { gameState.playerColor = 'black'; ui.initBoard(); ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('new-game-modal', e => { if (e.target.id === 'new-game-modal') ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('cancel-new-game-btn', () => ui.setDisplay('new-game-modal', 'none'));
ui.onClick('settings-btn', e => { e.stopPropagation(); ui.setDisplay('settings-overlay', 'flex'); });
ui.onClick('save-settings-btn', () => { saveGameState(); ui.setDisplay('settings-overlay', 'none'); });
ui.onClick('settings-overlay', e => { if (e.target.id === 'settings-overlay') ui.setDisplay('settings-overlay', 'none'); });
ui.onClick('lang-select-modal', e => { gameState.lang = e.target.value; if (window.updateHtmlTexts) window.updateHtmlTexts(); });

ui.onClick('login-guest-btn', () => {
    gameState.userProfile = { ...gameState.userProfile, name: t('guest_prefix') + (10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000)), id: "GUEST-" + (10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000)), avatar: ui.getVal('login-avatar-select', '1000132081.png'), isCustomAvatar: false };
    try { localStorage.setItem('dama_guest_expiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch (e) { }
    ui.updateProfileUI(); ui.setDisplay('login-modal', 'none');
});

ui.onClick('login-submit-btn', () => {
    let name = ui.getVal('login-name-input').trim();
    if (!name) return ui.showCustomAlert(t('enter_name'));
    name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    gameState.userProfile = { ...gameState.userProfile, name, id: "DAMA-" + Math.random().toString(36).substring(2, 8).toUpperCase(), avatar: gameState.userProfile.isCustomAvatar ? gameState.userProfile.avatar : ui.getVal('login-avatar-select', '1000132081.png') };
    try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); localStorage.removeItem('dama_guest_expiry'); } catch (e) { }
    ui.updateProfileUI(); ui.setDisplay('login-modal', 'none');
});

ui.onClick('add-friend-btn', () => {
    let fId = ui.getVal('friend-id-input').trim().toUpperCase();
    if (!fId || fId === gameState.userProfile.id || gameState.userProfile.friends.includes(fId)) return ui.showCustomAlert(t('invalid_id'));
    gameState.userProfile.friends.push(fId);
    try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}
    ui.updateProfileUI(); document.getElementById('friend-id-input').value = ''; ui.showCustomAlert(t('added_success'));
});

document.getElementById('avatar-upload-input')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/') || file.size > 800 * 1024) return ui.showCustomAlert(t('img_large'));
    const reader = new FileReader();
    reader.onload = ev => {
        gameState.userProfile.avatar = ev.target.result; gameState.userProfile.isCustomAvatar = true; ui.updateProfileUI();
        try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(err) { ui.showCustomAlert("Storage limit exceeded."); }
    };
    reader.readAsDataURL(file);
});

ui.onClick('logout-btn', () => {
    const isGuest = gameState.userProfile.id.startsWith("GUEST-");
    const msg = isGuest ? t('guest_logout_warn') : t('logout_confirm');
    ui.showCustomAlert(msg, null, () => {
            gameState.originalHints = null; localStorage.removeItem('hub_user_profile'); localStorage.removeItem('dama_guest_expiry');
            gameState.userProfile = { id: "", name: "", avatar: "1000132081.png", isCustomAvatar: false, gamesPlayed: 0, wins: 0, losses: 0, friends: [], hints: 5, nextFreeSpin: 0, discountTicket: 0 };
            ui.setDisplay('profile-modal', 'none'); ui.setDisplay('login-modal', 'flex');
            if (typeof window.applyProfileDataToUI === 'function') window.applyProfileDataToUI(gameState.userProfile);
        }, true);
});

ui.onClick('switch-account-btn', () => { ui.setDisplay('profile-modal', 'none'); ui.setDisplay('login-modal', 'flex'); });

ui.onClick('spin-free-btn', () => {
    if (window.isSpinning) return;
    if (socket && socket.connected) {
        const btn = document.getElementById('spin-free-btn'); if (btn) btn.innerText = "جاري التحقق...";
        socket.emit('requestLuckySpin', { type: 'free', guestId: gameState.userProfile.id });
    } else { ui.showCustomAlert(t('server_disconnected') || "يرجى الاتصال بالإنترنت أولاً للعب عجلة الحظ!"); }
});

ui.onClick('spin-paid-btn', () => {
    if (window.isSpinning) return;
    if (gameState.userProfile.tokens < 200) { return ui.showCustomAlert("رصيدك غير كافٍ للفة الإضافية (مطلوب 200 🪙)", "عذراً"); }
    if (socket && socket.connected) {
        ui.showCustomAlert("سيتم خصم 200 🪙 من رصيدك مقابل هذه اللفة الإضافية. هل أنت مستعد؟", "تأكيد اللفة", () => {
            const btn = document.getElementById('spin-paid-btn');
            if (btn) { btn.innerText = "جاري الدفع..."; btn.style.pointerEvents = 'none'; }
            socket.emit('requestLuckySpin', { type: 'paid', guestId: gameState.userProfile.id });
        }, true, "إلغاء", "نعم، لف العجلة!");
    } else { ui.showCustomAlert(t('server_disconnected') || "يرجى الاتصال بالإنترنت أولاً للعب عجلة الحظ!"); }
});

const onlineBtn = document.getElementById('online-toggle-btn');
if (onlineBtn) {
    onlineBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameState.isOnlineMode) { if (ui && typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('already_match')); return; }
        if (!socket || !socket.connected) { if (ui && typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('server_disconnected')); return; }

        if (window.myCurrentRoomId && window.socket && window.socket.connected) {
            window.socket.emit('leaveRoom', { roomID: window.myCurrentRoomId });
            window.socket.emit('deleteRoom', { roomID: window.myCurrentRoomId });
            window.myCurrentRoomId = null; 
        }

        const mmModal = document.getElementById('matchmaking-modal');
        if (mmModal) {
            mmModal.style.display = 'flex';
            if (!window.modalStack) window.modalStack = [];
            if (!window.modalStack.includes('matchmaking-modal')) { window.modalStack.push('matchmaking-modal'); history.pushState({ modalOpen: 'matchmaking-modal' }, ''); }
        }

        const profile = gameState.userProfile || {};
        const myNameEl = document.getElementById('mm-my-name'); const myAvatarEl = document.getElementById('mm-my-avatar');

        if (myNameEl) myNameEl.innerText = profile.name || t('badge_you');
        if (myAvatarEl) {
            let avatarSrc = profile.avatar || "1000132081.png";
            if (!avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:')) {
                let cleanName = avatarSrc.replace(/\.\.\//g, '').replace('Photo/', '');
                avatarSrc = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + cleanName;
            }
            myAvatarEl.style.backgroundImage = 'none';
            myAvatarEl.innerHTML = `<img src="${avatarSrc}" onerror="this.style.display='none'; this.parentNode.textContent='👤';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
        }

        const oppNameEl = document.getElementById('mm-opp-name'); const oppAvatarEl = document.getElementById('mm-opp-avatar'); const statusLabelEl = document.getElementById('mm-status-label');
        if (oppNameEl) oppNameEl.innerText = t('mm_opp'); if (statusLabelEl) statusLabelEl.innerText = t('searching');
        if (oppAvatarEl) { oppAvatarEl.innerHTML = "❓"; oppAvatarEl.style.backgroundImage = 'none'; }

        socket.emit('joinMatchmakingPool', { guestId: profile.id, name: profile.name, avatar: profile.avatar });
        gameState.mmTimeLeft = 0;
        const timerEl = document.getElementById('mm-timer'); if (timerEl) timerEl.innerText = "00:00";
        if (gameState.mmInterval) clearInterval(gameState.mmInterval);
        gameState.mmInterval = setInterval(() => {
            gameState.mmTimeLeft++; let m = String(Math.floor(gameState.mmTimeLeft / 60)).padStart(2, '0'); let s = String(gameState.mmTimeLeft % 60).padStart(2, '0');
            if (timerEl) timerEl.innerText = `${m}:${s}`;
        }, 1000);
    });
}

const cancelMmBtn = document.getElementById('mm-cancel-btn');
if (cancelMmBtn) {
    cancelMmBtn.addEventListener('click', (e) => {
        e.preventDefault(); clearInterval(gameState.mmInterval); gameState.mmInterval = null;
        const mmModal = document.getElementById('matchmaking-modal');
        if (mmModal) { mmModal.style.display = 'none'; if (window.modalStack) { window.modalStack = window.modalStack.filter(id => id !== 'matchmaking-modal'); } }
        if (socket && socket.connected) { socket.emit('leaveMatchmakingPool'); }
    });
}

ui.onClick('room-portal-btn', () => { ui.setDisplay('online-modal', 'flex'); });
ui.onClick('online-close-btn', () => ui.setDisplay('online-modal', 'none'));
