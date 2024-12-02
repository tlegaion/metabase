(ns metabase-enterprise.task.cache
  (:require
   [clojurewerkz.quartzite.jobs :as jobs]
   [clojurewerkz.quartzite.schedule.cron :as cron]
   [clojurewerkz.quartzite.triggers :as triggers]
   [java-time.api :as t]
   [metabase.public-settings.premium-features :refer [defenterprise]]
   [metabase.task :as task]
   [toucan2.core :as t2])
  (:import
   (org.quartz.spi MutableTrigger)))

(set! *warn-on-reflection* true)

(defn- select-ready-to-run
  "Fetch whatever cache configs for a given `strategy` are ready to be updated."
  [strategy]
  (t2/select :model/CacheConfig :strategy strategy {:where [:or
                                                            [:= :next_run_at nil]
                                                            [:<= :next_run_at (t/offset-date-time)]]}))

(defn- calc-next-run
  "Calculate when a next run should happen based on a cron schedule"
  [^String schedule now]
  (let [^MutableTrigger cron (cron/finalize (cron/cron-schedule schedule))]
    ;; Synchronize cron runner to our app time, which may be mocked in tests
    (.setStartTime cron (t/java-date))
    (-> (.getFireTimeAfter cron (t/java-date now))
        (t/offset-date-time (t/zone-offset)))))

(defn- refresh-schedule-configs!
  "Update `invalidated_at` for every cache config with `:schedule` strategy"
  []
  (let [now (t/offset-date-time)]
    (count
     (for [{:keys [id config]} (select-ready-to-run :schedule)]
       (t2/update! :model/CacheConfig {:id id}
                   {:next_run_at     (calc-next-run (:schedule config) now)
                    :invalidated_at now})))))

(jobs/defjob ^{org.quartz.DisallowConcurrentExecution true
               :doc                                   "Refresh 'schedule' caches"}
  Cache [_ctx]
  (refresh-schedule-configs!))

(def ^:private cache-job
  (jobs/build
   (jobs/with-description "Schedule Caches refresh task")
   (jobs/of-type Cache)
   (jobs/with-identity (jobs/key "metabase-enterprise.cache.job"))
   (jobs/store-durably)))

(def ^:private cache-trigger
  (triggers/build
   (triggers/with-identity (triggers/key "metabase-enterprise.cache.trigger"))
   (triggers/start-now)
   (triggers/with-schedule
    (cron/cron-schedule "0 * * * * ? *"))))

(defenterprise init-cache-task!
  "Inits periodical task checking for cache expiration"
  :feature :cache-granular-controls
  []
  (task/schedule-task! cache-job cache-trigger))
