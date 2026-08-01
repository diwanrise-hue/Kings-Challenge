// ==========================================
// 📜 dailyQuests.js - محرك المهام اليومية والأسبوعية
// ==========================================

const dailyPool = [];
const dailyActions = ['play', 'win', 'spin', 'capture'];
const dailyIcons = ['🎮', '🏆', '🎡', '⚔️'];

// توليد المهام اليومية بشكل ديناميكي
for (let i = 1; i <= 40; i++) {
    let typeIdx = i % 4;
    let target = (typeIdx === 2) ? 1 : Math.floor(Math.random() * 3) + 2;
    if (typeIdx === 3) target = Math.floor(Math.random() * 10) + 10; // مهام أسر الأحجار تتطلب عدداً أكبر
    
    let titles = ['العب', 'فز في', 'قم بلف عجلة الحظ', 'أسر'];
    let title = `${titles[typeIdx]} ${target} ${typeIdx === 0 || typeIdx === 1 ? 'مباريات' : (typeIdx === 2 ? 'مرة' : 'أحجار')}`;
    
    dailyPool.push({
        id: `d_${i}`,
        action: dailyActions[typeIdx],
        target: target,
        rewards: { tokens: target * 20 },
        title: title,
        icon: dailyIcons[typeIdx]
    });
}

const weeklyPool = [];
for (let i = 1; i <= 15; i++) {
    weeklyPool.push({
        id: `w_${i}`,
        action: (i % 2 === 0) ? 'win' : 'play',
        target: (i % 2 === 0) ? 15 : 30,
        rewards: { tokens: 500, hints: 2, discount: 10 },
        title: (i % 2 === 0) ? 'فز في 15 مباراة' : 'العب 30 مباراة',
        icon: '👑'
    });
}

export const questsManager = {
    currentTab: 'daily',
    
    getState() {
        let state = JSON.parse(localStorage.getItem('hub_quests_data'));
        const now = Date.now();
        let needsSave = false;

        if (!state) {
            state = { dailyReset: 0, weeklyReset: 0, activeDaily: [], activeWeekly: [], progress: {}, claimed: {} };
        }

        if (now >= state.dailyReset) {
            const tomorrow = new Date();
            tomorrow.setHours(24, 0, 0, 0);
            state.dailyReset = tomorrow.getTime();
            
            let shuffled = [...dailyPool].sort(() => 0.5 - Math.random());
            state.activeDaily = shuffled.slice(0, 3).map(q => q.id);
            
            state.activeDaily.forEach(id => { state.progress[id] = 0; state.claimed[id] = false; });
            needsSave = true;
        }

        if (now >= state.weeklyReset) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextWeek.setHours(24, 0, 0, 0);
            state.weeklyReset = nextWeek.getTime();
            
            let shuffled = [...weeklyPool].sort(() => 0.5 - Math.random());
            state.activeWeekly = shuffled.slice(0, 4).map(q => q.id);
            
            state.activeWeekly.forEach(id => { state.progress[id] = 0; state.claimed[id] = false; });
            needsSave = true;
        }

        if (needsSave) this.saveState(state);
        return state;
    },

    saveState(state) {
        localStorage.setItem('hub_quests_data', JSON.stringify(state));
        this.renderQuestsUI(); 
    },

    updateProgress(actionType, amount = 1) {
        let state = this.getState();
        let updated = false;

        const checkAndUpdate = (questId, pool) => {
            const quest = pool.find(q => q.id === questId);
            if (quest && quest.action === actionType && state.progress[questId] < quest.target) {
                state.progress[questId] = Math.min(state.progress[questId] + amount, quest.target);
                updated = true;
            }
        };

        state.activeDaily.forEach(id => checkAndUpdate(id, dailyPool));
        state.activeWeekly.forEach(id => checkAndUpdate(id, weeklyPool));

        if (updated) this.saveState(state);
    },

    claimReward(questId, isWeekly) {
        let state = this.getState();
        const pool = isWeekly ? weeklyPool : dailyPool;
        const quest = pool.find(q => q.id === questId);
        
        if (!quest || state.claimed[questId] || state.progress[questId] < quest.target) return;

        let profileRaw = localStorage.getItem('hub_user_profile');
        let profile = profileRaw ? JSON.parse(profileRaw) : null;
        if (!profile) return;
        
        let toastMsgs = [];
        
        if (quest.rewards.tokens) toastMsgs.push(`${quest.rewards.tokens} 🪙`);
        if (quest.rewards.hints) toastMsgs.push(`${quest.rewards.hints} 💡`);
        if (quest.rewards.discount) toastMsgs.push(`خصم ${quest.rewards.discount}% 🎫`);

        if (window.ui && typeof window.ui.showCustomAlert === 'function') {
            window.ui.showCustomAlert(`🎉 تم اعتماد جائزتك: ${toastMsgs.join(' و ')}`);
        }

        if (window.socket && window.socket.connected) {
            window.socket.emit('claimQuestReward', {
                questId: quest.id,
                tokens: quest.rewards.tokens || 0,
                hints: quest.rewards.hints || 0,
                discount: quest.rewards.discount || 0
            });
        } else {
            // إضافة محلية كاحتياط في حال اللعب أوفلاين كلياً
            if (quest.rewards.tokens) profile.tokens = (profile.tokens || 0) + quest.rewards.tokens;
            if (quest.rewards.hints) profile.hints = (profile.hints || 0) + quest.rewards.hints;
            if (quest.rewards.discount) profile.discountTicket = Math.max(profile.discountTicket || 0, quest.rewards.discount);
            
            localStorage.setItem('hub_user_profile', JSON.stringify(profile));
            if (window.applyProfileDataToUI) window.applyProfileDataToUI(profile);
            if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
            
            // 💡 إصلاح تحديث الواجهة أوفلاين
            if (window.ui && typeof window.ui.updateProfileUI === 'function') {
                window.ui.updateProfileUI();
            }
        }
        
        state.claimed[questId] = true;
        this.saveState(state);
        
        if (window.ui && window.ui.playSound && window.ui.sfx) window.ui.playSound(window.ui.sfx.win);
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        const btnDaily = document.getElementById('tab-daily-quests');
        const btnWeekly = document.getElementById('tab-weekly-quests');
        if (btnDaily) btnDaily.classList.toggle('active', tabName === 'daily');
        if (btnWeekly) btnWeekly.classList.toggle('active', tabName === 'weekly');
        this.renderQuestsUI();
        this.updateTimerDisplay();
    },

    renderQuestsUI() {
        const container = document.getElementById('quests-list-container');
        if (!container) return;
        
        const state = this.getState();
        container.innerHTML = '';

        const isWeekly = this.currentTab === 'weekly';
        const activeIds = isWeekly ? state.activeWeekly : state.activeDaily;
        const pool = isWeekly ? weeklyPool : dailyPool;

        activeIds.forEach(questId => {
            const quest = pool.find(q => q.id === questId);
            if (!quest) return;

            const currentProgress = state.progress[questId] || 0;
            const isCompleted = currentProgress >= quest.target;
            const isClaimed = state.claimed[questId];
            const percentage = (currentProgress / quest.target) * 100;
            
            let btnHtml = '';
            if (isClaimed) {
                btnHtml = `<button disabled style="background: rgba(255,255,255,0.05); color: #888; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 6px 12px; font-weight: bold; cursor: not-allowed;">مكتملة ✔️</button>`;
            } else if (isCompleted) {
                btnHtml = `<button onclick="window.questsManager.claimReward('${quest.id}', ${isWeekly})" style="background: #30d158; color: white; border: none; border-radius: 8px; padding: 6px 12px; font-weight: bold; cursor: pointer; box-shadow: 0 0 10px rgba(48, 209, 88, 0.4); animation: startBtnPulse 1.5s infinite;">استلام 🎁</button>`;
            } else {
                btnHtml = `<div style="color: #a1a1aa; font-weight: bold; font-size: 13px; direction: ltr;">${currentProgress} / ${quest.target}</div>`;
            }

            let rewardsText = [];
            if (quest.rewards.tokens) rewardsText.push(`+${quest.rewards.tokens} 🪙`);
            if (quest.rewards.hints) rewardsText.push(`+${quest.rewards.hints} 💡`);
            if (quest.rewards.discount) rewardsText.push(`خصم 10% 🎫`);

            const questCard = `
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 10px; text-align: right;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">${quest.icon}</span>
                            <span style="color: white; font-size: 14px; font-weight: 600;">${quest.title}</span>
                        </div>
                        <div style="color: #f5a623; font-weight: bold; font-size: 12px; text-align: left;">
                            ${rewardsText.join('<br>')}
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <div style="flex: 1; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; position: relative;">
                            <div style="width: ${percentage}%; height: 100%; background: ${isCompleted ? '#30d158' : (isWeekly ? '#9B59B6' : '#f5a623')}; transition: width 0.4s ease;"></div>
                        </div>
                        ${btnHtml}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', questCard);
        });
    },
    
    updateTimerDisplay() {
        const timerEl = document.getElementById('quests-reset-timer');
        if (!timerEl) return;
        
        const state = this.getState();
        const targetTime = this.currentTab === 'weekly' ? state.weeklyReset : state.dailyReset;
        const now = Date.now();
        const diff = Math.max(0, targetTime - now);
        
        let d = Math.floor(diff / (1000 * 60 * 60 * 24));
        let h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
        let m = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
        let s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
        
        let timeStr = this.currentTab === 'weekly' ? `${d} يوم و ${h}:${m}:${s}` : `${h}:${m}:${s}`;
        timerEl.innerText = `تتجدد المهام بعد: ${timeStr}`;
    },

    startResetTimer() {
        setInterval(() => this.updateTimerDisplay(), 1000);
    },
    
    init() {
        this.getState();
        this.renderQuestsUI();
        this.startResetTimer();
    }
};

window.questsManager = questsManager;

document.addEventListener('DOMContentLoaded', () => {
    questsManager.init();
});
