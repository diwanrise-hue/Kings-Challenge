/**
 * main.js
 * المنسق العام للمشروع (Orchestrator).
 * 🌟 (مُحدّث): نظام الطابور (Queue) للهدايا لمنع تداخل الأصوات والفيديوهات.
 * 🛡️ (مُحدّث أمنياً): تأمين توليد الحسابات المستقلة بـ AuthToken لمنع الطرد.
 * 🛠️ (مُحدّث): إزالة الوميض الأسود المزعج (Flicker Hack) عند العودة للتطبيق.
 * ⏱️ (مُحدّث): تصفير مؤقتات المصباح وتهيئته عند إعادة اللعب (Rematch).
 * 🚀 (مُحدّث للإصلاح): ربط زر "إنشاء الغرفة" بشكل مباشر لضمان استجابته السريعة والقطعية.
 */
import { gameState } from './gameState.js';
import { ui } from './uiController.js';
import { socket, socketManager } from './socketManager.js';
import { gameEngine } from './gameEngine.js';
import { t } from './i18n.js';

function formatCompactNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num;
}

// 🛠️ (مُحدّث): إزالة الوميض الأسود واستبداله بإعادة حساب الأبعاد الآمنة (Reflow)
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
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

// 🛡️ ربط الدوال الحيوية بكائن window لحل مشكلة الـ Circular Dependency مع uiController
export function saveGameState() { }
window.saveGameState = saveGameState;

export async function loadGameState() { return false; }
window.loadGameState = loadGameState;

export function startOnlineHintSystem() {
    gameState.onlineHintsUsed = 0; 
    const counterEl = document.getElementById('hint-counter');
    if (counterEl && gameState.userProfile) {
        let remain = Math.max(0, 2 - gameState.onlineHintsUsed);
        counterEl.textContent = Math.min(gameState.userProfile.hints || 0, remain); 
    }
}
window.startOnlineHintSystem = startOnlineHintSystem;

export function restoreOfflineHintSystem() {
    gameState.onlineHintsUsed = 0;
    if (typeof ui.updateProfileUI === 'function') {
        ui.updateProfileUI(); 
    }
}
window.restoreOfflineHintSystem = restoreOfflineHintSystem;

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

    // 🌟 (مُحدّث): نظام الطابور للهدايا لمنع تداخل الأصوات والفيديوهات 🌟
    const giftQueue = [];
    let isProcessingGift = false;

    const processGiftQueue = () => {
        if (isProcessingGift || giftQueue.length === 0) return;
        isProcessingGift = true;

        const data = giftQueue.shift();
        
        let giftImageHtml = '';
        let giftName = 'هدية';
        let isVideoGift = false;
        let animDuration = 2800;
        
        if (window.POPULARITY_ITEMS) {
            const giftObj = window.POPULARITY_ITEMS.find(item => item.id === data.giftId);
            if (giftObj) {
                giftName = giftObj.nameAr;
                isVideoGift = giftObj.mediaType === 'video';
                
                if (isVideoGift) {
                    animDuration = (data.giftId === 'pop_16') ? 10000 : 5000;
                    giftImageHtml = `<video id="receiver-gift-vid" src="${giftObj.videoPath}" autoplay loop playsinline preload="auto" style="width: 220px; height: 220px; object-fit: contain; will-change: transform, opacity;"></video>`;
                } else {
                    giftImageHtml = `<img src="${giftObj.imagePath}" style="width: 150px; height: 150px; object-fit: contain; will-change: transform, opacity;">`;
                }
            }
        }

        const celebrationOverlay = document.createElement('div');
        let overlayBg = isVideoGift ? 'rgba(0, 0, 0, 0.4)' : 'transparent';

        celebrationOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
            pointer-events: none; z-index: 10000050; 
            display: flex; flex-direction: column; align-items: center; 
            justify-content: flex-start;
            padding-top: 12vh;
            background: ${overlayBg};
            opacity: 0; 
            transition: opacity 0.3s ease;
        `;
        
        celebrationOverlay.innerHTML = `
            <div id="receiver-anim-container" style="display: flex; flex-direction: column; align-items: center; opacity: 1; will-change: transform, opacity;">
                ${giftImageHtml}
                <div style="margin-top: 10px; color: #fff; font-weight: bold; font-size: 15px; text-shadow: 0 2px 4px rgba(0,0,0,0.8); background: rgba(0,0,0,0.65); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(48, 209, 88, 0.5);">
                    <span style="color: #30d158;">${data.senderName}</span> أرسل لك ${giftName} 🎁
                </div>
            </div>
        `;
        
        document.body.appendChild(celebrationOverlay);
        
        requestAnimationFrame(() => {
            celebrationOverlay.style.opacity = '1';
        });

        const recVideo = document.getElementById('receiver-gift-vid');
        const animContainer = document.getElementById('receiver-anim-container');
        let animationStarted = false;

        const startAnimation = () => {
            if (animationStarted || !animContainer) return;
            animationStarted = true;

            if (isVideoGift && recVideo) {
                recVideo.volume = 1.0;
                let playPromise = recVideo.play();
                if (playPromise !== undefined) playPromise.catch(e => console.log("AutoPlay Handled"));
            }

            let keyframes = [];
            if (isVideoGift) {
                keyframes = [
                    { transform: 'scale(1)', opacity: 1, offset: 0 },   
                    { transform: 'scale(1)', opacity: 1, offset: 0.9 }, 
                    { transform: 'scale(1)', opacity: 0, offset: 1 }    
                ];
            } else {
                keyframes = [
                    { transform: 'scale(0.2) translateY(50px)', opacity: 0, offset: 0 },
                    { transform: 'scale(1.2) translateY(-10px)', opacity: 1, offset: 0.15 },
                    { transform: 'scale(1) translateY(0)', opacity: 1, offset: 0.25 },
                    { transform: 'scale(1.05) translateY(-5px)', opacity: 1, offset: 0.75 },
                    { transform: 'scale(1.5) translateY(-150px)', opacity: 0, offset: 1 }
                ];
            }

            animContainer.animate(keyframes, {
                duration: animDuration,
                easing: isVideoGift ? 'linear' : 'cubic-bezier(0.25, 1, 0.5, 1)',
                fill: 'forwards'
            });
            
            // 🌟 الانتقال للهدية التالية بعد انتهاء الحالية
            setTimeout(() => {
                celebrationOverlay.style.opacity = '0';
                setTimeout(() => {
                    celebrationOverlay.remove();
                    isProcessingGift = false;
                    processGiftQueue(); // تشغيل الهدية القادمة في الطابور
                }, 500);
            }, isVideoGift ? animDuration - 500 : animDuration);
        };

        if (isVideoGift) {
            if (recVideo.readyState >= 3) { 
                startAnimation();
            } else {
                recVideo.addEventListener('canplay', startAnimation);
                recVideo.onerror = startAnimation; 
                setTimeout(() => { if(!animationStarted && celebrationOverlay.parentNode) startAnimation(); }, 1500);
            }
        } else {
            const imgEl = celebrationOverlay.querySelector('img');
            if (imgEl && imgEl.complete) { startAnimation(); } 
            else if (imgEl) { imgEl.onload = startAnimation; imgEl.onerror = startAnimation; }
            else { startAnimation(); }
        }
    };

    socket.on('receivePopularityGift', (data) => {
        if (data && data.popValue) {
            gameState.userProfile.popularity = (gameState.userProfile.popularity || 0) + data.popValue;
            try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}
            if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
            
            const popValEl = document.getElementById('igp-popularity-val');
            if (popValEl) {
                popValEl.innerText = formatCompactNumber(gameState.userProfile.popularity);
                popValEl.style.transition = 'all 0.3s ease';
                popValEl.style.transform = 'scale(1.3)';
                popValEl.style.color = '#ffd700';
                setTimeout(() => {
                    popValEl.style.transform = 'scale(1)';
                    popValEl.style.color = '';
                }, 400);
            }
            
            // إضافة الهدية للطابور
            giftQueue.push(data);
            processGiftQueue();
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


// 🌟 تغليف أحداث الأزرار داخل DOMContentLoaded لحل مشكلة Circular Dependency
document.addEventListener('DOMContentLoaded', () => {

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

    ui.onClick('login-guest-btn', () => {
        const randomNum = 10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000);
        const authToken = 'tk_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        
        gameState.userProfile = { 
            ...gameState.userProfile, 
            name: t('guest_prefix') + randomNum, 
            id: "GUEST-" + randomNum, 
            authToken: authToken, 
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
        if(socket && !socket.connected) socket.connect();
    });

    ui.onClick('login-submit-btn', () => {
        let name = ui.getVal('login-name-input').trim();
        if (!name) {
            if(typeof ui.showCustomAlert === 'function') ui.showCustomAlert(t('enter_name'));
            return;
        }
        
        name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
        const authToken = 'tk_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

        gameState.userProfile = { 
            ...gameState.userProfile, 
            name, 
            id: "DAMA-" + Math.random().toString(36).substring(2, 8).toUpperCase(), 
            authToken: authToken, 
            avatar: gameState.userProfile.isCustomAvatar ? gameState.userProfile.avatar : ui.getVal('login-avatar-select', '1000132081.webp'),
            inventory: gameState.userProfile.inventory || {}
        };
        
        try { 
            localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
            localStorage.removeItem('dama_guest_expiry'); 
        } catch (e) { }
        
        if(typeof ui.updateProfileUI === 'function') ui.updateProfileUI(); 
        if(typeof window.closeAppModal === 'function') window.closeAppModal('login-modal');
        if(socket && !socket.connected) socket.connect();
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

    const avatarUploadInput = document.getElementById('avatar-upload-input');
    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', e => {
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
    }

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
                if(socket && socket.connected) socket.disconnect();
            }, true);
        }
    });

    ui.onClick('switch-account-btn', () => { 
        if(typeof window.closeAppModal === 'function') window.closeAppModal('profile-modal'); 
        if(typeof window.openAppModal === 'function') window.openAppModal('login-modal'); 
    });

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

    // 🚀 (الإصلاح الجذري): ربط مباشر وقوي بالزر لضمان استجابته بدون الاعتماد على التغليف المعقد.
    const createRoomBtn = document.getElementById('online-create-btn');
    if (createRoomBtn) {
        createRoomBtn.onclick = function() {
            let betAmt = parseInt(document.getElementById('room-bet-input')?.value) || 0;
            let allowSpectatorBetting = document.getElementById('allow-betting-checkbox')?.checked ?? true;
            
            let roomTitleInput = document.getElementById('room-title-input');
            let roomTitle = roomTitleInput ? roomTitleInput.value.trim() : null;

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

                socketManager.handleRoomAction('createRoom', rID, pwd, betAmt, allowSpectatorBetting, roomTitle);
                socketManager.showStatusMsg("جاري إنشاء الغرفة...");
                if (typeof window.closeAppModal === 'function') window.closeAppModal('create-room-modal');
            }
        };
    }
});
