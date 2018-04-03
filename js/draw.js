var path;
var lines = [];
var gameCode = "none"
var alias = false

var transitions = 0;
	
	function onMouseDown(event) {
		// If we produced a path before, deselect it:
		if (path) {
			path.selected = false;
		}
	
		// Create a new path and set its stroke color to black:
		path = new Path({
			segments: [event.point],
			strokeColor: 'black',
			// Select the path, so we can see its segment points:
			//fullySelected: true
		});
	}
	
	// While the user drags the mouse, points are added to the path
	// at the position of the mouse:
	function onMouseDrag(event) {
		path.add(event.point);
	}

	// When the mouse is released, we simplify the path:
	function onMouseUp(event) {
		var segmentCount = path.segments.length;
	
		// When the mouse is released, simplify it:
		path.simplify(2.5);

        //Pushing newly created path object onto lines array
        lines.push(path);
        

        // Select the path, so we can see its segments:
		//path.fullySelected = true;

	}
	

	//Send button
	$("#sendButton").click(function() {

		url = "http://sketchwithfriends.cool:5000/sendDrawing"

		data = {
			"gamecode": "testing",
			"alias": "testing",
			"paths": JSON.stringify(lines)
		};

		function register_success(response) {
			console.log(response);
		}
		function register_failure(response) {
			console.log(response);
		}

		my_request("POST", url, data, register_success, register_failure);
	})

	//Join Button
	$("#joinButton").click(function() {
		gameCode = document.getElementById("gameCode").value;
		alias = document.getElementById("alias").value;
		console.log(gameCode);
		console.log(alias);

		//TODO
		//Check if gamecode is valid
		if(!checkCodeValidity(gameCode)){
			gameCode = "none"
		}

		//Join game
		//TODO verification, security

		//Display some error if gamecode is invalid
		if(gameCode == "none"){
			//TODO
			//Do something
		}
		//Transition the screen
		else{
			var mainDiv = document.getElementById("mainDiv");
			var drawDiv = document.getElementById("drawDiv");
			var cycleButton = document.getElementById("cycleButton");
			mainDiv.style.display = "none"
			drawDiv.style.visibility = "visible"
			mainDiv.style.display = "none"
			drawDiv.style.display = "inline";
			cycleButton.style.display = "none";
		}
	})

	//Host button
	$("#hostButton").click(function() {
		//createGame function handles everything
		createGame();


	})

	//clears the canvas and empties the stored lines array
	$("#resetButton").click(function(){
		//console.log(lines)
		//empty lines array
		while (lines.length > 0){
			lines.pop();
		}
		//from https://stackoverflow.com/questions/19054798/canvas-clear-in-paper-js/19293586
		paper.project.activeLayer.removeChildren();
		paper.view.draw();
		//console.log(lines)
	})

	//test
	$("#test").click(function(){
		recreateDrawing("testing", "testing")
	})

	//Checks if gamecode is valid
	//Gamecode in mongoDB, game not in progress
	function checkCodeValidity(gameCode){
		//TODO
		//request something from API checking if gamecode is a collection in mongoDB
		return true
	}

	//reloads the DOM by element ID, may be useful later
	function reload(id){
		var container = document.getElementById(id);
		var content = container.innerHTML;
		container.innerHTML = content; 	
	   //this line is to watch the result in console , you can remove it later	
		console.log(id); 
	}

	function my_request(method, url, data, successHandler, failureHandler) {
		var jqxhr = $.ajax({
			"async": true,
			"crossDomain": true,
			"url": url,
			"method": method,
			"data": data
		});
		jqxhr.done(successHandler);
		jqxhr.fail(failureHandler);
	}

	function recreateDrawing(gamecode, alias){
		url = "http://sketchwithfriends.cool:5000/getDrawing"

		data = {
			"gamecode": "testing",
			"alias": "testing",
		};

		//On success, recreates the drawing
		function register_success(response) {
			
			console.log("paths:")
			console.log(response)
			paths = JSON.parse(response["paths"])

			//Iterate through array
			//and create the paths
			for (var i = 0; i < paths.length; i++) {
				new Path({
					segments: paths[i][1]['segments'],
					strokeColor: paths[i][1]['strokeColor'],
				});
			}
		}
		function register_failure(response) {
			console.log(response);
		}

		my_request("POST", url, data, register_success, register_failure);
	}

	function createGame(){
		url = "http://sketchwithfriends.cool:5000/createGame"

		//On success, stores gamecode and changes screens
		function register_success(response) {
			console.log("gamecode:", response["gamecode"])
			
			//Receive gamecode
			gamecode = response["gamecode"]
			document.getElementById("displayCode").innerHTML = "Game Code: " + response["gamecode"];
			//Transfer screens to host screen
			var mainDiv = document.getElementById("mainDiv");
			var drawDiv = document.getElementById("drawDiv");
			var sendButton = document.getElementById("sendButton");
			var resetButton = document.getElementById("resetButton");	
			mainDiv.style.display = "none"
			drawDiv.style.visibility = "visible"
			mainDiv.style.display = "none"
			drawDiv.style.display = "inline";
			sendButton.style.display = "none"
			resetButton.style.display = "none"
		}

		function register_failure(response) {
			console.log(response);
		}

		my_request("GET", url, "", register_success, register_failure);
	}

    //debugging stuff
    $(window).keypress(function(e) {
        if (e.which === 32) { //pressing spacebar
			
			console.log("generating gamecode")
			//Check if gamecode generation is going alright
			createGame();
			
		}
	});

	function testTransition() {
		console.log("transitions:", transitions)
		var y = document.getElementById("mainDiv");
		var x = document.getElementById("drawDiv");
		if (transitions == 0){
			console.log("first transition")
			x.style.display = "none"
			x.style.visibility = "visible"
		}
		if (x.style.display === "none") {
			console.log("turning x on")
			y.style.display = "none"
			x.style.display = "inline";
		} else {
			console.log("turning y on")
			x.style.display = "none";
			y.style.display = "inline";
		}
		transitions += 1;
	}
	//test
	$("#changeButton").click(function(){
		testTransition();
	})
