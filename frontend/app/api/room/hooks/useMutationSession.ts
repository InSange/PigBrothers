import { useMutation } from '@tanstack/react-query';
import {
  endGameFirebaseRoomRoomIdEndPut,
  startGameFirebaseRoomRoomIdStartPut,
} from '../room.api';

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
