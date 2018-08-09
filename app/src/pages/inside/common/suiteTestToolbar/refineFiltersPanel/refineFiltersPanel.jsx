import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { levelSelector } from 'controllers/testItem';
import { LEVEL_SUITE, LEVEL_TEST, LEVEL_STEP } from 'common/constants/launchLevels';
import { SuiteLevelEntities, StepLevelEntities } from 'pages/inside/common/filterEntitiesGroups';
import styles from './refineFiltersPanel.scss';

const cx = classNames.bind(styles);

const ENTITY_MAPPINGS = {
  [LEVEL_SUITE]: SuiteLevelEntities,
  [LEVEL_TEST]: SuiteLevelEntities,
  [LEVEL_STEP]: StepLevelEntities,
};

@connect((state) => ({
  entitiesComponent: ENTITY_MAPPINGS[levelSelector(state)],
}))
export class RefineFiltersPanel extends Component {
  static propTypes = {
    entitiesComponent: PropTypes.func,
  };

  static defaultProps = {
    entitiesComponent: null,
  };

  render() {
    const { entitiesComponent: LevelEntities } = this.props;
    return (
      <div className={cx('refine-filters-panel')}>
        <div className={cx('label')}>
          <FormattedMessage id="Filters.refine" defaultMessage="Refine:" />
        </div>
        {LevelEntities && <LevelEntities />}
      </div>
    );
  }
}
