import { IUser } from '../models/auth.model';

export const MOCK_USERS: IUser[] = [
  {
    id: 1,
    name: 'Paulo Roberto',
    userName: 'paulo.morais',
    email: 'prmorais@gmail.com',
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
    email: 'ana@gmail.com',
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
    email: 'clayton@gmail.com',
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
