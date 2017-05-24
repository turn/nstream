'use strict';

jQuery(
    function() {

    }
);

var width = 1170,
    height = 1600,
    padding = 12;

var colors = [
    '#444',
    '#2ca02c'
];

var weightColors = [
    '#4cb8b0',
    '#514BCF',
    '#C247C5'
];

var gravityPoints = [
    {
        y: 450,
        x: 585
    },
    //Fashion 1
    {
        y: 340,
        x: 320
    },
    //Fashion 2
    {
        y: 340,
        x: 220
    },
    //Fashion 3
    {
        y: 340,
        x: 120
    },
    //Fashion 4
    {
        y: 620,
        x: 220
    },

    //Auto 1
    {
        y: 540,
        x: 820
    },
    //Auto 2
    {
        y: 440,
        x: 920
    },
    //Auto 3
    {
        y: 340,
        x: 1020
    },
    //Auto 4
    {
        y: 620,
        x: 920
    },
];

var mainNodes = getNodes(1000, 160);
var throttle = 0;
var throttleMax = 5;
var circles = runSimulation('#chart1', mainNodes);

var activeFashionNodes = [];
var activeAutoNodes = [];
var circleQueue = [];

function activateCircle(node, alreadyExists, removeNode) {
    var lowestScope = null;
    var lowestItem = null;

    circles.each(
        function(d) {
            if (!alreadyExists) {
                if (!lowestItem && !d.id) {
                    lowestScope = this;
                    lowestItem = d;
                }
                else if (lowestItem && !d.id) {
                    if (d.py > lowestItem.py) {
                        lowestScope = this;
                        lowestItem = d;
                    }
                }
            }
            else {
                if (removeNode) {
                    switchCircleToPool(this, d);
                }
                else {
                    if (node.id === d.id && node.category == d.category) {
                        lowestScope = this;
                        lowestItem = d;
                    }
                }
            }
        }
    );

    if (lowestItem) {
        lowestItem.weight = node.weight;
        lowestItem.category = node.category;
        lowestItem.activated = node.activated;
        lowestItem.id = node.id;

        if (!node.activated) {
            switchCircleToPreBeacon(lowestScope, lowestItem);
        }
        else {
            switchCircleToBeacon(lowestScope, lowestItem);
        }
    }
}

function switchCircleToPool(d, circle) {
    d.activated = false;
    d.id = null;
    d.category = null;
    d.weight = null;

    circle.gravityPoint = gravityPoints[0];
    d3.select(d).style('fill', colors[0]);
}

function switchCircleToPreBeacon(d, circle) {
    if (circle.category !== 'auto') {
        if (circle.weight === 0) {
            circle.gravityPoint = gravityPoints[1];
        }

        if (circle.weight === 1) {
            circle.gravityPoint = gravityPoints[2];
        }

        if (circle.weight === 2) {
            circle.gravityPoint = gravityPoints[3];
        }
    }
    else {
        if (circle.weight === 0) {
            circle.gravityPoint = gravityPoints[5];
        }

        if (circle.weight === 1) {
            circle.gravityPoint = gravityPoints[6];
        }

        if (circle.weight === 2) {
            circle.gravityPoint = gravityPoints[7];
        }
    }

    d3.select(d).style('fill', weightColors[circle.weight]);
    //mainNodes.push(getNode(0, 0, 0, 0));
}

function switchCircleToBeacon(d, circle) {
    circle.gravityPoint = circle.category === 'auto' ? gravityPoints[8] : gravityPoints[4];

    d3.select(d).style('fill', colors[1]);
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
        gravityPoint: gravityPoints[0]
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
                        l = (l - r) / l * .12;
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
    var fashionNodesToAdd = [];
    var autoNodesToAdd = [];

    _.each(
        result['fashion2'].rows.slice(0, 100), function(item) {
            var newItem = {};

            newItem.weight = 2;
            newItem.category = 'fashion';
            newItem.id = item[0];

            fashionNodesToAdd.push(newItem);
        }
    );
    _.each(
        result['fashion1'].rows.slice(0, 100), function(item) {
            var newItem = {};

            newItem.weight = 1;
            newItem.category = 'fashion';
            newItem.id = item[0];

            fashionNodesToAdd.push(newItem);
        }
    );
    _.each(
        result['fashion0'].rows.slice(0, 100), function(item) {
            var newItem = {};

            newItem.weight = 0;
            newItem.category = 'fashion';
            newItem.id = item[0];

            fashionNodesToAdd.push(newItem);
        }
    );
    _.each(
        result['car2'].rows.slice(0, 100), function(item) {
            var newItem = {};

            newItem.weight = 2;
            newItem.category = 'auto';
            newItem.id = item[0];

            autoNodesToAdd.push(newItem);
        }
    );
    _.each(
        result['car1'].rows.slice(0, 100), function(item) {
            var newItem = {};

            newItem.weight = 1;
            newItem.category = 'auto';
            newItem.id = item[0];

            autoNodesToAdd.push(newItem);
        }
    );

    _.each(
        result['car0'].rows.slice(0, 100), function(item) {
            var newItem = {};

            newItem.weight = 0;
            newItem.category = 'auto';
            newItem.id = item[0];

            autoNodesToAdd.push(newItem);
        }
    );

    _.each(
        activeFashionNodes, function(node) {
            if (random_expiry()) {
                activateCircle(node, true, true);
            }
        }
    );

    _.each(
        activeAutoNodes, function(node) {
            if (random_expiry()) {
                activateCircle(node, true, true);
            }
        }
    );

    _.each(
        fashionNodesToAdd, function(node) {
            var alreadyExists = _.find(
                activeFashionNodes, function(item) {
                    return item.id === node.id;
                }
            );

            if (!alreadyExists) {
                activeFashionNodes.push(node);
                circleQueue.push(node);
            }
            else {
                var isActivated = _.find(
                    result['fashionBeacon'].rows, function(item) {
                        return item[0] === node.id;
                    }
                );

                if (isActivated) {
                    node.activated = true;
                    activateCircle(node, true);
                }

                alreadyExists.weight = node.weight;
            }
        }
    );

    _.each(
        autoNodesToAdd, function(node) {
            var alreadyExists = _.find(
                activeAutoNodes, function(item) {
                    return item.id === node.id;
                }
            );

            if (!alreadyExists) {
                activeAutoNodes.push(node);
                circleQueue.push(node);
            }
            else {
                var isActivated = _.find(
                    result['carBeacon'].rows, function(item) {
                        return item[0] === node.id;
                    }
                );

                if (isActivated) {
                    node.activated = true;
                    activateCircle(node, true);
                }

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

function random_boolean() {
    return Math.random() >= 0.5;
}

function random_expiry() {
    return Math.random() >= 0.95;
}

var queueInterval = setInterval(
    function() {
        if (circleQueue.length > 0) {
            if (random_boolean()) {
                activateCircle(circleQueue[0]);
                circleQueue.shift();
            }
        }
    }, 150
);

setTimeout(
    function() {
        getAllUsers().then(processNewNodes);
    }, 4000
);