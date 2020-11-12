declare let Settings: any;
declare let Game: any;
declare let $: any;
interface Window {
    submit: any;
}
type PointCountStr = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
type PointCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
interface Point {
    index: number;
    number: PointCountStr;
    row: number;
    col: number;
}
type BridgeCount = 1 | 2;
enum BridgeDirectionEnum {
    ROW = 1,
    COL = 2,
}
interface Bridge {
    p: Point;
    q: Point;
    count: BridgeCount;
}

function parseTask(key: string, puzzleWidth: number) {
    const rowFromIndex = function (t: number) {
        return Math.floor(t / puzzleWidth);
    };
    const colFromIndex = function (t: number) {
        return t % puzzleWidth;
    };
    const decodeChar = function (e: string) {
        return e.charCodeAt(0) - 96;
    };
    let task = [];
    for (var e = 0, i = 0; i < key.length; i++) '0' <= key[i] && key[i] <= '9' ? (task.push({
        index: task.length,
        number: key[i],
        row: rowFromIndex(e),
        col: colFromIndex(e)
    }), e++) : e += decodeChar(key[i]);
    // console.log('parse task result', task, JSON.stringify(task));
    return task;
}
// function getPointMapKey(): undefined;
// function getPointMapKey(p: { row: number, col: number }): string;
// function getPointMapKey(p?: { row: number, col: number }) {
//     return p && `${p.row},${p.col}`;
// }
function initNearestPoints(task: Point[]) {
    let rows: { [key in string]: { [key in number]: Point } } = {},
        columns: { [key in string]: { [key in number]: Point } } = {};
    for (let p of task) {
        if (rows[p.row] === undefined) { rows[p.row] = {} }
        rows[p.row][p.col] = p;
        if (columns[p.col] === undefined) { columns[p.col] = {} }
        columns[p.col][p.row] = p;
    }
    // let map: { [key in string]: Partial<{ top: string; bottom: string; left: string; right: string; }> } = {};
    let map: { [key in string]: Partial<{ bottom: number; right: number; }> } = {};
    for (let p of task) {
        const row = rows[p.row];
        const rowKeys = Object.keys(row);
        const pRowIndex = rowKeys.indexOf(p.col.toString());
        const col = columns[p.col];
        const colKeys = Object.keys(col);
        const pColIndex = colKeys.indexOf(p.row.toString());
        map[p.index] = {
            // top: getPointMapKey(col[pColIndex - 1]),
            // bottom: getPointMapKey(col[pColIndex + 1]),
            // left: getPointMapKey(row[pRowIndex - 1]),
            // right: getPointMapKey(row[pRowIndex + 1]),
            bottom: Object.values(col)[pColIndex + 1]?.index,
            right: Object.values(row)[pRowIndex + 1]?.index,
        };
    }
    return map;
}

function checkBridge(array: { p: Point, q: Point }[]) { //严重错误，抛出异常中断
    for (const { p, q } of array) {
        if (p.row == q.row && p.col == q.col) { throw new Error(`error while checkBridge: p、q 是同一点. ${JSON.stringify(array)}. 异常点对: ${JSON.stringify([p, q])}`) }
        if (p.row != q.row && p.col != q.col) { throw new Error(`error while checkBridge: p、q 不在同一水平或竖直方向. ${JSON.stringify(array)}. 异常点对: ${JSON.stringify([p, q])}`) }
        if ((p.row == q.row && p.col > q.col) || (p.col == q.col && p.row > q.row)) { throw new Error(`error while checkBridge: p、q 顺序错位. ${JSON.stringify(array)}. 异常点对: ${JSON.stringify([p, q])}`) }
    }
}
function newBridge(p1: Point, p2: Point, count: BridgeCount): Bridge {
    checkBridge([{ p: p1, q: p2 }]);
    let [p, q] = p1.row < p2.row ? [p1, p2] : p1.row > p2.row ? [p2, p1] : p1.col < p2.col ? [p1, p2] : [p2, p1];
    return { p: { ...p }, q: { ...q }, count };
}
interface recu1Data {
    //const
    points: Point[];
    nearestPointMap: ReturnType<typeof initNearestPoints>,
    //var
    currentPointIndex: number,
    selectedBridge: Map<string, Bridge>, //`${p_index}_${q_index}`
    currentPointStatus: PointCount[],
}
function cross(a: Point, b: Point, c: Point) { //向量ab和ac叉乘
    return (b.row - a.row) * (c.col - a.col) - (b.col - a.col) * (c.row - a.row);
}
function intersection(l1: Bridge, l2: Bridge): boolean { //计算几何，判断两线段是否相交（T型此处认为不相交）
    const a = l1.p, b = l1.q, c = l2.p, d = l2.q;
    //快速排斥
    if (Math.min(a.row, b.row) > Math.max(c.row, d.row) || Math.min(a.col, b.col) > Math.max(c.col, d.col) || Math.min(c.row, d.row) > Math.max(a.row, b.row) || Math.min(c.col, d.col) > Math.max(a.col, b.col)) { return false }
    //跨立实验
    // let h, i, j, k;
    const h = cross(a, b, c);
    // const i = cross(b, a, d);//cross(a, b, d);
    const i = cross(a, b, d);
    const j = cross(d, c, a);
    const k = cross(d, c, b);
    return h * i < 0 && j * k < 0;
}
// function bridgeCrossOrOverlap(b1: Bridge, b2: Bridge) { //待优化，采用判断线段是否相交
//     console.log('check bridgeCrossOrOverlap', b1, b2);
//     const b1_direction = b1.p.row == b1.q.row ? BridgeDirectionEnum.ROW : BridgeDirectionEnum.COL;
//     const b2_direction = b2.p.row == b2.q.row ? BridgeDirectionEnum.ROW : BridgeDirectionEnum.COL;
//     console.log('directions', b1_direction, b2_direction);
//     if (b1_direction == b2_direction) {
//         if (b1_direction == BridgeDirectionEnum.ROW) {
//             if (b1.p.row == b2.p.row) { //水平判断是否重叠
//                 const p1 = b1.p.col, q1 = b1.q.col, p2 = b2.p.col, q2 = b2.q.col;
//                 if ((p2 <= p1 && p1 < q2) || (p2 < q1 && q1 <= q2) || (p1 <= p2 && p2 < q1) || (p1 < q2 && q2 <= q1)) { return true }
//                 else { return false };
//             } else { return false }
//         } else {
//             if (b1.p.col == b2.p.col) { //竖直判断是否重叠
//                 const p1 = b1.p.row, q1 = b1.q.row, p2 = b2.p.row, q2 = b2.q.row;
//                 if ((p2 <= p1 && p1 < q2) || (p2 < q1 && q1 <= q2) || (p1 <= p2 && p2 < q1) || (p1 < q2 && q2 <= q1)) { return true }
//                 else { return false };
//             } else { return false }
//         }
//     } else {
//         const [b_row, b_col] = b1_direction == BridgeDirectionEnum.ROW ? [b1, b2] : [b2, b1];
//         if (b_col.p.col < b_row.p.col || b_col.p.col > b_row.q.col) { return false }
//         else if (b_row.p.row < b_col.p.row || b_row.p.row > b_col.q.row) { return false }
//         else if (b_col.p.col == b_row.p.col || b_col.p.col == b_row.q.col) {
//             // if()
//         }
//         console.log('different direction case', b_row, b_col);
//         // if (b_col.p.col <= b_row.p.col || b_col.p.col >= b_row.q.col) { console.log('case1'); return false }
//         // else if (b_row.p.row <= b_col.p.row || b_row.p.row >= b_col.q.row) { console.log('case2'); return false }
//         // else { console.log('case3 true'); return true } //此处忽略形如 T型 的异常情况，认为在构建可用边时 不会出现这种场景
//     }
// }
function bridgeIsAvaliable(bridge: Bridge, data: recu1Data): boolean { //判断已选边是否与指定边冲突（交叉）
    // console.warn('check bridgeIsAvaliable', bridge, Object.fromEntries([...data.selectedBridge.entries()]));
    // checkBridge([bridge, ...data.selectedBridge.values()]);
    checkBridge([bridge]);
    const { selectedBridge } = data;
    for (let b of selectedBridge.values()) {
        if (intersection(bridge, b)) { return false }
    }
    return true;
}
function getAvaliableBridge(data: recu1Data) { //获取当前的可用边
    // console.log('getAvaliableBridge', data.currentPointIndex, { ...data });
    const { points, currentPointIndex, nearestPointMap, selectedBridge, currentPointStatus } = data;
    const p = points[currentPointIndex];
    const p_status = currentPointStatus[currentPointIndex];
    let res: [Bridge | undefined, Bridge | undefined] = [undefined, undefined];
    const { bottom, right } = nearestPointMap[p.index];
    // console.log('bottom,right', bottom, right);
    // console.log('check point', p_status < +p.number);
    if (bottom && p_status < +p.number) {
        const b_p = points[bottom];
        const b_p_status = currentPointStatus[bottom];
        // console.log('check bottom', b_p, b_p_status, b_p_status < +b_p.number);
        if (b_p_status < +b_p.number) {
            const bridge = newBridge(p, b_p, Math.min(2, +p.number - p_status, +b_p.number - b_p_status) as BridgeCount);
            // console.log('new bridge', bridge);
            const isaval = bridgeIsAvaliable(bridge, data);
            // console.log('isaval', isaval);
            isaval && (res[0] = bridge);
            // bridgeIsAvaliable(bridge, data) && (res[0] = bridge)
        }
    }
    if (right && p_status < +p.number) {
        const r_p = points[right];
        const r_p_status = currentPointStatus[right];
        // console.log('check right', r_p, r_p_status, r_p_status < +r_p.number);
        if (r_p_status < +r_p.number) {
            const bridge = newBridge(p, r_p, Math.min(2, +p.number - p_status, +r_p.number - r_p_status) as BridgeCount);
            // console.log('new bridge', bridge);
            const isaval = bridgeIsAvaliable(bridge, data);
            // console.log('isaval', isaval);
            isaval && (res[1] = bridge);
            // bridgeIsAvaliable(bridge, data) && (res[1] = bridge)
        }
    }
    return res;
}
function getBridgeCases(avaliableBridges: ReturnType<typeof getAvaliableBridge>, restCount: PointCount): [Bridge | undefined, Bridge | undefined][] { //基于(可用边,节点剩余count)，生成当前节点的边方案
    const cases = {           //只考虑bottom和right的位置
        [0]: [],            //最多有8种情况
        [1]: [1, 3],        //1. bottom0+right1
        [2]: [2, 4, 6],     //2. bottom0+right2
        [3]: [5, 7],        //3. bottom1+right0
        [4]: [8],           //4. bottom1+right1
        [5]: [8],           //5. bottom1+right2
        [6]: [8],           //6. bottom2+right0
        [7]: [8],           //7. bottom2+right1
        [8]: [8],           //8. bottom2+right2
    }[restCount] as (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)[];

    const [bottom, right] = avaliableBridges;
    return cases.map(c => (
        ({
            [1]: right && right.count >= 1
                ? [undefined, right && newBridge(right.p, right.q, 1)]
                : [undefined, undefined],
            [2]: right && right.count >= 2
                ? [undefined, right && newBridge(right.p, right.q, 2)]
                : [undefined, undefined],
            [3]: bottom && bottom.count >= 1
                ? [bottom && newBridge(bottom.p, bottom.q, 1), undefined]
                : [undefined, undefined],
            [4]: bottom && bottom.count >= 1 && right && right.count >= 1
                ? [bottom && newBridge(bottom.p, bottom.q, 1), right && newBridge(right.p, right.q, 1)]
                : [undefined, undefined],
            [5]: bottom && bottom.count >= 1 && right && right.count >= 2
                ? [bottom && newBridge(bottom.p, bottom.q, 1), right && newBridge(right.p, right.q, 2)]
                : [undefined, undefined],
            [6]: bottom && bottom.count >= 2
                ? [bottom && newBridge(bottom.p, bottom.q, 2), undefined]
                : [undefined, undefined],
            [7]: bottom && bottom.count >= 2 && right && right.count >= 1
                ? [bottom && newBridge(bottom.p, bottom.q, 2), right && newBridge(right.p, right.q, 1)]
                : [undefined, undefined],
            [8]: bottom && bottom.count >= 2 && right && right.count >= 2
                ? [bottom && newBridge(bottom.p, bottom.q, 2), right && newBridge(right.p, right.q, 2)]
                : [undefined, undefined],
        } as { [key in 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8]: [Bridge | undefined, Bridge | undefined] })[c]
    )).filter(c => !(c[0] === undefined && c[1] === undefined));
}
let c = 0;
function recu1(data: recu1Data): recu1Data | false { //递归所有节点
    // console.warn('recu1', data.currentPointIndex, { ...data }, c++);
    const { points, currentPointIndex, nearestPointMap, selectedBridge, currentPointStatus } = data;
    if (currentPointIndex == points.length) { //递归边界
        // console.log('到达递归边界');
        const res = verificate1(data);
        // console.log('verificate1 res', res);
        if (res) return data;
        else return false;
        // if (verificate1(data)) return data;
        // else return false;
    }

    const point = points[currentPointIndex];
    const avaliableBridges = getAvaliableBridge(data);
    // console.log('avaliableBridges', avaliableBridges);
    if (avaliableBridges[0] === undefined && avaliableBridges[1] === undefined) {
        if (+point.number == currentPointStatus[currentPointIndex]) {
            return recu1({ points, nearestPointMap, currentPointIndex: currentPointIndex + 1, selectedBridge: new Map(selectedBridge), currentPointStatus: [...currentPointStatus] });
        } else { return false } //若无可用边，但节点count未完成，则返回失败
    } else {
        const p_status = currentPointStatus[currentPointIndex];
        const p_rest_count = +point.number - p_status as PointCount;
        const cases = getBridgeCases(avaliableBridges, p_rest_count);
        // console.log('bridge cases', cases);
        for (const c of cases) {
            // console.log('执行case', c);
            const [bottom, right] = c;
            const nextSelectedBridge = new Map(selectedBridge);
            let nextCurrentPointStatus = [...currentPointStatus];
            if (bottom) {
                nextSelectedBridge.set(`${bottom.p.index}_${bottom.q.index}`, bottom);
                nextCurrentPointStatus[bottom.p.index] += bottom.count;
                nextCurrentPointStatus[bottom.q.index] += bottom.count;
            }
            if (right) {
                nextSelectedBridge.set(`${right.p.index}_${right.q.index}`, right);
                nextCurrentPointStatus[right.p.index] += right.count;
                nextCurrentPointStatus[right.q.index] += right.count;
            }
            const res = recu1({ points, nearestPointMap, currentPointIndex: currentPointIndex + 1, selectedBridge: nextSelectedBridge, currentPointStatus: nextCurrentPointStatus });
            if (res) { return res; }
        }
        return false;
    }
}
function verificate1(data: recu1Data): boolean {
    // console.warn('verificate1', { ...data });
    const { points, currentPointStatus, selectedBridge } = data;
    // console.log('判断节点是否完成', [...points], [...currentPointStatus]);
    //判断所有节点count是否完成
    for (const [index, point] of points.entries()) {
        if (+point.number !== currentPointStatus[index]) {
            // console.log('节点未完成');
            return false;
        }
    }
    // console.log('节点已完成');

    //并查集 判断节点是否全连通
    const set = Array.from(new Array(points.length).keys());
    const findSet = (v: number): number => {
        let t1, t2 = v;
        while (v != set[v]) v = set[v];
        while (t2 != set[t2]) { t1 = set[t2]; set[t2] = v; t2 = t1; }
        return v;
    }
    const unionSet = (a: number, b: number) => {
        const a1 = findSet(a), b1 = findSet(b);
        if (a1 != b1) { set[a1] = b1 };
    }
    //初始化bridge连接
    for (const b of selectedBridge.values()) { unionSet(b.p.index, b.q.index) }
    //统计集合数
    const counts = Array.from(new Array(points.length).keys()).filter(i => findSet(i) == i).length;
    return counts === 1;
}
function solution1(): string {
    // const taskKey: string = Settings.get(Game.getSaveIdent());
    // const task: Point[] = Game.task;
    const taskKey: string = 'f21b2a1h3b3b5h1d33d2a'; //test
    const task: Point[] = parseTask(taskKey, 7) as Point[]; //test
    console.log('task', taskKey, task);
    // const task: Point[] = [{ "index": 0, "number": "2", "row": 0, "col": 0 }, { "index": 1, "number": "3", "row": 0, "col": 6 }, { "index": 2, "number": "3", "row": 1, "col": 1 }, { "index": 3, "number": "4", "row": 1, "col": 3 }, { "index": 4, "number": "3", "row": 1, "col": 5 }, { "index": 5, "number": "2", "row": 3, "col": 1 }, { "index": 6, "number": "1", "row": 3, "col": 4 }, { "index": 7, "number": "3", "row": 5, "col": 0 }, { "index": 8, "number": "3", "row": 5, "col": 5 }, { "index": 9, "number": "1", "row": 6, "col": 2 }, { "index": 10, "number": "3", "row": 6, "col": 6 }]; //test
    const nearestPointMap = initNearestPoints(task);
    console.log('nearestPointMap', nearestPointMap);
    const result = recu1({
        points: task,
        nearestPointMap,
        currentPointIndex: 0,
        selectedBridge: new Map(),
        currentPointStatus: Array(task.length).fill(0),
    });
    console.log('result', result, result && JSON.stringify([...result.selectedBridge.entries()]));
    return result ? generaterAnawer1(result) : '';
}
function generaterAnawer1(data: recu1Data): string {
    const { selectedBridge } = data;
    return [...selectedBridge.values()]
        .sort((a, b) => (
            a.p.index == b.p.index ? (
                a.q.index == b.q.index ? 0
                    : a.q.index < b.q.index ? -1 : 1
            ) : (a.p.index < b.p.index ? -1 : 1)
        ))
        .map(b => `${b.p.col},${b.p.row},${b.q.col},${b.q.row},${b.count}`)
        .join(';');
}
(() => {
    const timer = new Date;
    const answer1 = solution1();
    const timer2 = new Date;
    console.log('answer1', answer1);
    console.log('耗时', timer2.valueOf() - timer.valueOf(), 'ms');

    try {
        $('#puzzleForm').attr('onsubmit', `console.log('customer onsubmit');
        Game.saveState();
        Game.tickTimer();
        this.jstimerPersonal.value = Game.getTimer();
        this.ansH.value = '${answer1}';`);
        window.submit = () => (document.querySelector('#btnReady') as HTMLButtonElement | undefined)?.click();
    } catch (err) { };
})();






function initAllBridges(task: Point[]) {
    for (let point of task) {

    }
}

function solution2(): string {
    // const taskKey: string = Settings.get(Game.getSaveIdent());
    const taskKey: string = '3e2g2c5a4g3c6a4g3a2a4a4'; //test
    // const task: Point[] = Game.task;
    const task: Point[] = [
        { "index": 0, "number": "3", "row": 0, "col": 0 },
        { "index": 1, "number": "2", "row": 0, "col": 6 },
        { "index": 2, "number": "2", "row": 2, "col": 0 },
        { "index": 3, "number": "5", "row": 2, "col": 4 },
        { "index": 4, "number": "4", "row": 2, "col": 6 },
        { "index": 5, "number": "3", "row": 4, "col": 0 },
        { "index": 6, "number": "6", "row": 4, "col": 4 },
        { "index": 7, "number": "4", "row": 4, "col": 6 },
        { "index": 8, "number": "3", "row": 6, "col": 0 },
        { "index": 9, "number": "2", "row": 6, "col": 2 },
        { "index": 10, "number": "4", "row": 6, "col": 4 },
        { "index": 11, "number": "4", "row": 6, "col": 6 }
    ]; //test
    const posableBridges = initAllBridges(task);
    console.log('posableBridges', posableBridges);
    return 'todo';
}
(() => {
    const answer2 = solution2();
    console.log('answer2', answer2);
})//();