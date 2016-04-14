function settable(data){
  var tabledata = data;
  var currenttime = new Date("2016-02-03");
  var datebound = new Date(currenttime.setDate(currenttime.getDate()-7));
  var table = d3.select("#table").append("table");
  var entry = data.pop();
  var roll = table.append("tr");
  for(var i in entry){
    roll.append("th").html(i);
  }
  while(new Date(entry.date_submitted)>datebound){
    roll =  table.append("tr");
    for(var i in entry){
      roll.append("td").html(entry[i]);
    }
    entry = tabledata.pop();
  }
}