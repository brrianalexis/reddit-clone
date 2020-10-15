import 'reflect-metadata';
import { config } from 'dotenv';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm-config';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import { COOKIE_NAME, __prod__ } from './constants';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

config();

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //?   10 años
        httpOnly: true,
        sameSite: 'lax', //?   csrf
        secure: __prod__, //?   la cookie solo anda en https. en local no usamos https así que lo seteamos solo en prod
      },
      saveUninitialized: false,
      secret: <string>process.env.REDIS_SECRET,
      // secret: `${process.env.REDIS_SECRET}`,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    //?   context es un objeto especial al que pueden acceder todos los resolvers. en este caso vamos a pasar em de MikroORM para realizar las operaciones de la db
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: { origin: 'http://localhost:3000' },
  });

  app.listen(4000, () => {
    console.log('Express server running on localhost:4000');
  });
};

try {
  main();
} catch (err) {
  console.log('main() -> err', err);
}
