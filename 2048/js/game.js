(function () {
    'use strict';

    const SIZE = 4;
    const WIN_VALUE = 2048;
    const STORAGE_KEY = '2048-best-score';

    let grid = [];
    let score = 0;
    let best = 0;
    let won = false;
    let over = false;
    let tiles = []; // 当前渲染的方块数据 {id, value, row, col, merged, isNew}

    const boardEl = document.getElementById('board');
    const gridContainer = document.getElementById('gridContainer');
    const tileContainer = document.getElementById('tileContainer');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');
    const gameOverEl = document.getElementById('gameOver');
    const gameWinEl = document.getElementById('gameWin');
    const goScoreEl = document.getElementById('goScore');

    let nextId = 1;

    function init() {
        best = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
        buildGrid();
        newGame();
        bindEvents();
    }

    function buildGrid() {
        gridContainer.innerHTML = '';
        for (let i = 0; i < SIZE * SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            gridContainer.appendChild(cell);
        }
    }

    function newGame() {
        grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        tiles = [];
        score = 0;
        won = false;
        over = false;
        nextId = 1;
        gameOverEl.classList.remove('show');
        gameWinEl.classList.remove('show');
        addRandomTile();
        addRandomTile();
        render();
        updateScore();
    }

    function addRandomTile() {
        const empty = [];
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (grid[r][c] === 0) empty.push([r, c]);
        if (empty.length === 0) return;
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        grid[r][c] = value;
        tiles.push({ id: nextId++, value, row: r, col: c, isNew: true, merged: false });
    }

    // 将一行向左滑动合并，返回新行和本行得分
    function slideRow(row) {
        const arr = row.filter(v => v !== 0);
        let gained = 0;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                gained += arr[i];
                arr.splice(i + 1, 1);
            }
        }
        while (arr.length < SIZE) arr.push(0);
        return { row: arr, gained };
    }

    function move(direction) {
        if (over) return;
        const before = JSON.stringify(grid);
        let rotated = grid.map(r => [...r]);

        // 通过旋转统一处理成"向左滑"
        const rotations = { left: 0, up: 1, right: 2, down: 3 }[direction];
        for (let i = 0; i < rotations; i++) rotated = rotateCW(rotated);

        let gainedTotal = 0;
        const newRows = [];
        for (let r = 0; r < SIZE; r++) {
            const { row, gained } = slideRow(rotated[r]);
            newRows.push(row);
            gainedTotal += gained;
        }
        rotated = newRows;

        // 记录合并标记，用于动画
        for (let i = 0; i < rotations; i++) rotated = rotateCCW(rotated);
        grid = rotated;

        if (gainedTotal > 0) {
            score += gainedTotal;
            updateScore();
        }

        if (JSON.stringify(grid) !== before) {
            // 重建 tiles 的位置（保留合并/新增标记做动画）
            syncTilesAfterMove();
            addRandomTile();
            render();
            checkState();
        }
    }

    function rotateCW(m) {
        const res = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                res[c][SIZE - 1 - r] = m[r][c];
        return res;
    }

    function rotateCCW(m) {
        const res = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                res[SIZE - 1 - c][r] = m[r][c];
        return res;
    }

    // 根据 grid 重新对齐 tiles 坐标，标记合并
    function syncTilesAfterMove() {
        const valueCount = {};
        tiles.forEach(t => { t.merged = false; });
        // 简化处理：直接按 grid 重建，合并的格子标 merged
        // 用贪心匹配保留 id，让动画更自然
        const used = new Set();
        const newTiles = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const v = grid[r][c];
                if (v === 0) continue;
                // 找一个未使用、同值、离目标最近的旧 tile
                let bestTile = null, bestDist = Infinity;
                for (const t of tiles) {
                    if (used.has(t.id) || t.value !== v) continue;
                    const d = Math.abs(t.row - r) + Math.abs(t.col - c);
                    if (d < bestDist) { bestDist = d; bestTile = t; }
                }
                if (bestTile) {
                    used.add(bestTile.id);
                    bestTile.row = r; bestTile.col = c;
                    newTiles.push(bestTile);
                } else {
                    newTiles.push({ id: nextId++, value: v, row: r, col: c, isNew: false, merged: false });
                }
            }
        }
        tiles = newTiles;
    }

    function render() {
        tileContainer.innerHTML = '';
        const sizePct = 100 / SIZE;
        const gap = 3; // 与 CSS gap 大致对应的视觉内缩（百分比）
        tiles.forEach(t => {
            const el = document.createElement('div');
            el.className = 'tile tile-' + (t.value <= 2048 ? t.value : 'super');
            if (t.isNew) el.classList.add('tile-new');
            if (t.merged) el.classList.add('tile-merged');
            el.style.width = `calc(${sizePct}% - ${gap * (SIZE - 1) / SIZE}px)`;
            el.style.height = `calc(${sizePct}% - ${gap * (SIZE - 1) / SIZE}px)`;
            el.style.top = `calc(${t.row * sizePct}% + ${t.row * gap}px)`;
            el.style.left = `calc(${t.col * sizePct}% + ${t.col * gap}px)`;
            const inner = document.createElement('div');
            inner.className = 'tile-inner';
            inner.textContent = t.value;
            el.appendChild(inner);
            tileContainer.appendChild(el);
            t.isNew = false;
        });
    }

    function updateScore() {
        scoreEl.textContent = score;
        if (score > best) {
            best = score;
            localStorage.setItem(STORAGE_KEY, best);
        }
        bestEl.textContent = best;
    }

    function checkState() {
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (grid[r][c] === WIN_VALUE && !won) {
                    won = true;
                    gameWinEl.classList.add('show');
                }
        if (!canMove()) {
            over = true;
            goScoreEl.textContent = '最终得分：' + score;
            gameOverEl.classList.add('show');
        }
    }

    function canMove() {
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] === 0) return true;
                if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
                if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
            }
        return false;
    }

    function bindEvents() {
        document.addEventListener('keydown', (e) => {
            const map = {
                ArrowUp: 'up', ArrowDown: 'down',
                ArrowLeft: 'left', ArrowRight: 'right'
            };
            if (map[e.key]) {
                e.preventDefault();
                move(map[e.key]);
            }
        });

        // 触摸滑动
        let startX = 0, startY = 0, touching = false;
        boardEl.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            touching = true;
        }, { passive: true });

        boardEl.addEventListener('touchmove', (e) => {
            if (!touching) return;
            e.preventDefault();
        }, { passive: false });

        boardEl.addEventListener('touchend', (e) => {
            if (!touching) return;
            touching = false;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const absX = Math.abs(dx), absY = Math.abs(dy);
            if (Math.max(absX, absY) < 20) return;
            if (absX > absY) move(dx > 0 ? 'right' : 'left');
            else move(dy > 0 ? 'down' : 'up');
        });

        document.getElementById('newGameBtn').addEventListener('click', newGame);
        document.getElementById('restartBtn').addEventListener('click', newGame);
        document.getElementById('keepBtn').addEventListener('click', () => {
            gameWinEl.classList.remove('show');
        });
    }

    init();
})();
