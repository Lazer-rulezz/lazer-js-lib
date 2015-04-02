
log = {
    logger: function(message) {
        if (typeof(console) !== 'undefined' && console && typeof(console.log) !== 'undefined') {
            console.log(message);
        }
    },

    registerLogger: function(logger) {
        this.logger = logger;
    },

    error: function(message) {
        this.logger('! ' + message);
    },

    info: function(message) {
        this.logger(message);
    }
};
