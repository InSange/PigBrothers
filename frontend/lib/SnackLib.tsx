'use client';
import { SnackbarProvider, SnackbarProviderProps } from 'notistack';

const SnackLib = (props: SnackbarProviderProps) => {
  return (
    <SnackbarProvider
      anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
      {...props}
    />
  );
};

export default SnackLib;
