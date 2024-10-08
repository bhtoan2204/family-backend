import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateChecklistDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id_checklist: number;

  @ApiProperty({
    type: Number,
    description: 'ID of family',
    required: true,
    example: 97,
  })
  @IsNotEmpty()
  @IsNumber()
  id_family: number;

  @ApiProperty({
    type: Number,
    description: 'ID of Checklist type',
    required: true,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  id_checklist_type: number;

  @ApiProperty({
    type: String,
    description: 'Name of checklist',
    required: true,
    example: 'Name of checklist',
  })
  @IsOptional()
  @IsString()
  task_name: string;

  @ApiProperty({
    type: String,
    description: 'Description of checklist',
    required: false,
    example: 'Description of checklist',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Due date of checklist',
    required: true,
    example: '2024-06-06T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  due_date: string;

  @ApiProperty({
    type: Boolean,
    description: 'Status of checklist',
    required: true,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_completed: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id_calendar: number;
}
