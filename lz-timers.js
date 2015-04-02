
LzTimerOptions = function(timeout, cycled, callback) {
    this.handle = null;
    this.timeout = timeout;
    this.cycled = cycled;
    this.callback = callback;
};

LzTimers = function() {
    this.timers = {};

    this.addNewTimer = function(name, options) {
        if (!(options instanceof LzTimerOptions)) {
            throw Error('invalid timer config for LzTimers');
        }

        this.timers[name] = options;
    };

    this.startTimer = function(name) {
        if (typeof(this.timers[name]) === 'undefined') {
            return;
        }

        this.stopTimer(name);

        if (this.timers[name].cycled) {
            this.timers[name].handle = setInterval(this.timers[name].callback, this.timers[name].timeout);
        }
        else {
            this.timers[name].handle = setTimeout(this.timers[name].callback, this.timers[name].timeout);
        }
    };

    this.stopTimer = function(name) {
        if (typeof(this.timers[name]) === 'undefined') {
            return;
        }

        if (this.timers[name].handle) {
            if (this.timers[name].cycled) {
                clearInterval(this.timers[name].handle);
            }
            else {
                clearTimeout(this.timers[name].handle);
            }

            this.timers[name].handle = null;
        }
    };
};
