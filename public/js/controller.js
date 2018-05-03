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

app.controller("homeController",function($scope,$localStorage,$sessionStorage,$http){

  $scope.getDataUser = function(){
          var check = JSON.parse(localStorage.getItem("BusinessData"));
          if(check == undefined || check == null)
          {
                $http.post("/appv2/getEmergencyData").then(function(responsesuc){
                  var result = angular.fromJson(responsesuc.data);
                  if(result.error == 0)
                  {
                    localStorage.setItem("UserData",JSON.stringify(result.userjson));
                    localStorage.setItem("BusinessData",JSON.stringify(result.databusinessServer));
                  }
                  else {
                    alert("Error al cargar los datos. Se regresará al login de la aplicación");
                    localStorage.clear();
                    window.location.href="/app/signout";
                  }

                },function(response){
                    alert("Error: "+response.statusText);
                    localStorage.clear();
                    window.location.href="/app/signout";
                });
          }
  }// fin funcion getDataUser

  $scope.signout = function(){

    if(confirm("¿Desea cerrar la sesion?"))
    {
      localStorage.clear();
      window.location.href="/appv2/signout";
    }
  };
});

app.controller("editProfileController",function($scope,$http,$localStorage,$sessionStorage,Upload){

  var expreg =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  $scope.emailtosend = "";
  $scope.usernametosend = "";
  $scope.formatinvalid = false;
  $scope.emailprofilenotavailable = false;
  $scope.emailavailable = false;
  $scope.usernamenotavailable = false;
  $scope.usernameavailable = false;



  $scope.changecity = function(){

    if($scope.slcStateProfile == "Aguascalientes")
    {
      $scope.slcCityProfileItems = [
        {value:"Aguascalientes",label:"Aguascalientes"},
        {value:"Asientos",label:"Asientos"},
        {value:"Calvillo",label:"Calvillo"},
        {value:"Cosío",label:"Cosío"},
        {value:"Jesús María",label:"Jesús María"},
        {value:"Pabellón de Arteaga",label:"Pabellón de Arteaga"},
        {value:"Rincón de Romos",label:"Rincón de Romos"},
        {value:"San José de Gracia",label:"San José de Gracia"},
        {value:"Tepezalá",label:"Tepezalá"},
        {value:"El Llano",label:"El Llano"},
        {value:"San Francisco de los Romo",label:"San Francisco de los Romo"}
      ];
    }
    if($scope.slcStateProfile == "Baja California")
    {
      $scope.slcCityProfileItems = [
        {value:"Ensenada",label:"Ensenada"},
        {value:"Mexicali",label:"Mexicali"},
        {value:"Tecate",label:"Tecate"},
        {value:"Tijuana",label:"Tijuana"},
        {value:"Playas de Rosarito",label:"Playas de Rosarito"}
      ];
    }
    if($scope.slcStateProfile == "Baja California Sur")
    {
      $scope.slcCityProfileItems = [
        {value:"Comondú",label:"Comondú"},
        {value:"Mulegé",label:"Mulegé"},
        {value:"La Paz",label:"La Paz"},
        {value:"Los Cabos",label:"Los Cabos"},
        {value:"Loreto",label:"Loreto"}
      ];
    }
    if($scope.slcStateProfile == "Campeche")
    {
      $scope.slcCityProfileItems = [
        {value:"Calkiní",label:"Calkiní"},
        {value:"Campeche",label:"Campeche"},
        {value:"Carmen",label:"Carmen"},
        {value:"Champotón",label:"Champotón"},
        {value:"Hecelchakán",label:"Hecelchakán"},
        {value:"Hopelchén",label:"Hopelchén"},
        {value:"Palizada",label:"Palizada"},
        {value:"Tenabo",label:"Tenabo"},
        {value:"Escárcega",label:"Escárcega"},
        {value:"Calakmul",label:"Calakmul"},
        {value:"Candelaria",label:"Candelaria"}
      ];
    }

    if($scope.slcStateProfile == "Chiapas")
    {
      $scope.slcCityProfileItems = [

        {value:"Acacoyagua",label:"Acacoyagua"},
        {value:"Acala",label:"Acala"},
        {value:"Acapetahua",label:"Acapetahua"},
        {value:"Altamirano",label:"Altamirano"},
        {value:"Amatán",label:"Amatán"},
        {value:"Amatenango de la Frontera",label:"Amatenango de la Frontera"},
        {value:"Amatenango del Valle",label:"Amatenango del Valle"},
        {value:"Angel Albino Corzo",label:"Angel Albino Corzo"},
        {value:"Arriaga",label:"Arriaga"},
        {value:"Bejucal de Ocampo",label:"Bejucal de Ocampo"},
        {value:"Bella Vista",label:"Bella Vista"},
        {value:"Berriozábal",label:"Berriozábal"},
        {value:"Bochil",label:"Bochil"},
        {value:"El Bosque",label:"El Bosque"},
        {value:"Cacahoatán",label:"Cacahoatán"},
        {value:"Catazajá",label:"Catazajá"},
        {value:"Cintalapa",label:"Cintalapa"},
        {value:"Coapilla",label:"Coapilla"},
        {value:"Comitán de Domínguez",label:"Comitán de Domínguez"},
        {value:"La Concordia",label:"La Concordia"},
        {value:"Copainalá",label:"Copainalá"},
        {value:"Chalchihuitán",label:"Chalchihuitán"},
        {value:"Chamula",label:"Chamula"},
        {value:"Chanal",label:"Chanal"},
        {value:"Chapultenango",label:"Chapultenango"},
        {value:"Chenalhó",label:"Chenalhó"},
        {value:"Chiapa de Corzo",label:"Chiapa de Corzo"},
        {value:"Chiapilla",label:"Chiapilla"},
        {value:"Chicoasén",label:"Chicoasén"},
        {value:"Chicomuselo",label:"Chicomuselo"},
        {value:"Chilón",label:"Chilón"},
        {value:"Escuintla",label:"Escuintla"},
        {value:"Francisco León",label:"Francisco León"},
        {value:"Frontera Comalapa",label:"Frontera Comalapa"},
        {value:"Frontera Hidalgo",label:"Frontera Hidalgo"},
        {value:"La Grandeza",label:"La Grandeza"},
        {value:"Huehuetán",label:"Huehuetán"},
        {value:"Huixtán",label:"Huixtán"},
        {value:"Huitiupán",label:"Huitiupán"},
        {value:"Huixtla",label:"Huixtla"},
        {value:"La Independencia",label:"La Independencia"},
        {value:"Ixhuatán",label:"Ixhuatán"},
        {value:"Ixtacomitán",label:"Ixtacomitán"},
        {value:"Ixtapa",label:"Ixtapa"},
        {value:"Ixtapangajoya",label:"Ixtapangajoya"},
        {value:"Jiquipilas",label:"Jiquipilas"},
        {value:"Jitotol",label:"Jitotol"},
        {value:"Juárez",label:"Juárez"},
        {value:"Larráinzar",label:"Larráinzar"},
        {value:"La Libertad",label:"La Libertad"},
        {value:"Mapastepec",label:"Mapastepec"},
        {value:"Las Margaritas",label:"Las Margaritas"},
        {value:"Mazapa de Madero",label:"Mazapa de Madero"},
        {value:"Mazatán",label:"Mazatán"},
        {value:"Metapa",label:"Metapa"},
        {value:"Mitontic",label:"Mitontic"},
        {value:"Motozintla",label:"Motozintla"},
        {value:"Nicolás Ruíz",label:"Nicolás Ruíz"},
        {value:"Ocosingo",label:"Ocosingo"},
        {value:"Ocotepec",label:"Ocotepec"},
        {value:"Ocozocoautla de Espinosa",label:"Ocozocoautla de Espinosa"},
        {value:"Ostuacán",label:"Ostuacán"},
        {value:"Osumacinta",label:"Osumacinta"},
        {value:"Oxchuc",label:"Oxchuc"},
        {value:"Palenque",label:"Palenque"},
        {value:"Pantelhó",label:"Pantelhó"},
        {value:"Pantepec",label:"Pantepec"},
        {value:"Pichucalco",label:"Pichucalco"},
        {value:"Pijijiapan",label:"Pijijiapan"},
        {value:"El Porvenir",label:"El Porvenir"},
        {value:"Villa Comaltitlán",label:"Villa Comaltitlán"},
        {value:"Pueblo Nuevo Solistahuacán",label:"Pueblo Nuevo Solistahuacán"},
        {value:"Rayón",label:"Rayón"},
        {value:"Reforma",label:"Reforma"},
        {value:"Las Rosas",label:"Las Rosas"},
        {value:"Sabanilla",label:"Sabanilla"},
        {value:"Salto de Agua",label:"Salto de Agua"},
        {value:"San Cristóbal de las Casas",label:"San Cristóbal de las Casas"},
        {value:"San Fernando",label:"San Fernando"},
        {value:"Siltepec",label:"Siltepec"},
        {value:"Simojovel",label:"Simojovel"},
        {value:"Sitalá",label:"Sitalá"},
        {value:"Socoltenango",label:"Socoltenango"},
        {value:"Solosuchiapa",label:"Solosuchiapa"},
        {value:"Soyaló",label:"Soyaló"},
        {value:"Suchiapa",label:"Suchiapa"},
        {value:"Suchiate",label:"Suchiate"},
        {value:"Sunuapa",label:"Sunuapa"},
        {value:"Tapachula",label:"Tapachula"},
        {value:"Tapalapa",label:"Tapalapa"},
        {value:"Tapilula",label:"Tapilula"},
        {value:"Tecpatán",label:"Tecpatán"},
        {value:"Tenejapa",label:"Tenejapa"},
        {value:"Teopisca",label:"Teopisca"},
        {value:"Tila",label:"Tila"},
        {value:"Tonalá",label:"Tonalá"},
        {value:"Totolapa",label:"Totolapa"},
        {value:"La Trinitaria",label:"La Trinitaria"},
        {value:"Tumbalá",label:"Tumbalá"},
        {value:"Tuxtla Gutiérrez",label:"Tuxtla Gutiérrez"},
        {value:"Tuxtla Chico",label:"Tuxtla Chico"},
        {value:"Tuzantán",label:"Tuzantán"},
        {value:"Tzimol",label:"Tzimol"},
        {value:"Unión Juárez",label:"Unión Juárez"},
        {value:"Venustiano Carranza",label:"Venustiano Carranza"},
        {value:"Villa Corzo",label:"Villa Corzo"},
        {value:"Villaflores",label:"Villaflores"},
        {value:"Yajalón",label:"Yajalón"},
        {value:"San Lucas",label:"San Lucas"},
        {value:"Zinacantán",label:"Zinacantán"},
        {value:"San Juan Cancuc",label:"San Juan Cancuc"},
        {value:"Aldama",label:"Aldama"},
        {value:"Benemérito de las Américas",label:"Benemérito de las Américas"},
        {value:"Maravilla Tenejapa",label:"Maravilla Tenejapa"},
        {value:"Marqués de Comillas",label:"Marqués de Comillas"},
        {value:"Montecristo de Guerrero",label:"Montecristo de Guerrero"},
        {value:"San Andrés Duraznal",label:"San Andrés Duraznal"},
        {value:"Santiago el Pinar",label:"Santiago el Pinar"}
      ];
    }
    if($scope.slcStateProfile == "Chihuahua")
    {
      $scope.slcCityProfileItems = [
        {value:"Ahumada",label:"Ahumada"},
        {value:"Aldama",label:"Aldama"},
        {value:"Allende",label:"Allende"},
        {value:"Aquiles Serdán",label:"Aquiles Serdán"},
        {value:"Ascensión",label:"Ascensión"},
        {value:"Bachíniva",label:"Bachíniva"},
        {value:"Balleza",label:"Balleza"},
        {value:"Batopilas",label:"Batopilas"},
        {value:"Bocoyna",label:"Bocoyna"},
        {value:"Buenaventura",label:"Buenaventura"},
        {value:"Camargo",label:"Camargo"},
        {value:"Carichí",label:"Carichí"},
        {value:"Casas Grandes",label:"Casas Grandes"},
        {value:"Coronado",label:"Coronado"},
        {value:"Coyame del Sotol",label:"Coyame del Sotol"},
        {value:"La Cruz",label:"La Cruz"},
        {value:"Cuauhtémoc",label:"Cuauhtémoc"},
        {value:"Cusihuiriachi",label:"Cusihuiriachi"},
        {value:"Chihuahua",label:"Chihuahua"},
        {value:"Chínipas",label:"Chínipas"},
        {value:"Delicias",label:"Delicias"},
        {value:"Dr. Belisario Domínguez",label:"Dr. Belisario Domínguez"},
        {value:"Galeana",label:"Galeana"},
        {value:"Santa Isabel",label:"Santa Isabel"},
        {value:"Gómez Farías",label:"Gómez Farías"},
        {value:"Gran Morelos",label:"Gran Morelos"},
        {value:"Guachochi",label:"Guachochi"},
        {value:"Guadalupe",label:"Guadalupe"},
        {value:"Guadalupe y Calvo",label:"Guadalupe y Calvo"},
        {value:"Guazapares",label:"Guazapares"},
        {value:"Guerrero",label:"Guerrero"},
        {value:"Hidalgo del Parral",label:"Hidalgo del Parral"},
        {value:"Huejotitán",label:"Huejotitán"},
        {value:"Ignacio Zaragoza",label:"Ignacio Zaragoza"},
        {value:"Janos",label:"Janos"},
        {value:"Jiménez",label:"Jiménez"},
        {value:"Juárez",label:"Juárez"},
        {value:"Julimes",label:"Julimes"},
        {value:"López",label:"López"},
        {value:"Madera",label:"Madera"},
        {value:"Maguarichi",label:"Maguarichi"},
        {value:"Manuel Benavides",label:"Manuel Benavides"},
        {value:"Matachí",label:"Matachí"},
        {value:"Matamoros",label:"Matamoros"},
        {value:"Meoqui",label:"Meoqui"},
        {value:"Morelos",label:"Morelos"},
        {value:"Moris",label:"Moris"},
        {value:"Namiquipa",label:"Namiquipa"},
        {value:"Nonoava",label:"Nonoava"},
        {value:"Nuevo Casas Grandes",label:"Nuevo Casas Grandes"},
        {value:"Ocampo",label:"Ocampo"},
        {value:"Ojinaga",label:"Ojinaga"},
        {value:"Praxedis G. Guerrero",label:"Praxedis G. Guerrero"},
        {value:"Riva Palacio",label:"Riva Palacio"},
        {value:"Rosales",label:"Rosales"},
        {value:"Rosario",label:"Rosario"},
        {value:"San Francisco de Borja",label:"San Francisco de Borja"},
        {value:"San Francisco de Conchos",label:"San Francisco de Conchos"},
        {value:"San Francisco del Oro",label:"San Francisco del Oro"},
        {value:"Santa Bárbara",label:"Santa Bárbara"},
        {value:"Satevó",label:"Satevó"},
        {value:"Saucillo",label:"Saucillo"},
        {value:"Temósachic",label:"Temósachic"},
        {value:"El Tule",label:"El Tule"},
        {value:"Urique",label:"Urique"},
        {value:"Uruachi",label:"Uruachi"},
        {value:"Valle de Zaragoza",label:"Valle de Zaragoza"}
      ];
    }
    if($scope.slcStateProfile == "Coahuila")
    {
      $scope.slcCityProfileItems = [
        {value:"Abasolo",label:"Abasolo"},
        {value:"Acuña",label:"Acuña"},
        {value:"Allende",label:"Allende"},
        {value:"Arteaga",label:"Arteaga"},
        {value:"Candela",label:"Candela"},
        {value:"Castaños",label:"Castaños"},
        {value:"Cuatro Ciénegas",label:"Cuatro Ciénegas"},
        {value:"Escobedo",label:"Escobedo"},
        {value:"Francisco I. Madero",label:"Francisco I. Madero"},
        {value:"Frontera",label:"Frontera"},
        {value:"General Cepeda",label:"General Cepeda"},
        {value:"Guerrero",label:"Guerrero"},
        {value:"Hidalgo",label:"Hidalgo"},
        {value:"Jiménez",label:"Jiménez"},
        {value:"Juárez",label:"Juárez"},
        {value:"Lamadrid",label:"Lamadrid"},
        {value:"Matamoros",label:"Matamoros"},
        {value:"Monclova",label:"Monclova"},
        {value:"Morelos",label:"Morelos"},
        {value:"Múzquiz",label:"Múzquiz"},
        {value:"Nadadores",label:"Nadadores"},
        {value:"Nava",label:"Nava"},
        {value:"Ocampo",label:"Ocampo"},
        {value:"Parras",label:"Parras"},
        {value:"Piedras Negras",label:"Piedras Negras"},
        {value:"Progreso",label:"Progreso"},
        {value:"Ramos Arizpe",label:"Ramos Arizpe"},
        {value:"Sabinas",label:"Sabinas"},
        {value:"Sacramento",label:"Sacramento"},
        {value:"Saltillo",label:"Saltillo"},
        {value:"San Buenaventura",label:"San Buenaventura"},
        {value:"San Juan de Sabinas",label:"San Juan de Sabinas"},
        {value:"San Pedro",label:"San Pedro"},
        {value:"Sierra Mojada",label:"Sierra Mojada"},
        {value:"Torreón",label:"Torreón"},
        {value:"Viesca",label:"Viesca"},
        {value:"Villa Unión",label:"Villa Unión"},
        {value:"Zaragoza",label:"Zaragoza"}
      ];
    }

    if($scope.slcStateProfile == "Colima")
    {
      $scope.slcCityProfileItems = [
        {value:"Armería",label:"Armería"},
        {value:"Colima",label:"Colima"},
        {value:"Comala",label:"Comala"},
        {value:"Coquimatlán",label:"Coquimatlán"},
        {value:"Cuauhtémoc",label:"Cuauhtémoc"},
        {value:"Ixtlahuacán",label:"Ixtlahuacán"},
        {value:"Manzanillo",label:"Manzanillo"},
        {value:"Minatitlán",label:"Minatitlán"},
        {value:"Tecomán",label:"Tecomán"},
        {value:"Villa de Álvarez",label:"Villa de Álvarez"}
      ];
    }

    if($scope.slcStateProfile == "CDMX")
    {
      $scope.slcCityProfileItems = [
        {value:"Azcapotzalco",label:"Azcapotzalco"},
        {value:"Coyoacán",label:"Coyoacán"},
        {value:"Cuajimalpa de Morelos",label:"Cuajimalpa de Morelos"},
        {value:"Gustavo A. Madero",label:"Gustavo A. Madero"},
        {value:"Iztacalco",label:"Iztacalco"},
        {value:"Iztapalapa",label:"Iztapalapa"},
        {value:"La Magdalena Contreras",label:"La Magdalena Contreras"},
        {value:"Milpa Alta",label:"Milpa Alta"},
        {value:"Álvaro Obregón",label:"Álvaro Obregón"},
        {value:"Tláhuac",label:"Tláhuac"},
        {value:"Tlalpan",label:"Tlalpan"},
        {value:"Xochimilco",label:"Xochimilco"},
        {value:"Benito Juárez",label:"Benito Juárez"},
        {value:"Cuauhtémoc",label:"Cuauhtémoc"},
        {value:"Miguel Hidalgo",label:"Miguel Hidalgo"},
        {value:"Venustiano Carranza",label:"Venustiano Carranza"}
      ];
    }
    if($scope.slcStateProfile == "Durango")
    {
      $scope.slcCityProfileItems = [
        {value:"Canatlán",label:"Canatlán"},
        {value:"Canelas",label:"Canelas"},
        {value:"Coneto de Comonfort",label:"Coneto de Comonfort"},
        {value:"Cuencamé",label:"Cuencamé"},
        {value:"Durango",label:"Durango"},
        {value:"General Simón Bolívar",label:"General Simón Bolívar"},
        {value:"Gómez Palacio",label:"Gómez Palacio"},
        {value:"Guadalupe Victoria",label:"Guadalupe Victoria"},
        {value:"Guanaceví",label:"Guanaceví"},
        {value:"Hidalgo",label:"Hidalgo"},
        {value:"Indé",label:"Indé"},
        {value:"Lerdo",label:"Lerdo"},
        {value:"Mapimí",label:"Mapimí"},
        {value:"Mezquital",label:"Mezquital"},
        {value:"Nazas",label:"Nazas"},
        {value:"Nombre de Dios",label:"Nombre de Dios"},
        {value:"Ocampo",label:"Ocampo"},
        {value:"El Oro",label:"El Oro"},
        {value:"Otáez",label:"Otáez"},
        {value:"Pánuco de Coronado",label:"Pánuco de Coronado"},
        {value:"Peñón Blanco",label:"Peñón Blanco"},
        {value:"Poanas",label:"Poanas"},
        {value:"Pueblo Nuevo",label:"Pueblo Nuevo"},
        {value:"Rodeo",label:"Rodeo"},
        {value:"San Bernardo",label:"San Bernardo"},
        {value:"San Dimas",label:"San Dimas"},
        {value:"San Juan de Guadalupe",label:"San Juan de Guadalupe"},
        {value:"San Juan del Río",label:"San Juan del Río"},
        {value:"San Luis del Cordero",label:"San Luis del Cordero"},
        {value:"San Pedro del Gallo",label:"San Pedro del Gallo"},
        {value:"Santa Clara",label:"Santa Clara"},
        {value:"Santiago Papasquiaro",label:"Santiago Papasquiaro"},
        {value:"Súchil",label:"Súchil"},
        {value:"Tamazula",label:"Tamazula"},
        {value:"Tepehuanes",label:"Tepehuanes"},
        {value:"Tlahualilo",label:"Tlahualilo"},
        {value:"Topia",label:"Topia"},
        {value:"Vicente Guerrero",label:"Vicente Guerrero"},
        {value:"Nuevo Ideal",label:"Nuevo Ideal"}
      ];
    }
    if($scope.slcStateProfile == "Guanajuato")
    {
      $scope.slcCityProfileItems = [

        {value:"Abasolo",label:"Abasolo"},
        {value:"Acámbaro",label:"Acámbaro"},
        {value:"San Miguel de Allende",label:"San Miguel de Allende"},
        {value:"Apaseo el Alto",label:"Apaseo el Alto"},
        {value:"Apaseo el Grande",label:"Apaseo el Grande"},
        {value:"Atarjea",label:"Atarjea"},
        {value:"Celaya",label:"Celaya"},
        {value:"Manuel Doblado",label:"Manuel Doblado"},
        {value:"Comonfort",label:"Comonfort"},
        {value:"Coroneo",label:"Coroneo"},
        {value:"Cortazar",label:"Cortazar"},
        {value:"Cuerámaro",label:"Cuerámaro"},
        {value:"Doctor Mora",label:"Doctor Mora"},
        {value:"Dolores Hidalgo Cuna de la Independencia Nacional",label:"Dolores Hidalgo Cuna de la Independencia Nacional"},
        {value:"Guanajuato",label:"Guanajuato"},
        {value:"Huanímaro",label:"Huanímaro"},
        {value:"Irapuato",label:"Irapuato"},
        {value:"Jaral del Progreso",label:"Jaral del Progreso"},
        {value:"Jerécuaro",label:"Jerécuaro"},
        {value:"León",label:"León"},
        {value:"Moroleón",label:"Moroleón"},
        {value:"Ocampo",label:"Ocampo"},
        {value:"Pénjamo",label:"Pénjamo"},
        {value:"Pueblo Nuevo",label:"Pueblo Nuevo"},
        {value:"Purísima del Rincón",label:"Purísima del Rincón"},
        {value:"Romita",label:"Romita"},
        {value:"Salamanca",label:"Salamanca"},
        {value:"Salvatierra",label:"Salvatierra"},
        {value:"San Diego de la Unión",label:"San Diego de la Unión"},
        {value:"San Felipe",label:"San Felipe"},
        {value:"San Francisco del Rincón",label:"San Francisco del Rincón"},
        {value:"San José Iturbide",label:"San José Iturbide"},
        {value:"San Luis de la Paz",label:"San Luis de la Paz"},
        {value:"Santa Catarina",label:"Santa Catarina"},
        {value:"Santa Cruz de Juventino Rosas",label:"Santa Cruz de Juventino Rosas"},
        {value:"Santiago Maravatío",label:"Santiago Maravatío"},
        {value:"Silao",label:"Silao"},
        {value:"Tarandacuao",label:"Tarandacuao"},
        {value:"Tarimoro",label:"Tarimoro"},
        {value:"Tierra Blanca",label:"Tierra Blanca"},
        {value:"Uriangato",label:"Uriangato"},
        {value:"Valle de Santiago",label:"Valle de Santiago"},
        {value:"Victoria",label:"Victoria"},
        {value:"Villagrán",label:"Villagrán"},
        {value:"Xichú",label:"Xichú"},
        {value:"Yuriria",label:"Yuriria"}
      ];

    }

    if($scope.slcStateProfile == "Guerrero")
    {
      $scope.slcCityProfileItems = [
        {value:"Acapulco de Juárez",label:"Acapulco de Juárez"},
        {value:"Ahuacuotzingo",label:"Ahuacuotzingo"},
        {value:"Ajuchitlán del Progreso",label:"Ajuchitlán del Progreso"},
        {value:"Alcozauca de Guerrero",label:"Alcozauca de Guerrero"},
        {value:"Alpoyeca",label:"Alpoyeca"},
        {value:"Apaxtla",label:"Apaxtla"},
        {value:"Arcelia",label:"Arcelia"},
        {value:"Atenango del Río",label:"Atenango del Río"},
        {value:"Atlamajalcingo del Monte",label:"Atlamajalcingo del Monte"},
        {value:"Atlixtac",label:"Atlixtac"},
        {value:"Atoyac de Álvarez",label:"Atoyac de Álvarez"},
        {value:"Ayutla de los Libres",label:"Ayutla de los Libres"},
        {value:"Azoyú",label:"Azoyú"},
        {value:"Benito Juárez",label:"Benito Juárez"},
        {value:"Buenavista de Cuéllar",label:"Buenavista de Cuéllar"},
        {value:"Coahuayutla de José María Izazaga",label:"Coahuayutla de José María Izazaga"},
        {value:"Cocula",label:"Cocula"},
        {value:"Copala",label:"Copala"},
        {value:"Copalillo",label:"Copalillo"},
        {value:"Copanatoyac",label:"Copanatoyac"},
        {value:"Coyuca de Benítez",label:"Coyuca de Benítez"},
        {value:"Coyuca de Catalán",label:"Coyuca de Catalán"},
        {value:"Cuajinicuilapa",label:"Cuajinicuilapa"},
        {value:"Cualác",label:"Cualác"},
        {value:"Cuautepec",label:"Cuautepec"},
        {value:"Cuetzala del Progreso",label:"Cuetzala del Progreso"},
        {value:"Cutzamala de Pinzón",label:"Cutzamala de Pinzón"},
        {value:"Chilapa de Álvarez",label:"Chilapa de Álvarez"},
        {value:"Chilpancingo de los Bravo",label:"Chilpancingo de los Bravo"},
        {value:"Florencio Villarreal",label:"Florencio Villarreal"},
        {value:"General Canuto A. Neri",label:"General Canuto A. Neri"},
        {value:"General Heliodoro Castillo",label:"General Heliodoro Castillo"},
        {value:"Huamuxtitlán",label:"Huamuxtitlán"},
        {value:"Huitzuco de los Figueroa",label:"Huitzuco de los Figueroa"},
        {value:"Iguala de la Independencia",label:"Iguala de la Independencia"},
        {value:"Igualapa",label:"Igualapa"},
        {value:"Ixcateopan de Cuauhtémoc",label:"Ixcateopan de Cuauhtémoc"},
        {value:"Zihuatanejo de Azueta",label:"Zihuatanejo de Azueta"},
        {value:"Juan R. Escudero",label:"Juan R. Escudero"},
        {value:"Leonardo Bravo",label:"Leonardo Bravo"},
        {value:"Malinaltepec",label:"Malinaltepec"},
        {value:"Mártir de Cuilapan",label:"Mártir de Cuilapan"},
        {value:"Metlatónoc",label:"Metlatónoc"},
        {value:"Mochitlán",label:"Mochitlán"},
        {value:"Olinalá",label:"Olinalá"},
        {value:"Ometepec",label:"Ometepec"},
        {value:"Pedro Ascencio Alquisiras",label:"Pedro Ascencio Alquisiras"},
        {value:"Petatlán",label:"Petatlán"},
        {value:"Pilcaya",label:"Pilcaya"},
        {value:"Pungarabato",label:"Pungarabato"},
        {value:"Quechultenango",label:"Quechultenango"},
        {value:"San Luis Acatlán",label:"San Luis Acatlán"},
        {value:"San Marcos",label:"San Marcos"},
        {value:"San Miguel Totolapan",label:"San Miguel Totolapan"},
        {value:"Taxco de Alarcón",label:"Taxco de Alarcón"},
        {value:"Tecoanapa",label:"Tecoanapa"},
        {value:"Técpan de Galeana",label:"Técpan de Galeana"},
        {value:"Teloloapan",label:"Teloloapan"},
        {value:"Tepecoacuilco de Trujano",label:"Tepecoacuilco de Trujano"},
        {value:"Tetipac",label:"Tetipac"},
        {value:"Tixtla de Guerrero",label:"Tixtla de Guerrero"},
        {value:"Tlacoachistlahuaca",label:"Tlacoachistlahuaca"},
        {value:"Tlacoapa",label:"Tlacoapa"},
        {value:"Tlalchapa",label:"Tlalchapa"},
        {value:"Tlalixtaquilla de Maldonado",label:"Tlalixtaquilla de Maldonado"},
        {value:"Tlapa de Comonfort",label:"Tlapa de Comonfort"},
        {value:"Tlapehuala",label:"Tlapehuala"},
        {value:"La Unión de Isidoro Montes de Oca",label:"La Unión de Isidoro Montes de Oca"},
        {value:"Xalpatláhuac",label:"Xalpatláhuac"},
        {value:"Xochihuehuetlán",label:"Xochihuehuetlán"},
        {value:"Xochistlahuaca",label:"Xochistlahuaca"},
        {value:"Zapotitlán Tablas",label:"Zapotitlán Tablas"},
        {value:"Zirándaro",label:"Zirándaro"},
        {value:"Zitlala",label:"Zitlala"},
        {value:"Eduardo Neri",label:"Eduardo Neri"},
        {value:"Acatepec",label:"Acatepec"},
        {value:"Marquelia",label:"Marquelia"},
        {value:"Cochoapa el Grande",label:"Cochoapa el Grande"},
        {value:"José Joaquín de Herrera",label:"José Joaquín de Herrera"},
        {value:"Juchitán",label:"Juchitán"},
        {value:"Iliatenco",label:"Iliatenco"}
      ];

    }
    if($scope.slcStateProfile == "Hidalgo")
    {
      $scope.slcCityProfileItems = [
        {value:"Acatlán",label:"Acatlán"},
        {value:"Acaxochitlán",label:"Acaxochitlán"},
        {value:"Actopan",label:"Actopan"},
        {value:"Agua Blanca de Iturbide",label:"Agua Blanca de Iturbide"},
        {value:"Ajacuba",label:"Ajacuba"},
        {value:"Alfajayucan",label:"Alfajayucan"},
        {value:"Almoloya",label:"Almoloya"},
        {value:"Apan",label:"Apan"},
        {value:"El Arenal",label:"El Arenal"},
        {value:"Atitalaquia",label:"Atitalaquia"},
        {value:"Atlapexco",label:"Atlapexco"},
        {value:"Atotonilco el Grande",label:"Atotonilco el Grande"},
        {value:"Atotonilco de Tula",label:"Atotonilco de Tula"},
        {value:"Calnali",label:"Calnali"},
        {value:"Cardonal",label:"Cardonal"},
        {value:"Cuautepec de Hinojosa",label:"Cuautepec de Hinojosa"},
        {value:"Chapantongo",label:"Chapantongo"},
        {value:"Chapulhuacán",label:"Chapulhuacán"},
        {value:"Chilcuautla",label:"Chilcuautla"},
        {value:"Eloxochitlán",label:"Eloxochitlán"},
        {value:"Emiliano Zapata",label:"Emiliano Zapata"},
        {value:"Epazoyucan",label:"Epazoyucan"},
        {value:"Francisco I. Madero",label:"Francisco I. Madero"},
        {value:"Huasca de Ocampo",label:"Huasca de Ocampo"},
        {value:"Huautla",label:"Huautla"},
        {value:"Huazalingo",label:"Huazalingo"},
        {value:"Huehuetla",label:"Huehuetla"},
        {value:"Huejutla de Reyes",label:"Huejutla de Reyes"},
        {value:"Huichapan",label:"Huichapan"},
        {value:"Ixmiquilpan",label:"Ixmiquilpan"},
        {value:"Jacala de Ledezma",label:"Jacala de Ledezma"},
        {value:"Jaltocán",label:"Jaltocán"},
        {value:"Juárez Hidalgo",label:"Juárez Hidalgo"},
        {value:"Lolotla",label:"Lolotla"},
        {value:"Metepec",label:"Metepec"},
        {value:"San Agustín Metzquititlán",label:"San Agustín Metzquititlán"},
        {value:"Metztitlán",label:"Metztitlán"},
        {value:"Mineral del Chico",label:"Mineral del Chico"},
        {value:"Mineral del Monte",label:"Mineral del Monte"},
        {value:"La Misión",label:"La Misión"},
        {value:"Mixquiahuala de Juárez",label:"Mixquiahuala de Juárez"},
        {value:"Molango de Escamilla",label:"Molango de Escamilla"},
        {value:"Nicolás Flores",label:"Nicolás Flores"},
        {value:"Nopala de Villagrán",label:"Nopala de Villagrán"},
        {value:"Omitlán de Juárez",label:"Omitlán de Juárez"},
        {value:"San Felipe Orizatlán",label:"San Felipe Orizatlán"},
        {value:"Pacula",label:"Pacula"},
        {value:"Pachuca de Soto",label:"Pachuca de Soto"},
        {value:"Pisaflores",label:"Pisaflores"},
        {value:"Progreso de Obregón",label:"Progreso de Obregón"},
        {value:"Mineral de la Reforma",label:"Mineral de la Reforma"},
        {value:"San Agustín Tlaxiaca",label:"San Agustín Tlaxiaca"},
        {value:"San Bartolo Tutotepec",label:"San Bartolo Tutotepec"},
        {value:"San Salvador",label:"San Salvador"},
        {value:"Santiago de Anaya",label:"Santiago de Anaya"},
        {value:"Santiago Tulantepec de Lugo Guerrero",label:"Santiago Tulantepec de Lugo Guerrero"},
        {value:"Singuilucan",label:"Singuilucan"},
        {value:"Tasquillo",label:"Tasquillo"},
        {value:"Tecozautla",label:"Tecozautla"},
        {value:"Tenango de Doria",label:"Tenango de Doria"},
        {value:"Tepeapulco",label:"Tepeapulco"},
        {value:"Tepehuacán de Guerrero",label:"Tepehuacán de Guerrero"},
        {value:"Tepeji del Río de Ocampo",label:"Tepeji del Río de Ocampo"},
        {value:"Tepetitlán",label:"Tepetitlán"},
        {value:"Tetepango",label:"Tetepango"},
        {value:"Villa de Tezontepec",label:"Villa de Tezontepec"},
        {value:"Tezontepec de Aldama",label:"Tezontepec de Aldama"},
        {value:"Tianguistengo",label:"Tianguistengo"},
        {value:"Tizayuca",label:"Tizayuca"},
        {value:"Tlahuelilpan",label:"Tlahuelilpan"},
        {value:"Tlahuiltepa",label:"Tlahuiltepa"},
        {value:"Tlanalapa",label:"Tlanalapa"},
        {value:"Tlanchinol",label:"Tlanchinol"},
        {value:"Tlaxcoapan",label:"Tlaxcoapan"},
        {value:"Tolcayuca",label:"Tolcayuca"},
        {value:"Tula de Allende",label:"Tula de Allende"},
        {value:"Tulancingo de Bravo",label:"Tulancingo de Bravo"},
        {value:"Xochiatipan",label:"Xochiatipan"},
        {value:"Xochicoatlán",label:"Xochicoatlán"},
        {value:"Yahualica",label:"Yahualica"},
        {value:"Zacualtipán de Ángeles",label:"Zacualtipán de Ángeles"},
        {value:"Zapotlán de Juárez",label:"Zapotlán de Juárez"},
        {value:"Zempoala",label:"Zempoala"},
        {value:"Zimapán",label:"Zimapán"}
      ];

    }
    if($scope.slcStateProfile == "Jalisco")
    {
      $scope.slcCityProfileItems = [
        {value:"Acatic",label:"Acatic"},
        {value:"Acatlán de Juárez",label:"Acatlán de Juárez"},
        {value:"Ahualulco de Mercado",label:"Ahualulco de Mercado"},
        {value:"Amacueca",label:"Amacueca"},
        {value:"Amatitán",label:"Amatitán"},
        {value:"Ameca",label:"Ameca"},
        {value:"San Juanito de Escobedo",label:"San Juanito de Escobedo"},
        {value:"Arandas",label:"Arandas"},
        {value:"El Arenal",label:"El Arenal"},
        {value:"Atemajac de Brizuela",label:"Atemajac de Brizuela"},
        {value:"Atengo",label:"Atengo"},
        {value:"Atenguillo",label:"Atenguillo"},
        {value:"Atotonilco el Alto",label:"Atotonilco el Alto"},
        {value:"Atoyac",label:"Atoyac"},
        {value:"Autlán de Navarro",label:"Autlán de Navarro"},
        {value:"Ayotlán",label:"Ayotlán"},
        {value:"Ayutla",label:"Ayutla"},
        {value:"La Barca",label:"La Barca"},
        {value:"Bolaños",label:"Bolaños"},
        {value:"Cabo Corrientes",label:"Cabo Corrientes"},
        {value:"Casimiro Castillo",label:"Casimiro Castillo"},
        {value:"Cihuatlán",label:"Cihuatlán"},
        {value:"Zapotlán el Grande",label:"Zapotlán el Grande"},
        {value:"Cocula",label:"Cocula"},
        {value:"Colotlán",label:"Colotlán"},
        {value:"Concepción de Buenos Aires",label:"Concepción de Buenos Aires"},
        {value:"Cuautitlán de García Barragán",label:"Cuautitlán de García Barragán"},
        {value:"Cuautla",label:"Cuautla"},
        {value:"Cuquío",label:"Cuquío"},
        {value:"Chapala",label:"Chapala"},
        {value:"Chimaltitán",label:"Chimaltitán"},
        {value:"Chiquilistlán",label:"Chiquilistlán"},
        {value:"Degollado",label:"Degollado"},
        {value:"Ejutla",label:"Ejutla"},
        {value:"Encarnación de Díaz",label:"Encarnación de Díaz"},
        {value:"Etzatlán",label:"Etzatlán"},
        {value:"El Grullo",label:"El Grullo"},
        {value:"Guachinango",label:"Guachinango"},
        {value:"Guadalajara",label:"Guadalajara"},
        {value:"Hostotipaquillo",label:"Hostotipaquillo"},
        {value:"Huejúcar",label:"Huejúcar"},
        {value:"Huejuquilla el Alto",label:"Huejuquilla el Alto"},
        {value:"La Huerta",label:"La Huerta"},
        {value:"Ixtlahuacán de los Membrillos",label:"Ixtlahuacán de los Membrillos"},
        {value:"Ixtlahuacán del Río",label:"Ixtlahuacán del Río"},
        {value:"Jalostotitlán",label:"Jalostotitlán"},
        {value:"Jamay",label:"Jamay"},
        {value:"Jesús María",label:"Jesús María"},
        {value:"Jilotlán de los Dolores",label:"Jilotlán de los Dolores"},
        {value:"Jocotepec",label:"Jocotepec"},
        {value:"Juanacatlán",label:"Juanacatlán"},
        {value:"Juchitlán",label:"Juchitlán"},
        {value:"Lagos de Moreno",label:"Lagos de Moreno"},
        {value:"El Limón",label:"El Limón"},
        {value:"Magdalena",label:"Magdalena"},
        {value:"Santa María del Oro",label:"Santa María del Oro"},
        {value:"La Manzanilla de la Paz",label:"La Manzanilla de la Paz"},
        {value:"Mascota",label:"Mascota"},
        {value:"Mazamitla",label:"Mazamitla"},
        {value:"Mexticacán",label:"Mexticacán"},
        {value:"Mezquitic",label:"Mezquitic"},
        {value:"Mixtlán",label:"Mixtlán"},
        {value:"Ocotlán",label:"Ocotlán"},
        {value:"Ojuelos de Jalisco",label:"Ojuelos de Jalisco"},
        {value:"Pihuamo",label:"Pihuamo"},
        {value:"Poncitlán",label:"Poncitlán"},
        {value:"Puerto Vallarta",label:"Puerto Vallarta"},
        {value:"Villa Purificación",label:"Villa Purificación"},
        {value:"Quitupan",label:"Quitupan"},
        {value:"El Salto",label:"El Salto"},
        {value:"San Cristóbal de la Barranca",label:"San Cristóbal de la Barranca"},
        {value:"San Diego de Alejandría",label:"San Diego de Alejandría"},
        {value:"San Juan de los Lagos",label:"San Juan de los Lagos"},
        {value:"San Julián",label:"San Julián"},
        {value:"San Marcos",label:"San Marcos"},
        {value:"San Martín de Bolaños",label:"San Martín de Bolaños"},
        {value:"San Martín Hidalgo",label:"San Martín Hidalgo"},
        {value:"San Miguel el Alto",label:"San Miguel el Alto"},
        {value:"Gómez Farías",label:"Gómez Farías"},
        {value:"San Sebastián del Oeste",label:"San Sebastián del Oeste"},
        {value:"Santa María de los Ángeles",label:"Santa María de los Ángeles"},
        {value:"Sayula",label:"Sayula"},
        {value:"Tala",label:"Tala"},
        {value:"Talpa de Allende",label:"Talpa de Allende"},
        {value:"Tamazula de Gordiano",label:"Tamazula de Gordiano"},
        {value:"Tapalpa",label:"Tapalpa"},
        {value:"Tecalitlán",label:"Tecalitlán"},
        {value:"Tecolotlán",label:"Tecolotlán"},
        {value:"Techaluta de Montenegro",label:"Techaluta de Montenegro"},
        {value:"Tenamaxtlán",label:"Tenamaxtlán"},
        {value:"Teocaltiche",label:"Teocaltiche"},
        {value:"Teocuitatlán de Corona",label:"Teocuitatlán de Corona"},
        {value:"Tepatitlán de Morelos",label:"Tepatitlán de Morelos"},
        {value:"Tequila",label:"Tequila"},
        {value:"Teuchitlán",label:"Teuchitlán"},
        {value:"Tizapán el Alto",label:"Tizapán el Alto"},
        {value:"Tlajomulco de Zúñiga",label:"Tlajomulco de Zúñiga"},
        {value:"San Pedro Tlaquepaque",label:"San Pedro Tlaquepaque"},
        {value:"Tolimán",label:"Tolimán"},
        {value:"Tomatlán",label:"Tomatlán"},
        {value:"Tonalá",label:"Tonalá"},
        {value:"Tonaya",label:"Tonaya"},
        {value:"Tonila",label:"Tonila"},
        {value:"Totatiche",label:"Totatiche"},
        {value:"Tototlán",label:"Tototlán"},
        {value:"Tuxcacuesco",label:"Tuxcacuesco"},
        {value:"Tuxcueca",label:"Tuxcueca"},
        {value:"Tuxpan",label:"Tuxpan"},
        {value:"Unión de San Antonio",label:"Unión de San Antonio"},
        {value:"Unión de Tula",label:"Unión de Tula"},
        {value:"Valle de Guadalupe",label:"Valle de Guadalupe"},
        {value:"Valle de Juárez",label:"Valle de Juárez"},
        {value:"San Gabriel",label:"San Gabriel"},
        {value:"Villa Corona",label:"Villa Corona"},
        {value:"Villa Guerrero",label:"Villa Guerrero"},
        {value:"Villa Hidalgo",label:"Villa Hidalgo"},
        {value:"Cañadas de Obregón",label:"Cañadas de Obregón"},
        {value:"Yahualica de González Gallo",label:"Yahualica de González Gallo"},
        {value:"Zacoalco de Torres",label:"Zacoalco de Torres"},
        {value:"Zapopan",label:"Zapopan"},
        {value:"Zapotiltic",label:"Zapotiltic"},
        {value:"Zapotitlán de Vadillo",label:"Zapotitlán de Vadillo"},
        {value:"Zapotlán del Rey",label:"Zapotlán del Rey"},
        {value:"Zapotlanejo",label:"Zapotlanejo"},
        {value:"San Ignacio Cerro Gordo",label:"San Ignacio Cerro Gordo"}
      ];
    }
    if($scope.slcStateProfile == "Michoacán")
    {
      $scope.slcCityProfileItems = [
        {value:"Acuitzio",label:"Acuitzio"},
        {value:"Aguililla",label:"Aguililla"},
        {value:"Álvaro Obregón",label:"Álvaro Obregón"},
        {value:"Angamacutiro",label:"Angamacutiro"},
        {value:"Angangueo",label:"Angangueo"},
        {value:"Apatzingán",label:"Apatzingán"},
        {value:"Aporo",label:"Aporo"},
        {value:"Aquila",label:"Aquila"},
        {value:"Ario",label:"Ario"},
        {value:"Arteaga",label:"Arteaga"},
        {value:"Briseñas",label:"Briseñas"},
        {value:"Buenavista",label:"Buenavista"},
        {value:"Carácuaro",label:"Carácuaro"},
        {value:"Coahuayana",label:"Coahuayana"},
        {value:"Coalcomán de Vázquez Pallares",label:"Coalcomán de Vázquez Pallares"},
        {value:"Coeneo",label:"Coeneo"},
        {value:"Contepec",label:"Contepec"},
        {value:"Copándaro",label:"Copándaro"},
        {value:"Cotija",label:"Cotija"},
        {value:"Cuitzeo",label:"Cuitzeo"},
        {value:"Charapan",label:"Charapan"},
        {value:"Charo",label:"Charo"},
        {value:"Chavinda",label:"Chavinda"},
        {value:"Cherán",label:"Cherán"},
        {value:"Chilchota",label:"Chilchota"},
        {value:"Chinicuila",label:"Chinicuila"},
        {value:"Chucándiro",label:"Chucándiro"},
        {value:"Churintzio",label:"Churintzio"},
        {value:"Churumuco",label:"Churumuco"},
        {value:"Ecuandureo",label:"Ecuandureo"},
        {value:"Epitacio Huerta",label:"Epitacio Huerta"},
        {value:"Erongarícuaro",label:"Erongarícuaro"},
        {value:"Gabriel Zamora",label:"Gabriel Zamora"},
        {value:"Hidalgo",label:"Hidalgo"},
        {value:"La Huacana",label:"La Huacana"},
        {value:"Huandacareo",label:"Huandacareo"},
        {value:"Huaniqueo",label:"Huaniqueo"},
        {value:"Huetamo",label:"Huetamo"},
        {value:"Huiramba",label:"Huiramba"},
        {value:"Indaparapeo",label:"Indaparapeo"},
        {value:"Irimbo",label:"Irimbo"},
        {value:"Ixtlán",label:"Ixtlán"},
        {value:"Jacona",label:"Jacona"},
        {value:"Jiménez",label:"Jiménez"},
        {value:"Jiquilpan",label:"Jiquilpan"},
        {value:"Juárez",label:"Juárez"},
        {value:"Jungapeo",label:"Jungapeo"},
        {value:"Lagunillas",label:"Lagunillas"},
        {value:"Madero",label:"Madero"},
        {value:"Maravatío",label:"Maravatío"},
        {value:"Marcos Castellanos",label:"Marcos Castellanos"},
        {value:"Lázaro Cárdenas",label:"Lázaro Cárdenas"},
        {value:"Morelia",label:"Morelia"},
        {value:"Morelos",label:"Morelos"},
        {value:"Múgica",label:"Múgica"},
        {value:"Nahuatzen",label:"Nahuatzen"},
        {value:"Nocupétaro",label:"Nocupétaro"},
        {value:"Nuevo Parangaricutiro",label:"Nuevo Parangaricutiro"},
        {value:"Nuevo Urecho",label:"Nuevo Urecho"},
        {value:"Numarán",label:"Numarán"},
        {value:"Ocampo",label:"Ocampo"},
        {value:"Pajacuarán",label:"Pajacuarán"},
        {value:"Panindícuaro",label:"Panindícuaro"},
        {value:"Parácuaro",label:"Parácuaro"},
        {value:"Paracho",label:"Paracho"},
        {value:"Pátzcuaro",label:"Pátzcuaro"},
        {value:"Penjamillo",label:"Penjamillo"},
        {value:"Peribán",label:"Peribán"},
        {value:"La Piedad",label:"La Piedad"},
        {value:"Purépero",label:"Purépero"},
        {value:"Puruándiro",label:"Puruándiro"},
        {value:"Queréndaro",label:"Queréndaro"},
        {value:"Quiroga",label:"Quiroga"},
        {value:"Cojumatlán de Régules",label:"Cojumatlán de Régules"},
        {value:"Los Reyes",label:"Los Reyes"},
        {value:"Sahuayo",label:"Sahuayo"},
        {value:"San Lucas",label:"San Lucas"},
        {value:"Santa Ana Maya",label:"Santa Ana Maya"},
        {value:"Salvador Escalante",label:"Salvador Escalante"},
        {value:"Senguio",label:"Senguio"},
        {value:"Susupuato",label:"Susupuato"},
        {value:"Tacámbaro",label:"Tacámbaro"},
        {value:"Tancítaro",label:"Tancítaro"},
        {value:"Tangamandapio",label:"Tangamandapio"},
        {value:"Tangancícuaro",label:"Tangancícuaro"},
        {value:"Tanhuato",label:"Tanhuato"},
        {value:"Taretan",label:"Taretan"},
        {value:"Tarímbaro",label:"Tarímbaro"},
        {value:"Tepalcatepec",label:"Tepalcatepec"},
        {value:"Tingambato",label:"Tingambato"},
        {value:"Tinguindín",label:"Tinguindín"},
        {value:"Tiquicheo de Nicolás Romero",label:"Tiquicheo de Nicolás Romero"},
        {value:"Tlalpujahua",label:"Tlalpujahua"},
        {value:"Tlazazalca",label:"Tlazazalca"},
        {value:"Tocumbo",label:"Tocumbo"},
        {value:"Tumbiscatío",label:"Tumbiscatío"},
        {value:"Turicato",label:"Turicato"},
        {value:"Tuxpan",label:"Tuxpan"},
        {value:"Tuzantla",label:"Tuzantla"},
        {value:"Tzintzuntzan",label:"Tzintzuntzan"},
        {value:"Tzitzio",label:"Tzitzio"},
        {value:"Uruapan",label:"Uruapan"},
        {value:"Venustiano Carranza",label:"Venustiano Carranza"},
        {value:"Villamar",label:"Villamar"},
        {value:"Vista Hermosa",label:"Vista Hermosa"},
        {value:"Yurécuaro",label:"Yurécuaro"},
        {value:"Zacapu",label:"Zacapu"},
        {value:"Zamora",label:"Zamora"},
        {value:"Zináparo",label:"Zináparo"},
        {value:"Zinapécuaro",label:"Zinapécuaro"},
        {value:"Ziracuaretiro",label:"Ziracuaretiro"},
        {value:"Zitácuaro",label:"Zitácuaro"},
        {value:"José Sixto Verduzco",label:"José Sixto Verduzco"}
      ];
    }
    if($scope.slcStateProfile == "Morelos")
    {
      $scope.slcCityProfileItems = [
        {value:"Amacuzac",label:"Amacuzac"},
        {value:"Atlatlahucan",label:"Atlatlahucan"},
        {value:"Axochiapan",label:"Axochiapan"},
        {value:"Ayala",label:"Ayala"},
        {value:"Coatlán del Río",label:"Coatlán del Río"},
        {value:"Cuautla",label:"Cuautla"},
        {value:"Cuernavaca",label:"Cuernavaca"},
        {value:"Emiliano Zapata",label:"Emiliano Zapata"},
        {value:"Huitzilac",label:"Huitzilac"},
        {value:"Jantetelco",label:"Jantetelco"},
        {value:"Jiutepec",label:"Jiutepec"},
        {value:"Jojutla",label:"Jojutla"},
        {value:"Jonacatepec",label:"Jonacatepec"},
        {value:"Mazatepec",label:"Mazatepec"},
        {value:"Miacatlán",label:"Miacatlán"},
        {value:"Ocuituco",label:"Ocuituco"},
        {value:"Puente de Ixtla",label:"Puente de Ixtla"},
        {value:"Temixco",label:"Temixco"},
        {value:"Tepalcingo",label:"Tepalcingo"},
        {value:"Tepoztlán",label:"Tepoztlán"},
        {value:"Tetecala",label:"Tetecala"},
        {value:"Tetela del Volcán",label:"Tetela del Volcán"},
        {value:"Tlalnepantla",label:"Tlalnepantla"},
        {value:"Tlaltizapán de Zapata",label:"Tlaltizapán de Zapata"},
        {value:"Tlaquiltenango",label:"Tlaquiltenango"},
        {value:"Tlayacapan",label:"Tlayacapan"},
        {value:"Totolapan",label:"Totolapan"},
        {value:"Xochitepec",label:"Xochitepec"},
        {value:"Yautepec",label:"Yautepec"},
        {value:"Yecapixtla",label:"Yecapixtla"},
        {value:"Zacatepec",label:"Zacatepec"},
        {value:"Zacualpan",label:"Zacualpan"},
        {value:"Temoac",label:"Temoac"}
      ];
    }
    if($scope.slcStateProfile == "Estado de México")
    {
      $scope.slcCityProfileItems = [
        {value:"Acambay de Ruíz Castañeda",label:"Acambay de Ruíz Castañeda"},
        {value:"Acolman",label:"Acolman"},
        {value:"Aculco",label:"Aculco"},
        {value:"Almoloya de Alquisiras",label:"Almoloya de Alquisiras"},
        {value:"Almoloya de Juárez",label:"Almoloya de Juárez"},
        {value:"Almoloya del Río",label:"Almoloya del Río"},
        {value:"Amanalco",label:"Amanalco"},
        {value:"Amatepec",label:"Amatepec"},
        {value:"Amecameca",label:"Amecameca"},
        {value:"Apaxco",label:"Apaxco"},
        {value:"Atenco",label:"Atenco"},
        {value:"Atizapán",label:"Atizapán"},
        {value:"Atizapán de Zaragoza",label:"Atizapán de Zaragoza"},
        {value:"Atlacomulco",label:"Atlacomulco"},
        {value:"Atlautla",label:"Atlautla"},
        {value:"Axapusco",label:"Axapusco"},
        {value:"Ayapango",label:"Ayapango"},
        {value:"Calimaya",label:"Calimaya"},
        {value:"Capulhuac",label:"Capulhuac"},
        {value:"Coacalco de Berriozábal",label:"Coacalco de Berriozábal"},
        {value:"Coatepec Harinas",label:"Coatepec Harinas"},
        {value:"Cocotitlán",label:"Cocotitlán"},
        {value:"Coyotepec",label:"Coyotepec"},
        {value:"Cuautitlán",label:"Cuautitlán"},
        {value:"Chalco",label:"Chalco"},
        {value:"Chapa de Mota",label:"Chapa de Mota"},
        {value:"Chapultepec",label:"Chapultepec"},
        {value:"Chiautla",label:"Chiautla"},
        {value:"Chicoloapan",label:"Chicoloapan"},
        {value:"Chiconcuac",label:"Chiconcuac"},
        {value:"Chimalhuacán",label:"Chimalhuacán"},
        {value:"Donato Guerra",label:"Donato Guerra"},
        {value:"Ecatepec de Morelos",label:"Ecatepec de Morelos"},
        {value:"Ecatzingo",label:"Ecatzingo"},
        {value:"Huehuetoca",label:"Huehuetoca"},
        {value:"Hueypoxtla",label:"Hueypoxtla"},
        {value:"Huixquilucan",label:"Huixquilucan"},
        {value:"Isidro Fabela",label:"Isidro Fabela"},
        {value:"Ixtapaluca",label:"Ixtapaluca"},
        {value:"Ixtapan de la Sal",label:"Ixtapan de la Sal"},
        {value:"Ixtapan del Oro",label:"Ixtapan del Oro"},
        {value:"Ixtlahuaca",label:"Ixtlahuaca"},
        {value:"Jalatlaco",label:"Jalatlaco"},
        {value:"Jaltenco",label:"Jaltenco"},
        {value:"Jilotepec",label:"Jilotepec"},
        {value:"Jilotzingo",label:"Jilotzingo"},
        {value:"Jiquipilco",label:"Jiquipilco"},
        {value:"Jocotitlán",label:"Jocotitlán"},
        {value:"Joquicingo",label:"Joquicingo"},
        {value:"Juchitepec",label:"Juchitepec"},
        {value:"Lerma",label:"Lerma"},
        {value:"Malinalco",label:"Malinalco"},
        {value:"Melchor Ocampo",label:"Melchor Ocampo"},
        {value:"Metepec",label:"Metepec"},
        {value:"Mexicaltzingo",label:"Mexicaltzingo"},
        {value:"Morelos",label:"Morelos"},
        {value:"Naucalpan de Juárez",label:"Naucalpan de Juárez"},
        {value:"Nezahualcóyotl",label:"Nezahualcóyotl"},
        {value:"Nextlalpan",label:"Nextlalpan"},
        {value:"Nicolás Romero",label:"Nicolás Romero"},
        {value:"Nopaltepec",label:"Nopaltepec"},
        {value:"Ocoyoacac",label:"Ocoyoacac"},
        {value:"Ocuilan",label:"Ocuilan"},
        {value:"El Oro",label:"El Oro"},
        {value:"Otumba",label:"Otumba"},
        {value:"Otzoloapan",label:"Otzoloapan"},
        {value:"Otzolotepec",label:"Otzolotepec"},
        {value:"Ozumba",label:"Ozumba"},
        {value:"Papalotla",label:"Papalotla"},
        {value:"La Paz",label:"La Paz"},
        {value:"Polotitlán",label:"Polotitlán"},
        {value:"Rayón",label:"Rayón"},
        {value:"San Antonio la Isla",label:"San Antonio la Isla"},
        {value:"San Felipe del Progreso",label:"San Felipe del Progreso"},
        {value:"San Martín de las Pirámides",label:"San Martín de las Pirámides"},
        {value:"San Mateo Atenco",label:"San Mateo Atenco"},
        {value:"San Simón de Guerrero",label:"San Simón de Guerrero"},
        {value:"Santo Tomás",label:"Santo Tomás"},
        {value:"Soyaniquilpan de Juárez",label:"Soyaniquilpan de Juárez"},
        {value:"Sultepec",label:"Sultepec"},
        {value:"Tecámac",label:"Tecámac"},
        {value:"Tejupilco",label:"Tejupilco"},
        {value:"Temamatla",label:"Temamatla"},
        {value:"Temascalapa",label:"Temascalapa"},
        {value:"Temascalcingo",label:"Temascalcingo"},
        {value:"Temascaltepec",label:"Temascaltepec"},
        {value:"Temoaya",label:"Temoaya"},
        {value:"Tenancingo",label:"Tenancingo"},
        {value:"Tenango del Aire",label:"Tenango del Aire"},
        {value:"Tenango del Valle",label:"Tenango del Valle"},
        {value:"Teoloyucan",label:"Teoloyucan"},
        {value:"Teotihuacán",label:"Teotihuacán"},
        {value:"Tepetlaoxtoc",label:"Tepetlaoxtoc"},
        {value:"Tepetlixpa",label:"Tepetlixpa"},
        {value:"Tepotzotlán",label:"Tepotzotlán"},
        {value:"Tequixquiac",label:"Tequixquiac"},
        {value:"Texcaltitlán",label:"Texcaltitlán"},
        {value:"Texcalyacac",label:"Texcalyacac"},
        {value:"Texcoco",label:"Texcoco"},
        {value:"Tezoyuca",label:"Tezoyuca"},
        {value:"Tianguistenco",label:"Tianguistenco"},
        {value:"Timilpan",label:"Timilpan"},
        {value:"Tlalmanalco",label:"Tlalmanalco"},
        {value:"Tlalnepantla de Baz",label:"Tlalnepantla de Baz"},
        {value:"Tlatlaya",label:"Tlatlaya"},
        {value:"Toluca",label:"Toluca"},
        {value:"Tonatico",label:"Tonatico"},
        {value:"Tultepec",label:"Tultepec"},
        {value:"Tultitlán",label:"Tultitlán"},
        {value:"Valle de Bravo",label:"Valle de Bravo"},
        {value:"Villa de Allende",label:"Villa de Allende"},
        {value:"Villa del Carbón",label:"Villa del Carbón"},
        {value:"Villa Guerrero",label:"Villa Guerrero"},
        {value:"Villa Victoria",label:"Villa Victoria"},
        {value:"Xonacatlán",label:"Xonacatlán"},
        {value:"Zacazonapan",label:"Zacazonapan"},
        {value:"Zacualpan",label:"Zacualpan"},
        {value:"Zinacantepec",label:"Zinacantepec"},
        {value:"Zumpahuacán",label:"Zumpahuacán"},
        {value:"Zumpango",label:"Zumpango"},
        {value:"Cuautitlán Izcalli",label:"Cuautitlán Izcalli"},
        {value:"Valle de Chalco Solidaridad",label:"Valle de Chalco Solidaridad"},
        {value:"Luvianos",label:"Luvianos"},
        {value:"San José del Rincón",label:"San José del Rincón"},
        {value:"Tonanitla",label:"Tonanitla"}
      ];
    }
    if($scope.slcStateProfile == "Nayarit")
    {
      $scope.slcCityProfileItems = [
        {value:"Acaponeta",label:"Acaponeta"},
        {value:"Ahuacatlán",label:"Ahuacatlán"},
        {value:"Amatlán de Cañas",label:"Amatlán de Cañas"},
        {value:"Compostela",label:"Compostela"},
        {value:"Huajicori",label:"Huajicori"},
        {value:"Ixtlán del Río",label:"Ixtlán del Río"},
        {value:"Jala",label:"Jala"},
        {value:"Xalisco",label:"Xalisco"},
        {value:"Del Nayar",label:"Del Nayar"},
        {value:"Rosamorada",label:"Rosamorada"},
        {value:"Ruíz",label:"Ruíz"},
        {value:"San Blas",label:"San Blas"},
        {value:"San Pedro Lagunillas",label:"San Pedro Lagunillas"},
        {value:"Santa María del Oro",label:"Santa María del Oro"},
        {value:"Santiago Ixcuintla",label:"Santiago Ixcuintla"},
        {value:"Tecuala",label:"Tecuala"},
        {value:"Tepic",label:"Tepic"},
        {value:"Tuxpan",label:"Tuxpan"},
        {value:"La Yesca",label:"La Yesca"},
        {value:"Bahía de Banderas",label:"Bahía de Banderas"}
      ];
    }
    if($scope.slcStateProfile == "Nuevo León")
    {
      $scope.slcCityProfileItems = [
        {value:"Abasolo",label:"Abasolo"},
        {value:"Agualeguas",label:"Agualeguas"},
        {value:"Los Aldamas",label:"Los Aldamas"},
        {value:"Allende",label:"Allende"},
        {value:"Anáhuac",label:"Anáhuac"},
        {value:"Apodaca",label:"Apodaca"},
        {value:"Aramberri",label:"Aramberri"},
        {value:"Bustamante",label:"Bustamante"},
        {value:"Cadereyta Jiménez",label:"Cadereyta Jiménez"},
        {value:"El Carmen",label:"El Carmen"},
        {value:"Cerralvo",label:"Cerralvo"},
        {value:"Ciénega de Flores",label:"Ciénega de Flores"},
        {value:"China",label:"China"},
        {value:"Doctor Arroyo",label:"Doctor Arroyo"},
        {value:"Doctor Coss",label:"Doctor Coss"},
        {value:"Doctor González",label:"Doctor González"},
        {value:"Galeana",label:"Galeana"},
        {value:"García",label:"García"},
        {value:"San Pedro Garza García",label:"San Pedro Garza García"},
        {value:"General Bravo",label:"General Bravo"},
        {value:"General Escobedo",label:"General Escobedo"},
        {value:"General Terán",label:"General Terán"},
        {value:"General Treviño",label:"General Treviño"},
        {value:"General Zaragoza",label:"General Zaragoza"},
        {value:"General Zuazua",label:"General Zuazua"},
        {value:"Guadalupe",label:"Guadalupe"},
        {value:"Los Herreras",label:"Los Herreras"},
        {value:"Higueras",label:"Higueras"},
        {value:"Hualahuises",label:"Hualahuises"},
        {value:"Iturbide",label:"Iturbide"},
        {value:"Juárez",label:"Juárez"},
        {value:"Lampazos de Naranjo",label:"Lampazos de Naranjo"},
        {value:"Linares",label:"Linares"},
        {value:"Marín",label:"Marín"},
        {value:"Melchor Ocampo",label:"Melchor Ocampo"},
        {value:"Mier y Noriega",label:"Mier y Noriega"},
        {value:"Mina",label:"Mina"},
        {value:"Montemorelos",label:"Montemorelos"},
        {value:"Monterrey",label:"Monterrey"},
        {value:"Parás",label:"Parás"},
        {value:"Pesquería",label:"Pesquería"},
        {value:"Los Ramones",label:"Los Ramones"},
        {value:"Rayones",label:"Rayones"},
        {value:"Sabinas Hidalgo",label:"Sabinas Hidalgo"},
        {value:"Salinas Victoria",label:"Salinas Victoria"},
        {value:"San Nicolás de los Garza",label:"San Nicolás de los Garza"},
        {value:"Hidalgo",label:"Hidalgo"},
        {value:"Santa Catarina",label:"Santa Catarina"},
        {value:"Santiago",label:"Santiago"},
        {value:"Vallecillo",label:"Vallecillo"},
        {value:"Villaldama",label:"Villaldama"}

      ];

    }
    if($scope.slcStateProfile == "Oaxaca")
    {
      $scope.slcCityProfileItems = [
        {value:"Abejones",label:"Abejones"},
          {value:"Acatlán de Pérez Figueroa",label:"Acatlán de Pérez Figueroa"},
          {value:"Asunción Cacalotepec",label:"Asunción Cacalotepec"},
          {value:"Asunción Cuyotepeji",label:"Asunción Cuyotepeji"},
          {value:"Asunción Ixtaltepec",label:"Asunción Ixtaltepec"},
          {value:"Asunción Nochixtlán",label:"Asunción Nochixtlán"},
          {value:"Asunción Ocotlán",label:"Asunción Ocotlán"},
          {value:"Asunción Tlacolulita",label:"Asunción Tlacolulita"},
          {value:"Ayotzintepec",label:"Ayotzintepec"},
          {value:"El Barrio de la Soledad",label:"El Barrio de la Soledad"},
          {value:"Calihualá",label:"Calihualá"},
          {value:"Candelaria Loxicha",label:"Candelaria Loxicha"},
          {value:"Ciénega de Zimatlán",label:"Ciénega de Zimatlán"},
          {value:"Ciudad Ixtepec",label:"Ciudad Ixtepec"},
          {value:"Coatecas Altas",label:"Coatecas Altas"},
          {value:"Coicoyán de las Flores",label:"Coicoyán de las Flores"},
          {value:"La Compañía",label:"La Compañía"},
          {value:"Concepción Buenavista",label:"Concepción Buenavista"},
          {value:"Concepción Pápalo",label:"Concepción Pápalo"},
          {value:"Constancia del Rosario",label:"Constancia del Rosario"},
          {value:"Cosolapa",label:"Cosolapa"},
          {value:"Cosoltepec",label:"Cosoltepec"},
          {value:"Cuilápam de Guerrero",label:"Cuilápam de Guerrero"},
          {value:"Cuyamecalco Villa de Zaragoza",label:"Cuyamecalco Villa de Zaragoza"},
          {value:"Chahuites",label:"Chahuites"},
          {value:"Chalcatongo de Hidalgo",label:"Chalcatongo de Hidalgo"},
          {value:"Chiquihuitlán de Benito Juárez",label:"Chiquihuitlán de Benito Juárez"},
          {value:"Heroica Ciudad de Ejutla de Crespo",label:"Heroica Ciudad de Ejutla de Crespo"},
          {value:"Eloxochitlán de Flores Magón",label:"Eloxochitlán de Flores Magón"},
          {value:"El Espinal",label:"El Espinal"},
          {value:"Tamazulápam del Espíritu Santo",label:"Tamazulápam del Espíritu Santo"},
          {value:"Fresnillo de Trujano",label:"Fresnillo de Trujano"},
          {value:"Guadalupe Etla",label:"Guadalupe Etla"},
          {value:"Guadalupe de Ramírez",label:"Guadalupe de Ramírez"},
          {value:"Guelatao de Juárez",label:"Guelatao de Juárez"},
          {value:"Guevea de Humboldt",label:"Guevea de Humboldt"},
          {value:"Mesones Hidalgo",label:"Mesones Hidalgo"},
          {value:"Villa Hidalgo",label:"Villa Hidalgo"},
          {value:"Heroica Ciudad de Huajuapan de León",label:"Heroica Ciudad de Huajuapan de León"},
          {value:"Huautepec",label:"Huautepec"},
          {value:"Huautla de Jiménez",label:"Huautla de Jiménez"},
          {value:"Ixtlán de Juárez",label:"Ixtlán de Juárez"},
          {value:"Heroica Ciudad de Juchitán de Zaragoza",label:"Heroica Ciudad de Juchitán de Zaragoza"},
          {value:"Loma Bonita",label:"Loma Bonita"},
          {value:"Magdalena Apasco",label:"Magdalena Apasco"},
          {value:"Magdalena Jaltepec",label:"Magdalena Jaltepec"},
          {value:"Santa Magdalena Jicotlán",label:"Santa Magdalena Jicotlán"},
          {value:"Magdalena Mixtepec",label:"Magdalena Mixtepec"},
          {value:"Magdalena Ocotlán",label:"Magdalena Ocotlán"},
          {value:"Magdalena Peñasco",label:"Magdalena Peñasco"},
          {value:"Magdalena Teitipac",label:"Magdalena Teitipac"},
          {value:"Magdalena Tequisistlán",label:"Magdalena Tequisistlán"},
          {value:"Magdalena Tlacotepec",label:"Magdalena Tlacotepec"},
          {value:"Magdalena Zahuatlán",label:"Magdalena Zahuatlán"},
          {value:"Mariscala de Juárez",label:"Mariscala de Juárez"},
          {value:"Mártires de Tacubaya",label:"Mártires de Tacubaya"},
          {value:"Matías Romero Avendaño",label:"Matías Romero Avendaño"},
          {value:"Mazatlán Villa de Flores",label:"Mazatlán Villa de Flores"},
          {value:"Miahuatlán de Porfirio Díaz",label:"Miahuatlán de Porfirio Díaz"},
          {value:"Mixistlán de la Reforma",label:"Mixistlán de la Reforma"},
          {value:"Monjas",label:"Monjas"},
          {value:"Natividad",label:"Natividad"},
          {value:"Nazareno Etla",label:"Nazareno Etla"},
          {value:"Nejapa de Madero",label:"Nejapa de Madero"},
          {value:"Ixpantepec Nieves",label:"Ixpantepec Nieves"},
          {value:"Santiago Niltepec",label:"Santiago Niltepec"},
          {value:"Oaxaca de Juárez",label:"Oaxaca de Juárez"},
          {value:"Ocotlán de Morelos",label:"Ocotlán de Morelos"},
          {value:"La Pe",label:"La Pe"},
          {value:"Pinotepa de Don Luis",label:"Pinotepa de Don Luis"},
          {value:"Pluma Hidalgo",label:"Pluma Hidalgo"},
          {value:"San José del Progreso",label:"San José del Progreso"},
          {value:"Putla Villa de Guerrero",label:"Putla Villa de Guerrero"},
          {value:"Santa Catarina Quioquitani",label:"Santa Catarina Quioquitani"},
          {value:"Reforma de Pineda",label:"Reforma de Pineda"},
          {value:"La Reforma",label:"La Reforma"},
          {value:"Reyes Etla",label:"Reyes Etla"},
          {value:"Rojas de Cuauhtémoc",label:"Rojas de Cuauhtémoc"},
          {value:"Salina Cruz",label:"Salina Cruz"},
          {value:"San Agustín Amatengo",label:"San Agustín Amatengo"},
          {value:"San Agustín Atenango",label:"San Agustín Atenango"},
          {value:"San Agustín Chayuco",label:"San Agustín Chayuco"},
          {value:"San Agustín de las Juntas",label:"San Agustín de las Juntas"},
          {value:"San Agustín Etla",label:"San Agustín Etla"},
          {value:"San Agustín Loxicha",label:"San Agustín Loxicha"},
          {value:"San Agustín Tlacotepec",label:"San Agustín Tlacotepec"},
          {value:"San Agustín Yatareni",label:"San Agustín Yatareni"},
          {value:"San Andrés Cabecera Nueva",label:"San Andrés Cabecera Nueva"},
          {value:"San Andrés Dinicuiti",label:"San Andrés Dinicuiti"},
          {value:"San Andrés Huaxpaltepec",label:"San Andrés Huaxpaltepec"},
          {value:"San Andrés Huayápam",label:"San Andrés Huayápam"},
          {value:"San Andrés Ixtlahuaca",label:"San Andrés Ixtlahuaca"},
          {value:"San Andrés Lagunas",label:"San Andrés Lagunas"},
          {value:"San Andrés Nuxiño",label:"San Andrés Nuxiño"},
          {value:"San Andrés Paxtlán",label:"San Andrés Paxtlán"},
          {value:"San Andrés Sinaxtla",label:"San Andrés Sinaxtla"},
          {value:"San Andrés Solaga",label:"San Andrés Solaga"},
          {value:"San Andrés Teotilálpam",label:"San Andrés Teotilálpam"},
          {value:"San Andrés Tepetlapa",label:"San Andrés Tepetlapa"},
          {value:"San Andrés Yaá",label:"San Andrés Yaá"},
          {value:"San Andrés Zabache",label:"San Andrés Zabache"},
          {value:"San Andrés Zautla",label:"San Andrés Zautla"},
          {value:"San Antonino Castillo Velasco",label:"San Antonino Castillo Velasco"},
          {value:"San Antonino el Alto",label:"San Antonino el Alto"},
          {value:"San Antonino Monte Verde",label:"San Antonino Monte Verde"},
          {value:"San Antonio Acutla",label:"San Antonio Acutla"},
          {value:"San Antonio de la Cal",label:"San Antonio de la Cal"},
          {value:"San Antonio Huitepec",label:"San Antonio Huitepec"},
          {value:"San Antonio Nanahuatípam",label:"San Antonio Nanahuatípam"},
          {value:"San Antonio Sinicahua",label:"San Antonio Sinicahua"},
          {value:"San Antonio Tepetlapa",label:"San Antonio Tepetlapa"},
          {value:"San Baltazar Chichicápam",label:"San Baltazar Chichicápam"},
          {value:"San Baltazar Loxicha",label:"San Baltazar Loxicha"},
          {value:"San Baltazar Yatzachi el Bajo",label:"San Baltazar Yatzachi el Bajo"},
          {value:"San Bartolo Coyotepec",label:"San Bartolo Coyotepec"},
          {value:"San Bartolomé Ayautla",label:"San Bartolomé Ayautla"},
          {value:"San Bartolomé Loxicha",label:"San Bartolomé Loxicha"},
          {value:"San Bartolomé Quialana",label:"San Bartolomé Quialana"},
          {value:"San Bartolomé Yucuañe",label:"San Bartolomé Yucuañe"},
          {value:"San Bartolomé Zoogocho",label:"San Bartolomé Zoogocho"},
          {value:"San Bartolo Soyaltepec",label:"San Bartolo Soyaltepec"},
          {value:"San Bartolo Yautepec",label:"San Bartolo Yautepec"},
          {value:"San Bernardo Mixtepec",label:"San Bernardo Mixtepec"},
          {value:"San Blas Atempa",label:"San Blas Atempa"},
          {value:"San Carlos Yautepec",label:"San Carlos Yautepec"},
          {value:"San Cristóbal Amatlán",label:"San Cristóbal Amatlán"},
          {value:"San Cristóbal Amoltepec",label:"San Cristóbal Amoltepec"},
          {value:"San Cristóbal Lachirioag",label:"San Cristóbal Lachirioag"},
          {value:"San Cristóbal Suchixtlahuaca",label:"San Cristóbal Suchixtlahuaca"},
          {value:"San Dionisio del Mar",label:"San Dionisio del Mar"},
          {value:"San Dionisio Ocotepec",label:"San Dionisio Ocotepec"},
          {value:"San Dionisio Ocotlán",label:"San Dionisio Ocotlán"},
          {value:"San Esteban Atatlahuca",label:"San Esteban Atatlahuca"},
          {value:"San Felipe Jalapa de Díaz",label:"San Felipe Jalapa de Díaz"},
          {value:"San Felipe Tejalápam",label:"San Felipe Tejalápam"},
          {value:"San Felipe Usila",label:"San Felipe Usila"},
          {value:"San Francisco Cahuacuá",label:"San Francisco Cahuacuá"},
          {value:"San Francisco Cajonos",label:"San Francisco Cajonos"},
          {value:"San Francisco Chapulapa",label:"San Francisco Chapulapa"},
          {value:"San Francisco Chindúa",label:"San Francisco Chindúa"},
          {value:"San Francisco del Mar",label:"San Francisco del Mar"},
          {value:"San Francisco Huehuetlán",label:"San Francisco Huehuetlán"},
          {value:"San Francisco Ixhuatán",label:"San Francisco Ixhuatán"},
          {value:"San Francisco Jaltepetongo",label:"San Francisco Jaltepetongo"},
          {value:"San Francisco Lachigoló",label:"San Francisco Lachigoló"},
          {value:"San Francisco Logueche",label:"San Francisco Logueche"},
          {value:"San Francisco Nuxaño",label:"San Francisco Nuxaño"},
          {value:"San Francisco Ozolotepec",label:"San Francisco Ozolotepec"},
          {value:"San Francisco Sola",label:"San Francisco Sola"},
          {value:"San Francisco Telixtlahuaca",label:"San Francisco Telixtlahuaca"},
          {value:"San Francisco Teopan",label:"San Francisco Teopan"},
          {value:"San Francisco Tlapancingo",label:"San Francisco Tlapancingo"},
          {value:"San Gabriel Mixtepec",label:"San Gabriel Mixtepec"},
          {value:"San Ildefonso Amatlán",label:"San Ildefonso Amatlán"},
          {value:"San Ildefonso Sola",label:"San Ildefonso Sola"},
          {value:"San Ildefonso Villa Alta",label:"San Ildefonso Villa Alta"},
          {value:"San Jacinto Amilpas",label:"San Jacinto Amilpas"},
          {value:"San Jacinto Tlacotepec",label:"San Jacinto Tlacotepec"},
          {value:"San Jerónimo Coatlán",label:"San Jerónimo Coatlán"},
          {value:"San Jerónimo Silacayoapilla",label:"San Jerónimo Silacayoapilla"},
          {value:"San Jerónimo Sosola",label:"San Jerónimo Sosola"},
          {value:"San Jerónimo Taviche",label:"San Jerónimo Taviche"},
          {value:"San Jerónimo Tecóatl",label:"San Jerónimo Tecóatl"},
          {value:"San Jorge Nuchita",label:"San Jorge Nuchita"},
          {value:"San José Ayuquila",label:"San José Ayuquila"},
          {value:"San José Chiltepec",label:"San José Chiltepec"},
          {value:"San José del Peñasco",label:"San José del Peñasco"},
          {value:"San José Estancia Grande",label:"San José Estancia Grande"},
          {value:"San José Independencia",label:"San José Independencia"},
          {value:"San José Lachiguiri",label:"San José Lachiguiri"},
          {value:"San José Tenango",label:"San José Tenango"},
          {value:"San Juan Achiutla",label:"San Juan Achiutla"},
          {value:"San Juan Atepec",label:"San Juan Atepec"},
          {value:"Ánimas Trujano",label:"Ánimas Trujano"},
          {value:"San Juan Bautista Atatlahuca",label:"San Juan Bautista Atatlahuca"},
          {value:"San Juan Bautista Coixtlahuaca",label:"San Juan Bautista Coixtlahuaca"},
          {value:"San Juan Bautista Cuicatlán",label:"San Juan Bautista Cuicatlán"},
          {value:"San Juan Bautista Guelache",label:"San Juan Bautista Guelache"},
          {value:"San Juan Bautista Jayacatlán",label:"San Juan Bautista Jayacatlán"},
          {value:"San Juan Bautista Lo de Soto",label:"San Juan Bautista Lo de Soto"},
          {value:"San Juan Bautista Suchitepec",label:"San Juan Bautista Suchitepec"},
          {value:"San Juan Bautista Tlacoatzintepec",label:"San Juan Bautista Tlacoatzintepec"},
          {value:"San Juan Bautista Tlachichilco",label:"San Juan Bautista Tlachichilco"},
          {value:"San Juan Bautista Tuxtepec",label:"San Juan Bautista Tuxtepec"},
          {value:"San Juan Cacahuatepec",label:"San Juan Cacahuatepec"},
          {value:"San Juan Cieneguilla",label:"San Juan Cieneguilla"},
          {value:"San Juan Coatzóspam",label:"San Juan Coatzóspam"},
          {value:"San Juan Colorado",label:"San Juan Colorado"},
          {value:"San Juan Comaltepec",label:"San Juan Comaltepec"},
          {value:"San Juan Cotzocón",label:"San Juan Cotzocón"},
          {value:"San Juan Chicomezúchil",label:"San Juan Chicomezúchil"},
          {value:"San Juan Chilateca",label:"San Juan Chilateca"},
          {value:"San Juan del Estado",label:"San Juan del Estado"},
          {value:"San Juan del Río",label:"San Juan del Río"},
          {value:"San Juan Diuxi",label:"San Juan Diuxi"},
          {value:"San Juan Evangelista Analco",label:"San Juan Evangelista Analco"},
          {value:"San Juan Guelavía",label:"San Juan Guelavía"},
          {value:"San Juan Guichicovi",label:"San Juan Guichicovi"},
          {value:"San Juan Ihualtepec",label:"San Juan Ihualtepec"},
          {value:"San Juan Juquila Mixes",label:"San Juan Juquila Mixes"},
          {value:"San Juan Juquila Vijanos",label:"San Juan Juquila Vijanos"},
          {value:"San Juan Lachao",label:"San Juan Lachao"},
          {value:"San Juan Lachigalla",label:"San Juan Lachigalla"},
          {value:"San Juan Lajarcia",label:"San Juan Lajarcia"},
          {value:"San Juan Lalana",label:"San Juan Lalana"},
          {value:"San Juan de los Cués",label:"San Juan de los Cués"},
          {value:"San Juan Mazatlán",label:"San Juan Mazatlán"},
          {value:"San Juan Mixtepec -Dto. 08 -",label:"San Juan Mixtepec -Dto. 08 -"},
          {value:"San Juan Mixtepec -Dto. 26 -",label:"San Juan Mixtepec -Dto. 26 -"},
          {value:"San Juan Ñumí",label:"San Juan Ñumí"},
          {value:"San Juan Ozolotepec",label:"San Juan Ozolotepec"},
          {value:"San Juan Petlapa",label:"San Juan Petlapa"},
          {value:"San Juan Quiahije",label:"San Juan Quiahije"},
          {value:"San Juan Quiotepec",label:"San Juan Quiotepec"},
          {value:"San Juan Sayultepec",label:"San Juan Sayultepec"},
          {value:"San Juan Tabaá",label:"San Juan Tabaá"},
          {value:"San Juan Tamazola",label:"San Juan Tamazola"},
          {value:"San Juan Teita",label:"San Juan Teita"},
          {value:"San Juan Teitipac",label:"San Juan Teitipac"},
          {value:"San Juan Tepeuxila",label:"San Juan Tepeuxila"},
          {value:"San Juan Teposcolula",label:"San Juan Teposcolula"},
          {value:"San Juan Yaeé",label:"San Juan Yaeé"},
          {value:"San Juan Yatzona",label:"San Juan Yatzona"},
          {value:"San Juan Yucuita",label:"San Juan Yucuita"},
          {value:"San Lorenzo",label:"San Lorenzo"},
          {value:"San Lorenzo Albarradas",label:"San Lorenzo Albarradas"},
          {value:"San Lorenzo Cacaotepec",label:"San Lorenzo Cacaotepec"},
          {value:"San Lorenzo Cuaunecuiltitla",label:"San Lorenzo Cuaunecuiltitla"},
          {value:"San Lorenzo Texmelúcan",label:"San Lorenzo Texmelúcan"},
          {value:"San Lorenzo Victoria",label:"San Lorenzo Victoria"},
          {value:"San Lucas Camotlán",label:"San Lucas Camotlán"},
          {value:"San Lucas Ojitlán",label:"San Lucas Ojitlán"},
          {value:"San Lucas Quiaviní",label:"San Lucas Quiaviní"},
          {value:"San Lucas Zoquiápam",label:"San Lucas Zoquiápam"},
          {value:"San Luis Amatlán",label:"San Luis Amatlán"},
          {value:"San Marcial Ozolotepec",label:"San Marcial Ozolotepec"},
          {value:"San Marcos Arteaga",label:"San Marcos Arteaga"},
          {value:"San Martín de los Cansecos",label:"San Martín de los Cansecos"},
          {value:"San Martín Huamelúlpam",label:"San Martín Huamelúlpam"},
          {value:"San Martín Itunyoso",label:"San Martín Itunyoso"},
          {value:"San Martín Lachilá",label:"San Martín Lachilá"},
          {value:"San Martín Peras",label:"San Martín Peras"},
          {value:"San Martín Tilcajete",label:"San Martín Tilcajete"},
          {value:"San Martín Toxpalan",label:"San Martín Toxpalan"},
          {value:"San Martín Zacatepec",label:"San Martín Zacatepec"},
          {value:"San Mateo Cajonos",label:"San Mateo Cajonos"},
          {value:"Capulálpam de Méndez",label:"Capulálpam de Méndez"},
          {value:"San Mateo del Mar",label:"San Mateo del Mar"},
          {value:"San Mateo Yoloxochitlán",label:"San Mateo Yoloxochitlán"},
          {value:"San Mateo Etlatongo",label:"San Mateo Etlatongo"},
          {value:"San Mateo Nejápam",label:"San Mateo Nejápam"},
          {value:"San Mateo Peñasco",label:"San Mateo Peñasco"},
          {value:"San Mateo Piñas",label:"San Mateo Piñas"},
          {value:"San Mateo Río Hondo",label:"San Mateo Río Hondo"},
          {value:"San Mateo Sindihui",label:"San Mateo Sindihui"},
          {value:"San Mateo Tlapiltepec",label:"San Mateo Tlapiltepec"},
          {value:"San Melchor Betaza",label:"San Melchor Betaza"},
          {value:"San Miguel Achiutla",label:"San Miguel Achiutla"},
          {value:"San Miguel Ahuehuetitlán",label:"San Miguel Ahuehuetitlán"},
          {value:"San Miguel Aloápam",label:"San Miguel Aloápam"},
          {value:"San Miguel Amatitlán",label:"San Miguel Amatitlán"},
          {value:"San Miguel Amatlán",label:"San Miguel Amatlán"},
          {value:"San Miguel Coatlán",label:"San Miguel Coatlán"},
          {value:"San Miguel Chicahua",label:"San Miguel Chicahua"},
          {value:"San Miguel Chimalapa",label:"San Miguel Chimalapa"},
          {value:"San Miguel del Puerto",label:"San Miguel del Puerto"},
          {value:"San Miguel del Río",label:"San Miguel del Río"},
          {value:"San Miguel Ejutla",label:"San Miguel Ejutla"},
          {value:"San Miguel el Grande",label:"San Miguel el Grande"},
          {value:"San Miguel Huautla",label:"San Miguel Huautla"},
          {value:"San Miguel Mixtepec",label:"San Miguel Mixtepec"},
          {value:"San Miguel Panixtlahuaca",label:"San Miguel Panixtlahuaca"},
          {value:"San Miguel Peras",label:"San Miguel Peras"},
          {value:"San Miguel Piedras",label:"San Miguel Piedras"},
          {value:"San Miguel Quetzaltepec",label:"San Miguel Quetzaltepec"},
          {value:"San Miguel Santa Flor",label:"San Miguel Santa Flor"},
          {value:"Villa Sola de Vega",label:"Villa Sola de Vega"},
          {value:"San Miguel Soyaltepec",label:"San Miguel Soyaltepec"},
          {value:"San Miguel Suchixtepec",label:"San Miguel Suchixtepec"},
          {value:"Villa Talea de Castro",label:"Villa Talea de Castro"},
          {value:"San Miguel Tecomatlán",label:"San Miguel Tecomatlán"},
          {value:"San Miguel Tenango",label:"San Miguel Tenango"},
          {value:"San Miguel Tequixtepec",label:"San Miguel Tequixtepec"},
          {value:"San Miguel Tilquiápam",label:"San Miguel Tilquiápam"},
          {value:"San Miguel Tlacamama",label:"San Miguel Tlacamama"},
          {value:"San Miguel Tlacotepec",label:"San Miguel Tlacotepec"},
          {value:"San Miguel Tulancingo",label:"San Miguel Tulancingo"},
          {value:"San Miguel Yotao",label:"San Miguel Yotao"},
          {value:"San Nicolás",label:"San Nicolás"},
          {value:"San Nicolás Hidalgo",label:"San Nicolás Hidalgo"},
          {value:"San Pablo Coatlán",label:"San Pablo Coatlán"},
          {value:"San Pablo Cuatro Venados",label:"San Pablo Cuatro Venados"},
          {value:"San Pablo Etla",label:"San Pablo Etla"},
          {value:"San Pablo Huitzo",label:"San Pablo Huitzo"},
          {value:"San Pablo Huixtepec",label:"San Pablo Huixtepec"},
          {value:"San Pablo Macuiltianguis",label:"San Pablo Macuiltianguis"},
          {value:"San Pablo Tijaltepec",label:"San Pablo Tijaltepec"},
          {value:"San Pablo Villa de Mitla",label:"San Pablo Villa de Mitla"},
          {value:"San Pablo Yaganiza",label:"San Pablo Yaganiza"},
          {value:"San Pedro Amuzgos",label:"San Pedro Amuzgos"},
          {value:"San Pedro Apóstol",label:"San Pedro Apóstol"},
          {value:"San Pedro Atoyac",label:"San Pedro Atoyac"},
          {value:"San Pedro Cajonos",label:"San Pedro Cajonos"},
          {value:"San Pedro Coxcaltepec Cántaros",label:"San Pedro Coxcaltepec Cántaros"},
          {value:"San Pedro Comitancillo",label:"San Pedro Comitancillo"},
          {value:"San Pedro el Alto",label:"San Pedro el Alto"},
          {value:"San Pedro Huamelula",label:"San Pedro Huamelula"},
          {value:"San Pedro Huilotepec",label:"San Pedro Huilotepec"},
          {value:"San Pedro Ixcatlán",label:"San Pedro Ixcatlán"},
          {value:"San Pedro Ixtlahuaca",label:"San Pedro Ixtlahuaca"},
          {value:"San Pedro Jaltepetongo",label:"San Pedro Jaltepetongo"},
          {value:"San Pedro Jicayán",label:"San Pedro Jicayán"},
          {value:"San Pedro Jocotipac",label:"San Pedro Jocotipac"},
          {value:"San Pedro Juchatengo",label:"San Pedro Juchatengo"},
          {value:"San Pedro Mártir",label:"San Pedro Mártir"},
          {value:"San Pedro Mártir Quiechapa",label:"San Pedro Mártir Quiechapa"},
          {value:"San Pedro Mártir Yucuxaco",label:"San Pedro Mártir Yucuxaco"},
          {value:"San Pedro Mixtepec -Dto. 22 -",label:"San Pedro Mixtepec -Dto. 22 -"},
          {value:"San Pedro Mixtepec -Dto. 26 -",label:"San Pedro Mixtepec -Dto. 26 -"},
          {value:"San Pedro Molinos",label:"San Pedro Molinos"},
          {value:"San Pedro Nopala",label:"San Pedro Nopala"},
          {value:"San Pedro Ocopetatillo",label:"San Pedro Ocopetatillo"},
          {value:"San Pedro Ocotepec",label:"San Pedro Ocotepec"},
          {value:"San Pedro Pochutla",label:"San Pedro Pochutla"},
          {value:"San Pedro Quiatoni",label:"San Pedro Quiatoni"},
          {value:"San Pedro Sochiápam",label:"San Pedro Sochiápam"},
          {value:"San Pedro Tapanatepec",label:"San Pedro Tapanatepec"},
          {value:"San Pedro Taviche",label:"San Pedro Taviche"},
          {value:"San Pedro Teozacoalco",label:"San Pedro Teozacoalco"},
          {value:"San Pedro Teutila",label:"San Pedro Teutila"},
          {value:"San Pedro Tidaá",label:"San Pedro Tidaá"},
          {value:"San Pedro Topiltepec",label:"San Pedro Topiltepec"},
          {value:"San Pedro Totolápam",label:"San Pedro Totolápam"},
          {value:"Villa de Tututepec de Melchor Ocampo",label:"Villa de Tututepec de Melchor Ocampo"},
          {value:"San Pedro Yaneri",label:"San Pedro Yaneri"},
          {value:"San Pedro Yólox",label:"San Pedro Yólox"},
          {value:"San Pedro y San Pablo Ayutla",label:"San Pedro y San Pablo Ayutla"},
          {value:"Villa de Etla",label:"Villa de Etla"},
          {value:"San Pedro y San Pablo Teposcolula",label:"San Pedro y San Pablo Teposcolula"},
          {value:"San Pedro y San Pablo Tequixtepec",label:"San Pedro y San Pablo Tequixtepec"},
          {value:"San Pedro Yucunama",label:"San Pedro Yucunama"},
          {value:"San Raymundo Jalpan",label:"San Raymundo Jalpan"},
          {value:"San Sebastián Abasolo",label:"San Sebastián Abasolo"},
          {value:"San Sebastián Coatlán",label:"San Sebastián Coatlán"},
          {value:"San Sebastián Ixcapa",label:"San Sebastián Ixcapa"},
          {value:"San Sebastián Nicananduta",label:"San Sebastián Nicananduta"},
          {value:"San Sebastián Río Hondo",label:"San Sebastián Río Hondo"},
          {value:"San Sebastián Tecomaxtlahuaca",label:"San Sebastián Tecomaxtlahuaca"},
          {value:"San Sebastián Teitipac",label:"San Sebastián Teitipac"},
          {value:"San Sebastián Tutla",label:"San Sebastián Tutla"},
          {value:"San Simón Almolongas",label:"San Simón Almolongas"},
          {value:"San Simón Zahuatlán",label:"San Simón Zahuatlán"},
          {value:"Santa Ana",label:"Santa Ana"},
          {value:"Santa Ana Ateixtlahuaca",label:"Santa Ana Ateixtlahuaca"},
          {value:"Santa Ana Cuauhtémoc",label:"Santa Ana Cuauhtémoc"},
          {value:"Santa Ana del Valle",label:"Santa Ana del Valle"},
          {value:"Santa Ana Tavela",label:"Santa Ana Tavela"},
          {value:"Santa Ana Tlapacoyan",label:"Santa Ana Tlapacoyan"},
          {value:"Santa Ana Yareni",label:"Santa Ana Yareni"},
          {value:"Santa Ana Zegache",label:"Santa Ana Zegache"},
          {value:"Santa Catalina Quierí",label:"Santa Catalina Quierí"},
          {value:"Santa Catarina Cuixtla",label:"Santa Catarina Cuixtla"},
          {value:"Santa Catarina Ixtepeji",label:"Santa Catarina Ixtepeji"},
          {value:"Santa Catarina Juquila",label:"Santa Catarina Juquila"},
          {value:"Santa Catarina Lachatao",label:"Santa Catarina Lachatao"},
          {value:"Santa Catarina Loxicha",label:"Santa Catarina Loxicha"},
          {value:"Santa Catarina Mechoacán",label:"Santa Catarina Mechoacán"},
          {value:"Santa Catarina Minas",label:"Santa Catarina Minas"},
          {value:"Santa Catarina Quiané",label:"Santa Catarina Quiané"},
          {value:"Santa Catarina Tayata",label:"Santa Catarina Tayata"},
          {value:"Santa Catarina Ticuá",label:"Santa Catarina Ticuá"},
          {value:"Santa Catarina Yosonotú",label:"Santa Catarina Yosonotú"},
          {value:"Santa Catarina Zapoquila",label:"Santa Catarina Zapoquila"},
          {value:"Santa Cruz Acatepec",label:"Santa Cruz Acatepec"},
          {value:"Santa Cruz Amilpas",label:"Santa Cruz Amilpas"},
          {value:"Santa Cruz de Bravo",label:"Santa Cruz de Bravo"},
          {value:"Santa Cruz Itundujia",label:"Santa Cruz Itundujia"},
          {value:"Santa Cruz Mixtepec",label:"Santa Cruz Mixtepec"},
          {value:"Santa Cruz Nundaco",label:"Santa Cruz Nundaco"},
          {value:"Santa Cruz Papalutla",label:"Santa Cruz Papalutla"},
          {value:"Santa Cruz Tacache de Mina",label:"Santa Cruz Tacache de Mina"},
          {value:"Santa Cruz Tacahua",label:"Santa Cruz Tacahua"},
          {value:"Santa Cruz Tayata",label:"Santa Cruz Tayata"},
          {value:"Santa Cruz Xitla",label:"Santa Cruz Xitla"},
          {value:"Santa Cruz Xoxocotlán",label:"Santa Cruz Xoxocotlán"},
          {value:"Santa Cruz Zenzontepec",label:"Santa Cruz Zenzontepec"},
          {value:"Santa Gertrudis",label:"Santa Gertrudis"},
          {value:"Santa Inés del Monte",label:"Santa Inés del Monte"},
          {value:"Santa Inés Yatzeche",label:"Santa Inés Yatzeche"},
          {value:"Santa Lucía del Camino",label:"Santa Lucía del Camino"},
          {value:"Santa Lucía Miahuatlán",label:"Santa Lucía Miahuatlán"},
          {value:"Santa Lucía Monteverde",label:"Santa Lucía Monteverde"},
          {value:"Santa Lucía Ocotlán",label:"Santa Lucía Ocotlán"},
          {value:"Santa María Alotepec",label:"Santa María Alotepec"},
          {value:"Santa María Apazco",label:"Santa María Apazco"},
          {value:"Santa María la Asunción",label:"Santa María la Asunción"},
          {value:"Heroica Ciudad de Tlaxiaco",label:"Heroica Ciudad de Tlaxiaco"},
          {value:"Ayoquezco de Aldama",label:"Ayoquezco de Aldama"},
          {value:"Santa María Atzompa",label:"Santa María Atzompa"},
          {value:"Santa María Camotlán",label:"Santa María Camotlán"},
          {value:"Santa María Colotepec",label:"Santa María Colotepec"},
          {value:"Santa María Cortijo",label:"Santa María Cortijo"},
          {value:"Santa María Coyotepec",label:"Santa María Coyotepec"},
          {value:"Santa María Chachoápam",label:"Santa María Chachoápam"},
          {value:"Villa de Chilapa de Díaz",label:"Villa de Chilapa de Díaz"},
          {value:"Santa María Chilchotla",label:"Santa María Chilchotla"},
          {value:"Santa María Chimalapa",label:"Santa María Chimalapa"},
          {value:"Santa María del Rosario",label:"Santa María del Rosario"},
          {value:"Santa María del Tule",label:"Santa María del Tule"},
          {value:"Santa María Ecatepec",label:"Santa María Ecatepec"},
          {value:"Santa María Guelacé",label:"Santa María Guelacé"},
          {value:"Santa María Guienagati",label:"Santa María Guienagati"},
          {value:"Santa María Huatulco",label:"Santa María Huatulco"},
          {value:"Santa María Huazolotitlán",label:"Santa María Huazolotitlán"},
          {value:"Santa María Ipalapa",label:"Santa María Ipalapa"},
          {value:"Santa María Ixcatlán",label:"Santa María Ixcatlán"},
          {value:"Santa María Jacatepec",label:"Santa María Jacatepec"},
          {value:"Santa María Jalapa del Marqués",label:"Santa María Jalapa del Marqués"},
          {value:"Santa María Jaltianguis",label:"Santa María Jaltianguis"},
          {value:"Santa María Lachixío",label:"Santa María Lachixío"},
          {value:"Santa María Mixtequilla",label:"Santa María Mixtequilla"},
          {value:"Santa María Nativitas",label:"Santa María Nativitas"},
          {value:"Santa María Nduayaco",label:"Santa María Nduayaco"},
          {value:"Santa María Ozolotepec",label:"Santa María Ozolotepec"},
          {value:"Santa María Pápalo",label:"Santa María Pápalo"},
          {value:"Santa María Peñoles",label:"Santa María Peñoles"},
          {value:"Santa María Petapa",label:"Santa María Petapa"},
          {value:"Santa María Quiegolani",label:"Santa María Quiegolani"},
          {value:"Santa María Sola",label:"Santa María Sola"},
          {value:"Santa María Tataltepec",label:"Santa María Tataltepec"},
          {value:"Santa María Tecomavaca",label:"Santa María Tecomavaca"},
          {value:"Santa María Temaxcalapa",label:"Santa María Temaxcalapa"},
          {value:"Santa María Temaxcaltepec",label:"Santa María Temaxcaltepec"},
          {value:"Santa María Teopoxco",label:"Santa María Teopoxco"},
          {value:"Santa María Tepantlali",label:"Santa María Tepantlali"},
          {value:"Santa María Texcatitlán",label:"Santa María Texcatitlán"},
          {value:"Santa María Tlahuitoltepec",label:"Santa María Tlahuitoltepec"},
          {value:"Santa María Tlalixtac",label:"Santa María Tlalixtac"},
          {value:"Santa María Tonameca",label:"Santa María Tonameca"},
          {value:"Santa María Totolapilla",label:"Santa María Totolapilla"},
          {value:"Santa María Xadani",label:"Santa María Xadani"},
          {value:"Santa María Yalina",label:"Santa María Yalina"},
          {value:"Santa María Yavesía",label:"Santa María Yavesía"},
          {value:"Santa María Yolotepec",label:"Santa María Yolotepec"},
          {value:"Santa María Yosoyúa",label:"Santa María Yosoyúa"},
          {value:"Santa María Yucuhiti",label:"Santa María Yucuhiti"},
          {value:"Santa María Zacatepec",label:"Santa María Zacatepec"},
          {value:"Santa María Zaniza",label:"Santa María Zaniza"},
          {value:"Santa María Zoquitlán",label:"Santa María Zoquitlán"},
          {value:"Santiago Amoltepec",label:"Santiago Amoltepec"},
          {value:"Santiago Apoala",label:"Santiago Apoala"},
          {value:"Santiago Apóstol",label:"Santiago Apóstol"},
          {value:"Santiago Astata",label:"Santiago Astata"},
          {value:"Santiago Atitlán",label:"Santiago Atitlán"},
          {value:"Santiago Ayuquililla",label:"Santiago Ayuquililla"},
          {value:"Santiago Cacaloxtepec",label:"Santiago Cacaloxtepec"},
          {value:"Santiago Camotlán",label:"Santiago Camotlán"},
          {value:"Santiago Comaltepec",label:"Santiago Comaltepec"},
          {value:"Santiago Chazumba",label:"Santiago Chazumba"},
          {value:"Santiago Choápam",label:"Santiago Choápam"},
          {value:"Santiago del Río",label:"Santiago del Río"},
          {value:"Santiago Huajolotitlán",label:"Santiago Huajolotitlán"},
          {value:"Santiago Huauclilla",label:"Santiago Huauclilla"},
          {value:"Santiago Ihuitlán Plumas",label:"Santiago Ihuitlán Plumas"},
          {value:"Santiago Ixcuintepec",label:"Santiago Ixcuintepec"},
          {value:"Santiago Ixtayutla",label:"Santiago Ixtayutla"},
          {value:"Santiago Jamiltepec",label:"Santiago Jamiltepec"},
          {value:"Santiago Jocotepec",label:"Santiago Jocotepec"},
          {value:"Santiago Juxtlahuaca",label:"Santiago Juxtlahuaca"},
          {value:"Santiago Lachiguiri",label:"Santiago Lachiguiri"},
          {value:"Santiago Lalopa",label:"Santiago Lalopa"},
          {value:"Santiago Laollaga",label:"Santiago Laollaga"},
          {value:"Santiago Laxopa",label:"Santiago Laxopa"},
          {value:"Santiago Llano Grande",label:"Santiago Llano Grande"},
          {value:"Santiago Matatlán",label:"Santiago Matatlán"},
          {value:"Santiago Miltepec",label:"Santiago Miltepec"},
          {value:"Santiago Minas",label:"Santiago Minas"},
          {value:"Santiago Nacaltepec",label:"Santiago Nacaltepec"},
          {value:"Santiago Nejapilla",label:"Santiago Nejapilla"},
          {value:"Santiago Nundiche",label:"Santiago Nundiche"},
          {value:"Santiago Nuyoó",label:"Santiago Nuyoó"},
          {value:"Santiago Pinotepa Nacional",label:"Santiago Pinotepa Nacional"},
          {value:"Santiago Suchilquitongo",label:"Santiago Suchilquitongo"},
          {value:"Santiago Tamazola",label:"Santiago Tamazola"},
          {value:"Santiago Tapextla",label:"Santiago Tapextla"},
          {value:"Villa Tejúpam de la Unión",label:"Villa Tejúpam de la Unión"},
          {value:"Santiago Tenango",label:"Santiago Tenango"},
          {value:"Santiago Tepetlapa",label:"Santiago Tepetlapa"},
          {value:"Santiago Tetepec",label:"Santiago Tetepec"},
          {value:"Santiago Texcalcingo",label:"Santiago Texcalcingo"},
          {value:"Santiago Textitlán",label:"Santiago Textitlán"},
          {value:"Santiago Tilantongo",label:"Santiago Tilantongo"},
          {value:"Santiago Tillo",label:"Santiago Tillo"},
          {value:"Santiago Tlazoyaltepec",label:"Santiago Tlazoyaltepec"},
          {value:"Santiago Xanica",label:"Santiago Xanica"},
          {value:"Santiago Xiacuí",label:"Santiago Xiacuí"},
          {value:"Santiago Yaitepec",label:"Santiago Yaitepec"},
          {value:"Santiago Yaveo",label:"Santiago Yaveo"},
          {value:"Santiago Yolomécatl",label:"Santiago Yolomécatl"},
          {value:"Santiago Yosondúa",label:"Santiago Yosondúa"},
          {value:"Santiago Yucuyachi",label:"Santiago Yucuyachi"},
          {value:"Santiago Zacatepec",label:"Santiago Zacatepec"},
          {value:"Santiago Zoochila",label:"Santiago Zoochila"},
          {value:"Nuevo Zoquiápam",label:"Nuevo Zoquiápam"},
          {value:"Santo Domingo Ingenio",label:"Santo Domingo Ingenio"},
          {value:"Santo Domingo Albarradas",label:"Santo Domingo Albarradas"},
          {value:"Santo Domingo Armenta",label:"Santo Domingo Armenta"},
          {value:"Santo Domingo Chihuitán",label:"Santo Domingo Chihuitán"},
          {value:"Santo Domingo de Morelos",label:"Santo Domingo de Morelos"},
          {value:"Santo Domingo Ixcatlán",label:"Santo Domingo Ixcatlán"},
          {value:"Santo Domingo Nuxaá",label:"Santo Domingo Nuxaá"},
          {value:"Santo Domingo Ozolotepec",label:"Santo Domingo Ozolotepec"},
          {value:"Santo Domingo Petapa",label:"Santo Domingo Petapa"},
          {value:"Santo Domingo Roayaga",label:"Santo Domingo Roayaga"},
          {value:"Santo Domingo Tehuantepec",label:"Santo Domingo Tehuantepec"},
          {value:"Santo Domingo Teojomulco",label:"Santo Domingo Teojomulco"},
          {value:"Santo Domingo Tepuxtepec",label:"Santo Domingo Tepuxtepec"},
          {value:"Santo Domingo Tlatayápam",label:"Santo Domingo Tlatayápam"},
          {value:"Santo Domingo Tomaltepec",label:"Santo Domingo Tomaltepec"},
          {value:"Santo Domingo Tonalá",label:"Santo Domingo Tonalá"},
          {value:"Santo Domingo Tonaltepec",label:"Santo Domingo Tonaltepec"},
          {value:"Santo Domingo Xagacía",label:"Santo Domingo Xagacía"},
          {value:"Santo Domingo Yanhuitlán",label:"Santo Domingo Yanhuitlán"},
          {value:"Santo Domingo Yodohino",label:"Santo Domingo Yodohino"},
          {value:"Santo Domingo Zanatepec",label:"Santo Domingo Zanatepec"},
          {value:"Santos Reyes Nopala",label:"Santos Reyes Nopala"},
          {value:"Santos Reyes Pápalo",label:"Santos Reyes Pápalo"},
          {value:"Santos Reyes Tepejillo",label:"Santos Reyes Tepejillo"},
          {value:"Santos Reyes Yucuná",label:"Santos Reyes Yucuná"},
          {value:"Santo Tomás Jalieza",label:"Santo Tomás Jalieza"},
          {value:"Santo Tomás Mazaltepec",label:"Santo Tomás Mazaltepec"},
          {value:"Santo Tomás Ocotepec",label:"Santo Tomás Ocotepec"},
          {value:"Santo Tomás Tamazulapan",label:"Santo Tomás Tamazulapan"},
          {value:"San Vicente Coatlán",label:"San Vicente Coatlán"},
          {value:"San Vicente Lachixío",label:"San Vicente Lachixío"},
          {value:"San Vicente Nuñú",label:"San Vicente Nuñú"},
          {value:"Silacayoápam",label:"Silacayoápam"},
          {value:"Sitio de Xitlapehua",label:"Sitio de Xitlapehua"},
          {value:"Soledad Etla",label:"Soledad Etla"},
          {value:"Villa de Tamazulápam del Progreso",label:"Villa de Tamazulápam del Progreso"},
          {value:"Tanetze de Zaragoza",label:"Tanetze de Zaragoza"},
          {value:"Taniche",label:"Taniche"},
          {value:"Tataltepec de Valdés",label:"Tataltepec de Valdés"},
          {value:"Teococuilco de Marcos Pérez",label:"Teococuilco de Marcos Pérez"},
          {value:"Teotitlán de Flores Magón",label:"Teotitlán de Flores Magón"},
          {value:"Teotitlán del Valle",label:"Teotitlán del Valle"},
          {value:"Teotongo",label:"Teotongo"},
          {value:"Tepelmeme Villa de Morelos",label:"Tepelmeme Villa de Morelos"},
          {value:"Heroica Villa Tezoatlán de Segura y Luna, Cuna de la Independencia de Oaxaca",label:"Heroica Villa Tezoatlán de Segura y Luna, Cuna de la Independencia de Oaxaca"},
          {value:"San Jerónimo Tlacochahuaya",label:"San Jerónimo Tlacochahuaya"},
          {value:"Tlacolula de Matamoros",label:"Tlacolula de Matamoros"},
          {value:"Tlacotepec Plumas",label:"Tlacotepec Plumas"},
          {value:"Tlalixtac de Cabrera",label:"Tlalixtac de Cabrera"},
          {value:"Totontepec Villa de Morelos",label:"Totontepec Villa de Morelos"},
          {value:"Trinidad Zaachila",label:"Trinidad Zaachila"},
          {value:"La Trinidad Vista Hermosa",label:"La Trinidad Vista Hermosa"},
          {value:"Unión Hidalgo",label:"Unión Hidalgo"},
          {value:"Valerio Trujano",label:"Valerio Trujano"},
          {value:"San Juan Bautista Valle Nacional",label:"San Juan Bautista Valle Nacional"},
          {value:"Villa Díaz Ordaz",label:"Villa Díaz Ordaz"},
          {value:"Yaxe",label:"Yaxe"},
          {value:"Magdalena Yodocono de Porfirio Díaz",label:"Magdalena Yodocono de Porfirio Díaz"},
          {value:"Yogana",label:"Yogana"},
          {value:"Yutanduchi de Guerrero",label:"Yutanduchi de Guerrero"},
          {value:"Villa de Zaachila",label:"Villa de Zaachila"},
          {value:"San Mateo Yucutindó",label:"San Mateo Yucutindó"},
          {value:"Zapotitlán Lagunas",label:"Zapotitlán Lagunas"},
          {value:"Zapotitlán Palmas",label:"Zapotitlán Palmas"},
          {value:"Santa Inés de Zaragoza",label:"Santa Inés de Zaragoza"},
          {value:"Zimatlán de Álvarez",label:"Zimatlán de Álvarez"}
      ];
    }
    if($scope.slcStateProfile == "Puebla")
    {
      $scope.slcCityProfileItems = [
        {value:"Acajete",label:"Acajete"},
        {value:"Acateno",label:"Acateno"},
        {value:"Acatlán",label:"Acatlán"},
        {value:"Acatzingo",label:"Acatzingo"},
        {value:"Acteopan",label:"Acteopan"},
        {value:"Ahuacatlán",label:"Ahuacatlán"},
        {value:"Ahuatlán",label:"Ahuatlán"},
        {value:"Ahuazotepec",label:"Ahuazotepec"},
        {value:"Ahuehuetitla",label:"Ahuehuetitla"},
        {value:"Ajalpan",label:"Ajalpan"},
        {value:"Albino Zertuche",label:"Albino Zertuche"},
        {value:"Aljojuca",label:"Aljojuca"},
        {value:"Altepexi",label:"Altepexi"},
        {value:"Amixtlán",label:"Amixtlán"},
        {value:"Amozoc",label:"Amozoc"},
        {value:"Aquixtla",label:"Aquixtla"},
        {value:"Atempan",label:"Atempan"},
        {value:"Atexcal",label:"Atexcal"},
        {value:"Atlixco",label:"Atlixco"},
        {value:"Atoyatempan",label:"Atoyatempan"},
        {value:"Atzala",label:"Atzala"},
        {value:"Atzitzihuacán",label:"Atzitzihuacán"},
        {value:"Atzitzintla",label:"Atzitzintla"},
        {value:"Axutla",label:"Axutla"},
        {value:"Ayotoxco de Guerrero",label:"Ayotoxco de Guerrero"},
        {value:"Calpan",label:"Calpan"},
        {value:"Caltepec",label:"Caltepec"},
        {value:"Camocuautla",label:"Camocuautla"},
        {value:"Caxhuacan",label:"Caxhuacan"},
        {value:"Coatepec",label:"Coatepec"},
        {value:"Coatzingo",label:"Coatzingo"},
        {value:"Cohetzala",label:"Cohetzala"},
        {value:"Cohuecan",label:"Cohuecan"},
        {value:"Coronango",label:"Coronango"},
        {value:"Coxcatlán",label:"Coxcatlán"},
        {value:"Coyomeapan",label:"Coyomeapan"},
        {value:"Coyotepec",label:"Coyotepec"},
        {value:"Cuapiaxtla de Madero",label:"Cuapiaxtla de Madero"},
        {value:"Cuautempan",label:"Cuautempan"},
        {value:"Cuautinchán",label:"Cuautinchán"},
        {value:"Cuautlancingo",label:"Cuautlancingo"},
        {value:"Cuayuca de Andrade",label:"Cuayuca de Andrade"},
        {value:"Cuetzalan del Progreso",label:"Cuetzalan del Progreso"},
        {value:"Cuyoaco",label:"Cuyoaco"},
        {value:"Chalchicomula de Sesma",label:"Chalchicomula de Sesma"},
        {value:"Chapulco",label:"Chapulco"},
        {value:"Chiautla",label:"Chiautla"},
        {value:"Chiautzingo",label:"Chiautzingo"},
        {value:"Chiconcuautla",label:"Chiconcuautla"},
        {value:"Chichiquila",label:"Chichiquila"},
        {value:"Chietla",label:"Chietla"},
        {value:"Chigmecatitlán",label:"Chigmecatitlán"},
        {value:"Chignahuapan",label:"Chignahuapan"},
        {value:"Chignautla",label:"Chignautla"},
        {value:"Chila",label:"Chila"},
        {value:"Chila de la Sal",label:"Chila de la Sal"},
        {value:"Honey",label:"Honey"},
        {value:"Chilchotla",label:"Chilchotla"},
        {value:"Chinantla",label:"Chinantla"},
        {value:"Domingo Arenas",label:"Domingo Arenas"},
        {value:"Eloxochitlán",label:"Eloxochitlán"},
        {value:"Epatlán",label:"Epatlán"},
        {value:"Esperanza",label:"Esperanza"},
        {value:"Francisco Z. Mena",label:"Francisco Z. Mena"},
        {value:"General Felipe Ángeles",label:"General Felipe Ángeles"},
        {value:"Guadalupe",label:"Guadalupe"},
        {value:"Guadalupe Victoria",label:"Guadalupe Victoria"},
        {value:"Hermenegildo Galeana",label:"Hermenegildo Galeana"},
        {value:"Huaquechula",label:"Huaquechula"},
        {value:"Huatlatlauca",label:"Huatlatlauca"},
        {value:"Huauchinango",label:"Huauchinango"},
        {value:"Huehuetla",label:"Huehuetla"},
        {value:"Huehuetlán el Chico",label:"Huehuetlán el Chico"},
        {value:"Huejotzingo",label:"Huejotzingo"},
        {value:"Hueyapan",label:"Hueyapan"},
        {value:"Hueytamalco",label:"Hueytamalco"},
        {value:"Hueytlalpan",label:"Hueytlalpan"},
        {value:"Huitzilan de Serdán",label:"Huitzilan de Serdán"},
        {value:"Huitziltepec",label:"Huitziltepec"},
        {value:"Atlequizayan",label:"Atlequizayan"},
        {value:"Ixcamilpa de Guerrero",label:"Ixcamilpa de Guerrero"},
        {value:"Ixcaquixtla",label:"Ixcaquixtla"},
        {value:"Ixtacamaxtitlán",label:"Ixtacamaxtitlán"},
        {value:"Ixtepec",label:"Ixtepec"},
        {value:"Izúcar de Matamoros",label:"Izúcar de Matamoros"},
        {value:"Jalpan",label:"Jalpan"},
        {value:"Jolalpan",label:"Jolalpan"},
        {value:"Jonotla",label:"Jonotla"},
        {value:"Jopala",label:"Jopala"},
        {value:"Juan C. Bonilla",label:"Juan C. Bonilla"},
        {value:"Juan Galindo",label:"Juan Galindo"},
        {value:"Juan N. Méndez",label:"Juan N. Méndez"},
        {value:"Lafragua",label:"Lafragua"},
        {value:"Libres",label:"Libres"},
        {value:"La Magdalena Tlatlauquitepec",label:"La Magdalena Tlatlauquitepec"},
        {value:"Mazapiltepec de Juárez",label:"Mazapiltepec de Juárez"},
        {value:"Mixtla",label:"Mixtla"},
        {value:"Molcaxac",label:"Molcaxac"},
        {value:"Cañada Morelos",label:"Cañada Morelos"},
        {value:"Naupan",label:"Naupan"},
        {value:"Nauzontla",label:"Nauzontla"},
        {value:"Nealtican",label:"Nealtican"},
        {value:"Nicolás Bravo",label:"Nicolás Bravo"},
        {value:"Nopalucan",label:"Nopalucan"},
        {value:"Ocotepec",label:"Ocotepec"},
        {value:"Ocoyucan",label:"Ocoyucan"},
        {value:"Olintla",label:"Olintla"},
        {value:"Oriental",label:"Oriental"},
        {value:"Pahuatlán",label:"Pahuatlán"},
        {value:"Palmar de Bravo",label:"Palmar de Bravo"},
        {value:"Pantepec",label:"Pantepec"},
        {value:"Petlalcingo",label:"Petlalcingo"},
        {value:"Piaxtla",label:"Piaxtla"},
        {value:"Puebla",label:"Puebla"},
        {value:"Quecholac",label:"Quecholac"},
        {value:"Quimixtlán",label:"Quimixtlán"},
        {value:"Rafael Lara Grajales",label:"Rafael Lara Grajales"},
        {value:"Los Reyes de Juárez",label:"Los Reyes de Juárez"},
        {value:"San Andrés Cholula",label:"San Andrés Cholula"},
        {value:"San Antonio Cañada",label:"San Antonio Cañada"},
        {value:"San Diego la Mesa Tochimiltzingo",label:"San Diego la Mesa Tochimiltzingo"},
        {value:"San Felipe Teotlalcingo",label:"San Felipe Teotlalcingo"},
        {value:"San Felipe Tepatlán",label:"San Felipe Tepatlán"},
        {value:"San Gabriel Chilac",label:"San Gabriel Chilac"},
        {value:"San Gregorio Atzompa",label:"San Gregorio Atzompa"},
        {value:"San Jerónimo Tecuanipan",label:"San Jerónimo Tecuanipan"},
        {value:"San Jerónimo Xayacatlán",label:"San Jerónimo Xayacatlán"},
        {value:"San José Chiapa",label:"San José Chiapa"},
        {value:"San José Miahuatlán",label:"San José Miahuatlán"},
        {value:"San Juan Atenco",label:"San Juan Atenco"},
        {value:"San Juan Atzompa",label:"San Juan Atzompa"},
        {value:"San Martín Texmelucan",label:"San Martín Texmelucan"},
        {value:"San Martín Totoltepec",label:"San Martín Totoltepec"},
        {value:"San Matías Tlalancaleca",label:"San Matías Tlalancaleca"},
        {value:"San Miguel Ixitlán",label:"San Miguel Ixitlán"},
        {value:"San Miguel Xoxtla",label:"San Miguel Xoxtla"},
        {value:"San Nicolás Buenos Aires",label:"San Nicolás Buenos Aires"},
        {value:"San Nicolás de los Ranchos",label:"San Nicolás de los Ranchos"},
        {value:"San Pablo Anicano",label:"San Pablo Anicano"},
        {value:"San Pedro Cholula",label:"San Pedro Cholula"},
        {value:"San Pedro Yeloixtlahuaca",label:"San Pedro Yeloixtlahuaca"},
        {value:"San Salvador el Seco",label:"San Salvador el Seco"},
        {value:"San Salvador el Verde",label:"San Salvador el Verde"},
        {value:"San Salvador Huixcolotla",label:"San Salvador Huixcolotla"},
        {value:"San Sebastián Tlacotepec",label:"San Sebastián Tlacotepec"},
        {value:"Santa Catarina Tlaltempan",label:"Santa Catarina Tlaltempan"},
        {value:"Santa Inés Ahuatempan",label:"Santa Inés Ahuatempan"},
        {value:"Santa Isabel Cholula",label:"Santa Isabel Cholula"},
        {value:"Santiago Miahuatlán",label:"Santiago Miahuatlán"},
        {value:"Huehuetlán el Grande",label:"Huehuetlán el Grande"},
        {value:"Santo Tomás Hueyotlipan",label:"Santo Tomás Hueyotlipan"},
        {value:"Soltepec",label:"Soltepec"},
        {value:"Tecali de Herrera",label:"Tecali de Herrera"},
        {value:"Tecamachalco",label:"Tecamachalco"},
        {value:"Tecomatlán",label:"Tecomatlán"},
        {value:"Tehuacán",label:"Tehuacán"},
        {value:"Tehuitzingo",label:"Tehuitzingo"},
        {value:"Tenampulco",label:"Tenampulco"},
        {value:"Teopantlán",label:"Teopantlán"},
        {value:"Teotlalco",label:"Teotlalco"},
        {value:"Tepanco de López",label:"Tepanco de López"},
        {value:"Tepango de Rodríguez",label:"Tepango de Rodríguez"},
        {value:"Tepatlaxco de Hidalgo",label:"Tepatlaxco de Hidalgo"},
        {value:"Tepeaca",label:"Tepeaca"},
        {value:"Tepemaxalco",label:"Tepemaxalco"},
        {value:"Tepeojuma",label:"Tepeojuma"},
        {value:"Tepetzintla",label:"Tepetzintla"},
        {value:"Tepexco",label:"Tepexco"},
        {value:"Tepexi de Rodríguez",label:"Tepexi de Rodríguez"},
        {value:"Tepeyahualco",label:"Tepeyahualco"},
        {value:"Tepeyahualco de Cuauhtémoc",label:"Tepeyahualco de Cuauhtémoc"},
        {value:"Tetela de Ocampo",label:"Tetela de Ocampo"},
        {value:"Teteles de Avila Castillo",label:"Teteles de Avila Castillo"},
        {value:"Teziutlán",label:"Teziutlán"},
        {value:"Tianguismanalco",label:"Tianguismanalco"},
        {value:"Tilapa",label:"Tilapa"},
        {value:"Tlacotepec de Benito Juárez",label:"Tlacotepec de Benito Juárez"},
        {value:"Tlacuilotepec",label:"Tlacuilotepec"},
        {value:"Tlachichuca",label:"Tlachichuca"},
        {value:"Tlahuapan",label:"Tlahuapan"},
        {value:"Tlaltenango",label:"Tlaltenango"},
        {value:"Tlanepantla",label:"Tlanepantla"},
        {value:"Tlaola",label:"Tlaola"},
        {value:"Tlapacoya",label:"Tlapacoya"},
        {value:"Tlapanalá",label:"Tlapanalá"},
        {value:"Tlatlauquitepec",label:"Tlatlauquitepec"},
        {value:"Tlaxco",label:"Tlaxco"},
        {value:"Tochimilco",label:"Tochimilco"},
        {value:"Tochtepec",label:"Tochtepec"},
        {value:"Totoltepec de Guerrero",label:"Totoltepec de Guerrero"},
        {value:"Tulcingo",label:"Tulcingo"},
        {value:"Tuzamapan de Galeana",label:"Tuzamapan de Galeana"},
        {value:"Tzicatlacoyan",label:"Tzicatlacoyan"},
        {value:"Venustiano Carranza",label:"Venustiano Carranza"},
        {value:"Vicente Guerrero",label:"Vicente Guerrero"},
        {value:"Xayacatlán de Bravo",label:"Xayacatlán de Bravo"},
        {value:"Xicotepec",label:"Xicotepec"},
        {value:"Xicotlán",label:"Xicotlán"},
        {value:"Xiutetelco",label:"Xiutetelco"},
        {value:"Xochiapulco",label:"Xochiapulco"},
        {value:"Xochiltepec",label:"Xochiltepec"},
        {value:"Xochitlán de Vicente Suárez",label:"Xochitlán de Vicente Suárez"},
        {value:"Xochitlán Todos Santos",label:"Xochitlán Todos Santos"},
        {value:"Yaonáhuac",label:"Yaonáhuac"},
        {value:"Yehualtepec",label:"Yehualtepec"},
        {value:"Zacapala",label:"Zacapala"},
        {value:"Zacapoaxtla",label:"Zacapoaxtla"},
        {value:"Zacatlán",label:"Zacatlán"},
        {value:"Zapotitlán",label:"Zapotitlán"},
        {value:"Zapotitlán de Méndez",label:"Zapotitlán de Méndez"},
        {value:"Zaragoza",label:"Zaragoza"},
        {value:"Zautla",label:"Zautla"},
        {value:"Zihuateutla",label:"Zihuateutla"},
        {value:"Zinacatepec",label:"Zinacatepec"},
        {value:"Zongozotla",label:"Zongozotla"},
        {value:"Zoquiapan",label:"Zoquiapan"},
        {value:"Zoquitlán",label:"Zoquitlán"}
      ];
    }
    if($scope.slcStateProfile == "Querétaro")
    {
      $scope.slcCityProfileItems = [
        {value:"Amealco de Bonfil",label:"Amealco de Bonfil"},
        {value:"Pinal de Amoles",label:"Pinal de Amoles"},
        {value:"Arroyo Seco",label:"Arroyo Seco"},
        {value:"Cadereyta de Montes",label:"Cadereyta de Montes"},
        {value:"Colón",label:"Colón"},
        {value:"Corregidora",label:"Corregidora"},
        {value:"Ezequiel Montes",label:"Ezequiel Montes"},
        {value:"Huimilpan",label:"Huimilpan"},
        {value:"Jalpan de Serra",label:"Jalpan de Serra"},
        {value:"Landa de Matamoros",label:"Landa de Matamoros"},
        {value:"El Marqués",label:"El Marqués"},
        {value:"Pedro Escobedo",label:"Pedro Escobedo"},
        {value:"Peñamiller",label:"Peñamiller"},
        {value:"Querétaro",label:"Querétaro"},
        {value:"San Joaquín",label:"San Joaquín"},
        {value:"San Juan del Río",label:"San Juan del Río"},
        {value:"Tequisquiapan",label:"Tequisquiapan"},
        {value:"Tolimán",label:"Tolimán"}
      ];
    }
    if($scope.slcStateProfile == "Quintana Roo")
    {
      $scope.slcCityProfileItems = [
        {value:"Cozumel",label:"Cozumel"},
        {value:"Felipe Carrillo Puerto",label:"Felipe Carrillo Puerto"},
        {value:"Isla Mujeres",label:"Isla Mujeres"},
        {value:"Othón P. Blanco",label:"Othón P. Blanco"},
        {value:"Benito Juárez",label:"Benito Juárez"},
        {value:"José María Morelos",label:"José María Morelos"},
        {value:"Lázaro Cárdenas",label:"Lázaro Cárdenas"},
        {value:"Solidaridad",label:"Solidaridad"},
        {value:"Tulum",label:"Tulum"},
        {value:"Bacalar",label:"Bacalar"}
      ];
    }
    if($scope.slcStateProfile == "San Luis Potosí")
    {
      $scope.slcCityProfileItems = [
        {value:"Ahualulco",label:"Ahualulco"},
        {value:"Alaquines",label:"Alaquines"},
        {value:"Aquismón",label:"Aquismón"},
        {value:"Armadillo de los Infante",label:"Armadillo de los Infante"},
        {value:"Cárdenas",label:"Cárdenas"},
        {value:"Catorce",label:"Catorce"},
        {value:"Cedral",label:"Cedral"},
        {value:"Cerritos",label:"Cerritos"},
        {value:"Cerro de San Pedro",label:"Cerro de San Pedro"},
        {value:"Ciudad del Maíz",label:"Ciudad del Maíz"},
        {value:"Ciudad Fernández",label:"Ciudad Fernández"},
        {value:"Tancanhuitz",label:"Tancanhuitz"},
        {value:"Ciudad Valles",label:"Ciudad Valles"},
        {value:"Coxcatlán",label:"Coxcatlán"},
        {value:"Charcas",label:"Charcas"},
        {value:"Ebano",label:"Ebano"},
        {value:"Guadalcázar",label:"Guadalcázar"},
        {value:"Huehuetlán",label:"Huehuetlán"},
        {value:"Lagunillas",label:"Lagunillas"},
        {value:"Matehuala",label:"Matehuala"},
        {value:"Mexquitic de Carmona",label:"Mexquitic de Carmona"},
        {value:"Moctezuma",label:"Moctezuma"},
        {value:"Rayón",label:"Rayón"},
        {value:"Rioverde",label:"Rioverde"},
        {value:"Salinas",label:"Salinas"},
        {value:"San Antonio",label:"San Antonio"},
        {value:"San Ciro de Acosta",label:"San Ciro de Acosta"},
        {value:"San Luis Potosí",label:"San Luis Potosí"},
        {value:"San Martín Chalchicuautla",label:"San Martín Chalchicuautla"},
        {value:"San Nicolás Tolentino",label:"San Nicolás Tolentino"},
        {value:"Santa Catarina",label:"Santa Catarina"},
        {value:"Santa María del Río",label:"Santa María del Río"},
        {value:"Santo Domingo",label:"Santo Domingo"},
        {value:"San Vicente Tancuayalab",label:"San Vicente Tancuayalab"},
        {value:"Soledad de Graciano Sánchez",label:"Soledad de Graciano Sánchez"},
        {value:"Tamasopo",label:"Tamasopo"},
        {value:"Tamazunchale",label:"Tamazunchale"},
        {value:"Tampacán",label:"Tampacán"},
        {value:"Tampamolón Corona",label:"Tampamolón Corona"},
        {value:"Tamuín",label:"Tamuín"},
        {value:"Tanlajás",label:"Tanlajás"},
        {value:"Tanquián de Escobedo",label:"Tanquián de Escobedo"},
        {value:"Tierra Nueva",label:"Tierra Nueva"},
        {value:"Vanegas",label:"Vanegas"},
        {value:"Venado",label:"Venado"},
        {value:"Villa de Arriaga",label:"Villa de Arriaga"},
        {value:"Villa de Guadalupe",label:"Villa de Guadalupe"},
        {value:"Villa de la Paz",label:"Villa de la Paz"},
        {value:"Villa de Ramos",label:"Villa de Ramos"},
        {value:"Villa de Reyes",label:"Villa de Reyes"},
        {value:"Villa Hidalgo",label:"Villa Hidalgo"},
        {value:"Villa Juárez",label:"Villa Juárez"},
        {value:"Axtla de Terrazas",label:"Axtla de Terrazas"},
        {value:"Xilitla",label:"Xilitla"},
        {value:"Zaragoza",label:"Zaragoza"},
        {value:"Villa de Arista",label:"Villa de Arista"},
        {value:"Matlapa",label:"Matlapa"},
        {value:"El Naranjo",label:"El Naranjo"}
      ];
    }
    if($scope.slcStateProfile == "Sinaloa")
    {
      $scope.slcCityProfileItems = [
        {value:"Ahome",label:"Ahome"},
        {value:"Angostura",label:"Angostura"},
        {value:"Badiraguato",label:"Badiraguato"},
        {value:"Concordia",label:"Concordia"},
        {value:"Cosalá",label:"Cosalá"},
        {value:"Culiacán",label:"Culiacán"},
        {value:"Choix",label:"Choix"},
        {value:"Elota",label:"Elota"},
        {value:"Escuinapa",label:"Escuinapa"},
        {value:"El Fuerte",label:"El Fuerte"},
        {value:"Guasave",label:"Guasave"},
        {value:"Mazatlán",label:"Mazatlán"},
        {value:"Mocorito",label:"Mocorito"},
        {value:"Rosario",label:"Rosario"},
        {value:"Salvador Alvarado",label:"Salvador Alvarado"},
        {value:"San Ignacio",label:"San Ignacio"},
        {value:"Sinaloa",label:"Sinaloa"},
        {value:"Navolato",label:"Navolato"}
      ];
    }
    if($scope.slcStateProfile == "Sonora")
    {
      $scope.slcCityProfileItems = [
        {value:"Aconchi",label:"Aconchi"},
        {value:"Agua Prieta",label:"Agua Prieta"},
        {value:"Alamos",label:"Alamos"},
        {value:"Altar",label:"Altar"},
        {value:"Arivechi",label:"Arivechi"},
        {value:"Arizpe",label:"Arizpe"},
        {value:"Atil",label:"Atil"},
        {value:"Bacadéhuachi",label:"Bacadéhuachi"},
        {value:"Bacanora",label:"Bacanora"},
        {value:"Bacerac",label:"Bacerac"},
        {value:"Bacoachi",label:"Bacoachi"},
        {value:"Bácum",label:"Bácum"},
        {value:"Banámichi",label:"Banámichi"},
        {value:"Baviácora",label:"Baviácora"},
        {value:"Bavispe",label:"Bavispe"},
        {value:"Benjamín Hill",label:"Benjamín Hill"},
        {value:"Caborca",label:"Caborca"},
        {value:"Cajeme",label:"Cajeme"},
        {value:"Cananea",label:"Cananea"},
        {value:"Carbó",label:"Carbó"},
        {value:"La Colorada",label:"La Colorada"},
        {value:"Cucurpe",label:"Cucurpe"},
        {value:"Cumpas",label:"Cumpas"},
        {value:"Divisaderos",label:"Divisaderos"},
        {value:"Empalme",label:"Empalme"},
        {value:"Etchojoa",label:"Etchojoa"},
        {value:"Fronteras",label:"Fronteras"},
        {value:"Granados",label:"Granados"},
        {value:"Guaymas",label:"Guaymas"},
        {value:"Hermosillo",label:"Hermosillo"},
        {value:"Huachinera",label:"Huachinera"},
        {value:"Huásabas",label:"Huásabas"},
        {value:"Huatabampo",label:"Huatabampo"},
        {value:"Huépac",label:"Huépac"},
        {value:"Imuris",label:"Imuris"},
        {value:"Magdalena",label:"Magdalena"},
        {value:"Mazatán",label:"Mazatán"},
        {value:"Moctezuma",label:"Moctezuma"},
        {value:"Naco",label:"Naco"},
        {value:"Nácori Chico",label:"Nácori Chico"},
        {value:"Nacozari de García",label:"Nacozari de García"},
        {value:"Navojoa",label:"Navojoa"},
        {value:"Nogales",label:"Nogales"},
        {value:"Onavas",label:"Onavas"},
        {value:"Opodepe",label:"Opodepe"},
        {value:"Oquitoa",label:"Oquitoa"},
        {value:"Pitiquito",label:"Pitiquito"},
        {value:"Puerto Peñasco",label:"Puerto Peñasco"},
        {value:"Quiriego",label:"Quiriego"},
        {value:"Rayón",label:"Rayón"},
        {value:"Rosario",label:"Rosario"},
        {value:"Sahuaripa",label:"Sahuaripa"},
        {value:"San Felipe de Jesús",label:"San Felipe de Jesús"},
        {value:"San Javier",label:"San Javier"},
        {value:"San Luis Río Colorado",label:"San Luis Río Colorado"},
        {value:"San Miguel de Horcasitas",label:"San Miguel de Horcasitas"},
        {value:"San Pedro de la Cueva",label:"San Pedro de la Cueva"},
        {value:"Santa Ana",label:"Santa Ana"},
        {value:"Santa Cruz",label:"Santa Cruz"},
        {value:"Sáric",label:"Sáric"},
        {value:"Soyopa",label:"Soyopa"},
        {value:"Suaqui Grande",label:"Suaqui Grande"},
        {value:"Tepache",label:"Tepache"},
        {value:"Trincheras",label:"Trincheras"},
        {value:"Tubutama",label:"Tubutama"},
        {value:"Ures",label:"Ures"},
        {value:"Villa Hidalgo",label:"Villa Hidalgo"},
        {value:"Villa Pesqueira",label:"Villa Pesqueira"},
        {value:"Yécora",label:"Yécora"},
        {value:"General Plutarco Elías Calles",label:"General Plutarco Elías Calles"},
        {value:"Benito Juárez",label:"Benito Juárez"},
        {value:"San Ignacio Río Muerto",label:"San Ignacio Río Muerto"}
      ];
    }
    if($scope.slcStateProfile == "Tabasco")
    {
        $scope.slcCityProfileItems = [
          {value:"Balancán",label:"Balancán"},
          {value:"Cárdenas",label:"Cárdenas"},
          {value:"Centla",label:"Centla"},
          {value:"Centro",label:"Centro"},
          {value:"Comalcalco",label:"Comalcalco"},
          {value:"Cunduacán",label:"Cunduacán"},
          {value:"Emiliano Zapata",label:"Emiliano Zapata"},
          {value:"Huimanguillo",label:"Huimanguillo"},
          {value:"Jalapa",label:"Jalapa"},
          {value:"Jalpa de Méndez",label:"Jalpa de Méndez"},
          {value:"Jonuta",label:"Jonuta"},
          {value:"Macuspana",label:"Macuspana"},
          {value:"Nacajuca",label:"Nacajuca"},
          {value:"Paraíso",label:"Paraíso"},
          {value:"Tacotalpa",label:"Tacotalpa"},
          {value:"Teapa",label:"Teapa"},
          {value:"Tenosique",label:"Tenosique"}

        ];
    }
    if($scope.slcStateProfile == "Tamaulipas")
    {
      $scope.slcCityProfileItems = [
        {value:"Abasolo",label:"Abasolo"},
        {value:"Aldama",label:"Aldama"},
        {value:"Altamira",label:"Altamira"},
        {value:"Antiguo Morelos",label:"Antiguo Morelos"},
        {value:"Burgos",label:"Burgos"},
        {value:"Bustamante",label:"Bustamante"},
        {value:"Camargo",label:"Camargo"},
        {value:"Casas",label:"Casas"},
        {value:"Ciudad Madero",label:"Ciudad Madero"},
        {value:"Cruillas",label:"Cruillas"},
        {value:"Gómez Farías",label:"Gómez Farías"},
        {value:"González",label:"González"},
        {value:"Güémez",label:"Güémez"},
        {value:"Guerrero",label:"Guerrero"},
        {value:"Gustavo Díaz Ordaz",label:"Gustavo Díaz Ordaz"},
        {value:"Hidalgo",label:"Hidalgo"},
        {value:"Jaumave",label:"Jaumave"},
        {value:"Jiménez",label:"Jiménez"},
        {value:"Llera",label:"Llera"},
        {value:"Mainero",label:"Mainero"},
        {value:"El Mante",label:"El Mante"},
        {value:"Matamoros",label:"Matamoros"},
        {value:"Méndez",label:"Méndez"},
        {value:"Mier",label:"Mier"},
        {value:"Miguel Alemán",label:"Miguel Alemán"},
        {value:"Miquihuana",label:"Miquihuana"},
        {value:"Nuevo Laredo",label:"Nuevo Laredo"},
        {value:"Nuevo Morelos",label:"Nuevo Morelos"},
        {value:"Ocampo",label:"Ocampo"},
        {value:"Padilla",label:"Padilla"},
        {value:"Palmillas",label:"Palmillas"},
        {value:"Reynosa",label:"Reynosa"},
        {value:"Río Bravo",label:"Río Bravo"},
        {value:"San Carlos",label:"San Carlos"},
        {value:"San Fernando",label:"San Fernando"},
        {value:"San Nicolás",label:"San Nicolás"},
        {value:"Soto la Marina",label:"Soto la Marina"},
        {value:"Tampico",label:"Tampico"},
        {value:"Tula",label:"Tula"},
        {value:"Valle Hermoso",label:"Valle Hermoso"},
        {value:"Victoria",label:"Victoria"},
        {value:"Villagrán",label:"Villagrán"},
        {value:"Xicoténcatl",label:"Xicoténcatl"}
      ];
    }
    if($scope.slcStateProfile == "Tlaxcala")
    {
      $scope.slcCityProfileItems = [
        {value:"Amaxac de Guerrero",label:"Amaxac de Guerrero"},
        {value:"Apetatitlán de Antonio Carvajal",label:"Apetatitlán de Antonio Carvajal"},
        {value:"Atlangatepec",label:"Atlangatepec"},
        {value:"Altzayanca",label:"Altzayanca"},
        {value:"Apizaco",label:"Apizaco"},
        {value:"Calpulalpan",label:"Calpulalpan"},
        {value:"El Carmen Tequexquitla",label:"El Carmen Tequexquitla"},
        {value:"Cuapiaxtla",label:"Cuapiaxtla"},
        {value:"Cuaxomulco",label:"Cuaxomulco"},
        {value:"Chiautempan",label:"Chiautempan"},
        {value:"Muñoz de Domingo Arenas",label:"Muñoz de Domingo Arenas"},
        {value:"Españita",label:"Españita"},
        {value:"Huamantla",label:"Huamantla"},
        {value:"Hueyotlipan",label:"Hueyotlipan"},
        {value:"Ixtacuixtla de Mariano Matamoros",label:"Ixtacuixtla de Mariano Matamoros"},
        {value:"Ixtenco",label:"Ixtenco"},
        {value:"Mazatecochco de José María Morelos",label:"Mazatecochco de José María Morelos"},
        {value:"Contla de Juan Cuamatzi",label:"Contla de Juan Cuamatzi"},
        {value:"Tepetitla de Lardizábal",label:"Tepetitla de Lardizábal"},
        {value:"Sanctórum de Lázaro Cárdenas",label:"Sanctórum de Lázaro Cárdenas"},
        {value:"Nanacamilpa de Mariano Arista",label:"Nanacamilpa de Mariano Arista"},
        {value:"Acuamanala de Miguel Hidalgo",label:"Acuamanala de Miguel Hidalgo"},
        {value:"Natívitas",label:"Natívitas"},
        {value:"Panotla",label:"Panotla"},
        {value:"San Pablo del Monte",label:"San Pablo del Monte"},
        {value:"Santa Cruz Tlaxcala",label:"Santa Cruz Tlaxcala"},
        {value:"Tenancingo",label:"Tenancingo"},
        {value:"Teolocholco",label:"Teolocholco"},
        {value:"Tepeyanco",label:"Tepeyanco"},
        {value:"Terrenate",label:"Terrenate"},
        {value:"Tetla de la Solidaridad",label:"Tetla de la Solidaridad"},
        {value:"Tetlatlahuca",label:"Tetlatlahuca"},
        {value:"Tlaxcala",label:"Tlaxcala"},
        {value:"Tlaxco",label:"Tlaxco"},
        {value:"Tocatlán",label:"Tocatlán"},
        {value:"Totolac",label:"Totolac"},
        {value:"Ziltlaltépec de Trinidad Sánchez Santos",label:"Ziltlaltépec de Trinidad Sánchez Santos"},
        {value:"Tzompantepec",label:"Tzompantepec"},
        {value:"Xaloztoc",label:"Xaloztoc"},
        {value:"Xaltocan",label:"Xaltocan"},
        {value:"Papalotla de Xicohténcatl",label:"Papalotla de Xicohténcatl"},
        {value:"Xicohtzinco",label:"Xicohtzinco"},
        {value:"Yauhquemehcan",label:"Yauhquemehcan"},
        {value:"Zacatelco",label:"Zacatelco"},
        {value:"Benito Juárez",label:"Benito Juárez"},
        {value:"Emiliano Zapata",label:"Emiliano Zapata"},
        {value:"Lázaro Cárdenas",label:"Lázaro Cárdenas"},
        {value:"La Magdalena Tlaltelulco",label:"La Magdalena Tlaltelulco"},
        {value:"San Damián Texóloc",label:"San Damián Texóloc"},
        {value:"San Francisco Tetlanohcan",label:"San Francisco Tetlanohcan"},
        {value:"San Jerónimo Zacualpan",label:"San Jerónimo Zacualpan"},
        {value:"San José Teacalco",label:"San José Teacalco"},
        {value:"San Juan Huactzinco",label:"San Juan Huactzinco"},
        {value:"San Lorenzo Axocomanitla",label:"San Lorenzo Axocomanitla"},
        {value:"San Lucas Tecopilco",label:"San Lucas Tecopilco"},
        {value:"Santa Ana Nopalucan",label:"Santa Ana Nopalucan"},
        {value:"Santa Apolonia Teacalco",label:"Santa Apolonia Teacalco"},
        {value:"Santa Catarina Ayometla",label:"Santa Catarina Ayometla"},
        {value:"Santa Cruz Quilehtla",label:"Santa Cruz Quilehtla"},
        {value:"Santa Isabel Xiloxoxtla",label:"Santa Isabel Xiloxoxtla"}
      ];
    }
    if($scope.slcStateProfile == "Veracruz")
    {
      $scope.slcCityProfileItems = [
        {value:"Acajete",label:"Acajete"},
        {value:"Acatlán",label:"Acatlán"},
        {value:"Acayucan",label:"Acayucan"},
        {value:"Actopan",label:"Actopan"},
        {value:"Acula",label:"Acula"},
        {value:"Acultzingo",label:"Acultzingo"},
        {value:"Camarón de Tejeda",label:"Camarón de Tejeda"},
        {value:"Alpatláhuac",label:"Alpatláhuac"},
        {value:"Alto Lucero de Gutiérrez Barrios",label:"Alto Lucero de Gutiérrez Barrios"},
        {value:"Altotonga",label:"Altotonga"},
        {value:"Alvarado",label:"Alvarado"},
        {value:"Amatitlán",label:"Amatitlán"},
        {value:"Naranjos Amatlán",label:"Naranjos Amatlán"},
        {value:"Amatlán de los Reyes",label:"Amatlán de los Reyes"},
        {value:"Angel R. Cabada",label:"Angel R. Cabada"},
        {value:"La Antigua",label:"La Antigua"},
        {value:"Apazapan",label:"Apazapan"},
        {value:"Aquila",label:"Aquila"},
        {value:"Astacinga",label:"Astacinga"},
        {value:"Atlahuilco",label:"Atlahuilco"},
        {value:"Atoyac",label:"Atoyac"},
        {value:"Atzacan",label:"Atzacan"},
        {value:"Atzalan",label:"Atzalan"},
        {value:"Tlaltetela",label:"Tlaltetela"},
        {value:"Ayahualulco",label:"Ayahualulco"},
        {value:"Banderilla",label:"Banderilla"},
        {value:"Benito Juárez",label:"Benito Juárez"},
        {value:"Boca del Río",label:"Boca del Río"},
        {value:"Calcahualco",label:"Calcahualco"},
        {value:"Camerino Z. Mendoza",label:"Camerino Z. Mendoza"},
        {value:"Carrillo Puerto",label:"Carrillo Puerto"},
        {value:"Catemaco",label:"Catemaco"},
        {value:"Cazones de Herrera",label:"Cazones de Herrera"},
        {value:"Cerro Azul",label:"Cerro Azul"},
        {value:"Citlaltépetl",label:"Citlaltépetl"},
        {value:"Coacoatzintla",label:"Coacoatzintla"},
        {value:"Coahuitlán",label:"Coahuitlán"},
        {value:"Coatepec",label:"Coatepec"},
        {value:"Coatzacoalcos",label:"Coatzacoalcos"},
        {value:"Coatzintla",label:"Coatzintla"},
        {value:"Coetzala",label:"Coetzala"},
        {value:"Colipa",label:"Colipa"},
        {value:"Comapa",label:"Comapa"},
        {value:"Córdoba",label:"Córdoba"},
        {value:"Cosamaloapan de Carpio",label:"Cosamaloapan de Carpio"},
        {value:"Cosautlán de Carvajal",label:"Cosautlán de Carvajal"},
        {value:"Coscomatepec",label:"Coscomatepec"},
        {value:"Cosoleacaque",label:"Cosoleacaque"},
        {value:"Cotaxtla",label:"Cotaxtla"},
        {value:"Coxquihui",label:"Coxquihui"},
        {value:"Coyutla",label:"Coyutla"},
        {value:"Cuichapa",label:"Cuichapa"},
        {value:"Cuitláhuac",label:"Cuitláhuac"},
        {value:"Chacaltianguis",label:"Chacaltianguis"},
        {value:"Chalma",label:"Chalma"},
        {value:"Chiconamel",label:"Chiconamel"},
        {value:"Chiconquiaco",label:"Chiconquiaco"},
        {value:"Chicontepec",label:"Chicontepec"},
        {value:"Chinameca",label:"Chinameca"},
        {value:"Chinampa de Gorostiza",label:"Chinampa de Gorostiza"},
        {value:"Las Choapas",label:"Las Choapas"},
        {value:"Chocamán",label:"Chocamán"},
        {value:"Chontla",label:"Chontla"},
        {value:"Chumatlán",label:"Chumatlán"},
        {value:"Emiliano Zapata",label:"Emiliano Zapata"},
        {value:"Espinal",label:"Espinal"},
        {value:"Filomeno Mata",label:"Filomeno Mata"},
        {value:"Fortín",label:"Fortín"},
        {value:"Gutiérrez Zamora",label:"Gutiérrez Zamora"},
        {value:"Hidalgotitlán",label:"Hidalgotitlán"},
        {value:"Huatusco",label:"Huatusco"},
        {value:"Huayacocotla",label:"Huayacocotla"},
        {value:"Hueyapan de Ocampo",label:"Hueyapan de Ocampo"},
        {value:"Huiloapan de Cuauhtémoc",label:"Huiloapan de Cuauhtémoc"},
        {value:"Ignacio de la Llave",label:"Ignacio de la Llave"},
        {value:"Ilamatlán",label:"Ilamatlán"},
        {value:"Isla",label:"Isla"},
        {value:"Ixcatepec",label:"Ixcatepec"},
        {value:"Ixhuacán de los Reyes",label:"Ixhuacán de los Reyes"},
        {value:"Ixhuatlán del Café",label:"Ixhuatlán del Café"},
        {value:"Ixhuatlancillo",label:"Ixhuatlancillo"},
        {value:"Ixhuatlán del Sureste",label:"Ixhuatlán del Sureste"},
        {value:"Ixhuatlán de Madero",label:"Ixhuatlán de Madero"},
        {value:"Ixmatlahuacan",label:"Ixmatlahuacan"},
        {value:"Ixtaczoquitlán",label:"Ixtaczoquitlán"},
        {value:"Jalacingo",label:"Jalacingo"},
        {value:"Xalapa",label:"Xalapa"},
        {value:"Jalcomulco",label:"Jalcomulco"},
        {value:"Jáltipan",label:"Jáltipan"},
        {value:"Jamapa",label:"Jamapa"},
        {value:"Jesús Carranza",label:"Jesús Carranza"},
        {value:"Xico",label:"Xico"},
        {value:"Jilotepec",label:"Jilotepec"},
        {value:"Juan Rodríguez Clara",label:"Juan Rodríguez Clara"},
        {value:"Juchique de Ferrer",label:"Juchique de Ferrer"},
        {value:"Landero y Coss",label:"Landero y Coss"},
        {value:"Lerdo de Tejada",label:"Lerdo de Tejada"},
        {value:"Magdalena",label:"Magdalena"},
        {value:"Maltrata",label:"Maltrata"},
        {value:"Manlio Fabio Altamirano",label:"Manlio Fabio Altamirano"},
        {value:"Mariano Escobedo",label:"Mariano Escobedo"},
        {value:"Martínez de la Torre",label:"Martínez de la Torre"},
        {value:"Mecatlán",label:"Mecatlán"},
        {value:"Mecayapan",label:"Mecayapan"},
        {value:"Medellín",label:"Medellín"},
        {value:"Miahuatlán",label:"Miahuatlán"},
        {value:"Las Minas",label:"Las Minas"},
        {value:"Minatitlán",label:"Minatitlán"},
        {value:"Misantla",label:"Misantla"},
        {value:"Mixtla de Altamirano",label:"Mixtla de Altamirano"},
        {value:"Moloacán",label:"Moloacán"},
        {value:"Naolinco",label:"Naolinco"},
        {value:"Naranjal",label:"Naranjal"},
        {value:"Nautla",label:"Nautla"},
        {value:"Nogales",label:"Nogales"},
        {value:"Oluta",label:"Oluta"},
        {value:"Omealca",label:"Omealca"},
        {value:"Orizaba",label:"Orizaba"},
        {value:"Otatitlán",label:"Otatitlán"},
        {value:"Oteapan",label:"Oteapan"},
        {value:"Ozuluama de Mascareñas",label:"Ozuluama de Mascareñas"},
        {value:"Pajapan",label:"Pajapan"},
        {value:"Pánuco",label:"Pánuco"},
        {value:"Papantla",label:"Papantla"},
        {value:"Paso del Macho",label:"Paso del Macho"},
        {value:"Paso de Ovejas",label:"Paso de Ovejas"},
        {value:"La Perla",label:"La Perla"},
        {value:"Perote",label:"Perote"},
        {value:"Platón Sánchez",label:"Platón Sánchez"},
        {value:"Playa Vicente",label:"Playa Vicente"},
        {value:"Poza Rica de Hidalgo",label:"Poza Rica de Hidalgo"},
        {value:"Las Vigas de Ramírez",label:"Las Vigas de Ramírez"},
        {value:"Pueblo Viejo",label:"Pueblo Viejo"},
        {value:"Puente Nacional",label:"Puente Nacional"},
        {value:"Rafael Delgado",label:"Rafael Delgado"},
        {value:"Rafael Lucio",label:"Rafael Lucio"},
        {value:"Los Reyes",label:"Los Reyes"},
        {value:"Río Blanco",label:"Río Blanco"},
        {value:"Saltabarranca",label:"Saltabarranca"},
        {value:"San Andrés Tenejapan",label:"San Andrés Tenejapan"},
        {value:"San Andrés Tuxtla",label:"San Andrés Tuxtla"},
        {value:"San Juan Evangelista",label:"San Juan Evangelista"},
        {value:"Santiago Tuxtla",label:"Santiago Tuxtla"},
        {value:"Sayula de Alemán",label:"Sayula de Alemán"},
        {value:"Soconusco",label:"Soconusco"},
        {value:"Sochiapa",label:"Sochiapa"},
        {value:"Soledad Atzompa",label:"Soledad Atzompa"},
        {value:"Soledad de Doblado",label:"Soledad de Doblado"},
        {value:"Soteapan",label:"Soteapan"},
        {value:"Tamalín",label:"Tamalín"},
        {value:"Tamiahua",label:"Tamiahua"},
        {value:"Tampico Alto",label:"Tampico Alto"},
        {value:"Tancoco",label:"Tancoco"},
        {value:"Tantima",label:"Tantima"},
        {value:"Tantoyuca",label:"Tantoyuca"},
        {value:"Tatatila",label:"Tatatila"},
        {value:"Castillo de Teayo",label:"Castillo de Teayo"},
        {value:"Tecolutla",label:"Tecolutla"},
        {value:"Tehuipango",label:"Tehuipango"},
        {value:"Álamo Temapache",label:"Álamo Temapache"},
        {value:"Tempoal",label:"Tempoal"},
        {value:"Tenampa",label:"Tenampa"},
        {value:"Tenochtitlán",label:"Tenochtitlán"},
        {value:"Teocelo",label:"Teocelo"},
        {value:"Tepatlaxco",label:"Tepatlaxco"},
        {value:"Tepetlán",label:"Tepetlán"},
        {value:"Tepetzintla",label:"Tepetzintla"},
        {value:"Tequila",label:"Tequila"},
        {value:"José Azueta",label:"José Azueta"},
        {value:"Texcatepec",label:"Texcatepec"},
        {value:"Texhuacán",label:"Texhuacán"},
        {value:"Texistepec",label:"Texistepec"},
        {value:"Tezonapa",label:"Tezonapa"},
        {value:"Tierra Blanca",label:"Tierra Blanca"},
        {value:"Tihuatlán",label:"Tihuatlán"},
        {value:"Tlacojalpan",label:"Tlacojalpan"},
        {value:"Tlacolulan",label:"Tlacolulan"},
        {value:"Tlacotalpan",label:"Tlacotalpan"},
        {value:"Tlacotepec de Mejía",label:"Tlacotepec de Mejía"},
        {value:"Tlachichilco",label:"Tlachichilco"},
        {value:"Tlalixcoyan",label:"Tlalixcoyan"},
        {value:"Tlalnelhuayocan",label:"Tlalnelhuayocan"},
        {value:"Tlapacoyan",label:"Tlapacoyan"},
        {value:"Tlaquilpa",label:"Tlaquilpa"},
        {value:"Tlilapan",label:"Tlilapan"},
        {value:"Tomatlán",label:"Tomatlán"},
        {value:"Tonayán",label:"Tonayán"},
        {value:"Totutla",label:"Totutla"},
        {value:"Tuxpan",label:"Tuxpan"},
        {value:"Tuxtilla",label:"Tuxtilla"},
        {value:"Ursulo Galván",label:"Ursulo Galván"},
        {value:"Vega de Alatorre",label:"Vega de Alatorre"},
        {value:"Veracruz",label:"Veracruz"},
        {value:"Villa Aldama",label:"Villa Aldama"},
        {value:"Xoxocotla",label:"Xoxocotla"},
        {value:"Yanga",label:"Yanga"},
        {value:"Yecuatla",label:"Yecuatla"},
        {value:"Zacualpan",label:"Zacualpan"},
        {value:"Zaragoza",label:"Zaragoza"},
        {value:"Zentla",label:"Zentla"},
        {value:"Zongolica",label:"Zongolica"},
        {value:"Zontecomatlán de López y Fuentes",label:"Zontecomatlán de López y Fuentes"},
        {value:"Zozocolco de Hidalgo",label:"Zozocolco de Hidalgo"},
        {value:"Agua Dulce",label:"Agua Dulce"},
        {value:"El Higo",label:"El Higo"},
        {value:"Nanchital de Lázaro Cárdenas del Río",label:"Nanchital de Lázaro Cárdenas del Río"},
        {value:"Tres Valles",label:"Tres Valles"},
        {value:"Carlos A. Carrillo",label:"Carlos A. Carrillo"},
        {value:"Tatahuicapan de Juárez",label:"Tatahuicapan de Juárez"},
        {value:"Uxpanapa",label:"Uxpanapa"},
        {value:"San Rafael",label:"San Rafael"},
        {value:"Santiago Sochiapan",label:"Santiago Sochiapan"}
      ];
    }
    if($scope.slcStateProfile == "Yucatán")
    {
      $scope.slcCityProfileItems = [
        {value:"Abalá",label:"Abalá"},
        {value:"Acanceh",label:"Acanceh"},
        {value:"Akil",label:"Akil"},
        {value:"Baca",label:"Baca"},
        {value:"Bokobá",label:"Bokobá"},
        {value:"Buctzotz",label:"Buctzotz"},
        {value:"Cacalchén",label:"Cacalchén"},
        {value:"Calotmul",label:"Calotmul"},
        {value:"Cansahcab",label:"Cansahcab"},
        {value:"Cantamayec",label:"Cantamayec"},
        {value:"Celestún",label:"Celestún"},
        {value:"Cenotillo",label:"Cenotillo"},
        {value:"Conkal",label:"Conkal"},
        {value:"Cuncunul",label:"Cuncunul"},
        {value:"Cuzamá",label:"Cuzamá"},
        {value:"Chacsinkín",label:"Chacsinkín"},
        {value:"Chankom",label:"Chankom"},
        {value:"Chapab",label:"Chapab"},
        {value:"Chemax",label:"Chemax"},
        {value:"Chicxulub Pueblo",label:"Chicxulub Pueblo"},
        {value:"Chichimilá",label:"Chichimilá"},
        {value:"Chikindzonot",label:"Chikindzonot"},
        {value:"Chocholá",label:"Chocholá"},
        {value:"Chumayel",label:"Chumayel"},
        {value:"Dzán",label:"Dzán"},
        {value:"Dzemul",label:"Dzemul"},
        {value:"Dzidzantún",label:"Dzidzantún"},
        {value:"Dzilam de Bravo",label:"Dzilam de Bravo"},
        {value:"Dzilam González",label:"Dzilam González"},
        {value:"Dzitás",label:"Dzitás"},
        {value:"Dzoncauich",label:"Dzoncauich"},
        {value:"Espita",label:"Espita"},
        {value:"Halachó",label:"Halachó"},
        {value:"Hocabá",label:"Hocabá"},
        {value:"Hoctún",label:"Hoctún"},
        {value:"Homún",label:"Homún"},
        {value:"Huhí",label:"Huhí"},
        {value:"Hunucmá",label:"Hunucmá"},
        {value:"Ixil",label:"Ixil"},
        {value:"Izamal",label:"Izamal"},
        {value:"Kanasín",label:"Kanasín"},
        {value:"Kantunil",label:"Kantunil"},
        {value:"Kaua",label:"Kaua"},
        {value:"Kinchil",label:"Kinchil"},
        {value:"Kopomá",label:"Kopomá"},
        {value:"Mama",label:"Mama"},
        {value:"Maní",label:"Maní"},
        {value:"Maxcanú",label:"Maxcanú"},
        {value:"Mayapán",label:"Mayapán"},
        {value:"Mérida",label:"Mérida"},
        {value:"Mocochá",label:"Mocochá"},
        {value:"Motul",label:"Motul"},
        {value:"Muna",label:"Muna"},
        {value:"Muxupip",label:"Muxupip"},
        {value:"Opichén",label:"Opichén"},
        {value:"Oxkutzcab",label:"Oxkutzcab"},
        {value:"Panabá",label:"Panabá"},
        {value:"Peto",label:"Peto"},
        {value:"Progreso",label:"Progreso"},
        {value:"Quintana Roo",label:"Quintana Roo"},
        {value:"Río Lagartos",label:"Río Lagartos"},
        {value:"Sacalum",label:"Sacalum"},
        {value:"Samahil",label:"Samahil"},
        {value:"Sanahcat",label:"Sanahcat"},
        {value:"San Felipe",label:"San Felipe"},
        {value:"Santa Elena",label:"Santa Elena"},
        {value:"Seyé",label:"Seyé"},
        {value:"Sinanché",label:"Sinanché"},
        {value:"Sotuta",label:"Sotuta"},
        {value:"Sucilá",label:"Sucilá"},
        {value:"Sudzal",label:"Sudzal"},
        {value:"Suma",label:"Suma"},
        {value:"Tahdziú",label:"Tahdziú"},
        {value:"Tahmek",label:"Tahmek"},
        {value:"Teabo",label:"Teabo"},
        {value:"Tecoh",label:"Tecoh"},
        {value:"Tekal de Venegas",label:"Tekal de Venegas"},
        {value:"Tekantó",label:"Tekantó"},
        {value:"Tekax",label:"Tekax"},
        {value:"Tekit",label:"Tekit"},
        {value:"Tekom",label:"Tekom"},
        {value:"Telchac Pueblo",label:"Telchac Pueblo"},
        {value:"Telchac Puerto",label:"Telchac Puerto"},
        {value:"Temax",label:"Temax"},
        {value:"Temozón",label:"Temozón"},
        {value:"Tepakán",label:"Tepakán"},
        {value:"Tetiz",label:"Tetiz"},
        {value:"Teya",label:"Teya"},
        {value:"Ticul",label:"Ticul"},
        {value:"Timucuy",label:"Timucuy"},
        {value:"Tinum",label:"Tinum"},
        {value:"Tixcacalcupul",label:"Tixcacalcupul"},
        {value:"Tixkokob",label:"Tixkokob"},
        {value:"Tixmehuac",label:"Tixmehuac"},
        {value:"Tixpéhual",label:"Tixpéhual"},
        {value:"Tizimín",label:"Tizimín"},
        {value:"Tunkás",label:"Tunkás"},
        {value:"Tzucacab",label:"Tzucacab"},
        {value:"Uayma",label:"Uayma"},
        {value:"Ucú",label:"Ucú"},
        {value:"Umán",label:"Umán"},
        {value:"Valladolid",label:"Valladolid"},
        {value:"Xocchel",label:"Xocchel"},
        {value:"Yaxcabá",label:"Yaxcabá"},
        {value:"Yaxkukul",label:"Yaxkukul"},
        {value:"Yobaín",label:"Yobaín"}
      ];
    }
    if($scope.slcStateProfile == "Zacatecas")
    {
      $scope.slcCityProfileItems = [
        {value:"Apozol",label:"Apozol"},
        {value:"Apulco",label:"Apulco"},
        {value:"Atolinga",label:"Atolinga"},
        {value:"Benito Juárez",label:"Benito Juárez"},
        {value:"Calera",label:"Calera"},
        {value:"Cañitas de Felipe Pescador",label:"Cañitas de Felipe Pescador"},
        {value:"Concepción del Oro",label:"Concepción del Oro"},
        {value:"Cuauhtémoc",label:"Cuauhtémoc"},
        {value:"Chalchihuites",label:"Chalchihuites"},
        {value:"Fresnillo",label:"Fresnillo"},
        {value:"Trinidad García de la Cadena",label:"Trinidad García de la Cadena"},
        {value:"Genaro Codina",label:"Genaro Codina"},
        {value:"General Enrique Estrada",label:"General Enrique Estrada"},
        {value:"General Francisco R. Murguía",label:"General Francisco R. Murguía"},
        {value:"El Plateado de Joaquín Amaro",label:"El Plateado de Joaquín Amaro"},
        {value:"General Pánfilo Natera",label:"General Pánfilo Natera"},
        {value:"Guadalupe",label:"Guadalupe"},
        {value:"Huanusco",label:"Huanusco"},
        {value:"Jalpa",label:"Jalpa"},
        {value:"Jerez",label:"Jerez"},
        {value:"Jiménez del Teul",label:"Jiménez del Teul"},
        {value:"Juan Aldama",label:"Juan Aldama"},
        {value:"Juchipila",label:"Juchipila"},
        {value:"Loreto",label:"Loreto"},
        {value:"Luis Moya",label:"Luis Moya"},
        {value:"Mazapil",label:"Mazapil"},
        {value:"Melchor Ocampo",label:"Melchor Ocampo"},
        {value:"Mezquital del Oro",label:"Mezquital del Oro"},
        {value:"Miguel Auza",label:"Miguel Auza"},
        {value:"Momax",label:"Momax"},
        {value:"Monte Escobedo",label:"Monte Escobedo"},
        {value:"Morelos",label:"Morelos"},
        {value:"Moyahua de Estrada",label:"Moyahua de Estrada"},
        {value:"Nochistlán de Mejía",label:"Nochistlán de Mejía"},
        {value:"Noria de Ángeles",label:"Noria de Ángeles"},
        {value:"Ojocaliente",label:"Ojocaliente"},
        {value:"Pánuco",label:"Pánuco"},
        {value:"Pinos",label:"Pinos"},
        {value:"Río Grande",label:"Río Grande"},
        {value:"Sain Alto",label:"Sain Alto"},
        {value:"El Salvador",label:"El Salvador"},
        {value:"Sombrerete",label:"Sombrerete"},
        {value:"Susticacán",label:"Susticacán"},
        {value:"Tabasco",label:"Tabasco"},
        {value:"Tepechitlán",label:"Tepechitlán"},
        {value:"Tepetongo",label:"Tepetongo"},
        {value:"Teúl de González Ortega",label:"Teúl de González Ortega"},
        {value:"Tlaltenango de Sánchez Román",label:"Tlaltenango de Sánchez Román"},
        {value:"Valparaíso",label:"Valparaíso"},
        {value:"Vetagrande",label:"Vetagrande"},
        {value:"Villa de Cos",label:"Villa de Cos"},
        {value:"Villa García",label:"Villa García"},
        {value:"Villa González Ortega",label:"Villa González Ortega"},
        {value:"Villa Hidalgo",label:"Villa Hidalgo"},
        {value:"Villanueva",label:"Villanueva"},
        {value:"Zacatecas",label:"Zacatecas"},
        {value:"Trancoso",label:"Trancoso"},
        {value:"Santa María de la Paz",label:"Santa María de la Paz"}

      ];
    }
  }// fin changecity function


  $scope.slcStateProfileItems = [
    {value:"Aguascalientes",label:"Aguascalientes"},
    {value:"Baja California",label:"Baja California"},
    {value:"Baja California Sur",label:"Baja California Sur"},
    {value:"Campeche",label:"Campeche"},
    {value:"Chiapas",label:"Chiapas"},
    {value:"Chihuahua",label:"Chihuahua"},
    {value:"Coahuila",label:"Coahuila"},
    {value:"Colima",label:"Colima"},
    {value:"CDMX",label:"CDMX"},
    {value:"Durango",label:"Durango"},
    {value:"Guanajuato",label:"Guanajuato"},
    {value:"Guerrero",label:"Guerrero"},
    {value:"Hidalgo",label:"Hidalgo"},
    {value:"Jalisco",label:"Jalisco"},
    {value:"Michoacán",label:"Michoacán"},
    {value:"Morelos",label:"Morelos"},
    {value:"Estado de México",label:"Estado de México"},
    {value:"Nayarit",label:"Nayarit"},
    {value:"Nuevo León",label:"Nuevo León"},
    {value:"Oaxaca",label:"Oaxaca"},
    {value:"Puebla",label:"Puebla"},
    {value:"Querétaro",label:"Querétaro"},
    {value:"Quintana Roo",label:"Quintana Roo"},
    {value:"San Luis Potosí",label:"San Luis Potosí"},
    {value:"Sinaloa",label:"Sinaloa"},
    {value:"Sonora",label:"Sonora"},
    {value:"Tabasco",label:"Tabasco"},
    {value:"Tamaulipas",label:"Tamaulipas"},
    {value:"Tlaxcala",label:"Tlaxcala"},
    {value:"Veracruz",label:"Veracruz"},
    {value:"Yucatán",label:"Yucatán"},
    {value:"Zacatecas",label:"Zacatecas"}
  ];


  $scope.checkemailprofile = function(){

    $scope.formatinvalid = false;
    $scope.emailprofilenotavailable = false;
    $scope.emailavailable = false;



    if(($scope.iptEmailProfile != $scope.originalmail) && ($scope.iptEmailProfile != ""))
    {
      if(!expreg.test($scope.iptEmailProfile))
      {
          $scope.formatinvalid = true;
          return false;
      }
      else
      {
            $http.get("/availableemail/"+$scope.iptEmailProfile).then(function(responsesuc){
              var result = angular.fromJson(responsesuc.data);
              if(result.error != 1)
              {
                  if(result.error == 2) /* Si llega 2 es que si encontro el username en la base de datos*/
                  {
                      $scope.emailprofilenotavailable = true;
                      return false;
                  }
                  else
                  {
                     $scope.emailtosend = $scope.iptEmailProfile;
                     $scope.emailavailable = true;
                  }
              }
              else {
                alert("Error: "+result.message);
                return false;
              }
            },function(response){
              alert(response.statusText);
              return false;
            });
      }// fin else expreg
    }
    else
    {
      $scope.emailtosend = "";
    }
  }// fin checkemailprofile


  $scope.checkusername = function(){

    $scope.usernamenotavailable = false;
    $scope.usernameavailable = false;

        if($scope.originalusername != $scope.iptUserName)
        {
              $http.get("/availableusername/"+$scope.iptUserName).then(function(responsesuc){
                var result = angular.fromJson(responsesuc.data);
                if(result.error != 1)
                {
                    if(result.error == 2) /* Si llega 2 es que si encontro el username en la base de datos*/
                    {
                        $scope.usernamenotavailable = true;
                        return false;
                    }
                    else
                    {
                       $scope.usernameavailable = true;
                       $scope.usernametosend = $scope.iptUserName;
                    }
                }
                else {
                  alert("Error: "+result.message);
                  return false;
                }
              },function(response){
                alert(response.statusText);
                return false;
              });
        }
        else
        {
          $scope.usernametosend = "";
        }
  }

  $scope.saveProfile = function(imgProfile){

    if($scope.emailprofilenotavailable == true || $scope.usernamenotavailable == true || $scope.formatinvalid == true)
    {
        alert("Por favor elija un nombre de usuario y/o correo electrónico únicos para continuar");
        return false;
    }

    $scope.usernamenotavailable = false;
    $scope.usernameavailable = false;
    $scope.formatinvalid = false;
    $scope.emailprofilenotavailable = false;
    $scope.emailavailable = false;


    if(imgProfile != undefined)
    {
              imgProfile.upload = Upload.upload({
                method: 'PUT',
                url: '/appv2/uploadImage',
                file: imgProfile,
                data: {name: $scope.iptName,
                       username: $scope.usernametosend,
                       gender: $scope.slcGender,
                       state: $scope.slcStateProfile,
                       city: $scope.slcCityProfile,
                       birthdate: document.getElementById('iptBirthDate').value,
                       email: $scope.emailtosend,
                       twitter: $scope.iptTwitterUser,
                       facebook: $scope.iptFacebookUser,
                       instagram: $scope.iptInstagramUser,
                       linkedin: $scope.iptLinkedinUser,
                       webpage: $scope.iptWebPageUser}
              });
              imgProfile.upload.then(function (response) {

                var result = angular.fromJson(response.data);
                if(result.error==0)
                {
                    var userdatalocal = JSON.parse(localStorage.getItem("UserData"));
                    userdatalocal.name = $scope.iptName;
                    if($scope.usernametosend != "")
                    {
                      userdatalocal.username = $scope.usernametosend;
                      $scope.originalusername = $scope.usernametosend;
                    }
                    else
                    {
                      $scope.iptUserName = userdatalocal.username;
                    }
                    userdatalocal.gender = $scope.slcGender;
                    userdatalocal.state = $scope.slcStateProfile;
                    userdatalocal.city = $scope.slcCityProfile;
                    userdatalocal.dateBirth = document.getElementById('iptBirthDate').value;
                    if($scope.emailtosend != "")
                    {
                      userdatalocal.mail = $scope.emailtosend;
                      $scope.originalmail = $scope.emailtosend;
                    }
                    else
                    {
                      $scope.iptEmailProfile = userdatalocal.mail;
                    }
                    userdatalocal.twitteruser = $scope.iptTwitterUser;
                    userdatalocal.facebookurl = $scope.iptFacebookUser;
                    userdatalocal.instagramurl = $scope.iptInstagramUser;
                    userdatalocal.linkedinurl = $scope.iptLinkedinUser;
                    userdatalocal.webpage = $scope.iptWebPageUser;
                    if(result.message != "")
                    {
                       userdatalocal.profileImage = result.message;
                       $scope.fileImage = userdatalocal.folderImg+"/profile/"+result.message;
                    }
                    $scope.emailtosend = "";
                    $scope.usernametosend = "";
                    $scope.imgProfile = "";
                    localStorage.setItem("UserData",JSON.stringify(userdatalocal));
                    alert("La información del perfil se ha guardado con éxito");
                }
                else
                {
                   alert(result.message);
                }
                 $timeout(function(){
                 });
              },
              function (response) {
                     if (response.status > 0)
                     {
                         alert("Error al editar el perfil: "+response.toSource());
                         return false;
                     }
                   }, function (evt) {
                //Para agregar una barra de progreso
                //imgProfile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
             });
    }
    else
    {

            var profiledata = {
              "name": $scope.iptName,
              "username": $scope.usernametosend,
              "gender": $scope.slcGender,
              "state": $scope.slcStateProfile,
              "city": $scope.slcCityProfile,
              "birthdate": document.getElementById('iptBirthDate').value,
              "email": $scope.emailtosend,
              "twitter": $scope.iptTwitterUser,
              "facebook": $scope.iptFacebookUser,
              "instagram": $scope.iptInstagramUser,
              "linkedin": $scope.iptLinkedinUser,
              "webpage": $scope.iptWebPageUser
            };

            $http.put("/appv2/uploadImage",profiledata).then(function(responsesuc){
                var result = angular.fromJson(responsesuc.data);
                if(result.error == 0)
                {

                  var userdatalocal = JSON.parse(localStorage.getItem("UserData"));
                  console.log(document.getElementById('iptBirthDate').value);
                  userdatalocal.name = $scope.iptName;
                  if($scope.usernametosend != "")
                  {
                    userdatalocal.username = $scope.usernametosend;
                    $scope.originalusername = $scope.usernametosend;
                  }
                  else
                  {
                    $scope.iptUserName = userdatalocal.username;
                  }
                  userdatalocal.gender = $scope.slcGender;
                  userdatalocal.state = $scope.slcStateProfile;
                  userdatalocal.city = $scope.slcCityProfile;
                  userdatalocal.dateBirth = document.getElementById('iptBirthDate').value;
                  if($scope.emailtosend != "")
                  {
                    userdatalocal.mail = $scope.emailtosend;
                    $scope.originalmail = $scope.emailtosend;
                  }
                  else
                  {
                    $scope.iptEmailProfile = userdatalocal.mail;
                  }
                  userdatalocal.twitteruser = $scope.iptTwitterUser;
                  userdatalocal.facebookurl = $scope.iptFacebookUser;
                  userdatalocal.instagramurl = $scope.iptInstagramUser;
                  userdatalocal.linkedinurl = $scope.iptLinkedinUser;
                  userdatalocal.webpage = $scope.iptWebPageUser;
                  if(result.message != "")
                  {
                     userdatalocal.profileImage = result.message;
                     $scope.fileImage = userdatalocal.folderImg+"/profile/"+result.message;
                  }
                  $scope.emailtosend = "";
                  $scope.usernametosend = "";
                  localStorage.setItem("UserData",JSON.stringify(userdatalocal));
                  alert("La información del perfil se ha guardado con éxito");
                }
                else {
                  alert(result.message);
                }

                },function(response){
                  alert("Error: "+response.statusText);
            });
    }// fin if(imgProfile != undefined)

  }// FIN saveprofile function



  $scope.loadDataUser = function(){
    var userdatalocal = JSON.parse(localStorage.getItem("UserData"));
    if(userdatalocal == undefined || userdatalocal == null)
    {
          $http.post("/appv2/getEmergencyData").then(function(responsesuc){
            var result = angular.fromJson(responsesuc.data);
            if(result.error == 0)
            {
              localStorage.setItem("UserData",JSON.stringify(result.userjson));
              localStorage.setItem("BusinessData",JSON.stringify(result.databusinessServer));
              userdatalocal = JSON.parse(localStorage.getItem("BusinessData"));
            }
            else {
              alert("Error al cargar los datos. Se regresará al login de la aplicación");
              localStorage.clear();
              window.location.href="/appv2/signout";
            }

          },function(response){
              alert("Error: "+response.statusText);
              localStorage.clear();
              window.location.href="/appv2/signout";
          });
    }
    var getDateBirth = userdatalocal.dateBirth.split("T");
    var getFinalBirth = getDateBirth[0].split("-");
    $scope.iptBirthDate = getFinalBirth[2]+"/"+getFinalBirth[1]+"/"+getFinalBirth[0];
    $scope.iptName = userdatalocal.name;
    $scope.iptUserName = userdatalocal.username;
    $scope.slcGender = userdatalocal.gender;
    $scope.slcStateProfile = userdatalocal.state;
    $scope.changecity();
    $scope.slcCityProfile = userdatalocal.city;
    $scope.iptEmailProfile = userdatalocal.mail;
    $scope.iptTwitterUser = userdatalocal.twitteruser;
    $scope.iptFacebookUser = userdatalocal.facebookurl;
    $scope.iptInstagramUser = userdatalocal.instagramurl;
    $scope.iptLinkedinUser = userdatalocal.linkedinurl;
    $scope.iptWebPageUser = userdatalocal.webpage;
    $scope.originalmail = userdatalocal.mail;
    $scope.originalusername = userdatalocal.username;
    $scope.fileImage = (userdatalocal.profileImage != "" && userdatalocal.profileImage != undefined) ? userdatalocal.folderImg+"/profile/"+userdatalocal.profileImage : "system/User.png";
    $scope.folderImgUser = userdatalocal.folderImg;

  }  // fin loadDataUser
  
});// fin app controller editProfileController


//CONTROLLER EDIT BUSINESS USER
app.controller("editBusinessController",function($scope,$localStorage,$http){

    $scope.dataBusinessUser = [];
    $scope.iptNeighborhood = [];
    $scope.iptPhoneNumberBusiness = [];
    $scope.iptStreet = [];
    $scope.iptNumber = [];
    $scope.iptCity = [];
    $scope.iptState = [];
    $scope.iptCountry = [];
    $scope.idbusiness = [];
    $scope.iptAditional = [];
    $scope.iptCellPhone = [];
    $scope.slcDynamicBusiness = [];
    $scope.limitbusiness = "";
    $scope.businesstypeselect = [];
    $scope.iptEmailBusiness = [];
    $scope.iptTwitter = [];
    $scope.iptInstagram = [];
    $scope.iptFacebook = [];
    $scope.iptWebpage = [];
    $scope.iptEmailBusiness = [];
    $scope.iptNameBuss = [];
    $scope.disabledfield = [];

    $scope.loadBusinessUser = function(){

      $scope.dataBusinessUser = [];

      var businessdatalocal = JSON.parse(localStorage.getItem("BusinessData"));
      if(businessdatalocal == undefined || businessdatalocal == null)
      {
            $http.post("/appv2/getEmergencyData").then(function(responsesuc){
              var result = angular.fromJson(responsesuc.data);
              if(result.error == 0)
              {
                localStorage.setItem("UserData",JSON.stringify(result.userjson));
                localStorage.setItem("BusinessData",JSON.stringify(result.databusinessServer));
                businessdatalocal = JSON.parse(localStorage.getItem("BusinessData"));
              }
              else {
                alert("Error al cargar los datos. Se regresará al login de la aplicación");
                localStorage.clear();
                window.location.href="/appv2/signout";
              }

            },function(response){
                alert("Error: "+response.statusText);
                localStorage.clear();
                window.location.href="/appv2/signout";
            });
      }

      $scope.dataBusinessUser = businessdatalocal;
      $scope.limitbusiness = businessdatalocal.length;
      for(var i=0; i<$scope.limitbusiness;i++)
      {
          $scope.idbusiness[i] = businessdatalocal[i]._id;
          $scope.iptNameBuss[i] = businessdatalocal[i].name;
          $scope.iptStreet[i] = (businessdatalocal[i].address.street != undefined ? businessdatalocal[i].address.street : "");
          $scope.iptNumber[i] = (businessdatalocal[i].address.number != undefined ? businessdatalocal[i].address.number : "");
          $scope.iptAditional[i] = (businessdatalocal[i].address.aditional != undefined ? businessdatalocal[i].address.aditional : "");
          $scope.iptNeighborhood[i] = (businessdatalocal[i].address.neighborhood != undefined ? businessdatalocal[i].address.neighborhood : "");
          $scope.iptCity[i] = (businessdatalocal[i].address.city != undefined ? businessdatalocal[i].address.city : "");
          $scope.iptState[i] = (businessdatalocal[i].address.state != undefined ? businessdatalocal[i].address.state : "");
          $scope.iptCountry[i] = (businessdatalocal[i].address.country != undefined ? businessdatalocal[i].address.country : "" );
          $scope.iptCellPhone[i] = (businessdatalocal[i].telephone.cellphone != undefined ? businessdatalocal[i].telephone.cellphone : "" );
          $scope.iptPhoneNumberBusiness[i] = (businessdatalocal[i].telephone.number != undefined ? businessdatalocal[i].telephone.number : "");
          $scope.businesstypeselect[i] = (businessdatalocal[i].businessType != undefined ? businessdatalocal[i].businessType : "");
          $scope.slcDynamicBusiness[i] = (businessdatalocal[i].businessdynamic != undefined ? businessdatalocal[i].businessdynamic : "");
          if(businessdatalocal[i].name == "Freelance")
          {
            //Aqui se van a cargar el correo y las redes sociales de la parte del usuario, entonces tengo que cargar el usuario para cargar estos datos.
            $scope.disabledfield[i] = true;
          }
          else
          {
            $scope.disabledfield[i] = false;
            $scope.iptEmailBusiness[i] = (businessdatalocal[i].emailbusiness != undefined ? businessdatalocal[i].emailbusiness : "");
            $scope.iptTwitter[i] = (businessdatalocal[i].twitterbusiness != undefined ? businessdatalocal[i].twitterbusiness : "");
            $scope.iptInstagram[i] = (businessdatalocal[i].instagramurl != undefined ? businessdatalocal[i].instagramurl : "");
            $scope.iptFacebook[i] = (businessdatalocal[i].facebookurl != undefined ? businessdatalocal[i].facebookurl : "");
            $scope.iptWebpage[i] = (businessdatalocal[i].webpage != undefined ? businessdatalocal[i].webpage : "");
          }
      }
    }; // fin loadBusinessUser

    $scope.saveBusiness =  function(){

      var objectbusiness = '';
      var objectsend = [];
      for(var i=0;i<$scope.limitbusiness;i++)
      {
        objectbusiness = {
          "idbusiness": $scope.idbusiness[i],
          "street": $scope.iptStreet[i],
          "number": $scope.iptNumber[i],
          "aditional": $scope.iptAditional[i],
          "neighborhood": $scope.iptNeighborhood[i],
          "city": $scope.iptCity[i],
          "state": $scope.iptState[i],
          "country": $scope.iptCountry[i],
          "cellphone": $scope.iptCellPhone[i],
          "phone": $scope.iptPhoneNumberBusiness[i],
          "businesstype": $scope.businesstypeselect[i],
          "businessdynamic": $scope.slcDynamicBusiness[i],
          "emailbusiness": $scope.iptEmailBusiness[i],
          "twitter": $scope.iptTwitter[i],
          "instagram": $scope.iptInstagram[i],
          "facebook": $scope.iptFacebook[i],
          "webpage": $scope.iptWebpage[i],
          "businessname": $scope.iptNameBuss[i]
        }
        objectsend.push(objectbusiness);


      }
        $http.put("/appv2/editBusiness",objectsend).then(function(responsesuc){
          var result = angular.fromJson(responsesuc.data);
          if(result.error == 0)
          {
            var businessdatalocal = JSON.parse(localStorage.getItem("BusinessData"));
            for(var j=0;j<businessdatalocal.length;j++)
            {
                businessdatalocal[j]._id = $scope.idbusiness[j];
                businessdatalocal[j].address.street = $scope.iptStreet[j];
                businessdatalocal[j].address.number = $scope.iptNumber[j];
                businessdatalocal[j].address.aditional = $scope.iptAditional[j];
                businessdatalocal[j].address.neighborhood = $scope.iptNeighborhood[j];
                businessdatalocal[j].address.city = $scope.iptCity[j];
                businessdatalocal[j].address.state = $scope.iptState[j];
                businessdatalocal[j].address.country = $scope.iptCountry[j];
                businessdatalocal[j].telephone.cellphone = $scope.iptCellPhone[j];
                businessdatalocal[j].telephone.number = $scope.iptPhoneNumberBusiness[j];
                businessdatalocal[j].businessType = $scope.businesstypeselect[j];
                businessdatalocal[j].businessdynamic = $scope.slcDynamicBusiness[j];
                businessdatalocal[j].emailbusiness = $scope.iptEmailBusiness[j];
                businessdatalocal[j].twitterbusiness = $scope.iptTwitter[j];
                businessdatalocal[j].instagramurl = $scope.iptInstagram[j];
                businessdatalocal[j].facebookurl = $scope.iptFacebook[j];
                businessdatalocal[j].webpage = $scope.iptWebpage[j];
                businessdatalocal[j].name = $scope.iptNameBuss[j];
            }
            localStorage.setItem("BusinessData",JSON.stringify(businessdatalocal));
            alert("El negocio se ha modificado con éxito");
          }
          else
          {
            alert("Hubo un error al modificar el negocio: "+result.message);
          }

        },function(response){

            alert("Error: "+response.statusText);
        });// fin ajax editbusiness
    };// fin funcion saveBusiness

    $scope.addBusiness = function(){

      alert("Esta funcionalidad no esta disponible por el momento. Espere a recibir la invitación para poder activarla.");


    }
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
