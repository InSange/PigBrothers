import { apiClient } from '@/types/apiClient';
import {
  ApiGetAddUserFirebaseUserPostParams,
  ApiGetUserFirebaseUserUserIdGetParams,
  ApiUpdateUserFirebaseUserItemIdPutParams,
} from './types';

export async function addUserFirebaseUserPost({
  data,
}: ApiGetAddUserFirebaseUserPostParams) {
  const response = await apiClient.firebase.addUserFirebaseUserPost(data);
  return response.data;
}

export async function getUserFirebaseUserUserIdGet({
  userId,
}: ApiGetUserFirebaseUserUserIdGetParams) {
  const response =
    await apiClient.firebase.getUserFirebaseUserUserIdGet(userId);
  return response.data;
}

export async function updateUserFirebaseUserItemIdPut({
  itemId,
  data,
}: ApiUpdateUserFirebaseUserItemIdPutParams) {
  const response = await apiClient.firebase.updateUserFirebaseUserItemIdPut(
    itemId,
    data
  );
  return response.data;
}
