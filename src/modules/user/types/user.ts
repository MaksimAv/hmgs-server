import { UserRoleEnum } from '../user-role.enum';

export type UserUniqueValidation = { phone: string; email?: string };
export type UserRoleType = keyof typeof UserRoleEnum;
