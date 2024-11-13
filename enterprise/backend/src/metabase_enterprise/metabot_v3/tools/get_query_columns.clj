(ns metabase-enterprise.metabot-v3.tools.get-query-columns
  (:require
   [clojure.string :as str]
   [metabase-enterprise.metabot-v3.tools.registry :refer [deftool]]
   [metabase.lib.core :as lib]
   [metabase.lib.metadata.jvm :as lib.metadata.jvm]
   [metabase.util.malli :as mu]))

(deftool get-query-columns
  :applicable? (fn [{:keys [dataset_query]}]
                 (some? dataset_query))
  :invoke (fn [_args {:keys [dataset_query]}]
            (let [metadata-provider (lib.metadata.jvm/application-database-metadata-provider (:database dataset_query))
                  query             (lib/query metadata-provider dataset_query)
                  columns           (lib/visible-columns query)]
              (->> columns
                   (map #(->> % (lib/display-info query) :long-display-name))
                   (str/join ", "))))
  :output identity)
