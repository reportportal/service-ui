# ECharts widgets

Shared chart infrastructure for the Apache ECharts migration (epic EPMRPP-119525).

| Export          | Purpose                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `EChart`        | React wrapper (`EChart.tsx`) — replaces `ChartContainer` / `C3Chart`                            |
| `configHelpers` | `buildColorMap`, `buildTooltipFormatter`, `buildAxisTicks`, `buildLegendItems`, `ECHARTS_THEME` |
| `echarts`       | Tree-shaken `echarts/core` instance from `echartsSetup.ts`                                      |

See also: [MANUAL_SMOKE_CHECKLIST.md](./MANUAL_SMOKE_CHECKLIST.md).

## Unit-testing `getOption()`

Each chart widget should expose a pure `getOption(params)` (replacing C3 `getConfig`) that builds an ECharts option object. Cover it with Jest next to the config module — same style as existing widget utils tests (for example `launchesDurationChart/config/utils.test.js`).

Shared helpers for builders live in `configHelpers.ts` (`buildColorMap`, `buildTooltipFormatter`, `buildAxisTicks`, `buildLegendItems`, `ECHARTS_THEME`). Tooltip bridge reuses `createTooltipRenderer` so existing React tooltip components keep working.

### EChart usage (widget migrations)

```tsx
import { EChart } from 'components/widgets/common/echarts';

<EChart
  widget={widget}
  container={container}
  isPreview={isPreview}
  heightOffset={heightOffset}
  className={cx('my-chart')}
  legendConfig={{ showLegend: true, onChangeLegend, uncheckedLegendItems }}
  configData={{
    getOption,
    formatMessage,
    onChartClick,
  }}
/>;
```

For a smoke render without widget wiring, pass `option` directly.

### Placement

```
…/<widgetName>/config/
  getOption.js          # or getOption.ts
  getOption.test.js
  fixtures/             # optional, when payload is large
    sampleContent.js
```

### Fixtures

Prefer **real-shaped widget API `content`** (and related fields the builder needs: defect type colors, `formatMessage`, `isPreview`, etc.).

- Copy a slimmed payload from Network → widget content API, or from an existing demo project response.
- Keep fixtures minimal: enough points/series to exercise axes, stacks, and tooltip params — not full production dumps.
- Stub `formatMessage` as `(msg) => msg.defaultMessage || msg.id` (or pass a fixed string map) so tests stay free of `intl` setup.

### What to assert

Focus on the **option shape**, not pixel output:

| Area     | Typical assertions                                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `series` | `type`, `stack`, `data` length / values, `areaStyle` / `itemStyle` when relevant                                                         |
| Axes     | `xAxis` / `yAxis` `type`, category labels, tick values, min/max / percentage scale                                                       |
| Tooltip  | `tooltip.trigger`, presence of `formatter` (or shared helper wiring); do not deeply HTML-assert React tooltips unless the helper is pure |
| Preview  | `isPreview: true` disables click handlers / interaction flags used by the widget                                                         |
| Colors   | series or item colors match the project palette mapping for defect keys                                                                  |

Prefer `toMatchObject` / targeted property checks over full-option snapshots (snapshots churn when shared helpers change).

### Example skeleton

```js
import { getOption } from './getOption';
import { sampleContent } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('nonPassedTestCasesTrendChart getOption', () => {
  test('builds line series and percentage y-axis from widget content', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
    });

    expect(option.series).toHaveLength(1);
    expect(option.series[0]).toMatchObject({
      type: 'line',
      data: expect.any(Array),
    });
    expect(option.yAxis).toMatchObject({
      type: 'value',
      min: 0,
      max: 100,
    });
    expect(option.tooltip).toEqual(
      expect.objectContaining({
        formatter: expect.any(Function),
      }),
    );
  });

  test('disables chart click wiring in preview mode', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: true,
      formatMessage,
    });

    // Assert whatever preview flag / missing handler the widget uses
    expect(option).toMatchObject({
      /* widget-specific preview contract */
    });
  });
});
```

### Out of scope for unit tests

- Canvas / visual regression screenshots
- Full `EChart` mount + ResizeObserver behavior (covered by manual smoke)
- Click navigation end-to-end (manual smoke)

Optional first runnable example may land with the first simple-widget migration (for example EPMRPP-121485) rather than in this folder alone.
