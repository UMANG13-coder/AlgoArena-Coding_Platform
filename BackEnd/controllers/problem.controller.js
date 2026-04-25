const problem=require('../models/Problem');
const Lesson=require('../models/Lesson');
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { STATUS_CODE } = require("../utils/constants");
const Joi=require('joi');
const { submissionQueue } = require('../utils/queue');

async function addProblem(req,res){
    const problemSchema=Joi.object({
        title:Joi.string().required(),
        lesson_id:Joi.string().required(),
        description_md:Joi.string().required(),
        difficulty:Joi.string().valid('Easy','Medium','Hard').required(),
        tags:Joi.array().items(Joi.string()),
        supported_languages:Joi.array().items(Joi.string()),
        constraints:Joi.object(),
        test_cases:Joi.array().items(Joi.object()),
        hints:Joi.array().items(Joi.string()),
        solution_meta:Joi.object()
    });
try{
    const {error, value} = problemSchema.validate(req.body);

    if(error){
        return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const newProblem = await problem.create(value);

    await Lesson.findByIdAndUpdate(value.lesson_id, {
        $push: { problems: newProblem._id }
    });

    return sendSuccessResponse(
        res,
        {problem: newProblem},
        "Problem Added Successfully",
        STATUS_CODE.CREATED
      );
}catch(err){
    return sendErrorResponse(
        res,
        {},
        `Error Adding Problem: ${err.message}`,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
}

}

async function getAllProblems(req,res){
    const querySchema=Joi.object({
    page:Joi.number().integer().min(1).default(1),
    limit:Joi.number().integer().min(1).max(100).default(100),
})
    try{
        const {error, value} = querySchema.validate(req.query);

        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        const {page, limit} = value;
        const offset= (page - 1) * limit;

        const allProblems=await problem.find().skip(offset).limit(limit);
        const total = await problem.countDocuments();

        return sendSuccessResponse(
            res,
            {problems: allProblems, total, page, limit},
            "Problems Retrieved Successfully",
            STATUS_CODE.OK
          );
    }catch(err){
        return sendErrorResponse(
            res,
            {},
            `Error Retrieving Problems: ${err.message}`,
            STATUS_CODE.INTERNAL_SERVER_ERROR
          );
    }
}

async function getProblemById(req,res){
    const idSchema=Joi.object({
        id:Joi.string().required()
    });
    try{
        const {error, value} = idSchema.validate(req.params);
        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const problemId=value.id;
        const fetchProblem=await problem.findById(problemId);
        if(!fetchProblem){
            return sendErrorResponse(res, {}, "Problem Not Found", STATUS_CODE.NOT_FOUND);
        }
        return sendSuccessResponse(
            res,
            {problem: fetchProblem},
            "Problem Retrieved Successfully",
            STATUS_CODE.OK
          );
    }
    catch(err){
        return sendErrorResponse(
            res,
            {},
            `Error Retrieving Problem: ${err.message}`,
            STATUS_CODE.INTERNAL_SERVER_ERROR
          );
    }
}

async function updateProblem(req,res){
    const idSchema=Joi.object({
        id:Joi.string().hex().required()
    });
    const updateSchema=Joi.object({
        title:Joi.string(),
        lesson_id:Joi.string().hex(),
        description_md:Joi.string(),
        difficulty:Joi.string().valid('Easy','Medium','Hard'),
        tags:Joi.array().items(Joi.string()),
        supported_languages:Joi.array().items(Joi.string()),
        constraints:Joi.object(),
        test_cases:Joi.array().items(Joi.object()),
        hints:Joi.array().items(Joi.string()),
        solution_meta:Joi.object()
    });
    try{
        const {error: idError, value: idValue} = idSchema.validate(req.params);
        if(idError){
            return sendErrorResponse(res, idError.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const problemId=idValue.id;
        const {error: updateError, value: updateValue} = updateSchema.validate(req.body);
        if(updateError){
            return sendErrorResponse(res, updateError.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const updatedProblem=await problem.findByIdAndUpdate(problemId, { $set: updateValue }, {new: true, runValidators: true});
        if(!updatedProblem){
            return sendErrorResponse(res, {}, "Problem Not Found", STATUS_CODE.NOT_FOUND);
        }
        return sendSuccessResponse(
            res,
            {problem: updatedProblem},
            "Problem Updated Successfully",
            STATUS_CODE.OK
          );
    }catch(err){
        return sendErrorResponse(
            res,
            {},
            `Error Updating Problem: ${err.message}`,
            STATUS_CODE.INTERNAL_SERVER_ERROR
          );
    }
}

async function deleteProblem(req, res) {
    const idSchema = Joi.object({
        id: Joi.string().hex().required()
    });
    try {
        const { error, value } = idSchema.validate(req.params);
        if (error) {
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const problemId = value.id;
        const deletedProblem = await problem.findByIdAndDelete(problemId);

        if (!deletedProblem) {
            return sendErrorResponse(res, {}, "Problem Not Found", STATUS_CODE.NOT_FOUND);
        }

        if (deletedProblem.lesson_id) {
            await Lesson.findByIdAndUpdate(deletedProblem.lesson_id, {
                $pull: { problems: problemId }
            });
        }

        return sendSuccessResponse(res, {}, "Problem Deleted Successfully", STATUS_CODE.OK);
    } catch (err) {
        return sendErrorResponse(res, {}, `Error Deleting Problem: ${err.message}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}

module.exports={
    addProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem
}
