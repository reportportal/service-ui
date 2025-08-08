/*
 * Copyright 2022 EPAM Systems
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

import React from 'react';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import isEmpty from 'lodash.isempty';

import { Button } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ExternalLink } from 'pages/inside/common/externalLink';

import styles from './emptyStatePage.scss';
import plus from './img/empty-state-inline.svg';
import play from './img/empty-manual-launches-icon-inline.svg';
import bell from './img/notifications-empty-state-inline.svg';
import rhombus from './img/quality-gates-empty-inline.svg';
import lines from './img/environments-empty-state-inline.svg';
import branches from './img/product-empty-state-inline.svg';
import docs from './img/test-case-empty-state-inline.svg';
import flag from './img/test-plans-empty-state-inline.svg';

const cx = classNames.bind(styles);

const images = {
  bell,
  rhombus,
  plus,
  play,
  lines,
  branches,
  docs,
  flag,
};

export const EmptyStatePage = ({
  description,
  documentationLink,
  title,
  descriptionClassName,
  handleDocumentationClick,
  imageType,
  documentationDataAutomationId,
  buttons,
}) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('container')}>
      <span className={cx('img')}>{Parser(images[imageType])}</span>
      <span className={cx('title')}>{title}</span>
      <span className={cx('description', descriptionClassName)}>{description}</span>
      {!isEmpty(buttons) && (
        <div
          className={cx('buttons', {
            'text-buttons-container': buttons.every(({ variant }) => variant === 'text'),
          })}
        >
          {buttons.map(
            ({ name, dataAutomationId, isDisabled, handleButton, icon, variant, isCompact }) => (
              <Button
                disabled={isDisabled}
                adjustWidthOn={isCompact ? 'content' : 'wide-content'}
                onClick={isDisabled ? null : handleButton}
                data-automation-id={dataAutomationId}
                key={name}
                variant={variant}
                {...(icon && { icon: Parser(icon) })}
              >
                {name}
              </Button>
            ),
          )}
        </div>
      )}
      {documentationLink && (
        <ExternalLink
          className={cx('link')}
          href={documentationLink}
          dataAutomationId={documentationDataAutomationId}
          onClick={handleDocumentationClick}
        >
          {formatMessage(COMMON_LOCALE_KEYS.documentation)}
        </ExternalLink>
      )}
    </div>
  );
};

EmptyStatePage.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  documentationLink: PropTypes.string,
  descriptionClassName: PropTypes.string,
  handleDocumentationClick: PropTypes.oneOfType([PropTypes.func, PropTypes.instanceOf(null)]),
  imageType: PropTypes.oneOf([
    'plus',
    'play',
    'rhombus',
    'bell',
    'lines',
    'branches',
    'docs',
    'flag',
  ]),
  documentationDataAutomationId: PropTypes.string,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      dataAutomationId: PropTypes.string,
      isDisabled: PropTypes.bool,
      handleButton: PropTypes.func,
      icon: PropTypes.elementType,
      isCompact: PropTypes.bool,
      variant: PropTypes.oneOf(['primary', 'ghost', 'danger', 'text']),
    }),
  ),
};

EmptyStatePage.defaultProps = {
  title: '',
  description: '',
  documentationLink: '',
  descriptionClassName: '',
  handleDocumentationClick: null,
  imageType: 'plus',
  documentationDataAutomationId: 'emptyStatePageDocsLink',
};
