(ns metabase-enterprise.metabot-v3.tools
  (:require
   [metabase-enterprise.metabot-v3.tools.change-chart-appearance]
   [metabase-enterprise.metabot-v3.tools.change-column-settings]
   [metabase-enterprise.metabot-v3.tools.change-display-type]
   [metabase-enterprise.metabot-v3.tools.change-series-settings]
   [metabase-enterprise.metabot-v3.tools.change-table-visualization-settings]
   [metabase-enterprise.metabot-v3.tools.confirm-invite-user]
   [metabase-enterprise.metabot-v3.tools.get-query-columns]
   [metabase-enterprise.metabot-v3.tools.registry :as tools.registry]
   [metabase-enterprise.metabot-v3.tools.run-query]
   [metabase-enterprise.metabot-v3.tools.who-is-your-favorite]
   [metabase.util :as u]
   [metabase.util.log :as log]))

(set! *warn-on-reflection* true)

(comment
  metabase-enterprise.metabot-v3.tools.change-chart-appearance/keep-me
  metabase-enterprise.metabot-v3.tools.change-column-settings/keep-me
  metabase-enterprise.metabot-v3.tools.change-display-type/keep-me
  metabase-enterprise.metabot-v3.tools.change-series-settings/keep-me
  metabase-enterprise.metabot-v3.tools.change-table-visualization-settings/keep-me
  metabase-enterprise.metabot-v3.tools.confirm-invite-user/keep-me
  metabase-enterprise.metabot-v3.tools.get-query-columns/keep-me
  metabase-enterprise.metabot-v3.tools.run-query/keep-me
  metabase-enterprise.metabot-v3.tools.who-is-your-favorite/keep-me)

(def ^:dynamic *tools-metadata*
  "Get metadata about the available tools. Metadata matches the `::metabot-v3.tools.interface/metadata` schema."
  (fn []
    (->> tools.registry/registry vals (map :schema))))

(defn invoke-tool [tool-name arguments context]
  (let [{:keys [invoke output reactions]}
        (tools.registry/resolve-tool tool-name)

        exception? (promise)

        result (try (u/prog1 (invoke arguments context)
                      (deliver exception? false))
                    (catch Exception e
                      (log/debugf e "Error calling tool %s" tool-name)
                      (deliver exception? true)
                      (.getMessage e)))]
    (if @exception?
      {:output result}
      {:reactions (reactions result)
       :output (output result)})))

(defn- tool-applicable? [tool-name context]
  (let [{:keys [applicable?]} (tools.registry/resolve-tool tool-name)]
    (applicable? context)))

(defn applicable-tools
  "Given a list of tools and the relevant context, return the filtered list of tools that are applicable in this
  context."
  [tools context]
  (filter #(tool-applicable? (:name %) context) #p tools))
