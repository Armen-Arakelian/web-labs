
var mongoose = require('mongoose');

var ideaSchema = mongoose.Schema({
        name   : String,
        birthDate    : String,
        about  : String,
        iq: Number,
        picture : String,

});

module.exports = mongoose.model('Person', ideaSchema);
