import { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { EntitiesSelector } from 'components/filterEntities/entitiesSelector';
import { filterEntityShape } from '../propTypes';
import styles from './entitiesGroup.scss';

const cx = classNames.bind(styles);
@track()
export class EntitiesGroup extends Component {
  static propTypes = {
    entities: PropTypes.arrayOf(filterEntityShape),
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    onValidate: PropTypes.func,
    errors: PropTypes.object,
    entitySmallSize: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    staticMode: PropTypes.bool,
    vertical: PropTypes.bool,
  };

  static defaultProps = {
    entities: [],
    errors: {},
    onAdd: () => {},
    onRemove: () => {},
    onChange: () => {},
    onValidate: () => {},
    entitySmallSize: false,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    staticMode: false,
    vertical: false,
  };

  state = {
    activeField: null,
  };

  getEntity = (id) => this.props.entities.find((entity) => entity.id === id);

  getActiveEntities = () => this.props.entities.filter((entity) => entity.active);

  handleChange = (entity, value) => {
    this.props.tracking.trackEvent(entity.eventInfo);
    this.validateEntity(entity, value.value);
    this.props.onChange(entity.id, value);
  };

  handleFocus = (entityId) => this.setState({ activeField: entityId });

  handleBlur = (entityId) =>
    this.state.activeField === entityId ? this.setState({ activeField: null }) : null;

  toggleEntity = (entityId) => {
    const entity = this.getEntity(entityId);
    if (entity.active) {
      this.props.onRemove(entityId);
    } else {
      this.props.onAdd(entity);
    }
  };

  validateEntity = (entity, value) => {
    if (!entity.validationFunc) {
      return null;
    }
    const result = entity.validationFunc({ ...entity, value });
    this.props.onValidate(entity.id, result);
    return result;
  };

  render() {
    const { entities, entitySmallSize, errors, staticMode, vertical } = this.props;
    return (
      <div className={cx('entities-group')}>
        {this.getActiveEntities().map((entity) => {
          const EntityComponent = entity.component;
          return (
            <div key={entity.id} className={cx('entity-item', { vertical })}>
              <EntityComponent
                entityId={entity.id}
                smallSize={entitySmallSize}
                removable={entity.removable}
                title={entity.title}
                meta={entity.meta}
                onRemove={() => {
                  this.toggleEntity(entity.id);
                }}
                onChange={(value) => this.handleChange(entity, value)}
                onFocus={() => this.handleFocus(entity.id)}
                onBlur={() => this.handleBlur(entity.id)}
                value={entity.value}
                active={this.state.activeField === entity.id}
                error={errors[entity.id]}
                vertical={vertical}
                customProps={entity.customProps}
              />
            </div>
          );
        })}
        {!staticMode && <EntitiesSelector entities={entities} onChange={this.toggleEntity} />}
      </div>
    );
  }
}
