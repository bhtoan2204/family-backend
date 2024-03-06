import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { catchError, lastValueFrom, timeout } from "rxjs";
import { CreateFamilyDto } from "./dto/createFamilyDto.dto";
import { MemberFamilyDto } from "./dto/memberFamilyDto.dto";
import { DeleteMemberDTO } from "./dto/delete-familydto.dto";
import { UpdateFamilyDTO } from "./dto/update-familyDTO.dto";
import { FAMILY_SERVICE } from "../utils/constant/services.constant";

@Injectable()
export class FamilyService {
    constructor(
        @Inject(FAMILY_SERVICE) private familyClient: ClientProxy
    ) { }

    async getFamily(CurrentUser, id_family) {
        try {
            const response = this.familyClient.send('family/get_Family', { CurrentUser, id_family })
                .pipe(
                    timeout(5000),
                );
            const data = await lastValueFrom(response);
            return data;
        } catch (err) {
            throw err;
        }
    }

    async GetAllFamily(CurrentUser) {
        try {
            const response = this.familyClient.send('family/get_all_family', { CurrentUser })
                .pipe(
                    timeout(5000),
                );
            const data = await lastValueFrom(response);
            return data;
        } catch (err) {
            throw err;
        }

    }

    async addMember(CurrentUser, memberFamilyDto: MemberFamilyDto) {
        try {
            const response = this.familyClient.send('family/add_Member', { CurrentUser, memberFamilyDto })
                .pipe(
                    timeout(5000),
                );
            const data = await lastValueFrom(response);
            return data;
        } catch (err) {
            throw err;
        }
    }
    async deleteMember(CurrentUser, DeleteMemberDTO: DeleteMemberDTO) {
        try {
            const response = this.familyClient.send('family/delete_Member', { CurrentUser, DeleteMemberDTO })
                .pipe(
                    timeout(5000),
                );
            const data = await lastValueFrom(response);
            return data;
        } catch (err) {
            throw err;
        }
    }

    async createFamily(CurrentUser, CreateFamilyDto: CreateFamilyDto) {
        try {
            const source = this.familyClient.send('family/create_Family', { CurrentUser, CreateFamilyDto }).pipe(
                timeout(5000)
            );
            const data = await lastValueFrom(source);
            return data;
        }
        catch (error) {
            throw new HttpException(error, error.statusCode);
        }
    }

    async updateFamily(CurrentUser, UpdateFamilyDTO: UpdateFamilyDTO) {
        const source = this.familyClient.send('family/update_Family', { CurrentUser, UpdateFamilyDTO }).pipe(
            timeout(5000),
            catchError(err => {
                throw new Error(`Failed to update family: ${err.message}`);
            })
        );;
        const data = await lastValueFrom(source);
        return data;
    }

    async deleteFamily(CurrentUser, id_family) {
        const source = this.familyClient.send('family/delete_Family', { CurrentUser, id_family }).pipe(
            timeout(5000),
            catchError(err => {
                throw new Error(`Failed to delete family: ${err.message}`);
            })
        );
        const data = await lastValueFrom(source);
        return data;
    }

}