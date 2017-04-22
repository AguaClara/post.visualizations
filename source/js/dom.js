/******************************************************************************
		This script contains functions which modify the DOM
******************************************************************************/


/*index.html-----------------------------------------------------------------*/

/* Dynamically display plant name */
function addDatosHeader(){
	var pname = getPlantName();
	if(pname != null){
		$("#datosHeader").html("Datos Sobre la Planta de "+pname);
	}
	else {
		$("#datosHeader").html("Datos Sobre la Planta");
	}
}

/* This web app only works with Google Chrome */
function checkBrowser(){
	var isChrome = !!window.chrome && !!window.chrome.webstore;
      if (!isChrome) {
        alert('Disculpe, esta aplicación no es apoyada en el navegador suyo. Haga el favor de bajar y instalar el navegador Google Chrome desde https://www.google.com/chrome/browser/desktop/');
        window.open('https://www.google.com/chrome/browser/desktop/', '_blank');
      }
}

/* Force plant selection */
function checkPlantSelection(){
	if (getPlantName()==null){
	  window.location.replace("/settings.html");
	}
	else{
	  $("#selectPrompt").html("");
	  $("#syncButtonDiv").html("<a id='sync-viz' class='waves-effect waves-light btn'>Sincronizar</a>");
	  initViz();
	}
}

/* Initialize the sync button */
function connectSyncButton() {
	$('#sync-viz').click(function() {
		addSpinner('#spinnerDestination');
		updatePlantData(visualize);
	});
	$('#sync-table').click(function(){
		addSpinner('#spinnerDestination');
		updatePlantData(settable);
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

/*Initializes the visualization with default settings */
function initViz(){
	connectSyncButton();
  	addSpinner('#spinnerDestination');
    updatePlantData(visualize);
}


/*settings.html--------------------------------------------------------------*/

/*Dynamically display current plant name selection*/
function addCurrentChoiceHeader(){
	$("#currentChoice").html(function(){
	  pname = getPlantName();
	  if (pname!=null){return "Presentemente, su selección es: " +  pname;}
	  return "Ahora no hay selección de planta."
	});
}

/*Process plant selection*/
function submitRadioValues(){
	addSpinner('#spinnerDestination');
	plantCode = $('input[name="plantSelection"]:checked').val();
	save("plantName", plantCode);
	addCurrentChoiceHeader();
	window.location.href = "/index.html";
}

function addPlantDropdown(){
	allPlantsDict = getAllPlantsDict();
	var dropdownHTML = ''; 
	for(var key in allPlantsDict){
	    plantName = allPlantsDict[key];
	    dropdownHTML +='<p><input name="plantSelection" type="radio" id="'+plantName+'" value="'+plantName+'"';
	    if(getPlantName()==plantName){ dropdownHTML+=" checked";}
	    dropdownHTML+='/><label for="'+plantName+'" class="checkboxtext">'+plantName+'</label></p>';
	}
	dropdownHTML+='<br/><a class="waves-effect waves-light btn" id="nameSubmit" onClick="submitRadioValues()">Enviar</a>';
	$("#allPlantsDropDown").html(dropdownHTML);
}