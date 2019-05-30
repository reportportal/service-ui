import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import { MESSAGES } from './constants';
import { TimelineTooltip } from '../timelineTooltip';

export const Tooltip = (itemData, intl) => (d, defaultTitleFormat, defaultValueFormat, color) => {
  const item = itemData[d[0].index];
  const date = item.date || item;
  const id = d[0].id;

  return ReactDOMServer.renderToStaticMarkup(
    <TimelineTooltip
      date={date}
      itemCases={d[0].value}
      color={color(id)}
      itemName={intl.formatMessage(MESSAGES[id])}
    />,
  );
};

Tooltip.propTypes = {
  itemData: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};
