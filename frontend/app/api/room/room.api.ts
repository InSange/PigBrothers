import { apiClient } from '@/types/apiClient';
import {
  ApiEndGameFirebaseRoomRoomIdEndPutParams,
  ApiGetRoomStatusFirebaseRoomRommIdGetParams,
  ApiStartGameFirebaseRoomIdStartPutParams,
} from './types';

export async function getRoomStatusFirebaseRoomRoomIdGet({
  roomId,
}: ApiGetRoomStatusFirebaseRoomRommIdGetParams) {
  if (!roomId) return;
  const response =
    await apiClient.firebase.getRoomStatusFirebaseRoomRoomIdGet(roomId);
  return response.data;
}

export async function getAllRoomsFirebaseRoomGet() {
  const response = await apiClient.firebase.getAllRoomsFirebaseRoomGet();
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
