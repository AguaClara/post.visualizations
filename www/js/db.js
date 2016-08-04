// This "DB" uses the simple key-value pair storage known as local Storage. For now, local storage
// provides a simple way to store two weeks worth of data. If we decide to store more, or for whatever
// reason local storage doesn't work, perhaps we should move to a SQLite plugin within PhoneGap. TBD

// TODO: Use column_string when retrieving data to ease parsing. 

// --------------------------------------Public Methods--------------------------------------------
// Methods to be used from outside scripts. Clearly defined with easy to understand
// pre- and post- conditions

var table_id = "10IZcGT_2mHKS8cLOcvB_4BSj0LEFDKS5eJhPrGqE"
var number_of_requested_data_points = 100;

// We only know how many data points there are for a specific plant request when we actually get the response
// but in that response there may be some duplicates that we only discover when putting into the localStorage...
// we should be ensuring that there are no duplicates on the server, but for now Fusion Tables doesn't support this:
// https://code.google.com/p/fusion-tables/issues/detail?can=2&start=0&num=100&q=&colspec=ID%20Type%20Status%20Summary%20Stars%20Component&groupby=&sort=&id=490
// and therefore we just have to update this value two times, one to figure out how many times to insert into localstorage,
// and one to determine how many times to retrieve an item. 
var number_of_returned_data_points = 0;

// This is the number of things stored in localStorage that are not a row of Json data
var number_of_non_data_storage_items = 2;

function encode_fusion_table_sql(sql_string) {
	var base_url = "https://www.googleapis.com/fusiontables/v2/";
	var initiate_sql_query = "query?sql=";
	var api_key = "&key=AIzaSyB9wik36h46yNJznjYjUTXHOu5py9anRFY";
	url_string = base_url + initiate_sql_query + encodeURIComponent(sql_string) + api_key;
	return url_string
}

// Get all the local plant data. If there is no plant data locally, this will return an empty list. If you don't 
// specify a column_string, this will return all of the columns
function retrieveAllPlantData(column_string) {
	var plantData = [];
	if (localStorage.length <= number_of_non_data_storage_items) {
		return plantData
	}
	// Loop through selected localstorage held json strings
	if (column_string == undefined) {
		for ( var i = 0; i < number_of_returned_data_points; ++i ) {	
			plantData[i] = JSON.parse(localStorage.getItem( localStorage.key( i ) ));
		}
	}
	else {
		for ( var i = 0; i < number_of_returned_data_points; ++i ) {
			// Set default start and stop indices if left undefined
			plantData[i] = JSON.parse(localStorage.getItem( localStorage.key( i ) ))[getColumnIndex(column_string)];
		}
	}
	return plantData
}

// Load any string from local storage.
function load(key) {
	return localStorage.getItem(key);
}

// Save any string key, value pair to local storage
function save(key, value) {
	localStorage.setItem(key, value);
}

// Get the index of the row arrays that columnString appears on. This relies on localStorage being populated.
function getColumnIndex(columnString) {
	var columnData = JSON.parse(localStorage.getItem('columnData'));
	return columnData.indexOf(column_string);
}

// Put data into dictionary... Specifically make and array of rows (arrays) that have fields specified by 
// column array into an array of disctionaries
function makeDictionary(rowArray, columnArray) {
	var plantDataDictArray = [];
	for ( var i = 0, rowLen = rowArray.length; i < rowLen; ++i ) {
		plantDataDictArray[i] = {};
		for ( var j = 0, colLen = columnArray.length; j < colLen; ++j ) {
			plantDataDictArray[i][columnArray[j]]=rowArray[i][j];
		}
	}
	return plantDataDictArray
}


// Asynchronous function to download plant data and store it locally. Input callback function. 
// The onSuccess(data) function must take in an array of data objects.
// TODO: onFailure. 
function updatePlantData(onSuccess, onFailure){
	var plantName = getPlantName();
	var sql_query = "SELECT * FROM " + table_id + " WHERE plant=" + "'" + plantName + "'" + " ORDER BY timeFinished DESC LIMIT " + number_of_requested_data_points;
	sql_query_url = encode_fusion_table_sql(sql_query);
	console.log(sql_query_url);
	// Get the JSON corresponding to the encoded sql string
	$.getJSON(sql_query_url, function(json) {
		deleteOldPlantData();
		save('columnData', JSON.stringify(json.columns));
		if (json.rows == null){
			json.rows = [];
			json.columns = [];
		}
		// Save plant data into the local storage
		var plantDataDictArray = makeDictionary(json.rows, json.columns);
		number_of_returned_data_points = json.rows.length;
		insertManyPlantData(plantDataDictArray);
		// Call the callback and use the retrieve function to get plantdata
		onSuccess(retrieveAllPlantData(),plantName);
		$('#spinnerDestination').html("");
	})
	.fail(function() {
		alert('Could not sync data. Data sync was not successful and old data is preserved.')
		onFailure();
		$('#spinnerDestination').html("");
	});
}

// ----------------------------------------Private Methods/script------------------------------------------
// This part of the script is used internally. 

// Initialize the sync button
function connectSyncButton() {
	$('#sync-viz').click(function() {
		var codeList = [getPlantName()];
		addSpinner('#spinnerDestination');
		updatePlantData(visualize, codeList);
	});
	$('#sync-table').click(function(){
		var codeList = [getPlantName()];
		addSpinner('#spinnerDestination');
		updatePlantData(settable, codeList);
	});
}

/*Add a beautiful Materialize loading spinner to the page!*/
function addSpinner(spinnerDest){
	spinnerCode = ''+
		'<div class="preloader-wrapper small active">'+ 
          '<div class="spinner-layer spinner-green-only" >'+
            '<div class="circle-clipper left">'+
              '<div class="circle"></div>'+
            '</div><div class="gap-patch">' +
              '<div class="circle"></div>'+
            '</div><div class="circle-clipper right">'+
              '<div class="circle"></div>'+
            '</div>'+
          '</div>'+
        '</div>';
	$(spinnerDest).html(spinnerCode);
}

// Inserts a list of plant data records into local storage
function insertManyPlantData(plantData) {
	for ( var i = 0, len = plantData.length; i < len; ++i ) {
		localStorage.setItem(plantData[i].timeStarted, JSON.stringify(plantData[i]));
	}
	number_of_returned_data_points = localStorage.length - number_of_non_data_storage_items;
}

// Delete all plant data without losing the persistant data like plantname
function deleteOldPlantData(){
	plantName = load('plantName')
	localStorage.clear();
	save('plantName',plantName)
};

function getPlantName(){
	if(load("plantName")==undefined){return null;}
	return load("plantName");
};

function getAllPlantsDict(){
	return {
		"aga":"Agalteca", 
		"ala":"Alauca",
		"ati":"Atima", 
		"ccom":"Cuatro Comunidades", 
		"doto":"Otoro", 
		"mar1":"Marcala", 
		"moro":"Moroceli", 
		"smat":"San Matias", 
		"snic":"San Nicolas", 
		"tam":"Tamara"
	}
};