var mongoose =  require("mongoose");
var Schema = mongoose.Schema;
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

mongoose.connect("mongodb://localhost/Phestee");

var users_schema = new Schema ({

    name:            {type: String,
                     maxlength:[50, "El nombre es muy largo"]},

    mail:            {type: String,
                     required: true,
                     required: "El correo es requerido"},

    password:        {type: String,
                      required: true,
                     minlength: [8,"El password es muy corto"]},

    resettoken:      {type: String},

    dateCreated:     {type: Date},

    profileImage:    {type: String},

    lastUpdated:     {type: Date},

    sessionId:       {type: String},

    gender:          {type: String},

    follows:          [],

    ownedBusinesses:   [],

    dateBirth:        {type: Date},

    folderImg:        {type: String},

    location:         {
                       latitude: {type: Number},
                       length:   {type: Number}
                      },

    licensedProducts: [
                       {
                         productId:  {type: String},
                         PO:         {type: String},
                         startDate:  {type: Date},
                         endDate:    {type: Date}

                       }
                     ],
    active:          {type: Boolean,default: true}

});

var users = mongoose.model("users",users_schema);
module.exports.users = users;
