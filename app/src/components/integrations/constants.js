import { JIRA, RALLY, EMAIL, SAUCE_LABS } from 'common/constants/integrationNames';
import JiraIcon from 'common/img/plugins/jira.svg';
import RallyIcon from 'common/img/plugins/rally.png';
import EmailIcon from 'common/img/plugins/email.png';
import SauceLabsIcon from 'common/img/plugins/sauce-labs.png';
import {
  SauceLabsSettings,
  SauceLabsFormFields,
  EmailSettings,
  EmailFormFields,
  JiraSettings,
  JiraConnectionFormFields,
} from './integrationProviders';

export const INTEGRATION_NAMES_TITLES = {
  [JIRA]: 'JIRA',
  [RALLY]: 'RALLY',
  [EMAIL]: 'Email Server',
  [SAUCE_LABS]: 'Sauce Labs',
};

export const INTEGRATIONS_IMAGES_MAP = {
  [JIRA]: JiraIcon,
  [RALLY]: RallyIcon,
  [EMAIL]: EmailIcon,
  [SAUCE_LABS]: SauceLabsIcon,
};

export const INTEGRATIONS_SUPPORTS_MULTIPLE_INSTANCES = [JIRA, RALLY];

export const INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP = {
  [SAUCE_LABS]: SauceLabsFormFields,
  [EMAIL]: EmailFormFields,
  [JIRA]: JiraConnectionFormFields,
};

export const INTEGRATIONS_SETTINGS_COMPONENTS_MAP = {
  [SAUCE_LABS]: SauceLabsSettings,
  [EMAIL]: EmailSettings,
  [JIRA]: JiraSettings,
};
