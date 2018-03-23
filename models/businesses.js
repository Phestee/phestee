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
                      typeTel: {type:String},
                      number:  {type:String}
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
                        hshtgs:           [String],
                        description:      {type: String},
                        type:             {type: String},
                        imgs:             [
                                            {
                                                img:          {type: String},
                                                thumbsmall:   {type: String},
                                                thumbmedium:  {type: String},
                                                thumbbig:     {type: String}
                                            }
                                          ]
                      }
                    ]

});

var business = mongoose.model("business",businesses_schema);
module.exports.business = business;
