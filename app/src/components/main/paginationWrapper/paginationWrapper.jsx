/*
 * Copyright 2024 EPAM Systems
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
import { useTracking } from 'react-tracking';
import { Pagination } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { messages } from './messages';
import styles from './paginationWrapper.scss';

const cx = classNames.bind(styles);

export const PaginationWrapper = ({
  children,
  showPagination,
  className,
  event,
  changePageSize,
  ...paginationProps
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const changePageSizeHandle = (newSize) => {
    changePageSize(newSize);
    trackEvent(event(newSize));
  };

  return (
    <div className={cx('pagination-wrapper', className)}>
      <ScrollWrapper withBackToTop className={cx('scroll')} classNameBackToTop={cx('back-to-top')}>
        {children}
      </ScrollWrapper>
      {showPagination && (
        <div className={cx('pagination')}>
          <Pagination
            changePageSize={changePageSizeHandle}
            captions={{
              items: formatMessage(messages.items),
              of: formatMessage(messages.of),
              page: formatMessage(messages.page),
              goTo: formatMessage(messages.goToPage),
              goAction: formatMessage(messages.go),
              perPage: formatMessage(messages.perPage),
            }}
            {...paginationProps}
          />
        </div>
      )}
    </div>
  );
};

PaginationWrapper.propTypes = {
  showPagination: PropTypes.bool.isRequired,
  changePageSize: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  event: PropTypes.object,
};

PaginationWrapper.defaultProps = {
  children: null,
  className: '',
  event: null,
};
