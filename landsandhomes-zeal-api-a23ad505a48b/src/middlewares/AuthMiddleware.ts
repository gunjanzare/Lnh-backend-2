import { type FastifyReply, type FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { comparePasswords, encrypt } from '../utils/crypto'
import { JWT_EXPIRATION } from '../configs/secrets'

const prisma = new PrismaClient()

// Route function for JWT creation
export const TokenRouteHandler = async (
    request: FastifyRequest<{
        Body: {
            email: string
            password: string
            grantType: 'password'
            accountType: 'admin' | 'endUser' | 'builder' | 'agent'
        }
    }>,
    reply: FastifyReply
): Promise<void> => {
    const { email, password } = request.body

    const user = await prisma.user.findFirst({
        where: {
            email
        }
    })

    if (!user) {
        reply.status(401).send({ message: 'Invalid credentials' })
        throw new Error('User not found.')
    }
    if (!(await comparePasswords(password, user.password))) {
        reply.status(401).send({ message: 'Invalid credentials' })
    }
    const { organizationId, organizationUnitId } = user
    const userOrgUnit = await prisma.organizationUnit.findFirst({
        where: {
            id: organizationUnitId
        }
    })

    const token = await (reply as any).jwtSign(
        {
            payload: encrypt(
                JSON.stringify({
                    ...user,
                    ...{
                        organizationId,
                        organizationUnitId,
                        userOrgUnitName: userOrgUnit?.name
                    }
                })
            )
        },
        { expiresIn: JWT_EXPIRATION }
    )
    reply.code(200).send({ token })
}

export const TokenVerifier = async (
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    try {
        await (request as any).jwtVerify()
    } catch (err) {
        await reply.send(err)
    }
}
