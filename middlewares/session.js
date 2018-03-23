var users = require("../models/users").users;
module.exports = function(request,response,next){
  if(!request.session.user_id)
    response.redirect("/login");
  else {
    users.findById(request.session.user_id,function(err,data){
      if(err)
        response.redirect("/login");
      else {
        //response.locals = {users: users};
        next();
      }// fin del else if(err)
    });
  }// fin else
}//fin module exports
