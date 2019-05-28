import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { patternsSelector, addPatternAction } from 'controllers/project';
import { STRING_PATTERN } from 'common/constants/patternTypes';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { canConfigurePatternAnalysis } from 'common/utils/permissions';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
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
  createPatternTitle: {
    id: 'PatternAnalysis.createPatternMessage',
    defaultMessage: 'Create pattern rule',
  },
});

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    patterns: patternsSelector(state),
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
  }),
  {
    addPattern: addPatternAction,
    showModal: showModalAction,
  },
)
export class PatternAnalysisTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    patterns: PropTypes.array,
    addPattern: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    userRole: PropTypes.string,
    projectRole: PropTypes.string,
  };
  static defaultProps = {
    patterns: [],
    userRole: '',
    projectRole: '',
  };

  onAddPattern = () => {
    const { intl, showModal, addPattern } = this.props;
    showModal({
      id: 'createPatternModal',
      data: {
        onSave: addPattern,
        pattern: {
          type: STRING_PATTERN,
          enabled: true,
        },
        modalTitle: intl.formatMessage(messages.createPatternTitle),
        isNewPattern: true,
      },
    });
  };

  isAbleToEditForm = () => canConfigurePatternAnalysis(this.props.userRole, this.props.projectRole);

  render() {
    const { intl, patterns } = this.props;
    const readOnly = !this.isAbleToEditForm();

    return (
      <div className={cx('pattern-analysis-tab')}>
        {patterns.length ? (
          <Fragment>
            <PatternListHeader readOnly={readOnly} onAddPattern={this.onAddPattern} />
            <PatternList readOnly={readOnly} patterns={patterns} />
          </Fragment>
        ) : (
          <NoCasesBlock
            noItemsMessage={intl.formatMessage(messages.noItemsMessage)}
            notificationsInfo={intl.formatMessage(messages.notificationsInfo)}
          >
            <div className={cx('create-pattern-button')}>
              <GhostButton disabled={readOnly} icon={PlusIcon} onClick={this.onAddPattern}>
                {intl.formatMessage(messages.createPattern)}
              </GhostButton>
            </div>
          </NoCasesBlock>
        )}
      </div>
    );
  }
}
