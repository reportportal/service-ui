import {
  // LaunchLevelEntities,
  // SuiteLevelEntities,
  StepLevelEntities,
} from 'pages/inside/common/filterEntitiesGroups';

export const SandboxPage = () => (
  <div>
    <h1>Sandbox Page</h1>
    <hr />
    <br />
    {/* <LaunchLevelEntities */}
    {/* onChange={(res) => { */}
    {/* console.log(res); */}
    {/* }} */}
    {/* /> */}
    {/* <SuiteLevelEntities */}
    {/* onChange={(res) => { */}
    {/* console.log(res); */}
    {/* }} */}
    {/* /> */}
    <StepLevelEntities
      onChange={(res) => {
        // eslint-disable-next-line no-console
        console.log(res);
      }}
    />
    <br />
    <hr />
  </div>
);
