import { gameState } from './main.js';
import { gameEngine } from './gameEngine.js';

export const gameAI = {
    evaluateBoard(bState) {
        let score = 0, aiColor = gameState.playerColor === 'white' ? 'black' : 'white';
        bState.forEach((row, r) => row.forEach(p => {
            if (p) {
                let isAi = p.startsWith(aiColor), isDama = p.endsWith('-dama');
                let val = (isDama ? 35 : 10) + (!isDama ? ((gameState.pieceDirection[p.split('-')[0]] === 1) ? r * 0.2 : (7 - r) * 0.2) : 0);
                score += isAi ? val : -val;
            }
        }));
        return score;
    },

    minimax(bState, depth, alpha, beta, isMaximizing, color) {
        if (depth === 0) return { score: this.evaluateBoard(bState) };
        let moves = gameEngine.generateAllTurnMoves(color, bState);
        if (moves.length === 0) return { score: isMaximizing ? -10000 + (5 - depth) : 10000 - (5 - depth) };
        let bestMove = null, nextColor = color === 'white' ? 'black' : 'white';

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let m of moves) {
                let ev = this.minimax(gameEngine.applyPathToBoard(m, bState), depth - 1, alpha, beta, false, nextColor).score;
                if (ev > maxEval) { maxEval = ev; bestMove = m; }
                alpha = Math.max(alpha, ev); if (beta <= alpha) break;
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (let m of moves) {
                let ev = this.minimax(gameEngine.applyPathToBoard(m, bState), depth - 1, alpha, beta, true, nextColor).score;
                if (ev < minEval) { minEval = ev; bestMove = m; }
                beta = Math.min(beta, ev); if (beta <= alpha) break;
            }
            return { score: minEval, move: bestMove };
        }
    }
};
