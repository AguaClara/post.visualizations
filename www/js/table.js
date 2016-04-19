function settable(data){ 
  var tabledata = data;
  var column = ["timeFinished","flowRate","flowUnits","coagulantDose","rawWaterTurbidity","settledWaterTurbidity","filteredWaterTurbidity","chlorineDose","entranceWaterLevel","comments"]
  var column2 = ["purpose","timeStarted","timeCollected","repairsDoneOther","backwashTime"]
  var currenttime = new Date(Date.now());
  var datebound = new Date(currenttime.setDate(currenttime.getDate()-7));
  var table = d3.select("#container").append("section").append("table");
  var table2 = d3.select("#container").append("section").append("table").attr("id","extra");
  var entry = tabledata.pop();
  console.log(entry.purpose);
  console.log("plantData" in ["plantData"]);
  var roll = table.append("tr");
  var roll2 = table2.append("tr");
  for(var i in column){
    roll.append("th").html(column[i]);
  }
  for(var i in column2){
    roll2.append("th").html(column2[i]);
  }
  while(new Date(entry.timeStarted)>datebound){
    roll =  table.append("tr");
    roll2 = table2.append("tr");
    console.log(entry.purpose);
    if(entry.purpose.indexOf("plantData")!= -1){
      for(var i in column){
        roll.append("td").html(entry[column[i]]);
      }
    } 
    if(entry.purpose.indexOf("backwash")!= -1|| entry.purpose.indexOf("maintenanceDone")!=-1){
      for(var i in column2){
        roll2.append("td").html(entry[column2[i]]);
      }
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