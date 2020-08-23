import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm-config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { __prod__ } from './constants';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  app.listen(4000, () => {
    console.log('Express server running on localhost:4000');
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    //?   context es un objeto especial al que pueden acceder todos los resolvers. en este caso vamos a pasar em de MikroORM para realizar las operaciones de la db
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });
};

try {
  main();
} catch (err) {
  console.log('main() -> err', err);
}
