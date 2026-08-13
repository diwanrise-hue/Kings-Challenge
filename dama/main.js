/**
 * main.js
 * المنسق العام للمشروع (Orchestrator).
 * يربط بين الواجهة (UI)، السيرفر (Socket)، وحالة اللعبة (GameState).
 * 🌟 (مُحدّث): تطبيق منطق زر الحفظ الصحيح وعكس حالة مربع اختيار الساحة.
 */
import { gameState } from './gameState.js';
import { ui } from './uiController.js';
import { socket, socketManager } from './socketManager.js';
import { gameEngine } from './gameEngine.js';
import { t } from './i18n.js';

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

// ==========================================
// 💡 الإصلاحات الذكية (الشاشة البيضاء، الرادار، البينج)
// ==========================================
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        setTimeout(() => {
            document.body.style.display = 'none';
            void document.body.offsetHeight;
            document.body.style.display = 'flex';
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

        if (socketManager && typeof socketManager._hideDisconnectUI === 'function') {
            socketManager._hideDisconnectUI();
        }

        socket.volatile.emit('clientPing', Date.now());
    }, 300);
});

// ==========================================
// التخزين المحلي
// ==========================================
export function saveGameState() {
    // تم التخلص من نظام الحفظ التلقائي للوحة بناءً على التحديثات
    // لضمان التوافق وعدم حدوث مشاكل عند رفع الكود من GitHub
}

export async function loadGameState() {
    return false;
}

// ==========================================
// دوال التلميحات وعجلة الحظ
// ==========================================
export function startOnlineHintSystem() {
    if (gameState.originalHints === null) { 
        gameState.originalHints = gameState.userProfile.hints !== undefined ? gameState.userProfile.hints : 5; 
    }
    gameState.userProfile.hints = 2;
    if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
}

export function restoreOfflineHintSystem() {
    if (gameState.originalHints !== null) {
        gameState.userProfile.hints = gameState.originalHints;
        gameState.originalHints = null;
        try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e) { }
        if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
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
            if (freeBtn) freeBtn.style.display = 'flex';
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
            if (paidBtn) paidBtn.style.display = 'flex';
            if (menuNotifyBadge) menuNotifyBadge.style.display = 'none';
        }
    };
    tick();
    if (nextFreeTime && nextFreeTime > Date.now()) { spinTimerInterval = setInterval(tick, 1000); }
}

// ==========================================
// 🚀 تهيئة اللعبة الأساسية (Initialization)
// ==========================================
window.addEventListener('load', async () => {
    if (typeof ui.initProfileSystem === 'function') ui.initProfileSystem();
    if (typeof ui.drawEmptyBoard === 'function') ui.drawEmptyBoard();
    if (window.updateHtmlTexts) window.updateHtmlTexts();

    socketManager.init();

    if (gameState.userProfile && gameState.userProfile.nextFreeSpin) { 
        updateSpinTimerDisplay(gameState.userProfile.nextFreeSpin); 
    } else { 
        updateSpinTimerDisplay(0); 
    }

    if (!socket.connected) socket.connect();
    
    setTimeout(() => { 
        const profileStr = localStorage.getItem('hub_user_profile'); 
        if (profileStr && socket && socket.connected) { 
            socket.emit('syncProfile', JSON.parse(profileStr)); 
        } 
    }, 1000);

    socket.on('luckySpinResult', (data) => {
        const freeBtn = document.getElementById('spin-free-btn'); if (freeBtn) freeBtn.innerText = "لفة مجانية 🆓";
        const paidBtn = document.getElementById('spin-paid-btn'); if (paidBtn) paidBtn.innerText = "لفة إضافية (200 🪙)";
        
        if (data.success) {
            if (window.questsManager) window.questsManager.updateProgress('spin', 1, 'any');

            if (typeof ui.animateLuckySpin === 'function') {
                ui.animateLuckySpin(data.prizeIndex, () => {
                    if (typeof ui.showCustomAlert === 'function') ui.showCustomAlert(data.message, "🎉 مبروك!");
                    if (data.nextFreeSpinTime) {
                        gameState.userProfile.nextFreeSpin = data.nextFreeSpinTime;
                        try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}
                        updateSpinTimerDisplay(data.nextFreeSpinTime);
                    }
                });
            }
        } else { 
            if (typeof ui.showCustomAlert === 'function') ui.showCustomAlert(data.message, "عذراً"); 
        }
    });

    socket.on('profileUpdated', (profile) => {
        if (!profile) return;
        gameState.userProfile = { ...gameState.userProfile, ...profile };
        try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}

        if (gameState.userProfile.syncThemeOptOut !== undefined) {
            const optCb = document.getElementById('sync-theme-optout');
            // 🌟 عكس المنطق هنا ليتوافق مع الواجهة
            if (optCb) optCb.checked = !gameState.userProfile.syncThemeOptOut;
        }

        if (typeof window.applyProfileDataToUI === 'function') window.applyProfileDataToUI(gameState.userProfile);
        if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
        if (profile.nextFreeSpin) updateSpinTimerDisplay(profile.nextFreeSpin);
        
        if (typeof window.renderGiftsInBag === 'function') {
            window.renderGiftsInBag();
        }
    });

    socket.on('gameStart', (data) => { 
        gameState.roomBet = data.roomBet || 0; 
        window.currentOpponentData = data.opponent; 
        window.currentOpponentId = data.opponent ? data.opponent.guestId : null;
    });

    socket.on('receivePopularityGift', (data) => {
        if (data && data.popValue) {
            gameState.userProfile.popularity = (gameState.userProfile.popularity || 0) + data.popValue;
            try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}
            if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
            
            let giftImageHtml = '<div style="font-size: 60px;">🎁</div>';
            let giftName = 'هدية قيمة';
            
            if (window.POPULARITY_ITEMS) {
                const giftObj = window.POPULARITY_ITEMS.find(item => item.id === data.giftId);
                if (giftObj) {
                    giftName = giftObj.nameAr;
                    const style = "width: 140px; height: 140px; object-fit: contain; animation: floatGift 2s ease-in-out infinite; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6));";
                    
                    if (giftObj.mediaType === 'video') {
                        giftImageHtml = `<video src="${giftObj.videoPath}" autoplay loop muted playsinline style="${style} border-radius: 12px;"></video>`;
                    } else {
                        giftImageHtml = `<img src="${giftObj.imagePath}" style="${style}">`;
                    }
                }
            }

            const celebrationOverlay = document.createElement('div');
            celebrationOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                z-index: 999999999; display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                animation: fadeInOverlay 0.4s ease-out;
            `;
            
            celebrationOverlay.innerHTML = `
                <style>
                    @keyframes floatGift { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.05); } }
                    @keyframes popInModal { 0% { transform: scale(0.5); opacity: 0; } 80% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
                    @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
                    .gift-rays { position: absolute; top: 50%; left: 50%; width: 200%; height: 200%; transform: translate(-50%, -50%); background: repeating-conic-gradient(from 0deg, rgba(255,215,0,0.15) 0deg 15deg, transparent 15deg 30deg); animation: spinRays 10s linear infinite; z-index: -1; }
                    @keyframes spinRays { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
                </style>
                <div style="position: relative; overflow: hidden; background: linear-gradient(135deg, rgba(30,32,40,0.95), rgba(15,18,25,0.95)); border: 2px solid #ffd700; border-radius: 28px; padding: 40px 30px; text-align: center; box-shadow: 0 0 40px rgba(255,215,0,0.3); width: 85%; max-width: 340px; animation: popInModal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                    <div class="gift-rays"></div>
                    <h3 style="color: #ffd700; margin: 0 0 20px 0; font-size: 26px; text-shadow: 0 2px 5px rgba(0,0,0,0.8); position: relative; z-index: 2;">هدية جديدة! 🎉</h3>
                    <div style="margin: 25px 0; position: relative; z-index: 2;">
                        ${giftImageHtml}
                    </div>
                    <p style="color: white; font-size: 16px; margin: 15px 0; position: relative; z-index: 2;">اللاعب <span style="color: #30d158; font-weight: 800; font-size: 18px;">${data.senderName}</span> أرسل لك:</p>
                    <p style="color: #f5a623; font-size: 22px; font-weight: 900; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.9); position: relative; z-index: 2;">${giftName} <span style="color:#00d2ff;">(+${formatCompactNumber(data.popValue)} <span style="filter: hue-rotate(210deg);">🔥</span>)</span></p>
                </div>
            `;
            
            document.body.appendChild(celebrationOverlay);
            
            setTimeout(() => {
                celebrationOverlay.style.opacity = '0';
                celebrationOverlay.style.transition = 'opacity 0.5s ease';
                setTimeout(() => celebrationOverlay.remove(), 500);
            }, 4500);
        }
    });

    const lobbyCreateBtn = document.querySelector('#online-modal .save-settings-btn');
    if (lobbyCreateBtn) {
        lobbyCreateBtn.onclick = () => {
            gameState.isEditingBet = false; 
            gameState.pendingChallengeId = null;
            
            const passInput = document.getElementById('create-room-password-input');
            if (passInput) {
                passInput.style.display = 'block';
                if (passInput.previousElementSibling) passInput.previousElementSibling.style.display = 'block';
            }
            
            const confirmBtn = document.getElementById('online-create-btn');
            if (confirmBtn) confirmBtn.innerText = "تأكيد وإنشاء";
            
            if (typeof window.openAppModal === 'function') window.openAppModal('create-room-modal');
        };
    }
});

// ==========================================
// 🕹️ إدارة تفاعلات الأزرار والروابط (Event Handlers)
// ==========================================

ui.onClick('diff-quick-select', saveGameState);

ui.onClick('start-white-btn', () => { 
    gameState.playerColor = 'white'; 
    if(typeof ui.initBoard === 'function') ui.initBoard(); 
    if(typeof window.closeAppModal === 'function') window.closeAppModal('new-game-modal'); 
});

ui.onClick('start-black-btn', () => { 
    gameState.playerColor = 'black'; 
    if(typeof ui.initBoard === 'function') ui.initBoard(); 
    if(typeof window.closeAppModal === 'function') window.closeAppModal('new-game-modal'); 
});

ui.onClick('new-game-modal', e => { 
    if (e.target.id === 'new-game-modal' && typeof window.closeAppModal === 'function') {
        window.closeAppModal('new-game-modal'); 
    }
});

ui.onClick('cancel-new-game-btn', () => { 
    if(typeof window.closeAppModal === 'function') window.closeAppModal('new-game-modal'); 
});

ui.onClick('settings-btn', e => { 
    e.stopPropagation(); 
    if(typeof window.openAppModal === 'function') window.openAppModal('settings-overlay'); 
});

// 🌟 زر الحفظ المُحدث: يقرأ قيمة المربع ويعكسها للحفظ (صح = موافق = false للـ OptOut)
ui.onClick('save-settings-btn', () => { 
    const optCb = document.getElementById('sync-theme-optout');
    if (optCb && gameState.userProfile) {
        gameState.userProfile.syncThemeOptOut = !optCb.checked;
        try {
            localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile));
            if (window.socket && window.socket.connected) {
                window.socket.emit('syncProfile', gameState.userProfile);
            }
        } catch(e) {}
    }
    
    saveGameState(); 
    if(typeof window.closeAppModal === 'function') window.closeAppModal('settings-overlay'); 
});

ui.onClick('settings-overlay', e => { 
    if (e.target.id === 'settings-overlay' && typeof window.closeAppModal === 'function') {
        window.closeAppModal('settings-overlay'); 
    }
});

ui.onClick('lang-select-modal', e => {
    gameState.lang = e.target.value;
    if (window.updateHtmlTexts) window.updateHtmlTexts();
});

// -- تسجيل الدخول وإدارة الأصدقاء --
ui.onClick('login-guest-btn', () => {
    const randomNum = 10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000);
    gameState.userProfile = { 
        ...gameState.userProfile, 
        name: t('guest_prefix') + randomNum, 
        id: "GUEST-" + randomNum, 
        avatar: ui.getVal('login-avatar-select', '1000132081.webp'), 
        isCustomAvatar: false,
        inventory: {}
    };
    try { 
        localStorage.setItem('dama_guest_expiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); 
        localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
    } catch (e) { }
    
    if(typeof ui.updateProfileUI === 'function') ui.updateProfileUI(); 
    if(typeof window.closeAppModal === 'function') window.closeAppModal('login-modal');
});

ui.onClick('login-submit-btn', () => {
    let name = ui.getVal('login-name-input').trim();
    if (!name) {
        if(typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('enter_name'));
        return;
    }
    
    name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    gameState.userProfile = { 
        ...gameState.userProfile, 
        name, 
        id: "DAMA-" + Math.random().toString(36).substring(2, 8).toUpperCase(), 
        avatar: gameState.userProfile.isCustomAvatar ? gameState.userProfile.avatar : ui.getVal('login-avatar-select', '1000132081.webp'),
        inventory: gameState.userProfile.inventory || {}
    };
    
    try { 
        localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
        localStorage.removeItem('dama_guest_expiry'); 
    } catch (e) { }
    
    if(typeof ui.updateProfileUI === 'function') ui.updateProfileUI(); 
    if(typeof window.closeAppModal === 'function') window.closeAppModal('login-modal');
});

ui.onClick('add-friend-btn', () => {
    let fId = ui.getVal('friend-id-input').trim().toUpperCase();
    if (!fId || fId === gameState.userProfile.id || (gameState.userProfile.friends && gameState.userProfile.friends.includes(fId))) {
        if(typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('invalid_id'));
        return;
    }
    
    if (!gameState.userProfile.friends) gameState.userProfile.friends = [];
    gameState.userProfile.friends.push(fId);
    
    try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}
    
    if(typeof ui.updateProfileUI === 'function') ui.updateProfileUI(); 
    document.getElementById('friend-id-input').value = ''; 
    if(typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('added_success'));
});

document.getElementById('avatar-upload-input')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/') || file.size > 800 * 1024) {
        if(typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('img_large'));
        return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
        gameState.userProfile.avatar = ev.target.result; 
        gameState.userProfile.isCustomAvatar = true; 
        if(typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
        try { 
            localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
        } catch(err) { 
            if(typeof ui.showCustomAlert === 'function') ui.showCustomAlert("Storage limit exceeded."); 
        }
    };
    reader.readAsDataURL(file);
});

ui.onClick('logout-btn', () => {
    const isGuest = gameState.userProfile.id.startsWith("GUEST-");
    const msg = isGuest ? t('guest_logout_warn') : t('logout_confirm');
    
    if(typeof ui.showCustomAlert === 'function') {
        ui.showCustomAlert(msg, null, () => {
            gameState.originalHints = null; 
            localStorage.removeItem('hub_user_profile'); 
            localStorage.removeItem('dama_guest_expiry');
            
            gameState.userProfile = { id: "", name: "", avatar: "1000132081.webp", isCustomAvatar: false, gamesPlayed: 0, wins: 0, losses: 0, friends: [], hints: 5, nextFreeSpin: 0, discountTicket: 0, inventory: {} };
            
            if(typeof window.closeAppModal === 'function') window.closeAppModal('profile-modal'); 
            if(typeof window.openAppModal === 'function') window.openAppModal('login-modal');
            if (typeof window.applyProfileDataToUI === 'function') window.applyProfileDataToUI(gameState.userProfile);
        }, true);
    }
});

ui.onClick('switch-account-btn', () => { 
    if(typeof window.closeAppModal === 'function') window.closeAppModal('profile-modal'); 
    if(typeof window.openAppModal === 'function') window.openAppModal('login-modal'); 
});

// -- عجلة الحظ --
ui.onClick('spin-free-btn', () => {
    if (window.isSpinning) return;
    if (socket && socket.connected) {
        const btn = document.getElementById('spin-free-btn'); 
        if (btn) btn.innerText = "جاري التحقق...";
        socket.emit('requestLuckySpin', { type: 'free', guestId: gameState.userProfile.id });
    } else { 
        if(typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('server_disconnected') || "يرجى الاتصال بالإنترنت أولاً للعب عجلة الحظ!"); 
    }
});

ui.onClick('spin-paid-btn', () => {
    if (window.isSpinning) return;
    if (gameState.userProfile.tokens < 200) { 
        if(typeof ui.showCustomAlert === 'function') ui.showCustomAlert("رصيدك غير كافٍ للفة الإضافية (مطلوب 200 🪙)", "عذراً");
        return; 
    }
    
    if (socket && socket.connected) {
        if(typeof ui.showCustomAlert === 'function') {
            ui.showCustomAlert("سيتم خصم 200 🪙 من رصيدك مقابل هذه اللفة الإضافية. هل أنت مستعد؟", "تأكيد اللفة", () => {
                const btn = document.getElementById('spin-paid-btn');
                if (btn) { btn.innerText = "جاري الدفع..."; btn.style.pointerEvents = 'none'; }
                socket.emit('requestLuckySpin', { type: 'paid', guestId: gameState.userProfile.id });
            }, true, "إلغاء", "نعم، لف العجلة!");
        }
    } else { 
        if(typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('server_disconnected') || "يرجى الاتصال بالإنترنت أولاً للعب عجلة الحظ!"); 
    }
});

// -- التوفيق العشوائي والغرف --
const onlineBtn = document.getElementById('online-toggle-btn');
if (onlineBtn) {
    onlineBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (gameState.isOnlineMode) { 
            if (ui && typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('already_match')); 
            return; 
        }
        
        if (!socket || !socket.connected) { 
            if (ui && typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('server_disconnected')); 
            return; 
        }

        if (window.myCurrentRoomId || gameState.myCurrentRoomId) {
            if (socketManager) {
                socket.emit('leaveRoom', { roomID: window.myCurrentRoomId || gameState.myCurrentRoomId });
                window.myCurrentRoomId = null;
                gameState.myCurrentRoomId = null; 
            }
        }

        const mmModal = document.getElementById('matchmaking-modal');
        if (mmModal) {
            mmModal.style.display = 'flex';
            if (gameState.modalStack && !gameState.modalStack.includes('matchmaking-modal')) { 
                gameState.modalStack.push('matchmaking-modal'); 
                history.pushState({ modalOpen: 'matchmaking-modal' }, ''); 
            }
        }

        const profile = gameState.userProfile || {};
        const myNameEl = document.getElementById('mm-my-name'); 
        const myAvatarEl = document.getElementById('mm-my-avatar');

        if (myNameEl) myNameEl.innerText = profile.name || t('badge_you');
        if (myAvatarEl) {
            let avatarSrc = profile.avatar || "1000132081.webp";
            if (!avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:')) {
                let cleanName = avatarSrc.replace(/\.\.\//g, '').replace('Photo/', '');
                avatarSrc = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + cleanName;
            }
            myAvatarEl.style.backgroundImage = 'none';
            myAvatarEl.innerHTML = `<img src="${avatarSrc}" onerror="this.style.display='none'; this.parentNode.textContent='👤';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
        }

        const oppNameEl = document.getElementById('mm-opp-name'); 
        const oppAvatarEl = document.getElementById('mm-opp-avatar'); 
        const statusLabelEl = document.getElementById('mm-status-label');
        
        if (oppNameEl) oppNameEl.innerText = t('mm_opp'); 
        if (statusLabelEl) statusLabelEl.innerText = t('searching');
        if (oppAvatarEl) { oppAvatarEl.innerHTML = "❓"; oppAvatarEl.style.backgroundImage = 'none'; }

        socket.emit('joinMatchmakingPool', { guestId: profile.id, name: profile.name, avatar: profile.avatar });
        
        gameState.mmTimeLeft = 0;
        const timerEl = document.getElementById('mm-timer'); 
        if (timerEl) timerEl.innerText = "00:00";
        
        if (gameState.mmInterval) clearInterval(gameState.mmInterval);
        gameState.mmInterval = setInterval(() => {
            gameState.mmTimeLeft++; 
            let m = String(Math.floor(gameState.mmTimeLeft / 60)).padStart(2, '0'); 
            let s = String(gameState.mmTimeLeft % 60).padStart(2, '0');
            if (timerEl) timerEl.innerText = `${m}:${s}`;
        }, 1000);
    });
}

const cancelMmBtn = document.getElementById('mm-cancel-btn');
if (cancelMmBtn) {
    cancelMmBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        clearInterval(gameState.mmInterval); 
        gameState.mmInterval = null;
        
        const mmModal = document.getElementById('matchmaking-modal');
        if (mmModal) { 
            mmModal.style.display = 'none'; 
            if (gameState.modalStack) {
                gameState.modalStack = gameState.modalStack.filter(id => id !== 'matchmaking-modal'); 
            }
        }
        if (socket && socket.connected) { socket.emit('leaveMatchmakingPool'); }
    });
}

ui.onClick('room-portal-btn', () => { 
    if(typeof window.openAppModal === 'function') window.openAppModal('online-modal'); 
});

ui.onClick('online-close-btn', () => { 
    if(typeof window.closeAppModal === 'function') window.closeAppModal('online-modal'); 
});

ui.onClick('online-create-btn', () => {
    let betAmt = parseInt(document.getElementById('room-bet-input')?.value) || 0;

    if (gameState.pendingChallengeId) {
        socketManager.sendChallenge(gameState.pendingChallengeId, betAmt);
        if (typeof window.closeAppModal === 'function') window.closeAppModal('create-room-modal');
        gameState.pendingChallengeId = null;
    } else {
        if (window.myCurrentRoomId || gameState.myCurrentRoomId) {
            if (socketManager) socketManager._showToast('لديك غرفة سابقاً! يرجى إغلاقها أولاً.');
            if (typeof window.closeAppModal === 'function') window.closeAppModal('create-room-modal');
            return;
        }

        let pwd = document.getElementById('create-room-password-input')?.value;
        let rID = "RM-" + Math.random().toString(36).substring(2,8).toUpperCase();

        socketManager.handleRoomAction('createRoom', rID, pwd, betAmt);
        socketManager.showStatusMsg("جاري إنشاء الغرفة...");
        if (typeof window.closeAppModal === 'function') window.closeAppModal('create-room-modal');
    }
});
