// =========================================================================
// 🌐 ملف daily-login.js - نظام تسجيل الدخول اليومي المشروط بالإنترنت
// =========================================================================
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        
        // الدالة الأساسية لفحص تسجيل الدخول والمكافأة
        function processDailyLoginCheck() {
            // 1. التحقق من حالة الاتصال بالإنترنت
            if (!navigator.onLine) {
                console.log("📴 اللاعب أوفلاين: تم حجب وإخفاء حدث تسجيل الدخول اليومي تلقائياً.");
                return; 
            }

            // 2. إذا كان متصلاً، يجلب البيانات المحلية الموحدة
            let localProfileStr = localStorage.getItem('hub_user_profile');
            let profile = localProfileStr ? JSON.parse(localProfileStr) : {
                id: 'guest_' + Math.random().toString(36).substring(2, 9),
                name: 'لاعب محلي',
                tokens: 100, 
                purchasedItems: []
            };

            let lastLoginDate = localStorage.getItem('local_last_login_date'); 
            let currentDayStreak = parseInt(localStorage.getItem('local_login_streak') || '0'); 
            
            // جلب تاريخ اليوم الحالي (صيغة ثابتة: YYYY-MM-DD)
            const todayStr = new Date().toISOString().split('T')[0];

            // 3. التحقق: هل هذا دخول في يوم جديد؟
            if (lastLoginDate !== todayStr) {
                currentDayStreak += 1;

                // إعادة تدوير الشهر إذا تخطى 30 يوماً
                if (currentDayStreak > 30) {
                    currentDayStreak = 1;
                }

                // 🎁 منح مكافأة الدخول اليومي (20 عملة)
                profile.tokens = (profile.tokens || 0) + 20;

                // 4. حفظ التحديثات فوراً في ذاكرة الهاتف الثابتة
                localStorage.setItem('local_last_login_date', todayStr);
                localStorage.setItem('local_login_streak', currentDayStreak.toString());
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));

                console.log(`🌐 إنترنت متوفر! تم تسجيل الدخول لليوم [${currentDayStreak}/30].`);

                // 5. إظهار نافذة التنبيه المخصصة للاعب بشكل جذاب بعد ثانية من تحميل اللعبة
                setTimeout(() => {
                    const msgAr = `🎁 مكافأة الدخول اليومي!\n✨ اليوم الحالي: [${currentDayStreak} من 30]\n🪙 تم إضافة 20 عملة إلى رصيدك الموحد!`;
                    const msgEn = `🎁 Daily Login Reward!\n✨ Current Day: [${currentDayStreak} of 30]\n🪙 20 tokens added to your profile!`;
                    
                    const finalMessage = (window.currentLang === 'en') ? msgEn : msgAr;

                    if (window.triggerCustomAlertNotification) {
                        window.triggerCustomAlertNotification(finalMessage);
                    } else {
                        alert(finalMessage);
                    }

                    if (window.applyProfileDataToUI) {
                        window.applyProfileDataToUI(profile);
                    }
                }, 1500);
            } else {
                console.log(`✅ تم التحقق: اللاعب استلم مكافأة اليوم مسبقاً في وقت سابق من هذا اليوم.`);
            }
        }

        // تشغيل الفحص التلقائي مع تأخير بسيط لضمان اكتمال تحميل عناصر اللعبة (UI)
        setTimeout(processDailyLoginCheck, 1000);

        // 🔄 ميزة ذكية: إذا فتح اللاعب اللعبة وهو أوفلاين، ثم اتصل بالإنترنت أثناء اللعب، يظهر له الحدث فوراً
        window.addEventListener('online', () => {
            console.log("📶 تم رصد اتصال الإنترنت مجدداً! جاري فحص تسجيل الدخول...");
            processDailyLoginCheck();
        });
    });
})();
