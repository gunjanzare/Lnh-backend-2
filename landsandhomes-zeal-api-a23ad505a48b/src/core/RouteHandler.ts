import { type PrismaClient } from '@prisma/client'
import { type FastifyReply, type FastifyInstance, type FastifyRequest } from 'fastify'

export abstract class CurdRouteHandler {
    constructor(
        protected app: FastifyInstance,
        protected basePath: string,
        protected db: PrismaClient
    ) {
        this.app = app
        this.basePath = basePath
        this.db = db
    }

    abstract registerRoutes(): void
    abstract create(request: FastifyRequest<any>, reply: FastifyReply): Promise<void>
    abstract fetch(request: FastifyRequest<any>, reply: FastifyReply): Promise<void>
    abstract update(request: FastifyRequest<any>, reply: FastifyReply): Promise<void>
    abstract delete(request: FastifyRequest<any>, reply: FastifyReply): Promise<void>
}
