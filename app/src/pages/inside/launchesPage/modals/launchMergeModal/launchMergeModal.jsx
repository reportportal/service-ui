/*
 * Copyright 2019 EPAM Systems
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

import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils/fetch';
import { validate } from 'common/utils/validation';
import { bindMessageToValidator } from 'common/utils/validation/validatorHelpers';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { reduxForm, formValueSelector, getFormSyncErrors, getFormMeta } from 'redux-form';
import { connect } from 'react-redux';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showDefaultErrorNotification } from 'controllers/notification';
import { injectIntl, defineMessages } from 'react-intl';
import { SectionHeader } from 'components/main/sectionHeader';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { InputRadio } from 'components/inputs/inputRadio';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { activeProjectSelector, userInfoSelector } from 'controllers/user';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import { compareAttributes } from 'common/utils/attributeUtils';
import { AttributeListField } from 'components/main/attributeList';
import { MergeTypeScheme } from './mergeTypeScheme';
import { StartEndTime } from './startEndTime';
import styles from './launchMergeModal.scss';

const MERGE_FORM = 'launchMergeForm';
const MERGE_TYPE_DEEP = 'DEEP';
const MERGE_TYPE_BASIC = 'BASIC';
const FIELD_LABEL_WIDTH = 130;
const DESCRIPTION_SEPARATOR = '\n≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡\n\n';
const cx = classNames.bind(styles);
const messages = defineMessages({
  MergeLaunchHeader: {
    id: 'MergeLaunchDialog.MergeLaunchHeader',
    defaultMessage: 'Merge launches',
  },
  mergeTypeHeading: {
    id: 'MergeLaunchDialog.mergeTypeHeading',
    defaultMessage: 'Choose type of merge',
  },
  launchInfoHeading: {
    id: 'MergeLaunchDialog.launchInfoHeading',
    defaultMessage: 'All selected launches will be merged in one',
  },
  mergeTypeLinear: {
    id: 'MergeLaunchDialog.mergeTypeLinear',
    defaultMessage: 'Linear merge',
  },
  mergeTypeDeep: {
    id: 'MergeLaunchDialog.mergeTypeDeep',
    defaultMessage: 'Deep merge',
  },
  launchNameLabel: {
    id: 'MergeLaunchDialog.launchNameLabel',
    defaultMessage: 'Launch name',
  },
  launchNamePlaceholder: {
    id: 'MergeLaunchDialog.launchNamePlaceholder',
    defaultMessage: 'Enter launch name',
  },
  launchOwnerLabel: {
    id: 'MergeLaunchDialog.launchOwnerLabel',
    defaultMessage: 'Owner',
  },
  launchDescriptionLabel: {
    id: 'MergeLaunchDialog.launchDescriptionLabel',
    defaultMessage: 'Description',
  },
  launchAttributesLabel: {
    id: 'MergeLaunchDialog.launchAttributesLabel',
    defaultMessage: 'Attributes',
  },
  launchTimeLabel: {
    id: 'MergeLaunchDialog.launchTimeLabel',
    defaultMessage: 'Time start/end',
  },
  extendSuitesDescriptionText: {
    id: 'MergeLaunchDialog.extendSuitesDescriptionText',
    defaultMessage:
      "Extend child suites description with original launch name (e.g. @launch 'Launch #1')",
  },
});

const valueSelector = formValueSelector(MERGE_FORM);
const formMetaSelector = getFormMeta(MERGE_FORM);
const formSyncErrorsSelector = getFormSyncErrors(MERGE_FORM);

@withModal('launchMergeModal')
@injectIntl
@reduxForm({
  form: MERGE_FORM,
  validate: ({ name, description, mergeType, attributes }) => ({
    mergeType: !mergeType,
    name: bindMessageToValidator(validate.launchName, 'launchNameHint')(name),
    description: bindMessageToValidator(
      validate.launchDescription,
      'launchDescriptionHint',
    )(description),
    attributes: !validate.attributesArray(attributes),
  }),
})
@connect(
  (state) => ({
    user: userInfoSelector(state),
    syncErrors: formSyncErrorsSelector(state),
    fields: formMetaSelector(state),
    activeProject: activeProjectSelector(state),
    mergeType: valueSelector(state, 'mergeType'),
    startTime: valueSelector(state, 'startTime'),
    endTime: valueSelector(state, 'endTime'),
  }),
  {
    showScreenLockAction,
    hideScreenLockAction,
    showDefaultErrorNotification,
  },
)
@track()
export class LaunchMergeModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    syncErrors: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    dirty: PropTypes.bool,
    mergeType: PropTypes.string,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    data: PropTypes.shape({
      launches: PropTypes.array,
      fetchFunc: PropTypes.func,
    }).isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    mergeType: '',
    endTime: 0,
    startTime: Number.POSITIVE_INFINITY,
    dirty: false,
  };

  componentDidMount() {
    const launches = this.props.data.launches;
    const commonObject = {
      launches: [],
      mergeType: this.props.mergeType,
      name: launches[0].name,
      description: [],
      endTime: this.props.endTime,
      startTime: this.props.startTime,
      attributes: [],
      extendSuitesDescription: false,
    };
    launches.forEach((launch) => {
      commonObject.launches.push(launch.id);
      if (launch.startTime < commonObject.startTime) {
        commonObject.startTime = launch.startTime;
      }
      if (launch.endTime > commonObject.endTime) {
        commonObject.endTime = launch.endTime;
      }
      if (launch.description) {
        commonObject.description.push(launch.description.trim());
      }
      if (launch.attributes && launch.attributes.length > 0) {
        commonObject.attributes = launch.attributes.reduce((acc, attribute) => {
          if (!commonObject.attributes.find((attr) => compareAttributes(attr, attribute))) {
            return [...acc, attribute];
          }
          return acc;
        }, commonObject.attributes);
      }
    });
    commonObject.description = commonObject.description.join(DESCRIPTION_SEPARATOR);
    this.props.initialize(commonObject);
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  mergeAndCloseModal = (closeModal) => (values) => {
    this.props.showScreenLockAction();
    fetch(URLS.launchesMerge(this.props.activeProject), {
      method: 'post',
      data: values,
    })
      .then(() => {
        this.props.data.fetchFunc();
        closeModal();
      })
      .catch(this.props.showDefaultErrorNotification)
      .then(() => {
        this.props.hideScreenLockAction();
      });
  };

  render() {
    const {
      intl,
      handleSubmit,
      mergeType,
      user,
      startTime,
      endTime,
      syncErrors,
      fields,
      tracking,
    } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.MERGE),
      onClick: (closeModal) => {
        tracking.trackEvent(LAUNCHES_MODAL_EVENTS.MERGE_BTN_MERGE_MODAL);
        handleSubmit(this.mergeAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: LAUNCHES_MODAL_EVENTS.CANCEL_BTN_MERGE_MODAL,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.MergeLaunchHeader)}
        className={cx('launch-merge-modal')}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={LAUNCHES_MODAL_EVENTS.CLOSE_ICON_MERGE_MODAL}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <form>
          <ModalField>
            <SectionHeader
              error={syncErrors.mergeType && fields.mergeType && !fields.mergeType.visited}
              text={intl.formatMessage(messages.mergeTypeHeading)}
            />
          </ModalField>

          <ModalField>
            <div className={cx('merge-type-section')}>
              <div className={cx('merge-type-options')}>
                <FieldProvider
                  name="mergeType"
                  onChange={() =>
                    tracking.trackEvent(LAUNCHES_MODAL_EVENTS.LINEAR_MERGE_BTN_MERGE_MODAL)
                  }
                >
                  <InputRadio ownValue={MERGE_TYPE_BASIC}>
                    {intl.formatMessage(messages.mergeTypeLinear)}
                  </InputRadio>
                </FieldProvider>
                <FieldProvider
                  name="mergeType"
                  onChange={() =>
                    tracking.trackEvent(LAUNCHES_MODAL_EVENTS.DEEP_MERGE_BTN_MERGE_MODAL)
                  }
                >
                  <InputRadio ownValue={MERGE_TYPE_DEEP}>
                    {intl.formatMessage(messages.mergeTypeDeep)}
                  </InputRadio>
                </FieldProvider>
              </div>
              <div className={cx('preview')}>
                <MergeTypeScheme type={mergeType} />
              </div>
            </div>
          </ModalField>

          <ModalField>
            <SectionHeader text={intl.formatMessage(messages.launchInfoHeading)} />
          </ModalField>

          <div className={cx('launch-info-section', { unavailable: !mergeType })}>
            <ModalField
              label={intl.formatMessage(messages.launchNameLabel)}
              labelWidth={FIELD_LABEL_WIDTH}
            >
              <FieldProvider name="name" maxLength={'256'}>
                <FieldErrorHint>
                  <Input placeholder={intl.formatMessage(messages.launchNamePlaceholder)} />
                </FieldErrorHint>
              </FieldProvider>
            </ModalField>

            <ModalField
              label={intl.formatMessage(messages.launchOwnerLabel)}
              labelWidth={FIELD_LABEL_WIDTH}
            >
              <div className={cx('owner-field')}>
                <Input value={user.userId.replace('_', ' ')} disabled />
              </div>
            </ModalField>

            <ModalField
              label={intl.formatMessage(messages.launchDescriptionLabel)}
              labelWidth={FIELD_LABEL_WIDTH}
            >
              <FieldProvider name="description" maxLength={'1024'}>
                <FieldErrorHint>
                  <InputTextArea />
                </FieldErrorHint>
              </FieldProvider>
            </ModalField>

            <ModalField
              label={intl.formatMessage(messages.launchAttributesLabel)}
              labelWidth={FIELD_LABEL_WIDTH}
            >
              <FieldProvider name="attributes">
                <AttributeListField
                  keyURLCreator={URLS.launchAttributeKeysSearch}
                  valueURLCreator={URLS.launchAttributeValuesSearch}
                />
              </FieldProvider>
            </ModalField>

            <ModalField
              label={intl.formatMessage(messages.launchTimeLabel)}
              labelWidth={FIELD_LABEL_WIDTH}
            >
              <StartEndTime start={startTime} end={endTime} />
            </ModalField>

            <ModalField label={' '} labelWidth={FIELD_LABEL_WIDTH}>
              <FieldProvider name={'extendSuitesDescription'}>
                <InputCheckbox>
                  {intl.formatMessage(messages.extendSuitesDescriptionText)}
                </InputCheckbox>
              </FieldProvider>
            </ModalField>
          </div>
        </form>
      </ModalLayout>
    );
  }
}
