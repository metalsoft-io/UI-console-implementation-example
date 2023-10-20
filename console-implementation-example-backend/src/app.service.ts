import { Injectable, HttpException, HttpStatus, } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as https from 'https';
import { UserCredsDto } from './app.controller';

const agent = new https.Agent({
  rejectUnauthorized: false,
});

interface AxiosErrorResponse {
  error?: {
    message: string;
  };
  message?: string;
}

interface AuthResponse {
  result: object;
  cookies: string[] | undefined;
}
@Injectable()
export class AppService {
  async authUser(userCreds: UserCredsDto): Promise<AuthResponse> {
    try {
      const userResponse = await axios.post(
        `${process.env.CONTROLLER_URL}/api?HTTPAuth=false`,
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'user_authenticate_password',
          params: [
            userCreds.email,
            userCreds.password,
            null,
            true,
            false,
            false,
            'AUTHENTICATION_METHOD_MYSQL',
          ],
        },
        { httpsAgent: agent },
      );

      const cookies = userResponse.headers['set-cookie'];
      return {
        result: userResponse.data.result,
        cookies,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const statusCode = axiosError.response?.status || 500;
        const message = (axiosError.response?.data as AxiosErrorResponse)?.error?.message || axiosError.message || 'An error occurred';

        throw new HttpException({
          status: statusCode,
          error: message,
        }, statusCode);
      } else {
        throw new HttpException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'An unexpected error occurred',
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
