import { SERVER_FOOTER_LINKS_KEY } from 'controllers/appInfo';

export const prepareFooterLinksData = (value) => ({
  key: SERVER_FOOTER_LINKS_KEY,
  value: JSON.stringify(value),
});
