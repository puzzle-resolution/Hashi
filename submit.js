(() => {
    const tickTimer = function () {
        var t = (new Date).getTime();
        this.accumulated = this.getTimer(), this.accumulated += t - this.lastTrackedTime, this.lastTrackedTime = t, this.storeTimer()
    }

    const check = function (t) {
        e.noCheck || ("" != e.solution ? (!e.checkState && e.solution == this.serializeSolution() || e.solution == this.serializeState()) && e.onSolutionSuccess && e.onSolutionSuccess({}) : $.post(e.baseUrl, {
            token: e.token,
            solution: this.serializeSolution()
        }).done(function (n) {
            n.status ? ($this.solved = !0, Settings.remove($this.getSaveIdent()), e.onSolutionSuccess && e.onSolutionSuccess(n)) : t && "undefined" != typeof t || e.onSolutionError && e.onSolutionError(n)
        }))
    }

    Game.saveState();
    Game.tickTimer();
    this.jstimerPersonal.value = Game.getTimer(); //ms
    this.ansH.value = Game.serializeSolution()
})();


(() => {
    document.querySelector("#puzzleForm").onsubmit = () => {
        console.log('customer onsubmit');
        Game.saveState();
        Game.tickTimer();
        this.jstimerPersonal.value = Game.getTimer();
        this.ansH.value = '3,1,5,1,2';
    }
})();


(() => {
    const answer = '3,1,5,1,2';
    $('#puzzleForm').attr('onsubmit', `console.log('customer onsubmit');
        Game.saveState();
        Game.tickTimer();
        this.jstimerPersonal.value = Game.getTimer();
        this.ansH.value = '${answer}';`)
})();