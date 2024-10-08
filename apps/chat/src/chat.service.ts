import {
  Family,
  FamilyConversations,
  MemberFamily,
  UploadFileRequest,
  UserConversations,
  Users,
} from '@app/common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { StorageService } from './storage/storage.service';
import { Brackets, EntityManager, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as jsonwebtoken from 'jsonwebtoken';

const limit = 30;

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(UserConversations.name) private userConversationsRepository,
    @InjectModel(FamilyConversations.name)
    private familyConversationsRepository,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(Family) private familysRepository: Repository<Family>,
    @InjectRepository(MemberFamily)
    private memberFamilyRepository: Repository<MemberFamily>,
    private readonly storageService: StorageService,
    private readonly entityManager: EntityManager,
  ) {}

  async getUsersChat(id_user: string, index: number): Promise<any> {
    try {
      const skipAmount = index * limit;
      const mongoQuery = this.userConversationsRepository
        .aggregate([
          { $match: { userId: id_user } },
          { $unwind: '$conversations' },
          { $unwind: '$conversations.messages' },
          { $sort: { 'conversations.messages.timestamp': -1 } },
          {
            $group: {
              _id: '$conversations._id',
              receiverId: { $first: '$conversations.receiverId' },
              created_at: { $first: '$conversations.created_at' },
              updated_at: { $first: '$conversations.updated_at' },
              latestMessage: { $first: '$conversations.messages' },
            },
          },
          { $sort: { 'latestMessage.timestamp': -1 } },
          { $skip: skipAmount },
          { $limit: limit },
        ])
        .exec();
      const results = await mongoQuery;
      const receiverIds = results.map((convo) => convo.receiverId);
      const usersPromise = this.usersRepository.find({
        where: {
          id_user: In(receiverIds),
        },
      });
      const users = await usersPromise;
      if (!users || users.length === 0) {
        return [];
      }
      const userMap = users.reduce((map, user) => {
        map[user.id_user] = user;
        return map;
      }, {});
      const populatedResults = results.map((convo) => {
        const user = userMap[convo.receiverId];
        return {
          ...convo,
          receiver: {
            receiverId: user.id_user,
            firstname: user.firstname,
            lastname: user.lastname,
            avatar: user.avatar,
          },
          latestMessage: {
            ...convo.latestMessage,
            receiver: {
              firstname: user.firstname,
              lastname: user.lastname,
              avatar: user.avatar,
            },
          },
        };
      });

      return populatedResults;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async updateConversationWithExistOne(
    userId: string,
    partnerId: string,
    newMessage: any,
  ) {
    const conversationExists = await this.userConversationsRepository.findOne({
      userId,
      'conversations.receiverId': partnerId,
    });

    if (conversationExists) {
      return this.userConversationsRepository.findOneAndUpdate(
        { userId, 'conversations.receiverId': partnerId },
        {
          $push: {
            'conversations.$.messages': { $each: [newMessage], $position: 0 },
          },
        },
        { new: true },
      );
    } else {
      return this.userConversationsRepository.findOneAndUpdate(
        { userId },
        {
          $push: {
            conversations: {
              $each: [{ receiverId: partnerId, messages: [newMessage] }],
              $position: 0,
            },
          },
        },
        { upsert: true, new: true },
      );
    }
  }

  async base64ToUint8Array(base64: string): Promise<Uint8Array> {
    const buffer = Buffer.from(base64, 'base64');
    return new Uint8Array(buffer);
  }

  async getMessages(
    senderId: string,
    receiverId: string,
    index: number,
  ): Promise<any[]> {
    try {
      const skip = index * limit;

      const [receiverInfo, senderInfo, conversations] = await Promise.all([
        this.usersRepository.findOne({
          where: { id_user: receiverId },
        }),
        this.usersRepository.findOne({
          where: { id_user: senderId },
        }),
        this.userConversationsRepository.aggregate([
          {
            $match: {
              userId: senderId,
              'conversations.receiverId': receiverId,
            },
          },
          { $unwind: '$conversations' },
          { $match: { 'conversations.receiverId': receiverId } },
          {
            $project: {
              messages: '$conversations.messages',
              totalMessages: { $size: '$conversations.messages' },
            },
          },
          {
            $project: {
              messages: {
                $slice: ['$messages', skip, limit],
              },
            },
          },
        ]),
      ]);
      if (!conversations || conversations.length === 0) {
        return [];
      }
      const messages = conversations[0].messages;

      const results = messages.map((message) => {
        if (message.senderId !== senderId) {
          return {
            ...message,
            receiverInfo: senderInfo,
            senderInfo: receiverInfo,
          };
        }
        return {
          ...message,
          receiverInfo,
          senderInfo,
        };
      });
      return results;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getFamilyChats(familyId): Promise<any> {
    try {
      const conversations = await this.familyConversationsRepository
        .aggregate([
          { $match: { familyId: { $in: familyId } } },
          { $unwind: '$conversations' },
          { $sort: { 'conversations.timestamp': -1 } },
          {
            $group: {
              _id: '$_id',
              familyId: { $first: '$familyId' },
              lastMessage: { $first: '$conversations' },
            },
          },
          { $sort: { 'lastMessage.timestamp': -1 } },
          { $limit: familyId.length },
        ])
        .exec();
      const familyIds = conversations.map((convo) => convo.familyId);
      const familys = await this.familysRepository.find({
        where: {
          id_family: In(familyIds),
        },
      });
      const familyMap = familys.reduce((map, family) => {
        map[family.id_family] = family;
        return map;
      }, {});
      const populatedConversations = conversations.map((convo) => {
        const family = familyMap[convo.familyId];
        return {
          ...convo,
          name: family.name,
          avatar: family.avatar,
        };
      });
      return populatedConversations;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getFamilyMessages(
    id_user: string,
    id_family: number,
    index: number,
  ): Promise<any> {
    try {
      const skip = index * limit;
      const messages = await this.familyConversationsRepository
        .findOne(
          { familyId: id_family },
          {
            conversations: {
              $slice: [{ $reverseArray: '$conversations' }, skip, limit],
            },
          },
        )
        .lean()
        .exec();

      if (!messages || messages.length === 0) {
        return [];
      }

      const userIds = messages.conversations.reduce((uniqueIds, message) => {
        if (!uniqueIds.includes(message.senderId)) {
          uniqueIds.push(message.senderId);
        }
        return uniqueIds;
      }, []);

      const userInfos = await this.entityManager.query(
        'SELECT * FROM f_get_users_infos($1)',
        [userIds],
      );
      const userInfoMap = new Map(
        userInfos.map((user) => [user.id_user, user]),
      );

      const result = messages.conversations.map((conversation) => ({
        ...conversation,
        userInfo: userInfoMap.get(conversation.senderId),
      }));
      return result;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async saveMessage(
    id_user: string,
    messageData: { message: string; receiverId: string },
  ): Promise<any> {
    try {
      if (!id_user || !messageData.receiverId) {
        throw new RpcException({
          message: 'Invalid user id or receiver id',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      if (id_user === messageData.receiverId) {
        throw new RpcException({
          message: 'Cannot send message to yourself',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      const receiver = await this.usersRepository.findOne({
        where: { id_user: messageData.receiverId },
      });
      if (!receiver) {
        throw new RpcException({
          message: 'Receiver not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      const newMessage = {
        _id: new Types.ObjectId(),
        senderId: id_user,
        receiverId: messageData.receiverId,
        type: 'text',
        content: messageData.message,
        isRead: false,
        timestamp: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [updateReceiver, updateSender, receiverInfo, senderInfo] =
        await Promise.all([
          this.updateConversationWithExistOne(
            id_user,
            messageData.receiverId,
            newMessage,
          ),
          this.updateConversationWithExistOne(
            messageData.receiverId,
            id_user,
            newMessage,
          ),
          this.usersRepository.findOne({
            where: { id_user: messageData.receiverId },
          }),
          this.usersRepository.findOne({
            where: { id_user: id_user },
          }),
        ]);

      return { receiverInfo, senderInfo, ...newMessage };
    } catch (error) {
      throw new RpcException({
        message: error.message || 'An error occurred while saving the message.',
        statusCode: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async saveFamilyMessage(
    id_user: string,
    messageData: { message: string; familyId: number },
  ): Promise<any> {
    try {
      const newMessage = {
        _id: new Types.ObjectId(),
        senderId: id_user,
        type: 'text',
        content: messageData.message,
        isRead: false,
        timestamp: new Date(),
      };
      const family = await this.familysRepository.findOne({
        where: { id_family: messageData.familyId },
      });
      if (!family) {
        throw new RpcException({
          message: 'Family not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      await this.familyConversationsRepository
        .findOneAndUpdate(
          { familyId: messageData.familyId },
          { $push: { conversations: newMessage } },
          { new: true, upsert: true },
        )
        .exec();
      const senderInfo = await this.usersRepository.findOne({
        where: { id_user: id_user },
      });
      return { senderInfo, ...newMessage };
    } catch (error) {
      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.message || 'An error occurred while saving the family message.';
      throw new RpcException({ message, statusCode });
    }
  }

  async saveFamilyImageMessage(
    id_user: string,
    id_family: number,
    file: any,
  ): Promise<any> {
    try {
      if (!file) {
        throw new RpcException({
          message: 'File is required',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      const family = await this.familysRepository.findOne({
        where: { id_family },
      });
      if (!family) {
        throw new RpcException({
          message: 'Family not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      let fileUrl = null;
      const fileName = 'chat_' + id_user + '_' + Date.now();
      const params: UploadFileRequest = {
        file: new Uint8Array(file.buffer.data),
        fileName: fileName,
      };
      const uploadImageData = await this.storageService.uploadImageChat(params);
      fileUrl = uploadImageData.fileUrl;

      const newMessage = {
        _id: new Types.ObjectId(),
        senderId: id_user,
        type: 'photo',
        content: fileUrl,
        isRead: false,
        timestamp: new Date(),
      };

      await this.familyConversationsRepository
        .findOneAndUpdate(
          { familyId: id_family },
          { $push: { conversations: newMessage } },
          { new: true, upsert: true },
        )
        .exec();

      const senderInfo = await this.usersRepository.findOne({
        where: { id_user: id_user },
      });
      return { senderInfo, ...newMessage };
    } catch (error) {
      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.message || 'An error occurred while saving the family message.';
      throw new RpcException({ message, statusCode });
    }
  }

  async saveFamilyVideoMessage(id_user: string, id_family: number, file: any) {
    try {
      if (!file) {
        throw new RpcException({
          message: 'File is required',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      const family = await this.familysRepository.findOne({
        where: { id_family },
      });
      if (!family) {
        throw new RpcException({
          message: 'Family not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      let fileUrl = null;
      const fileExtension = file.originalname;
      const fileName =
        'chat_' + id_user + '_' + Date.now() + '_' + fileExtension;
      const params: UploadFileRequest = {
        file: new Uint8Array(file.buffer.data),
        fileName: fileName,
      };
      const uploadImageData = await this.storageService.uploadVideoChat(params);
      fileUrl = uploadImageData.fileUrl;

      const newMessage = {
        _id: new Types.ObjectId(),
        senderId: id_user,
        type: 'video',
        content: fileUrl,
        isRead: false,
        timestamp: new Date(),
      };

      await this.familyConversationsRepository
        .findOneAndUpdate(
          { familyId: id_family },
          { $push: { conversations: newMessage } },
          { new: true, upsert: true },
        )
        .exec();

      const senderInfo = await this.usersRepository.findOne({
        where: { id_user: id_user },
      });
      return { senderInfo, ...newMessage };
    } catch (error) {
      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.message || 'An error occurred while saving the family message.';
      throw new RpcException({ message, statusCode });
    }
  }

  async saveImageMessage(
    id_user: string,
    receiverId: string,
    file: any,
  ): Promise<any> {
    try {
      if (!file) {
        throw new RpcException({
          message: 'File is required',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      const receiver = await this.usersRepository.findOne({
        where: { id_user: receiverId },
      });
      if (!receiver) {
        throw new RpcException({
          message: 'Receiver not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      let fileUrl = null;
      const fileName = 'chat_' + id_user + '_' + Date.now();
      const params: UploadFileRequest = {
        file: new Uint8Array(file.buffer.data),
        fileName: fileName,
      };
      const uploadImageData = await this.storageService.uploadImageChat(params);
      fileUrl = uploadImageData.fileUrl;

      const newMessage = {
        _id: new Types.ObjectId(),
        senderId: id_user,
        receiverId: receiverId,
        type: 'photo',
        content: fileUrl,
        isRead: false,
        timestamp: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [updateReceiver, updateSender, receiverInfo, senderInfo] =
        await Promise.all([
          this.updateConversationWithExistOne(id_user, receiverId, newMessage),
          this.updateConversationWithExistOne(receiverId, id_user, newMessage),
          this.usersRepository.findOne({
            where: { id_user: receiverId },
          }),
          this.usersRepository.findOne({
            where: { id_user },
          }),
        ]);

      return { receiverInfo, senderInfo, ...newMessage };
    } catch (error) {
      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.message || 'An error occurred while saving the message.';
      throw new RpcException({ message, statusCode });
    }
  }

  async saveVideoMessage(id_user: string, receiverId: string, file: any) {
    try {
      if (!file) {
        throw new RpcException({
          message: 'File is required',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      const receiver = await this.usersRepository.findOne({
        where: { id_user: receiverId },
      });
      if (!receiver) {
        throw new RpcException({
          message: 'Receiver not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      let fileUrl = null;
      const fileExtension = file.originalname;
      const fileName =
        'chat_' + id_user + '_' + Date.now() + '_' + fileExtension;
      const params: UploadFileRequest = {
        file: new Uint8Array(file.buffer.data),
        fileName: fileName,
      };
      const uploadImageData = await this.storageService.uploadVideoChat(params);
      fileUrl = uploadImageData.fileUrl;

      const newMessage = {
        _id: new Types.ObjectId(),
        senderId: id_user,
        receiverId: receiverId,
        type: 'video',
        content: fileUrl,
        isRead: false,
        timestamp: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [updateReceiver, updateSender, receiverInfo, senderInfo] =
        await Promise.all([
          this.updateConversationWithExistOne(id_user, receiverId, newMessage),
          this.updateConversationWithExistOne(receiverId, id_user, newMessage),
          this.usersRepository.findOne({
            where: { id_user: receiverId },
          }),
          this.usersRepository.findOne({
            where: { id_user },
          }),
        ]);

      return { receiverInfo, senderInfo, ...newMessage };
    } catch (error) {
      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.message || 'An error occurred while saving the message.';
      throw new RpcException({ message, statusCode });
    }
  }

  async markSeen(id_user: string, receiver_id: string): Promise<any> {
    try {
      const updatedConversation =
        await this.userConversationsRepository.findOneAndUpdate(
          { userId: id_user, 'conversations.receiverId': receiver_id },
          {
            $set: {
              'conversations.$.messages.$[elem].isRead': true,
              'conversations.$.messages.$[elem].timestamp': new Date(),
            },
          },
          {
            arrayFilters: [{ 'elem.isRead': false }],
            new: true,
          },
        );

      if (!updatedConversation) {
        throw new RpcException({
          message: 'Conversation not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      return { message: 'Mark Seen successfully' };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async removeMessage(
    id_user: string,
    receiver_id: string,
    id_message: string,
  ): Promise<any> {
    try {
      const [userConversation, receiverConversation] = await Promise.all([
        this.userConversationsRepository.findOne({
          userId: id_user,
          'conversations.receiverId': receiver_id,
          'conversations.messages._id': id_message,
          'conversations.messages.senderId': id_user,
        }),
        this.userConversationsRepository.findOne({
          userId: receiver_id,
          'conversations.receiverId': id_user,
          'conversations.messages._id': id_message,
          'conversations.messages.senderId': id_user,
        }),
      ]);
      if (!userConversation || !receiverConversation) {
        throw new RpcException({
          message: 'Conversation not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      await Promise.all([
        this.userConversationsRepository.findOneAndUpdate(
          { userId: id_user, 'conversations.receiverId': receiver_id },
          {
            $pull: { 'conversations.$.messages': { _id: id_message } },
          },
          { new: true },
        ),
        this.userConversationsRepository.findOneAndUpdate(
          { userId: receiver_id, 'conversations.receiverId': id_user },
          {
            $pull: { 'conversations.$.messages': { _id: id_message } },
          },
          { new: true },
        ),
      ]);

      return { message: 'Remove message successfully' };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async removeFamilyMessage(
    id_user: string,
    id_family: number,
    id_message: string,
  ): Promise<any> {
    try {
      const conversation = await this.familyConversationsRepository.findOne({
        familyId: id_family,
        'conversations._id': id_message,
        'conversations.senderId': id_user,
      });

      if (!conversation) {
        throw new RpcException({
          message: 'Message not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      await this.familyConversationsRepository.findOneAndUpdate(
        { familyId: id_family },
        {
          $pull: { conversations: { _id: id_message, senderId: id_user } },
        },
        { new: true },
      );

      return { message: 'Remove message successfully' };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getLinkedUser(id_user: string, search: string): Promise<any> {
    try {
      const families = await this.memberFamilyRepository.find({
        where: { id_user },
        select: ['id_family'],
      });

      const familyIds = families.map((family) => family.id_family);

      const familyUsers = await this.memberFamilyRepository
        .createQueryBuilder('memberFamily')
        .where('memberFamily.id_family IN (:...familyIds)', { familyIds })
        .select(['memberFamily.id_user'])
        .getMany();

      const familyUserIds = familyUsers.map((member) => member.id_user);

      const mongoQuery = this.userConversationsRepository
        .aggregate([
          { $match: { userId: id_user } },
          { $unwind: '$conversations' },
          { $unwind: '$conversations.messages' },
          { $sort: { 'conversations.messages.timestamp': -1 } },
          {
            $group: {
              _id: '$conversations._id',
              receiverId: { $first: '$conversations.receiverId' },
              created_at: { $first: '$conversations.created_at' },
              updated_at: { $first: '$conversations.updated_at' },
              latestMessage: { $first: '$conversations.messages' },
            },
          },
          { $sort: { 'latestMessage.timestamp': -1 } },
        ])
        .exec();

      const chatResults = await mongoQuery;
      const chatUserIds = chatResults.map((convo) => convo.receiverId);

      const combinedUserIds = Array.from(
        new Set([...familyUserIds, ...chatUserIds]),
      );
      let query = this.usersRepository
        .createQueryBuilder('user')
        .where('user.id_user IN (:...ids)', { ids: combinedUserIds })
        .select([
          'user.id_user',
          'user.firstname',
          'user.lastname',
          'user.avatar',
        ])
        .orderBy('RANDOM()')
        .limit(30);

      if (search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where('user.firstname LIKE :search', { search: `%${search}%` })
              .orWhere('user.lastname LIKE :search', { search: `%${search}%` })
              .orWhere('user.email LIKE :search', { search: `%${search}%` })
              .orWhere('user.phone LIKE :search', { search: `%${search}%` });
          }),
        );
      }

      const users = await query.getMany();

      return users;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  generate(privateKey, { id, name, email, avatar, appId, kid }, time = null) {
    const jwt = jsonwebtoken.sign(
      {
        aud: 'jitsi',
        iss: 'chat',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000 + 1000 * 60 * time),
        nbf: Math.floor(Date.now() / 1000 - 5),
        sub: appId,
        context: {
          features: {
            livestreaming: true,
            'outbound-call': true,
            'sip-outbound-call': true,
            transcription: true,
            recording: true,
          },
          user: {
            id,
            name,
            avatar,
            email: email,
            moderator: false,
            'hidden-from-recorder': false,
          },
        },
        room: '*',
      },
      privateKey,
      { algorithm: 'RS256', header: { kid } } as jsonwebtoken.SignOptions,
    );
    return jwt;
  }

  async getJitsiToken(user: any) {
    try {
      const room_id = uuidv4();
      const data_jisti = {
        id: room_id,
        name: user.firstname + ' ' + user.lastname,
        email: user.email,
        avatar: user.avatar,
        appId: 'vpaas-magic-cookie-1334387fd63341c78f731a149b004264',
        kid: 'vpaas-magic-cookie-1334387fd63341c78f731a149b004264/510b0d-SAMPLE_APP',
      };
      return {
        jwt: this.generate(process.env.PRIVATE_CONSULTATION, data_jisti),
        room_id,
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
