var colors; 

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
 "rawWaterTurbidity":"Raw Turbidity",
 "settledWaterTurbidity":"Settled Turbidity",
 "filteredWaterTurbidity":"Filtered Turbidity",
 "coagulantDose":"Coagulant" 
};

//Hardcoded to just be Moroceli for now...
var codeList = ["Moroceli"]; //list of currently chosen plants (by code)

var data;
var svg;
var matches; //Currently selected checkboxes

/* Create plot .........................................................*/
var height = 350;
var width = 290;
var plot_padding_right = 42;
var plot_padding_left = 42;
var plot_padding_bottom = 62;
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

  $(".checkboxesForm").html(formText);
  return selected;
}

function visualize(data) {   
  data = data.sort(sortByDateAscending);

  colors = d3.scale.category10().domain( Object.keys(dataTypes) );

  svg = d3.select("#plot").append("svg")
    .attr("height", height)
    .attr("width", width);  

  preSelectedItem = makeCheckboxes();
  matches = [preSelectedItem];
  drawPlot(data.filter(function(elem){return elem[preSelectedItem] != null;}), "Moroceli", matches);
}

/* Sort input data by date .............................................*/
function sortByDateAscending(a, b) {
  // Dates will be cast to numbers automagically:
  return new Date(a.timeStarted) - new Date(b.timeStarted);
}

makeXScale = function(data){
  //Can take first and last because they are already sorted
  xMin = new Date(data[0].timeStarted);
  xMax = new Date(data[data.length-1].timeStarted);
  xScale = d3.time.scale()
    .domain([xMin, xMax])
    .range([plot_padding_left, width-plot_padding_right]);
  return xScale;
}

drawXAxis = function(xScale){
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");
    
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
    .text("Time");
}

makeYScale = function(data, attr_name){
  var yScale = d3.scale.linear()
    .domain([0, d3.max(data, function (d) {return d[attr_name]; })])
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
    
    .text( dataTypes[attr_name] + " (" + units[attr_name] + ")");
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
    .text( dataTypes[attr_name] + " (" + units[attr_name] + ")");
}

/* Make the line graph .................................................*/
function drawLines(data, xScale, yScale, attr_name, codeList){
  var lineGen = d3.svg.line()
    .x(function(d) {
        return xScale(new Date(d.timeStarted));
    })
    .y(function(d) {
        return yScale(d[attr_name]);
    })
    .defined(function(d) { 
      return !isNaN(d[attr_name]) && d[attr_name]!=null; 
    });  

  //Draw the line graph for each plant with code in codelist
  svg.selectAll("#linegraphline"+attr_name).remove();

  //Check if this code was selected in order to draw it
  plantCode = data[0].plant;

  filtered = data.filter(function(elem){return elem[attr_name] != null;})
  
  if ($.inArray(plantCode, codeList)>-1){
    svg.append('g').append("path")
      .attr('d', lineGen(filtered))
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
  max1 = d3.max(data, function (d) {return d[codelist[0]]; });
  max2 = d3.max(data, function (d) {return d[codelist[1]]; });
  if(max1 > max2){return codelist[0];} return codelist[1];
}

/* code = 
 * selectedList = len 1 or 2 of checkboxes that have been checked
 */
function drawPlot(data, code, selectedList){
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
    
    yScale = makeYScale(data, maxField); 
    drawYAxis(yScale, attr1);
    drawLines(data, xScale, yScale, attr1, codeList);

    yScale2 = makeYScale(data, maxField);
    drawSecondYAxis(yScale2, attr2);
    drawLines(data, xScale, yScale2, attr2, codeList);
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


//with callbakc 
//updatePlantData();


$(document).ready(function() { 
  connectSyncButton();

  data = retrieveAllPlantData();
  if (data.length > 0) {
    visualize(data)
  }
    
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
    filtered = data; 
    matches.forEach(function(m){
      $('#'+m).prop("checked", true);
      filtered = filtered.filter(function(elem){return elem[m] != null;})
    });

    drawPlot(filtered, "Moroceli", matches);
  });
});

//Wouldn't it be cool if they could sweep a vertical bar over the data and 
//see what the exact values were?