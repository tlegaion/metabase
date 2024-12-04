import { hasPremiumFeature } from "metabase-enterprise/settings";

export const activateEmbeddingSdkPlugins = plugins => {
  if (hasPremiumFeature("embedding_sdk")) {
    plugins.PLUGIN_EMBEDDING_SDK.isEnabled = () => true;
  }

  return plugins;
};
