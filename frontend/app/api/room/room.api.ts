import { apiClient } from '@/types/apiClient';
import {
  ApiAddRoomFirebaseRoomPostParams,
  ApiEndGameFirebaseRoomRoomIdEndPutParams,
  ApiStartGameFirebaseRoomIdStartPutParams,
} from './types';

export async function getAllRoomsFirebaseRoomGet() {
  const response = await apiClient.firebase.getAllRoomsFirebaseRoomGet();
  return response.data;
}

export async function addRoomFirebaseRoomPost({
  query,
}: ApiAddRoomFirebaseRoomPostParams) {
  const response = await apiClient.firebase.addRoomFirebaseRoomPost(query);
  return response.data;
}

export async function startGameFirebaseRoomRoomIdStartPut({
  roomId,
}: ApiStartGameFirebaseRoomIdStartPutParams) {
  const response =
    await apiClient.firebase.startGameFirebaseRoomRoomIdStartPut(roomId);
  return response.data;
}

export async function endGameFirebaseRoomRoomIdEndPut({
  roomId,
}: ApiEndGameFirebaseRoomRoomIdEndPutParams) {
  const response =
    await apiClient.firebase.endGameFirebaseRoomRoomIdEndPut(roomId);
  return response.data;
}
