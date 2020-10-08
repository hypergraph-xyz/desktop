const push = args => window._paq && window._paq.push(args)

export default {
  available: () => '_paq' in window,
  trackEvent: (...args) => push(['trackEvent', ...args]),
  setCustomUrl: (...args) => push(['setCustomUrl', ...args]),
  trackPageView: (...args) => push(['trackPageView', ...args])
}
