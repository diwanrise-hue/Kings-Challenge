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
            // 1. التحقق من أحقية اللعب
            if (gameState.isOnlineMode && gameState.currentTurn !== gameState.myOnlineColor) return;
            if (!gameState.isOnlineMode && gameState.currentTurn !== gameState.playerColor) return;

            let profile = gameState.userProfile;
            if (!profile) return;
            
            // 2. التحقق من الرصيد
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

            // 3. التفكير العميق لاستخراج أفضل حركة (باستخدام المحرك مباشرة لمنع انهيار الصفحة)
            let bestMove = await gameAI.getBestMoveAsync(gameState.virtualBoard, 5, myColor, gameState.pieceDirection);
            
            // 4. خصم المصباح من الرصيد وتحديث الواجهة
            if (!gameState.isTutorialMode && profile) {
                profile.hints--;
                if (gameState.isOnlineMode) gameState.onlineHintsUsed = (gameState.onlineHintsUsed || 0) + 1;

                if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                
                // 🔴 هذا السطر يسبب إعادة رسم الرقعة (renderBoard)
                if (window.parent) window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
                if (socket && socket.connected) socket.emit('useHint'); 
            }

            // 🛡️ 5. الحل الجذري: تأخير رسم التوهج قليلاً (200 ملي ثانية) 
            // لضمان أن إعادة رسم الرقعة قد انتهت ولن تقوم بمسح لون التلميح.
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

        // 🌟 الطبقة السحرية المضيئة المستقلة (ستظهر فوق الحجر مهما كان تنسيقه من المتجر)
        if (!document.getElementById('hint-glow-overlay-style')) {
            const style = document.createElement('style');
            style.id = 'hint-glow-overlay-style';
            style.innerHTML = `
                @keyframes hintGlowPulse {
                    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; box-shadow: 0 0 15px 5px #00ff00, inset 0 0 20px #00ff00; }
                    100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; box-shadow: 0 0 30px 10px #00ff00, inset 0 0 40px #00ff00; }
                }
                .hint-magic-overlay {
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    width: 75% !important;
                    height: 75% !important;
                    border-radius: 50% !important;
                    background: rgba(0, 255, 0, 0.4) !important;
                    border: 3px solid #00ff00 !important;
                    pointer-events: none !important;
                    z-index: 999999 !important;
                    animation: hintGlowPulse 0.5s infinite alternate ease-in-out !important;
                }
                .cell { position: relative; } /* لضمان تمركز التوهج بدقة */
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

        // وضع الطبقة المضيئة في الخلايا الصحيحة
        if (fCell) fCell.appendChild(fGlow);
        if (tCell) tCell.appendChild(tGlow);

        // إزالة الطبقة بعد 3.5 ثانية
        setTimeout(() => { 
            if (fGlow && fGlow.parentNode) fGlow.parentNode.removeChild(fGlow);
            if (tGlow && tGlow.parentNode) tGlow.parentNode.removeChild(tGlow);
        }, 3500);

        // ⛔ تمت إزالة الصوت، الكود الآن صامت بالكامل
    }
};
