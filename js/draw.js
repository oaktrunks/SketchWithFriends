var path;
var lines = [];

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
		var gameCode = document.getElementById("gameCode").value;
		var alias = document.getElementById("alias").value;
		console.log(gameCode);
		console.log(alias);
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

	function createGameCode(){
		url = "http://sketchwithfriends.cool:5000/createGame"

		//On success, stores gamecode and changes screens
		function register_success(response) {
			console.log("gamecode:", response["gamecode"])
			gamecode = response["gamecode"]
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
			createGameCode();
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
