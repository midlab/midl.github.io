var selected = [], isSelected = [];
var computed = [];
var Qnodes = [];
var Cnodes = [];
var c, cc;
var stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves"];
function computeSug(){
	// console.log(Cnodes)
	c = -1;
	cc = 0;
	console.log(nOverThreshold)
	c = c+1;
	var v = nOverThreshold[c].name;
	var pstr = processString(v);
	console.log(pstr)
	computed.push(pstr);
	if (computed.length > 1) {
		var addressConcept = 'http://api.conceptnet.io/c/en/'+ computed[cc] +'?offset=0&limit=1000';
		runAjax(addressConcept);
		cc++;
	} else if (computed.length == 1) {
		var addressConcept = 'http://api.conceptnet.io/c/en/'+ computed[cc] +'?offset=0&limit=1000';
		runAjax(addressConcept);
		cc++;
	}
}

function processString(str){
	// var str = "Big Brother";
	if (str.split(" ").length > 1) {
		// at least 2 strings
		// var stopwords = ['this'];

		var words = str.split(/\W+/).filter(function(token) {
			token = token.toLowerCase();
			return token.length >= 2 && stopwords.indexOf(token) == -1;
		});
		return words;
	}
	else {return str;}
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
var weiList = [], tempWeiList = [];
function computeWeiRel(){
	var check = 0;
	console.log(weiList)
	console.log(tempWeiList)
	if (weiList.length > 0) {
		var length = getDim(weiList);
		var numCol = length[0]*length[1]/8;
		console.log(numCol)
		for (var i=0; i<numCol; i++) {
			console.log(weiList[i][0])
			console.log(weiList[i][0].l)
			if (weiList[i][0].l == nOverThreshold[c].label) {
				tempWeiList.push(weiList[i]);
				check = check+1;}
		}
	}
	
	if (check == 0){
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
				// if (nOverThreshold[c].penalty > 0){
					// wei[i] = {n: nOverThreshold[c].name, Rel: RelType[i], l: nOverThreshold[c].label ,avgW: (eval('w'+ii) / eval('nw'+ii))*(1-nOverThreshold[c].penalty), totalW: eval('w'+ii), haveSearch: false};
				// }
				// else {
					// wei[i] = {n: nOverThreshold[c].name, Rel: RelType[i], l: nOverThreshold[c].label ,avgW: eval('w'+ii) / eval('nw'+ii), totalW: eval('w'+ii), haveSearch: false};
				// }
				// wei[i] = {n: nOverThreshold[c].name, Rel: RelType[i], l: nOverThreshold[c].label, avgW: eval('w'+ii) / eval('nw'+ii), totalW: eval('w'+ii), haveSearch: false};
				wei[i] = {n: computed[cc-1], Rel: RelType[i], l: nOverThreshold[c].label, avgW: eval('w'+ii) / eval('nw'+ii), totalW: eval('w'+ii), haveSearch: false};

			}
			
			// console.log(nOverThreshold[c].penalty)
			// if (nOverThreshold[c].penalty > 0) {wei = wei*(1-nOverThreshold[c].penalty);}
			var l = weiList.length;
			weiList[l] = wei;
			tempWeiList.push(weiList[l]);
	}

	// weiList[c] = wei;
	// console.log(weiList)
	var threshold = c+1;
	if (computed.length > cc) {
		var addressConcept = 'http://api.conceptnet.io/c/en/'+ computed[cc] +'?offset=0&limit=1000';
		runAjax(addressConcept);
		cc++;
	}
	else if (computed.length == cc) {
		if (threshold < nOverThreshold.length) {
			c = c+1;
			var v = nOverThreshold[c].name;
			var pstr = processString(v);
			console.log(pstr)
			computed.push(pstr);
			// computed.push(v);
			var addressConcept = 'http://api.conceptnet.io/c/en/'+ computed[cc] +'?offset=0&limit=1000';
			runAjax(addressConcept);
			cc++;
		}
		else if (threshold == nOverThreshold.length){writeSug(tempWeiList)}
	}
	// if (threshold < nOverThreshold.length){
		// c = c+1;
		// var v = nOverThreshold[c].name;
		// Cnodes.push(nodes[c]);
		// computed.push(v);
		// var addressConcept = 'http://api.conceptnet.io/c/en/'+ v +'?offset=0&limit=1000';
		// runAjax(addressConcept);
		// }
	// else if (threshold == nOverThreshold.length){writeSug(tempWeiList)}
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
	console.log(I)
	tempWeiList[I[0]][I[1]].haveSearch = true;
	// weiList[I[0]][I[1]].avgW = weiList[I[0]][I[1]].avgW-1;
	console.log(tempWeiList)
	var sugW = tempWeiList[I[0]][I[1]].n;
	var sugRel = tempWeiList[I[0]][I[1]].Rel;
	// var sugW = nOverThreshold[I[0]].name;
	// var sugRel = RelType[I[1]];
	var my_string;
	if (sugRel == 'IsA'){
		var rr = Math.floor(Math.random() * 2);
		if (rr == 0) {my_string = "what is " + sugW + " ?";}
		else {my_string = sugW + " is a type of ?";}
		// var my_string = "what " + sugW + " is ?"
		}
	else if (sugRel == 'PartOf') {
		var rr = Math.floor(Math.random() * 3);
		if (rr == 0) {my_string = sugW + " is a part of what entity ?";}
		else if (rr == 1) {my_string = "what is " + sugW + " a part of ?";}
		else {my_string = "where is " + sugW + " typically a part of ?";}
		// var my_string = "Do you know what is part of a " + sugW + " ?";
		}
	else if (sugRel == 'HasA') {
		var rr = Math.floor(Math.random() * 3);
		if (rr == 0) {my_string = "what does " + sugW + " have ?";}
		else if (rr == 1) {my_string = "where does " + sugW + " belong to ?";}
		else {my_string = "what properties do you find in " + sugW + " ?";}
		}
		// var my_string = "What does " + sugW + " have ?";}
	else if (sugRel == 'UsedFor') {
		var rr = Math.floor(Math.random() * 3);
		if (rr == 0) {my_string = "what is " + sugW + " used for ?";}
		else if (rr == 1) {my_string = "where does " + sugW + " find usage ?";}
		else {my_string = "what purpose is " + sugW + " used for ?";}
		}
		// var my_string = "What can " + sugW + " be used for ?";}
	else if (sugRel == 'CapableOf') {
		var rr = Math.floor(Math.random() * 3);
		if (rr == 0) {my_string = "what can " + sugW + " do ?";}
		else if (rr == 1) {my_string = "where is " + sugW + " capable of doing ?";}
		else {my_string = "which tasks is  " + sugW + " capable of performing ?";}
		}
		// var my_string = "What can " + sugW + " be capable of ?";}
	else if (sugRel == 'AtLocation') {
		var rr = Math.floor(Math.random() * 3);
		if (rr == 0) {my_string = "where is " + sugW + " found ?";}
		else if (rr == 1) {my_string = "where is " + sugW + " located ?";}
		else {my_string = "where can you find  " + sugW + " ?";}
		}
		// var my_string = "What do you think " + sugW + " is located at ?";}
	else if (sugRel == 'Causes') {
		var rr = Math.floor(Math.random() * 3);
		if (rr == 0) {my_string = "what does " + sugW + " cause ?";}
		else if (rr == 1) {my_string = "what does " + sugW + " lead to ?";}
		else {my_string = "what are the effects of " + sugW + " ?";}
		}
		// var my_string = "What causes " + sugW + " ?";}
	else if (sugRel == 'HasSubevent') {
		var rr = Math.floor(Math.random() * 3);
		if (rr == 0) {my_string = "what does the event " + sugW + " comprise of ?";}
		else if (rr == 1) {my_string = "what all can happen in " + sugW + " ?";}
		else {my_string = "what actions occur in " + sugW + " ?";}
		}
		// var my_string = "What is the subevent of " + sugW + " ?";}
	console.log(my_string)
	Q.push(tempWeiList[I[0]][I[1]].l);
	
	// document.getElementById("helpBar").innerHTML = my_string;
	// document.getElementById("sentence").innerHTML = my_string;
	// $("#dialog").dialog("open");
	var s;
	for (var i=0; i<nodes.length; i++){
		if (nodes[i].label == tempWeiList[I[0]][I[1]].l) {s = i;}
	}
	var p = nodes[s].label;
	var new_node = {x: 50, y: 50, name: my_string, group: 2, weight: 1, hasSearched: false, label:null, Parent:p, Children:null, penaltyT:null, penaltyL:null};
	// console.log(nodes)
    // $("#dialog").dialog('close');
	nodes.push(new_node);
	selected_link = null;
	force.stop();
	update();
	
	links.push({source: nodes[s], target: new_node, value: 1});
	update();
	
	computePenalty();
}

var textValue;
$("#dialog").dialog({
    autoOpen  : false,
    modal     : true,
    title     : "Inspiration Dialog",
    buttons   : {
              'OK' : function() {
                  textValue = $('#userInput').val();
				  ReplaceQN();
				  timeCounter = setInterval(timeElapse, 10000);
                  // alert('The value of the text box is ' + textValue);
                  //Now you have the value of the textbox, you can do something with it, maybe an AJAX call to your server!
              },
              'Close' : function() {
                  // alert('The Close button was clicked');
                  $(this).dialog('close');
				  timeCounter = setInterval(timeElapse, 10000);
				  $("#userInput").val('');
              }
	}
});

function openDialog() {
	document.getElementById("sentence").innerHTML = connectedNodes[0].name;
	$("#dialog").dialog("open");
	clearInterval(timeCounter);
}

// var pp, nn;
function ReplaceQN() {
	var nn, childNode, deleteNode, pp;
	// var childNode, deleteNode;
	for (var i=0; i<nodes.length; i++){
		if (nodes[i].label != null) {nn = nodes[i].label+1}
	}
	
	for (var i=0; i<nodes.length; i++) {
		if (nodes[i].name == connectedNodes[0].name) {
			var t = Date.now();
			pp = nodes[i].Parent;
			deleteNode = nodes[i];
			var new_node = {x: connectedNodes[0].x, y: connectedNodes[0].y, name: textValue, group: 1, weight: 1, label:nn, Parent:pp, Children:[], addTime:t, modifiedTime:null, penaltyT:1, penaltyL:0, dis:0};
			new_node.weight =10;
			nodes.push(new_node);
			
			nodes.splice(i, 1);
			console.log(nodes)
			childNode=nodes.length-1;
			break;
		}
	}
		
	for (var j=0; j<nodes.length; j++)
	{
		if (nodes[j].label == nodes[childNode].Parent) {
			console.log(nodes[j])
			nodes[j].penaltyT = 1;
			var t = Date.now();
			nodes[j].modifiedTime = t;
			nodes[j].Children.push(nodes[childNode].label);
		}
	}
		
	while (nodes[childNode].Parent != null) {
		for (var i=0; i<nodes.length; i++) {
			if (nodes[i].label != null && nodes[i].label == nodes[childNode].Parent) {
				nodes[i].dis = nodes[i].dis + 1;
				childNode = i;
			}
		}
	}
	// find links to/from this node, and delete them too
			
	selected_link = null;
	console.log(nodes)
	
	for (var i=0; i<nodes.length; i++) {
		if(nodes[i].label == pp) {pp = i;}
	}
	links = links.filter(function(l) { return l.source !== deleteNode && l.target !== deleteNode;});	
	links.push({source: nodes[pp], target: new_node, value: 1});
	event.stopPropagation();
	update();
	
	// addNode();
	$("#dialog").dialog("close");
	$("#userInput").val('');
	console.log(links)
}

function computePenalty(){
	for (var i=0; i<nOverThreshold.length; i++)
	{
		for (var j=0; j<nodes.length; j++)
		{
			if (nOverThreshold[i].label == nodes[j].label) {
				console.log(nodes[j])
				nodes[j].penaltyT = 1;
				var t = Date.now();
				nodes[j].modifiedTime = t;
			}
		}
	}
	tempWeiList = [];
	nOverThreshold = [];
}

function getDim(a) {
    var dim = [];
    for (;;) {
        dim.push(a.length);

        if (Array.isArray(a[0])) {
            a = a[0];
        } else {
            break;
        }
    }
    return dim;
}

