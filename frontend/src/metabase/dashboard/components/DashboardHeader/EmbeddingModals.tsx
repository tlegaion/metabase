import { type Ref, forwardRef } from "react";

import { DashboardSharingEmbeddingModal } from "metabase/dashboard/containers/DashboardSharingEmbeddingModal";
import type { SharingModalType } from "metabase/notifications/NotificationsActionsMenu/types";
import { DashboardPublicLinkPopover } from "metabase/sharing/components/PublicLinkPopover";
import { Box } from "metabase/ui";
import type { Dashboard } from "metabase-types/api";

const MenuTarget = forwardRef(function _MenuTarget(
  _props,
  ref: Ref<HTMLDivElement>,
) {
  return <Box h="2rem" ref={ref} />;
});

type SharingModalProps = {
  modalType: SharingModalType | null;
  dashboard: Dashboard;
  onClose: () => void;
};

export const EmbeddingModals = ({
  modalType,
  onClose,
  dashboard,
}: SharingModalProps) => {
  if (modalType === "dashboard-public-link") {
    return (
      <DashboardPublicLinkPopover
        dashboard={dashboard}
        target={<MenuTarget />}
        onClose={onClose}
        isOpen
      />
    );
  }

  if (modalType === "dashboard-embed" && dashboard) {
    return (
      <DashboardSharingEmbeddingModal
        key="dashboard-embed"
        dashboard={dashboard}
        onClose={onClose}
        isOpen
      />
    );
  }

  return null;
};
