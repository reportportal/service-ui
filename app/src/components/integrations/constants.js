import JiraIcon from 'common/img/plugins/jira.svg';
import RallyIcon from 'common/img/plugins/rally.png';
import EmailIcon from 'common/img/plugins/email.svg';
import { JIRA, RALLY, EMAIL } from 'common/constants/integrationNames';
import { JiraIntegration, RallyIntegration, EmailIntegration } from './integrationsProviders';

export const INTEGRATIONS_IMAGES_MAP = {
  [JIRA]: JiraIcon,
  [RALLY]: RallyIcon,
  [EMAIL]: EmailIcon,
};

export const INTEGRATIONS_COMPONENTS_MAP = {
  [JIRA]: JiraIntegration,
  [RALLY]: RallyIntegration,
  [EMAIL]: EmailIntegration,
};
