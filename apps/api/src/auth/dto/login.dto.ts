export class LoginDto {
  username: string;
  password: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}
