import fastify, { type FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import swaggerConfig from './swagger_config/swaggerConfig'
import swaggerUiConfig from './swagger_config/swaggerUiConfig'
import 'dotenv/config'
import { UserRoutesHandler } from './routes_handlers/UserRoutesHandler'
import { TokenRouteHandler, TokenVerifier } from './middlewares/AuthMiddleware'
import { JWT_SIGNING_SECRET } from './configs/secrets'
import cors from '@fastify/cors'
import packageJson from '../package.json'

// Create an instance of the PrismaClient
const db = new PrismaClient()

const app: FastifyInstance = fastify({
    logger: true,
    ajv: {
        customOptions: {
            allErrors: true,
            validateFormats: true
        }
    }
})

const registerRoutes = (): void => {
    app.post('/auth', TokenRouteHandler)
    app.decorate('verifySession', TokenVerifier)
    const UserRouteHandler = new UserRoutesHandler(app, '/users', db)
    UserRouteHandler.registerRoutes()
    // Auth session handling with JWT
    app.get(
        '/',
        {
            onRequest: [(app as any).verifySession]
        },
        async function (request, reply) {
            return { app: packageJson.name, version: packageJson.version }
        }
    )
}
/**
 * Run the server!
 */
const start = async (): Promise<void> => {
    try {
        // Register Swagger for API documentation
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-var-requires
        await app.register(require('@fastify/swagger'), swaggerConfig)
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-argument
        await app.register(require('@fastify/swagger-ui'), swaggerUiConfig)
        await app.register(require('@fastify/jwt'), {
            secret: JWT_SIGNING_SECRET
        })
        await app.register(cors, { 
            // put your options here
            origin:"*"
          })
          
        registerRoutes()
        await app.ready()
        await app.listen({
            port: (process.env as any).APP_PORT,
            host: (process.env as any).APP_HOST
        })
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        app.log.info(
            `server listening on ${JSON.stringify(
                (app.server.address() as any).port
            )}`
        )
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}
void start()
