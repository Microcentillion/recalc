angular
   .module('app')
   .controller('projectTrackerCtrl', ['$scope', 'projectTrackerService', function($scope, projectTrackerService) {
      service = projectTrackerService;

      service.users.async().then(function(d) {
         var userlist = d.data.message;

         var newList = []
         for (x in userlist) {
            newList.push({id: x, name: userlist[x]});
         }

         newList.sort(function(a, b) {
            return a.name > b.name;
         });

         $scope.engineers = newList;
      });

      service.customers.async().then(function(d) {
         if (d.data.success === false) {
            alert(d.data.message);
            return false;
         } else {
            $scope.customers = d.data.message;
         }
      });

      $scope.showProjects = function() {
         $scope.jobs = {};
         if ($scope.options.customer == "") {
            return false;
         }
         service.projects.async($scope.options.customer).then(function(d) {
            if (d.data.success === false) {
               alert(d.data.message);
               return false;
            } else {
                $scope.jobs = d.data.message;
            }
         });
      }

      $scope.getProjectDetails = function() {
         $scope.options.fixed_cost = "";
         $scope.options.client_manager = "";
         $scope.options.lead_engineer = "";
         $scope.options.project_manager = "";
         $scope.options.sreng_rate = "";
         $scope.options.eng_rate = "";
         $scope.options.tw_rate = "";
         $scope.project_loaded = false;

         if ($scope.options.job == "") {
            return false;
         }

         service.details.async($scope.options.job).then(function(d) {
            if (d.data.success === false) {
               alert(d.data.message);
               return false;
            } else {
               delete d.data.message.projects.customer
               delete d.data.message.projects.job
               delete d.data.message.projects.last_modified
               delete d.data.message.projects.created

               for (x in d.data.message.projects) {
                  $scope.options[x] = d.data.message.projects[x];
               }

               $scope.project_loaded = true;
               $scope.getGraphData();
            }
         });
      }

      $scope.getGraphData = function() {
         service.graphs.async($scope.options.job).then(function(d) {
            if (d.data.success === false) {
               alert(d.data.message);
            } else {
               $scope.renderGraph(d.data.message.data, d.data.message.options);
            }
         });
      }

      $scope.renderGraph = function(data, options) {
         var context = $("#myChart").get(0).getContext("2d");
         var chart = new Chart(context);

         chart.Line(data, options);
      }

      $scope.projectLoaded = false;
      $scope.details = {};
      $scope.data = {};
      $scope.options = {};
      $scope.jobs = {};

      $scope.save = function() {
         $.ajax({
            url: '/api.php?a=updateProject',
            method: 'POST',
            data: {
               data: $scope.options
            },
            success: function(data) {
               data = JSON.parse(data);
               if (data['success']) {
                  alert('Project saved');
               } else {
                  console.log(data.message);
               }
            }
         });
      }
      
   }]);
