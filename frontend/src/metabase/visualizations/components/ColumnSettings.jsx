/* eslint-disable react/prop-types */
import { t } from "ttag";

import NoResults from "assets/img/no_results.svg";
import EmptyState from "metabase/components/EmptyState";
import { Stack } from "metabase/ui";
import ChartSettingsWidget from "metabase/visualizations/components/ChartSettingsWidget";
import {
  getComputedSettings,
  getSettingsWidgets,
} from "metabase/visualizations/lib/settings";
import { getSettingDefinitionsForColumn } from "metabase/visualizations/lib/settings/column";

function getWidgets({
  column,
  inheritedSettings,
  storedSettings,
  onChange,
  onChangeSetting,
  allowlist,
  denylist,
  extraData,
}) {
  // fake series
  const series = [{ card: {}, data: { rows: [], cols: [] } }];

  // add a "unit" to make certain settings work
  if (column.unit == null) {
    column = { ...column, unit: "default" };
  }

  const settingsDefs = getSettingDefinitionsForColumn(series, column);

  const computedSettings = getComputedSettings(
    settingsDefs,
    column,
    { ...inheritedSettings, ...storedSettings },
    { series, ...extraData },
  );

  const widgets = getSettingsWidgets(
    settingsDefs,
    storedSettings,
    computedSettings,
    column,
    changedSettings => {
      if (onChange) {
        onChange({ ...storedSettings, ...changedSettings });
      }
      if (onChangeSetting) {
        onChangeSetting(changedSettings);
      }
    },
    { series, ...extraData },
  );

  return (
    <Stack>
      {widgets.filter(
        widget =>
          (!allowlist || allowlist.has(widget.id)) &&
          (!denylist || !denylist.has(widget.id)),
      )}
    </Stack>
  );
}

export function hasColumnSettingsWidgets({ value, ...props }) {
  const storedSettings = value || {};
  return getWidgets({ storedSettings, ...props }).length > 0;
}

const ColumnSettings = ({ value, variant = "default", ...props }) => {
  const storedSettings = value || {};
  const widgets = getWidgets({ storedSettings, ...props });

  return (
    <Stack style={{ maxWidth: 300 }} data-testid="column-settings">
      {widgets.length > 0 ? (
        widgets.map(widget => (
          <ChartSettingsWidget
            key={widget.id}
            {...widget}
            unset={storedSettings[widget.id] === undefined}
            noPadding
            variant={variant}
          />
        ))
      ) : (
        <EmptyState
          message={t`No formatting settings`}
          illustrationElement={<img src={NoResults} />}
        />
      )}
    </Stack>
  );
};

export default ColumnSettings;
