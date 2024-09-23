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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Checkbox, Modal } from '@reportportal/ui-kit';
import { commonValidators } from 'common/utils/validation';
import { userEmailSelector } from 'controllers/user';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { HELP_AND_SUPPORT_EVENTS } from 'analyticsEvents/helpAndSupportEvents';
import { FieldText } from 'componentLibrary/fieldText';
import { hideModalAction, withModal } from 'controllers/modal';
import OpenIcon from 'common/img/open-in-new-tab-inline.svg';
import { referenceDictionary } from 'common/utils';
import { useTracking } from 'react-tracking';
import { HELP_AND_SERVICE_VERSIONS_EVENTS } from 'analyticsEvents/helpAndServiceVersionsEvents';
import { messages } from '../../../messages';
import { LinkItem } from '../../linkItem';
import styles from './requestSupportModal.scss';

const cx = classNames.bind(styles);

const REQUEST_FORM_ID = 'requestFormId';

const RequestSupport = ({ handleSubmit, initialize, invalid }) => {
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const email = useSelector(userEmailSelector);
  const [iframe, setIframe] = useState(null);
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  useEffect(() => {
    const dummyframe = document.createElement('iframe');
    dummyframe.name = 'dummyframe';
    dummyframe.id = 'dummyframe';
    dummyframe.style.display = 'none';
    document.body.appendChild(dummyframe);

    setIframe(dummyframe);
    initialize({ email });

    return () => {
      dummyframe.parentNode.removeChild(dummyframe);
    };
  }, []);

  const hideModal = () => dispatch(hideModalAction());

  const onSubmit = () => {
    trackEvent(HELP_AND_SERVICE_VERSIONS_EVENTS.CLICK_SEND_REQUEST_SERVICE_BUTTON);

    iframe.onload = () => {
      dispatch(
        showNotification({
          message: formatMessage(messages.requestSent),
          type: NOTIFICATION_TYPES.SUCCESS,
        }),
      );
      hideModal();
    };
    iframe.onerror = () => {
      dispatch(
        showNotification({
          message: formatMessage(messages.requestSentFail),
          type: NOTIFICATION_TYPES.ERROR,
        }),
      );
    };
  };
  const consentHandler = (e) => {
    setIsConsentChecked(e.target.checked);
  };

  const privacyPolicyAnchor = {
    a: (
      <LinkItem
        link={referenceDictionary.rpEpamPolicy}
        content={formatMessage(messages.privacyPolicy)}
        icon={OpenIcon}
        className={cx('inline-ref')}
      />
    ),
  };

  return (
    <Modal
      title={formatMessage(messages.requestService)}
      okButton={{
        children: formatMessage(messages.sendRequest),
        onClick: () => {
          handleSubmit(onSubmit)();
        },
        disabled: invalid || !isConsentChecked,
        attributes: { type: 'submit', form: REQUEST_FORM_ID },
        eventInfo: HELP_AND_SUPPORT_EVENTS.CLICK_SEND_REQUEST_SUPPORT_BUTTON,
      }}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CANCEL) }}
      onClose={hideModal}
    >
      <form
        action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8"
        method="POST"
        id={REQUEST_FORM_ID}
        target="dummyframe"
      >
        <input type="hidden" name="oid" value="00D24000000k2Rp" />
        <input type="hidden" name="retURL" value="http://" />
        <input type="hidden" name="lead_status" value="New" />
        <input type="hidden" name="lead_source" value="RP Product" />
        <input type="hidden" name="ReportPortalSource__c" value="ReportPortal instance" />

        <div className={cx('form-fields')}>
          <FieldProvider name="first_name">
            <FieldErrorHint provideHint={false}>
              <FieldText
                label={formatMessage(messages.firstNameLabel)}
                placeholder={formatMessage(messages.firstNamePlaceholder)}
                defaultWidth={false}
                maxLength={40}
              />
            </FieldErrorHint>
          </FieldProvider>

          <FieldProvider name="last_name">
            <FieldErrorHint provideHint={false}>
              <FieldText
                label={formatMessage(messages.lastNameLabel)}
                placeholder={formatMessage(messages.lastNamePlaceholder)}
                defaultWidth={false}
                maxLength={80}
              />
            </FieldErrorHint>
          </FieldProvider>

          <FieldProvider name="email">
            <FieldErrorHint provideHint={false}>
              <FieldText
                label={formatMessage(messages.emailLabel)}
                placeholder="example@mail.com"
                defaultWidth={false}
                maxLength={80}
              />
            </FieldErrorHint>
          </FieldProvider>

          <FieldProvider name="company">
            <FieldErrorHint provideHint={false}>
              <FieldText
                label={formatMessage(messages.companyNameLabel)}
                placeholder={formatMessage(messages.companyNamePlaceholder)}
                defaultWidth={false}
              />
            </FieldErrorHint>
          </FieldProvider>

          <FieldProvider name="wouldLikeToReceiveAds__c" format={Boolean}>
            <Checkbox className={cx('check-item')}>
              {formatMessage(messages.subscribeToNews)}
            </Checkbox>
          </FieldProvider>

          <Checkbox value={isConsentChecked} onChange={consentHandler} className={cx('check-item')}>
            {formatMessage(messages.consentToProcessing, { a: () => privacyPolicyAnchor.a })}
          </Checkbox>
        </div>
      </form>
    </Modal>
  );
};
RequestSupport.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
};

export const RequestSupportModal = withModal('requestSupportModal')(
  reduxForm({
    form: 'requestSupportForm',
    validate: ({ first_name: firstName, last_name: lastName, email, company }) => {
      return {
        first_name: commonValidators.requiredField(firstName),
        last_name: commonValidators.requiredField(lastName),
        email: commonValidators.email(email),
        company: commonValidators.requiredField(company),
      };
    },
  })(RequestSupport),
);
