'use strict';

jQuery(
    function() {

    }
);
var width = 1170,
    height = 1600,
    padding = 12;

var colors = [
    '#999',
    '#2ca02c'
];

var weightColors = [
    '#4ca9b8',
    '#4cb8b0',
    '#4c67b8',
    '#b388e0'
];

var gravityPoints = [
    {
        id: 1,
        y: 350,
        x: 585
    },
    {
        id: 2,
        y: 380,
        x: 220
    },
    {
        id: 2,
        y: 620,
        x: 220
    }
];

var mainNodes = getNodes(1000, 160);
var throttle = 0;
var throttleMax = 5;
var circles = runSimulation('#chart1', mainNodes);

var activeNodes = [];
var circleQueue = [];

function activateCircle(node) {
    var lowestScope = null;
    var lowestItem = null;
    var furthestScope;
    var furthestItem;

    circles.each(
        function(d) {
            if (d.state === 1) {
                if (!lowestItem) {
                    lowestScope = this;
                    lowestItem = d;
                }
                else {
                    if (d.py > lowestItem.py) {
                        lowestScope = this;
                        lowestItem = d;
                    }
                }
            }
            else if (d.state === 2) {
                if (throttle > throttleMax) {
                    throttle = 0;

                    if (!furthestScope) {
                        furthestScope = this;
                        furthestItem = d;
                    }
                    else {
                        if (d.px > furthestItem.px) {
                            furthestScope = this;
                            furthestItem = d;
                        }
                    }
                }
            }
        }
    );

    lowestItem.weight = node.weight;

    if (!node.activated) {
        switchCircleToPreBeacon(lowestScope, lowestItem);
    }
    else {
        switchCircleToBeacon(lowestScope, lowestItem);
    }
}

function switchCircleToPreBeacon(d, circle) {
    circle.gravityPoint = gravityPoints[1];
    circle.state = 2;

    d3.select(d).style('fill', weightColors[circle.weight]);
    d3.select(d).style('r', 10);

    //mainNodes.push(getNode(0, 0, 0, 0));
}

function switchCircleToBeacon(d, circle) {
    var color = d3.scale.category10().domain(d3.range(10));

    circle.gravityPoint = gravityPoints[2];
    circle.state = 3;

    d3.select(d).style('fill', colors[2]);

    //mainNodes.push(getNode(0, 0, 0, 0));
}

function getNodes(number, yGravity) {
    var n = number, // total number of nodes
        m = 1; // number of distinct clusters

    return d3.range(n).map(
        function() {
            var i = Math.floor(Math.random() * m);

            return getNode(i, m, yGravity);
        }
    );
}

function getNode(i, m, yGravity) {
    var color = d3.scale.category10().domain(d3.range(m));

    var x = d3.scale.ordinal()
        .domain(d3.range(m))
        .rangePoints([0, width], 1);

    return {
        radius: 6,
        color: colors[0],
        cx: x(i),
        cy: yGravity,
        gravityPoint: gravityPoints[0],
        state: 1
    };
}

// Move nodes toward cluster focus.
function gravity(alpha) {
    return function(d) {
        d.y += (d.gravityPoint.y - d.y) * alpha;
        d.x += (d.gravityPoint.x - d.x) * alpha;
    };
}

// Resolve collisions between nodes.
function collide(alpha, nodes) {
    var quadtree = d3.geom.quadtree(nodes);

    return function(d) {
        var r = d.radius,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;

        quadtree.visit(
            function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;

                    if (l < r) {
                        l = (l - r) / l * .1;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            }
        );
    };
}

var force;

function runSimulation(htmlId, nodes) {
    var svg = d3.select(htmlId).append('svg')
        .attr('width', width)
        .attr('height', height);

    force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(0)
        .charge(0)
        .on(
            'tick', function(e) {
                circles
                    .each(gravity(.08 * e.alpha))
                    .each(collide(.5, nodes))
                    .attr(
                        'cx', function(d) {
                            return d.x;
                        }
                    )
                    .attr(
                        'cy', function(d) {
                            return d.y;
                        }
                    );
            }
        )
        .start();

    setInterval(
        function() {
            force.alpha(0.1);
        }, 250
    );

    return svg.selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr(
            'r', function(d) {
                return d.radius;
            }
        )
        .style(
            'fill', function(d) {
                return d.color;
            }
        )
        .call(force.drag);
}

function processNewNodes(result) {
    var nodesToAdd = [];

    _.each(
        result['fashion3'].rows, function(item) {
            item.weight = 3;
            nodesToAdd.push(item);
        }
    );
    _.each(
        result['fashion2'].rows, function(item) {
            item.weight = 2;
            nodesToAdd.push(item);
        }
    );
    _.each(
        result['fashion1'].rows, function(item) {
            item.weight = 1;
            nodesToAdd.push(item);
        }
    );
    _.each(
        result['fashion0'].rows, function(item) {
            item.weight = 0;
            nodesToAdd.push(item);
        }
    );

    _.each(
        nodesToAdd, function(node) {
            var alreadyExists = _.find(
                activeNodes, function(item) {
                    return item[0] === node[0];
                }
            );

            if (!alreadyExists) {
                activeNodes.push(node);
                circleQueue.push(node);
            }
            else {
                alreadyExists.weight = node.weight;
            }
        }
    );

    circleQueue = _.shuffle(circleQueue);
}

function getAllUsers() {
    return {
        then: function(callback) {
            jQuery.get(
                '/getUsers',
                {},
                function(data) {
                    /**var data = {
                fashion0: {
                    "columns": ["user_id (for category_id=31984208)"],
                    "warnings": [],
                    "header": [],
                    "rows": [
                        ["3118213610035373959"],
                        ["3737315022181373557"],
                        ["2406378874252901713"],
                        ["3190302140996869223"],
                        ["3359252916128457505"],
                        ["2843554010745620484"]
                    ],
                    "errors": [],
                    "info": ["Number of users: 6"]
                },
                fashion1: {
                    "columns": ["user_id (for category_id=31984208)"],
                    "warnings": [],
                    "header": [],
                    "rows": [
                        ["3118213g6100351373959"],
                        ["37373150da22181373557"],
                        ["240637fas8874252901713"],
                        ["31903021409968asd69223"],
                        ["3359252916128457505"],
                        ["28435a540107456g20484"]
                    ],
                    "errors": [],
                    "info": ["Number of users: 6"]
                },
                fashion2: {
                    "columns": ["user_id (for category_id=31984208)"],
                    "warnings": [],
                    "header": [],
                    "rows": [
                        ["3118213a610035373959"],
                        ["37373150221813173557"],
                        ["2406378g874252901713"],
                        ["319030214g0996869223"],
                        ["33592529g161284a57505"],
                        ["284355401g0745620484"]
                    ],
                    "errors": [],
                    "info": ["Number of users: 6"]
                },
                fashion3: {
                    "columns": ["user_id (for category_id=31984208)"],
                    "warnings": [],
                    "header": [],
                    "rows": [
                        ["3118213610g035373959"],
                        ["3737315022181373557"],
                        ["240637asd8874252901713"],
                        ["3190302140996869223"],
                        ["3359252916128457505"],
                        ["2843554010asda745620484"]
                    ],
                    "errors": [],
                    "info": ["Number of users: 6"]
                }
            };

                     **/

                    callback(data);
                }
            );
        }
    };
}

var pollInterval = setInterval(
    function() {
        getAllUsers().then(processNewNodes);
    }, 15000
);

var queueInterval = setInterval(
    function() {
        if (circleQueue.length > 0) {
            activateCircle(circleQueue[0]);

            circleQueue.shift();
        }
    }, 500
);

setTimeout(
    function() {
        getAllUsers().then(processNewNodes);
    }, 4000
);