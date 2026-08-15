// ملف: ui_menus.js
// مخصص لإدارة القوائم المنبثقة، ملفات اللاعبين، لوحة الشرف، المتجر، والأصدقاء
// 🌟 (مُحدّث): تم دمج إصلاحات الأداء (requestAnimationFrame) لمنع تشنج الشاشة وهبوط الـ FPS

import { gameState } from './gameState.js';
import { socket, socketManager } from './socketManager.js';
import { t } from './i18n.js';
import { ui } from './uiController.js'; 

// ==========================================
// 🌟 دوال الواجهة العامة والقوائم المنبثقة
// ==========================================
window.setAiLevel = function(level) {
    document.getElementById('diff-quick-select').value = level;
    document.getElementById('custom-diff-btn').innerText = 'L' + level;
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    let activeBtn = document.getElementById('lvl-btn-' + level);
    if(activeBtn) activeBtn.classList.add('active');
    if(typeof window.closeAppModal === 'function') window.closeAppModal('level-select-modal');
};

window.getUserIdLocally = function() {
    let guestId = localStorage.getItem('guestId');
    try { let profile = JSON.parse(localStorage.getItem('hub_user_profile')); return profile ? profile.id : guestId; } 
    catch(e) { return guestId; } 
};

window.selectSpectatorBetColor = function(color) {
    const colorInput = document.getElementById('spectator-bet-color');
    const p1Card = document.getElementById('bet-p1-card');
    const p2Card = document.getElementById('bet-p2-card');
    if (!colorInput || !p1Card || !p2Card) return;

    colorInput.value = color;
    p1Card.style.cssText = 'border-color:transparent; background:transparent; transform:scale(1); box-shadow:none;';
    p2Card.style.cssText = 'border-color:transparent; background:transparent; transform:scale(1); box-shadow:none;';

    if (color === 'white') {
        p1Card.style.cssText = 'border-color:#ffd700; background:rgba(255, 215, 0, 0.15); transform:scale(1.1); box-shadow:0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 215, 0, 0.2);';
    } else {
        p2Card.style.cssText = 'border-color:#ff453a; background:rgba(255, 69, 58, 0.15); transform:scale(1.1); box-shadow:0 0 20px rgba(255, 69, 58, 0.4), inset 0 0 10px rgba(255, 69, 58, 0.2);';
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
        if (currentBet == 50) betText = "50 🪙 (الجائزة الكبرى: 100)";
        else if (currentBet == 100) betText = "100 🪙 (الجائزة الكبرى: 200)";
        else if (currentBet == 200) betText = "200 🪙 (الجائزة الكبرى: 400)";
        else if (currentBet == 500) betText = "500 🪙 (الجائزة الكبرى: 1000)";
        else if (currentBet == 1000) betText = "1000 🪙 (الجائزة الكبرى: 2000)";
        betDisplay.innerText = betText;
    }
    window.openAppModal('creator-room-settings-modal');
};

window.deleteMyRoom = function(roomId) {
    if (typeof ui !== 'undefined' && typeof ui.showCustomAlert === 'function') {
        ui.showCustomAlert(
            "هل أنت متأكد من رغبتك في إغلاق وحذف هذه الغرفة نهائياً؟", "حذف الغرفة 🗑️",
            () => { if (typeof socket !== 'undefined' && socket && socket.connected) socket.emit('leaveRoom', { roomID: roomId }); },
            true, "إلغاء", "نعم، احذفها"
        );
    }
};

window.openAppModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) { 
        modal.style.display = 'flex'; 
        if (!gameState.modalStack.includes(id)) gameState.modalStack.push(id);
        if (id === 'online-modal' && window.socket && window.socket.connected) window.socket.emit('requestActiveRooms');
    }
};

window.closeAppModal = function(id) {
    if (id === 'lucky-spin-modal' && window.isSpinning) return; 
    const modal = document.getElementById(id);
    if (modal) { modal.style.display = 'none'; gameState.modalStack = gameState.modalStack.filter(m => m !== id); }
};

window.toggleSideMenu = function() {
    const overlay = document.getElementById('side-menu-overlay');
    if (overlay.classList.contains('open')) overlay.classList.remove('open');
    else overlay.classList.add('open');
};

window.switchQuestTab = function(tab) {
    document.getElementById('quest-tab-daily').classList.remove('active'); document.getElementById('quest-tab-weekly').classList.remove('active');
    document.getElementById('quests-list-container-daily').style.display = 'none'; document.getElementById('quests-list-container-weekly').style.display = 'none';
    document.getElementById('quest-tab-' + tab).classList.add('active'); document.getElementById('quests-list-container-' + tab).style.display = 'flex';
    if (window.questsManager) { window.questsManager.currentTab = tab; window.questsManager.updateTimerDisplay(); window.questsManager.renderQuests(tab); }
};

window.switchRoomTab = function(tab) {
    document.getElementById('room-tab-play').classList.remove('active'); document.getElementById('room-tab-bet').classList.remove('active');
    document.getElementById('active-rooms-list').style.display = 'none'; document.getElementById('spectate-rooms-list').style.display = 'none';
    document.getElementById('room-tab-' + tab).classList.add('active'); 
    if (tab === 'play') document.getElementById('active-rooms-list').style.display = 'block'; 
    else document.getElementById('spectate-rooms-list').style.display = 'block'; 
};

window.selectBetAmount = function(value, displayText, element) {
    if (window.isEditingBet) { document.getElementById('edit-room-bet-input').value = value; document.getElementById('edit-room-bet-display').innerText = displayText; } 
    else { document.getElementById('room-bet-input').value = value; document.getElementById('custom-bet-display').innerText = displayText; }
    document.querySelectorAll('.bet-option-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    setTimeout(() => window.closeAppModal('bet-selector-modal'), 150);
};

// ==========================================
// 🌟 دوال الأصدقاء والملف الشخصي
// ==========================================
window.cleanExpiredRequests = function(profile) {
    if (!profile.friendRequests) profile.friendRequests = [];
    const now = Date.now(); const threeDays = 3 * 24 * 60 * 60 * 1000;
    profile.friendRequests = profile.friendRequests.filter(req => (now - req.timestamp) < threeDays);
    return profile;
};

window.renderFriendsList = function(friendsArr) {
    const listContainer = document.getElementById('igp-friends-list'); if (!listContainer) return;
    if (!friendsArr || friendsArr.length === 0) { listContainer.innerHTML = '<p style="text-align:center;color:#a1a1aa;font-size:12px;">لا يوجد أصدقاء حالياً</p>'; return; }
    listContainer.innerHTML = '';
    
    let actualFriends = friendsArr;
    if (friendsArr.length > 0 && typeof friendsArr[0] === 'string') {
        let globalProfile = localStorage.getItem('hub_user_profile');
        if (globalProfile) {
            let prof = window.cleanExpiredRequests(JSON.parse(globalProfile));
            if(prof.friends && prof.friends.length > 0 && typeof prof.friends[0] === 'object') actualFriends = prof.friends;
        }
    }

    actualFriends.forEach(friend => {
        let div = document.createElement('div');
        div.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.05); padding:8px 10px; border-radius:14px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.08); box-shadow: 0 4px 10px rgba(0,0,0,0.2);";
        let friendId = typeof friend === 'string' ? friend : friend.id;
        let friendName = typeof friend === 'object' && friend.name ? friend.name : 'لاعب';
        let friendAvatar = typeof friend === 'object' && friend.avatar ? friend.avatar : '../Photo/1000132081.webp';
        
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                <img src="${friendAvatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0;" onerror="this.src='../Photo/1000132081.webp'">
                <div style="text-align:right; overflow:hidden;">
                    <div style="font-weight:bold; color:white; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${friendName}</div>
                    <div style="font-size:9px; color:#a1a1aa; font-family: monospace;">${friendId}</div>
                </div>
            </div>
            <div style="display:flex; gap:4px; flex-shrink: 0;">
                <button data-action="challenge-friend" data-fid="${friendId}" style="background:linear-gradient(135deg, #34c759, #28a745); border:none; color:#fff; border-radius:8px; padding:6px 8px; cursor:pointer; font-size:11px; font-weight:bold; box-shadow:0 2px 5px rgba(40,167,69,0.3); transition: transform 0.2s; white-space: nowrap;">تحدي ⚔️</button>
                <button data-action="remove-friend" data-fid="${friendId}" style="background:rgba(255,69,58,0.15); border:1px solid rgba(255,69,58,0.3); color:#ff453a; border-radius:8px; padding:6px 8px; cursor:pointer; font-size:11px; font-weight:bold; transition: transform 0.2s; white-space: nowrap;">حذف 🗑️</button>
            </div>
        `;
        listContainer.appendChild(div);
    });
};

window.renderFriendRequests = function() {
    let profStr = localStorage.getItem('hub_user_profile'); if (!profStr) return;
    let prof = window.cleanExpiredRequests(JSON.parse(profStr)); localStorage.setItem('hub_user_profile', JSON.stringify(prof));
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
};

window.acceptFriendReq = function(reqId) {
    let profStr = localStorage.getItem('hub_user_profile'); if(!profStr) return;
    let prof = JSON.parse(profStr); if(!prof.friends) prof.friends = [];
    let reqIndex = prof.friendRequests.findIndex(r => r.id === reqId);
    if(reqIndex !== -1) {
        let acceptedUser = prof.friendRequests[reqIndex];
        if(!prof.friends.find(f => (typeof f === 'string' ? f === reqId : f.id === reqId))) { prof.friends.push({ id: acceptedUser.id, name: acceptedUser.name, avatar: acceptedUser.avatar }); }
        prof.friendRequests.splice(reqIndex, 1); localStorage.setItem('hub_user_profile', JSON.stringify(prof));
        window.renderFriendRequests(); window.renderFriendsList(prof.friends);
        const toast = document.getElementById('toast-notification'); if (toast) { toast.innerText = '✅ تمت إضافة الصديق بنجاح!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
    }
};

window.rejectFriendReq = function(reqId) {
    let profStr = localStorage.getItem('hub_user_profile'); if(!profStr) return;
    let prof = JSON.parse(profStr); prof.friendRequests = prof.friendRequests.filter(r => r.id !== reqId);
    localStorage.setItem('hub_user_profile', JSON.stringify(prof)); window.renderFriendRequests();
};

window.sendFriendRequest = function() {
    if(!gameState.currentViewedPlayer) return;
    const toast = document.getElementById('toast-notification'); if (toast) { toast.innerText = '📨 تم إرسال طلب الصداقة بنجاح!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
    const btn = document.getElementById('send-friend-req-btn');
    if(btn) { btn.innerHTML = '✓ تم الإرسال'; btn.style.background = 'rgba(255,255,255,0.1) !important'; btn.style.color = '#a1a1aa !important'; btn.style.borderColor = 'rgba(255,255,255,0.2) !important'; btn.disabled = true; }
};

window.givePopularity = function() {
    if(!gameState.currentViewedPlayer) return;
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
        let prof = window.cleanExpiredRequests(JSON.parse(globalProfile)); localStorage.setItem('hub_user_profile', JSON.stringify(prof)); 
        if(window.applyProfileDataToUI) window.applyProfileDataToUI(prof);
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
        window.renderFriendsList(prof.friends); window.renderFriendRequests();
    }
    window.openAppModal('in-game-profile-modal');
};

window.showPlayerProfileFromLB = function(player) {
    gameState.currentViewedPlayer = player; 
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

window.fallbackCopyText = function(text, callback) {
    const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); if (callback) callback(); } catch (err) {}
    document.body.removeChild(textArea);
};

window.copyMyId = function() {
    const idText = document.getElementById('igp-id-display').innerText;
    if (idText && idText !== '...') {
        const showToast = () => { const toast = document.getElementById('toast-notification'); if (toast) { toast.innerText = '📋 تم نسخ الـ ID بنجاح'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); } };
        if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(idText).then(showToast).catch(() => { window.fallbackCopyText(idText, showToast); }); } else { window.fallbackCopyText(idText, showToast); }
    }
};

window.getSecureAvatarUrl = function(src) {
    if (!src || src === 'null' || src === 'undefined') return 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/1000132081.webp';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    let cleanName = src.replace(/\.\.\//g, '').replace('Photo/', '');
    return 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName;
};

window.createLbItemHTML = function(rank, playerObj, type) {
    let score = playerObj.score || playerObj.wins || 0; 
    let name = playerObj.name; let avatarStr = playerObj.avatar; let playerRankInfo = playerObj.rankInfo;
    let displayScore = '';
    if (type === 'xp') {
        let level = Math.floor(Math.sqrt(Math.max(0, score) / 50)) + 1; if (level > 200) level = 200;
        displayScore = `<span style="color:#87ceeb; font-weight:800; background: rgba(135,206,235,0.15); border: 1px solid rgba(135,206,235,0.3); padding: 2px 8px; border-radius: 6px;">Lv.${level}</span>`;
    } else { displayScore = `<span style="color:#f5a623; font-weight:800;">${formatCompactNumber(score)} 🏆</span>`; }

    const div = document.createElement('div'); div.className = 'lb-item';
    let rankIconHTML = playerRankInfo && playerRankInfo.icon ? `<span class="rank-icon-small" title="${playerRankInfo.title}">${playerRankInfo.icon}</span>` : '';
    const nameEl = document.createElement('div'); nameEl.className = 'lb-name'; nameEl.innerHTML = `<span>${name}</span>${rankIconHTML}`;
    
    let secureImgSrc = window.getSecureAvatarUrl(avatarStr);
    div.innerHTML = `
        <div class="lb-rank">#${rank}</div>
        <div class="lb-avatar" style="padding:0; border:2px solid rgba(255,255,255,0.1); display:flex; justify-content:center; align-items:center; overflow:hidden; cursor:pointer; transition:all 0.2s; flex-shrink: 0; min-width: 40px; min-height: 40px; width: 40px; height: 40px; border-radius: 50%;" title="عرض الملف الشخصي">
            <img src="${secureImgSrc}" onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=\\'font-size: 22px;\\'>👤</span>';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; aspect-ratio: 1/1;">
        </div>
        <div class="lb-info" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%;">
            <div class="lb-name-container"></div>
            <div class="lb-score" style="display:flex; align-items:center; justify-content:flex-end;">${displayScore}</div>
        </div>
    `;
    div.querySelector('.lb-name-container').replaceWith(nameEl);
    const avatarContainer = div.querySelector('.lb-avatar');
    
    avatarContainer.onclick = function() { if(window.showPlayerProfileFromLB) window.showPlayerProfileFromLB(playerObj); };
    avatarContainer.onmouseover = () => { avatarContainer.style.transform = 'scale(1.1)'; avatarContainer.style.borderColor = '#3498db'; };
    avatarContainer.onmouseout = () => { avatarContainer.style.transform = 'scale(1)'; avatarContainer.style.borderColor = 'rgba(255,255,255,0.1)'; };
    return div;
};

window.getFormattedLeaderboardScore = function(player, tabType) {
    let score = player.score || player.wins || 0;
    if (tabType === 'wins') return formatCompactNumber(score) + ' 🏆';
    if (tabType === 'xp') { let level = Math.floor(Math.sqrt(Math.max(0, score) / 50)) + 1; if (level > 200) level = 200; return `Lv.${level}`; }
    return formatCompactNumber(score);
};

window.renderDynamicLeaderboardUI = function(playersList, tabType) {
    const podiumContainer = document.getElementById('leaderboard-podium-container');
    const listContainer = document.getElementById('leaderboard-list-' + tabType); 
    if (!podiumContainer || !listContainer) return;
    podiumContainer.innerHTML = ''; listContainer.innerHTML = '';

    if (!playersList || playersList.length === 0) { listContainer.innerHTML = '<p style="text-align: center; color: #a1a1aa; padding: 20px; width: 100%;">لا توجد بيانات حالياً في هذا التصنيف.</p>'; return; }

    const podiumOrder = [ { rank: 2, data: playersList[1] }, { rank: 1, data: playersList[0] }, { rank: 3, data: playersList[2] } ];
    podiumOrder.forEach(item => {
        if (!item.data) return; 
        const player = item.data; const card = document.createElement('div'); card.className = `lb-podium-card rank-${item.rank}`;
        let frameOverlay = '';
        if (tabType === 'xp') {
            const proFrames = { 1: window.frameRank1, 2: window.frameRank2, 3: window.frameRank3 };
            let frameUrl = proFrames[item.rank];
            if (frameUrl) { frameOverlay = `<div style="position: absolute; top: -15%; left: -15%; width: 130%; height: 130%; background-image: url('${frameUrl}'); background-size: 100% 100%; background-position: center; background-repeat: no-repeat; z-index: 5; pointer-events: none;"></div>`; }
        }
        card.innerHTML = `
            <div class="lb-podium-badge badge-${item.rank}">${item.rank}</div>
            <div style="position: relative; width: ${item.rank === 1 ? '66px' : '56px'}; height: ${item.rank === 1 ? '66px' : '56px'}; margin-bottom: 8px;">
                <div class="lb-podium-avatar avatar-${item.rank}" style="width: 100%; height: 100%; margin: 0; position: relative; z-index: 1;"><img src="${window.getSecureAvatarUrl(player.avatar)}"></div>
                ${frameOverlay}
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; margin-top: auto; width: 100%;">
                <div class="lb-podium-score-pill score-${item.rank}" style="margin-bottom: 5px; font-weight: 800; font-size: 13px;">${window.getFormattedLeaderboardScore(player, tabType)}</div>
                <div class="lb-podium-name" style="width: 100%; text-align: center; margin-bottom: 0;">${player.name || 'Guest'}</div>
            </div>
        `;
        card.onclick = function() { if(window.showPlayerProfileFromLB) window.showPlayerProfileFromLB(player); }; card.style.cursor = 'pointer';
        podiumContainer.appendChild(card);
    });

    for (let i = 3; i < playersList.length; i++) { listContainer.appendChild(window.createLbItemHTML(i + 1, playersList[i], tabType)); }
};

window.populateLeaderboards = function(winsData, xpData) {
    document.getElementById('leaderboard-list-wins').innerHTML = ''; document.getElementById('leaderboard-list-xp').innerHTML = '';
    const activeTabBtn = document.querySelector('.lb-tab-button.active'); let activeTabId = 'wins';
    if(activeTabBtn && activeTabBtn.id === 'lb-tab-xp') activeTabId = 'xp';
    window.lastFetchedWinsData = winsData; window.lastFetchedXpData = xpData;
    if(activeTabId === 'wins') { window.renderDynamicLeaderboardUI(winsData, 'wins'); } else { window.renderDynamicLeaderboardUI(xpData, 'xp'); }
};

window.showLeaderboard = function() {
    window.openAppModal('leaderboard-modal'); 
    const loadingText = window.t ? window.t('lb_loading') : 'جاري التحميل...';
    document.getElementById('leaderboard-list-wins').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    document.getElementById('leaderboard-list-xp').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    if(window.socket && window.socket.connected) window.socket.emit('getLeaderboard');
};

window.switchLbTab = function(tabId) {
    document.getElementById('lb-tab-wins').classList.remove('active'); document.getElementById('lb-tab-xp').classList.remove('active');
    document.getElementById('leaderboard-list-wins').style.display = 'none'; document.getElementById('leaderboard-list-xp').style.display = 'none'; 
    document.getElementById('lb-tab-' + tabId).classList.add('active'); document.getElementById('leaderboard-list-' + tabId).style.display = 'flex';
    document.getElementById('leaderboard-podium-container').innerHTML = '';
    if (tabId === 'wins' && window.lastFetchedWinsData) { window.renderDynamicLeaderboardUI(window.lastFetchedWinsData, 'wins'); } 
    else if (tabId === 'xp' && window.lastFetchedXpData) { window.renderDynamicLeaderboardUI(window.lastFetchedXpData, 'xp'); }
};

window.showEquipNotification = function(itemType) {
    const toast = document.getElementById('toast-notification'); if (!toast) return;
    let msg = window.t ? window.t('toast_default') : "تم تجهيز العنصر بنجاح";
    if (itemType === 'bg') msg = window.t ? window.t('toast_bg') : "تم تغيير الساحة بنجاح";
    else if (itemType === 'fr') msg = window.t ? window.t('toast_fr') : "تم تغيير الإطار بنجاح";
    else if (itemType === 'pc') msg = window.t ? window.t('toast_pc') : "تم تغيير الحجر بنجاح";
    else if (itemType === 'score') msg = window.t ? window.t('toast_score') : "تم تغيير شكل الشريط بنجاح";
    toast.innerText = '✨ ' + msg; toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); }, 2500);
    setTimeout(() => { try { let profStr = localStorage.getItem('hub_user_profile'); if (profStr) { let prof = JSON.parse(profStr); if (typeof window.applyTheme === 'function') window.applyTheme(prof); if (window.ui && typeof window.ui.renderBoard === 'function') window.ui.renderBoard(true); } } catch(e) {} }, 50);
};

window.triggerCustomAlertNotification = function(msg) {
    if (typeof ui.showCustomAlert === 'function') { ui.showCustomAlert(msg); } else {
        const alertModal = document.getElementById('custom-alert-modal'); const alertMsg = document.getElementById('custom-alert-message'); const alertOk = document.getElementById('custom-alert-ok'); const alertCancel = document.getElementById('custom-alert-cancel');
        if (alertModal && alertMsg && alertOk) { document.getElementById('custom-alert-title').innerText = window.t ? window.t('alert_store') : 'إشعار المتجر'; alertMsg.innerText = msg; if(alertCancel) alertCancel.style.display = 'none'; window.openAppModal('custom-alert-modal'); alertOk.onclick = () => window.closeAppModal('custom-alert-modal'); } else { alert(msg); }
    }
};

window.forceLockedGlobalAvatar = function() {
    let globalProfile = localStorage.getItem('hub_user_profile');
    let avatarSrc = "../Photo/1000132081.webp"; let isImage = true;
    if (globalProfile) { try { const parsedHub = JSON.parse(globalProfile); if (parsedHub.avatar) { avatarSrc = parsedHub.avatar; isImage = avatarSrc.includes('.') || avatarSrc.startsWith('data:image') || avatarSrc.startsWith('http'); } } catch(e) {} }
    if (isImage && !avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:image')) { let cleanName = avatarSrc.replace(/\.\.\//g, '').replace('Photo/', ''); avatarSrc = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName; }
    
    const targetAvatars = ['badge-avatar', 'card-my-avatar', 'mm-my-avatar'];
    targetAvatars.forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        if (isImage) { const existingImg = el.querySelector('img'); if (!existingImg || existingImg.getAttribute('src') !== avatarSrc) { el.style.backgroundImage = 'none'; el.innerHTML = `<img src="${avatarSrc}" onerror="this.style.display='none'; this.parentNode.textContent='👤';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`; } } else { if (el.textContent !== avatarSrc) { el.innerHTML = ''; el.textContent = avatarSrc; } }
    });
};

const avatarGuardObserver = new MutationObserver((mutations) => { let shouldProtect = false; for (let mutation of mutations) { if (mutation.type === 'childList') { const hasImg = Array.from(mutation.target.children).some(el => el.tagName === 'IMG'); if (!hasImg && mutation.target.textContent !== "👤") { shouldProtect = true; break; } } } if (shouldProtect) { avatarGuardObserver.disconnect(); window.forceLockedGlobalAvatar(); window.startAvatarGuard(); } });
window.startAvatarGuard = function() { const targets = ['badge-avatar', 'card-my-avatar', 'mm-my-avatar']; targets.forEach(id => { const el = document.getElementById(id); if (el) { avatarGuardObserver.observe(el, { childList: true, attributes: false }); } }); };

 // 🌟 تم إزالة الاستدعاءات التي تسبب حلقة لا نهائية (Infinite Loop)
window.applyProfileDataToUI = function(profile) {
    requestAnimationFrame(() => {
        const currentTokens = profile.tokens !== undefined ? profile.tokens : 0;
        const currentId = profile.id || window.getUserIdLocally();
        
        const textElements = { 
            'badge-username-display-game': profile.name, 'card-my-name': profile.name, 'mm-my-name': profile.name, 
            'profile-stat-tokens-badge': currentTokens, 'profile-stat-tokens-store': currentTokens, 'igp-name': profile.name, 
            'igp-id-display': currentId, 'igp-games': profile.gamesPlayed !== undefined ? profile.gamesPlayed : (profile.games !== undefined ? profile.games : 0), 
            'igp-wins': profile.wins !== undefined ? profile.wins : 0, 'igp-losses': profile.losses !== undefined ? profile.losses : 0 
        };
        
        for (let id in textElements) { 
            const el = document.getElementById(id); 
            if (el && el.innerText !== textElements[id]) el.innerText = textElements[id]; 
        }
        
        if(window.forceLockedGlobalAvatar) window.forceLockedGlobalAvatar(); 
        if(window.updateInventoryUI) window.updateInventoryUI(); 
        
        // 🛑 تم مسح استدعاء applyTheme و refreshProfileUIStyles من هنا نهائياً لكسر التشنج!
    });
};


// 🌟 تحديث مهم: إزالة الحسابات الثقيلة وجدولتها لتسريع الواجهة
window.updateProfileUI = function() {
    if (!gameState.userProfile) return;
    
    requestAnimationFrame(() => {
        if (typeof window.applyProfileDataToUI === 'function') { window.applyProfileDataToUI(gameState.userProfile); }
        
        let prof = gameState.userProfile; 
        let lvlInfo = window.ui ? window.ui.calculateLevelInfo(prof.xp || 0) : {level: 1, percentage: 0, progressXp: 0, requiredXp: 50, rank: 'برونزي', rankIcon: '🥉', title: 'مبتدئ'};

        const badgeLevel = document.getElementById('badge-level'); 
        const xpProgressPath = document.getElementById('xp-progress-path'); 
        
        if (badgeLevel) badgeLevel.textContent = `Lv.${lvlInfo.level}`;
        
        if (xpProgressPath) {
            const totalLength = 150; // سرعة فائقة بفضل القيمة الثابتة
            const progress = Math.min(Math.max(lvlInfo.percentage / 100, 0), 1);
            const newOffset = totalLength - (totalLength * progress);
            xpProgressPath.style.strokeDasharray = totalLength; 
            xpProgressPath.style.strokeDashoffset = newOffset;
        }

        const igpLevel = document.getElementById('igp-level'); const igpRank = document.getElementById('igp-rank-title'); const igpXpFill = document.getElementById('igp-xp-fill'); const igpXpText = document.getElementById('igp-xp-text');
        if (igpLevel) igpLevel.textContent = `Lv.${lvlInfo.level}`;
        if (igpRank) igpRank.innerHTML = `الرتبة: ${lvlInfo.rankIcon} ${lvlInfo.rank} | ${lvlInfo.title}`;
        if (igpXpFill) igpXpFill.style.width = `${lvlInfo.percentage}%`;
        if (igpXpText) igpXpText.textContent = `${lvlInfo.progressXp} / ${lvlInfo.requiredXp} XP`;

        const hintCounter = document.getElementById('hint-counter');
        if (hintCounter) {
            if (gameState.isTutorialMode && !gameState.isOnlineMode) {
                hintCounter.textContent = "مجاني"; hintCounter.style.fontSize = "8px"; hintCounter.style.padding = "2px 4px";
            } else if (gameState.userProfile) {
                if (gameState.userProfile.hints === undefined) gameState.userProfile.hints = 5;
                hintCounter.textContent = gameState.userProfile.hints; hintCounter.style.fontSize = "11px"; hintCounter.style.padding = "2px 6px";
            }
        }
        
        const fList = document.getElementById('igp-friends-list'); 
        if (fList) {
            if (!gameState.userProfile.friends || gameState.userProfile.friends.length === 0) {
                fList.innerHTML = '<p style="text-align:center;color:#a1a1aa;font-size:12px;">لا يوجد أصدقاء حالياً</p>'; 
            } else {
                let uniqueArr = []; let seen = new Set();
                (gameState.userProfile.friends || []).forEach(f => {
                    let fId = typeof f === 'string' ? f.toUpperCase() : (f.id ? f.id.toUpperCase() : null);
                    if (fId && !seen.has(fId)) { seen.add(fId); uniqueArr.push(f); }
                });
                gameState.userProfile.friends = uniqueArr;
                if(window.renderFriendsList) window.renderFriendsList(gameState.userProfile.friends);
            }
        }
    });
};

window.currentLang = 'ar';
window.updateHtmlTexts = function() {
    if (!window.t) return;
    const setTxt = (id, key) => { const el = document.getElementById(id); if (el) el.innerText = window.t(key); };
    setTxt('menu-title-text', 'menu_title'); setTxt('menu-bag-text', 'menu_bag'); setTxt('menu-radio-text', 'menu_radio'); 
    setTxt('menu-room-text', 'menu_room'); setTxt('menu-leaderboard-text', 'menu_leaderboard'); setTxt('menu-settings-text', 'menu_settings'); setTxt('menu-exit-text', 'menu_exit'); 
    const lbTitle = document.getElementById('lb-title-text'); if(lbTitle) lbTitle.innerText = "لوحة الشرف";
    const lbWins = document.getElementById('lb-tab-wins'); if(lbWins) lbWins.innerText = "فوز";
    const lbXp = document.getElementById('lb-tab-xp'); if(lbXp) lbXp.innerText = "مستوى";
    setTxt('tutorial-mode-label', 'tutorial_mode'); setTxt('menu-quests-text', 'menu_quests');
    if (document.getElementById('matchmaking-modal').style.display === 'flex') setTxt('mm-status-label', 'searching');
};

window.toggleRadioMusic = function() {
    const dot = document.getElementById('dama-radio-status'); let isActive = false;
    if (dot) { isActive = dot.classList.toggle('active'); }
    if (isActive) { window.parent.postMessage({ type: 'PLAY_RADIO' }, '*'); } else { window.parent.postMessage({ type: 'STOP_RADIO' }, '*'); }
};

window.syncRadioStatusDot = function() { 
    const statusDot = document.getElementById('dama-radio-status'); 
    if (statusDot) { const isPlaying = localStorage.getItem('hub_music_enabled') === 'true'; if (isPlaying) statusDot.classList.add('active'); else statusDot.classList.remove('active'); } 
};

window.syncGlobalBackground = function() {
    const bg = localStorage.getItem('custom_app_bg'); 
    if (bg) {
        let bgUrl = bg; if (!bg.startsWith('http') && !bg.startsWith('data:') && !bg.startsWith('../')) { bgUrl = '../' + bg; }
        document.body.style.backgroundImage = `url('${bgUrl}')`; document.body.style.backgroundSize = 'cover'; document.body.style.backgroundPosition = 'center'; document.body.style.backgroundAttachment = 'fixed'; document.body.style.backgroundColor = 'transparent';
    } else { document.body.style.backgroundColor = '#2c3e50'; document.body.style.backgroundImage = 'none'; }
};

window.addEventListener('storage', (e) => {
    if (e.key === 'hub_music_enabled') { window.syncRadioStatusDot(); }
    if (e.key === 'custom_app_bg') { window.syncGlobalBackground(); }
    if (e.key === 'hub_user_profile') { if(window.forceLockedGlobalAvatar) window.forceLockedGlobalAvatar(); }
});
