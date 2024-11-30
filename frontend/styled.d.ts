import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      backgroundColor: string;
      defaultBackground: string;
      disabledBackground: string;
      disabledText: string;
      error: string;
      gray: string;
    };
  }
}
