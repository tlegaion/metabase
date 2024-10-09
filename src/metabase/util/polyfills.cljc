(ns metabase.util.polyfills
  #?@(:cljs-test ((:require ["@peculiar/webcrypto" :as webcrypto]))))

;; The browser-compatible Crypto object and the `global.crypto` instance are unavailable in NodeJS before v23.0.0.
;; Since both developers and Github CI may be using older Node versions, we install a Polyfill and include it here.
#?(:cljs-test (do (println "Webcrypto polyfill!") (set! js/crypto (webcrypto/Crypto.))))
