/**
 * aiWorker.js - النسخة الخارقة المستقلة (Standalone Unleashed AI)
 * تم إصلاح تسريب الذاكرة بالكامل (Zero Memory Leak) باستخدام نظام التراجع (Backtracking).
 * تم تحسين استهلاك المعالج (CPU) وتجنب حلقات التفكير اللانهائية.
 */

// -------------------------------------------------------------
// 🛡️ نظام صيد الأخطاء العام (Global Error Handler)
// -------------------------------------------------------------
self.onerror = function(message, source, lineno, colno, error) {
    self.postMessage({ error: true, type: 'CRITICAL_SYSTEM_ERROR', details: message });
    return true; 
};

self.addEventListener('unhandledrejection', function(event) {
    self.postMessage({ error: true, type: 'UNHANDLED_REJECTION', details: event.reason });
});
// -------------------------------------------------------------

const isValidPos = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

let workerPieceDirection = { white: -1, black: 1 };
let nodesEvaluated = 0; // عداد للحد من استدعاء Date.now() المكلف للمعالج

function getPieceCapturePaths(r, c, color, bState, parentDr = null, parentDc = null) {
    const isDama = bState[r][c]?.endsWith('-dama');
    const pureColor = color.split('-')[0];
    let dirRow = workerPieceDirection[pureColor] !== undefined ? workerPieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
    let currentDirections = isDama ? [[0, 1], [0, -1], [1, 0], [-1, 0]] : [[dirRow, 0], [0, 1], [0, -1]];
    let paths = [];

    for (const [dr, dc] of currentDirections) {
        if (isDama && parentDr !== null && parentDc !== null) {
            if (dr === -parentDr && dc === -parentDc) continue;
        }

        if (isDama) {
            let step = 1; let foundEnemy = null; let enemyPos = { r: -1, c: -1 };
            while (true) {
                const nextR = r + dr * step; const nextC = c + dc * step;
                if (!isValidPos(nextR, nextC)) break;
                const piece = bState[nextR][nextC];
                if (!foundEnemy) {
                    if (piece === null) { step++; continue; }
                    else if (!piece.startsWith(pureColor)) { foundEnemy = piece; enemyPos = { r: nextR, c: nextC }; step++; continue; }
                    else break; 
                } else {
                    if (piece === null) {
                        let capturedPiece = bState[enemyPos.r][enemyPos.c]; let movingPiece = bState[r][c];
                        bState[enemyPos.r][enemyPos.c] = null; bState[nextR][nextC] = movingPiece; bState[r][c] = null;
                        const stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyPos.r, midC: enemyPos.c };
                        const subPaths = getPieceCapturePaths(nextR, nextC, color, bState, dr, dc);
                        if (subPaths.length > 0) { for (const sp of subPaths) paths.push([stepObj, ...sp]); } else { paths.push([stepObj]); }
                        bState[r][c] = movingPiece; bState[nextR][nextC] = null; bState[enemyPos.r][enemyPos.c] = capturedPiece;
                        step++; continue;
                    } else break;
                }
            }
        } else {
            const midR = r + dr, midC = c + dc; const toR = r + 2 * dr, toC = c + 2 * dc;
            if (isValidPos(toR, toC)) {
                const midPiece = bState[midR][midC]; const toPiece = bState[toR][toC];
                if (midPiece && !midPiece.startsWith(pureColor) && toPiece === null) {
                    let capturedPiece = bState[midR][midC]; let movingPiece = bState[r][c];
                    bState[midR][midC] = null; bState[toR][toC] = movingPiece; bState[r][c] = null;
                    const stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                    const subPaths = getPieceCapturePaths(toR, toC, color, bState, dr, dc);
                    if (subPaths.length > 0) { for (const sp of subPaths) paths.push([stepObj, ...sp]); } else { paths.push([stepObj]); }
                    bState[r][c] = movingPiece; bState[toR][toC] = null; bState[midR][midC] = capturedPiece;
                }
            }
        }
    }
    return paths;
}

function getPieceSimpleMoves(r, c, color, bState) {
    const isDama = bState[r][c]?.endsWith('-dama');
    const pureColor = color.split('-')[0];
    let dirRow = workerPieceDirection[pureColor] !== undefined ? workerPieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
    let currentDirections = isDama ? [[0, 1], [0, -1], [1, 0], [-1, 0]] : [[dirRow, 0], [0, 1], [0, -1]];
    let moves = [];
    for (const [dr, dc] of currentDirections) {
        if (isDama) {
            let step = 1;
            while (true) {
                const toR = r + dr * step; const toC = c + dc * step;
                if (!isValidPos(toR, toC) || bState[toR][toC] !== null) break;
                moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]); step++;
            }
        } else {
            const toR = r + dr, toC = c + dc;
            if (isValidPos(toR, toC) && bState[toR][toC] === null) { moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]); }
        }
    }
    return moves;
}

function generateAllTurnMoves(color, bState) {
    let allCapturePaths = []; let maxJumps = 0; const pureColor = color.split('-')[0];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = bState[r][c];
            if (piece && piece.startsWith(pureColor)) {
                const paths = getPieceCapturePaths(r, c, color, bState, null, null);
                for (const p of paths) { if (p.length > maxJumps) maxJumps = p.length; allCapturePaths.push(p); }
            }
        }
    }
    if (maxJumps > 0) return allCapturePaths.filter(p => p.length === maxJumps);
    
    let allSimpleMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = bState[r][c];
            if (piece && piece.startsWith(pureColor)) { allSimpleMoves.push(...getPieceSimpleMoves(r, c, color, bState)); }
        }
    }
    return allSimpleMoves;
}

// 💡 1. نظام التراجع (Backtracking) - بديل وحش الذاكرة (applyPathToBoard)
function doMove(board, path) {
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
    let promoRow = workerPieceDirection[pureColor] === 1 ? 7 : 0;
    let finalPiece = piece;

    if (lastStep.toR === promoRow && !piece.includes('dama')) {
        finalPiece = pureColor + '-dama';
        undoData.wasPromoted = true;
    }

    board[lastStep.toR][lastStep.toC] = finalPiece;
    return undoData;
}

function undoMove(board, undoData) {
    let lastStep = undoData.path[undoData.path.length - 1];
    let startStep = undoData.path[0];

    board[lastStep.toR][lastStep.toC] = null;
    board[startStep.fromR][startStep.fromC] = undoData.startPiece;

    for (let cap of undoData.captures) {
        board[cap.r][cap.c] = cap.p;
    }
}

function evaluateBoard(bState, targetColor) {
    let score = 0; let myPieces = 0, oppPieces = 0; let myDamas = 0, oppDamas = 0;
    let targetPure = targetColor.split('-')[0]; let oppPure = targetPure === 'white' ? 'black' : 'white';
    let myDir = workerPieceDirection[targetPure] !== undefined ? workerPieceDirection[targetPure] : (targetPure === 'black' ? 1 : -1);
    let myBackRow = myDir === 1 ? 0 : 7; let oppBackRow = myDir === 1 ? 7 : 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let p = bState[r][c];
            if (!p) continue;

            let isTarget = p.startsWith(targetPure); let isDama = p.endsWith('-dama');
            let pieceValue = isDama ? 500 : 100;
            let defenseBonus = (!isDama && r === myBackRow && isTarget) ? 30 : 0;
            let centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 10 : 0;
            let advanceBonus = 0;
            
            if (!isDama) { advanceBonus = isTarget ? Math.abs(r - myBackRow) * 5 : Math.abs(r - oppBackRow) * 5; }
            
            let protectionBonus = 0;
            if (!isDama) {
                let behindR = isTarget ? r - myDir : r + myDir;
                if (isValidPos(behindR, c) && bState[behindR][c]) {
                    let pieceBehind = bState[behindR][c];
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
}

// 💡 2. تحسين ترتيب الحركات لتسريع القص (Alpha-Beta Pruning)
function scoreMove(path, color, bState) {
    let score = 0; 
    let pureColor = color.split('-')[0];
    let dir = workerPieceDirection[pureColor] !== undefined ? workerPieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
    
    let captures = path.filter(step => step.midR !== null).length;
    score += captures * 1000;
    
    let lastStep = path[path.length - 1];
    let startStep = path[0];
    let piece = bState[startStep.fromR][startStep.fromC];
    
    if (piece && !piece.endsWith('-dama') && lastStep.toR === ((dir === 1) ? 7 : 0)) { 
        score += 500; 
    }
    return score;
}

function minimax(bState, depth, alpha, beta, isMaximizing, color, targetColor, startTime, maxTime, isQuiescence = false) {
    // 💡 3. فحص الوقت كل 500 محاولة فقط بدلاً من كل خطوة لتوفير المعالج
    nodesEvaluated++;
    if (nodesEvaluated % 500 === 0 && Date.now() - startTime > maxTime) { 
        return { score: evaluateBoard(bState, targetColor), timeOut: true }; 
    }

    let moves = generateAllTurnMoves(color, bState);
    let isCapture = moves.length > 0 && moves[0][0] && moves[0][0].midR !== null;

    if (depth <= 0) {
        // حماية ضد الـ Infinite Loop في الـ Quiescence Search
        if (isCapture && !isQuiescence && depth > -3) { 
            isQuiescence = true; 
        } else { 
            return { score: evaluateBoard(bState, targetColor) }; 
        }
    }
    
    if (moves.length === 0) return { score: isMaximizing ? -99999 + depth : 99999 - depth };
    
    moves.sort((a, b) => scoreMove(b, color, bState) - scoreMove(a, color, bState));
    let bestMove = moves[0]; 
    let nextColor = color === 'white' ? 'black' : 'white';
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let m of moves) {
            let undoData = doMove(bState, m); // ⬅️ تطبيق التراجع
            let result = minimax(bState, depth - 1, alpha, beta, false, nextColor, targetColor, startTime, maxTime, isQuiescence);
            undoMove(bState, undoData); // ⬅️ إرجاع الحالة بعد التقييم

            if (result.timeOut) return { score: maxEval === -Infinity ? evaluateBoard(bState, targetColor) : maxEval, move: bestMove, timeOut: true };
            if (result.score > maxEval) { maxEval = result.score; bestMove = m; }
            alpha = Math.max(alpha, result.score); if (beta <= alpha) break;
        }
        return { score: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        for (let m of moves) {
            let undoData = doMove(bState, m); // ⬅️ تطبيق التراجع
            let result = minimax(bState, depth - 1, alpha, beta, true, nextColor, targetColor, startTime, maxTime, isQuiescence);
            undoMove(bState, undoData); // ⬅️ إرجاع الحالة بعد التقييم
            
            if (result.timeOut) return { score: minEval === Infinity ? evaluateBoard(bState, targetColor) : minEval, move: bestMove, timeOut: true };
            if (result.score < minEval) { minEval = result.score; bestMove = m; }
            beta = Math.min(beta, result.score); if (beta <= alpha) break;
        }
        return { score: minEval, move: bestMove };
    }
}

self.onmessage = function(e) {
    try {
        const board = e.data.board;
        const maxDepth = e.data.depth || 6;
        const level = e.data.level || 3; 
        const aiColor = e.data.aiColor;
        
        workerPieceDirection = e.data.pieceDirection || { white: -1, black: 1 };
        nodesEvaluated = 0; // تصفير العداد لكل محاولة
        
        if (!board || !aiColor) {
            throw new Error("بيانات الرقعة (Board) أو لون البوت (aiColor) مفقودة.");
        }

        let moves = generateAllTurnMoves(aiColor, board);

        if (moves.length === 1) {
            self.postMessage({ move: moves[0], score: 0 });
            return;
        }
        
        if (moves.length === 0) {
            self.postMessage({ move: null, score: -999999 });
            return;
        }

        let startTime = Date.now();
        
        // ⏳ ضبط توقيت منطقي حسب المستويات لحماية المتصفح
        let maxTime = 1500; 
        if (level === 4) maxTime = 2500;
        else if (level === 5) maxTime = 4000;
        else if (level === 6) maxTime = 6000;
        else if (level >= 7) maxTime = 8000;

        let bestResult = null;
        let safeMaxDepth = Math.min(maxDepth, 9); // العمق الأقصى الآمن

        for (let d = 1; d <= safeMaxDepth; d++) {
            let result = minimax(board, d, -Infinity, Infinity, true, aiColor, aiColor, startTime, maxTime);
            
            if (!result || typeof result.score === 'undefined') {
                throw new Error(`خطأ في تقييم العمق ${d}`);
            }

            if (result.timeOut && bestResult !== null) { 
                break; 
            }
            bestResult = result;
            if (bestResult.score > 90000) break; // قطع الفوز المحتم
        }

        if (!bestResult || !bestResult.move) {
            bestResult = { move: moves[0], score: 0 };
        }

        self.postMessage(bestResult); 

    } catch (error) {
        self.postMessage({ error: true, type: 'LOGIC_ERROR', details: error.message });
    }
};
