import { injectIntl, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import { EntityItemAttributes } from './entityItemAttributes';

const messages = defineMessages({
  placeholder: {
    id: 'EntityItemAttributeValues.placeholder',
    defaultMessage: 'Enter attribute values',
  },
});

export const EntityItemAttributeValues = injectIntl(({ intl, ...props }) => (
  <EntityItemAttributes
    urlResolver={URLS.launchAttributeValuesSearch}
    placeholder={intl.formatMessage(messages.placeholder)}
    {...props}
  />
));
