### expb.js

Exponential backoff with time outs in 2^n durations.

#Sample usage:

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
