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
	root = nodes[0],
    link_distance = 100;

var default_name = " "

document.oncontextmenu = function() {
    return false;
}

const forceX = d3.forceX(width / 2).strength(0.015)
const forceY = d3.forceY(height / 2).strength(0.015)

var simulation = d3.forceSimulation(nodes)
	.force("charge", d3.forceManyBody().strength(-150))
    .force("link", d3.forceLink(links).distance(100))
    // .force("x", d3.forceX())
    // .force("y", d3.forceY())
	// .force("collide", d3.ellipseForce(6, 0.5, 5))
	// .force("x", forceX)
    // .force("y", forceY)
	.force("collide", d3.forceCollide().radius(function(d){
      // if(d === root){return Math.random() * 50 + 100;
	  if(d === root){return d.stringL + 20;}
      return d.stringL + 10;}).iterations(2))
	.force("center", d3.forceCenter(width / 2, height / 2))
    .alphaTarget(1)
    // .on("tick", ticked);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);
	
d3.select(window)
    // .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    // .on("keydown", keydown)
    .on("keyup", keyup);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    // .on("mousedown", mousedown);

d3.json("./data/bob.json", function(json) {
  // decorate a node with a count of its children
  nodes = json.nodes;
  links = json.links;
  
  update();
  
  // simulation.nodes(nodes);
  // simulation.force("link").links(links);
  // simulation.alpha(1).restart();
});

var linkedByIndex = {}; // build a dictionary of nodes that are linked
var node,link;
function update() {
  links.forEach(function(d) {
	  linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });
  
  simulation.stop();
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  
  // var l = svg.selectAll('line').data(links)
	  // .classed("selected", function(d) { return d === selected_link; });
   var l = svg.selectAll(".link")
      .data(links)
      // .attr("x1", function(d) { return d.source.x; })
      // .attr("y1", function(d) { return d.source.y; })
      // .attr("x2", function(d) { return d.target.x; })
      // .attr("y2", function(d) { return d.target.y; })
      .classed("selected", function(d) { return d === selected_link; });
	  
   var n = svg.selectAll(".node")
      .data(nodes)
      // .data(nodes, function(d) {return d.name;})
	  
  enterLinks(l);
  exitLinks(l);
  enterNodes(n);
  exitNodes(n);
  link = svg.selectAll(".link");
  node = svg.selectAll(".node");
  
  node.select("ellipse").attr("rx", function(d) { 
		if (d.label == null) {return d.stringL-20}
		else if (d.importance == 1) {return d.stringL*2.2}
		else if (d.importance == 2) {return d.stringL*1.8}	
		else if (d.importance == 3) {return d.stringL*1.5}
		else if (d.importance == 4) {return d.stringL*1.2}
		else {return d.stringL}});
  node.select("ellipse").attr("ry", function(d) { 
		if (d.label == null) {return 11}
		else if (d.importance == 1) {return 24}
		else if (d.importance == 2) {return 20}	
		else if (d.importance == 3) {return 17}
		else if (d.importance == 4) {return 14}
		else {return 11}});
  node.select("ellipse").style("stroke", function(d) { 
		if (d.label == null) {return "#66FFFF"}
		else if (d.importance == 1) {return "#6600CC"}
		else if (d.importance == 2) {return "#6633FF"}	
		else if (d.importance == 3) {return "#6666FF"}
		else if (d.importance == 4) {return "#6699FF"}
		else {return "#66CCFF"}})
  node.select("text").text(function(d) {return d.name});
  node.select("text").style("font-size", function(d){
		if (d.label == null) {return 10}
		else if (d.importance == 1) {return 30}
		else if (d.importance == 2) {return 25}	
		else if (d.importance == 3) {return 20}
		else if (d.importance == 4) {return 15}
		else {return 10}});
  node.select("text").attr("dy", function(d){
		if (d.label == null) {return 2}
		else if (d.importance == 1) {return 8}
		else if (d.importance == 2) {return 6}
		else if (d.importance == 3) {return 4}
		else if (d.importance == 4) {return 3}
		else {return 2}});
  // node.select("text").style("fill", function(d){
		// if (d.label == null) {return "Red"}
		// else {return "Black"} });
  // node.select("text").call(wrap, 30);

  simulation.on("tick", function(e) {
	var nodes = simulation.nodes();
	var q = d3.quadtree().x(function(d) {return d.x}).y(function(d) {return d.y}).addAll(nodes),
      i = 0,
      n = nodes.length;

    while (++i < n) q.visit(collide(nodes[i]));
	
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    // node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
	node.attr("cx", function(d) { return d.x = Math.max(30, Math.min(width - 30, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(24, Math.min(height - 24, d.y)); })
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
  
  simulation.alpha(1).restart();
}

function enterNodes(n) {
  var g = n.enter().append("g")
    .attr("class", "node")
	// .selectAll("circle")
	.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";});

  g.append("ellipse")
	// .attr('r', 10)
	.attr("rx", function(d) { 
		if (d.label == null) {return d.stringL-20}
		else if (d.importance == 1) {return d.stringL*2.2}
		else if (d.importance == 2) {return d.stringL*1.8}	
		else if (d.importance == 3) {return d.stringL*1.5}
		else if (d.importance == 4) {return d.stringL*1.2}
		else {return d.stringL}})
    .attr("ry", function(d) { 
		if (d.label == null) {return 11}
		else if (d.importance == 1) {return 24}
		else if (d.importance == 2) {return 20}	
		else if (d.importance == 3) {return 17}
		else if (d.importance == 4) {return 14}
		else {return 11}})
	// .attr("r", function(d) {return d.stringL})
	.attr("fill", 'white')
	// .style("stroke", '#A9A9A9')
	.style("stroke", function(d) { 
		if (d.label == null) {return "#66FFFF"}
		else if (d.importance == 1) {return "#6600CC"}
		else if (d.importance == 2) {return "#6633FF"}	
		else if (d.importance == 3) {return "#6666FF"}
		else if (d.importance == 4) {return "#6699FF"}
		else {return "#66CCFF"}})
    .style("stroke-width", "2px")
    // .on("mousedown", node_mousedown)
    .on("mouseover", mouseOver(0.2))
    .on("mouseout", mouseOut)
	.on("dblclick", node_dblclick)
	.on('contextmenu', getSug)
	.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

  g.append("text")
    .attr('text-anchor', 'middle')
    .attr("dy", function(d){
		if (d.label == null) {return 2}
		else if (d.importance == 1) {return 8}
		else if (d.importance == 2) {return 6}
		else if (d.importance == 3) {return 4}
		else if (d.importance == 4) {return 3}
		else {return 2}})
    .text(function(d) {return d.name})
	.call(wrap, 30)
	// .style("fill", function(d){
		// if (d.label == null) {return "Red"}
		// else {return "Black"} })
	.style("fill", "Black")
	.style("font-size", function(d){
		if (d.label == null) {return 10}
		else if (d.importance == 1) {return 30}
		else if (d.importance == 2) {return 25}	
		else if (d.importance == 3) {return 20}
		else if (d.importance == 4) {return 15}
		else {return 10}})
	// .call(d3.drag()
        // .on("start", dragstarted)
        // .on("drag", dragged)
        // .on("end", dragended));
}

function exitNodes(n) {
  n.exit().remove();
}

function enterLinks(l) {
  // l.enter().append('line')
  l.enter().insert("line", ".node")
    .attr("class", "link")
	.style("stroke-width", 4);
    // .style("stroke-width", function(d) { return d.weight; });
}

function exitLinks(l) {
  l.exit().remove();
}

function mouseover(d) {
  link.filter(function(e) {  return e.target.label == d.label || e.source.label == d.label; })
    .style('opacity',1)
    .style('stroke','red')
  var nearN = [];
  for (var i=0; i<link.length; i++) {
	  if (link[i].target.label == d.label) {nearN.push(link[i].source.label);}
	  else if (link[i].source.label == d.label) {nearN.push(link[i].target.label)}
  }
  for (var j=0; j<nearN.length; j++) {
	  node.filter(function(e) {return e.label == nearN[j].label;})
	    .style('opacity',1)
		.style('stroke','black')
  }
}

function mouseout(d) {
  link.style('stroke', "#999")
      .style('stroke-opacity', 0.8);
}

// check the dictionary to see if nodes are linked
function isConnected(a, b) {
	console.log(linkedByIndex)
	return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
}

// fade nodes on hover
function mouseOver(opacity) {
	return function(d) {
		// check all other nodes to see if they're connected
		// to this one. if so, keep the opacity at 1, otherwise
		// fade
		node.style("stroke-opacity", function(o) {
			thisOpacity = isConnected(d, o) ? 1 : opacity;
			return thisOpacity;
		});
		node.style("fill-opacity", function(o) {
			thisOpacity = isConnected(d, o) ? 1 : opacity;
			return thisOpacity;
		});
		// also style link accordingly
		link.style("stroke-opacity", function(o) {
			return o.source === d || o.target === d ? 1 : opacity;
		});
		link.style("stroke", function(o){
			return o.source === d || o.target === d ? o.source.colour : "#999";
		});
	};
}

function mouseOut() {
	node.style("stroke-opacity", 1);
	node.style("fill-opacity", 1);
	link.style("stroke-opacity", 0.8);
	link.style("stroke", "#999");
}


// select target node for new node connection
// function node_mouseover(d) {
	// d3.select(this).style("cursor", "pointer")
	
  // if (drawing_line && d !== selected_node) {
    // highlight and select target node
    // selected_target_node = d;
  // }
// }

// function node_mouseout(d) {
	// d3.select(this).style("cursor", "default")
  // d3.selectAll('.concept').on('click',null);
  // if (drawing_line) {
    // selected_target_node = null;
  // }
// }

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
	// force.stop();
	update();
	// simulation.alpha(1).restart();
	// force.start();
	
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
	  var new_node = {x: m[0], y: m[1], name: default_name, group: 1, weight: 1, label:nn, Parent:null, Children:[], addTime:t, modifiedTime:null, penaltyT:1, penaltyL:0, dis:0, stringL:L*3.9, importance: 1};
	  console.log(new_node)
	  nodes.push(new_node);
	  connectedNodes.push(new_node)
	  console.log(connectedNodes)
	}
	selected_link = null;
	// force.stop();
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
			
			var imp = 0;
			while (nodes[childNode].Parent != null) {
				for (var i=0; i<nodes.length; i++) {
					if (nodes[i].label != null && nodes[i].label == nodes[childNode].Parent) {
						nodes[i].dis = nodes[i].dis + 1;
						childNode = i;
						imp ++;}
				}
			}
			nodes[nodes.length-1].importance = nodes[nodes.length-1].importance + imp;
			console.log(nodes)
			console.log(links)
		// }
	}
	update();
	timeCounter = setInterval(timeElapse, 2000);
	d.fixed = false;
	// simulation.alpha(1).restart();
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
  // force.stop()
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
  // force.stop();
  update();
  // force.start();
  
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
  // force.stop();
  update();
  // force.start();
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
  // force.start();
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
   clearInterval(timeCounter);
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
	var Qnodes = [];
	var totalLineage = 0;
	for (var i=0; i<nodes.length; i++) {
		if (nodes[i].penaltyT != null) {
			nodes[i].penaltyT = nodes[i].penaltyT - 0.08;
			totalLineage = totalLineage + nodes[i].dis;
			console.log(nodes[i].penaltyT)
			if (nodes[i].penaltyT < 0) {nodes[i].penaltyT = 0;}
		}
		else {Qnodes.push(nodes[i]);}
	}
	
	if (computerStop == false && Qnodes.length < 5) {
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
		// dy = 2;
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
	  console.log(word)
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
		console.log(line)
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

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function collide(node) {
  // var r = node.stringL + 16,
  var r = node.stringL + 100,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.stringL + quad.point.stringL + 100;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}