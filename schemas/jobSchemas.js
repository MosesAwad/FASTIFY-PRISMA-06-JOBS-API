
const createJobOpts = {
    schema: {
        body: {
            type: 'object',
            additionalProperties: false,    // Prisma doesn't like additional properties (either destructure explicitly in controllers or use addiontalProperties: false in Fastify schema validator)
            properties: {
                role: {type: 'string', maxLength: 100},
                company: {type: 'string', maxLength: 50}, 
                status: {type: 'string', enum: ['interview', 'pending', 'decline'], default: 'pending'}
            },
            required: ['role', 'company']
        }
    }
}

const updateJobOpts = {
    schema: {
        body: {
            type: 'object',
            additionalProperties: false, // Prisma doesn't like additional properties (either destructure explicitly in controllers or use addiontalProperties: false in Fastify schema validator)
            properties: {
                role: {type: 'string', maxLength: 100},
                company: {type: 'string', maxLength: 50}, 
                status: {type: 'string', enum: ['interview', 'pending', 'decline'], default: 'pending'},
                // createdBy: {type: 'integer'}
            }
        },
    }
}

module.exports = {
    createJobOpts,
    updateJobOpts
}
