var mongoose =  require("mongoose");
var Float = require('mongoose-float').loadType(mongoose);
var Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/Phestee");

var businesses_schema = new Schema ({
    name:         {type: String,
                  maxlength:[100, "El nombre es muy largo"]},

    isActive:     {type: Boolean, default: false},

    businessType: {type: String,
                   default: 'Freelance'},

    licenseType: {type: String,
                   default: 'Freemium'},

    telephone:
                    {
                      number:  {type:String},
                      cellphone: {type:String}
                    },

    delegatedUsers: [],

    isHeadBusiness: {type: Boolean},

    branches:       [{}],

    address:        {
                      street:     {type: String},
                      number:     {type: String},
                      aditional:  {type: String},
                      zipCode:    {type: String},
                      city:       {type: String},
                      state:      {type: String},
                      country:    {type: String},
                      neighborhood:  {type: String},
                      dtUpdated:  {type: Date}
                    },
    certification:  {
                      isCertified:        {type:Boolean},
                      gvmntPermissionId:  {type: String},
                      permissionFile:     {type: String}
                    },
    services:       [
                      {
                        _id:              [Schema.Types.ObjectId],
                        name:             {type: String},
                        cost:             {type: Number},
                        homeservice:      {type: Boolean},
                        isMovilOffering:  {type: Boolean},
                        establishedbuss:  {type: Boolean},
                        hshtgs:           {type: String},
                        description:      {type: String},
                        type:             {type: String},
                        imgs:             [
                                            {
                                                _id:          false,
                                                img:          {type: String},
                                                thumbsmall:   {type: String},
                                                thumbmedium:  {type: String},
                                                thumbbig:     {type: String}
                                            }
                                          ]
                      }
                    ],
    emailbusiness:    {type: String},
    twitterbusiness:  {type: String},
    instagramurl:     {type: String},
    facebookurl:      {type: String},
    webpage:          {type: String},
    usernamebuss:     {type: String},
    imgbusiness:      {type: String},
    businessdynamic:  {type: String}



});

var business = mongoose.model("business",businesses_schema);
module.exports.business = business;

// homeservice = servicio a domicilio
// isMovilOffering  = Negocio movil
//
