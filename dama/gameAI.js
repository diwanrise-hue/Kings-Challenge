// ==========================================
// ملف: gameAI.js
// الذكاء الاصطناعي الخاص باللعبة 🤖
// ==========================================
import { gameEngine } from './gameEngine.js';

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

        // 💡 1. الخروج المبكر (Early Exit): لا ترهق المعالج إذا كانت الحركة إجبارية ووحيدة!
        if (moves.length === 1) {
            console.log(`🤖 AI [Level ${level}]: خيار وحيد إجباري، تم تجاوز التفكير لتوفير المعالج!`);
            return moves[0];
        }
        
        if (moves.length === 0) return null; // خسارة البوت

        // 💡 2. المستوى 1 (المبتدئ - عشوائي تام وسريع)
        if (level === 1) {
            console.log(`🤖 AI [Level 1]: لعب عشوائي سريع.`);
            return moves[Math.floor(Math.random() * moves.length)];
        }

        // 💡 3. إعدادات الـ 9 مستويات (العمق والوقت المسموح)
        let maxAllowedDepth = 3;
        let timeLimitMs = 2000; // الافتراضي

        switch(level) {
            case 2: maxAllowedDepth = 2; timeLimitMs = 1000; break;
            case 3: maxAllowedDepth = 3; timeLimitMs = 1500; break;
            case 4: maxAllowedDepth = 4; timeLimitMs = 2000; break;
            case 5: maxAllowedDepth = 5; timeLimitMs = 3000; break;
            case 6: maxAllowedDepth = 6; timeLimitMs = 4000; break;
            case 7: maxAllowedDepth = 7; timeLimitMs = 5000; break;
            case 8: maxAllowedDepth = 8; timeLimitMs = 6000; break;
            case 9: maxAllowedDepth = 25; timeLimitMs = 8000; break; // 👑 الزعيم: عمق شبه مفتوح، أقصى حد 8 ثوانٍ
        }

        let startTime = Date.now();
        let bestMoveGlobal = moves[0]; // الحركة الافتراضية
        let operationsCount = 0;
        const self = this;

        // 💡 دالة التقييم (Heuristics) لتحديد ذكاء البوت بناءً على مستواه
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
                    
                    // أ. القيمة الأساسية للقطعة
                    let pieceValue = isDama ? 100 : 10;
                    score += pieceValue * sign;
                    
                    // ب. المحترفون (المستوى 4+): الأولوية للتقدم نحو صناعة الدامة
                    if (level >= 4 && !isDama) {
                        let progress = (myDir === 1) ? r : (7 - r);
                        score += (progress * 2) * sign; 
                    }
                    
                    // ج. الخبراء (المستوى 5+): السيطرة على الوسط وحماية الحواف
                    if (level >= 5) {
                        if (c === 0 || c === 7) score += 3 * sign; // الحواف آمنة
                        if ((r >= 3 && r <= 4) && (c >= 3 && c <= 4)) score += 4 * sign; // السيطرة على الوسط
                    }
                    
                    // د. الزعماء (المستوى 6+): حماية الصف الخلفي بشراسة لمنع الخصم من صنع دامة
                    if (level >= 6 && !isDama) {
                        let backRow = (myDir === 1) ? 0 : 7;
                        if (r === backRow) score += 6 * sign; 
                    }
                }
            }
            return score;
        }

        // 💡 خوارزمية Minimax المتقدمة (مع Alpha-Beta وتقسيم الوقت لمنع تجميد الشاشة)
        async function minimax(board, depth, isMaximizing, alpha, beta, currentTurn) {
            operationsCount++;
            
            // إراحة معالج الهاتف كل 500 عملية لكي تظل الشاشة سلسة ولا تتجمد أبداً (0.00ms Blocking)
            if (operationsCount % 500 === 0) {
                await new Promise(r => setTimeout(r, 0)); 
            }

            // 🛑 شرط التوقف القسري: إذا تجاوزنا الوقت المسموح، نخرج فوراً لننقذ المعالج
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

            let bestMove = null;
            let isTimeout = false;

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let move of possibleMoves) {
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    let result = await minimax(newBoard, depth - 1, false, alpha, beta, nextTurn);
                    if (result.timeout) isTimeout = true;
                    
                    if (result.score > maxEval) {
                        maxEval = result.score;
                        bestMove = move;
                    }
                    alpha = Math.max(alpha, result.score);
                    if (beta <= alpha) break; // التقليم (Pruning) لتقليل الحسابات
                }
                return { score: maxEval, move: bestMove, timeout: isTimeout };
            } else {
                let minEval = Infinity;
                for (let move of possibleMoves) {
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    let result = await minimax(newBoard, depth - 1, true, alpha, beta, nextTurn);
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
        console.log(`🤖 AI [Level ${level}]: بدء التفكير العتيق... الحد الزمني: ${timeLimitMs}ms.`);
        
        for (let currentDepth = 2; currentDepth <= maxAllowedDepth; currentDepth++) {
            let result = await minimax(virtualBoard, currentDepth, true, -Infinity, Infinity, aiColor);
            
            // إذا اكتمل حساب العمق بنجاح (بدون أن يقطعه مؤقت الوقت)، احفظ حركته كأفضل حركة
            if (result.move && !result.timeout) {
                bestMoveGlobal = result.move;
                console.log(`🧠 AI: أنهى تحليل العمق ${currentDepth} بنجاح.`);
            }
            
            // 🛑 إذا نفد الوقت، توقف فوراً واستخدم الحركة المضمونة من العمق السابق (منع العشوائية)
            if (result.timeout || Date.now() - startTime >= timeLimitMs) {
                console.log(`⏱️ AI: تم إيقاف الغوص عند العمق ${currentDepth} لنفاد الوقت (${timeLimitMs/1000}s). الحركة المدروسة جاهزة.`);
                break;
            }
            
            // إذا وجد البوت فوزاً أو خسارة مؤكدة (Score > 90000)، فلا داعي لإرهاق المعالج بالغوص أكثر
            if (Math.abs(result.score) > 90000) break;
        }

        console.log(`✅ AI: اتخذ قراره الاستراتيجي خلال ${Date.now() - startTime}ms.`);
        return bestMoveGlobal;
    }
};
