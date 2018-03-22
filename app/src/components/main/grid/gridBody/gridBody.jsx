import React from 'react';
import { GridRow } from './gridRow';

export const GridBody = ({ columns, data, ...rest }) =>
  data.map((row, i) => (
    <GridRow key={row.id || i} columns={columns} value={row} {...rest} />
  ));
