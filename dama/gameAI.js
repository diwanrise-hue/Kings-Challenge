// gameAI.js
// الذكاء الاصطناعي الخاص باللعبة 🤖
// 🌟 (النسخة الهجينة والمطلقة): ذكاء الجراند ماستر المتقدم (Quiescence, Killer Heuristics)
// ⚖️ مضاف إليه: معاقبة التكرار (Anti-Looping) لتجنب الخسارة بالمماطلة حسب قوانين اللعبة.
// ==========================================
import { gameEngine } from './gameEngine.js';
import { gameState } from './gameState.js'; 

const AI_LEVELS = {
    1: { id: 1, depth: 1, randomChance: 0.50, maxTime: 500,  name: "مبتدئ جداً" },
    2: { id: 2, depth: 2, randomChance: 0.20, maxTime: 1000, name: "مبتدئ" },
    3: { id: 3, depth: 3, randomChance: 0.05, maxTime: 1500, name: "سهل" },
    4: { id: 4, depth: 3, randomChance: 0.00, maxTime: 2000, name: "متوسط" },
    5: { id: 5, depth: 4, randomChance: 0.00, maxTime: 3000, name: "صعب" },
    6: { id: 6, depth: 4, randomChance: 0.00, maxTime: 4000, name: "محترف" },
    7: { id: 7, depth: 5, randomChance: 0.00, maxTime: 5000, name: "أستاذ" },
    8: { id: 8, depth: 6, randomChance: 0.00, maxTime: 6000, name: "جراند ماستر" },
    9: { id: 9, depth: 8, randomChance: 0.00, maxTime: 8000, name: "الزعيم (مستحيل)" }
};

export const gameAI = {
    nodesEvaluated: 0,
    killerMoves: new Array(30).fill(null), // خوارزمية الحركات القاتلة

    // دالة مساعدة لمحاكاة الحركة
    applyMoveToBoard(board, movePath, color, pieceDir) {
        let newBoard = board.map(row => [...row]);
        if (!movePath || movePath.length === 0) return newBoard;
        
        let startR = movePath[0].fromR;
        let startC = movePath[0].fromC;
        let piece = newBoard[startR][startC];
        newBoard[startR][startC] = null;
        
        let lastStep = movePath[movePath.length - 1];
        let endR = lastStep.toR;
        let endC = lastStep.toC;
        
        for (let step of movePath) {
            if (step.midR !== null && step.midC !== null && step.midR !== undefined) {
                newBoard[step.midR][step.midC] = null;
            }
        }
        
        let promoRow = (pieceDir[color] === 1) ? 7 : 0;
        if (endR === promoRow && !piece.includes('dama')) {
            piece += '-dama';
        }
        
        newBoard[endR][endC] = piece;
        return newBoard;
    },

    // 💡 التقييم الاستراتيجي الدقيق (من aiWorker.js)
    evaluateBoard(board, aiColor, pieceDirection, levelNum) {
        let score = 0;
        let oppColor = aiColor === 'white' ? 'black' : 'white';
        let myDir = pieceDirection[aiColor];
        let oppDir = pieceDirection[oppColor];
        
        let myPieces = 0, oppPieces = 0;
        let myDamas = 0, oppDamas = 0;

        // إحصاء القطع أولاً لتحديد مرحلة اللعبة (Endgame أم Midgame)
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = board[r][c];
                if (p) {
                    if (p.startsWith(aiColor)) { myPieces++; if (p.includes('dama')) myDamas++; }
                    else { oppPieces++; if (p.includes('dama')) oppDamas++; }
                }
            }
        }

        let isEndgame = (myPieces + oppPieces) <= 8;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = board[r][c];
                if (!piece) continue;
                
                let isMine = piece.startsWith(aiColor);
                let isDama = piece.includes('dama');
                let sign = isMine ? 1 : -1;
                let pDir = isMine ? myDir : oppDir;
                let pColor = isMine ? aiColor : oppColor;
                let eColor = isMine ? oppColor : aiColor;
                
                // التقييم الأساسي
                let pieceValue = isDama ? 500 : 100;
                score += pieceValue * sign;
                
                if (levelNum >= 4 && !isDama) {
                    let progress = (pDir === 1) ? r : (7 - r);
                    score += (progress * 2) * sign; 
                    if (c === 0 || c === 7) score += 5 * sign; 
                }

                if (levelNum >= 6 && !isDama) {
                    let backR = r - pDir;
                    if (backR >= 0 && backR < 8 && board[backR][c] && board[backR][c].startsWith(pColor)) score += 3 * sign;
                    if ((c > 0 && board[r][c-1] && board[r][c-1].startsWith(pColor)) ||
                        (c < 7 && board[r][c+1] && board[r][c+1].startsWith(pColor))) {
                        score += 2 * sign; 
                    }
                }

                if (levelNum >= 7 && !isDama) {
                    let frontR = r + pDir;
                    let backR = r - pDir;
                    if (frontR >= 0 && frontR < 8 && backR >= 0 && backR < 8) {
                        let frontCell = board[frontR][c];
                        let backCell = board[backR][c];
                        if (frontCell && frontCell.startsWith(eColor) && !backCell) score -= 15 * sign;
                    }
                    let backRow = (pDir === 1) ? 0 : 7;
                    if (r === backRow) score += 8 * sign;
                }

                // الديناميكية في نهاية اللعبة (Endgame Trapping)
                if (levelNum >= 8 && isEndgame) {
                    if (isDama) {
                        let centerDist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                        if (myPieces > oppPieces) {
                            score -= (centerDist * 5) * sign; // احتلال المركز بقوة إذا كان فائزاً
                        } else {
                            score += (centerDist * 3) * sign; // الهرب للحواف لتأخير الخسارة
                        }
                    }
                } else if (isDama) {
                    let centerDist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                    score -= (centerDist * 2) * sign;
                }
            }
        }

        // مكافأة الحسم في النهاية
        if (levelNum >= 8 && isEndgame) {
            if (myDamas > 0 && oppPieces === 0) score += 10000;
        }

        return score;
    },

    // 🔍 البحث الهادئ (Quiescence Search) لكشف الفخاخ
    // (تعمل بشكل متزامن Sync لضمان أقصى سرعة لأنها تفحص الأكل فقط)
    quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, depthLimit) {
        this.nodesEvaluated++;
        let standPat = this.evaluateBoard(board, aiColor, pieceDirection, levelNum);
        
        if (depthLimit <= 0) return standPat;

        if (isMaximizing) {
            if (standPat >= beta) return beta;
            if (alpha < standPat) alpha = standPat;
        } else {
            if (standPat <= alpha) return alpha;
            if (beta > standPat) beta = standPat;
        }

        let allMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
        let captures = allMoves.filter(m => m.some(step => step.midR !== null));
        
        if (captures.length === 0) return standPat;

        for (let move of captures) {
            let newBoard = this.applyMoveToBoard(board, move, currentTurn, pieceDirection);
            let nextTurn = currentTurn === 'white' ? 'black' : 'white';
            
            let score = this.quiescence(newBoard, alpha, beta, !isMaximizing, nextTurn, aiColor, pieceDirection, levelNum, depthLimit - 1);
            
            if (isMaximizing) {
                if (score >= beta) return beta;
                if (score > alpha) alpha = score;
            } else {
                if (score <= alpha) return alpha;
                if (score < beta) beta = score;
            }
        }
        return isMaximizing ? alpha : beta;
    },

    async getBestMoveAsync(virtualBoard, levelStr, aiColor, pieceDirection) {
        let levelNum = parseInt(levelStr) || 3;
        const currentLevel = AI_LEVELS[levelNum] || AI_LEVELS[3];

        let moves = gameEngine.generateAllTurnMoves(aiColor, virtualBoard);

        if (moves.length === 0) return null; 
        if (moves.length === 1) return moves[0];

        // نسبة العشوائية للمستويات السهلة
        if (Math.random() < currentLevel.randomChance) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        let startTime = Date.now();
        let bestMoveGlobal = moves[0]; 
        const self = this;
        this.nodesEvaluated = 0;
        this.killerMoves.fill(null);

        // 🧠 خوارزمية Minimax الرئيسية (تعمل بشكل غير متزامن لمنع التجميد)
        async function minimax(board, depth, isMaximizing, alpha, beta, currentTurn, currentMovesNoProg, isRoot = false) {
            self.nodesEvaluated++;
            
            // تجنب تجميد الواجهة (Main Thread) بإعطاء استراحة للمتصفح
            if (self.nodesEvaluated % 500 === 0) {
                await new Promise(r => setTimeout(r, 0)); 
            }

            if (Date.now() - startTime >= currentLevel.maxTime) {
                return { score: self.evaluateBoard(board, aiColor, pieceDirection, levelNum), timeout: true };
            }

            if (currentMovesNoProg >= 50) return { score: 0 }; 

            if (depth === 0) {
                // تفعيل البحث الهادئ (Quiescence) في المستويات العليا
                if (levelNum >= 7) {
                    return { score: self.quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, 4) };
                } else {
                    return { score: self.evaluateBoard(board, aiColor, pieceDirection, levelNum) };
                }
            }

            let possibleMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
            
            if (possibleMoves.length === 0) return { score: isMaximizing ? -99999 : 99999 };

            // ترتيب الحركات (Move Ordering) لتسريع التقليم
            if (levelNum >= 8) {
                possibleMoves.sort((a, b) => {
                    let aCapture = a.some(s => s.midR !== null) ? 100 : 0;
                    let bCapture = b.some(s => s.midR !== null) ? 100 : 0;
                    let aKiller = (self.killerMoves[depth] === a) ? 50 : 0;
                    let bKiller = (self.killerMoves[depth] === b) ? 50 : 0;
                    return (bCapture + bKiller) - (aCapture + aKiller);
                });
            }

            let bestMove = null;
            let isTimeout = false;

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let move of possibleMoves) {
                    let isCapture = move.some(s => s.midR !== null);
                    let lastStep = move[move.length - 1];
                    let piece = board[move[0].fromR][move[0].fromC];
                    let promoRow = (pieceDirection[currentTurn] === 1) ? 7 : 0;
                    let isPromotion = (lastStep.toR === promoRow && !piece.includes('dama'));
                    
                    let nextMovesNoProg = (isCapture || isPromotion) ? 0 : currentMovesNoProg + 1;
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    let result = await minimax(newBoard, depth - 1, false, alpha, beta, nextTurn, nextMovesNoProg, false);
                    if (result.timeout) isTimeout = true;
                    
                    // ⚖️ آلية منع التكرار (Anti-Looping) - تطبق فقط على الجذر لحركات الذكاء الاصطناعي
                    let moveRepPenalty = 0;
                    if (isRoot && currentTurn === aiColor) {
                        let startR = move[0].fromR, startC = move[0].fromC;
                        let endR = move[move.length - 1].toR, endC = move[move.length - 1].toC;
                        if (gameState.pieceHistories && gameState.pieceHistories[aiColor]) {
                            let tracker = gameState.pieceHistories[aiColor];
                            if (tracker.r === startR && tracker.c === startC) { 
                                let targetStr = `${endR},${endC}`;
                                let count = 0;
                                for (let pos of tracker.history) { if (pos === targetStr) count++; }
                                if (count === 2) moveRepPenalty = -15;     // إنذار: خصم نقاط
                                if (count >= 3) moveRepPenalty = -99999;  // عقوبة قاتلة: تجنب الحركة تماماً
                            }
                        }
                    }

                    let randomNoise = isRoot ? (Math.random() * 0.1) : 0;
                    let currentScore = result.score + moveRepPenalty + randomNoise;

                    if (currentScore > maxEval) { maxEval = currentScore; bestMove = move; }
                    alpha = Math.max(alpha, currentScore);
                    
                    if (beta <= alpha) {
                        if (levelNum >= 8 && !isCapture) self.killerMoves[depth] = move; // تسجيل الحركة القاتلة
                        break; 
                    }
                }
                return { score: maxEval, move: bestMove, timeout: isTimeout };
            } else {
                let minEval = Infinity;
                for (let move of possibleMoves) {
                    let isCapture = move.some(s => s.midR !== null);
                    let lastStep = move[move.length - 1];
                    let piece = board[move[0].fromR][move[0].fromC];
                    let promoRow = (pieceDirection[currentTurn] === 1) ? 7 : 0;
                    let isPromotion = (lastStep.toR === promoRow && !piece.includes('dama'));
                    
                    let nextMovesNoProg = (isCapture || isPromotion) ? 0 : currentMovesNoProg + 1;
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    let result = await minimax(newBoard, depth - 1, true, alpha, beta, nextTurn, nextMovesNoProg, false);
                    if (result.timeout) isTimeout = true;
                    
                    if (result.score < minEval) { minEval = result.score; bestMove = move; }
                    beta = Math.min(beta, result.score);
                    
                    if (beta <= alpha) {
                        if (levelNum >= 8 && !isCapture) self.killerMoves[depth] = move;
                        break; 
                    }
                }
                return { score: minEval, move: bestMove, timeout: isTimeout };
            }
        }

        // Iterative Deepening (التعمق التدريجي) لضمان الحصول على أفضل حركة في حدود الوقت
        for (let currentDepth = 2; currentDepth <= currentLevel.depth; currentDepth++) {
            let currentIdleMoves = gameState.movesWithoutProgress || 0;
            let result = await minimax(virtualBoard, currentDepth, true, -Infinity, Infinity, aiColor, currentIdleMoves, true);
            
            if (result.move && !result.timeout) {
                bestMoveGlobal = result.move;
            }
            if (result.timeout || Date.now() - startTime >= currentLevel.maxTime) break;
            if (Math.abs(result.score) > 90000) break; // وجد كش مات
        }

        return bestMoveGlobal;
    }
};
