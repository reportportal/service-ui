import { set } from 'cerebral/operators';
import { state } from 'cerebral/tags';
import setPageProps from '../actions/setPageProps';

export default function changePage(page, continueSequence = []) {
  return [
    set(state`route.currentPage`, page),
    setPageProps,
    continueSequence,
  ];
}
