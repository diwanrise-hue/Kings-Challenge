/**
 * socketManager.js
 * النسخة المتطورة والكاملة (مُحسّنة وخالية من التشتيت).
 * 🌟 (مُحدّث): إضافة دالة applyMatchThemeRobust لحل مشكلة "سباق الزمن" وتأخر تحميل المتجر.
 */

import { gameState } from './gameState.js'; 
import { startOnlineHintSystem, restoreOfflineHintSystem } from './main.js';
import { ui } from './uiController.js';
import { gameEngine } from './gameEngine.js';

export const socket = io('https://diwanrise-dama-game-diwan.hf.space/dama', { 
    transports: ['websocket', 'polling'], 
    upgrade: true,            
    reconnection: true,                   
    reconnectionAttempts: Infinity,       
    reconnectionDelay: 1000,              
    reconnectionDelayMax: 5000,           
    timeout: 20000,
    autoConnect: true
});

window.socket = socket; 

const fallbackMoveAudio = new Audio('move.mp3');

// 🌟 الدالة الذكية لضمان تطبيق الساحة والإطار والأحجار 🌟
const applyMatchThemeRobust = (profile, retries = 5) => {
    if (!profile) return;
    
    // إذا لم يكتمل تحميل المتجر بعد، انتظر ربع ثانية وحاول مجدداً
    if (!window.STORE_ITEMS && retries > 0) {
        setTimeout(() => applyMatchThemeRobust(profile, retries - 1), 250);
        return;
    }

    // استخراج العناصر من البروفايل (أو وضع الافتراضي)
    const bgId = profile.equippedBg || 'bg_wood';
    const pcId = profile.equippedPc || 'pc_original';
    const frId = profile.equippedFr || 'fr_classic'; 

    // تطبيق خصائص CSS العامة على body لكي تلتقطها ملفات التصميم
    document.body.setAttribute('data-piece-style', pcId);
    document.body.setAttribute('data-board-style', bgId); // <== الإطار والساحة
    document.body.setAttribute('data-frame-style', frId); // <== الإطار والساحة

    // تطبيق ألوان المربعات المخصصة إذا وجدت
    if (window.STORE_ITEMS) {
        const bgItem = window.STORE_ITEMS[bgId];
        if (bgItem && bgItem.light && bgItem.dark) {
            document.documentElement.style.setProperty('--light-cell', bgItem.light);
            document.documentElement.style.setProperty('--dark-cell', bgItem.dark);
        } else if (bgId === 'bg_wood') {
            document.documentElement.style.setProperty('--light-cell', '#e0c094');
            document.documentElement.style.setProperty('--dark-cell', '#8b5a2b');
        }
    } 

    // 🌟 استدعاء دالة الواجهة الأصلية كإجراء تأكيدي لضمان عمل أي تأثيرات إضافية
    if (typeof window.applyTheme === 'function') {
        window.applyTheme(profile);
    }
};

export const socketManager = {
    isAlertShown: false,
    lastConnectionErrorTime: 0,
    toastTimeout: null,
    disconnectTimer: null, 
    pingIntervalId: null, 
    lastPingValue: null, 
    hidePingTimer: null, 

    _showToast(msg) {
        let toast = document.getElementById('toast-notification');
        if (toast) {
            toast.innerText = msg;
            toast.classList.add('show');
            
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
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
                pointer-events: none; opacity: 0.95; transition: opacity 0.5s ease;
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
            if (navigator.onLine) {
                if (socket && socket.connected) {
                    socket.volatile.emit('clientPing', Date.now()); 
                } else {
                    this._updatePingUI(999);
                    this._showDisconnectUI();
                    socket.connect(); 
                }
            } else {
                this._updatePingUI(999);
                this._showDisconnectUI();
            }
        }, 3000); 

        socket.off('serverPong'); 
        socket.on('serverPong', (clientTime) => {
            this._hideDisconnectUI();
            let latency = Date.now() - clientTime; 
            if (latency > 999) latency = 999;
            this._updatePingUI(latency);
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
        if (latency >= 999) color = '#ef5350'; 

        pingEl.style.color = color;
        pingDot.style.background = color;
        pingDot.style.boxShadow = `0 0 3px ${color}, 0 0 0 1px rgba(0,0,0,0.5)`; 
    },

    _showDisconnectUI() {
        let miniRadar = document.getElementById('mini-disconnect-radar');
        if (miniRadar) miniRadar.style.setProperty('display', 'flex', 'important');

        if (this.hidePingTimer) clearTimeout(this.hidePingTimer);
        this.hidePingTimer = setTimeout(() => {
            const pingEl = document.getElementById('real-ping-indicator');
            if (pingEl) pingEl.style.opacity = '0';
        }, 30000);
    },

    _hideDisconnectUI() {
        const miniRadar = document.getElementById('mini-disconnect-radar');
        if (miniRadar) miniRadar.style.setProperty('display', 'none', 'important');

        if (this.hidePingTimer) clearTimeout(this.hidePingTimer);
        const pingEl = document.getElementById('real-ping-indicator');
        if (pingEl) pingEl.style.opacity = '0.95';
    },

    _ensureUserProfile() {
        if (gameState.userProfile && gameState.userProfile.id) {
            try {
                const stored = localStorage.getItem('hub_user_profile');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.id === gameState.userProfile.id) {
                        gameState.userProfile.xp = Number(parsed.xp) || gameState.userProfile.xp;
                        gameState.userProfile.syncThemeOptOut = parsed.syncThemeOptOut === true;
                        gameState.userProfile.equippedBg = parsed.equippedBg || gameState.userProfile.equippedBg;
                        gameState.userProfile.equippedPc = parsed.equippedPc || gameState.userProfile.equippedPc;
                    }
                }
            } catch(e){}
            return gameState.userProfile;
        }

        try {
            const stored = localStorage.getItem('hub_user_profile');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    if (parsed.id && typeof parsed.id === 'string' && !parsed.id.includes('__proto__')) {
                        gameState.userProfile = {
                            ...parsed, 
                            id: String(parsed.id).trim().toUpperCase(),
                            name: String(parsed.name || 'Guest').trim(),
                            avatar: String(parsed.avatar || '1000132081.png').trim(),
                            isCustomAvatar: !!parsed.isCustomAvatar,
                            tokens: Number(parsed.tokens) || 0,
                            xp: Number(parsed.xp) || 0, 
                            gamesPlayed: Number(parsed.gamesPlayed) || 0,
                            wins: Number(parsed.wins) || 0,
                            losses: Number(parsed.losses) || 0,
                            hints: parsed.hints !== undefined ? Number(parsed.hints) : 5,
                            equippedBg: parsed.equippedBg || 'bg_wood',
                            equippedFr: parsed.equippedFr || 'fr_classic',
                            equippedPc: parsed.equippedPc || 'pc_original',
                            syncThemeOptOut: parsed.syncThemeOptOut === true, 
                            purchasedItems: Array.isArray(parsed.purchasedItems) ? parsed.purchasedItems : [],
                            friends: Array.isArray(parsed.friends) ? parsed.friends : [],
                            inventory: parsed.inventory || {}
                        };
                        return gameState.userProfile;
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
                syncThemeOptOut: false,
                purchasedItems: [],
                friends: [],
                inventory: {}
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

    _forceReconnect() {
        if (socket.connected) return;
        
        this._showDisconnectUI();
        
        socket.disconnect(); 
        setTimeout(() => {
            socket.io.opts.transports = ['websocket', 'polling']; 
            socket.connect();
        }, 500);
    },

    init() {
        window.socketManager = this;
        this._initRealPingIndicator();

        window.addEventListener('online', () => {
            this._hideDisconnectUI();
            setTimeout(() => this._forceReconnect(), 1000); 
        });

        window.addEventListener('offline', () => {
            this._updatePingUI(999);
            this._showDisconnectUI();
        });

        if (!navigator.onLine) {
            this._updatePingUI(999);
            this._showDisconnectUI();
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (navigator.onLine && !socket.connected) {
                    this._forceReconnect();
                } else if (navigator.onLine && socket.connected) {
                    socket.volatile.emit('clientPing', Date.now()); 
                }
            }
        });

        const eventsToTurnOff = [
            'connect', 'disconnect', 'roomCreated', 'roomJoined', 'waitingForOpponent',
            'gameStart', 'opponentMove', 'opponentResigned', 'turnTimeout',
            'opponentDisconnected', 'opponentReconnected', 'playerDisconnected',
            'rematchOffer', 'rematchAccepted', 'error', 'receiveChallenge',
            'challengeResponse', 'profileUpdated', 'friendAddedNotification',
            'friendAddSuccess', 'friendAddFailed', 'opponentLeftRoom', 'roomClosedByTimeout',
            'connect_error', 'syncTime', 'receiveChat', 'levelUpAlert', 'syncGameState',
            'activeRoomsList', 'mic-request', 'mic-response', 'spectatorJoined', 'spectatorCountChanged',
            'bettingClosed', 'betResult', 'creatorCutReceived', 'leaderboardData', 'gameOverByServer'
        ];
        eventsToTurnOff.forEach(event => socket.off(event));

        socket.on('leaderboardData', (data) => {
            let formattedWins = [], formattedXp = [];
            if(Array.isArray(data)) {
                for(let i=0; i<data.length; i+=2) { 
                    formattedWins.push({ name: data[i], score: data[i+1] }); 
                    formattedXp.push({ name: data[i], score: data[i+1] * 25 });
                }
            } else if (data) { 
                formattedWins = data.wins || []; 
                formattedXp = data.xp || []; 
            }
            if (window.populateLeaderboards) {
                window.populateLeaderboards(formattedWins, formattedXp);
            }
        });

        socket.on('receiveChat', (data) => {
            if (window.playInGameChat && data) {
                window.playInGameChat('opp', data.type, data.value);
            }
        });

        socket.on('activeRoomsList', (rooms) => {
            const playListContainer = document.getElementById('active-rooms-list');
            const spectateListContainer = document.getElementById('spectate-rooms-list');
            if (!playListContainer) return;
            
            const currentUserId = gameState.userProfile ? gameState.userProfile.id : null;
            window.myCurrentRoomId = null;

            playListContainer.innerHTML = '';
            if (spectateListContainer) spectateListContainer.innerHTML = '';

            let playCount = 0;
            let spectateCount = 0;

            if (!rooms || rooms.length === 0) {
                playListContainer.innerHTML = '<p style="color: #a1a1aa; font-size: 13px; text-align: center; margin-top: 20px;">لا توجد غرف متاحة حالياً. أنشئ غرفة جديدة لتبدأ!</p>';
                if (spectateListContainer) spectateListContainer.innerHTML = '<p style="color: #a1a1aa; font-size: 13px; text-align: center; margin-top: 20px;">لا توجد مباريات جارية للمراهنة عليها حالياً.</p>';
                return;
            }

            const myRoom = rooms.find(r => r.hostId === currentUserId);
            if (myRoom) window.myCurrentRoomId = myRoom.id;
            
            rooms.sort((a, b) => {
                const isAMine = (a.hostId === currentUserId);
                const isBMine = (b.hostId === currentUserId);
                if (isAMine && !isBMine) return -1;
                if (!isAMine && isBMine) return 1;
                return 0;
            });

            rooms.forEach(r => {
                const isPrivate = r.hasPassword ? '🔒 محمية' : '🔓 عامة';
                const betText = r.betAmount > 0 ? `💰 ${r.betAmount} 🪙` : `🆓 مجاني`;
                const roomEl = document.createElement('div');
                
                let avatarSrc = r.hostAvatar || "1000132081.png";
                if (!avatarSrc.startsWith('http') && !avatarSrc.startsWith('data:')) {
                    let cleanName = avatarSrc.replace(/\.\.\//g, '').replace('Photo/', '');
                    avatarSrc = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/" + cleanName;
                }

                roomEl.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05); transition: background 0.3s;";
                roomEl.onmouseenter = () => roomEl.style.background = 'rgba(255,255,255,0.1)';
                roomEl.onmouseleave = () => roomEl.style.background = 'rgba(255,255,255,0.05)';
                
                const isCreator = (r.hostId === currentUserId);
                let actionBtnHTML = '';

                if (r.isFull) {
                    if (r.isBettingOpen) {
                        actionBtnHTML = `<button onclick="window.socketManager.joinSpectator('${r.id}')" style="background: rgba(241,196,15,0.2); border: 1px solid rgba(241,196,15,0.4); border-radius: 12px; padding: 6px 16px; color: #f1c40f; cursor: pointer; font-size: 13px; font-weight: bold; font-family: inherit;">رهان ومشاهدة 👁️ (${r.spectatorsCount || 0})</button>`;
                    } else {
                        actionBtnHTML = `<button onclick="window.socketManager.joinSpectator('${r.id}')" style="background: rgba(155,89,182,0.2); border: 1px solid rgba(155,89,182,0.4); border-radius: 12px; padding: 6px 16px; color: #9b59b6; cursor: pointer; font-size: 13px; font-weight: bold; font-family: inherit;">مشاهدة فقط 👁️ (${r.spectatorsCount || 0})</button>`;
                    }
                    
                    roomEl.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; border: 1px solid #3498db; background-color: rgba(255,255,255,0.05);">
                                <img src="${avatarSrc}" onerror="this.style.display='none'; this.parentNode.textContent='👤';" style="width:100%;height:100%;object-fit:cover; display:flex; align-items:center; justify-content:center;">
                            </div>
                            <div>
                                <div style="color: white; font-weight: bold; font-size: 14px;">مباراة: ${r.hostName}</div>
                                <div style="color: #a1a1aa; font-size: 11px;">${isPrivate} | ${betText}</div>
                            </div>
                        </div>
                        ${actionBtnHTML}
                    `;
                    
                    if (spectateListContainer) {
                        spectateListContainer.appendChild(roomEl);
                        spectateCount++;
                    }
                } else {
                    if (isCreator) {
                        actionBtnHTML = `
                        <div style="display: flex; gap: 8px;">
                            <button onclick="window.deleteMyRoom('${r.id}')" style="background: rgba(255,69,58,0.15); border: 1px solid rgba(255,69,58,0.3); border-radius: 12px; padding: 6px 14px; color: #ff453a; cursor: pointer; font-size: 18px; transition: 0.3s;" onmouseover="this.style.background='rgba(255,69,58,0.25)'" onmouseout="this.style.background='rgba(255,69,58,0.15)'" title="إغلاق وحذف الغرفة">✕</button>
                            <button onclick="window.openCreatorSettings('${r.id}', ${r.betAmount})" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 6px 14px; color: #fff; cursor: pointer; font-size: 18px; transition: 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'" title="إعدادات الغرفة">⚙️</button>
                        </div>`;
                    } else {
                        if (r.hasPassword) {
                            actionBtnHTML = `<button onclick="window.showCustomPasswordPrompt('${r.id}')" style="background: rgba(52,152,219,0.2); border: 1px solid rgba(52,152,219,0.4); border-radius: 12px; padding: 6px 16px; color: #3498db; cursor: pointer; font-size: 13px; font-weight: bold; font-family: inherit;">دخول 🔒</button>`;
                        } else {
                            actionBtnHTML = `<button onclick="window.socketManager.handleRoomAction('joinRoom', '${r.id}', null, ${r.betAmount})" style="background: rgba(48,209,88,0.2); border: 1px solid rgba(48,209,88,0.4); border-radius: 12px; padding: 6px 16px; color: #30d158; cursor: pointer; font-size: 13px; font-weight: bold; font-family: inherit;">دخول</button>`;
                        }
                    }

                    roomEl.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; border: 1px solid #3498db; background-color: rgba(255,255,255,0.05);">
                                <img src="${avatarSrc}" onerror="this.style.display='none'; this.parentNode.textContent='👤';" style="width:100%;height:100%;object-fit:cover; display:flex; align-items:center; justify-content:center;">
                            </div>
                            <div>
                                <div style="color: white; font-weight: bold; font-size: 14px;">${r.hostName}</div>
                                <div style="color: #a1a1aa; font-size: 11px;">${isPrivate} | ${betText}</div>
                            </div>
                        </div>
                        ${actionBtnHTML}
                    `;
                    
                    playListContainer.appendChild(roomEl);
                    playCount++;
                }
            });

            if (playCount === 0) {
                playListContainer.innerHTML = '<p style="color: #a1a1aa; font-size: 13px; text-align: center; margin-top: 20px;">لا توجد غرف متاحة حالياً. أنشئ غرفة جديدة لتبدأ!</p>';
            }
            if (spectateCount === 0 && spectateListContainer) {
                spectateListContainer.innerHTML = '<p style="color: #a1a1aa; font-size: 13px; text-align: center; margin-top: 20px;">لا توجد مباريات جارية للمراهنة أو المشاهدة حالياً.</p>';
            }
        });

        socket.on('connect', () => {
            this._hideDisconnectUI();
            this._updatePingUI(45); 
            socket.volatile.emit('clientPing', Date.now()); 

            const profile = this._ensureUserProfile();
            socket.emit('deviceFingerprint', { guestId: profile.id });
            
            socket.emit('requestActiveRooms');

            if (gameState.isOnlineMode && gameState.onlineRoomID) {
                socket.emit('requestGameState', { roomID: String(gameState.onlineRoomID).trim() });
                this.handleRoomAction('joinRoom', gameState.onlineRoomID);
            }
            
            if (typeof ui.setDisplay === 'function') {
                ui.setDisplay('custom-alert-modal', 'none');
            }
        });

        socket.on('disconnect', (reason) => {
            this._updatePingUI(999);
            this._showDisconnectUI();
        });

        socket.on('connect_error', (err) => {
            const mmModal = document.getElementById('matchmaking-modal');
            if (mmModal && (mmModal.style.display === 'block' || mmModal.style.display === 'flex')) {
                if (typeof window.closeAppModal === 'function') window.closeAppModal('matchmaking-modal');
                else mmModal.style.display = 'none';
                clearInterval(gameState.mmInterval);
                gameState.mmInterval = null;
            }
            this._updatePingUI(999);
            this._showDisconnectUI();
        });

        socket.on('syncGameState', (data) => {
            if (!gameState.isOnlineMode || !data) return;
            
            let missingFrom = null;
            let missingTo = null;
            
            if (gameState.virtualBoard && data.board) {
                const oppColor = gameState.myOnlineColor === 'white' ? 'black' : 'white';
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        let oldP = gameState.virtualBoard[r][c];
                        let newP = data.board[r][c];
                        
                        if (oldP !== newP) {
                            if (oldP && oldP.startsWith(oppColor) && (!newP || !newP.startsWith(oppColor))) {
                                missingFrom = { r, c };
                            }
                            if (newP && newP.startsWith(oppColor) && (!oldP || !oldP.startsWith(oppColor))) {
                                missingTo = { r, c };
                            }
                        }
                    }
                }
            }

            if (data.board) gameState.virtualBoard = data.board;
            if (data.turn) gameState.currentTurn = data.turn;
            if (data.turnEndTime) gameState.turnEndTime = data.turnEndTime;
            
            gameState.movesWithoutProgress = 0;
            gameState.boardHistoryStr = [];
            gameState.pieceHistories = {}; 
            gameState.lastMyMove = null; 
            
            ui.renderBoard(true);
            
            if (missingFrom && missingTo) {
                ui.clearHighlights();
                if (typeof ui.highlightMove === 'function') {
                    ui.highlightMove(missingFrom, missingTo);
                }
            }

            ui.startTurn();
        });

        socket.on('roomCreated', id => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'white';
            gameState.isSpectator = false;
            gameState.lastMyMove = null;
            if(id) gameState.onlineRoomID = id;
            this._showToast(gameState.lang === 'ar' ? "تم الإنشاء! بانتظار الخصم" : "Created! Waiting...");
            if (typeof window.closeAppModal === 'function') window.closeAppModal('create-room-modal');
        });

        socket.on('roomJoined', () => {
            gameState.isBotOpponent = false;
            gameState.playerColor = gameState.myOnlineColor = 'black';
            gameState.isSpectator = false;
            gameState.lastMyMove = null;
            this._showToast(gameState.lang === 'ar' ? "تم الانضمام!" : "Joined!");
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('online-modal');
                window.closeAppModal('create-room-modal');
            }
        });

        socket.on('waitingForOpponent', msg => this._showToast(msg));

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
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('online-modal');

            ui.setDisplay('bottom-control-panel', 'none'); 

            let p1Name = data.player1?.name || "اللاعب 1";
            let p2Name = data.player2?.name || "اللاعب 2";

            ui.toggleOnlineUILayout(true, p2Name, data.player2?.avatar);
            ui.setTxt('card-my-name', p1Name);
            if (data.player1?.avatar) ui.applyAvatar('card-my-avatar', data.player1.avatar, data.player1.avatar.startsWith('data:image'));

            ui.renderBoard(true);
            
            if (data.isBettingOpen && typeof window.showSpectatorBetModal === 'function') {
                window.showSpectatorBetModal(data.roomID, data.player1, data.player2);
            } else {
                this._showToast("أنت الآن تشاهد المباراة 👁️");
            }
        });

        socket.on('spectatorCountChanged', (data) => {
            const countEl = document.getElementById('spectator-count-display');
            if (countEl) countEl.innerText = data.count;
            else this._showToast(`👁️ المشاهدون الآن: ${data.count}`);
        });

        socket.on('betResult', (data) => {
            if (data && data.msg) {
                if (typeof ui.showCustomAlert === 'function') {
                    ui.showCustomAlert(data.msg, data.won ? "نتيجة الرهان 🎉" : "نتيجة الرهان", null, false, null, "رائع");
                } else {
                    this._showToast(data.msg);
                }
            }
        });

        socket.on('creatorCutReceived', (data) => {
            if (data && data.amount) {
                this._showToast(`🎁 مكافأة دعم:حصلت على ${data.amount} 🪙 من رهانات المشاهدين!`);
            }
        });

        socket.on('bettingClosed', () => {
            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('spectator-bet-modal');
            }
            if (gameState.isSpectator) this._showToast("تم إغلاق المراهنات لهذه المباراة 🔒");
        });

        socket.on('gameStart', data => {
            if (!data) return;
            document.getElementById('custom-results-modal-container')?.remove(); 
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');
            else ui.setDisplay('custom-alert-modal', 'none');
            
            this.isAlertShown = false; 

            if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
            clearInterval(gameState.mmInterval);
            gameState.mmInterval = null; 

            gameState.isBotOpponent = false;
            gameState.isGameOver = false;
            gameState.isGameActive = true;
            gameState.isSpectator = false;
            gameState.statsUpdated = false; 
            gameState.isUpdatingStats = false; 
            gameState.selectedPiece = null; 
            gameState.movesWithoutProgress = 0;
            gameState.boardHistoryStr = [];
            gameState.pieceHistories = {}; 
            gameState.lastMyMove = null; 

            if (data.roomID) gameState.onlineRoomID = data.roomID;

            gameState.currentOpponentName = (data.opponent?.name || (gameState.lang === 'ar' ? "لاعب أونلاين" : "Online"));
            gameState.currentOpponentAvatar = (data.opponent?.avatar || "1000132081.png");
            
            const opponentXpFromServer = Number(data.opponent?.xp) || 0;
            gameState.currentOpponentXp = opponentXpFromServer;
            
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
            
            const myProfile = gameState.userProfile || this._ensureUserProfile();
            
            const isOptOut = myProfile.syncThemeOptOut === true;
            const myXp = Number(myProfile.xp) || 0;
            const oppXp = opponentXpFromServer;

            // 🌟 3. استخدام دالة الانتظار الذكية لضمان تطبيق الساحة حتى لو تأخر المتجر 🌟
            if (!isOptOut && oppXp > myXp) {
                this._showToast(`✨ جاري استخدام ساحة الخصم لأنه الأعلى تصنيفاً!`);
                applyMatchThemeRobust(data.opponent);
            } else if (!isOptOut && myXp > oppXp) {
                this._showToast("✨ تم تطبيق ساحتك على الخصم لأنك الأعلى تصنيفاً!");
                applyMatchThemeRobust(myProfile);
            } else {
                applyMatchThemeRobust(myProfile);
            }

            ui.toggleOnlineUILayout(true, gameState.currentOpponentName, gameState.currentOpponentAvatar);
            ui.setDisplay('bottom-control-panel', 'flex'); 

            if (typeof window.closeAppModal === 'function') {
                window.closeAppModal('online-modal');
                window.closeAppModal('create-room-modal');
                window.closeAppModal('matchmaking-modal');
            }
            ui.renderBoard(true);

            gameState.currentTurn = data.turn || 'white';
            ui.startTurn();
        });

        socket.on('opponentMove', data => {
            if (!data || !data.from || !data.to) return;
            
            let fromR = Number(data.from.r);
            let fromC = Number(data.from.c);
            let toR = Number(data.to.r);
            let toC = Number(data.to.c);

            if (gameState.lastMyMove && 
                fromR === gameState.lastMyMove.fromR && 
                fromC === gameState.lastMyMove.fromC &&
                toR === gameState.lastMyMove.toR && 
                toC === gameState.lastMyMove.toC) {
                
                gameState.lastMyMove = null; 
                return; 
            }
            gameState.lastMyMove = null; 

            if (data.updatedBoard) {
                gameState.virtualBoard = data.updatedBoard;
                gameState.movesWithoutProgress = 0; 
                gameState.pieceHistories = {};
            } else {
                let possibleMoves = gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard, fromR, fromC);
                let executedPath = possibleMoves.find(p => p[p.length - 1].toR === toR && p[p.length - 1].toC === toC);
                
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
                        gameState.pieceHistories = {}; 
                    } else {
                        gameState.movesWithoutProgress++;
                        gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard));
                        if (gameEngine.trackPieceHistory) gameEngine.trackPieceHistory(executedPath[0].fromR, executedPath[0].fromC, lastStep.toR, lastStep.toC, gameState.currentTurn);
                    }
                } else {
                    if(socket.connected) socket.emit('requestGameState', { roomID: String(gameState.onlineRoomID).trim() });
                }
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
            if (typeof ui.highlightMove === 'function') ui.highlightMove({r: fromR, c: fromC}, {r: toR, c: toC});
            
            let isMultiJumpContinuation = (gameState.currentTurn === data.nextTurn);
            if (isMultiJumpContinuation) {
                const boardEl = document.getElementById('board');
                const activeCell = boardEl?.querySelector(`[data-row="${toR}"][data-col="${toC}"]`);
                if (activeCell && activeCell.children.length > 0) activeCell.children[0].classList.add('forced'); 
            }
            
            ui.startTurn();
        });

        socket.on('opponentResigned', () => {
            if(gameState.turnTimerInterval) clearInterval(gameState.turnTimerInterval);
            if (gameState.isGameOver) return;

            gameState.isGameOver = true;
            gameState.isGameActive = false;
            
            if (!gameState.isSpectator) {
                gameEngine.endGame(gameState.myOnlineColor);
                this._showToast(gameState.lang === 'ar' ? "انسحب الخصم! لقد فزت 🏆" : "Opponent Resigned! You Win 🏆");
            } else {
                this._showToast("انسحب أحد اللاعبين وانتهت المباراة.");
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
                if (winnerColor === 'draw') {
                    this._showToast(gameState.lang === 'ar' ? "انتهى الوقت بالتعادل 🤝" : "Time out! Draw 🤝");
                } else if (winnerColor === gameState.myOnlineColor) {
                    this._showToast(gameState.lang === 'ar' ? "انتهى وقت الخصم! لقد فزت 🏆" : "Opponent timeout! You Win 🏆");
                } else {
                    this._showToast(gameState.lang === 'ar' ? "انتهى وقتك! حظاً موفقاً ⏳" : "Time out! Better luck next time ⏳");
                }
            } else {
                this._showToast("انتهى وقت أحد اللاعبين وانتهت المباراة.");
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
            this._showToast((data && data.message) || (gameState.lang === 'ar' ? "انقطع اتصال الخصم" : "Opponent disconnected"));
            
            if (!gameState.isGameOver && !gameState.isSpectator) {
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
            if (data.avatar && !gameState.isSpectator) {
                gameState.currentOpponentAvatar = data.avatar;
                ui.applyAvatar('card-opp-avatar', data.avatar, data.avatar.startsWith('data:image') || data.avatar.endsWith('.png') || data.avatar.endsWith('.jpg'));
            }
        });

        socket.on('playerDisconnected', () => {
            if (!gameState.isOnlineMode) { socket.disconnect(); return; }
            this._showToast(gameState.lang === 'ar' ? "غادر الخصم الغرفة" : "Opponent left the room");
            this.handleExitGame();
        });

        socket.on('opponentLeftRoom', data => {
            if (!gameState.isOnlineMode) return;
            this._showToast((data && data.message) || (gameState.lang === 'ar' ? "غادر الخصم المباراة." : "Opponent left the room."));
            this.handleExitGame(); 
        });

        socket.on('gameOverByServer', data => {
            if (gameState.isGameOver) return;
            gameState.isGameOver = true;
            gameState.isGameActive = false;
            
            if (gameState.turnTimerInterval) { 
                clearInterval(gameState.turnTimerInterval); 
                gameState.turnTimerInterval = null; 
            }
            
            if (data.winner === 'draw') {
                this._showToast(`انتهت المباراة بالتعادل 🤝 (${data.reason})`);
            } else if (data.winner === gameState.myOnlineColor) {
                this._showToast(`لقد فزت! 🏆 (${data.reason})`);
            } else {
                this._showToast(`لقد خسرت 😢 (${data.reason})`);
            }
            
            if (typeof ui.showOnlineResultsModal === 'function') {
                ui.showOnlineResultsModal(data.winner);
            }
        });

        socket.on('rematchOffer', () => {
            if (this.isAlertShown || gameState.isSpectator) return; 
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal');
            else ui.setDisplay('custom-alert-modal', 'none');
            
            this.isAlertShown = true;

            if (typeof ui.showCustomAlert === 'function') {
                ui.showCustomAlert(
                    ui.translate("الخصم يطلب إعادة اللعب!", "Opponent wants a rematch!"), 
                    ui.translate("إعادة اللعب", "Rematch"), 
                    () => {
                        this.isAlertShown = false;
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
            this.isAlertShown = false;
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
            else ui.setDisplay('custom-alert-modal', 'none');
            
            document.getElementById('custom-results-modal-container')?.remove();
            if (typeof gameEngine.closeResultsMenu === 'function') gameEngine.closeResultsMenu();
            
            const ind = document.getElementById('turn-indicator');
            if(ind) ind.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
        });

        socket.on('roomClosedByTimeout', (data) => {
            if (!gameState.isOnlineMode) return;
            this.isAlertShown = false;
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('custom-alert-modal'); 
            else ui.setDisplay('custom-alert-modal', 'none');
            
            document.getElementById('custom-results-modal-container')?.remove();

            const reasonMsg = data && data.reason ? data.reason : (gameState.lang === 'ar' ? "انتهى وقت الاستجابة لإعادة اللعب." : "Rematch timeout expired.");
            this._showToast(reasonMsg);
            
            this.handleExitGame(); 
        });

        socket.on('error', msg => {
            this._showToast(msg);
            if (msg && (msg.includes('match') || msg.includes('غرفة') || msg.includes('Room') || msg.includes('غير قانونية'))) {
                this.handleExitGame();
            }
        });

        socket.on('receiveChallenge', data => {
            if (!data) return;
            const profile = this._ensureUserProfile();
            const challengerName = data.challengerName || (gameState.lang === 'ar' ? 'صديق' : 'Friend');
            const betText = data.betAmount > 0 ? `برهان قدره <b>${data.betAmount} 🪙</b>` : `في مباراة ودية`;
            
            const toast = document.getElementById('challenge-toast');
            const toastMsg = document.getElementById('challenge-toast-msg');
            const openBtn = document.getElementById('challenge-toast-open-btn');
            
            if (toast && toastMsg && openBtn) {
                toastMsg.innerHTML = `اللاعب <b>${challengerName}</b> يتحداك ${betText}.`;
                toast.style.right = '15px'; 
                
                const hideTimeout = setTimeout(() => { toast.style.right = '-320px'; }, 15000);
                
                openBtn.onclick = () => {
                    clearTimeout(hideTimeout);
                    toast.style.right = '-320px';
                    
                    const actionModal = document.getElementById('challenge-action-modal');
                    const actionMsg = document.getElementById('challenge-action-msg');
                    const acceptBtn = document.getElementById('challenge-accept-btn');
                    const rejectBtn = document.getElementById('challenge-reject-btn');
                    
                    if (actionModal && actionMsg) {
                        actionMsg.innerHTML = `هل تقبل تحدي <b>${challengerName}</b> ${betText}؟`;
                        actionModal.style.display = 'flex';
                        
                        acceptBtn.onclick = () => {
                            actionModal.style.display = 'none';
                            socket.emit('challengeResponse', { 
                                challengeId: data.challengeId, 
                                accept: true, 
                                responderName: profile.name
                            });
                            socketManager._showToast(gameState.lang === 'ar' ? "جاري تجهيز الغرفة..." : "Preparing match...");
                        };
                        
                        rejectBtn.onclick = () => {
                            actionModal.style.display = 'none';
                            socket.emit('challengeResponse', { 
                                challengeId: data.challengeId, 
                                accept: false, 
                                responderName: profile.name
                            });
                        };
                    }
                };
            }
        });

        socket.on('challengeResponse', data => {
            if (data && data.accept) {
                this._showToast(gameState.lang === 'ar' ? "تم قبول التحدي! جاري الدخول..." : "Accepted! Entering...");
            } else {
                const responderName = (data && data.responderName) || (gameState.lang === 'ar' ? 'الصديق' : 'Friend');
                this._showToast(gameState.lang === 'ar' ? `رفض ${responderName} التحدي.` : `${responderName} declined.`);
                this.handleExitGame(); 
            }
        });

        socket.on('mic-request', (data) => {
            if (!gameState.isOnlineMode || gameState.isSpectator) return;
            const modal = document.getElementById('mic-request-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.getElementById('mic-accept-btn').onclick = () => {
                    modal.style.display = 'none';
                    socket.emit('mic-response', { roomID: gameState.onlineRoomID, accept: true, senderId: data.senderId });
                    if (window.voiceChat) window.voiceChat.forceStartCall();
                };
                document.getElementById('mic-reject-btn').onclick = () => {
                    modal.style.display = 'none';
                    socket.emit('mic-response', { roomID: gameState.onlineRoomID, accept: false, senderId: data.senderId });
                };
            }
        });

        socket.on('mic-response', (data) => {
            if (data.accept) {
                this._showToast("تم قبول طلب الصوت 🎤");
                if (window.voiceChat) window.voiceChat.forceStartCall();
            } else {
                this._showToast("رفض الخصم طلب المحادثة الصوتية 🔕");
                if (window.voiceChat) window.voiceChat.updateMicUI(false);
            }
        });

        socket.on('profileUpdated', (updatedProfile) => {
            if (!updatedProfile) return;
            
            if (gameState.userProfile && gameState.userProfile.id === updatedProfile.id) {
                gameState.userProfile = { ...gameState.userProfile, ...updatedProfile };
                localStorage.setItem('hub_user_profile', JSON.stringify(gameState.userProfile));
                if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
            }
        });

        socket.on('friendAddedNotification', (data) => {
            if (data) this._showToast(gameState.lang === 'ar' ? `قام اللاعب (${data.newFriendId}) بإضافتك!` : `Player (${data.newFriendId}) added you!`);
        });

        socket.on('friendAddSuccess', (data) => {
            if (data) this._showToast(data.msg);
        });

        socket.on('friendAddFailed', (data) => {
            if (data) this._showToast(data.msg);
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
            
            gameState.lastMyMove = { fromR: Number(fromR), fromC: Number(fromC), toR: Number(toR), toC: Number(toC) };
            
            socket.emit('makeMove', { 
                roomID: String(gameState.onlineRoomID).trim(), 
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
        document.getElementById('custom-results-modal-container')?.remove();
        
        this.isAlertShown = false; 
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('custom-alert-modal');
            window.closeAppModal('challenge-action-modal');
            window.closeAppModal('spectator-bet-modal');
        } else {
            ui.setDisplay('custom-alert-modal', 'none');
            ui.setDisplay('challenge-action-modal', 'none');
            ui.setDisplay('spectator-bet-modal', 'none');
        }
        
        if (gameState.onlineRoomID && socket.connected) {
            socket.emit('leaveRoom', { roomID: String(gameState.onlineRoomID).trim() });
        }
        
        clearInterval(gameState.mmInterval);
        gameState.mmInterval = null;
        gameState.selectedPiece = null; 
        gameState.lastMyMove = null; 
        
        if (gameState.turnTimerInterval) {
            clearInterval(gameState.turnTimerInterval);
            gameState.turnTimerInterval = null;
        }
        
        if (gameState.isOnlineMode && typeof window.applyTheme === 'function' && gameState.userProfile) {
            window.applyTheme(gameState.userProfile);
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
        
        this._hideDisconnectUI();

        if (window.bridge && typeof window.bridge.unlockRoom === 'function') window.bridge.unlockRoom();
        
        ui.toggleOnlineUILayout(false);
        ui.setDisplay('bottom-control-panel', 'flex'); 

        if (typeof ui.drawEmptyBoard === 'function') ui.drawEmptyBoard(); 
    },

    sendRematchRequest() {
        if (gameState.onlineRoomID && !this.isAlertShown && !gameState.isSpectator) { 
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
            betAmount: betAmount,
            xp: profile.xp || 0,
            equippedBg: profile.equippedBg || 'bg_wood',
            equippedPc: profile.equippedPc || 'pc_original',
            syncThemeOptOut: profile.syncThemeOptOut === true
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

    showStatusMsg(msg) {
        ui.setTxt('online-status-text', msg);
        const el = document.getElementById('online-status-text');
        if (el) el.style.cssText = "color:#f1c40f;display:block;";
    },

    sendChallenge(friendId, betAmount = 0) {
        if (!friendId || this.isAlertShown) return;

        const profile = this._ensureUserProfile();
        
        const challengePayload = {
            targetId: friendId,
            challengerName: profile.name,
            betAmount: betAmount
        };

        this._safeEmit('sendChallenge', challengePayload);
        
        this._showToast("تم إرسال طلب التحدي! بانتظار رد الصديق...");
    },

    sendAddFriend(friendId) {
        if (!friendId) return;
        const profile = this._ensureUserProfile();
        const friendPayload = { requesterId: profile.id, targetId: friendId };
        this._safeEmit('addFriend', friendPayload);
    }
};

window.socketManager = socketManager;
