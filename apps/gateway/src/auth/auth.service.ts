import { ConflictException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { AUTH_SERVICE } from "apps/gateway/src/utils/constant/services.constant";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom, timeout } from "rxjs";
import { CreateAccountDto } from "./dto/createAccount.dto";
import { ChangePasswordDto } from "./dto/changePassword.dto";
import { UpdateProfileDto } from "./dto/updateProfile.dto";

@Injectable()
export class AuthApiService {
    constructor(
        @Inject(AUTH_SERVICE) private authClient: ClientProxy
    ) { }

    async localLogin(currentUser) {
        try {
            const source = this.authClient.send('authClient/local/login', currentUser).pipe(
                timeout(5000)
            );
            const data = await lastValueFrom(source);
            return data;
        }
        catch (error) {
            throw new HttpException(error, error.statusCode);
        }
    }

    async googleLogin(currentUser) {
        try {
            const source = this.authClient.send('authClient/local/login', currentUser).pipe(
                timeout(5000)
            );
            const data = await lastValueFrom(source);
            return data;
        }
        catch (error) {
            throw new HttpException(error, error.statusCode);
        }
    }

    async refreshToken(currentUser) {
        try {
            const source = this.authClient.send('authClient/refresh_token', currentUser).pipe(
                timeout(5000)
            );
            const data = await lastValueFrom(source);
            return data;
        }
        catch (error) {
            throw new HttpException(error, error.statusCode);
        }
    }
}

@Injectable()
export class UserService {
    constructor(
        @Inject(AUTH_SERVICE) private authClient: ClientProxy
    ) { }

    async createAccount(createAccountDto: CreateAccountDto) {
        try {
            const source = this.authClient.send('authClient/create_account', { createAccountDto }).pipe(
                timeout(5000),
            );
            const data = await lastValueFrom(source);
            return data;
        }
        catch (error) {
            throw new HttpException(error, error.statusCode);
        }
    }

    async changePassword(currentUser, data: ChangePasswordDto) {
        try {
            const source = this.authClient.send('authClient/change_password', { currentUser, data }).pipe(
                timeout(5000),
            );
            const result = await lastValueFrom(source);
            return result;
        }
        catch (error) {
            throw new HttpException(error, error.statusCode);
        }
    }

    async updateProfile(user, data) {
        try {
            const { firstname, lastname } = data;
            if ((firstname && user.firstname === firstname) 
            || (lastname && user.lastname === lastname)
            || (!firstname && !lastname)) {
                throw new ConflictException({
                    message: 'No changes detected',
                    statusCode: HttpStatus.BAD_REQUEST
                });
            }
            const source = this.authClient.send('authClient/update_profile', { user , data }).pipe(
                timeout(5000),
            );
            const result = await lastValueFrom(source);
            return result;
        }
        catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new HttpException(error, error.statusCode);
        }
    }

    async changeAvatar(currentUser) {
        try {
            const source = this.authClient.send('authClient/change_avatar', currentUser).pipe(
                timeout(5000),
            );
            const result = await lastValueFrom(source);
            return result;
        }
        catch (error) {
            throw new HttpException(error, error.statusCode);
        }
    }
}