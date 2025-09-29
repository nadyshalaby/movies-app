import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../database/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: Omit<User, 'password' | 'refreshToken'>;

  constructor(accessToken: string, user: User) {
    this.accessToken = accessToken;
    this.user = user;
  }
}