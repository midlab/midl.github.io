var width = 960,
    height = 500,
    selected_node, selected_target_node,
    selected_link, new_line,
    circlesg, linesg,
    should_drag = false,
    drawing_line = false,
    nodes = [],
    links = [],
	root,
    link_distance = 50;

var default_name = " "

document.oncontextmenu = function() {
    return false;
}

var force = d3.layout.force()
    .charge(-2000)
	.friction(0.3)
    .linkDistance(link_distance)
    .size([width, height]);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);
	
function group(d) { return d.group; }
var color = d3.scale.category10();
function colorByGroup(d) { return color(group(d)); }

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    .on("keydown", keydown)
    .on("keyup", keyup);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);

// Arrow marker
// svg.append("svg:defs").selectAll("marker")
  // .data(["child"])
  // .enter().append("svg:marker")
  // .attr("id", String)
  // .attr("markerUnits", "userSpaceOnUse")
  // .attr("viewBox", "0 -5 10 10")
  // .attr("refX", link_distance)
  // .attr("refY", -1.1)
  // .attr("markerWidth", 10)
  // .attr("markerHeight", 10)
  // .attr("orient", "auto")
  // .append("svg:path")
  // .attr("d", "M0,-5L10,0L0,5");


linesg = svg.append("g");
circlesg = svg.append("g");

d3.json("./data/bob.json", function(json) {
  // decorate a node with a count of its children
  nodes = json.nodes;
  links = json.links;
  // root = json;
  // root.fixed = true;
  // root.x = w / 2;
  // root.y = h / 4;
  
  // nodes = flatten(root);
  // links = d3.layout.tree().links(nodes);
  update();
  force = force
    .nodes(nodes)
    .links(links);
  force.start();
});


function update() {  
  var link = linesg.selectAll("line.link")
      .data(links)
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .classed("selected", function(d) { return d === selected_link; });
  link.enter().append("line")
    .attr("class", "link")
    // .attr("marker-end", "url(#child)")
    .on("mousedown", line_mousedown);
  link.exit().remove();

  var node = circlesg.selectAll(".node")
    .data(nodes, function(d) {return d.name;})
    .classed("selected", function(d) { return d === selected_node; })
    .classed("selected_target", function(d) { return d === selected_target_node; })
  var nodeg = node.enter()
    .append("svg:g")
    .attr("class", "node")
    .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";})
	.call(force.drag);
  nodeg.append("circle")
    .attr("r", 30)
	// .style('fill', 'LightBlue')
	.style('fill', colorByGroup)
	.attr('fill-opacity', 0.5)
    .on("mousedown", node_mousedown)
    .on("mouseover", node_mouseover)
    .on("mouseout", node_mouseout);
  nodeg.append('circle')
    .attr('r', 4)
    .attr('stroke', 'black');
  nodeg
    .append("svg:a")
    .attr("xlink:href", function (d) { return d.url || '#'; })
    .append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) {return d.name})
	.attr('text-anchor', 'start');
  node.exit().remove();

  force.on("tick", function(e) {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.call(force.drag);
  });
}

// select target node for new node connection
function node_mouseover(d) {
  if (drawing_line && d !== selected_node) {
    // highlight and select target node
    selected_target_node = d;
  }
}

function node_mouseout(d) {
  if (drawing_line) {
    selected_target_node = null;
  }
}

// select node / start drag
function node_mousedown(d) {
  if (!drawing_line) {
    selected_node = d;
    selected_link = null;
	d3.select(this).style("cursor", "pointer");
	// console.log(d)
  }
  if (!should_drag) {
    d3.event.stopPropagation();
	selected_node = d;
    drawing_line = true;
	d3.select(this).style("cursor", "default");
	console.log(d.name)
	Search(d.name);
  }
  d.fixed = true;
  force.stop()
  // force.start()
  update();
  d.fixed = false;
}

// select line
function line_mousedown(d) {
  selected_link = d;
  selected_node = null;
  update();
}

// draw yellow "new connector" line
function mousemove() {
  if (drawing_line && !should_drag) {
    var m = d3.mouse(svg.node());
    var x = Math.max(0, Math.min(width, m[0]));
    var y = Math.max(0, Math.min(height, m[1]));
    // debounce - only start drawing line if it gets a bit big
    var dx = selected_node.x - x;
    var dy = selected_node.y - y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      // draw a line
      if (!new_line) {
        new_line = linesg.append("line").attr("class", "new_line");
      }
      new_line.attr("x1", function(d) { return selected_node.x; })
        .attr("y1", function(d) { return selected_node.y; })
        .attr("x2", function(d) { return x; })
        .attr("y2", function(d) { return y; });
    }
  }
  update();
}

// add a new disconnected node
function mousedown() {
  m = d3.mouse(svg.node())
  default_name = getValue();
  // nodes.push({x: m[0], y: m[1], name: default_name + " " + nodes.length, group: 1});
  nodes.push({x: m[0], y: m[1], name: default_name, group: 1});
  selected_link = null;
  force.stop();
  update();
  force.start();
}

// end node select / add new connected node
function mouseup() {
  drawing_line = false;
  if (new_line) {
    if (selected_target_node) {
      selected_target_node.fixed = false;
      var new_node = selected_target_node;
    } else {
      var m = d3.mouse(svg.node());
      var new_node = {x: m[0], y: m[1], name: default_name + " " + nodes.length, group: 1}
      nodes.push(new_node);
    }
    selected_node.fixed = false;
    links.push({source: selected_node, target: new_node, value: 1})
    selected_node = selected_target_node = null;
    update();
    setTimeout(function () {
      new_line.remove();
      new_line = null;
      force.start();
    }, 300);
  }
}

function keyup() {
  switch (d3.event.keyCode) {
    case 16: { // shift
      should_drag = false;
      update();
      force.start();
    }
  }
}

// select for dragging node with shift; delete node with backspace
function keydown() {
  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: { // delete
      if (selected_node) { // deal with nodes
        var i = nodes.indexOf(selected_node);
        nodes.splice(i, 1);
        // find links to/from this node, and delete them too
        var new_links = [];
        links.forEach(function(l) {
          if (l.source !== selected_node && l.target !== selected_node) {
			l.value = 1;
            new_links.push(l);
          }
        });
        links = new_links;
        selected_node = nodes.length ? nodes[i > 0 ? i - 1 : 0] : null;
      } else if (selected_link) { // deal with links
        var i = links.indexOf(selected_link);
        links.splice(i, 1);
        selected_link = links.length ? links[i > 0 ? i - 1 : 0] : null;
      }
      update();
      break;
    }
    case 16: { // shift
      should_drag = true;
      break;
    }
  }
}

function flatten(root) {
  var nodes = []; 
  var i = 0;
 
  function recurse(node) {
    if (node.children) 
      node.children.forEach(recurse);
    if (!node.id) 
      node.id = ++i;
    nodes.push(node);
  }
 
  recurse(root);
  return nodes;
} 

function getValue(){
   var retVal = prompt("Enter new ideas : ", "idea here");
   console.log(retVal)
   return retVal;
   // document.write("You have entered : " + retVal);
}
  