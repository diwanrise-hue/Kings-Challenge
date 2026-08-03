import { gameEngine } from './gameEngine.js';

export const gameAI = {
    workerInstance: null,
    workerFallbackTimer: null,
    nodesEvaluated: 0,

    getWorkerInstance() {
        if (!this.workerInstance) {
            try {
                // استدعاء الملف الحقيقي الذي رفعته أنت على GitHub
                // إضافة ?v=Date.now() تمنع المتصفح من تخزين نسخة قديمة وتجبره على التحديث
                this.workerInstance = new Worker('aiWorker.js?v=' + Date.now());
            } catch (error) {
                console.warn("⚠️ فشل إنشاء الـ Worker، سيتم استخدام البديل...", error);
                this.workerInstance = null;
            }
        }
        return this.workerInstance;
    },

    evaluateBoard(board, aiColor, pieceDirection) {
        let score = 0;
        let targetPure = aiColor.split('-')[0];
        let myDir = pieceDirection ? (pieceDirection[targetPure] !== undefined ? pieceDirection[targetPure] : (targetPure === 'black' ? 1 : -1)) : (targetPure === 'black' ? 1 : -1);
        let myBackRow = myDir === 1 ? 0 : 7;
        let oppBackRow = myDir === 1 ? 7 : 0;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = board[r][c];
                if (!piece) continue;
                let isTarget = piece.startsWith(targetPure);
                let isDama = piece.length > 5;
                let totalValue = (isDama ? 500 : 100) + (!isDama ? (isTarget ? Math.abs(r - myBackRow) * 5 : Math.abs(r - oppBackRow) * 5) : 0);
                if (isTarget) score += totalValue; else score -= totalValue;
            }
        }
        return score;
    },

    scoreMove(path, aiColor, pieceDirection) {
        let pureColor = aiColor.split('-')[0];
        let dir = pieceDirection ? (pieceDirection[pureColor] !== undefined ? pieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1)) : (pureColor === 'black' ? 1 : -1);
        return (path.filter(step => step.midR !== null).length * 1000) + (path[path.length - 1].toR === (dir === 1 ? 7 : 0) ? 500 : 0);
    },

    orderMoves(moves, aiColor, pieceDirection) {
        return moves.sort((a, b) => this.scoreMove(b, aiColor, pieceDirection) - this.scoreMove(a, aiColor, pieceDirection));
    },

    doMove(board, path, pieceDirection) {
        let piece = board[path[0].fromR][path[0].fromC];
        let undoData = { path: path, captures: [], startPiece: piece };
        board[path[0].fromR][path[0].fromC] = null;
        for (let step of path) {
            if (step.midR !== null) {
                undoData.captures.push({ r: step.midR, c: step.midC, p: board[step.midR][step.midC] });
                board[step.midR][step.midC] = null;
            }
        }
        let dir = pieceDirection[piece.split('-')[0]];
        board[path[path.length - 1].toR][path[path.length - 1].toC] = (path[path.length - 1].toR === (dir === 1 ? 7 : 0) && piece.length <= 5) ? piece.split('-')[0] + '-dama' : piece;
        return undoData;
    },

    undoMove(board, undoData) {
        board[undoData.path[undoData.path.length - 1].toR][undoData.path[undoData.path.length - 1].toC] = null;
        board[undoData.path[0].fromR][undoData.path[0].fromC] = undoData.startPiece;
        for (let cap of undoData.captures) {
            board[cap.r][cap.c] = cap.p;
        }
    },

    async coreMinimaxAsync(board, depth, alpha, beta, maximizingPlayer, aiColor, pieceDirection, startTime, maxTime) {
        this.nodesEvaluated++;
        if (this.nodesEvaluated % 20 === 0) {
            if (Date.now() - startTime > maxTime) return { score: this.evaluateBoard(board, aiColor, pieceDirection), timeOut: true };
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        if (depth <= 0) return { score: this.evaluateBoard(board, aiColor, pieceDirection) };

        let currentColor = maximizingPlayer ? aiColor : (aiColor === 'white' ? 'black' : 'white');
        let moves = gameEngine.generateAllTurnMoves(currentColor, board);
        if (moves.length === 0) return { score: maximizingPlayer ? -999999 : 999999 };

        moves = this.orderMoves(moves, currentColor, pieceDirection);
        let bestMove = moves[0];

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (let move of moves) {
                let undoData = this.doMove(board, move, pieceDirection);
                let evaluation = await this.coreMinimaxAsync(board, depth - 1, alpha, beta, false, aiColor, pieceDirection, startTime, maxTime);
                this.undoMove(board, undoData);
                if (evaluation.timeOut) return { move: bestMove, score: maxEval === -Infinity ? this.evaluateBoard(board, aiColor, pieceDirection) : maxEval, timeOut: true };
                if (evaluation.score > maxEval) { maxEval = evaluation.score; bestMove = move; }
                alpha = Math.max(alpha, evaluation.score);
                if (beta <= alpha) break;
            }
            return { move: bestMove, score: maxEval };
        } else {
            let minEval = Infinity;
            for (let move of moves) {
                let undoData = this.doMove(board, move, pieceDirection);
                let evaluation = await this.coreMinimaxAsync(board, depth - 1, alpha, beta, true, aiColor, pieceDirection, startTime, maxTime);
                this.undoMove(board, undoData);
                if (evaluation.timeOut) return { move: bestMove, score: minEval === Infinity ? this.evaluateBoard(board, aiColor, pieceDirection) : minEval, timeOut: true };
                if (evaluation.score < minEval) { minEval = evaluation.score; bestMove = move; }
                beta = Math.min(beta, evaluation.score);
                if (beta <= alpha) break;
            }
            return { move: bestMove, score: minEval };
        }
    },

    async minimaxFallbackAsync(board, maxAllowedDepth, aiColor, pieceDirection, maxTime) {
        let startTime = Date.now();
        this.nodesEvaluated = 0;
        let moves = gameEngine.generateAllTurnMoves(aiColor, board);
        if (moves.length === 0) return { move: null };
        if (moves.length === 1) return { move: moves[0] };

        let bestResult = { move: moves[0] };
        for (let d = 1; d <= Math.min(maxAllowedDepth, 4); d++) {
            let result = await this.coreMinimaxAsync(board, d, -Infinity, Infinity, true, aiColor, pieceDirection, startTime, maxTime);
            if (result.timeOut) break;
            bestResult = result;
        }
        return bestResult;
    },

    async getBestMoveAsync(board, level, aiColor, pieceDirection) {
        return new Promise(async (resolve) => {
            const fallbackTimes = [200, 300, 500, 700, 1000, 1200, 1400, 1600, 2100];
            const fallbackMaxTime = fallbackTimes[level - 1] || 1000;

            const runFallback = async () => {
                let fallbackResult = await this.minimaxFallbackAsync(board, level, aiColor, pieceDirection, Math.min(fallbackMaxTime, 1200));
                resolve(fallbackResult.move || null);
            };

            try {
                if (window.Worker) {
                    const worker = this.getWorkerInstance();
                    
                    if (!worker) {
                        return runFallback();
                    }

                    clearTimeout(this.workerFallbackTimer);
                    
                    // 💡 هنا الإصلاح الجذري: المهلة أصبحت 5000 ملي ثانية (5 ثوانٍ).
                    // هذا سيعطي البوت وقتاً كافياً للتحميل من GitHub وللتفكير حتى في أصعب المستويات
                    // دون أن نقوم بقتله بالخطأ.
                    this.workerFallbackTimer = setTimeout(() => {
                        console.warn("⏱️ تأخر الـ Worker جداً (أكثر من 5 ثوانٍ)، سيتم الانتقال للبديل...");
                        if (this.workerInstance) {
                            this.workerInstance.terminate();
                            this.workerInstance = null;
                        }
                        runFallback();
                    }, 5000); 

                    worker.onmessage = (e) => {
                        clearTimeout(this.workerFallbackTimer); // نجح البوت، فنلغي مؤقت القتل فوراً!
                        if (e.data && e.data.error) {
                            console.error("❌ خطأ تنفيذي داخل الـ Worker:", e.data.details);
                            runFallback();
                        } else {
                            resolve(e.data.move);
                        }
                    };

                    worker.onerror = (err) => {
                        console.error("❌ خطأ في تحميل الـ Worker:", err.message || err);
                        clearTimeout(this.workerFallbackTimer);
                        if (this.workerInstance) {
                            this.workerInstance.terminate();
                            this.workerInstance = null;
                        }
                        runFallback();
                    };

                    // إرسال البيانات للـ Worker ليبدأ التفكير
                    worker.postMessage({ board, level, aiColor, pieceDirection });
                } else {
                    await runFallback();
                }
            } catch (e) {
                console.error("❌ استثناء غير متوقع:", e);
                await runFallback();
            }
        });
    }
};
