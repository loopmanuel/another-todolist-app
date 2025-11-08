import { useLocalSearchParams, useRouter } from 'expo-router';
import { ListForm } from '@/features/lists/components/list-form';

export default function EditList() {
  const router = useRouter();
  const params = useLocalSearchParams<{ list_id?: string }>();
  const listId = Array.isArray(params.list_id) ? params.list_id[0] : params.list_id;

  return (
    <ListForm
      listId={listId}
      onSuccess={() => {
        router.back();
      }}
    />
  );
}
