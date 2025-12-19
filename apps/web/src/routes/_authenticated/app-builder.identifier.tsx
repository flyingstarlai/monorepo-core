import { createFileRoute } from '@tanstack/react-router';
import { IdentifierPage as EnhancedIdentifierPage } from '../../features/app-builder/pages/identifier-enhanced.page';

export const Route = createFileRoute('/_authenticated/app-builder/identifier')({
  component: EnhancedIdentifierPage,
});
