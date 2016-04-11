// This "DB" uses the simple key-value pair storage known as local Storage. For now, local storage
// provides a simple way to store two weeks worth of data. If we decide to store more, or for whatever
// reason local storage doesn't work, perhaps we should move to a SQLite plugin within PhoneGap. TBD

// --------------------------------------Public Methods--------------------------------------------
// Methods to be used from outside scripts. Clearly defined with easy to understand
// pre- and post- conditions

// Get all the local plant data. If there is no plant data locally, this will return an empty list.
function retrieveAllPlantData() {
	var maxKey = localStorage.getItem('maxKey');
	var minKey = localStorage.getItem('minKey');
	var plantData = [];
	for (i = minKey; i < maxKey; i++) {
		plantData[i-minKey]=JSON.parse(localStorage.getItem(i));
	}
	return plantData
}

// Load any string from local storage.
function load(key) {
	localStorage.getItem(key);
}

// Asynchronous function to download plant data and store it locally. Input callback function.
function updatePlantData(onSuccess){
	$.getJSON("past_data.json", function(json) {
		insertManyPlantData(json);
		writeMetaStats(json);
		onSuccess(json)
	});
}

// ----------------------------------------Private Methods/script------------------------------------------
// This part of the script is used internally. 

// Start everything up
$(document).ready(onDeviceReady())
function onDeviceReady() {
	deleteOldPlantData();
}

// Inserts a list of plant data records into local storage
function insertManyPlantData(plantData) {
	for (i in plantData) {
		setPlantDataRecord(plantData[i])
	}
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

//TODO Functions
function askForPlantName(){
	return 'moro'
};
function deleteOldPlantData(){};