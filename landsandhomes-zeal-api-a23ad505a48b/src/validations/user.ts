import zod from 'zod'

export const userCreateSchema = zod.object({
    name: zod.string().min(3, 'Name is too short').max(80, 'Name is too long'),
    email: zod
        .string()
        .email("Email isn't valid")
        .max(255, 'Email is too long'),
    password: zod.string().min(6).max(255),
    confirmPassword: zod.string().min(6).max(255)
})
