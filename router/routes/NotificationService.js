var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');
var httpSignature = require('http-signature');

var ociConfig = require("../../config");
var ociUtils = require('./ociUtils');
var funct = require('./functions');

//CRI change:
var bodyParser = require('body-parser');

// Configure application routes
module.exports = function (app) {

    // CRI change to allow JSON parsing from requests:    
    app.use(bodyParser.json()); // Support for json encoded bodies 
    app.use(bodyParser.urlencoded({
        extended: true
    })); // Support for encoded bodies

    function log(apiMethod, apiUri, msg) {
        console.log("[" + apiMethod + "], [" + apiUri + "], [" + msg + "], [UTC:" +
            new Date().toISOString().replace(/\..+/, '') + "]");
    }

    /**
     * Adding APIs:
     * 
     */

    /* POST /services/{service}/nitifications - Where {services} is of type adw */
    app.post('/share', function (req, res) {

        // Retrieving parameters:
        var recipientMobile = req.query.mobile;
        var message = "a friend wants to share this website with you: https://goautonomous.cloud";

        if (recipientName == null || recipientName == undefined) {
            log("POST", "/services/:service/notification", "recipientName is empty or invalid.");
            res.status(400).end(); //Bad request...
            return;
        }
        if (recipientMobile == null || recipientMobile == undefined) {
            log("POST", "/services/:service/notification", "recipientMobile is empty or invalid.");
            res.status(400).end(); //Bad request...
            return;
        }
        if (message == null || message == undefined) {
            log("POST", "/services/:service/notification", "message is empty or invalid.");
            res.status(400).end(); //Bad request...
            return;
        }


        log("POST", "/share", "Sharing message with [" + recipientName + ", " + recipientMobile + "]");

        var fullMessage = "Hi, " + message;

        //send SMS message for current recipient:
        funct.sendNotification(fullMessage, null, recipientMobile, "sms", function (msg) {

            log("POST", "/share", "Notification sent successfully!");

        });

        // Returning result
        res.send({
            "id": "202",
            "status": "accepted",
            "message": "Request accepted... Work in progress."
        });

    });

};