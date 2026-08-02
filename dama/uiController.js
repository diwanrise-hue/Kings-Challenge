// uiController.js
import { gameState } from './gameState.js'; 
import { saveGameState, restoreOfflineHintSystem } from './main.js';
import { gameEngine } from './gameEngine.js';
import { gameAI } from './gameAI.js';
import { socket, socketManager } from './socketManager.js';
import { t } from './i18n.js';


window.t = t; 

export const sfx = {
    move: new Audio('move.mp3'),
    piecesDied: new Audio('pieces_died.mp3'),
    kingDied: new Audio('king_died.mp3'),
    kingCreated: new Audio('king_created.mp3'),
    win: new Audio('win.mp3'),
    clock: new Audio('clock.mp3'),
    spinTick: new Audio('spin_tick.mp3') 
};

// 💡 1. تم حل مشكلة توقف البوت والـ postMessage نهائياً
let aiWorkerInstance = null;
function getAiWorker() {
    try {
        if (window.Worker) {
            if (!aiWorkerInstance || typeof aiWorkerInstance.postMessage !== 'function') { 
                aiWorkerInstance = new Worker('aiWorker.js');
            }
            return aiWorkerInstance;
        }
    } catch (error) {
        console.error("⚠️ فشل تحميل الـ Worker:", error);
    }
    return null;
}

window.isMatchRunning = false;

window.setAiLevel = function(level) {
    document.getElementById('diff-quick-select').value = level;
    document.getElementById('custom-diff-btn').innerText = 'L' + level;
    
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    let activeBtn = document.getElementById('lvl-btn-' + level);
    if(activeBtn) activeBtn.classList.add('active');
    
    if(typeof closeAppModal === 'function') closeAppModal('level-select-modal');
};

export const ui = {
    sfx: sfx,
    clickHandlers: new Map(), 
    currentWheelDeg: 0, 

    getEl: id => document.getElementById(id),
    
    setTxt(id, txt) {
        const el = this.getEl(id);
        if (el) el.textContent = txt;
    },
    
    setDisplay(id, displayState) {
        const el = this.getEl(id);
        if (el) el.style.setProperty('display', displayState, 'important');
    },
    
    onClick(id, fn) {
        this.clickHandlers.set(id, fn);
    },
    
    playSound(audio) {
        if (!audio) return;
        try {
            audio.pause(); 
            audio.currentTime = 0; 
            const playPromise = audio.play();
            
            if (playPromise !== undefined) { 
                playPromise.catch(() => { /* تم تجاهل الأخطاء الصامتة */ }); 
            }
        } catch(e) {}
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

    showCustomAlert(message, title = null, onConfirm = null, showCancel = false, customCancelText = null, customOkText = null) {
        title = title || t('alert_title');
        
        const msgContainer = this.getEl('custom-alert-message');
        if (msgContainer) {
            msgContainer.innerHTML = '';
            const safeDiv = document.createElement('div');
            safeDiv.style.cssText = "line-height: 1.6; font-size: 14px;";
            safeDiv.textContent = message; 
            msgContainer.appendChild(safeDiv);
        }
        
        this.setTxt('custom-alert-title', title);
        this.setTxt('custom-alert-ok', customOkText || t('alert_ok'));
        this.setTxt('custom-alert-cancel', customCancelText || t('btn_cancel'));
        
        const okBtn = this.getEl('custom-alert-ok');
        if (okBtn) okBtn.style.display = 'inline-block'; 
        
        const modalEl = this.getEl('custom-alert-modal');
        if (modalEl) {
            modalEl.style.setProperty('z-index', '99999999', 'important');
            modalEl.style.display = 'flex'; 
        }
        
        this.setDisplay('custom-alert-cancel', showCancel ? 'block' : 'none');
        
        this.clickHandlers.set('custom-alert-ok', () => {
            if (modalEl) modalEl.style.display = 'none'; 
            if (onConfirm) {
                try { onConfirm(); } catch(err) { console.error("Error executing confirm action:", err); }
            }
        });

        this.clickHandlers.set('custom-alert-cancel', () => {
            if (modalEl) modalEl.style.display = 'none';
        });
    },

    calculateLevelInfo(xpStr) {
        let currentXp = parseInt(xpStr) || 0;
        let level = Math.floor(Math.sqrt(currentXp / 50)) + 1;
        if (level > 200) level = 200; 
        
        let xpForCurrentLevel = Math.pow(level - 1, 2) * 50;
        let xpForNextLevel = Math.pow(level, 2) * 50;
        if (level === 200) xpForNextLevel = xpForCurrentLevel; 
        
        let progressXp = currentXp - xpForCurrentLevel;
        let requiredXp = xpForNextLevel - xpForCurrentLevel;
        let percentage = level === 200 ? 100 : Math.min(100, Math.max(0, (progressXp / requiredXp) * 100));

        let title = t('title_beginner') || "مبتدئ";
        if (level >= 100) title = t('title_grandmaster') || "جراند ماستر";
        else if (level >= 50) title = t('title_master') || "معلم الدامة";
        else if (level >= 30) title = t('title_expert') || "خبير";
        else if (level >= 10) title = t('title_duelist') || "مبارز";

        let rank = "برونزي"; let rankIcon = "🥉";
        if (currentXp >= 5000) { rank = "أسطوري"; rankIcon = "👑"; }
        else if (currentXp >= 2500) { rank = "ماسي"; rankIcon = "💎"; }
        else if (currentXp >= 1200) { rank = "ذهبي"; rankIcon = "🥇"; }
        else if (currentXp >= 500) { rank = "فضي"; rankIcon = "🥈"; }

        return { level, title, rank, rankIcon, progressXp, requiredXp, percentage };
    },

    showLevelUpModal(newLevel, title, rewardsHtml) {
        this.setTxt('level-up-num', newLevel);
        this.setTxt('level-up-title', `لقب: ${title}`);
        
        const rewardsContainer = this.getEl('level-up-rewards');
        if (rewardsContainer) rewardsContainer.innerHTML = rewardsHtml;
        
        this.playSound(sfx.win);
        
        const modalEl = this.getEl('level-up-modal');
        if (modalEl) modalEl.style.display = 'flex';
    },

    animateLuckySpin(prizeIndex, onComplete) {
        window.isSpinning = true; 
        
        const wheel = this.getEl('lucky-wheel-inner');
        const pointer = this.getEl('lucky-wheel-pointer'); 
        const btnFree = this.getEl('spin-free-btn');
        const btnPaid = this.getEl('spin-paid-btn');
        if (!wheel) return;

        if (btnFree) btnFree.style.pointerEvents = 'none';
        if (btnPaid) btnPaid.style.pointerEvents = 'none';

        const extraSpins = 5 * 360; 
        const targetDeg = extraSpins + (360 - (((prizeIndex + 1) * 45) % 360));

        const currentMod = this.currentWheelDeg % 360;
        const targetMod = targetDeg % 360;
        let diff = targetMod - currentMod;
        if (diff < 0) diff += 360; 
        
        let startDeg = this.currentWheelDeg;
        let totalChange = extraSpins + diff;
        this.currentWheelDeg += totalChange;

        wheel.style.transition = 'none';

        let tickAudio = sfx.spinTick;
        let spinDuration = 5000;
        let startTime = performance.now();
        
        let lastPinPassed = Math.floor(startDeg / 45);

        const animateTick = (currentTime) => {
            if (!window.isSpinning) return;
            
            let elapsed = currentTime - startTime;
            if (elapsed >= spinDuration) elapsed = spinDuration;

            let t = elapsed / spinDuration;
            let easeOut = 1 - Math.pow(1 - t, 3);
            let currentSimulatedAngle = startDeg + (totalChange * easeOut);

            wheel.style.transform = `rotate(${currentSimulatedAngle}deg)`;

            let currentPin = Math.floor((currentSimulatedAngle - 22.5) / 45);
            
            if (currentPin > lastPinPassed) {
                lastPinPassed = currentPin;

                this.playSound(tickAudio);

                if (pointer) {
                    pointer.style.transform = 'translateX(-50%) rotate(-30deg)';
                    setTimeout(() => {
                        if (pointer) pointer.style.transform = 'translateX(-50%) rotate(0deg)';
                    }, 60); 
                }
            }

            if (elapsed < spinDuration) {
                requestAnimationFrame(animateTick);
            } else {
                window.isSpinning = false; 
                this.playSound(sfx.win); 
                if (btnFree) btnFree.style.pointerEvents = 'auto';
                if (btnPaid) btnPaid.style.pointerEvents = 'auto';
                if (onComplete) onComplete();
            }
        };

        requestAnimationFrame(animateTick);
    },

    animateMatchFound(oppName, oppAvatar, onComplete) {
        this.setTxt('mm-opp-name', oppName);
        this.applyAvatar('mm-opp-avatar', oppAvatar, oppAvatar?.startsWith('data:image'));
        this.setTxt('mm-status-label', t('opp_found'));
        
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

    toggleOfflineInMatchUI(active) {
        if (gameState.isOnlineMode) return;
        window.isMatchRunning = active;
        
        const flexState = active ? 'none' : 'flex';
        const inlineState = active ? 'none' : 'inline-block';
        
        this.setDisplay('online-toggle-btn', flexState);
        this.setDisplay('store-portal-corner-btn', flexState);
        this.setDisplay('lucky-spin-portal-btn', flexState); 
        this.setDisplay('hamburger-menu-btn', flexState);
        
        this.setDisplay('custom-diff-btn', inlineState);
        this.setDisplay('bag-quick-btn', active ? 'flex' : 'none');
        this.setDisplay('resign-btn', active ? 'inline-block' : 'none');
        
        this.setDisplay('gameChatBtn', 'none');
        this.setDisplay('mic-toggle-btn', 'none');
        
        if (active && gameState.isTutorialMode) {
            this.setDisplay('undo-btn', 'inline-block');
        } else {
            this.setDisplay('undo-btn', 'none');
        }
    },

    toggleOnlineUILayout(active, oppName = "", oppAvatar = "❓") {
        const normalState = active ? 'none' : 'inline-block';
        const flexState = active ? 'none' : 'flex';
        const onlineState = active ? 'inline-block' : 'none';
        
        window.isMatchRunning = active;
        
        const displays = {
            'reset-btn': normalState, 
            'custom-diff-btn': normalState, 
            'online-toggle-btn': flexState,
            'store-portal-corner-btn': flexState,
            'lucky-spin-portal-btn': flexState, 
            'hamburger-menu-btn': flexState,
            'bag-quick-btn': 'none',
            'resign-btn': onlineState, 
            'undo-btn': 'none', 
            'match-players-card': active ? 'flex' : 'none',
            'gameChatBtn': active ? 'flex' : 'none',
            'mic-toggle-btn': active ? 'flex' : 'none'
        };
        Object.keys(displays).forEach(id => this.setDisplay(id, displays[id]));
        
        if (active && gameState.userProfile) {
            this.applyAvatar('card-my-avatar', gameState.userProfile.avatar, gameState.userProfile.isCustomAvatar);
            this.setTxt('card-my-name', gameState.userProfile.name || t('badge_you'));
            this.setTxt('card-opp-name', oppName);
            this.applyAvatar('card-opp-avatar', oppAvatar, oppAvatar?.startsWith('data:image'));
            
            let myLvlInfo = this.calculateLevelInfo(gameState.userProfile.xp || 0);
            let myCardLevel = this.getEl('card-my-level');
            if (myCardLevel) myCardLevel.textContent = `Lv.${myLvlInfo.level}`;
            
            let oppCardLevel = this.getEl('card-opp-level');
            if (oppCardLevel) {
                if (gameState.currentOpponentXp !== undefined) {
                    let oppLvlInfo = this.calculateLevelInfo(gameState.currentOpponentXp);
                    oppCardLevel.textContent = `Lv.${oppLvlInfo.level}`;
                    oppCardLevel.style.background = "#ff453a"; 
                } else {
                    oppCardLevel.textContent = `Lv.?`;
                    oppCardLevel.style.background = "#555";
                }
            }
            
            const vsTextEl = document.querySelector('.match-vs-text');
            if (vsTextEl) {
                if (gameState.roomBet && gameState.roomBet > 0) {
                    vsTextEl.innerHTML = `VS<br><span style="font-size:14px; color:#ffd700; text-shadow:0 0 8px rgba(255, 215, 0, 0.5); display:block; margin-top:2px;">💰 ${gameState.roomBet * 2}</span>`;
                } else {
                    vsTextEl.innerHTML = `VS`;
                }
            }
        }
    },

    updateVirtualBoardState() {
        const board = this.getEl('board');
        if (!board) return;
        
        let cellIndex = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = board.children[cellIndex++];
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
        
        const isWhite = gameState.playerColor === 'white';
        
        const oppRow = this.getEl('opponent-score-row');
        const myRow = this.getEl('my-score-row');
        
        if (oppRow && myRow) {
            const oppStonesColor = isWhite ? 'black' : 'white';
            const myStonesColor = gameState.playerColor;

            oppRow.style.background = `var(--opp-score-bg, ${(oppStonesColor === 'black') ? 'var(--light-cell)' : 'var(--dark-cell)'})`;
            myRow.style.background = `var(--my-score-bg, ${(myStonesColor === 'black') ? 'var(--light-cell)' : 'var(--dark-cell)'})`;
            
            oppRow.style.border = 'var(--opp-score-border, 1px solid rgba(255,255,255,0.1))';
            myRow.style.border = 'var(--my-score-border, 1px solid rgba(255,255,255,0.1))';
            
            oppRow.style.boxShadow = 'inset 0 4px 8px rgba(0,0,0,0.5)';
            myRow.style.boxShadow = 'inset 0 4px 8px rgba(0,0,0,0.5)';
        }

        const renderScoreDots = (container, count, color) => {
            if (!container) return;
            container.innerHTML = '';
            const activeClass = color === 'white' ? 'white' : 'black';
            for (let i = 0; i < 16; i++) {
                const dot = document.createElement('div');
                if (i < count) {
                    dot.className = `piece mini ${activeClass}`;
                } else {
                    dot.className = `mini-piece-empty`;
                }
                container.appendChild(dot);
            }
        };
        
        renderScoreDots(oppRow, isWhite ? blackCount : whiteCount, isWhite ? 'black' : 'white');
        renderScoreDots(myRow, isWhite ? whiteCount : blackCount, gameState.playerColor);
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
        
        let cellIndex = 0;
        for (let dr = 0; dr < 8; dr++) {
            for (let dc = 0; dc < 8; dc++) {
                const r = flip ? 7 - dr : dr;
                const c = flip ? 7 - dc : dc;
                
                const cell = board.children[cellIndex++];
                if (!cell) continue;
                
                const boardVal = gameState.virtualBoard[r][c];
                let currentPiece = cell.firstElementChild; 
                
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
        gameState.gameId = Date.now();
        if (gameState.aiTimeout) {
            clearTimeout(gameState.aiTimeout);
            gameState.aiTimeout = null;
        }

        gameState.virtualBoard = Array(8).fill(null).map(() => Array(8).fill(null));
        gameState.isGameActive = false;
        window.isMatchRunning = false;
        
        gameState.isMultiJumping = false;
        gameState.jumpsCount = 0;
        gameState.requiredJumps = 0;
        gameState.selectedPiece = null;
        gameState.lastJumpDir = { dr: null, dc: null };
        gameState.boardHistory = []; 
        gameState.boardHistoryStr = [];
        gameState.movesWithoutProgress = 0;

        this.toggleOfflineInMatchUI(false);
        this.toggleOnlineUILayout(false); 
        document.body.classList.remove('game-active');
        
        if (typeof restoreOfflineHintSystem === 'function') {
            restoreOfflineHintSystem();
        }
        
        this.clearHighlights();
        document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
        document.querySelectorAll('.piece.forced').forEach(p => p.classList.remove('forced'));
        document.querySelectorAll('.piece.multi-choice').forEach(p => p.classList.remove('multi-choice'));
        
        const tInd = this.getEl('turn-indicator');
        if (tInd) {
            tInd.textContent = t('press_start');
            tInd.style.color = "#a1a1aa";
        }
        this.setTxt('turn-countdown', '');
        
        this.renderBoard(true);
    },

    initBoard() {
        this.drawEmptyBoard(); 
        
        gameState.botMoveCount = 0;
        gameState.boardHistory = []; 
        gameState.boardHistoryStr = [];
        gameState.movesWithoutProgress = 0;

        const tutorialCheck = document.getElementById('tutorial-mode-checkbox');
        if (!gameState.isOnlineMode && tutorialCheck) {
            gameState.isTutorialMode = tutorialCheck.checked;
        } else {
            gameState.isTutorialMode = false;
        }

        gameState.isGameActive = true;
        window.isMatchRunning = true;
        document.body.classList.add('game-active');
        
        if (!gameState.isOnlineMode) {
            this.toggleOfflineInMatchUI(true);
        }
        
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
        gameState.blockGameOverModal = true;
        
        setTimeout(() => { gameState.blockGameOverModal = false; }, 1000);
        
        this.renderBoard(true);
        
        gameState.boardHistory.push({
            board: gameState.virtualBoard.map(row => [...row]), 
            turn: gameState.currentTurn
        });
        
        saveGameState();
        this.updateProfileUI(); 
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
        
        let hasPlayedTick = false; 
        
        const updateTimerDisplay = () => {
            if (gameState.turnEndTime) {
                gameState.turnTimeLeft = Math.max(0, Math.ceil((gameState.turnEndTime - Date.now()) / 1000));
            } else {
                gameState.turnTimeLeft--;
            }

            this.setTxt('turn-countdown', `${t('time_left')} ${gameState.turnTimeLeft}s`);
            
            if (gameState.turnTimeLeft <= 10 && gameState.turnTimeLeft > 0 && !hasPlayedTick) {
                hasPlayedTick = true;
                this.playSound(sfx.clock);
            }
            
            if (gameState.turnTimeLeft <= 0) {
                clearInterval(gameState.turnTimerInterval);
                gameState.turnTimerInterval = null;
                sfx.clock.pause();
                sfx.clock.currentTime = 0;
                
                this.setTxt('turn-countdown', t('syncing'));
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

        this.updateVirtualBoardState();

        let repCount = gameEngine.checkRepetitionAndStalling();
        if (repCount === 3 && gameState.currentTurn === gameState.playerColor && !gameState.isBotOpponent) {
            this.showCustomAlert("تنبيه: اللعب السلبي وتكرار نفس الحركات سيؤدي إلى خسارتك فوراً!", "تحذير المماطلة");
        } else if (repCount >= 4) {
            if (gameState.blockGameOverModal) return;
            let winnerColor = gameState.currentTurn === 'white' ? 'black' : 'white';
            if (tInd) {
                tInd.textContent = "خسارة بسبب المماطلة 🚫";
                tInd.style.color = "#e74c3c";
            }
            gameEngine.endGame(winnerColor);
            return;
        }

        if (gameState.movesWithoutProgress >= 40 || gameEngine.checkIdleDraw(gameState.virtualBoard, gameState.currentTurn)) {
            if (gameState.blockGameOverModal) return;
            if (tInd) {
                tInd.textContent = "تم إعلان التعادل 🤝";
                tInd.style.color = "#f1c40f";
            }
            gameEngine.endGame('draw');
            return;
        }

        if (!gameState.isOnlineMode) {
            if (!gameState.boardHistory) gameState.boardHistory = [];
            let currentBoardStr = JSON.stringify(gameState.virtualBoard);
            let lastSavedStr = gameState.boardHistory.length > 0 ? JSON.stringify(gameState.boardHistory[gameState.boardHistory.length - 1].board) : "";
            if (currentBoardStr !== lastSavedStr) {
                gameState.boardHistory.push({
                    board: gameState.virtualBoard.map(row => [...row]), 
                    turn: gameState.currentTurn
                });
                if (gameState.boardHistory.length > 6) gameState.boardHistory.shift();
            }
        }
        
        gameState.lastJumpDir = { dr: null, dc: null };
        document.querySelectorAll('.piece.forced').forEach(p => p.classList.remove('forced'));
        document.querySelectorAll('.piece.multi-choice').forEach(p => p.classList.remove('multi-choice'));
        
        const isBoardEmpty = gameState.virtualBoard.every(row => row.every(cell => cell === null));
        
        // حساب الحركات المتوفرة للون الذي عليه الدور فقط لتقليل الحمل على المعالج
        let currentAvailableMoves = 1; 
        if (!isBoardEmpty) {
            currentAvailableMoves = gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard).length;
        }
        
        if (!isBoardEmpty && currentAvailableMoves === 0) {
            if (gameState.blockGameOverModal) return; 
            
            let winnerColor = gameState.currentTurn === 'white' ? 'black' : 'white';
            tInd.textContent = winnerColor === 'white' ? t('white_wins') : t('black_wins');
            tInd.style.color = "#2ecc71";
            
            this.showResultsModal(winnerColor);
            return;
        }
        
        // تخزين بيانات القفزات لعدم تكرار استدعاء الدالة المعقدة
        let maxJ = 0;
        let piecesJumps = []; 
        
        if (gameState.isMultiJumping && gameState.selectedPiece) {
            let cell = gameState.selectedPiece.parentElement;
            let r = parseInt(cell.dataset.row);
            let c = parseInt(cell.dataset.col);
            maxJ = gameEngine.findMaxJumps(r, c, gameState.currentTurn, gameState.virtualBoard);
            piecesJumps.push({ r, c, jumps: maxJ });
        } else {
            gameState.virtualBoard.forEach((row, r) => {
                row.forEach((p, c) => {
                    if (p?.startsWith(gameState.currentTurn)) {
                        let jumps = gameEngine.findMaxJumps(r, c, gameState.currentTurn, gameState.virtualBoard);
                        maxJ = Math.max(maxJ, jumps);
                        if (jumps > 0) piecesJumps.push({ r, c, jumps }); 
                    }
                });
            });
        }
        
        gameState.requiredJumps = maxJ;
        gameState.jumpsCount = 0;
        gameState.isMultiJumping = false;
        
        if (gameState.requiredJumps > 0) {
            tInd.textContent = `${t('forced')} ${gameState.requiredJumps}`;
            tInd.style.color = "#e74c3c";
            
            let fList = [];
            piecesJumps.forEach(piece => {
                if (piece.jumps === gameState.requiredJumps) {
                    let cell = this.getEl('board').querySelector(`[data-row="${piece.r}"][data-col="${piece.c}"]`);
                    if (cell?.children.length > 0) {
                        cell.children[0].classList.add('forced');
                        fList.push({ el: cell.children[0], r: piece.r, c: piece.c });
                    }
                }
            });

            if (fList.length > 1) {
                fList.forEach(item => item.el.classList.add('multi-choice'));
            }
            
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
                tInd.textContent = gameState.currentTurn === gameState.myOnlineColor ? t('turn_yours') : t('turn_opps');
            } else if (gameState.currentTurn === gameState.playerColor) {
                tInd.textContent = t('turn');
            } else {
                tInd.textContent = t('aiTurn');
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
        let depth = [1, 2, 3, 4, 5, 6, 6, 7, 8][Math.max(0, Math.min(level - 1, 8))];
        let randomChance = [0.6, 0.3, 0.1, 0, 0, 0, 0, 0, 0][Math.max(0, Math.min(level - 1, 8))];
        
        let moves = gameEngine.generateAllTurnMoves(aiColor, gameState.virtualBoard);
        if (moves.length === 0) return;

        const self = this;
        const gameId = gameState.gameId || Date.now();
        gameState.gameId = gameId; 

        // 🔥 تم تحديث أوقات الـ Fallback لتتطابق مع Worker
        let fallbackWaitTime = 1500; 
        if (level === 4) fallbackWaitTime = 2500;
        else if (level === 5) fallbackWaitTime = 4000;
        else if (level === 6) fallbackWaitTime = 6000;
        else if (level >= 7) fallbackWaitTime = 8000;

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
                    
                    gameState.movesWithoutProgress = 0;
                    gameState.boardHistoryStr = [];
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
                    let isPromotion = false;
                    
                    if (finalCell?.children.length > 0) {
                        const isWhitePiece = finalCell.children[0].classList.contains('white');
                        let realPromoRow = gameState.pieceDirection[isWhitePiece ? 'white' : 'black'] === 1 ? 7 : 0;
                        if (last.toR === realPromoRow && !finalCell.children[0].classList.contains('dama')) {
                            finalCell.children[0].classList.add('dama');
                            self.playSound(sfx.kingCreated);
                            isPromotion = true;
                        }
                    }
                    
                    if (isPromotion) {
                        gameState.movesWithoutProgress = 0;
                        gameState.boardHistoryStr = [];
                    } else if (chosenMove.some(s => s.midR === null)) { 
                        gameState.movesWithoutProgress++;
                        gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard));
                    }

                    self.highlightMove({ r: startRow, c: startCol }, { r: last.toR, c: last.toC });
                    gameState.currentTurn = gameState.playerColor;
                    saveGameState();
                    self.startTurn();
                    return;
                }
                
                let delay = (gameState.isOnlineMode || step.midR !== null) ? 400 : (gameState.botMoveCount < 7 ? 600 : Math.floor(Math.random() * 500) + 400);
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
                let fallbackSafetyTimer = setTimeout(() => {
                    worker.onmessage = null;
                    worker.onerror = null;
                    
                    let safeDepth = depth > 4 ? 4 : depth; 
                    let syncMove = gameAI.minimax(gameState.virtualBoard, safeDepth, undefined, undefined, true, aiColor, gameState.pieceDirection, Date.now(), fallbackWaitTime).move || moves[0];
                    processMove(syncMove);
                }, fallbackWaitTime + 500);

                worker.onmessage = function(e) {
                    clearTimeout(fallbackSafetyTimer); 
                    worker.onmessage = null; 
                    worker.onerror = null;
                    let chosenMove = e.data.move || moves[0];
                    processMove(chosenMove);
                };
                
                worker.onerror = function(err) {
                    clearTimeout(fallbackSafetyTimer);
                    worker.onmessage = null;
                    worker.onerror = null;
                    let safeDepth = depth > 4 ? 4 : depth;
                    let syncMove = gameAI.minimax(gameState.virtualBoard, safeDepth, undefined, undefined, true, aiColor, gameState.pieceDirection, Date.now(), fallbackWaitTime).move || moves[0];
                    processMove(syncMove);
                };
                
                worker.postMessage({
                    board: gameState.virtualBoard,
                    depth: depth,
                    level: level, 
                    aiColor: aiColor,
                    pieceDirection: gameState.pieceDirection 
                });
            } else {
                let chosenMove = gameAI.minimax(gameState.virtualBoard, depth > 4 ? 4 : depth, undefined, undefined, true, aiColor, gameState.pieceDirection, Date.now(), fallbackWaitTime).move || moves[0];
                processMove(chosenMove);
            }
        }
    },

    showOnlineResultsModal(winnerColor) {
        this.showResultsModal(winnerColor);
    },

    showResultsModal(winnerColor) {
        clearInterval(gameState.turnTimerInterval); 
        gameState.turnTimerInterval = null;
        sfx.clock.pause(); 
        sfx.clock.currentTime = 0; 
        this.setTxt('turn-countdown', '');

        this.setDisplay('match-players-card', 'none');

        const oldModal = this.getEl('custom-results-modal-container');
        if (oldModal) oldModal.remove();

        this.playSound(sfx.win);
        
        if (typeof window.closeAppModal === 'function') window.closeAppModal('game-over-modal');
        else this.setDisplay('game-over-modal', 'none');

        const container = this.makeEl('div', 'custom-results-modal-container', "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,18,25,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;z-index:999999;font-family:sans-serif;direction:rtl;box-sizing:border-box;padding:20px;");
        container.id = 'custom-results-modal-container';
        
        const box = this.makeEl('div', null, "background:rgba(45,48,55,0.65);backdrop-filter:blur(35px);-webkit-backdrop-filter:blur(35px);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:35px 25px;border-radius:32px;width:100%;max-width:320px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05);");
        
        box.appendChild(this.makeEl('h3', null, "margin:0 0 15px 0;color:#87ceeb;font-size:26px;font-weight:700;text-align:center;", t('go_title')));
        
        const isDraw = winnerColor === 'draw';
        const iconStr = isDraw ? "🤝" : "🏆";
        const trophy = this.makeEl('div', null, "font-size:50px;margin:10px 0 20px 0;text-shadow:0 0 15px rgba(255,215,0,0.4);", iconStr);
        box.appendChild(trophy);
        
        const isMeWin = winnerColor === (gameState.isOnlineMode ? gameState.myOnlineColor : gameState.playerColor);
        
        const createPlayerBox = (name, avatar, isCustom, isWin, isDrawMatch) => {
            const pBox = this.makeEl('div', null, "display:flex;flex-direction:column;align-items:center;width:45%;");
            
            const avContainer = this.makeEl('div', null, "border-radius:50%;padding:4px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);box-shadow:0 10px 25px rgba(0,0,0,0.2);");
            const av = this.makeEl('div', null, "width:56px;height:56px;border-radius:50%;display:flex;justify-content:center;align-items:center;font-size:28px;background-size:cover;background-position:center;overflow:hidden;");
            this.applyAvatar(av, avatar, isCustom);
            av.style.border = "none";
            avContainer.appendChild(av);
            
            const nameSpan = this.makeEl('span', null, "margin-top:8px;font-size:13px;font-weight:600;color:#ffffff;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", name);
            
            let statusBg = isWin ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)';
            let statusColor = isWin ? '#30d158' : '#ff453a';
            let statusBorder = isWin ? 'rgba(48,209,88,0.3)' : 'rgba(255,69,58,0.3)';
            let statusText = isWin ? t('winner') : t('loser');

            if (isDrawMatch) {
                statusBg = 'rgba(241, 196, 15, 0.15)';
                statusColor = '#f1c40f';
                statusBorder = 'rgba(241, 196, 15, 0.3)';
                statusText = 'تعادل';
            }

            const statusSpan = this.makeEl('span', null, `font-size:12px;margin-top:8px;padding:4px 12px;border-radius:50px;font-weight:600;background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};display:inline-block;`, statusText);
            
            pBox.append(avContainer, nameSpan, statusSpan);
            return pBox;
        };
        
        const flex = this.makeEl('div', null, "display:flex;justify-content:center;align-items:center;gap:20px;margin:15px 0;");
        
        let oppName = gameState.currentOpponentName;
        let oppAvatar = gameState.currentOpponentAvatar;
        if (!gameState.isOnlineMode) {
            oppName = t('ai');
            oppAvatar = "AI_BOT";
        }

        if (gameState.userProfile) {
            flex.append(
                createPlayerBox(gameState.userProfile.name, gameState.userProfile.avatar, gameState.userProfile.isCustomAvatar, isMeWin, isDraw), 
                createPlayerBox(oppName || t('mm_opp'), oppAvatar, oppAvatar?.startsWith('data:image'), !isMeWin, isDraw)
            );
        }
        box.appendChild(flex);
        
        const btns = this.makeEl('div', null, "display:flex;gap:10px;width:100%;margin-top:25px;");
        const rBtn = this.makeEl('button', 'modal-btn-rematch', "flex:1;background:rgba(135,206,235,0.15);color:#87ceeb;border:1px solid rgba(135,206,235,0.3);border-radius:50px;height:50px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1);outline:none;box-shadow:0 0 3px rgba(135,206,235,0.3);", t('go_rematch'));
        rBtn.id = 'modal-btn-rematch';
        rBtn.onmouseenter = () => rBtn.style.transform = 'scale(0.96)';
        rBtn.onmouseleave = () => rBtn.style.transform = 'scale(1)';
        
        this.clickHandlers.set('modal-btn-rematch', () => {
            rBtn.disabled = true; 
            rBtn.style.opacity = '0.6';
            rBtn.style.cursor = 'not-allowed';
            rBtn.textContent = t('waiting'); 
            
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
        
        const eBtn = this.makeEl('button', 'modal-btn-exit', "flex:1;background:rgba(255,69,58,0.15);color:#ff453a;border:1px solid rgba(255,69,58,0.3);border-radius:50px;height:50px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1);outline:none;box-shadow:0 0 3px rgba(255,69,58,0.3);", t('exit'));
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
            
            this.drawEmptyBoard();
        });
        
        btns.append(rBtn, eBtn); 
        box.appendChild(btns); 
        container.appendChild(box); 
        document.body.appendChild(container);

        if (gameState.userProfile) { 
            const isServerConnected = (typeof socket !== 'undefined' && socket && socket.connected);

            if (isServerConnected) {
                if (!gameState.isOnlineMode && gameState.isTutorialMode) {
                    box.appendChild(this.makeEl('div', 'tutorial-alert', "margin-top:15px;color:#a1a1aa;font-weight:600;font-size:13px;", t('tutorial_mode') || "وضع تعليمي (بدون جوائز) 🚫🪙"));
                } else {
                    let displayReward = 0;
                    let xpGained = 0; 
                    let isBossLevel = false;
                    let isBetMatch = false;
                    let lvl = parseInt(this.getVal('diff-quick-select', '3')) || 3;
                    
                    let isMatchmaking = gameState.isOnlineMode && gameState.onlineRoomID && gameState.onlineRoomID.startsWith('MM-');

                    if (gameState.isOnlineMode) {
                        if (gameState.roomBet && gameState.roomBet > 0) isBetMatch = true;

                        if (isMatchmaking) {
                            if (isDraw) {
                                xpGained = 15;
                                displayReward = isBetMatch ? 0 : 25;
                            } else {
                                xpGained = isMeWin ? 50 : 15; 
                                displayReward = isBetMatch ? gameState.roomBet : (isMeWin ? 120 : 10);
                            }
                        } else {
                            xpGained = 0;
                            if (isDraw) {
                                displayReward = 0; 
                            } else {
                                displayReward = isBetMatch ? gameState.roomBet : 0;
                            }
                        }
                    } else {
                        if (isMeWin) {
                            xpGained = 25;
                            if (lvl <= 2) displayReward = 10;
                            else if (lvl <= 4) displayReward = 15;
                            else if (lvl <= 6) displayReward = 50;
                            else if (lvl <= 8) displayReward = 100;
                            else if (lvl === 9) {
                                displayReward = "100 أو 400";
                                isBossLevel = true;
                            }
                        } else {
                            xpGained = 0;
                            displayReward = 0;
                        }
                    }

                    if (displayReward !== 0 || isDraw || (isBetMatch && !isDraw && !isMeWin)) {
                        let rewardText = "";
                        let alertColor = "#f5a623";

                        if (isBetMatch) {
                            if (isDraw) {
                                rewardText = `🤝 تم استرداد الرهان بأمان`;
                                alertColor = "#f1c40f"; 
                            } else if (isMeWin) {
                                rewardText = `💰 جائزة الرهان: +${displayReward} 🪙`;
                                alertColor = "#30d158"; 
                            } else {
                                rewardText = `💸 خسارة الرهان: -${gameState.roomBet} 🪙`;
                                alertColor = "#ff453a"; 
                            }
                        } else if (isBossLevel) {
                            rewardText = `👑 مكافأة الزعيم: +${displayReward} 🪙`;
                        } else if (displayReward > 0) {
                            rewardText = `${(t('tokenReward') || 'المكافأة:')} +${displayReward} 🪙`;
                            alertColor = isMeWin ? "#f5a623" : "#87ceeb"; 
                        }
                        
                        if (rewardText !== "") {
                            box.appendChild(this.makeEl('div', 'token-reward-alert', `margin-top:15px;color:${alertColor};font-weight:700;font-size:15px;`, rewardText));
                        }
                    }

                    if (xpGained > 0) {
                        box.appendChild(this.makeEl('div', 'xp-reward-alert', "margin-top:8px; color:#34c759; font-weight:800; font-size:15px; text-shadow: 0 0 8px rgba(52, 199, 89, 0.4); animation: modalFadeIn 0.5s ease;", `✨ اكتساب الخبرة: +${xpGained} XP`));
                    }

                    if (!gameState.isOnlineMode && isMeWin) {
                        socket.emit('claimBotReward', { isWin: true, level: lvl });
                    }
                }
            } else {
                const offlineMsg = t('offline_mode') || "أنت تلعب بدون إنترنت (لن يتم حساب الخبرة أو الجوائز)";
                box.appendChild(this.makeEl('div', 'offline-alert', "margin-top:15px;color:#a1a1aa;font-weight:600;font-size:13px;", offlineMsg));
            }
            
            if (window.parent) {
                window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
            }
            this.updateProfileUI(); 
        }
        this.toggleOfflineInMatchUI(false);
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
        
        let prof = gameState.userProfile;
        let lvlInfo = this.calculateLevelInfo(prof.xp || 0);

        const badgeLevel = this.getEl('badge-level');
        const xpProgressPath = this.getEl('xp-progress-path'); 

        if (badgeLevel) badgeLevel.textContent = `Lv.${lvlInfo.level}`;
        
        if (xpProgressPath) {
            const totalLength = xpProgressPath.getTotalLength ? xpProgressPath.getTotalLength() : 150; 
            const progress = Math.min(Math.max(lvlInfo.percentage / 100, 0), 1);
            const newOffset = totalLength - (totalLength * progress);
            
            xpProgressPath.style.strokeDasharray = totalLength;
            xpProgressPath.style.strokeDashoffset = newOffset;
        }

        const igpLevel = this.getEl('igp-level');
        const igpRing = this.getEl('igp-xp-ring');
        const igpRank = this.getEl('igp-rank-title');
        const igpXpFill = this.getEl('igp-xp-fill');
        const igpXpText = this.getEl('igp-xp-text');

        if (igpLevel) igpLevel.textContent = `Lv.${lvlInfo.level}`;
        
        if (igpRing) {
            igpRing.style.background = `conic-gradient(#34c759 ${lvlInfo.percentage}%, rgba(255,255,255,0.1) ${lvlInfo.percentage}%)`;
        }

        if (igpRank) igpRank.innerHTML = `الرتبة: ${lvlInfo.rankIcon} ${lvlInfo.rank} | ${lvlInfo.title}`;
        if (igpXpFill) igpXpFill.style.width = `${lvlInfo.percentage}%`;
        if (igpXpText) igpXpText.textContent = `${lvlInfo.progressXp} / ${lvlInfo.requiredXp} XP`;

        const hintCounter = document.getElementById('hint-counter');
        if (hintCounter) {
            if (gameState.isTutorialMode && !gameState.isOnlineMode) {
                hintCounter.textContent = "مجاني";
                hintCounter.style.fontSize = "8px";
                hintCounter.style.padding = "2px 4px";
            } else if (gameState.userProfile) {
                if (gameState.userProfile.hints === undefined) gameState.userProfile.hints = 5;
                hintCounter.textContent = gameState.userProfile.hints;
                hintCounter.style.fontSize = "11px";
                hintCounter.style.padding = "2px 6px";
            }
        }
        
        const fList = this.getEl('igp-friends-list'); 
        if (fList) {
            fList.innerHTML = '';
            
            if (!gameState.userProfile.friends || gameState.userProfile.friends.length === 0) {
                const noFriendsTxt = this.makeEl('p', null, "text-align:center;color:#a1a1aa;font-size:12px;", t('igp_no_friends'));
                fList.appendChild(noFriendsTxt);
            } else {
                const normalizedFriends = [...new Set((gameState.userProfile.friends || []).map(id => id.toUpperCase()))];
                gameState.userProfile.friends = normalizedFriends;

                gameState.userProfile.friends.forEach(fId => {
                    const fItem = this.makeEl('div', null, "padding:5px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;display:flex;justify-content:space-between;align-items:center;color:white;");
                    
                    const labelSpan = this.makeEl('span', null, "font-weight:600;");
                    labelSpan.textContent = `👤 ${t('friend')} (${fId})`;
                    
                    const actionsDiv = this.makeEl('div', null, "display: flex; gap: 8px;");
                    
                    const challengeBtn = this.makeEl('button', 'challenge-btn', "background:rgba(48,209,88,0.15);border:1px solid rgba(48,209,88,0.3);color:#30d158;border-radius:50px;padding:4px 10px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px;", `⚔️ ${t('challenge')}`);
                    challengeBtn.title = t('challenge');
                    challengeBtn.dataset.action = 'challenge-friend';
                    challengeBtn.dataset.fid = fId;
                    
                    const removeBtn = this.makeEl('button', 'remove-btn', "background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.2);color:#ff453a;border-radius:50px;padding:4px 10px;cursor:pointer;font-size:12px;font-weight:600;", t('remove'));
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
    },

    startOnlineGame() {
        gameState.isOnlineMode = true; 
        gameState.isBotOpponent = false; 
        
        if (socket && !socket.connected) socket.connect();
    }
};

function hasPlayerMoved() {
    if (!gameState.boardHistory) return false;
    
    if (gameState.playerColor === 'white') {
        return gameState.boardHistory.length > 1;
    } else {
        return gameState.boardHistory.length > 2;
    }
}

ui.onClick('reset-btn', () => {
    if (window.isMatchRunning && !gameState.isOnlineMode && !gameState.isGameOver) {
        if (hasPlayerMoved()) {
            ui.showCustomAlert(
                t('new_game_warn'),
                t('alert_title'),
                () => { 
                    if (!gameState.isTutorialMode && gameState.userProfile) {
                        ui.updateProfileUI();
                        if (window.parent) window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
                    }
                    ui.drawEmptyBoard();
                    if (typeof window.openAppModal === 'function') window.openAppModal('new-game-modal');
                    else document.getElementById('new-game-modal').style.display = 'flex';
                },
                true,
                t('btn_cancel'),
                t('resign')
            );
        } else {
            if (typeof window.openAppModal === 'function') window.openAppModal('new-game-modal');
            else document.getElementById('new-game-modal').style.display = 'flex';
        }
    } else {
        if (typeof window.openAppModal === 'function') window.openAppModal('new-game-modal');
        else document.getElementById('new-game-modal').style.display = 'flex';
    }
});

ui.onClick('resign-btn', () => {
    if (gameState.isOnlineMode) {
        ui.showCustomAlert(
            t('resign_confirm'),
            t('alert_title'),
            () => {
                if (socketManager && typeof socketManager.sendSurrender === 'function') {
                    socketManager.sendSurrender();
                }
            },
            true,
            t('btn_cancel'),
            t('alert_ok')
        );
    } else {
        if (!hasPlayerMoved()) {
            ui.showCustomAlert(
                t('confirm_exit_msg'),
                t('confirm_exit_title'),
                () => { 
                    ui.drawEmptyBoard(); 
                },
                true,
                t('btn_cancel'),
                t('alert_ok')
            );
        } else {
            ui.showCustomAlert(
                t('resign_loss_confirm'),
                t('alert_title'),
                () => { 
                    let opponentColor = gameState.playerColor === 'white' ? 'black' : 'white';
                    ui.showResultsModal(opponentColor);
                },
                true,
                t('btn_cancel'),
                t('alert_ok')
            );
        }
    }
});

ui.onClick('undo-btn', () => {
    if (gameState.isOnlineMode || gameState.currentTurn !== gameState.playerColor) return; 

    if (!gameState.boardHistory || gameState.boardHistory.length <= 1) return;

    gameState.gameId = Date.now();
    if (gameState.aiTimeout) {
        clearTimeout(gameState.aiTimeout);
        gameState.aiTimeout = null;
    }

    gameState.boardHistory.pop();
    if (gameState.boardHistoryStr && gameState.boardHistoryStr.length > 0) gameState.boardHistoryStr.pop();

    while (gameState.boardHistory.length > 1 && 
           gameState.boardHistory[gameState.boardHistory.length - 1].turn !== gameState.playerColor) {
        gameState.boardHistory.pop();
        if (gameState.boardHistoryStr && gameState.boardHistoryStr.length > 0) gameState.boardHistoryStr.pop();
    }

    let prevState = gameState.boardHistory[gameState.boardHistory.length - 1];

    if (prevState) {
        gameState.virtualBoard = prevState.board.map(row => [...row]); 
        gameState.currentTurn = prevState.turn;
        
        ui.clearHighlights();
        document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
        if (gameState.selectedPiece) {
            gameState.selectedPiece.classList.remove('selected');
            gameState.selectedPiece = null;
        }
        gameState.isMultiJumping = false;
        gameState.jumpsCount = 0;
        gameState.requiredJumps = 0;
        
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
    
    if (!gameState.isTutorialMode) {
        if (profile.hints === undefined) profile.hints = 5;

        if (profile.hints <= 0) {
            ui.showCustomAlert(t('no_hints'));
            return;
        }
    }

    let myColor = gameState.isOnlineMode ? gameState.myOnlineColor : gameState.playerColor;
    let eleganceMoves = gameEngine.generateAllTurnMoves(myColor, gameState.virtualBoard);
    if (eleganceMoves.length === 0) return;

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
        hintBtn.style.pointerEvents = 'none';
        hintBtn.style.opacity = '0.5';
    }
    
    let currentLevel = parseInt(document.getElementById('diff-quick-select')?.value || '3');
    let botDepthArray = [1, 1, 2, 2, 3, 4, 5, 6, 7]; 
    let botDepth = botDepthArray[Math.max(0, Math.min(currentLevel - 1, 8))];

    let hintDepth = Math.max(4, botDepth + 1);
    if (hintDepth > 8) hintDepth = 8;

    if (hintDepth >= 7) {
        ui.setTxt('turn-countdown', t('hint_hard'));
    } else {
        ui.setTxt('turn-countdown', t('hint_easy'));
    }

    const showGlow = (moveObj) => {
        if (hintBtn) {
            hintBtn.style.pointerEvents = 'auto';
            hintBtn.style.opacity = '1';
        }
        ui.setTxt('turn-countdown', ''); 

        if (!moveObj || moveObj.length === 0) return;
        
        if (!gameState.isTutorialMode) {
            profile.hints--;
            const counterEl = document.getElementById('hint-counter');
            if (counterEl) counterEl.textContent = profile.hints;
            
            if (!gameState.isOnlineMode) {
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                if (window.parent) {
                    window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
                }
            }

            if (socket && socket.connected) {
                socket.emit('useHint'); 
            }
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

    // 🔥 تم تحديث أوقات الـ Fallback لتتطابق مع Worker
    let fallbackWaitTime = 1500;
    if (currentLevel >= 5) fallbackWaitTime = 4000;
    if (currentLevel >= 7) fallbackWaitTime = 8000;

    const worker = getAiWorker();
    if (worker) {
        let fallbackSafetyTimer = setTimeout(() => {
            worker.onmessage = null;
            worker.onerror = null;
            let syncMove = gameAI.minimax(gameState.virtualBoard, 4, undefined, undefined, true, myColor, gameState.pieceDirection, Date.now(), fallbackWaitTime).move;
            showGlow(syncMove || eleganceMoves[0]);
        }, fallbackWaitTime + 500);

        worker.onmessage = (e) => {
            clearTimeout(fallbackSafetyTimer);
            worker.onmessage = null; 
            worker.onerror = null;
            let bestMove = e.data.move;
            showGlow(bestMove || eleganceMoves[0]);
        };
        
        worker.onerror = () => {
            clearTimeout(fallbackSafetyTimer);
            worker.onmessage = null;
            worker.onerror = null;
            let syncMove = gameAI.minimax(gameState.virtualBoard, 4, undefined, undefined, true, myColor, gameState.pieceDirection, Date.now(), fallbackWaitTime).move;
            showGlow(syncMove || eleganceMoves[0]);
        }
        
        worker.postMessage({ 
            board: gameState.virtualBoard, 
            depth: hintDepth, 
            level: currentLevel, 
            aiColor: myColor,
            pieceDirection: gameState.pieceDirection 
        });
    } else {
        setTimeout(() => {
            let bestMove = gameAI.minimax(gameState.virtualBoard, 4, undefined, undefined, true, myColor, gameState.pieceDirection, Date.now(), fallbackWaitTime).move || eleganceMoves[0];
            showGlow(bestMove);
        }, 50);
    }
});

window.ui = ui;
window.updateUITranslations = () => { 
    if (typeof window.updateHtmlTexts === 'function') window.updateHtmlTexts(); 
};

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
                ui.showCustomAlert(t('coming_soon'));
            }
        } else if (action === 'remove-friend') {
            gameState.userProfile.friends = (gameState.userProfile.friends || []).filter(id => id.toUpperCase() !== fId); 
            
            let profileToSave = { ...gameState.userProfile };
            if (gameState.originalHints !== undefined && gameState.originalHints !== null) {
                profileToSave.hints = gameState.originalHints;
            }
            localStorage.setItem('hub_user_profile', JSON.stringify(profileToSave)); 
            
            ui.updateProfileUI();
        }
    }
});

if (!document.getElementById('forced-overlay-style')) {
    const forcedStyle = document.createElement('style');
    forcedStyle.id = 'forced-overlay-style';
    forcedStyle.innerHTML = `
        .cell:has(.piece.multi-choice) {
            position: relative !important;
            border: 2px solid #ff453a !important; 
            animation: dangerPulse 1.2s infinite alternate ease-in-out !important;
            border-radius: inherit;
        }

        @keyframes dangerPulse {
            0% { box-shadow: 0 0 8px #ff453a, inset 0 0 15px rgba(255, 69, 58, 0.5); border-color: #ff453a; }
            100% { box-shadow: 0 0 20px #ff453a, 0 0 30px #ffd700, inset 0 0 35px rgba(255, 69, 58, 0.8); border-color: #ffd700; }
        }

        .cell:has(.piece.multi-choice) .piece {
            z-index: 2 !important; 
            position: relative !important;
            transform: scale(1.08) !important; 
            filter: drop-shadow(0 5px 12px rgba(0,0,0,0.8)) !important; 
            transition: transform 0.2s ease, filter 0.2s ease;
        }
    `;
    document.head.appendChild(forcedStyle);
}

ui.onClick('board', e => {
    if ((gameState.isOnlineMode && gameState.currentTurn !== gameState.myOnlineColor) || (ui.getVal('game-mode') === 'ai' && gameState.currentTurn !== gameState.playerColor && !gameState.onlineRoomID)) return;
    
    const target = e.target;
    const cell = target.classList.contains('cell') ? target : target.parentElement;

    if (target.classList.contains('piece') && !gameState.isMultiJumping) {
        if (gameState.isOnlineMode && !target.classList.contains(gameState.myOnlineColor)) return;
        if ((gameState.currentTurn === 'white' && !target.classList.contains('white')) || (gameState.currentTurn === 'black' && target.classList.contains('white'))) return;
        
        const r = parseInt(cell.dataset.row), c = parseInt(cell.dataset.col);
        if (gameState.requiredJumps > 0 && gameEngine.findMaxJumps(r, c, gameState.currentTurn, gameState.virtualBoard) < gameState.requiredJumps) return;
        
        gameState.moveSequenceStartR = null;
        gameState.moveSequenceStartC = null;
        gameState.movePath = []; 
        
        if (gameState.selectedPiece) gameState.selectedPiece.classList.remove('selected');
        gameState.selectedPiece = target; 
        gameState.selectedPiece.classList.add('selected');
        
        if (gameState.currentTurn !== gameState.playerColor && !gameState.isOnlineMode) { gameState.opponentStartRow = r; gameState.opponentStartCol = c; }
        ui.showValidMovesHighlights(r, c); 
        return;
    }

    if (gameState.selectedPiece && cell.classList.contains('cell') && cell.children.length === 0) {
        const fromRow = parseInt(gameState.selectedPiece.parentElement.dataset.row);
        const fromCol = parseInt(gameState.selectedPiece.parentElement.dataset.col);
        const toRow = parseInt(cell.dataset.row);
        const toCol = parseInt(cell.dataset.col);
        const rDiff = toRow - fromRow; const cDiff = toCol - fromCol;
        const isDama = gameState.selectedPiece.classList.contains('dama');
        const pieceColor = gameState.selectedPiece.classList.contains('white') ? 'white' : 'black';

        if (gameState.moveSequenceStartR === undefined || gameState.moveSequenceStartR === null) {
            gameState.moveSequenceStartR = fromRow;
            gameState.moveSequenceStartC = fromCol;
            gameState.movePath = [{r: fromRow, c: fromCol}];
        }

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
                    let midPiece = gameState.virtualBoard[midRow][midCol];
                    if (midPiece && !midPiece.startsWith(gameState.currentTurn)) isValidJump = true;
                }
            }

            if (isValidJump) {
                let tempBoard = gameState.virtualBoard.map(row => [...row]); 
                let movingPieceStr = tempBoard[fromRow][fromCol];

                tempBoard[midRow][midCol] = null; tempBoard[toRow][toCol] = movingPieceStr; tempBoard[fromRow][fromCol] = null;
                gameState.movePath.push({r: toRow, c: toCol}); 

                if (1 + gameEngine.findMaxJumps(toRow, toCol, gameState.currentTurn, tempBoard, currDr, currDc) === gameState.requiredJumps - gameState.jumpsCount) {
                    if (typeof ui.playSound === 'function') { ui.playSound(gameState.virtualBoard[midRow][midCol]?.includes('dama') ? ui.sfx.kingDied : ui.sfx.piecesDied); }
                    
                    gameState.virtualBoard = tempBoard; gameState.jumpsCount++; gameState.lastJumpDir = { dr: currDr, dc: currDc };
                    if (window.questsManager) { window.questsManager.updateProgress('capture', 1); }

                    let isFinalJump = (gameState.jumpsCount === gameState.requiredJumps);

                    if (isFinalJump) {
                        let promoRow = gameState.pieceDirection[pieceColor] === 1 ? 7 : 0;
                        if (toRow === promoRow && !movingPieceStr.includes('dama')) { 
                            gameState.virtualBoard[toRow][toCol] += '-dama'; 
                            if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.kingCreated); 
                        }
                        
                        gameState.movesWithoutProgress = 0; gameState.boardHistoryStr = [];
                        ui.highlightMove({r: gameState.moveSequenceStartR, c: gameState.moveSequenceStartC}, {r: toRow, c: toCol});
                        gameState.selectedPiece = null; ui.clearHighlights();
                        gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
                        
                        ui.renderBoard();

                        if (socketManager && typeof socketManager.sendMoveToServer === 'function') {
                            socketManager.sendMoveToServer(
                                gameState.moveSequenceStartR, gameState.moveSequenceStartC, 
                                toRow, toCol, gameState.movePath, gameState.currentTurn
                            );
                        }
                        
                        saveGameState(); ui.startTurn();
                        gameState.moveSequenceStartR = null; gameState.moveSequenceStartC = null; gameState.movePath = [];
                    } else { 
                        gameState.isMultiJumping = true; ui.renderBoard();
                        const boardEl = document.getElementById('board');
                        const newCell = boardEl.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
                        if (newCell && newCell.children.length > 0) { gameState.selectedPiece = newCell.children[0]; gameState.selectedPiece.classList.add('selected'); }

                        if (!gameState.isOnlineMode) {
                            if (!gameState.boardHistory) gameState.boardHistory = [];
                            gameState.boardHistory.push({ 
                                board: gameState.virtualBoard.map(row => [...row]), 
                                turn: gameState.currentTurn,
                                moves: gameState.movesWithoutProgress
                            });
                            if (gameState.boardHistory.length > 6) gameState.boardHistory.shift();
                        }
                        ui.showValidMovesHighlights(toRow, toCol); 
                    }
                } else { ui.showCustomAlert(t('must_capture')); }
            }
        } 
        else {
            if ((isDama && gameEngine.isValidDamaMove(fromRow, fromCol, toRow, toCol)) || (!isDama && ((Math.abs(rDiff) === 1 && cDiff === 0 && (rDiff === gameState.pieceDirection[gameState.currentTurn])) || (rDiff === 0 && Math.abs(cDiff) === 1)))) {
                
                let movingPieceStr = gameState.virtualBoard[fromRow][fromCol];
                gameState.virtualBoard[fromRow][fromCol] = null; gameState.virtualBoard[toRow][toCol] = movingPieceStr;
                gameState.movePath.push({r: toRow, c: toCol}); 
                
                let promoRow = gameState.pieceDirection[pieceColor] === 1 ? 7 : 0;
                let isPromotion = false;
                
                if (toRow === promoRow && !movingPieceStr.includes('dama')) { 
                    gameState.virtualBoard[toRow][toCol] += '-dama'; isPromotion = true;
                    if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.kingCreated); 
                }
                
                if (isPromotion || !movingPieceStr.includes('dama')) {
                    gameState.movesWithoutProgress = 0;
                    gameState.boardHistoryStr = [];
                } else {
                    gameState.movesWithoutProgress++;
                    gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard));
                }
                
                if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.move); 
                ui.highlightMove({r: fromRow, c: fromCol}, {r: toRow, c: toCol});
                gameState.selectedPiece = null; ui.clearHighlights();
                gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
                
                ui.renderBoard();

                if (socketManager && typeof socketManager.sendMoveToServer === 'function') {
                    socketManager.sendMoveToServer(
                        fromRow, fromCol, 
                        toRow, toCol, gameState.movePath, gameState.currentTurn
                    ); 
                }
                
                saveGameState(); ui.startTurn();
                gameState.moveSequenceStartR = null; gameState.moveSequenceStartC = null; gameState.movePath = [];
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let globalProfile = localStorage.getItem('hub_user_profile'); let initialAvatar = '1000132081.png';
    if (globalProfile) { const parsed = JSON.parse(globalProfile); if (parsed.avatar) initialAvatar = parsed.avatar; }

    const storedUser = localStorage.getItem('hub_user_profile');
    if (storedUser) {
        let userObj = JSON.parse(storedUser); userObj.avatar = initialAvatar;
        if (typeof window.applyProfileDataToUI === 'function') { window.applyProfileDataToUI(userObj); }
    } else {
        let defaultProfile = { id: '#00000', name: t('badge_you'), avatar: initialAvatar, games: 0, wins: 0, losses: 0, tokens: 0, discountTicket: 0 };
        if (typeof window.applyProfileDataToUI === 'function') { window.applyProfileDataToUI(defaultProfile); }
    }
});

document.addEventListener('click', (e) => {
    if (e.target.id === 'spin-free-btn' || e.target.id === 'spin-paid-btn') {
        const btn = e.target;
        const isFree = btn.id === 'spin-free-btn';
        
        setTimeout(() => {
            if (!window.isSpinning) {
                btn.innerText = isFree ? (window.t ? window.t('spin_free_btn') || "لفة مجانية 🆓" : "لفة مجانية 🆓") : (window.t ? window.t('spin_paid_btn') || "لفة إضافية (200 🪙)" : "لفة إضافية (200 🪙)");
                btn.disabled = false;
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
            }
        }, 5000);

        setTimeout(() => {
            if (window.isSpinning && window.questsManager) {
                window.questsManager.updateProgress('spin');
            }
        }, 500);
    }
});
