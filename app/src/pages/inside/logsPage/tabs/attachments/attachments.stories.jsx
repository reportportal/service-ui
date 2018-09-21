import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators/withState';
import { generateFakeAttachments } from './test-data';
import Attachments from './attachments';
import README from './README.md';

const ALL_FILETYPES = 'invalid,xml,XML,php,json,js,har,css,csv,html,pic,txt,zip,rar,tgz,tar,gzip'.split(
  ',',
);
const MOCK_DATA = {
  all: ALL_FILETYPES.map((fileType, id) => ({
    binary_content: {
      content_type: `xxx/${fileType}`,
      id: String(id),
      thumbnail_id: String(id),
    },
  })),
  fakes: generateFakeAttachments(5, 10),
};

storiesOf('Pages/Inside/LogsPage/Attachment', module)
  .addDecorator(
    host({
      title: 'Log Attachment',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#f5f5f5',
      height: 'auto',
    }),
  )
  .addDecorator(withReadme(README))
  .add('With all icon types', () => (
    <WithState state={{ log: { logItems: MOCK_DATA.all } }}>
      <Attachments onClickItem={() => {}} />
    </WithState>
  ))
  .add('With mock data', () => (
    <WithState state={{ log: { logItems: MOCK_DATA.fakes } }}>
      <Attachments onClickItem={() => {}} />
    </WithState>
  ));
