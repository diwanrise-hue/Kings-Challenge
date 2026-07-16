// gameAI.js
import { gameState } from './main.js';
import { gameEngine } from './gameEngine.js';

export const gameAI = {
    // جعلنا دالة التقييم تأخذ لون الهدف لتقوم بالحسابات لصالحه دائماً
    evaluateBoard(bState, targetColor) {
        let score = 0;
        bState.forEach((row, r) => row.forEach(p => {
            if (p) {
                let isTarget = p.startsWith(targetColor), isDama = p.endsWith('-dama');
                let val = (isDama ? 35 : 10) + (!isDama ? ((gameState.pieceDirection[p.split('-')[0]] === 1) ? r * 0.2 : (7 - r) * 0.2) : 0);
                score += isTarget ? val : -val;
            }
        }));
        return score;
    },

    // تمرير لون الهدف (targetColor) على طول شجرة البحث لضمان ثبات المنظور الحسابي
    minimax(bState, depth, alpha, beta, isMaximizing, color, targetColor) {
        if (!targetColor) targetColor = color; // حماية احتياطية للتوافق مع البوت الاوفلاين
        
        if (depth === 0) return { score: this.evaluateBoard(bState, targetColor) };
        
        let moves = gameEngine.generateAllTurnMoves(color, bState);
        if (moves.length === 0) return { score: isMaximizing ? -10000 + (5 - depth) : 10000 - (5 - depth) };
        
        let bestMove = null, nextColor = color === 'white' ? 'black' : 'white';

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let m of moves) {
                let ev = this.minimax(gameEngine.applyPathToBoard(m, bState), depth - 1, alpha, beta, false, nextColor, targetColor).score;
                if (ev > maxEval) { maxEval = ev; bestMove = m; }
                alpha = Math.max(alpha, ev); if (beta <= alpha) break;
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (let m of moves) {
                let ev = this.minimax(gameEngine.applyPathToBoard(m, bState), depth - 1, alpha, beta, true, nextColor, targetColor).score;
                if (ev < minEval) { minEval = ev; bestMove = m; }
                beta = Math.min(beta, ev); if (beta <= alpha) break;
            }
            return { score: minEval, move: bestMove };
        }
    }
};
