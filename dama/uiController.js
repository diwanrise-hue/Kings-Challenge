// uiController.js
/**
 * uiController.js
 * إدارة الواجهة الرسومية والمؤثرات، النوافذ المنبثقة، التبويبات، 
 * نظام البروفايل والأصدقاء، ولوحة الشرف.
 * 🌟 (مُحدّث جذرياً): حل مشكلة الإطارات العملاقة في نافذة النتائج، وتصحيح طبقات الـ Z-Index.
 * 🎡 (مُحدّث جديد): برمجة نظام "ساحة التحديات" والمراهنات.
 * ✅ (مُحدّث للتصحيح): العودة للواجهة الأساسية للعبة عند انتهاء المباراة.
 * 🛡️ (مُحدّث جديد): منع فتح واجهة الخصم عند الضغط على ملفك الشخصي في لوحة الشرف.
 * 🔊 (مُحدّث للصوت): استنساخ مسار الصوت لعجلة الحظ لضمان تداخل التكات بشكل واقعي ومتناسق.
 * 📑 (مُحدّث للطبقات): رفع Z-Index نافذة التنبيهات لتظهر دائماً فوق عجلة الحظ وغيرها وإخفاء العجلة برمجياً.
 * 💎 (مُحدّث): محاذاة أيقونات رتب (الماسي والأسطوري) لتتطابق تماماً مع السطر.
 * 🎯 (مُحدّث للإصلاح): إصلاح زر المراهنة الخارجي بتمرير كود الغرفة المخفي (Room ID) بنجاح للسيرفر.
 * 🛡️ (إصلاح أمني صارم): قفل اختيار الأحجار لمنع اللعب بقطع الخصم نهائياً.
 */



import { gameState } from './gameState.js'; 
import { saveGameState, restoreOfflineHintSystem } from './main.js';
import { gameEngine } from './gameEngine.js';
import { gameAI } from './gameAI.js';
import { socket, socketManager } from './socketManager.js';
import { t } from './i18n.js';
import { hintSystem } from './hintSystem.js';

window.t = t; 

// ==========================================
// 🛡️ دالة مساعدة لحساب أقصى قفزات متاحة لقطعة (بديل آمن)
// ==========================================
function getPieceMaxJumps(r, c, color, board, dr = null, dc = null) {
    if (!gameEngine || typeof gameEngine.getPieceCapturePaths !== 'function') return 0;
    let baseColor = color.split('-')[0];
    let dirY = gameEngine.getPieceDirection(baseColor, board);
    let paths = gameEngine.getPieceCapturePaths(r, c, baseColor, board, dirY, dr, dc);
    if (!paths || paths.length === 0) return 0;
    let max = 0;
    for (let p of paths) { if (p.length > max) max = p.length; }
    return max;
}

// ==========================================
// 🖼️ قاعدة بيانات الإطارات الشخصية داخل اللعبة
// ==========================================
const PROFILE_FRAMES_DB = {
    'pf_ruby': 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/storeAll/profile/Profil2.webp',
    'pf_dragon': 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/storeAll/profile/Profile4.webp',
    'pf_noble': 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/storeAll/profile/Profile7.webp'
};

// ==========================================
// 🎵 المؤثرات الصوتية
// ==========================================
export const sfx = {
    move: new Audio('move.mp3'),
    piecesDied: new Audio('pieces_died.mp3'),
    kingDied: new Audio('king_died.mp3'),
    kingCreated: new Audio('king_created.mp3'),
    win: new Audio('win.mp3'),
    clock: new Audio('clock.mp3'),
    spinTick: new Audio('spin_tick.mp3') 
};

window.isMatchRunning = false;

window.setAiLevel = function(level) {
    document.getElementById('diff-quick-select').value = level;
    document.getElementById('custom-diff-btn').textContent = 'L' + level;
    
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    let activeBtn = document.getElementById('lvl-btn-' + level);
    if(activeBtn) activeBtn.classList.add('active');
    
    if(typeof window.closeAppModal === 'function') window.closeAppModal('level-select-modal');
};

function getUserIdLocally() {
    let guestId = localStorage.getItem('guestId');
    try { let profile = JSON.parse(localStorage.getItem('hub_user_profile')); return profile ? profile.id : guestId; } 
    catch(e) { return guestId; } 
}

// ==========================================
// 🌟 الكائن الأساسي للتحكم بالواجهة (UI Controller)
// ==========================================
export const ui = {
    sfx: sfx,
    clickHandlers: new Map(), 
    currentWheelDeg: 0, 

    getEl: id => document.getElementById(id),
    
    setTxt(id, txt) {
        const el = this.getEl(id);
        if (el) {
            if (id === 'reset-btn') {
                const mainTextSpan = el.querySelector('#reset-btn-txt') || el.querySelector('.btn-main-text');
                if (mainTextSpan) {
                    mainTextSpan.textContent = txt;
                } else {
                    el.textContent = txt;
                }
            } else {
                el.textContent = txt;
            }
        }
    },
    
    setDisplay(id, displayState) {
        const el = this.getEl(id);
        if (el) el.style.setProperty('display', displayState, 'important');
    },
    
    onClick(id, fn) {
        this.clickHandlers.set(id, fn);
    },
    
    playSound(audio) {
        if (!audio) return;
        try {
            audio.pause(); audio.currentTime = 0; 
            const playPromise = audio.play();
            if (playPromise !== undefined) { playPromise.catch(() => { }); }
        } catch(e) {}
    },
    
    getVal(id, defaultValue = "") {
        const el = this.getEl(id);
        return el ? el.value : defaultValue;
    },
    
    makeEl(tag, className, cssText, textContent) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (cssText) el.style.cssText = cssText;
        if (textContent) el.textContent = textContent;
        return el;
    },

    applyAvatar(elId, avatarStr, isCustom = false, profileFrameId = null) {
        const el = typeof elId === 'string' ? this.getEl(elId) : elId;
        if (!el) return;
        
        el.style.backgroundImage = 'none';
        el.innerHTML = '';
        el.style.border = 'none';
        el.style.backgroundColor = 'transparent';
        el.style.overflow = 'visible'; 

        let overlayFrameSrc = profileFrameId && PROFILE_FRAMES_DB[profileFrameId] ? PROFILE_FRAMES_DB[profileFrameId] : null;
        
        let frameScale = '135%';
        let avatarScale = 'scale(1)'; 
        let botScale = 'scale(1.4)'; 
        let frameZ = '3'; 

        let moveUp = 0; let moveDown = 0; let moveRight = 0; let moveLeft = 0;  

        if (el.id === 'badge-avatar') {
            frameZ = '999999'; 
            if (overlayFrameSrc) {
                frameScale = '176%'; avatarScale = 'scale(1.16)'; moveUp = 2; moveRight = 0; 
            } else {
                frameScale = '176%'; avatarScale = 'scale(1.08)';
            }
            botScale = 'scale(1.5)';
        } 
        else if (el.id === 'card-my-avatar' || el.id === 'card-opp-avatar') {
            frameZ = '10';
            if (overlayFrameSrc) { frameScale = '150%'; avatarScale = 'scale(1.05)'; } 
            else { frameScale = '140%'; avatarScale = 'scale(1)'; }
            botScale = 'scale(1.35)';
        }
        else if (el.id === 'igp-avatar') {
            frameZ = '10';
            if (overlayFrameSrc) { frameScale = '155%'; avatarScale = 'scale(1.05)'; } 
            else { frameScale = '140%'; avatarScale = 'scale(1)'; }
            botScale = 'scale(1.4)';
        }
        else if (el.classList.contains('result-avatar')) {
            frameZ = '10';
            frameScale = '140%'; avatarScale = 'scale(1)';
            botScale = 'scale(1.1)'; 
        }
        else {
            frameZ = '5';
            if (overlayFrameSrc) { frameScale = '140%'; avatarScale = 'scale(1)'; } 
            else { frameScale = '135%'; avatarScale = 'scale(1)'; }
            botScale = 'scale(1.2)';
        }

        if (avatarStr === "AI_BOT") {
            el.classList.add('modern-bot-avatar');
            const botSvg = window.SVGIcons && window.SVGIcons.robotBtn ? window.SVGIcons.robotBtn : '';
            let botContent = `<span style="font-size: 35px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));">🤖</span>`;
            

            if (botSvg) {
                let uniqueSuffix = '_bot_' + Math.floor(Math.random() * 100000);
                botContent = botSvg.replace(/id="([^"]+)"/g, function(match, p1) {
                    return 'id="' + p1 + uniqueSuffix + '"';
                });
                // ✅ السماح للـ SVG بالحفاظ على نسبة الأبعاد الأصلية (بدون تشوه)
                botContent = botContent.replace('<svg', '<svg style="width: 100%; height: auto; display: block;"');
            }
            
            let innerHTML = `
                <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <div style="width: 85%; display: flex; align-items: center; justify-content: center; transform: ${botScale}; position: relative; z-index: 1; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));">
                        ${botContent}
                    </div>
            `;

          
            if (overlayFrameSrc) {
                let finalX = moveRight - moveLeft; let finalY = moveDown - moveUp;
                innerHTML += `<img src="${overlayFrameSrc}" onerror="this.style.display='none'" style="position: absolute; top: 50%; left: 50%; transform: translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px)); width: ${frameScale}; height: ${frameScale}; z-index: ${frameZ}; pointer-events: none; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">`;
            }

            innerHTML += `</div>`; 
            el.innerHTML = innerHTML;
            return;
        }

        const defaultAvatar = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/1000132081.webp';
        let finalSrc = avatarStr;

        if (avatarStr && !avatarStr.startsWith('http') && !avatarStr.startsWith('data:image')) {
            let cleanName = avatarStr.replace(/\.\.\//g, '').replace('Photo/', '');
            finalSrc = 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName;
        }

        let innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <img src="${finalSrc}" onerror="this.onerror=null; this.src='${defaultAvatar}';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; position: relative; z-index: 1; transform: ${avatarScale};">
        `;
        
        if (overlayFrameSrc) {
            let finalX = moveRight - moveLeft;
            let finalY = moveDown - moveUp;
            innerHTML += `<img src="${overlayFrameSrc}" onerror="this.style.display='none'" style="position: absolute; top: 50%; left: 50%; transform: translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px)); width: ${frameScale}; height: ${frameScale}; z-index: ${frameZ}; pointer-events: none; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">`;
        }
        
        innerHTML += `</div>`;
        el.innerHTML = innerHTML;
    },

    showCustomAlert(message, title = null, onConfirm = null, showCancel = false, customCancelText = null, customOkText = null, onCancel = null) {
        title = title || t('alert_title');
        const msgContainer = this.getEl('custom-alert-message');
        if (msgContainer) {
            msgContainer.innerHTML = '';
            const safeDiv = document.createElement('div');
            safeDiv.style.cssText = "line-height: 1.6; font-size: 14px;";
            safeDiv.textContent = message; 
            msgContainer.appendChild(safeDiv);
        }
        
        this.setTxt('custom-alert-title', title);
        this.setTxt('custom-alert-ok', customOkText || t('alert_ok'));
        this.setTxt('custom-alert-cancel', customCancelText || t('btn_cancel'));
        
        const okBtn = this.getEl('custom-alert-ok');
        if (okBtn) okBtn.style.display = 'inline-block'; 
        
        const modalEl = this.getEl('custom-alert-modal');
        if (modalEl) {
            modalEl.style.setProperty('z-index', '9999999', 'important');
            modalEl.style.display = 'flex'; 
        }

        // 🌟 الحل الجذري: إخضاع نافذة العجلة برمجياً ودفعها للأسفل
        const spinModal = document.getElementById('lucky-spin-modal');
        if (spinModal && spinModal.style.display !== 'none') {
            spinModal.style.setProperty('z-index', '10', 'important');
        }
        
        this.setDisplay('custom-alert-cancel', showCancel ? 'block' : 'none');
        
        this.clickHandlers.set('custom-alert-ok', () => {
            if (modalEl) modalEl.style.display = 'none'; 
            if (spinModal) spinModal.style.setProperty('z-index', '850', 'important'); // استعادة الطبقة
            if (onConfirm) { try { onConfirm(); } catch(err) { console.error(err); } }
        });

        this.clickHandlers.set('custom-alert-cancel', () => {
            if (modalEl) modalEl.style.display = 'none';
            if (spinModal) spinModal.style.setProperty('z-index', '850', 'important'); // استعادة الطبقة
            if (onCancel) { try { onCancel(); } catch(err) { console.error(err); } }
        });
    },

                  
    calculateLevelInfo(xpStr) {
        let currentXp = parseInt(xpStr) || 0;
        let level = Math.floor(Math.sqrt(currentXp / 50)) + 1;
        if (level > 200) level = 200; 
        
        let xpForCurrentLevel = Math.pow(level - 1, 2) * 50;
        let xpForNextLevel = Math.pow(level, 2) * 50;
        if (level === 200) xpForNextLevel = xpForCurrentLevel; 
        
        let progressXp = currentXp - xpForCurrentLevel;
        let requiredXp = xpForNextLevel - xpForCurrentLevel;
        let percentage = level === 200 ? 100 : Math.min(100, Math.max(0, (progressXp / requiredXp) * 100));

        let title = "مبتدئ";
        if (level >= 100) title = "جراند ماستر";
        else if (level >= 50) title = "معلم الدامة";
        else if (level >= 30) title = "خبير";
        else if (level >= 10) title = "مبارز";

        let rank = "برونزي"; 
        let rankIcon = `<img src="Media/front/Bronze.webp" style="height: 14px; vertical-align: middle; filter: drop-shadow(0 0 2px rgba(205,127,50,0.8));">`;
        
        if (currentXp >= 5000) { 
            rank = "أسطوري"; 
            rankIcon = `<img src="Media/front/legendary.webp" style="height: 14px; vertical-align: middle; filter: drop-shadow(0 0 2px rgba(255,215,0,0.8));">`; 
        }
        else if (currentXp >= 2500) { 
            rank = "ماسي"; 
            rankIcon = `<img src="Media/front/diamond.webp" style="height: 14px; vertical-align: middle; filter: drop-shadow(0 0 2px rgba(0,210,255,0.8));">`; 
        }
        else if (currentXp >= 1200) { 
            rank = "ذهبي"; 
            rankIcon = `<img src="Media/front/golden.webp" style="height: 14px; vertical-align: middle; filter: drop-shadow(0 0 2px rgba(255,215,0,0.8));">`; 
        }
        else if (currentXp >= 500) { 
            rank = "فضي"; 
            rankIcon = `<img src="Media/front/silver.webp" style="height: 14px; vertical-align: middle; filter: drop-shadow(0 0 2px rgba(192,192,192,0.8));">`; 
        }

        return { level, title, rank, rankIcon, progressXp, requiredXp, percentage };
    },

    showLevelUpModal(newLevel, title, rewardsHtml) {
        this.setTxt('level-up-num', newLevel);
        this.setTxt('level-up-title', `لقب: ${title}`);
        const rewardsContainer = this.getEl('level-up-rewards');
        if (rewardsContainer) rewardsContainer.innerHTML = rewardsHtml;
        this.playSound(sfx.win);
        const modalEl = this.getEl('level-up-modal');
        if (modalEl) modalEl.style.display = 'flex';
    },

    animateLuckySpin(prizeIndex, onComplete) {
        window.isSpinning = true; 
        const wheel = this.getEl('lucky-wheel-inner');
        const pointer = this.getEl('lucky-wheel-pointer'); 
        const btnFree = this.getEl('spin-free-btn');
        const btnPaid = this.getEl('spin-paid-btn');
        if (!wheel) return;

        if (btnFree) btnFree.style.pointerEvents = 'none';
        if (btnPaid) btnPaid.style.pointerEvents = 'none';

        const extraSpins = 5 * 360; 
        const targetAngle = 360 - ((prizeIndex * 45) + 22.5);
        
        const currentMod = this.currentWheelDeg % 360;
        let diff = targetAngle - currentMod;
        if (diff < 0) diff += 360; 
        
        const totalChange = extraSpins + diff;
        const startDeg = this.currentWheelDeg;
        this.currentWheelDeg += totalChange;

        wheel.style.transition = 'none';
        let tickAudio = sfx.spinTick;
        let spinDuration = 5000;
        let startTime = performance.now();
        let lastPinPassed = Math.floor(startDeg / 45);

        const animateTick = (currentTime) => {
            if (!window.isSpinning) return;
            let elapsed = currentTime - startTime;
            if (elapsed >= spinDuration) elapsed = spinDuration;

            let t = elapsed / spinDuration;
            let easeOut = 1 - Math.pow(1 - t, 3);
            let currentSimulatedAngle = startDeg + (totalChange * easeOut);

            wheel.style.transform = `rotate(${currentSimulatedAngle}deg)`;

            let currentPin = Math.floor((currentSimulatedAngle - 22.5) / 45);
            if (currentPin > lastPinPassed) {
                lastPinPassed = currentPin;
                
                // ✅ استنساخ مسار الصوت (Clone) لضمان تداخل التكات بدون تقطيع
                try {
                    if (tickAudio) {
                        let clone = tickAudio.cloneNode();
                        clone.volume = 0.5;
                        let playPromise = clone.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(() => {});
                        }
                    }
                } catch(e) {}

                if (pointer) {
                    pointer.style.transform = 'translateX(-50%) rotate(-30deg)';
                    setTimeout(() => { if (pointer) pointer.style.transform = 'translateX(-50%) rotate(0deg)'; }, 60); 
                }
            }

            if (elapsed < spinDuration) {
                requestAnimationFrame(animateTick);
            } else {
                window.isSpinning = false; 
                this.playSound(sfx.win); 
                if (btnFree) btnFree.style.pointerEvents = 'auto';
                if (btnPaid) btnPaid.style.pointerEvents = 'auto';
                if (onComplete) onComplete();
            }
        };
        requestAnimationFrame(animateTick);
    },

    animateMatchFound(oppName, oppAvatar, onComplete) {
        this.setTxt('mm-opp-name', oppName);
        this.applyAvatar('mm-opp-avatar', oppAvatar, oppAvatar?.startsWith('data:image'), window.currentOpponentData?.equippedProfileFrame);
        this.setTxt('mm-status-label', t('opp_found'));
        
        const cancelBtn = this.getEl('mm-cancel-btn');
        if(cancelBtn) cancelBtn.style.display = 'none';

        const oppContainer = this.getEl('mm-opp-avatar')?.parentElement;
        if(oppContainer) oppContainer.style.animation = "forcedPulse 1s infinite";

        setTimeout(() => {
            if(oppContainer) oppContainer.style.animation = "";
            if(cancelBtn) cancelBtn.style.display = 'block';
            
            let profile = gameState.userProfile || {};
            if (profile.syncThemeOptOut === undefined && !window.hasPromptedThemeSync) {
                window.hasPromptedThemeSync = true; 
                this.showCustomAlert(
                    "هل ترغب في استخدام ساحة اللاعب الأعلى مستوى في المباريات القادمة؟\n(يمكنك تغيير ذلك من الإعدادات لاحقاً)",
                    "مزامنة الساحة 🎨",
                    () => {
                        profile.syncThemeOptOut = false; this.saveAndSyncProfile(profile);
                        const optCb = document.getElementById('sync-theme-optout'); if(optCb) optCb.checked = true;
                        if(onComplete) onComplete();
                    }, true, "لا، ساحتي فقط", "نعم، أوافق",
                    () => {
                        profile.syncThemeOptOut = true; this.saveAndSyncProfile(profile);
                        const optCb = document.getElementById('sync-theme-optout'); if(optCb) optCb.checked = false;
                        if (window.applyTheme && gameState.userProfile) window.applyTheme(gameState.userProfile);
                        if(onComplete) onComplete();
                    }
                );
            } else { if(onComplete) onComplete(); }
        }, 3000);
    },

    showSpectatorBetModal(roomID, p1, p2) {
        // ✅ 1. تعيين كود الغرفة المستهدفة في الحقل المخفي فوراً ليعمل زر المراهنة الخارجي
        const roomIdInput = this.getEl('spectator-bet-room-id');
        if (roomIdInput) roomIdInput.value = roomID;

        // 2. تصفير الاختيارات السابقة
        const colorInput = this.getEl('spectator-bet-color');
        if (colorInput) colorInput.value = '';
        const amtInput = this.getEl('spectator-bet-amount');
        if (amtInput) amtInput.value = '0';
        const displayTxt = this.getEl('spectator-bet-display-text');
        if (displayTxt) displayTxt.innerText = 'اختر المبلغ...';

        // 3. إزالة التحديد القديم عن البطاقات
        const p1Card = document.getElementById('bet-p1-card');
        const p2Card = document.getElementById('bet-p2-card');
        if (p1Card) { p1Card.style.border = '2px solid transparent'; p1Card.style.background = 'transparent'; p1Card.style.boxShadow = 'none'; p1Card.style.transform = 'scale(1)'; }
        if (p2Card) { p2Card.style.border = '2px solid transparent'; p2Card.style.background = 'transparent'; p2Card.style.boxShadow = 'none'; p2Card.style.transform = 'scale(1)'; }

        // 4. عرض بيانات اللاعبين
        this.setTxt('bet-p1-name', p1?.name || 'اللاعب 1');
        this.applyAvatar('bet-p1-avatar', p1?.avatar, p1?.isCustomAvatar || p1?.avatar?.startsWith('data:'), p1?.equippedProfileFrame);
        
        this.setTxt('bet-p2-name', p2?.name || 'اللاعب 2');
        this.applyAvatar('bet-p2-avatar', p2?.avatar, p2?.isCustomAvatar || p2?.avatar?.startsWith('data:'), p2?.equippedProfileFrame);
        
        window.openAppModal('spectator-bet-modal');
    },

    saveAndSyncProfile(profile) {
        try {
            localStorage.setItem('hub_user_profile', JSON.stringify(profile));
            if (typeof socket !== 'undefined' && socket && socket.connected) socket.emit('syncProfile', profile); 
        } catch(e) { console.error("Error syncing profile:", e); }
    },

    toggleOfflineInMatchUI(active) {
        if (gameState.isOnlineMode) return;
        window.isMatchRunning = active;
        
        if (active) document.body.classList.add('game-active');
        else document.body.classList.remove('game-active');

        const flexState = active ? 'none' : 'flex';
        const inlineState = active ? 'none' : 'inline-block';
        
        this.setDisplay('store-portal-corner-btn', flexState);
        this.setDisplay('lucky-spin-portal-btn', flexState); 
        this.setDisplay('floating-quests-btn', flexState);
        this.setDisplay('custom-diff-btn', inlineState);
        
        this.setDisplay('hamburger-menu-btn', active ? 'none' : 'flex');
        this.setDisplay('bag-quick-btn', active ? 'flex' : 'none');
        
        this.setDisplay('resign-btn', active ? 'inline-block' : 'none');
        this.setDisplay('gameChatBtn', 'none'); 
        this.setDisplay('mic-toggle-btn', 'none');
        
        this.setDisplay('match-gift-btn-p2', 'none'); 
        
        if (active && gameState.isTutorialMode) this.setDisplay('undo-btn', 'inline-block');
        else this.setDisplay('undo-btn', 'none');
    },

    setupSpectatorUI(p1, p2, isBettingOpen, roomID, hasAlreadyBet = false) {
        window.isMatchRunning = true;
        document.body.classList.add('game-active');
        document.body.classList.add('online-mode-active');
        
        const hides = ['store-portal-corner-btn', 'lucky-spin-portal-btn', 'floating-quests-btn', 'bag-quick-btn', 'custom-diff-btn', 'hint-btn', 'undo-btn', 'resign-btn', 'gameChatBtn', 'mic-toggle-btn'];
        hides.forEach(id => this.setDisplay(id, 'none'));
        
        this.setDisplay('bottom-control-panel', 'flex');
        this.setDisplay('reset-btn', 'inline-flex');
        
        this.setTxt('reset-btn-txt', 'خروج المشاهد 🚪');
        
        this.setDisplay('match-players-card', 'flex');
        this.setDisplay('spectator-stats-container', 'flex'); 

        this.applyAvatar('card-my-avatar', p1?.avatar, p1?.avatar?.startsWith('data:image'), p1?.equippedProfileFrame);
        this.setTxt('card-my-name', p1?.name || 'اللاعب 1');
        let p1LvlInfo = this.calculateLevelInfo(p1?.xp || 0);
        const p1LvlEl = this.getEl('card-my-level');
        if(p1LvlEl) {
            p1LvlEl.textContent = `Lv.${p1LvlInfo.level}`;
            p1LvlEl.style.background = "rgba(135,206,235,0.2)";
            p1LvlEl.style.borderColor = "#87ceeb";
            p1LvlEl.style.color = "#87ceeb";
        }
        
        this.applyAvatar('card-opp-avatar', p2?.avatar, p2?.avatar?.startsWith('data:image'), p2?.equippedProfileFrame);
        this.setTxt('card-opp-name', p2?.name || 'اللاعب 2');
        let p2LvlInfo = this.calculateLevelInfo(p2?.xp || 0);
        const p2LvlEl = this.getEl('card-opp-level');
        if(p2LvlEl) {
            p2LvlEl.textContent = `Lv.${p2LvlInfo.level}`;
            p2LvlEl.style.background = "rgba(255,69,58,0.2)";
            p2LvlEl.style.borderColor = "#ff453a";
            p2LvlEl.style.color = "#ff453a";
        }

        const p1Xp = Number(p1?.xp) || 0;
        const p2Xp = Number(p2?.xp) || 0;
        let dominantPlayer = p1;
        
        if (p2Xp > p1Xp && !(p2?.syncThemeOptOut)) {
            dominantPlayer = p2;
        } else if (p1?.syncThemeOptOut && p2Xp <= p1Xp) {
            dominantPlayer = {equippedBg: 'bg_wood', equippedPc: 'pc_original', equippedFr: 'fr_classic'}; 
        }
        
        setTimeout(() => {
            if (typeof window.applyTheme === 'function') {
                window.applyTheme(dominantPlayer);
            } else {
                document.body.setAttribute('data-piece-style', dominantPlayer?.equippedPc || 'pc_original');
                document.body.setAttribute('data-board-style', dominantPlayer?.equippedBg || 'bg_wood');
            }
        }, 100);

        const vsBetEl = document.getElementById('vs-bet-display');
        if (vsBetEl) {
            vsBetEl.style.display = 'flex';
            vsBetEl.style.justifyContent = 'center';
            vsBetEl.style.alignItems = 'center';
            vsBetEl.style.minHeight = '32px'; 
            
            if (isBettingOpen && !hasAlreadyBet) {
                let safeP1 = JSON.stringify(p1).replace(/"/g, '&quot;');
                let safeP2 = JSON.stringify(p2).replace(/"/g, '&quot;');
                vsBetEl.innerHTML = `<button onclick="window.ui.showSpectatorBetModal('${roomID}', ${safeP1}, ${safeP2})" style="background: linear-gradient(135deg, #f1c40f, #f39c12); color: #000; border: none; padding: 4px 16px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 13px; box-shadow: 0 2px 8px rgba(241,196,15,0.6); transition: 0.2s; white-space: nowrap;">🎯 راهن الآن</button>`;
            } else if (isBettingOpen && hasAlreadyBet) {
                vsBetEl.innerHTML = `<div style="background: rgba(0,0,0,0.85); border: 1px solid rgba(48, 209, 88, 0.6); padding: 4px 12px; border-radius: 12px; display: inline-flex; justify-content: center; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.5);"><span style="color: #30d158; font-size: 11px; font-weight: bold; white-space: nowrap; margin: 0;">تم تسجيل رهانك ✅</span></div>`;
            } else {
                vsBetEl.innerHTML = `<div style="background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 12px; display: inline-flex; justify-content: center; align-items: center;"><span style="color: #a1a1aa; font-size: 11px; font-weight: bold; white-space: nowrap; margin: 0;">المراهنات مغلقة 🔒</span></div>`;
            }
        }

        window.matchPlayer1Id = p1?.guestId;
        window.matchPlayer2Id = p2?.guestId;

        const giftBtn2 = document.getElementById('match-gift-btn-p2');
        if (giftBtn2) giftBtn2.style.display = 'flex';
    },

    toggleOnlineUILayout(active, oppName = "", oppAvatar = "❓") {
        const normalState = active ? 'none' : 'inline-block';
        const flexState = active ? 'none' : 'flex';
        const onlineState = active ? 'inline-block' : 'none';
        window.isMatchRunning = active;
        
        if (active) {
            document.body.classList.add('game-active');
            document.body.classList.add('online-mode-active'); 
            
            try {
                let localStr = localStorage.getItem('hub_user_profile');
                if (localStr) {
                    let parsedLocal = JSON.parse(localStr);
                    if (!gameState.userProfile) gameState.userProfile = {};
                    Object.assign(gameState.userProfile, parsedLocal);
                }
            } catch(e) {}
            
        } else {
            document.body.classList.remove('game-active');
            document.body.classList.remove('online-mode-active');
            window.hasPromptedThemeSync = false; 
        }

        const displays = {
            'custom-diff-btn': normalState, 
            'store-portal-corner-btn': flexState, 'lucky-spin-portal-btn': flexState, 'hamburger-menu-btn': flexState,
            'floating-quests-btn': flexState, 'bag-quick-btn': 'none', 'resign-btn': onlineState, 
            'gameChatBtn': active ? 'flex' : 'none',
            'undo-btn': 'none', 'match-players-card': active ? 'flex' : 'none',
            'mic-toggle-btn': active ? 'flex' : 'none',
            'spectator-stats-container': 'none' 
        };
        Object.keys(displays).forEach(id => this.setDisplay(id, displays[id]));
        
        if (!active) {
            this.setTxt('reset-btn-txt', 'لعبة جديدة'); 
        }
        
        if (active && gameState.userProfile) {
            this.applyAvatar('card-my-avatar', gameState.userProfile.avatar, gameState.userProfile.isCustomAvatar, gameState.userProfile.equippedProfileFrame);
            this.setTxt('card-my-name', gameState.userProfile.name || t('badge_you'));
            this.setTxt('card-opp-name', oppName);
            
            this.applyAvatar('card-opp-avatar', oppAvatar, oppAvatar?.startsWith('data:image'), gameState.currentOpponentProfileFrame);
          
            let myLvlInfo = this.calculateLevelInfo(gameState.userProfile.xp || 0);
            let myCardLevel = this.getEl('card-my-level');
            if (myCardLevel) {
                myCardLevel.textContent = `Lv.${myLvlInfo.level}`;
                myCardLevel.style.background = "rgba(135,206,235,0.2)";
                myCardLevel.style.borderColor = "#87ceeb";
                myCardLevel.style.color = "#87ceeb";
            }
            
            let oppCardLevel = this.getEl('card-opp-level');
            if (oppCardLevel) {
                if (gameState.currentOpponentXp !== undefined) {
                    let oppLvlInfo = this.calculateLevelInfo(gameState.currentOpponentXp);
                    oppCardLevel.textContent = `Lv.${oppLvlInfo.level}`;
                    oppCardLevel.style.background = "rgba(255,69,58,0.2)"; 
                    oppCardLevel.style.borderColor = "#ff453a"; 
                    oppCardLevel.style.color = "#ff453a"; 
                } else {
                    oppCardLevel.textContent = `Lv.?`;
                    oppCardLevel.style.background = "rgba(161,161,170,0.2)";
                    oppCardLevel.style.borderColor = "#a1a1aa"; 
                    oppCardLevel.style.color = "#a1a1aa"; 
                }
            }
            
            const vsBetEl = document.getElementById('vs-bet-display');
            if (vsBetEl) {
                if (gameState.roomBet && gameState.roomBet > 0) {
                    vsBetEl.style.display = 'block';
                    vsBetEl.textContent = `💰 ${gameState.roomBet * 2}`;
                } else {
                    vsBetEl.style.display = 'none';
                }
            }

            window.matchPlayer1Id = gameState.userProfile.id;
            window.matchPlayer2Id = window.currentOpponentId;
            
            const giftBtn2 = document.getElementById('match-gift-btn-p2');
            if (giftBtn2) {
                giftBtn2.style.display = active && !gameState.isBotOpponent ? 'flex' : 'none';
            }
        }
    },

    updateVirtualBoardState() {
        const board = this.getEl('board');
        if (!board) return;
        
        for (let i = 0; i < board.children.length; i++) {
            const cell = board.children[i];
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            
            if (cell.children.length > 0) {
                const child = cell.children[0];
                const side = child.classList.contains('white') ? 'white' : 'black';
                const type = child.classList.contains('dama') ? '-dama' : '';
                gameState.virtualBoard[r][c] = `${side}${type}`;
            } else { 
                gameState.virtualBoard[r][c] = null; 
            }
        }
        this.updateScoreboard();
    },

    updateScoreboard() {
        let whiteCount = 0, blackCount = 0;
        gameState.virtualBoard.forEach(row => { row.forEach(p => { if (p) { if (p.includes('white')) whiteCount++; else blackCount++; } }); });
        
        const isWhite = gameState.playerColor === 'white';
        const oppRow = this.getEl('opponent-score-row'); 
        const myRow = this.getEl('my-score-row');
        
        if (oppRow && myRow) {
            const oppStonesColor = isWhite ? 'black' : 'white'; const myStonesColor = gameState.playerColor;
            oppRow.style.background = `var(--opp-score-bg, ${(oppStonesColor === 'black') ? 'var(--light-cell)' : 'var(--dark-cell)'})`;
            myRow.style.background = `var(--my-score-bg, ${(myStonesColor === 'black') ? 'var(--light-cell)' : 'var(--dark-cell)'})`;
            oppRow.style.border = 'var(--opp-score-border, 1px solid rgba(255,255,255,0.1))'; myRow.style.border = 'var(--my-score-border, 1px solid rgba(255,255,255,0.1))';
            oppRow.style.boxShadow = 'inset 0 4px 8px rgba(0,0,0,0.5)'; myRow.style.boxShadow = 'inset 0 4px 8px rgba(0,0,0,0.5)';
        }

        const renderScoreDots = (container, count, color) => {
            if (!container) return;
            const activeClass = color === 'white' ? 'white' : 'black';
            
            if (container.children.length === 0) {
                for (let i = 0; i < 16; i++) {
                    const dot = document.createElement('div');
                    container.appendChild(dot);
                }
            }

            for (let i = 0; i < 16; i++) {
                const dot = container.children[i];
                if (i < count) {
                    dot.className = `piece mini ${activeClass}`;
                } else {
                    dot.className = `mini-piece-empty`;
                }
            }
        };
        
        renderScoreDots(oppRow, isWhite ? blackCount : whiteCount, isWhite ? 'black' : 'white');
        renderScoreDots(myRow, isWhite ? whiteCount : blackCount, gameState.playerColor);
    },

    renderBoard(forceRebuild = false) {
        const board = this.getEl('board');
        if (!board) return;
        
        const flip = gameState.isOnlineMode && gameState.onlineFlip;
        const needsRebuild = forceRebuild || board.children.length === 0 || board.dataset.flip !== String(flip);
        
        if (needsRebuild) {
            board.innerHTML = ''; board.dataset.flip = String(flip);
            const rowLabels = this.getEl('row-labels'); 
            if (rowLabels) {
                const rev = gameState.isOnlineMode ? gameState.onlineFlip : (gameState.playerColor !== 'white');
                rowLabels.innerHTML = rev 
                    ? '<div>8</div><div>7</div><div>6</div><div>5</div><div>4</div><div>3</div><div>2</div><div>1</div>' 
                    : '<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div>';
            }
            
            for (let dr = 0; dr < 8; dr++) {
                for (let dc = 0; dc < 8; dc++) {
                    const r = flip ? 7 - dr : dr; const c = flip ? 7 - dc : dc;
                    const cell = document.createElement('div');
                    cell.className = `cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
                    cell.dataset.row = r; cell.dataset.col = c;
                    board.appendChild(cell);
                }
            }
        }
        
        let cellIndex = 0;
        for (let dr = 0; dr < 8; dr++) {
            for (let dc = 0; dc < 8; dc++) {
                const r = flip ? 7 - dr : dr; const c = flip ? 7 - dc : dc;
                const cell = board.children[cellIndex++];
                if (!cell) continue;
                
                const boardVal = gameState.virtualBoard[r][c];
                let currentPiece = cell.firstElementChild; 
                
                if (boardVal) {
                    const isWhite = boardVal.includes('white');
                    const isDama = boardVal.includes('dama');
                    
                    if (!currentPiece) {
                        currentPiece = document.createElement('div');
                        currentPiece.className = `piece ${isWhite ? 'white' : 'black'} ${isDama ? 'dama' : ''}`.trim();
                        cell.appendChild(currentPiece);
                    } else {
                        if (isWhite) { currentPiece.classList.add('white'); currentPiece.classList.remove('black'); } 
                        else { currentPiece.classList.add('black'); currentPiece.classList.remove('white'); }
                        
                        if (isDama) currentPiece.classList.add('dama');
                        else currentPiece.classList.remove('dama');
                    }
                } else if (currentPiece) { cell.removeChild(currentPiece); }
            }
        }
        this.updateScoreboard();
    },

    drawEmptyBoard() {
        gameState.gameId = Date.now();
        if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }

        if (window.parent) window.parent.postMessage({ type: 'RESTORE_RADIO_VOLUME' }, '*');

        gameState.virtualBoard = Array(8).fill(null).map(() => Array(8).fill(null));
        gameState.isGameActive = false; window.isMatchRunning = false;
        
        gameState.isMultiJumping = false; gameState.jumpsCount = 0; gameState.requiredJumps = 0;
        gameState.selectedPiece = null; gameState.lastJumpDir = { dr: null, dc: null };
        gameState.boardHistory = []; gameState.boardHistoryStr = []; gameState.movesWithoutProgress = 0;
        gameState.pieceHistories = {};
        
        gameState.currentOpponentProfileFrame = null;

        this.toggleOfflineInMatchUI(false); this.toggleOnlineUILayout(false); 
        document.body.classList.remove('game-active');
        
        this.setDisplay('spectator-stats-container', 'none');
        this.setDisplay('match-gift-btn-p2', 'none');
        this.setTxt('reset-btn-txt', 'لعبة جديدة');
        
        if (typeof restoreOfflineHintSystem === 'function') { restoreOfflineHintSystem(); }
        
        this.clearHighlights();
        const boardEl = this.getEl('board');
        if (boardEl) {
            const lastMoves = boardEl.getElementsByClassName('last-move');
            while (lastMoves.length > 0) lastMoves[0].classList.remove('last-move');
            const forcedPieces = boardEl.getElementsByClassName('forced');
            while (forcedPieces.length > 0) forcedPieces[0].classList.remove('forced');
            const multiPieces = boardEl.getElementsByClassName('multi-choice');
            while (multiPieces.length > 0) multiPieces[0].classList.remove('multi-choice');
            const multiCells = boardEl.getElementsByClassName('multi-choice-cell');
            while (multiCells.length > 0) multiCells[0].classList.remove('multi-choice-cell');
        }
        
        const tInd = this.getEl('turn-indicator');
        if (tInd) { tInd.textContent = t('press_start'); tInd.style.color = "#a1a1aa"; }
        this.setTxt('turn-countdown', '');
        
        this.renderBoard(true);
    },

    initBoard() {
        this.drawEmptyBoard(); 
        
        this.setTxt('reset-btn-txt', 'لعبة جديدة');
        
        gameState.botMoveCount = 0; gameState.boardHistory = []; gameState.boardHistoryStr = []; gameState.movesWithoutProgress = 0;
        gameState.pieceHistories = {};

        const tutorialCheck = document.getElementById('tutorial-mode-checkbox');
        if (!gameState.isOnlineMode && tutorialCheck) { gameState.isTutorialMode = tutorialCheck.checked; } 
        else { gameState.isTutorialMode = false; }

        gameState.isGameActive = true; window.isMatchRunning = true; document.body.classList.add('game-active');
        
        if (!gameState.isOnlineMode) { this.toggleOfflineInMatchUI(true); }
        
        let topC = gameState.playerColor === 'white' ? 'black' : 'white';
        gameState.pieceDirection = {};
        gameState.pieceDirection[topC] = 1;
        gameState.pieceDirection[gameState.playerColor] = -1;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (r === 1 || r === 2) gameState.virtualBoard[r][c] = topC;
                else if (r === 5 || r === 6) gameState.virtualBoard[r][c] = gameState.playerColor;
            }
        }
        
        gameState.currentTurn = 'white'; gameState.blockGameOverModal = true;
        setTimeout(() => { gameState.blockGameOverModal = false; }, 1000);
        
        this.renderBoard(true);
        gameState.boardHistory.push({ board: gameState.virtualBoard.map(row => [...row]), turn: gameState.currentTurn });
        
        saveGameState(); this.updateProfileUI(); this.startTurn();
    },

    clearHighlights() {
        const board = this.getEl('board');
        if (!board) return;
        const highlighted = board.getElementsByClassName('highlight');
        while (highlighted.length > 0) highlighted[0].classList.remove('highlight');
        const multiCells = board.getElementsByClassName('multi-choice-cell');
        while (multiCells.length > 0) multiCells[0].classList.remove('multi-choice-cell');
    },

    highlightMove(from, to) {
        const board = this.getEl('board'); if (!board) return;
        
        const lastMoves = board.getElementsByClassName('last-move');
        while (lastMoves.length > 0) lastMoves[0].classList.remove('last-move');
        
        const fromCell = board.querySelector(`[data-row="${from.r}"][data-col="${from.c}"]`);
        const toCell = board.querySelector(`[data-row="${to.r}"][data-col="${to.c}"]`);
        
        if (fromCell) fromCell.classList.add('last-move');
        if (toCell) toCell.classList.add('last-move');
    },

    showValidMovesHighlights(r, c) {
        this.clearHighlights();
        const board = this.getEl('board'); if (!board) return;
        
        let moves = (gameState.isMultiJumping && gameState.selectedPiece) 
            ? gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard, r, c, gameState.lastJumpDir.dr, gameState.lastJumpDir.dc) 
            : gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard);
            
        moves.forEach(path => {
            if (path?.length > 0 && path[0].fromR === r && path[0].fromC === c) {
                let targetCell = board.querySelector(`[data-row="${path[0].toR}"][data-col="${path[0].toC}"]`);
                if (targetCell) targetCell.classList.add('highlight');
            }
        });
    },

    startTurnTimer() {
        if (!gameState.isOnlineMode) return;
        
        sfx.clock.pause(); sfx.clock.currentTime = 0;
        clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null;
        
        if (window.parent) window.parent.postMessage({ type: 'RESTORE_RADIO_VOLUME' }, '*');

        let hasPlayedTick = false; 
        
        const updateTimerDisplay = () => {
            if (gameState.turnEndTime) { gameState.turnTimeLeft = Math.max(0, Math.ceil((gameState.turnEndTime - Date.now()) / 1000)); } 
            else { gameState.turnTimeLeft--; }

            this.setTxt('turn-countdown', `${t('time_left')} ${gameState.turnTimeLeft}s`);
            
            if (gameState.turnTimeLeft <= 10 && gameState.turnTimeLeft > 0 && !hasPlayedTick) {
                hasPlayedTick = true; 
                if (window.parent) window.parent.postMessage({ type: 'LOWER_RADIO_VOLUME' }, '*');
                this.playSound(sfx.clock);
            }
            
            if (gameState.turnTimeLeft <= 0) {
                clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null;
                sfx.clock.pause(); sfx.clock.currentTime = 0;
                
                if (window.parent) window.parent.postMessage({ type: 'RESTORE_RADIO_VOLUME' }, '*');

                this.setTxt('turn-countdown', t('syncing') || 'جاري المزامنة مع الخادم...');

                if (gameState.isOnlineMode && !gameState.isSpectator && window.socketManager && window.socket && window.socket.connected) {
                    setTimeout(() => {
                        if (gameState.isGameActive && gameState.onlineRoomID) {
                            window.socket.emit('playerTimeout', { roomID: gameState.onlineRoomID });
                        }
                    }, 1500); 
                }
            }
        };

        if (!gameState.turnEndTime) { gameState.turnTimeLeft = 45; }
        updateTimerDisplay(); 
        gameState.turnTimerInterval = setInterval(updateTimerDisplay, 1000);
    },

    startTurn() {
        const tInd = this.getEl('turn-indicator'); if (!tInd) return;

        if (gameState.virtualBoard.every(row => row.every(cell => cell === null))) return; 

        this.updateVirtualBoardState();

        const isConnected = (typeof socket !== 'undefined' && socket && socket.connected);
        const isBotMatch = !gameState.isOnlineMode;
        
        const isExemptFromStalling = gameState.isTutorialMode || (isBotMatch && !isConnected);

        let myColor = gameState.playerColor;
        let oppColor = myColor === 'white' ? 'black' : 'white';

        let myRep = 0, oppRep = 0;
        if (typeof gameEngine.checkRepetitionAndStalling === 'function') {
            myRep = gameEngine.checkRepetitionAndStalling(myColor);
            oppRep = gameEngine.checkRepetitionAndStalling(oppColor);
        }

        const idleCounter = document.getElementById('idle-counter');
        const repCounter = document.getElementById('repetition-counter');

        if (idleCounter) {
            if (gameState.movesWithoutProgress >= 15 && !isExemptFromStalling) {
                idleCounter.style.display = 'block';
                idleCounter.textContent = `${gameState.movesWithoutProgress}/50`; 
                idleCounter.style.color = gameState.movesWithoutProgress >= 40 ? '#e74c3c' : '#a1a1aa';
                idleCounter.style.borderColor = gameState.movesWithoutProgress >= 40 ? 'rgba(231, 76, 60, 0.4)' : 'rgba(255, 255, 255, 0.1)';
            } else {
                idleCounter.style.display = 'none';
            }
        }

        if (repCounter) {
            if (myRep > 1 && !isExemptFromStalling) { 
                repCounter.style.display = 'block';
                repCounter.textContent = `تكرار: ${myRep}/3`;
                repCounter.style.color = myRep === 3 ? '#e74c3c' : '#f5a623';
                repCounter.style.borderColor = myRep === 3 ? 'rgba(231, 76, 60, 0.4)' : 'rgba(245, 166, 35, 0.3)';
            } else {
                repCounter.style.display = 'none';
            }
        }

        if (!isExemptFromStalling) {
            if (oppRep >= 4) {
                if (gameState.isOnlineMode) {
                    if (tInd) { tInd.textContent = "بانتظار قرار السيرفر... ⏳"; tInd.style.color = "#f5a623"; }
                    return;
                }
                
                if (gameState.blockGameOverModal) return;
                if (tInd) { tInd.textContent = "فوز! الخصم كرر حركاته 🚫"; tInd.style.color = "#2ecc71"; }
                gameState.isGameOver = true;
                gameState.isGameActive = false;
                if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
                if (gameState.turnTimerInterval) { clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null; }
                this.showResultsModal(myColor); 
                return;
            }
            
            if (myRep >= 4) {
                if (gameState.isOnlineMode) return; 

                if (gameState.blockGameOverModal) return;
                if (tInd) { tInd.textContent = "خسارة بسبب التكرار 🚫"; tInd.style.color = "#e74c3c"; }
                gameState.isGameOver = true;
                gameState.isGameActive = false;
                if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
                if (gameState.turnTimerInterval) { clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null; }
                this.showResultsModal(oppColor); 
                return;
            }
        }

        if (gameState.movesWithoutProgress >= 50 || (typeof gameEngine.checkIdleDraw === 'function' && gameEngine.checkIdleDraw(gameState.virtualBoard, gameState.currentTurn))) {
            if (gameState.isOnlineMode) return; 

            if (gameState.blockGameOverModal) return;
            if (tInd) { tInd.textContent = "تم إعلان التعادل 🤝"; tInd.style.color = "#f1c40f"; }
            
            gameState.isGameOver = true;
            gameState.isGameActive = false;
            if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
            if (gameState.turnTimerInterval) { clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null; }
            
            this.showResultsModal('draw'); 
            return;
        }

        if (!gameState.isOnlineMode) {
            if (!gameState.boardHistory) gameState.boardHistory = [];
            let currentBoardStr = JSON.stringify(gameState.virtualBoard);
            let lastSavedStr = gameState.boardHistory.length > 0 ? JSON.stringify(gameState.boardHistory[gameState.boardHistory.length - 1].board) : "";
            if (currentBoardStr !== lastSavedStr) {
                gameState.boardHistory.push({ board: gameState.virtualBoard.map(row => [...row]), turn: gameState.currentTurn });
                if (gameState.boardHistory.length > 6) gameState.boardHistory.shift();
            }
        }
        
        gameState.lastJumpDir = { dr: null, dc: null };
        
        const boardEl = this.getEl('board');
        if (boardEl) {
            const forcedPieces = boardEl.getElementsByClassName('forced');
            while (forcedPieces.length > 0) forcedPieces[0].classList.remove('forced');
            const multiPieces = boardEl.getElementsByClassName('multi-choice');
            while (multiPieces.length > 0) multiPieces[0].classList.remove('multi-choice');
            const multiCells = boardEl.getElementsByClassName('multi-choice-cell');
            while (multiCells.length > 0) multiCells[0].classList.remove('multi-choice-cell');
        }
        
        const isBoardEmpty = gameState.virtualBoard.every(row => row.every(cell => cell === null));
        
        let currentAvailableMoves = 1; 
        if (!isBoardEmpty) { currentAvailableMoves = gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard).length; }
        
        if (!isBoardEmpty && currentAvailableMoves === 0) {
            if (gameState.isOnlineMode) return; 

            if (gameState.blockGameOverModal) return; 
            let winnerColor = gameState.currentTurn === 'white' ? 'black' : 'white';
            tInd.textContent = winnerColor === 'white' ? t('white_wins') : t('black_wins');
            tInd.style.color = "#2ecc71";
            this.showResultsModal(winnerColor); return;
        }
        
        let allMoves = [];
        if (gameState.isMultiJumping && gameState.selectedPiece) {
            let cell = gameState.selectedPiece.parentElement;
            let r = parseInt(cell.dataset.row); let c = parseInt(cell.dataset.col);
            allMoves = gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard, r, c, gameState.lastJumpDir.dr, gameState.lastJumpDir.dc);
        } else {
            allMoves = gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard);
        }

        gameState.requiredJumps = 0;
        let fList = []; 

        if (allMoves.length > 0) {
            let firstMove = allMoves[0];
            let isCapture = firstMove.some(step => step.midR !== null && step.midR !== undefined);

            if (isCapture) {
                gameState.requiredJumps = firstMove.length; 
                allMoves.forEach(path => {
                    let startStep = path[0];
                    if (!fList.some(item => item.r === startStep.fromR && item.c === startStep.fromC)) {
                        let cell = this.getEl('board').querySelector(`[data-row="${startStep.fromR}"][data-col="${startStep.fromC}"]`);
                        if (cell?.children.length > 0) {
                            fList.push({ el: cell.children[0], r: startStep.fromR, c: startStep.fromC });
                        }
                    }
                });
            }
        }
        
        gameState.jumpsCount = 0;
        gameState.isMultiJumping = false;
        
        if (gameState.requiredJumps > 0) {
            tInd.textContent = `${t('forced')} ${gameState.requiredJumps}`; tInd.style.color = "#e74c3c";
            
            fList.forEach(item => {
                item.el.classList.add('forced');
                if (fList.length > 1) {
                    item.el.classList.add('multi-choice');
                    if (item.el.parentElement) {
                        item.el.parentElement.classList.add('multi-choice-cell');
                    }
                }
            });
            
            if ((gameState.currentTurn === gameState.playerColor || gameState.isOnlineMode) && fList.length === 1 && !gameState.isSpectator) {
                gameState.selectedPiece = fList[0].el; gameState.selectedPiece.classList.add('selected');
                if (gameState.currentTurn === gameState.playerColor && boardEl) { 
                    const lastMoves = boardEl.getElementsByClassName('last-move');
                    while (lastMoves.length > 0) lastMoves[0].classList.remove('last-move');
                }
                this.showValidMovesHighlights(fList[0].r, fList[0].c);
            }
        } else {
            if (gameState.isSpectator) {
                tInd.textContent = gameState.currentTurn === 'white' ? "دور الأبيض ⚪" : "دور الأسود ⚫";
                tInd.style.color = "#a1a1aa";
            } else if (gameState.isOnlineMode) { 
                tInd.style.color = "#f1c40f";
                tInd.textContent = gameState.currentTurn === gameState.myOnlineColor ? t('turn_yours') : t('turn_opps'); 
            } else if (gameState.currentTurn === gameState.playerColor) { 
                tInd.style.color = "#f1c40f";
                tInd.textContent = t('turn'); 
            } else { 
                tInd.style.color = "#f1c40f";
                tInd.textContent = t('aiTurn'); 
            }
        }
        
        this.startTurnTimer();
        
        let isBotTurn = (gameState.currentTurn !== gameState.playerColor && !gameState.onlineRoomID);
        let alertShown = false;

        if (!isExemptFromStalling) {
            if (gameState.currentTurn === gameState.playerColor && myRep === 3) {
                alertShown = true;
                if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
                ui.showCustomAlert("تنبيه: اللعب السلبي وتكرار نفس الحركات للمرة القادمة سيؤدي إلى خسارتك فوراً!", "تحذير المماطلة ⚠️");
            } else if (gameState.isOnlineMode && gameState.currentTurn !== gameState.playerColor && oppRep === 3) {
                ui.showCustomAlert("الخصم يكرر الحركات.. تكراره للحركة القادمة سيمنحك الفوز!", "الخصم يماطل ⏳");
            }
        }

        if (isBotTurn && !alertShown) {
            tInd.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;
            clearTimeout(gameState.aiTimeout);
            gameState.aiTimeout = setTimeout(() => this.triggerComputerMove(), 150);
        }
    },

    async triggerComputerMove() {
        let levelStr = this.getVal('diff-quick-select', '3'); let level = parseInt(levelStr) || 3; 
        let aiColor = gameState.playerColor === 'white' ? 'black' : 'white';
        let moves = gameEngine.generateAllTurnMoves(aiColor, gameState.virtualBoard);
        if (moves.length === 0) return;

        const tInd = this.getEl('turn-indicator');
        if (tInd) tInd.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;

        const gameId = gameState.gameId || Date.now();
        gameState.gameId = gameId; 

        if (window.optimizeMemoryForAI) window.optimizeMemoryForAI(true);
        let startThinkingTime = Date.now();
        let chosenMove = await gameAI.getBestMoveAsync(gameState.virtualBoard, level, aiColor, gameState.pieceDirection);
        let timeSpent = Date.now() - startThinkingTime;
        let humanDelay = Math.floor(Math.random() * 1500) + 1000; 
        
        if (timeSpent < humanDelay) { await new Promise(resolve => setTimeout(resolve, humanDelay - timeSpent)); }
        if (window.optimizeMemoryForAI) window.optimizeMemoryForAI(false);

        if (!chosenMove) chosenMove = moves[0]; 
        if (!Array.isArray(chosenMove)) chosenMove = [chosenMove];

        const self = this;
        let stepIdx = 0; let startRow = chosenMove[0].fromR; let startCol = chosenMove[0].fromC;

        function executeStep() {
            if (!gameState.isGameActive || gameState.gameId !== gameId) return; 
            if (gameState.currentTurn !== aiColor || gameState.isOnlineMode) return;

            let step = chosenMove[stepIdx]; if (!step) return;
            let board = self.getEl('board'); if (!board) return;
            
            let fCell = board.querySelector(`[data-row="${step.fromR}"][data-col="${step.fromC}"]`);
            let tCell = board.querySelector(`[data-row="${step.toR}"][data-col="${step.toC}"]`);
            
            if (step.midR !== null && step.midC !== null && step.midR !== undefined) {
                self.playSound(gameState.virtualBoard[step.midR][step.midC]?.includes('dama') ? sfx.kingDied : sfx.piecesDied);
                let midCell = board.querySelector(`[data-row="${step.midR}"][data-col="${step.midC}"]`);
                if (midCell) midCell.innerHTML = '';
                gameState.movesWithoutProgress = 0; 
                gameState.boardHistoryStr = [];
                gameState.pieceHistories = {}; 
            }
            
            if (tCell && fCell?.children.length > 0) tCell.appendChild(fCell.children[0]);
            
            self.playSound(sfx.move); stepIdx++; gameState.botMoveCount++;
            
            if (stepIdx >= chosenMove.length) {
                let last = chosenMove[chosenMove.length - 1];
                let finalCell = board.querySelector(`[data-row="${last.toR}"][data-col="${last.toC}"]`);
                let isPromotion = false;
                
                if (finalCell?.children.length > 0) {
                    const isWhitePiece = finalCell.children[0].classList.contains('white');
                    let realPromoRow = gameState.pieceDirection[isWhitePiece ? 'white' : 'black'] === 1 ? 7 : 0;
                    if (last.toR === realPromoRow && !finalCell.children[0].classList.contains('dama')) {
                        finalCell.children[0].classList.add('dama');
                        self.playSound(sfx.kingCreated); isPromotion = true;
                    }
                }
                
                if (isPromotion) { 
                    gameState.movesWithoutProgress = 0; 
                    gameState.boardHistoryStr = []; 
                    gameState.pieceHistories = {}; 
                } else if (chosenMove.some(s => s.midR === null)) { 
                    gameState.movesWithoutProgress++; 
                    gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard)); 
                    if (gameEngine.trackPieceHistory) gameEngine.trackPieceHistory(startRow, startCol, last.toR, last.toC, aiColor);
                }

                self.highlightMove({ r: startRow, c: startCol }, { r: last.toR, c: last.toC });
                gameState.currentTurn = gameState.playerColor; saveGameState(); self.startTurn();
                return;
            }
            let delay = (gameState.isOnlineMode || step.midR !== null) ? 400 : (gameState.botMoveCount < 7 ? 600 : Math.floor(Math.random() * 500) + 400);
            setTimeout(executeStep, delay);
        }
        executeStep();
    },

    showOnlineResultsModal(winnerColor) { this.showResultsModal(winnerColor); },

    showResultsModal(winnerColor) {
        clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null;
        sfx.clock.pause(); sfx.clock.currentTime = 0; this.setTxt('turn-countdown', '');
        
        if (window.parent) window.parent.postMessage({ type: 'RESTORE_RADIO_VOLUME' }, '*');

        this.setDisplay('match-players-card', 'none');

        const oldModal = this.getEl('custom-results-modal-container');
        if (oldModal) oldModal.remove();

        this.playSound(sfx.win);
        
        if (typeof window.closeAppModal === 'function') window.closeAppModal('game-over-modal');
        else this.setDisplay('game-over-modal', 'none');
        
        this.setDisplay('match-gift-btn-p2', 'none');

        const container = this.makeEl('div', 'custom-results-modal-container', "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,18,25,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;z-index:4000;font-family:sans-serif;direction:rtl;box-sizing:border-box;padding:20px;");
        container.id = 'custom-results-modal-container';
        
        const box = this.makeEl('div', null, "background:rgba(45,48,55,0.65);backdrop-filter:blur(35px);-webkit-backdrop-filter:blur(35px);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:35px 25px;border-radius:32px;width:100%;max-width:320px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05);");
        box.appendChild(this.makeEl('h3', null, "margin:0 0 15px 0;color:#87ceeb;font-size:26px;font-weight:700;text-align:center;", t('go_title')));
        
        const isDraw = winnerColor === 'draw';
        const iconStr = isDraw ? "🤝" : "🏆";
        const trophy = this.makeEl('div', null, "font-size:50px;margin:10px 0 20px 0;text-shadow:0 0 15px rgba(255,215,0,0.4);", iconStr);
        box.appendChild(trophy);
        
        const isMeWin = winnerColor === (gameState.isOnlineMode ? gameState.myOnlineColor : gameState.playerColor);
        
        const createPlayerBox = (name, avatar, isCustom, isWin, isDrawMatch, equippedProfileFrame = null) => {
            const pBox = this.makeEl('div', null, "display:flex;flex-direction:column;align-items:center;width:45%;");
            
            const avContainer = this.makeEl('div', null, "border-radius:50%;padding:0;border:none;background:transparent;box-shadow:none;display:flex;justify-content:center;");
            
            const av = this.makeEl('div', 'result-avatar', "position:relative;width:65px;height:65px;min-width:65px;min-height:65px;flex-shrink:0;border-radius:50%;display:flex;justify-content:center;align-items:center;font-size:28px;background-size:cover;background-position:center;overflow:visible;"); 
            
            this.applyAvatar(av, avatar, isCustom, equippedProfileFrame);
            
            avContainer.appendChild(av);
            
            const nameSpan = this.makeEl('span', null, "margin-top:8px;font-size:13px;font-weight:600;color:#ffffff;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;", name);
            
            let statusBg = isWin ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)';
            let statusColor = isWin ? '#30d158' : '#ff453a';
            let statusBorder = isWin ? 'rgba(48,209,88,0.3)' : 'rgba(255,69,58,0.3)';
            let statusText = isWin ? t('winner') : t('loser');

            if (isDrawMatch) { statusBg = 'rgba(241, 196, 15, 0.15)'; statusColor = '#f1c40f'; statusBorder = 'rgba(241, 196, 15, 0.3)'; statusText = 'تعادل'; }

            const statusSpan = this.makeEl('span', null, `font-size:12px;margin-top:8px;padding:4px 12px;border-radius:50px;font-weight:600;background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};display:inline-block;`, statusText);
            
            pBox.append(avContainer, nameSpan, statusSpan);
            return pBox;
        };
        
        const flex = this.makeEl('div', null, "display:flex;justify-content:center;align-items:center;gap:20px;margin:15px 0;");
        
        let oppName = gameState.currentOpponentName; let oppAvatar = gameState.currentOpponentAvatar;
        if (!gameState.isOnlineMode) { oppName = "بوت"; oppAvatar = "AI_BOT"; }

        if (gameState.userProfile) {
            flex.append(
                createPlayerBox(gameState.userProfile.name, gameState.userProfile.avatar, gameState.userProfile.isCustomAvatar, isMeWin, isDraw, gameState.userProfile.equippedProfileFrame), 
                createPlayerBox(oppName || t('mm_opp'), oppAvatar, oppAvatar?.startsWith('data:image'), !isMeWin, isDraw, gameState.currentOpponentProfileFrame) 
            );
        }
        box.appendChild(flex);
        
        const btns = this.makeEl('div', null, "display:flex;gap:10px;width:100%;margin-top:25px;");
        const rBtn = this.makeEl('button', 'modal-btn-rematch', "flex:1;background:rgba(135,206,235,0.15);color:#87ceeb;border:1px solid rgba(135,206,235,0.3);border-radius:50px;height:50px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1);outline:none;box-shadow:0 0 3px rgba(135,206,235,0.3);", t('go_rematch'));
        rBtn.id = 'modal-btn-rematch';
        rBtn.onmouseenter = () => rBtn.style.transform = 'scale(0.96)'; rBtn.onmouseleave = () => rBtn.style.transform = 'scale(1)';
        
        this.clickHandlers.set('modal-btn-rematch', () => {
            rBtn.disabled = true; rBtn.style.opacity = '0.6'; rBtn.style.cursor = 'not-allowed'; rBtn.textContent = t('waiting'); 
            
            if (gameState.isOnlineMode && !gameState.isBotOpponent) {
                if (socketManager && typeof socketManager.sendRematchRequest === 'function') socketManager.sendRematchRequest();
            } else { setTimeout(() => { container.remove(); this.initBoard(); }, 500); }
        });
        
        const eBtn = this.makeEl('button', 'modal-btn-exit', "flex:1;background:rgba(255,69,58,0.15);color:#ff453a;border:1px solid rgba(255,69,58,0.3);border-radius:50px;height:50px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1);outline:none;box-shadow:0 0 3px rgba(255,69,58,0.3);", t('exit') || 'خروج');
        eBtn.id = 'modal-btn-exit';
        eBtn.onmouseenter = () => eBtn.style.transform = 'scale(0.96)'; eBtn.onmouseleave = () => eBtn.style.transform = 'scale(1)';
        
        this.clickHandlers.set('modal-btn-exit', () => {
            if (gameState.isOnlineMode && !gameState.isBotOpponent && socket?.connected) {
                socket.emit('leaveRoom', { roomID: gameState.onlineRoomID }); socket.emit('rejectRematch', { roomID: gameState.onlineRoomID });
            }
            container.remove(); 
            
            if (typeof window.closeAppModal === 'function') window.closeAppModal('game-over-modal');
            else this.setDisplay('game-over-modal', 'none'); 
            
            if (gameState.turnTimerInterval) { clearInterval(gameState.turnTimerInterval); gameState.turnTimerInterval = null; }
            if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }
            
            gameState.isOnlineMode = false; gameState.onlineRoomID = null; 
            this.drawEmptyBoard();
            
        });
        
        btns.append(rBtn, eBtn); box.appendChild(btns); container.appendChild(box); document.body.appendChild(container);

        if (gameState.userProfile) { 
            const isServerConnected = (typeof socket !== 'undefined' && socket && socket.connected);

            if (isServerConnected) {
                if (!gameState.isOnlineMode && gameState.isTutorialMode) {
                    box.appendChild(this.makeEl('div', 'tutorial-alert', "margin-top:15px;color:#a1a1aa;font-weight:600;font-size:13px;", t('tutorial_mode') || "وضع تعليمي (بدون جوائز) 🚫🪙"));
                } else {
                    let displayReward = 0; let xpGained = 0; let isBossLevel = false; let isBetMatch = false;
                    let lvl = parseInt(this.getVal('diff-quick-select', '3')) || 3;
                    let isMatchmaking = gameState.isOnlineMode && gameState.onlineRoomID && gameState.onlineRoomID.startsWith('MM-');

                    if (gameState.isOnlineMode) {
                        if (gameState.roomBet && gameState.roomBet > 0) isBetMatch = true;

                        if (isMatchmaking) {
                            if (isDraw) { xpGained = 15; displayReward = isBetMatch ? 0 : 25; } 
                            else { xpGained = isMeWin ? 50 : 15; displayReward = isBetMatch ? gameState.roomBet : (isMeWin ? 120 : 10); }
                        } else {
                            xpGained = 0;
                            if (isDraw) { displayReward = 0; } 
                            else { displayReward = isBetMatch ? gameState.roomBet : 0; }
                        }
                    } else {
                    if (isMeWin) {
                        xpGained = 0; 
                        if (lvl <= 2) displayReward = 10;
                        else if (lvl <= 4) displayReward = 15;
                        else if (lvl <= 6) displayReward = 50;
                        else if (lvl <= 8) displayReward = 100;
                        else if (lvl === 9) { displayReward = "100 أو 400"; isBossLevel = true; }
                    } else { xpGained = 0; displayReward = 0; }
               }

                    if (displayReward !== 0 || isDraw || (isBetMatch && !isDraw && !isMeWin)) {
                        let rewardText = ""; let alertColor = "#f5a623";

                        if (isBetMatch) {
                            if (isDraw) { rewardText = `🤝 تم استرداد الرهان بأمان`; alertColor = "#f1c40f"; } 
                            else if (isMeWin) { rewardText = `💰 جائزة الرهان: +${displayReward} 🪙`; alertColor = "#30d158"; } 
                            else { rewardText = `💸 خسارة الرهان: -${gameState.roomBet} 🪙`; alertColor = "#ff453a"; }
                        } else if (isBossLevel) { rewardText = `👑 مكافأة الزعيم: +${displayReward} 🪙`; } 
                        else if (displayReward > 0) { rewardText = `${(t('tokenReward') || 'المكافأة:')} +${displayReward} 🪙`; alertColor = isMeWin ? "#f5a623" : "#87ceeb"; }
                        
                        if (rewardText !== "") { box.appendChild(this.makeEl('div', 'token-reward-alert', `margin-top:15px;color:${alertColor};font-weight:700;font-size:15px;`, rewardText)); }
                    }

                    if (xpGained > 0) { box.appendChild(this.makeEl('div', 'xp-reward-alert', "margin-top:8px; color:#34c759; font-weight:800; font-size:15px; text-shadow: 0 0 8px rgba(52, 199, 89, 0.4); animation: modalFadeIn 0.5s ease;", `✨ اكتساب الخبرة: +${xpGained} XP`)); }

                    if (!gameState.isOnlineMode && isMeWin) { socket.emit('claimBotReward', { isWin: true, level: lvl }); }
                }
            } else {
                const offlineMsg = t('offline_mode') || "أنت تلعب بدون إنترنت (لن يتم حساب الخبرة أو الجوائز)";
                box.appendChild(this.makeEl('div', 'offline-alert', "margin-top:15px;color:#a1a1aa;font-weight:600;font-size:13px;", offlineMsg));
            }
            
            if (window.parent) window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
            this.updateProfileUI(); 
        }
        this.toggleOfflineInMatchUI(false);
    },

    updateProfileUI() {
        if (!gameState.userProfile) return;

        requestAnimationFrame(() => {
            if (typeof window.applyProfileDataToUI === 'function') { window.applyProfileDataToUI(gameState.userProfile); }

            let prof = gameState.userProfile;
            let lvlInfo = this.calculateLevelInfo(prof.xp || 0);

            const badgeLevel = this.getEl('badge-level');
            const xpProgressPath = this.getEl('xp-progress-path');

            if (badgeLevel) badgeLevel.textContent = `Lv.${lvlInfo.level}`;

            const badgeTitleEl = this.getEl('profile-stat-title-badge');
            if (badgeTitleEl) {
                badgeTitleEl.textContent = lvlInfo.title;
            }

            if (xpProgressPath) {
                const totalLength = 150; 
                const progress = Math.min(Math.max(lvlInfo.percentage / 100, 0), 1);
                const newOffset = totalLength - (totalLength * progress);

                xpProgressPath.style.strokeDasharray = totalLength;
                xpProgressPath.style.strokeDashoffset = newOffset;
            }

            const igpLevel = this.getEl('igp-level'); const igpXpFill = this.getEl('igp-xp-fill'); const igpXpText = this.getEl('igp-xp-text');
            if (igpLevel) igpLevel.textContent = `Lv.${lvlInfo.level}`;
            
            const igpRankDisplay = this.getEl('igp-rank-display');
            const igpTitleDisplay = this.getEl('igp-title-display');
            
            if (igpRankDisplay) igpRankDisplay.innerHTML = `${lvlInfo.rankIcon} <span>${lvlInfo.rank}</span>`;
            if (igpTitleDisplay) igpTitleDisplay.textContent = `اللقب: ${lvlInfo.title}`;
            
            const badgeRankEl = this.getEl('profile-stat-rank-badge');
            const badgeRankIconEl = this.getEl('profile-stat-rank-icon-badge');
            
            if (badgeRankEl) {
                badgeRankEl.innerHTML = `${lvlInfo.rank}`;
            }
            
            if (badgeRankIconEl) {
                badgeRankIconEl.innerHTML = lvlInfo.rankIcon;
            }

            if (igpXpFill) igpXpFill.style.width = `${lvlInfo.percentage}%`;
            if (igpXpText) igpXpText.textContent = `${lvlInfo.progressXp} / ${lvlInfo.requiredXp} XP`;

            const hintCounter = document.getElementById('hint-counter');
            if (hintCounter) {
                if (gameState.isTutorialMode && !gameState.isOnlineMode) {
                    hintCounter.textContent = "مجاني"; hintCounter.style.fontSize = "8px"; hintCounter.style.padding = "2px 4px";
                } else if (gameState.userProfile) {
                    if (gameState.userProfile.hints === undefined) gameState.userProfile.hints = 5;
                    
                    if (gameState.isOnlineMode) {
                        let used = gameState.onlineHintsUsed || 0;
                        let remainingOnline = Math.max(0, 2 - used);
                        hintCounter.textContent = Math.min(gameState.userProfile.hints, remainingOnline);
                    } else {
                        hintCounter.textContent = gameState.userProfile.hints; 
                    }
                    
                    hintCounter.style.fontSize = "11px"; hintCounter.style.padding = "2px 6px";
                }
            }

            const fList = this.getEl('igp-friends-list');
            if (fList) {
                if (!gameState.userProfile.friends || gameState.userProfile.friends.length === 0) {
                    fList.innerHTML = '<p style="text-align:center;color:#a1a1aa;font-size:12px;">لا يوجد أصدقاء حالياً</p>';
                } else {
                    let uniqueArr = [];
                    let seen = new Set();
                    (gameState.userProfile.friends || []).forEach(f => {
                        let fId = typeof f === 'string' ? f.toUpperCase() : (f.id ? f.id.toUpperCase() : null);
                        if (fId && !seen.has(fId)) {
                            seen.add(fId);
                            uniqueArr.push(f);
                        }
                    });
                    gameState.userProfile.friends = uniqueArr;

                    if(typeof renderFriendsList !== 'undefined') renderFriendsList(gameState.userProfile.friends);
                }
            }
        });
    },

    initProfileSystem() {
        let saved = localStorage.getItem('hub_user_profile');
        if (saved) { 
            try {
                const parsed = JSON.parse(saved);
                if (parsed.id) parsed.id = parsed.id.toUpperCase();
                
                if (parsed.friends) {
                    let uniqueArr = [];
                    let seen = new Set();
                    parsed.friends.forEach(f => {
                        let fId = typeof f === 'string' ? f.toUpperCase() : (f.id ? f.id.toUpperCase() : null);
                        if (fId && !seen.has(fId)) {
                            seen.add(fId);
                            uniqueArr.push(f);
                        }
                    });
                    parsed.friends = uniqueArr;
                }
                
                gameState.userProfile = { ...gameState.userProfile, ...parsed }; 
            } catch(e) {}
        }
        this.updateProfileUI(); 
    }
};

// ==========================================
// 🌟 دوال الواجهة العامة (النوافذ والتبويبات والأصدقاء)
// ==========================================

function forceLockedGlobalAvatar() {
    let globalProfile = localStorage.getItem('hub_user_profile');
    let avatarSrc = "../Photo/1000132081.webp"; let isImage = true;
    let equippedProfileFrame = null;
    
    if (globalProfile) { 
        try { 
            const parsedHub = JSON.parse(globalProfile); 
            if (parsedHub.avatar) { 
                avatarSrc = parsedHub.avatar; 
                isImage = avatarSrc.includes('.') || avatarSrc.startsWith('data:image') || avatarSrc.startsWith('http'); 
            } 
            equippedProfileFrame = parsedHub.equippedProfileFrame;
        } catch(e) {} 
    }
    
    const targetAvatars = ['badge-avatar', 'card-my-avatar', 'mm-my-avatar'];
    targetAvatars.forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        ui.applyAvatar(el, avatarSrc, isImage, equippedProfileFrame);
    });
}
window.forceLockedGlobalAvatar = forceLockedGlobalAvatar;

window.applyProfileDataToUI = function(profile) {
    requestAnimationFrame(() => {
        const currentTokens = profile.tokens !== undefined ? profile.tokens : 0;
        const currentId = profile.id || getUserIdLocally();
        const textElements = { 
            'badge-username-display-game': profile.name, 
            'card-my-name': profile.name, 
            'mm-my-name': profile.name, 
            'profile-stat-tokens-badge': currentTokens, 
            'profile-stat-tokens-store': currentTokens, 
            'igp-name': profile.name, 
            'igp-id-display': currentId, 
            'igp-games': profile.gamesPlayed !== undefined ? profile.gamesPlayed : (profile.games !== undefined ? profile.games : 0), 
            'igp-wins': profile.wins !== undefined ? profile.wins : 0, 
            'igp-losses': profile.losses !== undefined ? profile.losses : 0 
        };

        for (let id in textElements) {
            const el = document.getElementById(id);
            if (el && String(el.textContent) !== String(textElements[id])) { 
                el.textContent = textElements[id]; 
            }
        }

        const currentStreakEl = document.getElementById('profile-stat-streak-badge');
        if (currentStreakEl && String(currentStreakEl.textContent) !== String(profile.currentStreak || 0)) {
            currentStreakEl.textContent = profile.currentStreak || 0;
        }

        if(typeof forceLockedGlobalAvatar === 'function') forceLockedGlobalAvatar();
        if(window.updateInventoryUI) window.updateInventoryUI();

        if (typeof window.refreshProfileUIStyles === 'function') {
            requestAnimationFrame(() => window.refreshProfileUIStyles());
        }
    });
};

window.openCreatorSettings = function(roomId, currentBet) {
    const roomIdInput = document.getElementById('creator-target-room-id');
    const betInput = document.getElementById('edit-room-bet-input');
    const betDisplay = document.getElementById('edit-room-bet-display');
    
    if (roomIdInput) roomIdInput.value = roomId;
    if (betInput) betInput.value = currentBet;
    
    if (betDisplay) {
        let betText = "بدون رهان (مجاني)";
        if (currentBet == 50) betText = "50 🪙";
        else if (currentBet == 100) betText = "100 🪙";
        else if (currentBet == 200) betText = "200 🪙";
        else if (currentBet == 500) betText = "500 🪙 (الحد الأقصى)";
        else if (currentBet == 1000) betText = "1000 🪙 (الحد الأقصى)";
        betDisplay.textContent = betText;
    }
    
    window.openAppModal('creator-room-settings-modal');
};

window.deleteMyRoom = function(roomId) {
    if (typeof ui !== 'undefined' && typeof ui.showCustomAlert === 'function') {
        ui.showCustomAlert(
            "هل أنت متأكد من رغبتك في إغلاق وحذف هذه الغرفة نهائياً؟",
            "حذف الغرفة 🗑️",
            () => {
                if (typeof socket !== 'undefined' && socket && socket.connected) {
                    socket.emit('leaveRoom', { roomID: roomId });
                }
            },
            true, "إلغاء", "نعم، احذفها"
        );
    }
};

window.openAppModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) { 
        modal.style.display = 'flex'; 
        if (!gameState.modalStack.includes(id)) gameState.modalStack.push(id);
        if (id === 'online-modal' && window.socket && window.socket.connected) {
            window.socket.emit('requestActiveRooms');
        }
    }
};

window.closeAppModal = function(id) {
    if (id === 'lucky-spin-modal' && window.isSpinning) return; 
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none'; 
        gameState.modalStack = gameState.modalStack.filter(m => m !== id);
    }
};

window.toggleSideMenu = function() {
    const overlay = document.getElementById('side-menu-overlay');
    if (overlay.classList.contains('open')) overlay.classList.remove('open');
    else overlay.classList.add('open');
};

window.switchQuestTab = function(tab) {
    document.getElementById('quest-tab-daily').classList.remove('active');
    document.getElementById('quest-tab-weekly').classList.remove('active');
    document.getElementById('quests-list-container-daily').style.display = 'none';
    document.getElementById('quests-list-container-weekly').style.display = 'none';
    document.getElementById('quest-tab-' + tab).classList.add('active');
    document.getElementById('quests-list-container-' + tab).style.display = 'flex';
    if (window.questsManager) { 
        window.questsManager.currentTab = tab; 
        window.questsManager.updateTimerDisplay(); 
        window.questsManager.renderQuests(tab); 
    }
};

window.switchRoomTab = function(tab) {
    document.getElementById('room-tab-play').classList.remove('active'); 
    document.getElementById('room-tab-bet').classList.remove('active');
    
    const playContent = document.getElementById('play-tab-content');
    const spectateContent = document.getElementById('spectate-rooms-list');
    
    if (playContent) playContent.style.display = 'none';
    if (spectateContent) spectateContent.style.display = 'none';
    
    document.getElementById('room-tab-' + tab).classList.add('active'); 
    
    const optNew = document.getElementById('sort-opt-new');
    const optViews = document.getElementById('sort-opt-views');

    if (tab === 'play') { 
        if (playContent) playContent.style.display = 'flex'; 
        if (optNew) optNew.style.display = 'flex';
        if (optViews) optViews.style.display = 'none';
        
        if (window.currentRoomSortMode === 'views') {
            window.currentRoomSortMode = 'vip';
            document.querySelectorAll('#room-sort-modal .bet-option-item').forEach(el => el.classList.remove('selected'));
            const defaultOpt = document.querySelector('#room-sort-modal .bet-option-item');
            if (defaultOpt) defaultOpt.classList.add('selected');
        }
    } else { 
        if (spectateContent) spectateContent.style.display = 'flex'; 
        if (optNew) optNew.style.display = 'none';
        if (optViews) optViews.style.display = 'flex';
        
        if (window.currentRoomSortMode === 'new') {
            window.currentRoomSortMode = 'vip'; 
            document.querySelectorAll('#room-sort-modal .bet-option-item').forEach(el => el.classList.remove('selected'));
            const defaultOpt = document.querySelector('#room-sort-modal .bet-option-item');
            if (defaultOpt) defaultOpt.classList.add('selected');
        }
    }
    window.lastRenderStateHash = null; 
    if (window.renderRoomsList) window.renderRoomsList();
};

function cleanExpiredRequests(profile) {
    if (!profile.friendRequests) profile.friendRequests = [];
    const now = Date.now(); const threeDays = 3 * 24 * 60 * 60 * 1000;
    profile.friendRequests = profile.friendRequests.filter(req => (now - req.timestamp) < threeDays);
    return profile;
}

function renderFriendsList(friendsArr) {
    const listContainer = document.getElementById('igp-friends-list'); if (!listContainer) return;
    if (!friendsArr || friendsArr.length === 0) { listContainer.innerHTML = '<p style="text-align:center;color:#a1a1aa;font-size:12px;">لا يوجد أصدقاء حالياً</p>'; return; }
    listContainer.innerHTML = '';
    
    let actualFriends = friendsArr;
    if (friendsArr.length > 0 && typeof friendsArr[0] === 'string') {
        let globalProfile = localStorage.getItem('hub_user_profile');
        if (globalProfile) {
            let prof = cleanExpiredRequests(JSON.parse(globalProfile));
            if(prof.friends && prof.friends.length > 0 && typeof prof.friends[0] === 'object') {
                actualFriends = prof.friends;
            }
        }
    }

    actualFriends.forEach(friend => {
        let div = document.createElement('div');
        div.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.05); padding:8px 10px; border-radius:14px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.08); box-shadow: 0 4px 10px rgba(0,0,0,0.2);";
        
        let friendId = typeof friend === 'string' ? friend : friend.id;
        let friendName = typeof friend === 'object' && friend.name ? friend.name : 'لاعب';
        let friendAvatar = typeof friend === 'object' && friend.avatar ? friend.avatar : '../Photo/1000132081.webp';
        
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                <img src="${friendAvatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0;" onerror="this.src='../Photo/1000132081.webp'">
                <div style="text-align:right; overflow:hidden;">
                    <div style="font-weight:bold; color:white; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${friendName}</div>
                    <div style="font-size:9px; color:#a1a1aa; font-family: monospace;">${friendId}</div>
                </div>
            </div>
            <div style="display:flex; gap:4px; flex-shrink: 0;">
                <button data-action="challenge-friend" data-fid="${friendId}" style="background:linear-gradient(135deg, #34c759, #28a745); border:none; color:#fff; border-radius:8px; padding:6px 8px; cursor:pointer; font-size:11px; font-weight:bold; box-shadow:0 2px 5px rgba(40,167,69,0.3); transition: transform 0.2s; white-space: nowrap;">
                    تحدي ⚔️
                </button>
                <button data-action="remove-friend" data-fid="${friendId}" style="background:rgba(255,69,58,0.15); border:1px solid rgba(255,69,58,0.3); color:#ff453a; border-radius:8px; padding:6px 8px; cursor:pointer; font-size:11px; font-weight:bold; transition: transform 0.2s; white-space: nowrap;">
                    حذف 🗑️
                </button>
            </div>
        `;
        listContainer.appendChild(div);
    });
}

function renderFriendRequests() {
    let profStr = localStorage.getItem('hub_user_profile'); if (!profStr) return;
    let prof = cleanExpiredRequests(JSON.parse(profStr)); localStorage.setItem('hub_user_profile', JSON.stringify(prof));
    let container = document.getElementById('friend-requests-container'); let badge = document.getElementById('friend-requests-badge');
    let reqs = prof.friendRequests || [];

    if(badge) { if(reqs.length > 0) { badge.style.display = 'inline-block'; badge.textContent = reqs.length; } else { badge.style.display = 'none'; } }
    if (!container) return; container.innerHTML = '';
    
    if (reqs.length === 0) { container.innerHTML = '<div style="text-align:center; color:#a1a1aa; padding:20px;">لا توجد طلبات صداقة حالياً.</div>'; return; }

    reqs.forEach(req => {
        let div = document.createElement('div');
        div.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.05); padding:10px; border-radius:14px; border:1px solid rgba(255,255,255,0.05);";
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${req.avatar || '../Photo/1000132081.webp'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.src='../Photo/1000132081.webp'">
                <div style="text-align:right;">
                    <div style="font-weight:bold; color:white; font-size:14px;">${req.name}</div>
                    <div style="font-size:10px; color:#a1a1aa;">طلب صداقة</div>
                </div>
            </div>
            <div style="display:flex; gap:6px;">
                <button onclick="window.acceptFriendReq('${req.id}')" style="background:rgba(48,209,88,0.2); border:1px solid rgba(48,209,88,0.4); color:#30d158; width:34px; height:34px; border-radius:10px; font-size:16px; cursor:pointer;">✓</button>
                <button onclick="window.rejectFriendReq('${req.id}')" style="background:rgba(255,69,58,0.15); border:1px solid rgba(255,69,58,0.3); color:#ff453a; width:34px; height:34px; border-radius:10px; font-size:16px; cursor:pointer;">✕</button>
            </div>
        `;
        container.appendChild(div);
    });
}

window.acceptFriendReq = function(reqId) {
    let profStr = localStorage.getItem('hub_user_profile'); if(!profStr) return;
    let prof = JSON.parse(profStr); if(!prof.friends) prof.friends = [];
    let reqIndex = prof.friendRequests.findIndex(r => r.id === reqId);
    
    if(reqIndex !== -1) {
        let acceptedUser = prof.friendRequests[reqIndex];
        if(!prof.friends.find(f => (typeof f === 'string' ? f === reqId : f.id === reqId))) { 
            prof.friends.push({ id: acceptedUser.id, name: acceptedUser.name, avatar: acceptedUser.avatar }); 
        }
        prof.friendRequests.splice(reqIndex, 1); 
        localStorage.setItem('hub_user_profile', JSON.stringify(prof));
        
        if (gameState.userProfile) {
            gameState.userProfile.friends = prof.friends;
            gameState.userProfile.friendRequests = prof.friendRequests;
        }

        renderFriendRequests(); renderFriendsList(prof.friends);
        
        if (window.socket && window.socket.connected) {
            window.socket.emit('acceptFriendReq', { targetId: reqId });
            window.socket.emit('syncProfile', { id: prof.id, friends: prof.friends, friendRequests: prof.friendRequests });
        }

        const toast = document.getElementById('toast-notification'); 
        if (toast) { toast.textContent = '✅ تمت إضافة الصديق بنجاح!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
    }
};

window.rejectFriendReq = function(reqId) {
    let profStr = localStorage.getItem('hub_user_profile'); if(!profStr) return;
    let prof = JSON.parse(profStr); 
    prof.friendRequests = prof.friendRequests.filter(r => r.id !== reqId);
    localStorage.setItem('hub_user_profile', JSON.stringify(prof)); 
    
    if (gameState.userProfile) gameState.userProfile.friendRequests = prof.friendRequests;

    renderFriendRequests();

    if (window.socket && window.socket.connected) {
        window.socket.emit('syncProfile', { id: prof.id, friendRequests: prof.friendRequests });
    }
};

window.sendFriendRequest = function() {
    if(!gameState.currentViewedPlayer) return;
    
    if (window.socket && window.socket.connected) {
        window.socket.emit('sendFriendReq', { targetId: gameState.currentViewedPlayer.id });
    }
    
    const toast = document.getElementById('toast-notification'); 
    if (toast) { 
        toast.textContent = '📨 تم إرسال طلب الصداقة بنجاح!'; 
        toast.classList.add('show'); 
        setTimeout(() => toast.classList.remove('show'), 2500); 
    }
    
    const btn = document.getElementById('send-friend-req-btn');
    if(btn) { 
        btn.innerHTML = '✓ تم الإرسال'; 
        btn.style.background = 'rgba(255,255,255,0.1) !important'; 
        btn.style.color = '#a1a1aa !important'; 
        btn.style.borderColor = 'rgba(255,255,255,0.2) !important'; 
        btn.disabled = true; 
    }
};

window.openMyProfile = function() {
    const xpCont = document.getElementById('igp-xp-container'); const statGrid = document.getElementById('igp-stats-grid'); const lvlBadge = document.getElementById('igp-level');
    if(xpCont) xpCont.style.display = 'block'; if(statGrid) statGrid.style.display = 'grid'; if(lvlBadge) lvlBadge.style.display = 'block';
    document.getElementById('own-profile-actions').style.display = 'block'; document.getElementById('other-profile-actions').style.display = 'none';
    
    let globalProfile = localStorage.getItem('hub_user_profile');
    if (globalProfile) {
        let prof = cleanExpiredRequests(JSON.parse(globalProfile)); localStorage.setItem('hub_user_profile', JSON.stringify(prof)); 
        window.applyProfileDataToUI(prof);
        
        ui.applyAvatar('igp-avatar', prof.avatar, prof.avatar?.startsWith('data:image'), prof.equippedProfileFrame);
        
        let level = Math.floor(Math.sqrt(Math.max(0, prof.xp || 0) / 50)) + 1;
        if(lvlBadge) lvlBadge.textContent = `Lv.${level}`;
        
        let xpBar = document.getElementById('igp-xp-fill'); let xpText = document.getElementById('igp-xp-text');
        if(xpBar && xpText) {
            let currentLevelXp = Math.pow(level - 1, 2) * 50; let nextLevelXp = Math.pow(level, 2) * 50;
            let progress = ((prof.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
            xpBar.style.width = Math.min(100, Math.max(0, progress)) + '%'; xpText.textContent = `${prof.xp || 0} / ${nextLevelXp} XP`;
        }
        
        const formatPop = (num) => {
            if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
            return num;
        };
        document.getElementById('igp-popularity-val').textContent = formatPop(prof.popularity || 0);

        const highestStreakEl = document.getElementById('igp-highest-streak');
        if (highestStreakEl) highestStreakEl.textContent = prof.highestStreak || 0;

        renderFriendsList(prof.friends); renderFriendRequests();
    }
    window.openAppModal('in-game-profile-modal');
};

window.showPlayerProfileFromLB = function(player) {
    let myProfile = window.gameState && window.gameState.userProfile ? window.gameState.userProfile : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
    
    if (player.id === myProfile.id) {
        window.openMyProfile(); 
        return; 
    }

    gameState.currentViewedPlayer = player; 
    const xpContainer = document.getElementById('igp-xp-container'); const statsGrid = document.getElementById('igp-stats-grid'); const levelBadge = document.getElementById('igp-level');
    if(xpContainer) xpContainer.style.display = 'none'; if(statsGrid) statsGrid.style.display = 'none'; if(levelBadge) levelBadge.style.display = 'none';
    document.getElementById('own-profile-actions').style.display = 'none'; document.getElementById('other-profile-actions').style.display = 'flex';
    
    const reqBtn = document.getElementById('send-friend-req-btn'); if(reqBtn) { reqBtn.innerHTML = '➕ إرسال طلب صداقة'; reqBtn.style.cssText = "background: rgba(48,209,88,0.15) !important; color: #30d158 !important; border-color: rgba(48,209,88,0.3) !important; margin: 0;"; reqBtn.disabled = false; }
    const popBtn = document.getElementById('give-pop-btn'); if(popBtn) { popBtn.innerHTML = '🔥 منح شعبية'; popBtn.style.cssText = "background: rgba(0, 210, 255, 0.15) !important; color: #00d2ff !important; border-color: rgba(0, 210, 255, 0.3) !important; margin: 0;"; popBtn.disabled = false; }

    document.getElementById('igp-name').textContent = player.name || 'لاعب مجهول'; document.getElementById('igp-id-display').textContent = player.id || 'غير متوفر';
    
    const formatPop = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num;
    };
    document.getElementById('igp-popularity-val').textContent = formatPop(player.popularity !== undefined ? player.popularity : 0);

    const highestStreakEl = document.getElementById('igp-highest-streak');
    if (highestStreakEl) highestStreakEl.textContent = player.highestStreak || 0;

    let frameToLoad = player.equippedProfileFrame || player.equippedFr || null;
    ui.applyAvatar('igp-avatar', player.avatar, player.avatar?.startsWith('data:image'), frameToLoad);
    
    const oppRankDisplay = document.getElementById('igp-rank-display');
    const oppTitleDisplay = document.getElementById('igp-title-display');
    
    if (player.rankInfo) { 
        if (oppRankDisplay) oppRankDisplay.innerHTML = `${player.rankInfo.icon} <span>${player.rankInfo.title}</span>`; 
        
        let oppLevel = Math.floor(Math.sqrt(Math.max(0, player.score || 0) / 50)) + 1;
        let oppTitleText = "مبتدئ";
        if (oppLevel >= 100) oppTitleText = "جراند ماستر";
        else if (oppLevel >= 50) oppTitleText = "معلم الدامة";
        else if (oppLevel >= 30) oppTitleText = "خبير";
        else if (oppLevel >= 10) oppTitleText = "مبارز";
        
        if (oppTitleDisplay) oppTitleDisplay.textContent = `اللقب: ${oppTitleText}`;
    } else { 
        if (oppRankDisplay) oppRankDisplay.innerHTML = `<img src="Media/front/Bronze.webp" style="height: 14px; vertical-align: middle; filter: drop-shadow(0 0 2px rgba(205,127,50,0.8));"> <span>برونزي</span>`; 
        if (oppTitleDisplay) oppTitleDisplay.textContent = `اللقب: مبتدئ`;
    }
    
    window.openAppModal('in-game-profile-modal');
};

window.openGiftPanel = function(targetId) {
    const selector = document.getElementById('spectator-gift-target-selector');
    const desc = document.getElementById('gift-modal-desc');
    
    if (gameState.isSpectator && !targetId) {
        window.targetGiftReceiverId = window.matchPlayer1Id; 
        
        if (selector) {
            selector.style.display = 'block';
            document.getElementById('gift-target-p1').textContent = document.getElementById('card-my-name').textContent || "اللاعب 1";
            document.getElementById('gift-target-p2').textContent = document.getElementById('card-opp-name').textContent || "اللاعب 2";
            
            document.getElementById('gift-target-p1').classList.add('active');
            document.getElementById('gift-target-p2').classList.remove('active');
        }
        if (desc) desc.textContent = "اختر هدية من حقيبتك لإرسالها:";
    } else {
        if (selector) selector.style.display = 'none';
        if (desc) desc.textContent = "اختر هدية من حقيبتك لإرسالها إلى المنافس:";
        if (targetId) {
            window.targetGiftReceiverId = targetId;
        } else {
            window.targetGiftReceiverId = window.matchPlayer2Id || window.currentOpponentId;
        }
    }
    
    window.givePopularity(window.targetGiftReceiverId);
};

window.setGiftTarget = function(id, btnElement) {
    window.targetGiftReceiverId = id;
    document.getElementById('gift-target-p1').classList.remove('active');
    document.getElementById('gift-target-p2').classList.remove('active');
    if(btnElement) btnElement.classList.add('active');
};


window.givePopularity = function(directTargetId) {
    if (directTargetId) window.targetGiftReceiverId = directTargetId;
    if (!window.targetGiftReceiverId) {
        window.targetGiftReceiverId = window.challengeTargetFriendId || window.currentOpponentId || (gameState.currentViewedPlayer ? gameState.currentViewedPlayer.id : null);
    }

    const profile = (window.storeManager && window.storeManager.getProfile) ? window.storeManager.getProfile() : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
    const inventory = profile.inventory || {};
    const grid = document.getElementById('my-gifts-selection-grid');
    if (!grid) return;
    grid.innerHTML = '';
    let availableCount = 0;

    const formatNum = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num;
    };

    (window.POPULARITY_ITEMS || []).forEach(gift => {
        const count = inventory[gift.id] || 0;
        if (count > 0) {
            availableCount++;
            const itemEl = document.createElement('div'); itemEl.className = 'store-item-card'; itemEl.style.padding = '8px'; itemEl.style.display = 'flex'; itemEl.style.flexDirection = 'column'; itemEl.style.alignItems = 'center'; itemEl.style.gap = '5px';
            itemEl.innerHTML = `
                <img src="${gift.imagePath}" style="width: 40px; height: 40px; object-fit: contain;">
                <span style="color: white; font-size: 11px; font-weight: bold; text-align: center;">${gift.nameAr}</span>
                <div style="color: #00d2ff; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 3px; filter: drop-shadow(0 0 2px rgba(0, 210, 255, 0.4));">
                    +${formatNum(gift.popValue)} <span style="font-size: 12px; filter: hue-rotate(210deg) drop-shadow(0 0 2px rgba(0, 210, 255, 0.6));">🔥</span>
                </div>
                <span style="color: #f5a623; font-size: 10px;">لديك: x${count}</span>
                <button class="store-buy-btn-small" onclick="window.confirmSendGift('${gift.id}', ${gift.popValue || gift.price || 10})" style="width: 100%; height: 26px; font-size: 11px; margin-top: auto; background: rgba(0, 210, 255, 0.15); border: 1px solid rgba(0, 210, 255, 0.3); color: #00d2ff; transition: 0.3s;">إرسال 🚀</button>
            `;
            grid.appendChild(itemEl);
        }
    });

    if (availableCount === 0) grid.innerHTML = '<p style="color: #a1a1aa; font-size: 13px; text-align: center; grid-column: span 3; padding: 15px;">حقيبتك فارغة من الهدايا! اذهب للمتجر لشراء الشعبية.</p>';
    if (typeof window.openAppModal === 'function') window.openAppModal('send-gift-modal');
};

window.confirmSendGift = function(giftId, fallbackPopValue) {
    let profile = (window.storeManager && window.storeManager.getProfile) ? window.storeManager.getProfile() : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
    if (!profile.inventory || !profile.inventory[giftId] || profile.inventory[giftId] <= 0) return;
    
    let targetId = window.targetGiftReceiverId;
    if (!targetId) return;

    profile.inventory[giftId] -= 1;
    
    if (gameState.userProfile && gameState.userProfile.inventory) {
        gameState.userProfile.inventory[giftId] -= 1; 
    }

    localStorage.setItem('hub_user_profile', JSON.stringify(profile));

    if (typeof window.closeAppModal === 'function') { 
        window.closeAppModal('send-gift-modal'); 
        window.closeAppModal('in-game-profile-modal'); 
    }

    if (window.socket && window.socket.connected) {
        window.socket.emit('sendPopularityGift', { 
            giftId: giftId, 
            popValue: fallbackPopValue, 
            targetOpponentId: targetId,
            guestId: profile.id 
        }, (response) => {
            if (response && response.success) {
                
                if (gameState.currentViewedPlayer && (gameState.currentViewedPlayer.id === targetId || gameState.currentViewedPlayer.guestId === targetId)) {
                    gameState.currentViewedPlayer.popularity = response.newTotalPopularity;
                }
                if (window.currentOpponentData && (window.currentOpponentData.guestId === targetId || window.currentOpponentData.id === targetId)) {
                    window.currentOpponentData.popularity = response.newTotalPopularity;
                }

                const popDisplay = document.getElementById('igp-popularity-val');
                if (popDisplay) {
                    let formatNum = (num) => {
                        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                        return num;
                    };
                    
                    popDisplay.textContent = formatNum(response.newTotalPopularity);
                    popDisplay.style.transition = 'all 0.3s ease';
                    popDisplay.style.transform = 'scale(1.5)';
                    popDisplay.style.color = '#fff';
                    popDisplay.style.textShadow = '0 0 15px #00d2ff';
                    setTimeout(() => {
                        popDisplay.style.transform = 'scale(1)';
                        popDisplay.style.color = '';
                        popDisplay.style.textShadow = '';
                    }, 400);
                }

                const toast = document.getElementById('toast-notification');
                if (toast) { 
                    toast.textContent = `✨ تم إرسال الهدية بنجاح! (+${response.popValue} شعبية)`; 
                    toast.classList.add('show'); 
                    setTimeout(() => toast.classList.remove('show'), 2500); 
                }

            } else {
                const toast = document.getElementById('toast-notification');
                if (toast) { 
                    toast.textContent = `❌ فشل الإرسال (السيرفر رفض العملية)`; 
                    toast.classList.add('show'); 
                    toast.style.borderColor = "#ff453a";
                    setTimeout(() => { toast.classList.remove('show'); toast.style.borderColor = ""; }, 2500); 
                }
                profile.inventory[giftId] = (profile.inventory[giftId] || 0) + 1;
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));
            }
        });
    }
    window.targetGiftReceiverId = null; 
};

function fallbackCopyText(text, callback) {
    const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); if (callback) callback(); } catch (err) {}
    document.body.removeChild(textArea);
}

window.copyMyId = function() {
    const idText = document.getElementById('igp-id-display').textContent;
    if (idText && idText !== '...') {
        const showToast = () => { const toast = document.getElementById('toast-notification'); if (toast) { toast.textContent = '📋 تم نسخ الـ ID بنجاح'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); } };
        if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(idText).then(showToast).catch(() => { fallbackCopyText(idText, showToast); }); } else { fallbackCopyText(idText, showToast); }
    }
};

window.createLbItemHTML = function(rank, playerObj, type) {
    let score = playerObj.score || playerObj.wins || 0; 
    let name = playerObj.name; 
    let avatarStr = playerObj.avatar; 
    let playerRankInfo = playerObj.rankInfo;
    
    let displayScore = '';
    
    if (type === 'xp') {
        let level = Math.floor(Math.sqrt(Math.max(0, score) / 50)) + 1; 
        if (level > 200) level = 200;
        displayScore = `<span style="color:#87ceeb; font-weight:800; background: rgba(135,206,235,0.15); border: 1px solid rgba(135,206,235,0.3); padding: 2px 8px; border-radius: 6px;">Lv.${level}</span>`;
    } else {
        displayScore = `<span style="color:#f5a623; font-weight:800;">${formatCompactNumber(score)} 🏆</span>`;
    }

    const div = document.createElement('div'); 
    div.className = 'lb-item';
    let rankIconHTML = playerRankInfo && playerRankInfo.icon ? `<span class="rank-icon-small" title="${playerRankInfo.title}">${playerRankInfo.icon}</span>` : '';
    const nameEl = document.createElement('div'); 
    nameEl.className = 'lb-name'; 
    nameEl.innerHTML = `<span>${name}</span>${rankIconHTML}`;
    
    let secureImgSrc = getSecureAvatarUrl(avatarStr);
    let overlayFrameSrc = playerObj.equippedProfileFrame && PROFILE_FRAMES_DB[playerObj.equippedProfileFrame] ? PROFILE_FRAMES_DB[playerObj.equippedProfileFrame] : null;

    div.innerHTML = `
        <div class="lb-rank">#${rank}</div>
        <div class="lb-avatar" style="padding:0; border:none; display:flex; justify-content:center; align-items:center; overflow:visible; cursor:pointer; transition:all 0.2s; flex-shrink: 0; min-width: 40px; min-height: 40px; width: 40px; height: 40px; border-radius: 50%; background: transparent;" title="عرض الملف الشخصي">
            <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <img src="${secureImgSrc}" onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=\\'font-size: 22px;\\'>👤</span>';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; position: relative; z-index: 1;">
                ${overlayFrameSrc ? `<img src="${overlayFrameSrc}" onerror="this.style.display='none'" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 140%; height: 140%; z-index: 3; pointer-events: none; object-fit: contain; border-radius: 0; max-width: none; max-height: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">` : ''}
            </div>
        </div>
        <div class="lb-info" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%;">
            <div class="lb-name-container"></div>
            <div class="lb-score" style="display:flex; align-items:center; justify-content:flex-end;">${displayScore}</div>
        </div>
    `;
    
    div.querySelector('.lb-name-container').replaceWith(nameEl);
    const avatarContainer = div.querySelector('.lb-avatar');
    
    avatarContainer.onclick = function() { if(window.showPlayerProfileFromLB) window.showPlayerProfileFromLB(playerObj); };
    avatarContainer.onmouseover = () => { avatarContainer.style.transform = 'scale(1.1)'; };
    avatarContainer.onmouseout = () => { avatarContainer.style.transform = 'scale(1)'; };

    return div;
};

function getSecureAvatarUrl(src) {
    if (!src || src === 'null' || src === 'undefined') {
        return 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/1000132081.webp';
    }
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
        return src;
    }
    let cleanName = src.replace(/\.\.\//g, '').replace('Photo/', '');
    return 'https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/Photo/' + cleanName;
}

function getFormattedLeaderboardScore(player, tabType) {
    let score = player.score || player.wins || 0;
    
    if (tabType === 'wins') {
        return formatCompactNumber(score) + ' 🏆';
    }
    
    if (tabType === 'xp') {
        let level = Math.floor(Math.sqrt(Math.max(0, score) / 50)) + 1;
        if (level > 200) level = 200;
        return `Lv.${level}`;
    }
    
    return formatCompactNumber(score);
}

window.renderDynamicLeaderboardUI = function(playersList, tabType) {
    const podiumContainer = document.getElementById('leaderboard-podium-container');
    const listContainer = document.getElementById('leaderboard-list-' + tabType); 
    
    if (!podiumContainer || !listContainer) return;

    podiumContainer.innerHTML = '';
    listContainer.innerHTML = '';

    if (!playersList || playersList.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #a1a1aa; padding: 20px; width: 100%;">لا توجد بيانات حالياً في هذا التصنيف.</p>';
        return;
    }

    const podiumOrder = [
        { rank: 2, data: playersList[1] },
        { rank: 1, data: playersList[0] },
        { rank: 3, data: playersList[2] }
    ];

    podiumOrder.forEach(item => {
        if (!item.data) return; 
        
        const player = item.data;
        const card = document.createElement('div');
        card.className = `lb-podium-card rank-${item.rank}`;
        
        let frameOverlay = '';

        if (tabType === 'xp') {
            const proFrames = { 1: window.frameRank1, 2: window.frameRank2, 3: window.frameRank3 };
            let frameUrl = proFrames[item.rank];
            if (frameUrl) {
                frameOverlay = `
                    <div style="position: absolute; top: -22%; left: -22%; width: 144%; height: 144%;
                                background-image: url('${frameUrl}');
                                background-size: 100% 100%;
                                background-position: center;
                                background-repeat: no-repeat;
                                z-index: 5; pointer-events: none;">
                    </div>
                `;
            }
        }
        
        let overlayFrameSrc = player.equippedProfileFrame && PROFILE_FRAMES_DB[player.equippedProfileFrame] ? PROFILE_FRAMES_DB[player.equippedProfileFrame] : null;

        card.innerHTML = `
            <div class="lb-podium-badge badge-${item.rank}">${item.rank}</div>
            
            <div style="position: relative; width: ${item.rank === 1 ? '72px' : '62px'}; height: ${item.rank === 1 ? '72px' : '62px'}; margin-bottom: 12px; display: flex; align-items: center; justify-content: center;">
                <div class="lb-podium-avatar avatar-${item.rank}" style="width: 100%; height: 100%; margin: 0; position: relative; z-index: 1; background: transparent; overflow: visible; border: none; box-shadow: none;">
                    <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        <img src="${getSecureAvatarUrl(player.avatar)}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; position: relative; z-index: 1;">
                        ${overlayFrameSrc ? `<img src="${overlayFrameSrc}" onerror="this.style.display='none'" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 135%; height: 135%; z-index: 3; pointer-events: none; object-fit: contain; border-radius: 0; max-width: none; max-height: none;">` : ''}
                    </div>
                </div>
                ${frameOverlay}
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; margin-top: auto; width: 100%;">
                <div class="lb-podium-score-pill score-${item.rank}" style="margin-bottom: 5px; font-weight: 800; font-size: 13px;">${getFormattedLeaderboardScore(player, tabType)}</div>
                <div class="lb-podium-name" style="width: 100%; text-align: center; margin-bottom: 0;">${player.name || 'Guest'}</div>
            </div>
        `;
        
        card.onclick = function() { if(window.showPlayerProfileFromLB) window.showPlayerProfileFromLB(player); };
        card.style.cursor = 'pointer';

        podiumContainer.appendChild(card);
    });

    for (let i = 3; i < playersList.length; i++) {
        listContainer.appendChild(window.createLbItemHTML(i + 1, playersList[i], tabType));
    }
};

window.populateLeaderboards = function(winsData, xpData) {
    document.getElementById('leaderboard-list-wins').innerHTML = '';
    document.getElementById('leaderboard-list-xp').innerHTML = '';
    
    const activeTabBtn = document.querySelector('.lb-tab-button.active');
    let activeTabId = 'wins';
    if(activeTabBtn && activeTabBtn.id === 'lb-tab-xp') activeTabId = 'xp';

    window.lastFetchedWinsData = winsData;
    window.lastFetchedXpData = xpData;

    if(activeTabId === 'wins') {
        window.renderDynamicLeaderboardUI(winsData, 'wins');
    } else {
        window.renderDynamicLeaderboardUI(xpData, 'xp');
    }
};

window.showLeaderboard = function() {
    window.openAppModal('leaderboard-modal'); 
    const loadingText = window.t ? window.t('lb_loading') : 'جاري التحميل...';
    document.getElementById('leaderboard-list-wins').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    document.getElementById('leaderboard-list-xp').innerHTML = `<div style="text-align: center; color: #a1a1aa; padding: 20px;">${loadingText}</div>`;
    if(window.socket && window.socket.connected) window.socket.emit('getLeaderboard');
};

window.switchLbTab = function(tabId) {
    document.getElementById('lb-tab-wins').classList.remove('active'); 
    document.getElementById('lb-tab-xp').classList.remove('active');
    
    document.getElementById('leaderboard-list-wins').style.display = 'none'; 
    document.getElementById('leaderboard-list-xp').style.display = 'none'; 
    
    document.getElementById('lb-tab-' + tabId).classList.add('active'); 
    document.getElementById('leaderboard-list-' + tabId).style.display = 'flex';

    document.getElementById('leaderboard-podium-container').innerHTML = '';

    if (tabId === 'wins' && window.lastFetchedWinsData) {
        window.renderDynamicLeaderboardUI(window.lastFetchedWinsData, 'wins');
    } else if (tabId === 'xp' && window.lastFetchedXpData) {
        window.renderDynamicLeaderboardUI(window.lastFetchedXpData, 'xp');
    }
};

window.showEquipNotification = function(itemType) {
    const toast = document.getElementById('toast-notification'); if (!toast) return;
    let msg = window.t ? window.t('toast_default') : "تم تجهيز العنصر بنجاح";
    if (itemType === 'bg') msg = window.t ? window.t('toast_bg') : "تم تغيير الساحة بنجاح";
    else if (itemType === 'fr') msg = window.t ? window.t('toast_fr') : "تم تغيير الإطار بنجاح";
    else if (itemType === 'pc') msg = window.t ? window.t('toast_pc') : "تم تغيير الحجر بنجاح";
    else if (itemType === 'score') msg = window.t ? window.t('toast_score') : "تم تغيير شكل الشريط بنجاح";
    toast.textContent = '✨ ' + msg; toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); }, 2500);

    setTimeout(() => {
        try {
            let profStr = localStorage.getItem('hub_user_profile');
            if (profStr) {
                let prof = JSON.parse(profStr);
                if (!gameState.isOnlineMode) {
                    if (typeof window.applyTheme === 'function') window.applyTheme(prof);
                    if (window.ui && typeof window.ui.renderBoard === 'function') window.ui.renderBoard(true);
                }
            }
        } catch(e) {}
    }, 50);
};

window.triggerCustomAlertNotification = function(msg) {
    if (typeof ui.showCustomAlert === 'function') { ui.showCustomAlert(msg); } else {
        const alertModal = document.getElementById('custom-alert-modal'); const alertMsg = document.getElementById('custom-alert-message'); const alertOk = document.getElementById('custom-alert-ok'); const alertCancel = document.getElementById('custom-alert-cancel');
        if (alertModal && alertMsg && alertOk) { document.getElementById('custom-alert-title').textContent = window.t ? window.t('alert_store') : 'إشعار المتجر'; alertMsg.textContent = msg; if(alertCancel) alertCancel.style.display = 'none'; window.openAppModal('custom-alert-modal'); alertOk.onclick = () => window.closeAppModal('custom-alert-modal'); } else { alert(msg); }
    }
};

window.currentLang = 'ar';
window.updateHtmlTexts = function() {
    if (!window.t) return;
    const setTxt = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = window.t(key); };
    setTxt('menu-title-text', 'menu_title'); 
    setTxt('menu-bag-text', 'menu_bag'); 
    setTxt('menu-radio-text', 'menu_radio'); 
    setTxt('menu-room-text', 'menu_room'); 
    setTxt('menu-leaderboard-text', 'menu_leaderboard'); 
    setTxt('menu-settings-text', 'menu_settings'); 
    setTxt('menu-exit-text', 'menu_exit'); 
    
    const lbTitle = document.getElementById('lb-title-text');
    if(lbTitle) lbTitle.textContent = "لوحة الشرف";
    const lbWins = document.getElementById('lb-tab-wins');
    if(lbWins) lbWins.textContent = "فوز";
    const lbXp = document.getElementById('lb-tab-xp');
    if(lbXp) lbXp.textContent = "مستوى";

    setTxt('tutorial-mode-label', 'tutorial_mode'); 
    setTxt('menu-quests-text', 'menu_quests');
    if (document.getElementById('matchmaking-modal').style.display === 'flex') setTxt('mm-status-label', 'searching');
};

window.toggleRadioMusic = function() {
    const dot = document.getElementById('dama-radio-status'); let isActive = false;
    if (dot) { isActive = dot.classList.toggle('active'); }
    if (isActive) { window.parent.postMessage({ type: 'PLAY_RADIO' }, '*'); } else { window.parent.postMessage({ type: 'STOP_RADIO' }, '*'); }
};

window.syncRadioStatusDot = function() { 
    const statusDot = document.getElementById('dama-radio-status'); 
    if (statusDot) { 
        const isPlaying = localStorage.getItem('hub_music_enabled') === 'true'; 
        if (isPlaying) statusDot.classList.add('active'); else statusDot.classList.remove('active'); 
    } 
};

window.addEventListener('storage', (e) => {
    if (e.key === 'hub_music_enabled') { window.syncRadioStatusDot(); }
    if (e.key === 'hub_user_profile') { forceLockedGlobalAvatar(); }
});

// ==========================================
// 🌟 دوال التفاعلات للأزرار والاستماع (Event Listeners)
// ==========================================
function hasPlayerMoved() {
    if (!gameState.boardHistory) return false;
    if (gameState.playerColor === 'white') { return gameState.boardHistory.length > 1; } 
    else { return gameState.boardHistory.length > 2; }
}

ui.onClick('reset-btn', () => {
    if (gameState.isSpectator) {
        if (window.socketManager && typeof window.socketManager.handleExitGame === 'function') {
            window.socketManager.handleExitGame();
        }
        return;
    }

    if (window.isMatchRunning && !gameState.isOnlineMode && !gameState.isGameOver) {
        if (hasPlayerMoved()) {
            ui.showCustomAlert(
                t('new_game_warn'),
                t('alert_title'),
                () => { 
                    if (!gameState.isTutorialMode && gameState.userProfile) {
                        ui.updateProfileUI();
                        if (window.parent) window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
                    }
                    ui.drawEmptyBoard();
                    if (typeof window.openAppModal === 'function') window.openAppModal('new-game-modal');
                },
                true, t('btn_cancel'), t('resign')
            );
        } else {
            if (typeof window.openAppModal === 'function') window.openAppModal('new-game-modal');
        }
    } else {
        if (typeof window.openAppModal === 'function') window.openAppModal('new-game-modal');
    }
});

ui.onClick('resign-btn', () => {
    if (gameState.isOnlineMode) {
        ui.showCustomAlert(
            t('resign_confirm'), t('alert_title'),
            () => { if (socketManager && typeof socketManager.sendSurrender === 'function') { socketManager.sendSurrender(); } },
            true, t('btn_cancel'), t('alert_ok')
        );
    } else {
        if (!hasPlayerMoved()) {
            ui.showCustomAlert(t('confirm_exit_msg'), t('confirm_exit_title'), () => { ui.drawEmptyBoard(); }, true, t('btn_cancel'), t('alert_ok'));
        } else {
            ui.showCustomAlert(
                t('resign_loss_confirm'), t('alert_title'),
                () => { let opponentColor = gameState.playerColor === 'white' ? 'black' : 'white'; ui.showResultsModal(opponentColor); },
                true, t('btn_cancel'), t('alert_ok')
            );
        }
    }
});

ui.onClick('undo-btn', () => {
    if (gameState.isOnlineMode || gameState.currentTurn !== gameState.playerColor) return; 
    if (!gameState.boardHistory || gameState.boardHistory.length <= 1) return;

    gameState.gameId = Date.now();
    if (gameState.aiTimeout) { clearTimeout(gameState.aiTimeout); gameState.aiTimeout = null; }

    gameState.boardHistory.pop();
    if (gameState.boardHistoryStr && gameState.boardHistoryStr.length > 0) gameState.boardHistoryStr.pop();

    while (gameState.boardHistory.length > 1 && gameState.boardHistory[gameState.boardHistory.length - 1].turn !== gameState.playerColor) {
        gameState.boardHistory.pop();
        if (gameState.boardHistoryStr && gameState.boardHistoryStr.length > 0) gameState.boardHistoryStr.pop();
    }

    let prevState = gameState.boardHistory[gameState.boardHistory.length - 1];
    if (prevState) {
        gameState.virtualBoard = prevState.board.map(row => [...row]); 
        gameState.currentTurn = prevState.turn;
        
        ui.clearHighlights(); 
        const boardElUndo = document.getElementById('board');
        if (boardElUndo) {
            const lastMoves = boardElUndo.getElementsByClassName('last-move');
            while (lastMoves.length > 0) lastMoves[0].classList.remove('last-move');
        }

        if (gameState.selectedPiece) { gameState.selectedPiece.classList.remove('selected'); gameState.selectedPiece = null; }
        gameState.isMultiJumping = false; gameState.jumpsCount = 0; gameState.requiredJumps = 0;
        
        ui.renderBoard(); ui.playSound(ui.sfx.move); ui.startTurn();
    }
});

ui.onClick('hint-btn', () => { hintSystem.requestHint(); });

ui.onClick('match-gift-btn-p2', () => {
    if (gameState.isSpectator) {
        window.openGiftPanel(); 
    } else {
        let targetId = window.matchPlayer2Id || window.currentOpponentId;
        if (targetId) {
            window.openGiftPanel(targetId);
        } else {
            const toast = document.getElementById('toast-notification');
            if (toast) { 
                toast.textContent = `⚠️ لا يمكن تحديد الخصم حالياً`; 
                toast.classList.add('show'); 
                setTimeout(() => toast.classList.remove('show'), 2500); 
            }
        }
    }
});

ui.onClick('match-gift-btn-p1', () => {
    let targetId = window.matchPlayer1Id;
    if (targetId) {
        window.openGiftPanel(targetId);
    }
});


ui.onClick('creator-update-bet-btn', () => {
    const roomIdEl = document.getElementById('creator-target-room-id');
    const newBetEl = document.getElementById('edit-room-bet-input');
    
    if (roomIdEl && newBetEl && typeof socket !== 'undefined' && socket.connected) {
        const roomId = roomIdEl.value;
        const newBet = parseInt(newBetEl.value) || 0;
        socket.emit('updateRoomBet', { roomID: roomId, newBet: newBet });
        
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('creator-room-settings-modal');
        }
    }
});

ui.onClick('creator-cancel-room-btn', () => {
    const roomIdEl = document.getElementById('creator-target-room-id');
    if (roomIdEl) {
        window.deleteMyRoom(roomIdEl.value);
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('creator-room-settings-modal');
        }
    }
});

window.ui = ui;
window.updateUITranslations = () => { if (typeof window.updateHtmlTexts === 'function') window.updateHtmlTexts(); };

// 🛡️ 1. حماية قصوى: منع التدخل إذا كنت مشاهداً، أو اللعبة منتهية
ui.onClick('board', e => {
    if (gameState.isSpectator || !gameState.isGameActive) return;

    // 🛡️ 2. تحديد لونك الفعلي بثقة (سواء كنت تلعب أونلاين أو ضد البوت)
    const myActualColor = gameState.isOnlineMode ? gameState.myOnlineColor : gameState.playerColor;

    // 🛡️ 3. قفل الدور: منع اللمس نهائياً إذا لم يكن دورك
    if (gameState.currentTurn !== myActualColor) return;
    
    const target = e.target;
    const cell = target.classList.contains('cell') ? target : target.parentElement;

    // في حالة اختيار حجر جديد (وليس أثناء القفز المتعدد الإجباري)
    if (target.classList.contains('piece') && !gameState.isMultiJumping) {
        
        // 🛡️ 4. قفل اللون: منع تحديد أي حجر لا يطابق لونك قطعياً!
        const clickedColor = target.classList.contains('white') ? 'white' : 'black';
        if (clickedColor !== myActualColor) return;

        const r = parseInt(cell.dataset.row), c = parseInt(cell.dataset.col);
        
        // التحقق من الأكل الإجباري
        if (gameState.requiredJumps > 0 && getPieceMaxJumps(r, c, gameState.currentTurn, gameState.virtualBoard) < gameState.requiredJumps) return;
        
        gameState.moveSequenceStartR = null; gameState.moveSequenceStartC = null; gameState.movePath = []; 
        
        if (gameState.selectedPiece) gameState.selectedPiece.classList.remove('selected');
        gameState.selectedPiece = target; gameState.selectedPiece.classList.add('selected');
        
        if (gameState.currentTurn !== gameState.playerColor && !gameState.isOnlineMode) { gameState.opponentStartRow = r; gameState.opponentStartCol = c; }
        ui.showValidMovesHighlights(r, c); return;
    }

    if (gameState.selectedPiece && cell.classList.contains('cell') && cell.children.length === 0) {
        const fromRow = parseInt(gameState.selectedPiece.parentElement.dataset.row);
        const fromCol = parseInt(gameState.selectedPiece.parentElement.dataset.col);
        const toRow = parseInt(cell.dataset.row); const toCol = parseInt(cell.dataset.col);
        const rDiff = toRow - fromRow; const cDiff = toCol - fromCol;
        const isDama = gameState.selectedPiece.classList.contains('dama');
        const pieceColor = gameState.selectedPiece.classList.contains('white') ? 'white' : 'black';

        if (gameState.moveSequenceStartR === undefined || gameState.moveSequenceStartR === null) {
            gameState.moveSequenceStartR = fromRow; gameState.moveSequenceStartC = fromCol; gameState.movePath = [{r: fromRow, c: fromCol}];
        }

        if (gameState.requiredJumps > 0) {
            let isValidJump = false, midRow = -1, midCol = -1, currDr = Math.sign(rDiff), currDc = Math.sign(cDiff);
            
            let moves = (gameState.isMultiJumping)
                ? gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard, fromRow, fromCol, gameState.lastJumpDir.dr, gameState.lastJumpDir.dc)
                : gameEngine.generateAllTurnMoves(gameState.currentTurn, gameState.virtualBoard);

            let validStep = moves.map(p => p[0]).find(s => s && s.fromR === fromRow && s.fromC === fromCol && s.toR === toRow && s.toC === toCol && s.midR !== null);

            if (validStep) {
                isValidJump = true;
                midRow = validStep.midR;
                midCol = validStep.midC;
            }

            if (isValidJump) {
                let tempBoard = gameState.virtualBoard.map(row => [...row]); 
                let movingPieceStr = tempBoard[fromRow][fromCol];

                tempBoard[midRow][midCol] = null; tempBoard[toRow][toCol] = movingPieceStr; tempBoard[fromRow][fromCol] = null;
                gameState.movePath.push({r: toRow, c: toCol}); 

                if (1 + getPieceMaxJumps(toRow, toCol, gameState.currentTurn, tempBoard, currDr, currDc) === gameState.requiredJumps - gameState.jumpsCount) {
                    if (typeof ui.playSound === 'function') { ui.playSound(gameState.virtualBoard[midRow][midCol]?.includes('dama') ? ui.sfx.kingDied : ui.sfx.piecesDied); }
                    
                    gameState.virtualBoard = tempBoard; gameState.jumpsCount++; gameState.lastJumpDir = { dr: currDr, dc: currDc };
                    if (window.questsManager) { window.questsManager.updateProgress('capture', 1, gameState.isOnlineMode ? 'online' : 'bot'); }

                    let isFinalJump = (gameState.jumpsCount === gameState.requiredJumps);

                    if (isFinalJump) {
                        let promoRow = gameState.pieceDirection[pieceColor] === 1 ? 7 : 0;
                        if (toRow === promoRow && !movingPieceStr.includes('dama')) { 
                            gameState.virtualBoard[toRow][toCol] += '-dama'; 
                            if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.kingCreated); 
                        }
                        
                        gameState.movesWithoutProgress = 0; 
                        gameState.boardHistoryStr = [];
                        gameState.pieceHistories = {}; 
                        
                        ui.highlightMove({r: gameState.moveSequenceStartR, c: gameState.moveSequenceStartC}, {r: toRow, c: toCol});
                        gameState.selectedPiece = null; ui.clearHighlights();
                        gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
                        
                        ui.renderBoard();

                        if (socketManager && typeof socketManager.sendMoveToServer === 'function') {
                            socketManager.sendMoveToServer(
                                gameState.moveSequenceStartR, gameState.moveSequenceStartC, 
                                toRow, toCol, gameState.movePath, gameState.currentTurn
                            );
                        }
                        
                        saveGameState(); ui.startTurn();
                        gameState.moveSequenceStartR = null; gameState.moveSequenceStartC = null; gameState.movePath = [];
                    } else { 
                        gameState.isMultiJumping = true; ui.renderBoard();
                        const boardEl = document.getElementById('board');
                        const newCell = boardEl.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
                        if (newCell && newCell.children.length > 0) { gameState.selectedPiece = newCell.children[0]; gameState.selectedPiece.classList.add('selected'); }

                        if (!gameState.isOnlineMode) {
                            if (!gameState.boardHistory) gameState.boardHistory = [];
                            gameState.boardHistory.push({ 
                                board: gameState.virtualBoard.map(row => [...row]), 
                                turn: gameState.currentTurn,
                                moves: gameState.movesWithoutProgress
                            });
                            if (gameState.boardHistory.length > 6) gameState.boardHistory.shift();
                        }
                        ui.showValidMovesHighlights(toRow, toCol); 
                    }
                } else { ui.showCustomAlert(t('must_capture')); }
            }
        } 
        else {
            if (isMoveValid(fromRow, fromCol, toRow, toCol, gameState.currentTurn, gameState.virtualBoard, isDama)) {
                
                let movingPieceStr = gameState.virtualBoard[fromRow][fromCol];
                gameState.virtualBoard[fromRow][fromCol] = null; gameState.virtualBoard[toRow][toCol] = movingPieceStr;
                gameState.movePath.push({r: toRow, c: toCol}); 
                
                let promoRow = gameState.pieceDirection[pieceColor] === 1 ? 7 : 0;
                let isPromotion = false;
                
                if (toRow === promoRow && !movingPieceStr.includes('dama')) { 
                    gameState.virtualBoard[toRow][toCol] += '-dama'; isPromotion = true;
                    if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.kingCreated); 
                }
                
                if (isPromotion) {
                    gameState.movesWithoutProgress = 0;
                    gameState.boardHistoryStr = [];
                    gameState.pieceHistories = {}; 
                } else {
                    gameState.movesWithoutProgress++;
                    gameState.boardHistoryStr.push(JSON.stringify(gameState.virtualBoard));
                    if (gameEngine.trackPieceHistory) gameEngine.trackPieceHistory(fromRow, fromCol, toRow, toCol, gameState.currentTurn); 
                }
                
                if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.move); 
                ui.highlightMove({r: fromRow, c: fromCol}, {r: toRow, c: toCol});
                gameState.selectedPiece = null; ui.clearHighlights();
                gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
                
                ui.renderBoard();

                if (socketManager && typeof socketManager.sendMoveToServer === 'function') {
                    socketManager.sendMoveToServer(
                        fromRow, fromCol, 
                        toRow, toCol, gameState.movePath, gameState.currentTurn
                    ); 
                }
                
                saveGameState(); ui.startTurn();
                gameState.moveSequenceStartR = null; gameState.moveSequenceStartC = null; gameState.movePath = [];
            }
        }
    }
});

document.addEventListener('click', (e) => {
    let target = e.target;
    while (target && target !== document) {
        if (target.id && ui.clickHandlers.has(target.id)) { ui.clickHandlers.get(target.id)(e); return; }
        target = target.parentNode;
    }

    const actionElement = e.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const fId = (actionElement.dataset.fid || "").toUpperCase(); 

        if (action === 'challenge-friend') {
            if (typeof window.challengeFriend === 'function') { window.challengeFriend(fId); } 
            else { ui.showCustomAlert(t('coming_soon')); }
        } else if (action === 'remove-friend') {
            let currentFriends = gameState.userProfile.friends || [];
            gameState.userProfile.friends = currentFriends.filter(f => (typeof f === 'string' ? f.toUpperCase() !== fId : f.id.toUpperCase() !== fId)); 
            
            let profileToSave = { ...gameState.userProfile };
            if (gameState.originalHints !== undefined && gameState.originalHints !== null) { profileToSave.hints = gameState.originalHints; }
            localStorage.setItem('hub_user_profile', JSON.stringify(profileToSave)); 
            ui.updateProfileUI();

            if (window.socket && window.socket.connected) {
                window.socket.emit('syncProfile', { id: profileToSave.id, friends: profileToSave.friends });
            }
            
            const toast = document.getElementById('toast-notification'); 
            if (toast) { toast.textContent = '🗑️ تم حذف الصديق'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
        }
    }
});

const isMoveValid = (fromR, fromC, toR, toC, color, board, isDama) => {
    let moves = gameEngine.generateAllTurnMoves(color, board);
    return moves.some(path =>
        path.length === 1 &&
        path[0].fromR === fromR &&
        path[0].fromC === fromC &&
        path[0].toR === toR &&
        path[0].toC === toC &&
        path[0].midR === null 
    );
};

if (!document.getElementById('forced-overlay-style')) {
    const forcedStyle = document.createElement('style'); forcedStyle.id = 'forced-overlay-style';
    forcedStyle.innerHTML = `
        .cell:has(.piece.multi-choice), .cell.multi-choice-cell { position: relative !important; border: 2px solid #ff453a !important; border-radius: inherit; }
        .cell:has(.piece.multi-choice)::after, .cell.multi-choice-cell::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; box-shadow: inset 0 0 20px rgba(255, 69, 58, 0.8); border-radius: inherit; pointer-events: none; animation: gpuPulse 1s infinite alternate ease-in-out; will-change: opacity; }
        @keyframes gpuPulse { 0% { opacity: 0.3; } 100% { opacity: 1; } }
        .cell:has(.piece.multi-choice) .piece, .cell.multi-choice-cell .piece { z-index: 2 !important; position: relative !important; transform: scale(1.08) translateZ(0) !important; will-change: transform; transition: transform 0.2s ease; }
    `;
    document.head.appendChild(forcedStyle);
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PROFILE_UPDATED') {
        const profile = event.data.profile;
        if (profile) {
            if (!gameState.userProfile) gameState.userProfile = {};
            Object.assign(gameState.userProfile, profile);

            if (typeof window.applyProfileDataToUI === 'function') {
                window.applyProfileDataToUI(profile);
            }
            if (window.ui && typeof window.ui.updateProfileUI === 'function') {
                window.ui.updateProfileUI(); 
            }

            if (!gameState.isOnlineMode) {
                if (typeof window.applyTheme === 'function') {
                    window.applyTheme(profile);
                }
                if (window.ui && typeof window.ui.renderBoard === 'function') {
                    window.ui.renderBoard(true);
                }
            }

            if (window.storeManager && typeof window.storeManager.renderUI === 'function') {
                window.storeManager.renderUI();
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let globalProfile = localStorage.getItem('hub_user_profile'); 
    let initialAvatar = '1000132081.webp';
    let userObj = { id: '#00000', name: t('badge_you') || 'أنت', avatar: initialAvatar, games: 0, wins: 0, losses: 0, tokens: 0, discountTicket: 0, currentStreak: 0, highestStreak: 0 };
    
    if (globalProfile) { 
        try { 
            const parsed = JSON.parse(globalProfile); 
            userObj = { ...userObj, ...parsed };
            if (parsed.avatar) userObj.avatar = parsed.avatar;
        } catch(e) {} 
    }

    gameState.userProfile = userObj;

    if (typeof window.applyTheme === 'function') {
        window.applyTheme(userObj);
    }

    ui.drawEmptyBoard();

    setTimeout(() => {
        if (typeof window.applyProfileDataToUI === 'function') { 
            window.applyProfileDataToUI(userObj); 
        }
        
        if (window.ui && typeof window.ui.updateProfileUI === 'function') {
            window.ui.updateProfileUI();
        }

        if (typeof window.syncRadioStatusDot === 'function') {
            window.syncRadioStatusDot();
        }
        
    }, 500); 
});

// ✅ دالة تأكيد رهان المشاهد المدمجة بنجاح
window.confirmSpectatorBet = function() {
    const roomId = document.getElementById('spectator-bet-room-id')?.value || (window.gameState && window.gameState.onlineRoomID);
    const color = document.getElementById('spectator-bet-color')?.value;
    const amount = parseInt(document.getElementById('spectator-bet-amount')?.value) || 0;

    if (!roomId) {
        if (typeof ui.showCustomAlert === 'function') ui.showCustomAlert("خطأ في تحديد الغرفة للمراهنة!");
        return;
    }
    if (!color) {
        if (typeof ui.showCustomAlert === 'function') ui.showCustomAlert("الرجاء اختيار اللاعب المتوقع فوزه أولاً (أبيض أو أسود)!");
        return;
    }
    if (amount <= 0) {
        if (typeof ui.showCustomAlert === 'function') ui.showCustomAlert("الرجاء تحديد مبلغ الرهان!");
        return;
    }

    if (window.socket && window.socket.connected) {
        const profile = (window.gameState && window.gameState.userProfile) ? window.gameState.userProfile : JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
        
        window.socket.emit('placeSpectatorBet', {
            roomID: String(roomId).trim(),
            color: color,
            amount: amount,
            guestId: profile.id
        });
        
        if (typeof window.closeAppModal === 'function') {
            window.closeAppModal('spectator-bet-modal');
        }
    } else {
        if (typeof ui.showCustomAlert === 'function') ui.showCustomAlert("يرجى الاتصال بالإنترنت أولاً!");
    }
};
