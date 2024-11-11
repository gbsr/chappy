import Joi from "joi";
export const channelSchema = Joi.object({
	channelName: Joi.string().required(),
	desc: Joi.string(),
	createdBy: Joi.string().required(),
	isLocked: Joi.boolean().required(),
	members: Joi.array().items(Joi.string()).required(), // array of oid
	createdAt: Joi.date(),
	updatedAt: Joi.date().optional().allow(null),
});
export const userSchema = Joi.object({
	userName: Joi.string().min(1).required(),
	email: Joi.string().min(1).required(),
	password: Joi.string().min(1).required(),
	createdAt: Joi.date(),
	updatedAt: Joi.date().optional().allow(null),
	isAdmin: Joi.boolean().required(),
});
export const messageSchema = Joi.object({
	channelId: Joi.string().hex().length(24).optional().allow(null), // Just make it optional
	userId: Joi.string().hex().length(24).required(),
	recipientId: Joi.string().hex().length(24).optional().allow(null),
	content: Joi.string().min(1).required(),
	taggedUsers: Joi.array().items(Joi.string().hex().length(24)).optional(),
	createdAt: Joi.date().optional().allow(null),
	updatedAt: Joi.date().optional().allow(null),
});
export const idSchema = Joi.object({
	_id: Joi.string().hex().length(24).required(),
});
