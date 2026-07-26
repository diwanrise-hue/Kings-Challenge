// main.js
import { ui } from './uiController.js';
import { socket, socketManager } from './socketManager.js'; 
import { gameEngine } from './gameEngine.js'; 
import { t } from './i18n.js';

window.socket = socket; 

export const gameState = {
    deviceFingerprint: localStorage.getItem('dama_device_fingerprint') || (() => {
        const fp = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('dama_device_fingerprint', fp);
        return fp;
    })(),
    botMoveCount: 0,
    isBotOpponent: false,
    isOnlineMode: false,
    onlineRoomID: "",
    myOnlineColor: "",
    currentOpponentName: "",
    currentOpponentAvatar: "❓",
    turnTimerInterval: null,
    turnTimeLeft: 45,
    selectedPiece: null,
    currentTurn: 'white',
    isMultiJumping: false,
    requiredJumps: 0,
    jumpsCount: 0,
    playerColor: 'white',
    lang: localStorage.getItem('app_lang') || localStorage.getItem('appLang') || 'ar',
    lastJumpDir: { dr: null, dc: null },
    opponentStartRow: null,
    opponentStartCol: null,
    aiTimeout: null,
    mmInterval: null,
    mmTimeLeft: 0,
    onlineFlip: false,
    pieceDirection: { white: -1, black: 1 },
    blockGameOverModal: true,
    originalHints: null, // 💡 الخزنة السرية: لحفظ رصيد المصابيح الحقيقي للاعب أثناء الأونلاين
    virtualBoard: Array(8).fill(null).map(() => Array(8).fill(null)),
    
    userProfile: (() => {
        const stored = localStorage.getItem('hub_user_profile');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) { console.error("Error parsing profile:", e); }
        }
        return { id: "", name: "", avatar: "1000132081.png", isCustomAvatar: false, gamesPlayed: 0, wins: 0, losses: 0, friends: [], hints: 5 };
    })()
};

window.gameState = gameState; 
setTimeout(() => { gameState.blockGameOverModal = false; }, 1000);

// ==========================================
// 💡 دوال نظام إدارة المصابيح الذكي في الأونلاين
// ==========================================
export function startOnlineHintSystem() {
    if (gameState.originalHints === null) {
        // حفظ الرصيد الحقيقي في الخزنة
        gameState.originalHints = gameState.userProfile.hints !== undefined ? gameState.userProfile.hints : 5;
    }
    // منح اللاعب مصباحين فقط في الأونلاين
    gameState.userProfile.hints = 2; 
    ui.updateProfileUI();
}

export function restoreOfflineHintSystem() {
    if (gameState.originalHints !== null) {
        // استعادة الرصيد الحقيقي من الخزنة
        gameState.userProfile.hints = gameState.originalHints; 
        gameState.originalHints = null;
        // حفظ الرصيد الحقيقي في المتصفح فوراً لحمايته
        localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
        ui.updateProfileUI();
    }
}
// ==========================================

export function saveGameState() {
    if (gameState.isOnlineMode) return;
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
    
    // التحميل الأول: إذا لم تكن هناك لعبة محفوظة سيتم تهيئة لوحة فارغة
    if (!loadGameState()) {
        ui.drawEmptyBoard();
    } else {
        // التأكد من استعادة حالة الأزرار بعد التحميل بنجاح
        if (gameState.virtualBoard.some(r => r.some(c => c !== null))) {
            window.isMatchRunning = true;
            ui.toggleOfflineInMatchUI(true);
        }
        ui.renderBoard();
        ui.updateTexts();
        ui.startTurn();
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

ui.onClick('login-guest-btn', () => { gameState.userProfile = { ...gameState.userProfile, name: t('guest_prefix') + (10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000)), id: "GUEST-" + (10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000)), avatar: ui.getVal('login-avatar-select', '1000132081.png'), isCustomAvatar: false }; localStorage.setItem('dama_guest_expiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); ui.updateProfileUI(); ui.setDisplay('login-modal', 'none'); });

ui.onClick('login-submit-btn', () => { 
    let name = ui.getVal('login-name-input').trim(); 
    if (!name) return ui.showCustomAlert(t('enter_name')); 
    // تعقيم المدخلات لمنع XSS
    name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    gameState.userProfile = { ...gameState.userProfile, name, id: "DAMA-" + Math.random().toString(36).substring(2, 8).toUpperCase(), avatar: gameState.userProfile.isCustomAvatar ? gameState.userProfile.avatar : ui.getVal('login-avatar-select', '1000132081.png') }; localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); localStorage.removeItem('dama_guest_expiry'); ui.updateProfileUI(); ui.setDisplay('login-modal', 'none'); 
});

ui.onClick('add-friend-btn', () => { let fId = ui.getVal('friend-id-input').trim().toUpperCase(); if (!fId || fId === gameState.userProfile.id || gameState.userProfile.friends.includes(fId)) return ui.showCustomAlert(t('invalid_id')); gameState.userProfile.friends.push(fId); localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); ui.updateProfileUI(); document.getElementById('friend-id-input').value = ''; ui.showCustomAlert(t('added_success')); });

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
            gameState.originalHints = null; // تصفير الخزنة لضمان الأمان
            localStorage.removeItem('hub_user_profile'); 
            localStorage.removeItem('dama_guest_expiry'); 
            gameState.userProfile = { id: "", name: "", avatar: "1000132081.png", isCustomAvatar: false, gamesPlayed: 0, wins: 0, losses: 0, friends: [] }; 
            ui.setDisplay('profile-modal', 'none'); 
            ui.setDisplay('login-modal', 'flex'); 
            if (typeof window.applyProfileDataToUI === 'function') window.applyProfileDataToUI(gameState.userProfile);
        }, true);
});

ui.onClick('switch-account-btn', () => { ui.setDisplay('profile-modal', 'none'); ui.setDisplay('login-modal', 'flex'); });

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

        // إظهار نافذة البحث بشكل إجباري ومباشر
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

        // 💡 الإصلاح هنا: فصل اسم الخصم عن النص التحتي لمنع اقتطاع الكلمات
        const oppNameEl = document.getElementById('mm-opp-name');
        const oppAvatarEl = document.getElementById('mm-opp-avatar');
        const statusLabelEl = document.getElementById('mm-status-label');

        if (oppNameEl) oppNameEl.innerText = t('mm_opp');
        if (statusLabelEl) statusLabelEl.innerText = t('searching');

        if (oppAvatarEl) {
            oppAvatarEl.innerHTML = "❓";
            oppAvatarEl.style.backgroundImage = 'none';
        }

        // إرسال البيانات للسيرفر
        socket.emit('joinMatchmakingPool', {
            guestId: profile.id,
            name: profile.name,
            avatar: profile.avatar
        });

        // تشغيل العداد الزمني للبحث
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

// زر إلغاء البحث
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
// =========================================================================

ui.onClick('room-portal-btn', () => { ui.setDisplay('online-modal', 'flex'); ui.setDisplay('online-status-text', 'none'); ui.setDisplay('online-setup-box', 'block'); });
ui.onClick('online-close-btn', () => ui.setDisplay('online-modal', 'none'));

const handleRoomBtn = (action, msg) => { ui.startOnlineGame(); clearInterval(gameState.mmInterval); const rID = ui.getVal('online-room-input').trim(); if (!rID) return socketManager.showStatusMsg(t('err_id')); socketManager.handleRoomAction(action, rID); socketManager.showStatusMsg(msg); };
ui.onClick('online-create-btn', () => handleRoomBtn('createRoom', t('creating_room')));
ui.onClick('online-join-btn', () => handleRoomBtn('joinRoom', t('connecting')));

ui.onClick('board', e => {
    if ((gameState.isOnlineMode && gameState.currentTurn !== gameState.myOnlineColor) || (ui.getVal('game-mode') === 'ai' && gameState.currentTurn !== gameState.playerColor && !gameState.onlineRoomID)) return;
    const target = e.target;

    if (target.classList.contains('piece') && !gameState.isMultiJumping) {
        if (gameState.isOnlineMode && !target.classList.contains(gameState.myOnlineColor)) return;
        if ((gameState.currentTurn === 'white' && !target.classList.contains('white')) || (gameState.currentTurn === 'black' && target.classList.contains('white'))) return;
        const r = parseInt(target.parentElement.dataset.row), c = parseInt(target.parentElement.dataset.col);
        if (gameState.requiredJumps > 0 && gameEngine.findMaxJumps(r, c, gameState.currentTurn, gameState.virtualBoard) < gameState.requiredJumps) return;
        
        if (gameState.selectedPiece) gameState.selectedPiece.classList.remove('selected');
        gameState.selectedPiece = target; gameState.selectedPiece.classList.add('selected');
        if (gameState.currentTurn !== gameState.playerColor && !gameState.isOnlineMode) { gameState.opponentStartRow = r; gameState.opponentStartCol = c; }
        ui.showValidMovesHighlights(r, c); return;
    }

    if (gameState.selectedPiece && target.classList.contains('cell') && target.children.length === 0) {
        const fromRow = parseInt(gameState.selectedPiece.parentElement.dataset.row), fromCol = parseInt(gameState.selectedPiece.parentElement.dataset.col);
        const toRow = parseInt(target.dataset.row), toCol = parseInt(target.dataset.col);
        const rDiff = toRow - fromRow, cDiff = toCol - fromCol, isDama = gameState.selectedPiece.classList.contains('dama');

        if (gameState.requiredJumps > 0) {
            let isValidJump = false, midRow = -1, midCol = -1, currDr = Math.sign(rDiff), currDc = Math.sign(cDiff);
            if (isDama) {
                if (!(gameState.isMultiJumping && currDr === -gameState.lastJumpDir.dr && currDc === -gameState.lastJumpDir.dc)) {
                    let jt = gameEngine.getDamaJumpTarget(fromRow, fromCol, toRow, toCol, gameState.currentTurn);
                    if (jt) { isValidJump = true; midRow = jt.row; midCol = jt.col; }
                }
            } else if ((Math.abs(rDiff) === 2 && cDiff === 0) || (rDiff === 0 && Math.abs(cDiff) === 2)) {
                if (rDiff === gameState.pieceDirection[gameState.currentTurn] * 2 || rDiff === 0) {
                    midRow = fromRow + rDiff / 2; midCol = fromCol + cDiff / 2;
                    let mc = ui.getEl('board').querySelector(`[data-row="${midRow}"][data-col="${midCol}"]`);
                    if (mc && mc.children.length > 0 && !mc.children[0].classList.contains(gameState.currentTurn)) isValidJump = true;
                }
            }
            if (isValidJump) {
                let tempBoard = gameState.virtualBoard.map(row => [...row]);
                tempBoard[midRow][midCol] = null; tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol]; tempBoard[fromRow][fromCol] = null;
                if (1 + gameEngine.findMaxJumps(toRow, toCol, gameState.currentTurn, tempBoard, currDr, currDc) === gameState.requiredJumps - gameState.jumpsCount) {
                    if (typeof ui.playSound === 'function') {
                        ui.playSound(gameState.virtualBoard[midRow][midCol]?.includes('dama') ? ui.sfx.kingDied : ui.sfx.piecesDied);
                    }
                    ui.getEl('board').querySelector(`[data-row="${midRow}"][data-col="${midCol}"]`)?.replaceChildren();
                    target.appendChild(gameState.selectedPiece); 
                    if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.move);
                    
                    gameState.virtualBoard = tempBoard; gameState.jumpsCount++; gameState.lastJumpDir = { dr: currDr, dc: currDc };
                    if (gameState.jumpsCount === gameState.requiredJumps) {
                        let promoRow = gameState.pieceDirection[gameState.selectedPiece.classList.contains('white') ? 'white' : 'black'] === 1 ? 7 : 0;
                        if (toRow === promoRow && !gameState.selectedPiece.classList.contains('dama')) { gameState.selectedPiece.classList.add('dama'); if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.kingCreated); }
                        
                        ui.highlightMove({r: fromRow, c: fromCol}, {r: toRow, c: toCol});
                        
                        gameState.selectedPiece.classList.remove('selected'); gameState.selectedPiece = null; ui.clearHighlights();
                        gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
                        ui.updateVirtualBoardState(); socketManager.sendMoveToServer(fromRow, fromCol, toRow, toCol, gameState.virtualBoard, gameState.currentTurn); saveGameState(); ui.startTurn();
                    } else { 
                        gameState.isMultiJumping = true; document.querySelectorAll('.piece.forced').forEach(p => p.classList.remove('forced')); 
                        ui.updateVirtualBoardState(); 

                        // 💡 الإضافة الجديدة: حفظ حالة الرقعة في السجل بعد كل قفزة فرعية لضمان عمل زر "تراجع" بكفاءة
                        if (!gameState.isOnlineMode) {
                            if (!gameState.boardHistory) gameState.boardHistory = [];
                            gameState.boardHistory.push({
                                board: JSON.parse(JSON.stringify(gameState.virtualBoard)),
                                turn: gameState.currentTurn
                            });
                        }

                        socketManager.sendMoveToServer(fromRow, fromCol, toRow, toCol, gameState.virtualBoard, gameState.currentTurn);
                        ui.showValidMovesHighlights(toRow, toCol); 
                    }
                } else ui.showCustomAlert(t('must_capture'));
            }
        } else {
            if ((isDama && gameEngine.isValidDamaMove(fromRow, fromCol, toRow, toCol)) || (!isDama && ((Math.abs(rDiff) === 1 && cDiff === 0 && (rDiff === gameState.pieceDirection[gameState.currentTurn])) || (rDiff === 0 && Math.abs(cDiff) === 1)))) {
                target.appendChild(gameState.selectedPiece); 
                let promoRow = gameState.pieceDirection[gameState.selectedPiece.classList.contains('white') ? 'white' : 'black'] === 1 ? 7 : 0;
                if (toRow === promoRow && !gameState.selectedPiece.classList.contains('dama')) { gameState.selectedPiece.classList.add('dama'); if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.kingCreated); }
                if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.move); ui.updateVirtualBoardState();
                
                ui.highlightMove({r: fromRow, c: fromCol}, {r: toRow, c: toCol});
                
                gameState.selectedPiece.classList.remove('selected'); gameState.selectedPiece = null; ui.clearHighlights();
                gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
                socketManager.sendMoveToServer(fromRow, fromCol, toRow, toCol, gameState.virtualBoard, gameState.currentTurn); saveGameState(); ui.startTurn();
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
        let defaultProfile = { id: '#00000', name: t('badge_you'), avatar: initialAvatar, games: 0, wins: 0, losses: 0, tokens: 0 };
        if (typeof window.applyProfileDataToUI === 'function') {
            window.applyProfileDataToUI(defaultProfile);
        }
    }
});
