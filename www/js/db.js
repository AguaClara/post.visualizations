// This "DB" uses the simple key-value pair storage known as local Storage. For now, local storage
// provides a simple way to store two weeks worth of data. If we decide to store more, or for whatever
// reason local storage doesn't work, perhaps we should move to a SQLite plugin within PhoneGap. TBD

// --------------------------------------Public Methods--------------------------------------------
// Methods to be used from outside scripts. Clearly defined with easy to understand
// pre- and post- conditions

// Get all the local plant data. If there is no plant data locally, this will return an empty list.
function retrieveAllPlantData() {
	var plantData = [];
	for ( var i = 0, len = localStorage.length-3; i < len; ++i ) {
  	 plantData[i] = JSON.parse(localStorage.getItem( localStorage.key( i ) ) );
	}
	return plantData
}

// Load any string from local storage.
function load(key) {
	localStorage.getItem(key);
}

// Asynchronous function to download plant data and store it locally. Input callback function. 
// TODO: Return an 
// error dialog if the update failed for whatever reason, and leave the local storage untouched.
function updatePlantData(onSuccess){
	$.getJSON("Datos_v1_2_results.json", function(json) {
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
	localStorage.setItem(plantDataRecord.timeStarted, JSON.stringify(plantDataRecord));
}

// MetaStats is an object that will store all of the persistent data, such as 
// plant data, and the range of keys currently held in local storage
function initializeMetaStats(json) {
	var plantName = askForPlantName();
	localStorage.setItem('plantName', plantName);
	localStorage.setItem('minDate', json[0].date_submitted);
	localStorage.setItem('maxDate', json[json.length-1].date_submitted);
}
function writeMetaStats(json) {
	var minDate = localStorage.getItem('minDate');
	if (minDate == null) {
		initializeMetaStats(json);
	}
	else {
		localStorage.setItem('minDate', json[json.length-1].timeStarted);
	}
}

//TODO Functions

// Asynchronous function to update the locally stored plant data. 
function checkForUpdate(){}

function askForPlantName(){
	return 'Moroceli'
};
function deleteOldPlantData(){};