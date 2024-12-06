import { apiClient } from '@/types/apiClient';
import {
  ApiGetAddUserFirebaseUserPostParams,
  ApiGetUserFirebaseUserUserIdGetParams,
  ApiUpdateUserFirebaseUserItemIdPutParams,
} from './types';

// Create an user
export async function addUserFirebaseUserPost({
  data,
}: ApiGetAddUserFirebaseUserPostParams) {
  const response = await apiClient.firebase.addUserFirebaseUserPost(data);
  return response.data;
}

// Get User By Id
export async function getUserFirebaseUserUserIdGet({
  userId,
}: ApiGetUserFirebaseUserUserIdGetParams) {
  if (!userId) return;
  const response =
    await apiClient.firebase.addUserFirebaseUserUserIdGet(userId);
  return response.data;
}

// update user
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
