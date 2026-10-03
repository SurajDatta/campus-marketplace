/**
 * SuccessfulPurchaseAnimation.tsx
 * Component that will show on the buyer and seller side when the purchase is complete on both sides. This will have a green background and a checkmark in the middle. It will run for 3 seconds.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, useDisclosure, Icon, Progress} from '@chakra-ui/react';
import { CheckCircleIcon} from '@chakra-ui/icons';

type SuccessfulPurchaseAnimationProps = {
  onAnimationEnd: () => void;
};

const SuccessfulPurchaseAnimation: React.FC<SuccessfulPurchaseAnimationProps> = ({ onAnimationEnd }) => {
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });
  const [halfway, setHalfway] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const halfwayTimer = setTimeout(() => {
        setHalfway(true);
        const timer = setTimeout(() => {
          onOpen();
          onAnimationEnd();
        }, 1500); // Halfway through the animation
        return () => clearTimeout(timer);
      }, 1500); // Halfway through the animation
      return () => clearTimeout(halfwayTimer);
    }
  }, [isOpen, onOpen, onAnimationEnd, setHalfway]);

  return (
    <Flex
      align="center"
      justify="center"
      bg="green.500"
      color="white"
      h="100vh"
      w="100vw"
      position="fixed"
      top="0"
      left="0"
      zIndex="1000"
      animation="fadeInOut 3s ease-in-out"
    >
      <Box>
        {!halfway ? (
        <Box textAlign="center">
          <Progress size="xs" isIndeterminate /> 
          <Text fontSize="2xl" fontWeight="bold">Verifying Purchase</Text>
        </Box>
        ) : (
          <Box textAlign="center">
            <Icon as={CheckCircleIcon} boxSize={16} mb={4} />
            <Text fontSize="2xl" fontWeight="bold">Purchase Successful</Text>
          </Box>
          )}
      </Box>
    </Flex>
  );
};

export default SuccessfulPurchaseAnimation;
