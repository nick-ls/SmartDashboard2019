const buttonAlias = {
	0: "A",
	1: "B",
	2: "X",
	3: "Y",
	4: "Left Bumper",
	5: "Right Bumper",
	6: "Start",
	7: "Select",
	8: "Left 3",
	9: "Right 3"
}
const joystickAlias = {
	0: "Left Joystick Horizontal",
	1: "Left Joystick Vertical",
	2: "Left Trigger",
	3: "Right Trigger",
	4: "Right Joystick Horizontal",
	5: "Right Joystick Vertical"
}
const funcAlias = {
	"forward": "Switch Forward Direction",
	"arms": "Toggle Arm Open/Close",
	"slapIntake": "Toggle Slapping Balls",
	"ramp": "Toggle Climb Ramp",
	"wheels": "Toggle Climb Wheels",
	"throttle": "Throttle",
	"turning": "Turning",
	"hatch1": "Bottom Hatch Level",
	"hatch2": "Middle Hatch Level",
	"hatch3": "Highest Hatch Level",
	"ball1": "Bottom Ball Level",
	"ball2": "Middle Ball Level",
	"ball3": "Highest Ball Level",
	"armSlap": "Position to Pick Up Hatch",
	"armShoot": "Position to Shoot Ball/Hatch",
	"armBall": "Position to Pick Up Ball",
	"intakeSuck": "Hold to Suck Balls",
	"intakeBlow": "Hold to Blow Balls",
	"eject": "Shoot a Hatch",
}

var defaultProfile = {};

const axesFunctions = ["throttle","turning"];
const driverButtons = ["forward","wheels","ramp"];
const configurator = document.getElementById("profile");
const contType = document.getElementById("contType");
var currentControlSet = {};
var currentConfig = "";
var configs = {};
var listener = false;
var keyboardIndex = {};

String.prototype.capitalize = function(str) {
	return this[0].toUpperCase()+this.slice(1);
};

Object.prototype.flip = function(obj) {
	let k = Object.keys(obj);
	let v = Object.values(obj);
	let newO = {};
	for (let i = 0; i < k.length; i++) {
		newO[v[i]]=k[i];
	}
	return newO;
};

configurator.addEventListener("change", loadConfig);
document.addEventListener("click", profileButtons);
document.addEventListener("keydown", keylogger);

fs.readFile("keys.json",(err,data)=>{
	if (err) {
		console.log(err)
	} else {
		keyboardIndex = JSON.parse(data);
		fs.readFile("keybindings.json",(err,data)=>{
			if (err) {
				console.log(err);
			} else {
				configs = JSON.parse(data);
				updateProfiles();
				loadConfig("default");
			}
		});
	}
});
fs.readFile(".default_profile.json",(err,data)=>{
	if (err) {
		console.log(err);
	} else {
		defaultProfile=JSON.parse(data);
	}
});

function keylogger(e) {
	if (listener) {
		if (keyboardIndex[e.code]>=0) {
			document.getElementById("pressedKey").innerText = e.code;
		} else {
			document.getElementById("pressedKey").innerText = "Invalid";
		}
	}
}

function btnOrJoystick(func) {
	if (axesFunctions.includes(func)) {
		return joystickAlias;
	} else {
		return buttonAlias;
	}
}

function loadConfig(config) {
	if (typeof config!=String) {
		config = document.getElementById("profile").value;
		if (!configs[config]) {
			config = "default";
		}
	}
	var check = document.getElementById("profTable");
	if (check) {
		check.remove();
	}
	var changeCont = document.getElementById("changeContainer");
	if (changeCont) {
		changeCont.remove();
	}
		
	var table = document.createElement("table");
	table.id = "profTable";
	var tbody = document.createElement("tbody");
	var values = Object.values(configs[config]);
	var keys = Object.keys(configs[config]);
	if (!values) {
		console.log("Invalid profile loaded");
	}
	for (var i = 0; i < values.length; i++) {
		var val = Object.values(values[i]);
		var key = Object.keys(values[i]);
		var title = document.createElement("tr");
		var content = document.createElement("th");
		content.textContent = keys[i].capitalize()+" Controls";
		content.setAttribute("colspan","2");
		title.appendChild(content);
		tbody.appendChild(title);
		if (keys[i]==="driver") {
			for (var j = 0; j < val.length; j++) {
				var tr = document.createElement("tr");
				var td1 = document.createElement("td");
				td1.textContent = btnOrJoystick(key[j])[val[j]];
				var td2 = document.createElement("td");
				td2.textContent = funcAlias[key[j]];
				tr.appendChild(td1);
				tr.appendChild(td2);
				tbody.appendChild(tr);
			}
		} else {
			for (var r = 0; r < val.length; r++) {
				var tr = document.createElement("tr");
				var td1 = document.createElement("td");
				td1.textContent = Object.flip(keyboardIndex)[val[r]];
				var td2 = document.createElement("td");
				td2.textContent = funcAlias[key[r]];
				tr.appendChild(td1);
				tr.appendChild(td2);
				tbody.appendChild(tr);
			}
		}
	}
	table.appendChild(tbody);
	document.getElementById("currentConfig").appendChild(table);
	currentConfig = config;
}

function updateConfigs() {
	fs.writeFile("keybindings.json", JSON.stringify(configs,null,4), err=>{
		if (err) {
			console.log(err);
		} else {
			console.log(parseJSON(configs[currentConfig]["driver"]))
			NetworkTables.putValue("/SmartDashboard/driverKeys", parseJSON(configs[currentConfig]["driver"]));
			NetworkTables.putValue("/SmartDashboard/operatorKeys", parseJSON(configs[currentConfig]["operator"]));
		}
	});
}

function saveConfig(type) {
	let keys = Object.keys(configs[currentConfig][type]);
	let vals = Object.values(configs[currentConfig][type]);
	let key = Object.keys(currentControlSet)[0];
	let val = Object.values(currentControlSet)[0];
	let isJoystick = axesFunctions.includes(key);
	if (type==="driver") {
		for (var i = 0; i < vals.length; i++) {
			if (key==="nothing"&&vals[i]==val) {
				if (axesFunctions.includes(keys[i])===isJoystick) {
					delete configs[currentConfig][type][keys[i]];
					loadConfig(currentConfig);
					updateConfigs();
					return;
				}
			}
			if (vals[i]==val) {
				if (axesFunctions.includes(keys[i])===isJoystick) {
					delete configs[currentConfig][type][keys[i]];
				}
			}
		}
	} else {
		if (key==="nothing") {
			let delVals = Object.values(configs[currentConfig]["operator"]);
			let delKeys = Object.keys(configs[currentConfig]["operator"]);
			for (var i = 0; i < delVals.length; i++) {
				if (delVals[i]===val) {
					delete configs[currentConfig]["operator"][delKeys[i]];
				}
			}
			loadConfig(currentConfig);
			updateConfigs();
			return;
		} else {
			let rmVals = Object.values(configs[currentConfig]["operator"]);
			let rmKeys = Object.keys(configs[currentConfig]["operator"]);
			for (var i = 0; i < rmVals.length; i++) {
				if (rmVals[i]===val) {
					console.log(rmKeys[i]);
					delete configs[currentConfig]["operator"][rmKeys[i]];
				}
			}
		}
	}
	configs[currentConfig][type][key] = Number(val);
	currentControlSet = {};
	loadConfig(currentConfig);
	updateConfigs();
}

function profileButtons(e) {
	switch(e.target.id) {
		case "newB":
		case "newJ":
			var changeCont = document.getElementById("changeContainer");
			if (changeCont) {
				changeCont.remove();
			}
			
			var modal = document.createElement("div");
			var select2 = document.createElement("select");
			var div = document.createElement("div");
			var textNode = document.createTextNode("to");
			var submit = document.createElement("div");
			var select = document.createElement("select");
			var vals1 = Object.values(joystickAlias);
			var keys1 = Object.keys(joystickAlias);
			var keys2 = Object.keys(funcAlias);
			var vals2 = Object.values(funcAlias);
			var cancel = document.createElement("div");
			var nothing = document.createElement("option");
			var joystick = true;

			if (e.target.id==="newB") {
				joystick = false
				keys1 = Object.keys(buttonAlias);
				vals1 = Object.values(buttonAlias);
			}

			div.id = "setter";
			div.textContent = "Set";
			select.id = "addControl";
			select.setAttribute("placeholder","Button");

			for (var i = 0; i < vals1.length; i++) {
				var optionNode = document.createElement("option");
				optionNode.textContent = vals1[i];
				optionNode.value = keys1[i];
				select.appendChild(optionNode);
			}

			div.appendChild(select);
			div.appendChild(textNode);
			select2.id = "addFunc";
			nothing.value = "nothing";
			nothing.textContent = "Do Nothing";
			select2.appendChild(nothing);

			for (var i = 0; i < keys2.length; i++) {
				if (joystick&&axesFunctions.includes(keys2[i])) {
					var optionNode = document.createElement("option");
					optionNode.textContent = vals2[i];
					optionNode.value = keys2[i];
					select2.appendChild(optionNode);
				} else if (!joystick&&driverButtons.includes(keys2[i])) {
					var optionNode = document.createElement("option");
					optionNode.textContent = vals2[i];
					optionNode.value = keys2[i];
					select2.appendChild(optionNode);
				}
			}

			div.appendChild(select2);
			submit.id = "addCont";
			submit.setAttribute("class","submitBtn");
			submit.textContent = "Add";
			div.appendChild(submit);
			cancel.setAttribute("class","submitBtn");
			cancel.id = "cancel";
			cancel.textContent = "Cancel"
			div.appendChild(cancel);

			modal.setAttribute("class","modal-container");
			modal.id = "changeContainer";
			modal.appendChild(div);
			document.getElementById("keyBinder").appendChild(modal);
		break;
		case "newK":
			var modal = document.createElement("div");
			var modalInner = document.createElement("div");
			var roboTitle = document.createElement("div");
			var innerinner = document.createElement("div");
			var pressedKey = document.createElement("div");
			var addFunc = document.createElement("select");
			var addKey = document.createElement("div");
			var cancelKey = document.createElement("div");
			var node1 = document.createTextNode("to");
			var nothing = document.createElement("option");
			var keys = Object.keys(funcAlias);
			var vals = Object.values(funcAlias);

			modal.setAttribute("class","modal-container");
			modal.id = "newKeybind";
			modalInner.setAttribute("class","modal-inner");
			roboTitle.setAttribute("class", "roboTitle");
			roboTitle.textContent = "Press a key to set it!";
			innerinner.setAttribute("class", "innerinner");
			pressedKey.id = "pressedKey";
			pressedKey.textContent = "Key";
			addFunc.id = "addFunc";
			addKey.id = "addKey";
			addKey.setAttribute("class", "submitBtn");
			addKey.textContent = "Add";
			cancelKey.id = "cancelKey";
			cancelKey.setAttribute("class", "submitBtn");
			cancelKey.textContent = "Cancel";
			nothing.textContent = "Do Nothing";
			nothing.value = "nothing";

			addFunc.appendChild(nothing);
			for (var i = 0; i < keys.length; i++) {
				if (!axesFunctions.includes(keys[i])&&!driverButtons.includes(keys[i])) {
					var optionNode = document.createElement("option");
					optionNode.textContent = vals[i];
					optionNode.value = keys[i];
					addFunc.appendChild(optionNode);
				}
			}
			
			innerinner.appendChild(pressedKey);
			innerinner.appendChild(node1);
			innerinner.appendChild(addFunc);
			innerinner.appendChild(addKey);
			innerinner.appendChild(cancelKey);

			modalInner.appendChild(roboTitle);
			modalInner.appendChild(innerinner);

			modal.appendChild(modalInner);
			document.getElementById("keyBinder").appendChild(modal);
			listener = true;
		break;
		case "cancelKey":
			listener = false;
			document.getElementById("newKeybind").remove();
		break;
		case "cancel":
			document.getElementById("changeContainer").remove();
		break;
		case "addKey":
			listener = false;
			let tempIndex = keyboardIndex[document.getElementById("pressedKey").innerText];
			if (tempIndex<0||!tempIndex) {
				document.getElementById("newKeybind").remove();
				return;
			}
			currentControlSet[document.getElementById("addFunc").value] = keyboardIndex[document.getElementById("pressedKey").innerText];
			document.getElementById("newKeybind").remove();
			saveConfig("operator");
		break;
		case "addCont":
			currentControlSet[document.getElementById("addFunc").value] = document.getElementById("addControl").value;

			var changeCont = document.getElementById("changeContainer");
			if (changeCont) {
				changeCont.remove();
			}
			saveConfig("driver");
		break;
		case "newP":
			var modal = document.createElement("div");
			var modalInner = document.createElement("div");
			var roboTitle = document.createElement("div");
			var innerinner = document.createElement("div");
			var addProf = document.createElement("div");
			var cancelProf = document.createElement("div");
			var profName = document.createElement("input");
			
			modal.setAttribute("class","modal-container");
			modal.id = "newProfile";
			modalInner.setAttribute("class","modal-inner");
			roboTitle.setAttribute("class", "roboTitle");
			roboTitle.textContent = "Name the profile!";
			innerinner.setAttribute("class", "innerinner");
			addProf.id = "addProf";
			addProf.setAttribute("class", "submitBtn");
			addProf.textContent = "Add";
			cancelProf.id = "cancelProf";
			cancelProf.setAttribute("class", "submitBtn");
			cancelProf.textContent = "Cancel";
			profName.setAttribute("type", "text");
			profName.id = "profName";
			
			innerinner.appendChild(profName);
			innerinner.appendChild(addProf);
			innerinner.appendChild(cancelProf);

			modalInner.appendChild(roboTitle);
			modalInner.appendChild(innerinner);

			modal.appendChild(modalInner);
			document.getElementById("keyBinder").appendChild(modal);
			document.getElementById("profName").focus();
		break;
		case "addProf":
			newProfile(document.getElementById("profName").value);
			document.getElementById("newProfile").remove();
		break;
		case "cancelProf":
			document.getElementById("newProfile").remove();
		break;
		case "delP":
			var modal = document.createElement("div");
			var modalInner = document.createElement("div");
			var selProf = document.createElement("select");
			var addProf = document.createElement("div");
			var cancelProf = document.createElement("div");
			var keys = Object.keys(configs);

			modal.setAttribute("class","modal-container");
			modal.id = "newProfile";
			modalInner.setAttribute("class","modal-inner2");
			addProf.id = "delProf";
			addProf.setAttribute("class", "submitBtn");
			addProf.textContent = "Delete";
			cancelProf.id = "cancelProf";
			cancelProf.setAttribute("class", "submitBtn");
			cancelProf.textContent = "Cancel";
			selProf.id = "selProf";

			for (var i = 0; i < keys.length; i++) {
				if (keys[i]!="default") {
					var child = document.createElement("option");
					child.textContent = keys[i];
					child.value = keys[i];
					selProf.appendChild(child);
				}
			}

			modalInner.appendChild(selProf);
			modalInner.appendChild(addProf);
			modalInner.appendChild(cancelProf);
			modal.appendChild(modalInner);

			document.getElementById("keyBinder").appendChild(modal);
		break;
		case "delProf":
			delete configs[document.getElementById("selProf").value];
			currentConfig = "default";
			loadConfig("default");
			updateProfiles();
			updateConfigs();
			document.getElementById("newProfile").remove();
		break;
	}
}

function newProfile(name,resetDefault) {
	if (!name||configs[name]) {
		var i = 0;
		while (configs["Profile "+i]) {
			i++;
		}
		name = "Profile "+i;
	}
	let newProfile = JSON.parse(JSON.stringify(defaultProfile));
	configs[name] = newProfile;	
	updateProfiles();
	configurator.selectedIndex = configurator.children.length-1;
	loadConfig(name);
	currentConfig = name;
	updateConfigs();
}

function updateProfiles() {
	var keys = Object.keys(configs);
	while (configurator.firstChild) {
		configurator.removeChild(configurator.firstChild);
	}
	for (var i = 0; i < keys.length; i++) {
		var child = document.createElement("option");
		child.textContent = keys[i];
		child.value = keys[i];
		configurator.appendChild(child);
	}
}

function parseJSON (json) {
	var str = "";
	var keys = Object.keys(json);
	var vals = Object.values(json);
	for (var i = keys.length-1; i >= 0; i--) {
		str+=keys[i]+":"+vals[i]+",";
	}
	return str.slice(0,-1);
}
