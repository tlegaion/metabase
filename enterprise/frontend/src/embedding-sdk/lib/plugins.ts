import type { ReactNode } from "react";

import type { DashCardMenuItem } from "metabase/dashboard/components/DashCard/DashCardMenu/DashCardMenu";
import type { ClickAction, ClickObject } from "metabase/visualizations/types";
import type { Card as QuestionType } from "metabase-types/api";

export type MetabaseDataPointObject = Pick<
  ClickObject,
  "value" | "column" | "data" | "event"
>;

export type MetabaseClickActionPluginsConfig = (
  clickActions: ClickAction[],
  clickedDataPoint: MetabaseDataPointObject,
) => ClickAction[];

export type DashboardCardMenuCustomElement = ({
  question,
}: {
  question: QuestionType;
}) => ReactNode;

export type CustomDashboardCardMenuItem = ({
  question,
}: {
  question?: QuestionType;
}) => DashCardMenuItem;

export type DashboardCardCustomMenuItem = {
  withDownloads?: boolean;
  withEditLink?: boolean;
  customItems?: (DashCardMenuItem | CustomDashboardCardMenuItem)[];
};

export type MetabaseDashboardPluginsConfig = {
  dashboardCardMenu?:
    | DashboardCardMenuCustomElement
    | DashboardCardCustomMenuItem;
};

export type MetabasePluginsConfig = {
  mapQuestionClickActions?: MetabaseClickActionPluginsConfig;
  dashboard?: MetabaseDashboardPluginsConfig;
};
