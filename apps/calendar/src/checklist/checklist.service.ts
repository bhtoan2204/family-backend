import { Checklist } from '@app/common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(Checklist)
    private checklistRepository: Repository<Checklist>,
  ) {}

  async getChecklists(
    id_user: string,
    id_family: number,
    page: number,
    itemsPerPage: number,
  ) {
    try {
      const [data, total] = await this.checklistRepository.findAndCount({
        where: { id_family: id_family },
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
      });

      return {
        data: data,
        total: total,
        message: 'Get checklist successfully',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async createChecklist(id_user: string, dto: any) {
    const { id_family, task_name, description, due_date } = dto;

    const checklist = new Checklist();
    checklist.id_family = id_family;
    checklist.task_name = task_name;
    checklist.description = description;
    checklist.due_date = due_date;

    try {
      const savedChecklist = await this.checklistRepository.save(checklist);
      return {
        data: savedChecklist,
        message: 'Checklist created successfully',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async updateChecklist(id_user: string, dto: any) {
    const { id_checklist, id_family, task_name, description, due_date } = dto;
    try {
      const checklist = await this.checklistRepository.findOne({
        where: { id_checklist, id_family },
      });
      if (!checklist) {
        throw new RpcException({
          message: 'Checklist not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      if (task_name !== undefined) {
        checklist.task_name = task_name;
      }
      if (description !== undefined) {
        checklist.description = description;
      }
      if (due_date !== undefined) {
        checklist.due_date = due_date;
      }
      const updatedChecklist = await this.checklistRepository.save(checklist);
      return {
        data: updatedChecklist,
        message: 'Checklist updated successfully',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async deleteChecklist(
    id_user: string,
    id_family: number,
    id_checklist: number,
  ) {
    try {
      const checklist = await this.checklistRepository.findOne({
        where: { id_checklist, id_family },
      });
      if (!checklist) {
        throw new RpcException({
          message: 'Checklist not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      await this.checklistRepository.remove(checklist);
      return {
        message: 'Checklist deleted successfully',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
