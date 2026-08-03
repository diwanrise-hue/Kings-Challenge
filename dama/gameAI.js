import { gameEngine } from './gameEngine.js';

// 🚀 هذا هو الـ Worker مكتوب كنص، ثم سيتم تحويله إلى Data URI آمن جداً
const inlineWorkerCode = `
const AI_LEVELS = {
    1: { depth: 1, randomChance: 0.60, maxTime: 100,  name: "مبتدئ جداً" },
    2: { depth: 2, randomChance: 0.30, maxTime: 200,  name: "مبتدئ" },
    3: { depth: 3, randomChance: 0.10, maxTime: 350,  name: "سهل" },
    4: { depth: 3, randomChance: 0.00, maxTime: 500,  name: "متوسط" },
    5: { depth: 4, randomChance: 0.00, maxTime: 800,  name: "صعب" },
    6: { depth: 4, randomChance: 0.00, maxTime: 1000, name: "محترف" },
    7: { depth: 5, randomChance: 0.00, maxTime: 1200, name: "أستاذ" },
    8: { depth: 5, randomChance: 0.00, maxTime: 1500, name: "جراند ماستر" },
    9: { depth: 5, randomChance: 0.00, maxTime: 2000, name: "الزعيم" }
};

// ⚡ المحرك الداخلي للبوت (تم نزع عنق الزجاجة منه ليكون فائق السرعة)
const engine = {
    getPieceCapturePaths(r, c, color, bState, dirY, parentDr = null, parentDc = null) {
        const colorChar = color[0]; let isDama = bState[r][c] && bState[r][c].length > 5; let paths = [];
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
                            let subPaths = this.getPieceCapturePaths(nextR, nextC, color, bState, dirY, dr, dc);
                            if (subPaths.length > 0) { subPaths.forEach(sp => paths.push([stepObj, ...sp])); } else { paths.push([stepObj]); }
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
                        let subPaths = this.getPieceCapturePaths(toR, toC, color, bState, dirY, dr, dc);
                        if (subPaths.length > 0) { subPaths.forEach(sp => paths.push([stepObj, ...sp])); } else { paths.push([stepObj]); }
                        bState[r][c] = movingPiece; bState[toR][toC] = null; bState[midR][midC] = capturedPiece;
                    }
                }
            }
        }
        return paths;
    },
    getPieceSimpleMoves(r, c, color, bState, dirY) {
        const colorChar = color[0]; let isDama = bState[r][c] && bState[r][c].length > 5; let moves = [];
        let directions = isDama ? [[0,1], [0,-1], [1,0], [-1,0]] : [[dirY, 0], [0,1], [0,-1]];
        for (let [dr, dc] of directions) {
            if (isDama) {
                let step = 1;
                while (true) {
                    let toR = r + dr * step, toC = c + dc * step;
                    if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8 && bState[toR][toC] === null) { moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]); step++; } else break;
                }
            } else {
                let toR = r + dr, toC = c + dc;
                if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8 && bState[toR][toC] === null) moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]);
            }
        }
        return moves;
    },
    generateAllTurnMoves(color, bState, pieceDirection) {
        let allCapturePaths = [], maxJumps = 0; const colorChar = color[0];
        let pureColor = colorChar === 'b' ? 'black' : 'white';
        let dirY = pieceDirection ? (pieceDirection[pureColor] !== undefined ? pieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1)) : (pureColor === 'black' ? 1 : -1);

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = bState[r][c];
                if (piece && piece[0] === colorChar) {
                    let paths = this.getPieceCapturePaths(r, c, color, bState, dirY);
                    for (let p of paths) { if (p.length > maxJumps) maxJumps = p.length; allCapturePaths.push(p); }
                }
            }
        }
        if (maxJumps > 0) return allCapturePaths.filter(p => p.length === maxJumps);
        let allSimpleMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = bState[r][c];
                if (piece && piece[0] === colorChar) { allSimpleMoves.push(...this.getPieceSimpleMoves(r, c, color, bState, dirY)); }
            }
        }
        return allSimpleMoves;
    }
};

const ai = {
    nodesEvaluated: 0,
    evaluateBoard(board, aiColor, pieceDirection) {
        let score = 0;
        let myPieces = 0, oppPieces = 0;
        let myDamas = 0, oppDamas = 0;
        
        let targetPure = aiColor.split('-')[0];
        let oppPure = targetPure === 'white' ? 'black' : 'white';
        
        let myDir = pieceDirection ? (pieceDirection[targetPure] !== undefined ? pieceDirection[targetPure] : (targetPure === 'black' ? 1 : -1)) : (targetPure === 'black' ? 1 : -1);
        let myBackRow = myDir === 1 ? 0 : 7;
        let oppBackRow = myDir === 1 ? 7 : 0;

        let myDamaPositions = [];
        let oppPositions = [];
        let myPositions = [];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = board[r][c];
                if (!piece) continue;
                
                let isTarget = piece.startsWith(targetPure);
                let isDama = piece.length > 5;
                
                let pieceValue = isDama ? 500 : 100;
                let defenseBonus = (!isDama && r === myBackRow) ? 20 : 0;
                let centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 10 : 0;
                let edgeBonus = (c === 0 || c === 7) ? 5 : 0; 
                
                let advanceBonus = 0;
                if (!isDama) {
                    let stepsToPromotion = isTarget ? Math.abs(r - myBackRow) : Math.abs(r - oppBackRow);
                    const advanceWeights = [0, 2, 5, 12, 25, 45, 75, 0]; 
                    advanceBonus = advanceWeights[stepsToPromotion] || 0;
                }

                let supportBonus = 0;
                if (!isDama) {
                    let backR = r - myDir; 
                    let friendPrefix = isTarget ? targetPure : oppPure;
                    if (backR >= 0 && backR < 8 && board[backR][c] && board[backR][c].startsWith(friendPrefix)) { supportBonus += 15; }
                    if (c > 0 && board[r][c-1] && board[r][c-1].startsWith(friendPrefix)) supportBonus += 5;
                    if (c < 7 && board[r][c+1] && board[r][c+1].startsWith(friendPrefix)) supportBonus += 5;
                }

                let totalValue = pieceValue + advanceBonus + centerBonus + edgeBonus + defenseBonus + supportBonus;

                if (isTarget) {
                    score += totalValue;
                    myPieces++;
                    if (isDama) { myDamas++; myDamaPositions.push({r, c}); }
                    myPositions.push({r, c});
                } else {
                    score -= totalValue;
                    oppPieces++;
                    if (isDama) oppDamas++;
                    oppPositions.push({r, c});
                }
            }
        }

        if (myDamas > 0 && oppPieces <= 3 && oppPieces > 0) {
            score += 300; 
            let distancePenalty = 0;
            for (let dama of myDamaPositions) {
                for (let opp of oppPositions) { distancePenalty += Math.abs(dama.r - opp.r) + Math.abs(dama.c - opp.c); }
            }
            score -= (distancePenalty * 3); 
        }
        
        if (oppDamas > 0 && myPieces <= 3 && myPieces > 0) {
            score -= 300;
            let distanceReward = 0;
            for (let oppDama of oppPositions) { 
                for (let me of myPositions) { distanceReward += Math.abs(oppDama.r - me.r) + Math.abs(oppDama.c - me.c); }
            }
            score += (distanceReward * 2); 
        }

        if (oppPieces === 0) score += 90000;
        if (myPieces === 0) score -= 90000;

        return score;
    },
    scoreMove(path, aiColor, pieceDirection) {
        let pureColor = aiColor.split('-')[0];
        let dir = pieceDirection ? (pieceDirection[pureColor] !== undefined ? pieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1)) : (pureColor === 'black' ? 1 : -1);
        return (path.filter(step => step.midR !== null).length * 1000) + (path[path.length - 1].toR === (dir === 1 ? 7 : 0) ? 500 : 0);
    },
    orderMoves(moves, aiColor, pieceDirection) { return moves.sort((a, b) => this.scoreMove(b, aiColor, pieceDirection) - this.scoreMove(a, aiColor, pieceDirection)); },
    doMove(board, path, pieceDirection) {
        let startStep = path[0]; let piece = board[startStep.fromR][startStep.fromC]; let pureColor = piece.split('-')[0];
        let undoData = { path: path, captures: [], startPiece: piece };
        board[startStep.fromR][startStep.fromC] = null;
        for (let step of path) { if (step.midR !== null) { undoData.captures.push({ r: step.midR, c: step.midC, p: board[step.midR][step.midC] }); board[step.midR][step.midC] = null; } }
        let lastStep = path[path.length - 1]; let dir = pieceDirection ? pieceDirection[pureColor] : (pureColor === 'white' ? -1 : 1);
        let finalPiece = (lastStep.toR === (dir === 1 ? 7 : 0) && piece.length <= 5) ? pureColor + '-dama' : piece;
        board[lastStep.toR][lastStep.toC] = finalPiece; return undoData;
    },
    undoMove(board, undoData) {
        board[undoData.path[undoData.path.length - 1].toR][undoData.path[undoData.path.length - 1].toC] = null;
        board[undoData.path[0].fromR][undoData.path[0].fromC] = undoData.startPiece;
        for (let cap of undoData.captures) { board[cap.r][cap.c] = cap.p; }
    },
    coreMinimax(board, depth, alpha, beta, maximizingPlayer, aiColor, pieceDirection, startTime, maxTime) {
        this.nodesEvaluated++;
        if (this.nodesEvaluated % 50 === 0 && Date.now() - startTime > maxTime) return { score: this.evaluateBoard(board, aiColor, pieceDirection), timeOut: true };
        if (depth <= 0) return { score: this.evaluateBoard(board, aiColor, pieceDirection) };
        let currentColor = maximizingPlayer ? aiColor : (aiColor === 'white' ? 'black' : 'white');
        
        let moves = engine.generateAllTurnMoves(currentColor, board, pieceDirection);
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
    minimax(board, maxAllowedDepth, aiColor, pieceDirection, maxTime) {
        let startTime = Date.now(); this.nodesEvaluated = 0;
        let moves = engine.generateAllTurnMoves(aiColor, board, pieceDirection);
        if (moves.length === 0) return { move: null };
        if (moves.length === 1) return { move: moves[0] };
        let bestResult = { move: moves[0] };
        for (let d = 1; d <= maxAllowedDepth; d++) {
            let result = this.coreMinimax(board, d, -Infinity, Infinity, true, aiColor, pieceDirection, startTime, maxTime);
            if (result.timeOut) break;
            bestResult = result;
            if (bestResult.score > 90000) break;
        }
        return bestResult;
    }
};

self.onmessage = function (e) {
    console.log("1. الـ Worker استلم البيانات بنجاح وبدأ العمل..."); 
    try {
        const { board, level, aiColor, pieceDirection } = e.data;
        const currentLevel = AI_LEVELS[level] || AI_LEVELS[3];
        let moves = engine.generateAllTurnMoves(aiColor, board, pieceDirection);
        if (!moves || moves.length === 0) return self.postMessage({ move: null });

        if (Math.random() < currentLevel.randomChance) {
            return self.postMessage({ move: moves[Math.floor(Math.random() * moves.length)] });
        }
        
        console.log("2. بدء خوارزمية Minimax..."); 
        let bestResult = ai.minimax(board, currentLevel.depth, aiColor, pieceDirection, currentLevel.maxTime);
        console.log("3. انتهت خوارزمية Minimax بنجاح!"); 
        
        self.postMessage({ move: bestResult.move || moves[0] });
    } catch (error) { 
        console.error("🚨 خطأ داخلي في الـ Worker:", error); 
        self.postMessage({ error: true, details: error.message || error.toString() }); 
    }
};
`;

export const gameAI = {
    workerInstance: null,

    getWorkerInstance() {
        if (!this.workerInstance) {
            try {
                const dataUri = 'data:application/javascript;charset=utf-8,' + encodeURIComponent(inlineWorkerCode);
                console.log("رابط الـ Worker المتولد جاهز للعمل."); 
                this.workerInstance = new Worker(dataUri);
            } catch (error) {
                console.warn("⚠️ فشل إنشاء الـ Worker بالـ Data URI، سيتم استخدام البديل...", error);
                this.workerInstance = null;
            }
        }
        return this.workerInstance;
    },

    evaluateBoard(board, aiColor, pieceDirection) {
        let score = 0;
        let myPieces = 0, oppPieces = 0;
        let myDamas = 0, oppDamas = 0;
        
        let targetPure = aiColor.split('-')[0];
        let oppPure = targetPure === 'white' ? 'black' : 'white';
        
        let myDir = pieceDirection ? (pieceDirection[targetPure] !== undefined ? pieceDirection[targetPure] : (targetPure === 'black' ? 1 : -1)) : (targetPure === 'black' ? 1 : -1);
        let myBackRow = myDir === 1 ? 0 : 7;
        let oppBackRow = myDir === 1 ? 7 : 0;

        let myDamaPositions = [];
        let oppPositions = [];
        let myPositions = [];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = board[r][c];
                if (!piece) continue;
                
                let isTarget = piece.startsWith(targetPure);
                let isDama = piece.length > 5;
                
                let pieceValue = isDama ? 500 : 100;
                let defenseBonus = (!isDama && r === myBackRow) ? 20 : 0;
                let centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 10 : 0;
                let edgeBonus = (c === 0 || c === 7) ? 5 : 0; 
                
                let advanceBonus = 0;
                if (!isDama) {
                    let stepsToPromotion = isTarget ? Math.abs(r - myBackRow) : Math.abs(r - oppBackRow);
                    const advanceWeights = [0, 2, 5, 12, 25, 45, 75, 0]; 
                    advanceBonus = advanceWeights[stepsToPromotion] || 0;
                }

                let supportBonus = 0;
                if (!isDama) {
                    let backR = r - myDir; 
                    let friendPrefix = isTarget ? targetPure : oppPure;
                    if (backR >= 0 && backR < 8 && board[backR][c] && board[backR][c].startsWith(friendPrefix)) { supportBonus += 15; }
                    if (c > 0 && board[r][c-1] && board[r][c-1].startsWith(friendPrefix)) supportBonus += 5;
                    if (c < 7 && board[r][c+1] && board[r][c+1].startsWith(friendPrefix)) supportBonus += 5;
                }

                let totalValue = pieceValue + advanceBonus + centerBonus + edgeBonus + defenseBonus + supportBonus;

                if (isTarget) {
                    score += totalValue;
                    myPieces++;
                    if (isDama) { myDamas++; myDamaPositions.push({r, c}); }
                    myPositions.push({r, c});
                } else {
                    score -= totalValue;
                    oppPieces++;
                    if (isDama) oppDamas++;
                    oppPositions.push({r, c});
                }
            }
        }

        if (myDamas > 0 && oppPieces <= 3 && oppPieces > 0) {
            score += 300; 
            let distancePenalty = 0;
            for (let dama of myDamaPositions) {
                for (let opp of oppPositions) {
                    distancePenalty += Math.abs(dama.r - opp.r) + Math.abs(dama.c - opp.c);
                }
            }
            score -= (distancePenalty * 3); 
        }
        
        if (oppDamas > 0 && myPieces <= 3 && myPieces > 0) {
            score -= 300;
            let distanceReward = 0;
            for (let oppDama of oppPositions) { 
                for (let me of myPositions) {
                    distanceReward += Math.abs(oppDama.r - me.r) + Math.abs(oppDama.c - me.c);
                }
            }
            score += (distanceReward * 2); 
        }

        if (oppPieces === 0) score += 90000;
        if (myPieces === 0) score -= 90000;

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

    coreMinimaxSync(board, depth, alpha, beta, maximizingPlayer, aiColor, pieceDirection, startTime, maxTime) {
        this.nodesEvaluated++;
        
        if (this.nodesEvaluated % 50 === 0 && Date.now() - startTime > maxTime) {
            return { score: this.evaluateBoard(board, aiColor, pieceDirection), timeOut: true };
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
                let evaluation = this.coreMinimaxSync(board, depth - 1, alpha, beta, false, aiColor, pieceDirection, startTime, maxTime);
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
                let evaluation = this.coreMinimaxSync(board, depth - 1, alpha, beta, true, aiColor, pieceDirection, startTime, maxTime);
                this.undoMove(board, undoData);
                if (evaluation.timeOut) return { move: bestMove, score: minEval === Infinity ? this.evaluateBoard(board, aiColor, pieceDirection) : minEval, timeOut: true };
                if (evaluation.score < minEval) { minEval = evaluation.score; bestMove = move; }
                beta = Math.min(beta, evaluation.score);
                if (beta <= alpha) break;
            }
            return { move: bestMove, score: minEval };
        }
    },

    minimaxFallbackSync(board, maxAllowedDepth, aiColor, pieceDirection, maxTime) {
        let startTime = Date.now();
        this.nodesEvaluated = 0;
        let moves = gameEngine.generateAllTurnMoves(aiColor, board);
        if (moves.length === 0) return { move: null };
        if (moves.length === 1) return { move: moves[0] };

        let bestResult = { move: moves[0] };
        let safeDepth = Math.min(maxAllowedDepth, 4);
        
        for (let d = 1; d <= safeDepth; d++) {
            let result = this.coreMinimaxSync(board, d, -Infinity, Infinity, true, aiColor, pieceDirection, startTime, maxTime);
            if (result.timeOut) break;
            bestResult = result;
        }
        return bestResult;
    },

    async getBestMoveAsync(board, level, aiColor, pieceDirection) {
        return new Promise((resolve) => {
            const fallbackTimes = [200, 300, 500, 700, 1000, 1200, 1400, 1600, 2100];
            const fallbackMaxTime = fallbackTimes[level - 1] || 1000;

            const runFallback = () => {
                setTimeout(() => {
                    let fallbackResult = this.minimaxFallbackSync(board, level, aiColor, pieceDirection, Math.min(fallbackMaxTime, 1200));
                    resolve(fallbackResult.move || null);
                }, 10);
            };

            try {
                if (window.Worker) {
                    const worker = this.getWorkerInstance();
                    
                    if (!worker) {
                        return runFallback();
                    }

                    worker.onmessage = (e) => {
                        if (e.data && e.data.error) {
                            console.error("❌ خطأ تنفيذي داخل الـ Worker:", e.data.details);
                            runFallback();
                        } else {
                            resolve(e.data.move);
                        }
                    };

                    worker.onerror = (err) => {
                        console.error("❌ خطأ في الـ Worker:", err.message || err);
                        if (this.workerInstance) {
                            this.workerInstance.terminate();
                            this.workerInstance = null;
                        }
                        runFallback();
                    };

                    worker.postMessage({ board, level, aiColor, pieceDirection });
                } else {
                    runFallback();
                }
            } catch (e) {
                console.error("❌ استثناء غير متوقع:", e);
                runFallback();
            }
        });
    }
};
