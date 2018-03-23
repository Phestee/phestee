var jwt = require('jsonwebtoken');
var secret = 'blitzkrieg';
module.exports = function(request,response,next){

  var token = request.body.token || request.body.query || request.headers['x-access-token'];
  if(token)
  {
     jwt.verify(token, secret, function(err,decoded){
       if(err){
          response.send('{"error":1,"message":"Token invalido"}');

       }else {
          request.decoded = decoded;
          next();
       }
     });
  }
  else
  {
      response.send('{"error":1,"message":"No se encuentra el token"}');
  }
}
