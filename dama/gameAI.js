// ==========================================
// ملف: gameAI.js
// الذكاء الاصطناعي الخاص باللعبة 🤖
// تم تعليم البوت قوانين اللعب النزيه (تجنب المماطلة)،
// وإعطاء الدامة حافزاً لاحتلال الساحة بدلاً من الاهتزاز.
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

        // 💡 1. الخروج المبكر: إذا كانت الحركة إجبارية ووحيدة (مثل الأكل الإجباري)
        if (moves.length === 1) {
            console.log(`🤖 AI [Level ${level}]: خيار وحيد إجباري، العب بشرف ولا تفكر!`);
            return moves[0];
        }
        
        if (moves.length === 0) return null; // خسارة البوت

        // 💡 2. المستوى 1 (المبتدئ - عشوائي تام)
        if (level === 1) {
            console.log(`🤖 AI [Level 1]: لعب عشوائي سريع.`);
            return moves[Math.floor(Math.random() * moves.length)];
        }

        // 💡 3. إعدادات الـ 9 مستويات (العمق والوقت المسموح)
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
            case 9: maxAllowedDepth = 25; timeLimitMs = 8000; break; // الزعيم
        }

        let startTime = Date.now();
        let bestMoveGlobal = moves[0]; 
        let operationsCount = 0;
        const self = this;

        // 💡 دالة التقييم: تم تحسينها لتلعب اللعبة بشرف وهجومية
        function evaluateBoard(board, currentTurn) {
            let score = 0;
            let oppColor = aiColor === 'white' ? 'black' : 'white';
            
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    let piece = board[r][c];
                    if (!piece) continue;
                    
                    let isMine = piece.startsWith(aiColor);
                    let isDama = piece.includes('dama');
                    let sign = isMine ? 1 : -1;
                    let myDir = pieceDirection[isMine ? aiColor : oppColor];
                    
                    // أ. قيمة الحجر
                    let pieceValue = isDama ? 100 : 10;
                    score += pieceValue * sign;
                    
                    // ب. الأحجار العادية: الأولوية للتقدم للأمام والهجوم
                    if (level >= 4 && !isDama) {
                        let progress = (myDir === 1) ? r : (7 - r);
                        score += (progress * 2) * sign; 
                    }
                    
                    // ج. "توجيه الدامة": لكي لا تتردد الدامة وتماطل، نعطيها تقييماً إضافياً بسيطاً 
                    // إذا اقتربت من وسط الساحة لتبحث عن الاشتباك بدلاً من الزوايا
                    if (isDama) {
                        // حساب المسافة عن المركز التخيلي للرقعة (3.5, 3.5)
                        let centerDist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                        // نعطيها تقييم أعلى بقليل كلما اقتربت من المركز (تهاجم)
                        score -= (centerDist * 0.5) * sign; 
                    }
                    
                    // د. حماية الصف الخلفي للخبراء
                    if (level >= 6 && !isDama) {
                        let backRow = (myDir === 1) ? 0 : 7;
                        if (r === backRow) score += 6 * sign; 
                    }
                }
            }
            return score;
        }

        // 💡 خوارزمية Minimax المتقدمة 
        async function minimax(board, depth, isMaximizing, alpha, beta, currentTurn, isRoot = false) {
            operationsCount++;
            
            // إراحة معالج الهاتف كل 500 عملية لكي تظل الشاشة سلسة
            if (operationsCount % 500 === 0) {
                await new Promise(r => setTimeout(r, 0)); 
            }

            // 🛑 شرط التوقف القسري لنفاد الوقت
            if (Date.now() - startTime >= timeLimitMs) {
                return { score: evaluateBoard(board, currentTurn), timeout: true };
            }

            if (depth === 0) {
                return { score: evaluateBoard(board, currentTurn) };
            }

            let possibleMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
            
            if (possibleMoves.length === 0) {
                return { score: isMaximizing ? -99999 : 99999 }; // حالة الخسارة أو الفوز المؤكدة
            }

            // 💡 إضافة عامل عشوائي صغير جداً جداً لمنع التردد بين الحركات المتشابهة في التقييم
            let randomNoise = Math.random() * 0.1;

            let bestMove = null;
            let isTimeout = false;

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let move of possibleMoves) {
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    let result = await minimax(newBoard, depth - 1, false, alpha, beta, nextTurn, false);
                    if (result.timeout) isTimeout = true;
                    
                    // 💡 2. قانون التكرار (اللعب بنزاهة)
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
                                
                                // التكرار للمرة الثانية مسموح (اختياري)، لكن نخصم 10 نقاط خفيفة
                                // ليختار البوت حركة بديلة أفضل إن وجدت، لكنه سيكررها إذا كانت طوق نجاته الوحيد!
                                if (count === 2) moveRepPenalty = -10;  
                                
                                // التكرار للمرة الثالثة محرم تماماً (الابتعاد التام لمنع التحذير والخسارة)
                                if (count >= 3) moveRepPenalty = -99999; 
                            }
                        }
                    }

                    // حساب التقييم النهائي لهذه الحركة (مع التقييم العشوائي البسيط لمنع التردد)
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
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    let result = await minimax(newBoard, depth - 1, true, alpha, beta, nextTurn, false);
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
        console.log(`🤖 AI [Level ${level}]: بدء التفكير النزيه... الحد الزمني: ${timeLimitMs}ms.`);
        
        for (let currentDepth = 2; currentDepth <= maxAllowedDepth; currentDepth++) {
            let result = await minimax(virtualBoard, currentDepth, true, -Infinity, Infinity, aiColor, true);
            
            // إذا اكتمل حساب العمق بنجاح
            if (result.move && !result.timeout) {
                bestMoveGlobal = result.move;
                console.log(`🧠 AI: أنهى تحليل العمق ${currentDepth} بنجاح.`);
            }
            
            // 🛑 إذا نفد الوقت، توقف
            if (result.timeout || Date.now() - startTime >= timeLimitMs) {
                console.log(`⏱️ AI: تم إيقاف الغوص عند العمق ${currentDepth} لنفاد الوقت (${timeLimitMs/1000}s). الحركة جاهزة.`);
                break;
            }
            
            // إذا وجد البوت فوزاً أو خسارة مؤكدة
            if (Math.abs(result.score) > 90000) break;
        }

        console.log(`✅ AI: قرر الهجوم والمواجهة بشرف خلال ${Date.now() - startTime}ms.`);
        return bestMoveGlobal;
    }
};
