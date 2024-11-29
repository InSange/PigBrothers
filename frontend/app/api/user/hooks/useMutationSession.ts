import { useMutation } from '@tanstack/react-query';
import {
  addUserFirebaseUserPost,
  updateUserFirebaseUserItemIdPut,
} from '../user.api';

export function useAddUserFirebaseUserPost() {
  const mutation = useMutation({
    mutationFn: addUserFirebaseUserPost,
  });

  return mutation;
}

export function useUpdateUserFirebaseUserItemIdPut() {
  const mutation = useMutation({
    mutationFn: updateUserFirebaseUserItemIdPut,
  });

  return mutation;
}
