import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEducationDto {
  @ApiProperty({ description: 'The ID of the family' })
  @IsNotEmpty()
  @IsNumber()
  id_family: number;

  @ApiProperty({ description: 'The title of the education' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the education' })
  @IsOptional()
  @IsString()
  progress_notes: string;

  @ApiProperty({ description: 'The school information of the education' })
  @IsOptional()
  @IsString()
  school_info: string;
}
