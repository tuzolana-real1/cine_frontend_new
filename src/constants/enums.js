/**
 * Enums do backend
 * Valores exatos enviados e recebidos
 */

export const USER_TYPE = {
  VIEWER: 'VIEWER',
  STUDIO: 'STUDIO',
  ADMIN: 'ADMIN',
};

export const CONTENT_TYPE = {
  LIVESTREAM: 'LIVESTREAM',
  RECORDED: 'RECORDED',
  PREMIERE: 'PREMIERE',
};

export const CONTENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

export const DEFAULT_USER_TYPE = USER_TYPE.VIEWER;
export const DEFAULT_CONTENT_TYPE = CONTENT_TYPE.RECORDED;
