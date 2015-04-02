
LzRestRequest = function(id, service, options, callback, tryLimit, waitTimeout) {
    this.id = id;

    this.tryCount = 0;
    this.tryLimit = tryLimit;
    this.waitTimeout = waitTimeout;
    this.timerHandler = null;
    this.timerCallback = null;

    this.service = service;
    this.options = options;
    this.callback = callback;

    this.onTry = function() {
        this.tryCount++;
    };

    this.canTry = function() {
        return ((this.timerHandler === null) && (this.tryCount < this.tryLimit));
    };

    this.canRemove = function() {
        return (this.tryCount >= this.tryLimit);
    };

    this.startTimer = function(timer_callback) {
        var that = this;

        this.timerCallback = timer_callback;
        this.timerHandler = setTimeout(function(){that.onTimeout();}, this.waitTimeout);
    };

    this.stopTimer = function() {
        if (this.timerHandler) {
            clearTimeout(this.timerHandler);
            this.timerHandler = null;
            this.timerCallback = null;
        }
    };

    this.onTimeout = function() {
        this.timerHandler = null;
        this.timerCallback();
        this.timerCallback = null;
    };
};

LzRest = function() {
    this.autoincrement = 0;
    this.requests = {};

    this.get = function(service, options, callback, tryCount, retryTimeout) {
        var requestId, requestObj;
        requestId = this.getNextId();

        requestObj = new LzRestRequest(requestId, service, options, callback, tryCount, retryTimeout);
        this.requests[requestId] = requestObj;
        this.tryRequest(requestId);
    };

    this.tryRequest = function(requestId) {
        var that, reqObj;

        if (!this.isRequestExist(requestId)) {
            return;
        }

        that = this;
        reqObj = this.requests[requestId];

        jQuery.get(
            reqObj.service,
            reqObj.options,
            function(result){that.onSuccess(requestId, result)},
            'html'
        ).fail(
            function(){that.onError(requestId);}
        );

        reqObj.onTry();
        this.scheduleRetry(requestId);
    };

    this.scheduleRetry = function(requestId) {
        var that, reqObj;

        if (!this.isRequestExist(requestId)) {
            return;
        }

        reqObj = this.requests[requestId];

        if (reqObj.canTry()) {
            that = this;
            reqObj.startTimer(function(){that.tryRequest(requestId);});
        }
        else if (reqObj.canRemove()) {
            this.removeRequest(requestId);
        }
    };

    this.onError = function(requestId) {
        if (!this.isRequestExist(requestId)) {
            return;
        }

        this.requests[requestId].stopTimer();
        this.scheduleRetry(requestId);
    };

    this.onSuccess = function(requestId, result) {
        var requestObject;

        if(!this.isRequestExist(requestId)) {
            return;
        }

        requestObject = this.requests[requestId];
        requestObject.stopTimer();

        if(typeof(result) === 'undefined' || !result) {
            this.scheduleRetry(requestId);
            return;
        }

        requestObject.callback(result);
        this.removeRequest(requestId);
    };

    this.removeRequest = function(requestId) {
        if(this.isRequestExist(requestId)) {
            this.requests[requestId] = null;
            delete this.requests[requestId];
        }
    };

    this.getNextId = function() {
        return ++this.autoincrement;
    };

    this.isRequestExist = function(requestId) {
        return (typeof(this.requests[requestId]) !== 'undefined' && this.requests[requestId]);
    };
};
