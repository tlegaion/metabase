(ns metabase.models.query-table
  (:require
   [methodical.core :as methodical]
   [toucan2.core :as t2]))

(methodical/defmethod t2/table-name :model/QueryTable [_model] :query_table)

(doto :model/QueryTable
  (derive :metabase/model))

(t2/define-after-select :model/QueryTable [_model]
  #_(prn (ex-info "QueryTable" {})))
