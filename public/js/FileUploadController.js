var fs = require('fs');
var bcrypt = require('bcrypt-nodejs');
var users = require("../../models/users").users;
var randomstring = require("randomstring");
var winston = require('winston');

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


FileUploadController = function() {};

FileUploadController.prototype.uploadFile = function(request, response) {
  logger.info('-----------------------------------------------------');
  logger.info('M001 PUT "uploadImage"');
  try{
         if(request.body.password != undefined || request.body.username != undefined || request.body.email != undefined)
         {
           logger.info('Password: '+request.body.password);
           logger.info('Username: '+request.body.username);
           logger.info('Email: '+request.body.email);
           users.findOne({_id:request.session.user_id},function(err,dataDB){
             if(!err){
               if(dataDB){

                 if(request.body.username != undefined)
                   dataDB.name = request.body.username;
                 if(request.body.password != undefined)
                   dataDB.password = bcrypt.hashSync(request.body.password);
                 if(request.body.email != undefined)
                   dataDB.mail = request.body.email;
                 if(request.files != undefined)
                 {
                    var imageextension = request.files.file.name.split(".").pop();
                    var imagename = randomstring.generate(36);
                    dataDB.profileImage = imagename+"."+imageextension;
                 }

                 dataDB.save(function(err){
                   if(err)
                   {
                     logger.info('Error: '+err);
                     response.send('{"error":1,"message":"Error al guardar el usuario"}');
                   }
                   else
                   {
                       if(request.files != undefined)
                       {
                            var file = request.files.file;
                            fs.readFile(request.files.file.path, function (err, data) {
                              // set the correct path for the file not the temporary one from the API:
                              if(err)
                                logger.info('Error: '+err);
                              file.path = "/wamp/www/PhesteeProject/public/img/"+dataDB['folderImg']+"/Profile/"+imagename+"."+imageextension;

                              // copy the data from the req.files.file.path and paste it to file.path
                              fs.writeFile(file.path, data, function (err) {
                                if (err) {
                                  logger.info('Error: '+err);
                                  response.send('{"error":1,"message":"'+err+'"}');
                                }
                                response.send('{"error":0,"message":""}');
                              });
                            });
                       }
                       else {
                            response.send('{"error":0,"message":""}');
                       }
                   }
                 });
               }
               else {
                 response.send('{"error":1,"message":"No se encontró el usuario."}');

               }

             }
             else {
               response.send('{"error":1,"message":"'+err+'"}');
             }
           });

         }
         else {
           logger.info('Error: No hay campos por modificar');
           response.send('{"error":1,"message":"No hay campos por modificar"}');
         }
    }
    catch(e)
    {

        logger.info('Error 666: '+e);
    }
}

module.exports = new FileUploadController();
