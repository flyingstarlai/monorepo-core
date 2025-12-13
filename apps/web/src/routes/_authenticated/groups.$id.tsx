import { createFileRoute } from '@tanstack/react-router';
import { GroupMembersPage } from '@/features/groups/components/group-members-page';

export const Route = createFileRoute('/_authenticated/groups/$id')({
  component: GroupDetailPage,
});

function GroupDetailPage() {
  const { id } = Route.useParams();
  return <GroupMembersPage groupId={id} />;
}
