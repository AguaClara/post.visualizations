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

var colors; 
var purposeTag = "plantData"; //These will be defined with numerical values

var plantCoords = [
  {"lat": 14.446363, "longi" : -87.265564, "name":"Agalteca", "code":"aga"},
  {"lat": 13.852931, "longi" : -86.685029, "name":"Alauca","code":"ala"},
  {"lat": 14.929551, "longi" : -88.490029, "name":"Atima", "code":"ati"},
  {"lat": 14.248744, "longi" : -87.412891, "name":"Cuatro Comunidades", "code":"ccom"},
  {"lat": 14.492795, "longi" : -87.977579, "name":"Jesus de Otoro", "code":"doto"},
  {"lat": 14.156052, "longi" : -88.036309, "name":"Marcala", "code":"mar1"},
  {"lat": 14.123442, "longi" : -86.869707, "name":"Moroceli", "code":"moro"},
  {"lat": 13.980974, "longi" : -86.623315, "name":"San Matias", "code":"smat"},
  {"lat": 15.000367, "longi" : -88.731957, "name":"San Nicolas", "code":"snic"},
  {"lat": 14.189934, "longi" : -87.331426, "name":"Tamara", "code":"tam"}
];

var units = {
 "rawWaterTurbidity":"NTU",
 "settledWaterTurbidity":"NTU",
 "coagulantDose":"mg/L",
 "flowRate":"L/s",
 "filteredWaterTurbidity":"NTU"
};

var dataTypes = {
 "rawWaterTurbidity":"Turbiedad de agua cruda",
 "settledWaterTurbidity":"Turbiedad de agua decantada",
 "filteredWaterTurbidity":"Turbiedad de agua filtrada",
 "coagulantDose":"Dosis de coagulantes" 
};

var dataSave;
var svg;
var matches; //Currently selected checkboxes

/* Create plot .........................................................*/
var height = 350;
var width = 290;
var plot_padding_right = 45;
var plot_padding_left = 45;
var plot_padding_bottom = 72;
var plot_padding_top = 20;

/* Create and draw axes ................................................*/
var xScale; var yScale; var xAxis; var yAxis0;
var xMin;
var xMax;

//Add togglable checkboxes to page
function makeCheckboxes(){
  selected = "";
  var formText = "<form action='.'>";
  check = true;
  for(var key in dataTypes){
    val = dataTypes[key];
    formText+='<div class="cb_pad"><input type="checkbox" class="filled-in" id="'+key+'" name="dtype" value="'+key+'"';
    if (check){formText+=" checked";check=false; selected = key;} //Check the first item just to demonstrate
    formText+='/><label for="'+key+'"><span class="checkboxtext">'+val+'</span></label><br/></div>';
  };
  formText += "</div></form>";

  $(".checkboxesForm").empty();
  $(".checkboxesForm").html(formText);
  return selected;
}

// visualize function sorts the data and redraws the plot. To be used when the localStorage is updated. 
function visualize(data, codeList) { 
  // empty any previous plot
  $('#plot').empty();
  // sort data by type
  data = data.filter(function(elem){return elem["purpose"] == purposeTag;}) //clear out dataless entries
  /*for(var key in dataTypes){
    //Don't include anything with a null field as visualization will morph with switches b/n types
    data = data.filter(function(elem){return !isNaN(elem[key]) && elem[key]!=null && elem[key]!="NaN" && elem[key]!=""});
  }
  */
  data = data.filter(function(elem){return ($.inArray(elem.plant, codeList)>-1) ;});
  data = data.sort(sortByDateAscending);
  dataSave =data; //scoping is very important here!! GLOBAL VARIABLE


  colors = d3.scale.category10().domain( Object.keys(dataTypes) );

  svg = d3.select("#plot").append("svg")
    .attr("height", height)
    .attr("width", width);  

  preSelectedItem = makeCheckboxes();
  matches = [preSelectedItem];
  drawPlot(dataSave, "Moroceli", matches); 
  respondToCheckBox(codeList);
}

/* Sort input data by date .............................................*/
function sortByDateAscending(a, b) {
  // Dates will be cast to numbers automagically:
  return new Date(a.timeFinished) - new Date(b.timeFinished);
}

makeXScale = function(data){
  //Can take first and last because they are already sorted
  xMin = new Date(data[0].timeFinished);
  xMax = new Date(data[data.length-1].timeFinished);
  xScale = d3.time.scale()
    .domain([xMin, xMax])
    .range([plot_padding_left, width-plot_padding_right]);
  return xScale;
}

drawXAxis = function(xScale){
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickFormat(ES.timeFormat("%d %b %y"));
    
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate("+0+", " + (height-plot_padding_bottom) + ")")
    .call(xAxis)
    .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d) {
          return "rotate(-65)" 
          });
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", (width- plot_padding_left - plot_padding_right)/2.0 + plot_padding_left)
    .attr("y", height - 6)
    .text("Fecha");
}

makeYScale = function(data, attr_name){
  var yScale = d3.scale.linear()
    .domain([0, d3.max(data, function (d) {if (!isNaN(d[attr_name])){return d[attr_name]; }})])
    .range([height-plot_padding_bottom, plot_padding_top]);
  return yScale;
}

drawYAxis = function(yScale, attr_name){
  var yAxis = d3.svg.axis().scale(yScale).orient("left");
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + plot_padding_left + ", "+ 0+")")
    .call(yAxis);

  svg.append("text")
    .attr("class", "y label 1")
    .attr("text-anchor", "middle")
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90) translate("+ (-(height - plot_padding_top - plot_padding_bottom)/2.0 - plot_padding_top) +" 3)")
    .text( dataTypes[attr_name] + " (" + units[attr_name] + ")")
    .attr("fill",  colors(attr_name));
}

drawSecondYAxis = function(yScale, attr_name){
  var yAxis = d3.svg.axis().scale(yScale).orient("right");
  svg.append("g")
    .attr("class", "axis")
    .attr("id", "secondaxis")
    .attr("transform", "translate(" + (width - plot_padding_right) + ", "+ 0+")")
    .call(yAxis);

  svg.append("text")
    .attr("class", "y label 2")
    .attr("text-anchor", "middle")
    .attr("dy", ".75em")
    .attr("transform", "rotate(-270) translate( "+((height - plot_padding_bottom - plot_padding_top)/2.0 + plot_padding_top) +" "+(-width+3)+")")
    .text( dataTypes[attr_name] + " (" + units[attr_name] + ")")
    .attr("fill",  colors(attr_name));
}

/* Make the line graph .................................................*/
function drawLines(data, xScale, yScale, attr_name, codeList, second_attr){
  if (second_attr == undefined) {
    second_attr = null;
  }
  var lineGen = d3.svg.line()
    .x(function(d) {
        return xScale(new Date(d.timeFinished));
    })
    .y(function(d) {
        return yScale(d[attr_name]);
    })
    .defined(function(d) { 
      return (!(isNaN(d[attr_name]) || d[attr_name]==null || d[attr_name]=="NaN" || isNaN(yScale(d[attr_name])))); 
    });  


  //Draw the line graph for each plant with code in codelist
  svg.selectAll("#linegraphline"+attr_name).remove();
  if (lineGen(data)!=null){
    //Check if this code was selected in order to draw it
    plantCode = data[0].plant;

      svg.append('g').append("path")
        .attr('d', lineGen(data))
        .attr('stroke', function(){
          return colors(attr_name); 
        }) 
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr("id", "linegraphline"+attr_name);
  }  
}       

//if the same units, we want to know so we can use the same scale
//codelist has two items and they are the same
function isSameUnits(codelist, units){
  return codelist.length==2 && units[codelist[0]]==units[codelist[1]];
}

//return the name of the field that has the larger scale
function hasMaxScale(data, codelist){
  max1 = d3.max(data, function (d) {if (!isNaN(d[codelist[0]])){return d[codelist[0]]; }});
  max2 = d3.max(data, function (d) {if (!isNaN(d[codelist[1]])){return d[codelist[1]]; }});
  if(max1 > max2){return codelist[0];} 
  else if(max2 > max1){return codelist[1];}
  else if(max1==max2 && max1!=undefined){return codelist[0];} 
  else if(max1!=undefined && max2==undefined){return codelist[0];}//Do separately because of awful JS handling of null type
  else if(max1==undefined && max2!=undefined){return codelist[1];}
  return null;
}

/* code = 
 * selectedList = len 1 or 2 of checkboxes that have been checked
 */
function drawPlot(data, code, selectedList, codeList){
  svg.selectAll(".axis").remove();
  svg.selectAll("path").remove();
  svg.selectAll("text").remove();

  xScale = makeXScale(data);
  drawXAxis(xScale);

  //Both selected are in the same units. Standardize the scale
  if (isSameUnits(selectedList, units)){
    attr1 = selectedList[0];
    attr2 = selectedList[1];
    maxField = hasMaxScale(data, selectedList); //ID of the scale with the larger range.

    if (maxField!=null){
      yScale = makeYScale(data, maxField); 
      drawYAxis(yScale, attr1);
      drawLines(data, xScale, yScale, attr1, codeList);

      yScale2 = makeYScale(data, maxField);
      drawSecondYAxis(yScale2, attr2);
      drawLines(data, xScale, yScale2, attr2, codeList);
    }
  }
  // Different units, so keep whatever scale the unit has alone
  else if (selectedList.length>=1){
    attr1 = selectedList[0];

    yScale = makeYScale(data, attr1);
    drawYAxis(yScale, attr1);
    drawLines(data, xScale, yScale, attr1, codeList);

    if (selectedList.length==2){
      attr2 = selectedList[1];

      yScale2 = makeYScale(data, attr2);
      drawSecondYAxis(yScale2, attr2);
      drawLines(data, xScale, yScale2, attr2, codeList);
    }
  }
}

function respondToCheckBox(codeList){
  $(".filled-in").on("click", function() {
    if ($.inArray(this.value, matches)==-1){
      matches.push(this.value);
    }else{
      ind = matches.indexOf(this.value);
      matches.splice(ind,1);
    }
    
    if (matches.length == 3){
      removed = matches.shift();
      $(".filled-in").prop("checked", false);
    } 
    filtered = dataSave; 
    matches.forEach(function(m){
      $('#'+m).prop("checked", true);
    });

    drawPlot(filtered, "Moroceli", matches, codeList);
  });
}

function initViz(codeList){
  data = retrieveAllPlantData();
  if (data.length > 0) {
    visualize(data, codeList);
  }else{
  }
}

// function initTracking(){
//   window.analytics.startTrackerWithId('UA-76711924-2');
// }

//with callbakc 
//updatePlantData();


$(document).ready(function() { 
  //Hardcoded to just be Moroceli for now...
  var codeList = [askForPlantName()]; //list of currently chosen plants (by code)
  connectSyncButton();
  initViz(codeList);
             

});

//Wouldn't it be cool if they could sweep a vertical bar over the data and 
//see what the exact values were?