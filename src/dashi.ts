import parseTask from './parsetask';
import { replaceAnswer, submitAnswer } from './submit';
import { intersection } from './utils/algorithm';

const mockTask = false; //mock调试模式
const mockData = {
    taskKey: "f21b2a1h3b3b5h1d33d2a",
};

export default class Dashi {
    puzzleWidth: number;
    points: Point[];
    nearestPointMap: { [x: string]: Partial<{ bottom: number; right: number; }> };
    answer?: string;
    constructor(points: Point[], puzzleWidth: number) {
        this.points = points;
        this.puzzleWidth = puzzleWidth;
        this.nearestPointMap = this.initNearestPoints(this.points);
    }

    initNearestPoints(task: Point[]) {
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

    checkBridge(array: { p: Point, q: Point }[]) { //严重错误，抛出异常中断
        for (const { p, q } of array) {
            if (p.row == q.row && p.col == q.col) { throw new Error(`error while checkBridge: p、q 是同一点. ${JSON.stringify(array)}. 异常点对: ${JSON.stringify([p, q])}`) }
            if (p.row != q.row && p.col != q.col) { throw new Error(`error while checkBridge: p、q 不在同一水平或竖直方向. ${JSON.stringify(array)}. 异常点对: ${JSON.stringify([p, q])}`) }
            if ((p.row == q.row && p.col > q.col) || (p.col == q.col && p.row > q.row)) { throw new Error(`error while checkBridge: p、q 顺序错位. ${JSON.stringify(array)}. 异常点对: ${JSON.stringify([p, q])}`) }
        }
    }
    newBridge(p1: Point, p2: Point, count: number): Bridge {
        this.checkBridge([{ p: p1, q: p2 }]);
        let [p, q] = p1.row < p2.row ? [p1, p2] : p1.row > p2.row ? [p2, p1] : p1.col < p2.col ? [p1, p2] : [p2, p1];
        return { p: { ...p }, q: { ...q }, count };
    }
    bridgeIsAvaliable(bridge: Bridge, selectedBridge: State["selectedBridge"]): boolean { //判断已选边是否与指定边冲突（交叉）
        // checkBridge([bridge, ...data.selectedBridge.values()]);
        this.checkBridge([bridge]);
        for (let b of selectedBridge.values()) {
            if (intersection(bridge, b)) { return false }
        }
        return true;
    }

    getAvaliableBridge(data: State) { //获取当前的可用边
        // console.log('getAvaliableBridge', data.currentPointIndex, { ...data });
        const { points, nearestPointMap } = this;
        const { currentPointIndex, selectedBridge, currentPointStatus } = data;
        const p = points[currentPointIndex];
        const p_status = currentPointStatus[currentPointIndex];
        let res: [Bridge | undefined, Bridge | undefined] = [undefined, undefined];
        const { bottom, right } = nearestPointMap[p.index];
        if (bottom && p_status < +p.number) {
            const b_p = points[bottom];
            const b_p_status = currentPointStatus[bottom];
            if (b_p_status < +b_p.number) {
                const bridge = this.newBridge(p, b_p, Math.min(2, +p.number - p_status, +b_p.number - b_p_status));
                this.bridgeIsAvaliable(bridge, selectedBridge) && (res[0] = bridge)
            }
        }
        if (right && p_status < +p.number) {
            const r_p = points[right];
            const r_p_status = currentPointStatus[right];
            if (r_p_status < +r_p.number) {
                const bridge = this.newBridge(p, r_p, Math.min(2, +p.number - p_status, +r_p.number - r_p_status));
                this.bridgeIsAvaliable(bridge, selectedBridge) && (res[1] = bridge)
            }
        }
        return res;
    }
    getBridgeCases(avaliableBridges: ReturnType<typeof Dashi.prototype.getAvaliableBridge>, restCount: PointCount): [Bridge | undefined, Bridge | undefined][] { //基于(可用边,节点剩余count)，生成当前节点的边方案
        const cases = {         //只考虑bottom和right的位置
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
                    ? [undefined, right && this.newBridge(right.p, right.q, 1)]
                    : [undefined, undefined],
                [2]: right && right.count >= 2
                    ? [undefined, right && this.newBridge(right.p, right.q, 2)]
                    : [undefined, undefined],
                [3]: bottom && bottom.count >= 1
                    ? [bottom && this.newBridge(bottom.p, bottom.q, 1), undefined]
                    : [undefined, undefined],
                [4]: bottom && bottom.count >= 1 && right && right.count >= 1
                    ? [bottom && this.newBridge(bottom.p, bottom.q, 1), right && this.newBridge(right.p, right.q, 1)]
                    : [undefined, undefined],
                [5]: bottom && bottom.count >= 1 && right && right.count >= 2
                    ? [bottom && this.newBridge(bottom.p, bottom.q, 1), right && this.newBridge(right.p, right.q, 2)]
                    : [undefined, undefined],
                [6]: bottom && bottom.count >= 2
                    ? [bottom && this.newBridge(bottom.p, bottom.q, 2), undefined]
                    : [undefined, undefined],
                [7]: bottom && bottom.count >= 2 && right && right.count >= 1
                    ? [bottom && this.newBridge(bottom.p, bottom.q, 2), right && this.newBridge(right.p, right.q, 1)]
                    : [undefined, undefined],
                [8]: bottom && bottom.count >= 2 && right && right.count >= 2
                    ? [bottom && this.newBridge(bottom.p, bottom.q, 2), right && this.newBridge(right.p, right.q, 2)]
                    : [undefined, undefined],
            } as { [key in 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8]: [Bridge | undefined, Bridge | undefined] })[c]
        )).filter(c => !(c[0] === undefined && c[1] === undefined));
    }
    verificate(data: State): boolean {
        // console.warn('verificate1', { ...data });
        const { points } = this;
        const { currentPointStatus, selectedBridge } = data;
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

    recu(data: State): State | false { //递归所有节点
        // console.warn('recu1', data.currentPointIndex, { ...data });
        const { points, nearestPointMap } = this;
        const { currentPointIndex, selectedBridge, currentPointStatus } = data;
        if (currentPointIndex == points.length) { //递归边界
            // console.log('到达递归边界');
            if (this.verificate(data)) return data;
            else return false;
        }

        const point = points[currentPointIndex];
        const avaliableBridges = this.getAvaliableBridge(data);
        // console.log('avaliableBridges', avaliableBridges);
        if (avaliableBridges[0] === undefined && avaliableBridges[1] === undefined) {
            if (+point.number == currentPointStatus[currentPointIndex]) {
                return this.recu({ currentPointIndex: currentPointIndex + 1, selectedBridge: new Map(selectedBridge), currentPointStatus: [...currentPointStatus] });
            } else { return false } //若无可用边，但节点count未完成，则返回失败
        } else {
            const p_status = currentPointStatus[currentPointIndex];
            const p_rest_count = +point.number - p_status as PointCount;
            const cases = this.getBridgeCases(avaliableBridges, p_rest_count);
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
                const res = this.recu({ currentPointIndex: currentPointIndex + 1, selectedBridge: nextSelectedBridge, currentPointStatus: nextCurrentPointStatus });
                if (res) { return res; }
            }
            return false;
        }
    }

    solve(): string {
        const result = this.recu({
            currentPointIndex: 0,
            selectedBridge: new Map(),
            currentPointStatus: Array(this.points.length).fill(0),
        });
        // console.log('result', result, result && JSON.stringify([...result.selectedBridge.entries()]));
        return (this.answer = (result ? this.generaterAnawer(result.selectedBridge) : ''));
    }
    generaterAnawer(selectedBridge: State["selectedBridge"]): string {
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
}


(() => {
    const puzzleWidth = ({
        0: 7, 1: 7, 2: 7,
        3: 10, 4: 10, 5: 10,
        6: 15, 7: 15, 8: 15,
        9: 25, 10: 25, 11: 25,
        13: 30, 12: 30, 14: 40,
    } as { [key in number]: number })[+Object.fromEntries([...new URL(location.href).searchParams]).size || 0];
    const taskKey: string = mockTask ? mockData.taskKey : task; //test
    const tasks: Point[] = (mockTask ? parseTask(taskKey, puzzleWidth) as Point[] : Game.task);
    console.log('task', taskKey, tasks);

    const dashi = new Dashi(tasks, puzzleWidth);

    const timer1 = new Date;
    const answer = dashi.solve();
    const timer2 = new Date;
    console.log('answer', answer);
    console.log('耗时', timer2.valueOf() - timer1.valueOf(), 'ms');

    replaceAnswer(answer);
    window.submit = submitAnswer;
})();


declare global {
    interface Window {
        submit: any;
    }
}