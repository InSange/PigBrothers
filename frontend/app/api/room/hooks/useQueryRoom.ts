import { QUERY_KEY } from '@/constant';
import { useQuery } from '@tanstack/react-query';
import { getAllRoomsFirebaseRoomGet } from '../room.api';

export function useGetAllRoomsFirebaseRoomGet() {
  return useQuery({
    queryKey: [QUERY_KEY.GET_ALL_ROOMS],
    queryFn: () => getAllRoomsFirebaseRoomGet(),
  });
}
