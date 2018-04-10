var app = angular.module("PhesteeApp",['ngStorage','ngFileUpload']);

app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);

app.controller("signup",function($scope,$http){

//SIGNUP CONTROLLER
  //$scope.alphanumeric = "^[a-zA-Z0-9\s]+$";
  $scope.alphanumeric = "/^[a-z\d\-_\s]+$/i";
  $scope.mostrarmsj= false;
  $scope.nameavailable = false;
  $scope.namenotavailable = false;
  $scope.emailavailable = false;
  $scope.emailnotavailable = false;
  $scope.emailvalidation = '/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/';

  $scope.prueba = function(){

    alert("Valor: "+$scope.slcDayBirth);

  };

  $scope.checkusername = function(){

      if($scope.iptName != '' && $scope.iptName != undefined){

          $http.get("/availablename/"+$scope.iptName).then(function(responsesuc){
            var result = angular.fromJson(responsesuc.data);
              if(result.error != 1)
              {
                    if(result.error == 2) /* Si llega 2 es que si encontro el username en la base de datos*/
                    {
                      $scope.namenotavailable = true;
                      $scope.nameavailable = false;
                    }
                    else
                    {
                      $scope.namenotavailable = false;
                      $scope.nameavailable = true;
                    }
              }
              else {
                 alert("Error: "+result.message);
              }


          },function(response){

            alert("Error: "+response.statusText);

          });// fin ajax get
      }
      else {
          $scope.nameavailable = false;
          $scope.namenotavailable = false;
      }
  } // fin funcion checkusername

  $scope.checkemail = function(){

      if($scope.iptEmail != '' && $scope.iptEmail != undefined){

          $http.get("/availableemail/"+$scope.iptEmail).then(function(responsesuc){
            var result = angular.fromJson(responsesuc.data);
              if(result.error != 1)
              {
                    if(result.error == 2) /* Si llega 2 es que si encontro el username en la base de datos*/
                    {
                      $scope.emailnotavailable = true;
                      $scope.emailavailable = false;
                    }
                    else
                    {
                      $scope.emailnotavailable = false;
                      $scope.emailavailable = true;
                    }
              }
              else {
                 alert("Error: "+result.message);
              }


          },function(response){

            alert("Error: "+response.statusText);

          });// fin ajax get
      }
      else {
          $scope.emailavailable = false;
          $scope.emailnotavailable = false;
      }
  }// fin checkemail

  $scope.registerUser = function(){
     if(!angular.equals($scope.iptPassword,$scope.iptConfirmPassword)){
        $scope.mostrarmsj = true;
     }
     else {
             if($scope.emailavailable)
             {
                      $scope.mostrarmsj = false;
                      var result = {
                          "email" : $scope.iptEmail,
                          "password" : $scope.iptPassword,
                      };

                      $http({
                        method: "POST",
                        url: "/users",
                        data: result
                      }).then (function success(responsesuc){
                        var resultsuc = angular.fromJson(responsesuc.data);
                        if(resultsuc.error == 0){
                          alert("El usuario se ha guardado con éxito.");
                          window.location.href= '/login';

                        }
                        else {
                          alert("Error: "+resultsuc.message);
                        }
                      }, function error(response){

                        alert("Error: "+response);

                      });
             }
             else{
               alert("Por favor ingrese un nombre y/o email únicos.")
             }// fin else email/nombre unicos
     }// fin contraseña y confirmacion iguales.
  }// funcion registerUser


});


// LOGIN CONTROLLER
app.controller("login",function($scope, $http, $location){
  $scope.loginUser = function(){
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
              //window.location.href= '/app'; //test page after login
              window.location.href= '/appv2';  //Pug based pafe after login
          }
          else {
            alert("Error: "+resultsuc.message);
          }
        }, function error(response){

          alert("Error: "+response.toSource());

        });

  } // fin loginUser
});
// FORGOT PASSWORD CONTROLLER
app.controller("forgotpassword",function($scope,$http){

  $scope.resetPassword = function(){
      var forgotPassword = {
        "email": $scope.iptEmail
      };

      $http.put("/resetpassword",forgotPassword).then(function (responsesuc) {

        var resultsuc = angular.fromJson(responsesuc.data);
        if(resultsuc.error == 0){
          alert("El correo se ha mandado con éxito.");
        }
        else {
          alert("Error: "+resultsuc.message);
        }
      }, function (response) {
          alert("Error: "+response.statusText);
      });
  };
});


app.controller("changePasswordController",function($scope,$http){

  $scope.showMsj=false;
  $scope.changePasswordDB = function(token){

    if(!angular.equals($scope.iptPassword,$scope.iptConfirmPassword))
    {
        $scope.showMsj = true;
    }
    else {

        var changePasswordDB = {
            "token": token,
            "newpassword":$scope.iptPassword
        };

        $http.put("/savenewpassword",changePasswordDB).then(function(responsesuc){

          var resultsuc = angular.fromJson(responsesuc.data);
          if(resultsuc.error == 0){
            alert("El password se ha cambiado con éxito");
            window.location.href= '/login';

          }
          else {
            alert("Error: "+resultsuc.message);
          }

        },function(response){

            alert(response.statusText);

        });
    }
  }
});

app.controller("homeController",function($scope,$localStorage,$sessionStorage){

  $scope.getDataUser = function(user){

      $scope.name = user.username;
      $localStorage.name = user.username;
      $localStorage.email = user.email;

  }

  $scope.signout = function(){

    if(confirm("¿Desea cerrar la sesion?"))
    {
      localStorage.clear();
      window.location.href="/appv2/signout";
    }
  };
});

app.controller("editProfileController",function($scope,$http,$localStorage,$sessionStorage,Upload){

  var finalJson = '{';

  $scope.banErrorAlphanumeric = 'Default';
  $scope.banErrorNameAvailable = 'Default';
  $scope.banErrorEmailValid = 'Default';
  $scope.banErrorEmailAvailable = 'Default';
  $scope.banErrorPasswordConfirm = 'Default';
  $scope.banErrorUnknown = 'Default';
  $scope.UnknownMessage = '';


  $scope.loadDataUser = function(){

    $scope.iptName = $localStorage.name;
    $scope.iptEmail = $localStorage.email;
  };

 $scope.checkNameAvailable = function(){
   if($scope.iptName != '' && ($scope.iptName != $localStorage.name))
   {
      var expregname = /^[a-z\d\-_\s]+$/i;
      if(expregname.test($scope.iptName)){
        $http.get("/availablename/"+$scope.iptName).then(function(responsesuc){
           var result = angular.fromJson(responsesuc.data);
             if(result.error != 1)
             {
                   if(result.error == 2) /* Si llega 2 es que si encontro el username en la base de datos*/
                   {
                       $scope.banErrorNameAvailable = true;
                   }
                   else
                   {
                     $scope.banErrorAlphanumeric = false;
                     $scope.banErrorNameAvailable = false;
				           }
             }
             else {
                $scope.banErrorUnknown = true;
                $scope.UnknownMessage = result.message;
             }
         },function(response){
           $scope.banErrorUnknown = true;
           $scope.UnknownMessage = response.statusText;
         });
      }
      else {
        $scope.banErrorAlphanumeric = true;
      }
   }// fin if name
   else {
      $scope.banErrorAlphanumeric = 'Default';
      $scope.banErrorNameAvailable = 'Default';
   }
 };

  $scope.checkemail = function(){

    if($scope.iptEmail != '' && ($scope.iptEmail != $localStorage.email))
    {
      var expreg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(expreg.test($scope.iptEmail)){
        $http.get("/availableemail/"+$scope.iptEmail).then(function(responsesuc){
          var result = angular.fromJson(responsesuc.data);
          if(result.error != 1)
          {
              if(result.error == 2) /* Si llega 2 es que si encontro el username en la base de datos*/
              {
                  $scope.banErrorEmailAvailable = true;
              }
              else
              {
                  $scope.banErrorEmailAvailable = false;
                  $scope.banErrorEmailValid=  false;
              }
          }
          else {
            $scope.banErrorUnknown = true;
            $scope.UnknownMessage = result.message;
          }
        },function(response){
          $scope.banErrorUnknown = true;
          $scope.UnknownMessage = response.statusText;
        });
      }
      else
      {
        $scope.banErrorEmailValid = true;
      }
    } // fin if email
    else{
      $scope.banErrorEmailValid = 'Default';
      $scope.banErrorEmailAvailable = 'Default';
    }
  };


  $scope.checkprofile = function(imgProfile){

    if($scope.banErrorUnknown == true)
    {
      alert("Error desconocido: "+$scope.UnknownMessage);
      return false;
    }

    if($scope.iptName == undefined && $scope.iptEmail == undefined && $scope.iptPassword == undefined)
    {
        alert("Agregue algún campo para poder guardar la información.");
        return false;
    }


    if($scope.iptPassword != '' && $scope.iptPassword != undefined)
    {
      if(!angular.equals($scope.iptPassword,$scope.iptConfirmPassword))
      {
          $scope.banErrorPasswordConfirm = true;
      }
      else{
          finalJson += ',"password":"'+$scope.iptPassword+'"';
          $scope.banErrorPasswordConfirm = false;
      }
    }
    else{
      $scope.banErrorPasswordConfirm = 'Default';
    }

    if($scope.banErrorNameAvailable == true || $scope.banErrorAlphanumeric == true || $scope.banErrorEmailValid == true || $scope.banErrorEmailAvailable == true || $scope.banErrorPasswordConfirm == true)
    {
        alert("Hay algun dato mal en el registro");
        finalJson = '{';
    }
    else {

         if(($scope.banErrorAlphanumeric != 'Default' && $scope.banErrorNameAvailable != 'Default') && ($scope.banErrorNameAvailable == false && $scope.banErrorAlphanumeric == false))
         {
           finalJson +=',"username":"'+$scope.iptName+'"';
         }
         if($scope.banErrorEmailValid != 'Default' && $scope.banErrorEmailAvailable != 'Default' && $scope.banErrorEmailValid == false && $scope.banErrorEmailAvailable == false)
         {
            finalJson +=',"email":"'+$scope.iptEmail+'"';
         }
         finalJson += "}";
         finalJson = finalJson.replace("{,","{");
         if(finalJson == '{}')
         {
            alert('Ingrese otros datos para poder guardarlos. ');
            finalJson = '{';
            return false;
         }
         if(imgProfile != undefined)
         {
           imgProfile.upload = Upload.upload({
             method: 'PUT',
             url: '/app/uploadImage',
             file: imgProfile,
             data: {username:$scope.iptName,password:$scope.iptPassword,email:$scope.iptEmail}
           });
           imgProfile.upload.then(function (response) {

             var result = angular.fromJson(response.data);
             if(result.error==0)
              alert("El perfil se ha cambiado con éxito");

              if(($scope.banErrorAlphanumeric != 'Default' && $scope.banErrorNameAvailable != 'Default') && ($scope.banErrorNameAvailable == false && $scope.banErrorAlphanumeric == false))
                $localStorage.name = $scope.iptName;
              if($scope.banErrorEmailValid != 'Default' && $scope.banErrorEmailAvailable != 'Default' && $scope.banErrorEmailValid == false && $scope.banErrorEmailAvailable == false)
                $localStorage.email = $scope.iptEmail;


              window.location.href= '/app';
              $timeout(function(){

              });
              }, function (response) {
                  if (response.status > 0)
                  {
                      alert("Error al editar el perfil: "+response.toSource());
                      return false;
                  }
                }, function (evt) {
             //Para agregar una barra de progreso
             //imgProfile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
          }// fin if imgProfile != undefined
          else {


                  $http.put("/app/uploadImage",finalJson).then(function(responsesuc){
                    var result = angular.fromJson(responsesuc.data);
                    if(result.error == 0)
                    {
                      alert("El perfil se ha cambiado con éxito");
                      if(($scope.banErrorAlphanumeric != 'Default' && $scope.banErrorNameAvailable != 'Default') && ($scope.banErrorNameAvailable == false && $scope.banErrorAlphanumeric == false))
                        $localStorage.name = $scope.iptName;
                      if($scope.banErrorEmailValid != 'Default' && $scope.banErrorEmailAvailable != 'Default' && $scope.banErrorEmailValid == false && $scope.banErrorEmailAvailable == false)
                        $localStorage.email = $scope.iptEmail;


                        window.location.href= '/app';
                    }
                    else {
                      alert("Hubo un error al guardar la información del perfil");
                    }

                  },function(response){
                      alert("Error: "+response.statusText);

                  });
        }
    }// fin if checar errores.
  } // fin funcion checkprofile

  $scope.checkbusiness = function(){

      var finalJsonBusiness = '{';

      if($scope.iptNameBusiness != undefined)
      {
          finalJsonBusiness +=',"NameBusiness":'+$scope.iptNameBusiness;
      }
      if($scope.slcTypeBusiness != undefined)
      {
          finalJsonBusiness +=',"TypeBusiness":'+$scope.slcTypeBusiness;
      }
      if($scope.slcPhoneBusiness != undefined)
      {
        finalJsonBusiness +=',"PhoneBusiness":'+$scope.slcPhoneBusiness;
      }
      if($scope.iptPhoneBusiness != undefined)
      {
        finalJsonBusiness+=',"NumberBusiness":'+$scope.iptPhoneBusiness;
      }
      if($scope.iptStreet != undefined)
      {
        finalJsonBusiness+=',"Street":'+$scope.iptStreet;
      }
      if($scope.iptAddressNumber != undefined)
      {
          finalJsonBusiness+=',"Number":'+$scope.iptAddressNumber;
      }
      if($scope.iptAditional != undefined)
      {
        finalJsonBusiness+=',"AditionalInfo":'+$scope.iptAditional;
      }
      if($scope.iptZipCode != undefined)
      {
        finalJsonBusiness+=',"ZipCode":'+$scope.iptZipCode;
      }
      if($scope.iptCity != undefined)
      {
        finalJsonBusiness+=',"City":'+$scope.iptCity;
      }
      if($scope.iptState != undefined)
      {
        finalJsonBusiness+=',"State":'+$scope.iptState;
      }
      if($scope.iptCountry != undefined)
      {
        finalJsonBusiness+=',"Country":'+$scope.iptCountry;
      }


      if(finalJsonBusiness != '{')
      {
        finalJsonBusiness += "}";
        finalJsonBusiness = finalJsonBusiness.replace("{,","{");

        $http.put("/app/editBusinessProfile",finalJson).then(function(responsesuc){
          var result = angular.fromJson(responsesuc.data);
          if(result.error == 0)
          {
            alert("El perfil se ha cambiado con éxito");
              //window.location.href= '/app';
          }
          else {
            alert("Hubo un error al guardar la información del perfil");
          }

        },function(response){
            alert("Error: "+response.statusText);

        });

      }
      else {
        alert("Campos en blanco o datos repetidos");
        return false;
      }


  };

});// fin app controller editProfileController


//CONTROLLER EDIT BUSINESS USER
app.controller("editBusinessController",function($scope,$localStorage,$http){

    $scope.dataBusinessUser = [];
    $scope.iptNameBusiness = [];
    $scope.slcBusinessType = [];
    $scope.slcTypePhone = [];
    $scope.iptPhoneNumberBusiness = [];
    $scope.chbxMainBusiness = [];
    $scope.iptStreet = [];
    $scope.iptNumber = [];
    $scope.iptAdditionalInfo = [];
    $scope.iptZipCode = [];
    $scope.iptCity = [];
    $scope.iptState = [];
    $scope.iptCountry = [];
    $scope.idbusiness = [];
    $scope.businesstypeselect = [
      {value:"Freelance", label:"Freelance"},
      {value:"Business",label:"Business"},
      {value:"Enterprise",label:"Enterprise"}
    ];
    $scope.typecelselect = [
      {value:"Celular",label:"Celular"},
      {value:"Privado",label:"Privado"}
    ];


    $scope.loadBusinessUser = function(business){
        var businessdatalocal = JSON.parse(localStorage.getItem("business"));
        if(businessdatalocal == undefined || businessdatalocal == null)
        {
          $scope.dataBusinessUser = business;
          for(var x=0;x<business.length;x++)
          {
            $scope.idbusiness[x] = business[x]._id;
            $scope.iptNameBusiness[x] = business[x].name;
            $scope.slcBusinessType[x] = business[x].businessType;
            $scope.slcTypePhone[x] = business[x].telephone.typeTel;
            $scope.iptPhoneNumberBusiness[x] = business[x].telephone.number;
            $scope.chbxMainBusiness[x] = business[x].isHeadBusiness;
            $scope.iptStreet[x] = business[x].address.street;
            $scope.iptNumber[x] = business[x].address.number;
            $scope.iptAdditionalInfo[x] = business[x].address.aditional;
            $scope.iptZipCode[x] = business[x].address.zipCode;
            $scope.iptCity[x] = business[x].address.city;
            $scope.iptState[x] = business[x].address.state;
            $scope.iptCountry[x] = business[x].address.country;
          }
        }
        else
        {
           $scope.dataBusinessUser.push(businessdatalocal);
           $scope.idbusiness[0] = businessdatalocal.idbusiness;
           $scope.iptNameBusiness[0] = businessdatalocal.businessname;
           $scope.slcBusinessType[0] = businessdatalocal.businesstype;
           $scope.slcTypePhone[0] = businessdatalocal.typephone;
           $scope.iptPhoneNumberBusiness[0] = businessdatalocal.phonenumberbusiness;
           $scope.chbxMainBusiness[0] = businessdatalocal.mainbusiness;
           $scope.iptStreet[0] = businessdatalocal.addressstreet;
           $scope.iptNumber[0] = businessdatalocal.addressnumber;
           $scope.iptAdditionalInfo[0] = businessdatalocal.addressaditional;
           $scope.iptZipCode[0] = businessdatalocal.addresszipcode;
           $scope.iptCity[0] = businessdatalocal.addresscity;
           $scope.iptState[0] = businessdatalocal.addressstate;
           $scope.iptCountry[0] = businessdatalocal.addresscountry;
        }
    }; // fin loadBusinessUser

    $scope.saveBusiness =  function(numberbusiness){

      var objectbusiness = {
            "idbusiness": $scope.idbusiness[numberbusiness],
            "businessname": $scope.iptNameBusiness[numberbusiness],
            "businesstype": $scope.slcBusinessType[numberbusiness],
            "typephone": $scope.slcTypePhone[numberbusiness],
            "phonenumberbusiness":$scope.iptPhoneNumberBusiness[numberbusiness],
            "mainbusiness": $scope.chbxMainBusiness[numberbusiness],
            "addressstreet": $scope.iptStreet[numberbusiness],
            "addressnumber": $scope.iptNumber[numberbusiness],
            "addressaditional": $scope.iptAdditionalInfo[numberbusiness],
            "addresszipcode": $scope.iptZipCode[numberbusiness],
            "addresscity": $scope.iptCity[numberbusiness],
            "addressstate": $scope.iptState[numberbusiness],
            "addresscountry": $scope.iptCountry[numberbusiness]
      }; // objecto business

        $http.put("/app/editBusiness",objectbusiness).then(function(responsesuc){
          var result = angular.fromJson(responsesuc.data);
          if(result.error == 0)
          {
            alert("El negocio se ha modificado con éxito");
            localStorage.setItem("business",JSON.stringify(objectbusiness));
            $scope.dataBusinessUser = [];
            window.location.href="/app";
          }
          else
          {
            alert("Hubo un error al modificar el negocio: "+result.message);
          }

        },function(response){

            alert("Error: "+response.statusText);
        });// fin ajax editbusiness
    };// fin funcion saveBusiness
}); // fin controller editBusinessController

app.controller("editServicesController",function($scope,$http,Upload){


 $scope.onlynumbers = '^(0|[1-9][0-9]*)$';


 $scope.selectprodservice = [
    {value:"service",label:"Servicio"},
    {value:"product",label:"Producto"}
 ];

 $scope.selecttypeservice = [
   {value:"homeservice",label:"Servicio a domicilio"},
   {value:"isMovilOffering",label:"Oferta movil"}
 ];

 $scope.idbusiness = [];

 $scope.slcProdServiceAdd = [];
 $scope.iptNameServiceAdd = [];
 $scope.iptCostServiceAdd = [];
 $scope.txtaDescriptionAdd = [];
 $scope.slcTypeServiceAdd = [];
 $scope.txtaHashtagAdd = [];
 $scope.imgServiceAdd = [];


 $scope.slcProdService = [];
 $scope.iptNameService = [];
 $scope.iptCostService = [];
 $scope.txtaDescription = [];
 $scope.slcTypeService = [];
 $scope.txtaHashtag = [];
 $scope.idservicebuss = [];


 $scope.dataServicesUser = [];

 $scope.checararchivos = function(nobusiness,imgServiceAdd){

       imgServiceAdd.upload = Upload.upload({
              method: 'POST',
              url: '/app/addServiceTest',
              file: imgServiceAdd
            });

       imgServiceAdd.upload.then(function (response) {

             var result = angular.fromJson(response.data);
             if(result.error==0)
              alert("Checa el log.");

              $timeout(function(){
                    alert("Error al subir la imagen. Tiempo de carga de imagen ha finalizado");
              });
              }, function (response) {
                  if (response.status > 0)
                  {
                      alert("Error al agregar el servicio: "+response.toSource());
                      return false;
                  }
                }, function (evt) {
             //Para agregar una barra de progreso
             //imgProfile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });



 };

 $scope.loadServicesUser = function(business){

   //var businessdatalocal = JSON.parse(localStorage.getItem("business"));
   //if(businessdatalocal == undefined || businessdatalocal == null)
   //{
     $scope.dataServicesUser = business;
     for(var x=0;x<business.length;x++)
     {
       $scope.idbusiness[x] = business[x]._id;
       for(var i=0;i<business[x].services.length;i++)
       {
         $scope.idservicebuss[i] = business[x].services[i]._id;
         $scope.slcProdService[i] = business[x].services[i].type;
         $scope.iptNameService[i] = business[x].services[i].name;
         $scope.iptCostService[i] = business[x].services[i].cost;
         $scope.txtaDescription[i] = business[x].services[i].description;
         $scope.slcTypeService[i] = (business[x].services[i].homeservices == true ? "homeservice" : "isMovilOffering");
         $scope.txtaHashtag[i] = business[x].services[i].hshtgs;
       }
     }
   //}
   //else
   //{


   //}
 }; // fin loadServicesUser

 $scope.addService = function(nobusiness){

   if(imgServiceAdd != undefined)
   {
       imgServiceAdd.upload = Upload.upload({
              method: 'POST',
              url: '/app/addService',
              file: imgProfile,
              data: {idbusiness: $scope.idbusiness[nobusiness],
                     serviceproduct: $scope.slcprodServiceAdd[nobusiness],
                     nameserviceprod: $scope.iptNameServiceAdd[nobusiness],
                     costservprod: $scope.iptCostServiceAdd[nobusiness],
                     description: $scope.txtaDescriptionAdd[nobusiness],
                     typeservice: $scope.slcTypeServiceAdd[nobusiness],
                     hashtags: $scope.txtaHashtagAdd[nobusiness]
            }
       });

       imgServiceAdd.upload.then(function (response) {

             var result = angular.fromJson(response.data);
             if(result.error==0)
              alert("El servicio se ha agregado con éxito.");
              window.location.href= '/app';
              $timeout(function(){
                    alert("Error al subir la imagen. Tiempo de carga de imagen ha finalizado");
              });
              }, function (response) {
                  if (response.status > 0)
                  {
                      alert("Error al agregar el servicio: "+response.toSource());
                      return false;
                  }
                }, function (evt) {
             //Para agregar una barra de progreso
             //imgProfile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
   }
   else
   {
     var addserviceobject = {
       "idbusiness" : $scope.idbusiness[nobusiness],
       "serviceproduct" : $scope.slcProdServiceAdd[nobusiness],
       "nameserviceprod" : $scope.iptNameServiceAdd[nobusiness],
       "costservprod" : $scope.iptCostServiceAdd[nobusiness],
       "description" : $scope.txtaDescriptionAdd[nobusiness],
       "typeservice" : $scope.slcTypeServiceAdd[nobusiness],
       "hashtags" : $scope.txtaHashtagAdd[nobusiness]
     };

     $http.post("/app/addService",addserviceobject).then(function(responsesuc){
       var result = angular.fromJson(responsesuc.data);
       if(result.error == 0)
       {
         alert("El servicio se ha agregado con éxito");
         //localStorage.setItem("business",JSON.stringify(objectbusiness));
         $scope.dataServicesUser = [];
         window.location.href="/app";
       }
       else
       {
         alert(result.message);
       }

     },function(response){
         alert("Error: "+response.statusText);
     });
   }
  }; // fin addservice

  $scope.updateService = function(noService){

    alert("No servicio: "+ noService);
    var objectupdateserv = {
      "idbusiness": $scope.idbusiness[0],
      "idservicebuss":$scope.idservicebuss[noService],
      "prodserv": $scope.slcProdService[noService],
      "nameservice": $scope.iptNameService[noService],
      "costservprod": $scope.iptCostService[noService],
      "description": $scope.txtaDescription[noService],
      "typeservice": $scope.slcTypeService[noService],
      "hashtags": $scope.txtaHashtag[noService]
    };


    $http.put("/app/editService",objectupdateserv).then(function(responsesuc){
      var result = angular.fromJson(responsesuc.data);
      if(result.error == 0)
      {
        alert("El negocio se ha modificado con éxito");
        //localStorage.setItem("business",JSON.stringify(objectbusiness));
        $scope.dataServicesUser = [];
        window.location.href="/app";
      }
      else
      {
        alert(result.message);
      }
    }
    ,function(response){
        alert("Error: "+response.statusText);

    });
  }; // fin de updateService

  $scope.deleteService = function(noServiceDel){
    if(confirm("¿Desea eliminar "+$scope.iptNameService[noServiceDel]+"? ¿Desea continuar?"))
    {
          $http.delete("/app/deleteService/"+$scope.idservicebuss[noServiceDel]).then(function(responsesuc){
            var result = angular.fromJson(responsesuc.data);
            if(result.error == 0)
            {
              alert("El servicio se ha eliminado con éxito");
              window.location.href="/app";
            }
            else
            {
              alert(result.message);
            }
          },function(response){
              alert(response.statusText);
          });
    }
  };
}); // fin controller editServicesController


app.controller("editAccountController",function($scope,$http){

    $scope.saveChangeAccount = function(){

        if($scope.iptPasswordAccount == '' && $scope.iptPasswordAccount == undefined)
        {
            alert("Por favor, ingrese la nueva contraseña y repitala en el siguiente campo para poder cambiar la contraseña");
            return false;
        }
        else
        {
          if($scope.iptPasswordAccount == $scope.iptPassConfirmAccnt)
          {
              var objectaccount = {
                "passwordchange":$scope.iptPasswordAccount
              };

              $http.put("/appv2/changePasswordAccount",objectaccount).then(function(responsesuc){
                var result = angular.fromJson(responsesuc.data);
                if(result.error == 0)
                {
                  alert("La contraseña se ha modificado con éxito");
                }
                else
                {
                  alert(result.message);
                }

              },function(response){

                  alert("Error: "+response.statusText);
              });
          }
          else
          {
            alert("La contraseña y su confirmación no coinciden.");
            return false;
          }
        }
    }; // fin saveChangeAccount


    $scope.deleteaccount = function(){

      if(confirm("¿Desea eliminar su cuenta definitivamente?"))
      {
          $http.put("/appv2/deleteaccount").then(function(responsesuc){
            var result = angular.fromJson(responsesuc.data);
            if(result.error == 0)
            {
              alert("La cuenta se ha eliminado con éxito");
              localStorage.clear();
              window.location.href="/appv2/signout";
            }
            else
            {
              alert(result.message);
            }

          },function(response){

              alert("Error: "+response.statusText);
          });
      }
    }; // fin deleteaccount

}); // fin editAccountController




app.controller("postController",function($scope, $http, socket){

	socket.on('init', function (data) {
		$scope.name = data.name;
		$scope.users = data.users;
	});

	socket.on('send:message', function (message) {
		$scope.messages.push(message);
	});


	$scope.postRequest = function(){
	    var json =  {
	                    "post" :  $scope.iptPost,
	                    "session" : $scope.session,
	                    "id" : $scope.id
	                };
	    $http({
	        method: "POST",
	        url: "/postIt",
	        data: json
	    }).then (function success(responseSuccess){
	        console.log(responseSuccess);
	    },function error(response){
	        console.log("wrong server transaction");
	    });
	}

  $scope.updateFeed = function(){
      var json =  {
                      "session" : $scope.session,
                      "id" : $scope.id
                  };
      $http({
          method: "POST",
          url: "/updateFeed",
          data: json
      }).then (function success(responseSuccess){
          console.log(responseSuccess.data);
      },function error(response){
          console.log("wrong server transaction");
      });
  }
});

app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

function AppCtrl($scope, socket) {

  // Socket listeners
  // ================

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
  });

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push(data.name);
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has left.'
    });
    var i, user;
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user === data.name) {
        $scope.users.splice(i, 1);
        break;
      }
    }
  });

  // Private helpers
  // ===============

  var changeName = function (oldName, newName) {
    // rename user in list of users
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i] === oldName) {
        $scope.users[i] = newName;
      }
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  }

  // Methods published to the scope
  // ==============================

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {

        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  $scope.sendMessage = function () {
    socket.emit('send:message', {
      message: $scope.message
    });

    // add the message to our model locally
    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });

    // clear message box
    $scope.message = '';
  };
}
