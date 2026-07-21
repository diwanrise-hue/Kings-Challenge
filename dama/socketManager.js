import { gameState } from './main.js';
import { ui } from './uiController.js';
import { gameEngine } from './gameEngine.js';

export const socket = io('https://diwanrise-dama-game-diwan.hf.space/dama', { 
    transports: ['websocket', 'polling'] 
});
window.socket = socket; 

const fallbackMoveAudio = new Audio('move.mp3');

export const socketManager = {
    isAlertShown: false,
    lastConnectionErrorTime: 0,
    toastTimeout: null,

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
                            tokens: typeof parsed.tokens === 'number' ? parsed.tokens : 0,
                            gamesPlayed: Number(parsed.gamesPlayed) || 0,
                            wins: Number(parsed.wins) || 0,
                            losses: Number(parsed.losses) || 0,
                            purchasedItems: Array.isArray(parsed.purchasedItems) ? parsed.purchasedItems : [],
                            friends: Array.isArray(parsed.friends) ? parsed.friends : []
                        };
                    }
                }
            }
        } catch (e) {
            console.error("⚠️ فشل قراءة ملف تعريف المستخدم من local storage:", e);
        }
        
        if (!gameState.userProfile || !gameState.userProfile.id) {
            gameState.userProfile = { 
                id: 'GUEST-' + Math.random().toString(36).substring(2, 9).toUpperCase(), 
                name: 'Guest', 
                avatar: '1000132081.png',
                tokens: 0,
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                purchasedItems: [],
                friends: []
            };
            try {
                localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile));
            } catch (e) {
                console.error("⚠️ فشل حفظ ملف الضيف التلقائي:", e);
            }
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
        const eventsToTurnOff = [
            'connect', 'disconnect', 'roomCreated', 'roomJoined', 'waitingForOpponent',
            'gameStart', 'opponentMove', 'opponentResigned', 'turnTimeout',
            'opponentDisconnected', 'opponentReconnected', 'playerDisconnected',
            'rematchOffer', 'rematchAccepted', 'error', 'receiveChallenge',
            'challengeResponse', 'profileUpdated', 'friendAddedNotification',
            'friendAddSuccess', 'friendAddFailed', 'opponentLeftRoom', 'roomClosedByTimeout',
            'connect_error', 'syncTime'
        ];
        eventsToTurnOff.forEach(event => socket.off(event));

        // 🟢 التعديل الهام: عند عودة الإنترنت والاتصال بالخادم
        socket.on('connect', () => {
            console.log('Connected to server successfully');
            const profile = this._ensureUserProfile();
            socket.emit('deviceFingerprint', { guestId: profile.id });
            if (gameState.isOnlineMode && gameState.onlineRoomID) {
                this.handleRoomAction('joinRoom', gameState.onlineRoomID);
            }
            
            // إخفاء نافذة التحذير الجميلة فوراً وبشكل تلقائي بمجرد عودة الإنترنت
            if (typeof ui.setDisplay === 'function') {
                ui.setDisplay('custom-alert-modal', 'none');
            } else if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('custom-alert-modal');
            }
        });

        // 🔴 التعديل الهام: عند انقطاع الإنترنت كلياً
        socket.on('disconnect', (reason) => {
            console.warn('Disconnected:', reason);
            if (typeof ui.showCustomAlert === 'function') {
                const title = gameState.lang === 'en' ? "Connection Lost" : "انقطاع الاتصال";
                const msg = gameState.lang === 'en' 
                    ? "⚠️ Connection lost. Retrying..." 
                    : "⚠️ عذراً، انقطع الاتصال بالخادم أو الإنترنت ضعيف. يرجى الانتظار، جاري محاولة إعادة الاتصال...";
                
                // إظهار النافذة الزجاجية الأنيقة بدون زر إلغاء لتنبيه اللاعب
                ui.showCustomAlert(msg, title, null, false);
            }
        });

        // 🟡 التعديل الهام: عند ضعف الإنترنت ومحاولة الخادم إعادة الاتصال
        socket.on('connect_error', (err) => {
            console.warn("⚠️ تنبيه المطور: الإنترنت مقطوع أو ضعيف جداً بالجهاز حالياً!", err);
            
            const mmModal = document.getElementById('matchmaking-modal');
            if (mmModal && (mmModal.style.display === 'block' || mmModal.style.display === 'flex')) {
                if (typeof window.closeAppModal === 'function') {
                    window.closeAppModal('matchmaking-modal');
                } else {
                    mmModal.style.display = 'none';
                }
                clearInterval(gameState.mmInterval);
                gameState.mmInterval = null;
            }
            
            const now = Date.now();
            if (now - this.lastConnectionErrorTime > 10000) {
                this.lastConnectionErrorTime = now;
                if (typeof ui.showCustomAlert === 'function') {
                    const title = gameState.lang === 'en' ? "Connection Error" : "ضعف الإنترنت";
                    const msg = gameState.lang === 'en' 
                        ? "⚠️ Internet connection is weak. Retrying..." 
                        : "⚠️ جاري محاولة استعادة الاتصال بالإنترنت، يرجى الانتظار...";
                    
                    // إظهار النافذة الزجاجية الأنيقة
                    ui.showCustomAlert(msg, title, null, false);
                }
            }
        });

        socket.on('roomCreated', id => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'white';
            if(id) gameState.onlineRoomID = id;
            this.showStatusMsg(gameState.lang === 'ar' ? "تم الإنشاء! بانتظار الخصم" : "Created! Waiting...");
            ui.setDisplay('online-setup-box', 'none');
        });

        socket.on('roomJoined', () => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'black';
            this.showStatusMsg(gameState.lang === 'ar' ? "تم الانضمام!" : "Joined!");
            ui.setDisplay('online-setup-box', 'none');
        });

        socket.on('waitingForOpponent', msg => this.showStatusMsg(msg));

        socket.on('gameStart', data => {
            if (!data) return;
            document.getElementById('custom-results-modal-container')?.remove(); 
            
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('custom-alert-modal');
            } else {
                ui.setDisplay('custom-alert-modal', 'none');
            }
            this.isAlertShown = false; 

            if (typeof gameEngine.closeResultsMenu === 'function') {
                gameEngine.closeResultsMenu();
            }
            clearInterval(gameState.mmInterval);
            gameState.mmInterval = null; 

            gameState.isBotOpponent = false;
            gameState.isGameOver = false;
            gameState.isGameActive = true;
            gameState.statsUpdated = false; 
            gameState.isUpdatingStats = false; 
            gameState.selectedPiece = null; 

            if (data.roomID) {
                gameState.onlineRoomID = data.roomID;
            }

            gameState.currentOpponentName = (data.opponent?.name || data.opponentName || (gameState.lang === 'ar' ? "لاعب أونلاين" : "Online"));
            gameState.currentOpponentAvatar = (data.opponent?.avatar || data.opponentAvatar || "1000132081.png");
            gameState.isOnlineMode = true;
            gameState.playerColor = gameState.myOnlineColor = data.color;
            gameState.virtualBoard = data.board;

            if (data.turnEndTime) {
                gameState.turnEndTime = data.turnEndTime;
            }

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
            this._ensureUserProfile();

            ui.toggleOnlineUILayout(true, gameState.currentOpponentName, gameState.currentOpponentAvatar);
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('online-modal');
                window.closeAppModal('matchmaking-modal');
            }
            ui.renderBoard();

            gameState.currentTurn = data.turn || 'white';
            ui.startTurn();
        });

        socket.on('opponentMove', data => {
            if (!data || !data.updatedBoard) return;
            
            let isMultiJumpContinuation = (gameState.currentTurn === data.nextTurn);
            
            gameState.virtualBoard = data.updatedBoard;
            gameState.currentTurn = data.nextTurn;
            
            if (data.turnEndTime) {
                gameState.turnEndTime = data.turnEndTime;
            }

            ui.renderBoard();
            
            try {
                if (typeof ui.playSound === 'function') {
                    ui.playSound(ui.sfx.move || fallbackMoveAudio);
                }
            } catch (err) { console.warn(err); }
            
            if(gameState.selectedPiece) {
                gameState.selectedPiece.classList.remove('selected');
                gameState.selectedPiece = null;
            }
            
            ui.clearHighlights();
            
            if (data.from && data.to && typeof ui.highlightMove === 'function') {
                ui.highlightMove(data.from, data.to);
            }
            
            if (isMultiJumpContinuation && data.to) {
                const boardEl = document.getElementById('board');
                const activeCell = boardEl?.querySelector(`[data-row="${data.to.r}"][data-col="${data.to.c}"]`);
                if (activeCell && activeCell.children.length > 0) {
                    activeCell.children[0].classList.add('forced'); 
                }
            }
            
            ui.startTurn();
        });

        socket.on('opponentResigned', () => {
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
            if (gameState.isGameOver) return;

            gameState.isGameOver = true;
            gameState.isGameActive = false;
            gameEngine.endGame(gameState.myOnlineColor);
            
            this._showToast(gameState.lang === 'ar' ? "انسحب الخصم! لقد فزت 🏆" : "Opponent Resigned! You Win 🏆");
        });

        socket.on('turnTimeout', data => {
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
            if (gameState.isGameOver) return;

            gameState.isGameOver = true;
            gameState.isGameActive = false;

            const winnerColor = (data && data.winner) ? data.winner : gameState.myOnlineColor;
            gameEngine.endGame(winnerColor);
            
            if (winnerColor === gameState.myOnlineColor) {
                this._showToast(gameState.lang === 'ar' ? "انتهى وقت الخصم! لقد فزت 🏆" : "Opponent timeout! You Win 🏆");
            } else {
                this._showToast(gameState.lang === 'ar' ? "انتهى وقتك! حظاً موفقاً ⏳" : "Time out! Better luck next time ⏳");
            }
        });

        socket.on('syncTime', (data) => {
            if (gameState.isOnlineMode) {
                gameState.turnTimeLeft = data.secondsLeft;
                ui.setTxt('turn-countdown', ui.translate(`⏳ المتبقي للدور: ${data.secondsLeft} ثانية`, `⏳ Turn Time Left: ${data.secondsLeft}s`));
            }
        });

        socket.on('opponentDisconnected', data => {
            if (!gameState.isOnlineMode) return;
            this._showToast((data && data.message) || (gameState.lang === 'ar' ? "انقطع اتصال الخصم" : "Opponent disconnected"));
            
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
            this._showToast(gameState.lang === 'ar' ? `عاد ${data.name || 'الخصم'} للاتصال!` : `${data.name || 'Opponent'} reconnected!`);
            if (data.avatar) {
                gameState.currentOpponentAvatar = data.avatar;
                ui.applyAvatar('card-opp-avatar', data.avatar, data.avatar.startsWith('data:image') || data.avatar.endsWith('.png') || data.avatar.endsWith('.jpg'));
            }
        });

        socket.on('playerDisconnected', () => {
            if (!gameState.isOnlineMode) {
                socket.disconnect();
                return;
            }
            this._showToast(gameState.lang === 'ar' ? "غادر الخصم الغرفة" : "Opponent left the room");
            this.handleExitGame();
        });

        socket.on('opponentLeftRoom', data => {
            if (!gameState.isOnlineMode) return;
            this._showToast((data && data.message) || (gameState.lang === 'ar' ? "غادر الخصم المباراة." : "Opponent left the room."));
            this.handleExitGame(); 
        });

        socket.on('rematchOffer', () => {
            if (this.isAlertShown) return; 
            
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('custom-alert-modal');
            } else {
                ui.setDisplay('custom-alert-modal', 'none');
            }
            this.isAlertShown = true;

            if (typeof ui.showCustomAlert === 'function') {
                ui.showCustomAlert(
                    ui.translate("الخصم يطلب إعادة اللعب!", "Opponent wants a rematch!"), 
                    ui.translate("إعادة اللعب", "Rematch"), 
                    () => {
                        this.isAlertShown = false;
                        socket.emit('acceptRematch', { roomID: gameState.onlineRoomID });
                        document.getElementById('custom-results-modal-container')?.remove();
                        if (typeof gameEngine.closeResultsMenu === 'function') {
                            gameEngine.closeResultsMenu();
                        }
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
                                this.isAlertShown = false;
                                if (typeof window.closeAppModal === 'function') {
                                    window.closeAppModal('custom-alert-modal'); 
                                } else {
                                    ui.setDisplay('custom-alert-modal', 'none');
                                }
                                this.handleExitGame(); 
                            };
                        }
                    }
                };
                updateRematchUI();
                setTimeout(updateRematchUI, 50); 
            }
        });

        socket.on('rematchAccepted', () => {
            this.isAlertShown = false;
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('custom-alert-modal'); 
            } else {
                ui.setDisplay('custom-alert-modal', 'none');
            }

            document.getElementById('custom-results-modal-container')?.remove();
            if (typeof gameEngine.closeResultsMenu === 'function') {
                gameEngine.closeResultsMenu();
            }
            const ind = document.getElementById('turn-indicator');
            if(ind) ind.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
        });

        socket.on('roomClosedByTimeout', (data) => {
            if (!gameState.isOnlineMode) return;
            this.isAlertShown = false;
            
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('custom-alert-modal'); 
            } else {
                ui.setDisplay('custom-alert-modal', 'none');
            }
            document.getElementById('custom-results-modal-container')?.remove();

            const reasonMsg = data && data.reason ? data.reason : (gameState.lang === 'ar' ? "انتهى وقت الاستجابة لإعادة اللعب." : "Rematch timeout expired.");
            this._showToast(reasonMsg);
            
            this.handleExitGame(); 
        });

        socket.on('error', msg => {
            this._showToast(msg);
            if (msg && (msg.includes('match') || msg.includes('غرفة') || msg.includes('Room'))) {
                this.handleExitGame();
            }
            ui.setDisplay('online-status-text', 'none');
            ui.setDisplay('online-setup-box', 'block');
        });

        socket.on('receiveChallenge', data => {
            if (!data || this.isAlertShown) return;
            this.isAlertShown = true;
            
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('custom-alert-modal');
            } else {
                ui.setDisplay('custom-alert-modal', 'none');
            }

            const profile = this._ensureUserProfile();
            const challengerName = data.challengerName || (gameState.lang === 'ar' ? 'صديق' : 'Friend');
            const msg = gameState.lang === 'ar' 
                ? `تحدي من (${challengerName})! هل تقبل؟` 
                : `Challenge from (${challengerName})! Accept?`;
            
            if (typeof ui.showCustomAlert === 'function') {
                ui.showCustomAlert(msg, gameState.lang === 'ar' ? 'تحدي جديد ⚔️' : 'Challenge ⚔️', 
                    () => { 
                        this.isAlertShown = false;
                        socket.emit('challengeResponse', { 
                            challengerId: data.challengerId, 
                            accept: true, 
                            responderId: profile.id,
                            responderName: profile.name,
                            roomID: data.roomID
                        });
                        
                        this._showToast(gameState.lang === 'ar' ? "جاري الدخول للمباراة..." : "Entering match...");
                        
                        if (data.roomID) {
                            this.handleRoomAction('joinRoom', data.roomID); 
                            if (typeof window.closeAppModal === 'function') {
                                window.closeAppModal('in-game-profile-modal');
                            }
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
                            buttons[0].textContent = gameState.lang === 'ar' ? "قبول" : "Accept";
                            buttons[0].style.background = 'rgba(48,209,88,0.15)';
                            buttons[0].style.color = '#30d158';
                            buttons[0].style.border = '1px solid rgba(48,209,88,0.3)';

                            buttons[1].textContent = gameState.lang === 'ar' ? "رفض" : "Decline";
                            buttons[1].onclick = (e) => {
                                e.preventDefault();
                                this.isAlertShown = false;
                                if (typeof window.closeAppModal === 'function') {
                                    window.closeAppModal('custom-alert-modal'); 
                                } else {
                                    ui.setDisplay('custom-alert-modal', 'none');
                                }
                                const currentProfile = this._ensureUserProfile();
                                socket.emit('challengeResponse', { 
                                    challengerId: data.challengerId, 
                                    accept: false,
                                    responderName: currentProfile.name
                                });
                            };
                        }
                    }
                };
                updateChallengeUI();
                setTimeout(updateChallengeUI, 50);
            }
        });

        socket.on('challengeResponse', data => {
            this.isAlertShown = false;
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('custom-alert-modal'); 
            } else {
                ui.setDisplay('custom-alert-modal', 'none');
            }

            if (data && data.accept) {
                this._showToast(gameState.lang === 'ar' ? "تم القبول! جاري التجهيز..." : "Accepted! Preparing...");
                if (typeof window.closeAppModal === 'function') {
                    window.closeAppModal('in-game-profile-modal');
                }
            } else {
                const responderName = (data && data.responderName) || (gameState.lang === 'ar' ? 'الصديق' : 'Friend');
                this._showToast(gameState.lang === 'ar' ? `رفض ${responderName} التحدي.` : `${responderName} declined.`);
                this.handleExitGame(); 
            }
        });

        socket.on('profileUpdated', (updatedProfile) => {
            if (!updatedProfile) return;
            gameState.userProfile = updatedProfile;
            localStorage.setItem('hub_user_profile', JSON.stringify(updatedProfile));
            if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
        });

        socket.on('friendAddedNotification', (data) => {
            if (data) {
                this._showToast(gameState.lang === 'ar' ? `قام اللاعب (${data.newFriendId}) بإضافتك!` : `Player (${data.newFriendId}) added you!`);
            }
        });

        socket.on('friendAddSuccess', (data) => {
            if (data) this._showToast(data.msg);
        });

        socket.on('friendAddFailed', (data) => {
            if (data) this._showToast(data.msg);
        });
    },

    sendMoveToServer(fromR, fromC, toR, toC, boardState, nextTurn) {
        if (gameState.isOnlineMode && gameState.onlineRoomID) {
            const profile = this._ensureUserProfile(); 
            
            socket.emit('makeMove', { 
                roomID: String(gameState.onlineRoomID).trim(), 
                virtualBoard: boardState, 
                updatedBoard: boardState, 
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
            
            socket.emit('playerResigned', { roomID: gameState.onlineRoomID.trim() }); 
            
            gameState.isGameOver = true;
            gameState.isGameActive = false;

            gameEngine.handleSurrender(gameState.myOnlineColor);
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
        }
    },

    handleExitGame() {
        if (typeof gameEngine.closeResultsMenu === 'function') {
            gameEngine.closeResultsMenu();
        }
        document.getElementById('custom-results-modal-container')?.remove();
        
        this.isAlertShown = false; 
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('custom-alert-modal');
        } else {
            ui.setDisplay('custom-alert-modal', 'none');
        }
        
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
        
        if (window.bridge && typeof window.bridge.unlockRoom === 'function') {
            window.bridge.unlockRoom();
        }
        
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
                    null, 
                    true  
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
                                this.isAlertShown = false;
                                if (typeof window.closeAppModal === 'function') {
                                    window.closeAppModal('custom-alert-modal'); 
                                } else {
                                    ui.setDisplay('custom-alert-modal', 'none');
                                }
                                this.handleExitGame(); 
                            };
                        } else if (buttons && buttons.length === 1) {
                            buttons[0].textContent = gameState.lang === 'ar' ? "خروج" : "Exit";
                            buttons[0].onclick = (e) => {
                                e.preventDefault();
                                this.isAlertShown = false;
                                if (typeof window.closeAppModal === 'function') {
                                    window.closeAppModal('custom-alert-modal');
                                } else {
                                    ui.setDisplay('custom-alert-modal', 'none');
                                }
                                this.handleExitGame();
                            };
                        }
                    }
                };
                updateRematchRequestUI();
                setTimeout(updateRematchRequestUI, 50);
            }
        }
    },

    handleRoomAction(action, roomIdInput, roomPassword = null) {
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
            guestId: profile.id 
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
                null,
                true 
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
                            this.isAlertShown = false;
                            if (typeof window.closeAppModal === 'function') {
                                window.closeAppModal('custom-alert-modal'); 
                            } else {
                                ui.setDisplay('custom-alert-modal', 'none');
                            }
                            this.handleExitGame(); 
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
        
        const friendPayload = {
            requesterId: profile.id,
            targetId: friendId
        };

        this._safeEmit('addFriend', friendPayload);
    }
};
