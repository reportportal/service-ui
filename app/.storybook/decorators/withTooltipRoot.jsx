export const withTooltipRoot = (getStory) => {
  const tooltipRoot = document.getElementById('tooltip-root') || document.createElement('div');
  tooltipRoot.setAttribute('id', 'tooltip-root');
  document.getElementById('root').parentNode.appendChild(tooltipRoot);
  return getStory();
};
