import { createFileRoute } from '@tanstack/react-router';
import { AppDevices } from '@/features/apps/components/app-devices';
import { Route as ParentRoute } from './apps.$id';

export const Route = createFileRoute('/_authenticated/apps/$id/')({
  component: AppDevicesPage,
});

function AppDevicesPage() {
  const { id } = ParentRoute.useParams();
  const { appName } = ParentRoute.useSearch();
  return <AppDevices appId={id} appName={appName} />;
}
