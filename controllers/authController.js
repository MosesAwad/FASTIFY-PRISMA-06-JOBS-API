const { StatusCodes } = require("http-status-codes");
const bcrypt = require('bcryptjs');
const CustomError = require('../errors');

module.exports = (userModel, prisma) => ({		// Note 1
	register:
		async (request, reply) => {
			const { name, email, password } = request.body
			const hashedPassword = await userModel.hashPassword(password)
			const user = await prisma.user.create({
				data: { name, email, password: hashedPassword }
			})
			const token = userModel.createJWT(user)
			reply.send({ user: { name: user.name }, token })
		},
	login:
		async (request, reply) => {
			const { email, password } = request.body;
			const user = await prisma.user.findUnique({
				where: { email }
			});
			if (!user) throw new CustomError.UnauthenticatedError('Invalid credentials');
			const isPasswordCorrect = await userModel.comparePassword(password, user.password);
			if (!isPasswordCorrect) throw new CustomError.UnauthenticatedError('Invalid credentials');
			const token = userModel.createJWT(user);
			reply.send({ user: { name: user.name }, token });
		},
	errorHandler:
		(err, request, reply) => {
			console.log(err);
			let customError = {
				statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
				msg: err.message || 'Something went wrong, try again later',
			};

			if (err.code && err.code === 'P2002') {
				customError.statusCode = StatusCodes.BAD_REQUEST
    			customError.msg = `Duplicate value entered for the ${err.meta.target.join(',')} field(s). Please choose another value`
			}
			reply.status(customError.statusCode).send({ error: customError.msg });
		}
});

/*
	Notes

	Note 1

		// Simple sample regular arrow function with return:
		const add = (a, b) => {
			return a + b;
		};

		// Same function using parentheses shorthand (no need for return):
		const addShort = (a, b) => (a + b);

		So the parenthesis scoping the whole module export is shorthand syntax to do this:

			module.exports = (userModel) => ({
				register: async (req, res) => { use userModel here },
				login: async (req, res) => { use userModel here },
				errorHandler: (err, req, res) => { errorHandler logic here }
			});

		instead of this:

			module.exports = (userModel) => {
				return {
					register: async (req, res) => { use userModel here },
					login: async (req, res) => { use userModel here },
					errorHandler: (err, req, res) => { errorHandler logic here }
				}
			};
*/