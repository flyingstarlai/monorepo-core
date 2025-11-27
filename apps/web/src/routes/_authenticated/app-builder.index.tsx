import { createFileRoute } from '@tanstack/react-router';
import { MobileAppBuilderPage } from '../../features/app-builder/app-builder.page';

export const Route = createFileRoute('/_authenticated/app-builder/')({
  component: MobileAppBuilderPage,
});
