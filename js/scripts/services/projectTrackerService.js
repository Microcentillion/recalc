angular
   .module('app')
   .service('projectTrackerService', ['$http', function($http) {
      return {
         users: {
            async: function() {
               return $http.get('/api.php?a=userList');
            }
         },
   
         customers: {
            async: function(project_id) {
               return $http.get('/api.php?a=clientList');
            }
         },
   
         projects: {
            async: function(customer) {
               return $http.get('/api.php?a=projectList&client=' + customer);
            }
         },
         
         details: {
            async: function(project_id) {
               return $http.get('/api.php?a=projectDetails&projects_id=' + project_id);
            }
         },
         
         graphs: {
            async: function(project_id) {
               return $http.get('/api.php?a=projectGraph&projects_id=' + project_id);
            }
         }
      }
   }]);
