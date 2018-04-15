import React from 'react';
import Link from 'redux-first-router-link';
import { HOME_PAGE } from 'controllers/pages/constants';

export const NotFoundPage = () => (
  <div>
    <h1>Page not found</h1>
    <Link to={{ type: HOME_PAGE }}>Back</Link>
  </div>
);
