import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { fetch, validate } from 'common/utils';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { reduxForm, formValueSelector, getFormSyncErrors, getFormMeta } from 'redux-form';
import { connect } from 'react-redux';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { SectionHeader } from 'components/main/sectionHeader';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { InputRadio } from 'components/inputs/inputRadio';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { activeProjectSelector, userInfoSelector } from 'controllers/user';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import { MergeTypeScheme } from './mergeTypeScheme';
import { StartEndTime } from './startEndTime';
import styles from './launchMergeModal.scss';

const MERGE_FORM = 'launchMergeForm';
const MERGE_TYPE_DEEP = 'DEEP';
const MERGE_TYPE_BASIC = 'BASIC';
const FIELD_LABEL_WIDTH = 130;
const DESCRIPTION_SEPARATOR = '\n≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡\n';
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
  launchTagsLabel: {
    id: 'MergeLaunchDialog.launchTagsLabel',
    defaultMessage: 'Tags',
  },
  launchTagsPlaceholder: {
    id: 'MergeLaunchDialog.launchTagsPlaceholder',
    defaultMessage: 'Enter tag name',
  },
  launchTagsHint: {
    id: 'MergeLaunchDialog.launchTagsHint',
    defaultMessage: 'Please enter 1 or more characters',
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

@withModal('launchMergeModal')
@injectIntl
@reduxForm({
  form: MERGE_FORM,
  validate: ({ name, description, mergeType }) => ({
    mergeType: !mergeType, // eslint-disable-line camelcase
    name: (!name || !validate.launchName(name)) && 'launchNameHint',
    description: !validate.launchDescription(description) && 'launchDescriptionHint',
  }),
})
@connect(
  (state) => ({
    user: userInfoSelector(state),
    syncErrors: getFormSyncErrors(MERGE_FORM)(state),
    fields: getFormMeta(MERGE_FORM)(state),
    activeProject: activeProjectSelector(state),
    mergeType: formValueSelector(MERGE_FORM)(state, 'mergeType'),
    startTime: formValueSelector(MERGE_FORM)(state, 'startTime'),
    endTime: formValueSelector(MERGE_FORM)(state, 'endTime'),
    tagsSearchUrl: URLS.launchTagsSearch(activeProjectSelector(state)),
  }),
  {
    showScreenLockAction,
    hideScreenLockAction,
  },
)
@track()
export class LaunchMergeModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
    tagsSearchUrl: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    syncErrors: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
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
      tags: {},
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
      if (launch.tags) {
        launch.tags.forEach((tag) => {
          commonObject.tags[tag] = true;
        });
      }
    });
    commonObject.description = commonObject.description.join(DESCRIPTION_SEPARATOR);
    commonObject.tags = Object.keys(commonObject.tags);
    this.props.initialize(commonObject);
  }

  formatTags = (tags) => tags.map((tag) => ({ value: tag, label: tag }));

  parseTags = (options) => options.map((option) => option.value);

  mergeAndCloseModal = (closeModal) => (values) => {
    this.props.showScreenLockAction();
    fetch(URLS.launchesMerge(this.props.activeProject), {
      method: 'post',
      data: values,
    }).then(() => {
      this.props.data.fetchFunc();
      closeModal();
      this.props.hideScreenLockAction();
    });
  };

  render() {
    const {
      intl,
      handleSubmit,
      mergeType,
      user,
      tagsSearchUrl,
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
              label={intl.formatMessage(messages.launchTagsLabel)}
              labelWidth={FIELD_LABEL_WIDTH}
            >
              <FieldProvider name="tags" format={this.formatTags} parse={this.parseTags}>
                <InputTagsSearch
                  placeholder={intl.formatMessage(messages.launchTagsPlaceholder)}
                  focusPlaceholder={intl.formatMessage(messages.launchTagsHint)}
                  minLength={1}
                  async
                  uri={tagsSearchUrl}
                  makeOptions={this.formatTags}
                  creatable
                  showNewLabel
                  multi
                  removeSelected
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
