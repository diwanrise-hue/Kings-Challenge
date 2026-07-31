// gameAI.js
import { gameEngine } from './gameEngine.js';

export const gameAI = {
    // 1. دالة التقييم الشاملة للرقعة (عقل الخبير)
    evaluateBoard(board, aiColor, pieceDirection) {
        let score = 0;
        let aiDir = pieceDirection ? pieceDirection[aiColor] : (aiColor === 'white' ? 1 : -1);
        let backRow = aiDir === 1 ? 0 : 7;
        let promoRow = aiDir === 1 ? 7 : 0;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = board[r][c];
                if (!piece) continue;

                let isAi = piece.startsWith(aiColor);
                let isDama = piece.includes('dama');
                
                let pieceScore = 0;

                if (isDama) {
                    pieceScore = 1500; // الدامة لها قيمة عليا
                    // الدامة في المنتصف تسيطر على مسارات أكثر
                    if (r > 1 && r < 6 && c > 1 && c < 6) pieceScore += 80; 
                } else {
                    pieceScore = 100; // الحجر العادي
                    
                    // أ) التقدم نحو الترقية (كلما اقترب زادت قيمته، تهديد مستمر)
                    let advancement = Math.abs(r - backRow);
                    pieceScore += advancement * 15;
                    
                    // ب) حماية الصف الخلفي (أهم استراتيجية لمنع الخصم من الترقية)
                    if (r === backRow) pieceScore += 40;

                    // ج) السيطرة على الوسط (المناطق الجانبية أضعف)
                    if (c >= 2 && c <= 5) pieceScore += 15;
                    
                    // د) تكوين الجدران (إذا كان هناك حجر صديق خلفه يحميه)
                    let behindR = r - aiDir;
                    if (behindR >= 0 && behindR <= 7 && board[behindR][c] && board[behindR][c].startsWith(isAi ? aiColor : (aiColor === 'white' ? 'black' : 'white'))) {
                        pieceScore += 10;
                    }
                }

                // إضافة أو طرح النقاط
                if (isAi) {
                    score += pieceScore;
                } else {
                    score -= pieceScore;
                }
            }
        }
        return score;
    },

    // 2. ترتيب الحركات (الأولوية للضربات القاضية لتسريع البحث)
    orderMoves(moves, aiDir) {
        let promoRow = aiDir === 1 ? 7 : 0;

        return moves.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            // حركات الأكل لها أولوية قصوى (كلما أكل أكثر كان أهم)
            let capturesA = a.filter(step => step.midR !== null).length;
            let capturesB = b.filter(step => step.midR !== null).length;
            scoreA += capturesA * 1000;
            scoreB += capturesB * 1000;

            // حركات الترقية لها أولوية عالية
            if (a[a.length - 1].toR === promoRow) scoreA += 500;
            if (b[b.length - 1].toR === promoRow) scoreB += 500;

            return scoreB - scoreA; // ترتيب تنازلي
        });
    },

    // 3. محاكاة سريعة للرقعة
    simulateMove(board, moveObj, isWhiteStr) {
        let newBoard = JSON.parse(JSON.stringify(board)); // Clone
        let startPiece = newBoard[moveObj[0].fromR][moveObj[0].fromC];
        let lastStep = null;

        for (let step of moveObj) {
            newBoard[step.fromR][step.fromC] = null;
            if (step.midR !== null) {
                newBoard[step.midR][step.midC] = null; // إزالة الحجر المأكول
            }
            lastStep = step;
        }

        if (lastStep && startPiece) {
            // التحقق من الترقية
            let isDama = startPiece.includes('dama');
            if (!isDama) {
                let isWhite = startPiece.includes('white');
                if ((isWhite && lastStep.toR === 7) || (!isWhite && lastStep.toR === 0)) {
                    startPiece += '-dama';
                }
            }
            newBoard[lastStep.toR][lastStep.toC] = startPiece;
        }

        return newBoard;
    },

    // 4. خوارزمية Minimax الأساسية مع ألفا-بيتا وقيد زمني
    minimax(board, depth, alpha = -Infinity, beta = Infinity, maximizingPlayer = true, aiColor, pieceDirection = null, startTime = Date.now(), maxTime = 4000) {
        // حماية من تجمد الهاتف: إيقاف الحسابات إذا استغرقت أكثر من 4 ثواني
        if (Date.now() - startTime > maxTime) {
            return { score: this.evaluateBoard(board, aiColor, pieceDirection), timeOut: true };
        }

        if (depth === 0) {
            return { score: this.evaluateBoard(board, aiColor, pieceDirection) };
        }

        let currentColor = maximizingPlayer ? aiColor : (aiColor === 'white' ? 'black' : 'white');
        let moves = gameEngine.generateAllTurnMoves(currentColor, board);

        if (moves.length === 0) {
            // هزيمة حتمية
            return { score: maximizingPlayer ? -999999 : 999999 };
        }

        let aiDir = pieceDirection ? pieceDirection[currentColor] : (currentColor === 'white' ? 1 : -1);
        moves = this.orderMoves(moves, aiDir);

        let bestMove = moves[0];

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (let move of moves) {
                let newBoard = this.simulateMove(board, move);
                let evaluation = this.minimax(newBoard, depth - 1, alpha, beta, false, aiColor, pieceDirection, startTime, maxTime);
                
                if (evaluation.timeOut) return { move: bestMove, score: maxEval, timeOut: true };

                if (evaluation.score > maxEval) {
                    maxEval = evaluation.score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, evaluation.score);
                if (beta <= alpha) break; // Pruning
            }
            return { move: bestMove, score: maxEval };
        } else {
            let minEval = Infinity;
            for (let move of moves) {
                let newBoard = this.simulateMove(board, move);
                let evaluation = this.minimax(newBoard, depth - 1, alpha, beta, true, aiColor, pieceDirection, startTime, maxTime);
                
                if (evaluation.timeOut) return { move: bestMove, score: minEval, timeOut: true };

                if (evaluation.score < minEval) {
                    minEval = evaluation.score;
                    bestMove = move;
                }
                beta = Math.min(beta, evaluation.score);
                if (beta <= alpha) break; // Pruning
            }
            return { move: bestMove, score: minEval };
        }
    },
    
    // دالة الغلاف (Wrapper) للحفاظ على التوافق مع باقي الكود القديم وتطبيق التعميق التدريجي
    getBestMove(board, maxAllowedDepth, aiColor, pieceDirection) {
        let startTime = Date.now();
        let maxTime = 4000; // أقصى حد للتفكير 4 ثواني للمستويات المستحيلة
        let bestResult = null;
        
        // نظام Iterative Deepening: نبدأ من عمق 1 ونزيد حتى ننتهي أو ينتهي الوقت
        for (let d = 1; d <= maxAllowedDepth; d++) {
            let result = this.minimax(board, d, -Infinity, Infinity, true, aiColor, pieceDirection, startTime, maxTime);
            if (result.timeOut) {
                console.log(`[AI Engine] Timeout reached. Best depth calculated: ${d - 1}`);
                break;
            }
            bestResult = result;
            
            // إذا وجد حركة فوز حتمية، لا داعي لإكمال التفكير
            if (bestResult.score > 900000) break;
        }
        
        return bestResult;
    }
};

// ضمان توافقية الكود القديم الذي كان ينادي minimax مباشرة في ملفات Worker
const originalMinimax = gameAI.minimax;
gameAI.minimax = function(board, depth, alpha, beta, maximizingPlayer, aiColor, pieceDirection) {
    if (alpha === undefined) {
        // الاستدعاء من الكود القديم، نقوم بإعادة توجيهه للمحرك الجديد القوي
        return gameAI.getBestMove(board, depth, aiColor, pieceDirection);
    }
    return originalMinimax.call(this, board, depth, alpha, beta, maximizingPlayer, aiColor, pieceDirection);
};
