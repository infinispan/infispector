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

describe("Get flowChart matrix", function() {
    var matrix;
    beforeEach(function(done) {
        var nodesTmp = nodes.slice();
        nodesTmp.splice(nodesTmp.indexOf("null"), 1);
        var arrayOfNodes = [];
        for (var index = 0; index < nodesTmp.length; index++) {
            arrayOfNodes[index] = [];
            arrayOfNodes[index][0] = {"nodeName": "\"" + nodesTmp[index] + "\""};
        }
        arrayOfNodes.push([]);
        arrayOfNodes[arrayOfNodes.length - 1][0] = {"nodeName": "\"null\""};
        request.post({
            url: base_url + "getFlowChartMatrix",
            form: {
                "nodes": arrayOfNodes,
                "searchMessageText": "StateResponseCommand"
            }
        }, function(err, resp, body) {
            matrix = JSON.parse(body);
            matrix = JSON.parse(matrix.matrix);
            done();
        });
    });

    it("Should receive matrix for flowChart", function(done) {
        expect(matrix.length).not.toBe(undefined);
        done();
    });

    it("Should check number of returned entries in matrix", function(done) {
        expect(matrix.length).toBe(Math.pow(nodes.length, 2));
        done();
    });

    it("Should check each entry if it match", function(done) {
        var match = true;
        loop1:
            for (var index1 = 0; index1 < nodes.length; index1++) {
                for (var index2 = 0; index2 < nodes.length; index2++) {
                    for (var index3 = 0; index3 < matrix.length; index3++) {
                        if ((matrix[index3][0] === nodes[index1]) && (matrix[index3][1] === nodes[index2])) {
                            break;
                        }
                        if (index3 === matrix.length - 1) {
                            match = false;
                            break loop1;
                        }
                    }
                }
            }
        expect(match).toBe(true);
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