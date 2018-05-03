    var users = require("./models/users").users;
var business = require("./models/businesses").business;
var express = require("express");
var bcrypt = require('bcrypt-nodejs');
var multer = require('multer');
var upload = multer({dest: './public/img/profile'});
var multiparty = require('connect-multiparty');
var multipartymiddleware = multiparty();
var FileUploadController = require('./public/js/FileUploadController');
var winston = require('winston');
var mongoose = require('mongoose');
var thumb = require('node-thumbnail').thumb;
var fs = require('fs');
var randomstring = require("randomstring");
var router = express.Router();

var datelog = new Date();
var monthlog = datelog.getMonth() + 1;
var finaldate = datelog.getDate()+(monthlog < 10 ? '0'+monthlog : monthlog)+datelog.getFullYear();


var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      filename: "logs/log"+finaldate+".log",
      json:  false,
      formatter: function(options) {
        var datadate = new Date();
        var month = new Array();
        month[0] = "Enero";
        month[1] = "Febrero";
        month[2] = "Marzo";
        month[3] = "Abril";
        month[4] = "Mayo";
        month[5] = "Junio";
        month[6] = "Julio";
        month[7] = "Agosto";
        month[8] = "Septiembre";
        month[9] = "Octubre";
        month[10] = "Noviembre";
        month[11] = "Diciembre";

          return '[ '+(datadate.getDate() < 10 ? '0'+datadate.getDate() : datadate.getDate())+'-'+month[datadate.getMonth()]+'-'+datadate.getFullYear()+'  '+(datadate.getHours() < 10 ? '0'+datadate.getHours(): datadate.getHours())+':'+(datadate.getMinutes() < 10 ? '0'+datadate.getMinutes() : datadate.getMinutes())+':'+(datadate.getSeconds() < 10 ? '0'+datadate.getSeconds(): datadate.getSeconds())+' ] '+ (options.message ? options.message : '');

      }
    })
  ]
});

router.get("/services",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 GET "/services"');
  response.render("appv2/settings/board/xl");
});

router.get("/account",function(request,response){
  logger.info('------------------------------------------------------');
  logger.info('M001 GET "/account"');
  response.render("appv2/settings/account/xl");

});

router.get("/", function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 GET "/ principal"');
  response.render("appv2");
});

router.get("/tstVw", function(request,response){
  //response.render("appv2/settings/profile/xl");
  //response.render('/settings/profile/xl');
});

router.get("/signout",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 GET "/signout"');
  request.session = null;
  response.redirect('/');
});


router.get("/profile",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 GET "/profile"');
  //response.render("app/editprofile");
  response.render("appv2/settings/profile/xl");
});


router.get("/business",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 GET "/business"');
  response.render("appv2/settings/business/xl");
});


router.put("/uploadImage",multipartymiddleware,FileUploadController.uploadFile);

router.put("/editBusiness",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 PUT "/editBusiness"');

  var negocios = request.body;
  negocios.forEach(function(element)
  {
      try{
          business.findOne({_id:element.idbusiness},function(err,data){
            if(!err)
            {
              if(data)
              {
                data.name = (element.businessname != undefined) ? element.businessname : "";
                data.businessType = element.businesstype;
                data.telephone.number = (element.phone != undefined) ? element.phone : "";
                data.telephone.cellphone = (element.cellphone != undefined) ? element.cellphone : "";
                data.address.street = (element.street != undefined) ? element.street : "";
                data.address.number = (element.number != undefined) ? element.number : "";
                data.address.aditional = (element.aditional != undefined) ? element.aditional : "";
                data.address.city = (element.city != undefined) ? element.city : "";
                data.address.state = (element.state != undefined) ? element.state : "";
                data.address.country = (element.country != undefined) ? element.country : "";
                data.emailbusiness = (element.emailbusiness != undefined) ? element.emailbusiness : "";
                data.twitterbusiness = (element.twitter != undefined) ? element.twitter : "";
                data.instagramurl = (element.instagram != undefined) ? element.instagram : "";
                data.facebookurl = (element.facebook != undefined) ? element.facebook : "";
                data.webpage = (element.webpage != undefined) ? element.webpage : "";
                data.businessdynamic = (element.businessdynamic != undefined) ? element.businessdynamic : "";
                data.address.neighborhood = (element.neighborhood != undefined) ? element.neighborhood : "";
                data.save(function(err){
                    if(err)
                    {
                        logger.info('Error: '+err);
                        response.send('{"error":1,"message":"Error al guardar el negocio"}');
                    }
                });
              }
              else
              {
                logger.info('Error: There is not business in the query');
                response.send('{"error":1,"message":"No se encontro ningun negocio."}');
              }
            }
            else
            {
                logger.info('Error: '+err);
                response.send('{"error":1,"message":"'+err+'"}');
            }
          });
        }
        catch(e)
        {
          logger.info('Error 666: '+e);
          response.send('{"error":1,"message":"Error al guardar el negocio"}');
        }
   }); // fin for
   response.send('{"error":0,"message":""}');


});

router.post("/addService",multipartymiddleware,function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - POST "/addService"');
  try{
    var folderImg = '';
    users.findOne({_id: request.session.user_id},function(err,datauser){
        if(!err)
        {
          if(data)
          {
              folderImg = data["folderImg"];
          }
          else
          {
              logger.info('Error: No hay datos del usuario');
              response.send('{"error":1,"message":"Error al agregar el servicio"}');
          }
        }
        else
        {
            logger.info('Error: '+err);
            response.send('{"error":1,"message":"Error al agregar el servicio"}');
        }
    });


      if(request.files != undefined)
      {
          var files = [];
          var imageextension = [];
          var imagename = [];
          for(var i=0;i<request.files.file.length;i++)
          {
            //var imageextension[i] = request.files.file[i].name.split(".").pop();
            //var imagename[i] = randomstring.generate(36);
            logger.info('Nombre de imagen: '+imagename[i]+imageextension[i]);
            files[i] = request.files.file[i];
            fs.readFile(request.files.file[i].path, function (err, data) {
              if(err)
                logger.info('Error: '+err);

              file[i].path = "/wamp/www/PhesteeProject/public/img/"+folderImg+"/Services/"+imagename[i]+"."+imageextension[i];
               fs.writeFile(file[i].path, data, function (err) {
                if (err) {
                  logger.info('Error: '+err);
                  response.send('{"error":1,"message":"'+err+'"}');
                }

                thumb({
                        source:  "/wamp/www/PhesteeProject/public/img/"+folderImg+"/Services/"+imagename[i]+"."+imageextension[i], // could be a filename: dest/path/image.jpg
                        destination:  "/wamp/www/PhesteeProject/public/img/"+folderImg+"/Services/thumbnailsmall/",
                        width: 100,
                        concurrency: 4
                      }, function(files, err, stdout, stderr) {
                            if(!err)
                              logger.info('Thumbsmall was created successfully');
                            else
                              logger.info('Error: '+err);

                }); // fin thumb
              }); // fin writeFile
            }); // fin readfile
          } // fin ciclo for
      }// fin if(request.files...)

      // Despues guardar el nombre de la imagen en la base de datos y tambien guardar los thumb en la base y ver si cumplen con la condicion, una vez hecho esto hacer la edicion para editar que va a estar medio dificil, tambien ver si guardar
      // el nombre del folder en una variable de session para ahorrarme la consulta al codigo para llamar la coleccion del usuario.
      logger.info('idbusiness: '+request.body.idbusiness);
      var homeserviceValue = (request.body.typeservice == 'homeservice' ? true : false);
      var isMovilOfferingValue = (request.body.typeservice == 'isMovilOffering' ? true : false);
      business.update({_id: request.body.idbusiness},{$push: {services: {_id: new mongoose.Types.ObjectId,type: request.body.serviceproduct,name: request.body.nameserviceprod,cost: request.body.costservprod,description: request.body.description,homeservice: homeserviceValue,isMovilOffering: isMovilOfferingValue, hshtgs:request.body.hashtags}}},function(err,data){
        if(!err)
        {
            if(data)
            {
                if(request.files != undefined)
                {
                    //Primero hacer la consulta en robot 3t y luego pasa la consulta para aca.
                }
                else
                {
                  logger.info("El servicio se subió con éxito. El usuario no subió archivos.");
                  response.send('{"error":0,"message":""}');
                }
            }
            else
            {
                logger.info("Error: No hay nada en los datos del update");
                reponse.send('{"error":1,"message":"Error al agregar el servicio"}');
            }
        }
        else
        {
          logger.info('Error: '+err);
          response.send('{"error":1,"message":"Error al tratar de agregar el nuevo servicio"}');
        }
      });
  }
  catch(e)
  {
    logger.info("Error 666: "+e);
  };
});

router.post("/addServiceTest",multipartymiddleware,function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - PUT "/editServiceTest"');
  var file = [];
    if(request.files != undefined)
    {
      for(var i=0;i<request.files.file.length;i++)
      {
      }
      /*logger.info("Path: "+JSON.stringify(request.files));
      var file = request.files.file;
      fs.readFile(request.files.file.path, function (err, data) {
        if(err)
        {
          logger.info('Error_ '+err);
          reponse.send('{"error":1,"message":"Hubo un error al leer la imagen"}');
        }
        logger.info('Este es el JSON de files: '+JSON.stringify(file));
        response.send('{"error":0,"message":""}');
      });*/

      response.send('{"error":0,"message":""}');
    }
    else
    {
        response.send('{"error":1,"message":"No llego ningun archivo"}');
    }
});

router.put("/editService",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - PUT "/editService"');
  var homeserviceValueUp = (request.body.typeservice == 'homeservice' ? true : false);
  var isMovilOfferingValueUp = (request.body.typeservice == 'isMovilOffering' ? true : false);
  try{
    business.findOne({_id: request.body.idbusiness},function(err,data){
      if(!err)
      {
        if(data)
        {
          for(var x = 0;x<data.services.length;x++)
          {
            var dataservice = JSON.stringify(data.services[x]._id);
            var requestidser = JSON.stringify(request.body.idservicebuss);
            if(dataservice == requestidser)
            {
              data.services[x].type = request.body.prodserv;
              data.services[x].name = request.body.nameservice;
              data.services[x].cost = request.body.costservprod;
              data.services[x].description = request.body.description;
              data.services[x].isMovilOffering = isMovilOfferingValueUp;
              data.services[x].homeservice = homeserviceValueUp;
              data.services[x].hshtgs = request.body.hashtags;
              data.save(function(err){
                if(!err)
                {
                    logger.info('Se modificaron los datos con éxito');
                    response.send('{"error":0,"message":""}');
                }
                else
                {
                    logger.info('Error: '+err);
                    response.send('{"error":1,"message":"Error al modificar el servicio"}');
                }
              });
              break;
            }
          }

        }
        else
        {
          logger.info('No hay datos en la consulta del negocio.');
          reponse.send('{"error":1,"message":"Error al modificar el servicio"}');
        }

      }
      else
      {
        logger.info('Error: '+err);
        response.send('{"error":1,"message":"Error al modificar el servicio"}');
      }

    });
  }
  catch(e){
    logger.info('Error 666: '+e);
  };
});

router.delete("/deleteService/:iddeleteservice",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - DELETE "/deleteService"');
  try
  {
      if(request.params.iddeleteservice != '' && request.params.iddeleteservice != undefined)
      {
          logger.info('idservice: '+request.params.iddeleteservice);
          business.update({},{$pull:{services: {_id: request.params.iddeleteservice}}},{multi: true},function(err,data){
          if(!err)
          {
              logger.info('El servicio se eliminó con exito');
              response.send('{"error":0,"message":""}');
          }
          else
          {
              logger.info('Error: '+err);
              response.send('{"error":1,"message":"Error al eliminar un servicio"}')
          }
        });
      }
      else
      {
        logger.info('Error: No hay servicio que eliminar');
        response.send('{"error":1,"message":"Error al eliminar el servicio"}')
      }
  }
  catch(e)
  {
    logger.info('Error 666: '+e);
  }
});

router.put("/changePasswordAccount",function(request,response){
    logger.info('-----------------------------------------------------');
    logger.info('M001 - PUT "/changePasswordAccount"');
    try{
          if(request.body.passwordchange != '' && request.body.passwordchange != null)
          {
              users.findOne({_id:request.session.user_id},function(err,data){
                if(!err)
                {
                    if(data)
                    {
                      data.password = bcrypt.hashSync(request.body.passwordchange);
                      data.save(function(errSave){
                        if(!errSave)
                        {
                            logger.info("Change password successfully");
                            response.send('{"error":0,"message":""}');
                        }
                        else
                        {
                            logger.info("Error: Error to save the query in the database");
                            response.send('{"error":1,"message":"Error al guardar la contraseña"}');
                        }
                      });
                    }
                    else
                    {
                      logger.info("Error: There is not data in the query.");
                      response.send('{"error":1,"message":"Error al cambiar la contraseña"}');
                    }
                }
                else
                {
                  logger.info("Error: "+err);
                  response.send('{"error":1,"message":"Error al cambiar la contraseña"}');
                }
              });
          }
          else
          {
            logger.info("Error: There are missing data");
            response.send('{"error":1,"message":"Error al guardar la contraseña"}');
          }

    }
    catch(e){
      logger.info('Error 666: '+e);
      response.send('{"error":1,"message":"Error al guardar la contraseña"}');
    };
}); // fin changePasswordAccount
router.put("/deleteaccount",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - PUT "/deleteaacount"');
  try{
        users.findOne({_id:request.session.user_id},function(err,data){
          if(!err)
          {
            if(data)
            {
                data.active = false;
                data.save(function(errSave){

                  if(!errSave)
                  {
                    logger.info("Delete account successfully");
                    response.send('{"error":0,"message":""}');
                  }
                  else
                  {
                    logger.info("Error: Error to in the save process to delete the account");
                    response.send('{"error":1,"message":"Error al eliminar la cuenta"}');
                  }
                });

            }
            else
            {
              logger.info("Error: There is not data in the query");
              response.send('{"error":1,"message":"Error al eliminar la cuenta"}');
            }
          }
          else
          {
            logger.info("Error: "+err);
            response.send('{"error":1,"message":"Error al eliminar la cuenta"}');
          }
        });

  }
  catch(e)
  {
    logger.info("Error 666: "+e);
    response.send('{"error":1,",message":"Error al eliminar la cuenta"}');
  }
});

router.post("/getEmergencyData",function(request,response){
    logger.info('-----------------------------------------------------');
    logger.info('M001 - POST "/getEmergencyData"');
    users.findOne({_id:request.session.user_id},function(err,data){
      if(!err)
      {
          if(data)
          {              
                userJson = {
                  name: data['name'],
                  mail: data['mail'],
                  profileImage: data['profileImage'],
                  gender: data['gender'],
                  folderImg: data['folderImg'],
                  dateBirth: data['dateBirth'],
                  location:{
                      latitude: data['location']['latitude'],
                      length: data['location']['length']
                  },
                  ownedBusinesses: data['ownedBusinesses'],
                  twitteruser: data['twitteruser'],
                  facebookurl: data['facebookurl'],
                  instagramurl: data['instagramurl'],
                  linkedinurl: data['linkedinurl'],
                  webpage: data['webpage'],
                  city: data['city'],
                  state: data['state'],
                  username: data['username']

                };
                business.find({_id: {$in: data.ownedBusinesses}},function(errB,dataB){
                  if(!errB)
                  {
                      if(dataB)
                      {
                        var objectBus;
                        var dataBusinessServer = [];
                        for(var i = 0;i<dataB.length;i++)
                        {
                            objectBus = {
                              _id: dataB[i]._id,
                              name: dataB[i].name,
                              isActive: dataB[i].isActive,
                              businessType: dataB[i].businessType,
                              isHeadBusiness: dataB[i].isHeadBusiness,
                              telephone: {
                                      cellphone: dataB[i].telephone.cellphone,
                                      number:  dataB[i].telephone.number
                              },
                              address: {
                                street: dataB[i].address.street,
                                number: dataB[i].address.number,
                                aditional: dataB[i].address.aditional,
                                zipCode: dataB[i].address.zipCode,
                                city: dataB[i].address.city,
                                state: dataB[i].address.state,
                                country: dataB[i].address.country,
                                dtUpdate: dataB[i].address.dtUpdate,
                                neighborhood: dataB[i].address.neighborhood
                              },
                              services: dataB[i].services,
                              emailbusiness: dataB[i].emailbusiness,
                              twitterbusiness: dataB[i].twitterbusiness,
                              instagramurl: dataB[i].instagramurl,
                              facebookurl: dataB[i].facebookurl,
                              webpage: dataB[i].webpage,
                              usernamebuss: dataB[i].usernamebuss,
                              imgbusiness: dataB[i].imgbusiness,
                              businessdynamic: dataB[i].businessdynamic
                            };

                            dataBusinessServer.push(objectBus);
                        }
                        logger.info('Sending data to the client...');
                        response.send(JSON.stringify({error:0,userjson: userJson,databusinessServer: dataBusinessServer}));

                    }
                    else
                    {
                        logger.info('Error: No hay negocios en este usuario');
                        response.send('{"error":1,"message":"Hubo un error al cargar los datos del negocio del usuario."}');
                    }
                  }
                  else
                  {
                    logger.info('Error: '+errB);
                    response.send('{"error":1,"message":"Hubo un error al buscar los negocios"}');
                  }
                });
          }
          else
          {
              logger.info("There is not users in the database");
              response.send('{"error":1,"message":"Error al cargar los datos"}');
          }
      }
      else
      {
          logger.info("Error: "+err);
          response.send('{"error":1,"message":"Error al cargar los datos"}');
      }
    });// fin users findOne


});


module.exports = router;
