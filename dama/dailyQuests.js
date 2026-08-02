// dailyQuests.js
import { ui } from './uiController.js';
import { gameState } from './gameState.js';
import { socket } from './socketManager.js';

export const questsManager = {
    dailyQuests: [
        { id: 'd1', type: 'play', target: 3, rewardTokens: 50, desc: 'العب 3 مباريات' },
        { id: 'd2', type: 'win', target: 2, rewardTokens: 80, desc: 'فز في مباراتين' },
        { id: 'd3', type: 'capture', target: 15, rewardTokens: 60, desc: 'كُل 15 قطعة للخصم' }
    ],
    weeklyQuests: [
        { id: 'w1', type: 'play', target: 20, rewardTokens: 300, desc: 'العب 20 مباراة (أسبوعياً)' },
        { id: 'w2', type: 'win', target: 10, rewardTokens: 500, desc: 'فز في 10 مباريات' },
        { id: 'w3', type: 'spin', target: 7, rewardTokens: 200, desc: 'استخدم عجلة الحظ 7 مرات' }
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
                this.progress = parsed.progress || {};
                // التأكد من وجود كائنات daily و weekly لمنع حدوث undefined
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
        if (!this.progress) this.progress = { daily: {}, weekly: {} };
        this.progress[period] = {};
        this.lastReset[period] = Date.now();
        this.saveProgress();
        this.renderQuests(period);
    },

    updateProgress(type, amount = 1) {
        this.checkResets();
        let updated = false;

        ['daily', 'weekly'].forEach(period => {
            if (!this.progress[period]) this.progress[period] = {};
            let quests = this[period + 'Quests'];
            quests.forEach(q => {
                if (q.type === type) {
                    if (!this.progress[period][q.id]) {
                        this.progress[period][q.id] = { current: 0, claimed: false };
                    }
                    let prog = this.progress[period][q.id];
                    if (prog.current < q.target && !prog.claimed) {
                        prog.current += amount;
                        if (prog.current > q.target) prog.current = q.target;
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

    claimReward(period, questId) {
        let q = this[period + 'Quests'].find(x => x.id === questId);
        if (!q) return;

        if (!this.progress[period]) this.progress[period] = {};
        let prog = this.progress[period][questId];

        if (prog && prog.current >= q.target && !prog.claimed) {
            prog.claimed = true;
            this.saveProgress();
            
            if (gameState.isOnlineMode && socket && socket.connected) {
                socket.emit('claimQuestReward', { questId: questId, tokens: q.rewardTokens });
            } else {
                let profile = gameState.userProfile || JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
                profile.tokens = (profile.tokens || 0) + q.rewardTokens;
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                if (typeof ui.updateProfileUI === 'function') ui.updateProfileUI();
            }
            
            if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.win);
            this.renderQuests(period);
        }
    },

    renderQuests(period) {
        let container = document.getElementById(`quests-list-container-${period}`);
        if (!container) return;
        container.innerHTML = '';

        // حماية إضافية ضد الـ undefined
        if (!this.progress[period]) {
            this.progress[period] = {};
        }

        let quests = this[period + 'Quests'];
        
        quests.forEach(q => {
            let prog = this.progress[period][q.id] || { current: 0, claimed: false };
            let isCompleted = prog.current >= q.target;
            
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
                btn.onclick = () => this.claimRevenue ? null : this.claimReward(period, q.id); // تم تصحيحها لـ claimReward
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
    },

    updateTimerDisplay() {
        let timerEl = document.getElementById('quests-reset-timer');
        if (!timerEl) return;

        let period = this.currentTab || 'daily';
        let now = Date.now();
        let limitMs = period === 'daily' ? (24 * 60 * 60 * 1000) : (7 * 24 * 60 * 60 * 1000);
        
        let timeLeft = limitMs - (now - (this.lastReset[period] || now));
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
