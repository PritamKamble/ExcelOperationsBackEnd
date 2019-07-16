const mongoose = require("mongoose");
const EmpExcel = require("../models/empExcelModel");
const EmpModel = require('../models/employeeModel');
const fs = require("fs");
const excelToJson = require('convert-excel-to-json');

exports.fileList = (req, res, next) => {
    console.log('Inside File List');

    EmpExcel.find()
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({
                message: 'Error while getting files list',
                error: err
            });
        });
};

exports.getFile = (req, res, next) => {
    const id = req.params.fileID;
    EmpExcel.findById(id)
        .exec()
        .then(doc => {
            if (doc) {
                console.log('Inside getFile method');
                data = excelToJson({
                    sourceFile: doc.excelFile,
                    columnToKey: {
                        '*': '{{columnHeader}}'
                    },
                    header: {
                        rows: 1
                    }
                });
                console.log(data);
                res.status(200).json(data);
            }
        });
};

exports.uploadFile = (req, res, next) => {
    console.log('inside UploadFile method');

    const emp = new EmpExcel({
        _id: new mongoose.Types.ObjectId(),
        excelFile: (req.file.path)
    });
    emp.save()
        .then(result => {
            res.status(201).json(result);
        });
};

exports.uploadData = async (req, res, next) => {

    console.log(req.params.fileID);
    responseData = [];
    manager = req.body.manager;
    employees = req.body.employees;
    for (let i = 0; i < manager.length; i++) {
        const emp = new EmpModel(
            {
                _id: new mongoose.Types.ObjectId(),
                empCode: manager[i].emp_code,
                mngCode: '$',
                empName: manager[i].mngName,
                empLastName: manager[i].mngLastName,
                empEmail: manager[i].mngEmail,
                empStatus: manager[i].mngStatus,
                fileID: req.params.fileID
            }
        );
        await emp.save().then(
            result => {
                responseData[i] = result;
                if (i === manager.length - 1) {
                    console.log('Manager inserted');
                    for (let j = 0, k = i + 1; j < employees.length; j++ , k++) {
                        function SaveEmp(mngID) {
                            const emp = new EmpModel(
                                {
                                    _id: new mongoose.Types.ObjectId(),
                                    empCode: employees[j].emp_code,
                                    mngCode: mngID,
                                    empName: employees[j].empName,
                                    empLastName: employees[j].empLastName,
                                    empEmail: employees[j].empEmail,
                                    empStatus: employees[j].empStatus,
                                    fileID: req.params.fileID
                                }
                            );

                            emp.save().then(
                                result => {
                                    console.log(result);
                                    responseData[k] = result;
                                    if (j === employees.length - 1) {
                                        console.log('Employee inserted');
                                        res.status(201).json({
                                            message: 'Employees And Managers Inserted Successfully'
                                        });
                                    }
                                });
                        }

                        EmpModel.findOne({empCode: employees[j].mng_code})
                            .exec()
                            .then(async(result) => {
                                await SaveEmp(result._id);
                            });
                    }
                }
            });
    }
};

exports.getAll = (req, res, next) => {
    console.log('inside getAll');

    empData = {};
    EmpModel.find({ fileID: req.body.fileID })
        .exec()
        .then(result.find({ mngCode: '$' })
            .exec()
            .then(result => {
                empData['manager'] = result;
                EmpModel.find({ mngCode: { $ne: '$' } })
                    .exec()
                    .then(result => {
                        empData['employees'] = result;
                        res.status(200).json(empData);
                    });
            }));
};

exports.deleteFileAndData = (req, res, next) => {
    console.log('Inside deleteFile method');
    const id = req.params.fileID;
    EmpExcel.findById(id)
        .exec()
        .then(result => {
            fs.unlinkSync(result.excelFile);
            EmpExcel.deleteOne({ _id: id })
                .exec()
                .then(result => {
                    console.log('Inside Delete one');
                    EmpModel.deleteMany({ "fileID": id })
                        .exec()
                        .then(result => {
                            console.log('Inside Delete many');
                            console.log(result);
                            res.status(200).json({
                                message: "File deleted successfully",
                                result: result
                            });
                        });
                });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Error while deleteing file',
                error: err
            });
        });
};

