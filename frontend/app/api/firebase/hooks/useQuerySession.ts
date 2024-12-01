import { QUERY_KEY } from '@/constant';
import { useQuery } from '@tanstack/react-query';
import { getItemFromRealtimeFirebaseRealtimeItemsItemIdGet } from '../firebase.api';
import { ApiGetItemFromRealtimeFirebaseRealtimeItemsItemIdGetParams } from '../types';

export function useGetItemFromRealtimeFirebaseRealtimeItemsItemIdGet({
  itemId,
}: ApiGetItemFromRealtimeFirebaseRealtimeItemsItemIdGetParams) {
  return useQuery({
    queryKey: [QUERY_KEY.GET_ITEMS_BY_REALTIME],
    queryFn: () =>
      getItemFromRealtimeFirebaseRealtimeItemsItemIdGet({ itemId }),
  });
}
