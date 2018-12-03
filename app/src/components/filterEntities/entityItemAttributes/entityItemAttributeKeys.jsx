import { injectIntl, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import { EntityItemAttributes } from './entityItemAttributes';

const messages = defineMessages({
  placeholder: {
    id: 'EntityItemAttributeKeys.placeholder',
    defaultMessage: 'Enter attribute keys',
  },
});

export const EntityItemAttributeKeys = injectIntl(({ intl, ...props }) => (
  <EntityItemAttributes
    urlResolver={URLS.launchAttributeKeysSearch}
    placeholder={intl.formatMessage(messages.placeholder)}
    {...props}
  />
));
