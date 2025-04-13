const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

module.exports = (prisma) => ({
    createJob:  async (request, reply) => {
		const jobData = {
			...request.body,	// Prisma doesn't like additional properties so copying req.body would lead to prisma error if body contained extra unknown property (either destructure explicitly in controllers or use addiontalProperties: false in Fastify schema validator)
			created_by: request.user.userId
		}
		const job = await prisma.job.create({
			data: jobData
		})
		reply.send(job);
	},
    getAllJobs: async (request, reply) => {
		const {user: {userId}} = request;
		const jobs = await prisma.job.findMany({
			where: {
				created_by: userId
			}
		})
		reply.send({ jobs, numOfJobs: jobs.length });
	},
    getJob: async (request, reply) => {
		const {params: {id: jobId}, user: {userId}} = request;
		const job = await prisma.job.findFirst({
			where: {
				id: jobId,
				created_by: userId
			}
		})
		if (!job) {
			throw new NotFoundError(`No job with id of ${jobId} was found!`);
		}
		reply.send(job);
	},
    updateJob: async (request, reply) => {
		const {
			body: payload,
			params: {id: jobId},
			user: { userId }
		} = request;
		const updatedJob = await prisma.job.update({
			where: {
				id: jobId,
				created_by: userId  // Ensures user owns the job
			},
			data: payload
		});
		// if (!updatedJob) check is redundant and won't be reached in case the job id was given incorrectly in the url, in Prisma, the .update() method automatically 
		// throws an error (PrismaClientKnownRequestError with code P2025) if no record matches the where condition. Yes, that is only for update and delete, in 
		// .findFirst() which was used in the getJob controller, it actually returns null instead of throwing an exception.
		reply.send(updatedJob);
	},
    deleteJob: async (request, reply) => {
		const {
			params: {id: jobId},
			user: {userId}
		} = request;
		const deletedJob = await prisma.job.delete({
			where: {
			  id: jobId,
			  created_by: userId  // Ensures user owns the job
			}
		});
		// if (!deletedJob) check is redundant and won't be reached in case the job id was given incorrectly in the url, in Prisma, the .delete() method automatically 
		// throws an error (PrismaClientKnownRequestError with code P2025) if no record matches the where condition. Yes, that is only for update and delete, in 
		// .findFirst() which was used in the getJob controller, it actually returns null instead of throwing an exception.		
		reply.send();
	},
    errorHandler: (err, request, reply) => {
		console.log(err)
		let customError = {
			statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
			msg: err.message || 'Something went wrong, try again later',
		};
		if (err.code === 'P2025') {
			customError.statusCode = StatusCodes.NOT_FOUND;
			customError.msg = `No matching job id was found!`;
		}
		reply.status(customError.statusCode).send({ error: customError.msg });
	}
});
