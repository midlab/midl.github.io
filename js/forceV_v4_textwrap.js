// var width = 1860,
var width = window.screen.availWidth-57,
    // height = 780,
	height = window.screen.availHeight-310,
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

// console.log(window.screen.availHeight)
// console.log(window.screen.availWidth)
// console.log(width)
// console.log(height)

const forceX = d3.forceX(width / 2).strength(0.015)
const forceY = d3.forceY(height / 2).strength(0.015)

var simulation = d3.forceSimulation(nodes)
	.force("charge", d3.forceManyBody().strength(-300))
    // .force("link", d3.forceLink(links).distance(100))
	.force("link", d3.forceLink(links).distance(function(d) {return d.linkdis;}))
    // .force("x", d3.forceX())
    // .force("y", d3.forceY())
	// .force("collide", d3.ellipseForce(6, 0.5, 5))
	// .force("x", forceX)
    // .force("y", forceY)
	// .force("collide", d3.forceCollide().radius(function(d){
      // if(d === root){return Math.random() * 50 + 100;
	  // if(d === root){return Math.random() * 20;}
      // return d.stringL + 10;}).iterations(2))
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

var textBound = 150;
var linkedByIndex = {}; // build a dictionary of nodes that are linked
var node,link;
function update() {
  // linkedByIndex = {};
  // links.forEach(function(d) {
	  // linkedByIndex[d.source.index + "," + d.target.index] = 1;
  // });
  
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
  
  // var box = node.selectAll('ellipse').node().getBBox();
  // console.log(box)
  
  
  // node.select("ellipse").attr("rx", function(d) { 
		// if (d.label == null) {return d.stringL-20}
		// else if (d.importance == 1) {return d.stringL*2}
		// else if (d.importance == 2) {return d.stringL*1.8}	
		// else if (d.importance == 3) {return d.stringL*1.5}
		// else if (d.importance == 4) {return d.stringL*1.2}
		// else {return d.stringL}});
  // node.select("ellipse").attr("rx", function(d) {
	  // console.log(this.parentNode.getBBox());
	  // if (this.parentNode.getBBox().width > textBound) {return textBound/2;}
	  // else {return this.parentNode.getBBox().width/2;}})
  node.select("ellipse").attr("rx", function(d) {
	  if (d.label == null && d.line == 1) {return d.stringL-20}
	  else if (d.label == null && d.line > 1) {return 80}
	  else if (d.importance == 1) {return d.stringL*2}
	  else if (d.importance == 2 && d.line == 1) {return d.stringL*1.8}
	  else if (d.importance == 3 && d.line == 1) {return d.stringL*1.5}
	  else if (d.importance == 4 && d.line == 1) {return d.stringL*1.2}
	  else if (d.importance > 4 && d.line == 1) {return d.stringL}
	  else if (d.line > 1) {return 80}
  })
  // node.select("ellipse").attr("ry", function(d) { 
		// if (d.label == null) {return 11}
		// else if (d.importance == 1) {return 21}
		// else if (d.importance == 2) {return 20}	
		// else if (d.importance == 3) {return 17}
		// else if (d.importance == 4) {return 14}
		// else {return 11}});
  // node.select("ellipse").attr("ry", function(d) {
	  // if (d.label == null) {return 11}
	  // else if (d.importance == 1) {return 21}
	  // else if (d.importance == 2) {return 20 + (d.line-1)*20/1.4}
	  // else if (d.importance == 3) {return 17 + (d.line-1)*17/1.4}
	  // else if (d.importance == 4) {return 14 + (d.line-1)*14/1.4}
      // else {return 11 + (d.line-1)*11/1.4}});
  node.select("ellipse").attr("ry", function(d) {
	  // console.log(this.parentNode.getBBox());
	  // if (d.importance == 1) {return this.parentNode.getBBox().height/2;}
	  if (d.importance == 1) {return 60;}
	  else if (d.importance == 2) {return 20 + (d.line-1)*20}
	  else if (d.importance == 3) {return 17 + (d.line-1)*17}
	  else if (d.importance == 4) {return 14 + (d.line-1)*14}
	  else {return 11 + (d.line-1)*11}});
  // node.select("ellipse").attr("ry", function(d) {
	  // console.log(this.parentNode.getBBox());
	  // if (d.importance == 1 || d.importance == 2) {return this.parentNode.getBBox().height/2;}
	  // else if (d.importance == 3) {return this.parentNode.getBBox().height/2.2;}
	  // else if (d.importance == 4) {return this.parentNode.getBBox().height/2.5;}
	  // else {return this.parentNode.getBBox().height/3;}});
  node.select("ellipse").style("stroke", function(d) { 
		if (d.label == null) {return "#66FFFF"}
		else if (d.importance == 1) {return "#6600CC"}
		else if (d.importance == 2) {return "#6633FF"}	
		else if (d.importance == 3) {return "#6666FF"}
		else if (d.importance == 4) {return "#6699FF"}
		else {return "#66CCFF"}});
  node.select("ellipse").attr('transform', function(d) {
	  if (d.importance == 1) {return "translate(0," + 14*(d.line-1) + ")"}
	  else if (d.line > 1 && d.importance == 2) {return "translate(0," + 12*(d.line-1) + ")"}
	  else if (d.line > 1 && d.importance == 3) {return "translate(0," + 10*(d.line-1) + ")"}
	  else if (d.line > 1 && d.importance == 4) {return "translate(0," + 8*(d.line-1) + ")"}
	  else if (d.line > 1 && d.importance > 4) {return "translate(0," + 5*(d.line-1) + ")"}
	  else if (d.line == 1 || d.label == null) {return "translate(0,0)"}});
	  // else if (d.line == 1 || d.label == null) {return "translate(0,0)"}});
  node.select("text").text(function(d) {return d.name});
  node.select("text").style("font-size", function(d){
		if (d.label == null) {return 10}
		else if (d.importance == 1) {return 30}
		else if (d.importance == 2) {return 25}	
		else if (d.importance == 3) {return 20}
		else if (d.importance == 4) {return 15}
		else {return 10}});
  // node.select("text").attr("dy", function(d){
		// if (d.label == null) {return 2}
		// else if (d.importance == 1) {return 8}
		// else if (d.importance == 2) {return 6+10}
		// else if (d.importance == 3) {return 4}
		// else if (d.importance == 4) {return 3}
		// else {return 2}});
  // node.select("text").style("fill", function(d){
		// if (d.label == null) {return "Red"}
		// else {return "Black"} });
  // node.select('text').attr('x', function(d){return d.x/10})
  // node.select('text').attr('y', function(d){return this.getBBox().y/8})
  node.select("text").call(wrap, textBound);

  simulation.on("tick", function(e) {
	// var nodes = simulation.nodes();
	// var q = d3.quadtree().x(function(d) {return d.x}).y(function(d) {return d.y}).addAll(nodes),
      // i = 0,
      // n = nodes.length;

    // while (++i < n) q.visit(collide(nodes[i]));
	
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
  linkedByIndex = {};
  links.forEach(function(d) {
	  linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });
}

function enterNodes(n) {
  var g = n.enter().append("g")
    .attr("class", "node")
	// .selectAll("circle")
	.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";});

  g.append("ellipse")
	// .attr('r', 10)
	.attr("rx", 10)
	.attr("ry", 10)
	// .attr("rx", function(d) { 
		// if (d.label == null) {return d.stringL-20}
		// else if (d.importance == 1) {return d.stringL*2}
		// else if (d.importance == 2) {return d.stringL*1.8}	
		// else if (d.importance == 3) {return d.stringL*1.5}
		// else if (d.importance == 4) {return d.stringL*1.2}
		// else {return d.stringL}})
    // .attr("ry", function(d) { 
		// if (d.label == null) {return 11}
		// else if (d.importance == 1) {return 21}
		// else if (d.importance == 2) {return 20}	
		// else if (d.importance == 3) {return 17}
		// else if (d.importance == 4) {return 14}
		// else {return 11}})
	// .attr("r", function(d) {return d.stringL})
	// .attr('transform', "translate(0,10)")
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
    // .attr("dy", function(d){
		// if (d.label == null) {return 2}
		// else if (d.importance == 1) {return 8}
		// else if (d.importance == 2) {return 6+10}
		// else if (d.importance == 3) {return 4}
		// else if (d.importance == 4) {return 3}
		// else {return 2}})
    .text(function(d) {return d.name})
	.call(wrap, textBound)
	// .attr('x', function(d){return d.x/10})
	// .attr('y', function(d){return d.y/20})
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
	// var box = g.selectAll('ellipse').parentNode.getBBox();
    // console.log(box)
	// console.log(textLine);
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
	// console.log(linkedByIndex)
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
			console.log(linkedByIndex)
			return thisOpacity;
		});
		node.style("fill-opacity", function(o) {
			thisOpacity = isConnected(d, o) ? 1 : opacity;
			// console.log(linkedByIndex)
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
	// console.log(d.name)
	connectedNodes.push(d);
	// console.log(connectedNodes)
	selected_link = null;
	// force.stop();
	update();
	// simulation.alpha(1).restart();
	// force.start();
	console.log(isComputing)
	if (connectedNodes[0].label == null) {openDialog();}
	else if (isComputing == false) {
	ideaDialog();
	// var lineCount = 1;
	// default_name = ideaValue;
	// console.log(default_name)
	// default_name = getValue();
	// var m = [];
	// m[0] = Math.max(0, Math.min(width, connectedNodes[0].x));
	// m[1] = Math.max(0, Math.min(height, connectedNodes[0].y));
	// if (default_name == null) {}
	// else {
	  // var nn;
	  // for (var i=0; i<nodes.length; i++){
		  // if (nodes[i].label != null) {nn = nodes[i].label+1}
	  // }
	  // var t = Date.now();
	  // var L = default_name.length;
	  // w = getTextWidth(default_name);
	  // console.log(w)
	  // var new_node = {x: m[0], y: m[1], name: default_name, group: 1, weight: 1, label:nn, Parent:null, Children:[], addTime:t, modifiedTime:null, penaltyT:1, penaltyL:0, dis:0, stringL:L*3.9, importance: 1, line: lineCount};
	  // console.log(new_node)
	  // nodes.push(new_node);
	  // connectedNodes.push(new_node)
	  // console.log(connectedNodes)
	// }
	// selected_link = null;
	// update();
	// if (connectedNodes.length==2){
		// var x_new = Math.max(0, Math.min(width, connectedNodes[1].x));
		// var y_new = Math.max(0, Math.min(height, connectedNodes[1].y));
		// var dx = connectedNodes[0].x - x_new;
		// var dy = connectedNodes[0].y - y_new;
		// var parentNode, childNode;
			// var d = link_distance+(connectedNodes[0].line-1)*20*Math.max(0, 4-connectedNodes[0].importance);
			// links.push({source: connectedNodes[0], target: connectedNodes[1], value: 1, linkdis: d});
			// if (connectedNodes[0].label == 0) {
				// for (var i=0; i<nodes.length; i++) {
					// if (connectedNodes[0].label == nodes[i].label) {
						// nodes[i].Children.push(connectedNodes[1].label);
						// var t = Date.now();
						// nodes[i].modifiedTime = t;
						// nodes[i].penaltyT = 1;
						// parentNode = i;
					// }
					// else if (connectedNodes[1].label == nodes[i].label) {nodes[i].Parent=connectedNodes[0].label; childNode = i;}
				// }
			// }
			// else if (connectedNodes[0].Parent != null) {
				// for (var i=0; i<nodes.length; i++) {
					// if (connectedNodes[0].label == nodes[i].label) {
						// nodes[i].Children.push(connectedNodes[1].label);
						// var t = Date.now();
						// nodes[i].modifiedTime = t;
						// nodes[i].penaltyT = 1;
						// parentNode = i;
					// }
					// else if (connectedNodes[1].label == nodes[i].label) {nodes[i].Parent=connectedNodes[0].label; childNode = i;}
				// }
			// }
			
			// var imp = 0;
			// while (nodes[childNode].Parent != null) {
				// for (var i=0; i<nodes.length; i++) {
					// if (nodes[i].label != null && nodes[i].label == nodes[childNode].Parent) {
						// nodes[i].dis = nodes[i].dis + 1;
						// childNode = i;
						// imp ++;}
				// }
			// }
			// nodes[nodes.length-1].importance = nodes[nodes.length-1].importance + imp;
			// var wordCount = default_name.split(' ').length;
			// w = getTextWidth(default_name, nodes[nodes.length-1].importance);
			// lineCount = Math.ceil(w/textBound);
			// var lineCount = (w/textBound) + 1;
			// nodes[nodes.length-1].line = lineCount;
			// links[links.length-1].linkdis = links[links.length-1].linkdis + (nodes[nodes.length-1].line-1)*20*Math.max(0, 4-nodes[nodes.length-1].importance);
		// }
	// }
	// console.log(links[links.length-1].linkdis)
	// update();
	// timeCounter = setInterval(timeElapse, 2000);
	// $("#userInput").val('');
	// d.fixed = false;
	// simulation.alpha(1).restart();
	// force.start();
	}
}

function dblNode() {
	var lineCount = 1;
	default_name = ideaValue;
	console.log(default_name)
	// default_name = getValue();
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
	  // w = getTextWidth(default_name);
	  // console.log(w)
	  var new_node = {x: m[0], y: m[1], name: default_name, group: 1, weight: 1, label:nn, Parent:null, Children:[], addTime:t, modifiedTime:null, penaltyT:1, penaltyL:0, dis:0, stringL:L*3.9, importance: 1, line: lineCount};
	  // console.log(new_node)
	  nodes.push(new_node);
	  connectedNodes.push(new_node)
	  // console.log(connectedNodes)
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
		// console.log(dx)
		// console.log(dy)
		var parentNode, childNode;
		// if (Math.sqrt(dx * dx + dy * dy) > 10) {
			var d = link_distance+(connectedNodes[0].line-1)*20*Math.max(0, 4-connectedNodes[0].importance);
			links.push({source: connectedNodes[0], target: connectedNodes[1], value: 1, linkdis: d});
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
			var wordCount = default_name.split(' ').length;
			// console.log(wordCount)
			w = getTextWidth(default_name, nodes[nodes.length-1].importance);
			// console.log(w)
			lineCount = Math.ceil(w/textBound);
			// var lineCount = (w/textBound) + 1;
			nodes[nodes.length-1].line = lineCount;
			links[links.length-1].linkdis = links[links.length-1].linkdis + (nodes[nodes.length-1].line-1)*20*Math.max(0, 4-nodes[nodes.length-1].importance);
			// console.log(nodes)
			// console.log(links)
		// }
	}
	console.log(links[links.length-1].linkdis)
	update();
	timeCounter = setInterval(timeElapse, 2000);
	$("#ideaInput").val('');
	d.fixed = false;
	// simulation.alpha(1).restart();
	// force.start();
};

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
   // console.log(retVal)
   return retVal;
   // document.write("You have entered : " + retVal);
}

function ColorNode(){
	  document.getElementById("ColorPicker").focus();
	  document.getElementById("ColorPicker").click();
	  // console.log(document.getElementById("ColorPicker").value)
	  node_color = true;
}

var slider1 = document.getElementById("timeRange");
var slider2 = document.getElementById("lineageRange");
var timeCounter = setInterval(timeElapse, 2000);
var TglobalThreshold = slider1.value*0.1;
var LglobalThreshold = slider2.value*0.1;
var nOverThreshold = [];
var computerStop = false;
var sliderData = [{thresholdT: TglobalThreshold, thresholdL: LglobalThreshold, time: Date.now()}];

slider1.oninput = function() {
  // clearInterval(timeCounter);
  TglobalThreshold = this.value*0.1;
  var t = Date.now();
  sliderData.push({thresholdT: TglobalThreshold, thresholdL: LglobalThreshold, time: t});
  // timeCounter = setInterval(timeElapse, f);
}

slider2.oninput = function() {
  // clearInterval(timeCounter);
  LglobalThreshold = this.value*0.1;
  var t = Date.now();
  sliderData.push({thresholdT: TglobalThreshold, thresholdL: LglobalThreshold, time: t});
  // timeCounter = setInterval(timeElapse, f);
}

function sugStop() {
	if (computerStop == true) {computerStop = false;}
	else if (computerStop == false) {computerStop = true;}
}

var ranks;
function timeElapse() {
	console.log(sliderData)
	console.log(TglobalThreshold)
	console.log(LglobalThreshold)
	// globalThreshold = f;
	computed = [];
	var selectedN = [];
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
					// var penalty = [nodes[i].penaltyT,nodes[i].penaltyL]
					// var p = Math.min(...penalty);
					console.log(TglobalThreshold)
					console.log(LglobalThreshold)
					console.log(nodes)
					// var penalty = [TglobalThreshold,LglobalThreshold]
					// var p = Math.min(...penalty);
					// if (LglobalThreshold > TglobalThreshold) {
						// if (nodes[i].penaltyL <= LglobalThreshold) {nOverThreshold.push(nodes[i]);}
					// }
					if (nodes[i].penaltyT < (1-TglobalThreshold) || nodes[i].penaltyL <= LglobalThreshold) {
						nOverThreshold.push(nodes[i]);
						if (((1-TglobalThreshold)-nodes[i].penaltyT) >= 0 && (LglobalThreshold-nodes[i].penaltyL) >= 0) {
							var arr_p = [((1-TglobalThreshold)-nodes[i].penaltyT),(LglobalThreshold-nodes[i].penaltyL)];
							var p = Math.min(...arr_p);
							selectedN.push(p);
							}
						else if (((1-TglobalThreshold)-nodes[i].penaltyT) >= 0 && (LglobalThreshold-nodes[i].penaltyL) < 0) {
							selectedN.push(((1-TglobalThreshold)-nodes[i].penaltyT));
							}
						else if (((1-TglobalThreshold)-nodes[i].penaltyT) < 0 && (LglobalThreshold-nodes[i].penaltyL) >= 0) {selectedN.push((LglobalThreshold-nodes[i].penaltyL));}
					}
					// if (nodes[i].Parent != null && p < globalThreshold) {nOverThreshold.push(nodes[i]);}
					// else if (nodes[i].Parent == null) {
						// if (nodes[i].penaltyT < globalThreshold) {nOverThreshold.push(nodes[i]);}
					// }
				}
				console.log(nOverThreshold)
			}
			if (nOverThreshold.length > 0 && nOverThreshold.length < 11) {computeSug();}
			else if (nOverThreshold.length > 11) {
				var sorted = selectedN.slice().sort(function(a, b){return b-a});
				ranks = selectedN.slice().map(function(v){ return sorted.indexOf(v)+1 });
				ranks.forEach(f);
				// if (nOverThreshold.length > 10) {nOverThreshold.slice(0, 10);}
				// console.log(nOverThreshold);
				computeSug();
			}
		}
	}
	else {}
}

function f(entry) {
	if (entry > 10) {
		var index = ranks.indexOf(entry);
		nOverThreshold.splice(index,1);
	} 
}

var textLine = [];
var textSpan = [];
function wrap(text, width) {
  textLine = [];
  text.each(function() {
	var nLine = 1;
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        // lineHeight = 1.1, // ems
		lineHeight = 0.7, // ems
        y = text.attr("y"),
		dy = 0.3;
        // dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
	  // console.log(word)
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
		// console.log(line)
		nLine = nLine + 1;
      }
    }
    textLine.push(nLine)
  });
  // console.log(textLine)
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
				// console.log(c)
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

function getTextWidth(str,imp) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext("2d");
	if (imp == 1 || imp == 2) {ctx.font = "25px Cursive";}
	else if (imp == 3) {ctx.font = "20px Cursive";}
	else if (imp == 4) {ctx.font = "15px Cursive";}
	else if (imp > 4 || imp ==  null) {ctx.font = "10px Cursive";}
	// ctx.font = "25px Cursive";        
	var w = ctx.measureText(str).width;
	return w;
}

function ideaDialog() {
	// document.getElementById("sentence").innerHTML = connectedNodes[0].name;
	$("#newConcept").dialog("open");
	clearInterval(timeCounter);
	simulation.stop();
}

var ideaValue;
$("#newConcept").dialog({
    autoOpen  : false,
    modal     : true,
    title     : "Input Dialog",
    buttons   : {
              'OK' : function() {
                  ideaValue = $('#ideaInput').val();
				  $(this).dialog('close');
				  console.log(ideaValue)
				  dblNode();
				  // $("#userInput").val('');
                  // alert('The value of the text box is ' + textValue);
                  //Now you have the value of the textbox, you can do something with it, maybe an AJAX call to your server!
              },
              'Close' : function() {
                  // alert('The Close button was clicked');
                  $(this).dialog('close');
				  timeCounter = setInterval(timeElapse, 2000);
				  $("#ideaInput").val('');
				  simulation.alpha(1).restart();
              },
	}
});

function encode( s ) {
    var out = [];
    for ( var i = 0; i < s.length; i++ ) {
        out[i] = s.charCodeAt(i);
    }
    return new Uint8Array( out );
}

var button = document.getElementById( 'save' );
button.addEventListener( 'click', function() {
    
    var Ndata = encode( JSON.stringify(nodes, null, 4) );

    var blob = new Blob( [ Ndata ], {
        type: 'application/octet-stream'
    });
    
    url = URL.createObjectURL( blob );
    var link = document.createElement( 'a' );
    link.setAttribute( 'href', url );
    link.setAttribute( 'download', 'nodes.json' );
    
    var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent( event );
	
	var Ldata = encode( JSON.stringify(links, null, 4) );

    var blob = new Blob( [ Ldata ], {
        type: 'application/octet-stream'
    });
    
    url = URL.createObjectURL( blob );
    var link = document.createElement( 'a' );
    link.setAttribute( 'href', url );
    link.setAttribute( 'download', 'links.json' );
    
    var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent( event );
	
	var Sdata = encode( JSON.stringify(sliderData, null, 4) );

    var blob = new Blob( [ Sdata ], {
        type: 'application/octet-stream'
    });
    
    url = URL.createObjectURL( blob );
    var link = document.createElement( 'a' );
    link.setAttribute( 'href', url );
    link.setAttribute( 'download', 'sliders.json' );
    
    var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent( event );
	
	var LLLdata = encode( JSON.stringify(linkArray, null, 4) );

    var blob = new Blob( [ LLLdata ], {
        type: 'application/octet-stream'
    });
    
    url = URL.createObjectURL( blob );
    var link = document.createElement( 'a' );
    link.setAttribute( 'href', url );
    link.setAttribute( 'download', 'modifiedLinks.json' );
    
    var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent( event );
});

