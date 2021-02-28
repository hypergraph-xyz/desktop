import { encode } from 'dat-encoding'

export default function isContentRegistered (content, profile) {
  return Boolean(
    profile.rawJSON.contents.find(contentUrl => {
      const [key] = contentUrl.split('+')
      return (
        encode(content.rawJSON.url) === encode(key)
        // && content.metadata.version === Number(version)
      )
    })
  )
}
