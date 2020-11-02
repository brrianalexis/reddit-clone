import { PrimaryKey, Property, Entity } from '@mikro-orm/core';
import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field(() => String)
  @Property({ type: 'text', unique: true })
  username!: string;

  @Field(() => String)
  @Property({ type: 'text', unique: true })
  email!: string;

  //?   Al no tener el decorador @Field(), no se puede seleccionar la contraseña, solo va a ser una columna en la db
  @Property({ type: 'text' })
  password!: string;
}
