export const encode = url =>
  `hypergraph://${/^(?:hyper:\/\/)?(.+)/.exec(url)[1]}`
export const decode = url => /^(?:.+:\/\/)?(.+)/.exec(url)[1]
