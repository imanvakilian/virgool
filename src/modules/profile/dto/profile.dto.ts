import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsMobilePhone, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator";
import { Gender } from "../enums/profile.enum";

export class UserProfileDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(3, 70)
    nick_name: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(1, 200)
    bio: string;
    @ApiPropertyOptional({ enum: Gender })
    @IsOptional()
    @IsEnum(Gender)
    gender: string;
    @ApiPropertyOptional({ format: "binary" })
    @IsOptional()
    profile_image: string;
    @ApiPropertyOptional({ format: "binary" })
    @IsOptional()
    background_image: string;
    @ApiPropertyOptional()
    @IsOptional()
    birthday: Date;
    @ApiPropertyOptional()
    @IsOptional()
    @Length(3, 100)
    linkedin_account: string;
    @ApiPropertyOptional()
    @IsOptional()
    @Length(3, 100)
    x_account: string;
}

export class ChangeEmailDto {
    @ApiProperty()
    @IsEmail()
    email: string;
}

export class ChangeMobileDto {
    @ApiProperty()
    @IsMobilePhone("fa-IR")
    mobile: string;
}

export class ChangeUsernameDto {
    @ApiProperty()
    @IsString()
    @Length(3, 50)
    username: string;
}
