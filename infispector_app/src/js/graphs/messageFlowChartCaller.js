/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function getNodes1() {
    return ['node1', 'node2', 'node3', 'node4'];
}

function getNumberOfMessages1(nodeFrom, nodeTo, from, to) {
    var messages = [[15, 6, 0, 3],
                    [8, 7, 9, 1],
                    [3, 81, 6, 5],
                    [40, 2, 0, 0]];
    return messages[from][to];
}

function getMatrix1(nodes) {
    var nodesMessages = [];
    var nodesLength = nodes.length;
    for (var index = 0; index <  nodesLength; index++) {
        for (var index2 = 0; index2 < nodesLength; index2++) {
            nodesMessages[index * nodesLength + index2] = [nodes[index], nodes[index2], getNumberOfMessages1(nodes[index], nodes[index2], index, index2)];
        }
    }
    return nodesMessages;
}

var nodes2 = getNodes1();

/*var nodes_messages = [
['node1', 'node1', 8],
['node1', 'node2', 7],
['node1', 'node3', 9],
['node1', 'node4', 1],
['node2', 'node1', 3],
['node2', 'node2', 81],
['node2', 'node3', 6],
['node2', 'node4', 5],

];*/

var nodesMessages = getMatrix1(nodes2);

var width = 1100, height = 610, margin ={b:0, t:40, l:170, r:50};

var svg = d3.select("body")
        .append("svg").attr('width',width).attr('height',(height+margin.b+margin.t))
        .append("g").attr("transform","translate("+ margin.l+","+margin.t+")");

var data = [ 
        {data:bP.partData(nodesMessages,2), id:'Comunication', header:["From","To", "Nodes"]}
];

bP.draw(data, svg);
