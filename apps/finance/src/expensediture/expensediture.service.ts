import { UploadFileRequest } from '@app/common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { EntityManager } from 'typeorm';
import { validate, version, NIL } from 'uuid';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ExpenseditureService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly storageService: StorageService,
  ) {}

  convertStringToUUID(string: string): string {
    if (validate(string) && version(string)) {
      return string;
    }
    return NIL;
  }

  async getExpenseditureType(id_user: string, id_family: number) {
    try {
      const query = 'SELECT * FROM f_get_finance_expenditure_type($1, $2)';
      const params = [id_user, id_family];
      const data = await this.entityManager.query(query, params);
      return {
        data: data[0]?.f_get_finance_expenditure_type || [],
        message: 'Get expenditure type',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async createExpenseditureType(id_user: string, dto: any) {
    try {
      const { id_family, name } = dto;
      const query = 'SELECT * FROM f_create_expenditure_type($1, $2, $3)';
      const params = [id_user, id_family, name];
      const data = await this.entityManager.query(query, params);
      return {
        data: {
          id_family: id_family,
          name: name,
          id_expenditure_type:
            data[0].f_create_expenditure_type.id_expenditure_type,
        },
        message: 'Create expenditure type',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async updateExpenseditureType(id_user: string, dto: any) {
    try {
      const { id_expense_type, id_family, name } = dto;
      const query = 'SELECT * FROM f_update_expenditure_type($1, $2, $3, $4)';
      const params = [id_user, id_expense_type, id_family, name];
      await this.entityManager.query(query, params);
      return {
        data: 'Update expenditure type successfully',
        message: 'Update expenditure type',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async deleteExpenseditureType(
    id_user: string,
    id_family: number,
    id_expenditure_type: number,
  ) {
    try {
      const query = 'SELECT * FROM f_delete_expenditure_type($1, $2, $3)';
      const params = [id_user, id_family, id_expenditure_type];
      await this.entityManager.query(query, params);
      return {
        data: 'Expenditure type deleted successfully',
        message: 'Delete expenditure type',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getExpenseByDate(id_user: string, id_family: number, date: string) {
    try {
      const query = 'SELECT * FROM f_get_expense_by_date($1, $2, $3)';
      const params = [id_user, id_family, date];
      const data = await this.entityManager.query(query, params);
      return {
        data: data,
        message: 'Get expenditure by day',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getExpenseByMonth(id_user: string, id_family, month, year) {
    try {
      const query = 'SELECT * FROM f_get_expense_by_month($1, $2, $3, $4)';
      const params = [id_user, id_family, month, year];
      const data = await this.entityManager.query(query, params);
      return {
        data: data[0]?.f_get_expense_by_month || [],
        message: 'Get expenditure by month',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async getExpenseByYear(id_user: string, id_family, year) {
    try {
      const query = 'SELECT * FROM f_get_expense_by_year($1, $2, $3)';
      const params = [id_user, id_family, year];
      const data = await this.entityManager.query(query, params);
      return {
        data: data[0]?.f_get_expense_by_year || [],
        message: 'Get expenditure by year',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getExpenseByDateRange(
    id_user: string,
    id_family: number,
    pageNumber: number,
    itemsPerPage: number,
    option: number,
  ) {
    try {
      const query = 'SELECT * FROM f_get_expenses_with_pagination($1, $2, $3, $4, $5)';
      const params = [id_user, id_family, option,pageNumber, itemsPerPage];
      const data = await this.entityManager.query(query, params);
      return data[0]?.f_get_expenses_with_pagination || [];
      
      
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
  
  async getExpenditureById(
    id_user: string,
    id_family: number,
    id_expenditure: number,
  ) {
    try {
      const query = 'SELECT * FROM f_get_expenditure_by_id($1, $2, $3)';
      const params = [id_user, id_family, id_expenditure];
      const data = await this.entityManager.query(query, params);
      return {
        data: data,
        message: 'Get expenditure by id',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async createExpensediture(id_user: string, dto: any) {
    try {
      const {
        id_family,
        id_created_by,
        id_expense_type,
        amount,
        expenditure_date,
        description,
      } = dto;
      const query =
        'SELECT * FROM f_create_expenditure($1, $2, $3, $4, $5, $6, $7)';
      const params = [
        id_user,
        id_family,
        id_created_by,
        id_expense_type,
        amount,
        expenditure_date,
        description,
      ];
      const data = await this.entityManager.query(query, params);
      return {
        data: data,
        message: 'Create expenditure',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async updateExpensediture(id_user: string, dto: any) {
    try {
      const {
        id_expenditure,
        id_created_by,
        id_expense_type,
        amount,
        expenditure_date,
        description,
      } = dto;
      const query =
        'SELECT * FROM f_update_expenditure($1, $2, $3, $4, $5, $6, $7)';
      const params = [
        id_user,
        id_expenditure,
        id_created_by,
        id_expense_type,
        amount,
        expenditure_date,
        description,
      ];
      const data = await this.entityManager.query(query, params);
      return {
        data: data,
        message: 'Update expenditure',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async deleteExpensediture(
    id_user: string,
    id_family: number,
    id_expenditure: number,
  ) {
    try {
      const query = 'SELECT * FROM f_delete_expenditure($1, $2, $3)';
      const params = [id_user, id_family, id_expenditure];
      const data = await this.entityManager.query(query, params);
      const isDeleted = data[0].f_delete_expenditure;
      if (!isDeleted) {
        throw new RpcException({
          message: 'Failed to delete income, maybe the income is not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      return {
        data: 'Income deleted successfully',
        message: 'Delete income',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async uploadImageExpense(
    id_user: string,
    id_family: number,
    id_expenditure: number,
    file: any,
  ) {
    try {
      let fileUrl = null;
      if (file) {
        const filename =
          'expense_' + id_user + '_' + Date.now() + '_' + file.originalname;
        const params: UploadFileRequest = {
          file: new Uint8Array(file.buffer.data),
          fileName: filename,
        };
        const uploadImageData =
          await this.storageService.uploadImageExpense(params);
        fileUrl = uploadImageData.fileUrl;
        const query = `UPDATE finance_expenditure SET image_url = $1 WHERE id_expenditure = $2 AND id_family = $3 RETURNING *;`;
        const updateParams = [fileUrl, id_expenditure, id_family];
        const data = await this.entityManager.query(query, updateParams);
        return {
          data: data[0],
          message: 'Upload image to expense',
        };
      } else {
        throw new RpcException({
          message: 'Failed to upload image, maybe the image is not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
