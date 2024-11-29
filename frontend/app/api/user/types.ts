import {
  AddChatRequest,
  Item,
  RoomModel,
  UpdateUserFirebaseUserItemIdPutPayload,
  UserModel,
} from '@/types/Api';

export type ApiGetAddUserFirebaseUserPostParams = {
  data: UserModel;
};

export type ApiGetUserFirebaseUserUserIdGetParams = {
  userId: string;
};

export type ApiUpdateUserFirebaseUserItemIdPutParams = {
  itemId: string;
  data: UpdateUserFirebaseUserItemIdPutPayload;
};
