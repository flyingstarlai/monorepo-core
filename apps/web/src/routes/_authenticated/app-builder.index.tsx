import { createFileRoute } from '@tanstack/react-router';
import { MobileAppBuilderPage as EnhancedMobileAppBuilderPage } from '../../features/app-builder/app-builder.page.tsx';

export const Route = createFileRoute('/_authenticated/app-builder/')({
  component: EnhancedMobileAppBuilderPage,
});
