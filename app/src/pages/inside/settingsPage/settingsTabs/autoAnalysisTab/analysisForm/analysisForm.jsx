import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { validate } from 'common/utils';
import { projectAnalyzerConfigSelector } from 'controllers/project';
import { StrategyBlock } from '../strategyBlock';
import { AccuracyFormBlock } from '../accuracyFormBlock';
import styles from '../autoAnalysisTab.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect((state) => ({
  analyzerConfiguration: projectAnalyzerConfigSelector(state),
}))
@reduxForm({
  form: 'analysisForm',
  validate: ({ minShouldMatch, minTermFreq, minDocFreq }) => ({
    minShouldMatch:
      (!minShouldMatch || !validate.minShouldMatch(minShouldMatch)) && 'minShouldMatchHint',
    minTermFreq: (!minTermFreq || !validate.minTermFreq(minTermFreq)) && 'minTermFreqHint',
    minDocFreq: (!minDocFreq || !validate.minDocFreq(minDocFreq)) && 'minTermFreqHint',
  }),
})
export class AnalysisForm extends PureComponent {
  static propTypes = {
    analyzerConfiguration: PropTypes.object,
    initialize: PropTypes.func,
  };

  static defaultProps = {
    analyzerConfiguration: {},
    initialize: () => {},
  };

  componentDidMount() {
    const initialConfiguration = {
      ...this.props.analyzerConfiguration,
      analysisSwitcher: this.props.analyzerConfiguration.isAutoAnalyzerEnabled,
      strategyRadio: this.props.analyzerConfiguration.analyzer_mode,
    };
    this.props.initialize(initialConfiguration);
  }

  render() {
    return (
      <form className={cx('analysis-form-content')}>
        <StrategyBlock />
        <AccuracyFormBlock />
      </form>
    );
  }
}
