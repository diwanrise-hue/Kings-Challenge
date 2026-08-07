/**
 * uiController.js
 * إدارة الواجهة الرسومية والمؤثرات، النوافذ المنبثقة، التبويبات، 
 * نظام البروفايل والأصدقاء، ولوحة الشرف.
 */

import { gameState } from './gameState.js'; 
import { saveGameState, restoreOfflineHintSystem } from './main.js';
import { gameEngine } from './gameEngine.js';
import { gameAI } from './gameAI.js';
import { socket, socketManager } from './socketManager.js';
import { t } from './i18n.js';
import { hintSystem } from './hintSystem.js';

window.t = t; 

// ==========================================
// 🎵 المؤثرات الصوتية
// ==========================================
export const sfx = {
    move: new Audio('move.mp3'),
    piecesDied: new Audio('pieces_died.mp3'),
    kingDied: new Audio('king_died.mp3'),
    kingCreated: new Audio('king_created.mp3'),
    win: new Audio('win.mp3'),
    clock: new Audio('clock.mp3'),
    spinTick: new Audio('spin_tick.mp3') 
};

window.isMatchRunning = false;

window.setAiLevel = function(level) {
    document.getElementById('diff-quick-select').value = level;
    document.getElementById('custom-diff-btn').innerText = 'L' + level;
    
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    let activeBtn = document.getElementById('lvl-btn-' + level);
    if(activeBtn) activeBtn.classList.add('active');
    
    if(typeof window.closeAppModal === 'function') window.closeAppModal('level-select-modal');
};

function getUserIdLocally() {
    let guestId = localStorage.getItem('guestId');
    try { let profile = JSON.parse(localStorage.getItem('hub_user_profile')); return profile ? profile.id : guestId; } 
    catch(e) { return guestId; } 
}

// ==========================================
// 🌟 الكائن الأساسي للتحكم بالواجهة (UI Controller)
// ==========================================
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
            audio.pause(); audio.currentTime = 0; 
            const playPromise = audio.play();
            if (playPromise !== undefined) { playPromise.catch(() => { }); }
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

    showCustomAlert(message, title = null, onConfirm = null, showCancel = false, customCancelText = null, customOkText = null, onCancel = null) {
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
        this.setTxt('custom-alert-cancel', customCancelText || 'إلغاء');
        
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
            if (onConfirm) { try { onConfirm(); } catch(err) { console.error(err); } }
        });

        this.clickHandlers.set('custom-alert-cancel', () => {
            if (modalEl) modalEl.style.display = 'none';
            if (onCancel) { try { onCancel(); } catch(err) { console.error(err); } }
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

        // 🌟 حساب الزاوية لضمان وقوف الإبرة في منتصف الجائزة تماماً
        const extraSpins = 5 * 360; 
        const targetAngle = 360 - ((prizeIndex * 45) + 22.5);
        
        const currentMod = this.currentWheelDeg % 360;
        let diff = targetAngle - currentMod;
        if (diff < 0) diff += 360; 
        
        const totalChange = extraSpins + diff;
        const startDeg = this.currentWheelDeg;
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
                    setTimeout(() => { if (pointer) pointer.style.transform = 'translateX(-50%) rotate(0deg)'; }, 60); 
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
        if(oppContainer) oppContainer.style.animation = "forcedPulse 1s infinite";

        setTimeout(() => {
            if(oppContainer) oppContainer.style.animation = "";
            if(cancelBtn) cancelBtn.style.display = 'block';
            
            let profile = gameState.userProfile || {};
            if (profile.syncThemeOptOut === undefined && !window.hasPromptedThemeSync) {
                window.hasPromptedThemeSync = true; 
                this.showCustomAlert(
                    "هل ترغب في استخدام ساحة اللاعب الأعلى مستوى في المباريات القادمة؟\n(يمكنك تغيير ذلك من الإعدادات لاحقاً)",
                    "مزامنة الساحة 🎨",
                    () => {
                        profile.syncThemeOptOut = false; this.saveAndSyncProfile(profile);
                        const optCb = document.getElementById('sync-theme-optout'); if(optCb) optCb.checked = false;
                        if(onComplete) onComplete();
                    }, true, "لا، ساحتي فقط", "نعم، أوافق",
                    () => {
                        profile.syncThemeOptOut = true; this.saveAndSyncProfile(profile);
                        const optCb = document.getElementById('sync-theme-optout'); if(optCb) optCb.checked = true;
                        if (window.applyTheme && gameState.userProfile) window.applyTheme(gameState.userProfile);
                        if(onComplete) onComplete();
                    }
                );
            } else { if(onComplete) onComplete(); }
        }, 3000);
    },

    saveAndSyncProfile(profile) {
        try {
            localStorage.setItem('hub_user_profile', JSON.stringify(profile));
            if (typeof socket !== 'undefined' && socket && socket.connected) socket.emit('syncProfile', profile); 
        } catch(e) { console.error("Error syncing profile:", e); }
    },

    toggleOfflineInMatchUI(active) {
        if (gameState.isOnlineMode) return;
        window.isMatchRunning = active;
        
        if (active) document.body.classList.add('game-active');
        else document.body.classList.remove('game-active');

        const flexState = active ? 'none' : 'flex';
        const inlineState = active ? 'none' : 'inline-block';
        
        this.setDisplay('online-toggle-btn', flexState);
        this.setDisplay('store-portal-corner-btn', flexState);
        this.setDisplay('lucky-spin-portal-btn', flexState); 
        this.setDisplay('hamburger-menu-btn', flexState);
        this.setDisplay('floating-quests-btn', flexState);
        this.setDisplay('custom-diff-btn', inlineState);
        this.setDisplay('bag-quick-btn', active ? 'flex' : 'none');
        this.setDisplay('resign-btn', active ? 'inline-block' : 'none');
        this.setDisplay('gameChatBtn', 'none');
        this.setDisplay('mic-toggle-btn', 'none');
        
        if (active && gameState.isTutorialMode) this.setDisplay('undo-btn', 'inline-block');
        else this.setDisplay('undo-btn', 'none');
    },

    toggleOnlineUILayout(active, oppName = "", oppAvatar = "❓") {
        const normalState = active ? 'none' : 'inline-block';
        const flexState = active ? 'none' : 'flex';
        const onlineState = active ? 'inline-block' : 'none';
        window.isMatchRunning = active;
        
        if (active) {
            document.body.classList.add('game-active');
            document.body.classList.add('online-mode-active'); 
        } else {
            document.body.classList.remove('game-active');
            document.body.classList.remove('online-mode-active');
            window.hasPromptedThemeSync = false; 
        }

        const displays = {
            'reset-btn': normalState, 'custom-diff-btn': normalState, 'online-toggle-btn': flexState,
            'store-portal-corner-btn': flexState, 'lucky-spin-portal-btn': flexState, 'hamburger-menu-btn': flexState,
            'floating-quests-btn': flexState, 'bag-quick-btn': 'none', 'resign-btn': onlineState, 
            'undo-btn': 'none', 'match-players-card': active ? 'flex' : 'none',
            'gameChatBtn': active ? 'flex' : 'none', 'mic-toggle-btn': active ? 'flex' : 'none'
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
                } else { vsTextEl.innerHTML = `VS`; }
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
                } else { gameState.virtualBoard[r][c] = null; }
            }
        }
        this.updateScoreboard();
    },

    updateScoreboard() {
        let whiteCount = 0, blackCount = 0;
        gameState.virtualBoard.forEach(row => { row.forEach(p => { if (p) { if (p.includes('white')) whiteCount++; else blackCount++; } }); });
        
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
            if (!container) return; container.innerHTML = '';
            const activeClass = color === 'white' ? 'white' : 'black';
            for (let i = 0; i < 16; i++) {
                const dot = document.createElement('div');
                if (i < count) dot.className = `piece mini ${activeClass}`;
                else dot.className = `mini-piece-empty`;
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
            board.innerHTML = ''; board.dataset.flip = String(flip);
            const rowLabels = this.getEl('row-labels'); 
            if (rowLabels) {
                const rev = gameState.isOnlineMode ? gameState.onlineFlip : (gameState.playerColor !== 'white');
                rowLabels.innerHTML = rev 
                    ? '<div>8</div><div>7</div><div>6</div><div>5</div><div>4</div><div>3</div><div>2</div><div>1</div>' 
                    : '<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div>';
            }
            
            for (let dr = 0; dr < 8; dr++) {
                for (let dc = 0; dc < 8; dc++) {
                    const r = flip ? 7 - dr : dr; const c = flip ? 7 - dc : dc;
                    const cell = document.createElement('div');
                    cell.className = `cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
                    cell.dataset.row = r; cell.dataset.col = c;
                    board.appendChild(cell);
                }
            }
        }
        
        let cellIndex = 0;
        for (let dr = 0; dr < 8; dr++) {
            for (let dc = 0; dc < 8; dc++) {
                const r = flip ? 7 - dr : dr; const c = flip ? 7 - dc : dc;
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
                        if (isWhite) { currentPiece.classList.add('white'); currentPiece.classList.remove('black'); } 
                        else { currentPiece.classList.add('black'); currentPiece.classList.remove('white'); }
                        
                        if (isDama) currentPiece.classList.add('dama');
                        else currentPiece.classList.remove('dama');
                    }
                } else if (currentPiece) { cell.removeChild(currentPiece); }
            }
        }
        this.updateScoreboard();
    },

    drawEmptyBoard() {
        gameState.gameId = Date.now();
        if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }

        gameState.virtualBoard = Array(8).fill(null).map(() => Array(8).fill(null));
        gameState.isGameActive = false; window.isMatchRunning = false;
        
        gameState.isMultiJumping = false; gameState.jumpsCount = 0; gameState.requiredJumps = 0;
        gameState.selectedPiece = null; gameState.lastJumpDir = { dr: null, dc: null };
        gameState.boardHistory = []; gameState.boardHistoryStr = []; gameState.movesWithoutProgress = 0;
        gameState.pieceHistories = {};

        this.toggleOfflineInMatchUI(false); this.toggleOnlineUILayout(false); 
        document.body.classList.remove('game-active');
        
        if (typeof restoreOfflineHintSystem === 'function') { restoreOfflineHintSystem(); }
        
        this.clearHighlights();
        document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
        document.querySelectorAll('.piece.forced').forEach(p => p.classList.remove('forced'));
        document.querySelectorAll('.piece.multi-choice').forEach(p => p.classList.remove('multi-choice'));
        
        const tInd = this.getEl('turn-indicator');
        if (tInd) { tInd.textContent = t('press_start'); tInd.style.color = "#a1a1aa"; }
        this.setTxt('turn-countdown', '');
        
        this.renderBoard(true);
    },

    initBoard() {
        this.drawEmptyBoard(); 
        
        gameState.botMoveCount = 0; gameState.boardHistory = []; gameState.boardHistoryStr = []; gameState.movesWithoutProgress = 0;
        gameState.pieceHistories = {};

        const tutorialCheck = document.getElementById('tutorial-mode-checkbox');
        if (!gameState.isOnlineMode && tutorialCheck) { gameState.isTutorialMode = tutorialCheck.checked; } 
        else { gameState.isTutorialMode = false; }

        gameState.isGameActive = true; window.isMatchRunning = true; document.body.classList.add('game-active');
        
        if (!gameState.isOnlineMode) { this.toggleOfflineInMatchUI(true); }
        
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
        
        gameState.currentTurn = 'white'; gameState.blockGameOverModal = true;
        setTimeout(() => { gameState.blockGameOverModal = false; }, 1000);
        
        this.renderBoard(true);
        gameState.boardHistory.push({ board: gameState.virtualBoard.map(row => [...row]), turn: gameState.currentTurn });
        
        saveGameState(); this.updateProfileUI(); this.startTurn();
    },

    clearHighlights() {
        document.querySelectorAll('.cell.highlight').forEach(c => c.classList.remove('highlight'));
    },

    highlightMove(from, to) {
        const board = this.getEl('board'); if (!board) return;
        document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
        const fromCell = board.querySelector(`[data-row="${from.r}"][data-col="${from.c}"]`);
        const toCell = board.querySelector(`[data-row="${to.r}"][data-col="${to.c}"]`);
        
        if (fromCell) fromCell.classList.add('last-move');
        if (toCell) toCell.classList.add('last-move');
    },

    showValidMovesHighlights(r, c) {
        this.clearHighlights();
        const board = this.getEl('board'); if (!board) return;
        
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
        
        sfx.clock.pause(); sfx.clock.currentTime = 0;
        clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null;
        
        let hasPlayedTick = false; 
        
        const updateTimerDisplay = () => {
            if (gameState.turnEndTime) { gameState.turnTimeLeft = Math.max(0, Math.ceil((gameState.turnEndTime - Date.now()) / 1000)); } 
            else { gameState.turnTimeLeft--; }

            this.setTxt('turn-countdown', `${t('time_left')} ${gameState.turnTimeLeft}s`);
            
            if (gameState.turnTimeLeft <= 10 && gameState.turnTimeLeft > 0 && !hasPlayedTick) {
                hasPlayedTick = true; this.playSound(sfx.clock);
            }
            
            if (gameState.turnTimeLeft <= 0) {
                clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null;
                sfx.clock.pause(); sfx.clock.currentTime = 0;
                this.setTxt('turn-countdown', t('syncing'));
            }
        };

        if (!gameState.turnEndTime) { gameState.turnTimeLeft = 45; }
        updateTimerDisplay(); 
        gameState.turnTimerInterval = setInterval(updateTimerDisplay, 1000);
    },

    startTurn() {
        const tInd = this.getEl('turn-indicator'); if (!tInd) return;

        if (gameState.virtualBoard.every(row => row.every(cell => cell === null))) return; 

        this.updateVirtualBoardState();

        // 💡 1. تحديد الاتصال ونوع المباراة
        const isConnected = (typeof socket !== 'undefined' && socket && socket.connected);
        const isBotMatch = !gameState.isOnlineMode;
        
        // 💡 2. الإعفاء من المماطلة
        const isExemptFromStalling = gameState.isTutorialMode || (isBotMatch && !isConnected);

        let myColor = gameState.playerColor;
        let oppColor = myColor === 'white' ? 'black' : 'white';

        let myRep = 0, oppRep = 0;
        if (typeof gameEngine.checkRepetitionAndStalling === 'function') {
            // فحص التكرارات لكلا اللاعبين بشكل مستقل لتجنب الخلط
            myRep = gameEngine.checkRepetitionAndStalling(myColor);
            oppRep = gameEngine.checkRepetitionAndStalling(oppColor);
        }

        // ==========================================
        // 💡 تحديث واجهة العدادات (منفصلة حسب الطلب)
        // ==========================================
        const idleCounter = document.getElementById('idle-counter');
        const repCounter = document.getElementById('repetition-counter');

        if (idleCounter) {
            if (gameState.movesWithoutProgress >= 15 && !isExemptFromStalling) {
                idleCounter.style.display = 'block';
                idleCounter.textContent = `${gameState.movesWithoutProgress}/50`; 
                idleCounter.style.color = gameState.movesWithoutProgress >= 40 ? '#e74c3c' : '#a1a1aa';
                idleCounter.style.borderColor = gameState.movesWithoutProgress >= 40 ? 'rgba(231, 76, 60, 0.4)' : 'rgba(255, 255, 255, 0.1)';
            } else {
                idleCounter.style.display = 'none';
            }
        }

        if (repCounter) {
            // إظهار تحذير التكرار البرتقالي فقط لتكرارات اللاعب الحالي (أنت)
            if (myRep > 1 && !isExemptFromStalling) { 
                repCounter.style.display = 'block';
                repCounter.textContent = `تكرار: ${myRep}/3`;
                repCounter.style.color = myRep === 3 ? '#e74c3c' : '#f5a623';
                repCounter.style.borderColor = myRep === 3 ? 'rgba(231, 76, 60, 0.4)' : 'rgba(245, 166, 35, 0.3)';
            } else {
                repCounter.style.display = 'none';
            }
        }
        // ==========================================

        // 💡 3. معالجة الخسارة والتعادل أولاً لمنع استمرار اللعب
        if (!isExemptFromStalling) {
            // إذا تجاوز الخصم التكرار، تفوز أنت مباشرة
            if (oppRep >= 4) {
                if (gameState.blockGameOverModal) return;
                if (tInd) { tInd.textContent = "فوز! الخصم كرر حركاته 🚫"; tInd.style.color = "#2ecc71"; }
                gameState.isGameOver = true;
                gameState.isGameActive = false;
                if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
                if (gameState.turnTimerInterval) { clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null; }
                this.showResultsModal(myColor); 
                return;
            }
            
            // إذا تجاوزت أنت التكرار، تخسر أنت
            if (myRep >= 4) {
                if (gameState.blockGameOverModal) return;
                if (tInd) { tInd.textContent = "خسارة بسبب التكرار 🚫"; tInd.style.color = "#e74c3c"; }
                gameState.isGameOver = true;
                gameState.isGameActive = false;
                if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
                if (gameState.turnTimerInterval) { clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null; }
                this.showResultsModal(oppColor); 
                return;
            }
        }

        if (gameState.movesWithoutProgress >= 50 || (typeof gameEngine.checkIdleDraw === 'function' && gameEngine.checkIdleDraw(gameState.virtualBoard, gameState.currentTurn))) {
            if (gameState.blockGameOverModal) return;
            if (tInd) { tInd.textContent = "تم إعلان التعادل 🤝"; tInd.style.color = "#f1c40f"; }
            
            gameState.isGameOver = true;
            gameState.isGameActive = false;
            if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
            if (gameState.turnTimerInterval) { clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null; }
            
            this.showResultsModal('draw'); 
            return;
        }

        // 💡 4. تسجيل اللوحة للعب الأوفلاين
        if (!gameState.isOnlineMode) {
            if (!gameState.boardHistory) gameState.boardHistory = [];
            let currentBoardStr = JSON.stringify(gameState.virtualBoard);
            let lastSavedStr = gameState.boardHistory.length > 0 ? JSON.stringify(gameState.boardHistory[gameState.boardHistory.length - 1].board) : "";
            if (currentBoardStr !== lastSavedStr) {
                gameState.boardHistory.push({ board: gameState.virtualBoard.map(row => [...row]), turn: gameState.currentTurn });
                if (gameState.boardHistory.length > 6) gameState.boardHistory.shift();
            }
        }
        
        gameState.lastJumpDir = { dr: null, dc: null };
        document.querySelectorAll('.piece.forced').forEach(p => p.classList.remove('forced'));
        document.querySelectorAll('.piece.multi-choice').forEach(p => p.classList.remove('multi-choice'));
        
        const isBoardEmpty = gameState.virtualBoard.every(row => row.every(cell => cell === null));
        
        let currentAvailableMoves = 1; 
        if (!isBoardEmpty) { currentAvailableMoves = gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard).length; }
        
        if (!isBoardEmpty && currentAvailableMoves === 0) {
            if (gameState.blockGameOverModal) return; 
            let winnerColor = gameState.currentTurn === 'white' ? 'black' : 'white';
            tInd.textContent = winnerColor === 'white' ? t('white_wins') : t('black_wins');
            tInd.style.color = "#2ecc71";
            this.showResultsModal(winnerColor); return;
        }
        
        let maxJ = 0; let piecesJumps = []; 
        
        if (gameState.isMultiJumping && gameState.selectedPiece) {
            let cell = gameState.selectedPiece.parentElement;
            let r = parseInt(cell.dataset.row); let c = parseInt(cell.dataset.col);
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
            tInd.textContent = `${t('forced')} ${gameState.requiredJumps}`; tInd.style.color = "#e74c3c";
            
            let fList = [];
            piecesJumps.forEach(piece => {
                if (piece.jumps === gameState.requiredJumps) {
                    let cell = this.getEl('board').querySelector(`[data-row="${piece.r}"][data-col="${piece.c}"]`);
                    if (cell?.children.length > 0) { cell.children[0].classList.add('forced'); fList.push({ el: cell.children[0], r: piece.r, c: piece.c }); }
                }
            });

            if (fList.length > 1) { fList.forEach(item => item.el.classList.add('multi-choice')); }
            
            if ((gameState.currentTurn === gameState.playerColor || gameState.isOnlineMode) && fList.length === 1) {
                gameState.selectedPiece = fList[0].el; gameState.selectedPiece.classList.add('selected');
                if (gameState.currentTurn === gameState.playerColor) { document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move')); }
                this.showValidMovesHighlights(fList[0].r, fList[0].c);
            }
        } else {
            tInd.style.color = "#f1c40f";
            if (gameState.isOnlineMode) { tInd.textContent = gameState.currentTurn === gameState.myOnlineColor ? t('turn_yours') : t('turn_opps'); } 
            else if (gameState.currentTurn === gameState.playerColor) { tInd.textContent = t('turn'); } 
            else { tInd.textContent = t('aiTurn'); }
        }
        
        this.startTurnTimer();
        
        // 💡 5. معالجة التحذير (التكرار الثالث) وعرضه للاعب المعني فقط
        let isBotTurn = (gameState.currentTurn !== gameState.playerColor && !gameState.onlineRoomID);
        let alertShown = false;

        if (!isExemptFromStalling) {
            if (gameState.currentTurn === gameState.playerColor && myRep === 3) {
                alertShown = true;
                if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
                ui.showCustomAlert("تنبيه: اللعب السلبي وتكرار نفس الحركات للمرة القادمة سيؤدي إلى خسارتك فوراً!", "تحذير المماطلة ⚠️");
            } else if (gameState.isOnlineMode && gameState.currentTurn !== gameState.playerColor && oppRep === 3) {
                ui.showCustomAlert("الخصم يكرر الحركات.. تكراره للحركة القادمة سيمنحك الفوز!", "الخصم يماطل ⏳");
            }
        }

        // تشغيل البوت التلقائي (إذا لم يظهر تنبيه يوقفه)
        if (isBotTurn && !alertShown) {
            tInd.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
            clearTimeout(gameState.aiTimeout);
            gameState.aiTimeout = setTimeout(() => this.triggerComputerMove(), 150);
        }
    },

    async triggerComputerMove() {
        let levelStr = this.getVal('diff-quick-select', '3'); let level = parseInt(levelStr) || 3; 
        let aiColor = gameState.playerColor === 'white' ? 'black' : 'white';
        let moves = gameEngine.generateAllTurnMoves(aiColor, gameState.virtualBoard);
        if (moves.length === 0) return;

        const tInd = this.getEl('turn-indicator');
        if (tInd) tInd.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;

        const gameId = gameState.gameId || Date.now();
        gameState.gameId = gameId; 

        if (window.optimizeMemoryForAI) window.optimizeMemoryForAI(true);
        let startThinkingTime = Date.now();
        let chosenMove = await gameAI.getBestMoveAsync(gameState.virtualBoard, level, aiColor, gameState.pieceDirection);
        let timeSpent = Date.now() - startThinkingTime;
        let humanDelay = Math.floor(Math.random() * 1500) + 1000; 
        
        if (timeSpent < humanDelay) { await new Promise(resolve => setTimeout(resolve, humanDelay - timeSpent)); }
        if (window.optimizeMemoryForAI) window.optimizeMemoryForAI(false);

        if (!chosenMove) chosenMove = moves[0]; 
        if (!Array.isArray(chosenMove)) chosenMove = [chosenMove];

        const self = this;
        let stepIdx = 0; let startRow = chosenMove[0].fromR; let startCol = chosenMove[0].fromC;

        function executeStep() {
            if (gameState.gameId !== gameId) return; 
            if (gameState.currentTurn !== aiColor || gameState.isOnlineMode) return;

            let step = chosenMove[stepIdx]; if (!step) return;
            let board = self.getEl('board'); if (!board) return;
            
            let fCell = board.querySelector(`[data-row="${step.fromR}"][data-col="${step.fromC}"]`);
            let tCell = board.querySelector(`[data-row="${step.toR}"][data-col="${step.toC}"]`);
            
            if (step.midR !== null && step.midC !== null && step.midR !== undefined) {
                self.playSound(gameState.virtualBoard[step.midR][step.midC]?.includes('dama') ? sfx.kingDied : sfx.piecesDied);
                let midCell = board.querySelector(`[data-row="${step.midR}"][data-col="${step.midC}"]`);
                if (midCell) midCell.innerHTML = '';
                gameState.movesWithoutProgress = 0; 
                gameState.boardHistoryStr = [];
                gameState.pieceHistories = {}; // 💡 تصفير التكرار عند الأكل
            }
            
            if (tCell && fCell?.children.length > 0) tCell.appendChild(fCell.children[0]);
            
            self.playSound(sfx.move); stepIdx++; gameState.botMoveCount++;
            
            if (stepIdx >= chosenMove.length) {
                let last = chosenMove[chosenMove.length - 1];
                let finalCell = board.querySelector(`[data-row="${last.toR}"][data-col="${last.toC}"]`);
                let isPromotion = false;
                
                if (finalCell?.children.length > 0) {
                    const isWhitePiece = finalCell.children[0].classList.contains('white');
                    let realPromoRow = gameState.pieceDirection[isWhitePiece ? 'white' : 'black'] === 1 ? 7 : 0;
                    if (last.toR === realPromoRow && !finalCell.children[0].classList.contains('dama')) {
                        finalCell.children[0].classList.add('dama');
                        self.playSound(sfx.kingCreated); isPromotion = true;
                    }
                }
                
                if (isPromotion) { 
                    gameState.movesWithoutProgress = 0; 
                    gameState.boardHistoryStr = []; 
                    gameState.pieceHistories = {}; // 💡 تصفير التكرار عند الترقية
                } else if (chosenMove.some(s => s.midR === null)) { 
                    gameState.movesWithoutProgress++; 
                    gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard)); 
                    if (gameEngine.trackPieceHistory) gameEngine.trackPieceHistory(startRow, startCol, last.toR, last.toC, aiColor);
                }

                self.highlightMove({ r: startRow, c: startCol }, { r: last.toR, c: last.toC });
                gameState.currentTurn = gameState.playerColor; saveGameState(); self.startTurn();
                return;
            }
            let delay = (gameState.isOnlineMode || step.midR !== null) ? 400 : (gameState.botMoveCount < 7 ? 600 : Math.floor(Math.random() * 500) + 400);
            setTimeout(executeStep, delay);
        }
        executeStep();
    },

    showOnlineResultsModal(winnerColor) { this.showResultsModal(winnerColor); },

    showResultsModal(winnerColor) {
        clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null;
        sfx.clock.pause(); sfx.clock.currentTime = 0; this.setTxt('turn-countdown', '');
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

            if (isDrawMatch) { statusBg = 'rgba(241, 196, 15, 0.15)'; statusColor = '#f1c40f'; statusBorder = 'rgba(241, 196, 15, 0.3)'; statusText = 'تعادل'; }

            const statusSpan = this.makeEl('span', null, `font-size:12px;margin-top:8px;padding:4px 12px;border-radius:50px;font-weight:600;background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};display:inline-block;`, statusText);
            
            pBox.append(avContainer, nameSpan, statusSpan);
            return pBox;
        };
        
        const flex = this.makeEl('div', null, "display:flex;justify-content:center;align-items:center;gap:20px;margin:15px 0;");
        
        let oppName = gameState.currentOpponentName; let oppAvatar = gameState.currentOpponentAvatar;
        if (!gameState.isOnlineMode) { oppName = t('ai'); oppAvatar = "AI_BOT"; }

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
        rBtn.onmouseenter = () => rBtn.style.transform = 'scale(0.96)'; rBtn.onmouseleave = () => rBtn.style.transform = 'scale(1)';
        
        this.clickHandlers.set('modal-btn-rematch', () => {
            rBtn.disabled = true; rBtn.style.opacity = '0.6'; rBtn.style.cursor = 'not-allowed'; rBtn.textContent = t('waiting'); 
            
            if (gameState.isOnlineMode && !gameState.isBotOpponent) {
                if (socketManager && typeof socketManager.sendRematchRequest === 'function') socketManager.sendRematchRequest();
            } else { setTimeout(() => { container.remove(); this.initBoard(); }, 500); }
        });
        
        const eBtn = this.makeEl('button', 'modal-btn-exit', "flex:1;background:rgba(255,69,58,0.15);color:#ff453a;border:1px solid rgba(255,69,58,0.3);border-radius:50px;height:50px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1);outline:none;box-shadow:0 0 3px rgba(255,69,58,0.3);", 'خروج');
        eBtn.id = 'modal-btn-exit';
        eBtn.onmouseenter = () => eBtn.style.transform = 'scale(0.96)'; eBtn.onmouseleave = () => eBtn.style.transform = 'scale(1)';
        
        this.clickHandlers.set('modal-btn-exit', () => {
            if (gameState.isOnlineMode && !gameState.isBotOpponent && socket?.connected) {
                socket.emit('leaveRoom', { roomID: gameState.onlineRoomID }); socket.emit('rejectRematch', { roomID: gameState.onlineRoomID });
            }
            container.remove(); 
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('game-over-modal');
            else this.setDisplay('game-over-modal', 'none'); 
            
            if (gameState.turnTimerInterval) { clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null; }
            if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
            
            gameState.isOnlineMode = false; gameState.onlineRoomID = null; 
            this.drawEmptyBoard();
        });
        
        btns.append(rBtn, eBtn); box.appendChild(btns); container.appendChild(box); document.body.appendChild(container);

        if (gameState.userProfile) { 
            const isServerConnected = (typeof socket !== 'undefined' && socket && socket.connected);

            if (isServerConnected) {
                if (!gameState.isOnlineMode && gameState.isTutorialMode) {
                    box.appendChild(this.makeEl('div', 'tutorial-alert', "margin-top:15px;color:#a1a1aa;font-weight:600;font-size:13px;", t('tutorial_mode') || "وضع تعليمي (بدون جوائز) 🚫🪙"));
                } else {
                    let displayReward = 0; let xpGained = 0; let isBossLevel = false; let isBetMatch = false;
                    let lvl = parseInt(this.getVal('diff-quick-select', '3')) || 3;
                    let isMatchmaking = gameState.isOnlineMode && gameState.onlineRoomID && gameState.onlineRoomID.startsWith('MM-');

                    if (gameState.isOnlineMode) {
                        if (gameState.roomBet && gameState.roomBet > 0) isBetMatch = true;

                        if (isMatchmaking) {
                            if (isDraw) { xpGained = 15; displayReward = isBetMatch ? 0 : 25; } 
                            else { xpGained = isMeWin ? 50 : 15; displayReward = isBetMatch ? gameState.roomBet : (isMeWin ? 120 : 10); }
                        } else {
                            xpGained = 0;
                            if (isDraw) { displayReward = 0; } 
                            else { displayReward = isBetMatch ? gameState.roomBet : 0; }
                        }
                    } else {
                        if (isMeWin) {
                            xpGained = 0; 
                            if (lvl <= 2) displayReward = 10;
                            else if (lvl <= 4) displayReward = 15;
                            else if (lvl <= 6) displayReward = 50;
                            else if (lvl <= 8) displayReward = 100;
                            else if (lvl === 9) { displayReward = "100 أو 400"; isBossLevel = true; }
                        } else { xpGained = 0; displayReward = 0; }
                    }

                    if (displayReward !== 0 || isDraw || (isBetMatch && !isDraw && !isMeWin)) {
                        let rewardText = ""; let alertColor = "#f5a623";

                        if (isBetMatch) {
                            if (isDraw) { rewardText = `🤝 تم استرداد الرهان بأمان`; alertColor = "#f1c40f"; } 
                            else if (isMeWin) { rewardText = `💰 جائزة الرهان: +${displayReward} 🪙`; alertColor = "#30d158"; } 
                            else { rewardText = `💸 خسارة الرهان: -${gameState.roomBet} 🪙`; alertColor = "#ff453a"; }
                        } else if (isBossLevel) { rewardText = `👑 مكافأة الزعيم: +${displayReward} 🪙`; } 
                        else if (displayReward > 0) { rewardText = `${(t('tokenReward') || 'المكافأة:')} +${displayReward} 🪙`; alertColor = isMeWin ? "#f5a623" : "#87ceeb"; }
                        
                        if (rewardText !== "") { box.appendChild(this.makeEl('div', 'token-reward-alert', `margin-top:15px;color:${alertColor};font-weight:700;font-size:15px;`, rewardText)); }
                    }

                    if (xpGained > 0) { box.appendChild(this.makeEl('div', 'xp-reward-alert', "margin-top:8px; color:#34c759; font-weight:800; font-size:15px; text-shadow: 0 0 8px rgba(52, 199, 89, 0.4); animation: modalFadeIn 0.5s ease;", `✨ اكتساب الخبرة: +${xpGained} XP`)); }

                    if (!gameState.isOnlineMode && isMeWin) { socket.emit('claimBotReward', { isWin: true, level: lvl }); }
                }
            } else {
                const offlineMsg = t('offline_mode') || "أنت تلعب بدون إنترنت (لن يتم حساب الخبرة أو الجوائز)";
                box.appendChild(this.makeEl('div', 'offline-alert', "margin-top:15px;color:#a1a1aa;font-weight:600;font-size:13px;", offlineMsg));
            }
            
            if (window.parent) window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
            this.updateProfileUI(); 
        }
        this.toggleOfflineInMatchUI(false);
    },

    updateProfileUI() {
        if (!gameState.userProfile) return;
        
        if (gameState.userProfile) {
            if (typeof window.applyTheme === 'function' && !window.isMatchRunning) { window.applyTheme(gameState.userProfile); }
        }

        if (typeof window.applyProfileDataToUI === 'function') { window.applyProfileDataToUI(gameState.userProfile); }
        
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

        const igpLevel = this.getEl('igp-level'); const igpRank = this.getEl('igp-rank-title'); const igpXpFill = this.getEl('igp-xp-fill'); const igpXpText = this.getEl('igp-xp-text');
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
        
        const fList = this.getEl('igp-friends-list'); 
        if (fList) {
            fList.innerHTML = '';
            if (!gameState.userProfile.friends || gameState.userProfile.friends.length === 0) {
                const noFriendsTxt = this.makeEl('p', null, "text-align:center;color:#a1a1aa;font-size:12px;", t('igp_no_friends'));
                fList.appendChild(noFriendsTxt);
            } else {
                let uniqueArr = [];
                let seen = new Set();
                (gameState.userProfile.friends || []).forEach(f => {
                    let fId = typeof f === 'string' ? f.toUpperCase() : (f.id ? f.id.toUpperCase() : null);
                    if (fId && !seen.has(fId)) {
                        seen.add(fId);
                        uniqueArr.push(f);
                    }
                });
                gameState.userProfile.friends = uniqueArr;
                
                // استدعاء دالة بناء الأصدقاء الحديثة 
                renderFriendsList(gameState.userProfile.friends);
            }
        }
    },

    initProfileSystem() {
        let saved = localStorage.getItem('hub_user_profile');
        if (saved) { 
            try {
                const parsed = JSON.parse(saved);
                if (parsed.id) parsed.id = parsed.id.toUpperCase();
                
                if (parsed.friends) {
                    let uniqueArr = [];
                    let seen = new Set();
                    parsed.friends.forEach(f => {
                        let fId = typeof f === 'string' ? f.toUpperCase() : (f.id ? f.id.toUpperCase() : null);
                        if (fId && !seen.has(fId)) {
                            seen.add(fId);
                            uniqueArr.push(f);
                        }
                    });
                    parsed.friends = uniqueArr;
                }
                
                gameState.userProfile = { ...gameState.userProfile, ...parsed }; 
            } catch(e) {}
        }
        this.updateProfileUI(); 
    }
};

// ==========================================
// 🌟 دوال الواجهة العامة (النوافذ والتبويبات والأصدقاء)
// ==========================================

// فتح نافذة إعدادات الغرفة الخاصة بمنشئ الغرفة
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

// دالة حذف الغرفة عبر الزر الأحمر
window.deleteMyRoom = function(roomId) {
    if (typeof ui !== 'undefined' && typeof ui.showCustomAlert === 'function') {
        ui.showCustomAlert(
            "هل أنت متأكد من رغبتك في إغلاق وحذف هذه الغرفة نهائياً؟",
            "حذف الغرفة 🗑️",
            () => {
                if (typeof socket !== 'undefined' && socket && socket.connected) {
                    socket.emit('leaveRoom', { roomID: roomId });
                }
            },
            true, "إلغاء", "نعم، احذفها"
        );
    }
};

window.openAppModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) { 
        modal.style.display = 'flex'; 
        if (!gameState.modalStack.includes(id)) gameState.modalStack.push(id);
        if (id === 'online-modal' && window.socket && window.socket.connected) {
            window.socket.emit('requestActiveRooms');
        }
    }
};

window.closeAppModal = function(id) {
    if (id === 'lucky-spin-modal' && window.isSpinning) return; 
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none'; 
        gameState.modalStack = gameState.modalStack.filter(m => m !== id);
    }
};

window.toggleSideMenu = function() {
    const overlay = document.getElementById('side-menu-overlay');
    if (overlay.classList.contains('open')) overlay.classList.remove('open');
    else overlay.classList.add('open');
};

window.switchQuestTab = function(tab) {
    document.getElementById('quest-tab-daily').classList.remove('active');
    document.getElementById('quest-tab-weekly').classList.remove('active');
    document.getElementById('quests-list-container-daily').style.display = 'none';
    document.getElementById('quests-list-container-weekly').style.display = 'none';
    document.getElementById('quest-tab-' + tab).classList.add('active');
    document.getElementById('quests-list-container-' + tab).style.display = 'flex';
    
    if (window.questsManager) { 
        window.questsManager.currentTab = tab; 
        window.questsManager.updateTimerDisplay(); 
        window.questsManager.renderQuests(tab); // 💡 تحديث الزر فوراً عند التبديل
    }
};

window.switchRoomTab = function(tab) {
    document.getElementById('room-tab-play').classList.remove('active'); document.getElementById('room-tab-bet').classList.remove('active');
    document.getElementById('active-rooms-list').style.display = 'none'; document.getElementById('spectate-rooms-list').style.display = 'none';
    document.getElementById('room-tab-' + tab).classList.add('active'); 
    if (tab === 'play') { document.getElementById('active-rooms-list').style.display = 'block'; } 
    else { document.getElementById('spectate-rooms-list').style.display = 'block'; }
};

window.switchLbTab = function(tab) {
    document.getElementById('lb-tab-wins').classList.remove('active'); document.getElementById('lb-tab-xp').classList.remove('active'); document.getElementById('lb-tab-tokens').classList.remove('active');
    document.getElementById('leaderboard-list-wins').style.display = 'none'; document.getElementById('leaderboard-list-xp').style.display = 'none'; document.getElementById('leaderboard-list-tokens').style.display = 'none';
    document.getElementById('lb-tab-' + tab).classList.add('active'); document.getElementById('leaderboard-list-' + tab).style.display = 'flex';
};

window.selectBetAmount = function(value, displayText, element) {
    if (gameState.isEditingBet) {
        document.getElementById('edit-room-bet-input').value = value; document.getElementById('edit-room-bet-display').innerText = displayText;
    } else {
        document.getElementById('room-bet-input').value = value; document.getElementById('custom-bet-display').innerText = displayText;
    }
    document.querySelectorAll('.bet-option-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    setTimeout(() => window.closeAppModal('bet-selector-modal'), 150);
};

function cleanExpiredRequests(profile) {
    if (!profile.friendRequests) profile.friendRequests = [];
    const now = Date.now(); const threeDays = 3 * 24 * 60 * 60 * 1000;
    profile.friendRequests = profile.friendRequests.filter(req => (now - req.timestamp) < threeDays);
    return profile;
}

// 🌟 تحديث دالة عرض الأصدقاء لإصلاح تشوه الأزرار وتنسيقها للهاتف
function renderFriendsList(friendsArr) {
    const listContainer = document.getElementById('igp-friends-list'); if (!listContainer) return;
    if (!friendsArr || friendsArr.length === 0) { listContainer.innerHTML = 'لا يوجد أصدقاء حالياً'; return; }
    listContainer.innerHTML = '';
    
    // تحويل قائمة IDs إلى كائنات إذا لزم الأمر من خلال البروفايل
    let actualFriends = friendsArr;
    if (friendsArr.length > 0 && typeof friendsArr[0] === 'string') {
        let globalProfile = localStorage.getItem('hub_user_profile');
        if (globalProfile) {
            let prof = cleanExpiredRequests(JSON.parse(globalProfile));
            if(prof.friends && prof.friends.length > 0 && typeof prof.friends[0] === 'object') {
                actualFriends = prof.friends;
            }
        }
    }

    actualFriends.forEach(friend => {
        let div = document.createElement('div');
        // تقليل الـ Padding قليلاً ليتسع للأزرار في الهواتف الصغيرة
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
                <button data-action="challenge-friend" data-fid="${friendId}" style="background:linear-gradient(135deg, #34c759, #28a745); border:none; color:#fff; border-radius:8px; padding:6px 8px; cursor:pointer; font-size:11px; font-weight:bold; box-shadow:0 2px 5px rgba(40,167,69,0.3); transition: transform 0.2s; white-space: nowrap;">
                    تحدي ⚔️
                </button>
                <button data-action="remove-friend" data-fid="${friendId}" style="background:rgba(255,69,58,0.15); border:1px solid rgba(255,69,58,0.3); color:#ff453a; border-radius:8px; padding:6px 8px; cursor:pointer; font-size:11px; font-weight:bold; transition: transform 0.2s; white-space: nowrap;">
                    حذف 🗑️
                </button>
            </div>
        `;
        listContainer.appendChild(div);
    });
}

function renderFriendRequests() {
    let profStr = localStorage.getItem('hub_user_profile'); if (!profStr) return;
    let prof = cleanExpiredRequests(JSON.parse(profStr)); localStorage.setItem('hub_user_profile', JSON.stringify(prof));
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
}

window.acceptFriendReq = function(reqId) {
    let profStr = localStorage.getItem('hub_user_profile'); if(!profStr) return;
    let prof = JSON.parse(profStr); if(!prof.friends) prof.friends = [];
    let reqIndex = prof.friendRequests.findIndex(r => r.id === reqId);
    if(reqIndex !== -1) {
        let acceptedUser = prof.friendRequests[reqIndex];
        if(!prof.friends.find(f => (typeof f === 'string' ? f === reqId : f.id === reqId))) { prof.friends.push({ id: acceptedUser.id, name: acceptedUser.name, avatar: acceptedUser.avatar }); }
        prof.friendRequests.splice(reqIndex, 1); localStorage.setItem('hub_user_profile', JSON.stringify(prof));
        renderFriendRequests(); renderFriendsList(prof.friends);
        const toast = document.getElementById('toast-notification'); if (toast) { toast.innerText = '✅ تمت إضافة الصديق بنجاح!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
    }
};

window.rejectFriendReq = function(reqId) {
    let profStr = localStorage.getItem('hub_user_profile'); if(!profStr) return;
    let prof = JSON.parse(profStr); prof.friendRequests = prof.friendRequests.filter(r => r.id !== reqId);
    localStorage.setItem('hub_user_profile', JSON.stringify(prof)); renderFriendRequests();
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
        let prof = cleanExpiredRequests(JSON.parse(globalProfile)); localStorage.setItem('hub_user_profile', JSON.stringify(prof)); 
        window.applyProfileDataToUI(prof);
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
        renderFriendsList(prof.friends); renderFriendRequests();
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

function fallbackCopyText(text, callback) {
    const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); if (callback) callback(); } catch (err) {}
    document.body.removeChild(textArea);
}

window.copyMyId = function() {
    const idText = document.getElementById('igp-id-display').innerText;
    if (idText && idText !== '...') {
        const showToast = () => { const toast = document.getElementById('toast-notification'); if (toast) { toast.innerText = '📋 تم نسخ الـ ID بنجاح'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); } };
        if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(idText).then(showToast).catch(() => { fallbackCopyText(idText, showToast); }); } else { fallbackCopyText(idText, showToast); }
    }
};

window.createLbItemHTML = function(rank, playerObj, type) {
    let score = playerObj.score; let name = playerObj.name; let avatarStr = playerObj.avatar; let playerRankInfo = playerObj.rankInfo;
    let prefix = type === 'tokens' ? '🪙 ' : (type === 'xp' ? '🌟 ' : '');
    let suffix = type === 'wins' ? ' ' + (window.t ? window.t('igp_wins') : 'فوز') : (type === 'xp' ? ' XP' : '');
    
    if (type === 'xp') {
        let level = Math.floor(Math.sqrt(Math.max(0, score) / 50)) + 1; if (level > 200) level = 200;
        prefix = `<span style="color:#87ceeb; font-weight:800; margin-left:6px; background: rgba(135,206,235,0.15); border: 1px solid rgba(135,206,235,0.3); padding: 2px 6px; border-radius: 6px;">Lv.${level}</span> 🌟 `;
    }

    const div = document.createElement('div'); div.className = 'lb-item';
    let rankIconHTML = playerRankInfo && playerRankInfo.icon ? `<span class="rank-icon-small" title="${playerRankInfo.title}">${playerRankInfo.icon}</span>` : '';
    const nameEl = document.createElement('div'); nameEl.className = 'lb-name'; nameEl.innerHTML = `<span>${name}</span>${rankIconHTML}`;
    div.innerHTML = `
        <div class="lb-rank">#${rank}</div>
        <div class="lb-avatar" style="padding:0; border:2px solid rgba(255,255,255,0.1); display:flex; justify-content:center; align-items:center; overflow:hidden; cursor:pointer; transition:all 0.2s;" title="عرض الملف الشخصي"></div>
        <div class="lb-info">
            <div class="lb-name-container"></div>
            <div class="lb-score" style="display:flex; align-items:center; justify-content:flex-end;">${prefix}${score}${suffix}</div>
        </div>
    `;
    div.querySelector('.lb-name-container').replaceWith(nameEl);
    const avatarContainer = div.querySelector('.lb-avatar');
    
    avatarContainer.onclick = function() { if(window.showPlayerProfileFromLB) window.showPlayerProfileFromLB(playerObj); };
    avatarContainer.onmouseover = () => { avatarContainer.style.transform = 'scale(1.1)'; avatarContainer.style.borderColor = '#3498db'; };
    avatarContainer.onmouseout = () => { avatarContainer.style.transform = 'scale(1)'; avatarContainer.style.borderColor = 'rgba(255,255,255,0.1)'; };

    if (avatarStr && avatarStr !== 'null' && avatarStr !== 'undefined') {
        let imgSrc = avatarStr;
        if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:image')) { let cleanName = imgSrc.replace(/\.\.\//g, '').replace('Photo/', ''); imgSrc = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName; }
        const img = document.createElement('img'); img.style.cssText = "width: 100%; height: 100%; border-radius: 50%; object-fit: cover;";
        img.onerror = function() { avatarContainer.innerHTML = '<span style="font-size: 22px;">👤</span>'; };
        img.src = imgSrc; avatarContainer.appendChild(img);
    } else { avatarContainer.innerHTML = '<span style="font-size: 22px;">👤</span>'; }
    return div;
};

window.populateLeaderboards = function(winsData, xpData, tokensData) {
    const winsList = document.getElementById('leaderboard-list-wins'); const xpList = document.getElementById('leaderboard-list-xp'); const tokensList = document.getElementById('leaderboard-list-tokens');
    winsList.innerHTML = ''; xpList.innerHTML = ''; tokensList.innerHTML = '';
    const emptyText = window.t ? window.t('lb_empty') : 'لا توجد بيانات حالياً';

    const renderList = (container, data, type) => {
        if (!data || data.length === 0) { container.innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px; font-weight: 600;">${emptyText}</div>`; return; }
        for (let i = 0; i < data.length; i++) { container.appendChild(window.createLbItemHTML(i + 1, data[i], type)); }
    };
    renderList(winsList, winsData, 'wins'); renderList(xpList, xpData, 'xp'); renderList(tokensList, tokensData, 'tokens');
};

window.showLeaderboard = function() {
    window.openAppModal('leaderboard-modal'); 
    const loadingText = window.t ? window.t('lb_loading') : 'جاري التحميل...';
    document.getElementById('leaderboard-list-wins').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    document.getElementById('leaderboard-list-xp').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    document.getElementById('leaderboard-list-tokens').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    if(window.socket && window.socket.connected) window.socket.emit('getLeaderboard');
};

// 💡 دوال مساعدة لملف المتجر
window.showEquipNotification = function(itemType) {
    const toast = document.getElementById('toast-notification'); if (!toast) return;
    let msg = window.t ? window.t('toast_default') : "تم تجهيز العنصر بنجاح";
    if (itemType === 'bg') msg = window.t ? window.t('toast_bg') : "تم تغيير الساحة بنجاح";
    else if (itemType === 'fr') msg = window.t ? window.t('toast_fr') : "تم تغيير الإطار بنجاح";
    else if (itemType === 'pc') msg = window.t ? window.t('toast_pc') : "تم تغيير الحجر بنجاح";
    else if (itemType === 'score') msg = window.t ? window.t('toast_score') : "تم تغيير شكل الشريط بنجاح";
    toast.innerText = '✨ ' + msg; toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); }, 2500);

    setTimeout(() => {
        try {
            let profStr = localStorage.getItem('hub_user_profile');
            if (profStr) {
                let prof = JSON.parse(profStr);
                if (typeof window.applyTheme === 'function') window.applyTheme(prof);
                if (window.ui && typeof window.ui.renderBoard === 'function') window.ui.renderBoard(true);
            }
        } catch(e) {}
    }, 50);
};

window.triggerCustomAlertNotification = function(msg) {
    if (typeof ui.showCustomAlert === 'function') { ui.showCustomAlert(msg); } else {
        const alertModal = document.getElementById('custom-alert-modal'); const alertMsg = document.getElementById('custom-alert-message'); const alertOk = document.getElementById('custom-alert-ok'); const alertCancel = document.getElementById('custom-alert-cancel');
        if (alertModal && alertMsg && alertOk) { document.getElementById('custom-alert-title').innerText = window.t ? window.t('alert_store') : 'إشعار المتجر'; alertMsg.innerText = msg; if(alertCancel) alertCancel.style.display = 'none'; window.openAppModal('custom-alert-modal'); alertOk.onclick = () => window.closeAppModal('custom-alert-modal'); } else { alert(msg); }
    }
};

function forceLockedGlobalAvatar() {
    let globalProfile = localStorage.getItem('hub_user_profile');
    let avatarSrc = "../Photo/1000132081.webp"; let isImage = true;
    if (globalProfile) { try { const parsedHub = JSON.parse(globalProfile); if (parsedHub.avatar) { avatarSrc = parsedHub.avatar; isImage = avatarSrc.includes('.') || avatarSrc.startsWith('data:image') || avatarSrc.startsWith('http'); } } catch(e) {} }
    if (isImage && !avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:image')) { let cleanName = avatarSrc.replace(/\.\.\//g, '').replace('Photo/', ''); avatarSrc = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName; }
    
    const targetAvatars = ['badge-avatar', 'card-my-avatar', 'mm-my-avatar'];
    targetAvatars.forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        if (isImage) { const existingImg = el.querySelector('img'); if (!existingImg || existingImg.getAttribute('src') !== avatarSrc) { el.style.backgroundImage = 'none'; el.innerHTML = `<img src="${avatarSrc}" onerror="this.style.display='none'; this.parentNode.textContent='👤';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`; } } else { if (el.textContent !== avatarSrc) { el.innerHTML = ''; el.textContent = avatarSrc; } }
    });
}

const avatarGuardObserver = new MutationObserver((mutations) => { let shouldProtect = false; for (let mutation of mutations) { if (mutation.type === 'childList') { const hasImg = Array.from(mutation.target.children).some(el => el.tagName === 'IMG'); if (!hasImg && mutation.target.textContent !== "👤") { shouldProtect = true; break; } } } if (shouldProtect) { avatarGuardObserver.disconnect(); forceLockedGlobalAvatar(); startAvatarGuard(); } });
function startAvatarGuard() { const targets = ['badge-avatar', 'card-my-avatar', 'mm-my-avatar']; targets.forEach(id => { const el = document.getElementById(id); if (el) { avatarGuardObserver.observe(el, { childList: true, attributes: false }); } }); }

window.applyProfileDataToUI = function(profile) {
    const currentTokens = profile.tokens !== undefined ? profile.tokens : 0;
    const currentId = profile.id || getUserIdLocally();
    const textElements = { 'badge-username-display-game': profile.name, 'card-my-name': profile.name, 'mm-my-name': profile.name, 'profile-stat-tokens-badge': currentTokens, 'profile-stat-tokens-store': currentTokens, 'igp-name': profile.name, 'igp-id-display': currentId, 'igp-games': profile.gamesPlayed !== undefined ? profile.gamesPlayed : (profile.games !== undefined ? profile.games : 0), 'igp-wins': profile.wins !== undefined ? profile.wins : 0, 'igp-losses': profile.losses !== undefined ? profile.losses : 0 };
    
    for (let id in textElements) { const el = document.getElementById(id); if (el) { el.innerText = textElements[id]; } }
    forceLockedGlobalAvatar(); if(window.updateInventoryUI) window.updateInventoryUI(); 
    if (typeof window.applyTheme === 'function') { window.applyTheme(profile); }
};

window.currentLang = 'ar';
window.updateHtmlTexts = function() {
    if (!window.t) return;
    const setTxt = (id, key) => { const el = document.getElementById(id); if (el) el.innerText = window.t(key); };
    setTxt('menu-title-text', 'menu_title'); setTxt('menu-bag-text', 'menu_bag'); setTxt('menu-radio-text', 'menu_radio'); setTxt('menu-room-text', 'menu_room'); setTxt('menu-leaderboard-text', 'menu_leaderboard'); setTxt('menu-settings-text', 'menu_settings'); setTxt('menu-exit-text', 'menu_exit'); setTxt('lb-title-text', 'lb_title'); setTxt('lb-tab-wins', 'lb_wins'); setTxt('lb-tab-tokens', 'lb_tokens'); setTxt('tutorial-mode-label', 'tutorial_mode'); setTxt('menu-quests-text', 'menu_quests');
    if (document.getElementById('matchmaking-modal').style.display === 'flex') setTxt('mm-status-label', 'searching');
};

window.toggleRadioMusic = function() {
    const dot = document.getElementById('dama-radio-status'); let isActive = false;
    if (dot) { isActive = dot.classList.toggle('active'); }
    if (isActive) { window.parent.postMessage({ type: 'PLAY_RADIO' }, '*'); } else { window.parent.postMessage({ type: 'STOP_RADIO' }, '*'); }
};

function syncRadioStatusDot() { 
    const statusDot = document.getElementById('dama-radio-status'); 
    if (statusDot) { 
        const isPlaying = localStorage.getItem('hub_music_enabled') === 'true'; 
        if (isPlaying) statusDot.classList.add('active'); else statusDot.classList.remove('active'); 
    } 
}

function syncGlobalBackground() {
    const bg = localStorage.getItem('custom_app_bg'); 
    if (bg) {
        let bgUrl = bg; if (!bg.startsWith('http') && !bg.startsWith('data:') && !bg.startsWith('../')) { bgUrl = '../' + bg; }
        document.body.style.backgroundImage = `url('${bgUrl}')`; document.body.style.backgroundSize = 'cover'; document.body.style.backgroundPosition = 'center'; document.body.style.backgroundAttachment = 'fixed'; document.body.style.backgroundColor = 'transparent';
    } else { document.body.style.backgroundColor = '#2c3e50'; document.body.style.backgroundImage = 'none'; }
}

window.addEventListener('storage', (e) => {
    if (e.key === 'hub_music_enabled') { syncRadioStatusDot(); }
    if (e.key === 'custom_app_bg') { syncGlobalBackground(); }
    if (e.key === 'hub_user_profile') { forceLockedGlobalAvatar(); }
});

// ==========================================
// 🌟 دوال التفاعلات للأزرار والاستماع (Event Listeners)
// ==========================================
function hasPlayerMoved() {
    if (!gameState.boardHistory) return false;
    if (gameState.playerColor === 'white') { return gameState.boardHistory.length > 1; } 
    else { return gameState.boardHistory.length > 2; }
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
                },
                true, t('btn_cancel'), t('resign')
            );
        } else {
            if (typeof window.openAppModal === 'function') window.openAppModal('new-game-modal');
        }
    } else {
        if (typeof window.openAppModal === 'function') window.openAppModal('new-game-modal');
    }
});

ui.onClick('resign-btn', () => {
    if (gameState.isOnlineMode) {
        ui.showCustomAlert(
            t('resign_confirm'), t('alert_title'),
            () => { if (socketManager && typeof socketManager.sendSurrender === 'function') { socketManager.sendSurrender(); } },
            true, t('btn_cancel'), t('alert_ok')
        );
    } else {
        if (!hasPlayerMoved()) {
            ui.showCustomAlert(t('confirm_exit_msg'), t('confirm_exit_title'), () => { ui.drawEmptyBoard(); }, true, t('btn_cancel'), t('alert_ok'));
        } else {
            ui.showCustomAlert(
                t('resign_loss_confirm'), t('alert_title'),
                () => { let opponentColor = gameState.playerColor === 'white' ? 'black' : 'white'; ui.showResultsModal(opponentColor); },
                true, t('btn_cancel'), t('alert_ok')
            );
        }
    }
});

ui.onClick('undo-btn', () => {
    if (gameState.isOnlineMode || gameState.currentTurn !== gameState.playerColor) return; 
    if (!gameState.boardHistory || gameState.boardHistory.length <= 1) return;

    gameState.gameId = Date.now();
    if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }

    gameState.boardHistory.pop();
    if (gameState.boardHistoryStr && gameState.boardHistoryStr.length > 0) gameState.boardHistoryStr.pop();

    while (gameState.boardHistory.length > 1 && gameState.boardHistory[gameState.boardHistory.length - 1].turn !== gameState.playerColor) {
        gameState.boardHistory.pop();
        if (gameState.boardHistoryStr && gameState.boardHistoryStr.length > 0) gameState.boardHistoryStr.pop();
    }

    let prevState = gameState.boardHistory[gameState.boardHistory.length - 1];
    if (prevState) {
        gameState.virtualBoard = prevState.board.map(row => [...row]); 
        gameState.currentTurn = prevState.turn;
        
        ui.clearHighlights(); document.querySelectorAll('.cell.last-move').forEach(c => c.classList.remove('last-move'));
        if (gameState.selectedPiece) { gameState.selectedPiece.classList.remove('selected'); gameState.selectedPiece = null; }
        gameState.isMultiJumping = false; gameState.jumpsCount = 0; gameState.requiredJumps = 0;
        
        ui.renderBoard(); ui.playSound(ui.sfx.move); ui.startTurn();
    }
});

ui.onClick('hint-btn', () => { hintSystem.requestHint(); });

// 🌟 أكواد الأزرار الخاصة بإعدادات الغرفة (جديد)
ui.onClick('creator-update-bet-btn', () => {
    const roomIdEl = document.getElementById('creator-target-room-id');
    const newBetEl = document.getElementById('edit-room-bet-input');
    
    if (roomIdEl && newBetEl && typeof socket !== 'undefined' && socket.connected) {
        const roomId = roomIdEl.value;
        const newBet = parseInt(newBetEl.value) || 0;
        socket.emit('updateRoomBet', { roomID: roomId, newBet: newBet });
        
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('creator-room-settings-modal');
        }
    }
});

ui.onClick('creator-cancel-room-btn', () => {
    const roomIdEl = document.getElementById('creator-target-room-id');
    if (roomIdEl) {
        window.deleteMyRoom(roomIdEl.value);
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('creator-room-settings-modal');
        }
    }
});

window.ui = ui;
window.updateUITranslations = () => { if (typeof window.updateHtmlTexts === 'function') window.updateHtmlTexts(); };

document.addEventListener('click', (e) => {
    let target = e.target;
    while (target && target !== document) {
        if (target.id && ui.clickHandlers.has(target.id)) { ui.clickHandlers.get(target.id)(e); return; }
        target = target.parentNode;
    }

    const actionElement = e.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const fId = (actionElement.dataset.fid || "").toUpperCase(); 

        if (action === 'challenge-friend') {
            if (typeof window.challengeFriend === 'function') { window.challengeFriend(fId); } 
            else { ui.showCustomAlert(t('coming_soon')); }
        } else if (action === 'remove-friend') {
            // تحديث قائمة الأصدقاء بإزالة الصديق وحفظ التغيير
            let currentFriends = gameState.userProfile.friends || [];
            gameState.userProfile.friends = currentFriends.filter(f => (typeof f === 'string' ? f.toUpperCase() !== fId : f.id.toUpperCase() !== fId)); 
            
            let profileToSave = { ...gameState.userProfile };
            if (gameState.originalHints !== undefined && gameState.originalHints !== null) { profileToSave.hints = gameState.originalHints; }
            localStorage.setItem('hub_user_profile', JSON.stringify(profileToSave)); 
            ui.updateProfileUI();
            
            const toast = document.getElementById('toast-notification'); 
            if (toast) { toast.innerText = '🗑️ تم حذف الصديق'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
        }
    }
});

// ==========================================
// 🌟 التنسيقات الإجبارية وأحداث اللوحة
// ==========================================
if (!document.getElementById('forced-overlay-style')) {
    const forcedStyle = document.createElement('style'); forcedStyle.id = 'forced-overlay-style';
    forcedStyle.innerHTML = `
        .cell:has(.piece.multi-choice) { position: relative !important; border: 2px solid #ff453a !important; animation: dangerPulse 1.2s infinite alternate ease-in-out !important; border-radius: inherit; }
        @keyframes dangerPulse { 0% { box-shadow: 0 0 8px #ff453a, inset 0 0 15px rgba(255, 69, 58, 0.5); border-color: #ff453a; } 100% { box-shadow: 0 0 20px #ff453a, 0 0 30px #ffd700, inset 0 0 35px rgba(255, 69, 58, 0.8); border-color: #ffd700; } }
        .cell:has(.piece.multi-choice) .piece { z-index: 2 !important; position: relative !important; transform: scale(1.08) !important; filter: drop-shadow(0 5px 12px rgba(0,0,0,0.8)) !important; transition: transform 0.2s ease, filter 0.2s ease; }
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
        
        gameState.moveSequenceStartR = null; gameState.moveSequenceStartC = null; gameState.movePath = []; 
        
        if (gameState.selectedPiece) gameState.selectedPiece.classList.remove('selected');
        gameState.selectedPiece = target; gameState.selectedPiece.classList.add('selected');
        
        if (gameState.currentTurn !== gameState.playerColor && !gameState.isOnlineMode) { gameState.opponentStartRow = r; gameState.opponentStartCol = c; }
        ui.showValidMovesHighlights(r, c); return;
    }

    if (gameState.selectedPiece && cell.classList.contains('cell') && cell.children.length === 0) {
        const fromRow = parseInt(gameState.selectedPiece.parentElement.dataset.row);
        const fromCol = parseInt(gameState.selectedPiece.parentElement.dataset.col);
        const toRow = parseInt(cell.dataset.row); const toCol = parseInt(cell.dataset.col);
        const rDiff = toRow - fromRow; const cDiff = toCol - fromCol;
        const isDama = gameState.selectedPiece.classList.contains('dama');
        const pieceColor = gameState.selectedPiece.classList.contains('white') ? 'white' : 'black';

        if (gameState.moveSequenceStartR === undefined || gameState.moveSequenceStartR === null) {
            gameState.moveSequenceStartR = fromRow; gameState.moveSequenceStartC = fromCol; gameState.movePath = [{r: fromRow, c: fromCol}];
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
                        
                        gameState.movesWithoutProgress = 0; 
                        gameState.boardHistoryStr = [];
                        gameState.pieceHistories = {}; // 💡 تصفير التكرار عند الأكل
                        
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
                
                if (isPromotion) {
                    gameState.movesWithoutProgress = 0;
                    gameState.boardHistoryStr = [];
                    gameState.pieceHistories = {}; // 💡 تصفير التكرار عند الترقية
                } else {
                    gameState.movesWithoutProgress++;
                    gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard));
                    if (gameEngine.trackPieceHistory) gameEngine.trackPieceHistory(fromRow, fromCol, toRow, toCol, gameState.currentTurn); // 💡 تتبع تكرار هذا الحجر بالذات
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
