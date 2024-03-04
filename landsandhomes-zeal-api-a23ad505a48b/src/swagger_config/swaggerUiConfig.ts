export default {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: true
    },
    uiHooks: {
        onRequest: function (request: any, reply: any, next: () => void) {
            next()
        },
        preHandler: function (request: any, reply: any, next: () => void) {
            next()
        }
    },
    staticCSP: true,
    transformStaticCSP: (header: any) => header,
    transformSpecification: (swaggerObject: any, request: any, reply: any) => {
        return swaggerObject
    },
    transformSpecificationClone: true
}
