const bcrypt = require('bcryptjs')
const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

class User {
    // Remove constructor(db) (Prisma instance is instead passed into the Fastify routes as an instance)

    // Remove initTable() (Prisma handles migrations)

    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        return hashedPassword
    }

    async comparePassword(candidatePassword, userPassword) {
        const isMatch = await bcrypt.compare(candidatePassword, userPassword);
        return isMatch;
    }

    createJWT(user) {
        return jwt.sign({ userId: user.id, name: user.name }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        })
    }
}

module.exports = User;
