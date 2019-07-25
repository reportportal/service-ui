/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { storiesOf } from '@storybook/react';
import { withReadme } from 'storybook-readme';
import { AttachmentCodeModal, AttachmentHarFileModal, AttachmentImageModal } from './index';
import README from './README.md';
import harData from './example.har';

storiesOf('Pages/Inside/LogsPage/LogItemInfo/LogItemInfoTabs/Attachments/modal', module)
  .addDecorator(withReadme(README))
  .add('Code content with hljs', () => (
    <AttachmentCodeModal
      data={{
        language: 'javascript',
        content: withReadme.toString(),
      }}
    />
  ))
  .add('Har file view', () => (
    <AttachmentHarFileModal
      data={{
        harData,
      }}
    />
  ))
  .add('Image content', () => (
    <AttachmentImageModal
      data={{
        image:
          'https://vignette.wikia.nocookie.net/despicableme/images/c/ca/Bob-from-the-minions-movie.jpg/revision/latest?cb=20151224154354',
      }}
    />
  ));
