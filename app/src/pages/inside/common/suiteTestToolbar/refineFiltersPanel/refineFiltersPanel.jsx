import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectRouter } from 'common/utils';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { levelSelector, namespaceSelector } from 'controllers/testItem';
import { LEVEL_SUITE, LEVEL_TEST, LEVEL_STEP } from 'common/constants/launchLevels';
import { SuiteLevelEntities, StepLevelEntities } from 'pages/inside/common/filterEntitiesGroups';
import styles from './refineFiltersPanel.scss';

const cx = classNames.bind(styles);

const ENTITY_MAPPINGS = {
  [LEVEL_SUITE]: SuiteLevelEntities,
  [LEVEL_TEST]: SuiteLevelEntities,
  [LEVEL_STEP]: StepLevelEntities,
};

const collectFilterEntities = (query) =>
  Object.keys(query || {}).reduce((result, key) => {
    if (key.indexOf('filter.') !== 0) {
      return result;
    }
    const [, condition, filterName] = key.split('.');
    return {
      ...result,
      [filterName]: {
        condition,
        value: query[key] || null,
      },
    };
  }, {});

@connectRouter(
  (query) => ({
    entities: collectFilterEntities(query),
  }),
  {
    updateFilters: (query) => ({ ...query }),
  },
  { namespaceSelector },
)
@connect((state) => ({
  entitiesComponent: ENTITY_MAPPINGS[levelSelector(state)],
}))
export class RefineFiltersPanel extends Component {
  static propTypes = {
    entitiesComponent: PropTypes.func,
    updateFilters: PropTypes.func,
    entities: PropTypes.object,
  };

  static defaultProps = {
    entitiesComponent: null,
    entities: {},
    updateFilters: () => {},
  };

  handleChange = ({ entities }) => {
    if (Object.keys(entities).length === 0 && Object.keys(this.props.entities).length === 0) {
      return;
    }
    const mergedEntities = { ...this.props.entities, ...entities };
    const query = Object.keys(mergedEntities).reduce((res, key) => {
      const entity = entities[key];
      const oldEntity = this.props.entities[key];
      if (!entity && oldEntity) {
        return { ...res, [`filter.${oldEntity.condition}.${key}`]: undefined };
      }
      return {
        ...res,
        [`filter.${entity.condition}.${key}`]: entity.value,
      };
    }, {});
    this.props.updateFilters(query);
  };

  render() {
    const { entitiesComponent: LevelEntities } = this.props;
    return (
      <div className={cx('refine-filters-panel')}>
        <div className={cx('label')}>
          <FormattedMessage id="Filters.refine" defaultMessage="Refine:" />
        </div>
        {LevelEntities && (
          <LevelEntities entities={this.props.entities} onChange={this.handleChange} />
        )}
      </div>
    );
  }
}
