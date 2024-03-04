export default {
    swagger: {
        info: {
            title: 'Lands And Homes API',
            description: '(Codename: Zeal) API to access the Lands And Homes infrastructure',
            version: '0.0.0'
        },
        externalDocs: {
            url: 'https://landsandhomes.atlassian.net/wiki/spaces/LK/overview',
            description: 'Find more info here'
        },
        host: `${process.env.APP_HOST}:${process.env.APP_PORT}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [{ name: 'User', description: 'User related end-points' }],
        definitions: {
            User: {
                type: 'object',
                required: ['id', 'email'],
                properties: {
                    id: { type: 'integer', format: 'int64' },
                    uniqueId: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    password: { type: 'string' },
                    email: { type: 'string', format: 'email' }
                }
            }
        },
        securityDefinitions: {
            apiKey: {
                type: 'apiKey',
                name: 'apiKey',
                in: 'header'
            }
        }
    }
}
