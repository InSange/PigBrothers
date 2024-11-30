import { apiClient } from '@/types/apiClient';
import {
  ApiAddRoomFirebaseRoomPostParams,
  ApiEndGameFirebaseRoomRoomIdEndPutParams,
  ApiJoinRoomFirebaseRoomRoomIdJoinPutParams,
  ApiLeaveRoomFirebaseRoomRoomIdLeavePutParams,
  ApiStartGameFirebaseRoomIdStartPutParams,
} from './types';

export async function getAllRoomsFirebaseRoomGet() {
  const response = await apiClient.firebase.getAllRoomsFirebaseRoomGet();
  return response.data;
}

export async function addRoomFirebaseRoomPost({
  data,
}: ApiAddRoomFirebaseRoomPostParams) {
  const response = await apiClient.firebase.addRoomFirebaseRoomPost(data);
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

export async function leaveRoomFirebaseRoomRoomIdLeavePut({
  query,
  roomId,
}: ApiLeaveRoomFirebaseRoomRoomIdLeavePutParams) {
  const response = await apiClient.firebase.leaveRoomFirebaseRoomRoomIdLeavePut(
    roomId,
    query
  );
  return response.data;
}

export async function joinRoomFirebaseRoomRoomIdJoinPut({
  query,
  roomId,
}: ApiJoinRoomFirebaseRoomRoomIdJoinPutParams) {
  const response = await apiClient.firebase.joinRoomFirebaseRoomRoomIdJoinPut(
    roomId,
    query
  );
  return response.data;
}
