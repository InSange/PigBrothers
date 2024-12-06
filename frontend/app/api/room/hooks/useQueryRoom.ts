import { QUERY_KEY } from '@/constant';
import { useQuery } from '@tanstack/react-query';
import {
  getAllRoomsFirebaseRoomGet,
  getRoomStatusFirebaseRoomRoomIdGet,
} from '../room.api';
import { ApiGetRoomStatusFirebaseRoomRommIdGetParams } from '../types';

export function useGetAllRoomsFirebaseRoomGet() {
  return useQuery({
    queryKey: [QUERY_KEY.GET_ALL_ROOMS],
    queryFn: () => getAllRoomsFirebaseRoomGet(),
  });
}

export function useGetRoomStatusFirebaseRoomRoomIdGet({
  roomId,
}: ApiGetRoomStatusFirebaseRoomRommIdGetParams) {
  return useQuery({
    queryKey: [QUERY_KEY.GET_ROOM_STATUS, roomId],
    queryFn: () => getRoomStatusFirebaseRoomRoomIdGet({ roomId }),
  });
}
