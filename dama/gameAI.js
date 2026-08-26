// gameAI.js
// الذكاء الاصطناعي الخاص باللعبة 🤖
// نسخة "الجراند ماستر": ذكاء استراتيجي يعتمد على شكل الساحة،
// سد الثغرات، التماسك، وحماية الجدران بدون زيادة عمق التفكير!
// ==========================================
import { gameEngine } from './gameEngine.js';
import { gameState } from './gameState.js'; 

export const gameAI = {
    // دالة مساعدة لمحاكاة الحركة على لوحة تخيلية بدون التأثير على اللعبة الأصلية
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
        
        // إزالة القطع المأكولة من الرقعة التخيلية
        for (let step of movePath) {
            if (step.midR !== null && step.midC !== null && step.midR !== undefined) {
                newBoard[step.midR][step.midC] = null;
            }
        }
        
        // الترقية لدامة (الملك)
        let promoRow = (pieceDir[color] === 1) ? 7 : 0;
        if (endR === promoRow && !piece.includes('dama')) {
            piece += '-dama';
        }
        
        newBoard[endR][endC] = piece;
        return newBoard;
    },

    async getBestMoveAsync(virtualBoard, levelStr, aiColor, pieceDirection) {
        let level = parseInt(levelStr) || 3;
        let moves = gameEngine.generateAllTurnMoves(aiColor, virtualBoard);

        // 1. الخروج المبكر: إذا كانت الحركة إجبارية (لا تفكر)
        if (moves.length === 1) {
            return moves[0];
        }
        
        if (moves.length === 0) return null; 

        // 2. المستوى 1 (عشوائي)
        if (level === 1) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        // 3. إعدادات العمق والوقت
        let maxAllowedDepth = 3;
        let timeLimitMs = 2000; 

        switch(level) {
            case 2: maxAllowedDepth = 2; timeLimitMs = 1000; break;
            case 3: maxAllowedDepth = 3; timeLimitMs = 1500; break;
            case 4: maxAllowedDepth = 4; timeLimitMs = 2000; break;
            case 5: maxAllowedDepth = 5; timeLimitMs = 3000; break;
            case 6: maxAllowedDepth = 6; timeLimitMs = 4000; break;
            case 7: maxAllowedDepth = 7; timeLimitMs = 5000; break;
            case 8: maxAllowedDepth = 8; timeLimitMs = 6000; break;
            case 9: maxAllowedDepth = 25; timeLimitMs = 8000; break; 
        }

        let startTime = Date.now();
        let bestMoveGlobal = moves[0]; 
        let operationsCount = 0;
        const self = this;

        // 💡 دالة التقييم الاستراتيجية (السر كله هنا)
        function evaluateBoard(board, currentTurn) {
            let score = 0;
            let oppColor = aiColor === 'white' ? 'black' : 'white';
            let myDir = pieceDirection[aiColor];
            let oppDir = pieceDirection[oppColor];
            
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
                    
                    // أ. قيمة الحجر (رفعنا قيمة الدامة لتشجيع صناعتها)
                    let pieceValue = isDama ? 150 : 10;
                    score += pieceValue * sign;
                    
                    if (!isDama) {
                        // ب. التقدم للأمام
                        if (level >= 3) {
                            let progress = (pDir === 1) ? r : (7 - r);
                            score += (progress * 1.5) * sign; 
                        }

                        // ج. استغلال الحواف (الجدران آمنة)
                        if (level >= 4) {
                            if (c === 0 || c === 7) {
                                score += 3 * sign; // مكافأة قوية للوقوف على الجدار الجانبي
                            }
                        }

                        // د. التماسك والدعم (Phalanx Formation)
                        if (level >= 5) {
                            let backR = r - pDir;
                            // دعم من الخلف (يمنع الأكل المباشر)
                            if (backR >= 0 && backR < 8 && board[backR][c] && board[backR][c].startsWith(pColor)) {
                                score += 2 * sign;
                            }
                            // دعم جانبي (بناء حائط)
                            if ((c > 0 && board[r][c-1] && board[r][c-1].startsWith(pColor)) ||
                                (c < 7 && board[r][c+1] && board[r][c+1].startsWith(pColor))) {
                                score += 1.5 * sign; 
                            }
                        }

                        // هـ. سد الثغرات وتجنب الفخاخ (Gap Penalty)
                        if (level >= 6) {
                            let frontR = r + pDir;
                            let backR = r - pDir;
                            // إذا كان أمامي عدو، وخلفي مربع فارغ.. فهذه ثغرة قاتلة!
                            if (frontR >= 0 && frontR < 8 && backR >= 0 && backR < 8) {
                                let frontCell = board[frontR][c];
                                let backCell = board[backR][c];
                                if (frontCell && frontCell.startsWith(eColor) && !backCell) {
                                    score -= 6 * sign; // عقوبة ضخمة لإجبار البوت على سد الثغرة أو الهرب
                                }
                            }
                        }

                        // و. حماية الخط الخلفي (لمنع الخصم من الترقية)
                        if (level >= 7) {
                            let backRow = (pDir === 1) ? 0 : 7;
                            if (r === backRow) {
                                score += 4 * sign; // مكافأة للبقاء كحارس للخط الخلفي
                            }
                        }
                    } else {
                        // ز. استراتيجية الدامة: التمركز الهجومي (Centralization)
                        let centerDist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                        score -= (centerDist * 0.8) * sign; // كلما اقتربت الدامة من المركز لتقطع الطرق، زاد التقييم
                    }
                }
            }
            return score;
        }

        // 💡 خوارزمية Minimax المتقدمة 
        async function minimax(board, depth, isMaximizing, alpha, beta, currentTurn, currentMovesNoProg, isRoot = false) {
            operationsCount++;
            
            // إراحة معالج الهاتف كل 500 عملية لكي تظل الشاشة سلسة
            if (operationsCount % 500 === 0) {
                await new Promise(r => setTimeout(r, 0)); 
            }

            // 🛑 شرط التوقف القسري لنفاد الوقت
            if (Date.now() - startTime >= timeLimitMs) {
                return { score: evaluateBoard(board, currentTurn), timeout: true };
            }

            // 💡 قانون الـ 50 حركة للخمول
            if (currentMovesNoProg >= 50) {
                return { score: 0 }; 
            }

            if (depth === 0) {
                return { score: evaluateBoard(board, currentTurn) };
            }

            let possibleMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
            
            if (possibleMoves.length === 0) {
                return { score: isMaximizing ? -99999 : 99999 }; // حالة الخسارة أو الفوز المؤكدة
            }

            let randomNoise = Math.random() * 0.1;
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
                    
                    // 💡 قانون التكرار (اللعب بنزاهة)
                    let moveRepPenalty = 0;
                    if (isRoot && currentTurn === aiColor) {
                        let startR = move[0].fromR, startC = move[0].fromC;
                        let endR = move[move.length - 1].toR, endC = move[move.length - 1].toC;
                        
                        if (gameState.pieceHistories && gameState.pieceHistories[aiColor]) {
                            let tracker = gameState.pieceHistories[aiColor];
                            if (tracker.r === startR && tracker.c === startC) { 
                                let targetStr = `${endR},${endC}`;
                                let count = 0;
                                for (let pos of tracker.history) {
                                    if (pos === targetStr) count++;
                                }
                                if (count === 2) moveRepPenalty = -15;  
                                if (count >= 3) moveRepPenalty = -99999; 
                            }
                        }
                    }

                    let currentScore = result.score + moveRepPenalty + randomNoise;

                    if (currentScore > maxEval) {
                        maxEval = currentScore;
                        bestMove = move;
                    }
                    alpha = Math.max(alpha, currentScore);
                    if (beta <= alpha) break; // التقليم (Pruning) 
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
                    
                    if (result.score < minEval) {
                        minEval = result.score;
                        bestMove = move;
                    }
                    beta = Math.min(beta, result.score);
                    if (beta <= alpha) break; // التقليم
                }
                return { score: minEval, move: bestMove, timeout: isTimeout };
            }
        }

        // 💡 التعمق التدريجي (Iterative Deepening)
        for (let currentDepth = 2; currentDepth <= maxAllowedDepth; currentDepth++) {
            let currentIdleMoves = gameState.movesWithoutProgress || 0;
            let result = await minimax(virtualBoard, currentDepth, true, -Infinity, Infinity, aiColor, currentIdleMoves, true);
            
            if (result.move && !result.timeout) {
                bestMoveGlobal = result.move;
            }
            
            if (result.timeout || Date.now() - startTime >= timeLimitMs) {
                break;
            }
            if (Math.abs(result.score) > 90000) break;
        }

        return bestMoveGlobal;
    }
};
