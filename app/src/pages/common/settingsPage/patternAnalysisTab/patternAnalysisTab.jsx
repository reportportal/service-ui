import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { patternsSelector } from 'controllers/project';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { PatternListHeader } from './patternListHeader';
import { PatternList } from './patternList';
import { NoCasesBlock } from '../noCasesBlock';
import styles from './patternAnalysisTab.scss';

const messages = defineMessages({
  noItemsMessage: {
    id: 'PatternAnalysis.noItemsMessage',
    defaultMessage: 'No Pattern Rules',
  },
  notificationsInfo: {
    id: 'PatternAnalysis.notificationsInfo',
    defaultMessage:
      'System can analyze test results automatically by comparing test result stack trace with saved patterns in the system.',
  },
  createPattern: {
    id: 'PatternAnalysis.createPattern',
    defaultMessage: 'Create pattern',
  },
});

const cx = classNames.bind(styles);

@injectIntl
@connect((state) => ({
  patterns: patternsSelector(state),
}))
export class PatternAnalysisTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    patterns: PropTypes.array,
  };
  static defaultProps = {
    patterns: [],
  };

  render() {
    const { intl, patterns } = this.props;
    return (
      <div className={cx('pattern-analysis-tab')}>
        {patterns.length ? (
          <Fragment>
            <PatternListHeader />
            <PatternList patterns={patterns} />
          </Fragment>
        ) : (
          <NoCasesBlock
            noItemsMessage={intl.formatMessage(messages.noItemsMessage)}
            notificationsInfo={intl.formatMessage(messages.notificationsInfo)}
          >
            <GhostButton mobileDisabled icon={PlusIcon}>
              {intl.formatMessage(messages.createPattern)}
            </GhostButton>
          </NoCasesBlock>
        )}
      </div>
    );
  }
}
