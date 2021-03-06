import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
} from 'type-graphql';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { MyContext } from '../types';
import { User } from '../entities/User';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
// import { getConnection } from 'typeorm';

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

//?   ObjectType's podemos usarlos como returns en las mutations
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 2',
          },
        ],
      };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired',
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(parseInt(userId));

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists',
          },
        ],
      };
    }
    await User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );

    await redis.del(key);

    //?   login después de cambiar contraseña
    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      //?   el email no está en la db
      return true;
    }

    const token = uuidv4();
    const threeDays = 1000 * 60 * 60 * 24 * 3;

    await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', threeDays);

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    //?   no estás logueado
    if (!req.session!.userId) {
      return null;
    }

    return User.findOne(req.session!.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);

    let user;
    try {
      const result = await User.create({
        username: options.username,
        email: options.email,
        password: hashedPassword,
      }).save();
      //?   usando el queryBuilder de typeorm
      /* const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning('*')
        .execute(); 
        user = result.raw[0];
      */
      user = result;
    } catch (err) {
      //?   username duplicado
      if (err.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }

    //?   guarda una cookie con el usuario para loguearlo cuando se registra
    req.session!.userId = user?.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "that username doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }

    //?   el signo de exclamación antes de userId le especifica a TypeScript que no va a ser undefined
    req.session!.userId = user.id;
    //?   modificamos el tipado de req dentro de ../types.ts para darle tipado a req.session como Express.Session. originalmente está tipado como session?: Express.Session; pero si le quitamos el signo de pregunta, le estamos diciendo explícitamente al compilador que no va a ser undefined. con eso, deja de ser necesario el signo de exclamación
    // req.session.userId = user.id;

    return {
      user,
    };
  }
  //?   esta mutation va a destruir la session de redis y una vez que la destruye, limpiar la cookie
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise(resolve =>
      req.session?.destroy(err => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
