import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { LAUNCH_ANALYZE_TYPES } from 'common/constants/launchAnalyzeTypes';
import { setStorageItem, getStorageItem } from 'common/utils';
import classNames from 'classnames/bind';
import styles from './launchPatternAnalysisModal.scss';

const { ANALYZER_MODE, ANALYZE_ITEMS_MODE } = LAUNCH_ANALYZE_TYPES;

const PATTERN_ANALYZE_ITEMS_MODE = 'patternAnalyzeItemsMode';

const cx = classNames.bind(styles);

const messages = defineMessages({
  MODAL_TITLE: {
    id: 'launchPatternAnalysisModal.title',
    defaultMessage: 'Pattern analyze launches',
  },
  ANALYZE_BUTTON: {
    id: 'launchAnalysisModal.analyze',
    defaultMessage: 'Analyze',
  },
  OPTIONS_TITLE: {
    id: 'launchAnalysisModal.optionsTitle',
    defaultMessage: 'Choose the test items that should be analyzed:',
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
});

@withModal('launchPatternAnalysisModal')
@injectIntl
export class LaunchPatternAnalysisModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object.isRequired,
      onConfirm: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    data: {
      item: {},
      onConfirm: () => {},
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      analyzeItemsMode: getStorageItem(PATTERN_ANALYZE_ITEMS_MODE) || [
        ANALYZE_ITEMS_MODE.TO_INVESTIGATE,
      ],
    };
  }

  onChangeCheckBox = (value) => {
    let { analyzeItemsMode } = this.state;
    const inState = analyzeItemsMode.includes(value);
    this.clearErrorMessage();
    if (inState) {
      analyzeItemsMode = analyzeItemsMode.filter((item) => item !== value);
    } else {
      analyzeItemsMode = [...analyzeItemsMode, value];
    }
    setStorageItem(PATTERN_ANALYZE_ITEMS_MODE, analyzeItemsMode);
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
    const { analyzeItemsMode } = this.state;
    const data = {
      analyzeItemsMode,
      launchId: id,
      analyzerMode: ANALYZER_MODE.ALL,
    };
    this.props.data.onConfirm(data);
    closeModal();
  };

  validate = () => {
    const { analyzeItemsMode } = this.state;
    const {
      intl: { formatMessage },
    } = this.props;
    if (analyzeItemsMode.length === 0) {
      return formatMessage(messages.VALIDATION_MESSAGE_CHOOSE_OPTION);
    }
    return null;
  };

  renderOptions = () => {
    const { analyzeItemsMode } = this.state;
    const {
      intl: { formatMessage },
    } = this.props;
    return Object.keys(ANALYZE_ITEMS_MODE).map((key) => {
      const checked = analyzeItemsMode.includes(ANALYZE_ITEMS_MODE[key]);
      const onChange = () => {
        this.onChangeCheckBox(ANALYZE_ITEMS_MODE[key]);
      };
      return (
        <li key={key} className={cx('launch-analysis-modal-list-item')}>
          <InputCheckbox value={checked} onChange={onChange}>
            {formatMessage(messages[key])}
          </InputCheckbox>
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
    };
    const { errorMessage } = this.state;
    return (
      <ModalLayout
        title={formatMessage(messages.MODAL_TITLE)}
        okButton={okButton}
        cancelButton={cancelButton}
        warningMessage={errorMessage}
      >
        <p className={cx('launch-analysis-modal-text')}>{formatMessage(messages.OPTIONS_TITLE)}</p>
        <ul className={cx(['launch-analysis-modal-list', 'launch-analysis-modal-list-last'])}>
          {this.renderOptions()}
        </ul>
      </ModalLayout>
    );
  }
}
