import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Manager, Reference, Popper } from 'react-popper';
import styles from './dotsMenuButton.scss';
import { SEPARATOR_ITEM, DANGER_ITEM } from './constants';

const cx = classNames.bind(styles);

const Separator = () => <hr className={cx('separator')} />;

const MenuItem = ({ item, toggleMenu }) => (
  <div
    className={cx('menu-item', {
      disabled: item.disabled,
      danger: item.type === DANGER_ITEM,
    })}
    title={item.title || ''}
    onClick={
      !item.disabled
        ? (e) => {
            e.stopPropagation();
            item.onClick();
            toggleMenu();
          }
        : null
    }
  >
    <span>{item.label}</span>
  </div>
);

MenuItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
    hidden: PropTypes.bool,
    disabled: PropTypes.bool,
    title: PropTypes.string,
    onClick: PropTypes.func,
    type: PropTypes.string,
  }).isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

export class DotsMenuButton extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
        hidden: PropTypes.bool,
        disabled: PropTypes.bool,
        title: PropTypes.string,
        onClick: PropTypes.func,
        type: PropTypes.string,
      }),
    ),
    disabled: PropTypes.bool,
    buttonClassName: PropTypes.string,
    tooltip: PropTypes.string,
    onClick: PropTypes.func,
  };
  static defaultProps = {
    title: '',
    items: [],
    disabled: false,
    buttonClassName: 'menu-button',
    tooltip: '',
    onClick: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      opened: false,
    };
    this.menuNode = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  handleOutsideClick = (e) => {
    if (this.menuNode && !this.menuNode.current.contains(e.target) && this.state.opened) {
      this.setState({ opened: !this.state.opened });
    }
  };

  toggleMenu = () => {
    this.setState({ opened: !this.state.opened });
    this.updateMenuPosition();
    this.props.onClick();
  };

  updateMenuPosition = () => {};

  renderMenuItems = (items) =>
    items
      .filter((item) => !item.hidden)
      .map(
        (item) =>
          item.type === SEPARATOR_ITEM ? (
            <Separator key={`separator${item.value}`} />
          ) : (
            <MenuItem key={item.value} item={item} toggleMenu={this.toggleMenu} />
          ),
      );

  render() {
    const { items, disabled, buttonClassName, tooltip } = this.props;
    return (
      <Manager>
        <div ref={this.menuNode}>
          <Reference>
            {({ ref }) => (
              <div
                title={tooltip}
                ref={ref}
                className={cx(buttonClassName, {
                  disabled,
                  opened: this.state.opened,
                })}
                onClick={!disabled ? this.toggleMenu : null}
              />
            )}
          </Reference>
          <Popper>
            {({ ref, style, scheduleUpdate }) => {
              this.updateMenuPosition = scheduleUpdate;
              return (
                <div
                  ref={ref}
                  style={style}
                  className={cx('menu', {
                    opened: this.state.opened,
                  })}
                >
                  {this.renderMenuItems(items)}
                </div>
              );
            }}
          </Popper>
        </div>
      </Manager>
    );
  }
}
