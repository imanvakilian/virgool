import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, Length } from "class-validator";

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @Length(1, 500)
    text: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumberString()
    parentId: number;
    @ApiProperty()
    @IsNumberString()
    blogId: number;
}