function settable(data){
  var tabledata = data;
  var currenttime = new Date(Date.now());
  var datebound = new Date(currenttime.setDate(currenttime.getDate()-7));
  var table = d3.select("#table").append("table");
  var entry = tabledata.pop();
  var roll = table.append("tr");
  for(var i in entry){
    roll.append("th").html(i);
  }
  while(new Date(entry.timeStarted)>datebound){
    roll =  table.append("tr");
    for(var i in entry){
      roll.append("td").html(entry[i]);
    }
    entry = tabledata.pop();
  }
}


$(document).ready(function() { 
  connectSyncButton();

  data = retrieveAllPlantData();
  if (data.length > 0) {
    settable(data);
  }
});