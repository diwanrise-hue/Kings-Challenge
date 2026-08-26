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

            // 💡 الإصلاح الجذري للمشكلة البصرية: حقن ستايل يظهر التوهج فوق الحجر مهما كان نوعه
            if (!document.getElementById('hint-glow-style')) {
                const style = document.createElement('style');
                style.id = 'hint-glow-style';
                style.innerHTML = `
                    @keyframes hintPulseAnim {
                        0% { box-shadow: inset 0 0 15px #34c759, 0 0 15px #34c759; background-color: rgba(52, 199, 89, 0.4); }
                        100% { box-shadow: inset 0 0 35px #34c759, 0 0 35px #34c759; background-color: rgba(52, 199, 89, 0.7); }
                    }
                    .hint-cell-glow {
                        position: relative !important;
                    }
                    .hint-cell-glow::after {
                        content: '';
                        position: absolute;
                        top: 0; left: 0; width: 100%; height: 100%;
                        border-radius: inherit;
                        pointer-events: none;
                        z-index: 99 !important; /* لكي يظهر اللون الأخضر فوق الحجر */
                        border: 3px solid #34c759;
                        animation: hintPulseAnim 0.6s infinite alternate ease-in-out;
                    }
                `;
                document.head.appendChild(style);
            }

            // تطبيق التوهج على الخلية المنطلق منها والخلية الهدف
            if (fCell) fCell.classList.add('hint-cell-glow');
            if (tCell) tCell.classList.add('hint-cell-glow');

            // إزالة التوهج بعد 3.5 ثانية
            setTimeout(() => { 
                if (fCell) fCell.classList.remove('hint-cell-glow');
                if (tCell) tCell.classList.remove('hint-cell-glow');
            }, 3500);

            // ⛔ تم حذف سطر الصوت (ui.playSound(ui.sfx.move)) نهائياً ليكون صامتاً
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
