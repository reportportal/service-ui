import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { getFileIconSource } from 'controllers/attachments/utils';
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

const MOCK_DATA = ALL_FILETYPES.map((fileType, id) => ({
  id: String(id),
  src: getFileIconSource({
    id: String(id),
    contentType: fileType,
  }),
  alt: fileType,
  attachment: {
    id: String(id),
    contentType: fileType,
  },
}));
const projectId = 'ProjectXYZ';

storiesOf('Pages/Inside/LogsPage/LogItemInfo/LogItemInfoTabs/Attachments', module)
  .addDecorator(
    host({
      title: 'Log Attachment',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#f5f5f5',
      width: 680,
      height: 'auto',
    }),
  )
  .addDecorator(withReadme(README))
  .add('With all icon types', () => (
    <Attachments
      attachments={MOCK_DATA}
      projectId={projectId}
      openBinaryModal={action('open-binary-modal')}
      openHarModal={action('open-har-modal')}
      openImageModal={action('open-image-modal')}
    />
  ));
