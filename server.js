var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    url = require('url'),
    app = express();

var myLimit = typeof (process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.all('*', function (req, res, next) {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        var targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.send(500, { error: 'There is no Target-URL header in the request' });
            return;
        }
        request({
            url: targetURL,
            method: req.method,
            json: req.body,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                'Host': url.parse(targetURL).hostname
            }
        }, function (error, response, body) {
            if (error) {
                console.error('error: ' + response.statusCode)
            }
            // console.log(body);
            // console.log(response);
        }).pipe(res);
    }
});

app.set('port', process.env.PORT || 3030);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});