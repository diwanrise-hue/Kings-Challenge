// aiWorker.js - عقل المصباح والذكاء الاصطناعي
// 🌟 (مُحدّث جذرياً): ذكاء هرمي متدرج (سهل -> متوسط -> مستحيل)
// 🧠 مضاف إليه: Quiescence Search, Dynamic Endgame, Killer Heuristics للمستويات العليا.

const AI_LEVELS = {
    1: { id: 1, depth: 1, randomChance: 0.50, maxTime: 100,  name: "مبتدئ جداً" },
    2: { id: 2, depth: 2, randomChance: 0.20, maxTime: 200,  name: "مبتدئ" },
    3: { id: 3, depth: 3, randomChance: 0.05, maxTime: 400,  name: "سهل" },
    4: { id: 4, depth: 3, randomChance: 0.00, maxTime: 800,  name: "متوسط" },
    5: { id: 5, depth: 4, randomChance: 0.00, maxTime: 1200, name: "صعب" },
    6: { id: 6, depth: 4, randomChance: 0.00, maxTime: 1500, name: "محترف" },
    7: { id: 7, depth: 5, randomChance: 0.00, maxTime: 2000, name: "أستاذ" },
    8: { id: 8, depth: 6, randomChance: 0.00, maxTime: 3000, name: "جراند ماستر" },
    9: { id: 9, depth: 8, randomChance: 0.00, maxTime: 5000, name: "الزعيم (مستحيل)" }
};

const engine = {
    isValidPos(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; },
    getPieceDirection(color, bState, roomDirectionData = null) {
        const baseColor = color.split('-')[0];
        if (roomDirectionData && roomDirectionData[baseColor] !== undefined) return roomDirectionData[baseColor];
        let wSumRow = 0, wCount = 0, bSumRow = 0, bCount = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = bState[r][c];
                if (p) { if (p.startsWith('white')) { wSumRow += r; wCount++; } else if (p.startsWith('black')) { bSumRow += r; bCount++; } }
            }
        }
        if (wCount > 0 && bCount > 0) {
            return baseColor === 'white' ? ((wSumRow / wCount) < (bSumRow / bCount) ? 1 : -1) : ((bSumRow / bCount) < (wSumRow / wCount) ? 1 : -1);
        }
        return baseColor === 'black' ? 1 : -1;
    },
    getPieceCapturePaths(r, c, color, bState, dirY, parentDr = null, parentDc = null, roomDirectionData = null) {
        const baseColor = color.split('-')[0];
        const isDama = bState[r][c] && bState[r][c].endsWith('-dama');
        let currentDirections = isDama ? [[0, 1], [0, -1], [1, 0], [-1, 0]] : [[dirY, 0], [0, 1], [0, -1]];
        let paths = [];

        for (const [dr, dc] of currentDirections) {
            if (isDama && parentDr !== null && parentDc !== null && dr === -parentDr && dc === -parentDc) continue;

            if (isDama) {
                let step = 1, foundEnemy = null, enemyPos = { r: -1, c: -1 };
                while (true) {
                    const nextR = r + dr * step, nextC = c + dc * step;
                    if (!this.isValidPos(nextR, nextC)) break;
                    const piece = bState[nextR][nextC];
                    if (!foundEnemy) {
                        if (piece === null) { step++; continue; }
                        else if (!piece.startsWith(baseColor)) { foundEnemy = piece; enemyPos = { r: nextR, c: nextC }; step++; continue; }
                        else break;
                    } else {
                        if (piece === null) {
                            let capturedPiece = bState[enemyPos.r][enemyPos.c];
                            let movingPiece = bState[r][c];
                            bState[enemyPos.r][enemyPos.c] = null; bState[nextR][nextC] = movingPiece; bState[r][c] = null;
                            const stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyPos.r, midC: enemyPos.c };
                            const subPaths = this.getPieceCapturePaths(nextR, nextC, color, bState, dirY, dr, dc, roomDirectionData);
                            if (subPaths.length > 0) { for (const sp of subPaths) paths.push([stepObj, ...sp]); } else { paths.push([stepObj]); }
                            bState[r][c] = movingPiece; bState[nextR][nextC] = null; bState[enemyPos.r][enemyPos.c] = capturedPiece;
                            step++; continue;
                        } else break;
                    }
                }
            } else {
                const midR = r + dr, midC = c + dc, toR = r + 2 * dr, toC = c + 2 * dc;
                if (this.isValidPos(toR, toC)) {
                    const midPiece = bState[midR][midC], toPiece = bState[toR][toC];
                    if (midPiece && !midPiece.startsWith(baseColor) && toPiece === null) {
                        let capturedPiece = bState[midR][midC]; let movingPiece = bState[r][c];
                        let currentPieceForSimulation = movingPiece; let promoRow = (dirY === 1) ? 7 : 0;
                        if (toR === promoRow && !movingPiece.includes('dama')) { currentPieceForSimulation = movingPiece + '-dama'; }
                        bState[midR][midC] = null; bState[toR][toC] = currentPieceForSimulation; bState[r][c] = null;
                        const stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                        const subPaths = this.getPieceCapturePaths(toR, toC, color, bState, dirY, dr, dc, roomDirectionData);
                        if (subPaths.length > 0) { for (const sp of subPaths) paths.push([stepObj, ...sp]); } else { paths.push([stepObj]); }
                        bState[r][c] = movingPiece; bState[toR][toC] = null; bState[midR][midC] = capturedPiece;
                    }
                }
            }
        }
        return paths;
    },
    getPieceSimpleMoves(r, c, color, bState, dirY) {
        const baseColor = color.split('-')[0];
        const isDama = bState[r][c] && bState[r][c].endsWith('-dama');
        let currentDirections = isDama ? [[0, 1], [0, -1], [1, 0], [-1, 0]] : [[dirY, 0], [0, 1], [0, -1]];
        let moves = [];
        for (const [dr, dc] of currentDirections) {
            if (isDama) {
                let step = 1;
                while (true) {
                    const toR = r + dr * step, toC = c + dc * step;
                    if (!this.isValidPos(toR, toC) || bState[toR][toC] !== null) break;
                    moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]); step++;
                }
            } else {
                const toR = r + dr, toC = c + dc;
                if (this.isValidPos(toR, toC) && bState[toR][toC] === null) {
                    moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]);
                }
            }
        }
        return moves;
    },
    generateAllTurnMoves(color, bState, activeR = null, activeC = null, activeDr = null, activeDc = null, roomDirectionData = null) {
        let allCapturePaths = [], maxJumps = 0; const baseColor = color.split('-')[0];
        const dirY = this.getPieceDirection(baseColor, bState, roomDirectionData);
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = bState[r][c];
                if (piece && piece.startsWith(baseColor)) {
                    if (activeR !== null && activeC !== null && (r !== activeR || c !== activeC)) continue;
                    const initDr = (r === activeR && c === activeC) ? activeDr : null;
                    const initDc = (r === activeR && c === activeC) ? activeDc : null;
                    const paths = this.getPieceCapturePaths(r, c, baseColor, bState, dirY, initDr, initDc, roomDirectionData);
                    for (const p of paths) { if (p.length > maxJumps) maxJumps = p.length; allCapturePaths.push(p); }
                }
            }
        }
        if (maxJumps > 0) return allCapturePaths.filter(p => p.length === maxJumps);
        let allSimpleMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = bState[r][c];
                if (piece && piece.startsWith(baseColor)) {
                    if (activeR !== null && activeC !== null && (r !== activeR || c !== activeC)) continue;
                    allSimpleMoves.push(...this.getPieceSimpleMoves(r, c, baseColor, bState, dirY));
                }
            }
        }
        return allSimpleMoves;
    },
    applyPathToBoard(path, bState, roomDirectionData = null) {
        let newBoard = bState.map(row => [...row]);
        if (!path || path.length === 0) return newBoard;
        path.forEach(step => {
            let piece = newBoard[step.fromR][step.fromC];
            newBoard[step.fromR][step.fromC] = null;
            if (step.midR !== null && step.midC !== null) newBoard[step.midR][step.midC] = null;
            newBoard[step.toR][step.toC] = piece;
        });
        const lastStep = path[path.length - 1]; let fPiece = newBoard[lastStep.toR][lastStep.toC];
        if (fPiece && !fPiece.includes('dama')) {
            const dirY = this.getPieceDirection(fPiece.split('-')[0], newBoard, roomDirectionData);
            const promoRow = (dirY === 1) ? 7 : 0;
            if (lastStep.toR === promoRow) newBoard[lastStep.toR][lastStep.toC] += '-dama';
        }
        return newBoard;
    }
};

const ai = {
    nodesEvaluated: 0,
    killerMoves: new Array(30).fill(null), // خوارزمية الحركات القاتلة (Killer Heuristic)

    evaluateBoard(board, aiColor, pieceDirection, levelNum) {
        let score = 0;
        let oppColor = aiColor === 'white' ? 'black' : 'white';
        let myDir = engine.getPieceDirection(aiColor, board, pieceDirection);
        let oppDir = engine.getPieceDirection(oppColor, board, pieceDirection);
        
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
                
                // تطبيق الذكاء التدريجي بناءً على المستوى
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

                // مستويات (7-9): سد الثغرات وحماية الخط الخلفي
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

                // مستويات (8-9): الديناميكية في نهاية اللعبة (Endgame Trapping)
                if (levelNum >= 8 && isEndgame) {
                    if (isDama) {
                        let centerDist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                        if (myPieces > oppPieces) {
                            score -= (centerDist * 5) * sign; // إذا كنت فائزاً، احتل المركز بقوة
                        } else {
                            score += (centerDist * 3) * sign; // إذا كنت خاسراً، اهرب للحواف لتأخير الخسارة
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

    // خوارزمية البحث الهادئ (Quiescence Search) لكشف الفخاخ - تتفعل في المستويات 7 و 8 و 9
    quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, depthLimit) {
        this.nodesEvaluated++;
        let standPat = this.evaluateBoard(board, aiColor, pieceDirection, levelNum);
        
        if (depthLimit <= 0) return standPat; // منع الغوص اللانهائي

        if (isMaximizing) {
            if (standPat >= beta) return beta;
            if (alpha < standPat) alpha = standPat;
        } else {
            if (standPat <= alpha) return alpha;
            if (beta > standPat) beta = standPat;
        }

        // توليد الحركات الإجبارية فقط (الأكل)
        let allMoves = engine.generateAllTurnMoves(currentTurn, board, null, null, null, null, pieceDirection);
        let captures = allMoves.filter(m => m.some(step => step.midR !== null));
        
        if (captures.length === 0) return standPat;

        for (let move of captures) {
            let newBoard = engine.applyPathToBoard(move, board, pieceDirection);
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

    minimax(board, depth, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, startTime, maxTime, currentMovesNoProg, levelNum) {
        this.nodesEvaluated++;
        if (this.nodesEvaluated % 1000 === 0 && Date.now() - startTime >= maxTime) {
            return { score: this.evaluateBoard(board, aiColor, pieceDirection, levelNum), timeout: true };
        }
        
        if (currentMovesNoProg >= 50) return { score: 0 }; 
        
        if (depth === 0) {
            // تفعيل الـ Quiescence Search في المستويات العليا لكشف الفخاخ
            if (levelNum >= 7) {
                return { score: this.quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, 4) };
            } else {
                return { score: this.evaluateBoard(board, aiColor, pieceDirection, levelNum) };
            }
        }

        let possibleMoves = engine.generateAllTurnMoves(currentTurn, board, null, null, null, null, pieceDirection);
        if (possibleMoves.length === 0) return { score: isMaximizing ? -99999 : 99999 };

        // تنظيم الحركات (Move Ordering) لزيادة سرعة التفكير (وضع الحركات القاتلة والالتقاط أولاً)
        if (levelNum >= 8) {
            possibleMoves.sort((a, b) => {
                let aCapture = a.some(s => s.midR !== null) ? 100 : 0;
                let bCapture = b.some(s => s.midR !== null) ? 100 : 0;
                let aKiller = (this.killerMoves[depth] === a) ? 50 : 0;
                let bKiller = (this.killerMoves[depth] === b) ? 50 : 0;
                return (bCapture + bKiller) - (aCapture + aKiller);
            });
        }

        let bestMove = null; let isTimeout = false;

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let move of possibleMoves) {
                let isCapture = move.some(s => s.midR !== null);
                let lastStep = move[move.length - 1]; let piece = board[move[0].fromR][move[0].fromC];
                let promoRow = (engine.getPieceDirection(currentTurn, board, pieceDirection) === 1) ? 7 : 0;
                let isPromotion = (lastStep.toR === promoRow && !piece.includes('dama'));
                
                let nextMovesNoProg = (isCapture || isPromotion) ? 0 : currentMovesNoProg + 1;
                let newBoard = engine.applyPathToBoard(move, board, pieceDirection);
                let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                
                let result = this.minimax(newBoard, depth - 1, alpha, beta, false, nextTurn, aiColor, pieceDirection, startTime, maxTime, nextMovesNoProg, levelNum);
                if (result.timeout) isTimeout = true;
                
                if (result.score > maxEval) { maxEval = result.score; bestMove = move; }
                alpha = Math.max(alpha, result.score); 
                
                if (beta <= alpha) {
                    if (levelNum >= 8 && !isCapture) this.killerMoves[depth] = move; // تسجيل الحركة القاتلة
                    break;
                }
            }
            return { score: maxEval, move: bestMove, timeout: isTimeout };
        } else {
            let minEval = Infinity;
            for (let move of possibleMoves) {
                let isCapture = move.some(s => s.midR !== null);
                let lastStep = move[move.length - 1]; let piece = board[move[0].fromR][move[0].fromC];
                let promoRow = (engine.getPieceDirection(currentTurn, board, pieceDirection) === 1) ? 7 : 0;
                let isPromotion = (lastStep.toR === promoRow && !piece.includes('dama'));
                
                let nextMovesNoProg = (isCapture || isPromotion) ? 0 : currentMovesNoProg + 1;
                let newBoard = engine.applyPathToBoard(move, board, pieceDirection);
                let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                
                let result = this.minimax(newBoard, depth - 1, alpha, beta, true, nextTurn, aiColor, pieceDirection, startTime, maxTime, nextMovesNoProg, levelNum);
                if (result.timeout) isTimeout = true;
                
                if (result.score < minEval) { minEval = result.score; bestMove = move; }
                beta = Math.min(beta, result.score); 
                
                if (beta <= alpha) {
                    if (levelNum >= 8 && !isCapture) this.killerMoves[depth] = move;
                    break; 
                }
            }
            return { score: minEval, move: bestMove, timeout: isTimeout };
        }
    },

    getBestMove(board, levelInfo, aiColor, pieceDirection) {
        let maxAllowedDepth = levelInfo.depth; 
        let timeLimitMs = levelInfo.maxTime;
        let levelNum = levelInfo.id;
        
        let moves = engine.generateAllTurnMoves(aiColor, board, null, null, null, null, pieceDirection);
        if (moves.length === 0) return null;
        if (moves.length === 1) return moves[0];
        
        let startTime = Date.now();
        let bestMoveGlobal = moves[0];
        this.nodesEvaluated = 0;
        this.killerMoves.fill(null);
        
        for (let currentDepth = 2; currentDepth <= maxAllowedDepth; currentDepth++) {
            let result = this.minimax(board, currentDepth, -Infinity, Infinity, true, aiColor, aiColor, pieceDirection, startTime, timeLimitMs, 0, levelNum);
            
            if (result.move && !result.timeout) bestMoveGlobal = result.move;
            if (result.timeout || Date.now() - startTime >= timeLimitMs) break;
            if (Math.abs(result.score) > 90000) break; // وجد كش مات (فوز مؤكد)
        }
        return bestMoveGlobal;
    }
};

self.onmessage = function (e) {
    try {
        const { board, level, aiColor, pieceDirection } = e.data;
        const currentLevel = AI_LEVELS[level] || AI_LEVELS[3];
        
        let moves = engine.generateAllTurnMoves(aiColor, board, null, null, null, null, pieceDirection);
        if (!moves || moves.length === 0) return self.postMessage({ move: null });

        if (Math.random() < currentLevel.randomChance) {
            return self.postMessage({ move: moves[Math.floor(Math.random() * moves.length)] });
        }
        
        let bestMove = ai.getBestMove(board, currentLevel, aiColor, pieceDirection);
        self.postMessage({ move: bestMove || moves[0] });
    } catch (error) { 
        self.postMessage({ error: true, details: error.message || error.toString() }); 
    }
};
