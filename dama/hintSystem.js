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
        
        // فصلنا التلميح عن مستوى البوت! التلميح دائماً يكون بذكاء الجراند ماستر
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
            }
            
            worker.postMessage({ 
                board: gameState.virtualBoard, 
                depth: hintDepth, 
                level: 7, // نطلب مستوى 7 لضمان عبقرية التلميح
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
