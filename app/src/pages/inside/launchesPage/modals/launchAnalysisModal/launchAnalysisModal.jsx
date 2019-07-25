import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import { InputRadio } from 'components/inputs/inputRadio';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { LAUNCH_ANALYZE_TYPES } from 'common/constants/launchAnalyzeTypes';
import classNames from 'classnames/bind';
import styles from './launchAnalysisModal.scss';

const {
  ANALYZER_MODE,
  ANALYZER_MODE: { ALL, LAUNCH_NAME, CURRENT_LAUNCH },
  ANALYZE_ITEMS_MODE,
  ANALYZE_ITEMS_MODE: { TO_INVESTIGATE, AUTO_ANALYZED, MANUALLY_ANALYZED },
} = LAUNCH_ANALYZE_TYPES;

const cx = classNames.bind(styles);

const messages = defineMessages({
  MODAL_TITLE: {
    id: 'launchAnalysisModal.title',
    defaultMessage: 'Analyse launches',
  },
  ANALYZE_BUTTON: {
    id: 'launchAnalysisModal.analyse',
    defaultMessage: 'Analyse',
  },
  MOD_TITLE: {
    id: 'launchAnalysisModal.modTitle',
    defaultMessage: 'Choose the base on which the Auto Analysis will be performed:',
  },
  OPTIONS_TITLE: {
    id: 'launchAnalysisModal.optionsTitle',
    defaultMessage: 'Choose the test items that should be analyzed:',
  },
  ALL: {
    id: 'launchAnalysisModal.baseOptions.allLaunches',
    defaultMessage: 'All launches',
  },
  LAUNCH_NAME: {
    id: 'launchAnalysisModal.baseOptions.withSameName',
    defaultMessage: 'Launches with the same name',
  },
  CURRENT_LAUNCH: {
    id: 'launchAnalysisModal.baseOptions.current',
    defaultMessage: 'Only current launch',
  },
  TO_INVESTIGATE: {
    id: 'launchAnalysisModal.itemOptions.investigate',
    defaultMessage: 'To investigated items',
  },
  AUTO_ANALYZED: {
    id: 'launchAnalysisModal.itemOptions.byAA',
    defaultMessage: 'Items analyzed automatically (by AA)',
  },
  MANUALLY_ANALYZED: {
    id: 'launchAnalysisModal.itemOptions.manually',
    defaultMessage: 'Items analyzed manually',
  },
  VALIDATION_MESSAGE_CHOOSE_OPTION: {
    id: 'launchAnalysisModal.validation.chooseOption',
    defaultMessage: 'You can not perform this operation unless at least one item is chosen',
  },
  VALIDATION_MESSAGE_CURRENT_LAUNCH: {
    id: 'launchAnalysisModal.validation.currentLaunch',
    defaultMessage:
      'You can not perform this operation for Auto-analyzed and Manually analyzed items simultaneously. Please choose one of them',
  },
  SUCCESS_MESSAGE: {
    id: 'launchAnalysisModal.successMessage',
    defaultMessage: 'Auto-analyzer has been started.',
  },
});

@withModal('analysisLaunchModal')
@injectIntl
@track()
export class LaunchAnalysisModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object.isRequired,
      onConfirm: PropTypes.func.isRequired,
      analyzerMode: PropTypes.oneOf([ALL, LAUNCH_NAME, CURRENT_LAUNCH]).isRequired,
    }).isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {
      item: {},
      onConfirm: () => {},
      analyzerMode: LAUNCH_NAME,
    },
  };
  state = {
    analyzerMode: this.props.data.analyzerMode,
    analyzeItemsMode: [TO_INVESTIGATE],
  };
  onChangeRadio = (value) => {
    this.clearErrorMessage();
    this.setState({
      analyzerMode: value,
    });
  };
  onChangeCheckBox = (value) => {
    let { analyzeItemsMode } = this.state;
    const inState = analyzeItemsMode.includes(value);
    this.clearErrorMessage();
    if (inState) {
      analyzeItemsMode = analyzeItemsMode.filter((item) => item !== value);
    } else {
      analyzeItemsMode = [...analyzeItemsMode, value];
    }
    this.setState({
      analyzeItemsMode,
    });
  };
  clearErrorMessage = () => {
    const { errorMessage } = this.state;
    if (errorMessage) {
      this.setState({
        errorMessage: '',
      });
    }
  };
  analysisAndClose = (closeModal) => {
    this.props.tracking.trackEvent(LAUNCHES_MODAL_EVENTS.OK_BTN_ANALYSIS_MODAL);
    const errorMessage = this.validate();
    if (errorMessage) {
      this.setState({
        errorMessage,
      });
      return;
    }
    const {
      data: {
        item: { id },
      },
    } = this.props;
    const { analyzerMode, analyzeItemsMode } = this.state;
    const data = {
      analyzeItemsMode,
      analyzerMode,
      launchId: id,
    };
    this.props.data.onConfirm(data);
    closeModal();
  };
  validate = () => {
    const { analyzerMode, analyzeItemsMode } = this.state;
    const {
      intl: { formatMessage },
    } = this.props;
    if (analyzeItemsMode.length === 0) {
      return formatMessage(messages.VALIDATION_MESSAGE_CHOOSE_OPTION);
    }
    if (
      analyzerMode === CURRENT_LAUNCH &&
      analyzeItemsMode.includes(AUTO_ANALYZED) &&
      analyzeItemsMode.includes(MANUALLY_ANALYZED)
    ) {
      return formatMessage(messages.VALIDATION_MESSAGE_CURRENT_LAUNCH);
    }
    return null;
  };
  renderOptions = () => {
    const { analyzeItemsMode } = this.state;
    const {
      intl: { formatMessage },
    } = this.props;
    return Object.keys(ANALYZE_ITEMS_MODE).map((key, index) => {
      const checked = analyzeItemsMode.includes(ANALYZE_ITEMS_MODE[key]);
      const onChange = () => {
        this.onChangeCheckBox(ANALYZE_ITEMS_MODE[key], 'checkbox');
      };
      return (
        <li
          key={key}
          className={cx('launch-analysis-modal-list-item', {
            'launch-analysis-modal-list-item-first': index === 0,
          })}
        >
          <InputCheckbox value={checked} onChange={onChange}>
            {formatMessage(messages[key])}
          </InputCheckbox>
        </li>
      );
    });
  };
  renderModes = () => {
    const { analyzerMode } = this.state;
    const {
      intl: { formatMessage },
    } = this.props;
    return Object.keys(ANALYZER_MODE).map((key, index) => {
      const onChange = () => {
        this.onChangeRadio(ANALYZER_MODE[key]);
      };
      return (
        <li
          key={key}
          className={cx('launch-analysis-modal-list-item', {
            'launch-analysis-modal-list-item-first': index === 0,
          })}
        >
          <InputRadio value={analyzerMode} ownValue={ANALYZER_MODE[key]} onChange={onChange}>
            {formatMessage(messages[key])}
          </InputRadio>
        </li>
      );
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const okButton = {
      text: formatMessage(messages.ANALYZE_BUTTON),
      onClick: this.analysisAndClose,
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: LAUNCHES_MODAL_EVENTS.CANCEL_BTN_ANALYSIS_MODAL,
    };
    const { errorMessage } = this.state;
    return (
      <ModalLayout
        title={formatMessage(messages.MODAL_TITLE)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={LAUNCHES_MODAL_EVENTS.CLOSE_BTN_ANALYSIS_MODAL}
        warningMessage={errorMessage}
      >
        <p className={cx('launch-analysis-modal-text')}>{formatMessage(messages.MOD_TITLE)}</p>
        <ul className={cx('launch-analysis-modal-list')}>{this.renderModes()}</ul>
        <p className={cx('launch-analysis-modal-text')}>{formatMessage(messages.OPTIONS_TITLE)}</p>
        <ul className={cx(['launch-analysis-modal-list', 'launch-analysis-modal-list-last'])}>
          {this.renderOptions()}
        </ul>
      </ModalLayout>
    );
  }
}
