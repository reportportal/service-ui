import PropTypes from 'prop-types';

export const ruleItemPropTypes = {
  item: PropTypes.shape({
    enabled: PropTypes.bool,
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    order: PropTypes.number,
  }),
  actions: PropTypes.array,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  content: PropTypes.node,
  onClick: PropTypes.func,
  onRuleNameClick: PropTypes.oneOfType([PropTypes.func, PropTypes.instanceOf(null)]),
};
export const ruleItemDefaultProps = {
  actions: [],
  onToggle: () => {},
  disabled: false,
  content: null,
  onClick: () => {},
  onRuleNameClick: null,
};
