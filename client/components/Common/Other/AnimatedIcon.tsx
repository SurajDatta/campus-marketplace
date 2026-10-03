/**
 * AnimatedIcon.tsx
 * Using lord-icon to get animated icons, but use next/dynamic to load animation libraries without server-side rendering (SSR).
 * @AshokSaravanan222
 * @2024-09-01
 */
import React, { useEffect } from 'react';

// Define the props for the component to match the original <lord-icon> element
interface AnimatedIconProps {
  src: string;
  trigger?: 'hover' | 'click' | 'morph' | 'loop';
  colors?: string;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  [key: string]: any; // To allow any other custom attributes
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ src, trigger = 'hover', colors = 'primary:#000000', style = {}, onClick, ...rest }) => {
  useEffect(() => {
    // Dynamically import the animation libraries only on the client side
    if (typeof window !== 'undefined') {
      import('lottie-web').then(lottie => {
        const lottieMod: any = lottie;
        import('@lordicon/element').then(module => {
          const { defineElement } = module;
          defineElement(lottieMod.loadAnimation);
        });
      });
    }
  }, []);

  return (
    <lord-icon
      src={src}
      trigger={trigger}
      colors={colors}
      style={style}
      onClick={onClick}
      {...rest} // Spread any other props to support additional attributes
    ></lord-icon>
  );
};

export default AnimatedIcon;
