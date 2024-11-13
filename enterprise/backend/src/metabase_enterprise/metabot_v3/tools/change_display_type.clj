(ns metabase-enterprise.metabot-v3.tools.change-display-type
  (:require
   [metabase-enterprise.metabot-v3.tools.registry :refer [deftool]]))

(deftool change-display-type
  :invoke (fn [args _context] args)
  :reactions (fn [{display-type :type}]
               [{:type :metabot.reaction/change-display-type
                :display-type display-type}])
  :output "success")
