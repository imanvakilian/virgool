import { ApiProperty } from "@nestjs/swagger"
import { AuthType } from "../enum/authType.enum";
import { AuthMethod } from "../enum/authMethod.enum";
import { Length } from "class-validator";

export class AuthDto {
    @ApiProperty()
    @Length(3, 100)
    username: string;
    @ApiProperty({ enum: AuthType })
    type: string;
    @ApiProperty({ enum: AuthMethod })
    method: string;
}

export class CheckOtpDto {
    @ApiProperty()
    @Length(5, 5)
    code: string;
}
