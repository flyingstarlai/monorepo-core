import { SetMetadata } from '@nestjs/common';

export const ONLYOFFICE_AUTHORIZED_KEY = 'onlyofficeAuthorized';

export const OnlyofficeAuthorized = () =>
  SetMetadata(ONLYOFFICE_AUTHORIZED_KEY, true);
