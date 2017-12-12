export default function getPropsWithoutChildren(props, unnecessaryKey) {
  const newProps = {};
  Object.keys(props).forEach((key) => {
    if (!unnecessaryKey.some(item => (item === key))) {
      newProps[key] = props[key];
    }
  });
  return newProps;
}
