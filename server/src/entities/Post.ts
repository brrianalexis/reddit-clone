import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

@ObjectType() //?   este decorador convierte a la clase en un ObjectType de type-graphql. los decoradores pueden stackearse, esta clase es una Entity y un ObjectType a la vez
@Entity() //?   este decorador le dice a MikroORM que esto es una entidad que corresponde a una tabla de la db.
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String)
  @Column()
  title!: string;
}
