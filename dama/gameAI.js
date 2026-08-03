// gameAI.js - مدير الذكاء الاصطناعي المطور لدعم الهواتف المحمولة والـ Blob Worker
import { gameEngine } from './gameEngine.js';

export const gameAI = {
    workerInstance: null,
    workerBlobUrl: null,
    workerFallbackTimer: null,
    nodesEvaluated: 0,

    // --- تهيئة الـ Worker مسبقاً في الذاكرة عبر Blob لضمان التشغيل الفوري والتغلب على تأخير الشبكة ---
    async initWorker() {
        if (this.workerBlobUrl) return;
        try {
            const response = await fetch('./aiWorker.js?v=' + Date.now());
            const code = await response.text();
            const blob = new Blob([code], { type: 'application/javascript' });
            this.workerBlobUrl = URL.createObjectURL(blob);
        } catch (e) {
            console.error("❌ فشل تحميل كود الـ Worker عبر Blob:", e);
        }
    },

    // --- نظام الذكاء البديل (Fallback AI) يعمل في الـ Main Thread عند التعثر ---
    evaluateBoard(board, aiColor, pieceDirection) {
        let score = 0;
        let targetPure = aiColor.split('-')[0];
        let oppPure = targetPure === 'white' ? 'black' : 'white';
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

    coreMinimax(board, depth, alpha, beta, maximizingPlayer, aiColor, pieceDirection, startTime, maxTime) {
        this.nodesEvaluated++;
        if (this.nodesEvaluated % 500 === 0 && Date.now() - startTime > maxTime) return { score: this.evaluateBoard(board, aiColor, pieceDirection), timeOut: true };
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
                let evaluation = this.coreMinimax(board, depth - 1, alpha, beta, false, aiColor, pieceDirection, startTime, maxTime);
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
                let evaluation = this.coreMinimax(board, depth - 1, alpha, beta, true, aiColor, pieceDirection, startTime, maxTime);
                this.undoMove(board, undoData);
                if (evaluation.timeOut) return { move: bestMove, score: minEval === Infinity ? this.evaluateBoard(board, aiColor, pieceDirection) : minEval, timeOut: true };
                if (evaluation.score < minEval) { minEval = evaluation.score; bestMove = move; }
                beta = Math.min(beta, evaluation.score);
                if (beta <= alpha) break;
            }
            return { move: bestMove, score: minEval };
        }
    },

    minimaxFallback(board, maxAllowedDepth, aiColor, pieceDirection, maxTime) {
        let startTime = Date.now();
        this.nodesEvaluated = 0;
        let moves = gameEngine.generateAllTurnMoves(aiColor, board);
        if (moves.length === 0) return { move: null };
        if (moves.length === 1) return { move: moves[0] };

        let bestResult = { move: moves[0] };
        for (let d = 1; d <= Math.min(maxAllowedDepth, 4); d++) {
            let result = this.coreMinimax(board, d, -Infinity, Infinity, true, aiColor, pieceDirection, startTime, maxTime);
            if (result.timeOut) break;
            bestResult = result;
        }
        return bestResult;
    },

    // --- مدير الذكاء الاصطناعي الرئيسي (Blob Worker + Timeout محسّن للهواتف) ---
    async getBestMoveAsync(board, level, aiColor, pieceDirection) {
        return new Promise(async (resolve) => {
            const fallbackTimes = [1000, 1500, 2000, 3000, 4000, 6000, 6000, 8000, 10000];
            const fallbackMaxTime = fallbackTimes[level - 1] || 2000;

            const runFallback = () => {
                console.log("⚠️ استخدام الذكاء الاصطناعي البديل (Fallback AI)...");
                let fallbackResult = this.minimaxFallback(board, level, aiColor, pieceDirection, Math.min(fallbackMaxTime, 1500));
                resolve(fallbackResult.move || null);
            };

            try {
                if (window.Worker) {
                    // 1. إنشاء رابط Blob من كود aiWorker.js لتفادي تأخير طلبات الشبكة
                    if (!this.workerBlobUrl) {
                        await this.initWorker();
                    }

                    // 2. تشغيل الـ Worker من الكائن المحفوظ بالذاكرة
                    if (!this.workerInstance && this.workerBlobUrl) {
                        this.workerInstance = new Worker(this.workerBlobUrl);
                    }

                    if (!this.workerInstance) return runFallback();

                    // 3. مهلة أمان ممتدة (+4000ms) لاستيعاب بطء معالجات الهواتف المحمولة
                    clearTimeout(this.workerFallbackTimer);
                    this.workerFallbackTimer = setTimeout(() => {
                        console.warn("⏱️ انتهت المهلة الزمنية للـ Worker، جاري تحويل للبديل...");
                        if (this.workerInstance) this.workerInstance.terminate();
                        this.workerInstance = null;
                        runFallback();
                    }, fallbackMaxTime + 4000);

                    // 4. استقبال الرد أو تقرير الأخطاء التنفيذية
                    this.workerInstance.onmessage = (e) => {
                        clearTimeout(this.workerFallbackTimer);
                        if (e.data && e.data.error) {
                            console.error("❌ خطأ تنفيذي داخل الـ Worker:", e.data.details);
                            runFallback();
                        } else {
                            resolve(e.data.move);
                        }
                    };

                    this.workerInstance.onerror = (err) => {
                        console.error("❌ خطأ في تشغيل الـ Worker:", err.message || err);
                        clearTimeout(this.workerFallbackTimer);
                        if (this.workerInstance) this.workerInstance.terminate();
                        this.workerInstance = null;
                        runFallback();
                    };

                    // 5. إرسال أمر التفكير للـ Worker
                    this.workerInstance.postMessage({ board, level, aiColor, pieceDirection });
                } else {
                    runFallback();
                }
            } catch (e) {
                console.error("❌ استثناء غير متوقع في getBestMoveAsync:", e);
                runFallback();
            }
        });
    }
};
