// app/providers.tsx
'use client';

import { ReactQueryClientProvider } from '@/components/Common/ReactQueryClientProvider';
import { ChakraProvider, extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryClientProvider>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </ReactQueryClientProvider>
  );
}
