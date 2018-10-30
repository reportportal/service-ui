import React from 'react';
import PropTypes from 'prop-types';

export const CumulativeTrendTooltip = ({ groupName, itemsData }) => (
  <React.Fragment>
    <div className="tooltip-header">
    <span className="group-name">{groupName}</span>
    </div>
    <div className="tooltip-body">
      {itemsData.map((item) => (
        <div key={item.id} className="item-wrapper">
          <div className="color-mark" style={{ backgroundColor: item.color }} />
          <div className="item-name">{item.name}</div>
          <div className="item-value">{item.value}</div>
        </div>
      ))}
    </div>
  </React.Fragment>
);

CumulativeTrendTooltip.propTypes = {
  groupName: PropTypes.string.isRequired,
  itemsData: PropTypes.array.isRequired,
};
