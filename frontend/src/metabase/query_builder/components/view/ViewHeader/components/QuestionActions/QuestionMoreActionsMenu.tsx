import { type JSX, useState } from "react";
import { t } from "ttag";
import _ from "underscore";

import { useSetting } from "metabase/common/hooks";
import Button from "metabase/core/components/Button";
import Tooltip from "metabase/core/components/Tooltip";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { PLUGIN_MODERATION } from "metabase/plugins";
import {
  onOpenQuestionSettings,
  softReloadCard,
  turnModelIntoQuestion,
} from "metabase/query_builder/actions";
import { trackTurnIntoModelClicked } from "metabase/query_builder/analytics";
import { EmbeddingQuestionActions } from "metabase/query_builder/components/view/ViewHeader/components/QuestionActions/EmbeddingQuestionActions";
import DatasetMetadataStrengthIndicator from "metabase/query_builder/components/view/sidebars/DatasetManagementSection/DatasetMetadataStrengthIndicator";
import { shouldShowQuestionSettingsSidebar } from "metabase/query_builder/components/view/sidebars/QuestionSettingsSidebar";
import {
  MODAL_TYPES,
  type QueryModalType,
} from "metabase/query_builder/constants";
import { getUserIsAdmin } from "metabase/selectors/user";
import { Icon, Menu } from "metabase/ui";
import * as Lib from "metabase-lib";
import type Question from "metabase-lib/v1/Question";
import { checkCanBeModel } from "metabase-lib/v1/metadata/utils/models";
import type { DatasetEditorTab, QueryBuilderMode } from "metabase-types/store";

import QuestionActionsS from "./QuestionActions.module.css";

const ADD_TO_DASH_TESTID = "add-to-dashboard-button";
const MOVE_TESTID = "move-button";
const TURN_INTO_DATASET_TESTID = "turn-into-dataset";
const CLONE_TESTID = "clone-button";
const ARCHIVE_TESTID = "archive-button";

type QuestionMoreActionsMenuProps = {
  question: Question;
  onOpenModal: (modalType: QueryModalType) => void;
  onSetQueryBuilderMode: (
    mode: QueryBuilderMode,
    opts?: {
      shouldUpdateUrl?: boolean;
      datasetEditorTab?: DatasetEditorTab;
    },
  ) => void;
};

export const QuestionMoreActionsMenu = ({
  question,
  onOpenModal,
  onSetQueryBuilderMode,
}: QuestionMoreActionsMenuProps): JSX.Element => {
  const isAdmin = useSelector(getUserIsAdmin);
  const isPublicSharingEnabled = useSetting("enable-public-sharing");

  const [opened, setOpened] = useState(false);

  const dispatch = useDispatch();

  const isQuestion = question.type() === "question";
  const isModel = question.type() === "model";
  const isMetric = question.type() === "metric";
  const isModelOrMetric = isModel || isMetric;

  const isDashboardQuestion = isQuestion && _.isNumber(question.dashboardId());
  const isStandaloneQuestion =
    isQuestion && !_.isNumber(question.dashboardId());

  const hasCollectionPermissions = question.canWrite();
  const enableSettingsSidebar = shouldShowQuestionSettingsSidebar(question);

  const { isEditable: hasDataPermissions } = Lib.queryDisplayInfo(
    question.query(),
  );

  const reload = () => dispatch(softReloadCard());

  const handleEditQuery = () =>
    onSetQueryBuilderMode("dataset", {
      datasetEditorTab: "query",
    });

  const handleEditMetadata = () =>
    onSetQueryBuilderMode("dataset", {
      datasetEditorTab: "metadata",
    });

  const handleTurnToModel = () => {
    const modal = checkCanBeModel(question)
      ? MODAL_TYPES.TURN_INTO_DATASET
      : MODAL_TYPES.CAN_NOT_CREATE_MODEL;
    trackTurnIntoModelClicked(question);
    onOpenModal(modal);
  };
  const onOpenSettingsSidebar = () => dispatch(onOpenQuestionSettings());

  const onTurnModelIntoQuestion = () => dispatch(turnModelIntoQuestion());

  return (
    <Menu position="bottom-end" opened={opened} onChange={setOpened}>
      <Menu.Target>
        <div>
          <Tooltip
            tooltip={
              isDashboardQuestion
                ? t`Move, duplicate, and more...`
                : t`Move, trash, and more...`
            }
            isEnabled={!opened}
          >
            <Button onlyIcon icon="ellipsis" />
          </Tooltip>
        </div>
      </Menu.Target>

      <Menu.Dropdown>
        {(isStandaloneQuestion || isMetric) && (
          <Menu.Item
            icon={<Icon name="add_to_dash" />}
            onClick={() => onOpenModal(MODAL_TYPES.ADD_TO_DASHBOARD)}
            data-testid={ADD_TO_DASH_TESTID}
          >
            {t`Add to dashboard`}
          </Menu.Item>
        )}

        {PLUGIN_MODERATION.useQuestionMenuItems(question, reload)}

        {hasCollectionPermissions && isModelOrMetric && hasDataPermissions && (
          <Menu.Item icon={<Icon name="notebook" />} onClick={handleEditQuery}>
            {isMetric ? t`Edit metric definition` : t`Edit query definition`}
          </Menu.Item>
        )}

        {hasCollectionPermissions && isModel && (
          <Menu.Item
            icon={<Icon name="label" />}
            data-testid="edit-metadata"
            onClick={handleEditMetadata}
          >
            <div>
              {t`Edit metadata`}{" "}
              <DatasetMetadataStrengthIndicator
                className={QuestionActionsS.StrengthIndicator}
                dataset={question}
              />
            </div>
          </Menu.Item>
        )}

        {hasCollectionPermissions && isQuestion && (
          <Menu.Item
            icon={<Icon name="model" />}
            data-testid={TURN_INTO_DATASET_TESTID}
            onClick={handleTurnToModel}
          >
            {t`Turn into a model`}
          </Menu.Item>
        )}

        {hasCollectionPermissions && isModel && (
          <Menu.Item
            icon={<Icon name="insight" />}
            onClick={onTurnModelIntoQuestion}
          >
            {t`Turn back to saved question`}
          </Menu.Item>
        )}

        {enableSettingsSidebar && (
          <Menu.Item
            icon={<Icon name="gear" />}
            data-testid="question-settings-button"
            onClick={onOpenSettingsSidebar}
          >
            {t`Edit settings`}
          </Menu.Item>
        )}

        <EmbeddingQuestionActions
          question={question}
          isAdmin={isAdmin}
          isPublicSharingEnabled={isPublicSharingEnabled}
          onOpenModal={onOpenModal}
        />

        {hasCollectionPermissions && (
          <>
            <Menu.Divider />
            <Menu.Item
              icon={<Icon name="move" />}
              data-testid={MOVE_TESTID}
              onClick={() => onOpenModal(MODAL_TYPES.MOVE)}
            >
              {t`Move`}
            </Menu.Item>
          </>
        )}

        {hasDataPermissions && (
          <Menu.Item
            icon={<Icon name="clone" />}
            data-testid={CLONE_TESTID}
            onClick={() => onOpenModal(MODAL_TYPES.CLONE)}
          >
            {t`Duplicate`}
          </Menu.Item>
        )}

        {hasCollectionPermissions && (
          <>
            <Menu.Divider />
            <Menu.Item
              icon={<Icon name="trash" />}
              data-testid={ARCHIVE_TESTID}
              onClick={() => onOpenModal(MODAL_TYPES.ARCHIVE)}
            >
              {t`Move to trash`}
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
