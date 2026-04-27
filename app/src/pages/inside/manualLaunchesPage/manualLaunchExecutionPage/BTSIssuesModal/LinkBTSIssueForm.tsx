import { useIntl } from 'react-intl';
import { FieldText } from '@reportportal/ui-kit';

import { FieldProvider } from 'components/fields';

import { messages } from './messages';

export const LinkBTSIssueForm = () => {
  const { formatMessage } = useIntl();

  return (
    <form>
      <FieldProvider name="ticketName">
        <FieldText
          label={formatMessage(messages.ticketNameLabel)}
          placeholder={formatMessage(messages.ticketNamePlaceholder)}
          value=""
          defaultWidth={false}
        />
      </FieldProvider>
    </form>
  );
};
