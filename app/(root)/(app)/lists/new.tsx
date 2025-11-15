import { useRouter } from 'expo-router';
import { ListSheetForm } from '@/features/lists/components/list-sheet-form';
import { ListForm } from '@/features/lists/components/list-form';

export default function NewList() {
  const router = useRouter();

  // return <ListSheetForm onDismiss={() => router.back()} />;
  return <ListForm />;
}
