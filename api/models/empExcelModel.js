const mongoose = require('mongoose');

const empExcelSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    excelFile: { type: String, required: true }
});

module.exports = mongoose.model('EmpExcel', empExcelSchema);
