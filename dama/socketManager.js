/**
 * socketManager.js
 * النسخة المحمية: (إصلاح الاتصال الوهمي "Zombie State" عند الخروج المتكرر من اللعبة)
 */

import { gameState } from './gameState.js'; 
import { startOnlineHintSystem, restoreOfflineHintSystem } from './main.js';
import { ui } from './uiController.js';
import { gameEngine } from './gameEngine.js';

export const socket = io('https://diwanrise-dama-game-diwan.hf.space/dama', { 
    transports: ['websocket', 'polling'], 
    reconnection: true,                   
    reconnectionAttempts: Infinity,       
    reconnectionDelay: 1000,              
    reconnectionDelayMax: 5000,           
    timeout: 20000                        
});
window.socket = socket; 

const fallbackMoveAudio = new Audio('move.mp3');

export const socketManager = {
    isAlertShown: false,
    lastConnectionErrorTime: 0,
    toastTimeout: null,
    disconnectTimer: null, 
    pingIntervalId: null, 
    pingStartTime: null,
    lastPingValue: null, 

    _showToast(msg) {
        let toast = document.getElementById('game-toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'game-toast-notification';
            toast.style.cssText = `
                position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
                background: rgba(25, 25, 30, 0.95); color: #fff; padding: 12px 24px;
                border-radius: 8px; z-index: 10000000; font-family: sans-serif; font-size: 14px;
                text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                transition: opacity 0.3s ease, transform 0.3s ease; opacity: 0;
                pointer-events: none; border: 1px solid rgba(255,255,255,0.1);
                white-space: nowrap; max-width: 90vw; overflow: hidden; text-overflow: ellipsis;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = msg;
        toast.style.display = 'block';
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, -10px)';
        });

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 0)';
            setTimeout(() => { toast.style.display = 'none'; }, 300);
        }, 4000);
    },

    _initRealPingIndicator() {
        let pingEl = document.getElementById('real-ping-indicator');
        if (!pingEl) {
            pingEl = document.createElement('div');
            pingEl.id = 'real-ping-indicator';
            pingEl.style.cssText = `
                position: absolute; 
                bottom: -1px; 
                left: calc(50% + 118px); 
                background: transparent; color: #66bb6a; 
                font-family: monospace; font-size: 11px; font-weight: 700; 
                padding: 0; border: none; margin: 0;
                z-index: 99999; display: flex; align-items: center; justify-content: flex-start; gap: 4px;
                flex-direction: row; flex-wrap: nowrap; white-space: nowrap; 
                pointer-events: none; opacity: 0.95;
                text-shadow: 1px 1px 1px rgba(0,0,0,0.8), -1px -1px 1px rgba(0,0,0,0.8), 1px -1px 1px rgba(0,0,0,0.8), -1px 1px 1px rgba(0,0,0,0.8); 
            `;
            pingEl.innerHTML = `<div id="ping-dot" style="width:5px;height:5px;border-radius:50%;background:#66bb6a;box-shadow:0 0 3px #66bb6a, 0 0 0 1px rgba(0,0,0,0.5); flex-shrink:0;"></div><span id="ping-text" style="white-space: nowrap;">... ms</span>`;
            
            const turnBoxWrapper = document.getElementById('turn-box-container')?.parentElement;
            if (turnBoxWrapper) {
                turnBoxWrapper.style.position = 'relative'; 
                turnBoxWrapper.appendChild(pingEl);
            } else {
                document.body.appendChild(pingEl); 
            }
        }

        if (this.pingIntervalId) clearInterval(this.pingIntervalId);

        this.pingIntervalId = setInterval(() => {
            if (pingEl && pingEl.style.display === 'none') pingEl.style.display = 'flex';
            if (socket && socket.connected) {
                socket.volatile.emit('clientPing', Date.now()); 
            } else {
                socketManager._updatePingUI(999);
            }
        }, 5000); 

        socket.off('serverPong'); 
        socket.on('serverPong', (clientTime) => {
            let latency = Date.now() - clientTime; 
            if (latency > 999) latency = 999;
            socketManager._updatePingUI(latency);
        });
    },

    _updatePingUI(latency) {
        if (this.lastPingValue !== null && Math.abs(this.lastPingValue - latency) < 15 && latency !== 999) return;
        this.lastPingValue = latency;

        const pingEl = document.getElementById('real-ping-indicator');
        const pingText = document.getElementById('ping-text');
        const pingDot = document.getElementById('ping-dot');
        if (!pingEl || !pingText || !pingDot) return;

        pingText.innerText = latency + ' ms';
        
        let color = '#66bb6a'; 
        if (latency > 150) color = '#ffb74d'; 
        if (latency > 300) color = '#ef5350'; 

        pingEl.style.color = color;
        pingDot.style.background = color;
        pingDot.style.boxShadow = `0 0 3px ${color}, 0 0 0 1px rgba(0,0,0,0.5)`; 
    },

    _showDisconnectUI() {
        if (!gameState.isOnlineMode) return;

        let miniRadar = document.getElementById('mini-disconnect-radar');
        
        if (!miniRadar) {
            miniRadar = document.createElement('div');
            miniRadar.id = 'mini-disconnect-radar';
            document.body.appendChild(miniRadar);
        }

        if (miniRadar.innerHTML.trim() === '') {
            miniRadar.innerHTML = window.SVGIcons?.disconnectIcon || `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
                    <defs>
                        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2a241e" /><stop offset="100%" stop-color="#14110e" /></radialGradient>
                        <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#bf8530" /><stop offset="50%" stop-color="#fce288" /><stop offset="100%" stop-color="#8c5a1c" /></linearGradient>
                    </defs>
                    <rect x="5" y="5" width="110" height="110" rx="28" fill="url(#bgGrad)" stroke="#3d301f" stroke-width="2"/>
                    <g stroke="url(#goldGrad)" stroke-width="8" stroke-linecap="round" fill="none" transform="translate(0, 5)">
                        <circle cx="60" cy="85" r="6" fill="url(#goldGrad)" stroke="none" style="animation: radarPing 1.5s infinite;"/>
                        <path d="M 42 68 A 25 25 0 0 1 78 68" style="animation: radarPing 1.5s infinite 0.2s;"/>
                        <path d="M 26 51 A 45 45 0 0 1 94 51" style="animation: radarPing 1.5s infinite 0.4s;"/>
                        <path d="M 10 34 A 65 65 0 0 1 110 34" style="animation: radarPing 1.5s infinite 0.6s;"/>
                    </g>
                </svg>
            `;
        }

        miniRadar.style.display = 'flex';
        this._updatePingUI(999);
    },

    _hideDisconnectUI() {
        const miniRadar = document.getElementById('mini-disconnect-radar');
        if (miniRadar) miniRadar.style.display = 'none';
        
        if (this.disconnectTimer) {
            clearTimeout(this.disconnectTimer);
            this.disconnectTimer = null;
        }
    },
    
    _handleDisconnection() {
        if (!this.disconnectTimer) {
            this.disconnectTimer = setTimeout(() => {
                socketManager._showDisconnectUI();
            }, 5000); 
        }
    },

    _ensureUserProfile() {
        try {
            const stored = localStorage.getItem('hub_user_profile');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    if (parsed.id && typeof parsed.id === 'string' && !parsed.id.includes('__proto__')) {
                        gameState.userProfile = {
                            id: String(parsed.id).trim().toUpperCase(),
                            name: String(parsed.name || 'Guest').trim(),
                            avatar: String(parsed.avatar || '1000132081.png').trim(),
                            isCustomAvatar: !!parsed.isCustomAvatar,
                            tokens: typeof parsed.tokens === 'number' ? parsed.tokens : 0,
                            gamesPlayed: Number(parsed.gamesPlayed) || 0,
                            wins: Number(parsed.wins) || 0,
                            losses: Number(parsed.losses) || 0,
                            hints: parsed.hints !== undefined ? Number(parsed.hints) : 5,
                            equippedBg: parsed.equippedBg || 'bg_wood',
                            equippedFr: parsed.equippedFr || 'fr_classic',
                            equippedPc: parsed.equippedPc || 'pc_original',
                            purchasedItems: Array.isArray(parsed.purchasedItems) ? parsed.purchasedItems : [],
                            friends: Array.isArray(parsed.friends) ? parsed.friends : []
                        };
                    }
                }
            }
        } catch (e) {}
        
        if (!gameState.userProfile || !gameState.userProfile.id) {
            gameState.userProfile = { 
                id: 'GUEST-' + Math.random().toString(36).substring(2, 9).toUpperCase(), 
                name: 'Guest', 
                avatar: '1000132081.png',
                isCustomAvatar: false,
                tokens: 0,
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                hints: 5,
                equippedBg: 'bg_wood',
                equippedFr: 'fr_classic',
                equippedPc: 'pc_original',
                purchasedItems: [],
                friends: []
            };
            try { localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile)); } catch (e) {}
        }
        return gameState.userProfile;
    },

    _safeEmit(event, data) {
        if (!socket.connected) {
            socket.connect();
        }
        socket.emit(event, data);
    },

    init() {
        window.socketManager = this;
        this._initRealPingIndicator();

        // ✅ التعديل الجذري لحل مشكلة الاتصال الوهمي (Zombie State)
        window.addEventListener('online', () => {
            if (!socket.connected) {
                socketManager._showToast(gameState.lang === 'ar' ? "عاد الاتصال بالإنترنت، جاري الربط..." : "Internet restored, connecting...");
                socket.disconnect(); // قتل الاتصال الوهمي
                setTimeout(() => socket.connect(), 200); // بدء اتصال نظيف
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (!navigator.onLine || !socket.connected) {
                    socketManager._updatePingUI(999);
                }
                if (navigator.onLine && !socket.connected) {
                    socket.disconnect(); // قتل الاتصال المعلق بالخلفية
                    setTimeout(() => socket.connect(), 200); // إجبار التحديث
                }
            }
        });
        // =================================================

        const eventsToTurnOff = [
            'connect', 'disconnect', 'roomCreated', 'roomJoined', 'waitingForOpponent',
            'gameStart', 'opponentMove', 'opponentResigned', 'turnTimeout',
            'opponentDisconnected', 'opponentReconnected', 'playerDisconnected',
            'rematchOffer', 'rematchAccepted', 'error', 'receiveChallenge',
            'challengeResponse', 'profileUpdated', 'friendAddedNotification',
            'friendAddSuccess', 'friendAddFailed', 'opponentLeftRoom', 'roomClosedByTimeout',
            'connect_error', 'syncTime', 'receiveChat', 'levelUpAlert', 'syncGameState'
        ];
        eventsToTurnOff.forEach(event => socket.off(event));

        socket.on('receiveChat', (data) => {
            if (window.playInGameChat && data) {
                window.playInGameChat('opp', data.type, data.value);
            }
        });

        socket.on('connect', () => {
            console.log('Connected to server successfully');
            socketManager._hideDisconnectUI();

            const profile = socketManager._ensureUserProfile();
            socket.emit('deviceFingerprint', { guestId: profile.id });
            
            if (gameState.isOnlineMode && gameState.onlineRoomID) {
                socket.emit('requestGameState', { roomID: String(gameState.onlineRoomID).trim() });
                socketManager.handleRoomAction('joinRoom', gameState.onlineRoomID);
            }
            
            if (typeof ui.setDisplay === 'function') ui.setDisplay('custom-alert-modal', 'none');
        });

        socket.on('disconnect', (reason) => {
            console.warn('Disconnected:', reason);
            socketManager._handleDisconnection();
        });

        socket.on('connect_error', (err) => {
            const mmModal = document.getElementById('matchmaking-modal');
            if (mmModal && (mmModal.style.display === 'block' || mmModal.style.display === 'flex')) {
                if (typeof window.closeAppModal === 'function') window.closeAppModal('matchmaking-modal');
                else mmModal.style.display = 'none';
                clearInterval(gameState.mmInterval);
                gameState.mmInterval = null;
            }
            
            const now = Date.now();
            if (now - socketManager.lastConnectionErrorTime > 10000) {
                socketManager.lastConnectionErrorTime = now;
                socketManager._handleDisconnection();
            }
        });

        socket.on('syncGameState', (data) => {
            if (!gameState.isOnlineMode || !data) return;
            
            if (data.board) gameState.virtualBoard = data.board;
            if (data.turn) gameState.currentTurn = data.turn;
            if (data.turnEndTime) gameState.turnEndTime = data.turnEndTime;
            
            gameState.movesWithoutProgress = 0;
            gameState.boardHistoryStr = [];
            
            ui.renderBoard(true);
            ui.startTurn();
            
            socketManager._showToast(gameState.lang === 'ar' ? "تمت مزامنة الرقعة بنجاح 🔄" : "Board synchronized 🔄");
        });

        socket.on('roomCreated', id => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'white';
            if(id) gameState.onlineRoomID = id;
            socketManager.showStatusMsg(gameState.lang === 'ar' ? "تم الإنشاء! بانتظار الخصم" : "Created! Waiting...");
            ui.setDisplay('online-setup-box', 'none');
        });

        socket.on('roomJoined', () => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'black';
            socketManager.showStatusMsg(gameState.lang === 'ar' ? "تم الانضمام!" : "Joined!");
            ui.setDisplay('online-setup-box', 'none');
        });

        socket.on('waitingForOpponent', msg => socketManager.showStatusMsg(msg));

        socket.on('gameStart', data => {
            if (!data) return;
            document.getElementById('custom-results-modal-container')?.remove(); 
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');
            else ui.setDisplay('custom-alert-modal', 'none');
            
            socketManager.isAlertShown = false; 

            if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
            clearInterval(gameState.mmInterval);
            gameState.mmInterval = null; 

            gameState.isBotOpponent = false;
            gameState.isGameOver = false;
            gameState.isGameActive = true;
            gameState.statsUpdated = false; 
            gameState.isUpdatingStats = false; 
            gameState.selectedPiece = null; 
            gameState.movesWithoutProgress = 0;
            gameState.boardHistoryStr = [];

            if (data.roomID) gameState.onlineRoomID = data.roomID;

            gameState.currentOpponentName = (data.opponent?.name || data.opponentName || (gameState.lang === 'ar' ? "لاعب أونلاين" : "Online"));
            gameState.currentOpponentAvatar = (data.opponent?.avatar || data.opponentAvatar || "1000132081.png");
            
            gameState.isOnlineMode = true;
            startOnlineHintSystem(); 

            gameState.playerColor = gameState.myOnlineColor = data.color;
            gameState.virtualBoard = data.board;

            if (data.turnEndTime) gameState.turnEndTime = data.turnEndTime;

            if (gameState.virtualBoard && Array.isArray(gameState.virtualBoard)) {
                let wc = [0,0], bc = [0,0];
                gameState.virtualBoard.forEach((row, r) => {
                    if (row && Array.isArray(row)) {
                        row.forEach(p => {
                            if(p) {
                                if(p.startsWith('white')) r < 4 ? wc[0]++ : wc[1]++;
                                if(p.startsWith('black')) r < 4 ? bc[0]++ : bc[1]++;
                            }
                        });
                    }
                });
                gameState.pieceDirection.white = wc[0] > wc[1] ? 1 : -1;
                gameState.pieceDirection.black = bc[0] > bc[1] ? 1 : -1;
            }
            
            gameState.onlineFlip = gameEngine.computeOnlineFlip(gameState.myOnlineColor);
            socketManager._ensureUserProfile();

            ui.toggleOnlineUILayout(true, gameState.currentOpponentName, gameState.currentOpponentAvatar);
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('online-modal');
                window.closeAppModal('matchmaking-modal');
            }
            ui.renderBoard(true);

            gameState.currentTurn = data.turn || 'white';
            ui.startTurn();
        });

        socket.on('opponentMove', data => {
            if (!data || !data.from || !data.to) return;
            
            let isMultiJumpContinuation = (gameState.currentTurn === data.nextTurn);
            
            let possibleMoves = gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard, data.from.r, data.from.c);
            let executedPath = possibleMoves.find(p => p[p.length - 1].toR === data.to.r && p[p.length - 1].toC === data.to.c);
            
            if (executedPath) {
                let movingPieceStr = gameState.virtualBoard[executedPath[0].fromR][executedPath[0].fromC];
                let isCapture = executedPath.some(s => s.midR !== null);
                
                gameState.virtualBoard = gameEngine.applyPathToBoard(executedPath, gameState.virtualBoard);
                
                let lastStep = executedPath[executedPath.length - 1];
                let finalPieceStr = gameState.virtualBoard[lastStep.toR][lastStep.toC];
                let isPromotion = false;
                
                if (movingPieceStr && !movingPieceStr.includes('dama') && finalPieceStr && finalPieceStr.includes('dama')) {
                    isPromotion = true;
                }

                if (isCapture || isPromotion) {
                    gameState.movesWithoutProgress = 0;
                    gameState.boardHistoryStr = [];
                } else {
                    gameState.movesWithoutProgress++;
                    gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard));
                }

            } else {
                if(socket.connected) socket.emit('requestGameState', { roomID: String(gameState.onlineRoomID).trim() });
                if(data.updatedBoard) gameState.virtualBoard = data.updatedBoard; 
            }
            
            gameState.currentTurn = data.nextTurn;
            if (data.turnEndTime) gameState.turnEndTime = data.turnEndTime;

            ui.renderBoard();
            
            try {
                if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.move || fallbackMoveAudio);
            } catch (err) {}
            
            if(gameState.selectedPiece) {
                gameState.selectedPiece.classList.remove('selected');
                gameState.selectedPiece = null;
            }
            
            ui.clearHighlights();
            if (typeof ui.highlightMove === 'function') ui.highlightMove(data.from, data.to);
            
            if (isMultiJumpContinuation && data.to) {
                const boardEl = document.getElementById('board');
                const activeCell = boardEl?.querySelector(`[data-row="${data.to.r}"][data-col="${data.to.c}"]`);
                if (activeCell && activeCell.children.length > 0) activeCell.children[0].classList.add('forced'); 
            }
            
            ui.startTurn();
        });

        socket.on('opponentResigned', () => {
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
            if (gameState.isGameOver) return;

            gameState.isGameOver = true;
            gameState.isGameActive = false;
            gameEngine.endGame(gameState.myOnlineColor);
            
            socketManager._showToast(gameState.lang === 'ar' ? "انسحب الخصم! لقد فزت 🏆" : "Opponent Resigned! You Win 🏆");
        });

        socket.on('turnTimeout', data => {
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
            if (gameState.isGameOver) return;

            gameState.isGameOver = true;
            gameState.isGameActive = false;

            const winnerColor = (data && data.winner) ? data.winner : gameState.myOnlineColor;
            gameEngine.endGame(winnerColor);
            
            if (winnerColor === 'draw') {
                socketManager._showToast(gameState.lang === 'ar' ? "انتهى الوقت بالتعادل 🤝" : "Time out! Draw 🤝");
            } else if (winnerColor === gameState.myOnlineColor) {
                socketManager._showToast(gameState.lang === 'ar' ? "انتهى وقت الخصم! لقد فزت 🏆" : "Opponent timeout! You Win 🏆");
            } else {
                socketManager._showToast(gameState.lang === 'ar' ? "انتهى وقتك! حظاً موفقاً ⏳" : "Time out! Better luck next time ⏳");
            }
        });

        socket.on('syncTime', (data) => {
            if (gameState.isOnlineMode && data) {
                const seconds = data.secondsLeft || 0;
                gameState.turnTimeLeft = seconds;
                gameState.turnEndTime = Date.now() + (seconds * 1000);
                
                if (typeof ui.startTurnTimer === 'function') ui.startTurnTimer();
                else ui.setTxt('turn-countdown', ui.translate(`⏳ المتبقي للدور: ${seconds} ثانية`, `⏳ Turn Time Left: ${seconds}s`));
            }
        });

        socket.on('opponentDisconnected', data => {
            if (!gameState.isOnlineMode) return;
            socketManager._showToast((data && data.message) || (gameState.lang === 'ar' ? "انقطع اتصال الخصم" : "Opponent disconnected"));
            
            if (!gameState.isGameOver) {
                gameState.isGameOver = true;
                gameState.isGameActive = false;
                if (typeof ui.showOnlineResultsModal === 'function') {
                    ui.showOnlineResultsModal(gameState.myOnlineColor); 
                }
            }
        });

        socket.on('opponentReconnected', data => {
            if (!gameState.isOnlineMode || !data) return;
            socketManager._showToast(gameState.lang === 'ar' ? `عاد ${data.name || 'الخصم'} للاتصال!` : `${data.name || 'Opponent'} reconnected!`);
            if (data.avatar) {
                gameState.currentOpponentAvatar = data.avatar;
                ui.applyAvatar('card-opp-avatar', data.avatar, data.avatar.startsWith('data:image') || data.avatar.endsWith('.png') || data.avatar.endsWith('.jpg'));
            }
        });

        socket.on('playerDisconnected', () => {
            if (!gameState.isOnlineMode) { socket.disconnect(); return; }
            socketManager._showToast(gameState.lang === 'ar' ? "غادر الخصم الغرفة" : "Opponent left the room");
            socketManager.handleExitGame();
        });

        socket.on('opponentLeftRoom', data => {
            if (!gameState.isOnlineMode) return;
            socketManager._showToast((data && data.message) || (gameState.lang === 'ar' ? "غادر الخصم المباراة." : "Opponent left the room."));
            socketManager.handleExitGame(); 
        });

        socket.on('rematchOffer', () => {
            if (socketManager.isAlertShown) return; 
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');
            else ui.setDisplay('custom-alert-modal', 'none');
            
            socketManager.isAlertShown = true;

            if (typeof ui.showCustomAlert === 'function') {
                ui.showCustomAlert(
                    ui.translate("الخصم يطلب إعادة اللعب!", "Opponent wants a rematch!"), 
                    ui.translate("إعادة اللعب", "Rematch"), 
                    () => {
                        socketManager.isAlertShown = false;
                        socket.emit('acceptRematch', { roomID: String(gameState.onlineRoomID).trim() });
                        document.getElementById('custom-results-modal-container')?.remove();
                        if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
                        
                        const ind = document.getElementById('turn-indicator');
                        if(ind) ind.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
                    }, 
                    true, 
                    ui.translate("الخروج", "Exit"), 
                    ui.translate("قبول", "Accept")  
                );

                const updateRematchUI = () => {
                    const alertContainer = document.getElementById('custom-alert-modal'); 
                    if (alertContainer) {
                        alertContainer.style.setProperty('z-index', '99999999', 'important'); 
                        const buttons = alertContainer.querySelectorAll('button');
                        if (buttons && buttons.length >= 2) {
                            buttons[1].onclick = (e) => {
                                e.preventDefault();
                                socketManager.isAlertShown = false;
                                if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
                                else ui.setDisplay('custom-alert-modal', 'none');
                                socketManager.handleExitGame(); 
                            };
                        }
                    }
                };
                updateRematchUI();
                setTimeout(updateRematchUI, 50); 
            }
        });

        socket.on('rematchAccepted', () => {
            socketManager.isAlertShown = false;
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
            else ui.setDisplay('custom-alert-modal', 'none');
            
            document.getElementById('custom-results-modal-container')?.remove();
            if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
            
            const ind = document.getElementById('turn-indicator');
            if(ind) ind.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
        });

        socket.on('roomClosedByTimeout', (data) => {
            if (!gameState.isOnlineMode) return;
            socketManager.isAlertShown = false;
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
            else ui.setDisplay('custom-alert-modal', 'none');
            
            document.getElementById('custom-results-modal-container')?.remove();

            const reasonMsg = data && data.reason ? data.reason : (gameState.lang === 'ar' ? "انتهى وقت الاستجابة لإعادة اللعب." : "Rematch timeout expired.");
            socketManager._showToast(reasonMsg);
            
            socketManager.handleExitGame(); 
        });

        socket.on('error', msg => {
            socketManager._showToast(msg);
            if (msg && (msg.includes('match') || msg.includes('غرفة') || msg.includes('Room') || msg.includes('غير قانونية'))) {
                socketManager.handleExitGame();
            }
            ui.setDisplay('online-status-text', 'none');
            ui.setDisplay('online-setup-box', 'block');
        });

        socket.on('receiveChallenge', data => {
            if (!data || socketManager.isAlertShown) return;
            socketManager.isAlertShown = true;
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');
            else ui.setDisplay('custom-alert-modal', 'none');

            const profile = socketManager._ensureUserProfile();
            const challengerName = data.challengerName || (gameState.lang === 'ar' ? 'صديق' : 'Friend');
            const msg = gameState.lang === 'ar' 
                ? `تحدي من (${challengerName})! هل تقبل؟` 
                : `Challenge from (${challengerName})! Accept?`;
            
            if (typeof ui.showCustomAlert === 'function') {
                ui.showCustomAlert(msg, gameState.lang === 'ar' ? 'تحدي جديد ⚔️' : 'Challenge ⚔️', 
                    () => { 
                        socketManager.isAlertShown = false;
                        socket.emit('challengeResponse', { 
                            challengerId: data.challengerId, 
                            accept: true, 
                            responderId: profile.id,
                            responderName: profile.name,
                            roomID: data.roomID
                        });
                        
                        socketManager._showToast(gameState.lang === 'ar' ? "جاري الدخول للمباراة..." : "Entering match...");
                        
                        if (data.roomID) {
                            socketManager.handleRoomAction('joinRoom', data.roomID); 
                            if (typeof window.closeAppModal === 'function') window.closeAppModal('in-game-profile-modal');
                        }
                    }, 
                    true 
                );

                const updateChallengeUI = () => {
                    const alertContainer = document.getElementById('custom-alert-modal');
                    if (alertContainer) {
                        alertContainer.style.setProperty('z-index', '99999999', 'important');
                        const buttons = alertContainer.querySelectorAll('button');
                        if (buttons && buttons.length >= 2) {
                            buttons[0].style.display = 'none'; 
                            buttons[1].textContent = gameState.lang === 'ar' ? "إلغاء" : "Cancel";
                            buttons[1].onclick = (e) => {
                                e.preventDefault();
                                socketManager.isAlertShown = false;
                                if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
                                else ui.setDisplay('custom-alert-modal', 'none');
                                socketManager.handleExitGame(); 
                            };
                        }
                    }
                };
                updateChallengeUI();
                setTimeout(updateChallengeUI, 50);
            }
        });

        socket.on('challengeResponse', data => {
            socketManager.isAlertShown = false;
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
            else ui.setDisplay('custom-alert-modal', 'none');

            if (data && data.accept) {
                socketManager._showToast(gameState.lang === 'ar' ? "تم القبول! جاري التجهيز..." : "Accepted! Preparing...");
                if (typeof window.closeAppModal === 'function') window.closeAppModal('in-game-profile-modal');
            } else {
                const responderName = (data && data.responderName) || (gameState.lang === 'ar' ? 'الصديق' : 'Friend');
                socketManager._showToast(gameState.lang === 'ar' ? `رفض ${responderName} التحدي.` : `${responderName} declined.`);
                socketManager.handleExitGame(); 
            }
        });

        socket.on('profileUpdated', (updatedProfile) => {
            if (!updatedProfile) return;
            gameState.userProfile = updatedProfile;
            localStorage.setItem('hub_user_profile', JSON.stringify(updatedProfile));
            if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
        });

        socket.on('friendAddedNotification', (data) => {
            if (data) socketManager._showToast(gameState.lang === 'ar' ? `قام اللاعب (${data.newFriendId}) بإضافتك!` : `Player (${data.newFriendId}) added you!`);
        });

        socket.on('friendAddSuccess', (data) => {
            if (data) socketManager._showToast(data.msg);
        });

        socket.on('friendAddFailed', (data) => {
            if (data) socketManager._showToast(data.msg);
        });

        socket.on('levelUpAlert', (data) => {
            if (data && typeof ui.showLevelUpModal === 'function') {
                let rewardsHtml = `+${data.tokens} 🪙`;
                if (data.hints > 0) rewardsHtml += `<br>+${data.hints} 💡`;
                ui.showLevelUpModal(data.newLevel, data.title, rewardsHtml);
            }
        });
    },

    sendChatData(type, value) {
        if (gameState.isOnlineMode && gameState.onlineRoomID && socket.connected) {
            socket.emit('sendChat', { roomID: String(gameState.onlineRoomID).trim(), type: type, value: value });
        }
    },

    sendMoveToServer(fromR, fromC, toR, toC, boardState, nextTurn) {
        if (gameState.isOnlineMode && gameState.onlineRoomID) {
            const profile = this._ensureUserProfile(); 
            socket.emit('makeMove', { 
                roomID: String(gameState.onlineRoomID).trim(), 
                currentTurn: nextTurn,
                nextTurn: nextTurn, 
                guestId: profile.id, 
                from: { r: Number(fromR), c: Number(fromC) }, 
                to: { r: Number(toR), c: Number(toC) }
            });
        }
    },

    sendSurrender() {
        if (gameState.isOnlineMode && gameState.onlineRoomID) {
            if (gameState.isGameOver) return; 
            socket.emit('playerResigned', { roomID: String(gameState.onlineRoomID).trim() }); 
            gameState.isGameOver = true;
            gameState.isGameActive = false;
            gameEngine.handleSurrender(gameState.myOnlineColor);
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
        }
    },

    handleExitGame() {
        if (window.voiceChat && typeof window.voiceChat.closeCall === 'function') {
            window.voiceChat.closeCall();
            window.voiceChat.updateMicUI(false);
        }

        restoreOfflineHintSystem(); 

        if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
        document.getElementById('custom-results-modal-container')?.remove();
        
        this.isAlertShown = false; 
        if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');
        else ui.setDisplay('custom-alert-modal', 'none');
        
        if (gameState.onlineRoomID && socket.connected) {
            socket.emit('leaveRoom', { roomID: String(gameState.onlineRoomID).trim() });
        }
        
        clearInterval(gameState.mmInterval);
        gameState.mmInterval = null;
        gameState.selectedPiece = null; 
        
        if (gameState.turnTimerInterval) {
            clearInterval(gameState.turnTimerInterval);
            gameState.turnTimerInterval = null;
        }
        
        gameState.isOnlineMode = false;
        gameState.isGameActive = false;
        gameState.isGameOver = false;
        gameState.onlineRoomID = null;
        gameState.currentOpponentName = null;
        gameState.currentOpponentAvatar = null;
        if (typeof gameState.inMatch !== 'undefined') gameState.inMatch = false;
        
        this._hideDisconnectUI();

        if (window.bridge && typeof window.bridge.unlockRoom === 'function') window.bridge.unlockRoom();
        
        ui.toggleOnlineUILayout(false);
        if (typeof ui.drawEmptyBoard === 'function') ui.drawEmptyBoard(); 
    },

    sendRematchRequest() {
        if (gameState.onlineRoomID && !this.isAlertShown) { 
            this.isAlertShown = true;
            socket.emit('requestRematch', { roomID: String(gameState.onlineRoomID).trim() });
            
            if (typeof ui.showCustomAlert === 'function') {
                ui.showCustomAlert(
                    gameState.lang === 'ar' ? "تم إرسال طلبك! بانتظار رد الخصم..." : "Rematch request sent! Waiting...",
                    gameState.lang === 'ar' ? "في الانتظار" : "Waiting",
                    null, true  
                );
                
                const updateRematchRequestUI = () => {
                    const alertContainer = document.getElementById('custom-alert-modal'); 
                    if (alertContainer) {
                        alertContainer.style.setProperty('z-index', '99999999', 'important'); 
                        const buttons = alertContainer.querySelectorAll('button');
                        if (buttons && buttons.length >= 2) {
                            buttons[0].style.display = 'none';
                            buttons[1].textContent = gameState.lang === 'ar' ? "خروج" : "Exit";
                            buttons[1].onclick = (e) => {
                                e.preventDefault();
                                socketManager.isAlertShown = false;
                                if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
                                else ui.setDisplay('custom-alert-modal', 'none');
                                socketManager.handleExitGame(); 
                            };
                        }
                    }
                };
                updateRematchRequestUI();
                setTimeout(updateRematchRequestUI, 50);
            }
        }
    },

    handleRoomAction(action, roomIdInput, roomPassword = null, betAmount = 0) {
        let targetAction = action;

        if (action === 'startMatchmaking' || action === 'joinMatchmaking' || action === 'joinMatchmakingPool') {
            targetAction = 'joinMatchmakingPool';
        }

        if (targetAction !== 'joinMatchmakingPool' && !roomIdInput) {
            this._showToast(gameState.lang === 'ar' ? "الرجاء إدخال رقم الغرفة!" : "Please enter Room ID!");
            return;
        }
        
        const profile = this._ensureUserProfile();

        const dataPayload = { 
            roomID: roomIdInput ? String(roomIdInput).trim() : null, 
            userName: profile.name, 
            avatar: profile.avatar, 
            password: roomPassword, 
            guestId: profile.id,
            betAmount: betAmount 
        };

        if (roomIdInput && targetAction !== 'joinMatchmakingPool') {
            gameState.onlineRoomID = dataPayload.roomID;
        }

        if (targetAction === 'joinMatchmakingPool') {
            if (gameState.onlineRoomID && socket.connected) {
                socket.emit('leaveRoom', { roomID: String(gameState.onlineRoomID).trim() });
            }
            
            gameState.onlineRoomID = null;
            gameState.isOnlineMode = false;
            gameState.isGameActive = false;
            gameState.isGameOver = false;

            socket.emit('deviceFingerprint', { guestId: profile.id });
            this._safeEmit(targetAction, dataPayload);
        } else {
            this._safeEmit(targetAction, dataPayload);
        }
    },

    showStatusMsg(msg) {
        ui.setTxt('online-status-text', msg);
        const el = document.getElementById('online-status-text');
        if (el) el.style.cssText = "color:#f1c40f;display:block;";
    },

    sendChallenge(friendId) {
        if (!friendId || this.isAlertShown) return;
        this.isAlertShown = true;

        const challengeRoomID = "CHAL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        const profile = this._ensureUserProfile();
        
        const challengePayload = {
            targetId: friendId,
            challengerId: profile.id,
            challengerName: profile.name,
            roomID: challengeRoomID
        };

        this._safeEmit('sendChallenge', challengePayload);
        this.handleRoomAction('createRoom', challengeRoomID);
        
        if (typeof ui.showCustomAlert === 'function') {
            ui.showCustomAlert(
                gameState.lang === 'ar' ? "بانتظار رد الصديق..." : "Waiting for reply...",
                gameState.lang === 'ar' ? "إرسال تحدي" : "Challenging",
                null, true 
            );

            const updateSendChallengeUI = () => {
                const alertContainer = document.getElementById('custom-alert-modal');
                if (alertContainer) {
                    alertContainer.style.setProperty('z-index', '99999999', 'important');
                    const buttons = alertContainer.querySelectorAll('button');
                    if (buttons && buttons.length >= 2) {
                        buttons[0].style.display = 'none'; 
                        buttons[1].textContent = gameState.lang === 'ar' ? "إلغاء" : "Cancel";
                        buttons[1].onclick = (e) => {
                            e.preventDefault();
                            socketManager.isAlertShown = false;
                            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
                            else ui.setDisplay('custom-alert-modal', 'none');
                            socketManager.handleExitGame(); 
                        };
                    }
                }
            };
            updateSendChallengeUI();
            setTimeout(updateSendChallengeUI, 50);
        }
    },

    sendAddFriend(friendId) {
        if (!friendId) return;
        const profile = this._ensureUserProfile();
        const friendPayload = { requesterId: profile.id, targetId: friendId };
        this._safeEmit('addFriend', friendPayload);
    }
};
