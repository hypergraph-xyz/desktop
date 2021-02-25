import pTimeout from 'p-timeout'
import { encode } from 'dat-encoding'

export const cloneMany = ({ p2p, urls }) =>
  Promise.all(
    urls.map(async url => {
      const [key, version] = url.split('+')
      try {
        return await pTimeout(cloneOne({ p2p, key, version }), 3000)
      } catch (_) {
        console.error(_)
        const [key, version] = url.split('+')
        return { rawJSON: { url: `hyper://${key}` }, metadata: { version } }
      }
    })
  )

export const cloneOne = async ({ p2p, url, key, version }) => {
  if (!key) [key, version] = url.split('+')
  const content = await p2p.clone(encode(key), Number(version))
  console.log({ content })
  if (content.dlInfo.complete) {
    console.log('download complete')
    return content
  } else {
    content.dlInfo.resume()
    await new Promise(resolve => {
      const onComplete = ({ key: _key }) => {
        if (encode(key) === _key) {
          p2p.removeListener('download-drive-completed', onComplete)
          resolve()
        }
      }
      p2p.on('download-drive-completed', onComplete)
    })
    return content
  }
}
