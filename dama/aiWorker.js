// aiWorker.js - النسخة الخفيفة والسريعة (معالجة مشكلة الذاكرة ودعم الاتجاه الثابت)

/**
 * دالة مساعدة للتحقق من حدود اللوح
 */
const isValidPos = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

// متغير محلي لحفظ اتجاهات حركة القطع لكل لون
let workerPieceDirection = { white: -1, black: 1 };

/**
 * دالة حساب مسارات القفز والأكل الإجباري الديناميكية للملك والقطع العادية (مدعومة بـ Backtracking)
 */
function getPieceCapturePaths(r, c, color, bState, parentDr = null, parentDc = null) {
    const isDama = bState[r][c]?.endsWith('-dama');
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const pureColor = color.split('-')[0];

    // جلب الاتجاه الحقيقي للون
    let dirRow = workerPieceDirection[pureColor] !== undefined ? workerPieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
    let currentDirections = isDama ? directions : [[dirRow, 0], [0, 1], [0, -1]];

    let paths = [];

    for (const [dr, dc] of currentDirections) {
        // عدم العودة المباشرة في نفس الخط العكسي بـ 180 درجة في نفس القفزة
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
                    if (piece === null) { 
                        step++; 
                        continue; 
                    }
                    else if (!piece.startsWith(pureColor)) {
                        foundEnemy = piece;
                        enemyPos = { r: nextR, c: nextC };
                        step++; 
                        continue;
                    } else break; // قطعة من نفس اللون تمنع المرور
                } else {
                    if (piece === null) {
                        // 💡 تقنية Backtracking: نغير الرقعة مؤقتاً للتجربة ونعيدها كما كانت
                        let capturedPiece = bState[enemyPos.r][enemyPos.c];
                        let movingPiece = bState[r][c];

                        bState[enemyPos.r][enemyPos.c] = null;
                        bState[nextR][nextC] = movingPiece;
                        bState[r][c] = null;

                        const stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyPos.r, midC: enemyPos.c };
                        
                        // استكشاف القفزات التالية بحرية اتجاه كاملة من خانة الهبوط الحالية
                        const subPaths = getPieceCapturePaths(nextR, nextC, color, bState, dr, dc);

                        if (subPaths.length > 0) {
                            for (const sp of subPaths) paths.push([stepObj, ...sp]);
                        } else {
                            paths.push([stepObj]);
                        }

                        // 🔄 استرجاع الحالة الأصلية (Backtracking)
                        bState[r][c] = movingPiece;
                        bState[nextR][nextC] = null;
                        bState[enemyPos.r][enemyPos.c] = capturedPiece;

                        step++; 
                        continue;
                    } else break; // قطعة أخرى تعترض الطريق بعد الخصم
                }
            }
        } else {
            const midR = r + dr, midC = c + dc;
            const toR = r + 2 * dr, toC = c + 2 * dc;
            if (isValidPos(toR, toC)) {
                const midPiece = bState[midR][midC];
                const toPiece = bState[toR][toC];
                if (midPiece && !midPiece.startsWith(pureColor) && toPiece === null) {
                    // 💡 تقنية Backtracking للقطع العادية
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

                    // 🔄 استرجاع الحالة الأصلية (Backtracking)
                    bState[r][c] = movingPiece;
                    bState[toR][toC] = null;
                    bState[midR][midC] = capturedPiece;
                }
            }
        }
    }
    return paths;
}

/**
 * دالة حساب الحركات البسيطة العادية الديناميكية
 */
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

/**
 * المولد المركزي للحركات وفرض الأكل الأكبر إجبارياً
 */
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

/**
 * محاكاة حركة الأحجار والترقية الديناميكية بناءً على اتجاه الحركة الحقيقي للون
 */
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

    // ترقية الملوك ديناميكياً بناءً على الموقع الحقيقي
    let promoRow = workerPieceDirection[pureColor] === 1 ? 7 : 0;
    if (lastStep.toR === promoRow && !piece.includes('dama')) {
        newBoard[lastStep.toR][lastStep.toC] = pureColor + '-dama';
    }

    return newBoard;
}

/**
 * دالة تقييم الساحة الديناميكية الشاملة ودعم مكافآت تقدم القطع العادية
 */
function evaluateBoard(bState, targetColor) {
    let score = 0;
    bState.forEach((row, r) => row.forEach(p => {
        if (p) {
            let isTarget = p.startsWith(targetColor), isDama = p.endsWith('-dama');
            let pureColor = p.split('-')[0];
            let dir = workerPieceDirection[pureColor] || (pureColor === 'black' ? 1 : -1);
            
            let val = (isDama ? 35 : 10) + (!isDama ? (dir === 1 ? r * 0.2 : (7 - r) * 0.2) : 0);
            score += isTarget ? val : -val;
        }
    }));
    return score;
}

/**
 * خوارزمية البحث والذكاء الفعلي
 */
function minimax(bState, depth, alpha, beta, isMaximizing, color, targetColor) {
    if (depth === 0) return { score: evaluateBoard(bState, targetColor) };
    let moves = generateAllTurnMoves(color, bState);
    if (moves.length === 0) return { score: isMaximizing ? -10000 + (8 - depth) : 10000 - (8 - depth) };
    let bestMove = moves[0];
    let nextColor = color === 'white' ? 'black' : 'white';
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let m of moves) {
            let ev = minimax(applyPathToBoard(m, bState), depth - 1, alpha, beta, false, nextColor, targetColor).score;
            if (ev > maxEval) { maxEval = ev; bestMove = m; }
            alpha = Math.max(alpha, ev); if (beta <= alpha) break;
        }
        return { score: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        for (let m of moves) {
            let ev = minimax(applyPathToBoard(m, bState), depth - 1, alpha, beta, true, nextColor, targetColor).score;
            if (ev < minEval) { minEval = ev; bestMove = m; }
            beta = Math.min(beta, ev); if (beta <= alpha) break;
        }
        return { score: minEval, move: bestMove };
    }
}

/**
 * مستمع الأحداث المركزي والربط الشرعي الآمن مع المتصفح
 */
self.onmessage = function(e) {
    const board = e.data.board || e.data.bState;
    const depth = e.data.depth || 8;
    const aiColor = e.data.aiColor || e.data.color;

    // 💡 التعديل الجوهري: استلام الاتجاه الحقيقي من اللعبة للحماية من عمى البوت في نهاية اللعبة
    if (e.data.pieceDirection) {
        workerPieceDirection = e.data.pieceDirection;
    } else {
        workerPieceDirection = { white: -1, black: 1 };
    }

    if (!board || !aiColor) return;

    const result = minimax(board, depth, -Infinity, Infinity, true, aiColor, aiColor);
    self.postMessage(result); 
};
