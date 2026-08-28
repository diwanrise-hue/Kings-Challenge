/**
 * النسخة المتطورة والمحصنة أمنياً 🛡️ (The Ultimate Secure Version).
 * 🌟 (مُحدّث): حل مشكلة الـ Ping العشوائي باستخدام RTT الدقيق.
 * 🌟 (مُحدّث جذرياً): إصلاح خلل الطرد للوبي عند وجود كلمة "غرفة" في رسائل الخطأ.
 * 🌟 (مُحدّث): توحيد نظام الصوت ليتوافق مع إعدادات كتم الصوت الخاصة باللاعب.
 * 🌟 (مُحدّث جديد): فصل مستطيل الغرفة الخاصة وعزلها في واجهة قائمة الغرف.
 * 🌟 (مُحدّث جديد): ضبط z-index للـ Ping ليكون 800 في الشاشة الرئيسية فقط.
 * 🌟 (مُحدّث جديد): نظام الفرز الذكي (Sort) والبحث (Search) في الغرف.
 * 🌟 (مُحدّث جديد): إصلاح أيقونات (عامة/خاصة) وإزالة كيس الدولار من الرهان.
 * 🌟 (مُحدّث جديد): فصل زر المراهنة 💰 عن المشاهدة 👁️ وإظهار صورتي اللاعبين للغرف الممتلئة.
 * 🌟 (مُحدّث حصري): إصلاح قص صور الـ VIP، تأثير الضباب الجانبي، وتعديل لون زر "دخول".
 */

import { gameState } from './gameState.js'; 
import { startOnlineHintSystem, restoreOfflineHintSystem } from './main.js';
import { ui } from './uiController.js';
import { gameEngine } from './gameEngine.js';

export const socket = io('https://diwanrise-dama-game-diwan.hf.space/dama', { 
    transports: ['websocket', 'polling'], 
    upgrade: true,            
    reconnection: true,                   
    reconnectionAttempts: Infinity,       
    reconnectionDelay: 1000,              
    reconnectionDelayMax: 5000,           
    timeout: 20000,
    autoConnect: true
});

window.socket = socket; 

// ==========================================
// 🌟 1. المتغيرات والدوال العالمية لنظام البحث والفرز وإصلاح الرهان
// ==========================================

window.currentRoomSearchQuery = '';
window.currentRoomSortMode = 'vip'; // 'vip', 'bet', 'new'
window.lastRoomsList = [];

// 🌟 دالة لفتح نافذة إنشاء الغرفة برمجياً مع إظهار ميزة الـ VIP فقط لمن يستحقها 🌟
window.openCreateRoomModal = function() {
    const profile = window.gameState && window.gameState.userProfile ? window.gameState.userProfile : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
    const vipContainer = document.getElementById('vip-title-container');
    if (vipContainer) {
        if (profile && profile.vipLevel && parseInt(profile.vipLevel) >= 3) {
            vipContainer.style.display = 'block';
        } else {
            vipContainer.style.display = 'none';
            const titleInput = document.getElementById('room-title-input');
            if (titleInput) titleInput.value = '';
        }
    }
    if (typeof window.openAppModal === 'function') {
        window.openAppModal('create-room-modal');
    }
};

window.openDirectBetModal = function(roomId, p1DataStr, p2DataStr) {
    try {
        const p1 = JSON.parse(decodeURIComponent(p1DataStr));
        const p2 = JSON.parse(decodeURIComponent(p2DataStr));
        if (window.ui && typeof window.ui.showSpectatorBetModal === 'function') {
            window.ui.showSpectatorBetModal(roomId, p1, p2);
        }
    } catch(e) { console.error(e); }
};

window.selectSpectatorBetAmount = function(value, displayText, element) {
    document.getElementById('spectator-bet-amount').value = value; 
    document.getElementById('spectator-bet-display-text').innerText = displayText;
    
    document.querySelectorAll('#spectator-bet-selector-modal .bet-option-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    
    setTimeout(() => window.closeAppModal('spectator-bet-selector-modal'), 150);
};

window.selectSpectatorBetColor = function(color) {
    document.getElementById('spectator-bet-color').value = color;
    const p1Card = document.getElementById('bet-p1-card');
    const p2Card = document.getElementById('bet-p2-card');
    
    p1Card.style.border = '2px solid transparent';
    p1Card.style.background = 'transparent';
    p1Card.style.boxShadow = 'none';
    p1Card.style.transform = 'scale(1)';

    p2Card.style.border = '2px solid transparent';
    p2Card.style.background = 'transparent';
    p2Card.style.boxShadow = 'none';
    p2Card.style.transform = 'scale(1)';

    const activeStyle = `
        border: 2px solid #ffd700; 
        background: rgba(255, 215, 0, 0.08); 
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 215, 0, 0.1); 
        transform: scale(1.05);
    `;

    if (color === 'white') {
        p1Card.style.cssText += activeStyle;
    } else {
        p2Card.style.cssText += activeStyle;
    }
};

window.selectBetAmount = function(value, displayText, element) {
    const editModal = document.getElementById('creator-room-settings-modal');
    const isEditVisible = editModal && (editModal.style.display === 'block' || editModal.style.display === 'flex');
    
    if (isEditVisible || window.isEditingBet) {
        document.getElementById('edit-room-bet-input').value = value; 
        document.getElementById('edit-room-bet-display').innerText = displayText;
    } else {
        document.getElementById('room-bet-input').value = value; 
        document.getElementById('custom-bet-display').innerText = displayText;
    }
    document.querySelectorAll('.bet-option-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    setTimeout(() => window.closeAppModal('bet-selector-modal'), 150);
};

window.applyRoomSort = function(mode, element) {
    window.currentRoomSortMode = mode;
    const items = document.querySelectorAll('#room-sort-modal .bet-option-item');
    items.forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');
    
    if (typeof window.closeAppModal === 'function') {
        window.closeAppModal('room-sort-modal');
    }
    if (window.renderRoomsList) window.renderRoomsList();
};

window.renderRoomsList = function() {
    const rooms = window.lastRoomsList || [];
    const playListContainer = document.getElementById('active-rooms-list');
    const spectateListContainer = document.getElementById('spectate-rooms-list');
    const searchInput = document.getElementById('room-search-input');
    
    window.currentRoomSearchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (!playListContainer) return;
    
    const currentUserId = gameState.userProfile ? gameState.userProfile.id : null;
    window.myCurrentRoomId = null;

    playListContainer.innerHTML = '';
    if (spectateListContainer) spectateListContainer.innerHTML = '';

    let playCount = 0;
    let spectateCount = 0;

    const miniFramesDB = {
        'pf_ruby': 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/storeAll/profile/Profil2.webp',
        'pf_dragon': 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/storeAll/profile/Profile4.webp',
        'pf_noble': 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/storeAll/profile/Profile7.webp'
    };

    const myRoom = rooms.find(r => r.hostId === currentUserId);
    const myRoomCard = document.getElementById('my-waiting-room-card');
    
    if (myRoom) {
        window.myCurrentRoomId = myRoom.id;
        
        let avatarSrc = myRoom.hostAvatar || "1000132081.webp";
        if (!avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:')) {
            avatarSrc = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + avatarSrc.replace(/\.\.\//g, '').replace('Photo/', '');
        }
        
        document.getElementById('my-waiting-avatar').src = avatarSrc;
        
        const frameEl = document.getElementById('my-waiting-frame');
        let hostFrame = myRoom.equippedProfileFrame || myRoom.equippedFr; 
        if (hostFrame && miniFramesDB[hostFrame]) {
            frameEl.innerHTML = `<img src="${miniFramesDB[hostFrame]}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.6));">`;
        } else {
            frameEl.innerHTML = '';
        }

        const vipEl = document.getElementById('my-waiting-vip');
        if (myRoom.hostVipLevel && parseInt(myRoom.hostVipLevel) > 0) {
            vipEl.innerHTML = `<img src="Media/VIP/vip${myRoom.hostVipLevel}.webp" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));">`;
        } else {
            vipEl.innerHTML = '';
        }

        let displayName = myRoom.customTitle ? ("👑 " + myRoom.customTitle) : myRoom.hostName;
        document.getElementById('my-waiting-title').innerText = myRoom.customTitle ? displayName : 'بانتظار الخصم...';
        
        const isPrivate = myRoom.hasPassword ? '🔒 خاصة' : '<span style="filter: grayscale(100%);">🌐</span> عامة';
        const betText = myRoom.betAmount > 0 ? `${myRoom.betAmount} 🪙` : `🆓 مجاني`;
        document.getElementById('my-waiting-details').innerHTML = `${isPrivate} | ${betText}`;

        document.getElementById('my-waiting-settings-btn').onclick = () => window.openCreatorSettings(myRoom.id, myRoom.betAmount);
        document.getElementById('my-waiting-delete-btn').onclick = () => window.deleteMyRoom(myRoom.id);

        if (myRoomCard) myRoomCard.style.display = 'flex';
        
    } else {
        if (myRoomCard) myRoomCard.style.display = 'none';
    }

    const createBtn = document.querySelector('#online-modal .save-settings-btn');
    if (createBtn) {
        if (myRoom) {
            createBtn.innerHTML = 'تم الإنشاء.. بانتظار الخصم ⏳';
            createBtn.style.opacity = '0.5';
            createBtn.style.pointerEvents = 'none';
        } else {
            createBtn.innerHTML = '+ إنشاء غرفة جديدة';
            createBtn.style.opacity = '1';
            createBtn.style.pointerEvents = 'auto';
        }
    }

    let roomsToRender = rooms.filter(r => r.hostId !== currentUserId);

    if (window.currentRoomSearchQuery) {
        roomsToRender = roomsToRender.filter(r => {
            const hostName = (r.hostName || '').toLowerCase();
            const customTitle = (r.customTitle || '').toLowerCase();
            return hostName.includes(window.currentRoomSearchQuery) || customTitle.includes(window.currentRoomSearchQuery);
        });
    }

    roomsToRender.sort((a, b) => {
        if (window.currentRoomSortMode === 'bet') {
            return (b.betAmount || 0) - (a.betAmount || 0); 
        } else if (window.currentRoomSortMode === 'new') {
            return (b.id || "").localeCompare(a.id || ""); 
        } else {
            return (b.hostVipLevel || 0) - (a.hostVipLevel || 0); 
        }
    });

    const highestBetValue = roomsToRender.reduce((max, r) => Math.max(max, r.betAmount || 0), 0);

    roomsToRender.forEach(r => {
        const isPrivate = r.hasPassword ? '🔒 خاصة' : '<span style="filter: grayscale(100%);">🌐</span> عامة';
        const betText = r.betAmount > 0 ? `${r.betAmount} 🪙` : `🆓 مجاني`;
        const roomEl = document.createElement('div');
        
        let displayName = r.customTitle ? ("👑 " + r.customTitle) : r.hostName;

        let glowStyle = '';
        let baseBorder = '1px solid rgba(30, 58, 138, 0.8)';
        
        if (r.betAmount > 0 && r.betAmount === highestBetValue) {
            glowStyle = `box-shadow: inset 120px 0 60px -50px rgba(155, 89, 182, 0.6); border: ${baseBorder};`;
        } else if (r.hostVipLevel && parseInt(r.hostVipLevel) > 0) {
            glowStyle = `box-shadow: inset 120px 0 60px -50px rgba(255, 215, 0, 0.4); border: ${baseBorder};`;
        } else if (r.betAmount === 0 || !r.betAmount) {
            glowStyle = `box-shadow: inset 120px 0 60px -50px rgba(255, 255, 255, 0.2); border: ${baseBorder};`;
        } else {
            glowStyle = `border: ${baseBorder};`;
        }

        roomEl.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(15,18,25,0.85); border-radius: 12px; margin-bottom: 8px; transition: transform 0.2s ease; ${glowStyle}`;
        
        roomEl.onmouseenter = () => roomEl.style.transform = 'scale(1.02)';
        roomEl.onmouseleave = () => roomEl.style.transform = 'scale(1)';

        let actionBtnHTML = '';

        if (r.isFull) {
            const getAvatarUI = (avatar, frame, vip) => {
                let src = avatar || "1000132081.webp";
                if (!src.startsWith('http') && !src.startsWith('data:')) {
                    src = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + src.replace(/\.\.\//g, '').replace('Photo/', '');
                }
                let frameHTML = frame && miniFramesDB[frame] ? `<img src="${miniFramesDB[frame]}" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 140%; height: 140%; z-index: 3; pointer-events: none; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.6));">` : '';
                let vipHTML = vip && parseInt(vip) > 0 ? `<img src="Media/VIP/vip${vip}.webp" onerror="this.style.display='none';" style="position: absolute; top: -10px; right: -10px; width: 24px; height: 32px; object-fit: contain; z-index: 50; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));">` : '';
                return { src, frameHTML, vipHTML };
            };

            let p1UI = getAvatarUI(r.hostAvatar, r.equippedProfileFrame, r.hostVipLevel);
            let p2UI = getAvatarUI(r.p2Avatar, r.p2Frame, r.p2Vip);

            const avatarsHTML = `
                <div style="display: flex; align-items: center; margin-left: 5px;">
                    <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 2; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); background: #1a1a24; overflow: visible;">
                        <img src="${p1UI.src}" onerror="this.style.display='none';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; position: relative; z-index: 1;">
                        ${p1UI.frameHTML}
                        ${p1UI.vipHTML}
                    </div>
                    <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 1; margin-right: -15px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); background: #1a1a24; box-shadow: -3px 0 5px rgba(0,0,0,0.5); overflow: visible;">
                        <img src="${p2UI.src}" onerror="this.style.display='none';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; position: relative; z-index: 1;">
                        ${p2UI.frameHTML}
                        ${p2UI.vipHTML}
                    </div>
                </div>
            `;

            if (r.isBettingOpen) {
                const p1Obj = encodeURIComponent(JSON.stringify({name: r.hostName, avatar: r.hostAvatar, equippedProfileFrame: r.equippedProfileFrame}));
                const p2Obj = encodeURIComponent(JSON.stringify({name: r.p2Name || 'الخصم', avatar: r.p2Avatar || '1000132081.webp', equippedProfileFrame: r.p2Frame}));

                // 🌟 تعديل الأزرار لتثبيت الأيقونات ومحاذاتها بدقة 🌟
                actionBtnHTML = `
                    <div style="display: flex; flex-direction: column; gap: 5px; flex-shrink: 0; z-index: 10; width: 110px;">
                        <button onclick="window.openDirectBetModal('${r.id}', '${p1Obj}', '${p2Obj}')" style="background: rgba(241,196,15,0.15); border: 1px solid rgba(241,196,15,0.4); border-radius: 8px; padding: 6px 8px; color: #f1c40f; cursor: pointer; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: flex-start; transition: 0.2s;" onmouseover="this.style.background='rgba(241,196,15,0.25)'" onmouseout="this.style.background='rgba(241,196,15,0.15)'">
                            <span style="width: 22px; text-align: center; margin-left: 4px; font-size: 13px;">💰</span>
                            <span style="flex: 1; text-align: center;">مراهنة</span>
                        </button>
                        <button onclick="window.socketManager.joinSpectator('${r.id}')" style="background: rgba(155,89,182,0.15); border: 1px solid rgba(155,89,182,0.4); border-radius: 8px; padding: 6px 8px; color: #9b59b6; cursor: pointer; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: flex-start; transition: 0.2s;" onmouseover="this.style.background='rgba(155,89,182,0.25)'" onmouseout="this.style.background='rgba(155,89,182,0.15)'">
                            <span style="width: 22px; text-align: center; margin-left: 4px; font-size: 13px;">👁️</span>
                            <span style="flex: 1; text-align: center;">مشاهدة (${r.spectatorsCount || 0})</span>
                        </button>
                    </div>
                `;
            } else {
                actionBtnHTML = `
                    <div style="display: flex; flex-direction: column; gap: 5px; flex-shrink: 0; z-index: 10; width: 110px;">
                        <button onclick="window.socketManager.joinSpectator('${r.id}')" style="background: rgba(155,89,182,0.15); border: 1px solid rgba(155,89,182,0.4); border-radius: 8px; padding: 6px 8px; color: #9b59b6; cursor: pointer; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: flex-start; transition: 0.2s;" onmouseover="this.style.background='rgba(155,89,182,0.25)'" onmouseout="this.style.background='rgba(155,89,182,0.15)'">
                            <span style="width: 22px; text-align: center; margin-left: 4px; font-size: 13px;">👁️</span>
                            <span style="flex: 1; text-align: center;">مشاهدة (${r.spectatorsCount || 0})</span>
                        </button>
                    </div>
                `;
            }
            
            roomEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; overflow: visible;">
                    ${avatarsHTML}
                    <div style="display: flex; flex-direction: column; overflow: hidden; margin-right: 10px; z-index: 5;">
                        <div style="color: ${r.customTitle ? '#FFD700' : 'white'}; font-weight: bold; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</div>
                        <div style="color: #a1a1aa; font-size: 11px; margin-top: 3px;">${isPrivate} | ${betText}</div>
                    </div>
                </div>
                ${actionBtnHTML}
            `;
            
            if (spectateListContainer) {
                spectateListContainer.appendChild(roomEl);
                spectateCount++;
            }
        } else {
            let avatarSrc = r.hostAvatar || "1000132081.webp";
            if (!avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:')) {
                avatarSrc = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + avatarSrc.replace(/\.\.\//g, '').replace('Photo/', '');
            }
            
            let frameHTML = '';
            let hostFrame = r.equippedProfileFrame || r.equippedFr; 
            if (hostFrame && miniFramesDB[hostFrame]) {
                frameHTML = `<img src="${miniFramesDB[hostFrame]}" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 140%; height: 140%; z-index: 3; pointer-events: none; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.6));">`;
            }

            let vipHTML = '';
            if (r.hostVipLevel && parseInt(r.hostVipLevel) > 0) {
                vipHTML = `<img src="Media/VIP/vip${r.hostVipLevel}.webp" onerror="this.style.display='none';" style="position: absolute; top: -10px; right: -10px; width: 24px; height: 32px; object-fit: contain; z-index: 50; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));">`;
            }

            // 🌟 زر "دخول" بخلفية وإطار أزرق غامق 🌟
            if (r.hasPassword) {
                actionBtnHTML = `<button onclick="window.showCustomPasswordPrompt('${r.id}')" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(30, 58, 138, 0.8); border-radius: 12px; padding: 6px 16px; color: #30d158; cursor: pointer; font-size: 13px; font-weight: bold; font-family: inherit; flex-shrink: 0; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">دخول 🔒</button>`;
            } else {
                actionBtnHTML = `<button onclick="window.socketManager.handleRoomAction('joinRoom', '${r.id}', null, ${r.betAmount})" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(30, 58, 138, 0.8); border-radius: 12px; padding: 6px 16px; color: #30d158; cursor: pointer; font-size: 13px; font-weight: bold; font-family: inherit; flex-shrink: 0; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">دخول</button>`;
            }

            roomEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; flex: 1; overflow: visible;">
                    <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: visible;">
                        <img src="${avatarSrc}" onerror="this.style.display='none';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; position: relative; z-index: 1;">
                        ${frameHTML}
                        ${vipHTML}
                    </div>
                    <div style="display: flex; flex-direction: column; overflow: hidden; margin-right: 5px; z-index: 5;">
                        <div style="color: ${r.customTitle ? '#FFD700' : 'white'}; font-weight: bold; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</div>
                        <div style="color: #a1a1aa; font-size: 11px; margin-top: 3px;">${isPrivate} | ${betText}</div>
                    </div>
                </div>
                ${actionBtnHTML}
            `;
            
            playListContainer.appendChild(roomEl);
            playCount++;
        }
    });

    if (playCount === 0) {
        playListContainer.innerHTML = '<p style="color: #a1a1aa; font-size: 13px; text-align: center; margin-top: 20px;">لا توجد غرف متاحة تطابق بحثك.</p>';
    }
    if (spectateCount === 0 && spectateListContainer) {
        spectateListContainer.innerHTML = '<p style="color: #a1a1aa; font-size: 13px; text-align: center; margin-top: 20px;">لا توجد مباريات جارية للمراهنة عليها حالياً.</p>';
    }
};

const applyMatchThemeRobust = (profile, retries = 5) => {
    if (!profile) return;
    
    if (!window.STORE_ITEMS && retries > 0) {
        setTimeout(() => applyMatchThemeRobust(profile, retries - 1), 250);
        return;
    }

    const bgId = profile.equippedBg || 'bg_wood';
    const pcId = profile.equippedPc || 'pc_original';
    const frId = profile.equippedFr || 'fr_classic'; 

    document.body.setAttribute('data-piece-style', pcId);
    document.body.setAttribute('data-board-style', bgId);
    document.body.setAttribute('data-frame-style', frId);

    if (window.STORE_ITEMS) {
        const bgItem = window.STORE_ITEMS[bgId];
        if (bgItem && bgItem.light && bgItem.dark) {
            document.documentElement.style.setProperty('--light-cell', bgItem.light);
            document.documentElement.style.setProperty('--dark-cell', bgItem.dark);
        } else if (bgId === 'bg_wood') {
            document.documentElement.style.setProperty('--light-cell', '#e0c094');
            document.documentElement.style.setProperty('--dark-cell', '#8b5a2b');
        }
    } 

    if (typeof window.applyTheme === 'function') {
        window.applyTheme(profile);
    }
};

export const socketManager = {
    isAlertShown: false,
    lastConnectionErrorTime: 0,
    toastTimeout: null,
    disconnectTimer: null, 
    pingIntervalId: null, 
    lastPingValue: null, 
    hidePingTimer: null, 

    _showToast(msg) {
        let toast = document.getElementById('toast-notification');
        if (toast) {
            toast.innerText = msg;
            toast.classList.add('show');
            
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    },

    _initRealPingIndicator() {
        let pingEl = document.getElementById('real-ping-indicator');
        if (!pingEl) {
            pingEl = document.createElement('div');
            pingEl.id = 'real-ping-indicator';
            
            pingEl.style.cssText = `
                position: absolute; 
                bottom: -1px; 
                left: calc(50% + 118px); 
                background: transparent; color: #66bb6a; 
                font-family: monospace; font-size: 11px; font-weight: 700; 
                padding: 0; border: none; margin: 0;
                z-index: 800; 
                display: flex; align-items: center; justify-content: flex-start; gap: 4px;
                flex-direction: row; flex-wrap: nowrap; white-space: nowrap; 
                pointer-events: none; opacity: 0.95; transition: opacity 0.5s ease;
                text-shadow: 1px 1px 1px rgba(0,0,0,0.8), -1px -1px 1px rgba(0,0,0,0.8), 1px -1px 1px rgba(0,0,0,0.8), -1px 1px 1px rgba(0,0,0,0.8); 
            `;
            pingEl.innerHTML = `<div id="ping-dot" style="width:5px;height:5px;border-radius:50%;background:#66bb6a;box-shadow:0 0 3px #66bb6a, 0 0 0 1px rgba(0,0,0,0.5); flex-shrink:0;"></div><span id="ping-text" style="white-space: nowrap;">... ms</span>`;
            
            const turnBoxWrapper = document.getElementById('turn-box-container')?.parentElement;
            if (turnBoxWrapper) {
                turnBoxWrapper.style.position = 'relative'; 
                turnBoxWrapper.appendChild(pingEl);
            } else {
                document.body.appendChild(pingEl); 
            }
        }

        if (this.pingIntervalId) clearInterval(this.pingIntervalId);

        this.pingIntervalId = setInterval(() => {
            if (navigator.onLine) {
                if (socket && socket.connected) {
                    socket.volatile.emit('clientPing', Date.now()); 
                } else {
                    this._updatePingUI(999);
                    this._showDisconnectUI();
                    socket.connect(); 
                }
            } else {
                this._updatePingUI(999);
                this._showDisconnectUI();
            }
        }, 3000); 

        socket.off('serverPong'); 
        socket.on('serverPong', (clientTime) => {
            this._hideDisconnectUI();
            let rtt = Date.now() - clientTime; 
            let latency = Math.max(1, Math.floor(rtt / 2)); 
            if (latency > 999) latency = 999;
            this._updatePingUI(latency);
        });
    },

    _updatePingUI(latency) {
        if (this.lastPingValue !== null && Math.abs(this.lastPingValue - latency) < 15 && latency !== 999) return;
        this.lastPingValue = latency;

        const pingEl = document.getElementById('real-ping-indicator');
        const pingText = document.getElementById('ping-text');
        const pingDot = document.getElementById('ping-dot');
        if (!pingEl || !pingText || !pingDot) return;

        pingText.innerText = latency + ' ms';
        
        let color = '#66bb6a'; 
        if (latency > 150) color = '#ffb74d'; 
        if (latency >= 999) color = '#ef5350'; 

        pingEl.style.color = color;
        pingDot.style.background = color;
        pingDot.style.boxShadow = `0 0 3px ${color}, 0 0 0 1px rgba(0,0,0,0.5)`; 
    },

    _showDisconnectUI() {
        let miniRadar = document.getElementById('mini-disconnect-radar');
        if (miniRadar) miniRadar.style.setProperty('display', 'flex', 'important');

        if (this.hidePingTimer) clearTimeout(this.hidePingTimer);
        this.hidePingTimer = setTimeout(() => {
            const pingEl = document.getElementById('real-ping-indicator');
            if (pingEl) pingEl.style.opacity = '0';
        }, 30000);
    },

    _hideDisconnectUI() {
        const miniRadar = document.getElementById('mini-disconnect-radar');
        if (miniRadar) miniRadar.style.setProperty('display', 'none', 'important');

        if (this.hidePingTimer) clearTimeout(this.hidePingTimer);
        const pingEl = document.getElementById('real-ping-indicator');
        if (pingEl) pingEl.style.opacity = '0.95';
    },

    _ensureUserProfile() {
        const isValidId = (id) => {
            if (!id || typeof id !== 'string') return false;
            return id.startsWith('GUEST-') || id.startsWith('USER-') || id.startsWith('FB-') || id.startsWith('DAMA-');
        };

        const generateAuthToken = () => 'tk_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

        if (gameState.userProfile && gameState.userProfile.id) {
            if (!isValidId(gameState.userProfile.id)) {
                gameState.userProfile = null; 
            } else {
                try {
                    const stored = localStorage.getItem('hub_user_profile');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed.id === gameState.userProfile.id) {
                            gameState.userProfile.xp = Number(parsed.xp) || gameState.userProfile.xp;
                            gameState.userProfile.syncThemeOptOut = parsed.syncThemeOptOut === true;
                            gameState.userProfile.equippedBg = parsed.equippedBg || gameState.userProfile.equippedBg;
                            gameState.userProfile.equippedPc = parsed.equippedPc || gameState.userProfile.equippedPc;
                            gameState.userProfile.equippedFr = parsed.equippedFr || gameState.userProfile.equippedFr;
                            
                            if (!gameState.userProfile.authToken && parsed.authToken) {
                                gameState.userProfile.authToken = parsed.authToken;
                            } else if (!gameState.userProfile.authToken) {
                                gameState.userProfile.authToken = generateAuthToken();
                                localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile));
                            }
                        }
                    }
                } catch(e) { console.error("Error parsing profile:", e); }
                return gameState.userProfile;
            }
        }

        try {
            const stored = localStorage.getItem('hub_user_profile');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    if (isValidId(parsed.id)) {
                        gameState.userProfile = {
                            ...parsed, 
                            id: String(parsed.id).trim().toUpperCase(),
                            name: String(parsed.name || 'Guest').trim(),
                            avatar: String(parsed.avatar || '1000132081.webp').trim(),
                            authToken: parsed.authToken || generateAuthToken(), 
                            isCustomAvatar: !!parsed.isCustomAvatar,
                            tokens: Number(parsed.tokens) || 0,
                            xp: Number(parsed.xp) || 0, 
                            gamesPlayed: Number(parsed.gamesPlayed) || 0,
                            wins: Number(parsed.wins) || 0,
                            losses: Number(parsed.losses) || 0,
                            hints: parsed.hints !== undefined ? Number(parsed.hints) : 5,
                            equippedBg: parsed.equippedBg || 'bg_wood',
                            equippedFr: parsed.equippedFr || 'fr_classic',
                            equippedPc: parsed.equippedPc || 'pc_original',
                            syncThemeOptOut: parsed.syncThemeOptOut === true, 
                            purchasedItems: Array.isArray(parsed.purchasedItems) ? parsed.purchasedItems : [],
                            friends: Array.isArray(parsed.friends) ? parsed.friends : [],
                            inventory: parsed.inventory || {}
                        };
                        localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile));
                        return gameState.userProfile;
                    } else {
                        localStorage.removeItem('hub_user_profile');
                    }
                }
            }
        } catch (e) {
            localStorage.removeItem('hub_user_profile');
        }
        
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        gameState.userProfile = { 
            id: 'GUEST-' + randomNum, 
            name: 'Guest_' + randomNum, 
            avatar: '1000132081.webp',
            authToken: generateAuthToken(), 
            isCustomAvatar: false,
            tokens: 0,
            xp: 0,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            hints: 5,
            equippedBg: 'bg_wood',
            equippedFr: 'fr_classic',
            equippedPc: 'pc_original',
            syncThemeOptOut: false,
            purchasedItems: [],
            friends: [],
            inventory: {}
        };
        try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch (e) {}
        return gameState.userProfile;
    },

    _safeEmit(event, data) {
        if (!socket.connected) {
            socket.connect();
        }
        socket.emit(event, data);
    },

    _forceReconnect() {
        if (socket.connected) return;
        
        this._showDisconnectUI();
        
        socket.disconnect(); 
        setTimeout(() => {
            socket.io.opts.transports = ['websocket', 'polling']; 
            socket.connect();
        }, 500);
    },

    init() {
        window.socketManager = this;
        this._initRealPingIndicator();

        window.addEventListener('online', () => {
            this._hideDisconnectUI();
            setTimeout(() => this._forceReconnect(), 1000); 
        });

        window.addEventListener('offline', () => {
            this._updatePingUI(999);
            this._showDisconnectUI();
        });

        if (!navigator.onLine) {
            this._updatePingUI(999);
            this._showDisconnectUI();
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (navigator.onLine && !socket.connected) {
                    this._forceReconnect();
                } else if (navigator.onLine && socket.connected) {
                    socket.volatile.emit('clientPing', Date.now()); 
                }
            }
        });

        const eventsToTurnOff = [
            'connect', 'disconnect', 'roomCreated', 'roomJoined', 'waitingForOpponent',
            'gameStart', 'opponentMove', 'opponentResigned', 'turnTimeout',
            'opponentDisconnected', 'opponentReconnected', 'playerDisconnected',
            'rematchOffer', 'rematchAccepted', 'error', 'receiveChallenge',
            'challengeResponse', 'friendAddedNotification',
            'friendAddSuccess', 'friendAddFailed', 'opponentLeftRoom', 'roomClosedByTimeout',
            'connect_error', 'syncTime', 'receiveChat', 'levelUpAlert', 'syncGameState',
            'activeRoomsList', 'mic-request', 'mic-response', 'spectatorJoined', 'spectatorCountChanged',
            'spectatorBetsUpdated', 'bettingClosed', 'betResult', 'creatorCutReceived', 'leaderboardData', 'gameOverByServer',
            'matchCountdown', 'countdownAborted', 'serverNotification',
            'receiveSpectatorsList', 'kickedFromRoom'
        ];
        eventsToTurnOff.forEach(event => socket.off(event));

        socket.on('serverNotification', (data) => {
            if (data && data.msg) this._showToast(data.msg);
        });

        socket.on('matchCountdown', (data) => {
            const overlay = document.getElementById('match-countdown-overlay');
            const numEl = document.getElementById('match-countdown-number');
            
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('online-modal');
            }

            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'SHOW_GAME_UI' }, '*');
            }

            if (overlay && numEl) {
                overlay.style.display = 'flex';
                let timeLeft = data.seconds;
                numEl.innerText = timeLeft;
                
                if (gameState.isSpectator && data.isBettingOpen && !data.hasAlreadyBet && typeof window.ui.showSpectatorBetModal === 'function') {
                    window.ui.showSpectatorBetModal(data.roomID, data.opponent1, data.opponent2);
                }
                
                if (gameState.countdownInterval) clearInterval(gameState.countdownInterval);
                gameState.countdownInterval = setInterval(() => {
                    timeLeft--;
                    if (timeLeft <= 0) {
                        clearInterval(gameState.countdownInterval);
                        overlay.style.display = 'none';
                    } else {
                        numEl.innerText = timeLeft;
                        if(timeLeft <= 3 && typeof ui.playSound === 'function' && ui.sfx.clock) ui.playSound(ui.sfx.clock);
                    }
                }, 1000);
            }
        });

        socket.on('countdownAborted', () => {
            if (gameState.countdownInterval) clearInterval(gameState.countdownInterval);
            const overlay = document.getElementById('match-countdown-overlay');
            if (overlay) overlay.style.display = 'none';
            this._showToast("تم إلغاء المباراة لأن الخصم هرب!");
        });

        socket.on('leaderboardData', (data) => {
            let formattedWins = [], formattedXp = [];
            if(Array.isArray(data)) {
                for(let i=0; i<data.length; i+=2) { 
                    formattedWins.push({ name: data[i], score: data[i+1] }); 
                    formattedXp.push({ name: data[i], score: data[i+1] * 25 });
                }
            } else if (data) { 
                formattedWins = data.wins || []; 
                formattedXp = data.xp || []; 
            }
            if (window.populateLeaderboards) {
                window.populateLeaderboards(formattedWins, formattedXp);
            }
        });

        socket.on('receiveChat', (data) => {
            if (window.playInGameChat && data) {
                window.playInGameChat('opp', data.type, data.value);
            }
        });

        socket.on('activeRoomsList', (rooms) => {
            window.lastRoomsList = rooms || [];
            if(window.renderRoomsList) window.renderRoomsList();
        });

        socket.on('connect', () => {
            this._hideDisconnectUI();
            this._updatePingUI(45); 
            socket.volatile.emit('clientPing', Date.now()); 

            const profile = this._ensureUserProfile();
            
            if (gameState.isSpectator && gameState.onlineRoomID) {
                socket.emit('joinSpectator', { roomID: String(gameState.onlineRoomID).trim(), guestId: profile.id, authToken: profile.authToken });
            } else {
                socket.emit('deviceFingerprint', { guestId: profile.id, authToken: profile.authToken });
            }
            
            socket.emit('requestActiveRooms');
            
            if (typeof ui.setDisplay === 'function') {
                ui.setDisplay('custom-alert-modal', 'none');
            }
        });

        socket.on('disconnect', (reason) => {
            this._updatePingUI(999);
            this._showDisconnectUI();
        });

        socket.on('connect_error', (err) => {
            const mmModal = document.getElementById('matchmaking-modal');
            if (mmModal && (mmModal.style.display === 'block' || mmModal.style.display === 'flex')) {
                if (typeof window.closeAppModal === 'function') window.closeAppModal('matchmaking-modal');
                else mmModal.style.display = 'none';
                clearInterval(gameState.mmInterval);
                gameState.mmInterval = null;
            }
            this._updatePingUI(999);
            this._showDisconnectUI();
        });

        socket.on('syncGameState', (data) => {
            if (!gameState.isOnlineMode || !data) return;
            
            let missingFrom = null;
            let missingTo = null;
            
            if (gameState.virtualBoard && data.board) {
                const oppColor = gameState.myOnlineColor === 'white' ? 'black' : 'white';
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        let oldP = gameState.virtualBoard[r][c];
                        let newP = data.board[r][c];
                        
                        if (oldP !== newP) {
                            if (oldP && oldP.startsWith(oppColor) && (!newP || !newP.startsWith(oppColor))) {
                                missingFrom = { r, c };
                            }
                            if (newP && newP.startsWith(oppColor) && (!oldP || !oldP.startsWith(oppColor))) {
                                missingTo = { r, c };
                            }
                        }
                    }
                }
            }

            if (data.board) gameState.virtualBoard = data.board;
            if (data.turn) gameState.currentTurn = data.turn;
            if (data.turnEndTime) gameState.turnEndTime = data.turnEndTime;
            
            gameState.movesWithoutProgress = 0;
            gameState.boardHistoryStr = [];
            gameState.pieceHistories = {}; 
            gameState.lastMyMove = null; 
            
            ui.renderBoard(true);
            
            if (missingFrom && missingTo) {
                ui.clearHighlights();
                if (typeof ui.highlightMove === 'function') {
                    ui.highlightMove(missingFrom, missingTo);
                }
            }

            ui.startTurn();
        });

        socket.on('roomCreated', id => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'white';
            gameState.isSpectator = false;
            gameState.lastMyMove = null;
            if(id) {
                gameState.onlineRoomID = id;
            }

            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('create-room-modal');
            }

            this._showToast(getNotifyMsg('roomCreated'));

            const createBtn = document.querySelector('#online-modal .save-settings-btn');
            if (createBtn) {
                createBtn.innerHTML = 'تم الإنشاء.. بانتظار الخصم ⏳';
                createBtn.style.opacity = '0.5';
                createBtn.style.pointerEvents = 'none';
            }
        });

        socket.on('roomJoined', () => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'black';
            gameState.isSpectator = false;
            gameState.lastMyMove = null;
            this._showToast(getNotifyMsg('roomJoined'));
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('online-modal');
                window.closeAppModal('create-room-modal');
            }
        });

        socket.on('waitingForOpponent', msg => {
            const mmModal = document.getElementById('matchmaking-modal');
            if (mmModal && (mmModal.style.display === 'flex' || mmModal.style.display === 'block')) return;
            this._showToast(msg);
        });

        socket.on('receiveSpectatorsList', (list) => {
            if (typeof window.renderSpectatorsList === 'function') {
                window.renderSpectatorsList(list);
            }
        });

        socket.on('kickedFromRoom', (data) => {
            if (gameState.isSpectator && gameState.userProfile && gameState.userProfile.id === data.targetId) {
                this._showToast("⚠️ لقد تم طردك من هذه الغرفة بواسطة المالك!");
                this.handleExitGame(); 
            }
        });

        socket.on('spectatorJoined', (data) => {
            if (!data) return;
            gameState.isBotOpponent = false;
            gameState.isGameOver = false;
            gameState.isGameActive = true;
            gameState.isOnlineMode = true;
            gameState.isSpectator = true; 
            
            if (data.roomID) {
                gameState.onlineRoomID = data.roomID;
            }
            
            gameState.virtualBoard = data.board;
            gameState.currentTurn = data.turn || 'white';
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('online-modal');

            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'SHOW_GAME_UI' }, '*');
            }

            ui.setupSpectatorUI(data.player1, data.player2, data.isBettingOpen, data.roomID, data.hasAlreadyBet);
            ui.renderBoard(true);
            ui.startTurn();

            const bettorsEl = document.getElementById('bettors-count-display');
            if (bettorsEl) bettorsEl.innerText = data.totalBettors || 0;
            
            if (data.isBettingOpen && !data.hasAlreadyBet && typeof window.ui.showSpectatorBetModal === 'function') {
                window.ui.showSpectatorBetModal(data.roomID, data.player1, data.player2);
            } else {
                this._showToast(getNotifyMsg('spectating'));
            }
        });

        socket.on('spectatorCountChanged', (data) => {
            const countEl = document.getElementById('spectator-count-display');
            if (countEl) countEl.innerText = data.count;
            else this._showToast(`👁️ المشاهدون الآن: ${data.count}`);
        });

        socket.on('spectatorBetsUpdated', (data) => {
            const bettorsEl = document.getElementById('bettors-count-display');
            if (bettorsEl) bettorsEl.innerText = data.totalBettors;
        });

        socket.on('betResult', (data) => {
            if (data && data.msg) {
                if (typeof ui.showCustomAlert === 'function') {
                    ui.showCustomAlert(data.msg, data.won ? "نتيجة الرهان 🎉" : "نتيجة الرهان", null, false, null, "رائع");
                } else {
                    this._showToast(data.msg);
                }
            }
        });

        socket.on('creatorCutReceived', (data) => {
            if (data && data.amount) {
                this._showToast(`🎁 مكافأة دعم:حصلت على ${data.amount} 🪙 من رهانات المشاهدين!`);
            }
        });

        socket.on('bettingClosed', () => {
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('spectator-bet-modal');
            }
            if (gameState.isSpectator) this._showToast(getNotifyMsg('betClosed'));
        });

        socket.on('gameStart', data => {
            if (!data) return;
            
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'SHOW_GAME_UI' }, '*');
            }

            try {
                document.getElementById('custom-results-modal-container')?.remove(); 
                if (typeof window.closeAppModal === 'function') {
                    window.closeAppModal('online-modal');
                    window.closeAppModal('create-room-modal');
                    window.closeAppModal('matchmaking-modal');
                    window.closeAppModal('custom-alert-modal');
                } else {
                    if (ui && typeof ui.setDisplay === 'function') {
                        ui.setDisplay('online-modal', 'none');
                        ui.setDisplay('create-room-modal', 'none');
                        ui.setDisplay('matchmaking-modal', 'none');
                        ui.setDisplay('custom-alert-modal', 'none');
                    }
                }
            } catch(e) {}

            if (gameState.countdownInterval) clearInterval(gameState.countdownInterval);
            const overlay = document.getElementById('match-countdown-overlay');
            if (overlay) overlay.style.display = 'none';
            
            this.isAlertShown = false; 

            if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
            clearInterval(gameState.mmInterval);
            gameState.mmInterval = null; 

            gameState.isBotOpponent = false;
            gameState.isGameOver = false;
            gameState.isGameActive = true;
            gameState.isSpectator = false;
            gameState.statsUpdated = false; 
            gameState.isUpdatingStats = false; 
            gameState.selectedPiece = null; 
            gameState.movesWithoutProgress = 0;
            gameState.boardHistoryStr = [];
            gameState.pieceHistories = {}; 
            gameState.lastMyMove = null; 
            
            gameState.turnEndTime = null;
            gameState.turnTimeLeft = data.secondsLeft || 45;
            if (data.turnEndTime) {
                gameState.turnEndTime = data.turnEndTime;
            } else {
                gameState.turnEndTime = Date.now() + (gameState.turnTimeLeft * 1000);
            }

            if (data.roomID) {
                gameState.onlineRoomID = data.roomID;
            }

            window.currentOpponentData = data.opponent;
            window.currentOpponentId = data.opponent ? data.opponent.guestId : null;

            gameState.currentOpponentName = (data.opponent?.name || (gameState.lang === 'ar' ? "لاعب أونلاين" : "Online"));
            gameState.currentOpponentAvatar = (data.opponent?.avatar || "1000132081.webp");
            gameState.currentOpponentFr = (data.opponent?.equippedFr || "fr_classic");
            gameState.currentOpponentProfileFrame = data.opponent?.equippedProfileFrame || null; 
            
            const opponentXpFromServer = Number(data.opponent?.xp) || 0;
            gameState.currentOpponentXp = opponentXpFromServer;
            if (data.opponent) gameState.currentOpponentData = data.opponent;
            
            gameState.isOnlineMode = true;
            
            try {
                if (typeof startOnlineHintSystem === 'function') {
                    startOnlineHintSystem(); 
                }
            } catch(e) {}

            gameState.playerColor = gameState.myOnlineColor = data.color;
            gameState.virtualBoard = data.board;

            if (gameState.virtualBoard && Array.isArray(gameState.virtualBoard)) {
                let wc = [0,0], bc = [0,0];
                gameState.virtualBoard.forEach((row, r) => {
                    if (row && Array.isArray(row)) {
                        row.forEach(p => {
                            if(p) {
                                if(p.startsWith('white')) r < 4 ? wc[0]++ : wc[1]++;
                                if(p.startsWith('black')) r < 4 ? bc[0]++ : bc[1]++;
                            }
                        });
                    }
                });
                if (!gameState.pieceDirection) gameState.pieceDirection = {};
                gameState.pieceDirection.white = wc[0] > wc[1] ? 1 : -1;
                gameState.pieceDirection.black = bc[0] > bc[1] ? 1 : -1;
            }
            
            try {
                if (typeof gameEngine.computeOnlineFlip === 'function') {
                    gameState.onlineFlip = gameEngine.computeOnlineFlip(gameState.myOnlineColor);
                } else {
                    gameState.onlineFlip = (gameState.myOnlineColor === 'black');
                }
            } catch(e) {
                gameState.onlineFlip = (gameState.myOnlineColor === 'black');
            }
            
            const myProfile = gameState.userProfile || this._ensureUserProfile();
            const isOptOut = myProfile.syncThemeOptOut === true;
            const myXp = Number(myProfile.xp) || 0;
            const oppXp = opponentXpFromServer;

            if (!isOptOut && oppXp > myXp) {
                this._showToast(getNotifyMsg('oppHigherTheme'));
                applyMatchThemeRobust(data.opponent);
            } else if (!isOptOut && myXp > oppXp) {
                this._showToast(getNotifyMsg('myHigherTheme'));
                applyMatchThemeRobust(myProfile);
            } else {
                applyMatchThemeRobust(myProfile);
            }

            try {
                const gameMenuContainer = document.getElementById('game-mode-selection') || document.querySelector('.menu-buttons-container');
                if (gameMenuContainer) {
                    gameMenuContainer.style.display = 'none';
                }
            } catch(e) {}

            if (ui && typeof ui.toggleOnlineUILayout === 'function') {
                ui.toggleOnlineUILayout(true, gameState.currentOpponentName, gameState.currentOpponentAvatar);
                ui.setDisplay('bottom-control-panel', 'flex'); 
                ui.renderBoard(true);
                
                gameState.currentTurn = data.turn || 'white';
                ui.startTurn();
            }
        });

        socket.on('opponentMove', data => {
            if (!data || !data.from || !data.to) return;
            
            let fromR = Number(data.from.r);
            let fromC = Number(data.from.c);
            let toR = Number(data.to.r);
            let toC = Number(data.to.c);

            if (gameState.lastMyMove && 
                fromR === gameState.lastMyMove.fromR && 
                fromC === gameState.lastMyMove.fromC &&
                toR === gameState.lastMyMove.toR && 
                toC === gameState.lastMyMove.toC) {
                
                gameState.lastMyMove = null; 
                return; 
            }
            gameState.lastMyMove = null; 

            if (data.updatedBoard) {
                gameState.virtualBoard = data.updatedBoard;
                gameState.movesWithoutProgress = 0; 
                gameState.pieceHistories = {};
            } else {
                let possibleMoves = gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard);
                let executedPath = possibleMoves.find(p => p[p.length - 1].toR === toR && p[p.length - 1].toC === toC);
                
                if (executedPath) {
                    let movingPieceStr = gameState.virtualBoard[executedPath[0].fromR][executedPath[0].fromC];
                    let isCapture = executedPath.some(s => s.midR !== null);
                    
                    gameState.virtualBoard = gameEngine.applyPathToBoard(executedPath, gameState.virtualBoard);
                    
                    let lastStep = executedPath[executedPath.length - 1];
                    let finalPieceStr = gameState.virtualBoard[lastStep.toR][lastStep.toC];
                    let isPromotion = false;
                    
                    if (movingPieceStr && !movingPieceStr.includes('dama') && finalPieceStr && finalPieceStr.includes('dama')) {
                        isPromotion = true;
                    }

                    if (isCapture || isPromotion) {
                        gameState.movesWithoutProgress = 0;
                        gameState.boardHistoryStr = [];
                        gameState.pieceHistories = {}; 
                    } else {
                        gameState.movesWithoutProgress++;
                        gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard));
                        if (gameEngine.trackPieceHistory) gameEngine.trackPieceHistory(executedPath[0].fromR, executedPath[0].fromC, lastStep.toR, lastStep.toC, gameState.currentTurn);
                    }
                } else {
                    if(socket.connected) socket.emit('requestGameState', { roomID: String(gameState.onlineRoomID).trim() });
                }
            }
            
            gameState.currentTurn = data.nextTurn;
            if (data.turnEndTime) gameState.turnEndTime = data.turnEndTime;

            ui.renderBoard();
            
            try {
                if (window.ui && window.ui.sfx && window.ui.sfx.move) {
                    window.ui.playSound(window.ui.sfx.move);
                }
            } catch (err) {}
            
            if(gameState.selectedPiece) {
                gameState.selectedPiece.classList.remove('selected');
                gameState.selectedPiece = null;
            }
            
            ui.clearHighlights();
            if (typeof ui.highlightMove === 'function') ui.highlightMove({r: fromR, c: fromC}, {r: toR, c: toC});
            
            let isMultiJumpContinuation = (gameState.currentTurn === data.nextTurn);
            if (isMultiJumpContinuation) {
                const boardEl = document.getElementById('board');
                const activeCell = boardEl?.querySelector(`[data-row="${toR}"][data-col="${toC}"]`);
                if (activeCell && activeCell.children.length > 0) activeCell.children[0].classList.add('forced'); 
            }
            
            ui.startTurn();
        });

        socket.on('opponentResigned', () => {
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
            if (gameState.isGameOver) return;

            gameState.isGameOver = true;
            gameState.isGameActive = false;

            if (!gameState.isSpectator) {
                if (typeof gameEngine.endGame === 'function') {
                    gameEngine.endGame(gameState.myOnlineColor);
                }
                this._showToast(getNotifyMsg('oppResignedWin'));
            } else {
                this._showToast(getNotifyMsg('oppResignedSpec'));
                const tInd = document.getElementById('turn-indicator');
                const tCount = document.getElementById('turn-countdown');
                if (tInd) { tInd.innerText = '🏳️ انسحب أحد اللاعبين'; tInd.style.color = '#ff453a'; }
                if (tCount) tCount.innerText = 'المباراة انتهت';
            }
        });

        socket.on('turnTimeout', data => {
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
            if (gameState.isGameOver) return;

            gameState.isGameOver = true;
            gameState.isGameActive = false;

            const winnerColor = (data && data.winner) ? data.winner : gameState.myOnlineColor;
            
            if (!gameState.isSpectator) {
                if (typeof gameEngine.endGame === 'function') {
                    gameEngine.endGame(winnerColor);
                }
                if (winnerColor === 'draw') {
                    this._showToast(getNotifyMsg('timeoutDraw'));
                } else if (winnerColor === gameState.myOnlineColor) {
                    this._showToast(getNotifyMsg('timeoutWin'));
                } else {
                    this._showToast(getNotifyMsg('timeoutLoss'));
                }
            } else {
                this._showToast(getNotifyMsg('timeoutSpec'));
                const tInd = document.getElementById('turn-indicator');
                const tCount = document.getElementById('turn-countdown');
                if (tInd) { 
                    tInd.innerText = winnerColor === 'white' ? '🏆 فاز الأبيض بالوقت' : '🏆 فاز الأسود بالوقت'; 
                    tInd.style.color = '#30d158'; 
                }
                if (tCount) tCount.innerText = 'المباراة انتهت';
            }
        });

        socket.on('syncTime', (data) => {
            if (gameState.isOnlineMode && data) {
                const seconds = data.secondsLeft || 0;
                gameState.turnTimeLeft = seconds;
                gameState.turnEndTime = Date.now() + (seconds * 1000);
                
                if (window.ui && typeof window.ui.setTxt === 'function') {
                    let timeTxt = (window.t && window.t('time_left')) ? window.t('time_left') : 'المتبقي للدور:';
                    window.ui.setTxt('turn-countdown', `${timeTxt} ${seconds}s`);
                }
            }
        });

        socket.on('opponentDisconnected', data => {
            if (!gameState.isOnlineMode) return;
            this._showToast((data && data.message) || getNotifyMsg('oppDisconnected'));
            
            if (!gameState.isGameOver && !gameState.isSpectator) {
                gameState.isGameOver = true;
                gameState.isGameActive = false;
                if (typeof ui.showOnlineResultsModal === 'function') {
                    ui.showOnlineResultsModal(gameState.myOnlineColor); 
                }
            }
        });

        socket.on('opponentReconnected', data => {
            if (!gameState.isOnlineMode || !data) return;
            this._showToast(getNotifyMsg('oppReconnected', data.name || (gameState.lang === 'ar' ? 'الخصم' : 'Opponent')));
            if (data.avatar && !gameState.isSpectator) {
                gameState.currentOpponentAvatar = data.avatar;
                ui.applyAvatar('card-opp-avatar', data.avatar, data.avatar.startsWith('data:image') || data.avatar.endsWith('.png') || data.avatar.endsWith('.jpg'));
            }
        });

        socket.on('playerDisconnected', () => {
            if (!gameState.isOnlineMode) { socket.disconnect(); return; }
            this._showToast(getNotifyMsg('oppLeftRoom'));
            this.handleExitGame();
        });

        socket.on('opponentLeftRoom', data => {
            if (!gameState.isOnlineMode) return;
            this._showToast((data && data.message) || getNotifyMsg('oppLeftMatch'));
            this.handleExitGame(); 
        });

        socket.on('gameOverByServer', data => {
            if (gameState.isGameOver) return;
            gameState.isGameOver = true;
            gameState.isGameActive = false;
            
            if (gameState.turnTimerInterval) { 
                clearInterval(gameState.turnTimerInterval); 
                gameState.turnTimerInterval = null; 
            }
            
            if (!gameState.isSpectator) {
                if (data.winner === 'draw') {
                    this._showToast(gameState.lang === 'ar' ? `انتهت المباراة بالتعادل 🤝 (${data.reason})` : `Draw 🤝 (${data.reason})`);
                } else if (data.winner === gameState.myOnlineColor) {
                    this._showToast(gameState.lang === 'ar' ? `لقد فزت! 🏆 (${data.reason})` : `You win! 🏆 (${data.reason})`);
                } else {
                    this._showToast(gameState.lang === 'ar' ? `لقد خسرت 😢 (${data.reason})` : `You lose 😢 (${data.reason})`);
                }
                if (typeof ui.showOnlineResultsModal === 'function') {
                    ui.showOnlineResultsModal(data.winner);
                }
            } else {
                this._showToast(gameState.lang === 'ar' ? `انتهت المباراة: ${data.reason}` : `Match ended: ${data.reason}`);
                const tInd = document.getElementById('turn-indicator');
                const tCount = document.getElementById('turn-countdown');
                if (tInd) {
                    if (data.winner === 'draw') { tInd.innerText = '🤝 انتهت بالتعادل'; tInd.style.color = '#f1c40f'; }
                    else { tInd.innerText = data.winner === 'white' ? '🏆 فاز الأبيض' : '🏆 فاز الأسود'; tInd.style.color = '#30d158'; }
                }
                if (tCount) tCount.innerText = 'المباراة انتهت';
            }
        });

        socket.on('rematchOffer', () => {
            if (this.isAlertShown || gameState.isSpectator) return; 
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');
            else ui.setDisplay('custom-alert-modal', 'none');
            
            this.isAlertShown = true;

            if (typeof ui.showCustomAlert === 'function') {
                const msg = gameState.lang === 'ar' ? "الخصم يطلب إعادة اللعب!" : "Opponent wants a rematch!";
                const title = gameState.lang === 'ar' ? "إعادة اللعب" : "Rematch";
                const exitTxt = gameState.lang === 'ar' ? "الخروج" : "Exit";
                const acceptTxt = gameState.lang === 'ar' ? "قبول" : "Accept";

                ui.showCustomAlert(
                    msg, 
                    title, 
                    () => {
                        this.isAlertShown = false;
                        socket.emit('acceptRematch', { roomID: String(gameState.onlineRoomID).trim() });
                        document.getElementById('custom-results-modal-container')?.remove();
                        if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
                        
                        const ind = document.getElementById('turn-indicator');
                        if(ind) ind.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
                    }, 
                    true, 
                    exitTxt, 
                    acceptTxt  
                );

                const updateRematchUI = () => {
                    const alertContainer = document.getElementById('custom-alert-modal'); 
                    if (alertContainer) {
                        alertContainer.style.setProperty('z-index', '99999999', 'important'); 
                        const buttons = alertContainer.querySelectorAll('button');
                        if (buttons && buttons.length >= 2) {
                            buttons[1].onclick = (e) => {
                                e.preventDefault();
                                socketManager.isAlertShown = false;
                                if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
                                else ui.setDisplay('custom-alert-modal', 'none');
                                socketManager.handleExitGame(); 
                            };
                        }
                    }
                };
                updateRematchUI();
                setTimeout(updateRematchUI, 50); 
            }
        });

        socket.on('rematchAccepted', () => {
            this.isAlertShown = false;
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
            else ui.setDisplay('custom-alert-modal', 'none');
            
            document.getElementById('custom-results-modal-container')?.remove();
            if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
            
            const ind = document.getElementById('turn-indicator');
            if(ind) ind.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
        });

        socket.on('roomClosedByTimeout', (data) => {
            if (!gameState.isOnlineMode) return;
            this.isAlertShown = false;
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
            else ui.setDisplay('custom-alert-modal', 'none');
            
            document.getElementById('custom-results-modal-container')?.remove();

            const reasonMsg = data && data.reason ? data.reason : getNotifyMsg('rematchTimeout');
            this._showToast(reasonMsg);
            
            this.handleExitGame(); 
        });

        socket.on('error', msg => {
            this._showToast(msg);
            
            if (msg && (msg.includes('محمي أمنياً') || msg.includes('Clear Cache'))) {
                localStorage.removeItem('hub_user_profile');
                setTimeout(() => window.location.reload(), 1500); 
            } else if (msg && (msg.includes('نسخة اللعبة لديك قديمة') || msg.includes('غير قانونية'))) {
                this.handleExitGame();
            } else {
                if (typeof ui !== 'undefined' && typeof ui.showCustomAlert === 'function') {
                    if (msg.includes('غرفة') || msg.includes('Room') || msg.includes('نشطة')) {
                        ui.showCustomAlert(msg, "تنبيه النظام ⚠️");
                    }
                }
            }
        });

        socket.on('receiveChallenge', data => {
            if (!data) return;
            const profile = this._ensureUserProfile();
            const challengerName = data.challengerName || (gameState.lang === 'ar' ? 'صديق' : 'Friend');
            const betText = data.betAmount > 0 ? `برهان قدره <b>${data.betAmount} 🪙</b>` : `في مباراة ودية`;
            
            const toast = document.getElementById('challenge-toast');
            const toastMsg = document.getElementById('challenge-toast-msg');
            const openBtn = document.getElementById('challenge-toast-open-btn');
            
            if (toast && toastMsg && openBtn) {
                const safeNameDiv = document.createElement('div');
                safeNameDiv.innerText = challengerName;
                const safeName = safeNameDiv.innerHTML;

                toastMsg.innerHTML = `اللاعب <b>${safeName}</b> يتحداك ${betText}.`;
                toast.style.right = '15px'; 
                
                const hideTimeout = setTimeout(() => { toast.style.right = '-320px'; }, 15000);
                
                openBtn.onclick = () => {
                    clearTimeout(hideTimeout);
                    toast.style.right = '-320px';
                    
                    const actionModal = document.getElementById('challenge-action-modal');
                    const actionMsg = document.getElementById('challenge-action-msg');
                    const acceptBtn = document.getElementById('challenge-accept-btn');
                    const rejectBtn = document.getElementById('challenge-reject-btn');
                    
                    if (actionModal && actionMsg) {
                        actionMsg.innerHTML = `هل تقبل تحدي <b>${safeName}</b> ${betText}؟`;
                        actionModal.style.display = 'flex';
                        
                        acceptBtn.onclick = () => {
                            actionModal.style.display = 'none';
                            socket.emit('challengeResponse', { 
                                challengeId: data.challengeId, 
                                accept: true, 
                                responderName: profile.name
                            });
                            socketManager._showToast(gameState.lang === 'ar' ? "جاري تجهيز الغرفة..." : "Preparing match...");
                        };
                        
                        rejectBtn.onclick = () => {
                            actionModal.style.display = 'none';
                            socket.emit('challengeResponse', { 
                                challengeId: data.challengeId, 
                                accept: false, 
                                responderName: profile.name
                            });
                        };
                    }
                };
            }
        });

        socket.on('challengeResponse', data => {
            if (data && data.accept) {
                this._showToast(getNotifyMsg('challengeAccepted'));
            } else {
                const responderName = (data && data.responderName) || (gameState.lang === 'ar' ? 'الصديق' : 'Friend');
                this._showToast(getNotifyMsg('challengeDeclined', responderName));
                this.handleExitGame(); 
            }
        });

        socket.on('mic-request', (data) => {
            if (!gameState.isOnlineMode || gameState.isSpectator) return;
            const modal = document.getElementById('mic-request-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.getElementById('mic-accept-btn').onclick = () => {
                    modal.style.display = 'none';
                    socket.emit('mic-response', { roomID: gameState.onlineRoomID, accept: true, senderId: data.senderId });
                    if (window.voiceChat) window.voiceChat.forceStartCall();
                };
                document.getElementById('mic-reject-btn').onclick = () => {
                    modal.style.display = 'none';
                    socket.emit('mic-response', { roomID: gameState.onlineRoomID, accept: false, senderId: data.senderId });
                };
            }
        });

        socket.on('mic-response', (data) => {
            if (data.accept) {
                this._showToast(getNotifyMsg('micAccepted'));
                if (window.voiceChat) window.voiceChat.forceStartCall();
            } else {
                this._showToast(getNotifyMsg('micRejected'));
                if (window.voiceChat) window.voiceChat.updateMicUI(false);
            }
        });

        socket.on('friendAddedNotification', (data) => {
            if (data) this._showToast(gameState.lang === 'ar' ? `قام اللاعب (${data.newFriendId}) بإضافتك!` : `Player (${data.newFriendId}) added you!`);
        });

        socket.on('friendAddSuccess', (data) => {
            if (data) this._showToast(data.msg);
        });

        socket.on('friendAddFailed', (data) => {
            if (data) this._showToast(data.msg);
        });

        socket.on('levelUpAlert', (data) => {
            if (data && typeof ui.showLevelUpModal === 'function') {
                let rewardsHtml = `+${data.tokens} 🪙`;
                if (data.hints > 0) rewardsHtml += `<br>+${data.hints} 💡`;
                ui.showLevelUpModal(data.newLevel, data.title, rewardsHtml);
            }
        });
    },

    sendChatData(type, value) {
        if (gameState.isOnlineMode && gameState.onlineRoomID && socket.connected && !gameState.isSpectator) {
            socket.emit('sendChat', { roomID: String(gameState.onlineRoomID).trim(), type: type, value: value });
        }
    },

    sendMoveToServer(fromR, fromC, toR, toC, boardStateOrPath, nextTurn) {
        if (gameState.isOnlineMode && gameState.onlineRoomID && !gameState.isSpectator) {
            const profile = this._ensureUserProfile(); 
            
            gameState.lastMyMove = { fromR: Number(fromR), fromC: Number(fromC), toR: Number(toR), toC: Number(toC) };
            
            let movePath = null;
            if (Array.isArray(boardStateOrPath) && boardStateOrPath.length > 0 && boardStateOrPath[0].fromR !== undefined) {
                movePath = boardStateOrPath; 
            } else {
                let possiblePaths = gameEngine.generateAllTurnMoves(gameState.myOnlineColor, gameState.virtualBoard);
                if (possiblePaths) {
                    movePath = possiblePaths.find(p => p.length > 0 && p[0].fromR === Number(fromR) && p[0].fromC === Number(fromC) && p[p.length-1].toR === Number(toR) && p[p.length-1].toC === Number(toC));
                }
            }

            socket.emit('makeMove', { 
                roomID: String(gameState.onlineRoomID).trim(), 
                nextTurn: nextTurn, 
                guestId: profile.id, 
                from: { r: Number(fromR), c: Number(fromC) }, 
                to: { r: Number(toR), c: Number(toC) },
                path: movePath
            });
        }
    },

    sendSurrender() {
        if (gameState.isOnlineMode && gameState.onlineRoomID && !gameState.isSpectator) {
            if (gameState.isGameOver) return; 
            socket.emit('playerResigned', { roomID: String(gameState.onlineRoomID).trim() }); 
            gameState.isGameOver = true;
            gameState.isGameActive = false;
            
            if (typeof gameEngine.handleSurrender === 'function') {
                gameEngine.handleSurrender(gameState.myOnlineColor);
            }
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
        }
    },

    handleExitGame() {
        if (window.voiceChat && typeof window.voiceChat.closeCall === 'function') {
            window.voiceChat.closeCall();
            window.voiceChat.updateMicUI(false);
        }

        restoreOfflineHintSystem(); 

        if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
        document.getElementById('custom-results-modal-container')?.remove();
        
        this.isAlertShown = false; 
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('custom-alert-modal');
            window.closeAppModal('challenge-action-modal');
            window.closeAppModal('spectator-bet-modal');
        } else {
            if (ui && typeof ui.setDisplay === 'function') {
                ui.setDisplay('custom-alert-modal', 'none');
                ui.setDisplay('challenge-action-modal', 'none');
                ui.setDisplay('spectator-bet-modal', 'none');
            }
        }
        
        if (gameState.onlineRoomID && socket.connected) {
            socket.emit('leaveRoom', { roomID: String(gameState.onlineRoomID).trim() });
        }
        
        clearInterval(gameState.mmInterval);
        gameState.mmInterval = null;
        gameState.selectedPiece = null; 
        gameState.lastMyMove = null; 
        
        if (gameState.turnTimerInterval) {
            clearInterval(gameState.turnTimerInterval);
            gameState.turnTimerInterval = null;
        }
        
        if (gameState.isOnlineMode && typeof window.applyTheme === 'function' && gameState.userProfile) {
            window.applyTheme(gameState.userProfile);
        }
        
        gameState.isOnlineMode = false;
        gameState.isGameActive = false;
        gameState.isGameOver = false;
        gameState.isSpectator = false; 
        gameState.onlineRoomID = null;
        gameState.currentOpponentName = null;
        gameState.currentOpponentAvatar = null;
        gameState.currentOpponentXp = 0;
        window.myCurrentRoomId = null; 
        gameState.myCurrentRoomId = null; 
        
        if (typeof gameState.inMatch !== 'undefined') gameState.inMatch = false;
        
        this._hideDisconnectUI();

        if (window.bridge && typeof window.bridge.unlockRoom === 'function') window.bridge.unlockRoom();
        
        if (ui && typeof ui.toggleOnlineUILayout === 'function') {
            ui.toggleOnlineUILayout(false);
            ui.setDisplay('bottom-control-panel', 'flex'); 
        }

        if (ui && typeof ui.drawEmptyBoard === 'function') ui.drawEmptyBoard(); 

        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
        }
    },

    sendRematchRequest() {
        if (gameState.onlineRoomID && !this.isAlertShown && !gameState.isSpectator) { 
            this.isAlertShown = true;
            socket.emit('requestRematch', { roomID: String(gameState.onlineRoomID).trim() });
            
            if (typeof ui.showCustomAlert === 'function') {
                ui.showCustomAlert(
                    getNotifyMsg('rematchSent'),
                    gameState.lang === 'ar' ? "في الانتظار" : "Waiting",
                    null, true  
                );
                
                const updateRematchRequestUI = () => {
                    const alertContainer = document.getElementById('custom-alert-modal'); 
                    if (alertContainer) {
                        alertContainer.style.setProperty('z-index', '99999999', 'important'); 
                        const buttons = alertContainer.querySelectorAll('button');
                        if (buttons && buttons.length >= 2) {
                            buttons[0].style.display = 'none';
                            buttons[1].textContent = gameState.lang === 'ar' ? "خروج" : "Exit";
                            buttons[1].onclick = (e) => {
                                e.preventDefault();
                                socketManager.isAlertShown = false;
                                if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
                                else if (ui) ui.setDisplay('custom-alert-modal', 'none');
                                socketManager.handleExitGame(); 
                            };
                        }
                    }
                };
                updateRematchRequestUI();
                setTimeout(updateRematchRequestUI, 50);
            }
        }
    },

    handleRoomAction(action, roomIdInput, roomPassword = null, betAmount = 0, allowSpectatorBetting = true, roomTitle = null) {
        let targetAction = action;

        if (action === 'startMatchmaking' || action === 'joinMatchmaking' || action === 'joinMatchmakingPool') {
            targetAction = 'joinMatchmakingPool';
        }

        if (targetAction === 'createRoom' || targetAction === 'joinRoom') {
            if (socket.connected) socket.emit('leaveMatchmakingPool');
        }

        if (targetAction !== 'joinMatchmakingPool' && targetAction !== 'createRoom' && !roomIdInput) {
            this._showToast(getNotifyMsg('enterRoomId'));
            return;
        }
        
        const profile = this._ensureUserProfile();
        const safeBetAmount = Math.max(0, parseInt(betAmount) || 0);

        const dataPayload = { 
            roomID: roomIdInput ? String(roomIdInput).trim() : null, 
            userName: profile.name, 
            avatar: profile.avatar, 
            password: roomPassword, 
            guestId: profile.id,
            betAmount: safeBetAmount,
            allowSpectatorBetting: allowSpectatorBetting,
            xp: profile.xp || 0,
            equippedBg: profile.equippedBg || 'bg_wood',
            equippedPc: profile.equippedPc || 'pc_original',
            equippedProfileFrame: profile.equippedProfileFrame || null,
            syncThemeOptOut: profile.syncThemeOptOut === true,
            roomTitle: roomTitle 
        };

        if (roomIdInput && targetAction !== 'joinMatchmakingPool') {
            gameState.onlineRoomID = dataPayload.roomID;
        }

        if (targetAction === 'joinMatchmakingPool') {
            if (gameState.onlineRoomID && socket.connected) {
                socket.emit('leaveRoom', { roomID: String(gameState.onlineRoomID).trim() });
            }
            
            gameState.onlineRoomID = null;
            gameState.isOnlineMode = false;
            gameState.isGameActive = false;
            gameState.isGameOver = false;

            this._safeEmit(targetAction, dataPayload);
        } else {
            this._safeEmit(targetAction, dataPayload);
        }
    },

    joinSpectator(roomID) {
        if (!socket.connected) socket.connect();
        const profile = this._ensureUserProfile();
        socket.emit('joinSpectator', { roomID: roomID, guestId: profile.id, authToken: profile.authToken }); 
    },

    placeSpectatorBet(roomID, color, amount) {
        if (!socket.connected) return;
        const profile = this._ensureUserProfile();
        const safeAmount = Math.max(0, parseInt(amount) || 0); 
        socket.emit('placeSpectatorBet', { roomID: roomID, color: color, amount: safeAmount, guestId: profile.id });
    },

    showStatusMsg(msg) {
        if (ui && typeof ui.setTxt === 'function') {
            ui.setTxt('online-status-text', msg);
            const el = document.getElementById('online-status-text');
            if (el) el.style.cssText = "color:#f1c40f;display:block;";
        }
    },

    sendChallenge(friendId, betAmount = 0) {
        if (!friendId || this.isAlertShown) return;

        const profile = this._ensureUserProfile();
        
        const safeBet = Math.max(0, parseInt(betAmount) || 0);
        
        const challengePayload = {
            targetId: friendId,
            challengerName: profile.name,
            betAmount: safeBet
        };

        this._safeEmit('sendChallenge', challengePayload);
        
        this._showToast(getNotifyMsg('challengeSent'));
    },

    sendAddFriend(friendId) {
        if (!friendId) return;
        const profile = this._ensureUserProfile();
        this._safeEmit('sendFriendReq', { targetId: friendId });
    }
};

const notifyTexts = {
    ar: {
        roomCreated: "تم الإنشاء! بانتظار الخصم ⏳",
        roomJoined: "تم الانضمام! ✅",
        spectating: "أنت الآن تشاهد المباراة 👁️",
        betClosed: "تم إغلاق المراهنات لهذه المباراة 🔒",
        oppHigherTheme: "✨ جاري استخدام ساحة الخصم لأنه الأعلى تصنيفاً!",
        myHigherTheme: "✨ تم تطبيق ساحتك على الخصم لأنك الأعلى تصنيفاً!",
        oppResignedWin: "انسحب الخصم! لقد فزت 🏆",
        oppResignedSpec: "انسحب أحد اللاعبين وانتهت المباراة.",
        timeoutDraw: "انتهى الوقت بالتعادل 🤝",
        timeoutWin: "انتهى وقت الخصم! لقد فزت 🏆",
        timeoutLoss: "انتهى وقتك! حظاً موفقاً ⏳",
        timeoutSpec: "انتهى وقت أحد اللاعبين وانتهت المباراة.",
        oppDisconnected: "انقطع اتصال الخصم ⚠️",
        oppReconnected: "{name} عاد للاتصال! 🔄",
        oppLeftRoom: "غادر الخصم الغرفة 🚪",
        oppLeftMatch: "غادر الخصم المباراة 🚪",
        rematchTimeout: "انتهى وقت الاستجابة لإعادة اللعب ⏱️",
        micAccepted: "تم قبول طلب الصوت 🎤",
        micRejected: "رفض الخصم طلب المحادثة الصوتية 🔕",
        enterRoomId: "الرجاء إدخال رقم الغرفة! 🔢",
        rematchSent: "تم إرسال طلبك! بانتظار رد الخصم... ⏳",
        challengeSent: "تم إرسال طلب التحدي! بانتظار رد الصديق... ⏳",
        challengeAccepted: "تم قبول التحدي! جاري الدخول... ⚔️",
        challengeDeclined: "رفض {name} التحدي ❌"
    },
    en: {
        roomCreated: "Created! Waiting... ⏳",
        roomJoined: "Joined! ✅",
        spectating: "You are now spectating 👁️",
        betClosed: "Betting closed for this match 🔒",
        oppHigherTheme: "✨ Using opponent's theme (Higher Rank)!",
        myHigherTheme: "✨ Your theme applied (Higher Rank)!",
        oppResignedWin: "Opponent Resigned! You Win 🏆",
        oppResignedSpec: "A player resigned. Match ended.",
        timeoutDraw: "Time out! Draw 🤝",
        timeoutWin: "Opponent timeout! You Win 🏆",
        timeoutLoss: "Time out! Better luck next time ⏳",
        timeoutSpec: "A player timed out. Match ended.",
        oppDisconnected: "Opponent disconnected ⚠️",
        oppReconnected: "{name} reconnected! 🔄",
        oppLeftRoom: "Opponent left the room 🚪",
        oppLeftMatch: "Opponent left the match 🚪",
        rematchTimeout: "Rematch timeout expired ⏱️",
        micAccepted: "Voice request accepted 🎤",
        micRejected: "Voice request rejected 🔕",
        enterRoomId: "Please enter Room ID! 🔢",
        rematchSent: "Rematch request sent! Waiting... ⏳",
        challengeSent: "Challenge sent! Waiting for friend... ⏳",
        challengeAccepted: "Accepted! Entering... ⚔️",
        challengeDeclined: "{name} declined the challenge ❌"
    }
};

function getNotifyMsg(key, name = '') {
    const lang = (gameState && gameState.lang) ? gameState.lang : 'ar';
    const dict = notifyTexts[lang] || notifyTexts['en'];
    let text = dict[key] || notifyTexts['en'][key] || key;
    if (name) text = text.replace('{name}', name);
    return text;
}

window.socketManager = socketManager;
