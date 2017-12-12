import { set } from 'cerebral/operators';
import { state } from 'cerebral/tags';

export default function changePage(page, continueSequence = []) {
  return [
    set(state`route.currentPage`, page),
    continueSequence,
  ];
}
