import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentUser,
  FamilyTermCheckGuard,
  JwtAuthGuard,
  MemberFamilyGuard,
  Permission,
  PERMISSION_EDUCATION,
} from '../utils';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/createEducation.dto';
import { UpdateEducationDto } from './dto/updateEducation.dto';
import { GetEducationDto } from './dto/getEducation.dto';

@ApiTags('Education')
@Controller('education')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, FamilyTermCheckGuard, MemberFamilyGuard)
@Permission([PERMISSION_EDUCATION])
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create education progress' })
  @Post('create')
  async createEducationProgress(
    @CurrentUser() currentUser,
    @Body() dto: CreateEducationDto,
  ) {
    return this.educationService.createEducationProgress(
      currentUser.id_user,
      dto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all education progress' })
  @Get('getAll')
  async getAllEducationProgress(
    @CurrentUser() currentUser,
    @Query() dto: GetEducationDto,
  ) {
    return this.educationService.getAllEducationProgress(
      currentUser.id_user,
      dto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get education progress detail' })
  @ApiParam({ name: 'id_family', required: true, type: Number })
  @ApiParam({ name: 'id_education_progress', required: true, type: Number })
  @Get('getDetail/:id_family/:id_education_progress')
  async getDetailEducationProgress(
    @CurrentUser() currentUser,
    @Param('id_family') id_family,
    @Param('id_education_progress') id_education_progress,
  ) {
    return this.educationService.getDetailEducationProgress(
      currentUser.id_user,
      id_family,
      id_education_progress,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update education progress' })
  @Put('update')
  async updateDetailEducationProgress(
    @CurrentUser() currentUser,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.educationService.updateDetailEducationProgress(
      currentUser.id_user,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete education progress' })
  @Delete('delete/:id_education_progress/:id_family')
  @ApiParam({ name: 'id_family', required: true, type: Number })
  @ApiParam({ name: 'id_education_progress', required: true, type: Number })
  async deleteEducationProgress(
    @CurrentUser() currentUser,
    @Param('id_family') id_family,
    @Param('id_education_progress') id_education_progress,
  ) {
    return this.educationService.deleteEducationProgress(
      currentUser.id_user,
      id_family,
      id_education_progress,
    );
  }
}
