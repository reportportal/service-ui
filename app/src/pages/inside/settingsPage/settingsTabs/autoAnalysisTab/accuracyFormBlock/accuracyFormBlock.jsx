import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import styles from '../autoAnalysisTab.scss';

const cx = classNames.bind(styles);

const DEFAULT_ANALYSIS_CONFIGURATION = {
  minDocFreq: 7,
  minShouldMatch: 80,
  minTermFreq: 1,
  numberOfLogLines: 2,
};

const messages = defineMessages({
  minimumShouldMatchTitle: {
    id: 'AccuracyFormBlock.minimumShouldMatchTitle',
    defaultMessage: 'Minimum should match',
  },
});
@injectIntl
export class AccuracyFormBlock extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    minDocFreq: PropTypes.number,
    minShouldMatch: PropTypes.number,
    minTermFreq: PropTypes.number,
    numberOfLogLines: PropTypes.number,
  };

  static defaultProps = {
    minDocFreq: DEFAULT_ANALYSIS_CONFIGURATION.minDocFreq,
    minShouldMatch: DEFAULT_ANALYSIS_CONFIGURATION.minShouldMatch,
    minTermFreq: DEFAULT_ANALYSIS_CONFIGURATION.minTermFreq,
    numberOfLogLines: DEFAULT_ANALYSIS_CONFIGURATION.numberOfLogLines,
  };

  state = {
    minDocFreq: this.props.minDocFreq,
    minShouldMatch: this.props.minShouldMatch,
    minTermFreq: this.props.minTermFreq,
    numberOfLogLines: this.props.numberOfLogLines,
    isMinTermFreqInvalid: false,
  };

  validateMinTermFreq = (event) => {
    const newValue = event.target.value.replace(/\D+/g, '');
    if (newValue.match(/^([5-9][0-9])$|100$/)) {
      this.setState({
        minShouldMatch: newValue,
        isMinTermFreqInvalid: false,
      });
    } else {
      this.setState({
        minShouldMatch: newValue,
        isMinTermFreqInvalid: true,
      });
    }
  };

  render() {
    const { intl } = this.props;
    return (
      <React.Fragment>
        <div className={cx('form-group-container')}>
          <span className={cx('form-group-column', 'switch-auto-analysis-label')}>
            {intl.formatMessage(messages.minimumShouldMatchTitle)}
          </span>
          <FieldErrorHint
            error={'The parameter should have value from 50 to 100'}
            active={this.state.isMinTermFreqInvalid}
          >
            <Input
              value={`${this.state.minShouldMatch}`}
              maxLength={'3'}
              touched={this.state.isMinTermFreqInvalid}
              onChange={this.validateMinTermFreq}
            />
          </FieldErrorHint>
          <div className={cx('form-group-column', 'form-group-description')}>
            <div className={cx('form-group-help-block')}>
              <p>
                Percent of words equality between analyzed log and particular log from the
                ElasticSearch. If a log from ElasticSearch has the value less then set, this log
                will be ignored for AA.
              </p>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
