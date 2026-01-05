import { createFileRoute } from '@tanstack/react-router';
import { MobileAppBuilderPage as EnhancedMobileAppBuilderPage } from '../../features/app-builder/app-builder.page.tsx';

export const Route = createFileRoute('/_authenticated/app-builder/')({
  component: AppBuilderIndexWrapper,
});

function AppBuilderIndexWrapper() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <EnhancedMobileAppBuilderPage />
    </div>
  );
}
