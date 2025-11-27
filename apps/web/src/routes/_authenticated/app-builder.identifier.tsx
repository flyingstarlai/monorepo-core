import { createFileRoute } from '@tanstack/react-router';
import { IdentifierPage } from '../../features/app-builder/pages/identifier.page';

export const Route = createFileRoute('/_authenticated/app-builder/identifier')({
  component: IdentifierPage,
});
