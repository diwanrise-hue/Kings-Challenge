/**
 * gameAIt.js
 * نظام الذكاء الاصطناعي الجديد (AI) المخصص للعبة الطاولة (Tawla)
 * يفهم هذا العقل: حماية الأحجار، الإخراج، الضرب، والابتعاد عن الخطر.
 */

import { gameEngine } from './gameEnginet.js';

export const gameAI = {
    
    // 🧠 تقييم حالة لوحة الطاولة
    evaluateTawlaBoard(board, aiColor) {
        let score = 0;
        let oppColor = aiColor === 'white' ? 'black' : 'white';

        for (let i = 0; i < 24; i++) {
            let pt = board.points[i];
            if (pt.count > 0) {
                let isAI = (pt.color === aiColor);
                let sign = isAI ? 1 : -1;
                
                // حساب التقدم نحو النهاية (كلما اقترب الحجر من النهاية زادت النقاط)
                let progress = aiColor === 'white' ? i : (23 - i); 
                score += (progress * 2) * sign;

                // 🛡️ مكافأة حماية الأحجار (Anchors) وعقاب تركها مكشوفة (Blots)
                if (pt.count > 1) {
                    score += 20 * sign; // نقطة آمنة (محمية)
                } else if (pt.count === 1) {
                    score -= 15 * sign; // حجر مكشوف ومعرض للضرب
                }
            }
        }

        // 🚨 عقاب شديد جداً إذا كان الحجر في البار (Bar)
        score -= board.bar[aiColor] * 1000;
        score += board.bar[oppColor] * 1000;

        // 🏆 مكافأة ضخمة جداً لإخراج الأحجار (Bear Off)
        score += board.bearOff[aiColor] * 2000;
        score -= board.bearOff[oppColor] * 2000;

        return score;
    },

    // 🤖 اختيار أفضل حركة بناءً على النرد الحالي
    async getBestMoveAsync(virtualBoard, levelStr, aiColor, currentDice) {
        let levelNum = parseInt(levelStr) || 3;
        
        // جلب جميع الحركات المتاحة للنرد الحالي
        let moves = gameEngine.generateAllTurnMoves(aiColor, virtualBoard, currentDice);

        if (!moves || moves.length === 0) return null; // لا توجد حركات
        if (moves.length === 1) return moves[0]; // حركة وحيدة إجبارية

        // إذا كان المستوى ضعيفاً، نزيد فرصة اللعب العشوائي
        let randomChance = levelNum <= 2 ? 0.4 : (levelNum === 3 ? 0.2 : 0.0);
        if (Math.random() < randomChance) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        let bestMove = moves[0];
        let bestScore = -Infinity;

        // محاكاة جميع الحركات الممكنة لاختيار الأفضل
        for (let move of moves) {
            // إنشاء نسخة عميقة من اللوحة للمحاكاة
            let clonedBoard = JSON.parse(JSON.stringify(virtualBoard));
            
            // تنفيذ الحركة الوهمية
            let isHit = gameEngine.executeMove(move.from, move.to, aiColor, clonedBoard);
            
            // تقييم اللوحة بعد الحركة
            let score = this.evaluateTawlaBoard(clonedBoard, aiColor);

            // مكافآت فورية استراتيجية
            if (isHit) score += 500; // ضرب الخصم أولوية قصوى!
            if (move.to === 'bearOff') score += 800; // إخراج الحجر أولوية عليا!

            // حفظ أفضل حركة
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        // محاكاة وقت التفكير بناءً على الصعوبة
        let thinkTime = levelNum >= 5 ? 800 : 400;
        await new Promise(r => setTimeout(r, thinkTime));

        return bestMove;
    }
};
