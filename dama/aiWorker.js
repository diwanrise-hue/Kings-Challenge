// aiWorker.js

// 🧠 إعدادات المستويات الـ 9 متوافقة تماماً مع أوقات الطوارئ (Fallback) في ملفاتك
const AI_LEVELS = {
    // uiController يعطي طوارئ 1000ms لهذه المستويات (500 + 500)
    1: { depth: 1, randomChance: 0.60, maxTime: 400,   name: "مبتدئ جداً (عشوائي)" },
    2: { depth: 2, randomChance: 0.30, maxTime: 600,   name: "مبتدئ" },
    3: { depth: 3, randomChance: 0.10, maxTime: 850,   name: "سهل" },
    
    // uiController يعطي طوارئ 1500ms (1000 + 500)
    4: { depth: 4, randomChance: 0.00, maxTime: 1200,  name: "متوسط" },
    
    // uiController يعطي طوارئ 2000ms (1500 + 500)
    5: { depth: 5, randomChance: 0.00, maxTime: 1700,  name: "صعب" },
    
    // uiController يعطي طوارئ 6500ms (6000 + 500)
    6: { depth: 6, randomChance: 0.00, maxTime: 5500,  name: "محترف" },
    
    // hintSystem يعطي طوارئ 4500ms (4000 + 500) لنظام التلميحات
    7: { depth: 6, randomChance: 0.00, maxTime: 3800,  name: "أستاذ (تلميحات)" },
    
    // uiController يعطي طوارئ 8500ms (8000 + 500)
    8: { depth: 7, randomChance: 0.00, maxTime: 7500,  name: "جراند ماستر" },
    9: { depth: 8, randomChance: 0.00, maxTime: 8000,  name: "الزعيم" }
};

// 💡 حيلة ذكية: تحميل المحركات (gameEngine و gameAI) ديناميكياً
// بما أننا لا نستطيع استخدام 'import' العادية بدون تعديل الأكواد الأخرى، سنستخدم Dynamic Import المدمجة
let isEngineLoaded = false;
let engineRef = null;
let aiRef = null;

async function loadDependencies() {
    if (isEngineLoaded) return true;
    try {
        // استيراد ديناميكي يعمل حتى داخل الـ Worker العادي في المتصفحات الحديثة
        const engineModule = await import('./gameEngine.js');
        const aiModule = await import('./gameAI.js');
        
        engineRef = engineModule.gameEngine;
        aiRef = aiModule.gameAI;
        isEngineLoaded = true;
        return true;
    } catch (error) {
        console.error("Worker Dynamic Import Error:", error);
        return false;
    }
}

self.onmessage = async function (e) {
    try {
        // 1. التأكد من تحميل محرك اللعبة والذكاء الاصطناعي
        const isReady = await loadDependencies();
        if (!isReady) {
            throw new Error("فشل تحميل ملفات اللعبة الأساسية داخل البوت.");
        }

        // 2. استلام البيانات من اللعبة الأساسية
        const { board, level, aiColor, pieceDirection, depth } = e.data;
        const currentLevel = AI_LEVELS[level] || AI_LEVELS[3]; // افتراضي: سهل
        const targetDepth = depth || currentLevel.depth;

        // 3. توليد كل الحركات الممكنة
        let moves = engineRef.generateAllTurnMoves(aiColor, board);

        // إذا لم يكن هناك حركات، البوت خسر أو لا يوجد ما يلعبه
        if (!moves || moves.length === 0) {
            self.postMessage({ move: null, score: 0 });
            return;
        }

        // 4. محاكاة "الخطأ البشري" للمستويات السهلة (العشوائية)
        if (Math.random() < currentLevel.randomChance) {
            let randomMove = moves[Math.floor(Math.random() * moves.length)];
            self.postMessage({ move: randomMove, score: 0, isRandom: true, levelName: currentLevel.name });
            return;
        }

        // 5. تشغيل خوارزمية الذكاء الاصطناعي (Minimax)
        let startTime = Date.now();
        
        let bestResult = aiRef.minimax(
            board, 
            targetDepth, 
            undefined, 
            undefined, 
            true, 
            aiColor, 
            pieceDirection, 
            startTime, 
            currentLevel.maxTime // استخدام الوقت الدقيق المسموح به لمنع تجميد النظام
        );

        // 6. إرسال النتيجة النهائية إلى اللعبة
        self.postMessage({ 
            move: bestResult.move || moves[0], // حماية طوارئ: إذا فشل التقييم يعيد أول حركة
            score: bestResult.score,
            levelName: currentLevel.name
        });

    } catch (error) {
        // 🚨 إرسال الخطأ صراحة للملف الرئيسي لتفعيل خطة الطوارئ (Fallback) فوراً
        self.postMessage({ 
            error: error.message,
            stack: error.stack
        });
    }
};
