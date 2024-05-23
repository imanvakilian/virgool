import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @Length(3, 50)
    @ApiProperty()
    title: string;
    @IsString()
    @Length(3, 50)
    @ApiProperty({ required: false })
    priority: string;

}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }
