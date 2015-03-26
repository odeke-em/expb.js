### expb.js [![NPM](https://nodei.co/npm/expb.js.png)](https://npmjs.org/package/expb.js)

Exponential backoff with time outs in 2^n ms durations.


# Usage:

+ After importing the package, you can use these different types of functions:

## Capped
```
function capped(maxTries, producer, callback);
Here the default error checker is by checking if the statusCode is in the OK range ie >= 200 && <= 299
```

```
function cappedCustom(maxTries, errChecker, producer, callback);
Just like the capped version but you can provide a custom errChecker
```

```
function cappedNet(maxTries, producer, callback);
Here the default error checker is by checking if the statusCode is in the OK range ie >= 200 && <= 299
```

```
function cappedDefault(maxTries, producer, callback);
Here the default error checker is by checking if the err is null
```

## Uncapped

```
function uncapped(producer, callback);
Here the default max value for tries is Math.log2(MAX_INT) and the default error checker is a netChecker
```

```
function uncappedCustom(errChecker, producer, callback);
Just like the uncapped version but here you can provide a custom errChecker
```

```
function uncappedNet(producer, callback);
Here the default error checker is by checking if the statusCode is in the OK range ie >= 200 && <= 299
```

```
function uncappedDefault(maxTries, producer, callback);
Here the default error checker is by checking if the err is null
```

# Sample usage:

```javascript
const expb    = require('expb.js');
const request = require('request');

function statusCode(err, result) {
    if (err)
        return 500;
    if (!result)
        return 404;
    return 200;
};

function queryGithub(callback) {
    request.get('https://github.com/search?q=exponential', function(err, response, result) {
        var status = statusCode(err, result);
        callback(status, { response: response, result: result });
    });
};

function tryGithub() {
    var func = expb.capped(10, queryGithub, function(status, result) {
        console.log(status, result);
        process.exit(0);
    });

    func();
};

tryGithub();
```
