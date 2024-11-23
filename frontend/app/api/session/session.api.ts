import { apiClient } from '@/types/apiClient';

async function fetchData() {
  const data = await fetch('api/session');
  return data.json();
}

export async function getChildAssetGroups() {
  const response = await apiClient.items.createItemItemsPost({
    name: '1',
    price: 2,
    description: '3',
  });
  return response.data;
}
