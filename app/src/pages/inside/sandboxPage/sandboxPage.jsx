import React, { Component } from 'react';
import { connect } from 'react-redux';
import { InfoLine } from 'pages/inside/launchesPage/infoLine';
import { showModalAction } from 'controllers/modal';
import PropTypes from 'prop-types';
import { BlockWithTooltip, BlockWithHoverableTooltip } from './testBlocks';

const infolineMockData = {
  owner: 'superadmin',
  share: false,
  description: '### **Demonstration launch.**\nA typical *Launch structure* comprises the following elements: Suite > Test > Step > Log.\nLaunch contains *randomly* generated `suites`, `tests`, `steps` with:\n* random issues and statuses,\n* logs,\n* attachments with different formats.',
  id: '5a705e1797a1c0000117c506',
  name: 'Demo Api Tests_123',
  number: 10,
  start_time: 1517313559725,
  end_time: 1517313567261,
  status: 'FAILED',
  statistics: {
    executions: {
      total: '138',
      passed: '87',
      failed: '42',
      skipped: '9',
    },
    defects: {
      product_bug: {
        total: 31,
        PB001: 17,
        pb_1hv8b34me23aq: 3,
        pb_t4qn86gv1s1h: 6,
        pb_ts2ewk942lh5: 5,
      },
      automation_bug: {
        AB001: 15,
        total: 23,
        ab_1hrgzqy1pplr7: 8,
      },
      system_issue: {
        total: 18,
        SI001: 10,
        si_1iv6jv4gzh1eq: 6,
        si_sl3x3dvup5bt: 2,
      },
      to_investigate: {
        total: 20,
        TI001: 20,
      },
      no_defect: {
        ND001: 0,
        total: 0,
      },
    },
  },
  tags: ['desktop', 'demo', 'build:3.0.1.10'],
  mode: 'DEFAULT',
  isProcessing: false,
  approximateDuration: 0.0,
  hasRetries: false,
};

@connect(null, {
  showModalAction,
})
export class SandboxPage extends Component {
  static propTypes = {
    showModalAction: PropTypes.func.isRequired,
  };
  static defaultProps = {
    showModalAction: () => {},
  };
  render() {
    return (
      <div>
        <h1>Sandbox Page</h1>
        <br />
        <InfoLine data={infolineMockData} />
        <br />
        <button onClick={() => this.props.showModalAction({ id: 'exampleModal', data: { param1: '123', param2: 312 } })}>
          click here to show modal
        </button>
        <br />
        <div style={{ width: 300, height: 50, marginLeft: 50, marginTop: 50 }}>
          <BlockWithTooltip>
            Hover me!
          </BlockWithTooltip>
        </div>
        <div style={{ width: 300, height: 50, marginLeft: 50, marginTop: 50 }}>
          <BlockWithHoverableTooltip testProp="hello!">
            Hover me or my tooltip!
          </BlockWithHoverableTooltip>
        </div>
      </div>
    );
  }
}
