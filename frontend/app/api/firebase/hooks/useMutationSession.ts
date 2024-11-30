import { useMutation } from '@tanstack/react-query';
import {
  addChatMessageFirebaseChatChatIdAddPut,
  addItemToRealtimeFirebaseRealtimeItemsPost,
} from '../firebase.api';

export function useAddChatMessageFirebaseChatChatIdAddPut() {
  const mutation = useMutation({
    mutationFn: addChatMessageFirebaseChatChatIdAddPut,
  });

  return mutation;
}
export function useAddItemToRealtimeFirebaseRealtimeItemsPost() {
  const mutation = useMutation({
    mutationFn: addItemToRealtimeFirebaseRealtimeItemsPost,
  });

  return mutation;
}
