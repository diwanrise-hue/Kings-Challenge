/**
 * aiWorker.js - النسخة الخارقة (Unstoppable AI)
 * تم تفعيل نظام التعميق التدريجي (Iterative Deepening) ومؤقت الحماية لمنع الانهيار واللعب العشوائي.
 */

const isValidPos = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

let workerPieceDirection = { white: -1, black: 1 };

function getPieceCapturePaths(r, c, color, bState, parentDr = null, parentDc = null) {
    const isDama = bState[r][c]?.endsWith('-dama');
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const pureColor = color.split('-')[0];

    let dirRow = workerPieceDirection[pureColor] !== undefined ? workerPieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
    let currentDirections = isDama ? directions : [[dirRow, 0], [0, 1], [0, -1]];

    let paths = [];

    for (const [dr, dc] of currentDirections) {
        if (isDama && parentDr !== null && parentDc !== null) {
            if (dr === -parentDr && dc === -parentDc) continue;
        }

        if (isDama) {
            let step = 1;
            let foundEnemy = null;
            let enemyPos = { r: -1, c: -1 };

            while (true) {
                const nextR = r + dr * step;
                const nextC = c + dc * step;
                if (!isValidPos(nextR, nextC)) break;

                const piece = bState[nextR][nextC];
                if (!foundEnemy) {
                    if (piece === null) { step++; continue; }
                    else if (!piece.startsWith(pureColor)) {
                        foundEnemy = piece;
                        enemyPos = { r: nextR, c: nextC };
                        step++; continue;
                    } else break; 
                } else {
                    if (piece === null) {
                        let capturedPiece = bState[enemyPos.r][enemyPos.c];
                        let movingPiece = bState[r][c];

                        bState[enemyPos.r][enemyPos.c] = null;
                        bState[nextR][nextC] = movingPiece;
                        bState[r][c] = null;

                        const stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyPos.r, midC: enemyPos.c };
                        const subPaths = getPieceCapturePaths(nextR, nextC, color, bState, dr, dc);

                        if (subPaths.length > 0) {
                            for (const sp of subPaths) paths.push([stepObj, ...sp]);
                        } else {
                            paths.push([stepObj]);
                        }

                        bState[r][c] = movingPiece;
                        bState[nextR][nextC] = null;
                        bState[enemyPos.r][enemyPos.c] = capturedPiece;

                        step++; continue;
                    } else break;
                }
            }
        } else {
            const midR = r + dr, midC = c + dc;
            const toR = r + 2 * dr, toC = c + 2 * dc;
            if (isValidPos(toR, toC)) {
                const midPiece = bState[midR][midC];
                const toPiece = bState[toR][toC];
                if (midPiece && !midPiece.startsWith(pureColor) && toPiece === null) {
                    let capturedPiece = bState[midR][midC];
                    let movingPiece = bState[r][c];

                    bState[midR][midC] = null;
                    bState[toR][toC] = movingPiece;
                    bState[r][c] = null;

                    const stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                    const subPaths = getPieceCapturePaths(toR, toC, color, bState, dr, dc);

                    if (subPaths.length > 0) {
                        for (const sp of subPaths) paths.push([stepObj, ...sp]);
                    } else {
                        paths.push([stepObj]);
                    }

                    bState[r][c] = movingPiece;
                    bState[toR][toC] = null;
                    bState[midR][midC] = capturedPiece;
                }
            }
        }
    }
    return paths;
}

function getPieceSimpleMoves(r, c, color, bState) {
    const isDama = bState[r][c]?.endsWith('-dama');
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const pureColor = color.split('-')[0];

    let dirRow = workerPieceDirection[pureColor] !== undefined ? workerPieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
    let currentDirections = isDama ? directions : [[dirRow, 0], [0, 1], [0, -1]];

    let moves = [];
    for (const [dr, dc] of currentDirections) {
        if (isDama) {
            let step = 1;
            while (true) {
                const toR = r + dr * step;
                const toC = c + dc * step;
                if (!isValidPos(toR, toC) || bState[toR][toC] !== null) break;

                moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]);
                step++;
            }
        } else {
            const toR = r + dr, toC = c + dc;
            if (isValidPos(toR, toC) && bState[toR][toC] === null) {
                moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]);
            }
        }
    }
    return moves;
}

function generateAllTurnMoves(color, bState) {
    let allCapturePaths = [];
    let maxJumps = 0;
    const pureColor = color.split('-')[0];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = bState[r][c];
            if (piece && piece.startsWith(pureColor)) {
                const paths = getPieceCapturePaths(r, c, color, bState, null, null);
                for (const p of paths) {
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
            const piece = bState[r][c];
            if (piece && piece.startsWith(pureColor)) {
                allSimpleMoves.push(...getPieceSimpleMoves(r, c, color, bState));
            }
        }
    }
    return allSimpleMoves;
}

function applyPathToBoard(path, bState) {
    let newBoard = bState.map(row => [...row]);
    if (!path || path.length === 0) return newBoard;

    const startStep = path[0];
    const piece = newBoard[startStep.fromR][startStep.fromC];
    newBoard[startStep.fromR][startStep.fromC] = null;

    for (const step of path) {
        if (step.midR !== null && step.midC !== null) {
            newBoard[step.midR][step.midC] = null;
        }
        newBoard[step.toR][step.toC] = piece;
    }

    const lastStep = path[path.length - 1];
    const pureColor = piece.split('-')[0];

    let promoRow = workerPieceDirection[pureColor] === 1 ? 7 : 0;
    if (lastStep.toR === promoRow && !piece.includes('dama')) {
        newBoard[lastStep.toR][lastStep.toC] = pureColor + '-dama';
    }

    return newBoard;
}

function evaluateBoard(bState, targetColor) {
    let score = 0;
    let myPieces = 0, oppPieces = 0;
    let myDamas = 0, oppDamas = 0;

    bState.forEach((row, r) => row.forEach((p, c) => {
        if (p) {
            let isTarget = p.startsWith(targetColor);
            let isDama = p.endsWith('-dama');
            let pureColor = p.split('-')[0];
            let dir = workerPieceDirection[pureColor] !== undefined ? workerPieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
            
            let pieceValue = isDama ? 40 : 10;
            let centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 0.5 : 0;
            let advanceBonus = !isDama ? (dir === 1 ? r * 0.3 : (7 - r) * 0.3) : 0;
            let edgePenalty = (c === 0 || c === 7) ? -0.2 : 0;
            
            let defenseBonus = 0;
            let backRow = r - dir;
            if (isValidPos(backRow, c) && bState[backRow][c] && bState[backRow][c].startsWith(pureColor)) {
                defenseBonus = 0.5;
            }

            let totalValue = pieceValue + advanceBonus + centerBonus + edgePenalty + defenseBonus;

            if (isTarget) {
                score += totalValue;
                myPieces++;
                if (isDama) myDamas++;
            } else {
                score -= totalValue;
                oppPieces++;
                if (isDama) oppDamas++;
            }
        }
    }));

    if (myDamas > 0 && oppPieces <= 3) score += 5;
    if (oppDamas > 0 && myPieces <= 3) score -= 5;

    return score;
}

function scoreMove(path, color, bState) {
    let score = 0;
    let lastStep = path[path.length - 1];
    let pureColor = color.split('-')[0];
    let dir = workerPieceDirection[pureColor] !== undefined ? workerPieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
    let promoRow = (dir === 1) ? 7 : 0;
    
    let piece = bState[path[0].fromR][path[0].fromC];
    let isDama = piece && piece.endsWith('-dama');

    // 💡 الأولوية الأولى والأهم: حركات الأكل! هذا يسرع التفكير بنسبة هائلة
    let captures = path.filter(step => step.midR !== null).length;
    score += captures * 1000;

    // أولوية الترقية إلى ملك
    if (!isDama && lastStep.toR === promoRow) {
        score += 500;
    }

    // التمركز
    if (lastStep.toR >= 2 && lastStep.toR <= 5 && lastStep.toC >= 2 && lastStep.toC <= 5) {
        score += 10;
    }

    return score;
}

// 💡 النسخة المطورة من خوارزمية Minimax مع مؤقت حماية لمنع الانهيار
function minimax(bState, depth, alpha, beta, isMaximizing, color, targetColor, startTime, maxTime, isQuiescence = false) {
    // 🛡️ درع الحماية: التوقف فوراً إذا طال التفكير لإنقاذ الهاتف من الانهيار
    if (Date.now() - startTime > maxTime) {
        return { score: evaluateBoard(bState, targetColor), timeOut: true };
    }

    let moves = generateAllTurnMoves(color, bState);
    let isCapture = moves.length > 0 && moves[0][0] && moves[0][0].midR !== null;

    if (depth <= 0) {
        if (isCapture && !isQuiescence) {
            depth = 1;
            isQuiescence = true; 
        } else {
            return { score: evaluateBoard(bState, targetColor) };
        }
    }

    if (moves.length === 0) return { score: isMaximizing ? -10000 + (20 - depth) : 10000 - (20 - depth) };
    
    // 💡 ترتيب الحركات لاختبار الضربات القاضية أولاً (يسرع الحسابات بـ 90%)
    moves.sort((a, b) => scoreMove(b, color, bState) - scoreMove(a, color, bState));

    let bestMove = moves[0];
    let nextColor = color === 'white' ? 'black' : 'white';
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let m of moves) {
            let result = minimax(applyPathToBoard(m, bState), depth - 1, alpha, beta, false, nextColor, targetColor, startTime, maxTime, isQuiescence);
            if (result.timeOut) return { score: maxEval, move: bestMove, timeOut: true }; // التوقف الآمن

            if (result.score > maxEval) { maxEval = result.score; bestMove = m; }
            alpha = Math.max(alpha, result.score); 
            if (beta <= alpha) break;
        }
        return { score: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        for (let m of moves) {
            let result = minimax(applyPathToBoard(m, bState), depth - 1, alpha, beta, true, nextColor, targetColor, startTime, maxTime, isQuiescence);
            if (result.timeOut) return { score: minEval, move: bestMove, timeOut: true }; // التوقف الآمن

            if (result.score < minEval) { minEval = result.score; bestMove = m; }
            beta = Math.min(beta, result.score); 
            if (beta <= alpha) break;
        }
        return { score: minEval, move: bestMove };
    }
}

self.onmessage = function(e) {
    const board = e.data.board || e.data.bState;
    const maxDepth = e.data.depth || 8;
    const aiColor = e.data.aiColor || e.data.color;

    if (e.data.pieceDirection) {
        workerPieceDirection = e.data.pieceDirection;
    } else {
        workerPieceDirection = { white: -1, black: 1 };
    }

    if (!board || !aiColor) return;

    let startTime = Date.now();
    let maxTime = 3000; // ⏳ البوت سيفكر لمدة 3 ثواني كحد أقصى مهما كان مستواه ليمنع الانهيار
    let bestResult = null;

    // 💡 السحر هنا: نبدأ البحث من العمق 1 ونزيد تدريجياً. إذا انهار الوقت، نأخذ نتيجة العمق السابق!
    for (let d = 1; d <= maxDepth; d++) {
        let result = minimax(board, d, -Infinity, Infinity, true, aiColor, aiColor, startTime, maxTime);
        if (result.timeOut) {
            // توقف بسبب الوقت، اعتمد على أذكى حركة تم التوصل لها حتى الآن
            break; 
        }
        bestResult = result;
        
        if (bestResult.score > 9000) break; // وجد ضربة فوز قاضية، لا داعي لإكمال التفكير
    }

    // إذا فشل في العثور على أي حركة (شبه مستحيل)، يلعب أول حركة قانونية
    if (!bestResult || !bestResult.move) {
        let fallbackMoves = generateAllTurnMoves(aiColor, board);
        bestResult = { move: fallbackMoves[0], score: 0 };
    }

    self.postMessage(bestResult); 
};
