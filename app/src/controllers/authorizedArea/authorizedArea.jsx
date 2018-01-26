import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { isAuthorized } from 'controllers/auth';

export const AuthorizedArea = connect(state => ({
  authorized: isAuthorized(state),
}))(({ authorized, children }) => (
  authorized ? children : <Redirect to="/login" />
));

AuthorizedArea.propTypes = {
  authorized: PropTypes.bool,
};

AuthorizedArea.defaultProps = {
  authorized: false,
};
