var path;
var lines = [];
var gameCode = "none"
var alias = false
var currentDrawing = 0

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

		canvas = document.getElementById("drawingBoard");

		data = {
			"gamecode": gameCode,
			"alias": alias,
			"paths": JSON.stringify(lines),
			"cavasWidth": canvas.style.width,
			"canvasHeight": canvas.style.height,
		};

		function register_success(response) {
			console.log(response);
			while (lines.length > 0){
				lines.pop();
			}
			//from https://stackoverflow.com/questions/19054798/canvas-clear-in-paper-js/19293586
			paper.project.activeLayer.removeChildren();
			paper.view.draw();
			
		}
		function register_failure(response) {
			console.log(response);
			while (lines.length > 0){
				lines.pop();
			}
			//from https://stackoverflow.com/questions/19054798/canvas-clear-in-paper-js/19293586
			paper.project.activeLayer.removeChildren();
			paper.view.draw();
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

	//Next Picture button
	// This will eventually be removed
	//  is only in here for our April 3 presentation
	$("#cycleButton").click(function() {
		//Cycles through stored drawings in our database
		//Uses the global gameCode variable to check mongo collection with same name
		
		//currentDrawing global variable holds number of
		// which drawing is currently showing

		currentDrawing += 1;
		recreateDrawing(gameCode, currentDrawing)

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
		container.innerHTML= content; 	
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

	function recreateDrawing(gamecode, number){
		url = "http://sketchwithfriends.cool:5000/getDrawing"

		data = {
			"gamecode": gamecode,
			"number": number,
		};

		console.log(data)

		//Wipes previous drawing, code from resetButton
		while (lines.length > 0){
			lines.pop();
		}
		//from https://stackoverflow.com/questions/19054798/canvas-clear-in-paper-js/19293586
		paper.project.activeLayer.removeChildren();
		paper.view.draw();

		//On success, recreates the drawing
		function register_success(response) {
			if (!response["success"]){
				console.log("decrementing currentdrawing")
				currentDrawing -= 1;
			}
			else{
				console.log("paths:")
				console.log(response)
				paths = JSON.parse(response["paths"])

				//Used for scaling
				drawingWidth = response["canvasWidth"]
				drawingHeight= response["canvasHeight"]
				canvas = document.getElementById("drawingBoard");
				canvasWidth = canvas.style.width
				canvasHeight = canvas.style.height

				//segments = (48) [Array(3), Array(3), Array(3), Array(3), etc]
				// array(3) = [Array(2), Array(2), Array(2)]
				//Iterate through array
				//and recreate the paths
				for (var i = 0; i < paths.length; i++) {
					drawingSegments = paths[i][1]['segments']
					//Debug
					console.log("segments: ",drawingSegments)

					//Scale the drawing to our current canas
					for(var j = 0; j < drawingSegments.length; j++){
						for(var k = 0; k < drawingSegments[j].length; k++){
							//Width based
							drawingSegments[j][k][0] = drawingSegments[j][k][0] / drawingWidth * canvasWidth
							//Height based
							drawingSegments[j][k][1] = drawingSegments[j][k][1] / drawingHeight * canvasHeight
						}
					}

					//Initialze the new line
					new Path({
						segments: drawingSegments,
						strokeColor: paths[i][1]['strokeColor'],
					});
				}
			}
		}
		function register_failure(response) {
			console.log(response);
			currentDrawing -= 1;
		}

		my_request("POST", url, data, register_success, register_failure);
	}

	function createGame(){
		url = "http://sketchwithfriends.cool:5000/createGame"

		//On success, stores gamecode and changes screens
		function register_success(response) {
			console.log("gamecode:", response["gamecode"])
			
			//Receive gamecode
			gameCode = response["gamecode"]
			document.getElementById("code").innerHTML = "Game Code: " + gameCode;	

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
