import classNames from 'classnames/bind';
import { InputFilter } from 'components/inputs/inputFilter';
import { FilterEntitiesURLContainer } from 'components/filterEntities/containers';
import { ACTIVITIES } from 'components/filterEntities/constants';
import { EventsEntities } from '../eventsEntities';
import styles from './eventsToolbar.scss';

const cx = classNames.bind(styles);

export const EventsToolbar = () => (
  <div className={cx('events-toolbar')}>
    <FilterEntitiesURLContainer
      debounced={false}
      render={({ entities, onChange }) => (
        <InputFilter
          id={ACTIVITIES}
          entitiesProvider={EventsEntities}
          filterValues={entities}
          onChange={onChange}
        />
      )}
    />
  </div>
);
