import PropTypes from 'prop-types';
import { messages } from 'components/widgets/common/messages';
import { PassingRateChart } from '../common/passingRateChart';

const getFilterName = ({ appliedFilters = [] }) => appliedFilters[0] && appliedFilters[0].name;

export const PassingRateSummary = (props) => (
  <PassingRateChart
    {...props}
    filterNameTitle={messages.filterLabel}
    filterName={getFilterName(props.widget)}
  />
);
PassingRateSummary.propTypes = {
  widget: PropTypes.object.isRequired,
};
