function secondToMs(multiplier) {
    return multiplier * 1000;
};

function netErrorCode(err) {
    return err < 200 || err > 299;
};

function __exponentialBackOff(tries, maxTries, errChecker, producer, callback) {
    errChecker = errChecker || netErrorCode;

    return function() {
        function trier() {
            producer(function(err, result) {
                if (!errChecker(err)) // Success here
                    return callback(err, result);

                ++tries;
                if (maxTries >= 1 && tries >= maxTries)
                    return callback(err, result);

                setTimeout(trier, secondToMs(1 << tries)); 
            });
        };

        trier();
    };
};

function uncapped(producer, callback) {
    return __exponentialBackOff(0, 0, null, producer, callback);
};

function capped(cap, producer, callback) {
    return __exponentialBackOff(0, cap|0, null, producer, callback);
};

function cappedCustom(cap, errChecker, producer, callback) {
    return __exponentialBackOff(0, cap|0, errChecker, producer, callback);
};

function uncappedCustom(errChecker, producer, callback) {
    return __exponentialBackOff(0, 0, errChecker, producer, callback);
};

exports.capped   = capped;
exports.uncapped = uncapped;
exports.cappedCustom = cappedCustom;
exports.uncappedCustom = uncappedCustom;
