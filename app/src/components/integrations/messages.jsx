import { FormattedMessage } from 'react-intl';
import { SAUCE_LABS, EMAIL } from 'common/constants/integrationNames';

export const INTEGRATIONS_DESCRIPTIONS_MAP = {
  [SAUCE_LABS]: (
    <FormattedMessage
      id="Integrations.SauceLabs.description"
      defaultMessage="Configure an integration with Sauce Labs and watch video of test executions right in the ReportPortal application. For that carry out three easy steps: 1. Configure an  integration with Sauce Labs 2. Add attributes to test items SLID: N (where N - # of job in Sauce Labs) and SLDC: M (where M is US or EU) 3. Watch video on the log level."
    />
  ),
  [EMAIL]: (
    <FormattedMessage
      id="Integrations.Email.description"
      defaultMessage="Reinforce your ReportPortal instance with E-mail server integration. Be informed about test result finish in real time and easily configure list of recipients."
    />
  ),
};
