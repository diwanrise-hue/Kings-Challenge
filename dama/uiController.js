// uiController.js
import { gameState, saveGameState } from './main.js';
import { gameEngine } from './gameEngine.js';
import { gameAI } from './gameAI.js';
import { socket, socketManager } from './socketManager.js';
import { translations, t } from './i18n.js';

export const sfx = {
    move: new Audio('move.mp3'),
    piecesDied: new Audio('pieces_died.mp3'),
    kingDied: new Audio('king_died.mp3'),
    kingCreated: new Audio('king_created.mp3'),
    win: new Audio('win.mp3'),
    clock: new Audio('clock.mp3')
};

// ==========================================
// 🧠 مدير الـ Web Worker للذكاء الاصطناعي
// ==========================================
let aiSharedWorker = null;
function getAiWorker() {
    if (window.Worker) {
        if (!aiSharedWorker) {
            aiSharedWorker = new Worker('aiWorker.js');
        }
        return aiSharedWorker;
    }
    return null;
}

export const ui = {
    sfx: sfx,
    clickHandlers: new Map(), 

    translate(arTxt, enTxt) {
        return gameState.lang === 'ar' ? arTxt : enTxt;
    },

    getEl: id => document.getElementById(id),
    
    setTxt(id, txt) {
        const el = this.getEl(id);
        if (el) el.textContent = txt;
    },
    
    setDisplay(id, displayState) {
        const el = this.getEl(id);
        if (el) el.style.display = displayState;
    },
    
    onClick(id, fn) {
        this.clickHandlers.set(id, fn);
    },
    
    playSound(audio) {
        if (!audio) return;
        audio.currentTime = 0;
        let playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                // تجاهل الخطأ بصمت إذا منع المتصفح التشغيل التلقائي للصوت
            });
        }
    },
    
    getVal(id, defaultValue = "") {
        const el = this.getEl(id);
        return el ? el.value : defaultValue;
    },
    
    makeEl(tag, className, cssText, textContent) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (cssText) el.style.cssText = cssText;
        if (textContent) el.textContent = textContent;
        return el;
    },

    applyAvatar(elId, avatarStr, isCustom = false) {
        const el = typeof elId === 'string' ? this.getEl(elId) : elId;
        if (!el) return;
        
        el.style.backgroundImage = 'none';
        el.innerHTML = '';
        el.style.border = '1px solid rgba(255,255,255,0.1)';
        
        if (avatarStr === "AI_BOT") {
            el.classList.add('modern-bot-avatar');
            el.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                    <circle cx="12" cy="5" r="2"></circle>
                    <path d="M12 7v4"></path>
                    <line x1="8" y1="16" x2="8" y2="16.01"></line>
                    <line x1="16" y1="16" x2="16" y2="16.01"></line>
                    <path d="M2 14h1"></path>
                    <path d="M21 14h1"></path>
                </svg>
            `;
            return;
        }

        const isImage = avatarStr && (avatarStr.startsWith('data:image') || avatarStr.endsWith('.png') || avatarStr.endsWith('.jpg') || avatarStr.endsWith('.webp'));

        if (isImage || isCustom) {
            const img = document.createElement('img');
            img.src = avatarStr;
            img.style.cssText = "width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;";
            el.appendChild(img);
        } else {
            el.textContent = avatarStr || "❓";
        }
    },

    updateTexts() {
        const currentLang = window.currentLang || gameState.lang || 'ar';
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        
        const setHtml = (id, txt) => { const e = this.getEl(id); if (e) e.innerText = txt || ""; };
        const setPlaceholder = (id, txt) => { const e = this.getEl(id); if (e) e.placeholder = txt || ""; };
        
        const tObj = translations[currentLang] || translations.ar;
        
        const idToKeyMap = {
            'main-title': 'app_title', 'set-title': 'set_title', 
            'save-settings-btn': 'save_settings_btn', 'lang-label': 'langLabel', 
            'new-game-title': 'new_game_title', 'choose-color-label': 'new_game_color', 
            'cancel-new-game-btn': 'btn_cancel', 'sfx-lbl': 'sfx_lbl', 
            'online-create-btn': 'online_create', 'online-join-btn': 'online_join', 
            'mm-cancel-btn': 'mm_cancel', 'close-modal-btn': 'btn_close', 
            'add-friend-label': 'addFriendLabel', 'matchmaking-title': 'mm_title', 'create-room-title': 'online_title', 
            'room-id-label': 'online_id', 'add-friend-btn': 'addFriend', 
            'igp-title': 'igp_title', 'igp-lbl-games': 'igp_games', 'igp-lbl-wins': 'igp_wins', 'igp-lbl-losses': 'igp_losses',
            'store-title': 'store_title', 'store-desc': 'store_desc',
            'store-btn-tab-bg': 'tab_bg', 'store-btn-tab-frames': 'tab_frames', 'store-btn-tab-pieces': 'tab_pieces', 'store-btn-tab-offers': 'tab_offers',
            'themes-grid-title': 'theme_title', 
            'theme-btn-tab-bg': 'theme_bg', 'theme-btn-tab-frames': 'theme_frames', 'theme-btn-tab-pieces': 'theme_pieces',
            'custom-alert-title': 'alert_title', 'custom-alert-ok': 'alert_ok',
            'game-over-title': 'go_title', 'rematch-btn': 'go_rematch',
            'room-password-label': 'online_pass', 'mm-opp-name': 'mm_opp', 'mm-status-label': 'mm_status',
            'igp-lbl-friends': 'igp_friends', 'igp-friends-list': 'igp_no_friends',
            'lbl-add-friend-title': 'addFriendLabel', 'theme-bg-0': 'theme_bg_0', 'theme-pc-0': 'theme_pc_0',
            'card-my-name': 'badge_you', 'badge-username-display-game': 'badge_you'
        };
        
        Object.keys(idToKeyMap).forEach(id => setHtml(id, tObj[idToKeyMap[id]] || idToKeyMap[id]));
        
        setHtml('exit-game-btn', this.translate("الخروج", "Exit"));
        setHtml('store-return-btn', this.translate("الخروج", "Exit"));
        setHtml('theme-close-btn', this.translate("الخروج", "Exit"));
        
        setHtml('online-close-btn', this.translate("إلغاء", "Cancel"));
        setHtml('custom-alert-cancel', this.translate("إلغاء", "Cancel"));
        
        setHtml('reset-btn', this.translate("(ابداء)", "(Start)"));

        const resignBtn = this.getEl('resign-btn');
        if (resignBtn) {
            resignBtn.title = this.translate("الانسحاب", "Resign");
            resignBtn.innerText = this.translate("الانسحاب", "Resign");
        }

        const placeholders = {
            'online-room-input': tObj.ph_room || '',
            'online-password-input': tObj.ph_pass || '',
            'friend-id-input': tObj.add_friend_placeholder || ''
        };
        Object.keys(placeholders).forEach(id => setPlaceholder(id, placeholders[id]));
        
        if (window.updateInventoryUI) window.updateInventoryUI();
            
        const onlineBtnText = document.querySelector('#online-toggle-btn span:last-child');
        if (onlineBtnText) onlineBtnText.innerText = tObj.online_btn || this.translate("اونلاين", "Online");

        const turnInd = this.getEl('turn-indicator');
        if(turnInd) {
            if(turnInd.innerText.includes('Your') || turnInd.innerText.includes('دورك')) turnInd.innerText = tObj.turn_yours;
            else if(turnInd.innerText.includes('Opponent') || turnInd.innerText.includes('خصم')) turnInd.innerText = tObj.turn_opps;
        }

        this.updateProfileUI();
        this.startTurn();
    },

    showCustomAlert(message, title = null, onConfirm = null, showCancel = false, customCancelText = null, customOkText = null) {
        title = title || this.translate("تنبيه", "Alert");
        
        this.setTxt('custom-alert-message', message);
        this.setTxt('custom-alert-title', title);
        this.setTxt('custom-alert-ok', customOkText || this.translate("حسناً", "OK"));
        this.setTxt('custom-alert-cancel', customCancelText || this.translate("إلغاء", "Cancel"));
        
        const okBtn = this.getEl('custom-alert-ok');
        if (okBtn) okBtn.style.display = 'inline-block'; 
        
        const modalEl = this.getEl('custom-alert-modal');
        if (modalEl) modalEl.style.setProperty('z-index', '9999999', 'important');

        if (typeof window.openAppModal === 'function') {
            window.openAppModal('custom-alert-modal');
        } else {
            this.setDisplay('custom-alert-modal', 'flex');
        }
        
        this.setDisplay('custom-alert-cancel', showCancel ? 'block' : 'none');
        
        this.clickHandlers.set('custom-alert-ok', () => {
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');
            else this.setDisplay('custom-alert-modal', 'none'); 
            
            if (onConfirm) {
                try { onConfirm(); } catch(err) { console.error("Error executing confirm action:", err); }
            }
        });

        this.clickHandlers.set('custom-alert-cancel', () => {
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');
            else this.setDisplay('custom-alert-modal', 'none');
        });
    },

    animateMatchFound(oppName, oppAvatar, onComplete) {
        this.setTxt('mm-opp-name', oppName);
        this.applyAvatar('mm-opp-avatar', oppAvatar, oppAvatar?.startsWith('data:image'));
        this.setTxt('mm-status-label', this.translate("تم إيجاد الخصم! جاري التجهيز...", "Opponent Found! Preparing..."));
        
        const cancelBtn = this.getEl('mm-cancel-btn');
        if(cancelBtn) cancelBtn.style.display = 'none';

        const oppContainer = this.getEl('mm-opp-avatar')?.parentElement;
        if(oppContainer) {
            oppContainer.style.animation = "forcedPulse 1s infinite";
        }

        setTimeout(() => {
            if(oppContainer) oppContainer.style.animation = "";
            if(cancelBtn) cancelBtn.style.display = 'block';
            if(onComplete) onComplete();
        }, 3000);
    },

    toggleOnlineUILayout(active, oppName = "", oppAvatar = "❓") {
        const normalState = active ? 'none' : 'inline-block';
        const onlineState = active ? 'inline-block' : 'none';
        
        const displays = {
            'reset-btn': normalState, 
            'diff-quick-select': normalState, 
            'online-toggle-btn': normalState,
            'resign-btn': onlineState, 
            'undo-btn': normalState, 
            'match-players-card': active ? 'flex' : 'none',
            'chat-btn': active ? 'flex' : 'none' 
        };
        Object.keys(displays).forEach(id => this.setDisplay(id, displays[id]));
        
        if (active && gameState.userProfile) {
            this.applyAvatar('card-my-avatar', gameState.userProfile.avatar, gameState.userProfile.isCustomAvatar);
            this.setTxt('card-my-name', gameState.userProfile.name || this.translate("أنت", "You"));
            this.setTxt('card-opp-name', oppName);
            this.applyAvatar('card-opp-avatar', oppAvatar, oppAvatar?.startsWith('data:image'));
        }
    },

    updateVirtualBoardState() {
        const board = this.getEl('board');
        if (!board) return;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = board.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell?.children.length > 0) {
                    const child = cell.children[0];
                    const side = child.classList.contains('white') ? 'white' : 'black';
                    const type = child.classList.contains('dama') ? '-dama' : '';
                    gameState.virtualBoard[r][c] = `${side}${type}`;
                } else {
                    gameState.virtualBoard[r][c] = null;
                }
            }
        }
        this.updateScoreboard();
    },

    updateScoreboard() {
        let whiteCount = 0, blackCount = 0;
        
        gameState.virtualBoard.forEach(row => {
            row.forEach(p => {
                if (p) {
                    if (p.includes('white')) whiteCount++;
                    else blackCount++;
                }
            });
        });
        
        const renderScoreDots = (container, count, color) => {
            if (!container) return;
            container.innerHTML = '';
            const activeClass = color === 'white' ? 'active-white' : 'active-black';
            for (let i = 0; i < 16; i++) {
                const dot = document.createElement('div');
                dot.className = `mini-piece ${i < count ? activeClass : ''}`.trim();
                container.appendChild(dot);
            }
        };
        
        const isWhite = gameState.playerColor === 'white';
        renderScoreDots(this.getEl('opponent-score-row'), isWhite ? blackCount : whiteCount, isWhite ? 'black' : 'white');
        renderScoreDots(this.getEl('my-score-row'), isWhite ? whiteCount : blackCount, gameState.playerColor);
    },

    renderBoard(forceRebuild = false) {
        const board = this.getEl('board');
        if (!board) return;
        
        const flip = gameState.isOnlineMode && gameState.onlineFlip;
        
        const needsRebuild = forceRebuild || board.children.length === 0 || board.dataset.flip !== String(flip);
        
        if (needsRebuild) {
            board.innerHTML = '';
            board.dataset.flip = String(flip);
            
            const rowLabels = this.getEl('row-labels'); 
            if (rowLabels) {
                const rev = gameState.isOnlineMode ? gameState.onlineFlip : (gameState.playerColor !== 'white');
                rowLabels.innerHTML = rev 
                    ? '<div>8</div><div>7</div><div>6</div><div>5</div><div>4</div><div>3</div><div>2</div><div>1</div>' 
                    : '<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div>';
            }
            
            for (let dr = 0; dr < 8; dr++) {
                for (let dc = 0; dc < 8; dc++) {
                    const r = flip ? 7 - dr : dr;
                    const c = flip ? 7 - dc : dc;
                    
                    const cell = document.createElement('div');
                    cell.className = `cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    
                    board.appendChild(cell);
                }
            }
        }
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = board.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (!cell) continue;
                
                const boardVal = gameState.virtualBoard[r][c];
                let currentPiece = cell.querySelector('.piece');
                
                if (boardVal) {
                    const isWhite = boardVal.includes('white');
                    const isDama = boardVal.includes('dama');
                    
                    if (!currentPiece) {
                        currentPiece = document.createElement('div');
                        currentPiece.className = `piece ${isWhite ? 'white' : 'black'} ${isDama ? 'dama' : ''}`.trim();
                        cell.appendChild(currentPiece);
                    } else {
                        if (isWhite) {
                            currentPiece.classList.add('white');
                            currentPiece.classList.remove('black');
                        } else {
                            currentPiece.classList.add('black');
                            currentPiece.classList.remove('white');
                        }
                        
                        if (isDama) {
                            currentPiece.classList.add('dama');
                        } else {
                            currentPiece.classList.remove('dama');
                        }
                    }
                } else if (currentPiece) {
                    cell.removeChild(currentPiece);
                }
            }
        }
        
        this.updateScoreboard();
    },

    drawEmptyBoard() {
        gameState.virtualBoard = Array(8).fill(null).map(() => Array(8).fill(null));
        this.clearHighlights();
        document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
        
        const tInd = this.getEl('turn-indicator');
        if (tInd) {
            tInd.textContent = this.translate("اضغط بدء اللعب", "Press Start");
            tInd.style.color = "#a1a1aa";
        }
        this.setTxt('turn-countdown', '');
        
        this.renderBoard(true);
    },

    initBoard() {
        clearTimeout(gameState.aiTimeout);
        gameState.aiTimeout = null;
        
        gameState.botMoveCount = 0;
        gameState.virtualBoard = Array(8).fill(null).map(() => Array(8).fill(null));
        gameState.boardHistory = []; 
        
        this.clearHighlights();
        document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
        
        if (!gameState.isOnlineMode) this.toggleOnlineUILayout(false);
        
        let topC = gameState.playerColor === 'white' ? 'black' : 'white';
        gameState.pieceDirection = {};
        gameState.pieceDirection[topC] = 1;
        gameState.pieceDirection[gameState.playerColor] = -1;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (r === 1 || r === 2) gameState.virtualBoard[r][c] = topC;
                else if (r === 5 || r === 6) gameState.virtualBoard[r][c] = gameState.playerColor;
            }
        }
        
        gameState.currentTurn = 'white';
        gameState.selectedPiece = null;
        gameState.isMultiJumping = false;
        gameState.blockGameOverModal = true;
        
        setTimeout(() => { gameState.blockGameOverModal = false; }, 1000);
        
        this.renderBoard(true);
        saveGameState();
        this.startTurn();
    },

    clearHighlights() {
        document.querySelectorAll('.cell.highlight').forEach(c => c.classList.remove('highlight'));
    },

    highlightMove(from, to) {
        const board = this.getEl('board');
        if (!board) return;
        
        document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
        const fromCell = board.querySelector(`[data-row="${from.r}"][data-col="${from.c}"]`);
        const toCell = board.querySelector(`[data-row="${to.r}"][data-col="${to.c}"]`);
        
        if (fromCell) fromCell.classList.add('last-move');
        if (toCell) toCell.classList.add('last-move');
    },

    showValidMovesHighlights(r, c) {
        this.clearHighlights();
        const board = this.getEl('board');
        if (!board) return;
        
        let moves = (gameState.isMultiJumping && gameState.selectedPiece) 
            ? gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard, r, c, gameState.lastJumpDir.dr, gameState.lastJumpDir.dc) 
            : gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard);
            
        moves.forEach(path => {
            if (path?.length > 0 && path[0].fromR === r && path[0].fromC === c) {
                let targetCell = board.querySelector(`[data-row="${path[0].toR}"][data-col="${path[0].toC}"]`);
                if (targetCell) targetCell.classList.add('highlight');
            }
        });
    },

    startTurnTimer() {
        if (!gameState.isOnlineMode) return;
        
        sfx.clock.pause();
        sfx.clock.currentTime = 0;
        clearInterval(gameState.turnTimerInterval);
        gameState.turnTimerInterval = null;
        
        const updateTimerDisplay = () => {
            if (gameState.turnEndTime) {
                gameState.turnTimeLeft = Math.max(0, Math.ceil((gameState.turnEndTime - Date.now()) / 1000));
            } else {
                gameState.turnTimeLeft--;
            }

            this.setTxt('turn-countdown', this.translate(`⏳ المتبقي للدور: ${gameState.turnTimeLeft} ثانية`, `⏳ Turn Time Left: ${gameState.turnTimeLeft}s`));
            
            if (gameState.turnTimeLeft === 10) {
                let playPromise = sfx.clock.play();
                if (playPromise !== undefined) playPromise.catch(() => {});
            }
            
            if (gameState.turnTimeLeft <= 0) {
                clearInterval(gameState.turnTimerInterval);
                gameState.turnTimerInterval = null;
                sfx.clock.pause();
                sfx.clock.currentTime = 0;
                
                this.setTxt('turn-countdown', this.translate("⏳ جاري المزامنة مع الخادم...", "⏳ Syncing with server..."));
            }
        };

        if (!gameState.turnEndTime) {
            gameState.turnTimeLeft = 45;
        }
        updateTimerDisplay(); 
        gameState.turnTimerInterval = setInterval(updateTimerDisplay, 1000);
    },

    startTurn() {
        const tInd = this.getEl('turn-indicator');
        if (!tInd) return;

        if (gameState.virtualBoard.every(row => row.every(cell => cell === null))) {
            return; 
        }

        if (!gameState.isOnlineMode && !gameState.isMultiJumping) {
            if (!gameState.boardHistory) gameState.boardHistory = [];
            let currentBoardStr = JSON.stringify(gameState.virtualBoard);
            let lastSavedStr = gameState.boardHistory.length > 0 ? JSON.stringify(gameState.boardHistory[gameState.boardHistory.length - 1].board) : "";
            if (currentBoardStr !== lastSavedStr) {
                gameState.boardHistory.push({
                    board: JSON.parse(currentBoardStr),
                    turn: gameState.currentTurn
                });
            }
        }
        
        this.updateVirtualBoardState();
        gameState.lastJumpDir = { dr: null, dc: null };
        document.querySelectorAll('.piece.forced').forEach(p => p.classList.remove('forced'));
        
        let wMoves = gameEngine.generateAllTurnMoves('white', gameState.virtualBoard).length;
        let bMoves = gameEngine.generateAllTurnMoves('black', gameState.virtualBoard).length;
        
        const isBoardEmpty = gameState.virtualBoard.every(row => row.every(cell => cell === null));
        
        if (!isBoardEmpty && ((gameState.currentTurn === 'white' && wMoves === 0) || (gameState.currentTurn === 'black' && bMoves === 0))) {
            if (gameState.blockGameOverModal) return; 
            let winMsg = gameState.currentTurn === 'white' ? translations[gameState.lang].winBlack : translations[gameState.lang].winWhite;
            tInd.textContent = winMsg;
            tInd.style.color = "#2ecc71";
            this.showGameOverModal(winMsg);
            return;
        }
        
        let maxJ = 0;

        if (gameState.isMultiJumping && gameState.selectedPiece) {
            let cell = gameState.selectedPiece.parentElement;
            let r = parseInt(cell.dataset.row);
            let c = parseInt(cell.dataset.col);
            maxJ = gameEngine.findMaxJumps(r, c, gameState.currentTurn, gameState.virtualBoard);
        } else {
            gameState.virtualBoard.forEach((row, r) => {
                row.forEach((p, c) => {
                    if (p?.startsWith(gameState.currentTurn)) {
                        maxJ = Math.max(maxJ, gameEngine.findMaxJumps(r, c, gameState.currentTurn, gameState.virtualBoard));
                    }
                });
            });
        }
        
        gameState.requiredJumps = maxJ;
        gameState.jumpsCount = 0;
        gameState.isMultiJumping = false;
        
        if (gameState.requiredJumps > 0) {
            tInd.textContent = `${translations[gameState.lang].forced || "إجباري"} ${gameState.requiredJumps}`;
            tInd.style.color = "#e74c3c";
            
            let fList = [];
            gameState.virtualBoard.forEach((row, r) => {
                row.forEach((p, c) => {
                    if (p?.startsWith(gameState.currentTurn) && gameEngine.findMaxJumps(r, c, gameState.currentTurn, gameState.virtualBoard) === gameState.requiredJumps) {
                        let cell = this.getEl('board').querySelector(`[data-row="${r}"][data-col="${c}"]`);
                        if (cell?.children.length > 0) {
                            cell.children[0].classList.add('forced');
                            fList.push({ el: cell.children[0], r, c });
                        }
                    }
                });
            });
            
            if ((gameState.currentTurn === gameState.playerColor || gameState.isOnlineMode) && fList.length === 1) {
                gameState.selectedPiece = fList[0].el;
                gameState.selectedPiece.classList.add('selected');
                if (gameState.currentTurn === gameState.playerColor) {
                    document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
                }
                this.showValidMovesHighlights(fList[0].r, fList[0].c);
            }
        } else {
            tInd.style.color = "#f1c40f";
            if (gameState.isOnlineMode) {
                tInd.textContent = gameState.currentTurn === gameState.myOnlineColor ? this.translate("دورك الآن", "Your Turn") : this.translate("دور منافسك", "Opponent's Turn");
            } else if (gameState.currentTurn === gameState.playerColor) {
                tInd.textContent = translations[gameState.lang].turn || "دورك";
            } else {
                tInd.textContent = translations[gameState.lang].aiTurn || "دور الحاسوب";
            }
        }
        
        this.startTurnTimer();
        
        if (gameState.currentTurn !== gameState.playerColor && !gameState.onlineRoomID) {
            tInd.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
            clearTimeout(gameState.aiTimeout);
            gameState.aiTimeout = setTimeout(() => this.triggerComputerMove(), 800);
        }
    },

    triggerComputerMove() {
        let level = parseInt(this.getVal('diff-quick-select', '3')) || 3; 
        let aiColor = gameState.playerColor === 'white' ? 'black' : 'white';
        let depth = [1, 1, 2, 2, 3, 4, 5, 6, 7][Math.max(0, Math.min(level - 1, 8))];
        let randomChance = [0.6, 0.3, 0.1, 0, 0, 0, 0, 0, 0][Math.max(0, Math.min(level - 1, 8))];
        
        let moves = gameEngine.generateAllTurnMoves(aiColor, gameState.virtualBoard);
        if (moves.length === 0) return;

        const self = this;
        const gameId = gameState.gameId || Date.now();
        gameState.gameId = gameId; 

        const processMove = (chosenMove) => {
            if (!Array.isArray(chosenMove)) {
                chosenMove = [chosenMove];
            }

            let stepIdx = 0;
            let startRow = chosenMove[0].fromR;
            let startCol = chosenMove[0].fromC;

            function executeStep() {
                if (gameState.gameId !== gameId) return; 
                if (gameState.currentTurn !== aiColor || gameState.isOnlineMode) return;

                let step = chosenMove[stepIdx];
                if (!step) return;

                let board = self.getEl('board');
                if (!board) return;
                
                let fCell = board.querySelector(`[data-row="${step.fromR}"][data-col="${step.fromC}"]`);
                let tCell = board.querySelector(`[data-row="${step.toR}"][data-col="${step.toC}"]`);
                
                if (step.midR !== null && step.midC !== null && step.midR !== undefined) {
                    self.playSound(gameState.virtualBoard[step.midR][step.midC]?.includes('dama') ? sfx.kingDied : sfx.piecesDied);
                    let midCell = board.querySelector(`[data-row="${step.midR}"][data-col="${step.midC}"]`);
                    if (midCell) midCell.innerHTML = '';
                }
                
                if (tCell && fCell?.children.length > 0) {
                    tCell.appendChild(fCell.children[0]);
                }
                
                self.playSound(sfx.move);
                stepIdx++;
                gameState.botMoveCount++;
                
                if (stepIdx >= chosenMove.length) {
                    let last = chosenMove[chosenMove.length - 1];
                    let finalCell = board.querySelector(`[data-row="${last.toR}"][data-col="${last.toC}"]`);
                    if (finalCell?.children.length > 0) {
                        const isWhitePiece = finalCell.children[0].classList.contains('white');
                        let realPromoRow = gameState.pieceDirection[isWhitePiece ? 'white' : 'black'] === 1 ? 7 : 0;
                        if (last.toR === realPromoRow && !finalCell.children[0].classList.contains('dama')) {
                            finalCell.children[0].classList.add('dama');
                            self.playSound(sfx.kingCreated);
                        }
                    }
                    self.highlightMove({ r: startRow, c: startCol }, { r: last.toR, c: last.toC });
                    gameState.currentTurn = gameState.playerColor;
                    saveGameState();
                    self.startTurn();
                    return;
                }
                
                let delay = gameState.isOnlineMode || step.midR !== null ? 800 : (gameState.botMoveCount < 7 ? 1000 : Math.floor(Math.random() * 3000) + 2000);
                setTimeout(executeStep, delay);
            }
            executeStep();
        };

        if (Math.random() < randomChance) {
            let chosenMove = moves[Math.floor(Math.random() * moves.length)];
            processMove(chosenMove);
        } else {
            const worker = getAiWorker();
            if (worker) {
                worker.onmessage = function(e) {
                    worker.onmessage = null; 
                    worker.onerror = null;
                    let chosenMove = e.data.move || moves[0];
                    processMove(chosenMove);
                };
                worker.onerror = function(err) {
                    worker.onmessage = null;
                    worker.onerror = null;
                    console.error("AI Worker Error:", err);
                    let chosenMove = moves[0];
                    processMove(chosenMove);
                };
                worker.postMessage({
                    board: gameState.virtualBoard,
                    depth: depth,
                    aiColor: aiColor
                });
            } else {
                let chosenMove = gameAI.minimax(gameState.virtualBoard, depth, -Infinity, Infinity, true, aiColor).move || moves[0];
                processMove(chosenMove);
            }
        }
    },

    showOnlineResultsModal(winnerColor) {
        clearInterval(gameState.turnTimerInterval); 
        gameState.turnTimerInterval = null;
        sfx.clock.pause(); 
        sfx.clock.currentTime = 0; 
        this.setTxt('turn-countdown', '');

        const oldModal = this.getEl('custom-results-modal-container');
        if (oldModal) oldModal.remove();

        this.playSound(sfx.win);
        
        if (typeof window.closeAppModal === 'function') window.closeAppModal('game-over-modal');
        else this.setDisplay('game-over-modal', 'none');

        const container = this.makeEl('div', 'custom-results-modal-container', "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,18,25,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;z-index:999999;font-family:sans-serif;direction:rtl;box-sizing:border-box;padding:20px;");
        container.id = 'custom-results-modal-container';
        
        const box = this.makeEl('div', null, "background:rgba(45,48,55,0.65);backdrop-filter:blur(35px);-webkit-backdrop-filter:blur(35px);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:35px 25px;border-radius:32px;width:100%;max-width:320px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05);");
        
        box.appendChild(this.makeEl('h3', null, "margin:0 0 15px 0;color:#87ceeb;font-size:26px;font-weight:700;text-align:center;", this.translate("النتيجة", "Match Results")));
        
        const trophy = this.makeEl('div', null, "font-size:50px;margin:10px 0 20px 0;text-shadow:0 0 15px rgba(255,215,0,0.4);", "🏆");
        box.appendChild(trophy);
        
        const isMeWin = winnerColor === (gameState.isOnlineMode ? gameState.myOnlineColor : gameState.playerColor);
        
        const createPlayerBox = (name, avatar, isCustom, isWin) => {
            const pBox = this.makeEl('div', null, "display:flex;flex-direction:column;align-items:center;width:45%;");
            
            const avContainer = this.makeEl('div', null, "border-radius:50%;padding:4px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);box-shadow:0 10px 25px rgba(0,0,0,0.2);");
            const av = this.makeEl('div', null, "width:56px;height:56px;border-radius:50%;display:flex;justify-content:center;align-items:center;font-size:28px;background-size:cover;background-position:center;overflow:hidden;");
            this.applyAvatar(av, avatar, isCustom);
            av.style.border = "none";
            avContainer.appendChild(av);
            
            const nameSpan = this.makeEl('span', null, "margin-top:8px;font-size:13px;font-weight:600;color:#ffffff;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", name);
            
            const statusBg = isWin ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)';
            const statusColor = isWin ? '#30d158' : '#ff453a';
            const statusBorder = isWin ? 'rgba(48,209,88,0.3)' : 'rgba(255,69,58,0.3)';
            const statusText = isWin ? this.translate("فائز", "Winner") : this.translate("خاسر", "Loser");
            const statusSpan = this.makeEl('span', null, `font-size:12px;margin-top:8px;padding:4px 12px;border-radius:50px;font-weight:600;background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};display:inline-block;`, statusText);
            
            pBox.append(avContainer, nameSpan, statusSpan);
            return pBox;
        };
        
        const flex = this.makeEl('div', null, "display:flex;justify-content:center;align-items:center;gap:20px;margin:15px 0;");
        
        let oppName = gameState.currentOpponentName;
        let oppAvatar = gameState.currentOpponentAvatar;
        if (!gameState.isOnlineMode) {
            oppName = this.translate("الذكاء الاصطناعي", "AI");
            oppAvatar = "AI_BOT";
        }

        if (gameState.userProfile) {
            flex.append(
                createPlayerBox(gameState.userProfile.name, gameState.userProfile.avatar, gameState.userProfile.isCustomAvatar, isMeWin), 
                createPlayerBox(oppName || this.translate("لاعب منافس", "Opponent"), oppAvatar, oppAvatar?.startsWith('data:image'), !isMeWin)
            );
        }
        box.appendChild(flex);
        
        const btns = this.makeEl('div', null, "display:flex;gap:10px;width:100%;margin-top:25px;");
        const rBtn = this.makeEl('button', 'modal-btn-rematch', "flex:1;background:rgba(135,206,235,0.15);color:#87ceeb;border:1px solid rgba(135,206,235,0.3);border-radius:50px;height:50px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1);outline:none;box-shadow:0 0 3px rgba(135,206,235,0.3);", this.translate("إعادة اللعب", "Rematch"));
        rBtn.id = 'modal-btn-rematch';
        rBtn.onmouseenter = () => rBtn.style.transform = 'scale(0.96)';
        rBtn.onmouseleave = () => rBtn.style.transform = 'scale(1)';
        
        this.clickHandlers.set('modal-btn-rematch', () => {
            rBtn.disabled = true; 
            rBtn.style.opacity = '0.6';
            rBtn.style.cursor = 'not-allowed';
            rBtn.textContent = this.translate("جاري الانتظار...", "Waiting..."); 
            
            if (gameState.isOnlineMode && !gameState.isBotOpponent) {
                if (socketManager && typeof socketManager.sendRematchRequest === 'function') {
                    socketManager.sendRematchRequest();
                }
            } else {
                setTimeout(() => { 
                    container.remove();
                    this.initBoard(); 
                }, 500); 
            }
        });
        
        const eBtn = this.makeEl('button', 'modal-btn-exit', "flex:1;background:rgba(255,69,58,0.15);color:#ff453a;border:1px solid rgba(255,69,58,0.3);border-radius:50px;height:50px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1);outline:none;box-shadow:0 0 3px rgba(255,69,58,0.3);", this.translate("الخروج", "Exit"));
        eBtn.id = 'modal-btn-exit';
        eBtn.onmouseenter = () => eBtn.style.transform = 'scale(0.96)';
        eBtn.onmouseleave = () => eBtn.style.transform = 'scale(1)';
        
        this.clickHandlers.set('modal-btn-exit', () => {
            if (gameState.isOnlineMode && !gameState.isBotOpponent && socket?.connected) {
                socket.emit('leaveRoom', { roomID: gameState.onlineRoomID });
                socket.emit('rejectRematch', { roomID: gameState.onlineRoomID });
            }

            container.remove(); 
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('game-over-modal');
            else this.setDisplay('game-over-modal', 'none'); 
            
            if (gameState.turnTimerInterval) {
                clearInterval(gameState.turnTimerInterval);
                gameState.turnTimerInterval = null;
            }
            if (gameState.aiTimeout) {
                clearTimeout(gameState.aiTimeout);
                gameState.aiTimeout = null;
            }
            
            gameState.isOnlineMode = false; 
            gameState.onlineRoomID = null; 
            this.toggleOnlineUILayout(false); 
            
            if (socket?.connected) {
                socket.disconnect(); 
            }
            this.drawEmptyBoard();
        });
        
        btns.append(rBtn, eBtn); 
        box.appendChild(btns); 
        container.appendChild(box); 
        document.body.appendChild(container);

        if (gameState.userProfile) { 
            const isServerConnected = (typeof socket !== 'undefined' && socket && socket.connected);

            if (isServerConnected) {
                if (isMeWin) {
                    box.appendChild(this.makeEl('div', 'token-reward-alert', "margin-top:15px;color:#f5a623;font-weight:700;font-size:15px;", (translations[gameState.lang]?.tokenReward || "مكافأة الفوز 🪙") + " 50"));
                } else { 
                    box.appendChild(this.makeEl('div', 'token-reward-alert', "margin-top:15px;color:#f5a623;font-weight:700;font-size:15px;", (translations[gameState.lang]?.tokenReward || "مكافأة اللعب 🪙") + " 10"));
                }
                
                if (!gameState.isOnlineMode) {
                    socket.emit('claimBotReward', { isWin: isMeWin });
                }
            } else {
                const offlineMsg = gameState.lang === 'ar' ? "الإنترنت مفصول (وضع التدريب) 🚫🪙" : "Offline mode (No rewards) 🚫🪙";
                box.appendChild(this.makeEl('div', 'offline-alert', "margin-top:15px;color:#a1a1aa;font-weight:600;font-size:13px;", offlineMsg));
                
                gameState.userProfile.gamesPlayed++;
                if (isMeWin) gameState.userProfile.wins++;
                else gameState.userProfile.losses++;
                
                if (gameState.userProfile.id) {
                    gameState.userProfile.id = gameState.userProfile.id.toUpperCase();
                }
                localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
            }
            
            if (window.parent) {
                window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
            }
            this.updateProfileUI(); 
        }
        this.toggleOnlineUILayout(false);
    },

    updateProfileUI() {
        if (!gameState.userProfile) return;
        
        if (gameState.userProfile) {
            if (typeof window.applyTheme === 'function') {
                window.applyTheme(gameState.userProfile); 
            }
        }

        if (typeof window.applyProfileDataToUI === 'function') {
            window.applyProfileDataToUI(gameState.userProfile);
        }
        
        const hintCounter = document.getElementById('hint-counter');
        if (hintCounter && gameState.userProfile) {
            if (gameState.userProfile.hints === undefined) gameState.userProfile.hints = 5;
            hintCounter.textContent = gameState.userProfile.hints;
        }
        
        const fList = this.getEl('igp-friends-list'); 
        if (fList) {
            fList.innerHTML = '';
            
            if (!gameState.userProfile.friends || gameState.userProfile.friends.length === 0) {
                const noFriendsTxt = this.makeEl('p', null, "text-align:center;color:#a1a1aa;font-size:12px;", this.translate("لا يوجد أصدقاء حالياً", "No friends currently"));
                fList.appendChild(noFriendsTxt);
            } else {
                const normalizedFriends = [...new Set((gameState.userProfile.friends || []).map(id => id.toUpperCase()))];
                gameState.userProfile.friends = normalizedFriends;

                gameState.userProfile.friends.forEach(fId => {
                    const fItem = this.makeEl('div', null, "padding:5px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;display:flex;justify-content:space-between;align-items:center;color:white;");
                    
                    const labelSpan = this.makeEl('span', null, "font-weight:600;");
                    labelSpan.textContent = `👤 ${this.translate("صديق", "Friend")} (${fId})`;
                    
                    const actionsDiv = this.makeEl('div', null, "display: flex; gap: 8px;");
                    
                    const challengeBtn = this.makeEl('button', 'challenge-btn', "background:rgba(48,209,88,0.15);border:1px solid rgba(48,209,88,0.3);color:#30d158;border-radius:50px;padding:4px 10px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px;", `⚔️ ${this.translate("تحدي", "Challenge")}`);
                    challengeBtn.title = this.translate("تحدي", "Challenge");
                    challengeBtn.dataset.action = 'challenge-friend';
                    challengeBtn.dataset.fid = fId;
                    
                    const removeBtn = this.makeEl('button', 'remove-btn', "background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.2);color:#ff453a;border-radius:50px;padding:4px 10px;cursor:pointer;font-size:12px;font-weight:600;", this.translate("حذف", "Remove"));
                    removeBtn.dataset.action = 'remove-friend';
                    removeBtn.dataset.fid = fId;
                    
                    actionsDiv.append(challengeBtn, removeBtn);
                    fItem.append(labelSpan, actionsDiv);
                    fList.appendChild(fItem);
                });
            }
        }
    },

    updateLeaderboardUI(data) {
        const winsList = this.getEl('leaderboard-wins-list');
        const tokensList = this.getEl('leaderboard-tokens-list');
        
        const buildList = (listEl, items) => {
            if (!listEl) return;
            listEl.innerHTML = '';
            if (!items || items.length === 0) {
                listEl.appendChild(this.makeEl('li', null, "color:#a1a1aa;text-align:center;padding:10px;", this.translate("لا يوجد بيانات حالياً", "No data available")));
                return;
            }
            items.forEach((player, idx) => {
                const li = this.makeEl('li', null, "display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:white;align-items:center;font-size:13px;");
                const rankSpan = this.makeEl('span', null, "font-weight:bold;color:#f1c40f;margin-left:8px;min-width:24px;", `#${idx + 1}`);
                const nameSpan = this.makeEl('span', null, "flex:1;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-left:10px;", player.name || player.id);
                const scoreSpan = this.makeEl('span', null, "font-weight:600;color:#87ceeb;", player.score);
                
                li.append(rankSpan, nameSpan, scoreSpan);
                listEl.appendChild(li);
            });
        };

        if (data) {
            if (data.wins) buildList(winsList, data.wins);
            if (data.tokens) buildList(tokensList, data.tokens);
        }
    },

    initProfileSystem() {
        let saved = localStorage.getItem('hub_user_profile');
        if (saved) { 
            try {
                const parsed = JSON.parse(saved);
                if (parsed.id) parsed.id = parsed.id.toUpperCase();
                if (parsed.friends) {
                    parsed.friends = [...new Set(parsed.friends.map(f => f.toUpperCase()))];
                }
                gameState.userProfile = { ...gameState.userProfile, ...parsed }; 
            } catch(e) {
                console.error("Error parsing saved profile setup:", e);
            }
        }
        this.updateProfileUI(); 
    },

    startMatchmakingQueue() {
        if (!gameState.userProfile) return;
        
        if (typeof window.openAppModal === 'function') window.openAppModal('matchmaking-modal');
        else this.setDisplay('matchmaking-modal', 'flex'); 
        
        const pId = (gameState.userProfile.id || "").toUpperCase();
        gameState.userProfile.id = pId;

        this.applyAvatar('mm-my-avatar', gameState.userProfile.avatar, gameState.userProfile.isCustomAvatar);
        this.setTxt('mm-my-name', gameState.userProfile.name || "You"); 
        this.setTxt('mm-opp-avatar', "❓"); 
        this.setTxt('mm-opp-name', this.translate("جاري البحث...", "Searching..."));
        this.setTxt('mm-status-label', this.translate("فحص اللاعبين...", "Checking players...")); 
        
        gameState.mmTimeLeft = 0; 
        clearInterval(gameState.mmInterval);
        gameState.mmInterval = null;
        
        if (socket && !socket.connected) socket.connect();
        if (socket?.connected) {
            socket.emit('deviceFingerprint', { guestId: pId }); 
            socket.emit('joinMatchmakingPool', { id: pId, name: gameState.userProfile.name, avatar: gameState.userProfile.avatar, deviceFingerprint: gameState.deviceFingerprint });
        }
        
        gameState.mmInterval = setInterval(() => { 
            gameState.mmTimeLeft++; 
            const m = String(Math.floor(gameState.mmTimeLeft / 60)).padStart(2, '0');
            const s = String(gameState.mmTimeLeft % 60).padStart(2, '0');
            this.setTxt('mm-timer', `${m}:${s}`); 
        }, 1000);
    },

    startOnlineGame() {
        gameState.isOnlineMode = true; 
        gameState.isBotOpponent = false; 
        
        if (socket && !socket.connected) socket.connect();
    }
};

// ==========================================
// 🌟 التراجع الدقيق والمصباح الذكي (المتكيف) 🌟
// ==========================================

ui.onClick('undo-btn', () => {
    if (gameState.isOnlineMode || !gameState.boardHistory || gameState.boardHistory.length <= 1) return;

    // إيقاف تفكير البوت فوراً لتجنب تداخل الحركات
    gameState.gameId = Date.now();
    if (gameState.aiTimeout) {
        clearTimeout(gameState.aiTimeout);
        gameState.aiTimeout = null;
    }

    // 1. حذف الحالة الحالية من السجل (خطوة واحدة للوراء)
    gameState.boardHistory.pop();

    // 2. فحص الحالة السابقة: إذا كانت "دور البوت"، يجب أن نعود خطوة إضافية ليكون الدور للاعب
    if (gameState.boardHistory.length > 1 && 
        gameState.boardHistory[gameState.boardHistory.length - 1].turn !== gameState.playerColor) {
        gameState.boardHistory.pop();
    }

    // 3. جلب الحالة النهائية المطلوبة
    let prevState = gameState.boardHistory[gameState.boardHistory.length - 1];

    if (prevState) {
        gameState.virtualBoard = JSON.parse(JSON.stringify(prevState.board));
        gameState.currentTurn = prevState.turn;
        
        ui.clearHighlights();
        document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
        if (gameState.selectedPiece) {
            gameState.selectedPiece.classList.remove('selected');
            gameState.selectedPiece = null;
        }
        gameState.isMultiJumping = false;
        
        ui.renderBoard();
        ui.playSound(ui.sfx.move);
        ui.startTurn();
    }
});

ui.onClick('hint-btn', () => {
    if (gameState.isOnlineMode && gameState.currentTurn !== gameState.myOnlineColor) return;
    if (!gameState.isOnlineMode && gameState.currentTurn !== gameState.playerColor) return;

    let profile = gameState.userProfile;
    if (!profile) return;
    
    if (profile.hints === undefined) {
        profile.hints = 5;
    }

    if (profile.hints <= 0) {
        ui.showCustomAlert(ui.translate("لقد نفدت التلميحات! يمكنك الحصول على المزيد من المتجر.", "Out of hints! Get more from the store."));
        return;
    }

    let myColor = gameState.isOnlineMode ? gameState.myOnlineColor : gameState.playerColor;
    let eleganceMoves = gameEngine.generateAllTurnMoves(myColor, gameState.virtualBoard);
    if (eleganceMoves.length === 0) return;

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
        hintBtn.style.pointerEvents = 'none';
        hintBtn.style.opacity = '0.5';
    }
    
    // 🧠 منطق "المصباح المتكيف الديناميكي"
    let currentLevel = parseInt(document.getElementById('diff-quick-select')?.value || '3');
    let botDepthArray = [1, 1, 2, 2, 3, 4, 5, 6, 7]; 
    let botDepth = botDepthArray[Math.max(0, Math.min(currentLevel - 1, 8))];

    // جعل المصباح أذكى من الخصم بخطوة واحدة دائماً (بحد أدنى 5 لضمان جودة الحركات في المستويات السهلة)
    let hintDepth = Math.max(5, botDepth + 1);
    
    // نضع الحد الأقصى 8 لحماية معالج الهاتف من الاحتراق أو التجمد الطويل
    if (hintDepth > 8) hintDepth = 8;

    if (hintDepth >= 7) {
        ui.setTxt('turn-countdown', ui.translate("👁️ المصباح يقوم بحسابات معقدة جداً لكسر تكتيك الخصم... يرجى الانتظار ⏳", "👁️ Lamp calculating complex tactics... Please wait ⏳"));
    } else {
        ui.setTxt('turn-countdown', ui.translate("👁️ المصباح يحسب حركتك الأسطورية القادمة...", "👁️ Lamp is calculating your next legendary move..."));
    }

    const showGlow = (moveObj) => {
        if (hintBtn) {
            hintBtn.style.pointerEvents = 'auto';
            hintBtn.style.opacity = '1';
        }
        ui.setTxt('turn-countdown', ''); 

        if (!moveObj || moveObj.length === 0) return;
        
        // 1. الخصم المحلي الفوري
        profile.hints--;
        const counterEl = document.getElementById('hint-counter');
        if (counterEl) counterEl.textContent = profile.hints;
        
        // 2. الحفظ في الذاكرة ومزامنة المحفظة الأم
        localStorage.setItem('hub_user_profile', JSON.stringify(profile));
        if (window.parent) {
            window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
        }

        // 3. إرسال الطلب للسيرفر
        if (socket && socket.connected) {
            socket.emit('useHint'); 
        }

        let from = { r: moveObj[0].fromR, c: moveObj[0].fromC };
        let to = { r: moveObj[moveObj.length - 1].toR, c: moveObj[moveObj.length - 1].toC };
        
        let board = ui.getEl('board');
        if (!board) return;
        let fCell = board.querySelector(`[data-row="${from.r}"][data-col="${from.c}"]`);
        let tCell = board.querySelector(`[data-row="${to.r}"][data-col="${to.c}"]`);
        
        if (fCell) { fCell.style.boxShadow = "inset 0 0 35px #FFD700"; setTimeout(() => fCell.style.boxShadow="", 3500); }
        if (tCell) { tCell.style.boxShadow = "inset 0 0 35px #FFD700"; setTimeout(() => tCell.style.boxShadow="", 3500); }
        ui.playSound(ui.sfx.move);
    };

    const worker = getAiWorker();
    if (worker) {
        worker.onmessage = (e) => {
            worker.onmessage = null; 
            worker.onerror = null;
            let bestMove = e.data.move;
            showGlow(bestMove || eleganceMoves[0]);
        };
        worker.onerror = () => {
            worker.onmessage = null;
            worker.onerror = null;
            let syncMove = gameAI.minimax(gameState.virtualBoard, hintDepth > 6 ? 6 : hintDepth, -Infinity, Infinity, true, myColor).move;
            showGlow(syncMove || eleganceMoves[0]);
        }
        // إرسال العمق الديناميكي الدقيق للخوارزمية
        worker.postMessage({ board: gameState.virtualBoard, depth: hintDepth, aiColor: myColor });
    } else {
        setTimeout(() => {
            let bestMove = gameAI.minimax(gameState.virtualBoard, hintDepth > 6 ? 6 : hintDepth, -Infinity, Infinity, true, myColor).move || eleganceMoves[0];
            showGlow(bestMove);
        }, 50);
    }
});

window.ui = ui;
window.updateUITranslations = () => { ui.updateTexts(); };

// ==========================================
// المستمع المركزي للأحداث
// ==========================================
document.addEventListener('click', (e) => {
    let target = e.target;
    while (target && target !== document) {
        if (target.id && ui.clickHandlers.has(target.id)) {
            ui.clickHandlers.get(target.id)(e);
            return; 
        }
        target = target.parentNode;
    }

    const actionElement = e.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const fId = (actionElement.dataset.fid || "").toUpperCase(); 

        if (action === 'challenge-friend') {
            if (typeof window.challengeFriend === 'function') {
                window.challengeFriend(fId);
            } else {
                ui.showCustomAlert(ui.translate("قريباً... سيتم تفعيل نظام التحديات!", "Coming soon... Challenge system will be activated!"));
            }
        } else if (action === 'remove-friend') {
            gameState.userProfile.friends = (gameState.userProfile.friends || []).filter(id => id.toUpperCase() !== fId); 
            localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); 
            ui.updateProfileUI();
        }
    }
});
