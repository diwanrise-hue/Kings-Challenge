// ==========================================
// ملف: dailyQuests.js
// إدارة المهام اليومية والأسبوعية وجوائزها
// المتوافق مع الـ Clean Architecture
// ==========================================
import { ui } from './uiController.js';
import { gameState } from './gameState.js';
import { socket } from './socketManager.js';

export const questsManager = {
    // 7 مهام يومية
    dailyQuests: [
        { id: 'd1', type: 'play', target: 3, rewardTokens: 50, desc: 'العب 3 مباريات' },
        { id: 'd2', type: 'win', target: 2, rewardTokens: 80, desc: 'فز في مباراتين' },
        { id: 'd3', type: 'capture', target: 15, rewardTokens: 60, desc: 'كُل 15 قطعة للخصم' },
        { id: 'd4', type: 'spin', target: 1, rewardTokens: 30, desc: 'استخدم عجلة الحظ مرة واحدة' },
        { id: 'd5', type: 'play', target: 5, rewardTokens: 100, desc: 'العب 5 مباريات' },
        { id: 'd6', type: 'win', target: 4, rewardTokens: 150, desc: 'فز في 4 مباريات' },
        { id: 'd7', type: 'capture', target: 30, rewardTokens: 120, desc: 'كُل 30 قطعة للخصم' }
    ],
    // 10 مهام أسبوعية
    weeklyQuests: [
        { id: 'w1', type: 'play', target: 20, rewardTokens: 300, desc: 'العب 20 مباراة (أسبوعياً)' },
        { id: 'w2', type: 'win', target: 10, rewardTokens: 500, desc: 'فز في 10 مباريات' },
        { id: 'w3', type: 'spin', target: 7, rewardTokens: 200, desc: 'استخدم عجلة الحظ 7 مرات' },
        { id: 'w4', type: 'capture', target: 100, rewardTokens: 400, desc: 'كُل 100 قطعة للخصم' },
        { id: 'w5', type: 'play', target: 50, rewardTokens: 600, desc: 'العب 50 مباراة' },
        { id: 'w6', type: 'win', target: 25, rewardTokens: 800, desc: 'فز في 25 مباراة' },
        { id: 'w7', type: 'capture', target: 200, rewardTokens: 700, desc: 'كُل 200 قطعة للخصم' },
        { id: 'w8', type: 'spin', target: 15, rewardTokens: 400, desc: 'استخدم عجلة الحظ 15 مرة' },
        { id: 'w9', type: 'play', target: 100, rewardTokens: 1000, desc: 'العب 100 مباراة' },
        { id: 'w10', type: 'win', target: 50, rewardTokens: 1500, desc: 'فز في 50 مباراة' }
    ],
    progress: { daily: {}, weekly: {} },
    lastReset: { daily: 0, weekly: 0 },
    currentTab: 'daily',

    init() {
        this.loadProgress();
        this.checkResets();
        this.renderQuests('daily');
        this.renderQuests('weekly');
        
        setInterval(() => this.updateTimerDisplay(), 1000);
        window.questsManager = this;
    },

    loadProgress() {
        let saved = localStorage.getItem('hub_quests_data');
        if (saved) {
            try {
                let parsed = JSON.parse(saved);
                this.progress = parsed.progress || { daily: {}, weekly: {} };
                if (!this.progress.daily) this.progress.daily = {};
                if (!this.progress.weekly) this.progress.weekly = {};
                
                this.lastReset = parsed.lastReset || { daily: Date.now(), weekly: Date.now() };
            } catch(e) {
                this.resetAll('daily');
                this.resetAll('weekly');
            }
        } else {
            this.resetAll('daily');
            this.resetAll('weekly');
        }
    },

    saveProgress() {
        localStorage.setItem('hub_quests_data', JSON.stringify({
            progress: this.progress,
            lastReset: this.lastReset
        }));
    },

    checkResets() {
        let now = Date.now();
        let dayMs = 24 * 60 * 60 * 1000;
        let weekMs = 7 * dayMs;

        if (now - this.lastReset.daily > dayMs) this.resetAll('daily');
        if (now - this.lastReset.weekly > weekMs) this.resetAll('weekly');
    },

    resetAll(period) {
        this.progress[period] = {};
        this.lastReset[period] = Date.now();
        this.saveProgress();
        this.renderQuests(period);
    },

    updateProgress(type, amount = 1) {
        this.checkResets();
        let updated = false;

        ['daily', 'weekly'].forEach(period => {
            let quests = this[period + 'Quests'];
            quests.forEach(q => {
                if (q.type === type) {
                    if (!this.progress[period]) this.progress[period] = {};
                    if (!this.progress[period][q.id]) this.progress[period][q.id] = { current: 0, claimed: false };
                    
                    if (this.progress[period][q.id].current < q.target && !this.progress[period][q.id].claimed) {
                        this.progress[period][q.id].current += amount;
                        if (this.progress[period][q.id].current > q.target) this.progress[period][q.id].current = q.target;
                        updated = true;
                    }
                }
            });
        });

        if (updated) {
            this.saveProgress();
            this.renderQuests('daily');
            this.renderQuests('weekly');
        }
    },

    // 💡 دالة إظهار علامة (الصح) على أيقونة المهام الخارجية
    updateNotificationBadge() {
        let hasClaimable = false;
        ['daily', 'weekly'].forEach(period => {
            let quests = this[period + 'Quests'];
            quests.forEach(q => {
                let prog = this.progress[period] && this.progress[period][q.id];
                if (prog && prog.current >= q.target && !prog.claimed) {
                    hasClaimable = true;
                }
            });
        });

        let badge = document.getElementById('quests-notify-badge');
        if (badge) {
            badge.style.display = hasClaimable ? 'flex' : 'none';
        }
    },

    // 💡 دالة جمع كل الجوائز المكتملة في التبويب الحالي
    claimAllRewards(period) {
        let totalReward = 0;
        let quests = this[period + 'Quests'];
        let updated = false;

        quests.forEach(q => {
            let prog = this.progress[period] && this.progress[period][q.id];
            if (prog && prog.current >= q.target && !prog.claimed) {
                prog.claimed = true;
                totalReward += q.rewardTokens;
                updated = true;
            }
        });

        if (updated) {
            this.saveProgress();
            
            if (gameState.isOnlineMode && socket && socket.connected) {
                socket.emit('claimQuestReward', { questId: 'ALL_' + period, tokens: totalReward });
            } else {
                let profile = gameState.userProfile || JSON.parse(localStorage.getItem('hub_user_profile'));
                if (profile) {
                    profile.tokens = (profile.tokens || 0) + totalReward;
                    gameState.userProfile = profile; 
                    localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                    if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
                }
            }
            
            if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.win);
            if (typeof ui.showCustomAlert === 'function') ui.showCustomAlert(`تم جمع ${totalReward} 🪙 بنجاح!`, "تهانينا 🎉");
            this.renderQuests(period);
        }
    },

    claimReward(period, questId) {
        let q = this[period + 'Quests'].find(x => x.id === questId);
        if (!q) return;

        if (this.progress[period] && this.progress[period][questId] && this.progress[period][questId].current >= q.target && !this.progress[period][questId].claimed) {
            this.progress[period][questId].claimed = true;
            this.saveProgress();
            
            if (gameState.isOnlineMode && socket && socket.connected) {
                socket.emit('claimQuestReward', { questId: questId, tokens: q.rewardTokens });
            } else {
                let profile = gameState.userProfile || JSON.parse(localStorage.getItem('hub_user_profile'));
                if (profile) {
                    profile.tokens = (profile.tokens || 0) + q.rewardTokens;
                    gameState.userProfile = profile; 
                    localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                    if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
                }
            }
            
            if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.win);
            this.renderQuests(period);
        }
    },

    renderQuests(period) {
        let container = document.getElementById(`quests-list-container-${period}`);
        if (!container) return;
        container.innerHTML = '';

        if (!this.progress[period]) {
            this.progress[period] = {};
        }

        let quests = this[period + 'Quests'];
        let hasClaimableInCurrentTab = false; // 💡 للتحقق من وجود مهام لجمعها
        
        quests.forEach(q => {
            let prog = this.progress[period][q.id] || { current: 0, claimed: false };
            let isCompleted = prog.current >= q.target;
            
            if (isCompleted && !prog.claimed) {
                hasClaimableInCurrentTab = true;
            }

            let el = document.createElement('div');
            el.style.cssText = "background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 15px; display: flex; flex-direction: column; gap: 10px; position: relative;";
            
            let header = document.createElement('div');
            header.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
            
            let title = document.createElement('span');
            title.style.cssText = "color: white; font-size: 14px; font-weight: 700;";
            title.innerText = q.desc;
            
            let reward = document.createElement('span');
            reward.style.cssText = "color: #f5a623; font-size: 13px; font-weight: 800; background: rgba(245, 166, 35, 0.15); padding: 4px 10px; border-radius: 50px;";
            reward.innerText = `+${q.rewardTokens} 🪙`;

            header.appendChild(title);
            header.appendChild(reward);

            let barContainer = document.createElement('div');
            barContainer.style.cssText = "width: 100%; height: 8px; background: rgba(0,0,0,0.5); border-radius: 10px; overflow: hidden; margin-top: 5px;";
            
            let pct = Math.min(100, (prog.current / q.target) * 100);
            let barFill = document.createElement('div');
            barFill.style.cssText = `height: 100%; background: ${isCompleted ? '#34c759' : '#3498db'}; width: ${pct}%; transition: width 0.3s;`;
            barContainer.appendChild(barFill);

            let footer = document.createElement('div');
            footer.style.cssText = "display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #a1a1aa; font-weight: 600;";
            footer.innerText = `${prog.current} / ${q.target}`;

            if (isCompleted && !prog.claimed) {
                let btn = document.createElement('button');
                btn.innerText = "استلام";
                btn.style.cssText = "background: #34c759; color: white; border: none; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;";
                btn.onclick = () => this.claimReward(period, q.id);
                footer.innerHTML = '';
                footer.appendChild(btn);
            } else if (prog.claimed) {
                footer.innerText = "✅ تم الاستلام";
                footer.style.color = "#34c759";
                el.style.opacity = "0.6";
            }

            el.appendChild(header);
            el.appendChild(barContainer);
            el.appendChild(footer);
            container.appendChild(el);
        });

        // 💡 إظهار أو إخفاء زر "جمع الكل" بناءً على حالة المهام في التبويب الحالي
        if (period === this.currentTab) {
            let collectAllBtn = document.getElementById('collect-all-btn');
            if (collectAllBtn) {
                collectAllBtn.style.display = hasClaimableInCurrentTab ? 'flex' : 'none';
            }
        }
        
        // 💡 تحديث علامة الصح الخارجية
        this.updateNotificationBadge();
    },

    updateTimerDisplay() {
        let timerEl = document.getElementById('quests-reset-timer');
        if (!timerEl) return;

        let period = this.currentTab || 'daily';
        let now = Date.now();
        let limitMs = period === 'daily' ? (24 * 60 * 60 * 1000) : (7 * 24 * 60 * 60 * 1000);
        
        let timeLeft = limitMs - (now - this.lastReset[period]);
        if (timeLeft < 0) {
            this.checkResets();
            return;
        }

        let d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        let h = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        let s = Math.floor((timeLeft % (1000 * 60)) / 1000);

        let timeStr = period === 'weekly' 
            ? `${d} أيام و ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        timerEl.innerText = `تتجدد المهام بعد: ${timeStr}`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    questsManager.init();
});
