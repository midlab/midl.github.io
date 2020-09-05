var width = 1220,
    height = 500,
    selected_node, selected_target_node,
    selected_link, new_line,
    circlesg, linesg,
    should_drag = false,
    drawing_line = false,
	connect_node = false,
	node_color = false,
    nodes = [],
    links = [],
	root,
    link_distance = 100;

var default_name = " "

document.oncontextmenu = function() {
    return false;
}

var force = d3.layout.force()
    .charge(-500)
	// .friction(0.3)
    .linkDistance(link_distance)
    .size([width, height]);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);
	
function group(d) { return d.group; }
var color = d3.scale.category10();
function colorByGroup(d) { return color(group(d)); }

d3.select(window)
    // .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    // .on("keydown", keydown)
    .on("keyup", keyup);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    // .on("mousedown", mousedown);

linesg = svg.append("g");
circlesg = svg.append("g");

d3.json("./data/bob.json", function(json) {
  // decorate a node with a count of its children
  nodes = json.nodes;
  links = json.links;
  
  update();
  force = force
    .nodes(nodes)
    .links(links);
  force.start();
});


function update() {
  force.nodes(nodes);
  force.links(links);
  var l = svg.selectAll(".link")
      .data(links)
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .classed("selected", function(d) { return d === selected_link; });
	  
  var n = svg.selectAll(".node")
      .data(nodes, function(d) {return d.name;})
	  
  enterLinks(l);
  exitLinks(l);
  enterNodes(n);
  exitNodes(n);
  link = svg.selectAll(".link");
  node = svg.selectAll(".node");
  
  node.select("circle").attr("r", function(d) {return d.stringL});
  // node.select("text").text(function(d) {return d.name +' '+ d.penaltyL +' '+ d.penaltyT});
  node.select("text").style("font-size", function(d){
		if (d.label == null) {return 15}
		else {return 2*d.dis + 15} });

  force.on("tick", function(e) {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.call(force.drag);
  });
  
  force.start();
}

function enterNodes(n) {
  var g = n.enter().append("g")
    .attr("class", "node")
	.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";});

  g.append("circle")
	// .attr('r', 10)
	.attr("r", function(d) {return d.stringL})
	.style("fill", 'blue')
    // .attr('stroke', 'blue')
	// .attr('fill-opacity', 0.5)
    // .on("mousedown", node_mousedown)
    // .on("mouseover", node_mouseover)
    // .on("mouseout", node_mouseout)
	.on("dblclick", node_dblclick)
	.on('contextmenu', getSug)
	.call(force.drag)

  g.append("text")
    // .attr("x", function(d) {return d.weight + 5})
    .attr('text-anchor', 'middle')
    .attr("dy", ".1em")
	// .text(function(d) {return d.name})
    .text(function(d) {return d.name})
	.call(wrap, 120)
	.style("fill", function(d){
		if (d.label == null) {return "Red"}
		else {return "Black"} })
	// .style("font-size", 100)
}

function exitNodes(n) {
  n.exit().remove();
}

function enterLinks(l) {
  l.enter().insert("line", ".node")
    .attr("class", "link")
	.style("stroke-width", 1);
    // .style("stroke-width", function(d) { return d.weight; });
}

function exitLinks(l) {
  l.exit().remove();
}

// select target node for new node connection
function node_mouseover(d) {
	d3.select(this).style("cursor", "pointer")
	
  if (drawing_line && d !== selected_node) {
    // highlight and select target node
    selected_target_node = d;
  }
}

function node_mouseout(d) {
	d3.select(this).style("cursor", "default")
  // d3.selectAll('.concept').on('click',null);
  if (drawing_line) {
    selected_target_node = null;
  }
}

var connectedNodes = [];
function node_dblclick(d) {
	if (connectedNodes.length > 0){connectedNodes = [];}
	node_color = false;
	d3.selectAll('.concept').on('click',null);
	connect_node = true;
	console.log("double clicked!")
	selected_node = d;
	console.log(d.name)
	connectedNodes.push(d);
	console.log(connectedNodes)
	selected_link = null;
	force.stop();
	update();
	force.start();
	
	if (connectedNodes[0].label == null) {openDialog();}
	else {
	
	default_name = getValue();
	var m = [];
	m[0] = Math.max(0, Math.min(width, connectedNodes[0].x));
	m[1] = Math.max(0, Math.min(height, connectedNodes[0].y));
	if (default_name == null) {}
	else {
	  var nn;
	  for (var i=0; i<nodes.length; i++){
		  if (nodes[i].label != null) {nn = nodes[i].label+1}
	  }
	  var t = Date.now();
	  var L = default_name.length;
	  var new_node = {x: m[0], y: m[1], name: default_name, group: 1, weight: 1, label:nn, Parent:null, Children:[], addTime:t, modifiedTime:null, penaltyT:1, penaltyL:0, dis:0, stringL:L*3.9};
	  console.log(new_node)
	  nodes.push(new_node);
	  connectedNodes.push(new_node)
	  console.log(connectedNodes)
	}
	selected_link = null;
	force.stop();
	update();
	// force.start();
	
	if (connectedNodes.length==2){
		var x_new = Math.max(0, Math.min(width, connectedNodes[1].x));
		var y_new = Math.max(0, Math.min(height, connectedNodes[1].y));
		var dx = connectedNodes[0].x - x_new;
		var dy = connectedNodes[0].y - y_new;
		console.log(dx)
		console.log(dy)
		var parentNode, childNode;
		// if (Math.sqrt(dx * dx + dy * dy) > 10) {
			links.push({source: connectedNodes[0], target: connectedNodes[1], value: 1});
			if (connectedNodes[0].label == 0) {
				for (var i=0; i<nodes.length; i++) {
					if (connectedNodes[0].label == nodes[i].label) {
						// nodes[i].Children=connectedNodes[1].label;
						nodes[i].Children.push(connectedNodes[1].label);
						var t = Date.now();
						nodes[i].modifiedTime = t;
						nodes[i].penaltyT = 1;
						parentNode = i;
					}
					else if (connectedNodes[1].label == nodes[i].label) {nodes[i].Parent=connectedNodes[0].label; childNode = i;}
				}
			}
			else if (connectedNodes[0].Parent != null) {
				for (var i=0; i<nodes.length; i++) {
					if (connectedNodes[0].label == nodes[i].label) {
						// nodes[i].Children=connectedNodes[0].label
						nodes[i].Children.push(connectedNodes[1].label);
						var t = Date.now();
						nodes[i].modifiedTime = t;
						nodes[i].penaltyT = 1;
						parentNode = i;
					}
					else if (connectedNodes[1].label == nodes[i].label) {nodes[i].Parent=connectedNodes[0].label; childNode = i;}
				}
			}
			
			while (nodes[childNode].Parent != null) {
				for (var i=0; i<nodes.length; i++) {
					if (nodes[i].label != null && nodes[i].label == nodes[childNode].Parent) {
						nodes[i].dis = nodes[i].dis + 1;
						childNode = i;}
				}
			}
			console.log(nodes)
			console.log(links)
		// }
	}
	update();
	d.fixed = false;
	// force.start();
	}
}

// select node / start drag
var sss = [];
function node_mousedown(d) {
	// d3.select(this).style("cursor", "pointer");
	if (node_color == true) {
		d3.selectAll('.concept')
		.on("click", function(d) {
			d3.select(this).style('fill', document.getElementById("ColorPicker").value)
			});
	}
	else {
		should_drag = true;
		d3.selectAll('.concept').on('click',null);
  // if (!drawing_line) {
		selected_node = d;
		selected_link = null;
		sss.push(d.name);
		// Search(d.name);
	}

  d.fixed = true;
  force.stop()
  // force.start()
  update();
  d.fixed = false;
  node_color = false;
}

// select line
function line_mousedown(d) {
  selected_link = d;
  selected_node = null;
  update();
}

// add a new disconnected node
function mousedown() {
  // d3.selectAll('.concept').on('click',null);
  // if (nodes.length == 1) {Cnodes.push(nodes[0]);}
  selected_link = null;
  force.stop();
  update();
  force.start();
  
  m = d3.mouse(svg.node())
  default_name = getValue();
  
  if (default_name == null) {}
  else {
	  var nn;
	  for (var i=0; i<nodes.length; i++){
		  if (nodes[i].label != null) {nn = nodes[i].label+1}
	  }
	  var t = Date.now();
	  nodes.push({x: m[0], y: m[1], name: default_name, group: 1, weight: 1, label:nn, Parent:null, Children:[], addTime:t, modifiedTime:null, penaltyT:1, penaltyL:0, dis:0});
  }
  selected_link = null;
  force.stop();
  update();
  force.start();
}

// end node select / add new connected node
function mouseup() {
  // d3.selectAll('.concept').on('click',null);
  drawing_line = false;
}

function keyup() {
  // switch (d3.event.keyCode) {
    // case 16: { // shift
      // should_drag = false;
      // update();
      // force.start();
    // }
  // }
  update();
  force.start();
}

// select for dragging node with shift; delete node with backspace
// function keydown() {
  // switch (d3.event.keyCode) {
    // case 8: // backspace
    // case 46: { // delete
      // if (selected_node) { // deal with nodes
        // var i = nodes.indexOf(selected_node);
        // nodes.splice(i, 1);
        // find links to/from this node, and delete them too
        // var new_links = [];
        // links.forEach(function(l) {
          // if (l.source !== selected_node && l.target !== selected_node) {
			// l.value = 1;
            // new_links.push(l);
          // }
        // });
        // links = new_links;
        // selected_node = nodes.length ? nodes[i > 0 ? i - 1 : 0] : null;
      // } else if (selected_link) { // deal with links
        // var i = links.indexOf(selected_link);
        // links.splice(i, 1);
        // selected_link = links.length ? links[i > 0 ? i - 1 : 0] : null;
      // }
      // update();
	  // force.start();
      // break;
    // }
    // case 16: { // shift
      // should_drag = true;
      // break;
    // }
  // }
// }

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

function ColorNode(){
	  document.getElementById("ColorPicker").focus();
	  document.getElementById("ColorPicker").click();
	  console.log(document.getElementById("ColorPicker").value)
	  node_color = true;
}

var slider = document.getElementById("timeRange");
// var f = slider.value;
slider.oninput = function() {
  // clearInterval(timeCounter);
  globalThreshold = this.value*0.1;
  // timeCounter = setInterval(timeElapse, f);
}

var timeCounter = setInterval(timeElapse, 2000);
var globalThreshold = slider.value*0.1;
var nOverThreshold = [];
var computerStop = false;

function sugStop() {
	if (computerStop == true) {computerStop = false;}
	else if (computerStop == false) {computerStop = true;}
}

function timeElapse() {
	console.log(globalThreshold)
	// globalThreshold = f;
	computed = [];
	var totalLineage = 0;
	for (var i=0; i<nodes.length; i++) {
		if (nodes[i].penaltyT != null) {
			nodes[i].penaltyT = nodes[i].penaltyT - 0.1;
			totalLineage = totalLineage + nodes[i].dis;
			console.log(nodes[i].penaltyT)
			if (nodes[i].penaltyT < 0) {nodes[i].penaltyT = 0;}
		}
	}
	if (computerStop == false) {
		nOverThreshold = [];
		console.log("counting")
		var timer = Date.now();
		if (nodes.length > 1) {
			for (var i=0; i<nodes.length; i++) {
				if (nodes[i].penaltyL != null) {
					// nodes[i].penaltyL = 1-(nodes[i].dis/totalLineage);
					nodes[i].penaltyL = 1-(nodes[i].dis/nodes[0].dis);
					var penalty = [nodes[i].penaltyT,nodes[i].penaltyL]
					var p = Math.min(...penalty);
					if (nodes[i].Parent != null && p < globalThreshold) {nOverThreshold.push(nodes[i]);}
					else if (nodes[i].Parent == null) {
						if (nodes[i].penaltyT < globalThreshold) {nOverThreshold.push(nodes[i]);}
					}
				}
			}
			if (nOverThreshold.length > 0) {computeSug();}
		}
	}
	else {}
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        // lineHeight = 1.1, // ems
		lineHeight = 0.7, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
      }
    }
  });
}

function computeDis() {
	var temp = [];
	for (var i=0; i<nOverThreshold.length; i++){
		if (nOverThreshold[i].label == 0) {nOverThreshold[i].score = 1;}
		if (nOverThreshold[i].Children.legth == 0) {nOverThreshold[i].score = 0;}
		else if (nOverThreshold[i].Children.length > 0) {
			var s = 0;
			temp.push(nOverThreshold[i]);
			preorderSearch(temp[temp.length-1],s);
			nOverThreshold[i].score = s/links.length;
			temp = [];
		}
	}
}

function preorderSearch(n,c) {
	for (var i=0; i<nodes.length; i++) {
		if (nodes[i].Parent == n.label && nodes[i].Children.length == 0) {
			c = c+1;
			return
		}
		else if (nodes[i].Parent == n.label && nodes[i].Children.length > 0) {
			temp.push(nodes[i]);
			for (var j=0; j<nodes[i].Children.length; j++){
				c = c+1;
				temp.push(nodes[i].Children[j],c)
				preorderSearch(nodes[i].Children[j],c);
				cosole.log(temp)
				console.log(c)
			}
		}
	}
}

function changeSug() {
	document.getElementById("sug1").innerHTML = 'apple';
}

function changeValue() {
	document.getElementById("sug2").innerHTML = 'banana';
}