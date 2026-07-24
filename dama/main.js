// main.js
import { ui } from './uiController.js';
import { socket, socketManager } from './socketManager.js'; 
import { gameEngine } from './gameEngine.js'; 

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
    // 💡 تم التعديل: الاعتماد على لغة المنصة المحفوظة بدل إجبار اللغة الإنجليزية 'en'
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
    virtualBoard: Array(8).fill(null).map(() => Array(8).fill(null)),
    
    userProfile: (() => {
        const stored = localStorage.getItem('hub_user_profile');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) { console.error("Error parsing profile:", e); }
        }
        return { id: "", name: "", avatar: "1000132081.png", isCustomAvatar: false, gamesPlayed: 0, wins: 0, losses: 0, friends: [] };
    })()
};

window.gameState = gameState; 
setTimeout(() => { gameState.blockGameOverModal = false; }, 1000);

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
        
        // 💡 تم التعليق على هذا السطر لمنع ملف الحفظ القديم من تجاوز لغة i18n.js
        // gameState.lang = state.lang;
        
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
        ui.showCustomAlert(gameState.lang === 'ar' ? "النظام غير متصل حالياً، أو قيد التحديث." : "System is currently offline or updating.");
    }
};

ui.onClick('diff-quick-select', saveGameState);

// 👇 تم تنظيف أوامر reset-btn و resign-btn وغيرها التي كانت تسبب التضارب مع ملف uiController 👇

ui.onClick('start-white-btn', () => { gameState.playerColor = 'white'; localStorage.removeItem('dama_saved_game'); ui.initBoard(); ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('start-black-btn', () => { gameState.playerColor = 'black'; localStorage.removeItem('dama_saved_game'); ui.initBoard(); ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('new-game-modal', e => { if (e.target.id === 'new-game-modal') ui.setDisplay('new-game-modal', 'none'); });
ui.onClick('cancel-new-game-btn', () => ui.setDisplay('new-game-modal', 'none'));

ui.onClick('settings-btn', e => { e.stopPropagation(); ui.setDisplay('settings-overlay', 'flex'); });
ui.onClick('save-settings-btn', () => { saveGameState(); ui.setDisplay('settings-overlay', 'none'); });
ui.onClick('settings-overlay', e => { if (e.target.id === 'settings-overlay') ui.setDisplay('settings-overlay', 'none'); });

ui.onClick('lang-select-modal', e => { gameState.lang = e.target.value; ui.updateTexts(); saveGameState(); });

ui.onClick('login-guest-btn', () => { gameState.userProfile = { ...gameState.userProfile, name: (gameState.lang==='en'?"Guest_":"زائر_") + (10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000)), id: "GUEST-" + (10000 + ([...gameState.deviceFingerprint].reduce((a, c) => a + c.charCodeAt(0), 0) % 90000)), avatar: ui.getVal('login-avatar-select', '1000132081.png'), isCustomAvatar: false }; localStorage.setItem('dama_guest_expiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); ui.updateProfileUI(); ui.setDisplay('login-modal', 'none'); });

ui.onClick('login-submit-btn', () => { 
    let name = ui.getVal('login-name-input').trim(); 
    if (!name) return ui.showCustomAlert(gameState.lang === 'en' ? "Enter a name!" : "أدخل الاسم!"); 
    // تعقيم المدخلات لمنع XSS
    name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    gameState.userProfile = { ...gameState.userProfile, name, id: "DAMA-" + Math.random().toString(36).substring(2, 8).toUpperCase(), avatar: gameState.userProfile.isCustomAvatar ? gameState.userProfile.avatar : ui.getVal('login-avatar-select', '1000132081.png') }; localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); localStorage.removeItem('dama_guest_expiry'); ui.updateProfileUI(); ui.setDisplay('login-modal', 'none'); 
});

ui.onClick('add-friend-btn', () => { let fId = ui.getVal('friend-id-input').trim().toUpperCase(); if (!fId || fId === gameState.userProfile.id || gameState.userProfile.friends.includes(fId)) return ui.showCustomAlert(gameState.lang === 'en' ? "Invalid ID" : "معرف غير صالح"); gameState.userProfile.friends.push(fId); localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); ui.updateProfileUI(); document.getElementById('friend-id-input').value = ''; ui.showCustomAlert(gameState.lang === 'en' ? "Added!" : "تمت الإضافة!"); });

document.getElementById('avatar-upload-input')?.addEventListener('change', e => { 
    const file = e.target.files[0]; 
    if (!file || !file.type.startsWith('image/') || file.size > 800 * 1024) return ui.showCustomAlert(gameState.lang === 'en' ? "Image too large (Max 800KB)." : "حجم الصورة كبير جداً (الأقصى 800KB)."); 
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
    const msgAr = isGuest 
        ? "⚠️ تحذير خطير: أنت تلعب كزائر!\nإذا قمت بتسجيل الخروج الآن، ستفقد كل أموالك، مشترياتك، وتقدمك نهائياً ولن تتمكن من استعادتها أبداً. هل أنت متأكد حقاً؟" 
        : "هل أنت متأكد من تسجيل الخروج؟";
    const msgEn = isGuest 
        ? "⚠️ CRITICAL WARNING: You are a Guest!\nLogging out will permanently delete all your tokens, items, and progress. Are you absolutely sure?" 
        : "Are you sure you want to log out?";
        
    ui.showCustomAlert(gameState.lang === 'ar' ? msgAr : msgEn, null, () => { 
            localStorage.removeItem('hub_user_profile'); 
            localStorage.removeItem('dama_guest_expiry'); 
            gameState.userProfile = { id: "", name: "", avatar: "1000132081.png", isCustomAvatar: false, gamesPlayed: 0, wins: 0, losses: 0, friends: [] }; 
            ui.setDisplay('profile-modal', 'none'); 
            ui.setDisplay('login-modal', 'flex'); 
            if (typeof window.applyProfileDataToUI === 'function') window.applyProfileDataToUI(gameState.userProfile);
        }, true);
});

ui.onClick('switch-account-btn', () => { ui.setDisplay('profile-modal', 'none'); ui.setDisplay('login-modal', 'flex'); });
ui.onClick('online-toggle-btn', () => gameState.isOnlineMode ? ui.showCustomAlert(gameState.lang==='ar'?"أنت في مباراة!":"In a match!") : ui.startMatchmakingQueue());
ui.onClick('room-portal-btn', () => { ui.setDisplay('online-modal', 'flex'); ui.setDisplay('online-status-text', 'none'); ui.setDisplay('online-setup-box', 'block'); });
ui.onClick('online-close-btn', () => ui.setDisplay('online-modal', 'none'));

ui.onClick('mm-cancel-btn', () => { 
    clearInterval(gameState.mmInterval); 
    gameState.mmInterval = null; 
    ui.setDisplay('matchmaking-modal', 'none'); 
    if (socket && socket.connected) socket.emit('leaveMatchmakingPool'); 
});

const handleRoomBtn = (action, msg) => { ui.startOnlineGame(); clearInterval(gameState.mmInterval); const rID = ui.getVal('online-room-input').trim(); if (!rID) return socketManager.showStatusMsg(gameState.lang === 'ar' ? "❌ اكتب الرقم أولاً" : "❌ Enter ID first"); socketManager.handleRoomAction(action, rID); socketManager.showStatusMsg(msg); };
ui.onClick('online-create-btn', () => handleRoomBtn('createRoom', gameState.lang === 'ar' ? "جاري إنشاء الغرفة..." : "Creating..."));
ui.onClick('online-join-btn', () => handleRoomBtn('joinRoom', gameState.lang === 'ar' ? "جاري الاتصال..." : "Connecting..."));

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
                        ui.updateVirtualBoardState(); socketManager.sendMoveToServer(fromRow, fromCol, toRow, toCol, gameState.virtualBoard, gameState.currentTurn);
                        ui.showValidMovesHighlights(toRow, toCol); 
                    }
                } else ui.showCustomAlert(gameState.lang === 'ar' ? "يجب أسر أكبر عدد ممكن." : "Must capture max pieces.");
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
        let defaultProfile = { id: '#00000', name: 'اسم اللاعب', avatar: initialAvatar, games: 0, wins: 0, losses: 0, tokens: 0 };
        if (typeof window.applyProfileDataToUI === 'function') {
            window.applyProfileDataToUI(defaultProfile);
        }
    }
});
