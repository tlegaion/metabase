import { setupPluginSystemForOss } from "metabase/plugins/getPlugins";
import { setupPluginSystemForEE } from "metabase-enterprise/plugins";
import type { EnterpriseSettings } from "metabase-enterprise/settings/types";
import type { Settings } from "metabase-types/api";

import { mockSettings } from "./settings";

/**
 * @deprecated use setupEnterprisePlugins with settings set via mockSettings
 */
export function setupEnterpriseTest() {
  jest.mock("metabase-enterprise/settings", () => ({
    hasPremiumFeature: jest.fn().mockReturnValue(true),
  }));

  setupEnterprisePlugins();
}

export function setupPluginsForTests({
  eeBuild = false,
  settings = {},
}: {
  eeBuild?: boolean;
  settings?: Partial<Settings | EnterpriseSettings>;
} = {}) {
  if (eeBuild) {
    mockSettings(settings);

    setupEnterprisePlugins();
  } else {
    setupOSSPlugins();
  }
}

export function setupEnterprisePlugins() {
  console.log("[DEBUG] setupEnterprisePlugins");
  require("metabase-enterprise/plugins");
  setupPluginSystemForEE();
}

export function setupOSSPlugins() {
  setupPluginSystemForOss();
}
