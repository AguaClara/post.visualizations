// This "DB" uses the simple key-value pair storage known as local Storage. For now, local storage
// provides a simple way to store two weeks worth of data. If we decide to store more, or for whatever
// reason local storage doesn't work, perhaps we should move to a SQLite plugin within PhoneGap. TBD


// Start everything up
$(document).ready(onDeviceReady())
function onDeviceReady() {
	deleteOldPlantData();
	// updatePlantData(console.log);
}

// Inserts a list of plant data records into local storage
function insertManyPlantData(plantData) {
	for (i in plantData) {
		setPlantDataRecord(plantData[i])
	}
}

// Get all the local plant data. If there is no plant data locally, this will return null.
function retrieveAllPlantData() {
	var maxKey = localStorage.getItem('maxKey');
	var minKey = localStorage.getItem('minKey');
	var plantData = [];
	for (i = minKey; i < maxKey; i++) {
		plantData[i-minKey]=JSON.parse(localStorage.getItem(i));
	}
	return plantData
}

function load(key) {
	localStorage.getItem(key);
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
	localStorage.setItem('minDate', json[0].date_submitted);
	localStorage.setItem('maxDate', json[json.length-1].date_submitted);
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

// Asynchronous function to download plant data and store it locally. Input callback function.
function updatePlantData(onSuccess){
	$.getJSON("past_data_shortened.json", function(json) {
		insertManyPlantData(json);
		writeMetaStats(json);
		onSuccess(json)
	});
}

//TODO Functions
function askForPlantName(){
	return 'moro'
};
function deleteOldPlantData(){};