import { apiClient } from '@/types/apiClient';
import {
  ApiAddChatMessageFirebaseChatChatIdAddPutParams,
  ApiAddItemToRealtimeFirebaseRealtimeItemsPostParams,
  ApiGetItemFromRealtimeFirebaseRealtimeItemsItemIdGetParams,
} from './types';

export async function addChatMessageFirebaseChatChatIdAddPut({
  chatId,
  data,
}: ApiAddChatMessageFirebaseChatChatIdAddPutParams) {
  const response =
    await apiClient.firebase.addChatMessageFirebaseChatChatIdAddPut(
      chatId,
      data
    );
  return response.data;
}
export async function addItemToRealtimeFirebaseRealtimeItemsPost({
  data,
}: ApiAddItemToRealtimeFirebaseRealtimeItemsPostParams) {
  const response =
    await apiClient.firebase.addItemToRealtimeFirebaseRealtimeItemsPost(data);
  return response.data;
}
export async function getItemFromRealtimeFirebaseRealtimeItemsItemIdGet({
  itemId,
}: ApiGetItemFromRealtimeFirebaseRealtimeItemsItemIdGetParams) {
  const response =
    await apiClient.firebase.getItemFromRealtimeFirebaseRealtimeItemsItemIdGet(
      itemId
    );
  return response.data;
}
