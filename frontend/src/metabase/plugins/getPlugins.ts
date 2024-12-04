import * as OSSPlugins from "metabase/plugins";
import { PLUGIN_IS_EE_BUILD } from "metabase/plugins";

export const getPluginsOssImplementation = () => {
  console.log("[DEBUG] getPluginsImpl OSS / noop");
  return OSSPlugins;
};

export const setupPluginSystemForOss = () => {
  PLUGIN_SYSTEM_MAGIC_OBJECT.getPluginsImpl = getPluginsOssImplementation;
  PLUGIN_IS_EE_BUILD.isEEBuild = () => false;
};

export const getMetabaseEEPlugins = () => {
  console.log("[DEBUG] getMetabaseEEPlugins");
  return PLUGIN_SYSTEM_MAGIC_OBJECT.getPluginsImpl();
};

// this is a global object that's modified from the EE plugins or the ee code for setting up tests
export const PLUGIN_SYSTEM_MAGIC_OBJECT = {
  getPluginsImpl: () => getPluginsOssImplementation(),
};
