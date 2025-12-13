import { createFileRoute } from '@tanstack/react-router';
import { GroupList } from '@/features/groups/components/group-list';

export const Route = createFileRoute('/_authenticated/groups/')({
  component: GroupsIndex,
});

function GroupsIndex() {
  return <GroupList />;
}
