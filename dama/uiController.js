// uiController.js
import { gameState, saveGameState, restoreOfflineHintSystem } from './main.js';
import { gameEngine } from './gameEngine.js';
import { gameAI } from './gameAI.js';
import { socket, socketManager } from './socketManager.js';
import { translations, t } from './i18n.js';

window.t = t; 

export const sfx = {
    move: new Audio('move.mp3'),
    piecesDied: new Audio('pieces_died.mp3'),
    kingDied: new Audio('king_died.mp3'),
    kingCreated: new Audio('king_created.mp3'),
    win: new Audio('win.mp3'),
    clock: new Audio('clock.mp3'),
    spinTick: new Audio('spin_tick.mp3') // 👈 الصوت المخصص لعجلة الحظ
};

let aiSharedWorker = null;
function getAiWorker() {
    if (window.Worker) {
        if (!aiSharedWorker) { aiSharedWorker = new Worker('aiWorker.js'); }
        return aiSharedWorker;
    }
    return null;
}

window.isMatchRunning = false;

export const ui = {
    sfx: sfx,
    clickHandlers: new Map(), 
    currentWheelDeg: 0, 

    translate(arTxt, enTxt) {
        return t(arTxt) || arTxt;
    },

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
        audio.currentTime = 0;
        let playPromise = audio.play();
        if (playPromise !== undefined) { playPromise.catch(err => {}); }
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
        const currentLang = localStorage.getItem('app_lang') || localStorage.getItem('appLang') || 'ar';
        document.documentElement.dir = (currentLang === 'ar' || currentLang === 'ku') ? 'rtl' : 'ltr';
        
        const setHtml = (id, key) => { 
            const e = this.getEl(id); 
            if (e) e.innerText = t(key) || key; 
        };
        const setPlaceholder = (id, txt) => { const e = this.getEl(id); if (e) e.placeholder = txt || ""; };
        
        const idToKeyMap = {
            'main-title': 'app_title', 'set-title': 'set_title', 
            'save-settings-btn': 'save_settings_btn', 'lang-label': 'langLabel', 
            'new-game-title': 'new_game_title', 'choose-color-label': 'new_game_color', 
            'cancel-new-game-btn': 'btn_cancel', 'sfx-lbl': 'sfx_lbl', 
            'online-create-btn': 'online_create', 'online-join-btn': 'online_join', 
            'mm-cancel-btn': 'mm_cancel', 'close-modal-btn': 'btn_close', 
            'add-friend-label': 'addFriendLabel', 'matchmaking-title': 'mm_title', 'create-room-title': 'online_title', 
            'room-id-label': 'online_id', 'room-password-label': 'online_pass', 'add-friend-btn': 'addFriend', 
            'igp-title': 'igp_title', 'igp-lbl-games': 'igp_games', 'igp-lbl-wins': 'igp_wins', 'igp-lbl-losses': 'igp_losses',
            'store-title': 'store_title', 'store-desc': 'store_desc',
            'store-btn-tab-bg': 'tab_bg', 'store-btn-tab-frames': 'tab_frames', 'store-btn-tab-pieces': 'tab_pieces', 'store-btn-tab-offers': 'tab_offers',
            'themes-grid-title': 'theme_title', 
            'theme-btn-tab-bg': 'theme_bg', 'theme-btn-tab-frames': 'theme_frames', 'theme-btn-tab-pieces': 'theme_pieces',
            'custom-alert-title': 'alert_title', 'custom-alert-ok': 'alert_ok',
            'game-over-title': 'go_title', 'rematch-btn': 'go_rematch',
            'igp-lbl-friends': 'igp_friends', 'igp-friends-list': 'igp_no_friends',
            'lbl-add-friend-title': 'addFriendLabel', 'theme-bg-0': 'theme_bg_0', 'theme-pc-0': 'theme_pc_0',
            'card-my-name': 'badge_you', 'badge-username-display-game': 'badge_you',
            
            'menu-title-text': 'menu_title',
            'menu-bag-text': 'menu_bag',
            'menu-radio-text': 'menu_radio',
            'menu-room-text': 'menu_room',
            'menu-leaderboard-text': 'menu_leaderboard',
            'menu-settings-text': 'menu_settings',
            'menu-exit-text': 'menu_exit',
            'lb-title-text': 'lb_title',
            'lb-tab-wins': 'lb_wins',
            'lb-tab-tokens': 'lb_tokens',
            'tutorial-mode-label': 'tutorial_mode',
            'online-status-text': 'searching',
            'mm-status-label': 'searching'
        };
        
        Object.keys(idToKeyMap).forEach(id => setHtml(id, idToKeyMap[id]));
        
        setHtml('exit-game-btn', 'exit');
        setHtml('store-return-btn', 'exit');
        setHtml('theme-close-btn', 'exit');
        setHtml('online-close-btn', 'btn_cancel');
        setHtml('custom-alert-cancel', 'btn_cancel');
        setHtml('reset-btn', 'start');

        const resignBtn = this.getEl('resign-btn');
        if (resignBtn) {
            resignBtn.title = t('resign');
            resignBtn.innerText = t('resign');
        }

        const placeholders = {
            'online-room-input': t('ph_room'),
            'online-password-input': t('ph_pass'),
            'friend-id-input': t('add_friend_placeholder')
        };
        Object.keys(placeholders).forEach(id => setPlaceholder(id, placeholders[id]));
        
        if (window.updateInventoryUI) window.updateInventoryUI();
            
        const onlineBtnText = document.querySelector('#online-toggle-btn span:last-child');
        if (onlineBtnText) onlineBtnText.innerText = t('online_btn');

        const turnInd = this.getEl('turn-indicator');
        if(turnInd) {
            if(turnInd.innerText.includes('Your') || turnInd.innerText.includes('دورك') || turnInd.innerText.includes('نۆبەی تۆیە')) turnInd.innerText = t('turn_yours');
            else if(turnInd.innerText.includes('Opponent') || turnInd.innerText.includes('خصم') || turnInd.innerText.includes('نۆبەی بەرامبەرە')) turnInd.innerText = t('turn_opps');
        }

        this.updateProfileUI();
        this.startTurn();
    },

    showCustomAlert(message, title = null, onConfirm = null, showCancel = false, customCancelText = null, customOkText = null) {
        title = title || t('alert_title');
        
        const msgContainer = this.getEl('custom-alert-message');
        if (msgContainer) {
            msgContainer.innerHTML = `<div style="line-height: 1.6; font-size: 14px;">${message}</div>`;
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

    // =========================================================
    // 🌟 حساب المستوى والرتبة بصرياً (Level & Rank Engine)
    // =========================================================
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

    // =========================================================
    // 🎡 محرك التزامن الفيزيائي لعجلة الحظ
    // =========================================================
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
        const targetDeg = extraSpins + (360 - (prizeIndex * 45 + 22.5));

        const currentMod = this.currentWheelDeg % 360;
        const targetMod = targetDeg % 360;
        let diff = targetMod - currentMod;
        if (diff < 0) diff += 360; 
        
        let startDeg = this.currentWheelDeg;
        let totalChange = extraSpins + diff;
        this.currentWheelDeg += totalChange;

        // 🛑 إيقاف الـ CSS Transition لأننا سنحرك العجلة برمجياً لضمان التزامن 100%
        wheel.style.transition = 'none';

        let tickAudio = sfx.spinTick;
        let spinDuration = 5000;
        let startTime = performance.now();
        
        // تتبع آخر دبوس مر عليه السهم لمعرفة متى نضرب بالضبط!
        let lastPinPassed = Math.floor(startDeg / 45);

        // 💡 المحرك الفيزيائي
        const animateTick = (currentTime) => {
            if (!window.isSpinning) return;
            
            let elapsed = currentTime - startTime;
            if (elapsed >= spinDuration) elapsed = spinDuration;

            // معادلة التباطؤ الفيزيائي (Cubic Ease Out) لتبدو حركتها واقعية
            let t = elapsed / spinDuration;
            let easeOut = 1 - Math.pow(1 - t, 3);
            let currentSimulatedAngle = startDeg + (totalChange * easeOut);

            // تحريك العجلة إطاراً بإطار
            wheel.style.transform = `rotate(${currentSimulatedAngle}deg)`;

            // 🎯 حساب الدبوس الحالي بدقة متناهية (كل 45 درجة يوجد دبوس)
            let currentPin = Math.floor(currentSimulatedAngle / 45);
            
            // إذا عبر السهم دبوساً جديداً
            if (currentPin > lastPinPassed) {
                lastPinPassed = currentPin;

                // 1. إصدار صوت التكتكة (بالضبط عند الاصطدام)
                if (tickAudio) {
                    let clonedTick = tickAudio.cloneNode();
                    clonedTick.volume = tickAudio.volume || parseFloat(localStorage.getItem('sfx_volume') || '0.7');
                    clonedTick.play().catch(() => {});
                    clonedTick.onended = () => clonedTick.remove();
                }

                // 2. ضربة فيزيائية للسهم (ينضغط لليسار ثم يرتد بقوة الدبوس)
                if (pointer) {
                    pointer.style.transform = 'translateX(-50%) rotate(-30deg)';
                    setTimeout(() => {
                        pointer.style.transform = 'translateX(-50%) rotate(0deg)';
                    }, 60); 
                }
            }

            if (elapsed < spinDuration) {
                requestAnimationFrame(animateTick);
            } else {
                // انتهى الدوران
                window.isSpinning = false; 
                this.playSound(sfx.win); 
                if (btnFree) btnFree.style.pointerEvents = 'auto';
                if (btnPaid) btnPaid.style.pointerEvents = 'auto';
                if (onComplete) onComplete();
            }
        };

        // بدء تشغيل المحرك
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
        
        this.setDisplay('diff-quick-select', inlineState);
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
            'diff-quick-select': normalState, 
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
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = board.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (!cell) continue;
                
                const boardVal = gameState.virtualBoard[r][c];
                let currentPiece = cell.querySelector('.piece:not(.mini)');
                
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

        this.toggleOfflineInMatchUI(false);
        this.toggleOnlineUILayout(false); 
        
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

        const tutorialCheck = document.getElementById('tutorial-mode-checkbox');
        if (!gameState.isOnlineMode && tutorialCheck) {
            gameState.isTutorialMode = tutorialCheck.checked;
        } else {
            gameState.isTutorialMode = false;
        }

        gameState.isGameActive = true;
        window.isMatchRunning = true;
        
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
            board: JSON.parse(JSON.stringify(gameState.virtualBoard)),
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
        
        const updateTimerDisplay = () => {
            if (gameState.turnEndTime) {
                gameState.turnTimeLeft = Math.max(0, Math.ceil((gameState.turnEndTime - Date.now()) / 1000));
            } else {
                gameState.turnTimeLeft--;
            }

            this.setTxt('turn-countdown', `${t('time_left')} ${gameState.turnTimeLeft}s`);
            
            if (gameState.turnTimeLeft === 10) {
                let playPromise = sfx.clock.play();
                if (playPromise !== undefined) playPromise.catch(() => {});
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

        if (!gameState.isOnlineMode) {
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
        
        gameState.lastJumpDir = { dr: null, dc: null };
        document.querySelectorAll('.piece.forced').forEach(p => p.classList.remove('forced'));
        
        document.querySelectorAll('.piece.multi-choice').forEach(p => p.classList.remove('multi-choice'));
        
        let wMoves = gameEngine.generateAllTurnMoves('white', gameState.virtualBoard).length;
        let bMoves = gameEngine.generateAllTurnMoves('black', gameState.virtualBoard).length;
        
        const isBoardEmpty = gameState.virtualBoard.every(row => row.every(cell => cell === null));
        
        if (!isBoardEmpty && ((gameState.currentTurn === 'white' && wMoves === 0) || (gameState.currentTurn === 'black' && bMoves === 0))) {
            if (gameState.blockGameOverModal) return; 
            
            let winnerColor = gameState.currentTurn === 'white' ? 'black' : 'white';
            tInd.textContent = winnerColor === 'white' ? t('white_wins') : t('black_wins');
            tInd.style.color = "#2ecc71";
            
            this.showResultsModal(winnerColor);
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
            tInd.textContent = `${t('forced')} ${gameState.requiredJumps}`;
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
                    let chosenMove = moves[0];
                    processMove(chosenMove);
                };
                
                worker.postMessage({
                    board: gameState.virtualBoard,
                    depth: depth,
                    aiColor: aiColor,
                    pieceDirection: gameState.pieceDirection 
                });
            } else {
                let chosenMove = gameAI.minimax(gameState.virtualBoard, depth, -Infinity, Infinity, true, aiColor).move || moves[0];
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
            const statusText = isWin ? t('winner') : t('loser');
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
                createPlayerBox(gameState.userProfile.name, gameState.userProfile.avatar, gameState.userProfile.isCustomAvatar, isMeWin), 
                createPlayerBox(oppName || t('mm_opp'), oppAvatar, oppAvatar?.startsWith('data:image'), !isMeWin)
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
                    let isBossLevel = false;
                    let isBetMatch = false;
                    let lvl = parseInt(this.getVal('diff-quick-select', '3')) || 3;

                    if (gameState.isOnlineMode) {
                        if (gameState.roomBet && gameState.roomBet > 0) {
                            isBetMatch = true;
                            displayReward = isMeWin ? (gameState.roomBet * 2) : gameState.roomBet;
                        } else {
                            displayReward = isMeWin ? 120 : 0;
                        }
                    } else {
                        if (isMeWin) {
                            if (lvl <= 2) displayReward = 10;
                            else if (lvl <= 4) displayReward = 15;
                            else if (lvl <= 6) displayReward = 50;
                            else if (lvl <= 8) displayReward = 100;
                            else if (lvl === 9) {
                                displayReward = "100 أو 400";
                                isBossLevel = true;
                            }
                        } else {
                            displayReward = 10;
                        }
                    }

                    if (displayReward !== 0) {
                        let rewardText = "";
                        let alertColor = "#f5a623";

                        if (isBetMatch) {
                            if (isMeWin) {
                                rewardText = `💰 جائزة الرهان: +${displayReward} 🪙`;
                                alertColor = "#30d158"; 
                            } else {
                                rewardText = `💸 خسارة الرهان: -${displayReward} 🪙`;
                                alertColor = "#ff453a"; 
                            }
                        } else if (isBossLevel) {
                            rewardText = `👑 مكافأة الزعيم: ${displayReward} 🪙`;
                        } else {
                            rewardText = `${(t('tokenReward') || 'المكافأة:')} ${displayReward}`;
                        }
                        
                        box.appendChild(this.makeEl('div', 'token-reward-alert', `margin-top:15px;color:${alertColor};font-weight:700;font-size:15px;`, rewardText));
                    }

                    if (!gameState.isOnlineMode) {
                        socket.emit('claimBotReward', { isWin: isMeWin, level: lvl });
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
        const badgeRing = this.getEl('badge-xp-ring');
        if (badgeLevel) badgeLevel.textContent = `Lv.${lvlInfo.level}`;
        if (badgeRing) badgeRing.style.background = `conic-gradient(#34c759 ${lvlInfo.percentage}%, rgba(255,255,255,0.1) 0%)`;

        const igpLevel = this.getEl('igp-level');
        const igpRing = this.getEl('igp-xp-ring');
        const igpRank = this.getEl('igp-rank-title');
        const igpXpFill = this.getEl('igp-xp-fill');
        const igpXpText = this.getEl('igp-xp-text');

        if (igpLevel) igpLevel.textContent = `Lv.${lvlInfo.level}`;
        if (igpRing) igpRing.style.background = `conic-gradient(#34c759 ${lvlInfo.percentage}%, rgba(255,255,255,0.1) 0%)`;
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

    while (gameState.boardHistory.length > 1 && 
           gameState.boardHistory[gameState.boardHistory.length - 1].turn !== gameState.playerColor) {
        gameState.boardHistory.pop();
    }

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

    let hintDepth = Math.max(5, botDepth + 1);
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
        
        worker.postMessage({ 
            board: gameState.virtualBoard, 
            depth: hintDepth, 
            aiColor: myColor,
            pieceDirection: gameState.pieceDirection 
        });
    } else {
        setTimeout(() => {
            let bestMove = gameAI.minimax(gameState.virtualBoard, hintDepth > 6 ? 6 : hintDepth, -Infinity, Infinity, true, myColor).move || eleganceMoves[0];
            showGlow(bestMove);
        }, 50);
    }
});

window.ui = ui;
window.updateUITranslations = () => { 
    ui.updateTexts(); 
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

// =========================================================
// 💡 تأثير: التوهج المزدوج عالي التباين (أحمر ناري + ذهبي)
// =========================================================
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
