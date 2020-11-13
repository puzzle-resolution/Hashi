//向量ab和ac叉乘
export function cross(a: Point, b: Point, c: Point) {
    return (b.row - a.row) * (c.col - a.col) - (b.col - a.col) * (c.row - a.row);
}

//计算几何，判断两线段是否相交（T型此处认为不相交）
export function intersection(l1: Bridge, l2: Bridge): boolean {
    const a = l1.p, b = l1.q, c = l2.p, d = l2.q;
    //快速排斥
    if (Math.min(a.row, b.row) > Math.max(c.row, d.row)
        || Math.min(a.col, b.col) > Math.max(c.col, d.col)
        || Math.min(c.row, d.row) > Math.max(a.row, b.row)
        || Math.min(c.col, d.col) > Math.max(a.col, b.col)) { return false }
    //跨立实验
    const h = cross(a, b, c);
    const i = cross(a, b, d);
    const j = cross(d, c, a);
    const k = cross(d, c, b);
    return h * i < 0 && j * k < 0;
}

//并查集
export class UnionFind {

}