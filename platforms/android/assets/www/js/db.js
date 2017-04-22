// This "DB" uses the simple key-value pair storage known as local Storage. For now, local storage
// provides a simple way to store two weeks worth of data. If we decide to store more, or for whatever
// reason local storage doesn't work, perhaps we should move to a SQLite plugin within PhoneGap. TBD

// TODO: Use column_string when retrieving data to ease parsing. 

// --------------------------------------Public Methods--------------------------------------------
// Methods to be used from outside scripts. Clearly defined with easy to understand
// pre- and post- conditions

var table_id = "1Sk13vckXZIuOaokQ6tbOkHjRAthBFF7FkgsGaSjD"
var api_key = "&key=AIzaSyAAWkBly-1cwH3rbyLIhoZtJAY3RUHrViM";
var number_of_requested_data_points = 100;

//controls the filter function. options are {"none",one_order_magnitude","two_order_magnitude","three_std","six_std","ten_std"}
var filterFunc = "six_std"


// We only know how many data points there are for a specific plant request when we actually get the response
// but in that response there may be some duplicates that we only discover when putting into the localStorage...
// we should be ensuring that there are no duplicates on the server, but for now Fusion Tables doesn't support this:
// https://code.google.com/p/fusion-tables/issues/detail?can=2&start=0&num=100&q=&colspec=ID%20Type%20Status%20Summary%20Stars%20Component&groupby=&sort=&id=490
// and therefore we just have to update this value two times, one to figure out how many times to insert into localstorage,
// and one to determine how many times to retrieve an item. 
var number_of_returned_data_points = 0;

// These are the items that retrieveAllPlantData won't retrieve
var non_data_storage_items = ["plantName", "columnData"];

function encode_fusion_table_sql(sql_string) {
	var base_url = "https://www.googleapis.com/fusiontables/v2/";
	var initiate_sql_query = "query?sql=";
	url_string = base_url + initiate_sql_query + encodeURIComponent(sql_string) + api_key;
	return url_string
}

// Get all the local plant data.
function retrieveAllPlantData() {
	var plantData = [];
	if (localStorage.length == 0) {
		return plantData
	}
	// Loop through selected localstorage held json strings
	for ( var i = 0; i < number_of_returned_data_points; ++i ) {	
		var key = localStorage.key( i );
		if ($.inArray(key,non_data_storage_items) == -1) {
			var string = localStorage.getItem( localStorage.key( i ) );
			// console.log(string);
			plantData[i] = JSON.parse(string);
		};
	};
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
	var columnData = json_parse(localStorage.getItem('columnData'));
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
function updatePlantData(onSuccess){
	var plantName = getPlantName();
	var sql_query = "SELECT * FROM " + table_id + " WHERE plant=" + "'" + plantName + "'" + " AND rawWaterTurbidity > 0 ORDER BY timeFinished DESC LIMIT " + number_of_requested_data_points;
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
		plantDataDictArray = filterExtremes(plantDataDictArray);
		number_of_returned_data_points = plantDataDictArray.length;
		insertManyPlantData(plantDataDictArray);
		// Call the callback and use the retrieve function to get plantdata
		onSuccess(retrieveAllPlantData(),plantName);
		$('#spinnerDestination').html("");
	})
	.fail(function() {
		alert('Could not sync data. Data sync was not successful and old data is preserved.')
		$('#spinnerDestination').html("");
	});
}

// ----------------------------------------Private Methods/script------------------------------------------
// This part of the script is used internally. 


// Inserts a list of plant data records into local storage
function insertManyPlantData(plantData) {
	for ( var i = 0, len = plantData.length; i < len; ++i ) {
		localStorage.setItem(plantData[i].timeStarted, JSON.stringify(plantData[i]));
	}
	number_of_returned_data_points = localStorage.length - non_data_storage_items.length;
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
		"ccom":"CuatroComunidades", 
		"doto":"Otoro", 
		"mar1":"Marcala", 
		"moro":"Moroceli", 
		"smat":"Matias", 
		"snic":"SanNicolas", 
		"tam":"Tamara",
		"lasv":"LasVegas",
		"sjg":"SanJuanGuarita"
	}
};

// passed as a filter guard in filterExtremes. Control this by changing the global [filterFunc] variable
function checkSanity(datum){
	var guards = {
		"none": true,
		"one_order_magnitude":datum[this.param] <= this.mean*10,
		"two_order_magnitude":datum[this.param] <= this.mean*100,
		"three_std":(datum[this.param] >= this.mean - 3.0*this.sd) && (datum[this.param] <= this.mean + 3.0*this.sd),
		"six_std":(datum[this.param] >= this.mean - 6.0*this.sd) && (datum[this.param] <= this.mean + 6.0*this.sd),
		"ten_std":(datum[this.param] >= this.mean - 10.0*this.sd) && (datum[this.param] <= this.mean + 10.0*this.sd),
	}
	//check boundaries, skip if NaN
	if ( isNaN(datum[this.param]) || guards[filterFunc]){
		return true;
	}
	//log removed values
	else {
		console.log("removed " + this.param + "=" + datum[this.param] + " --> above or below " + filterFunc)
	}
}

function filterExtremes(plantDataDictArray){
	var params = ['rawWaterTurbidity', 'settledWaterTurbidity', 'filteredWaterTurbidity'];

	params.forEach(function(param) {
		var sum = 0;
		var sumsq = 0;
		var l = 1
		for (var i = 0; i<plantDataDictArray.length; ++i){
			if (!isNaN(plantDataDictArray[i][param])) {
				sum += Number(plantDataDictArray[i][param]);
				sumsq += Number(plantDataDictArray[i][param])*Number(plantDataDictArray[i][param]);
				l += 1
			}
		}
		var mean = sum/l; 		
		var variance = sumsq / l - mean*mean;
		var sd = Math.sqrt(variance);
		plantDataDictArray=plantDataDictArray.filter(checkSanity,{"param":param,"mean":mean,"sd":sd});
	})
	return plantDataDictArray;
};