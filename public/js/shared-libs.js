// Shared libs



/*
//Nice way to add a listner on a button, without having to chase the onclick...
							   
	$(document).ready(function() {

	  $("#button").click(function(){
		 $(".target").effect( "highlight", 
		  {color:"#669966"}, 3000 );
	  });

   });
  */


function sendAPI() {

    document.getElementById("sendAPILabel").innerHTML = "Sending...";

    // var server = "https://icanhazdadjoke.com";
    var server = API_GW_HOST;
    var apipUri = API_GW_BASED_URI + "share";

    var mobile = document.getElementById("signUpForm").mobile.value;

    console.log("Within sendAPI, mobile is [" + mobile + "]");

    if (mobile == null || mobile == undefined) {

        console.assert.log("Critical error. Mobile is null - cannot proceed.");
        return;
    }

    var fullUri = server + apipUri;
    fullUri += "?mobile=" + mobile;


    console.log("Within sendAPI uri is [" + fullUri + "]");

    // Initiating XMLHttpRequest Object:
    var http_request = initiateXMLHttpObject();

    http_request.onreadystatechange = function () {

        if (http_request.readyState == 4) {

            console.log("http_request.responseText is [" + http_request.responseText + "]");

            document.getElementById("sendAPILabel").innerHTML = "Sent!";

        }
    }

    sendRequest(http_request, "POST", fullUri, true);
}

function sendRequest(http_request, verb, uri, async) {

    //alert("Debugging on: Sending [" + uri + "] under verb [" + verb + "]");

    http_request.open(verb, uri, async);
    http_request.setRequestHeader("Accept", "application/json");
    http_request.send();

    //alert("Your message was sent successfully.");
}

function initiateXMLHttpObject() {

    // Initiating XMLHttpRequest Object:
    var http_request = new XMLHttpRequest();

    try {
        // Opera 8.0+, Firefox, Chrome, Safari
        http_request = new XMLHttpRequest();
    } catch (e) {
        // Internet Explorer Browsers
        try {
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                // Something went wrong
                alert("Your browser broke!");
                return false;
            }
        }
    }

    return http_request;
}

function getAPISynch(repid) {

    /**
     *	This operation is Synchronous and as such, it should not be abused.
     **/

    var uri = "http://" + globalIPAddress + ":7001/SCRequestAPIProject/request/id/" + reqid; // OSB REST Adapter

    var xmlHttp = null;

    xmlHttp = initiateXMLHttpObject();
    xmlHttp.open("GET", uri, false);
    xmlHttp.setRequestHeader("Accept", "application/json");
    xmlHttp.send(null);
    //alert("response is [" + xmlHttp.responseText + "]");

    // Javascript function JSON.parse to parse JSON data
    var jsonObj = JSON.parse(xmlHttp.responseText);
    var customername = jsonObj.Requests[0].customername;

    //alert("customername is [" + customername + "]");
    return customername;
}

var API_GW_HOST = "";
var API_GW_BASED_URI = "";

window.onload = function () {



    console.log("Adding event on myIframe");

    //@TODO: Figure out how to make it work locally and when in OKE behind an Ingress...
    // document.getElementById('myIframe').src = "/" + getAPISpec();    
    // document.getElementById('myIframe').src = window.location.protocol + "//" + window.location.hostname + ":3000" + "/" + getAPISpec();
    // document.getElementById('myIframe').src = window.location.protocol + "//" + window.location.hostname + "/apisconsiderations/" + getAPISpec();

    API_GW_HOST = "https://api.opcau.com";
    API_GW_BASED_URI = "/apisconsiderations/";


    // document.getElementById('myIframe').src = API_GW_HOST + API_GW_BASED_URI + getAPISpec();\
    var fullURLToLoad = API_GW_HOST + API_GW_BASED_URI + getAPISpec();

    console.log("FUll URL to load is [" + fullURLToLoad + "]");

    document.getElementById('myIframe').src = fullURLToLoad
}

window.spec = "";

function getAPISpec() {

    console.log("Current value of window.spec is [" + window.spec + "]");

    if (window.spec != undefined && window.spec != null && window.spec != "") {
        return window.spec;
    }

    var hash = [];
    var uri = "";
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {

        hash = hashes[i].split('=');

        switch (hash[0]) {

            case "spec":

                uri = "?spec=" + hash[1];

                continue;

            case "s":

                uri += "&s=" + hash[1];

                continue;

            case "ro":

                uri += "&ro=" + hash[1];

                continue;

            case "bu":

                uri += "&bu=" + hash[1];

                continue;


        }
    }

    console.log("URI found is [" + uri + "]");

    //Setting global variable:
    window.spec = uri;
    return window.spec;
}

function setSecurity() {

    var s = document.getElementById('s').checked;
    console.log("Security switch changed to [" + s + "]");

    var uri = getAPISpec();


    switch (s) {

        case true:

            uri = uri.replace(/s=.+?(?=&)/gi, 's=on');
            window.spec = uri;
            break;

        case false:

            uri = uri.replace(/s=.+?(?=&)/gi, 's=off');
            window.spec = uri;
            break;
    }


    console.log("URI to call is [" + uri + "]");


    var fullURLToLoad = API_GW_HOST + API_GW_BASED_URI + uri;

    console.log("In Security, full URL to load is [" + fullURLToLoad + "]");


    //document.getElementById('myIframe').src = "/" + uri;    
    document.getElementById('myIframe').src = fullURLToLoad;



}

function setReadOnly() {

    var ro = document.getElementById('ro').checked;
    console.log("Read Only switch changed to [" + ro + "]");

    var uri = getAPISpec();


    switch (ro) {

        case true:

            uri = uri.replace(/ro=.+?(?=&)/gi, 'ro=on');
            window.spec = uri;
            break;

        case false:

            uri = uri.replace(/ro=.+?(?=&)/gi, 'ro=off');
            window.spec = uri;
            break;
    }


    console.log("URI to call is [" + uri + "]");


    var fullURLToLoad = API_GW_HOST + API_GW_BASED_URI + uri;

    console.log("In Read Only, full URL to load is [" + fullURLToLoad + "]");



    // document.getElementById('myIframe').src = "/" + uri;
    document.getElementById('myIframe').src =fullURLToLoad;

}