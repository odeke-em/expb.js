const MaxLog2 = Math.log2(Number.MAX_VALUE) - 1;

function netErrorChecker(err) {
    return err < 200 || err > 299;
}

function error(err) {
    return !!err;
}

function randomMs() {
    return (Math.random() * 1000);
}

function __exponentialBackOff(tries, maxTries, errChecker, producer, callback) {
    if (!errChecker)
        errChecker = netErrorChecker;

    var limitedTries = maxTries >= 1;
    return function() {
        function trier() {
            producer(function(err, result) {
                if (!errChecker(err)) // Success here
                    return callback(err, result);

                if (limitedTries) {
                    if (tries >= maxTries || tries >= MaxLog2)
                        return callback(err, result);
                }

                tries += 1;

                var timeout = Math.pow(2, tries) * 100;
                if (timeout >= Number.MAX_VALUE)
                    return callback(err, result);

                timeout += randomMs();

                setTimeout(trier, timeout);
            });
        }

        trier();
    }
}

function uncapped(producer, callback) {
    return __exponentialBackOff(0, 0, null, producer, callback);
}

function capped(cap, producer, callback) {
    return __exponentialBackOff(0, cap|0, null, producer, callback);
}

function cappedCustom(cap, errChecker, producer, callback) {
    return __exponentialBackOff(0, cap|0, errChecker, producer, callback);
}

function uncappedCustom(errChecker, producer, callback) {
    return __exponentialBackOff(0, 0, errChecker, producer, callback);
}

function __suffixExporter(suffix, defaultErrHandler) {
    var uncapped = function(producer, callback) {
        return __exponentialBackOff(0, 0, defaultErrHandler, producer, callback);
    };

    var capped = function (cap, producer, callback) {
        return __exponentialBackOff(0, cap|0, defaultErrHandler, producer, callback);
    };

    var exports = {};
    exports['capped'+suffix] = capped;
    exports['uncapped'+suffix] = uncapped;

    return exports;
}

function __shallowCopy(from, to) {
    for (var key in from) {
        to[key] = from[key];
    }

    return to;
}

var defaultExports = __suffixExporter('Default', error);
var netExports     = __suffixExporter('Net', netErrorChecker);

__shallowCopy(netExports, exports);
__shallowCopy(defaultExports, exports);

exports.capped          = capped;
exports.uncapped        = uncapped;
exports.cappedCustom    = cappedCustom;
exports.uncappedCustom  = uncappedCustom;
