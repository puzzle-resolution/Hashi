(() => {
    const task = '3e2g2c5a4g3c6a4g3a2a4a4';
    const Config = {
        "paddingTop": 44,
        "paddingBottom": 44,
        "headerHeight": 44,
        "footerHeight": 44,
        "scenePaddingBottom": 60,
        "bannerHeight": 50,
        "sidebarWidth": 210,
        "crosshairWidth": 100,
        "panTimeThreshold": 300,
        "panPixelThreshold": 2,
        "loopLineWidth": 4,
        "nonogramsCellSize": 15,
        "shikakuSeparatorWidth": 1,
        "shikakuRectBorderWidth": 2,
        "shikakuClassicSeparatorWidth": 3,
        "shikakuClassicRectBorderWidth": 3,
        "bridgesSquare": 18,
        "bridgesSeparator": 0,
        "bridgesSize": 2,
        "mainContainerWidth": 750,
        "sideBannerWidth": 170,
        "topMenuHeight": 44
    };
    const t = jQuery;
    const config = {
        ident: 'hashi.0',
        task: task,
        token: 'KzlBYC0tS1o4Jm84TH48bklZJjJgbEspZD0tRl8zLm9Udyh3Kzw3On01PWdYekNvWCNZcnVEIHJ5JE53bFk6PThPPl45XnkpNTQ4YXh7OWE8dTkwJjAxT2tOfmF7ekZWKnB7b21tfipTZjVtM2UtMEZmVTB1YUN8JlFHaS5Ocl0obGoqeSxefSQ8M2RLMkxNVns7RiUscHpYW30lNmhiWk9PSGpsXjtyUkpXTGZMUDViT0NHKmRuYj1RRVd',
        puzzleID: '8,354,600',
        puzzleWidth: 7,
        puzzleHeight: 7,
        localTimer: new Date().getTime(),
        relativeTo: '#puzzleContainerOverflowDiv',
        noCheck: true,
        gutter: 0,
    };
    const settings = t.extend({
        gutter: 5,
        puzzleWidth: 15,
        puzzleHeight: 20,
        squareSize: Config.bridgesSquare,
        separatorWidth: Config.bridgesSeparator,
        task: "",
        solution: "",
        state: {},
        stateStack: [],
        checkState: 0,
        maxBridges: 2,
        panTimeThreshold: 1
    }, config);

    const rowFromIndex = function (t) {
        return Math.floor(t / settings.puzzleWidth);
    };
    const colFromIndex = function (t) {
        return t % settings.puzzleWidth;
    };
    const decodeChar = function (e) {
        return e.charCodeAt(0) - 96;
    };

    const parse = (s_task) => {
        const loaded = !0, task = [];
        for (var e = 0, i = 0; i < s_task.length; i++) t.isNumeric(s_task[i]) ? (task.push({
            index: task.length,
            number: s_task[i],
            row: rowFromIndex(e),
            col: colFromIndex(e)
        }), e++) : e += decodeChar(s_task[i]);
        console.log('parse task result', task, JSON.stringify(task));
    };
    // parse(task);


    const solve = (task) => {
        
    }
    solve(parse(task));
})();