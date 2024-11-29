import { useMutation } from '@tanstack/react-query';
import {
  addRoomFirebaseRoomPost,
  endGameFirebaseRoomRoomIdEndPut,
  joinRoomFirebaseRoomRoomIdJoinPut,
  leaveRoomFirebaseRoomRoomIdLeavePut,
  startGameFirebaseRoomRoomIdStartPut,
} from '../room.api';

export function useAddRoomFirebaseRoomPost() {
  const mutation = useMutation({
    mutationFn: addRoomFirebaseRoomPost,
  });

  return mutation;
}

export function useStartGameFirebaseRoomRoomIdStartPut() {
  const mutation = useMutation({
    mutationFn: startGameFirebaseRoomRoomIdStartPut,
  });

  return mutation;
}
export function useEndGameFirebaseRoomRoomIdEndPut() {
  const mutation = useMutation({
    mutationFn: endGameFirebaseRoomRoomIdEndPut,
  });

  return mutation;
}
export function useLeaveRoomFirebaseRoomRoomIdLeavePut() {
  const mutation = useMutation({
    mutationFn: leaveRoomFirebaseRoomRoomIdLeavePut,
  });

  return mutation;
}
export function useJoinRoomFirebaseRoomRoomIdJoinPut() {
  const mutation = useMutation({
    mutationFn: joinRoomFirebaseRoomRoomIdJoinPut,
  });

  return mutation;
}
