(function(){

  var app = angular.module('todos',[ ]);
  
  // Directive to display the list of incomplete todos, with checkbox to complete
	app.directive('incompleteTodos', function(){
		return {
			restrict: 'E',
			templateUrl: 'directives/incomplete-todos.html',
		}
	});
	
	// Directive to display the list of complete todos, with checkbox to incomplete
	app.directive('completeTodos', function(){
		return {
			restrict: 'E',
			templateUrl: 'directives/complete-todos.html',
		}
	});
	
	// Directive to display a form to create todos
	app.directive('createTodoForm', function(){
		return {
			restrict: 'E',
			templateUrl: 'directives/create-todo-form.html',
		}
	});
	
	// Directive to display navigation for todos
	app.directive('todoNav', function(){
		return {
			restrict: 'E',
			templateUrl: 'directives/todo-nav.html',
		}
	});
  
  app.controller('TodosController', ['$http', '$log', function ($http, $log){
  
  	// Init stuff
		var todosCtrl = this;
		this.todos = [ ];
		this.todoToCreate = { }
		this.todoToComplete = { }
		this.todoToIncomplete = { }
		this.tab = "incomplete";
		this.csrfToken = 'bC0PWrHskBpiGbdvIEcmOTwwAucGBbKbxYOuQ2ZIHR4';
		
		// Grab todos from Drupal
		$http.get('/to-dos/json').success(function(data){
			todosCtrl.todos = data;
		});
				
		// Create a todo from AngularJS
		this.createTodo = function(){
			this.todoToCreate.type = { target_id: "to_do" };
			this.todoToCreate.field_complete = [ { value: "0" } ];
			this.todoToCreate._links = { type: { href: "http://drupal8-headless.dd:8083/rest/type/node/to_do" } };
			// Token from rest/session/token is bC0PWrHskBpiGbdvIEcmOTwwAucGBbKbxYOuQ2ZIHR4
			// via https://www.drupal.org/node/2405657
			$http.post('http://drupal8-headless.dd:8083/entity/node',this.todoToCreate, { headers: {
			'Content-Type': 'application/hal+json',
			'X-CSRF-Token': this.csrfToken,
			}})
			.then(function(response){
				var explodedLocation = response.headers('Location').split('/');
				todosCtrl.todoToCreate.nid = [ { value: explodedLocation[explodedLocation.length-1] } ];
				$log.log(todosCtrl.todoToCreate);
				todosCtrl.todos.unshift(todosCtrl.todoToCreate);
				todosCtrl.todoToCreate = { };
			});
		};
		
		// Complete a todo from AngularJS
		this.completeTodo = function(nidToComplete){
			this.todoToComplete.nid = [ { value: nidToComplete } ];
			this.todoToComplete.type = { target_id: "to_do" };
			this.todoToComplete.field_complete = [ { value: "1" } ];
			this.todoToComplete._links = { type: { href: "http://drupal8-headless.dd:8083/rest/type/node/to_do" } };
			$http.patch('http://drupal8-headless.dd:8083/node/'+this.todoToComplete.nid[0].value,this.todoToComplete, 
			{ headers: {
			'Content-Type': 'application/hal+json',
			'X-CSRF-Token': this.csrfToken,
			}})
			.then(function(response){
				var keyToComplete = "";
				// Remove from UI - doesn't work after a todo has been created without refresh
				for (var key in todosCtrl.todos) {
					if (todosCtrl.todos[key].nid[0].value === nidToComplete) {
						todosCtrl.todos[key].field_complete[0].value = 1;
					}
				}
				todosCtrl.todoToComplete = { };
			});
		};
		
		// Incomplete a todo from AngularJS
		this.incompleteTodo = function(nidToIncomplete){
			this.todoToIncomplete.nid = [ { value: nidToIncomplete } ];
			this.todoToIncomplete.type = { target_id: "to_do" };
			this.todoToIncomplete.field_complete = [ { value: "0" } ];
			this.todoToIncomplete._links = { type: { href: "http://drupal8-headless.dd:8083/rest/type/node/to_do" } };
			$http.patch('http://drupal8-headless.dd:8083/node/'+this.todoToIncomplete.nid[0].value,this.todoToIncomplete, 
			{ headers: {
			'Content-Type': 'application/hal+json',
			'X-CSRF-Token': 'bC0PWrHskBpiGbdvIEcmOTwwAucGBbKbxYOuQ2ZIHR4'
			}})
			.then(function(response){
				var keyToComplete = "";
				// Remove from UI - doesn't work after a todo has been created without refresh
				for (var key in todosCtrl.todos) {
					if (todosCtrl.todos[key].nid[0].value === todosCtrl.todoToIncomplete.nid[0].value) {
						todosCtrl.todos[key].field_complete[0].value = 0;
					}
				}
				todosCtrl.todoToIncomplete = { };
			});
		};
		
  }]);
  	
})();