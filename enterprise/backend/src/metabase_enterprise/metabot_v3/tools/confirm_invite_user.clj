(ns metabase-enterprise.metabot-v3.tools.confirm-invite-user
  (:require
   [metabase-enterprise.metabot-v3.tools.registry :refer [deftool]]
   [metabase.api.common :as api]))

(deftool confirm-invite-user
  :invoke (fn [args _context] args)
  :output (fn [_]
            "Confirmation required - awaiting user input.")
  :reactions (fn [{:keys [email]}]
               [{:type :metabot.reaction/confirmation
                :description (format "Invite a user with email '%s' to Metabase?" email)
                :options {:yes [{:type :metabot.reaction/api-call
                                 :api-call {:method "POST"
                                            :url "/api/user"
                                            :body {:email email}}}
                                {:type :metabot.reaction/writeback
                                 :message "<system message>The user confirmed the operation and the specified user has been invited to Metabase.</system message>"}]
                          :no [{:type :metabot.reaction/writeback
                                :message "<system message>The user refused the operation. Ask if they need anything else.</system message>"}]}}])
  :applicable? (fn [_context]
                 api/*is-superuser?*))
