var es_ES = {
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["€", ""],
  "dateTime": "%a %b %e %X %Y",
  "date": "%d/%m/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
  "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
};

var ES = d3.locale(es_ES);
var EsDateFormat = ES.timeFormat("%d %b, %Y; %I:%M %p"); //Format datetimes in table

table1Dict = {"timeFinished":"Hora de<br/>finalización",
              "flowRate":"Caudal<br/>(L/s)", //CHECK THAT EVERYTHING HAS THESE UNITS
              "coagulantDose":"Dosis de<br/>coagulantes (mg/L)",
              "rawWaterTurbidity":"Turbiedad de agua<br/>cruda (NTU)",
              "settledWaterTurbidity":"Turbiedad de agua<br/>decantada (NTU)",
              "filteredWaterTurbidity":"Turbiedad de agua<br/>filtrada (NTU)",
              "chlorineDose":"Dosis de<br/>cloro (mg/L)",
              "entranceWaterLevel":"Nivel de agua en la caja<br/>de entrada al filtro (cm)",
              "comments":"Comentarios<br/><span style='opacity:0'>--</span>"};

table2Dict = {"purpose":"Propósito",
              "timeStarted":"Fecha de registro",
              "timeCollected":"Hora de recoger los datos",
              "repairsDoneOther":"Mantenimientos hechos",
              "backwashTime":"Hora de retrolavado"};


/*Create two tables featuring plant data and maintenance reports.*/
function settable(data, codeList){ 
  //clear out old tables, to avoid weird accumulations
  $("#container").empty();
  $("#container2").empty();

  var tabledata = data;
  console.log(tabledata.length);

  var column = Object.keys(table1Dict);
  var column2 = Object.keys(table2Dict);
  
  var currenttime = new Date(Date.now());
  var datebound = new Date(currenttime.setDate(currenttime.getDate()-7));
  
  var table = d3.select("#container")
                  .append("section")
                  .append("table")
                    .attr("class","centered striped responsive-table")
                    .attr("id","table1");
  
  var table2 = d3.select("#container2")
                    .append("section")
                    .append("table")
                      .attr("id","table2")
                      .attr("class","centered striped responsive-table");

  var graph = d3.select("#container3")
                    .append("section")
                    .append("graph")
                    .attr('id', 'graph1')
                    .attr("class", "");
  // for(var i in tabledata){
  //   console.log(i);
  //   console.log(tabledata[i]);
  // }
  var entry = tabledata[0];


  // console.log(entry);
  //console.log("plantData" in ["plantData"]);
  var roll = table.append("thead").append("tr");
  var roll2 = table2.append("thead").append("tr");
  for(var i in column){
    roll.append("th").html(table1Dict[column[i]]).attr("data-field", column[i]);
  }
  roll = table.append("tbody");
  for(var i in column2){
    roll2.append("th").html(table2Dict[column2[i]]);
  }
  roll2 = table2.append("tbody");

  for(var q=1; q<=tabledata.length; q++){

    if(new Date(entry.timeStarted)>datebound){    
      if(entry.purpose.indexOf("plantData")!= -1){
        console.log(entry);
        var r = roll.append("tr");

        for(var i in column){
          if (column[i] == "timeFinished"){
            r.append("td").html(EsDateFormat(new Date(entry[column[i]])) + "<br/><span style='opacity:0'>--</span>");
          }else if(column[i]=="flowRate" && entry["flowUnits"]=="Galpmin"){
            r.append("td").html(Math.round((entry[column[i]]/15.8503) * 100) / 100 + "<br/><span style='opacity:0'>--</span>"); //Flow rate conversion
          }else{
            r.append("td").html(entry[column[i]] + "<br/><span style='opacity:0'>--</span>");
          }
        }
      } 
      if(entry.purpose.indexOf("backwash")!= -1|| entry.purpose.indexOf("maintenanceDone")!=-1){
        var r2 = roll2.append("tr");
        for(var i in column2){
          if(entry[column2[i]]==null){ r2.append("td").html("--");}
          else if (column2[i]=="timeStarted"){
            r2.append("td").html(EsDateFormat(new Date(entry[column2[i]])));
          }else if(column2[i]=="timeCollected" || column2[i]=="backwashTime"){
            r2.append("td").html(entry[column2[i]].slice(0,5));
          }else{
            r2.append("td").html(entry[column2[i]]);
          }
        }
      }
      
    }
    if(q!=tabledata.length) entry = tabledata[q];
  }

  // console.log(tabledata.length);
  // console.log(count);

  //Make graph here
}


$(document).ready(function() { 
  connectSyncButton();

  data = retrieveAllPlantData();
  if (data.length > 0) {
    settable(data, null);
  }
});