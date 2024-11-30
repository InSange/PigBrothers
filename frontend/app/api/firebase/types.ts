import { AddChatRequest, Item } from '@/types/Api';

export type ApiAddChatMessageFirebaseChatChatIdAddPutParams = {
  chatId: string;
  data: AddChatRequest;
};

export type ApiAddItemToRealtimeFirebaseRealtimeItemsPostParams = {
  data: Item;
};

export type ApiGetItemFromRealtimeFirebaseRealtimeItemsItemIdGetParams = {
  itemId: string;
};
