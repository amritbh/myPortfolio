declare module "react-reveal/Fade" {
  import { ComponentType, ReactNode } from "react";
  interface FadeProps {
    bottom?: boolean;
    top?: boolean;
    left?: boolean;
    right?: boolean;
    duration?: number;
    delay?: number;
    children?: ReactNode;
    [key: string]: unknown;
  }
  const Fade: ComponentType<FadeProps>;
  export default Fade;
}

declare module "react-reveal" {
  export { default as Fade } from "react-reveal/Fade";
}
