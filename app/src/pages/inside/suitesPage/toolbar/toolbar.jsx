import { InfoLine } from 'pages/inside/common/infoLine';
import { ActionPanel } from './actionPanel';

// TODO remove stub data
const STUB_LAUNCH_DATA = {
  owner: 'lexecon',
  share: false,
  description:
    '### **Demonstration launch.**\nA typical *Launch structure* comprises the following elements: Suite > Test > Step > Log.\nLaunch contains *randomly* generated `suites`, `tests`, `steps` with:\n* random issues and statuses,\n* logs,\n* attachments with different formats.',
  id: '5a65e6a997a1c00001aaee95',
  name: 'Demo Api Tests_test_new',
  number: 10,
  start_time: 1516627625833,
  end_time: 1516627633957,
  status: 'FAILED',
  statistics: {
    executions: { total: '138', passed: '79', failed: '41', skipped: '18' },
    defects: {
      product_bug: { total: 25, PB001: 24, pb_too0x524w46o: 1 },
      automation_bug: { AB001: 16, total: 16 },
      system_issue: { total: 12, SI001: 12 },
      to_investigate: { total: 10, TI001: 10 },
      no_defect: { ND001: 0, total: 0 },
    },
  },
  tags: ['desktop', 'demo', 'build:3.0.1.10'],
  mode: 'DEFAULT',
  isProcessing: false,
  approximateDuration: 0.0,
  hasRetries: false,
};

export const Toolbar = () => (
  <div>
    <ActionPanel />
    <InfoLine data={STUB_LAUNCH_DATA} />
    <div />
  </div>
);
