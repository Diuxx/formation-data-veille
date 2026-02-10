
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: Roles;
}

export interface Auth {
  isAuthenticated: boolean,
  user?: User
}

export enum Roles {
  admin = 'ADMIN',
  user = 'USER'
}