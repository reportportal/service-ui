import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Manager, Reference, Popper } from 'react-popper';
import styles from './dotsMenuButton.scss';

const cx = classNames.bind(styles);
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
    if (this.menuNode && !this.menuNode.contains(e.target) && this.state.opened) {
      this.setState({ opened: !this.state.opened });
    }
  };

  toggleMenu = () => {
    this.setState({ opened: !this.state.opened });
    this.updateMenuPosition();
    this.props.onClick();
  };

  updateMenuPosition = () => {};

  render() {
    const { items, disabled, buttonClassName, tooltip } = this.props;
    return (
      <Manager>
        <div
          ref={(node) => {
            this.menuNode = node;
          }}
        >
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
                  {items.filter((item) => !item.hidden).map(
                    (item) =>
                      item.type === 'hr' ? (
                        <hr key={`hr${item.value}`} className={cx('hr')} />
                      ) : (
                        <div
                          key={item.value}
                          className={cx('menu-item', {
                            disabled: item.disabled,
                            danger: item.type === 'danger',
                          })}
                          title={item.title || ''}
                          onClick={
                            !item.disabled
                              ? (e) => {
                                  e.stopPropagation();
                                  item.onClick();
                                  this.toggleMenu();
                                }
                              : null
                          }
                        >
                          <span>{item.label}</span>
                        </div>
                      ),
                  )}
                </div>
              );
            }}
          </Popper>
        </div>
      </Manager>
    );
  }
}
