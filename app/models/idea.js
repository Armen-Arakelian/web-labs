
var mongoose = require('mongoose');

var ideaSchema = mongoose.Schema({
        title   : String,
        text    : String,
        author  : String,
        authorId: String,

        picture : String,

});

module.exports = mongoose.model('Idea', ideaSchema);
