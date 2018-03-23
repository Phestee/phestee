var mongoose =  require("mongoose");
var Schema = mongoose.Schema;
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

mongoose.connect("mongodb://localhost/Phestee");

var postSchema = new Schema ({
  userId :        { type: String,
                    required: true,
                    maxlength:[50, "El nombre es muy largo"]},
  post :          { type : String},
  stream :        { type : String,
                    required: true},
  postedDate :    { type: Date,
                    default: Date.now},
  isActive :      { type : Boolean},
  closureType :   { type : String},
  providers :     [{  busnssId:   {type:String},
                      SrvcId:     {type:String},
                      matchnHstg: {type:String},
                      hstgAccrcy: {type:Number},
                      ratings :   [{}],
                      raisedHand: {type:Boolean},
                      viewed :    {type:Boolean},
                      lastUpdated:{type:Date}
  }]
});

var postSchm = mongoose.model("posts", postSchema);
module.exports.postSchm = postSchm;
