import classNames from 'classnames/bind';
import { InputFilter } from 'components/inputs/inputFilter';
import { FilterEntitiesURLContainer } from 'components/filterEntities/containers';
import { EventsEntities } from '../eventsEntities';
import styles from './eventsToolbar.scss';

const cx = classNames.bind(styles);

export const EventsToolbar = () => (
  <div className={cx('events-toolbar')}>
    <FilterEntitiesURLContainer
      debounced={false}
      render={({ entities, onChange }) => (
        <InputFilter
          entitiesProvider={EventsEntities}
          filterValues={entities}
          onChange={onChange}
        />
      )}
    />
  </div>
);
