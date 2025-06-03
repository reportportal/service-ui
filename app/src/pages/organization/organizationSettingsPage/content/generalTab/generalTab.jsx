/*
 * Copyright 2025 EPAM Systems
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

import { BubblesLoader, Button, FieldText, SystemMessage, Dropdown } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { FormField } from 'components/fields/formField';
import { formValueSelector, reduxForm } from 'redux-form';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { canUpdateOrganizationSettings } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { useRetentionUtils } from '../../hooks';
import { messages } from './generalTabMessages';
import styles from './generalTab.scss';
import { GENERAL_TAB_FORM } from '../../constants';

const cx = classNames.bind(styles);

const selector = formValueSelector(GENERAL_TAB_FORM);

const GeneralTabForm = ({ initialize, handleSubmit, change }) => {
  const { formatMessage } = useIntl();
  const organizationName = useSelector(activeOrganizationNameSelector);
  const userRoles = useSelector(userRolesSelector);
  const canPerformUpdate = canUpdateOrganizationSettings(userRoles);
  const [processingData] = useState(false);
  const [isLoading] = useState(false);
  const keepLaunches = useSelector((state) => selector(state, 'keepLaunches'));
  const keepLogs = useSelector((state) => selector(state, 'keepLogs'));
  const keepScreenshots = useSelector((state) => selector(state, 'keepScreenshots'));
  const formValues = { keepLaunches, keepLogs, keepScreenshots };
  const { getLaunchesOptions, getLogOptions, getScreenshotsOptions } = useRetentionUtils(
    formValues,
  );
  const isDisabled = !canPerformUpdate || processingData;

  useEffect(() => {
    if (organizationName) {
      initialize({
        name: organizationName,
        keepLaunches: 0,
        keepLogs: 0,
        keepScreenshots: 0,
      });
    }
  }, [initialize, organizationName]);

  const onFormSubmit = () => {
    // ToDo: Implement form submission logic
  };

  return isLoading ? (
    <SpinningPreloader />
  ) : (
    <div className={cx('general-tab')}>
      <form className={cx('form')} onSubmit={handleSubmit(onFormSubmit)}>
        <SystemMessage header={formatMessage(messages.informationTitle)}>
          {formatMessage(messages.informationMessage)}
        </SystemMessage>
        <FormField
          name="name"
          fieldWrapperClassName={cx('field-input')}
          containerClassName={cx('field-container')}
          labelClassName={cx('label')}
          label={formatMessage(messages.organizationNameLabel)}
          disabled
        >
          <FieldText />
        </FormField>
        <FormField
          name="keepLaunches"
          fieldWrapperClassName={cx('field-input')}
          containerClassName={cx('field-container')}
          labelClassName={cx('label')}
          label={formatMessage(messages.keepLaunches)}
          customBlock={{
            wrapperClassName: cx('hint'),
            node: <p>{formatMessage(messages.keepLaunchesDescription)}</p>,
          }}
          disabled={isDisabled}
          change={change}
        >
          <Dropdown className={cx('dropdown')} options={getLaunchesOptions()} mobileDisabled />
        </FormField>
        <FormField
          name="keepLogs"
          fieldWrapperClassName={cx('field-input')}
          containerClassName={cx('field-container')}
          labelClassName={cx('label')}
          label={formatMessage(messages.keepLogs)}
          customBlock={{
            wrapperClassName: cx('hint'),
            node: <p>{formatMessage(messages.keepLogsDescription)}</p>,
          }}
          disabled={isDisabled}
          change={change}
        >
          <Dropdown className={cx('dropdown')} options={getLogOptions()} mobileDisabled />
        </FormField>
        <FormField
          name="keepScreenshots"
          fieldWrapperClassName={cx('field-input')}
          containerClassName={cx('field-container')}
          labelClassName={cx('label')}
          label={formatMessage(messages.keepScreenshots)}
          customBlock={{
            wrapperClassName: cx('hint'),
            node: <p>{formatMessage(messages.keepScreenshotsDescription)}</p>,
          }}
          disabled={isDisabled}
          change={change}
        >
          <Dropdown className={cx('dropdown')} options={getScreenshotsOptions()} mobileDisabled />
        </FormField>
        <div className={cx('submit-block')}>
          <Button type="submit" disabled={isDisabled}>
            {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
          </Button>
          {processingData && (
            <div className={cx('preloader-block')}>
              <BubblesLoader className={cx('preloader')} />
              <span className={cx('preloader-text')}>
                {formatMessage(COMMON_LOCALE_KEYS.processData)}
              </span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

GeneralTabForm.propTypes = {
  initialize: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
};

export const GeneralTab = reduxForm({
  form: GENERAL_TAB_FORM,
})(GeneralTabForm);
