// main.js
import { gameState } from './gameState.js'; 
import { ui } from './uiController.js';
import { socket, socketManager } from './socketManager.js'; 
import { gameEngine } from './gameEngine.js'; 
import { t } from './i18n.js';

window.socket = socket; 

// ==========================================
// 💡 دوال نظام إدارة المصابيح الذكي في الأونلاين
// ==========================================
export function startOnlineHintSystem() {
    if (gameState.originalHints === null) {
        gameState.originalHints = gameState.userProfile.hints !== undefined ? gameState.userProfile.hints : 5;
    }
    gameState.userProfile.hints = 2; 
    ui.updateProfileUI();
}

export function restoreOfflineHintSystem() {
    if (gameState.originalHints !== null) {
        gameState.userProfile.hints = gameState.originalHints; 
        gameState.originalHints = null;
        try { 
            localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
        } catch(e) { console.warn("Storage full", e); }
        ui.updateProfileUI();
    }
}

// ==========================================
// 🎡 نظام مؤقت عجلة الحظ (Lucky Spin Timer)
// ==========================================
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
            clearInterval(spinTimerInterval);
            spinTimerInterval = null;
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
    if (nextFreeTime && nextFreeTime > Date.now()) {
        spinTimerInterval = setInterval(tick, 1000);
    }
}

export function saveGameState() {
    if (gameState.isOnlineMode) return;
    try {
        localStorage.setItem('dama_saved_game', JSON.stringify({
            virtualBoard: gameState.virtualBoard,
            currentTurn: gameState.currentTurn,
            gameMode: document.getElementById('game-mode')?.value || 'ai',
            difficulty: document.getElementById('diff-quick-select')?.value || '3',
            playerColor: gameState.playerColor,
            lang: gameState.lang,
            gameOver: gameState.blockGameOverModal ? undefined : false,
            pieceDirection: gameState.pieceDirection
        }));
    } catch(e) {
        console.warn("Storage full", e);
    }
}

export function loadGameState() {
    const saved = localStorage.getItem('dama_saved_game');
    if (saved) {
        const state = JSON.parse(saved);
        gameState.virtualBoard = state.virtualBoard;
        gameState.currentTurn = state.currentTurn;
        gameState.playerColor = state.playerColor;
        gameState.pieceDirection = state.pieceDirection || gameState.pieceDirection;
        
        const gm = document.getElementById('game-mode'); if(gm) gm.value = state.gameMode;
        const diff = document.getElementById('diff-quick-select'); if(diff) diff.value = state.difficulty;
        const lSel = document.getElementById('lang-select-modal'); if(lSel) lSel.value = gameState.lang;
        
        ui.updateTexts();
        ui.renderBoard();
        return true;
    }
    return false;
}

window.addEventListener('load', () => {
    ui.initProfileSystem();
    socketManager.init();
    
    if (!loadGameState()) {
        ui.drawEmptyBoard();
    } else {
        if (gameState.virtualBoard.some(r => r.some(c => c !== null))) {
            window.isMatchRunning = true;
            ui.toggleOfflineInMatchUI(true);
        }
        ui.renderBoard();
        ui.updateTexts();
        ui.startTurn();
    }

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
});

window.challengeFriend = function(friendId) {
    if (!gameState.userProfile) return;
    
    ui.setDisplay('in-game-profile-modal', 'none');
    
    if (socketManager && typeof socketManager.sendChallenge === 'function') {
        socketManager.sendChallenge(friendId);
    } else {
        ui.showCustomAlert(t('sys_offline'));
    }
};

ui.onClick('diff-quick-select', saveGameState);

ui.onClick('start-white-btn', () => { gameState.playerColor = 'white'; localStorage.removeItem('dama_saved_game'); ui.initBoard(); ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('start-black-btn', () => { gameState.playerColor = 'black'; localStorage.removeItem('dama_saved_game'); ui.initBoard(); ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('new-game-modal', e => { if (e.target.id === 'new-game-modal') ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('cancel-new-game-btn', () => ui.setDisplay('new-game-modal', 'none'));

ui.onClick('settings-btn', e => { e.stopPropagation(); ui.setDisplay('settings-overlay', 'flex'); });
ui.onClick('save-settings-btn', () => { saveGameState(); ui.setDisplay('settings-overlay', 'none'); });
ui.onClick('settings-overlay', e => { if (e.target.id === 'settings-overlay') ui.setDisplay('settings-overlay', 'none'); });

ui.onClick('lang-select-modal', e => { gameState.lang = e.target.value; ui.updateTexts(); saveGameState(); });

ui.onClick('login-guest-btn', () => { 
    gameState.userProfile = { ...gameState.userProfile, name: t('guest_prefix') + (10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000)), id: "GUEST-" + (10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000)), avatar: ui.getVal('login-avatar-select', '1000132081.png'), isCustomAvatar: false }; 
    try {
        localStorage.setItem('dama_guest_expiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); 
        localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
    } catch (e) { console.warn("Storage full", e); }
    ui.updateProfileUI(); ui.setDisplay('login-modal', 'none'); 
});

ui.onClick('login-submit-btn', () => { 
    let name = ui.getVal('login-name-input').trim(); 
    if (!name) return ui.showCustomAlert(t('enter_name')); 
    name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    gameState.userProfile = { ...gameState.userProfile, name, id: "DAMA-" + Math.random().toString(36).substring(2, 8).toUpperCase(), avatar: gameState.userProfile.isCustomAvatar ? gameState.userProfile.avatar : ui.getVal('login-avatar-select', '1000132081.png') }; 
    try {
        localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
        localStorage.removeItem('dama_guest_expiry'); 
    } catch (e) { console.warn("Storage full", e); }
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
        gameState.userProfile.avatar = ev.target.result; 
        gameState.userProfile.isCustomAvatar = true; 
        ui.updateProfileUI(); 
        try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(err) { ui.showCustomAlert("Storage limit exceeded."); } 
    }; 
    reader.readAsDataURL(file); 
});

ui.onClick('logout-btn', () => {
    const isGuest = gameState.userProfile.id.startsWith("GUEST-");
    const msg = isGuest ? t('guest_logout_warn') : t('logout_confirm');
        
    ui.showCustomAlert(msg, null, () => { 
            gameState.originalHints = null; 
            localStorage.removeItem('hub_user_profile'); 
            localStorage.removeItem('dama_guest_expiry'); 
            gameState.userProfile = { id: "", name: "", avatar: "1000132081.png", isCustomAvatar: false, gamesPlayed: 0, wins: 0, losses: 0, friends: [], hints: 5, nextFreeSpin: 0, discountTicket: 0 }; 
            ui.setDisplay('profile-modal', 'none'); 
            ui.setDisplay('login-modal', 'flex'); 
            if (typeof window.applyProfileDataToUI === 'function') window.applyProfileDataToUI(gameState.userProfile);
        }, true);
});

ui.onClick('switch-account-btn', () => { ui.setDisplay('profile-modal', 'none'); ui.setDisplay('login-modal', 'flex'); });

// =========================================================================
// 🎡 أزرار وأحداث عجلة الحظ (Lucky Spin)
// =========================================================================

ui.onClick('spin-free-btn', () => {
    if (window.isSpinning) return; 
    if (socket && socket.connected) {
        const btn = document.getElementById('spin-free-btn');
        if (btn) btn.innerText = "جاري التحقق...";
        socket.emit('requestLuckySpin', { type: 'free', guestId: gameState.userProfile.id });
    } else {
        ui.showCustomAlert(t('server_disconnected') || "يرجى الاتصال بالإنترنت أولاً للعب عجلة الحظ!");
    }
});

ui.onClick('spin-paid-btn', () => {
    if (window.isSpinning) return; 
    
    if (gameState.userProfile.tokens < 200) {
        return ui.showCustomAlert("رصيدك غير كافٍ للفة الإضافية (مطلوب 200 🪙)", "عذراً");
    }
    
    if (socket && socket.connected) {
        ui.showCustomAlert("سيتم خصم 200 🪙 من رصيدك مقابل هذه اللفة الإضافية. هل أنت مستعد؟", "تأكيد اللفة", () => {
            const btn = document.getElementById('spin-paid-btn');
            if (btn) {
                btn.innerText = "جاري الدفع...";
                btn.style.pointerEvents = 'none'; 
            }
            socket.emit('requestLuckySpin', { type: 'paid', guestId: gameState.userProfile.id });
        }, true, "إلغاء", "نعم، لف العجلة!");
    } else {
        ui.showCustomAlert(t('server_disconnected') || "يرجى الاتصال بالإنترنت أولاً للعب عجلة الحظ!");
    }
});

socket.on('luckySpinResult', (data) => {
    const freeBtn = document.getElementById('spin-free-btn');
    if (freeBtn) freeBtn.innerText = "لفة مجانية 🆓";
    const paidBtn = document.getElementById('spin-paid-btn');
    if (paidBtn) paidBtn.innerText = "لفة إضافية (200 🪙)";

    if (data.success) {
        ui.animateLuckySpin(data.prizeIndex, () => {
            ui.showCustomAlert(data.message, "🎉 مبروك!");
            
            if (data.nextFreeSpinTime) {
                gameState.userProfile.nextFreeSpin = data.nextFreeSpinTime;
                try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}
                updateSpinTimerDisplay(data.nextFreeSpinTime);
            }
        });
    } else {
        ui.showCustomAlert(data.message, "عذراً");
    }
});

socket.on('profileUpdated', (profile) => {
    if (!profile) return;
    
    gameState.userProfile = { ...gameState.userProfile, ...profile };
    try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch(e){}
    
    if (typeof window.applyProfileDataToUI === 'function') {
        window.applyProfileDataToUI(gameState.userProfile);
    }
    ui.updateProfileUI();

    if (profile.nextFreeSpin) {
        updateSpinTimerDisplay(profile.nextFreeSpin);
    }
});

// =========================================================================
// 💡 زر الأونلاين ونافذة البحث
// =========================================================================
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

        const mmModal = document.getElementById('matchmaking-modal');
        if (mmModal) {
            mmModal.style.display = 'flex';
            if (!window.modalStack) window.modalStack = [];
            if (!window.modalStack.includes('matchmaking-modal')) {
                window.modalStack.push('matchmaking-modal');
                history.pushState({ modalOpen: 'matchmaking-modal' }, '');
            }
        }
        
        const profile = gameState.userProfile || {};
        const myNameEl = document.getElementById('mm-my-name');
        const myAvatarEl = document.getElementById('mm-my-avatar');
        
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

        const oppNameEl = document.getElementById('mm-opp-name');
        const oppAvatarEl = document.getElementById('mm-opp-avatar');
        const statusLabelEl = document.getElementById('mm-status-label');

        if (oppNameEl) oppNameEl.innerText = t('mm_opp');
        if (statusLabelEl) statusLabelEl.innerText = t('searching');

        if (oppAvatarEl) {
            oppAvatarEl.innerHTML = "❓";
            oppAvatarEl.style.backgroundImage = 'none';
        }

        socket.emit('joinMatchmakingPool', {
            guestId: profile.id,
            name: profile.name,
            avatar: profile.avatar
        });

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
            if (window.modalStack) {
                window.modalStack = window.modalStack.filter(id => id !== 'matchmaking-modal');
            }
        }
        
        if (socket && socket.connected) {
            socket.emit('leaveMatchmakingPool'); 
        }
    });
}

ui.onClick('room-portal-btn', () => { ui.setDisplay('online-modal', 'flex'); ui.setDisplay('online-status-text', 'none'); ui.setDisplay('online-setup-box', 'block'); });
ui.onClick('online-close-btn', () => ui.setDisplay('online-modal', 'none'));

const handleRoomBtn = (action, msg) => { 
    ui.startOnlineGame(); 
    clearInterval(gameState.mmInterval); 
    const rID = ui.getVal('online-room-input').trim(); 
    if (!rID) return socketManager.showStatusMsg(t('err_id')); 
    
    let betAmt = 0;
    const betSelect = document.getElementById('room-bet-input');
    if (betSelect) betAmt = parseInt(betSelect.value) || 0;

    socketManager.handleRoomAction(action, rID, betAmt); 
    socketManager.showStatusMsg(msg); 
};

ui.onClick('online-create-btn', () => handleRoomBtn('createRoom', t('creating_room')));
ui.onClick('online-join-btn', () => handleRoomBtn('joinRoom', t('connecting')));

socket.on('gameStart', (data) => {
    gameState.roomBet = data.roomBet || 0;
});

// =========================================================================
// 🚨 محرك واجهة الرقعة (إصلاح ثغرات State-Driven و Multi-Jump و Anti-Troll)
// =========================================================================

ui.onClick('board', e => {
    if ((gameState.isOnlineMode && gameState.currentTurn !== gameState.myOnlineColor) || (ui.getVal('game-mode') === 'ai' && gameState.currentTurn !== gameState.playerColor && !gameState.onlineRoomID)) return;
    
    const target = e.target;
    const cell = target.classList.contains('cell') ? target : target.parentElement;

    // 1. منطق تحديد القطعة (Piece Selection)
    if (target.classList.contains('piece') && !gameState.isMultiJumping) {
        if (gameState.isOnlineMode && !target.classList.contains(gameState.myOnlineColor)) return;
        if ((gameState.currentTurn === 'white' && !target.classList.contains('white')) || (gameState.currentTurn === 'black' && target.classList.contains('white'))) return;
        
        const r = parseInt(cell.dataset.row), c = parseInt(cell.dataset.col);
        if (gameState.requiredJumps > 0 && gameEngine.findMaxJumps(r, c, gameState.currentTurn, gameState.virtualBoard) < gameState.requiredJumps) return;
        
        if (gameState.selectedPiece) gameState.selectedPiece.classList.remove('selected');
        gameState.selectedPiece = target; 
        gameState.selectedPiece.classList.add('selected');
        
        if (gameState.currentTurn !== gameState.playerColor && !gameState.isOnlineMode) { 
            gameState.opponentStartRow = r; 
            gameState.opponentStartCol = c; 
        }
        ui.showValidMovesHighlights(r, c); 
        return;
    }

    // 2. منطق تنفيذ الحركة (Move Execution)
    if (gameState.selectedPiece && cell.classList.contains('cell') && cell.children.length === 0) {
        const fromRow = parseInt(gameState.selectedPiece.parentElement.dataset.row);
        const fromCol = parseInt(gameState.selectedPiece.parentElement.dataset.col);
        const toRow = parseInt(cell.dataset.row);
        const toCol = parseInt(cell.dataset.col);

        const rDiff = toRow - fromRow;
        const cDiff = toCol - fromCol;
        const isDama = gameState.selectedPiece.classList.contains('dama');
        const pieceColor = gameState.selectedPiece.classList.contains('white') ? 'white' : 'black';

        // تتبع نقطة الانطلاق الأولى للقفزات المتعددة لإرسالها مرة واحدة
        if (gameState.moveSequenceStartR === undefined || gameState.moveSequenceStartR === null) {
            gameState.moveSequenceStartR = fromRow;
            gameState.moveSequenceStartC = fromCol;
        }

        // --- حالة القفز والأكل ---
        if (gameState.requiredJumps > 0) {
            let isValidJump = false, midRow = -1, midCol = -1, currDr = Math.sign(rDiff), currDc = Math.sign(cDiff);
            
            if (isDama) {
                if (!(gameState.isMultiJumping && currDr === -gameState.lastJumpDir.dr && currDc === -gameState.lastJumpDir.dc)) {
                    let jt = gameEngine.getDamaJumpTarget(fromRow, fromCol, toRow, toCol, gameState.currentTurn);
                    if (jt) { isValidJump = true; midRow = jt.row; midCol = jt.col; }
                }
            } else if ((Math.abs(rDiff) === 2 && cDiff === 0) || (rDiff === 0 && Math.abs(cDiff) === 2)) {
                if (rDiff === gameState.pieceDirection[gameState.currentTurn] * 2 || rDiff === 0) {
                    midRow = fromRow + rDiff / 2; 
                    midCol = fromCol + cDiff / 2;
                    let midPiece = gameState.virtualBoard[midRow][midCol];
                    if (midPiece && !midPiece.startsWith(gameState.currentTurn)) isValidJump = true;
                }
            }

            if (isValidJump) {
                let tempBoard = gameState.virtualBoard.map(row => [...row]);
                let movingPieceStr = tempBoard[fromRow][fromCol];

                // ✅ 1. State-Driven Mutation First (تعديل المصفوفة أولاً)
                tempBoard[midRow][midCol] = null; 
                tempBoard[toRow][toCol] = movingPieceStr; 
                tempBoard[fromRow][fromCol] = null;

                if (1 + gameEngine.findMaxJumps(toRow, toCol, gameState.currentTurn, tempBoard, currDr, currDc) === gameState.requiredJumps - gameState.jumpsCount) {
                    
                    if (typeof ui.playSound === 'function') {
                        ui.playSound(gameState.virtualBoard[midRow][midCol]?.includes('dama') ? ui.sfx.kingDied : ui.sfx.piecesDied);
                    }
                    
                    gameState.virtualBoard = tempBoard; 
                    gameState.jumpsCount++; 
                    gameState.lastJumpDir = { dr: currDr, dc: currDc };

                    let isFinalJump = (gameState.jumpsCount === gameState.requiredJumps);

                    if (isFinalJump) {
                        // ترقية القطعة
                        let promoRow = gameState.pieceDirection[pieceColor] === 1 ? 7 : 0;
                        if (toRow === promoRow && !movingPieceStr.includes('dama')) { 
                            gameState.virtualBoard[toRow][toCol] += '-dama'; 
                            if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.kingCreated); 
                        }
                        
                        // 💡 تحديث ذاكرة المماطلة والتعادل للحفاظ على التزامن مع السيرفر
                        gameState.movesWithoutProgress = 0;
                        gameState.boardHistoryStr = [];

                        ui.highlightMove({r: gameState.moveSequenceStartR, c: gameState.moveSequenceStartC}, {r: toRow, c: toCol});
                        
                        gameState.selectedPiece = null; 
                        ui.clearHighlights();
                        gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
                        
                        // ✅ 2. رسم الواجهة بالكامل من المصفوفة المحدثة
                        ui.renderBoard(true);

                        // ✅ 3. إرسال الحركة دفعة واحدة (بدون إرسال الرقعة للأمان)
                        socketManager.sendMoveToServer(
                            gameState.moveSequenceStartR, gameState.moveSequenceStartC, 
                            toRow, toCol, 
                            null, 
                            gameState.currentTurn
                        ); 
                        
                        saveGameState(); 
                        ui.startTurn();

                        // تصفير تتبع المسار
                        gameState.moveSequenceStartR = null;
                        gameState.moveSequenceStartC = null;
                    } else { 
                        // أثناء القفز المتعدد
                        gameState.isMultiJumping = true; 
                        
                        // ✅ رسم الواجهة لتعكس مكان القطعة المؤقت
                        ui.renderBoard(true);

                        // إعادة تحديد القطعة بعد رسمها
                        const boardEl = document.getElementById('board');
                        const newCell = boardEl.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
                        if (newCell && newCell.children.length > 0) {
                            gameState.selectedPiece = newCell.children[0];
                            gameState.selectedPiece.classList.add('selected');
                        }

                        // ⛔ لا يتم إرسال الحركة للسيرفر هنا (Fixing Multi-Jump Desync)

                        if (!gameState.isOnlineMode) {
                            if (!gameState.boardHistory) gameState.boardHistory = [];
                            gameState.boardHistory.push({
                                board: JSON.parse(JSON.stringify(gameState.virtualBoard)),
                                turn: gameState.currentTurn
                            });
                        }

                        ui.showValidMovesHighlights(toRow, toCol); 
                    }
                } else {
                    ui.showCustomAlert(t('must_capture'));
                }
            }
        } 
        // --- حالة الحركة العادية (بدون أكل) ---
        else {
            if ((isDama && gameEngine.isValidDamaMove(fromRow, fromCol, toRow, toCol)) || (!isDama && ((Math.abs(rDiff) === 1 && cDiff === 0 && (rDiff === gameState.pieceDirection[gameState.currentTurn])) || (rDiff === 0 && Math.abs(cDiff) === 1)))) {
                
                let movingPieceStr = gameState.virtualBoard[fromRow][fromCol];

                // ✅ 1. State-Driven Mutation First
                gameState.virtualBoard[fromRow][fromCol] = null;
                gameState.virtualBoard[toRow][toCol] = movingPieceStr;
                
                let promoRow = gameState.pieceDirection[pieceColor] === 1 ? 7 : 0;
                let isPromotion = false;
                
                if (toRow === promoRow && !movingPieceStr.includes('dama')) { 
                    gameState.virtualBoard[toRow][toCol] += '-dama'; 
                    isPromotion = true;
                    if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.kingCreated); 
                }
                
                // 💡 تحديث ذاكرة المماطلة والتعادل للحفاظ على التزامن مع السيرفر
                if (isPromotion) {
                    gameState.movesWithoutProgress = 0;
                    gameState.boardHistoryStr = [];
                } else {
                    gameState.movesWithoutProgress++;
                    gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard));
                }
                
                if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.move); 
                
                ui.highlightMove({r: fromRow, c: fromCol}, {r: toRow, c: toCol});
                
                gameState.selectedPiece = null; 
                ui.clearHighlights();
                gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
                
                // ✅ 2. رسم الواجهة
                ui.renderBoard(true);

                // ✅ 3. إرسال الإحداثيات فقط
                socketManager.sendMoveToServer(
                    fromRow, fromCol, 
                    toRow, toCol, 
                    null, 
                    gameState.currentTurn
                ); 
                
                saveGameState(); 
                ui.startTurn();

                gameState.moveSequenceStartR = null;
                gameState.moveSequenceStartC = null;
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let globalProfile = localStorage.getItem('hub_user_profile');
    let initialAvatar = '1000132081.png';
    if (globalProfile) {
        const parsed = JSON.parse(globalProfile);
        if (parsed.avatar) initialAvatar = parsed.avatar;
    }

    const storedUser = localStorage.getItem('hub_user_profile');
    if (storedUser) {
        let userObj = JSON.parse(storedUser);
        userObj.avatar = initialAvatar;
        if (typeof window.applyProfileDataToUI === 'function') {
            window.applyProfileDataToUI(userObj);
        }
    } else {
        let defaultProfile = { id: '#00000', name: t('badge_you'), avatar: initialAvatar, games: 0, wins: 0, losses: 0, tokens: 0, discountTicket: 0 };
        if (typeof window.applyProfileDataToUI === 'function') {
            window.applyProfileDataToUI(defaultProfile);
        }
    }
});
