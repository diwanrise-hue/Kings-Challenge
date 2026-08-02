// aiWorker.js

// 🧠 إعدادات المستويات الـ 9 حسب الصعوبة
const AI_LEVELS = {
    1: { depth: 1, randomChance: 0.60, maxTime: 500,   name: "مبتدئ جداً (عشوائي)" },
    2: { depth: 2, randomChance: 0.30, maxTime: 800,   name: "مبتدئ" },
    3: { depth: 3, randomChance: 0.10, maxTime: 1200,  name: "سهل" },
    4: { depth: 4, randomChance: 0.00, maxTime: 1500,  name: "متوسط" },
    5: { depth: 5, randomChance: 0.00, maxTime: 2500,  name: "صعب" },
    6: { depth: 6, randomChance: 0.00, maxTime: 4000,  name: "محترف" },
    7: { depth: 6, randomChance: 0.00, maxTime: 6000,  name: "أستاذ (تلميحات)" },
    8: { depth: 7, randomChance: 0.00, maxTime: 8500,  name: "جراند ماستر" },
    9: { depth: 8, randomChance: 0.00, maxTime: 12000, name: "الزعيم" }
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

        // 2. استلام البيانات
        const { board, level, aiColor, pieceDirection, depth } = e.data;
        const currentLevel = AI_LEVELS[level] || AI_LEVELS[3];
        const targetDepth = depth || currentLevel.depth;

        // 3. توليد كل الحركات
        let moves = engineRef.generateAllTurnMoves(aiColor, board);

        if (!moves || moves.length === 0) {
            self.postMessage({ move: null, score: 0 });
            return;
        }

        // 4. محاكاة الأخطاء في المستويات السهلة
        if (Math.random() < currentLevel.randomChance) {
            let randomMove = moves[Math.floor(Math.random() * moves.length)];
            self.postMessage({ move: randomMove, score: 0, isRandom: true });
            return;
        }

        // 5. تشغيل الحسابات (Minimax)
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
            currentLevel.maxTime
        );

        // 6. إرسال النتيجة
        self.postMessage({ 
            move: bestResult.move || moves[0], 
            score: bestResult.score,
            levelName: currentLevel.name
        });

    } catch (error) {
        // إرسال الخطأ صراحة للملف الرئيسي لتفعيل خطة الطوارئ (Fallback)
        self.postMessage({ 
            error: error.message,
            stack: error.stack
        });
    }
};
