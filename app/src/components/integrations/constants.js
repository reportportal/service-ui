import { JIRA, RALLY, EMAIL, SAUCE_LABS } from 'common/constants/integrationNames';
import JiraIcon from 'common/img/plugins/jira.svg';
import RallyIcon from 'common/img/plugins/rally.png';
import EmailIcon from 'common/img/plugins/email.svg';
import SauceLabsIcon from 'common/img/plugins/sauce-labs.png';
import { SauceLabsInfo, SauceLabsSettings } from './integrationProviders';

export const INTEGRATIONS_IMAGES_MAP = {
  [JIRA]: JiraIcon,
  [RALLY]: RallyIcon,
  [EMAIL]: EmailIcon,
  [SAUCE_LABS]: SauceLabsIcon,
};

export const INTEGRATIONS_INFO_COMPONENTS_MAP = {
  [SAUCE_LABS]: SauceLabsInfo,
};

export const INTEGRATIONS_SETTINGS_COMPONENTS_MAP = {
  [SAUCE_LABS]: SauceLabsSettings,
};
