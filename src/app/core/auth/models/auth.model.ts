export interface IUser {
  id: number;
  name: string;
  userName: string;
  password?: string;
  activated: boolean;
  permissions: IPermission[];
}

interface IPermission {
  id: number;
  description: string;
}

export interface IFormLoginModel {
  userName: string;
  password: string;
}

export const MOCK_USERS: IUser[] = [
  {
    id: 1,
    name: 'Paulo Roberto',
    userName: 'paulo.morais',
    activated: true,
    password: '123456',
    permissions: [
      {
        id: 1,
        description: 'admin',
      },
      {
        id: 2,
        description: 'guest',
      },
    ],
  },
  {
    id: 2,
    name: 'Ana Priscila',
    userName: 'ana.carneiro',
    activated: true,
    password: '123456',
    permissions: [
      {
        id: 1,
        description: 'admin',
      },
      {
        id: 2,
        description: 'guest',
      },
    ],
  },
  {
    id: 3,
    name: 'Clayton Liberato',
    userName: 'clayton.liberato',
    activated: false,
    password: '123456',
    permissions: [
      {
        id: 2,
        description: 'guest',
      },
    ],
  },
];
