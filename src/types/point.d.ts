type PointCountStr = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
type PointCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
interface Point {
    index: number;
    number: PointCountStr;
    row: number;
    col: number;
}