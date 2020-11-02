import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { Formik, Form } from 'formik';
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { createUrqlClient } from '../utils/createUrqlClient';

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          //?   acá el optional chaining lo usamos para que en la condicion se evalúe a fondo, ya que response.data puede ser undefined
          //?   en el caso de que data sea undefined, por el optional chaining, no va a tirar error
          //?   sin optional chaining, tiraría error en caso de ser undefined
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <Box mt={4}>
              <InputField
                type="password"
                name="password"
                placeholder="password"
                label="Password"
              />
            </Box>
            <Flex mt={2}>
              <NextLink href="forgot-password">
                <Link ml="auto">Forgot your password?</Link>
              </NextLink>
            </Flex>
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
