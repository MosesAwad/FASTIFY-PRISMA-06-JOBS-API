require('dotenv').config()
const fastify = require('fastify')({ logger: true })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()  // Initialize ONCE here

const authRoutes = require('./routes/authRoutes.js')
const jobRoutes = require('./routes/jobRoutes.js')

const User = require('./models/User')
// const Job = require('./models/Job')

const start = async () => {
    try {
        // 1. NO NEED FOR DB CONNECTION, TABLE INIT, OR JOB MODEL
        const userModel = new User()

        // 2. Register routes (unchanged)
        fastify.register(authRoutes, { userModel, prisma })
        fastify.register(jobRoutes, { prisma })

        // 3. Start server (unchanged)
        await fastify.listen({ port: 3000 })
        console.log('Server running on http://localhost:3000')
    } catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}

start()