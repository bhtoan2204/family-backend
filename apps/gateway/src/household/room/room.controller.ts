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
  ApiTags,
} from '@nestjs/swagger';
import { RoomService } from './room.service';
import {
  CurrentUser,
  FamilyTermCheckGuard,
  JwtAuthGuard,
  MemberFamilyGuard,
  Permission,
  PERMISSION_HOUSEHOLD,
} from '../../utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileInterceptor } from '../../utils/interceptor/imageFile.interceptor';
import { GetRoomDto } from './dto/getRoom.dto';

@ApiTags('Room')
@Controller('room')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, FamilyTermCheckGuard, MemberFamilyGuard)
@Permission([PERMISSION_HOUSEHOLD])
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all rooms' })
  @Get('getRooms')
  async getRooms(@CurrentUser() currentUser, @Query() dto: GetRoomDto) {
    return this.roomService.getRooms(currentUser.id_user, dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create room' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_family: {
          type: 'number',
        },
        room_name: {
          type: 'string',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['id_family', 'room_name'],
    },
  })
  @UseInterceptors(
    FileInterceptor('image', new ImageFileInterceptor().createMulterOptions()),
  )
  @Post('createRoom')
  async createRoom(
    @CurrentUser() currentUser,
    @Body() body: { id_family: number; room_name: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.roomService.createRoom(currentUser.id_user, body, file);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update room' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_room: {
          type: 'number',
        },
        id_family: {
          type: 'number',
        },
        room_name: {
          type: 'string',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['id_family', 'id_room'],
    },
  })
  @UseInterceptors(
    FileInterceptor('image', new ImageFileInterceptor().createMulterOptions()),
  )
  @Put('updateRoom')
  async updateRoom(
    @CurrentUser() currentUser,
    @Body() body: { id_room: number; room_name: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.roomService.updateRoom(currentUser.id_user, body, file);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete room' })
  @Delete('deleteRoom/:id_family/:id_room')
  async deleteRoom(
    @CurrentUser() currentUser,
    @Param('id_family') id_family: number,
    @Param('id_room') id_room: number,
  ) {
    return this.roomService.deleteRoom(currentUser.id_user, id_family, id_room);
  }
}
