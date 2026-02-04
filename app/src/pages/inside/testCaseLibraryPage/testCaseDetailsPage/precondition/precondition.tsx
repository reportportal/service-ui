/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { commonMessages } from 'pages/inside/common/common-messages';

import { AttachmentList } from '../../attachmentList';
import { Attachment } from '../../types';

import styles from './preconditions.scss';

const cx = createClassnames(styles);

interface PreconditionProps {
  preconditions: {
    value: string;
    attachments: Attachment[];
  };
}

export const Precondition = ({ preconditions }: PreconditionProps) => {
  const { formatMessage } = useIntl();

  return (
    <section className={cx('precondition')}>
      <div className={cx('precondition__type')}>P</div>
      <div className={cx('precondition__content')}>
        {
          preconditions.value &&
            <div className={cx('precondition__value')}>
              {preconditions.value}
            </div>
        }
        {
          preconditions.attachments &&
            <div className={cx('precondition__attachments-wrapper')}>
              <h4>{formatMessage(commonMessages.attachments)} {preconditions.attachments.length}</h4>
              <AttachmentList
                attachments={preconditions.attachments}
                className={cx('precondition__attachments-list')}
              />
            </div>
        }
      </div>
    </section>
  );
};
