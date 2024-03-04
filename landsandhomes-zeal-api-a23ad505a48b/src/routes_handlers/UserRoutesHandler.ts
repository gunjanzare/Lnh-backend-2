import { type FastifyRequest, type FastifyReply } from 'fastify'
import { CurdRouteHandler } from '../core/RouteHandler'
import { hashPassword } from '../utils/crypto'
import type { UserAccountType } from '../types/user'

export class UserRoutesHandler extends CurdRouteHandler {
    registerRoutes(): void {
        this.app.post('/users', this.create.bind(this))
        this.app.get(
            '/users/:id',
            {
                onRequest: [(this.app as any).verifySession]
            },
            this.fetch.bind(this)
        )
        this.app.put(
            '/users/:id',
            {
                onRequest: [(this.app as any).verifySession]
            },
            this.update.bind(this)
        )
        this.app.delete(
            '/users/:id',
            {
                onRequest: [(this.app as any).verifySession]
            },
            this.delete.bind(this)
        )
    }

    async create(
        request: FastifyRequest<{
            Body: {
                name: string
                email: string
                phoneNumber: string
                password: string
                accountType: UserAccountType
            }
        }>,
        reply: FastifyReply
    ): Promise<void> {
        const { name, email, phoneNumber, password, accountType } = request.body

        if (!(name && email && phoneNumber && password && accountType)) {
            reply.code(400).send({
                error: 400,
                message: 'Invalid request. missing required field/s.'
            })
            return
        }

        switch (accountType) {
            case 'endUser':
                const organization = await this.db.organization.findFirst({
                    where: {
                        name: 'App'
                    }
                })
                if (!organization) {
                    throw new Error('Organization not found.')
                }

                const organizationUnit =
                    await this.db.organizationUnit.findFirst({
                        where: {
                            name: 'endUsers',
                            organizationId: organization.id
                        }
                    })

                if (!organizationUnit) {
                    throw new Error(
                        `OrganizationUnit not found for organization '${organization.name}`
                    )
                }

                const addedEndUser = await this.db.user.create({
                    data: {
                        name,
                        email,
                        phoneNumber,
                        password: await hashPassword(password),
                        organizationId: organization.id,
                        organizationUnitId: organizationUnit.id
                    }
                })
                this.app.log.info('User created:', addedEndUser.uniqueId)
                await reply.code(200).send({
                    message: 'success',
                    data: {
                        name: addedEndUser.name,
                        email: addedEndUser.email,
                        phoneNumber: addedEndUser.phoneNumber,
                        uniqueId: addedEndUser.uniqueId
                    }
                })

                break
            case 'agent':
                // 1. create a new org and 'admin' org unit with placeholder name
                const agentOrg = await this.db.organization.create({
                    data: {
                        name: `Properties by ${name}`,
                        type: 'AGENT',
                        address: 'Placeholder address',
                        location: 'Placeholder location'
                    }
                })
                const agentOrgUnit = await this.db.organizationUnit.create({
                    data: {
                        name: 'admin',
                        businessPurpose: 'admin',
                        organizationId: agentOrg.id
                    }
                })
                // 2. create a new  user with the new org and admin org unit
                const addedAgentUser = await this.db.user.create({
                    data: {
                        name,
                        email,
                        phoneNumber,
                        password: await hashPassword(password),
                        organizationId: agentOrg.id,
                        organizationUnitId: agentOrgUnit.id
                    }
                })
                this.app.log.info('User created:', addedAgentUser.uniqueId)
                await reply.code(200).send({
                    message: 'success',
                    data: {
                        name: addedAgentUser.name,
                        email: addedAgentUser.email,
                        phoneNumber: addedAgentUser.phoneNumber,
                        uniqueId: addedAgentUser.uniqueId
                    }
                })
                break
            case 'builder':
                // 1. create a new org and 'admin' org unit with placeholder name
                // 2. create a new  user with the new org and admin org unit
                throw new Error('Account creation not implemented.')
                break
            case 'listingCollaborator':
                // 1. verify JWT and decode the user's org
                // 2. create a new publisher org unit in user's org with placeholder name
                // if org unit does not exist
                // and give it the business purpose 'listingCollaboration'
                // 3. create a new  user with the user's org and publisher org unit
                throw new Error('Account creation not implemented.')
                break
            case 'salesCollaborator':
                // 1. verify JWT and decode the user's org
                // 2. create a new sales org unit in user's org with placeholder name
                // if org unit does not exist
                // and give it the business purpose 'salesCollaboration'
                // 3. create a new  user with the user's org and sales org unit
                throw new Error('Account creation not implemented.')
                break
            case 'appListingQa':
                // 1. verify JWT and decode the user's information and verify that the user is the superadmin
                // 2. create a new publisher org unit in user's org with placeholder name
                // if org unit does not exist
                // and give it the business purpose 'listingQa'
                throw new Error('Account creation not implemented.')

                break
            case 'appSalesManager':
                // 1. verify JWT and decode the user's information and verify that the user is the superadmin
                // 2. create a new publisher org unit in user's org with placeholder name
                // if org unit does not exist
                throw new Error('Account creation not implemented.')
                break

            default:
                throw new Error('Account creation not implemented.')
        }
    }

    async fetch(
        request: FastifyRequest<{
            Params: {
                id: string
            }
        }>,
        reply: FastifyReply
    ): Promise<void> {
        const { id } = request.params
        const user = await this.db.user.findUnique({
            where: {
                id: `${id}`
            }
        })

        if (!user || user === null) {
            reply.code(200).send({
                message: 'User not found.'
            })
            throw new Error('User not found.')
        }

        const { name, email, phoneNumber, uniqueId, createdAt } = user

        reply.code(200).send({
            message: 'success',
            data: {
                name,
                email,
                phoneNumber,
                uniqueId,
                createdAt: createdAt.getTime()
            }
        })
    }

    async update(
        request: FastifyRequest<{
            Params: {
                id: string
            }
            Body: {
                name: string
                email: string
                phoneNumber: string
                password: string
            }
        }>,
        reply: FastifyReply
    ): Promise<void> {
        const { id } = request.params
        const user = await this.db.user.update({
            where: {
                id: `${parseInt(id)}`
            },
            data: {
                name: request.body.name,
                email: request.body.email,
                phoneNumber: request.body.phoneNumber,
                password: request.body.password
            }
        })

        if (!user || user === null) {
            reply.code(400).send({
                error: 400,
                message: 'User not found.'
            })
            throw new Error('User not found.')
        }

        const { name, email, phoneNumber, uniqueId, createdAt } = user

        reply.code(200).send({
            message: 'success',
            data: {
                name,
                email,
                phoneNumber,
                uniqueId,
                createdAt
            }
        })
    }

    async delete(
        request: FastifyRequest<{
            Params: {
                id: string
            }
        }>,
        reply: FastifyReply
    ): Promise<void> {
        const { id } = request.params
        const user = await this.db.user.delete({
            where: {
                id: `${parseInt(id)}`
            }
        })

        if (!user || user === null) {
            reply.code(400).send({
                error: 400,
                message: 'User not found.'
            })
            throw new Error('User not found.')
        }

        const { name, email, phoneNumber, uniqueId, createdAt } = user

        reply.code(200).send({
            message: 'success',
            data: {
                name,
                email,
                phoneNumber,
                uniqueId,
                createdAt
            }
        })
    }

    /** Schemas */
    private createUserSchema = {
        description: 'Creates a new user',
        tags: ['User'],
        summary: 'Creates a new user',
        body: {
            type: 'object',
            properties: {
                name: {
                    description: 'Name of the user',
                    type: 'string'
                },
                phoneNumber: {
                    description: 'Phone number of the user',
                    type: 'string',
                    minLength: 8
                },
                email: {
                    type: 'string',
                    format: 'email',
                    description: 'Email of the user'
                },
                password: {
                    type: 'string',
                    description: 'Password of the user',
                    minLength: 8
                },
                gstNumber: {
                    type: 'string',
                    description: 'GST number of the user',
                    minLength: 15,
                    maxLength: 15
                },
                reraNumber: {
                    type: 'string',
                    description: 'RERA number of the user',
                    minLength: 10,
                    maxLength: 10
                },
                accountType: {
                    type: 'string',
                    enum: [
                        'admin',
                        'endUser',
                        'agent',
                        'builder',
                        'listingCollaborator',
                        'salesCollaborator',
                        'appListingQa',
                        'appSalesManager'
                    ],
                    description: 'Type of account to create',
                    default: 'endUser'
                }
            },
            required: [
                'name',
                'phoneNumber',
                'email',
                'password',
                'accountType'
            ]
        },
        response: {
            200: {
                description: 'User created successfully',
                type: 'object',
                properties: {
                    message: {
                        description: 'Success message',
                        type: 'string'
                    },
                    data: {
                        type: 'object',
                        properties: {
                            name: {
                                description: 'Name of the user',
                                type: 'string'
                            },
                            email: {
                                type: 'string',
                                format: 'email',
                                description: 'Email of the user'
                            },
                            phoneNumber: {
                                description: 'Phone number of the user',
                                type: 'string',
                                minLength: 8
                            },
                            uniqueId: {
                                description: 'Unique ID of the user',
                                type: 'string'
                            }
                        }
                    }
                }
            },
            400: {
                description: 'Bad request',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        },
        security: [
            {
                apiKey: []
            }
        ]
    }
}
