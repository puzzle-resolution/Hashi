//@ts-nocheck

'0,0,2,0,1'
'2,0,6,0,1'
'0,0,2,0,1;0,0,0,2,1'


const answer = `<rule>;<rule>`
const rule = `${col_1},${row_1},${col_2},${row_2},${count}`
//
//count 为 某桥的 线段数 范围 
type count = 1 | 2;
