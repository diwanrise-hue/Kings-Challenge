/**
 * gameAI.js
 * النسخة المحسنة والخالية من الثغرات: 
 * تم توحيد ذكاء التقييم مع الـ Worker، ومعالجة تسريب الذاكرة نهائياً عبر Backtracking.
 */

import { gameEngine } from './gameEngine.js';

export const gameAI = {
    // [إصلاح الثغرة 2]: توحيد دالة التقييم لتتطابق تماماً مع aiWorker.js
    evaluateBoard(board, aiColor, pieceDirection) {
        let score = 0; let myPieces = 0, oppPieces = 0; let myDamas = 0, oppDamas = 0;
        let targetPure = aiColor.split('-')[0]; let oppPure = targetPure === 'white' ? 'black' : 'white';
        let myDir = pieceDirection ? (pieceDirection[targetPure] !== undefined ? pieceDirection[targetPure] : (targetPure === 'black' ? 1 : -1)) : (targetPure === 'black' ? 1 : -1);
        let myBackRow = myDir === 1 ? 0 : 7; let oppBackRow = myDir === 1 ? 7 : 0;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = board[r][c];
                if (!piece) continue;

                let isTarget = piece.startsWith(targetPure); 
                let isDama = piece.includes('dama');
                
                let pieceValue = isDama ? 500 : 100;
                let defenseBonus = (!isDama && r === myBackRow && isTarget) ? 30 : 0;
                let centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 10 : 0;
                let advanceBonus = 0;
                
                if (!isDama) { advanceBonus = isTarget ? Math.abs(r - myBackRow) * 5 : Math.abs(r - oppBackRow) * 5; }

                let protectionBonus = 0;
                if (!isDama) {
                    let pieceDir = isTarget ? myDir : -myDir;
                    let behindR = r - pieceDir;
                    if (behindR >= 0 && behindR < 8 && c >= 0 && c < 8 && board[behindR][c]) {
                        let pieceBehind = board[behindR][c];
                        if ((isTarget && pieceBehind.startsWith(targetPure)) || (!isTarget && pieceBehind.startsWith(oppPure))) { protectionBonus = 15; }
                    }
                }

                let totalValue = pieceValue + advanceBonus + centerBonus + defenseBonus + protectionBonus;
                if (isTarget) { score += totalValue; myPieces++; if (isDama) myDamas++; } 
                else { score -= totalValue; oppPieces++; if (isDama) oppDamas++; }
            }
        }
        
        if (myDamas > 0 && oppPieces <= 3) score += 200;
        if (oppDamas > 0 && myPieces <= 3) score -= 200;
        
        return score;
    },

    orderMoves(moves, aiDir) {
        let promoRow = aiDir === 1 ? 7 : 0;
        return moves.sort((a, b) => {
            let scoreA = 0; let scoreB = 0;
            let capturesA = a.filter(step => step.midR !== null).length;
            let capturesB = b.filter(step => step.midR !== null).length;
            scoreA += capturesA * 1000; scoreB += capturesB * 1000;

            if (a[a.length - 1].toR === promoRow) scoreA += 500;
            if (b[b.length - 1].toR === promoRow) scoreB += 500;
            return scoreB - scoreA; 
        });
    },

    // 💡 تطبيق Backtracking لمنع النسخ المكلف للذاكرة
    doMove(board, path, pieceDirection) {
        let startStep = path[0];
        let piece = board[startStep.fromR][startStep.fromC];
        let undoData = { path: path, captures: [], wasPromoted: false, startPiece: piece };

        board[startStep.fromR][startStep.fromC] = null;

        for (let step of path) {
            if (step.midR !== null) {
                undoData.captures.push({ r: step.midR, c: step.midC, p: board[step.midR][step.midC] });
                board[step.midR][step.midC] = null;
            }
        }

        let lastStep = path[path.length - 1];
        let isWhite = piece.includes('white');
        let pureColor = isWhite ? 'white' : 'black';
        let dir = pieceDirection ? pieceDirection[pureColor] : (isWhite ? -1 : 1);
        let promoRow = dir === 1 ? 7 : 0;

        let finalPiece = piece;
        if (lastStep.toR === promoRow && !piece.includes('dama')) {
            finalPiece = pureColor + '-dama';
            undoData.wasPromoted = true;
        }

        board[lastStep.toR][lastStep.toC] = finalPiece;
        return undoData;
    },

    undoMove(board, undoData) {
        let lastStep = undoData.path[undoData.path.length - 1];
        let startStep = undoData.path[0];

        board[lastStep.toR][lastStep.toC] = null;
        board[startStep.fromR][startStep.fromC] = undoData.startPiece;

        for (let cap of undoData.captures) {
            board[cap.r][cap.c] = cap.p;
        }
    },

    coreMinimax(board, depth, alpha = -Infinity, beta = Infinity, maximizingPlayer = true, aiColor, pieceDirection = null, startTime = Date.now(), maxTime = 4000) {
        if (Date.now() - startTime > maxTime) {
            return { score: this.evaluateBoard(board, aiColor, pieceDirection), timeOut: true };
        }

        if (depth === 0) { return { score: this.evaluateBoard(board, aiColor, pieceDirection) }; }

        let currentColor = maximizingPlayer ? aiColor : (aiColor === 'white' ? 'black' : 'white');
        let moves = gameEngine.generateAllTurnMoves(currentColor, board);

        if (moves.length === 0) { return { score: maximizingPlayer ? -999999 : 999999 }; }

        let aiDir = pieceDirection ? pieceDirection[currentColor] : (currentColor === 'white' ? -1 : 1);
        moves = this.orderMoves(moves, aiDir);
        let bestMove = moves[0];

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (let move of moves) {
                let undoData = this.doMove(board, move, pieceDirection); 
                let evaluation = this.coreMinimax(board, depth - 1, alpha, beta, false, aiColor, pieceDirection, startTime, maxTime);
                this.undoMove(board, undoData); 
                
                if (evaluation.timeOut) return { move: bestMove, score: maxEval === -Infinity ? this.evaluateBoard(board, aiColor, pieceDirection) : maxEval, timeOut: true };
                if (evaluation.score > maxEval) { maxEval = evaluation.score; bestMove = move; }
                alpha = Math.max(alpha, evaluation.score); if (beta <= alpha) break;
            }
            return { move: bestMove, score: maxEval };
        } else {
            let minEval = Infinity;
            for (let move of moves) {
                let undoData = this.doMove(board, move, pieceDirection);
                let evaluation = this.coreMinimax(board, depth - 1, alpha, beta, true, aiColor, pieceDirection, startTime, maxTime);
                this.undoMove(board, undoData);
                
                if (evaluation.timeOut) return { move: bestMove, score: minEval === Infinity ? this.evaluateBoard(board, aiColor, pieceDirection) : minEval, timeOut: true };
                if (evaluation.score < minEval) { minEval = evaluation.score; bestMove = move; }
                beta = Math.min(beta, evaluation.score); if (beta <= alpha) break; 
            }
            return { move: bestMove, score: minEval };
        }
    },
    
    getBestMove(board, maxAllowedDepth, aiColor, pieceDirection, overrideMaxTime = null) {
        let startTime = Date.now();
        let maxTime = overrideMaxTime || 4000; 
        
        let fallbackMoves = gameEngine.generateAllTurnMoves(aiColor, board);
        let bestResult = { move: fallbackMoves[0], score: 0 }; 
        if (fallbackMoves.length === 0) return bestResult;

        for (let d = 1; d <= maxAllowedDepth; d++) {
            let result = this.coreMinimax(board, d, -Infinity, Infinity, true, aiColor, pieceDirection, startTime, maxTime);
            if (result.timeOut) {
                console.log(`[AI Engine] Timeout reached. Best depth calculated: ${d - 1}`);
                break;
            }
            bestResult = result;
            if (bestResult.score > 900000) break;
        }
        
        return bestResult;
    }
};

gameAI.minimax = function(board, depth, alpha, beta, maximizingPlayer, aiColor, pieceDirection, startTime, maxTime) {
    if (alpha === undefined) {
        return gameAI.getBestMove(board, depth, aiColor, pieceDirection, maxTime);
    }
    return gameAI.coreMinimax(board, depth, alpha, beta, maximizingPlayer, aiColor, pieceDirection, startTime, maxTime);
};
