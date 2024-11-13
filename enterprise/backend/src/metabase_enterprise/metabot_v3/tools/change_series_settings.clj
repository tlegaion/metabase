(ns metabase-enterprise.metabot-v3.tools.change-series-settings
  (:require
   [metabase-enterprise.metabot-v3.tools.registry :refer [deftool]]
   [metabase.util.malli :as mu]))

(deftool change-series-settings
  :applicable? (fn [context]
                 (contains? #{"line" "bar" "area" "combo"}
                            (some-> context :current_visualization_settings :current_display_type)))
  :invoke identity
  :reactions (fn [{:keys [series-settings]}]
               [{:type :metabot.reaction/change-series-settings
                 :series_settings series-settings}])
  :output "success")
