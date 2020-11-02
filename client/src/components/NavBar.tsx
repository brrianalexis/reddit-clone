import React from 'react';
import NextLink from 'next/link';
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    //*   para que la query no corra en el server, en pages que tienen activado SSR
    //?   porque en el server no hay cookie, entonces data siempre va a ser null
    pause: isServer(),
  });

  let body = null;

  //?   cargando
  if (fetching) {
    //*   solo para ser declarativo 👇🏻
    body = null;
    //?   el usuario no está logueado
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">Register</Link>
        </NextLink>
      </>
    );
    //?   el usuario está logueado
  } else {
    body = (
      <Flex>
        <Box color="white" mr={2}>
          {data.me.username}
        </Box>
        <Button
          variant="link"
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="black" p={4}>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};
