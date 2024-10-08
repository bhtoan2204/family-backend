import { Controller } from '@nestjs/common';
import { FilesService } from './files.service';
import {
  DeleteFileRequest,
  DeleteFileResponse,
  ReadFileRequest,
  ReadFileResponse,
  StorageServiceController,
  StorageServiceControllerMethods,
  UploadFileRequest,
  UploadFileResponse,
} from '@app/common';

@Controller()
@StorageServiceControllerMethods()
export class FilesController implements StorageServiceController {
  constructor(private readonly filesService: FilesService) {}

  async uploadFile(request: UploadFileRequest): Promise<UploadFileResponse> {
    return await this.filesService.uploadFile(request, 'avatar');
  }

  async uploadImageChat(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await this.filesService.uploadFile(request, 'chat');
  }

  async uploadVideoChat(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await this.filesService.uploadVideo(request, 'chat');
  }

  async uploadImageStep(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await this.filesService.uploadFile(request, 'step');
  }

  async readFile(request: ReadFileRequest): Promise<ReadFileResponse> {
    return await this.filesService.readFile(request);
  }

  async deleteFile(request: DeleteFileRequest): Promise<DeleteFileResponse> {
    return await this.filesService.deleteFile(request, 'avatar');
  }

  async deleteImageStep(
    request: DeleteFileRequest,
  ): Promise<DeleteFileResponse> {
    return await this.filesService.deleteFile(request, 'step');
  }

  async uploadImageHousehold(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await this.filesService.uploadFile(request, 'household');
  }

  async deleteImageHousehold(
    request: DeleteFileRequest,
  ): Promise<DeleteFileResponse> {
    return await this.filesService.deleteFile(request, 'household');
  }

  async uploadImageInvoice(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await this.filesService.uploadFile(request, 'invoice');
  }

  async deleteImageInvoice(
    request: DeleteFileRequest,
  ): Promise<DeleteFileResponse> {
    return await this.filesService.deleteFile(request, 'invoice');
  }

  async uploadImageUtility(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await this.filesService.uploadFile(request, 'utility');
  }

  async deleteImageUtility(
    request: DeleteFileRequest,
  ): Promise<DeleteFileResponse> {
    return await this.filesService.deleteFile(request, 'utility');
  }

  async uploadImageExpense(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await this.filesService.uploadFile(request, 'expense');
  }

  async deleteImageExpense(
    request: DeleteFileRequest,
  ): Promise<DeleteFileResponse> {
    return await this.filesService.deleteFile(request, 'expense');
  }

  async uploadImageRoom(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await this.filesService.uploadFile(request, 'room');
  }

  async deleteImageRoom(
    request: DeleteFileRequest,
  ): Promise<DeleteFileResponse> {
    return await this.filesService.deleteFile(request, 'room');
  }

  async uploadImageAsset(
    request: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    return await this.filesService.uploadFile(request, 'asset');
  }

  async deleteImageAsset(
    request: DeleteFileRequest,
  ): Promise<DeleteFileResponse> {
    return await this.filesService.deleteFile(request, 'asset');
  }
}
