import { config } from 'dotenv';
import path from 'path';
import { Post } from './entities/Post';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';

config();

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post],
  dbName: 'reddit-clone',
  type: 'postgresql',
  debug: !__prod__,
  password: process.env.DB_PASS,
} as Parameters<typeof MikroORM.init>[0];
