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
import { Button } from 'componentLibrary/button';
import { withTooltip } from 'componentLibrary/tooltip';
import Parser from 'html-react-parser';
import ExternalLinkIcon from 'common/img/open-in-rounded-inline.svg';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import PropTypes from 'prop-types';
import styles from './emptyStatePage.scss';
import plus from './img/empty-state-inline.svg';
import bell from './img/notifications-empty-state-inline.svg';
import rhombus from './img/quality-gates-empty-inline.svg';

const cx = classNames.bind(styles);

const images = {
  bell,
  rhombus,
  plus,
};

const EmptyStateButton = ({ name, ...props }) => <Button {...props}>{name}</Button>;
EmptyStateButton.propTypes = {
  name: PropTypes.string.isRequired,
};

const TooltipComponent = ({ tooltip }) => <p>{tooltip}</p>;
TooltipComponent.propTypes = {
  tooltip: PropTypes.string.isRequired,
};

const ButtonWithTooltip = withTooltip({
  ContentComponent: TooltipComponent,
})(EmptyStateButton);

export const EmptyStatePage = ({
  handleButton,
  buttonName,
  description,
  documentationLink,
  title,
  disableButton,
  descriptionClassName,
  handleDocumentationClick,
  imageType,
  buttonDataAutomationId,
  documentationDataAutomationId,
  buttonTooltip,
}) => {
  const { formatMessage } = useIntl();
  return (
    <div className={cx('container')}>
      <span className={cx('img')}>{Parser(images[imageType])}</span>
      <span className={cx('title')}>{title}</span>
      <span className={cx('description', descriptionClassName)}>{description}</span>
      {buttonName &&
        (buttonTooltip ? (
          <ButtonWithTooltip
            disabled={disableButton}
            name={buttonName}
            onClick={handleButton}
            dataAutomationId={buttonDataAutomationId}
            tooltip={buttonTooltip}
          />
        ) : (
          <Button
            disabled={disableButton}
            wide
            onClick={handleButton}
            dataAutomationId={buttonDataAutomationId}
          >
            {buttonName}
          </Button>
        ))}
      {documentationLink && (
        <a
          href={documentationLink}
          onClick={handleDocumentationClick}
          target="_blank"
          className={cx('link')}
          data-automation-id={documentationDataAutomationId}
        >
          <span>{formatMessage(COMMON_LOCALE_KEYS.documentation)}</span>
          <div className={cx('icon')}>{Parser(ExternalLinkIcon)}</div>
        </a>
      )}
    </div>
  );
};

EmptyStatePage.propTypes = {
  handleButton: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
  buttonName: PropTypes.string,
  documentationLink: PropTypes.string,
  disableButton: PropTypes.bool,
  descriptionClassName: PropTypes.string,
  handleDocumentationClick: PropTypes.oneOfType([PropTypes.func, PropTypes.instanceOf(null)]),
  imageType: PropTypes.oneOf(['plus', 'rhombus', 'bell']),
  buttonDataAutomationId: PropTypes.string,
  documentationDataAutomationId: PropTypes.string,
  buttonTooltip: PropTypes.string,
};

EmptyStatePage.defaultProps = {
  handleButton: () => {},
  title: '',
  description: '',
  buttonName: '',
  documentationLink: '',
  disableButton: false,
  descriptionClassName: '',
  handleDocumentationClick: null,
  imageType: 'plus',
  buttonDataAutomationId: '',
  documentationDataAutomationId: 'emptyStatePageDocsLink',
  buttonTooltip: null,
};
