var stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves"];
var isComputing = false;

function computeSug () {
	clearInterval(timeCounter);
	isComputing = true;
	var parsedArray = [];
	var wordsMap = new Map();
	
	for (var i=0; i<nOverThreshold.length; i++) {
		var parsedWords = processString(nOverThreshold[i].name);
		if (parsedWords.length == 1) {
			parsedArray.push({x: nOverThreshold[i].x, y: nOverThreshold[i].y, name: parsedWords[0], group: nOverThreshold[i].group, weight: nOverThreshold[i].weight, label:nOverThreshold[i].label, Parent:nOverThreshold[i].Parent, Children:nOverThreshold[i].Children, addTime:nOverThreshold[i].addTime, modifiedTime:nOverThreshold[i].modifiedTime, penaltyT:nOverThreshold[i].penaltyT, penaltyL:nOverThreshold[i].penaltyL, dis:nOverThreshold[i].dis});
		} else {
			for (var j=0; j<parsedWords.length; j++) {
				parsedArray.push({x: nOverThreshold[i].x, y: nOverThreshold[i].y, name: parsedWords[j], group: nOverThreshold[i].group, weight: nOverThreshold[i].weight, label:nOverThreshold[i].label, Parent:nOverThreshold[i].Parent, Children:nOverThreshold[i].Children, addTime:nOverThreshold[i].addTime, modifiedTime:nOverThreshold[i].modifiedTime, penaltyT:nOverThreshold[i].penaltyT, penaltyL:nOverThreshold[i].penaltyL, dis:nOverThreshold[i].dis});
			}
		}
		
	}
	
	// var map = new Map();
	for (var i=0; i<parsedArray.length; i++) {
		var addressConcept = 'http://api.conceptnet.io/c/en/'+ parsedArray[i].name.toLowerCase() +'?offset=0&limit=1000';
		var json = JSON.parse(httpGet(addressConcept));
		parseAll(json,parsedArray[i]);
		console.log("Address Concept: "+　addressConcept)
	}
	console.log("TempList : ")
	console.log(tempWeiList)
	console.log("TotalList : ")
	console.log(weiList)
	if (tempWeiList.length == 0) {
		timeCounter = setInterval(timeElapse, 2000);
		isComputing = false;
		nOverThreshold = [];
		return;}
	else {writeSug(tempWeiList);}
}

function processString(str){
	var words = [];
	if (str.split(" ").length > 1) {
		// at least 2 strings
		// var stopwords = ['this'];

		words = str.split(/\W+/).filter(function(token) {
			token = token.toLowerCase();
			return token.length >= 2 && stopwords.indexOf(token) == -1;
		});
		return words;
	} else {
		words.push(str);
		return words;
	}
}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

var t = -1;
var terms = [];
var label = [], term = [], termRels = [];
function parseAll(data,n){
	// alert(JSON.stringify(data));
	console.log("Data: ");
	console.log(data)
	// console.log(JSON.stringify(data))
	// console.log(data.edges[1].start.label)
	term = [];
	termRels = [];
	var arrayFilter = [];
	var uniqueIndex = [];
	if (data.edges.length < 1) {return}
	else {
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
		computeWeiRel(n);
	}
}

var RelType = ['IsA', 'PartOf', 'HasA', 'UsedFor', 'CapableOf', 'AtLocation', 'Causes', 'HasSubevent', 'HasPrerequisite', 'HasProperty', 'MotivatedByGoal', 'ObstructedBy', 'Desires', 'CreatedBy', 'DistinctFrom', 'SymbolOf', 'LocatedNear', 'SimilarTo', 'MadeOf'];
var weiList = [], tempWeiList = [];
function computeWeiRel(n){
	var check = 0;
	// console.log(weiList)
	// console.log(tempWeiList)
	if (weiList.length > 0) {
		var length = weiList[0].length;
		var numCol = weiList.length;
		console.log('length : ' + length)
		console.log('numCol : ' + numCol)
		for (var i=0; i<numCol; i++) {
			// console.log(weiList[i][0])
			// console.log(weiList[i][0].l)
			if (weiList[i][0].n == n.name) {
				tempWeiList.push(weiList[i]);
				check = check+1;}
		}
	}
	
	if (check == 0){
		var w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0, w6 = 0, w7 = 0, w8 = 0, w9 = 0, w10 = 0, w11 = 0, w12 = 0, w13 = 0, w14 = 0, w15 = 0, w16 = 0, w17 = 0, w18 = 0, w19 = 0, wei = [];
		var nw1 = 0, nw2 = 0, nw3 = 0, nw4 = 0, nw5 = 0, nw6 = 0, nw7 = 0, nw8 = 0, nw9 = 0, nw10 = 0, nw11 = 0, nw12 = 0, nw13 = 0, nw14 = 0, nw15 = 0, nw16 = 0, nw17 = 0, nw18 = 0, nw19 = 0;
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
			else if (termRels[i].label == 'HasPrerequisite') {
				w9 = w9 + termRels[i].weight;
				nw9 = nw9+1;}
			else if (termRels[i].label == 'HasProperty') {
				w10 = w10 + termRels[i].weight;
				nw10 = nw10+1;}
			else if (termRels[i].label == 'MotivatedByGoal') {
				w11 = w11 + termRels[i].weight;
				nw11 = nw11+1;}
			else if (termRels[i].label == 'ObstructedBy') {
				w12 = w12 + termRels[i].weight;
				nw12 = nw12+1;}
			else if (termRels[i].label == 'Desires') {
				w13 = w13 + termRels[i].weight;
				nw13 = nw13+1;}
			else if (termRels[i].label == 'CreatedBy') {
				w14 = w14 + termRels[i].weight;
				nw14 = nw14+1;}
			else if (termRels[i].label == 'DistinctFrom') {
				w15 = w15 + termRels[i].weight;
				nw15 = nw15+1;}
			else if (termRels[i].label == 'SymbolOf') {
				w16 = w16 + termRels[i].weight;
				nw16 = nw16+1;}
			else if (termRels[i].label == 'LocatedNear') {
				w17 = w17 + termRels[i].weight;
				nw17 = nw17+1;}
			else if (termRels[i].label == 'SimilarTo') {
				w18 = w18 + termRels[i].weight;
				nw18 = nw18+1;}
			else if (termRels[i].label == 'MadeOf') {
				w19 = w19 + termRels[i].weight;
				nw19 = nw19+1;}
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
			wei[i] = {n: n.name, Rel: RelType[i], l: n.label, avgW: eval('w'+ii) / eval('nw'+ii), totalW: eval('w'+ii), haveSearch: false};
			console.log('Each weight : ');
			console.log(wei[i]);
		}
		
		// console.log(nOverThreshold[c].penalty)
		// if (nOverThreshold[c].penalty > 0) {wei = wei*(1-nOverThreshold[c].penalty);}
		var l = weiList.length;
		weiList[l] = wei;
		console.log('Total weight : ');
		console.log(weiList[l])
		tempWeiList.push(weiList[l]);
	}
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }
	
	// var max = arr[0][0].avgW;
	var max = 0;
	var maxIndex = [0,0];
	for (var i=0; i<arr.length; i++){
		// console.log(arr.length)
		var tempArr = arr[i];
		// var max = arr[i][0];
		// var maxIndex = [0,0];
		
		for (var j = 1; j < arr[i].length; j++) {
			// console.log(arr[i].length)
			if (arr[i][j].avgW > max && arr[i][j].haveSearch == false) {
				maxIndex = [i,j];
				max = arr[i][j].avgW;
			}
		}
	}
	
    // console.log(maxIndex)
	// console.log(max)
    return maxIndex;
}

var Q = [];
function writeSug(input){
	var I = indexOfMax(input);
	console.log(I)
	if (I[0] == 0 && I[1] == 0 && tempWeiList[I[0]][I[1]].haveSearch == true) {
		timeCounter = setInterval(timeElapse, 2000);
		isComputing = false;
		return;}
	
	else {
		tempWeiList[I[0]][I[1]].haveSearch = true;
		for (var i=0; i<weiList.length; i++) {
			for (var j=0; j<weiList[i].length; j++) {
				if (weiList[i][j].n == tempWeiList[I[0]][I[1]].n && weiList[i][j].Rel == tempWeiList[I[0]][I[1]].Rel) {weiList[i][j].haveSearch = true;}
			}
		}
		// weiList[I[0]][I[1]].avgW = weiList[I[0]][I[1]].avgW-1;
		// console.log(tempWeiList)
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
		else if (sugRel == 'HasPrerequisite') {
			var rr = Math.floor(Math.random() * 3);
			if (rr == 0) {my_string = "What is needed for " + sugW + " to occur ?";}
			else if (rr == 1) {my_string = "What needs to happen for " + sugW + " to occur ?";}
			else {my_string = "What are the prerequisites of " + sugW + " ?";}
			}
		else if (sugRel == 'HasProperty') {
			var rr = Math.floor(Math.random() * 2);
			if (rr == 0) {my_string = "What properties are associated with " + sugW + " ?";}
			else {my_string = "How can you describe " + sugW + " as being ?";}
			}
		else if (sugRel == 'MotivatedByGoal') {
			var rr = Math.floor(Math.random() * 3);
			if (rr == 0) {my_string = "What can " + sugW + " lead to ?";}
			else if (rr == 1) {my_string = "What does " + sugW + " help accomplish ?";}
			else {my_string = "Why is it necessary to do " + sugW + " ?";}
			}
		else if (sugRel == 'ObstructedBy') {
			var rr = Math.floor(Math.random() * 2);
			if (rr == 0) {my_string = "What can prevent " + sugW + " from happening ?";}
			else {my_string = "What prevents/obstructs " + sugW + " ?";}
			}
		else if (sugRel == 'Desires') {
			var rr = Math.floor(Math.random() * 3);
			if (rr == 0) {my_string = "What does " + sugW + " desire ?";}
			else if (rr == 1) {my_string = "What does " + sugW + " want ?";}
			else {my_string = "What are " + sugW + "'s desires ?";}
			}
		else if (sugRel == 'CreatedBy') {
			var rr = Math.floor(Math.random() * 3);
			if (rr == 0) {my_string = "How can you make " + sugW + " ?";}
			else if (rr == 1) {my_string = "What can help in creating " + sugW + " ?";}
			else {my_string = "What helps create " + sugW + " ?";}
			}
		else if (sugRel == 'DistinctFrom') {
			my_string = "What is something that belongs to the category of " + sugW + " ?";
			}
		else if (sugRel == 'SymbolOf') {
			var rr = Math.floor(Math.random() * 2);
			if (rr == 0) {my_string = "What does " + sugW + " signify ?";}
			else {my_string = "What does " + sugW + " represent ?";}
			}
		else if (sugRel == 'LocatedNear') {
			var rr = Math.floor(Math.random() * 2);
			if (rr == 0) {my_string = "What can be found near " + sugW + " ?";}
			else {my_string = "What is located near " + sugW + " ?";}
			}
		else if (sugRel == 'SimilarTo') {
			var rr = Math.floor(Math.random() * 2);
			if (rr == 0) {my_string = "What is " + sugW + " similar to ?";}
			else {my_string = "What else is like " + sugW + " ?";}
			}
		else if (sugRel == 'MadeOf') {
			var rr = Math.floor(Math.random() * 2);
			if (rr == 0) {my_string = "What is " + sugW + " made of ?";}
			else {my_string = "What entities can be used to make " + sugW + " ?";}
			}
			// var my_string = "What is the subevent of " + sugW + " ?";}
		// console.log(my_string)
		Q.push(tempWeiList[I[0]][I[1]].l);
		
		// document.getElementById("helpBar").innerHTML = my_string;
		// document.getElementById("sentence").innerHTML = my_string;
		// $("#dialog").dialog("open");
		var s;
		for (var i=0; i<nodes.length; i++){
			if (nodes[i].label == tempWeiList[I[0]][I[1]].l) {s = i;}
		}
		var p = nodes[s].label;
		var L = my_string.length;
		var new_node = {x: 50, y: 50, name: my_string, group: 2, weight: 1, hasSearched: false, label:null, Parent:p, Children:null, penaltyT:null, penaltyL:null, stringL:L*3.75, importance: null, line:1};
		// console.log(nodes)
		// $("#dialog").dialog('close');
		nodes.push(new_node);
		w = getTextWidth(my_string, nodes[nodes.length-1].importance);
		// console.log(w)
		lineCount = Math.ceil(w/textBound);
		// var lineCount = (w/textBound) + 1;
		nodes[nodes.length-1].line = lineCount;
		
		selected_link = null;
		// force.stop();
		update();
		var d = link_distance+(nodes[s].line-1)*20*Math.max(0, 4-nodes[s].importance);
		links.push({source: nodes[s], target: new_node, value: 1, linkdis: d});
		update();
	}
	computePenalty();
	timeCounter = setInterval(timeElapse, 2000);
	isComputing = false;
}

var textValue;
$("#dialog").dialog({
    autoOpen  : false,
    modal     : true,
    title     : "Inspiration Dialog",
    buttons   : {
              'OK' : function() {
                  textValue = $('#userInput').val();
				  console.log(textValue.length)
				  ReplaceQN();
                  // alert('The value of the text box is ' + textValue);
                  //Now you have the value of the textbox, you can do something with it, maybe an AJAX call to your server!
              },
              'Ignore' : function() {
                  // alert('The Close button was clicked');
                  $(this).dialog('close');
				  timeCounter = setInterval(timeElapse, 2000);
				  $("#userInput").val('');
				  simulation.alpha(1).restart();
              },
			  'Delete' : function() {
                  // alert('The Close button was clicked');
                  $(this).dialog('close');
				  deleteQN();
				  timeCounter = setInterval(timeElapse, 2000);
				  $("#userInput").val('');
              }
	}
});

function openDialog() {
	if (isComputing == ''){
		document.getElementById("sentence").innerHTML = connectedNodes[0].name;
		$("#dialog").dialog("open");
		clearInterval(timeCounter);
		simulation.stop();
	}
	else {console.log(isComputing)}
}

// var pp, nn;
function ReplaceQN() {
	if (textValue.length == 0 || !textValue.replace(/\s/g, '').length) {
		alert('You do not enter a valid string.');
		timeCounter = setInterval(timeElapse, 2000);
		return;}
	else {
		var lineCount = 1;
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
				var L = textValue.length;
				var new_node = {x: connectedNodes[0].x, y: connectedNodes[0].y, name: textValue, group: 1, weight: 1, label:nn, Parent:pp, Children:[], addTime:t, modifiedTime:null, penaltyT:1, penaltyL:0, dis:0, stringL:L*3.75, importance:1, line: lineCount};
				// new_node.weight =10;
				nodes.push(new_node);
				
				nodes.splice(i, 1);
				// console.log(nodes)
				childNode=nodes.length-1;
				break;
			}
		}
			
		for (var j=0; j<nodes.length; j++)
		{
			if (nodes[j].label == nodes[childNode].Parent) {
				// console.log(nodes[j])
				nodes[j].penaltyT = 1;
				var t = Date.now();
				nodes[j].modifiedTime = t;
				nodes[j].Children.push(nodes[childNode].label);
			}
		}
		
		var imp = 0;
		while (nodes[childNode].Parent != null) {
			for (var i=0; i<nodes.length; i++) {
				if (nodes[i].label != null && nodes[i].label == nodes[childNode].Parent) {
					nodes[i].dis = nodes[i].dis + 1;
					childNode = i
					imp++;
				}
			}
		}
		nodes[nodes.length-1].importance = nodes[nodes.length-1].importance + imp;
		var wordCount = textValue.split(' ').length;
		// console.log(wordCount)
		w = getTextWidth(textValue, nodes[nodes.length-1].importance);
		// console.log(w)
		lineCount = Math.ceil(w/textBound);
		nodes[nodes.length-1].line = lineCount;	
		selected_link = null;
		console.log(nodes)
		
		for (var i=0; i<nodes.length; i++) {
			if(nodes[i].label == pp) {
				pp = i;
				break;}
		}
		var d = link_distance+(nodes[pp].line-1)*20*Math.max(0, 4-nodes[pp].importance);
		d = d + (nodes[nodes.length-1].line-1)*20*Math.max(0, 4-nodes[nodes.length-1].importance);
		
		links = links.filter(function(l) { return l.source !== deleteNode && l.target !== deleteNode;});	
		links.push({source: nodes[pp], target: nodes[nodes.length-1], value: 1, linkdis: d});
		console.log(links)
		event.stopPropagation();
		update();
		
		console.log(nodes)
		console.log(links)
		// addNode();
		$("#dialog").dialog("close");
		$("#userInput").val('');
		console.log(links)
		console.log(nodes)
		timeCounter = setInterval(timeElapse, 2000);
	}
}

function deleteQN() {
	var deleteNode;
	for (var i=0; i<nodes.length; i++) {
		if (nodes[i].name == connectedNodes[0].name) {
			var t = Date.now();
			pp = nodes[i].Parent;
			deleteNode = nodes[i];
			nodes.splice(i, 1);			
			break;
		}
	}
	for (var j=0; j<nodes.length; j++)
	{
		if (nodes[j].label == deleteNode.Parent) {
			// console.log(nodes[j])
			nodes[j].penaltyT = 1;
			var t = Date.now();
			nodes[j].modifiedTime = t;
		}
	}
	links = links.filter(function(l) { return l.source !== deleteNode && l.target !== deleteNode;});
	event.stopPropagation();
	update();
}

function computePenalty(){
	for (var i=0; i<nOverThreshold.length; i++)
	{
		for (var j=0; j<nodes.length; j++)
		{
			if (nOverThreshold[i].label == nodes[j].label) {
				// console.log(nodes[j])
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

var selectedSug = [];
function getSug(d) {
	selected_node = d;
	selectedSug.push(selected_node);
	// console.log(d)
	var parsedArray = [];
	var parsedWords = processString(d.name);
	// console.log(d.name)
	// console.log(parsedWords)
	if (parsedWords.length == 1) {
		parsedArray.push({x: d.x, y: d.y, name: parsedWords[0], group: d.group, weight: d.weight, label:d.label, Parent:d.Parent, Children:d.Children, addTime:d.addTime, modifiedTime:d.modifiedTime, penaltyT:d.penaltyT, penaltyL:d.penaltyL, dis:d.dis});
	} else {
		for (var j=0; j<parsedWords.length; j++) {
			parsedArray.push({x: d.x, y: d.y, name: parsedWords[j], group: d.group, weight: d.weight, label:d.label, Parent:d.Parent, Children:d.Children, addTime:d.addTime, modifiedTime:d.modifiedTime, penaltyT:d.penaltyT, penaltyL:d.penaltyL, dis:d.dis});
		}
	}
	// console.log(parsedArray)
	
	for (var i=0; i<parsedArray.length; i++) {
		var addressConcept = 'http://api.conceptnet.io/c/en/'+ parsedArray[i].name.toLowerCase() +'?offset=0&limit=1000';
		var json = JSON.parse(httpGet(addressConcept));
		var sug = parseAllFilter(json,parsedArray[i]);
		console.log("Address Concept: "+　addressConcept)
	}
	console.log(sug)
	showSug(sug);
}

function parseAllFilter(data,n){
	// alert(JSON.stringify(data));
	console.log("Data: ");
	console.log(data)
	// console.log(JSON.stringify(data))
	// console.log(data.edges[1].start.label)
	term = [];
	termRels = [];
	var arrayFilter = [];
	var uniqueIndex = [];
	if (data.edges.length < 1) {return;}
	else {
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
		// computeWeiRel(n);
		var top10 = [];
		var ind = 0;
		while (top10.length < 10) {
			if (ind == 0) {
				var newC = termRels[ind].term;
				newC = newC.toLowerCase();
				top10.push(ltrim(trimSentence(newC)));
				ind++;}
			else {
				var newC = termRels[ind].term;
				// newC = newC.toLowerCase();
				newC = ltrim(trimSentence(newC.toLowerCase()));
				if (top10.includes(newC) == false) {
					top10.push(newC);
					ind++;}
				else {ind++;}
			}
		}
		return top10;
	}
}

function trimSentence(s) {
    // var words = ['of', 'the', 'in', 'on', 'at', 'to', 'a', 'is'];
    var re = new RegExp('\\b(' + stopwords.join('|') + ')\\b', 'g');
    return (s || '').replace(re, '').replace(/[ ]{2,}/, ' ');
}

function ltrim(str) {
  if(str == null) return str;
  return str.replace(/^\s+/g, '');
}

function showSug(c) {
	if (c.length < 1) {
		for (var i=0; i<10; i++) {
		index = i+1;
		document.getElementById("sug" + index).innerHTML = '.';
		}
	}
	else {
		for (var i=0; i<c.length; i++) {
		index = i+1;
		document.getElementById("sug" + index).innerHTML = c[i];
		}
	}
	// document.getElementById("sug1").innerHTML = 'apple';
}

function linkSug(clicked_id) {
	if (selectedSug.length < 1) {return}
	else {
		var nn, childNode, parentNode;
		// ParentNode = selectedSug[selectedSug.length-1];
		for (var i=0; i<nodes.length; i++){
			if (nodes[i].label != null) {nn = nodes[i].label+1}
		}
		
		var lineCount = 1;
		var t = Date.now();
		var n = document.getElementById(clicked_id).innerHTML;
		var L = n.length;
		var new_node = {x: 50, y: 50, name: n, group: 1, weight: 1, hasSearched: false, label:nn, Parent:null, Children:[], addTime:t, modifiedTime:null, penaltyT:1, penaltyL:0, dis:0, stringL:L*3.75, importance:1, line:lineCount};
		for (var i=0; i<nodes.length; i++) {
			if (nodes[i].label == selectedSug[selectedSug.length-1].label) {
				nodes[i].Children.push(nn);
				nodes[i].modifiedTime = t;
				nodes[i].penaltyT = 1;
				parentNode = i;
				new_node.Parent = nodes[i].label;
				break;
			}
		}
		nodes.push(new_node);
		selected_link = null;
		// force.stop();
		update();
		
		var imp = 0;
		childNode = nodes.length-1;
		while (nodes[childNode].Parent != null) {
			for (var i=0; i<nodes.length; i++) {
				if (nodes[i].label != null && nodes[i].label == nodes[childNode].Parent) {
					nodes[i].dis = nodes[i].dis + 1;
					childNode = i
					imp++;
				}
			}
		}
		nodes[nodes.length-1].importance = nodes[nodes.length-1].importance + imp;
		var wordCount = n.split(' ').length;
		// console.log(wordCount)
		w = getTextWidth(n, nodes[nodes.length-1].importance);
		// console.log(w)
		lineCount = Math.ceil(w/textBound);
		// var lineCount = (w/textBound) + 1;
		nodes[nodes.length-1].line = lineCount;	
			
		// links = links.filter(function(l) { return l.source !== deleteNode && l.target !== deleteNode;});
		// console.log(parentNode)	
		// console.log(childNode)
		var d = link_distance+(nodes[parentNode].line-1)*20*Math.max(0, 4-nodes[parentNode].importance);
	    d = d + (nodes[nodes.length-1].line-1)*20*Math.max(0, 4-nodes[nodes.length-1].importance);
		links.push({source: nodes[parentNode], target: nodes[nodes.length-1], value: 1, linkdis: d});
		event.stopPropagation();
		update();
	}
	// console.log(nodes)
}

