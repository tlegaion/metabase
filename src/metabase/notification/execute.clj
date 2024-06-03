(ns metabase.notification.execute
  (:require
   [metabase.api.common :as api]
   [metabase.models.dashboard :as dashboard]
   [metabase.models.dashboard-card :as dashboard-card]
   [metabase.models.interface :as mi]
   [metabase.models.serialization :as serdes]
   [metabase.pulse.parameters :as pulse-params]
   [metabase.query-processor :as qp]
   [metabase.query-processor.dashboard :as qp.dashboard]
   [metabase.query-processor.middleware.permissions :as qp.perms]
   [metabase.server.middleware.session :as mw.session]
   [metabase.shared.parameters.parameters :as shared.params]
   [metabase.util.log :as log]
   [metabase.util.urls :as urls]
   [toucan2.core :as t2]))

;; TODO - this should be done async
;; TODO - this and `execute-multi-card` should be made more efficient: eg. we query for the card several times
(defn execute-card
  "Execute the query for a single Card."
  [creator-id card]
  {:pre [(integer? creator-id)]}
  (try
    (let [{card-id   :id
           query     :dataset_query
           metadata  :result_metadata
           card-type :type}           card
          query                       (assoc query :async? false)
          process-query               (fn []
                                        (binding [qp.perms/*card-id* card-id]
                                          (qp/process-query
                                           (qp/userland-query-with-default-constraints
                                            (assoc query :middleware {:skip-results-metadata? true
                                                                      :process-viz-settings?  true
                                                                      :js-int-to-string?      false})
                                            (cond-> {:executed-by creator-id
                                                     :context     :pulse
                                                     :card-id     card-id}
                                              (= card-type :model)
                                              (assoc :metadata/model-metadata metadata))))))]
      (mw.session/with-current-user creator-id
        (process-query)))
    (catch Throwable e
      (log/warnf e "Error running query for Card %s" (:id card)))))

(defn- merge-default-values
  "For the specific case of Dashboard Subscriptions we should use `:default` parameter values as the actual `:value` for
  the parameter if none is specified. Normally the FE client will take `:default` and pass it in as `:value` if it
  wants to use it (see #20503 for more details) but this obviously isn't an option for Dashboard Subscriptions... so
  go thru `parameters` and change `:default` to `:value` unless a `:value` is explicitly specified."
  [parameters]
  (for [{default-value :default, :as parameter} parameters]
    (merge
     (when default-value
       {:value default-value})
     (dissoc parameter :default))))

(defn- is-card-empty?
  "Check if the card is empty"
  [card]
  (if-let [result (:result card)]
    (or (zero? (-> result :row_count))
        ;; Many aggregations result in [[nil]] if there are no rows to aggregate after filters
        (= [[nil]]
           (-> result :data :rows)))
    ;; Text cards have no result; treat as empty
    true))

(defn- execute-dashboard-subscription-card
  "Returns subscription result for a card.

  This function should be executed under pulse's creator permissions."
  [dashboard-id dashcard card-id parameters]
  (assert api/*current-user-id* "Makes sure you wrapped this with a `with-current-user`.")
  (try
    (let [card    (t2/select-one :model/Card :id card-id)
          result  (qp.dashboard/process-query-for-dashcard
                   :dashboard-id  dashboard-id
                   :card-id       card-id
                   :dashcard-id   (:id dashcard)
                   :context       :pulse ; TODO - we should support for `:dashboard-subscription` and use that to differentiate the two
                   :export-format :api
                   :parameters    parameters
                   :middleware    {:process-viz-settings? true
                                   :js-int-to-string?     false}
                   :run           (^:once fn* [query info]
                                   (qp/process-query
                                    (qp/userland-query-with-default-constraints query info))))]
      (when-not (and (get-in dashcard [:visualization_settings :card.hide_empty]) (is-card-empty? (assoc card :result result)))
        {:card     card
         :dashcard dashcard
         :result   result
         :type     :card}))
    (catch Throwable e
      (log/warnf e "Error running query for Card %s" card-id))))

(defn virtual-card-of-type?
  "Check if dashcard is a virtual with type `ttype`, if `true` returns the dashcard, else returns `nil`.

  There are currently 4 types of virtual card: \"text\", \"action\", \"link\", \"placeholder\"."
  [dashcard ttype]
  (when (= ttype (get-in dashcard [:visualization_settings :virtual_card :display]))
    dashcard))

(defn- link-card-entity->url
  [{:keys [db_id id model] :as _entity}]
  (case model
    "card"       (urls/card-url id)
    "dataset"    (urls/card-url id)
    "collection" (urls/collection-url id)
    "dashboard"  (urls/dashboard-url id)
    "database"   (urls/database-url id)
    "table"      (urls/table-url db_id id)))

(defn- link-card->text-part
  [{:keys [entity url] :as _link-card}]
  (let [url-link-card? (some? url)]
    {:text (str (format
                  "### [%s](%s)"
                  (if url-link-card? url (:name entity))
                  (if url-link-card? url (link-card-entity->url entity)))
                (when-let [description (if url-link-card? nil (:description entity))]
                  (format "\n%s" description)))
     :type :text}))

(defn- dashcard-link-card->part
  "Convert a dashcard that is a link card to pulse part.

  This function should be executed under pulse's creator permissions."
  [dashcard]
  (assert api/*current-user-id* "Makes sure you wrapped this with a `with-current-user`.")
  (let [link-card (get-in dashcard [:visualization_settings :link])]
    (cond
      (some? (:url link-card))
      (link-card->text-part link-card)

      ;; if link card link to an entity, update the setting because
      ;; the info in viz-settings might be out-of-date
      (some? (:entity link-card))
      (let [{:keys [model id]} (:entity link-card)
            instance           (t2/select-one
                                 (serdes/link-card-model->toucan-model model)
                                 (dashboard-card/link-card-info-query-for-model model id))]
        (when (mi/can-read? instance)
          (link-card->text-part (assoc link-card :entity instance)))))))

(defn- escape-heading-markdown
  [dashcard]
  (if (= "heading" (get-in dashcard [:visualization_settings :virtual_card :display]))
    ;; If there's no heading text, the heading is empty, so we return nil.
    (when (get-in dashcard [:visualization_settings :text])
      (update-in dashcard [:visualization_settings :text]
                 #(str "## " (shared.params/escape-chars % shared.params/escaped-chars-regex))))
    dashcard))

(defn- dashcard->part
  "Given a dashcard returns its part based on its type.

  The result will follow the pulse's creator permissions."
  [dashcard pulse dashboard]
  (assert api/*current-user-id* "Makes sure you wrapped this with a `with-current-user`.")
  (cond
    (:card_id dashcard)
    (let [parameters (merge-default-values (pulse-params/parameters pulse dashboard))]
      (execute-dashboard-subscription-card (:id dashboard) dashcard (:card_id dashcard) parameters))

    ;; actions
    (virtual-card-of-type? dashcard "action")
    nil

    ;; link cards
    (virtual-card-of-type? dashcard "link")
    (dashcard-link-card->part dashcard)

    ;; placeholder cards aren't displayed
    (virtual-card-of-type? dashcard "placeholder")
    nil

    ;; text cards have existed for a while and I'm not sure if all existing text cards
    ;; will have virtual_card.display = "text", so assume everything else is a text card
    :else
    (let [parameters (merge-default-values (pulse-params/parameters pulse dashboard))]
      (some-> dashcard
              (pulse-params/process-virtual-dashcard parameters)
              escape-heading-markdown
              :visualization_settings
              (assoc :type :text)))))

(defn- dashcards->part
  [dashcards pulse dashboard]
  (let [ordered-dashcards (sort dashboard-card/dashcard-comparator dashcards)]
    (for [dashcard ordered-dashcards
                 :let     [part (dashcard->part dashcard pulse dashboard)]
                 :when    (some? part)]
         part)))

(defn- tab->part
  [{:keys [name]}]
  {:text name
   :type :tab-title})

(defn execute-dashboard
  "Fetch all the dashcards in a dashboard for a Pulse, and execute non-text cards.

  The generated parts will follow the pulse's creator permissions."
  [creator-id dashboard-subscription]
  (let [dashboard-id (:dashboard_id dashboard-subscription)
        dashboard    (t2/select-one :model/Dashboard dashboard-id)]
    (mw.session/with-current-user creator-id
      (let [parts (doall (if (dashboard/has-tabs? dashboard)
                           (let [tabs-with-cards (t2/hydrate (t2/select :model/DashboardTab :dashboard_id dashboard-id) :tab-cards)]
                             (flatten (for [{:keys [cards] :as tab} tabs-with-cards]
                                        (concat [(tab->part tab)] (dashcards->part cards dashboard-subscription dashboard)))))
                           (dashcards->part (t2/select :model/DashboardCard :dashboard_id dashboard-id) dashboard-subscription dashboard)))]
        (if (:skip_if_empty dashboard-subscription)
          ;; Remove cards that have no results when empty results aren't wanted
          (remove (fn [{part-type :type :as part}]
                    (and
                     (= part-type :card)
                     (zero? (get-in part [:result :row_count] 0))))
                  parts)
          parts)))))
