import { apiClient } from '@/types/apiClient';

export async function getChildAssetGroups() {
  const response = await apiClient.items.createItemItemsPost({
    name: '1',
    price: 2,
    description: '3',
  });
  return response.data;
}
