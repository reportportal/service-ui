/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { FormattedMessage } from 'react-intl';
import track from 'react-tracking';
import { filterEntityShape } from '../propTypes';
import styles from './entitiesSelector.scss';

const cx = classNames.bind(styles);

const getEntityTitle = (entities, { id: entityId, title }) => {
  const compositeIdDelimiter = '$';
  const lastIndexOfDelimiter = entityId.lastIndexOf(compositeIdDelimiter);
  const nextCharacterIndexAfterDelimiter = lastIndexOfDelimiter + 1;

  return (
    (lastIndexOfDelimiter !== -1
      ? entities.find(({ id }) =>
          id.startsWith(entityId.slice(0, nextCharacterIndexAfterDelimiter)),
        ).title
      : title) || ''
  );
};

@track()
export class EntitiesSelector extends Component {
  static propTypes = {
    entities: PropTypes.arrayOf(filterEntityShape).isRequired,
    onChange: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    events: PropTypes.object,
  };
  static defaultProps = {
    onChange: () => {},
    events: {},
  };
  state = {
    opened: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  handleOutsideClick = (e) => {
    if (this.node && !this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
    }
  };

  handleChange = (entity) => () => {
    const { tracking, events, onChange, entities } = this.props;
    if (!entity.active && events.getRefineParametersEvent) {
      const analyticsData = getEntityTitle(entities, entity);

      tracking.trackEvent(
        events.getRefineParametersEvent(analyticsData, entity.meta && analyticsData),
      );
    }
    this.setState({ opened: !this.state.opened });
    onChange(entity.id);
  };

  toggleMenu = () => {
    this.setState({ opened: !this.state.opened });
  };

  render() {
    const { entities } = this.props;

    return (
      <div
        ref={(node) => {
          this.node = node;
        }}
        className={cx('entities-selector', { opened: this.state.opened })}
      >
        <div className={cx('toggler')} onClick={this.toggleMenu}>
          <FormattedMessage id={'EntitiesSelector.more'} defaultMessage={'More'} />
        </div>
        <div className={cx('entities-list')}>
          <ScrollWrapper autoHeight autoHeightMax={400}>
            {entities.map(
              (entity) =>
                !entity.static && (
                  <div
                    key={entity.id}
                    className={cx('entity-item', {
                      'sub-item': entity.meta && entity.meta.subItem,
                    })}
                  >
                    <InputCheckbox
                      disabled={!entity.removable}
                      value={entity.active}
                      onChange={this.handleChange(entity)}
                    >
                      {(entity.meta && entity.meta.longName) || entity.title}
                    </InputCheckbox>
                  </div>
                ),
            )}
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}
