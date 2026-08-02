/**
 * aiWorker.js - النسخة الخارقة المستقلة (Standalone Unleashed AI)
 * - تم دمج جدول النقلات (Transposition Table) لتسريع الأداء بشكل هائل.
 * - تم دمج ذكاء نهايات اللعب (Endgame Squeezing) لمحاصرة الخصم.
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

// -------------------------------------------------------------
// 🧠 إعدادات Transposition Table (جدول النقلات)
// -------------------------------------------------------------
const transpositionTable = new Map();
const FLAG_EXACT = 0;
const FLAG_LOWERBOUND = 1;
const FLAG_UPPERBOUND = 2;

// دالة التشفير (توليد مفتاح فريد للرقعة لسرعة البحث)
function getBoardHash(bState, isMaximizing) {
    let hash = isMaximizing ? '1' : '0';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let p = bState[r][c];
            hash += p ? (p[0] + (p.length > 5 ? 'D' : '')) : '.';
        }
    }
    return hash;
}

// -------------------------------------------------------------
const isValidPos = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

let workerPieceDirection = { white: -1, black: 1 };
let nodesEvaluated = 0; 

function getPieceCapturePaths(r, c, colorChar, bState, parentDr = null, parentDc = null) {
    const isDama = bState[r][c] && bState[r][c].length > 5;
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
    const colorChar = color[0]; 
    
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

    let myDamaPositions = [];
    let oppDamaPositions = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let p = bState[r][c];
            if (!p) continue;

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
            if (isTarget) { 
                score += totalValue; myPieces++; 
                if (isDama) { myDamas++; myDamaPositions.push({r, c}); } 
            } else { 
                score -= totalValue; oppPieces++; 
                if (isDama) { oppDamas++; oppDamaPositions.push({r, c}); } 
            }
        }
    }
    
    if (myDamas > 0 && oppPieces <= 3) score += 200;
    if (oppDamas > 0 && myPieces <= 3) score -= 200;

    // 🧠 ذكاء الـ Endgame (حشر الخصم)
    if (myDamas > oppDamas && oppPieces <= 3 && oppDamaPositions.length > 0) {
        let totalDistance = 0;
        for (let myD of myDamaPositions) {
            let minDist = 999;
            for (let oppD of oppDamaPositions) {
                let dist = Math.abs(myD.r - oppD.r) + Math.abs(myD.c - oppD.c); 
                if (dist < minDist) minDist = dist;
            }
            totalDistance += minDist;
        }
        score += (20 - totalDistance) * 5; 
    }

    return score;
}

function scoreMove(path, colorChar, bState) {
    let score = 0; 
    let dir = workerPieceDirection[colorChar === 'b' ? 'black' : 'white'];
    
    if (path[0].midR !== null) {
        score += path.length * 1000;
    }
    
    let lastStep = path[path.length - 1];
    let startStep = path[0];
    let piece = bState[startStep.fromR][startStep.fromC];
    
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

    // 🔍 1. البحث في جدول النقلات
    const hash = getBoardHash(bState, isMaximizing);
    const originalAlpha = alpha;

    if (transpositionTable.has(hash)) {
        const ttEntry = transpositionTable.get(hash);
        if (ttEntry.depth >= depth) {
            if (ttEntry.flag === FLAG_EXACT) {
                return { score: ttEntry.score, move: ttEntry.move };
            } else if (ttEntry.flag === FLAG_LOWERBOUND) {
                alpha = Math.max(alpha, ttEntry.score);
            } else if (ttEntry.flag === FLAG_UPPERBOUND) {
                beta = Math.min(beta, ttEntry.score);
            }
            if (alpha >= beta) {
                return { score: ttEntry.score, move: ttEntry.move };
            }
        }
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
    
    if (moves.length === 0) return { score: isMaximizing ? -9999 + depth : 9999 - depth };
    
    // 💡 ترتيب النقلات المتقدم المستفاد من الذاكرة
    let ttMove = transpositionTable.has(hash) ? transpositionTable.get(hash).move : null;
    let colorChar = color[0];
    
    for (let i = 0; i < moves.length; i++) { 
        moves[i]._score = scoreMove(moves[i], colorChar, bState); 
        if (ttMove && JSON.stringify(moves[i]) === JSON.stringify(ttMove)) {
            moves[i]._score += 10000;
        }
    }
    moves.sort((a, b) => b._score - a._score);
    
    let bestMove = moves[0]; 
    let nextColor = color === 'white' ? 'black' : 'white';
    let finalScore;
    let isTimeOut = false;

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let m of moves) {
            let undoData = doMove(bState, m); 
            let result = minimax(bState, depth - 1, alpha, beta, false, nextColor, targetColor, startTime, maxTime, isQuiescence);
            undoMove(bState, undoData); 

            if (result.timeOut) { isTimeOut = true; maxEval = maxEval === -Infinity ? evaluateBoard(bState, targetColor) : maxEval; break; }
            if (result.score > maxEval) { maxEval = result.score; bestMove = m; }
            alpha = Math.max(alpha, result.score); if (beta <= alpha) break;
        }
        finalScore = maxEval;
    } else {
        let minEval = Infinity;
        for (let m of moves) {
            let undoData = doMove(bState, m); 
            let result = minimax(bState, depth - 1, alpha, beta, true, nextColor, targetColor, startTime, maxTime, isQuiescence);
            undoMove(bState, undoData); 
            
            if (result.timeOut) { isTimeOut = true; minEval = minEval === Infinity ? evaluateBoard(bState, targetColor) : minEval; break; }
            if (result.score < minEval) { minEval = result.score; bestMove = m; }
            beta = Math.min(beta, result.score); if (beta <= alpha) break;
        }
        finalScore = minEval;
    }

    let returnObj = { score: finalScore, move: bestMove };
    if (isTimeOut) returnObj.timeOut = true;

    // 💾 2. حفظ النتيجة في الذاكرة
    if (!isTimeOut) {
        let flag = FLAG_EXACT;
        if (finalScore <= originalAlpha) flag = FLAG_UPPERBOUND;
        else if (finalScore >= beta) flag = FLAG_LOWERBOUND;
        
        // حماية ذاكرة الهاتف
        if (transpositionTable.size > 200000) transpositionTable.clear();
        transpositionTable.set(hash, { score: finalScore, depth: depth, flag: flag, move: bestMove });
    }

    return returnObj;
}

self.onmessage = function(e) {
    try {
        const board = e.data.board;
        const maxDepth = e.data.depth || 6;
        const level = e.data.level || 3; 
        const aiColor = e.data.aiColor;
        
        workerPieceDirection = e.data.pieceDirection || { white: -1, black: 1 };
        nodesEvaluated = 0; 
        
        // مسح الذاكرة جزئياً مع كل دور جديد لعدم إرهاق الهاتف
        transpositionTable.clear();
        
        if (!board || !aiColor) { throw new Error("بيانات الرقعة أو لون البوت مفقودة."); }

        let moves = generateAllTurnMoves(aiColor, board);

        if (moves.length === 1) { self.postMessage({ move: moves[0], score: 0 }); return; }
        if (moves.length === 0) { self.postMessage({ move: null, score: -999999 }); return; }

        let startTime = Date.now();
        
        // 🔥 الأوقات السريعة والمحدثة
        let maxTime = 500; 
        if (level === 4) maxTime = 1000;
        else if (level === 5) maxTime = 1500;
        else if (level === 6) maxTime = 6000;
        else if (level >= 7) maxTime = 8000;

        let bestResult = null;
        let safeMaxDepth = Math.min(maxDepth, 12); 

        // Iterative Deepening
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
