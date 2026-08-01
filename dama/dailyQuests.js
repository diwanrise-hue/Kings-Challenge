/**
 * dailyQuests.js
 * نظام المهام اليومية المستقل
 */

import { gameState } from './gameState.js';
import { ui } from './uiController.js';

// قائمة المهام الافتراضية
const DEFAULT_QUESTS = [
    { id: 'q_play_3', type: 'play', target: 3, title: 'العب 3 مباريات', rewardType: 'tokens', rewardAmount: 50 },
    { id: 'q_win_2', type: 'win', target: 2, title: 'فز في مباراتين', rewardType: 'tokens', rewardAmount: 100 },
    { id: 'q_capture_10', type: 'capture', target: 10, title: 'كُل 10 أحجار للخصم', rewardType: 'hints', rewardAmount: 1 }
];

function initDailyQuests() {
    if (!gameState.userProfile) return;
    
    const today = new Date().toISOString().split('T')[0]; 
    let profile = gameState.userProfile;

    // إعادة تعيين المهام إذا كان يوماً جديداً أو لا توجد مهام
    if (!profile.dailyQuests || profile.dailyQuests.date !== today) {
        profile.dailyQuests = {
            date: today,
            tasks: DEFAULT_QUESTS.map(q => ({ ...q, progress: 0, claimed: false }))
        };
        try { localStorage.setItem('hub_user_profile', JSON.stringify(profile)); } catch(e){}
    }
    renderDailyQuests();
}

window.updateQuestProgress = function(type, amount = 1) {
    let profile = gameState.userProfile;
    if (!profile || !profile.dailyQuests) return;

    const today = new Date().toISOString().split('T')[0];
    if (profile.dailyQuests.date !== today) initDailyQuests(); 

    let updated = false;
    let hasUnclaimed = false;

    profile.dailyQuests.tasks.forEach(task => {
        if (task.type === type && task.progress < task.target) {
            task.progress = Math.min(task.progress + amount, task.target);
            updated = true;
        }
        if (task.progress >= task.target && !task.claimed) {
            hasUnclaimed = true;
        }
    });

    if (updated) {
        try { localStorage.setItem('hub_user_profile', JSON.stringify(profile)); } catch(e){}
        renderDailyQuests();
    }

    const badge = document.getElementById('quests-notify-badge');
    if (badge) badge.style.display = hasUnclaimed ? 'inline-block' : 'none';
};

window.renderDailyQuests = function() {
    const container = document.getElementById('quests-container');
    if (!container) return;
    
    let profile = gameState.userProfile;
    if (!profile || !profile.dailyQuests) return;

    container.innerHTML = '';
    let hasUnclaimed = false;

    profile.dailyQuests.tasks.forEach(task => {
        const isCompleted = task.progress >= task.target;
        const isClaimed = task.claimed;
        if (isCompleted && !isClaimed) hasUnclaimed = true;

        const percent = (task.progress / task.target) * 100;
        const rewardIcon = task.rewardType === 'tokens' ? '🪙' : '💡';

        const card = document.createElement('div');
        card.className = `quest-card ${isCompleted ? 'completed' : ''}`;
        
        let buttonHtml = '';
        if (isClaimed) {
            buttonHtml = `<button class="quest-claim-btn" disabled>تم الاستلام ✔️</button>`;
        } else if (isCompleted) {
            buttonHtml = `<button class="quest-claim-btn" onclick="claimQuest('${task.id}')">استلام الجائزة 🎁</button>`;
        } else {
            buttonHtml = `<div style="text-align:center; font-size:12px; color:#a1a1aa; font-weight:600;">${task.progress} / ${task.target}</div>`;
        }

        card.innerHTML = `
            <div class="quest-info">
                <span class="quest-title">${task.title}</span>
                <span class="quest-reward">${task.rewardAmount} ${rewardIcon}</span>
            </div>
            <div class="quest-progress-bg">
                <div class="quest-progress-fill" style="width: ${percent}%"></div>
            </div>
            ${buttonHtml}
        `;
        container.appendChild(card);
    });

    const badge = document.getElementById('quests-notify-badge');
    if (badge) badge.style.display = hasUnclaimed ? 'inline-block' : 'none';
};

window.claimQuest = function(taskId) {
    let profile = gameState.userProfile;
    if (!profile || !profile.dailyQuests) return;

    let task = profile.dailyQuests.tasks.find(t => t.id === taskId);
    
    if (task && task.progress >= task.target && !task.claimed) {
        task.claimed = true;
        
        if (task.rewardType === 'tokens') {
            profile.tokens = (profile.tokens || 0) + task.rewardAmount;
        } else if (task.rewardType === 'hints') {
            profile.hints = (profile.hints || 0) + task.rewardAmount;
        }

        try { localStorage.setItem('hub_user_profile', JSON.stringify(profile)); } catch(e){}
        
        ui.updateProfileUI();
        window.renderDailyQuests();
        
        if (typeof ui.playSound === 'function') ui.playSound(ui.sfx.win);
        ui.showCustomAlert(`تم استلام ${task.rewardAmount} ${task.rewardType === 'tokens' ? 'عملة 🪙' : 'مصباح 💡'} بنجاح!`, "جائزة المهمة");
    }
};

window.addEventListener('load', () => {
    setTimeout(initDailyQuests, 1500); 
});
