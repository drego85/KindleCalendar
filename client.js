const COLOR_OK = "#1f7f39";
const COLOR_ERROR = "#c43131";


var active = false;
var currentView = 0;
var fileNames = ['gcal.png', 'screenshot.png'];


const setMessage = function(message) {
    body.innerHTML = message;
};

const setBG = function(fileName) {
	now = new Date().getTime();
	body.style.backgroundImage = "url('http://" + window.location.hostname + ":8080/"+ fileName +"?" + now +"')";
};

function cycleCurrentView(){
	currentView = (currentView+1)%fileNames.length;
	setBG(fileNames[currentView]);
};


const startListener = function() {
    if (active)
	return;
    active = true;
    wsConn = new WebSocket('ws://' + window.location.hostname + ":8080/");


    wsConn.onopen = function() {
		setMessage("Active", COLOR_OK);
    }
    wsConn.onclose = function(e) {
		setMessage("Disconn. " + JSON.stringify(e), COLOR_ERROR);
		active = false;
    }
    wsConn.onerror = function(e, code) {
		setMessage("ERROR " + code + e, COLOR_ERROR);
    }
    wsConn.onmessage = function(message) {
		// console.log("onMessage", message);
		try {
			var data = JSON.parse(message.data);
			setMessage(data.msj);

			if(data.sc === "bg") {
				// pinned content takes over calendar refresh until page reload
				if(data.msj === "gcal.png" && fileNames[currentView] !== data.msj)
					return;
				currentView = fileNames.indexOf(data.msj);
				setBG(fileNames[currentView]);
			}

		} catch(e) {
			setMessage("MSG ERROR: " + e, COLOR_ERROR);
		}
    }
};


// TAP to change view
body.onclick = function(e){
	cycleCurrentView();
};

startListener();
