const remote = require("electron").remote;
const x = document.getElementById('cont');
const driveMode = document.getElementById("driveModeSelect");
const fs = require("fs");

/*
// camera receiving code; nonfunctional

const udp = require("dgram");
const server = udp.createSocket("udp4");

server.on("message", msg=>{
	console.log(msg);
	document.getElementById(cameraFeed.backgroundImage = "url(data:image/jpg;base64,"+msg+")");
});

server.bind(5001,"172.22.48.28");
*/

var inputs = ["linearCutoff","turnCutoff","linearSpeed","turnPrecision"];
var inputsMap = {
	"linearCutoff": "linearC",
	"turnCutoff": "turnC",
	"linearSpeed": "linearS",
	"turnPrecision": "turnP"
};

var inputVals = {};

fs.readFile("default_tuners.json",(err,data)=>{
	if (err) {
		console.log(err);
	} else {
		inputVals = JSON.parse(data);
		let keys = Object.keys(inputVals);
		let vals = Object.values(inputVals);
		for (var i = 0; i < vals.length; i++) {
			document.getElementById(keys[i]).value = vals[i];
			document.getElementById(inputsMap[keys[i]]).innerText = vals[i];
		}
	}
})

driveMode.addEventListener("change", changeDriveMode);
document.addEventListener("change", changeInputs);
document.addEventListener("input", changeInputs);
document.getElementById('x').addEventListener("click", close);

function changeInputs(e) {
	if (inputs.includes(e.target.id)) {
		if (e.type==="change") {
			inputVals[e.target.id] = Number(e.target.value);
			saveTuner();
			let arr = [];
			arr.push(inputVals["linearCutoff"]);
			arr.push(inputVals["turnCutoff"]);
			arr.push(inputVals["linearSpeed"]);
			arr.push(inputVals["turnPrecision"]);
			NetworkTables.putValue("/SmartDashboard/curvyCurves",arr);
		}
		document.getElementById(inputsMap[e.target.id]).innerText = e.target.value;
	}
}

function changeDriveMode(e) {
	for (var i = 0; i < driveMode.children.length; i++) {
		if (driveMode.children[i].checked==true) {
			console.log(driveMode.children[i].value);
			NetworkTables.putValue("/SmartDashboard/drivemode",driveMode.children[i].value);
		}
	}
}

function saveTuner() {
	fs.writeFile("default_tuners.json",JSON.stringify(inputVals,null,4),err=>{
		if (err) {
			console.log(err);
		}
	})
}

addEventListener('error',(ev)=>{
	ipc.send('windowError',{mesg:ev.message,file:ev.filename,lineNumber:ev.lineno})
});

NetworkTables.addKeyListener('/SmartDashboard/enabled', (key, value) => {
	if (value) {
		document.getElementById("notcamera").style.display = "none";
		document.getElementById("camera").style.width = "100%";
		document.getElementById("cameraFeed").style.width = "100%";
	} else {
		document.getElementById("notcamera").style.display = "";
		document.getElementById("camera").style.width = "";
		document.getElementById("cameraFeed").style.width = "";
	}
});