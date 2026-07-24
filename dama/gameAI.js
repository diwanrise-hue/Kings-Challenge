// gameAI.js
import { gameState } from './main.js';
import { gameEngine } from './gameEngine.js';

export const gameAI = {
    // تقييم الرقعة بناءً على لون الهدف وحساب قيمة الملوك والقطع العادية
    evaluateBoard(bState, targetColor) {
        let score = 0;
        bState.forEach((row, r) => row.forEach(p => {
            if (p) {
                let isTarget = p.startsWith(targetColor), isDama = p.endsWith('-dama');
                let pureColor = p.split('-')[0];
                
                // تحديد اتجاه تقدم القطعة لتقييم اقترابها من الترقية لملك
                let dir = (gameState.pieceDirection && gameState.pieceDirection[pureColor]) 
                          ? gameState.pieceDirection[pureColor] 
                          : (pureColor === 'black' ? 1 : -1);
                
                // إعطاء الملك قيمة (35) والقطعة العادية (10) مع مكافأة صغيرة للتقدم
                let val = (isDama ? 35 : 10) + (!isDama ? (dir === 1 ? r * 0.2 : (7 - r) * 0.2) : 0);
                score += isTarget ? val : -val;
            }
        }));
        return score;
    },

    // خوارزمية Minimax لحساب أفضل حركة للبوت والأوفلاين
    minimax(bState, depth, alpha, beta, isMaximizing, color, targetColor) {
        if (!targetColor) targetColor = color; // حماية احتياطية لضمان ثبات منظور التقييم
        
        // التوقف عند الوصول لأقصى عمق للبحث
        if (depth === 0) return { score: this.evaluateBoard(bState, targetColor) };
        
        let moves = gameEngine.generateAllTurnMoves(color, bState);
        
        // إذا لم توجد حركات، فهذا يعني الخسارة أو الفوز
        if (moves.length === 0) return { score: isMaximizing ? -10000 + (8 - depth) : 10000 - (8 - depth) };
        
        let bestMove = moves[0];
        let nextColor = color === 'white' ? 'black' : 'white';

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let m of moves) {
                let ev = this.minimax(gameEngine.applyPathToBoard(m, bState), depth - 1, alpha, beta, false, nextColor, targetColor).score;
                if (ev > maxEval) { maxEval = ev; bestMove = m; }
                alpha = Math.max(alpha, ev); 
                if (beta <= alpha) break; // التقليم (Alpha-Beta Pruning) لتسريع البحث
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (let m of moves) {
                let ev = this.minimax(gameEngine.applyPathToBoard(m, bState), depth - 1, alpha, beta, true, nextColor, targetColor).score;
                if (ev < minEval) { minEval = ev; bestMove = m; }
                beta = Math.min(beta, ev); 
                if (beta <= alpha) break; // التقليم (Alpha-Beta Pruning) لتسريع البحث
            }
            return { score: minEval, move: bestMove };
        }
    }
};
