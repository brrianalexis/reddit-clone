import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';

//?   este tipado le permite a TypeScript sugerirte propiedades y métodos del objeto em al que voy a acceder dentro de mi context y tener type-checking en mis resolvers
export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
};
