// aiWorker.js - النسخة الخفيفة والذكية جداً (معالجة مشكلة الذاكرة، دعم الاتجاه الثابت، التقييم العميق وترتيب الحركات)

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
 * دالة تقييم الساحة الديناميكية الشاملة (النسخة الذكية والآمنة)
 */
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
            
            // 1. مكافأة السيطرة على المنتصف
            let centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 0.5 : 0;
            
            // 2. مكافأة التقدم للأمام للقطع العادية
            let advanceBonus = !isDama ? (dir === 1 ? r * 0.3 : (7 - r) * 0.3) : 0;
            
            // 3. عقوبة البقاء في الحواف (لتقليل القطع المحاصرة)
            let edgePenalty = (c === 0 || c === 7) ? -0.2 : 0;
            
            // 4. مكافأة الحماية (وجود قطعة زميلة في الخلف تدعمها)
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

    // 5. ذكاء نهايات اللعب: إذا كان البوت متفوقاً بملك والخصم قطعه قليلة، نزيد قيمة الهجوم لمحاصرته
    if (myDamas > 0 && oppPieces <= 3) score += 5;
    if (oppDamas > 0 && myPieces <= 3) score -= 5;

    return score;
}

/**
 * دالة لترتيب أولويات الحركات (Move Ordering) لتسريع البحث المتقدم
 */
function scoreMove(path, color, bState) {
    let score = 0;
    let lastStep = path[path.length - 1];
    let pureColor = color.split('-')[0];
    let dir = workerPieceDirection[pureColor] !== undefined ? workerPieceDirection[pureColor] : (pureColor === 'black' ? 1 : -1);
    let promoRow = (dir === 1) ? 7 : 0;
    
    let piece = bState[path[0].fromR][path[0].fromC];
    let isDama = piece && piece.endsWith('-dama');

    // أولوية قصوى: الترقية إلى دامة (ملك)
    if (!isDama && lastStep.toR === promoRow) {
        score += 100;
    }

    // أولوية ثانوية: التمركز في وسط الرقعة
    if (lastStep.toR >= 2 && lastStep.toR <= 5 && lastStep.toC >= 2 && lastStep.toC <= 5) {
        score += 10;
    }

    return score;
}

/**
 * خوارزمية البحث مع معالجة تأثير الأفق وترتيب الحركات لتسريع التقليم
 */
function minimax(bState, depth, alpha, beta, isMaximizing, color, targetColor, isQuiescence = false) {
    let moves = generateAllTurnMoves(color, bState);
    
    // هل الحركة المتاحة هي عملية أكل إجبارية؟
    let isCapture = moves.length > 0 && moves[0][0] && moves[0][0].midR !== null;

    // معالجة "تأثير الأفق": إذا انتهى العمق لكن هناك فخ أكل، استمر خطوة إضافية لترى النتيجة
    if (depth <= 0) {
        if (isCapture && !isQuiescence) {
            depth = 1;
            isQuiescence = true; // تمنع الدوران اللانهائي وتحافظ على سرعة البوت
        } else {
            return { score: evaluateBoard(bState, targetColor) };
        }
    }

    if (moves.length === 0) return { score: isMaximizing ? -10000 + (8 - depth) : 10000 - (8 - depth) };
    
    // 💡 السحر هنا: ترتيب الحركات لاختبار الأفضل أولاً وتسريع القص (Pruning)
    moves.sort((a, b) => scoreMove(b, color, bState) - scoreMove(a, color, bState));

    let bestMove = moves[0];
    let nextColor = color === 'white' ? 'black' : 'white';
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let m of moves) {
            let ev = minimax(applyPathToBoard(m, bState), depth - 1, alpha, beta, false, nextColor, targetColor, isQuiescence).score;
            if (ev > maxEval) { maxEval = ev; bestMove = m; }
            alpha = Math.max(alpha, ev); if (beta <= alpha) break;
        }
        return { score: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        for (let m of moves) {
            let ev = minimax(applyPathToBoard(m, bState), depth - 1, alpha, beta, true, nextColor, targetColor, isQuiescence).score;
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
