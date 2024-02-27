import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FamilyService } from "./family.service";
import { createFamilyDto } from "./dto/createFamilyDto.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentUser } from "apps/gateway/decorator/current-user.decorator";

@ApiTags('Family')
@Controller('family')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}
  
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a family' })
  @Get('getoneFamily')
  @UseGuards(JwtAuthGuard)
  async getFamily(@CurrentUser() user) {
    return this.familyService.getFamily(user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a family' })
  @Post('createFamily')
  @UseGuards(JwtAuthGuard)
  async createFamily(@CurrentUser() user, @Body() createFamilyDto: createFamilyDto) {
    return this.familyService.createFamily(user,createFamilyDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a family' })
  @Put('updateFamily')
  @UseGuards(JwtAuthGuard)
  async updateFamily(@CurrentUser() user, @Body() createFamilyDto: createFamilyDto) {
    return this.familyService.updateFamily(user,createFamilyDto);
  }

  @HttpCode(HttpStatus.OK)// trar veef code
  @ApiOperation({ summary: 'Delete a family' })
  @Delete('deleteFamily')
  @UseGuards(JwtAuthGuard)
  async deleteFamily(@CurrentUser() user) {
    return this.familyService.deleteFamily(user);
  }
}