import { injectIntl, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import { EntityItemAttributes } from './entityItemAttributes';

const messages = defineMessages({
  placeholder: {
    id: 'EntityItemAttributeValues.placeholder',
    defaultMessage: 'Enter attribute values',
  },
});

const normalizeValue = (value) => (Array.isArray(value) ? value.join(',') : value);

export const EntityItemAttributeValues = injectIntl(({ intl, customProps, ...props }) => (
  <EntityItemAttributes
    urlResolver={(projectId) =>
      URLS.launchAttributeValuesSearch(projectId, normalizeValue(customProps.attributeKey))
    }
    placeholder={intl.formatMessage(messages.placeholder)}
    {...props}
  />
));
