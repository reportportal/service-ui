import { PureComponent } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './patternAnalyzedTooltip.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  patternAnalysisRecommendation: {
    id: 'PatternAnalyzedTooltip.patternAnalysisRecommendation',
    defaultMessage: 'Pattern-Analysis Recommendation',
  },
});

@injectIntl
export class PatternAnalyzedTooltip extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    patternTemplates: PropTypes.array,
  };
  static defaultProps = {
    patternTemplates: [],
  };

  render() {
    const { patternTemplates, intl } = this.props;
    return (
      <div className={cx('pattern-list')}>
        {patternTemplates.map((patternName, ind) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={cx('pattern-name')} key={`pattern-${ind}`} title={patternName}>
            {patternName}
          </div>
        ))}
        <div className={cx('pattern-list-label')}>
          {intl.formatMessage(messages.patternAnalysisRecommendation)}
        </div>
      </div>
    );
  }
}
