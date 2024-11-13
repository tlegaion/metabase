(ns metabase-enterprise.metabot-v3.tools.change-column-settings
  (:require
   [metabase-enterprise.metabot-v3.tools.registry :refer [deftool]]))

(deftool change-column-settings
  :applicable? (fn [context]
                 (contains? (some-> context :current_visualization_settings) :column_settings))
  :invoke (fn [args _context] args)
  :reactions (fn [{:keys [column-settings]}]
               [{:type :metabot.reaction/change-column-settings
                 :column_settings column-settings}])
  :output "success")
