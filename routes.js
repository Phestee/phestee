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
  try{
    if(request.session.loadbusiness == 0)
    {
          logger.info('Cargará los datos por primera vez');
          users.findOne({_id:request.session.user_id},function(err,data){
              if(!err)
              {
                  if(data)
                  {
                      business.find({_id: {$in: data.ownedBusinesses}},function(errB,dataB){
                        if(!errB)
                        {
                          if(dataB)
                          {
                              logger.info('Se redireccionará a editar negocio pero ya mandara a llamar los datos locales.');
                              //request.session.loadbusiness = 1;
                              response.render('app/editservices',{databusiness: dataB});
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
                  else {
                    logger.info('Error: No se encuentran datos');
                    response.send('{"error":1,"message":"No se encontraron datos"}');
                  }
              }
              else {
                logger.info('Error: '+err)
                response.send('{"error":1,"message":"Hubo un error al cargar el usuario."}');
              }
          });
    }
    else
    {
        logger.info('Se cargara editar negocios pero los datos los cargara el cliente.');
        response.render('app/editservices',{databusiness: 1});
    }
  }
  catch(e)
  {
    logger.info('Error 666: '+e);
  }
});

router.get("/", function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 GET "/ principal"');
  try{
        users.findOne({_id:request.session.user_id},function(err,data){
          var responseuserjson = ''
          if(!err)
          {
                if(data)
                {
                       responseuserjson = {
                        "error":0,
                        "username": data['name'],
                        "email": data['mail']

                      };
                      response.render("appv2",{user: responseuserjson});
                }
                else {
                      response.send('{"error":1,"message":"No se encuentran los datos del usuario."}');
                }
          }
          else {
              response.send('{"error":1,"message":"'+err+'"}')
          }
        });
   }
   catch(e)
   {
     logger.info('Error 666: '+e);
   }
});

router.get("/signout",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 GET "/signout"');
  request.session = null;
  response.redirect('/login');
});


router.get("/profile",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 GET "/profile"');
  response.render("app/editprofile");
});

router.get("/business",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 GET "/business"');
  try{
        if(request.session.loadbusiness == 0)
        {
          logger.info('Cargará los datos por primera vez');
          users.findOne({_id:request.session.user_id},function(err,data){
              if(!err)
              {
                  if(data)
                  {
                      business.find({_id: {$in: data.ownedBusinesses}},function(errB,dataB){
                        if(!errB)
                        {
                          if(dataB)
                          {
                              logger.info('Se redireccionará a editar negocio pero ya mandara a llamar los datos locales.');
                              request.session.loadbusiness = 1;
                              response.render('app/editbusiness',{databusiness: dataB});
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
                  else {
                    logger.info('Error: No se encuentran datos');
                    response.send('{"error":1,"message":"No se encontraron datos"}');
                  }
              }
              else {
                logger.info('Error: '+err)
                response.send('{"error":1,"message":"Hubo un error al cargar el usuario."}');
              }
          });
        }
        else
        {
            logger.info('Se cargara editar negocios pero los datos los cargara el cliente.');
            response.render('app/editbusiness',{databusiness: 1});
        }
  }
  catch(e)
  {
      logger.info('Error 666: '+e);
  }
});


router.put("/uploadImage",multipartymiddleware,FileUploadController.uploadFile);

router.put("/editBusiness",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 PUT "/editBusiness"');
  try{
      business.findOne({_id:request.body.idbusiness},function(err,data){
        if(!err)
        {
          if(data)
          {
            data.name = (request.body.businessname != undefined) ? request.body.businessname : "";
            data.businessType = request.body.businesstype;
            data.telephone.typeTel = (request.body.typephone != undefined) ? request.body.typephone : "";
            data.telephone.number = (request.body.phonenumberbusiness != undefined) ? request.body.phonenumberbusiness : "";
            data.isHeadBusiness = request.body.mainbusiness;
            data.address.street = (request.body.addressstreet != undefined) ? request.body.addressstreet : "";
            data.address.number = (request.body.addressnumber != undefined) ? request.body.addressnumber : "";
            data.address.aditional = (request.body.addressaditional != undefined) ? request.body.addressaditional : "";
            data.address.zipCode = (request.body.addresszipcode != undefined) ? request.body.addresszipcode : "";
            data.address.city = (request.body.addresscity != undefined) ? request.body.addresscity : "";
            data.address.state = (request.body.addressstate != undefined) ? request.body.addressstate : "";
            data.address.country = (request.body.addresscountry != undefined) ? request.body.addresscountry : "";
            logger.info('Datos negocios: '+JSON.stringify(data));
            data.save(function(err){
              if(!err)
              {
                 response.send('{"error":0,"message":""}');
              }
              else
              {
                  logger.info('Error: '+err);
                  response.send('{"error":1,"message":"'+err+'"}');
              }
            });
          }
          else
          {
            logger.info('Error: No se encontró ningún negocio');
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
    }
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


module.exports = router;
