interface User {
  id: number;
  email: string;
  emailVerified: boolean;
  displayName: string;
  loginType: string;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
}

interface CreateUserDto extends Omit<User, "id"> {}

export type { CreateUserDto, User };
