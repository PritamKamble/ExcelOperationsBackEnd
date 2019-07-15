const mongoose = require('mongoose');

const empSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    empCode: { type: String, required: true },
    mngCode: { type: String, required: true },
    empName: { type: String, required: true },
    empLastName: { type: String, required: true },
    empEmail: { type: String, required: true },
    empStatus: { type: String, required: true },
    fileID: {type: String, required: true}
});

module.exports = mongoose.model('EmpModel', empSchema);
