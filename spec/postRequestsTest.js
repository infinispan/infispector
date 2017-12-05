var request = require("request");

var base_url = "http://localhost:8080/";

var nodes;

describe("Get nodes", function() {
    beforeEach(function(done) {
        request.post(base_url + "getNodes", null, function(err, resp, body) {
            body = JSON.parse(body);
            nodes = body.jsonResponseAsString.replace("[", "").replace("]","").replace(new RegExp("\"","g"), "").split(",");
            if (nodes[0] === "null") {
                var tmp = nodes[0];
                nodes[0] = nodes[nodes.length - 1];
                nodes[nodes.length - 1] = tmp;
            }
            done();
        });
    });

    it("Should receive 5 nodes", function(done) {
        expect(nodes.length).not.toBeLessThan(2);
        done();
    });
});

describe("Get info about messages", function() {
    var message;
    beforeEach(function(done) {
        request.post({
                url: base_url + "getMessagesInfo",
                form: {"nodeName" : nodes[0], "filter" : "StateResponseCommand"}
            },
            function(err, resp, body) {
                body = JSON.parse(body);
                message = JSON.parse(body.jsonResponseAsString);
                message = message[0].result[0];
                message = JSON.stringify(message);
                done();
        });
    });

    it("Should receive message info", function(done) {
        expect(message).toContain("length");
        expect(message).toContain("message");
        done();
    });
});

describe("Get message count", function() {
    var numberOfMessages;
    beforeEach(function(done) {
       var fromTime = new Date();
       fromTime.setHours(fromTime.getHours() - 1);
       var toTime = new Date();
       request.post({
           url: base_url + "getMsgCnt",
           form: {
               "fromTime": fromTime.toISOString(),
               "toTime": toTime.toISOString()
           }
       }, function(err, resp, body) {
           numberOfMessages = JSON.parse(body).jsonResponseAsString;
           done();
       });
    });

    it("better work", function(done) {
        expect(numberOfMessages).toBeGreaterThan(0);
        done();
    })
});