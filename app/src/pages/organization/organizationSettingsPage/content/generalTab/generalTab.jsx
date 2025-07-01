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
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { formValueSelector, reduxForm } from 'redux-form';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { canUpdateOrganizationSettings } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { settingsMessages } from 'common/constants/localization/settingsLocalization';
import { activeOrganizationSettingsSelector } from 'controllers/organization/selectors';
import { daysToSeconds } from 'common/utils';
import { useRetentionUtils } from './hooks';
import { messages } from './generalTabMessages';
import styles from './generalTab.scss';
import { GENERAL_TAB_FORM } from './constants';

const cx = classNames.bind(styles);

const selector = formValueSelector(GENERAL_TAB_FORM);

const GeneralTabForm = ({ initialize, handleSubmit }) => {
  const { formatMessage } = useIntl();
  const organizationName = useSelector(activeOrganizationNameSelector);
  const { attachments, launches, logs } = useSelector(activeOrganizationSettingsSelector);
  const userRoles = useSelector(userRolesSelector);
  const canPerformUpdate = canUpdateOrganizationSettings(userRoles);
  const [processingData] = useState(false);
  const [isLoading] = useState(false);
  const formValues = useSelector((state) =>
    selector(state, 'keepLaunches', 'keepLogs', 'keepScreenshots'),
  );
  const { getLaunchesOptions, getLogOptions, getScreenshotsOptions } =
    useRetentionUtils(formValues);
  const isDisabled = !canPerformUpdate || processingData;

  useEffect(() => {
    if (organizationName) {
      initialize({
        name: organizationName,
        keepLaunches: daysToSeconds(launches?.period || 0),
        keepLogs: daysToSeconds(logs?.period || 0),
        keepScreenshots: daysToSeconds(attachments?.period || 0),
      });
    }
  }, [attachments, initialize, launches, logs, organizationName]);

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
        <FieldElement
          name="name"
          className={cx('field-container')}
          label={formatMessage(messages.organizationNameLabel)}
          disabled
        >
          <FieldText />
        </FieldElement>
        <FieldElement
          name="keepLaunches"
          className={cx('field-container')}
          label={formatMessage(settingsMessages.keepLaunches)}
          description={formatMessage(settingsMessages.keepLaunchesDescription)}
          disabled={isDisabled}
        >
          <Dropdown className={cx('dropdown')} options={getLaunchesOptions()} mobileDisabled />
        </FieldElement>
        <FieldElement
          name="keepLogs"
          className={cx('field-container')}
          label={formatMessage(settingsMessages.keepLogs)}
          description={formatMessage(settingsMessages.keepLogsDescription)}
          disabled={isDisabled}
        >
          <Dropdown className={cx('dropdown')} options={getLogOptions()} mobileDisabled />
        </FieldElement>
        <FieldElement
          name="keepScreenshots"
          className={cx('field-container')}
          label={formatMessage(settingsMessages.keepScreenshots)}
          description={formatMessage(settingsMessages.keepScreenshotsDescription)}
          disabled={isDisabled}
        >
          <Dropdown className={cx('dropdown')} options={getScreenshotsOptions()} mobileDisabled />
        </FieldElement>
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
};

export const GeneralTab = reduxForm({
  form: GENERAL_TAB_FORM,
})(GeneralTabForm);
