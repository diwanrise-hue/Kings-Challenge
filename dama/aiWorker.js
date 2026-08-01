/**
 * aiWorker.js - النسخة الخارقة المحسنة (Smart Survival AI)
 * تم حل مشكلة "الغباء في المستويات العليا" وتأثير الأفق.
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

// 💡 تم تحديث دالة التقييم لتصبح عبقرية وتلعب بتكتيك بدلاً من العشوائية
function evaluateBoard(bState, targetColor) {
    let score = 0;
    let myPieces = 0, oppPieces = 0;
    let myDamas = 0, oppDamas = 0;
    let targetPure = targetColor.split('-')[0];
    let oppPure = targetPure === 'white' ? 'black' : 'white';

    let myDir = workerPieceDirection[targetPure] !== undefined ? workerPieceDirection[targetPure] : (targetPure === 'black' ? 1 : -1);
    let myBackRow = myDir === 1 ? 0 : 7;
    let oppBackRow = myDir === 1 ? 7 : 0;

    bState.forEach((row, r) => row.forEach((p, c) => {
        if (p) {
            let isTarget = p.startsWith(targetPure);
            let isDama = p.endsWith('-dama');
            
            let pieceValue = isDama ? 500 : 100;
            
            // 🛡️ مكافأة ضخمة للحفاظ على الصف الخلفي (تمنع الخصم من الترقية)
            let defenseBonus = (!isDama && r === (isTarget ? myBackRow : oppBackRow)) ? 30 : 0;
            
            // ⚔️ السيطرة على منتصف الرقعة
            let centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 10 : 0;
            
            // 🏃‍♂️ مكافأة التقدم نحو الترقية للأحجار العادية
            let advanceBonus = 0;
            if (!isDama) {
                let stepsForward = isTarget ? Math.abs(r - myBackRow) : Math.abs(r - oppBackRow);
                advanceBonus = stepsForward * 5; 
            }

            // 🧱 مكافأة الكتلة المتماسكة (حماية ظهر القطع)
            let protectionBonus = 0;
            if (!isDama) {
                let behindR = isTarget ? r - myDir : r + myDir;
                if (isValidPos(behindR, c) && bState[behindR][c] && bState[behindR][c].startsWith(isTarget ? targetPure : oppPure)) {
                    protectionBonus = 15;
                }
            }

            let totalValue = pieceValue + advanceBonus + centerBonus + defenseBonus + protectionBonus;

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

    // مكافأة استراتيجية: إذا كان لديك دامة والخصم ضعيف، طارده
    if (myDamas > 0 && oppPieces <= 3) score += 200;
    if (oppDamas > 0 && myPieces <= 3) score -= 200;

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

    let captures = path.filter(step => step.midR !== null).length;
    score += captures * 10000; // الأكل دائماً إجباري وأولوية قصوى

    if (!isDama && lastStep.toR === promoRow) {
        score += 1000; // الترقية أولوية ثانية
    }

    return score;
}

function minimax(bState, depth, alpha, beta, isMaximizing, color, targetColor, startTime, maxTime, isQuiescence = false) {
    if (Date.now() - startTime > maxTime) {
        return { score: evaluateBoard(bState, targetColor), timeOut: true };
    }

    let moves = generateAllTurnMoves(color, bState);
    let isCapture = moves.length > 0 && moves[0][0] && moves[0][0].midR !== null;

    if (depth <= 0) {
        if (isCapture && !isQuiescence) {
            depth = 1; // 💡 الاستمرار في الحساب قليلاً إذا كانت هناك مجزرة (أكل متسلسل)
            isQuiescence = true; 
        } else {
            return { score: evaluateBoard(bState, targetColor) };
        }
    }

    // 💡 غريزة البقاء: إضافة Depth للمجموع يجعل البوت يؤخر الخسارة ويستعجل الفوز
    if (moves.length === 0) return { score: isMaximizing ? -99999 + depth : 99999 - depth };
    
    moves.sort((a, b) => scoreMove(b, color, bState) - scoreMove(a, color, bState));

    let bestMove = moves[0];
    let nextColor = color === 'white' ? 'black' : 'white';
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let m of moves) {
            let result = minimax(applyPathToBoard(m, bState), depth - 1, alpha, beta, false, nextColor, targetColor, startTime, maxTime, isQuiescence);
            if (result.timeOut) return { score: maxEval === -Infinity ? evaluateBoard(bState, targetColor) : maxEval, move: bestMove, timeOut: true };

            if (result.score > maxEval) { maxEval = result.score; bestMove = m; }
            alpha = Math.max(alpha, result.score); 
            if (beta <= alpha) break;
        }
        return { score: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        for (let m of moves) {
            let result = minimax(applyPathToBoard(m, bState), depth - 1, alpha, beta, true, nextColor, targetColor, startTime, maxTime, isQuiescence);
            if (result.timeOut) return { score: minEval === Infinity ? evaluateBoard(bState, targetColor) : minEval, move: bestMove, timeOut: true };

            if (result.score < minEval) { minEval = result.score; bestMove = m; }
            beta = Math.min(beta, result.score); 
            if (beta <= alpha) break;
        }
        return { score: minEval, move: bestMove };
    }
}

self.onmessage = function(e) {
    const board = e.data.board || e.data.bState;
    const maxDepth = e.data.depth || 6;
    const aiColor = e.data.aiColor || e.data.color;

    if (e.data.pieceDirection) {
        workerPieceDirection = e.data.pieceDirection;
    } else {
        workerPieceDirection = { white: -1, black: 1 };
    }

    if (!board || !aiColor) return;

    let startTime = Date.now();
    let maxTime = 3000; // ⏳ ضمان عدم الانهيار إطلاقاً
    let bestResult = null;

    let safeMaxDepth = Math.min(maxDepth, 8); // 🛡️ مهما طلب الهاتف، لن نحسب أكثر من 8 لمنع الشلل المؤقت

    for (let d = 1; d <= safeMaxDepth; d++) {
        let result = minimax(board, d, -Infinity, Infinity, true, aiColor, aiColor, startTime, maxTime);
        
        // إذا انتهى الوقت أثناء هذا العمق، يتم تجاهله والاعتماد على أفضل نتيجة من العمق السابق
        if (result.timeOut && bestResult !== null) {
            break; 
        }
        
        bestResult = result;
        
        if (bestResult.score > 90000) break; // فوز ساحق، اضرب فوراً
    }

    if (!bestResult || !bestResult.move) {
        let fallbackMoves = generateAllTurnMoves(aiColor, board);
        bestResult = { move: fallbackMoves[0], score: 0 };
    }

    self.postMessage(bestResult); 
};
