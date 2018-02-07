import { PersonalInfoBlock } from './personalInfoBlock';
import { UuidBlock } from './uuidBlock';
import { AssignedProjectsBlock } from './assignedProjectsBlock';
import { ConfigExamplesBlock } from './configExamplesBlock';

export const ProfilePage = () => (
  <div>
    <h1>Profile page</h1>
    <PersonalInfoBlock />
    <UuidBlock />
    <AssignedProjectsBlock />
    <ConfigExamplesBlock />
  </div>
);
