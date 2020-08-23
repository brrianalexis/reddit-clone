import { PrimaryKey, Property, Entity } from '@mikro-orm/core';
import { ObjectType, Field } from 'type-graphql';

@ObjectType() //?   este decorador convierte a la clase en un ObjectType de type-graphql. los decoradores pueden stackearse, esta clase es una Entity y un ObjectType a la vez
@Entity() //?   este decorador le dice a MikroORM que esto es una entidad que corresponde a una tabla de la db.
export class Post {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field(() => String)
  @Property({ type: 'text' })
  title!: string;
}
