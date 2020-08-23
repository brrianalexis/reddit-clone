import { config } from 'dotenv';
import path from 'path';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';

config();

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: 'reddit-clone',
  type: 'postgresql',
  debug: !__prod__,
  password: process.env.DB_PASS,
} as Parameters<typeof MikroORM.init>[0];
