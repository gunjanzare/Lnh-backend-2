import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
    const organization = await prisma.organization.create({
        data: {
            name: 'App',
            address: '',
            location: ''
        }
    })
    const systemUsersOrganizationUnit = await prisma.organizationUnit.create({
        data: {
            name: 'systemUsers',
            businessPurpose: 'root',
            organizationId: organization.id
        }
    })
    const adminOrganizationUnit = await prisma.organizationUnit.create({
        data: {
            name: 'admins',
            businessPurpose: 'administrators',
            organizationId: organization.id
        }
    })
    const endUserOrganizationUnit = await prisma.organizationUnit.create({
        data: {
            name: 'endUsers',
            businessPurpose: 'consumers',
            organizationId: organization.id
        }
    })
    const systemUser = await prisma.user.create({
        data: {
            name: 'System User',
            email: 'system@landsandhomes.com',
            password: '',
            phoneNumber: '+910001',
            organizationId: organization.id,
            organizationUnitId: systemUsersOrganizationUnit.id
        }
    })
    const admin = await prisma.user.create({
        data: {
            name: 'Admin',
            email: 'admin@landsandhomes.com',
            password: '',
            phoneNumber: '+910002',
            organizationId: organization.id,
            organizationUnitId: adminOrganizationUnit.id
        }
    })
    const endUser = await prisma.user.create({
        data: {
            name: 'Test User',
            email: 'testuser@landsandhomes.com',
            password: '',
            phoneNumber: '+910003',
            organizationId: organization.id,
            organizationUnitId: endUserOrganizationUnit.id
        }
    })
    console.log(
        'bootstrapped app with organization, organization units, and users',
        {
            organization,
            systemUsersOrganizationUnit,
            adminOrganizationUnit,
            endUserOrganizationUnit,
            systemUser,
            admin,
            endUser
        }
    )
}

main()
    .catch((e) => {
        throw e
    })
    .finally(() => {
        void prisma.$disconnect()
    })
