import Joi from "joi";

// TODO: Update to reflect interfaces
export const channelSchema = Joi.object({
	id: Joi.string().length(24).required(), // objectid but joi uses string for this
	channelName: Joi.string().required(),

	desc: Joi.string(),

	createdBy: Joi.string().required(),
	isLocked: Joi.boolean().required(),
	members: Joi.array().items(Joi.string()).required(), // array of oid

	createdAt: Joi.date(),
	updatedAt: Joi.date(),
});

export const userSchema = Joi.object({
	id: Joi.string().length(24).required(),
	userName: Joi.string().min(1).required(),
	email: Joi.string().min(1).required(),
	password: Joi.string().min(1).required(),
	isAdmin: Joi.boolean().required(),
});

export const messagetSchema = Joi.object({
	id: Joi.string().hex().length(24).required(),
	channelId: Joi.string().hex().length(24).required(),
	userId: Joi.string().hex().length(24).required(),

	recipientId: Joi.string().hex().length(24),

	content: Joi.string().min(1).required(),

	taggedUsers: Joi.array().items(Joi.string().hex().length(24)),
	createdAt: Joi.date(),
	updatedAt: Joi.date(),
});

export const idSchema = Joi.object({
	_id: Joi.string().hex().length(24).required(),
});

// export const deleteProductSchema = Joi.object({
// 	id: Joi.string().required().length(24).hex(),
// });
