import { createFileRoute } from '@tanstack/react-router';
import { DashboardOverviewComponent } from '@/features/dashboard/components/dashboard-overview';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardIndex,
});

function DashboardIndex() {
  return <DashboardOverviewComponent />;
}
