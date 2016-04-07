$data.Entity.extend("Todo", {
    Id: { type: "int", key: true, computed: true },
    Task: { type: String, required: true, maxLength: 200 },
    DueDate: { type: Date },
    Completed: { type: Boolean }
});

$data.EntityContext.extend("TodoDatabase", {
    Todos: { type: $data.EntitySet, elementType: Todo }
});
$(document).ready(onDeviceReady())
// PhoneGap is ready
//
function onDeviceReady() {
  var todoDB = new TodoDatabase({ 
    provider: 'webSql', databaseName: 'MyTodoDatabase'
	});
	todoDB.onReady(function() {
	  $("#first_name").on("change", function(){
	  	var tasks = todoDB.Todos.addMany([
	    	{ Task: $("#first_name").val(), Completed: true },
	    	{ Task: 'Step1: Define your data model'},
	    	{ Task: 'Step2: Initialize data storage'}
			]);
			todoDB.saveChanges(function() {
			  tasks.forEach( function(todo) { alert(todo.Id) });
			});
		})
	});
}

