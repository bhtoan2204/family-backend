import { OnModuleInit, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { WsJwtAuthGuard } from "./guard/ws-jwt.auth.guard";
import { WsCurrentUser } from "../utils/decorator/ws-current-user.decorator";
import { ConfigService } from "@nestjs/config";
import { ChatService } from "./chat.service";
import { NewMessageDto } from "./dto/newMessage.dto";
import { NewFamilyMessageDto } from "./dto/newFamilyMessage.dto";

interface TokenPayload {
  id_user: string;
}

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*', },
})
export class ChatGateway implements OnModuleInit {
  @WebSocketServer() server: Server;
  socketMap = new Map<string, string[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService
  ) { }

  async onModuleInit() {
    this.server.on('connection', async (socket) => {
      try {
        const token = socket.handshake.headers.authorization.split(' ')[1];
        if (!token) throw new UnauthorizedException('Token not found');
        const payload = await this.jwtService.verify(token, { secret: this.configService.get<string>("JWT_SECRET") }) as TokenPayload;
        if (!payload) throw new UnauthorizedException('Token not found');
        const socketId = socket.id;
        if (this.socketMap.has(payload.id_user)) {
          const socketIds = this.socketMap.get(payload.id_user);
          socketIds.push(socketId);
          this.socketMap.set(payload.id_user, socketIds);
        }
        else {
          this.socketMap.set(payload.id_user, [socketId]);
        }
        console.log('User ', payload.id_user, 'connected with socketId: ', socketId);
        return socketId;
      }
      catch (error) {
        console.error('Error handling connection:', error.message);
        socket.disconnect(true);
      }
    });
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      let userId: string | null = null;
      for (const [key, value] of this.socketMap.entries()) {
        if (value.includes(client.id)) {
          userId = key;
          break;
        }
      }
      if (userId) {
        const updatedSocketIds = this.socketMap.get(userId).filter(socketId => socketId !== client.id);
        if (updatedSocketIds.length > 0) {
          this.socketMap.set(userId, updatedSocketIds);
        } else {
          this.socketMap.delete(userId);
        }
        console.log(`User ${userId} disconnected from socket ${client.id}`);
      }
    } catch (error) {
      console.error('Error handling disconnection:', error.message);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('newMessage')
  @UseGuards(WsJwtAuthGuard)
  async emitMessage(@ConnectedSocket() client: Socket, @WsCurrentUser() user, @MessageBody() message: NewMessageDto) {
    try {
      const receiverMessage = await this.chatService.saveMessage(user.id_user, message);
      const receiverSocketIds = this.socketMap.get(message.receiverId);
      if (receiverSocketIds) {
        for (const socketId of receiverSocketIds) {
          client.to(socketId).emit('onNewMessage', receiverMessage);
        }
      }
      return "Message sent";
    } catch (error) {
      console.error('Error emitting message:', error.message);
    }
  }

  @SubscribeMessage('newFamilyMessage')
  @UseGuards(WsJwtAuthGuard)
  async emitFamilyMessage(@ConnectedSocket() client: Socket, @WsCurrentUser() user, @MessageBody() message: NewFamilyMessageDto) {
    try {
      const receiverMessage = await this.chatService.saveFamilyMessage(user.id_user, message);
      const listReceiverId = await this.chatService.getListReceiverId(user.id_user, message.familyId);
      await Promise.all(listReceiverId.map(async (receiverId) => {
        const receiverSocketIds = this.socketMap.get(receiverId) || [];
        receiverSocketIds.forEach(socketId => {
          client.to(socketId).emit('onNewFamilyMessage', receiverMessage);
        });
      }));
      return "Message sent";
    } catch (error) {
      console.error('Error emitting message:', error.message);
    }
  }
}
