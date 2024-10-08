import {
  DeleteFileRequest,
  DeleteFileResponse,
  ReadFileRequest,
  ReadFileResponse,
  STORAGE_SERVICE_NAME,
  StorageServiceClient,
  UploadFileRequest,
  UploadFileResponse,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class StorageService implements OnModuleInit {
  private storageService: StorageServiceClient;

  constructor(@Inject('STORAGE') private storageClient: ClientGrpc) {}

  onModuleInit() {
    this.storageService =
      this.storageClient.getService<StorageServiceClient>(STORAGE_SERVICE_NAME);
  }

  async uploadImageStep(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await lastValueFrom(this.storageService.uploadImageStep(request));
  }

  async readFile(request: ReadFileRequest): Promise<ReadFileResponse> {
    return await lastValueFrom(this.storageService.readFile(request));
  }

  async deleteImageStep(
    request: DeleteFileRequest,
  ): Promise<DeleteFileResponse> {
    return await lastValueFrom(this.storageService.deleteImageStep(request));
  }
}
