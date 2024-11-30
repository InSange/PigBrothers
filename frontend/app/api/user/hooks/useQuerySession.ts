import { QUERY_KEY } from '@/constant';
import { useQuery } from '@tanstack/react-query';
import { ApiGetUserFirebaseUserUserIdGetParams } from '../types';
import { getUserFirebaseUserUserIdGet } from '../user.api';

// Get User bu UserID
export function useGetUserFirebaseUserUserIdGet({
  userId,
}: ApiGetUserFirebaseUserUserIdGetParams) {
  return useQuery({
    queryKey: [QUERY_KEY.GET_USER_BY_USERID, userId],
    queryFn: () => getUserFirebaseUserUserIdGet({ userId }),
    enabled: !!userId,
  });
}
