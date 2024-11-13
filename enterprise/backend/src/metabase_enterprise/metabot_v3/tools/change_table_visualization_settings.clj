(ns metabase-enterprise.metabot-v3.tools.change-table-visualization-settings
  (:require
   [metabase-enterprise.metabot-v3.tools.registry :refer [deftool]]))

(deftool change-table-visualization-settings
  :applicable? (fn [context]
                 (= "table" (some-> context :current_visualization_settings :current_display_type)))
  :invoke (fn [args _context] args)
  :reactions (fn [{:keys [visible-columns]}]
               [{:type :metabot.reaction/change-table-visualization-settings
                 :visible-columns visible-columns}])
  :output "success")
