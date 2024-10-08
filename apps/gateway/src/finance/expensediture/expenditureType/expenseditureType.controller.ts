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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../utils';
import { ExpenseditureTypeService } from './expenseditureType.service';
import { CurrentUser } from 'apps/gateway/src/utils';
import { CreateExpenseditureTypeDto } from './dto/createExpenseditureType.dto';
import { UpdateExpenseditureTypeDto } from './dto/updateExpenseditureType.dto';

@ApiTags('Expensediture Type')
@Controller('finance/expenseditureType')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ExpenseditureTypeController {
  constructor(private readonly expenseTypeService: ExpenseditureTypeService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get expenseditures' })
  @ApiQuery({ name: 'page', type: Number })
  @ApiQuery({ name: 'itemsPerPage', type: Number })
  @Get('getExpenseType/:id_family')
  async getExpenseType(
    @CurrentUser() currentUser,
    @Param('id_family') id_family: number,
    @Query('page') page: number,
    @Query('itemsPerPage') itemsPerPage: number,
  ) {
    return this.expenseTypeService.getExpenseditureType(
      currentUser.id_user,
      id_family,
      page,
      itemsPerPage,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create expensediture' })
  @Post('createExpenseType')
  async createExpenseType(
    @CurrentUser() currentUser,
    @Body() dto: CreateExpenseditureTypeDto,
  ) {
    return this.expenseTypeService.createExpenseditureType(
      currentUser.id_user,
      dto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update expensediture' })
  @Put('updateExpenseType')
  async updateExpenseType(
    @CurrentUser() currentUser,
    @Body() dto: UpdateExpenseditureTypeDto,
  ) {
    return this.expenseTypeService.updateExpenseditureType(
      currentUser.id_user,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete expensediture' })
  @Delete('deleteExpenseType/:id_family/:id_expenditure_type')
  async deleteExpenseType(
    @CurrentUser() currentUser,
    @Param('id_expenditure_type') id_expenditure_type: number,
    @Param('id_family') id_family: number,
  ) {
    return this.expenseTypeService.deleteExpenseditureType(
      currentUser.id_user,
      id_family,
      id_expenditure_type,
    );
  }
}
