type ProjectInfo = {
  id?: number;
  projectName?: string;
  projectKey: string;
  projectId?: number;
};

type Project = {
  info?: ProjectInfo;
};

type State = {
  project?: Project;
};

export const projectSelector = (state: State) => state.project || {};

export const projectInfoSelector = (state: State) =>
  projectSelector(state).info || ({} as ProjectInfo);

export const projectNameSelector = (state: State) => projectInfoSelector(state).projectName || '';

export const projectKeySelector = (state: State) => projectInfoSelector(state).projectKey || '';

export const projectInfoIdSelector = (state: State) => projectInfoSelector(state).projectId;
