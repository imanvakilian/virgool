import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateImageDto {
    @ApiProperty()
    @IsString()
    name: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    alt: string;
    @ApiProperty({ format: "binary" })
    image: string;
}
