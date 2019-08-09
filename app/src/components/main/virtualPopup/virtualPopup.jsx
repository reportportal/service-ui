import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Manager, Popper, Reference } from 'react-popper';
import { PopupContentWrapper } from './popupContentWrapper';

export class VirtualPopup extends PureComponent {
  static propTypes = {
    referenceConfig: PropTypes.shape({
      style: PropTypes.object,
      className: PropTypes.string,
    }),
    children: PropTypes.element,
    boundariesElement: PropTypes.oneOfType([PropTypes.instanceOf(Element), PropTypes.string]),
  };

  static defaultProps = {
    referenceConfig: {},
    children: null,
    boundariesElement: 'scrollParent',
  };

  render() {
    const { referenceConfig, children, boundariesElement } = this.props;

    return (
      <Manager>
        <Reference>{({ ref }) => <div ref={ref} {...referenceConfig} />}</Reference>
        <Popper
          modifiers={{
            preventOverflow: { enabled: true, boundariesElement },
            flip: {
              enabled: true,
            },
          }}
        >
          {({ ref, style, placement, scheduleUpdate }) => (
            <div ref={ref} style={style} data-placement={placement}>
              <PopupContentWrapper
                scheduleUpdate={scheduleUpdate}
                referencePosition={referenceConfig.style}
              >
                {children}
              </PopupContentWrapper>
            </div>
          )}
        </Popper>
      </Manager>
    );
  }
}
