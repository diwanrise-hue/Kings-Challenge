/**
 * aiWorker.js - النسخة الخارقة المستقلة (Standalone Unleashed AI)
 * 🚀 تم تسريع الأداء لـ 10 أضعاف بإزالة دوال النصوص البطيئة والفلترة.
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
let nodesEvaluated = 0; 

function getPieceCapturePaths(r, c, colorChar, bState, parentDr = null, parentDc = null) {
    // 🔥 تسريع: استخدام طول النص بدلاً من endsWith
    const isDama = bState[r][c] && bState[r][c].length > 5;
    
    // 🔥 تسريع: استخدام الحرف الأول w أو b بدلاً من split
    let dirRow = workerPieceDirection[colorChar === 'b' ? 'black' : 'white'];
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
                    // 🔥 تسريع: فحص الحرف الأول فقط للون
                    else if (piece[0] !== colorChar) { foundEnemy = piece; enemyPos = { r: nextR, c: nextC }; step++; continue; }
                    else break; 
                } else {
                    if (piece === null) {
                        let capturedPiece = bState[enemyPos.r][enemyPos.c]; let movingPiece = bState[r][c];
                        bState[enemyPos.r][enemyPos.c] = null; bState[nextR][nextC] = movingPiece; bState[r][c] = null;
                        const stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyPos.r, midC: enemyPos.c };
                        const subPaths = getPieceCapturePaths(nextR, nextC, colorChar, bState, dr, dc);
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
                // 🔥 تسريع: فحص الحرف الأول
                if (midPiece && midPiece[0] !== colorChar && toPiece === null) {
                    let capturedPiece = bState[midR][midC]; let movingPiece = bState[r][c];
                    bState[midR][midC] = null; bState[toR][toC] = movingPiece; bState[r][c] = null;
                    const stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                    const subPaths = getPieceCapturePaths(toR, toC, colorChar, bState, dr, dc);
                    if (subPaths.length > 0) { for (const sp of subPaths) paths.push([stepObj, ...sp]); } else { paths.push([stepObj]); }
                    bState[r][c] = movingPiece; bState[toR][toC] = null; bState[midR][midC] = capturedPiece;
                }
            }
        }
    }
    return paths;
}

function getPieceSimpleMoves(r, c, colorChar, bState) {
    const isDama = bState[r][c] && bState[r][c].length > 5;
    let dirRow = workerPieceDirection[colorChar === 'b' ? 'black' : 'white'];
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
    let allCapturePaths = []; let maxJumps = 0; 
    const colorChar = color[0]; // 'w' or 'b'
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = bState[r][c];
            if (piece && piece[0] === colorChar) {
                const paths = getPieceCapturePaths(r, c, colorChar, bState, null, null);
                for (const p of paths) { if (p.length > maxJumps) maxJumps = p.length; allCapturePaths.push(p); }
            }
        }
    }
    if (maxJumps > 0) return allCapturePaths.filter(p => p.length === maxJumps);
    
    let allSimpleMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = bState[r][c];
            if (piece && piece[0] === colorChar) { allSimpleMoves.push(...getPieceSimpleMoves(r, c, colorChar, bState)); }
        }
    }
    return allSimpleMoves;
}

function doMove(board, path) {
    let startStep = path[0];
    let piece = board[startStep.fromR][startStep.fromC];
    let undoData = { path: path, captures: [], wasPromoted: false, startPiece: piece };

    board[startStep.fromR][startStep.fromC] = null;

    for (let step of path) {
        if (step.midR !== null) {
            undoData.captures.push({ r: step.midR, c: step.midC, p: board[step.midR][step.midC] });
            board[step.midR][step.midC] = null;
        }
    }

    let lastStep = path[path.length - 1];
    let promoRow = workerPieceDirection[piece[0] === 'b' ? 'black' : 'white'] === 1 ? 7 : 0;
    let finalPiece = piece;

    if (lastStep.toR === promoRow && piece.length <= 5) {
        finalPiece = (piece[0] === 'w' ? 'white' : 'black') + '-dama';
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
    let targetChar = targetColor[0]; 
    let oppChar = targetChar === 'w' ? 'b' : 'w';
    let myDir = workerPieceDirection[targetChar === 'b' ? 'black' : 'white'];
    let myBackRow = myDir === 1 ? 0 : 7; let oppBackRow = myDir === 1 ? 7 : 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let p = bState[r][c];
            if (!p) continue;

            // 🔥 تسريع هائل:
            let isTarget = p[0] === targetChar; 
            let isDama = p.length > 5; 
            
            let pieceValue = isDama ? 500 : 100;
            let defenseBonus = (!isDama && r === myBackRow && isTarget) ? 30 : 0;
            let centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 10 : 0;
            let advanceBonus = 0;
            
            if (!isDama) { advanceBonus = isTarget ? Math.abs(r - myBackRow) * 5 : Math.abs(r - oppBackRow) * 5; }
            
            let protectionBonus = 0;
            if (!isDama) {
                let behindR = isTarget ? r - myDir : r + myDir;
                if (isValidPos(behindR, c) && bState[behindR][c]) {
                    let pBehind = bState[behindR][c];
                    if ((isTarget && pBehind[0] === targetChar) || (!isTarget && pBehind[0] === oppChar)) { protectionBonus = 15; }
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

// 💡 2. إزالة filter نهائياً لتسريع الترتيب
function scoreMove(path, colorChar, bState) {
    let score = 0; 
    let dir = workerPieceDirection[colorChar === 'b' ? 'black' : 'white'];
    
    // إذا كانت الخطوة الأولى تحتوي على midR، إذن هذا مسار أكل، وعدد الأكلات = طول المسار
    if (path[0].midR !== null) {
        score += path.length * 1000;
    }
    
    let lastStep = path[path.length - 1];
    let startStep = path[0];
    let piece = bState[startStep.fromR][startStep.fromC];
    
    // الترقية
    if (piece && piece.length <= 5 && lastStep.toR === ((dir === 1) ? 7 : 0)) { 
        score += 500; 
    }
    return score;
}

function minimax(bState, depth, alpha, beta, isMaximizing, color, targetColor, startTime, maxTime, isQuiescence = false) {
    nodesEvaluated++;
    if (nodesEvaluated % 500 === 0 && Date.now() - startTime > maxTime) { 
        return { score: evaluateBoard(bState, targetColor), timeOut: true }; 
    }

    let moves = generateAllTurnMoves(color, bState);
    let isCapture = moves.length > 0 && moves[0][0] && moves[0][0].midR !== null;

    if (depth <= 0) {
        if (isCapture && !isQuiescence && depth > -3) { 
            isQuiescence = true; 
        } else { 
            return { score: evaluateBoard(bState, targetColor) }; 
        }
    }
    
    if (moves.length === 0) return { score: isMaximizing ? -99999 + depth : 99999 - depth };
    
    // 💡 ترتيب أسرع عن طريق تخزين التقييم مؤقتاً
    let colorChar = color[0];
    for (let i = 0; i < moves.length; i++) { moves[i]._score = scoreMove(moves[i], colorChar, bState); }
    moves.sort((a, b) => b._score - a._score);
    
    let bestMove = moves[0]; 
    let nextColor = color === 'white' ? 'black' : 'white';
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let m of moves) {
            let undoData = doMove(bState, m); 
            let result = minimax(bState, depth - 1, alpha, beta, false, nextColor, targetColor, startTime, maxTime, isQuiescence);
            undoMove(bState, undoData); 

            if (result.timeOut) return { score: maxEval === -Infinity ? evaluateBoard(bState, targetColor) : maxEval, move: bestMove, timeOut: true };
            if (result.score > maxEval) { maxEval = result.score; bestMove = m; }
            alpha = Math.max(alpha, result.score); if (beta <= alpha) break;
        }
        return { score: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        for (let m of moves) {
            let undoData = doMove(bState, m); 
            let result = minimax(bState, depth - 1, alpha, beta, true, nextColor, targetColor, startTime, maxTime, isQuiescence);
            undoMove(bState, undoData); 
            
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
        nodesEvaluated = 0; 
        
        if (!board || !aiColor) { throw new Error("بيانات الرقعة أو لون البوت مفقودة."); }

        let moves = generateAllTurnMoves(aiColor, board);

        if (moves.length === 1) { self.postMessage({ move: moves[0], score: 0 }); return; }
        if (moves.length === 0) { self.postMessage({ move: null, score: -999999 }); return; }

        let startTime = Date.now();
        
        let maxTime = 1500; 
        if (level === 4) maxTime = 2500;
        else if (level === 5) maxTime = 4000;
        else if (level === 6) maxTime = 6000;
        else if (level >= 7) maxTime = 8000;

        let bestResult = null;
        let safeMaxDepth = Math.min(maxDepth, 9); 

        for (let d = 1; d <= safeMaxDepth; d++) {
            let result = minimax(board, d, -Infinity, Infinity, true, aiColor, aiColor, startTime, maxTime);
            if (result.timeOut && bestResult !== null) { break; }
            bestResult = result;
            if (bestResult.score > 90000) break; 
        }

        if (!bestResult || !bestResult.move) { bestResult = { move: moves[0], score: 0 }; }
        self.postMessage(bestResult); 

    } catch (error) {
        self.postMessage({ error: true, type: 'LOGIC_ERROR', details: error.message });
    }
};
