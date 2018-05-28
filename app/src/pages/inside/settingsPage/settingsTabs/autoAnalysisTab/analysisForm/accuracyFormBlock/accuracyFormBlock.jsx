import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { BigButton } from 'components/buttons/bigButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import styles from './accuracyFormBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  minimumShouldMatchTitle: {
    id: 'AccuracyFormBlock.minimumShouldMatchTitle',
    defaultMessage: 'Minimum should match',
  },
  minimumDocFreqTitle: {
    id: 'AccuracyFormBlock.minimumDocFreqTitle',
    defaultMessage: 'Minimum document frequency',
  },
  minimumTermFreqTitle: {
    id: 'AccuracyFormBlock.minimumTermFreqTitle',
    defaultMessage: 'Minimum term frequency',
  },
  numberOfLogLinesTitle: {
    id: 'AccuracyFormBlock.numberOfLogLinesTitle',
    defaultMessage: 'Number of log lines',
  },
  minimumShouldMatchDescription: {
    id: 'AccuracyFormBlock.minimumShouldMatchDescription',
    defaultMessage:
      'Percent of words equality between analyzed log and particular log from the ElasticSearch. If a log from ElasticSearch has the value less then set, this log will be ignored for AA.',
  },
  minimumDocFreqDescription: {
    id: 'AccuracyFormBlock.minimumDocFreqDescription',
    defaultMessage:
      'Set the minimum frequency of the saved logs in ElasticSearch (index) in which word from analyzed log should be used. If the log count is below the specified value, that word will be ignored for AA in the analyzed log. The more often the word appears in index, the lower it weights.',
  },
  minimumTermFreqDescription: {
    id: 'AccuracyFormBlock.minimumTermFreqDescription',
    defaultMessage:
      'Set the minimum frequency of the word in the analyzed log. If the word count is below the specified value, this word will be ignored for AA. The more often the word appears in the analyzed log, the higher it weights.',
  },
  numberOfLogLinesDescription: {
    id: 'AccuracyFormBlock.numberOfLogLinesDescription',
    defaultMessage:
      'The number of first lines of log message that should be considered in ElasticSearch.',
  },
  numberOfLogLinesAllOption: {
    id: 'AccuracyFormBlock.numberOfLogLinesAllOption',
    defaultMessage: 'All',
  },
  submitButtonText: {
    id: 'AccuracyFormBlock.submitButtonText',
    defaultMessage: 'Submit',
  },
});

@injectIntl
export class AccuracyFormBlock extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    onInputChange: PropTypes.func,
    setAnalysisMode: PropTypes.func,
  };

  static defaultProps = {
    onInputChange: () => {},
    setAnalysisMode: () => {},
  };

  formatInputField = (value) => value && `${value}`.replace(/\D+/g, '');

  parseInputField = (value) => value && `${value}`;

  fomatNumberOfLogLines = (value) => value && `${value}`;

  render() {
    const { intl } = this.props;
    return (
      <React.Fragment>
        <div className={cx('form-group-container', 'accuracy-form-group')}>
          <span className={cx('form-group-column', 'switch-auto-analysis-label')}>
            {intl.formatMessage(messages.minimumShouldMatchTitle)}
          </span>
          <div className={cx('form-group-column', 'accuracy-form-input-wrapper')}>
            <span className={cx('percent-icon')}>%</span>
            <FieldProvider
              name="minShouldMatch"
              format={this.formatInputField}
              parse={this.parseInputField}
              onChange={this.props.onInputChange}
            >
              <FieldErrorHint>
                <Input maxLength={'3'} customClass={cx('mobile-input-disabled')} />
              </FieldErrorHint>
            </FieldProvider>
          </div>
          <div className={cx('form-group-column', 'form-group-description')}>
            <div className={cx('form-group-help-block')}>
              <p>{intl.formatMessage(messages.minimumShouldMatchDescription)}</p>
            </div>
          </div>
        </div>

        <div className={cx('form-group-container', 'accuracy-form-group')}>
          <span className={cx('form-group-column', 'switch-auto-analysis-label')}>
            {intl.formatMessage(messages.minimumDocFreqTitle)}
          </span>
          <div className={cx('form-group-column', 'accuracy-form-input-wrapper')}>
            <FieldProvider
              name="minDocFreq"
              format={this.formatInputField}
              parse={this.parseInputField}
              onChange={this.props.onInputChange}
            >
              <FieldErrorHint>
                <Input maxLength={'2'} customClass={cx('mobile-input-disabled')} />
              </FieldErrorHint>
            </FieldProvider>
          </div>
          <div className={cx('form-group-column', 'form-group-description')}>
            <div className={cx('form-group-help-block')}>
              <p>{intl.formatMessage(messages.minimumDocFreqDescription)}</p>
            </div>
          </div>
        </div>

        <div className={cx('form-group-container', 'accuracy-form-group')}>
          <span className={cx('form-group-column', 'switch-auto-analysis-label')}>
            {intl.formatMessage(messages.minimumTermFreqTitle)}
          </span>
          <div className={cx('form-group-column', 'accuracy-form-input-wrapper')}>
            <FieldProvider
              name="minTermFreq"
              format={this.formatInputField}
              parse={this.parseInputField}
              onChange={this.props.onInputChange}
            >
              <FieldErrorHint>
                <Input maxLength={'2'} customClass={cx('mobile-input-disabled')} />
              </FieldErrorHint>
            </FieldProvider>
          </div>
          <div className={cx('form-group-column', 'form-group-description')}>
            <div className={cx('form-group-help-block')}>
              <p>{intl.formatMessage(messages.minimumTermFreqDescription)}</p>
            </div>
          </div>
        </div>

        <div className={cx('form-group-container', 'accuracy-form-group')}>
          <span className={cx('form-group-column', 'switch-auto-analysis-label')}>
            {intl.formatMessage(messages.numberOfLogLinesTitle)}
          </span>
          <div className={cx('form-group-column', 'accuracy-form-input-wrapper')}>
            <div className={cx('drop-down-block')}>
              <FieldProvider
                name="numberOfLogLines"
                format={this.fomatNumberOfLogLines}
                parse={this.parseInputField}
                onChange={this.props.onInputChange}
              >
                <InputDropdown
                  options={[
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4', label: '4' },
                    { value: '5', label: '5' },
                    {
                      value: '-1',
                      label: intl.formatMessage(messages.numberOfLogLinesAllOption),
                    },
                  ]}
                  customClass={cx('mobile-input-disabled')}
                />
              </FieldProvider>
            </div>
          </div>
          <div className={cx('form-group-column', 'form-group-description')}>
            <div className={cx('form-group-help-block')}>
              <p>{intl.formatMessage(messages.numberOfLogLinesDescription)}</p>
            </div>
          </div>
        </div>

        <div className={cx('form-group-container', 'submit-button-container')}>
          <div className={cx('form-group-column', 'submit-button-wrapper')}>
            <BigButton type="submit">
              <span className={cx('submit-button-text')}>
                {intl.formatMessage(messages.submitButtonText)}
              </span>
            </BigButton>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
