/**
 * socketManager.js
 * النسخة النقية (Data-Only): تم فصل جميع أكواد الـ HTML والـ UI بالكامل!
 * هذا الملف مسؤول فقط عن استقبال البيانات من السيرفر وتوجيهها للمحرك والواجهة.
 */

import { gameState } from './gameState.js'; 
import { startOnlineHintSystem, restoreOfflineHintSystem } from './main.js';
import { ui } from './uiController.js';
import { gameEngine } from './gameEngine.js';

export const socket = io('https://diwanrise-dama-game-diwan.hf.space/dama', { 
    transports: ['websocket'], 
    upgrade: false,            
    reconnection: true,                   
    reconnectionAttempts: Infinity,       
    reconnectionDelay: 1000,              
    reconnectionDelayMax: 5000,           
    timeout: 20000,
    autoConnect: true
});
window.socket = socket; 

export const socketManager = {
    isAlertShown: false,
    pingIntervalId: null,

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
                            xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
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
                xp: 0,
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
        if (!socket.connected) socket.connect();
        socket.emit(event, data);
    },

    _forceReconnect() {
        if (socket.connected) return;
        if (typeof ui.showToast === 'function') {
            ui.showToast(gameState.lang === 'ar' ? "جاري محاولة الاتصال بالسيرفر..." : "Reconnecting to server...");
        }
        socket.disconnect(); 
        setTimeout(() => {
            socket.io.opts.transports = ['websocket']; 
            socket.connect();
        }, 500);
    },

    init() {
        window.socketManager = this;
        
        if (typeof ui.initPingIndicator === 'function') ui.initPingIndicator();

        window.addEventListener('online', () => {
            setTimeout(() => this._forceReconnect(), 1000); 
        });

        window.addEventListener('offline', () => {
            if (typeof ui.updatePing === 'function') ui.updatePing(999);
            if (typeof ui.showDisconnectUI === 'function') ui.showDisconnectUI();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (navigator.onLine && !socket.connected) {
                    this._forceReconnect();
                } else if (navigator.onLine && socket.connected) {
                    socket.volatile.emit('clientPing', Date.now()); 
                }
            }
        });

        // تنظيف الأحداث السابقة
        const eventsToTurnOff = [
            'connect', 'disconnect', 'roomCreated', 'roomJoined', 'waitingForOpponent',
            'gameStart', 'opponentMove', 'opponentResigned', 'turnTimeout',
            'opponentDisconnected', 'opponentReconnected', 'playerDisconnected',
            'rematchOffer', 'rematchAccepted', 'error', 'receiveChallenge',
            'challengeResponse', 'profileUpdated', 'friendAddedNotification',
            'friendAddSuccess', 'friendAddFailed', 'opponentLeftRoom', 'roomClosedByTimeout',
            'connect_error', 'syncTime', 'receiveChat', 'levelUpAlert', 'syncGameState',
            'activeRoomsList', 'mic-request', 'mic-response', 'spectatorJoined', 'spectatorCountChanged',
            'bettingClosed', 'betResult', 'creatorCutReceived', 'leaderboardData'
        ];
        eventsToTurnOff.forEach(event => socket.off(event));

        socket.on('serverPong', (clientTime) => {
            if (typeof ui.hideDisconnectUI === 'function') ui.hideDisconnectUI();
            let latency = Date.now() - clientTime; 
            if (latency > 999) latency = 999;
            if (typeof ui.updatePing === 'function') ui.updatePing(latency);
        });

        socket.on('leaderboardData', (data) => {
            let formattedWins = [], formattedXp = [], formattedTokens = [];
            if(Array.isArray(data)) {
                for(let i=0; i<data.length; i+=2) { 
                    formattedWins.push({ name: data[i], score: data[i+1] }); 
                    formattedXp.push({ name: data[i], score: data[i+1] * 25 });
                    formattedTokens.push({ name: data[i], score: data[i+1] * 125 }); 
                }
            } else if (data) { 
                formattedWins = data.wins || []; 
                formattedXp = data.xp || []; 
                formattedTokens = data.tokens || []; 
            }
            if (window.populateLeaderboards) window.populateLeaderboards(formattedWins, formattedXp, formattedTokens);
        });

        socket.on('receiveChat', (data) => {
            if (window.playInGameChat && data) {
                window.playInGameChat('opp', data.type, data.value);
            }
        });

        // 💡 تم تحويل تصميم الغرف بالكامل إلى الواجهة (UI)
        socket.on('activeRoomsList', (rooms) => {
            if (typeof ui.renderRoomsList === 'function') ui.renderRoomsList(rooms);
        });

        socket.on('connect', () => {
            if (typeof ui.hideDisconnectUI === 'function') ui.hideDisconnectUI();
            if (typeof ui.updatePing === 'function') ui.updatePing(45); 
            socket.volatile.emit('clientPing', Date.now()); 

            const profile = this._ensureUserProfile();
            socket.emit('deviceFingerprint', { guestId: profile.id });
            socket.emit('requestActiveRooms');

            if (gameState.isOnlineMode && gameState.onlineRoomID) {
                socket.emit('requestGameState', { roomID: String(gameState.onlineRoomID).trim() });
                this.handleRoomAction('joinRoom', gameState.onlineRoomID);
            }
            if (typeof ui.hideCustomAlert === 'function') ui.hideCustomAlert();
        });

        socket.on('disconnect', () => {
            if (typeof ui.updatePing === 'function') ui.updatePing(999);
            if (typeof ui.showDisconnectUI === 'function') ui.showDisconnectUI();
        });

        socket.on('connect_error', () => {
            if (typeof ui.closeMatchmakingModal === 'function') ui.closeMatchmakingModal();
            if (typeof ui.updatePing === 'function') ui.updatePing(999);
            if (typeof ui.showDisconnectUI === 'function') ui.showDisconnectUI();
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
            
            if (!gameState.isSpectator && typeof ui.showToast === 'function') {
                ui.showToast(gameState.lang === 'ar' ? "تمت مزامنة الرقعة بنجاح 🔄" : "Board synchronized 🔄");
            }
        });

        socket.on('roomCreated', id => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'white';
            gameState.isSpectator = false;
            if(id) gameState.onlineRoomID = id;
            
            if (typeof ui.showToast === 'function') ui.showToast(gameState.lang === 'ar' ? "تم الإنشاء! بانتظار الخصم" : "Created! Waiting...");
            if (typeof window.closeAppModal === 'function') window.closeAppModal('create-room-modal');
        });

        socket.on('roomJoined', () => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'black';
            gameState.isSpectator = false;
            
            if (typeof ui.showToast === 'function') ui.showToast(gameState.lang === 'ar' ? "تم الانضمام!" : "Joined!");
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('online-modal');
                window.closeAppModal('create-room-modal');
            }
        });

        socket.on('waitingForOpponent', msg => { if(typeof ui.showToast === 'function') ui.showToast(msg); });

        socket.on('spectatorJoined', (data) => {
            if (!data) return;
            gameState.isBotOpponent = false;
            gameState.isGameOver = false;
            gameState.isGameActive = true;
            gameState.isOnlineMode = true;
            gameState.isSpectator = true; 
            gameState.onlineRoomID = data.roomID;
            gameState.virtualBoard = data.board;
            gameState.currentTurn = data.turn || 'white';
            
            if (typeof ui.handleSpectatorJoined === 'function') ui.handleSpectatorJoined(data);
        });

        socket.on('spectatorCountChanged', (data) => {
            if (typeof ui.updateSpectatorCount === 'function') ui.updateSpectatorCount(data.count);
        });

        socket.on('betResult', (data) => {
            if (data && data.msg && typeof ui.showBetResult === 'function') ui.showBetResult(data);
        });

        socket.on('creatorCutReceived', (data) => {
            if (data && data.amount && typeof ui.showToast === 'function') {
                ui.showToast(`🎁 مكافأة دعم: حصلت على ${data.amount} 🪙 من رهانات المشاهدين!`);
            }
        });

        socket.on('bettingClosed', () => {
            if (typeof window.closeAppModal === 'function') window.closeAppModal('spectator-bet-modal');
            if (gameState.isSpectator && typeof ui.showToast === 'function') ui.showToast("تم إغلاق المراهنات لهذه المباراة 🔒");
        });

        socket.on('gameStart', data => {
            if (!data) return;
            this.isAlertShown = false; 

            gameState.isBotOpponent = false;
            gameState.isGameOver = false;
            gameState.isGameActive = true;
            gameState.isSpectator = false;
            gameState.statsUpdated = false; 
            gameState.isUpdatingStats = false; 
            gameState.selectedPiece = null; 
            gameState.movesWithoutProgress = 0;
            gameState.boardHistoryStr = [];

            if (data.roomID) gameState.onlineRoomID = data.roomID;

            gameState.currentOpponentName = (data.opponent?.name || data.opponentName || (gameState.lang === 'ar' ? "لاعب أونلاين" : "Online"));
            gameState.currentOpponentAvatar = (data.opponent?.avatar || data.opponentAvatar || "1000132081.png");
            gameState.currentOpponentXp = data.opponent?.xp || 0;
            
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
            
            if (typeof ui.handleGameStart === 'function') {
                ui.handleGameStart(data, this._ensureUserProfile());
            }
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
                let isPromotion = (!movingPieceStr.includes('dama') && finalPieceStr && finalPieceStr.includes('dama'));

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

            if (typeof ui.handleOpponentMove === 'function') {
                ui.handleOpponentMove(data, isMultiJumpContinuation);
            }
        });

        socket.on('opponentResigned', () => {
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
            if (gameState.isGameOver) return;

            gameState.isGameOver = true;
            gameState.isGameActive = false;
            
            if (!gameState.isSpectator) {
                gameEngine.endGame(gameState.myOnlineColor);
                if (typeof ui.showToast === 'function') ui.showToast(gameState.lang === 'ar' ? "انسحب الخصم! لقد فزت 🏆" : "Opponent Resigned! You Win 🏆");
            } else {
                if (typeof ui.showToast === 'function') ui.showToast("انسحب أحد اللاعبين وانتهت المباراة.");
            }
        });

        socket.on('turnTimeout', data => {
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
            if (gameState.isGameOver) return;

            gameState.isGameOver = true;
            gameState.isGameActive = false;

            const winnerColor = (data && data.winner) ? data.winner : gameState.myOnlineColor;
            
            if (!gameState.isSpectator) {
                gameEngine.endGame(winnerColor);
                if (typeof ui.showToast === 'function') {
                    if (winnerColor === 'draw') ui.showToast(gameState.lang === 'ar' ? "انتهى الوقت بالتعادل 🤝" : "Time out! Draw 🤝");
                    else if (winnerColor === gameState.myOnlineColor) ui.showToast(gameState.lang === 'ar' ? "انتهى وقت الخصم! لقد فزت 🏆" : "Opponent timeout! You Win 🏆");
                    else ui.showToast(gameState.lang === 'ar' ? "انتهى وقتك! حظاً موفقاً ⏳" : "Time out! Better luck next time ⏳");
                }
            } else {
                if (typeof ui.showToast === 'function') ui.showToast("انتهى وقت أحد اللاعبين وانتهت المباراة.");
            }
        });

        socket.on('syncTime', (data) => {
            if (gameState.isOnlineMode && data) {
                const seconds = data.secondsLeft || 0;
                gameState.turnTimeLeft = seconds;
                gameState.turnEndTime = Date.now() + (seconds * 1000);
                if (typeof ui.startTurnTimer === 'function') ui.startTurnTimer();
            }
        });

        socket.on('opponentDisconnected', data => {
            if (!gameState.isOnlineMode) return;
            if (typeof ui.showToast === 'function') ui.showToast((data && data.message) || (gameState.lang === 'ar' ? "انقطع اتصال الخصم" : "Opponent disconnected"));
            
            if (!gameState.isGameOver && !gameState.isSpectator) {
                gameState.isGameOver = true;
                gameState.isGameActive = false;
                if (typeof ui.showOnlineResultsModal === 'function') ui.showOnlineResultsModal(gameState.myOnlineColor); 
            }
        });

        socket.on('opponentReconnected', data => {
            if (!gameState.isOnlineMode || !data) return;
            if (typeof ui.showToast === 'function') ui.showToast(gameState.lang === 'ar' ? `عاد ${data.name || 'الخصم'} للاتصال!` : `${data.name || 'Opponent'} reconnected!`);
            
            if (data.avatar && !gameState.isSpectator) {
                gameState.currentOpponentAvatar = data.avatar;
                if (typeof ui.applyAvatar === 'function') ui.applyAvatar('card-opp-avatar', data.avatar, data.avatar.startsWith('data:image') || data.avatar.endsWith('.png') || data.avatar.endsWith('.jpg'));
            }
        });

        socket.on('playerDisconnected', () => {
            if (!gameState.isOnlineMode) { socket.disconnect(); return; }
            if (typeof ui.showToast === 'function') ui.showToast(gameState.lang === 'ar' ? "غادر الخصم الغرفة" : "Opponent left the room");
            this.handleExitGame();
        });

        socket.on('opponentLeftRoom', data => {
            if (!gameState.isOnlineMode) return;
            if (typeof ui.showToast === 'function') ui.showToast((data && data.message) || (gameState.lang === 'ar' ? "غادر الخصم المباراة." : "Opponent left the room."));
            this.handleExitGame(); 
        });

        socket.on('rematchOffer', () => {
            if (this.isAlertShown || gameState.isSpectator) return; 
            this.isAlertShown = true;
            if (typeof ui.showRematchOffer === 'function') ui.showRematchOffer();
        });

        socket.on('rematchAccepted', () => {
            this.isAlertShown = false;
            if (typeof ui.handleRematchAccepted === 'function') ui.handleRematchAccepted();
        });

        socket.on('roomClosedByTimeout', (data) => {
            if (!gameState.isOnlineMode) return;
            this.isAlertShown = false;
            const reasonMsg = data && data.reason ? data.reason : (gameState.lang === 'ar' ? "انتهى وقت الاستجابة لإعادة اللعب." : "Rematch timeout expired.");
            if (typeof ui.showToast === 'function') ui.showToast(reasonMsg);
            this.handleExitGame(); 
        });

        socket.on('error', msg => {
            if (typeof ui.showToast === 'function') ui.showToast(msg);
            if (msg && (msg.includes('match') || msg.includes('غرفة') || msg.includes('Room') || msg.includes('غير قانونية'))) {
                this.handleExitGame();
            }
        });

        socket.on('receiveChallenge', data => {
            if (!data) return;
            if (typeof ui.showChallengeToast === 'function') ui.showChallengeToast(data);
        });

        socket.on('challengeResponse', data => {
            if (data && data.accept) {
                if (typeof ui.showToast === 'function') ui.showToast(gameState.lang === 'ar' ? "تم القبول! جاري التجهيز..." : "Accepted! Preparing...");
            } else {
                const responderName = (data && data.responderName) || (gameState.lang === 'ar' ? 'الصديق' : 'Friend');
                if (typeof ui.showToast === 'function') ui.showToast(gameState.lang === 'ar' ? `رفض ${responderName} التحدي.` : `${responderName} declined.`);
                this.handleExitGame(); 
            }
        });

        socket.on('mic-request', (data) => {
            if (!gameState.isOnlineMode || gameState.isSpectator) return;
            if (typeof ui.showMicRequest === 'function') ui.showMicRequest(data);
        });

        socket.on('mic-response', (data) => {
            if (data.accept) {
                if (typeof ui.showToast === 'function') ui.showToast("تم قبول طلب الصوت 🎤");
                if (window.voiceChat) window.voiceChat.forceStartCall();
            } else {
                if (typeof ui.showToast === 'function') ui.showToast("رفض الخصم طلب المحادثة الصوتية 🔕");
                if (window.voiceChat) window.voiceChat.updateMicUI(false);
            }
        });

        socket.on('profileUpdated', (updatedProfile) => {
            if (!updatedProfile) return;
            gameState.userProfile = updatedProfile;
            localStorage.setItem('hub_user_profile', JSON.stringify(updatedProfile));
            if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
        });

        socket.on('friendAddedNotification', (data) => {
            if (data && typeof ui.showToast === 'function') ui.showToast(gameState.lang === 'ar' ? `قام اللاعب (${data.newFriendId}) بإضافتك!` : `Player (${data.newFriendId}) added you!`);
        });

        socket.on('friendAddSuccess', (data) => {
            if (data && typeof ui.showToast === 'function') ui.showToast(data.msg);
        });

        socket.on('friendAddFailed', (data) => {
            if (data && typeof ui.showToast === 'function') ui.showToast(data.msg);
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
        if (gameState.isOnlineMode && gameState.onlineRoomID && socket.connected && !gameState.isSpectator) {
            socket.emit('sendChat', { roomID: String(gameState.onlineRoomID).trim(), type: type, value: value });
        }
    },

    sendMoveToServer(fromR, fromC, toR, toC, boardState, nextTurn) {
        if (gameState.isOnlineMode && gameState.onlineRoomID && !gameState.isSpectator) {
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
        if (gameState.isOnlineMode && gameState.onlineRoomID && !gameState.isSpectator) {
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
        if (typeof ui.cleanupMatchUI === 'function') ui.cleanupMatchUI();
        
        this.isAlertShown = false; 
        
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
        gameState.isSpectator = false; 
        gameState.onlineRoomID = null;
        gameState.currentOpponentName = null;
        gameState.currentOpponentAvatar = null;
        gameState.currentOpponentXp = 0;
        if (typeof gameState.inMatch !== 'undefined') gameState.inMatch = false;
        
        if (window.bridge && typeof window.bridge.unlockRoom === 'function') window.bridge.unlockRoom();
        if (typeof ui.drawEmptyBoard === 'function') ui.drawEmptyBoard(); 
    },

    sendRematchRequest() {
        if (gameState.onlineRoomID && !this.isAlertShown && !gameState.isSpectator) { 
            this.isAlertShown = true;
            socket.emit('requestRematch', { roomID: String(gameState.onlineRoomID).trim() });
            if (typeof ui.showRematchWaiting === 'function') ui.showRematchWaiting();
        }
    },

    handleRoomAction(action, roomIdInput, roomPassword = null, betAmount = 0) {
        let targetAction = action;
        if (action === 'startMatchmaking' || action === 'joinMatchmaking' || action === 'joinMatchmakingPool') {
            targetAction = 'joinMatchmakingPool';
        }

        if (targetAction !== 'joinMatchmakingPool' && !roomIdInput) {
            if (typeof ui.showToast === 'function') ui.showToast(gameState.lang === 'ar' ? "الرجاء إدخال رقم الغرفة!" : "Please enter Room ID!");
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

    joinSpectator(roomID) {
        if (!socket.connected) socket.connect();
        const profile = this._ensureUserProfile();
        socket.emit('joinSpectator', { roomID: roomID, guestId: profile.id });
    },

    placeSpectatorBet(roomID, color, amount) {
        if (!socket.connected) return;
        const profile = this._ensureUserProfile();
        socket.emit('placeSpectatorBet', { roomID: roomID, color: color, amount: amount, guestId: profile.id });
    },

    sendChallenge(friendId, betAmount = 0) {
        if (!friendId || this.isAlertShown) return;

        const challengeRoomID = "CHAL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        const profile = this._ensureUserProfile();
        
        const challengePayload = {
            targetId: friendId,
            challengerId: profile.id,
            challengerName: profile.name,
            roomID: challengeRoomID,
            betAmount: betAmount
        };

        this._safeEmit('sendChallenge', challengePayload);
        this.handleRoomAction('createRoom', challengeRoomID, null, betAmount);
        
        if (typeof ui.showToast === 'function') ui.showToast("تم إرسال طلب التحدي! بانتظار رد الصديق...");
    },

    sendAddFriend(friendId) {
        if (!friendId) return;
        const profile = this._ensureUserProfile();
        const friendPayload = { requesterId: profile.id, targetId: friendId };
        this._safeEmit('addFriend', friendPayload);
    }
};
    }
};
