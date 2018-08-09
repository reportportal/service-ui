import { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, getFormSyncErrors } from 'redux-form';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { debounce } from 'common/utils';
import { FieldProvider } from 'components/fields/fieldProvider';
import { EntitiesSelector } from 'components/filterEntities/entitiesSelector';
import styles from './entitiesGroup.scss';

const cx = classNames.bind(styles);

const ENTITIES_FORM = 'entities-form';

@connect((state) => ({
  entities: getFormValues(ENTITIES_FORM)(state),
  formSyncErrors: getFormSyncErrors(ENTITIES_FORM)(state),
}))
@reduxForm({
  form: ENTITIES_FORM,
  validate: (entities) => {
    const validationObject = {};
    Object.keys(entities).forEach((entityId) => {
      const entity = entities[entityId];
      entity.validationFunc && (validationObject[entityId] = entity.validationFunc(entity));
    });
    return validationObject;
  },
})
export class EntitiesGroup extends Component {
  static propTypes = {
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    onChangeOwn: PropTypes.func.isRequired,
    formSyncErrors: PropTypes.object.isRequired,
    entitiesSet: PropTypes.array.isRequired,
    entities: PropTypes.object,
  };
  static defaultProps = {
    entities: {},
  };

  constructor(props) {
    super(props);
    const initObject = {};
    const activeEntities = [];
    props.entitiesSet.forEach((entity) => {
      entity.active && activeEntities.push(entity.id);
      initObject[entity.id] = entity;
    });
    this.state = {
      activeEntities,
    };
    props.initialize(initObject);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.entities !== prevProps.entities ||
      this.state.activeEntities !== prevState.activeEntities
    ) {
      this.parseEntities();
    }
  }
  parseEntities = debounce(() => {
    const queryStrings = [];
    const entitiesObj = {};
    const { formSyncErrors, entities, onChangeOwn } = this.props;
    this.state.activeEntities.forEach((entityId) => {
      const isValid = !formSyncErrors[entityId];
      const entity = entities[entityId];
      if (isValid && entity) {
        queryStrings.push(`filter.${entity.value.condition}.${entityId}=${entity.value.value}`);
        entitiesObj[entityId] = {
          filtering_field: entityId,
          condition: entity.value.condition,
          value: entity.value.value,
        };
      }
    });
    onChangeOwn({
      queryString: queryStrings.join('&'),
      entitiesObj,
    });
  }, 1000);
  formatEntity = (valFromState) => valFromState.value;

  parseEntity = (valFromField, fieldId) => ({
    ...this.props.entities[fieldId],
    value: valFromField,
  });

  toggleEntity = (entityId) => {
    const entity = this.props.entities[entityId];
    this.setState({
      activeEntities:
        this.state.activeEntities.indexOf(entityId) !== -1
          ? this.state.activeEntities.filter((id) => id !== entityId)
          : this.state.activeEntities.concat([entityId]),
    });
    this.props.change(entityId, { ...entity, active: !entity.active });
  };

  render() {
    const { entities } = this.props;
    return (
      <div className={cx('entities-group')}>
        <form>
          {this.state.activeEntities.map((entityId) => {
            const entity = entities[entityId];
            const EntityComponent = entity && entity.component;
            return (
              entity &&
              entity.active && (
                <div key={entityId} className={cx('entity-item')}>
                  <FieldProvider
                    name={entityId}
                    format={this.formatEntity}
                    parse={this.parseEntity}
                  >
                    <EntityComponent
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
        </form>
      </div>
    );
  }
}
