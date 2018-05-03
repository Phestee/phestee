/* Primary Components*/
var fs = require('fs');
var express = require("express");

/* Secondary components */
var bodyParser = require("body-parser");
var sessionmiddleware = require("./middlewares/session");
var session = require("express-session");
var router_app = require("./routes");
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken'); // Could replace Cookie session
var tokenmiddleware = require('./middlewares/passwordreset');
var cookiesession = require('cookie-session');  // Could be replaced with JWT
var bcrypt = require('bcrypt-nodejs');
var multiparty = require('connect-multiparty');
var multipartymiddleware = multiparty();
var randomstring = require('randomstring');
var FileUploadController = require('./public/js/FileUploadController');
var stringComparer = require('string-similarity');
var winston = require('winston');

//**********  Importing Models *******************
var users = require("./models/users").users;
var postSchm = require("./models/posts").postSchm;
var business = require("./models/businesses").business;

//********** General Variables *******************
var secret = 'blitzkrieg';
var datelog = new Date();
var monthlog = datelog.getMonth() + 1;
var finaldate = datelog.getDate()+(monthlog < 10 ? '0'+monthlog : monthlog)+datelog.getFullYear();
var config = winston.config;
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
          return '[ '+(datadate.getDate() < 10 ? '0'+datadate.getDate() : datadate.getDate())+'-'+month[datadate.getMonth()]+'-'+datadate.getFullYear()+'  '+(datadate.getHours() < 10 ? '0'+datadate.getHours() : datadate.getHours())+':'+(datadate.getMinutes() < 10 ? '0'+datadate.getMinutes() : datadate.getMinutes())+':'+(datadate.getSeconds() < 10 ? '0'+datadate.getSeconds(): datadate.getSeconds())+' ] '+ (options.message ? options.message : '');
      }
    })
  ]
});

/*Initializing Express as App Engine, a socket server and real time engine*/
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//General App configuration
app.use(express.static('public'));  //make public folder accesible
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","pug");     //Set PUG as View Engine
app.set("view options", {layout:true});
app.use(cookiesession({
  name: 'session',
  keys: ['asd89bgf7sd8w3k2j6']
}));

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth:{
    user: 'prueba@prueba.com',
    pass: 'passwordprueba'
  }
});

app.get("/", function(request,response){
  logger.info('M001 - GET "/"');
   if(request.session.user_id != undefined && request.session.user_id != null)
  {
    logger.info('ID user: '+request.session.user_id);
    response.render("appv2");
  }
  else
  {
    logger.info('El id user no tiene ningún id');
    response.render("index");
  }
});


/*Ruta cuando se haga clic  k en "Iniciar sesion" nos lleve al login */
app.get("/login", function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - GET "/login"');
  if(request.session.user_id != undefined && request.session.user_id != null)
  {
    logger.info('ID user: '+request.session.user_id);
    logger.info(request.session);
    logger.info("___________________________________________");
    logger.info(request);

    response.redirect("/appv2");
  }
  else
  {
    logger.info('El id user no tiene ningún id');
    response.render("index");
  }
});

/*Ruta cuando se haga click en registro nos lleve al signup*/
//Not required anymore
/*app.get("/signup", function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - GET "/signup"');
    response.render("signup");
});*/

app.get("/forgotpassword",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - GET "/forgotpassword"');
    response.render("forgotpassword");
});


app.get("/nuevopassword/:token",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - GET "/nuevopassword/variable"');
  logger.info('M001 - token: '+request.params.token);
  try {
          users.findOne({resettoken: request.params.token}).select('resettoken').exec(function(err,data){
              if(err)
              {
                //throw err;
                logger.info('Error en if: '+err);
              }
              var token = request.params.token;
              jwt.verify(token, secret, function(err, decoded){
                  if(err)
                  {
                      logger.info("Error: "+err);
                      response.send('{"error":1,"message":"'+err+'"}');
                  }
                  else {
                      if(!data)
                      {
                          logger.info('Error: El link no es válido o ha expirado');
                          response.send('{"error":1,"message":"El link no es válido o ha expirado."}');
                      }
                      else {
                          response.render("nuevopassword",{token: data['resettoken']});
                      }
                  }
              });
          });
    }// fin try
    catch(e){
      logger.info('Error 666: '+e);
    };
});


app.put("/savenewpassword",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - PUT "/savenewpassword"');
  try{
            logger.info('token: '+request.body.token);
            users.findOne({resettoken:request.body.token},function(err,data){
                if(!err)
                {
                  if(data){
                    data.resettoken = "";
                    logger.info('New Password: '+request.body.newpassword);
                    data.password = bcrypt.hashSync(request.body.newpassword);
                    data.save(function(err){
                        if(err)
                        {
                          logger.info('Error: '+err);
                          response.send('{"error":1,"message":"Error al guardar el nuevo password"}');
                        }
                        else {
                            response.send('{"error":0,"message":""}');
                        }

                    });

                  }
                  else{
                      logger.info('Error: No se encontró el usuario.');
                      response.send('{"error":1,"message":"No se encontró el usuario."}');
                  }
                }
                else
                {
                   response.send('{"error":1,"message":"'+err+'"}');
                   logger.info('Error: '+err);
                }
            });
    }
    catch(e){

       logger.info('Error 666: '+e);
    }
});

app.put("/resetpassword",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - PUT "/resetpassword"');
  try{
          if(request.body.email != '')
          {
                  logger.info('Email: '+request.body.email);
                  users.findOne({mail:request.body.email},function(err,data){

                    if(!err)
                    {
                      if(data)
                      {
                        data.resettoken = jwt.sign({email: data.mail},secret,{expiresIn: '24h'});
                        data.save(function(err){
                            if(err)
                            {
                                logger.info('Error: '+err);
                                response.send('{"error":1,"message":"'+err+'"}');
                            }else{

                                //  response.send('{"error":0,"message":""}');
                              var mailOptions = {
                                from: 'John Doe <j.m.hdez13@gmail.com>',
                                to: 'j.m.hdez13@gmail.com',
                                subject: 'Reset password',
                                text:'Hallo! Bitte! Klick Sie im Link für das Passwort aktualisieren. <a href="http://localhost:8080/nuevopassword/'+data.resettoken+'"> http://localhost:8080/nuevopassword </a>',
                                html: '<b> Hallo Welt!  </b> <br> <br> <br> Bitte! Klick Sie im Link für das Passwort aktualisieren. <br> <br> <br> <a href="http://localhost:8080/nuevopassword/'+data.resettoken+'">  http://localhost:8080/nuevopassword </a>'
                              };

                              transporter.sendMail(mailOptions, function(error,info){
                                if(error){
                                  logger.info('Error: '+error);
                                  response.send('{"error":1,"message":"'+error+'"}');
                                }
                                else {
                                   response.send('{"error":0,"message":""}');
                                }
                              });
                            }
                        })
                      }
                      else
                      {
                        logger.info('Error: El correo no se encuentra en nuestra aplicación');
                        response.send('{"error":1,"message":"El correo no se encuentra en nuestra aplicación"}');
                      }
                    }
                    else
                    {
                      logger.info('Error: Hubo un error al buscar el correo electronico');
                      response.send('{"error":1,"message":"Hubo un error al buscar el correo electrónico"}');
                    }
                  });
          }
          else {
              logger.info('Error: Por favor de llenar los campos restantes');
              response.send('{"error":1,"message":"Por favor de llenar los campos faltantes"}');
          }
    }
    catch(e){
      logger.info('Error 666: '+e);
    }
});

app.post("/validation",function(request,response){
  logger.info('-----------------------------------------------------');
  logger.info('M001 - POST "/validation"');
  try{
        logger.info('Email: '+request.body.email);
        logger.info('Password: '+request.body.password);
        if(request.body.email != '' && request.body.password != '')
        {
          users.findOne({mail:request.body.email},function(err,data){
            if(!err)
            {
              if(data)
              {
                 if(bcrypt.compareSync(request.body.password,data['password']))
                 {
                  if(data.active == true)
                  {
                      logger.info('Esto se guardara en las variables de sesion: ');
                      request.session.user_id = data._id;
                      request.session.loadbusiness = 0;
                      request.session.business = data.ownedBusinesses;
                      logger.info('ID USER: '+request.session.user_id);
                      logger.info('LOADBUSINESS: '+request.session.loadbusiness);
                      response.send('{"error":0,"message":"Successful Login"}');
                   }
                   else
                   {
                     logger.info("Error: The user is correct but the account is deleted");
                     response.send('{"error":1,"message":"La cuenta se encuentra eliminada."}');
                   }
                 }
                 else{
                    logger.info('Error: Por favor ingrese el usuario y/o contraseña correctamente');
                    response.send('{"error":1,"message":"Por favor ingrese el usuario y/o contraseña correctamente"}');
                 }

              }
              else {
                response.send('{"error":1,"message":"Por favor ingrese el usuario y/o contraseña correctamente."}');
              }
            }
            else{
                logger.info('Error: '+err);
                response.send('{"error":1,"message":"'+err+'"}');
            }
         });
        }
        else{
            logger.info('Error: Por favor llene los campos correctamente');
            response.send('{"error":1,"message":"Por favor llene los campos correctamente."}')
        }
      }
      catch(e){
              logger.info('Error 666: '+e);
      }
});

app.post("/users", function(request,response){
    logger.info('-----------------------------------------------------');
    logger.info('M001 POST "/users"');
    try{
            logger.info('Email: '+request.body.email);
            logger.info('Password: '+request.body.password);
            logger.info('Username: '+request.body.username);
            if(request.body.email != "" && request.body.password != "" && request.body.username != "" && request.body.dateBirth != "" && request.body.gender != "")
            {
              logger.info('Se guardara el negocio por default');
              var businessData = new business;
              businessData.name = "Freelance";
              businessData.businessType = "Freelance";
              businessData.licenseType = "Freemium";
              businessData.telephone.typeTel = "";
              businessData.telephone.number = 0;
              businessData.isHeadBusiness = true;
              businessData.address.street = "";
              businessData.address.number = 0;
              businessData.address.aditional = "";
              businessData.address.zipCode = "";
              businessData.address.city = "";
              businessData.address.state = "";
              businessData.address.country = "";
              businessData.address.neighborhood= "";
              businessData.save(function(err,businessdataresult){
                  if(!err)
                  {
                      var passwordcode = bcrypt.hashSync(request.body.password);
                      var dateCreatedFirstTime = new Date();
                      var imgUserFolder = randomstring.generate(36);
                      var user = new users;
                      user.mail = request.body.email;
                      user.password = passwordcode;
                      user.dateCreated = dateCreatedFirstTime;
                      user.folderImg = imgUserFolder;
                      logger.info('Folder del usuario: '+imgUserFolder);
                      user.ownedBusinesses.push(businessdataresult._id);
                      logger.info('ID Negocio: '+businessdataresult._id);
                      user.save().then(function(us){
                          try
                          {
                            fs.mkdirSync('./public/img/'+imgUserFolder);
                            fs.mkdirSync('./public/img/'+imgUserFolder+'/Offers');
                            fs.mkdirSync('./public/img/'+imgUserFolder+'/Profile');
                            fs.mkdirSync('./public/img/'+imgUserFolder+'/Services');
                            fs.mkdirSync('./public/img/'+imgUserFolder+'/Services/thumbnailsmall');
                            fs.mkdirSync('./public/img/'+imgUserFolder+'/Services/thumbnailmedium');
                            fs.mkdirSync('./public/img/'+imgUserFolder+'/Services/thumbnailbig');
                          }
                          catch(err)
                          {
                            if(err.code == 'EEXIST')
                            {
                             logger.info('La carpeta ya existe');
                            }
                            else
                            {
                             logger.info('Error: '+err);
                            }
                          }

                          response.send('{"error":0,"message":""}');
                      },function(err){
                          logger.info('Error: '+err);
                          response.send('{"error":1,"message":"Hubo un error al guardar el usuario. '+err+'"}');
                      });

                  }
                  else {
                    logger.info('Error: '+err);
                    response.send('{"error":1,"message":"'+err+'"}');
                  }

              });
            }
            else {
                  logger.info('Error: Hay datos vacios en el registro.');
                  response.send('{"error":1,"message":"Hay datos vacios en el registro"}');
            }

      }
      catch(e)
      {
        logger.info('Error 666: '+e);
      }
});


app.get("/availableusername/:nameusercheck", function(request,response){
      logger.info('-----------------------------------------------------');
      logger.info('M001 GET "/availablename/variable"');
      try{

              if(request.params.nameusercheck !='' && request.params.nameusercheck != undefined )
              {
                  logger.info('nameusercheck: '+request.params.nameusercheck);
                  users.findOne({username:request.params.nameusercheck},function(err,data){
                    if(!err)
                    {
                      if(data)
                      {
                        response.send('{"error":2,"message":""}');
                      }
                      else
                      {
                        response.send('{"error":3,"message":""}');
                      }
                    }
                    else {
                      logger.info('Error: '+err);
                      response.send('{"error":1,"message":"Hubo un error al realizar la consulta de nombre"}');
                    }
                  });

              }
              else
              {
                logger.info('Error: Error al obtener el nombre para revisar en la base de datos');
                response.send('{"error":1,"message":"Error al realizar la consulta."}');
              }
      }
      catch(e){
          logger.info('Error 666: '+e);

      };

});


app.get("/availableemail/:emailcheck", function(request,response){
    logger.info('-----------------------------------------------------');
    logger.info('M001 GET "/availableemail/emailcheck"');
    try{
              logger.info('Emailcheck: '+request.params.emailcheck);
              if(request.params.emailcheck !='' && request.params.emailcheck != undefined )
              {
                  users.findOne({mail:request.params.emailcheck},function(err,data){
                    if(!err)
                    {
                      if(data)
                      {
                        response.send('{"error":2,"message":""}');
                      }
                      else
                      {
                        response.send('{"error":3,"message":""}');
                      }
                    }
                    else {
                      logger.info('Error: '+err);
                      response.send('{"error":1,"message":"Hubo un error al realizar la consulta del email"}');
                    }
                  });

              }
              else
              {
                logger.info('Error: La variable emailcheck no recibio nada o recibio un error');
                response.send('{"error":1,"message":"Error al realizar la consulta."}');
              }
    }
    catch(e){

        logger.info('Error 666: '+e);
    }
});

app.post("/postIt", function(request,response){
  if(request.body.session){ // Validate Session before
    //maybe foreach loops should be replaced by for loop which is faster and more efficient
    //moreover as this is a server side task

    /** Declaring/Initilizing variables to use **/
    var wordsArgs = new Array();
    var orSttmnt = new Array();
    var providers = new Array();
    var streamId;
    var wordExcl = ["de", "para", "por", "sin", "en", "a", "un", "una"];
    var postObj;

    //************************************************************* reviewing the uniqueness of the streamId
    do{
      streamId = randomstring.generate(36);
      var results = postSchm.findOne({"stream" : streamId});
    }while(results[0]);

    //************************************************************* normalizing post
    var post = request.body.post.replace(/\s+/g,' ').trim();
    var cleanPost = post;
    wordExcl.forEach(function(elmnt) {
      cleanPost = cleanPost.replace(" " + elmnt + " ", " ");
    });

    //************************************************************* Building Or statement to search Services by Hasthag
    cleanPost.split(" ").forEach(function(elmnt){
      orSttmnt[orSttmnt.length] = {"services.hshtgs" : {$regex : ".*"+elmnt+".*"}};
    });
    var cursor = business.find({ $or : orSttmnt}).cursor();
    cursor.on('data', function(doc) { //iterating over db results
      var bestMatchResults = {bestMatch:{rating:0.0}};
      var crrntMatchResults;
      console.log(doc);
      doc.services.forEach(function(svc){ //iterate over services, to get the best matching service
        crrntMatchResults = stringComparer.findBestMatch(cleanPost, svc.hshtgs);
        if(crrntMatchResults.bestMatch.rating > bestMatchResults.bestMatch.rating){
          bestMatchResults = crrntMatchResults;
        }
      });
      providers[providers.length] = { //building providers Json array
        busnssId:     doc._id,
        matchnHstg:   bestMatchResults.bestMatch.target,
        hstgAccrcy:   bestMatchResults.bestMatch.rating,
        ratings:      crrntMatchResults.ratings,
        raisedHand:   false,
        viewed:       false
      }
    });
    cursor.on('close', function() { //after all results have been reviewed
      //saving the Post in the DB as a new post
      postObj = new postSchm({userId : request.body.id, post : post, stream : streamId, providers : providers});
      postObj.save();
      response.send('{"result": "success", "stream" : "'+streamId+'"}');
      console.log("Post Correctly saved");
    });
  }else{
    console.log("No session sent/invalid session")
  }
});

app.post("/updateFeed", function(request,response){
  if(request.body.session){ // Validate Session before
    response.data = request.body;
  }else{
    console.log("No session sent/invalid session")
  }
});

app.get("/postView", function(request,response){
  response.render("testViewForPosts");
});

app.get("/rtm", function(request,response){
  response.render("rtm_index");
});

app.get("/tstVw", function(request,response){
  response.render("appv2/settings/profile/xl");
});



module.exports = function (socket) {
  var name = userNames.getGuestName();

  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get()
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.message
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};



// When a client connects, we note it in the console
io.on('connection', require('./socket'));


//app.post("/uploadImage",multipartymiddleware,FileUploadController.uploadFile);
  /* Agregar en el app el middleware */
app.use("/appv2",sessionmiddleware);
app.use("/",sessionmiddleware);
app.use("/appv2",router_app);
app.use("/nuevopassword",tokenmiddleware);

/* Asignamos a que puerto se vera nuestra pagina.*/
server.listen(8080);
/*
GET:    Para mostrar vistas al usuario y hacer consultas.
POST:   Para crear y mandar datos
PUT:    Modificar
DELETE: lo tengo que decir?


*/
