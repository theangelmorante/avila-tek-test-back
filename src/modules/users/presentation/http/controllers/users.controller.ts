import { Controller, Get, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../../../application/queries/get-user-by-id.query';

@Controller('users')
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req) {
    const query = new GetUserByIdQuery(req.user.sub);
    const user = await this.queryBus.execute(query);

    return {
      message: 'Perfil obtenido exitosamente',
      data: user,
    };
  }
}
