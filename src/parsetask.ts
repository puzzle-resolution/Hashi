// import $ from 'jquery';

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
    for (var e = 0, i = 0; i < key.length; i++)
        '0' <= key[i] && key[i] <= '9'/*$.isNumeric(key[i])*/
            ?
            (task.push({
                index: task.length,
                number: key[i],
                row: rowFromIndex(e),
                col: colFromIndex(e)
            }), e++)
            : e += decodeChar(key[i]);
    // console.log('parse task result', task, JSON.stringify(task));
    return task;
}
export default parseTask;