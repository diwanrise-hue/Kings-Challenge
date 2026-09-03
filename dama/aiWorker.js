// aiWorker.js
import { gameEngine } from './gameEngine.js';

const AI_LEVELS = {
    1: { id: 1, depth: 1, randomChance: 0.30, maxTime: 500 },
    2: { id: 2, depth: 2, randomChance: 0.15, maxTime: 1000 },
    3: { id: 3, depth: 3, randomChance: 0.05, maxTime: 1500 },
    4: { id: 4, depth: 4, randomChance: 0.00, maxTime: 2500 },
    5: { id: 5, depth: 5, randomChance: 0.00, maxTime: 4000 },
    6: { id: 6, depth: 6, randomChance: 0.00, maxTime: 8000 },
    7: { id: 7, depth: 8, randomChance: 0.00, maxTime: 15000 }, // ترقية العمق
    8: { id: 8, depth: 9, randomChance: 0.00, maxTime: 20000 }
};

const MAX_TT_SIZE = 300000;

const ZOBRIST = {
    pieces: {
        'white': new Array(64),
        'black': new Array(64),
        'white-dama': new Array(64),
        'black-dama': new Array(64)
    },
    blackTurn: 0n,
    movesNoProg: new Array(101),
    extensions: new Array(9),

    init() {
        let seed = 1070372n;
        const nextRand64 = () => {
            seed = (seed * 6364136223846793005n + 1442695040888963407n) & 0xFFFFFFFFFFFFFFFFn;
            return seed;
        };
        for (let i = 0; i < 64; i++) {
            this.pieces['white'][i] = nextRand64();
            this.pieces['black'][i] = nextRand64();
            this.pieces['white-dama'][i] = nextRand64();
            this.pieces['black-dama'][i] = nextRand64();
        }
        this.blackTurn = nextRand64();
        for (let i = 0; i <= 100; i++) this.movesNoProg[i] = nextRand64();
        for (let i = 0; i <= 8; i++) this.extensions[i] = nextRand64();
    }
};
ZOBRIST.init();

function isSameMove(m1, m2) {
    if (!m1 || !m2 || m1.length !== m2.length) return false;
    for (let i = 0; i < m1.length; i++) {
        if (m1[i].fromR !== m2[i].fromR || m1[i].fromC !== m2[i].fromC ||
            m1[i].toR !== m2[i].toR || m1[i].toC !== m2[i].toC ||
            m1[i].midR !== m2[i].midR || m1[i].midC !== m2[i].midC) return false;
    }
    return true;
}

const engine = {
    nodesEvaluated: 0,
    killerMoves: new Array(100).fill(null).map(() => [null, null]),
    historyHeuristic: { 'white': new Int32Array(4096), 'black': new Int32Array(4096) },

    generateZobristHash(board, currentTurn, movesNoProg = 0, extensions = 0) {
        let hash = 0n;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && ZOBRIST.pieces[p]) hash ^= ZOBRIST.pieces[p][(r << 3) | c];
            }
        }
        if (currentTurn === 'black') hash ^= ZOBRIST.blackTurn;
        const safeNP = movesNoProg > 100 ? 100 : (movesNoProg < 0 ? 0 : movesNoProg);
        hash ^= ZOBRIST.movesNoProg[safeNP];
        const safeExt = extensions > 8 ? 8 : (extensions < 0 ? 0 : extensions);
        hash ^= ZOBRIST.extensions[safeExt];
        return hash;
    },

    makeMove(board, movePath, color, pieceDir, currentHash) {
        const startR = movePath[0].fromR;
        const startC = movePath[0].fromC;
        const piece = board[startR][startC];
        const startIdx = (startR << 3) | startC;

        board[startR][startC] = null;
        let nextHash = currentHash ^ ZOBRIST.pieces[piece][startIdx];

        const captured = [];
        for (let i = 0; i < movePath.length; i++) {
            const step = movePath[i];
            if (step.midR != null && step.midC != null) {
                const midR = step.midR;
                const midC = step.midC;
                const midPiece = board[midR][midC];
                if (midPiece) {
                    captured.push({ r: midR, c: midC, piece: midPiece });
                    board[midR][midC] = null;
                    nextHash ^= ZOBRIST.pieces[midPiece][(midR << 3) | midC];
                }
            }
        }

        const lastStep = movePath[movePath.length - 1];
        const endR = lastStep.toR;
        const endC = lastStep.toC;
        const promoRow = (pieceDir[color] === 1) ? 7 : 0;
        const isPromoted = (endR === promoRow && !piece.includes('dama'));
        const finalPiece = isPromoted ? (piece + '-dama') : piece;

        board[endR][endC] = finalPiece;
        nextHash ^= ZOBRIST.pieces[finalPiece][(endR << 3) | endC];
        nextHash ^= ZOBRIST.blackTurn;

        return { startR, startC, endR, endC, originalPiece: piece, finalPiece, captured, nextHash };
    },

    unmakeMove(board, undoState) {
        board[undoState.endR][undoState.endC] = null;
        board[undoState.startR][undoState.startC] = undoState.originalPiece;
        for (let i = 0; i < undoState.captured.length; i++) {
            const cap = undoState.captured[i];
            board[cap.r][cap.c] = cap.piece;
        }
    },

    evaluateBoard(board, aiColor, pieceDirection, levelNum) {
        let score = 0;
        let oppColor = aiColor === 'white' ? 'black' : 'white';
        let myDir = pieceDirection[aiColor];
        let myPieces = 0, oppPieces = 0, myDamas = 0, oppDamas = 0;
        let myPiecesList = [], oppPiecesList = [];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = board[r][c];
                if (p) {
                    let isMine = p.startsWith(aiColor);
                    let isDama = p.includes('dama');
                    let sign = isMine ? 1 : -1;
                    let pColor = isMine ? aiColor : oppColor;

                    if (isMine) {
                        myPieces++;
                        if (isDama) myDamas++;
                        myPiecesList.push({ r, c });
                    } else {
                        oppPieces++;
                        if (isDama) oppDamas++;
                        oppPiecesList.push({ r, c });
                    }

                    score += (isDama ? 400 : 100) * sign;

                    if (!isDama && levelNum >= 3) {
                        let pDir = isMine ? myDir : -myDir;
                        let progress = (pDir === 1) ? r : (7 - r);
                        score += (progress * 2) * sign;
                        if (progress === 6) score += 40 * sign;

                        if (levelNum >= 5) {
                            if (c >= 2 && c <= 5) score += 4 * sign;
                            let backRow = (pDir === 1) ? 0 : 7;
                            if (r === backRow) score += 8 * sign;
                            let backR = r - pDir;
                            if (backR >= 0 && backR < 8 && board[backR][c] && board[backR][c].startsWith(pColor)) score += 3 * sign;
                            if ((c > 0 && board[r][c - 1] && board[r][c - 1].startsWith(pColor)) ||
                                (c < 7 && board[r][c + 1] && board[r][c + 1].startsWith(pColor))) score += 3 * sign;
                        }
                    }
                }
            }
        }

        if (levelNum >= 5) {
            if (myPieces > oppPieces) score += (16 - oppPieces) * 5;
            else if (oppPieces > myPieces) score -= (16 - myPieces) * 5;
        }

        let isEndgame = (myPieces + oppPieces) <= 8 || oppPieces <= 3 || myPieces <= 3;
        if (isEndgame && levelNum >= 6) {
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    let p = board[r][c];
                    if (p && p.includes('dama')) {
                        let isMine = p.startsWith(aiColor);
                        let sign = isMine ? 1 : -1;
                        if ((isMine && myPieces > oppPieces) || (!isMine && oppPieces > myPieces)) {
                            let preyList = isMine ? oppPiecesList : myPiecesList;
                            if (preyList.length > 0) {
                                let minDistance = 999, sameLineBonus = 0;
                                for (let prey of preyList) {
                                    let dist = Math.abs(r - prey.r) + Math.abs(c - prey.c);
                                    if (dist < minDistance) minDistance = dist;
                                    if (r === prey.r || c === prey.c) sameLineBonus += 15;
                                }
                                score -= (minDistance * 4) * sign;
                                score += sameLineBonus * sign;
                            }
                        } else {
                            let predatorList = isMine ? oppPiecesList : myPiecesList;
                            let sameLinePenalty = 0;
                            for (let predator of predatorList) {
                                if (r === predator.r || c === predator.c) sameLinePenalty += 15;
                            }
                            let centerDist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                            score += (centerDist * 4) * sign;
                            score -= sameLinePenalty * sign;
                        }
                    }
                }
            }
            if (myDamas > 0 && oppPieces === 0) score += 10000;
            if (oppDamas > 0 && myPieces === 0) score -= 10000;
        }

        return score;
    },

    quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, depthLimit, startTime, maxTime) {
        this.nodesEvaluated++;
        if (Date.now() - startTime >= maxTime) return { timeout: true };

        let allMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
        let captures = [];
        for (let i = 0; i < allMoves.length; i++) {
            const m = allMoves[i];
            let hasCap = false;
            for (let j = 0; j < m.length; j++) {
                if (m[j].midR != null && m[j].midC != null) { hasCap = true; break; }
            }
            if (hasCap) captures.push(m);
        }

        if (captures.length === 0 || depthLimit <= 0) {
            return { score: this.evaluateBoard(board, aiColor, pieceDirection, levelNum), timeout: false };
        }

        const promoRow = (pieceDirection[currentTurn] === 1 ? 7 : 0);
        captures.sort((a, b) => {
            let aCap = 0, bCap = 0;
            for (let i = 0; i < a.length; i++) if (a[i].midR != null) aCap++;
            for (let i = 0; i < b.length; i++) if (b[i].midR != null) bCap++;
            if (aCap !== bCap) return bCap - aCap;
            const aPiece = board[a[0].fromR][a[0].fromC];
            const bPiece = board[b[0].fromR][b[0].fromC];
            const aPromo = (a[a.length - 1].toR === promoRow && aPiece && !aPiece.includes('dama')) ? 1 : 0;
            const bPromo = (b[b.length - 1].toR === promoRow && bPiece && !bPiece.includes('dama')) ? 1 : 0;
            return bPromo - aPromo;
        });

        const nextTurn = currentTurn === 'white' ? 'black' : 'white';

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < captures.length; i++) {
                const move = captures[i];
                const undo = this.makeMove(board, move, currentTurn, pieceDirection, 0n);
                const result = this.quiescence(board, alpha, beta, false, nextTurn, aiColor, pieceDirection, levelNum, depthLimit - 1, startTime, maxTime);
                this.unmakeMove(board, undo);
                if (result.timeout) return { timeout: true };
                if (result.score > maxEval) maxEval = result.score;
                if (result.score > alpha) alpha = result.score;
                if (beta <= alpha) break;
            }
            return { score: maxEval, timeout: false };
        } else {
            let minEval = Infinity;
            for (let i = 0; i < captures.length; i++) {
                const move = captures[i];
                const undo = this.makeMove(board, move, currentTurn, pieceDirection, 0n);
                const result = this.quiescence(board, alpha, beta, true, nextTurn, aiColor, pieceDirection, levelNum, depthLimit - 1, startTime, maxTime);
                this.unmakeMove(board, undo);
                if (result.timeout) return { timeout: true };
                if (result.score < minEval) minEval = result.score;
                if (result.score < beta) beta = result.score;
                if (beta <= alpha) break;
            }
            return { score: minEval, timeout: false };
        }
    },

    computeBestMove(virtualBoard, levelStr, aiColor, pieceDirection, pieceHistories, movesWithoutProgress) {
        let levelNum = parseInt(levelStr) || 3;
        const currentLevel = AI_LEVELS[levelNum] || AI_LEVELS[3];

        let moves = gameEngine.generateAllTurnMoves(aiColor, virtualBoard);
        if (moves.length === 0) return null;
        if (moves.length === 1) return moves[0];

        if (Math.random() < currentLevel.randomChance) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        let startTime = Date.now();
        let bestMoveGlobal = moves[0];
        const self = this;
        this.nodesEvaluated = 0;

        this.killerMoves = new Array(100).fill(null).map(() => [null, null]);
        this.historyHeuristic['white'].fill(0);
        this.historyHeuristic['black'].fill(0);

        const tt = new Map();
        let previousPV = [];

        function getMoveScore(move, ttMove, pvMoveLocal, ply, currentTurn, board) {
            if (ttMove && isSameMove(move, ttMove)) return 20000000;
            if (pvMoveLocal && isSameMove(move, pvMoveLocal)) return 10000000;

            let capCount = 0;
            for (let i = 0; i < move.length; i++) {
                if (move[i].midR != null && move[i].midC != null) capCount++;
            }

            const piece = board[move[0].fromR][move[0].fromC];
            const promoRow = (pieceDirection[currentTurn] === 1 ? 7 : 0);
            const isPromo = (move[move.length - 1].toR === promoRow && piece && !piece.includes('dama'));

            if (capCount > 0) return 1000000 + (capCount * 50000) + (isPromo ? 20000 : 0);
            if (isPromo) return 500000;

            if (self.killerMoves[ply][0] && isSameMove(move, self.killerMoves[ply][0])) return 90000;
            if (self.killerMoves[ply][1] && isSameMove(move, self.killerMoves[ply][1])) return 80000;

            const fromIdx = (move[0].fromR << 3) | move[0].fromC;
            const lastStep = move[move.length - 1];
            const toIdx = (lastStep.toR << 3) | lastStep.toC;
            return self.historyHeuristic[currentTurn][(fromIdx << 6) | toIdx];
        }

        // بحث متزامن نقي بدون أي await/Promise
        function minimax(board, nominalDepth, searchDepth, isMaximizing, alpha, beta, currentTurn, currentMovesNoProg, currentZobrist, isRoot = false, extensions = 0, ply = 0) {
            self.nodesEvaluated++;

            // فحص الوقت كل 2048 عقدة عبر bitwise
            if ((self.nodesEvaluated & 2047) === 0) {
                if (Date.now() - startTime >= currentLevel.maxTime) return { timeout: true };
            }

            if (currentMovesNoProg >= 50) return { score: 0, timeout: false, pv: [] };

            const originalAlpha = alpha;
            const originalBeta = beta;

            // Reverse Futility Pruning
            if (!isRoot && searchDepth <= 3 && levelNum >= 6 && Math.abs(beta) < 90000) {
                const staticEval = self.evaluateBoard(board, aiColor, pieceDirection, levelNum);
                const margin = searchDepth * 120;
                if (isMaximizing && staticEval - margin >= beta) return { score: beta, timeout: false, pv: [] };
                if (!isMaximizing && staticEval + margin <= alpha) return { score: alpha, timeout: false, pv: [] };
            }

            let possibleMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
            if (possibleMoves.length === 0) {
                return { score: isMaximizing ? (-99000 + ply) : (99000 - ply), timeout: false, pv: [] };
            }

            let isCaptureMove = false;
            for (let i = 0; i < possibleMoves[0].length; i++) {
                if (possibleMoves[0][i].midR != null && possibleMoves[0][i].midC != null) {
                    isCaptureMove = true;
                    break;
                }
            }

            // Null Move Pruning
            if (!isRoot && searchDepth >= 3 && !isCaptureMove && currentMovesNoProg < 45 && levelNum >= 6) {
                let pieceCount = 0;
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) if (board[r][c]) pieceCount++;
                }

                if (pieceCount > 6) {
                    const R = searchDepth > 6 ? 3 : 2;
                    const nextTurnNull = currentTurn === 'white' ? 'black' : 'white';
                    const nullHash = currentZobrist ^ ZOBRIST.blackTurn;

                    if (isMaximizing) {
                        let nullRes = minimax(board, nominalDepth - 1, searchDepth - 1 - R, false, beta - 1, beta, nextTurnNull, currentMovesNoProg + 1, nullHash, false, extensions, ply + 1);
                        if (nullRes.timeout) return { timeout: true };
                        if (nullRes.score >= beta) return { score: beta, timeout: false, pv: [] };
                    } else {
                        let nullRes = minimax(board, nominalDepth - 1, searchDepth - 1 - R, true, alpha, alpha + 1, nextTurnNull, currentMovesNoProg + 1, nullHash, false, extensions, ply + 1);
                        if (nullRes.timeout) return { timeout: true };
                        if (nullRes.score <= alpha) return { score: alpha, timeout: false, pv: [] };
                    }
                }
            }

            const isForcedCapture = (possibleMoves.length === 1 && isCaptureMove);
            if (isForcedCapture && !isRoot && extensions < 8) {
                searchDepth++;
                extensions++;
            }

            const safeNP = currentMovesNoProg > 100 ? 100 : (currentMovesNoProg < 0 ? 0 : currentMovesNoProg);
            const safeExt = extensions > 8 ? 8 : (extensions < 0 ? 0 : extensions);
            const entryHash = currentZobrist ^ ZOBRIST.movesNoProg[safeNP] ^ ZOBRIST.extensions[safeExt];

            if (tt.has(entryHash)) {
                let cached = tt.get(entryHash);
                if (cached.depth >= searchDepth) {
                    if (cached.flag === 'EXACT') return { score: cached.score, move: cached.move, pv: [], timeout: false };
                    if (cached.flag === 'LOWERBOUND' && cached.score >= beta) return { score: cached.score, move: cached.move, pv: [], timeout: false };
                    if (cached.flag === 'UPPERBOUND' && cached.score <= alpha) return { score: cached.score, move: cached.move, pv: [], timeout: false };
                }
            }

            if (searchDepth <= 0) {
                let qResult = { score: 0, timeout: false };
                if (levelNum >= 5) {
                    qResult = self.quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, 6, startTime, currentLevel.maxTime);
                } else {
                    qResult.score = self.evaluateBoard(board, aiColor, pieceDirection, levelNum);
                }
                if (qResult.timeout) return { timeout: true };
                return { score: qResult.score, timeout: false, pv: [] };
            }

            let ttMove = tt.has(entryHash) ? tt.get(entryHash).move : null;
            let pvMoveLocal = (previousPV && previousPV[ply]) ? previousPV[ply] : null;

            if (levelNum >= 5) {
                const len = possibleMoves.length;
                let scoredMoves = new Array(len);
                for (let i = 0; i < len; i++) {
                    scoredMoves[i] = {
                        move: possibleMoves[i],
                        score: getMoveScore(possibleMoves[i], ttMove, pvMoveLocal, ply, currentTurn, board)
                    };
                }
                scoredMoves.sort((a, b) => b.score - a.score);
                for (let i = 0; i < len; i++) possibleMoves[i] = scoredMoves[i].move;
            }

            let bestMove = null;
            let bestPV = [];
            const nextTurn = currentTurn === 'white' ? 'black' : 'white';

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let i = 0; i < possibleMoves.length; i++) {
                    const move = possibleMoves[i];
                    let isCap = false;
                    for (let j = 0; j < move.length; j++) {
                        if (move[j].midR != null && move[j].midC != null) { isCap = true; break; }
                    }

                    const lastStep = move[move.length - 1];
                    const piece = board[move[0].fromR][move[0].fromC];
                    const promoRow = (pieceDirection[currentTurn] === 1) ? 7 : 0;
                    const isPromo = (lastStep.toR === promoRow && piece && !piece.includes('dama'));
                    const nextMovesNoProg = (isCap || isPromo) ? 0 : currentMovesNoProg + 1;

                    const undo = self.makeMove(board, move, currentTurn, pieceDirection, currentZobrist);
                    let result;

                    if (i === 0) {
                        result = minimax(board, nominalDepth - 1, searchDepth - 1, false, alpha, beta, nextTurn, nextMovesNoProg, undo.nextHash, false, extensions, ply + 1);
                    } else {
                        const canLMR = (i >= 3 && searchDepth >= 3 && !isCap && !isPromo && levelNum >= 6);
                        if (canLMR) {
                            let reduction = searchDepth >= 6 ? 2 : 1;
                            if (i >= 6 && searchDepth >= 8) reduction = 3;
                            result = minimax(board, nominalDepth - 1, Math.max(1, searchDepth - 1 - reduction), false, alpha, alpha + 1, nextTurn, nextMovesNoProg, undo.nextHash, false, extensions, ply + 1);
                        } else {
                            result = minimax(board, nominalDepth - 1, searchDepth - 1, false, alpha, alpha + 1, nextTurn, nextMovesNoProg, undo.nextHash, false, extensions, ply + 1);
                        }

                        if (!result.timeout && result.score > alpha && result.score < beta) {
                            result = minimax(board, nominalDepth - 1, searchDepth - 1, false, alpha, beta, nextTurn, nextMovesNoProg, undo.nextHash, false, extensions, ply + 1);
                        }
                    }

                    self.unmakeMove(board, undo);
                    if (result.timeout) return { timeout: true };

                    let moveRepPenalty = 0;
                    if (isRoot && currentTurn === aiColor && pieceHistories && pieceHistories[aiColor]) {
                        const tracker = pieceHistories[aiColor];
                        if (tracker.r === move[0].fromR && tracker.c === move[0].fromC) {
                            const targetStr = `${lastStep.toR},${lastStep.toC}`;
                            let count = 0;
                            for (let pos of tracker.history) { if (pos === targetStr) count++; }
                            if (count === 2) moveRepPenalty = -200;
                            if (count >= 3 && result.score < 90000) moveRepPenalty = -99000;
                        }
                    }

                    const currentScore = result.score + moveRepPenalty;
                    if (currentScore > maxEval) {
                        maxEval = currentScore;
                        bestMove = move;
                        bestPV = [move].concat(result.pv || []);
                    }
                    if (currentScore > alpha) alpha = currentScore;

                    if (beta <= alpha) {
                        if (levelNum >= 5 && !isCap) {
                            const fromIdx = (move[0].fromR << 3) | move[0].fromC;
                            const toIdx = (lastStep.toR << 3) | lastStep.toC;
                            self.historyHeuristic[currentTurn][(fromIdx << 6) | toIdx] = Math.min(10000, self.historyHeuristic[currentTurn][(fromIdx << 6) | toIdx] + searchDepth * searchDepth);
                            if (!isSameMove(move, self.killerMoves[ply][0])) {
                                self.killerMoves[ply][1] = self.killerMoves[ply][0];
                                self.killerMoves[ply][0] = move;
                            }
                        }
                        break;
                    }
                }

                let flag = 'EXACT';
                if (maxEval <= originalAlpha) flag = 'UPPERBOUND';
                else if (maxEval >= originalBeta) flag = 'LOWERBOUND';

                let shouldReplace = true;
                if (tt.has(entryHash)) {
                    let cached = tt.get(entryHash);
                    if (cached.depth > searchDepth) shouldReplace = false;
                    else if (cached.depth === searchDepth && cached.flag === 'EXACT' && flag !== 'EXACT') shouldReplace = false;
                }
                if (shouldReplace) {
                    if (tt.size >= MAX_TT_SIZE && !tt.has(entryHash)) {
                        const firstKey = tt.keys().next().value;
                        if (firstKey !== undefined) tt.delete(firstKey);
                    }
                    tt.set(entryHash, { score: maxEval, move: bestMove, flag, depth: searchDepth });
                }

                return { score: maxEval, move: bestMove, pv: bestPV, timeout: false };
            } else {
                let minEval = Infinity;
                for (let i = 0; i < possibleMoves.length; i++) {
                    const move = possibleMoves[i];
                    let isCap = false;
                    for (let j = 0; j < move.length; j++) {
                        if (move[j].midR != null && move[j].midC != null) { isCap = true; break; }
                    }

                    const lastStep = move[move.length - 1];
                    const piece = board[move[0].fromR][move[0].fromC];
                    const promoRow = (pieceDirection[currentTurn] === 1) ? 7 : 0;
                    const isPromo = (lastStep.toR === promoRow && piece && !piece.includes('dama'));
                    const nextMovesNoProg = (isCap || isPromo) ? 0 : currentMovesNoProg + 1;

                    const undo = self.makeMove(board, move, currentTurn, pieceDirection, currentZobrist);
                    let result;

                    if (i === 0) {
                        result = minimax(board, nominalDepth - 1, searchDepth - 1, true, alpha, beta, nextTurn, nextMovesNoProg, undo.nextHash, false, extensions, ply + 1);
                    } else {
                        const canLMR = (i >= 3 && searchDepth >= 3 && !isCap && !isPromo && levelNum >= 6);
                        if (canLMR) {
                            let reduction = searchDepth >= 6 ? 2 : 1;
                            if (i >= 6 && searchDepth >= 8) reduction = 3;
                            result = minimax(board, nominalDepth - 1, Math.max(1, searchDepth - 1 - reduction), true, beta - 1, beta, nextTurn, nextMovesNoProg, undo.nextHash, false, extensions, ply + 1);
                        } else {
                            result = minimax(board, nominalDepth - 1, searchDepth - 1, true, beta - 1, beta, nextTurn, nextMovesNoProg, undo.nextHash, false, extensions, ply + 1);
                        }

                        if (!result.timeout && result.score > alpha && result.score < beta) {
                            result = minimax(board, nominalDepth - 1, searchDepth - 1, true, alpha, beta, nextTurn, nextMovesNoProg, undo.nextHash, false, extensions, ply + 1);
                        }
                    }

                    self.unmakeMove(board, undo);
                    if (result.timeout) return { timeout: true };

                    if (result.score < minEval) {
                        minEval = result.score;
                        bestMove = move;
                        bestPV = [move].concat(result.pv || []);
                    }
                    if (result.score < beta) beta = result.score;

                    if (beta <= alpha) {
                        if (levelNum >= 5 && !isCap) {
                            const fromIdx = (move[0].fromR << 3) | move[0].fromC;
                            const toIdx = (lastStep.toR << 3) | lastStep.toC;
                            self.historyHeuristic[currentTurn][(fromIdx << 6) | toIdx] = Math.min(10000, self.historyHeuristic[currentTurn][(fromIdx << 6) | toIdx] + searchDepth * searchDepth);
                            if (!isSameMove(move, self.killerMoves[ply][0])) {
                                self.killerMoves[ply][1] = self.killerMoves[ply][0];
                                self.killerMoves[ply][0] = move;
                            }
                        }
                        break;
                    }
                }

                let flag = 'EXACT';
                if (minEval >= originalBeta) flag = 'LOWERBOUND';
                else if (minEval <= originalAlpha) flag = 'UPPERBOUND';

                let shouldReplace = true;
                if (tt.has(entryHash)) {
                    let cached = tt.get(entryHash);
                    if (cached.depth > searchDepth) shouldReplace = false;
                    else if (cached.depth === searchDepth && cached.flag === 'EXACT' && flag !== 'EXACT') shouldReplace = false;
                }
                if (shouldReplace) {
                    if (tt.size >= MAX_TT_SIZE && !tt.has(entryHash)) {
                        const firstKey = tt.keys().next().value;
                        if (firstKey !== undefined) tt.delete(firstKey);
                    }
                    tt.set(entryHash, { score: minEval, move: bestMove, flag, depth: searchDepth });
                }

                return { score: minEval, move: bestMove, pv: bestPV, timeout: false };
            }
        }

        const startDepth = currentLevel.depth === 1 ? 1 : 2;
        let previousScore = 0;
        let completedDepth = 0;
        let timeoutOccurred = false;

        const initialIdleMoves = movesWithoutProgress || 0;
        const initialZobrist = this.generateZobristHash(virtualBoard, aiColor, initialIdleMoves, 0);

        for (let currentDepth = startDepth; currentDepth <= currentLevel.depth; currentDepth++) {
            let alpha = -Infinity;
            let beta = Infinity;
            const windowSteps = [150, 300, 600, 1200, Infinity];
            let windowIdx = 0;

            if (levelNum >= 6 && currentDepth >= 3) {
                alpha = previousScore - windowSteps[0];
                beta = previousScore + windowSteps[0];
            }

            timeoutOccurred = false;

            while (true) {
                let result = minimax(virtualBoard, currentDepth, currentDepth, true, alpha, beta, aiColor, initialIdleMoves, initialZobrist, true, 0, 0);

                if (result.timeout) {
                    timeoutOccurred = true;
                    break;
                }

                if ((alpha > -Infinity && result.score <= alpha) || (beta < Infinity && result.score >= beta)) {
                    windowIdx++;
                    if (windowSteps[windowIdx] === Infinity) {
                        alpha = -Infinity;
                        beta = Infinity;
                    } else {
                        alpha = previousScore - windowSteps[windowIdx];
                        beta = previousScore + windowSteps[windowIdx];
                    }
                    continue;
                }

                bestMoveGlobal = result.move;
                previousScore = result.score;
                previousPV = result.pv || [];
                completedDepth = currentDepth;
                break;
            }

            if (timeoutOccurred || Math.abs(previousScore) >= 90000) break;
        }

        const totalTime = Math.max(1, Date.now() - startTime);
        const nps = Math.round((self.nodesEvaluated / totalTime) * 1000);

        console.log(`🤖 AI L${levelNum} (Worker) | Depth: ${completedDepth} | Nodes: ${self.nodesEvaluated} | Time: ${totalTime}ms | Timeout: ${timeoutOccurred ? 'Yes' : 'No'} | NPS: ${nps}`);

        tt.clear();
        return bestMoveGlobal;
    }
};

// الاستماع للرسائل القادمة من الواجهة الرئيسية
self.onmessage = function (e) {
    const { virtualBoard, levelStr, aiColor, pieceDirection, pieceHistories, movesWithoutProgress } = e.data;
    const bestMove = engine.computeBestMove(virtualBoard, levelStr, aiColor, pieceDirection, pieceHistories, movesWithoutProgress);
    self.postMessage({ bestMove });
};
