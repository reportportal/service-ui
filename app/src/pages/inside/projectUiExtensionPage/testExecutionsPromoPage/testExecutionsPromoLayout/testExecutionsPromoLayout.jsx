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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Button, ExportIcon, PlusIcon, RefreshIcon } from '@reportportal/ui-kit';
import { HelpPanel } from 'pages/inside/common/helpPanel';
import { LocationHeaderLayout } from 'layouts/locationHeaderLayout';
import { messages } from '../messages';
import styles from './testExecutionsPromoLayout.scss';
import bgImage from './img/test-executions-bg.svg';

const cx = classNames.bind(styles);

export const TestExecutionsPromoLayout = ({
  showButton,
  onButtonClick,
  helpItems,
  breadcrumbs,
  tree,
}) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('wrapper')}>
      <div className={cx('page-header')}>
        <LocationHeaderLayout
          title={formatMessage(messages.promoTitle)}
          breadcrumbs={breadcrumbs}
          tree={tree}
          className={cx('location-header')}
          titleEllipsis={false}
        >
          <div className={cx('header-actions', 'disabled-controls')} aria-hidden="true">
            <Button variant="text" adjustWidthOn="content" icon={<ExportIcon />} disabled>
              {formatMessage(messages.export)}
            </Button>
            <Button variant="ghost" icon={<RefreshIcon />} disabled>
              {formatMessage(messages.refresh)}
            </Button>
          </div>
        </LocationHeaderLayout>
        <div className={cx('header-filters', 'disabled-controls')} aria-hidden="true">
          <div className={cx('filter-start-time')}>
            <span className={cx('filter-label')}>{formatMessage(messages.launchStartTime)}</span>
            <div className={cx('filter-dropdown')}>
              <span className={cx('filter-dropdown-value')}>{formatMessage(messages.last7Days)}</span>
              <span className={cx('filter-dropdown-arrow')} />
            </div>
          </div>
          <div className={cx('filter-names')}>
            <span className={cx('filter-label')}>{formatMessage(messages.launchNames)}</span>
            <div className={cx('filter-input')}>
              <span className={cx('filter-input-placeholder')}>
                {formatMessage(messages.refineByLaunchName)}
              </span>
            </div>
          </div>
          <div className={cx('filter-attributes')}>
            <span className={cx('filter-label')}>{formatMessage(messages.launchAttributes)}</span>
            <div className={cx('filter-attribute')}>
              <Button
                variant="text"
                adjustWidthOn="content"
                icon={<PlusIcon />}
                className={cx('add-attribute-button')}
                disabled
              >
                {formatMessage(messages.addAttribute)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={cx('promo-container')}>
        <span className={cx('title')}>{formatMessage(messages.promoTitle)}</span>
        <span className={cx('description')}>{formatMessage(messages.promoDescription)}</span>
        {showButton && (
          <div className={cx('start-button-box')}>
            <Button className={cx('start-button')} onClick={onButtonClick} data-automation-id="startSearchingButton">
              {formatMessage(messages.startSearching)}
            </Button>
          </div>
        )}
        <img className={cx('bg-image')} src={bgImage} alt="" width="735" height="477" />
        <div className={cx('footer')}>
          <HelpPanel items={helpItems} className="help-panel-container--clamped-titles" />
        </div>
      </div>
    </div>
  );
};

TestExecutionsPromoLayout.propTypes = {
  helpItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  onButtonClick: PropTypes.func,
  showButton: PropTypes.bool,
  breadcrumbs: PropTypes.arrayOf(PropTypes.object),
  tree: PropTypes.arrayOf(PropTypes.object),
};
