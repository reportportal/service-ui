import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { Attachments } from './attachments';
import README from './README.md';

const ALL_FILETYPES = [
  'image/png',
  'text/xml',
  'application/xml',
  'text/x-php',
  'application/json',
  'application/pdf',
  'application/javascript',
  'xxx/har',
  'xxx/pic',
  'text/css',
  'text/csv',
  'text/html',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-tar',
  'application/gzip',
];

const logsWithAttachments = ALL_FILETYPES.map((contentType, id) => ({
  binaryContent: {
    contentType,
    id,
  },
}));

const state = {
  log: {
    attachments: {
      logsWithAttachments,
      loading: false,
    },
  },
  modal: {
    activeModal: null,
  },
};

storiesOf('Pages/Inside/LogsPage/LogItemInfo/LogItemInfoTabs/Attachments', module)
  .addDecorator(
    host({
      title: 'Log Attachment',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#f5f5f5',
      width: 800,
      height: 'auto',
    }),
  )
  .addDecorator(withReadme(README))
  .add('With all icon types', () => (
    <WithState state={state}>
      <Attachments activeItemId={0} onChangeActiveItem={action('Change active item')} />
    </WithState>
  ));
