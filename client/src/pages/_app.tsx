import { ChakraProvider } from '@chakra-ui/core';
import theme from '../theme';

function MyApp({ Component, pageProps }: any) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
