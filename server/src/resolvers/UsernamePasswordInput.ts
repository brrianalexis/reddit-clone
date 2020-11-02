import { InputType, Field } from 'type-graphql';

//?   InputType's podemos usarlos como args en las mutations

@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
