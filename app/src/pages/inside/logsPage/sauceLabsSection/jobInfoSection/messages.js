import { defineMessages } from 'react-intl';
import { COMMANDS_TAB, LOGS_TAB, METADATA_TAB } from './constants';

export const messages = defineMessages({
  commandTitle: {
    id: 'CommandItem.commandTitle',
    defaultMessage: 'Command',
  },
  parametersTitle: {
    id: 'CommandItem.parametersTitle',
    defaultMessage: 'Parameters',
  },
  responseTitle: {
    id: 'CommandItem.responseTitle',
    defaultMessage: 'Response',
  },
  [COMMANDS_TAB]: {
    id: 'JobInfoSection.commands',
    defaultMessage: 'Commands',
  },
  [LOGS_TAB]: {
    id: 'JobInfoSection.logs',
    defaultMessage: 'Logs',
  },
  [METADATA_TAB]: {
    id: 'JobInfoSection.metadata',
    defaultMessage: 'Metadata',
  },
});
