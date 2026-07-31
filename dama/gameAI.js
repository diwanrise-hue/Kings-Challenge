// gameAI.js
import { gameState } from './main.js';
import { gameEngine } from './gameEngine.js';

export const gameAI = {
    evaluateBoard(bState, targetColor) {
        let score = 0;
        let myPieces = 0, oppPieces = 0;
        let myDamas = 0, oppDamas = 0;

        bState.forEach((row, r) => row.forEach((p, c) => {
            if (p) {
                let isTarget = p.startsWith(targetColor);
                let isDama = p.endsWith('-dama');
                let pureColor = p.split('-')[0];
                let dir = (gameState.pieceDirection && gameState.pieceDirection[pureColor]) ? gameState.pieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
                
                let pieceValue = isDama ? 40 : 10;
                let centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 0.5 : 0;
                let advanceBonus = !isDama ? (dir === 1 ? r * 0.3 : (7 - r) * 0.3) : 0;
                let edgePenalty = (c === 0 || c === 7) ? -0.2 : 0;
                
                let defenseBonus = 0;
                let backRow = r - dir;
                if (backRow >= 0 && backRow < 8 && bState[backRow][c] && bState[backRow][c].startsWith(pureColor)) {
                    defenseBonus = 0.5;
                }

                let totalValue = pieceValue + advanceBonus + centerBonus + edgePenalty + defenseBonus;

                if (isTarget) { score += totalValue; myPieces++; if (isDama) myDamas++; } 
                else { score -= totalValue; oppPieces++; if (isDama) oppDamas++; }
            }
        }));

        if (myDamas > 0 && oppPieces <= 3) score += 5;
        if (oppDamas > 0 && myPieces <= 3) score -= 5;

        return score;
    },

    // دالة التقييم المبدئي لترتيب الحركات
    scoreMove(path, color, bState) {
        let score = 0;
        let lastStep = path[path.length - 1];
        let pureColor = color.split('-')[0];
        let dir = (gameState.pieceDirection && gameState.pieceDirection[pureColor]) ? gameState.pieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
        let promoRow = (dir === 1) ? 7 : 0;
        
        let piece = bState[path[0].fromR][path[0].fromC];
        let isDama = piece && piece.endsWith('-dama');

        if (!isDama && lastStep.toR === promoRow) score += 100; // أولوية الترقية
        if (lastStep.toR >= 2 && lastStep.toR <= 5 && lastStep.toC >= 2 && lastStep.toC <= 5) score += 10; // أولوية الوسط

        return score;
    },

    minimax(bState, depth, alpha, beta, isMaximizing, color, targetColor, isQuiescence = false) {
        if (!targetColor) targetColor = color; 
        
        let moves = gameEngine.generateAllTurnMoves(color, bState);
        let isCapture = moves.length > 0 && moves[0][0] && moves[0][0].midR !== null;

        if (depth <= 0) {
            if (isCapture && !isQuiescence) {
                depth = 1;
                isQuiescence = true;
            } else {
                return { score: this.evaluateBoard(bState, targetColor) };
            }
        }
        
        if (moves.length === 0) return { score: isMaximizing ? -10000 + (8 - depth) : 10000 - (8 - depth) };
        
        // 💡 ترتيب الحركات لاختبار الأفضل أولاً وتسريع عملية القص (Pruning)
        moves.sort((a, b) => this.scoreMove(b, color, bState) - this.scoreMove(a, color, bState));
        
        let bestMove = moves[0];
        let nextColor = color === 'white' ? 'black' : 'white';

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let m of moves) {
                let ev = this.minimax(gameEngine.applyPathToBoard(m, bState), depth - 1, alpha, beta, false, nextColor, targetColor, isQuiescence).score;
                if (ev > maxEval) { maxEval = ev; bestMove = m; }
                alpha = Math.max(alpha, ev); 
                if (beta <= alpha) break; 
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (let m of moves) {
                let ev = this.minimax(gameEngine.applyPathToBoard(m, bState), depth - 1, alpha, beta, true, nextColor, targetColor, isQuiescence).score;
                if (ev < minEval) { minEval = ev; bestMove = m; }
                beta = Math.min(beta, ev); 
                if (beta <= alpha) break; 
            }
            return { score: minEval, move: bestMove };
        }
    }
};
