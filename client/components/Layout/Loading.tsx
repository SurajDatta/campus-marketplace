/**
 * Loading.tsx
 * Loading spinner component that will be shown on any page that has a loading.tsx file. This will be used to show the user that the page is loading.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { Box, Spinner } from '@chakra-ui/react';

const Loading = () => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      height="100vh"
    >
      <Spinner size="xl" />
    </Box>
  );
};

export default Loading;
