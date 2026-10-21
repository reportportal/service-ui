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
import { ReactNode, useEffect } from 'react';
import { noop } from 'es-toolkit';
import { useIntl } from 'react-intl';
import { CloseIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { ScrollWrapper } from 'components/main/scrollWrapper';

import { messages } from '../messages';

import styles from './dashboardFullScreen.scss';

const cx = createClassnames(styles);

const EXIT_KEY = 'Escape';

interface DashboardFullScreenProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

export const DashboardFullScreen = ({
  title,
  children,
  onClose = noop,
}: DashboardFullScreenProps) => {
  const { formatMessage } = useIntl();

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === EXIT_KEY) {
        onClose();
      }
    };

    document.addEventListener('keyup', handleKeyUp);

    return () => document.removeEventListener('keyup', handleKeyUp);
  }, [onClose]);

  return (
    <div className={cx('dashboard-full-screen')}>
      <header className={cx('dashboard-full-screen__header')}>
        <h2 className={cx('dashboard-full-screen__title')} title={title}>
          {title}
        </h2>
        <button
          type="button"
          className={cx('dashboard-full-screen__close')}
          aria-label={formatMessage(messages.closeFullScreen)}
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </header>
      <div className={cx('dashboard-full-screen__exit-note')}>
        {formatMessage(messages.exitFullScreenNote, {
          b: (chunks) => <b>{chunks}</b>,
        })}
      </div>
      <div className={cx('dashboard-full-screen__content')}>
        <ScrollWrapper>{children}</ScrollWrapper>
      </div>
    </div>
  );
};
