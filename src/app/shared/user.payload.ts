export class UserPayload {
    id: number;
    name: string;
    phone: string;
    email: string;
    avatar: string;
    roles: {
        id: number;
        name: string;
        is_default: boolean;
    }[]
}

export class Role {
    id: number;
    name: string;
    slug: string;
}

export default interface TokenPayload {
    user: UserPayload;
    iat: number;
    exp: number;
}