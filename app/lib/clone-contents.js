import pTimeout from 'p-timeout'
import { encode } from 'dat-encoding'

const cloneContents = ({ p2p, urls }) =>
  Promise.all(
    urls.map(async url => {
      const [key, version] = url.split('+')
      try {
        return await pTimeout(p2p.clone(encode(key), Number(version)), 3000)
      } catch (_) {
        return { rawJSON: { url: `hyper://${key}` }, metadata: { version } }
      }
    })
  )

export default cloneContents
