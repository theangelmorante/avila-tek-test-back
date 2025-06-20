import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      console.log('request.user', request.user);
      return null;
    }
    if (data) {
      console.log('request.user[data]', request.user[data]);
      return request.user[data];
    }
    console.log('request.user here', request.user);
    return request.user;
  },
);
