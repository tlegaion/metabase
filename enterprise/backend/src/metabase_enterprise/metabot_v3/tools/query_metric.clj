(ns metabase-enterprise.metabot-v3.tools.query-metric
  (:require
   [metabase-enterprise.metabot-v3.tools.interface :as metabot-v3.tools.interface]
   [metabase.util.malli :as mu]))

(mu/defmethod metabot-v3.tools.interface/*invoke-tool* :metabot.tool/query-metric
  [_tool-name _args context]
  {:context context
   :output "Not implemented"})
