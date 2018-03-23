angular.module("PhesteeApp",['ngValidate'])
.controller("login",function($scope,$http,$location){

  $scope.validationLogin = {
    rules:{
      iptEmail:{
        required: true,
        email: true
      },
      iptPassword:{
        required: true
      }
    },
    messages:{
      iptEmail:{
        required: "El correo eletrónico es requerido",
        email: "Debe ingresar un correo válido"
      },
      iptPassword:{
        required: "El password es requerido"
      }
    }
  }

  $scope.loginUser = function(){

    if($scope.frmLogin.validate())
    {
        var registeruserdata = {
          "email": $scope.iptEmail,
          "password": $scope.iptPassword
        };


        $http({
          method: "POST",
          url: "/validation",
          data: registeruserdata
        }).then (function success(responsesuc){


          var resultsuc = angular.fromJson(responsesuc.data);
          if(resultsuc.error == 0){
            $location.path('/app');

          }
          else {
            alert("Error: "+resultsuc.message);
          }


        }, function error(response){

          alert("Error: "+response);

        });




    } // fin if validate
  }
}); // fin controller.
