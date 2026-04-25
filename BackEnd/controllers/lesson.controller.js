const Joi=require('joi');
const Lesson=require('../models/Lesson');
const Module=require('../models/Module');
const { sendSuccessResponse,sendErrorResponse } = require('../utils/response');
const {STATUS_CODE}=require('../utils/constants')

async function createLesson(req, res) {
    const lessonSchema = Joi.object({
        module_id: Joi.string().hex().required(),
        title: Joi.string().required(),
        content_type: Joi.string(),
        content_md: Joi.string(),
        video_urls: Joi.array().items(Joi.string()),
        order_index: Joi.number().integer().min(0),
        xp_reward: Joi.number().integer().min(0),
        problems: Joi.array().items(Joi.string().hex())
    });

    try{
        const {error, value} = lessonSchema.validate(req.body);
        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const newLesson = await Lesson.create({
            module_id: value.module_id,
            title: value.title,
            content_type: value.content_type,
            content_md: value.content_md,
            video_urls: value.video_urls,
            order_index: value.order_index,
            xp_reward: value.xp_reward,
            xp_reward: value.xp_reward,
            problems: value.problems
        });

        await Module.findByIdAndUpdate(value.module_id, {
            $push: { lessons: newLesson._id }
        });

        return sendSuccessResponse(res, newLesson, "Lesson created successfully", STATUS_CODE.CREATED);
    }catch(err){
        return sendErrorResponse(res, err, "Failed to create lesson");
    }
}

async function getAllLessons(req, res) {
    const querySchema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    });

    try{
        const {error, value} = querySchema.validate(req.query);
        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        const {page, limit} = value;
        const offset = (page - 1) * limit;

        const allLessons = await Lesson.find()
            .skip(offset)
            .limit(limit)
            .populate('problems');

        const total = await Lesson.countDocuments();

        return sendSuccessResponse(res, { lessons: allLessons, total, page, limit }, "Lessons retrieved successfully", STATUS_CODE.OK);
    }catch(err){
        return sendErrorResponse(res, err, "Failed to retrieve lessons");
    }
}

async function getLessonById(req, res) {
    const idSchema = Joi.object({
        id: Joi.string().required()
    });
    try {
        const {error, value} = idSchema.validate(req.params);
        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        const lesson = await Lesson.findById(value.id).populate('problems');
        if (!lesson) {
            return sendErrorResponse(res, {}, "Lesson not found", STATUS_CODE.NOT_FOUND);
        }
        return sendSuccessResponse(res, lesson, "Lesson retrieved successfully", STATUS_CODE.OK);
    } catch (err) {
        return sendErrorResponse(res, err, "Failed to retrieve lesson");
    }
}

async function updateLesson(req, res) {
    const { id } = req.params;
    const lessonSchema = Joi.object({
        title: Joi.string(),
        content_type: Joi.string(),
        content_md: Joi.string(),
        video_urls: Joi.array().items(Joi.string()),
        order_index: Joi.number().integer().min(0),
        xp_reward: Joi.number().integer().min(0),
        problems: Joi.array().items(Joi.string().hex())
    });
    try {
        const { error, value } = lessonSchema.validate(req.body);
        if (error) {
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return sendErrorResponse(res, {}, "Lesson not found", STATUS_CODE.NOT_FOUND);
        }

        const updated = await Lesson.findByIdAndUpdate(id, value, { new: true });

        return sendSuccessResponse(res, updated, "Lesson updated successfully", STATUS_CODE.OK);
    } catch (err) {
        console.log(err);
        return sendErrorResponse(res, err, "Failed to update lesson");
    }
}

async function deleteLesson(req, res) {
    const { id } = req.params;
    try {
        const deletedLesson = await Lesson.findByIdAndDelete(id);
        if (!deletedLesson) {
            return sendErrorResponse(res, {}, "Lesson not found", STATUS_CODE.NOT_FOUND);
        }

        if (deletedLesson.module_id) {
            await Module.findByIdAndUpdate(deletedLesson.module_id, {
                $pull: { lessons: id }
            });
        }

        const Problem = require('../models/Problem');
        await Problem.deleteMany({ lesson_id: id });

        return sendSuccessResponse(res, {}, "Lesson deleted successfully", STATUS_CODE.OK);
    } catch (err) {
        console.log(err);
        return sendErrorResponse(res, err, "Failed to delete lesson", STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}

module.exports={
    createLesson,
    getAllLessons,
    getLessonById,
    updateLesson,
    deleteLesson
}