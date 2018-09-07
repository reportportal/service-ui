import React from 'react';
import Link from 'redux-first-router-link';
import { PROJECT_DASHBOARD_PAGE } from 'controllers/pages/constants';

export const AdministratePage = () => (
  <div>
    <h1>Admin</h1>
    <Link to={{ type: PROJECT_DASHBOARD_PAGE }}>Back</Link>
  </div>
);
