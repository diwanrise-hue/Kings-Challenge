// hintSystem.js
import { gameState } from './gameState.js';
import { gameEngine } from './gameEngine.js';
import { gameAI } from './gameAI.js';
import { socket } from './socketManager.js';
import { ui } from './uiController.js';
import { t } from './i18n.js';

export const hintSystem = {
    async requestHint() {
        try {
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
            
            ui.setTxt('turn-countdown', 'المصباح يفكر... 💡');

            let bestMove = await gameAI.getBestMoveAsync(gameState.virtualBoard, 5, myColor, gameState.pieceDirection);
            
            if (!gameState.isTutorialMode && profile) {
                profile.hints--;
                if (gameState.isOnlineMode) gameState.onlineHintsUsed = (gameState.onlineHintsUsed || 0) + 1;

                if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                
                if (window.parent) window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
                if (socket && socket.connected) socket.emit('useHint'); 
            }

            setTimeout(() => {
                this.showGlow(bestMove || eleganceMoves[0]);
            }, 200);
            
        } catch (error) {
            console.error("Hint Error:", error);
            const hintBtn = document.getElementById('hint-btn');
            if (hintBtn) {
                hintBtn.style.pointerEvents = 'auto';
                hintBtn.style.opacity = '1';
            }
            ui.setTxt('turn-countdown', '');
        }
    },

    showGlow(moveObj) {
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.style.pointerEvents = 'auto';
            hintBtn.style.opacity = '1';
        }
        ui.setTxt('turn-countdown', ''); 

        if (!moveObj || moveObj.length === 0) return;
        
        let actualPath = Array.isArray(moveObj) ? moveObj : [moveObj];
        if (!actualPath[0] || actualPath[0].fromR === undefined) return;

        let from = { r: actualPath[0].fromR, c: actualPath[0].fromC };
        let to = { r: actualPath[actualPath.length - 1].toR, c: actualPath[actualPath.length - 1].toC };
        
        let board = ui.getEl('board');
        if (!board) return;
        
        let fCell = board.querySelector(`[data-row="${from.r}"][data-col="${from.c}"]`);
        let tCell = board.querySelector(`[data-row="${to.r}"][data-col="${to.c}"]`);

        // 🌟 الستايل الجديد (بدون ضباب): شفاف من الداخل مع إطار أخضر نبضي نظيف
        if (!document.getElementById('hint-glow-overlay-style')) {
            const style = document.createElement('style');
            style.id = 'hint-glow-overlay-style';
            style.innerHTML = `
                @keyframes hintGlowPulseClean {
                    0% { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 5px 2px #30d158; }
                    100% { transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 0 15px 4px #30d158; }
                }
                .hint-magic-overlay {
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    width: 85% !important;
                    height: 85% !important;
                    border-radius: 50% !important;
                    background: transparent !important; /* 👈 هنا السر: شفافية تامة لعدم إخفاء الحجر */
                    border: 3.5px solid #30d158 !important; /* إطار أخضر نظيف */
                    pointer-events: none !important;
                    z-index: 999999 !important;
                    animation: hintGlowPulseClean 0.6s infinite alternate ease-in-out !important;
                }
                .cell { position: relative; }
            `;
            document.head.appendChild(style);
        }

        const createGlowElement = () => {
            let el = document.createElement('div');
            el.className = 'hint-magic-overlay';
            return el;
        };

        let fGlow = createGlowElement();
        let tGlow = createGlowElement();

        if (fCell) fCell.appendChild(fGlow);
        if (tCell) tCell.appendChild(tGlow);

        setTimeout(() => { 
            if (fGlow && fGlow.parentNode) fGlow.parentNode.removeChild(fGlow);
            if (tGlow && tGlow.parentNode) tGlow.parentNode.removeChild(tGlow);
        }, 3500);
    }
};
