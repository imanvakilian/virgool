export type responseResult = { token: string, code: string }
export type jwtOtpPayload = { userId: number };
export type jwtAccessTokenPayload = { userId: number };
export type jwtEmailTokenPayload = { email: string };
export type jwtMobileTokenPayload = { mobile: string };
export interface IgoogleService {
    firstname?: string;
    lastname?: string;
    email: string;
}