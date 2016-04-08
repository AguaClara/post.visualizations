// This "DB" uses the simple key-value pair storage known as local Storage. For now, local storage
// provides a simple way to store two weeks worth of data. If we decide to store more, or for whatever
// reason local storage doesn't work, perhaps we should move to a SQLite plugin within PhoneGap. TBD


// Start everything up
$(document).ready(onDeviceReady())
function onDeviceReady() {
	deleteOldPlantData();
	updatePlantData();
}

// Inserts a list of plant data records into local storage
function insertManyPlantData(plantData) {
	for (i in plantData) {
		setPlantDataRecord(plantData[i])
	}
}

function retrieveAllPlantData() {
	var maxKey = localStorage.getItem('maxKey');
	var minKey = localStorage.getItem('minKey');
	var plantData = [];
	for (i = minKey; i < maxKey; i++) {
		plantData[i-minKey]=localStorage.getItem(i);
	}
	return plantData
}

// Put the plant data record into storage
function setPlantDataRecord(plantDataRecord) {
	localStorage.setItem(plantDataRecord.pid, JSON.stringify(plantDataRecord));
}

// MetaStats is an object that will store all of the persistent data, such as 
// plant data, and the range of keys currently held in local storage
function initializeMetaStats(json) {
	var plantName = askForPlantName();
	localStorage.setItem('plantName', plantName);
	localStorage.setItem('minKey', json[0].pid);
	localStorage.setItem('maxKey', json[json.length-1].pid);
}
function writeMetaStats(json) {
	var minKey = localStorage.getItem('minKey');
	if (minKey == null) {
		initializeMetaStats(json);
	}
	else {
		localStorage.setItem('maxKey', json[json.length-1].pid);
	}
}

function updatePlantData(latestPlantDataKey){
	$.getJSON("past_data_shortened.json", function(json) {
		insertManyPlantData(json);
		writeMetaStats(json);
	});
}

//TODO Functions
function askForPlantName(){};
function deleteOldPlantData(){};