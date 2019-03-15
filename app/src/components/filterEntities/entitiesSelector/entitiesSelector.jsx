import { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { FormattedMessage } from 'react-intl';
import { filterEntityShape } from '../propTypes';
import styles from './entitiesSelector.scss';

const cx = classNames.bind(styles);

export class EntitiesSelector extends Component {
  static propTypes = {
    entities: PropTypes.arrayOf(filterEntityShape).isRequired,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    onChange: () => {},
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
    if (!this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
    }
  };

  toggleMenu = () => {
    this.setState({ opened: !this.state.opened });
  };

  render() {
    const { entities, onChange } = this.props;

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
          {entities.map(
            (entity) =>
              !entity.static && (
                <div
                  key={entity.id}
                  className={cx('entity-item', { 'sub-item': entity.meta && entity.meta.subItem })}
                >
                  <InputCheckbox
                    value={entity.active}
                    onChange={() => {
                      this.setState({ opened: !this.state.opened });
                      onChange(entity.id);
                    }}
                  >
                    {(entity.meta && entity.meta.longName) || entity.title}
                  </InputCheckbox>
                </div>
              ),
          )}
        </div>
      </div>
    );
  }
}
