import { Role } from "./Role.model";

export class RegistrationRequest{
    userName: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    password: string;
    userRoles: Role[]
}