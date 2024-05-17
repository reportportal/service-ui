import { NavLink } from 'components/main/navLink';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';

export const LinkItem = ({ isInternal, link, content, icon, ...rest }) =>
  isInternal ? (
    <NavLink to={link} {...rest}>
      {content}
      {icon && <i>{Parser(icon)}</i>}
    </NavLink>
  ) : (
    <a href={link} target="_blank" rel="noreferrer noopener" {...rest}>
      {content}
      {icon && <i>{Parser(icon)}</i>}
    </a>
  );

LinkItem.propTypes = {
  isInternal: PropTypes.bool,
  link: PropTypes.string,
  content: PropTypes.string,
  icon: PropTypes.string,
};
