import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, Length } from "class-validator";

export class CreateBlogDto {
    @ApiProperty()
    @IsNotEmpty()
    @Length(3, 100)
    title: string;
    @ApiProperty()
    @IsNotEmpty()
    @Length(5, 200)
    description: string;
    @ApiProperty()
    @IsNotEmpty()
    @Length(100)
    content: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsNumberString()
    time_for_study: string;
    @ApiPropertyOptional()
    image: string;
    @ApiPropertyOptional({ type: "string", isArray: true })
    categories: string[] | string;
    @ApiPropertyOptional()
    slug: string;
}
export class UpdateBlogDto extends PartialType(CreateBlogDto) {

}
export class SearchBlogDto {
    category: string;
    search: string
}
