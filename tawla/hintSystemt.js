// hintSystem.js
// 🌟 (مُحدّث جذرياً): حماية من انهيار القفز المتعدد، ترقية المصباح لمستوى الجراند ماستر، وحماية وقت الدور.

import { gameState } from './gameStatet.js';
import { gameEngine } from './gameEnginet.js';
import { gameAI } from './gameAIt.js';
import { socket } from './socketManagert.js';
import { ui } from './uiControllert.js';
import { t } from './i18nt.js';

export const hintSystem = {
    async requestHint() {
        try {
            // 1. التحقق من الدور
            if (gameState.isOnlineMode && gameState.currentTurn !== gameState.myOnlineColor) return;
            if (!gameState.isOnlineMode && gameState.currentTurn !== gameState.playerColor) return;

            // 🚀 التحسين 1: منع التلميح أثناء القفز المتعدد (لمنع انهيار منطق اللعبة)
            if (gameState.isMultiJumping) {
                ui.showCustomAlert("لا يمكنك استخدام التلميح في منتصف القفزة! أكمل حركتك الإجبارية أولاً.", "تنبيه ⚠️");
                return;
            }

            // 🚀 التحسين 2: حماية وقت اللاعب في الأونلاين (المصباح يحتاج وقتاً للتفكير)
            if (gameState.isOnlineMode && gameState.turnTimeLeft && gameState.turnTimeLeft <= 10) {
                ui.showCustomAlert("الوقت المتبقي قليل جداً! المصباح يحتاج إلى 10 ثوانٍ على الأقل للتفكير.", "تنبيه الوقت ⏳");
                return;
            }

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
            
            ui.setTxt('turn-countdown', 'المصباح يقرأ أفكار الخصم... 💡');

            // 🚀 التحسين 3: رفع مستوى المصباح إلى 8 (جراند ماستر) ليعطي حركات أسطورية لا تقهر!
            // 🚀 استدعاء البوت لإيجاد أفضل حركة في الطاولة
            let bestMove = await gameAI.getBestMoveAsync(gameState.virtualBoard, 8, myColor, gameState.currentDice);
                        
            // 🚀 التحسين 4: التحقق مما إذا كان الدور قد انتهى أو تغير أثناء تفكير المصباح
            if (gameState.currentTurn !== myColor) {
                if (hintBtn) { hintBtn.style.pointerEvents = 'auto'; hintBtn.style.opacity = '1'; }
                return;
            }

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
        
        if (gameState.isOnlineMode) {
             ui.setTxt('turn-countdown', `⏳ المتبقي للدور: ${gameState.turnTimeLeft || 0}s`);
        } else {
             ui.setTxt('turn-countdown', ''); 
        }

        if (!moveObj || moveObj.from === undefined) return;
        
        let board = ui.getEl('tawla-board');
        if (!board) return;
        
        // تحديد عنصر البداية (من)
        let fCell = moveObj.from === 'bar' ? 
            document.getElementById(gameState.playerColor === 'white' ? 'bar-white' : 'bar-black') : 
            board.querySelector(`.point[data-index="${moveObj.from}"]`);
            
        // تحديد عنصر النهاية (إلى)
        let tCell = moveObj.to === 'bearOff' ? 
            document.getElementById(gameState.playerColor === 'white' ? 'bear-off-top' : 'bear-off-bottom') : 
            board.querySelector(`.point[data-index="${moveObj.to}"]`);

        if (!document.getElementById('hint-glow-overlay-style')) {
            const style = document.createElement('style');
            style.id = 'hint-glow-overlay-style';
            style.innerHTML = `
                @keyframes hintGoldPulse {
                    0% { transform: translate(-50%, -50%) scale(0.95); background: rgba(255, 215, 0, 0.4) !important; box-shadow: 0 0 10px rgba(255, 215, 0, 0.5) !important; }
                    100% { transform: translate(-50%, -50%) scale(1.1); background: rgba(255, 215, 0, 0.7) !important; box-shadow: 0 0 20px rgba(255, 215, 0, 0.9) !important; }
                }
                .hint-magic-overlay {
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    width: 40px !important;
                    height: 40px !important;
                    border-radius: 50% !important;
                    background: rgba(255, 215, 0, 0.5) !important;
                    border: 3px solid #ffd700 !important;
                    pointer-events: none !important;
                    z-index: 999999 !important;
                    animation: hintGoldPulse 0.6s infinite alternate ease-in-out !important; 
                }
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

        // 🌟 نضع التوهج فوق الحجر العلوي للخانة 🌟
        if (fCell && fCell.lastChild) fCell.lastChild.appendChild(fGlow);
        else if (fCell) fCell.appendChild(fGlow);
        
        if (tCell) tCell.appendChild(tGlow);

        setTimeout(() => { 
            if (fGlow && fGlow.parentNode) fGlow.parentNode.removeChild(fGlow);
            if (tGlow && tGlow.parentNode) tGlow.parentNode.removeChild(tGlow);
        }, 3500);
    }
