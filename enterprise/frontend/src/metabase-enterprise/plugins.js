import { PLUGIN_IS_EE_BUILD } from "metabase/plugins";

import MetabaseSettings from "metabase/lib/settings";

// SETTINGS OVERRIDES:
PLUGIN_IS_EE_BUILD.isEEBuild = () => true;

import "./shared";

// PLUGINS:

import "./hosting";
import "./tools";
import "./sandboxes";
import "./auth";
import "./caching";
import "./collections";
import "./content_verification";
import "./whitelabel";
import "./embedding";
import { activateEmbeddingSdkPlugins } from "./embedding-sdk";
import "./snippets";
import "./sharing";
import "./moderation";
import "./email_allow_list";
import "./email_restrict_recipients";
import "./advanced_permissions";
import "./audit_app";
import "./license";
import "./model_persistence";
import "./feature_level_permissions";
import "./application_permissions";
import "./group_managers";
import "./llm_autodescription";
import "./upload_management";
import "./resource_downloads";
import "./user_provisioning";
import "./clean_up";
import "./troubleshooting";

const activateEEPlugins = plugins => {
  activateEmbeddingSdkPlugins(plugins);
  // all the others
  return plugins;
};

import * as OSSPlugins from "metabase/plugins";
import { PLUGIN_SYSTEM_MAGIC_OBJECT } from "metabase/plugins/getPlugins";

let memoizedPlugins = OSSPlugins;
let memoizedKey = "";

export const setupPluginSystemForEE = () => {
  PLUGIN_IS_EE_BUILD.isEEBuild = () => true;
  PLUGIN_SYSTEM_MAGIC_OBJECT.getPluginsImpl = () => {
    console.log("[DEBUG] getPluginsImpl EE");
    const key = JSON.stringify(MetabaseSettings.get("token-features"));
    if (key !== memoizedKey) {
      console.log("[DEBUG] key is different, activating plugins");
      memoizedPlugins = activateEEPlugins(OSSPlugins);
      memoizedKey = key;
    }

    return memoizedPlugins;
  };
};
