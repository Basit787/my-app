import { type ChatGroupDto } from "@app/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export class GroupParamDto {
  @IsMongoId()
  groupId!: string;
}

export class CreateGroupDto {
  @ApiProperty({ example: "Weekend trip", maxLength: 64 })
  @Transform(trim)
  @IsString()
  @Length(1, 64)
  name!: string;

  @ApiPropertyOptional({ example: "Plans and photos", maxLength: 500 })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: ["sam", "kim"], description: "Usernames besides the creator (1–31)" })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(31)
  @IsString({ each: true })
  @Length(1, 64, { each: true })
  members!: string[];
}

export class UpdateGroupDto {
  @ApiPropertyOptional({ maxLength: 64 })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class GroupResponseDto implements ChatGroupDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ description: "Avatar path, empty when none" }) image!: string;
  @ApiProperty({ example: "group..6650f1c2a1b2c3d4e5f60708" }) room!: string;
  @ApiProperty({ type: [String] }) members!: string[];
  @ApiProperty() createdBy!: string;
  @ApiProperty({ format: "date-time" }) createdAt!: string;
  @ApiProperty({ format: "date-time" }) updatedAt!: string;
}

export class GroupsResponseDto {
  @ApiProperty({ type: [GroupResponseDto] })
  groups!: GroupResponseDto[];
}
