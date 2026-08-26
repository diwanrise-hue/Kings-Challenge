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
                ui.showCustomAlert(t('no_hints') || "لا تملك مصابيح تلميح كافية في حقيبتك! يمكنك الحصول عليها من المتجر.", "تنبيه");
                return;
            }

            if (gameState.isOnlineMode) {
                let used = gameState.onlineHintsUsed || 0;
                if (used >= 2) {
                    ui.showCustomAlert("لقد استنفدت الحد الأقصى للمصابيح (2) في هذه المباراة!", "تنبيه");
                    return;
                }
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
            
            let actualPath = Array.isArray(moveObj) ? moveObj : [moveObj];
            if (!actualPath[0] || actualPath[0].fromR === undefined) {
                actualPath = eleganceMoves[0]; 
            }

            if (!gameState.isTutorialMode) {
                profile.hints--;
                if (gameState.isOnlineMode) gameState.onlineHintsUsed = (gameState.onlineHintsUsed || 0) + 1;

                if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
                
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                if (window.parent) window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');

                if (socket && socket.connected) socket.emit('useHint'); 
            }

            let from = { r: actualPath[0].fromR, c: actualPath[0].fromC };
            let to = { r: actualPath[actualPath.length - 1].toR, c: actualPath[actualPath.length - 1].toC };
            
            let board = ui.getEl('board');
            if (!board) return;
            let fCell = board.querySelector(`[data-row="${from.r}"][data-col="${from.c}"]`);
            let tCell = board.querySelector(`[data-row="${to.r}"][data-col="${to.c}"]`);
            
            // 💡 الإصلاح البصري: وضع التوهج على الحجر نفسه (Piece) لكي يظهر ولا يختفي تحت الحجر!
            if (fCell && fCell.children.length > 0) {
                let pieceEl = fCell.children[0];
                pieceEl.style.boxShadow = "0 0 25px 10px #FFD700";
                pieceEl.style.borderRadius = "50%";
                setTimeout(() => { pieceEl.style.boxShadow = ""; pieceEl.style.borderRadius = ""; }, 3500);
            } else if (fCell) {
                fCell.style.boxShadow = "inset 0 0 35px #FFD700";
                setTimeout(() => fCell.style.boxShadow="", 3500);
            }

            if (tCell) { tCell.style.boxShadow = "inset 0 0 35px #FFD700"; setTimeout(() => tCell.style.boxShadow="", 3500); }
            ui.playSound(ui.sfx.move);
        };

        const worker = getHintWorker();
        if (worker) {
            let fallbackSafetyTimer = setTimeout(() => {
                worker.onmessage = null;
                worker.onerror = null;
                gameAI.getBestMoveAsync(gameState.virtualBoard, 4, myColor, gameState.pieceDirection).then(syncMove => {
                    showGlow(syncMove || eleganceMoves[0]);
                });
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
                gameAI.getBestMoveAsync(gameState.virtualBoard, 4, myColor, gameState.pieceDirection).then(syncMove => {
                    showGlow(syncMove || eleganceMoves[0]);
                });
            };
            
            worker.postMessage({ 
                board: gameState.virtualBoard, 
                level: 7, 
                aiColor: myColor,
                pieceDirection: gameState.pieceDirection 
            });
        } else {
            setTimeout(() => {
                gameAI.getBestMoveAsync(gameState.virtualBoard, 4, myColor, gameState.pieceDirection).then(bestMove => {
                    showGlow(bestMove || eleganceMoves[0]);
                });
            }, 50);
        }
    }
};
