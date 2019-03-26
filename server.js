var path = require('path');
var http = require('http');
var express = require('express');
var yaml = require('js-yaml');
var fs = require('fs');
var config = require('./config');
var request = require('request');

// Create an Express web app
var app = express();


// Converting YAML into JSON for Swagger UI loading purposes:
// var inputfile = 'apis4cloudplatformharness_swaggerdef.yml',
//     outputfile = 'apis4cloudplatformharness_swaggerdef.json';
//
// swaggerFileDef = yaml.load(fs.readFileSync(inputfile, {
//     encoding: 'utf-8'
// }));

var inputfile = "";
var swaggerFileDef = "";


// Storing YAML -> JSON Format for visibility purposes:
//fs.writeFileSync(outputfile, JSON.stringify(swaggerFileDef, null, 2));


/**
 * This project is a bit different as we need to load other Swagger specs. COmmenting this functionality that
 * is otherwise required in most microservices running behind an OKE Ingress service.
 */

// // Reading from local config variables and determining if SwaggerUI should be run within a Gateway, e.g. Traefix/Nginx/Amabassador/Other
// var data = 'localConfig = {"API_GW_ENABLED": "' + config.API_GW_ENABLED + '", "API_GW_BASEURL": "' + config.API_GW_BASEURL + '"};';

// console.log("data is [" + data + "]");

// fs.writeFile('./swagger-dist/tempConfig.js', data, function (err, data) {
//     if (err) console.log(err);
//     console.log("Successfully written to file [swagger-dist/tempConfig.js]");
// });






// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-App-Key, regodate, id');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Setting No-cache to avoid the browser to cache it locally.
    res.setHeader('Cache-Control', "no-cache");

    // Pass to next layer of middleware
    next();
});

function log(apiMethod, apiUri, msg) {
    console.log("[" + apiMethod + "], [" + apiUri + "], [" + msg + "], [UTC:" +
        new Date().toISOString().replace(/\..+/, '') + "]");
}

//Include the html assets
app.get('/spec', function (req, res) {

    var spec = req.query.spec;
    var securityFlag = req.query.s;
    var readOnlyFlag = req.query.ro;
    var baseURL = req.query.bu;

    if (spec == null || spec == undefined || securityFlag == null || securityFlag == undefined ||
        readOnlyFlag == null || readOnlyFlag == undefined ||
        baseURL == null || baseURL == undefined) {
        log("GET", "/spec", "Query parameters empty or invalid. Verify parameters and try again.");
        res.status(400).end("Query parameters empty or invalid. Verify parameters and try again."); //Bad request...
        return;
    }

    var API_GW_SERVER = config.API_GW_SERVER;



    // Getting the specification:
    //var urlSwaggerDef = "https://lb.oracleau.cloud/apis4harness/anki-saasdemo-ext-apis/v1";
    //var urlSwaggerDef = "https://lb.oracleau.cloud/apis4powermeter/swaggerui/v1";

    //@TODO:
    // Let's default to HTTPS... We might need to do this smartly
    var urlSwaggerDef = "https://" + API_GW_SERVER + spec;

    request.get(urlSwaggerDef, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Saving target Swagger Definition...
            inputfile = body;

            swaggerFileDef = yaml.load(inputfile);


            // Issuing dynamic updates:
            var isAPIGWSecured = false;
            var uri = "";

            /**
             * 1. Updating the Host location
             */
            if (config.API_GW_ENABLED != null &&
                config.API_GW_ENABLED != undefined &&
                config.API_GW_ENABLED == "true") {

                console.log("API_GW_ENABLED");

                swaggerFileDef.host = config.API_GW_SERVER;
                //swaggerFileDef.host += config.API_GW_BASEURL == "NA" ? "" : config.API_GW_BASEURL;
                uri = baseURL;

                // API GAteway is enabled, thus we default to HTTPS as first option:
                isAPIGWSecured = true;

            } else {

                // Updating the Host file dynamically
                swaggerFileDef.host = "" + req.headers.host;
            }

            // Overriding URL based on API query parameters:

            if (readOnlyFlag == "on") {

                uri = "/ro" + uri;
            }

            if (securityFlag == "on") {

                uri = "/s" + uri;
            }



            swaggerFileDef.host += uri;

            /**
             * 2. Updating the default Scheme to use (i.e. HTTP or HTTPS)
             */
            if (isAPIGWSecured) {

                console.log("Default HTTPS over HTTP");

                // Swap and default HTTPS as first option:
                swaggerFileDef.schemes = ['https', 'http'];
            }

            // Returning swagger definition:
            res.send(swaggerFileDef);

        } else {
            res.status(500).end("Error while retrieving API Specification. Verify logs and try again."); //Bad request...
            return;
        }
    });
});

app.use('/', express.static(path.join(__dirname, 'swagger-dist')));
app.use('/ws', express.static(path.join(__dirname, 'public')));


// Configure routes and middleware for the application
require('./router')(app);

// Create an HTTP server to run our application
var server = http.createServer(app);

// export the HTTP server as the public module interface
module.exports = server;