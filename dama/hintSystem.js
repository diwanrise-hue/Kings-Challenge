// hintSystem.js
import { gameState } from './gameState.js';
import { gameEngine } from './gameEngine.js';
import { gameAI } from './gameAI.js';
import { socket } from './socketManager.js';
import { ui } from './uiController.js';
import { t } from './i18n.js';

let hintWorkerInstance = null;

function getHintWorker() {
    try {
        if (window.Worker) {
            if (!hintWorkerInstance || typeof hintWorkerInstance.postMessage !== 'function') {
                hintWorkerInstance = new Worker('aiWorker.js');
            }
            return hintWorkerInstance;
        }
    } catch (error) {
        console.error("⚠️ فشل تحميل الـ Worker الخاص بالتلميحات:", error);
    }
    return null;
}

export const hintSystem = {
    requestHint() {
        if (gameState.isOnlineMode && gameState.currentTurn !== gameState.myOnlineColor) return;
        if (!gameState.isOnlineMode && gameState.currentTurn !== gameState.playerColor) return;

        let profile = gameState.userProfile;
        if (!profile) return;
        
        // 🛡️ الإصلاح الجذري: التحقق من مصابيح الأونلاين بعداد مستقل لا يتأثر بالسيرفر
        if (gameState.isOnlineMode) {
            let used = gameState.onlineHintsUsed || 0;
            if (used >= 2) {
                ui.showCustomAlert("لا يمكنك استخدام أكثر من مصباحين في المباراة الواحدة (أونلاين)!", "تنبيه");
                return;
            }
        }

        if (!gameState.isTutorialMode) {
            if (profile.hints === undefined) profile.hints = 5;

            if (profile.hints <= 0) {
                ui.showCustomAlert(t('no_hints') || "لا تملك مصابيح تلميح كافية!");
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
        
        let hintDepth = 7; 
        let fallbackWaitTime = 4000; 

        ui.setTxt('turn-countdown', t('hint_hard') || 'جاري تحليل أفضل حركة...');

        const showGlow = (moveObj) => {
            if (hintBtn) {
                hintBtn.style.pointerEvents = 'auto';
                hintBtn.style.opacity = '1';
            }
            ui.setTxt('turn-countdown', ''); 

            if (!moveObj || moveObj.length === 0) return;
            
            // 🛠️ الإصلاح הגذري للأوفلاين: التأكد من أن الحركة مصفوفة (Array) لمنع الانهيار
            let actualPath = Array.isArray(moveObj) ? moveObj : [moveObj];
            if (!actualPath[0] || actualPath[0].fromR === undefined) {
                actualPath = eleganceMoves[0]; // إذا فشل الذكاء نأخذ الحركة الافتراضية
            }

            if (!gameState.isTutorialMode) {
                profile.hints--;
                
                // زيادة عداد الأونلاين المعزول
                if (gameState.isOnlineMode) {
                    gameState.onlineHintsUsed = (gameState.onlineHintsUsed || 0) + 1;
                }

                // تحديث الواجهة فوراً
                const counterEl = document.getElementById('hint-counter');
                if (counterEl) {
                    if (gameState.isOnlineMode) {
                        counterEl.textContent = Math.max(0, 2 - gameState.onlineHintsUsed);
                    } else {
                        counterEl.textContent = profile.hints;
                    }
                }
                
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                if (window.parent) {
                    window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
                }

                if (socket && socket.connected) {
                    socket.emit('useHint'); 
                }
            }

            // الآن actualPath آمنة ولن تسبب undefined crash
            let from = { r: actualPath[0].fromR, c: actualPath[0].fromC };
            let to = { r: actualPath[actualPath.length - 1].toR, c: actualPath[actualPath.length - 1].toC };
            
            let board = ui.getEl('board');
            if (!board) return;
            let fCell = board.querySelector(`[data-row="${from.r}"][data-col="${from.c}"]`);
            let tCell = board.querySelector(`[data-row="${to.r}"][data-col="${to.c}"]`);
            
            if (fCell) { fCell.style.boxShadow = "inset 0 0 35px #FFD700"; setTimeout(() => fCell.style.boxShadow="", 3500); }
            if (tCell) { tCell.style.boxShadow = "inset 0 0 35px #FFD700"; setTimeout(() => tCell.style.boxShadow="", 3500); }
            ui.playSound(ui.sfx.move);
        };

        const worker = getHintWorker();
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
            };
            
            worker.postMessage({ 
                board: gameState.virtualBoard, 
                depth: hintDepth, 
                level: 7, 
                aiColor: myColor,
                pieceDirection: gameState.pieceDirection 
            });
        } else {
            setTimeout(() => {
                let bestMove = gameAI.minimax(gameState.virtualBoard, 4, undefined, undefined, true, myColor, gameState.pieceDirection, Date.now(), fallbackWaitTime).move || eleganceMoves[0];
                showGlow(bestMove);
            }, 50);
        }
    }
};
