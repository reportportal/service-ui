import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, getFormSyncErrors, change as changeForm } from 'redux-form';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { debounce } from 'common/utils';
import { FieldProvider } from 'components/fields/fieldProvider';
import { EntitiesSelector } from 'components/filterEntities/entitiesSelector';
import { ENTITIES_FORM_NAME } from 'controllers/filterEntities';
import styles from './entitiesGroup.scss';

const cx = classNames.bind(styles);

const isEntityActive = (item, activeItems) => item.active || activeItems.indexOf(item.id) > -1;

const formChangeHandler = debounce((values, dispatch, props) => {
  const entities = {};
  const { formSyncErrors, onChangeOwn, activeEntities } = props;
  activeEntities.forEach((entityId) => {
    const isValid = !formSyncErrors[entityId];
    const entity = values[entityId];
    if (isValid && entity && entity.value) {
      entities[entityId] = {
        filtering_field: entityId,
        condition: entity.condition,
        value: entity.value,
      };
    }
  });
  onChangeOwn({
    entities,
  });
}, 1000);

@connect(
  (state, ownProps) => {
    const entityValues = getFormValues(ENTITIES_FORM_NAME)(state) || {};
    const activeEntities = Object.keys(getFormValues(ENTITIES_FORM_NAME)(state) || []);
    return {
      entityValues,
      entities: ownProps.entitiesSet.reduce(
        (acc, entity) => ({
          ...acc,
          [entity.id]: {
            ...entity,
            active: isEntityActive(entity, activeEntities),
            value: entityValues[entity.id] || entity.value,
          },
        }),
        {},
      ),
      formSyncErrors: getFormSyncErrors(ENTITIES_FORM_NAME)(state),
      initialValues: ownProps.entitiesSet.reduce(
        (acc, item) =>
          isEntityActive(item, activeEntities) ? { ...acc, [item.id]: item.value } : acc,
        {},
      ),
      activeEntities,
    };
  },
  {
    clearField: (name) => changeForm(ENTITIES_FORM_NAME, name, null),
  },
)
@reduxForm({
  form: ENTITIES_FORM_NAME,
  validate: (entities, { entitiesSet }) => {
    const validationObject = {};
    entitiesSet.filter((entity) => entity.active).forEach((entity) => {
      entity.validationFunc &&
        (validationObject[entity.id] = entity.validationFunc(entities[entity.id]));
    });
    return validationObject;
  },
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onChange: formChangeHandler,
})
export class EntitiesGroup extends Component {
  static propTypes = {
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    onChangeOwn: PropTypes.func.isRequired,
    formSyncErrors: PropTypes.object.isRequired,
    entitiesSet: PropTypes.array.isRequired,
    entities: PropTypes.object,
    entityValues: PropTypes.object,
    activeEntities: PropTypes.array,
    clearField: PropTypes.func,
    entitySmallSize: PropTypes.string.isRequired,
  };
  static defaultProps = {
    entities: {},
    activeEntities: [],
    entityValues: {},
    formSyncErrors: {},
    clearField: () => {},
    change: () => {},
    initialize: () => {},
  };

  toggleEntity = (entityId) => {
    const { entities, entityValues, change, clearField } = this.props;

    const entity = entities[entityId];
    const value = entityValues[entityId];

    if (!value) {
      change(entityId, entity.value);
    } else {
      clearField(entityId);
    }
  };

  render() {
    const { entities, entityValues, activeEntities, entitySmallSize } = this.props;

    return (
      <div className={cx('entities-group')}>
        {activeEntities.map((entityId) => {
          const entity = entities[entityId];
          const EntityComponent = entity && entity.component;
          return (
            entity &&
            entityValues[entityId] && (
              <div key={entityId} className={cx('entity-item')}>
                <FieldProvider name={entityId}>
                  <EntityComponent
                    smallSize={entitySmallSize}
                    value={entityValues[entityId].value}
                    entityId={entityId}
                    removable={entity.removable}
                    title={entity.title}
                    meta={entity.meta}
                    onRemove={() => {
                      this.toggleEntity(entityId);
                    }}
                  />
                </FieldProvider>
              </div>
            )
          );
        })}
        <EntitiesSelector entities={entities} onChange={this.toggleEntity} />
      </div>
    );
  }
}
