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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { HouseholdService } from './household.service';
import {
  CurrentUser,
  FamilyTermCheckGuard,
  JwtAuthGuard,
  MemberFamilyGuard,
  Permission,
  PERMISSION_HOUSEHOLD,
} from '../utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileInterceptor } from '../utils/interceptor/imageFile.interceptor';
import { InputDurableItemDto } from './dto/inputDurableItem.dto';
import { InputConsumableItemDto } from './dto/inputConsumableItem.dto';
import { GetHouseholdDto } from './dto/getHouseholdItem.dto';

@ApiTags('Household')
@Controller('household')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, FamilyTermCheckGuard, MemberFamilyGuard)
@Permission([PERMISSION_HOUSEHOLD])
export class HouseholdController {
  constructor(private readonly householdService: HouseholdService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get household category' })
  @Get('getHouseholdCategory')
  async getHousehold() {
    return this.householdService.getCategory();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get household item' })
  @Get('getHouseholdItem')
  async getHouseholdItem(
    @CurrentUser() currentUser,
    @Query() dto: GetHouseholdDto,
  ) {
    return this.householdService.getItem(currentUser.id_user, dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get household item detail' })
  @Get('getHouseholdItemDetail/:id_family/:id_item')
  @ApiParam({
    name: 'id_family',
    required: true,
    description: 'The ID of the family',
  })
  @ApiParam({
    name: 'id_item',
    required: true,
    description: 'The ID of the item',
  })
  async getHouseholdItemDetail(
    @CurrentUser() currentUser,
    @Param('id_family') id_family: number,
    @Param('id_item') id_item: number,
  ) {
    return this.householdService.getItemDetail(
      currentUser.id_user,
      id_family,
      id_item,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create household item' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_family: {
          type: 'string',
          description: 'The ID of the family',
        },
        item_image: {
          type: 'string',
          format: 'binary',
          description: 'The image of the item (optional)',
        },
        item_name: {
          type: 'string',
          description: 'The name of the household item',
        },
        id_category: {
          type: 'string',
          description: 'The id of the category of the household item',
        },
        item_description: {
          type: 'string',
          description: 'The description of the household item (optional)',
        },
        item_type: {
          type: 'string',
          enum: ['consumable', 'durable'],
          description:
            'The type of the item, whether it is consumable or durable',
        },
        id_room: {
          type: 'string',
          description: 'The ID of the room where the item is placed (optional)',
        },
      },
      required: [
        'id_family',
        'item_name',
        'id_category',
        'item_type',
        'id_room',
      ],
    },
  })
  @UseInterceptors(
    FileInterceptor(
      'item_image',
      new ImageFileInterceptor().createMulterOptions(),
    ),
  )
  @Post('createHouseholdItem')
  async createHouseholdItem(
    @CurrentUser() currentUser,
    @Body() dto: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    dto.id_family = parseInt(dto.id_family);
    dto.id_category = parseInt(dto.id_category);
    dto.id_room = parseInt(dto.id_room);
    if (!dto.item_description) dto.item_description = null;
    return this.householdService.createItem(currentUser.id_user, dto, file);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update household item' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_family: {
          type: 'string',
          description: 'The ID of the family',
        },
        id_item: {
          type: 'string',
          description: 'The ID of the item',
        },
        item_image: {
          type: 'string',
          format: 'binary',
          description: 'The image of the item',
        },
        item_name: {
          type: 'string',
          description: 'The name of the household item',
        },
        id_category: {
          type: 'string',
          description: 'The id of the category of the household item',
        },
        item_description: {
          type: 'string',
          description: 'The description of the household item',
        },
        id_room: {
          type: 'string',
          description: 'The ID of the room where the item is placed (optional)',
        },
      },
      required: ['id_family', 'id_item'],
    },
  })
  @UseInterceptors(
    FileInterceptor(
      'item_image',
      new ImageFileInterceptor().createMulterOptions(),
    ),
  )
  @Put('updateHouseholdItem')
  async updateHouseholdItem(
    @CurrentUser() currentUser,
    @Body() dto: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    dto.id_family = parseInt(dto.id_family);
    dto.id_item = parseInt(dto.id_item);
    dto.id_category = parseInt(dto.id_category);
    dto.id_room = parseInt(dto.id_room);
    if (!dto.id_category) dto.id_category = null;
    if (!dto.item_name) dto.item_name = null;
    if (!dto.item_description) dto.item_description = null;
    if (!dto.id_room) dto.id_room = null;
    return this.householdService.updateItem(currentUser.id_user, dto, file);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Input household durable item' })
  @Put('inputHouseholdDurableItem')
  async inputHouseholdDurableItem(
    @CurrentUser() currentUser,
    @Body() dto: InputDurableItemDto,
  ) {
    return this.householdService.inputDurableItem(currentUser.id_user, dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Input household consumable item' })
  @Put('inputHouseholdConsumableItem')
  async inputHouseholdConsumableItem(
    @CurrentUser() currentUser,
    @Body() dto: InputConsumableItemDto,
  ) {
    return this.householdService.inputConsumableItem(currentUser.id_user, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete household item' })
  @ApiParam({
    name: 'id_family',
    required: true,
    description: 'The ID of the family',
  })
  @ApiParam({
    name: 'id_item',
    required: true,
    description: 'The ID of the item',
  })
  @Delete('deleteHouseholdItem/:id_family/:id_item')
  async deleteHouseholdItem(
    @CurrentUser() currentUser,
    @Param('id_family') id_family: number,
    @Param('id_item') id_item: number,
  ) {
    return this.householdService.deleteItem(
      currentUser.id_user,
      id_family,
      id_item,
    );
  }

  @ApiOperation({ summary: 'Get low condition item' })
  @HttpCode(HttpStatus.OK)
  @Get('getLowConditionItem/:id_family')
  @ApiParam({
    name: 'id_family',
    required: true,
    description: 'The ID of the family',
  })
  async getLowConditionItem(
    @CurrentUser() currentUser,
    @Param('id_family') id_family: number,
  ) {
    return this.householdService.getLowConditionItem(
      currentUser.id_user,
      id_family,
    );
  }
}
