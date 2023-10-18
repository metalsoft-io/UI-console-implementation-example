import { Controller, Post, Res, Body, Get } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

export class UserCredsDto {
  email: string;
  password: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  async test(): Promise<string> {
    return 'test';
  }

  @Post('authUser')
  async authUser(@Body() userCreds: UserCredsDto, @Res() res: Response): Promise<void> {
      const { result, cookies } = await this.appService.authUser(userCreds);
      if (cookies) {
        cookies.forEach((cookie: string) => {
          const [name, value] = cookie.split(';')[0].split('=');
          res.cookie(name, value, {
            domain: process.env.COOKIE_DOMAIN || 'localhost',
            path: '/',
            sameSite: 'none',
            secure: true,
          });
        });
      }
  
      res.status(200).json(result);
  }
}
