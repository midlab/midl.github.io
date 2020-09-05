var selected = [], isSelected = [];
var computed = [];
var c = -1;
var Qnodes = [];
var Cnodes = [];
function computeSug(){
	// console.log(Cnodes)
	if (nodes.length > 0){
		c = c+1;
		if (nodes[c].group == 1) {
			var v = nodes[c].name;
			Cnodes.push(nodes[c]);
			}
		else {
			Qnodes.push(c)
			c = c+1;
			var v = nodes[c].name;
			Cnodes.push(nodes[c]);
			}
		// var v = nodes[c].name;
		// var v = Cnodes[c].name;
		computed.push(v);
		var addressConcept = 'http://api.conceptnet.io/c/en/'+ v +'?offset=0&limit=1000';
		// var addressConcept = 'http://anyorigin.com/go?url=http%3A//api.conceptnet.io/c/en/'+ v +'%3Foffset%3D0%26limit%3D500&callback=?';
		runAjax(addressConcept);
	}
}

function runAjax(input){
	$.ajax({
			url: input,
			type: 'GET',
			async: false,
			dataType: "json",
			success: parseAll
		});
}

var t = -1;
var terms = [];
var label = [], term = [], termRels = [];
function parseAll(data){
	// alert(JSON.stringify(data));
	console.log(data)
	// console.log(JSON.stringify(data))
	// console.log(data.edges[1].start.label)
	term = [];
	termRels = [];
	var arrayFilter = [];
	var uniqueIndex = [];
	for (var i=0; i<data.edges.length; i++){
	// for (var i=0; i<data.contents.edges.length; i++){
		if (data.edges[i].start.language == 'en' && data.edges[i].end.language == 'en'){
			if (data.edges[i].start.label == sss[sss.length-1]) { 
				// console.log(data.contents.edges[i].start.label)
				// console.log(sss[sss.length-1])
				var temp = {"label":(data.edges[i].rel.label),"term":(data.edges[i].end.label),"endSearch":(data.edges[i].end.term),"weight":(data.edges[i].weight)};
				arrayFilter.push(data.edges[i].rel.label + data.edges[i].end.label);
				label.push(data.edges[i].rel.label);
				term.push(data.edges[i].end.label);
				termRels.push(temp);}
			else if (data.edges[i].start.label != sss[sss.length-1]) {
				// console.log(data.contents.edges[i].start.label)
				// console.log(sss[sss.length-1])
				var temp = {"label":(data.edges[i].rel.label),"term":(data.edges[i].start.label),"endSearch":(data.edges[i].start.term),"weight":(data.edges[i].weight)};
				arrayFilter.push(data.edges[i].rel.label + data.edges[i].start.label);
				label.push(data.edges[i].rel.label);
				term.push(data.edges[i].start.label);
				termRels.push(temp);
			}
		} 
	}
	var uniqueLabels = [];
	$.each(arrayFilter, function(i, el){
		if($.inArray(el, uniqueLabels) === -1) {
			uniqueLabels.push(el);
			uniqueIndex.push(i);
		}	
	});

	var tempTerm = [];
	var tempArray = [];
	for (var i=0; i<uniqueIndex.length; i++) {
		tempArray.push(termRels[uniqueIndex[i]]);
		tempTerm.push(term[uniqueIndex[i]]);
	}
	termRels = tempArray;
	term = tempTerm;
	// console.log(term);
	// console.log(termRels)
	t++;
	// OpenOthersList();
	computeWeiRel();
}

function OpenOthersList(){
	if (t>0){
		d3.selectAll('#wordList').remove();
		d3.selectAll('#otherTermList').remove();
	}
	var list = d3.selectAll('#tools').data(term)
		.enter().append('p')
		.attr('id','wordList')
		.attr('class', 'listPosition')
		.style('color', 'black')
		.text(function(d, i) {return term[i];})
		// .attr("font-family", "sans-serif")
		.on('mouseover', function() {
				d3.select(this).style('color','red')
				d3.select(this).style("cursor", "pointer")
			})
		.on('mouseout', function () {
				d3.select(this).style('color', 'black')
				d3.select(this).style("cursor", "default")
			})
		.on("contextmenu",function(d,i) {
			// m = d3.mouse(svg.node())
			// default_name = term[t][i];
			default_name = term[i];
			if (default_name == null) {}
			else {
			  nodes.push({x: 50, y: 50, name: default_name, group: 1, weight: 1});
			  // Cnodes.push({x: 50, y: 50, name: default_name, group: 1, weight: 1});
			}
			// nodes.push({x: m[0], y: m[1], name: default_name + " " + nodes.length, group: 1});
			// nodes.push({x: m[0], y: m[1], name: default_name, group: 1, weight: 1});
			selected_link = null;
			force.stop();
			update();
			force.start();
			});
}

var RelType = ['IsA', 'PartOf', 'HasA', 'UsedFor', 'CapableOf', 'AtLocation', 'Causes', 'HasSubevent'];
var weiList = [];
function computeWeiRel(){
	var w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0, w6 = 0, w7 = 0, w8 = 0, wei = [];
	var nw1 = 0, nw2 = 0, nw3 = 0, nw4 = 0, nw5 = 0, nw6 = 0, nw7 = 0, nw8 = 0;
	for (var i=0; i<termRels.length; i++){
		if (termRels[i].label == 'IsA'){
			w1 = w1 + termRels[i].weight;
			nw1 = nw1+1;
			// console.log(w1)
			}
		else if (termRels[i].label == 'PartOf') {
			w2 = w2 + termRels[i].weight;
			nw2 = nw2+1;
			// console.log(w2)
			}
		else if (termRels[i].label == 'HasA') {
			w3 = w3 + termRels[i].weight;
			nw3 = nw3+1;}
		else if (termRels[i].label == 'UsedFor') {
			w4 = w4 + termRels[i].weight;
			nw4 = nw4+1;}
		else if (termRels[i].label == 'CapableOf') {
			w5 = w5 + termRels[i].weight;
			nw5 = nw5+1;}
		else if (termRels[i].label == 'AtLocation') {
			w6 = w6 + termRels[i].weight;
			nw6 = nw6+1;}
		else if (termRels[i].label == 'Causes') {
			w7 = w7 + termRels[i].weight;
			nw7 = nw7+1;}
		else if (termRels[i].label == 'HasSubevent') {
			w8 = w8 + termRels[i].weight;
			nw8 = nw8+1;}
	}
	
	for (var i=0; i<RelType.length; i++){
		var ii = i+1;
		// wei[i] = eval('w'+ii) / eval('nw'+ii);
		wei[i] = {avgW: eval('w'+ii) / eval('nw'+ii), totalW: eval('w'+ii), haveSearch: false};
	}
	var l = weiList.length;
	weiList[l] = wei;
	// weiList[c] = wei;
	// console.log(weiList)
	var threshold = c+1;
	// console.log(Cnodes)
	// console.log(c)
	if (weiList.length == threshold && nodes.length > threshold){
		c = c+1;
		var v = nodes[c].name;
		Cnodes.push(nodes[c]);
		computed.push(v);
		var addressConcept = 'http://api.conceptnet.io/c/en/'+ v +'?offset=0&limit=1000';
		// var addressConcept = 'http://anyorigin.com/go?url=http%3A//api.conceptnet.io/c/en/'+ v +'%3Foffset%3D0%26limit%3D600&callback=?';
		runAjax(addressConcept);
		}
	else if (nodes.length == threshold){writeSug(weiList)}
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }
	
	var max = arr[0][0].avgW;
	var maxIndex = [0,0];
	for (var i=0; i<arr.length; i++){
		var tempArr = arr[i];
		// var max = arr[i][0];
		// var maxIndex = [0,0];
		
		for (var j = 1; j < arr[i].length; j++) {
			if (arr[i][j].avgW > max && arr[i][j].haveSearch == false) {
				maxIndex = [i,j];
				max = arr[i][j].avgW;
				}
		}
	}
	
    console.log(maxIndex)
	console.log(max)
    return maxIndex;
}

var Q = [];
function writeSug(input){
	var I = indexOfMax(input);
	weiList[I[0]][I[1]].haveSearch = true;
	weiList[I[0]][I[1]].avgW = weiList[I[0]][I[1]].avgW-1;
	// console.log(weiList)
	var sugW = Cnodes[I[0]].name;
	var sugRel = RelType[I[1]];
	var my_string = "what is " + sugW + " " + sugRel + " ?";
	console.log(my_string)
	Q.push(I[0]);
	
	// document.getElementById("helpBar").innerHTML = my_string;
	// document.getElementById("sentence").innerHTML = my_string;
	// $("#dialog").dialog("open");
	var new_node = {x: 50, y: 50, name: my_string, group: 2, weight: 1, hasSearched: false, label:null, Parent:null, Children:null};
	// console.log(nodes)
    // $("#dialog").dialog('close');
	nodes.push(new_node);
	selected_link = null;
	force.stop();
	update();
	force.start();
	
	// console.log(Cnodes[Q[Q.length-1]])
	links.push({source: Cnodes[Q[Q.length-1]], target: new_node, value: 1});
	update();
	force.start();
	
}

$("#dialog").dialog({
    autoOpen: false,
    show: {
        // effect: "blind",
        // duration: 1000
    },
    hide: {
        effect: "explode",
        duration: 1000
    }
});

$('.newConcept').on('click', function () {
    // $('.myTarget').text($('.myInput').val());
	var cc = $('.userInput').val();
	console.log(cc)
	// console.log(nodes[Q[Q.length-1]].x)
	// console.log(nodes[Q[Q.length-1]].y)
	var new_node = {x: 50, y: 50, name: cc, group: 1, weight: 1, hasSearched: false};
	console.log(nodes)
    $("#dialog").dialog('close');
	nodes.push(new_node);
	selected_link = null;
	force.stop();
	update();
	force.start();
	
	links.push({source: nodes[Q[Q.length-1]], target: new_node, value: 1});
	update();
	force.start();
	// computeSug();
});

