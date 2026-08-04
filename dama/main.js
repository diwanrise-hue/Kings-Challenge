// ملف: main.js
/**
 * main.js
 * العقل المدبر المحلي للعبة: إدارة الأزرار، والمهام، وعجلة الحظ،
 * وربط نافذة التحدي بنظام المراهنات للمشاهدين.
 * (تمت إزالة نظام التخزين المؤقت للمباريات لتنظيف بيئة العمل بناءً على طلبك).
 */
import { gameState } from './gameState.js';
import { ui } from './uiController.js';
import { socket, socketManager } from './socketManager.js';
import { gameEngine } from './gameEngine.js';
import { t } from './i18n.js';

// ==========================================
// 💡 الإصلاحات الذكية (الشاشة البيضاء، الرادار، البينج)
// ==========================================

document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        // 1. معالجة مشكلة الشاشة البيضاء عند العودة للعبة
        setTimeout(() => {
            document.body.style.display = 'none';
            void document.body.offsetHeight;
            document.body.style.display = 'flex';
        }, 50);
    }
});

// 2. كسر تعليق البينج (999) وإخفاء الرادار فور عودة الإنترنت
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

// ==========================================
// إزالة نظام الحفظ (تم التخلص منه لتنظيف المشروع)
// ==========================================
export function saveGameState() {
    // تمت الإزالة لعدم التعارض مع تحديثات الأكواد من GitHub
}

export async function loadGameState() {
    // تمت الإزالة
    return false;
}

// ==========================================
// دوال التلميحات وعجلة الحظ
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

window.addEventListener('load', async () => {
    ui.initProfileSystem();
    ui.drawEmptyBoard();
    if (window.updateHtmlTexts) window.updateHtmlTexts();

    socketManager.init();

    if (gameState.userProfile && gameState.userProfile.nextFreeSpin) { updateSpinTimerDisplay(gameState.userProfile.nextFreeSpin); } else { updateSpinTimerDisplay(0); }
    if (!socket.connected) socket.connect();
    setTimeout(() => { const profileStr = localStorage.getItem('hub_user_profile'); if (profileStr && socket && socket.connected) { socket.emit('syncProfile', JSON.parse(profileStr)); } }, 1000);

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
            if (typeof openAppModal === 'function') openAppModal('create-room-modal');
        };
    }
});

// ==========================================
// إدارة التحديات والأزرار
// ==========================================
window.pendingChallengeId = null;

window.challengeFriend = function(friendId) {
    if (!gameState.userProfile) return;
    if (!socket || !socket.connected) return ui.showCustomAlert(t('sys_offline') || "يجب الاتصال بالإنترنت أولاً");

    ui.setDisplay('in-game-profile-modal', 'none');
    window.pendingChallengeId = friendId;

    document.getElementById('create-room-password-input').style.display = 'none';
    document.getElementById('create-room-password-input').previousElementSibling.style.display = 'none';

    const createBtn = document.getElementById('online-create-btn');
    createBtn.innerText = "إرسال التحدي ⚔️";

    if (typeof openAppModal === 'function') openAppModal('create-room-modal');
};

ui.onClick('diff-quick-select', saveGameState);
ui.onClick('start-white-btn', () => { gameState.playerColor = 'white'; ui.initBoard(); ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('start-black-btn', () => { gameState.playerColor = 'black'; ui.initBoard(); ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('new-game-modal', e => { if (e.target.id === 'new-game-modal') ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('cancel-new-game-btn', () => ui.setDisplay('new-game-modal', 'none'));
ui.onClick('settings-btn', e => { e.stopPropagation(); ui.setDisplay('settings-overlay', 'flex'); });
ui.onClick('save-settings-btn', () => { saveGameState(); ui.setDisplay('settings-overlay', 'none'); });
ui.onClick('settings-overlay', e => { if (e.target.id === 'settings-overlay') ui.setDisplay('settings-overlay', 'none'); });

ui.onClick('lang-select-modal', e => {
    gameState.lang = e.target.value;
    if (window.updateHtmlTexts) window.updateHtmlTexts();
});

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

window.deleteMyRoom = function(roomId) {
    if (window.socket && window.socket.connected) {
         window.socket.emit('leaveRoom', { roomID: roomId });
         window.socket.emit('deleteRoom', { roomID: roomId });
         if (window.socketManager) window.socketManager._showToast('تم إغلاق وحذف غرفتك بنجاح 🗑️');
    }
};

ui.onClick('online-create-btn', () => {
    let betAmt = parseInt(document.getElementById('room-bet-input').value) || 0;

    if (window.pendingChallengeId) {
        socketManager.sendChallenge(window.pendingChallengeId, betAmt);
        if (typeof closeAppModal === 'function') closeAppModal('create-room-modal');
        window.pendingChallengeId = null;
    } else {
        if (window.myCurrentRoomId) {
            if (window.socketManager) window.socketManager._showToast('لديك غرفة سابقاً! يرجى إغلاقها أولاً.');
            if (typeof closeAppModal === 'function') closeAppModal('create-room-modal');
            return;
        }

        let pwd = document.getElementById('create-room-password-input').value;
        let rID = "RM-" + Math.random().toString(36).substring(2,8).toUpperCase();

        socketManager.handleRoomAction('createRoom', rID, pwd, betAmt);
        socketManager.showStatusMsg("جاري إنشاء الغرفة...");
        if (typeof closeAppModal === 'function') closeAppModal('create-room-modal');
    }
});

window.showCustomPasswordPrompt = function(roomId) {
    document.getElementById('custom-target-room-id').value = roomId;
    document.getElementById('custom-room-pwd-input').value = '';

    if (typeof openAppModal === 'function') {
        openAppModal('custom-password-modal');
    }
};

document.getElementById('custom-join-confirm-btn')?.addEventListener('click', () => {
    const roomId = document.getElementById('custom-target-room-id').value;
    const pwd = document.getElementById('custom-room-pwd-input').value;

    if (!pwd) {
        if(window.ui && typeof window.ui.showCustomAlert === 'function') window.ui.showCustomAlert('الرجاء إدخال كلمة السر!');
        return;
    }

    if (window.socket && window.socket.connected) {
         window.socket.emit('joinRoom', { roomID: roomId, password: pwd });
    }

    if (typeof closeAppModal === 'function') {
        closeAppModal('custom-password-modal');
    }
});

window.openCreatorSettings = function(roomId, currentBet) {
    document.getElementById('creator-target-room-id').value = roomId;
    window.isEditingBet = true; 
    document.getElementById('edit-room-bet-input').value = currentBet || 0;
    
    let betDisplay = 'بدون رهان (مجاني)';
    if (currentBet > 0) {
        betDisplay = currentBet + ' 🪙 (الجائزة الكبرى: ' + (currentBet * 2) + ')';
    }
    document.getElementById('edit-room-bet-display').innerText = betDisplay;

    if (typeof openAppModal === 'function') {
        openAppModal('creator-room-settings-modal');
    }
};

document.getElementById('creator-update-bet-btn')?.addEventListener('click', () => {
    const roomId = document.getElementById('creator-target-room-id').value;
    const newBet = document.getElementById('edit-room-bet-input').value;
    const profile = gameState.userProfile || {};

    if (window.socket && window.socket.connected) {
         window.socket.emit('updateRoomBet', { roomID: roomId, newBet: parseInt(newBet), guestId: profile.id });
    }

    if (typeof closeAppModal === 'function') {
        closeAppModal('creator-room-settings-modal');
    }
    window.isEditingBet = false;
});

document.getElementById('creator-cancel-room-btn')?.addEventListener('click', () => {
    const roomId = document.getElementById('creator-target-room-id').value;

    if (window.socket && window.socket.connected) {
         window.socket.emit('leaveRoom', { roomID: roomId });
         window.socket.emit('deleteRoom', { roomID: roomId });
    }

    if (typeof closeAppModal === 'function') {
        closeAppModal('creator-room-settings-modal');
    }

    if(window.ui && typeof window.ui.showCustomAlert === 'function') {
        window.ui.showCustomAlert('تم إغلاق وحذف الغرفة بنجاح.');
    }
});

// ==========================================
// 🌟 نظام نافذة مراهنات المشاهدين (Spectator Betting)
// ==========================================
window.showSpectatorBetModal = function(roomID, player1, player2) {
    const modal = document.getElementById('spectator-bet-modal');
    if (!modal) return;

    document.getElementById('spectator-bet-room-id').value = roomID;
    document.getElementById('spectator-bet-color').value = ''; 
    
    document.getElementById('bet-p1-card').style.border = '2px solid transparent';
    document.getElementById('bet-p2-card').style.border = '2px solid transparent';

    const p1Name = player1 ? player1.name : 'اللاعب 1';
    let p1Avatar = player1 && player1.avatar ? player1.avatar : '1000132081.png';
    if (!p1Avatar.startsWith('http') && !p1Avatar.startsWith('data:')) {
        let cleanName = p1Avatar.replace(/\.\.\//g, '').replace('Photo/', '');
        p1Avatar = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName;
    }
    document.getElementById('bet-p1-name').innerText = p1Name;
    document.getElementById('bet-p1-avatar').style.backgroundImage = `url('${p1Avatar}')`;

    const p2Name = player2 ? player2.name : 'اللاعب 2';
    let p2Avatar = player2 && player2.avatar ? player2.avatar : '1000132081.png';
    if (!p2Avatar.startsWith('http') && !p2Avatar.startsWith('data:')) {
        let cleanName = p2Avatar.replace(/\.\.\//g, '').replace('Photo/', '');
        p2Avatar = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName;
    }
    document.getElementById('bet-p2-name').innerText = p2Name;
    document.getElementById('bet-p2-avatar').style.backgroundImage = `url('${p2Avatar}')`;

    if (typeof openAppModal === 'function') openAppModal('spectator-bet-modal');
};

ui.onClick('spectator-submit-bet-btn', () => {
    const roomID = document.getElementById('spectator-bet-room-id').value;
    const color = document.getElementById('spectator-bet-color').value;
    const amount = document.getElementById('spectator-bet-amount').value;

    if (!color) {
        if (typeof ui.showCustomAlert === 'function') ui.showCustomAlert('الرجاء اختيار اللاعب الذي تتوقع فوزه أولاً!');
        return;
    }

    if (window.socketManager && typeof window.socketManager.placeSpectatorBet === 'function') {
        window.socketManager.placeSpectatorBet(roomID, color, amount);
    }

    if (typeof closeAppModal === 'function') closeAppModal('spectator-bet-modal');
});
