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
  
  	// CONFIGURATION
		// Token from rest/session/token
		// via https://www.drupal.org/node/2405657
		this.csrfToken = 'Cj8I8k2Hdk3jRkYaaipbyCQjRXH6jPGp4pIgolsEmMg';
		this.baseUrl = 'http://angulartodos58wxe8mlwp.devcloud.acquia-sites.com/';
		this.todosJsonUrl = 'todos/json';
		// CONFIGURATION END
		 
  	// Init stuff
		var todosCtrl = this;
		this.todos = [ ];
		this.todoToCreate = { }
		this.todoToComplete = { }
		this.todoToIncomplete = { }
		this.tab = "incomplete";
		
		// Grab todos from Drupal
		$http.get(this.baseUrl + this.todosJsonUrl, { headers: {
			'X-CSRF-Token': this.csrfToken,
		}})
		.then(function(result){
			todosCtrl.todos = result.data;
		});
		// Create a todo from AngularJS
		this.createTodo = function(){
			this.todoToCreate.type = { target_id: "to_do" };
			this.todoToCreate.field_complete = [ { value: "0" } ];
			this.todoToCreate._links = { type: { href: this.baseUrl+"rest/type/node/to_do" } };
			$http.post(this.baseUrl+'entity/node',this.todoToCreate, { headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/hal+json',
			'X-CSRF-Token': this.csrfToken,
			}})
			.then(function(result){
				var explodedLocation = result.headers('Location').split('/');
				todosCtrl.todoToCreate.nid = [ { value: explodedLocation[explodedLocation.length-1] } ];
				todosCtrl.todos.unshift(todosCtrl.todoToCreate);
				todosCtrl.todoToCreate = { };
			});
		};
		
		// Complete a todo from AngularJS
		this.completeTodo = function(nidToComplete){
			this.todoToComplete.nid = [ { value: nidToComplete } ];
			this.todoToComplete.type = { target_id: "to_do" };
			this.todoToComplete.field_complete = [ { value: "1" } ];
			this.todoToComplete._links = { type: { href: this.baseUrl+"rest/type/node/to_do" } };
			$http.patch(this.baseUrl+'node/'+this.todoToComplete.nid[0].value,this.todoToComplete, { headers: {
			'Content-Type': 'application/hal+json',
			'X-CSRF-Token': this.csrfToken,
			}})
			.then(function(result){
				var keyToComplete = "";
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
			this.todoToIncomplete._links = { type: { href: this.baseUrl+"rest/type/node/to_do" } };
			$http.patch(this.baseUrl+'node/'+this.todoToIncomplete.nid[0].value,this.todoToIncomplete, { headers: {
			'Content-Type': 'application/hal+json',
			'X-CSRF-Token': this.csrfToken,
			}})
			.then(function(result){
				var keyToComplete = "";
				for (var key in todosCtrl.todos) {
					if (todosCtrl.todos[key].nid[0].value === todosCtrl.todoToIncomplete.nid[0].value) {
						todosCtrl.todos[key].field_complete[0].value = 0;
					}
				}
				todosCtrl.todoToIncomplete = { };
			},function(result){
				$log.log(result);
			});
		};
		
  }]);
  	
})();
