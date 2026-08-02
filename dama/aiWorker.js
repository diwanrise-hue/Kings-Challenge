// aiWorker.js

// 🧠 إعدادات المستويات الـ 9 متوافقة تماماً مع أوقات الطوارئ (Fallback)
const AI_LEVELS = {
    1: { depth: 1, randomChance: 0.60, maxTime: 400,   name: "مبتدئ جداً (عشوائي)" },
    2: { depth: 2, randomChance: 0.30, maxTime: 600,   name: "مبتدئ" },
    3: { depth: 3, randomChance: 0.10, maxTime: 850,   name: "سهل" },
    4: { depth: 4, randomChance: 0.00, maxTime: 1200,  name: "متوسط" },
    5: { depth: 5, randomChance: 0.00, maxTime: 1700,  name: "صعب" },
    6: { depth: 6, randomChance: 0.00, maxTime: 5500,  name: "محترف" },
    7: { depth: 6, randomChance: 0.00, maxTime: 3800,  name: "أستاذ (تلميحات)" },
    8: { depth: 7, randomChance: 0.00, maxTime: 7500,  name: "جراند ماستر" },
    9: { depth: 8, randomChance: 0.00, maxTime: 8000,  name: "الزعيم" }
};

let engineRef = null;
let aiRef = null;

// 💡 بدء التحميل في الخلفية *فوراً* بمجرد إنشاء الـ Worker (وليس عند بدء الدور)
const initPromise = (async function loadDependencies() {
    try {
        const engineModule = await import('./gameEngine.js');
        const aiModule = await import('./gameAI.js');
        engineRef = engineModule.gameEngine;
        aiRef = aiModule.gameAI;
        return true;
    } catch (error) {
        console.error("🚨 Worker Dynamic Import Error:", error);
        return false;
    }
})();

self.onmessage = async function (e) {
    try {
        // 1. ننتظر انتهاء التحميل (الذي بدأ بالفعل في الخلفية وسيكون غالباً جاهزاً)
        const isReady = await initPromise;
        if (!isReady || !engineRef || !aiRef) {
            throw new Error("فشل تحميل ملفات اللعبة الأساسية داخل البوت (CORS or Path Error).");
        }

        // 2. استلام البيانات من اللعبة الأساسية
        const { board, level, aiColor, pieceDirection, depth } = e.data;
        const currentLevel = AI_LEVELS[level] || AI_LEVELS[3]; 
        const targetDepth = depth || currentLevel.depth;

        // 3. توليد كل الحركات الممكنة
        let moves = engineRef.generateAllTurnMoves(aiColor, board);

        if (!moves || moves.length === 0) {
            self.postMessage({ move: null, score: 0 });
            return;
        }

        // 4. محاكاة "الخطأ البشري" للمستويات السهلة
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
            currentLevel.maxTime 
        );

        // 6. إرسال النتيجة النهائية إلى اللعبة قبل انقضاء وقت Timeout
        self.postMessage({ 
            move: bestResult.move || moves[0], 
            score: bestResult.score,
            levelName: currentLevel.name
        });

    } catch (error) {
        // إرسال الخطأ لتفعيل خطة الطوارئ فوراً دون تجميد
        self.postMessage({ 
            error: error.message,
            stack: error.stack
        });
    }
};
