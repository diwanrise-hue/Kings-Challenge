// aiWorker.js - النسخة المستقلة بالكامل (Monolithic Worker)
// تعمل بسرعة 0ms ولا تعتمد على أي استيراد (Imports) لتجنب التأخير.

const AI_LEVELS = {
    1: { depth: 1, randomChance: 0.60, maxTime: 400,   name: "مبتدئ جداً (عشوائي)" },
    2: { depth: 2, randomChance: 0.30, maxTime: 600,   name: "مبتدئ" },
    3: { depth: 3, randomChance: 0.10, maxTime: 850,   name: "سهل" },
    4: { depth: 4, randomChance: 0.00, maxTime: 1200,  name: "متوسط" },
    5: { depth: 5, randomChance: 0.00, maxTime: 1700,  name: "صعب" },
    6: { depth: 6, randomChance: 0.00, maxTime: 5500,  name: "محترف" },
    7: { depth: 6, randomChance: 0.00, maxTime: 3800,  name: "أستاذ (تلميحات)" },
    8: { depth: 7, randomChance: 0.00, maxTime: 7500,  name: "جراند ماستر" },
    9: { depth: 8, randomChance: 0.00, maxTime: 8000,  name: "الزعيم" }
};

// ==========================================
// 1. محرك اللعبة المصغر (Engine Logic)
// ==========================================
const engine = {
    getPieceDirection(color, bState) {
        let baseColor = color.split('-')[0];
        let wSumRow = 0, wCount = 0; let bSumRow = 0, bCount = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = bState[r][c];
                if (p) {
                    if (p[0] === 'w') { wSumRow += r; wCount++; }
                    else if (p[0] === 'b') { bSumRow += r; bCount++; }
                }
            }
        }
        if (wCount > 0 && bCount > 0) {
            let wAvg = wSumRow / wCount; let bAvg = bSumRow / bCount;
            let wDir = wAvg < bAvg ? 1 : -1; let bDir = bAvg < wAvg ? 1 : -1;
            return baseColor === 'white' ? wDir : bDir;
        }
        return baseColor === 'black' ? 1 : -1;
    },

    getPieceCapturePaths(r, c, color, bState, parentDr = null, parentDc = null) {
        const colorChar = color[0];
        let isDama = bState[r][c] && bState[r][c].length > 5;
        let paths = [];
        let dirY = this.getPieceDirection(colorChar === 'b' ? 'black' : 'white', bState);
        let directions = isDama ? [[0,1], [0,-1], [1,0], [-1,0]] : [[dirY, 0], [0,1], [0,-1]];

        for (let [dr, dc] of directions) {
            if (isDama && parentDr !== null && parentDc !== null && dr === -parentDr && dc === -parentDc) continue;

            if (isDama) {
                let step = 1, foundEnemy = null, enemyR = -1, enemyC = -1;
                while (true) {
                    let nextR = r + dr * step, nextC = c + dc * step;
                    if (nextR < 0 || nextR >= 8 || nextC < 0 || nextC >= 8) break;

                    let piece = bState[nextR][nextC];
                    if (!foundEnemy) {
                        if (piece === null) { step++; continue; }
                        else if (piece[0] !== colorChar) { foundEnemy = piece; enemyR = nextR; enemyC = nextC; step++; continue; }
                        else break;
                    } else {
                        if (piece === null) {
                            let capturedPiece = bState[enemyR][enemyC]; let movingPiece = bState[r][c];
                            bState[enemyR][enemyC] = null; bState[nextR][nextC] = movingPiece; bState[r][c] = null;

                            let stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyR, midC: enemyC };
                            let subPaths = this.getPieceCapturePaths(nextR, nextC, color, bState, dr, dc);

                            if (subPaths.length > 0) { subPaths.forEach(sp => paths.push([stepObj, ...sp])); }
                            else { paths.push([stepObj]); }

                            bState[r][c] = movingPiece; bState[nextR][nextC] = null; bState[enemyR][enemyC] = capturedPiece;
                            step++; continue;
                        } else break;
                    }
                }
            } else {
                let midR = r + dr, midC = c + dc, toR = r + 2 * dr, toC = c + 2 * dc;
                if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8) {
                    let midPiece = bState[midR][midC];
                    if (midPiece && midPiece[0] !== colorChar && bState[toR][toC] === null) {
                        let capturedPiece = bState[midR][midC]; let movingPiece = bState[r][c];
                        bState[midR][midC] = null; bState[toR][toC] = movingPiece; bState[r][c] = null;

                        let stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                        let subPaths = this.getPieceCapturePaths(toR, toC, color, bState, dr, dc);

                        if (subPaths.length > 0) { subPaths.forEach(sp => paths.push([stepObj, ...sp])); }
                        else { paths.push([stepObj]); }

                        bState[r][c] = movingPiece; bState[toR][toC] = null; bState[midR][midC] = capturedPiece;
                    }
                }
            }
        }
        return paths;
    },

    getPieceSimpleMoves(r, c, color, bState) {
        const colorChar = color[0];
        let isDama = bState[r][c] && bState[r][c].length > 5;
        let moves = [];
        let dirY = this.getPieceDirection(colorChar === 'b' ? 'black' : 'white', bState);
        let directions = isDama ? [[0,1], [0,-1], [1,0], [-1,0]] : [[dirY, 0], [0,1], [0,-1]];

        for (let [dr, dc] of directions) {
            if (isDama) {
                let step = 1;
                while (true) {
                    let toR = r + dr * step, toC = c + dc * step;
                    if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8 && bState[toR][toC] === null) {
                        moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]); step++;
                    } else break;
                }
            } else {
                let toR = r + dr, toC = c + dc;
                if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8 && bState[toR][toC] === null)
                    moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]);
            }
        }
        return moves;
    },

    generateAllTurnMoves(color, bState) {
        let allCapturePaths = [], maxJumps = 0;
        const colorChar = color[0];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = bState[r][c];
                if (piece && piece[0] === colorChar) {
                    let paths = this.getPieceCapturePaths(r, c, color, bState);
                    for (let p of paths) {
                        if (p.length > maxJumps) maxJumps = p.length;
                        allCapturePaths.push(p);
                    }
                }
            }
        }
        if (maxJumps > 0) return allCapturePaths.filter(p => p.length === maxJumps);

        let allSimpleMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = bState[r][c];
                if (piece && piece[0] === colorChar) {
                    allSimpleMoves.push(...this.getPieceSimpleMoves(r, c, color, bState));
                }
            }
        }
        return allSimpleMoves;
    }
};

// ==========================================
// 2. الذكاء الاصطناعي المصغر (AI Logic)
// ==========================================
const ai = {
    nodesEvaluated: 0,
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
                let isDama = piece.length > 5;

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
    
    scoreMove(path, aiColor, pieceDirection) {
        let score = 0;
        let pureColor = aiColor.split('-')[0];
        let dir = pieceDirection ? (pieceDirection[pureColor] !== undefined ? pieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1)) : (pureColor === 'black' ? 1 : -1);
        let captures = path.filter(step => step.midR !== null).length;
        score += captures * 1000;
        let lastStep = path[path.length - 1];
        let isPromotion = (lastStep.toR === ((dir === 1) ? 7 : 0));
        if (isPromotion) score += 500;
        return score;
    },
    
    orderMoves(moves, aiColor, pieceDirection) {
        return moves.sort((a, b) => this.scoreMove(b, aiColor, pieceDirection) - this.scoreMove(a, aiColor, pieceDirection));
    },
    
    doMove(board, path, pieceDirection) {
        let startStep = path[0];
        let piece = board[startStep.fromR][startStep.fromC];
        let pureColor = piece.split('-')[0];
        let undoData = { path: path, captures: [], wasPromoted: false, startPiece: piece };

        board[startStep.fromR][startStep.fromC] = null;
        for (let step of path) {
            if (step.midR !== null) {
                undoData.captures.push({ r: step.midR, c: step.midC, p: board[step.midR][step.midC] });
                board[step.midR][step.midC] = null;
            }
        }

        let lastStep = path[path.length - 1];
        let dir = pieceDirection ? pieceDirection[pureColor] : (pureColor === 'white' ? -1 : 1);
        let promoRow = dir === 1 ? 7 : 0;
        let finalPiece = piece;

        if (lastStep.toR === promoRow && piece.length <= 5) {
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
        for (let cap of undoData.captures) { board[cap.r][cap.c] = cap.p; }
    },
    
    coreMinimax(board, depth, alpha, beta, maximizingPlayer, aiColor, pieceDirection, startTime, maxTime) {
        this.nodesEvaluated++;
        if (this.nodesEvaluated % 500 === 0 && Date.now() - startTime > maxTime) {
            return { score: this.evaluateBoard(board, aiColor, pieceDirection), timeOut: true };
        }
        if (depth <= 0) return { score: this.evaluateBoard(board, aiColor, pieceDirection) };

        let currentColor = maximizingPlayer ? aiColor : (aiColor === 'white' ? 'black' : 'white');
        let moves = engine.generateAllTurnMoves(currentColor, board);
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
    
    minimax(board, maxAllowedDepth, aiColor, pieceDirection, overrideMaxTime) {
        let startTime = Date.now();
        let maxTime = overrideMaxTime || 1200;
        this.nodesEvaluated = 0;

        let fallbackMoves = engine.generateAllTurnMoves(aiColor, board);
        if (fallbackMoves.length === 0) return { move: null, score: 0 };
        if (fallbackMoves.length === 1) return { move: fallbackMoves[0], score: 0 };

        let bestResult = { move: fallbackMoves[0], score: 0 };
        let safeMaxDepth = Math.min(maxAllowedDepth, 8); 

        for (let d = 1; d <= safeMaxDepth; d++) {
            let result = this.coreMinimax(board, d, -Infinity, Infinity, true, aiColor, pieceDirection, startTime, maxTime);
            if (result.timeOut) break;
            bestResult = result;
            if (bestResult.score > 90000) break;
        }
        return bestResult;
    }
};

// ==========================================
// 3. مستمع الرسائل الأساسي (Worker Entry Point)
// ==========================================
self.onmessage = function (e) {
    try {
        const { board, level, aiColor, pieceDirection, depth } = e.data;
        const currentLevel = AI_LEVELS[level] || AI_LEVELS[3];
        const targetDepth = depth || currentLevel.depth;

        let moves = engine.generateAllTurnMoves(aiColor, board);

        if (!moves || moves.length === 0) {
            self.postMessage({ move: null, score: 0 });
            return;
        }

        if (Math.random() < currentLevel.randomChance) {
            let randomMove = moves[Math.floor(Math.random() * moves.length)];
            self.postMessage({ move: randomMove, score: 0, isRandom: true, levelName: currentLevel.name });
            return;
        }

        let startTime = Date.now();
        let bestResult = ai.minimax(
            board,
            targetDepth,
            aiColor,
            pieceDirection,
            currentLevel.maxTime
        );

        self.postMessage({
            move: bestResult.move || moves[0],
            score: bestResult.score,
            levelName: currentLevel.name
        });

    } catch (error) {
        self.postMessage({
            error: error.message,
            stack: error.stack
        });
    }
};
