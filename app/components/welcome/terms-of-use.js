import React from 'react'
import styled from 'styled-components'
import { shell } from 'electron'
import { colors } from '@libscie/design-library'

const Container = styled.div`
  overflow: auto;
  position: absolute;
  bottom: 8rem;
  top: 2rem;
  right: 2rem;
  left: 2rem;
  padding-right: 1rem;

  h1 {
    font-weight: normal;
    font-size: 2.5rem;
    margin-bottom: 0;
  }
  header h1 {
    margin-top: 0;
  }
  a {
    color: ${colors.white};
    text-decoration: none;
    border-bottom: 2px solid ${colors.purple500};
    :hover {
      background-color: ${colors.purple500};
      cursor: pointer;
    }
  }
  ul {
    margin: 0;
  }

  .table_of_contents-indent-1 {
    margin-left: 1rem;
  }
`

export default () => (
  <Container
    onClick={ev => {
      if (
        ev.target.tagName === 'A' &&
        !ev.target.getAttribute('href').startsWith('#')
      ) {
        shell.openExternal(ev.target.getAttribute('href'))
        ev.preventDefault()
      }
    }}
  >
    <article id='27945274-82b5-4edd-b5b7-c991e8152999' className='page sans'>
      <header>
        <h1 className='page-title'>Terms</h1>
      </header>
      <div className='page-body'>
        <p id='995c3bb2-23a5-4ab0-929b-9d17a054ffba' className=''>
          The Hypergraph application (i.e., &quot;Hypergraph&quot;) is provided
          by Liberate Science GmbH (i.e., &quot;we&quot;, &quot;us&quot;,
          &quot;our&quot;, &quot;Liberate Science&quot;).
        </p>
        <p id='751f2fa7-e08d-4bf5-b9c3-9b94ed861ebb' className=''>
          We do our best to make these Terms reasonable, short, and
          understandable to all humans 😊 If you have feedback or questions,
          please let us know at{' '}
          <a href='mailto:terms@libscie.org'>terms@libscie.org</a>. The human
          summary (which isn&#x27;t legally binding):
        </p>
        <ul id='482b95ec-7668-4bcd-9beb-f8a624c9282e' className='bulleted-list'>
          <li>Software provided under the MIT license</li>
        </ul>
        <ul id='e867fdcb-b141-4028-a487-59fc08c2d48b' className='bulleted-list'>
          <li>Do not share illegal content</li>
        </ul>
        <ul id='c7266422-b73e-42b6-9a7f-839bc265850e' className='bulleted-list'>
          <li>Content is shared under a CC0 Public Domain Dedication</li>
        </ul>
        <ul id='b4d170ea-7d93-4011-9264-8e2eb83444be' className='bulleted-list'>
          <li>You are personally responsible for the content you share</li>
        </ul>
        <ul id='9c55dd37-f94d-41bb-b2f3-6e550ca8676b' className='bulleted-list'>
          <li>We may store information you actively provide us</li>
        </ul>
        <ul id='2a932660-f3f9-4247-8a32-05a659ea95ed' className='bulleted-list'>
          <li>
            We collect anonymized usage statistics if you don&#x27;t opt out
          </li>
        </ul>
        <ul id='a7470da6-827c-4605-afd2-ee723c2c2eb1' className='bulleted-list'>
          <li>Your IP address is publicly available while using Hypergraph</li>
        </ul>
        <ul id='8c89347a-f155-42a8-a1cf-538af82974d7' className='bulleted-list'>
          <li>
            The information shared while the Hypergraph Vault is enabled is
            stored indefinitely
          </li>
        </ul>
        <p id='a77e22ef-4576-41f8-90ee-863d276c55ad' className=''>
          If you do not agree to the terms as set out below, you may not use
          Hypergraph. Whenever the terms change, we will request your
          permission.
        </p>
        <nav
          id='eb23d511-aad4-4dc4-953c-8224ac6ceef3'
          className='block-color-gray table_of_contents'
        >
          <div className='table_of_contents-item table_of_contents-indent-0'>
            <a
              className='table_of_contents-link'
              href='#db963312-fc5a-4737-8716-f8efbbf49080'
            >
              MIT license
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-0'>
            <a
              className='table_of_contents-link'
              href='#8761bf3b-d44f-4187-85c7-905bb7de2c32'
            >
              Usage restrictions
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-0'>
            <a
              className='table_of_contents-link'
              href='#b5dfbe5d-5971-41ce-982e-61a03cec2aa4'
            >
              Copyright
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-1'>
            <a
              className='table_of_contents-link'
              href='#8e0e9654-15bb-4c38-9b84-b31609674019'
            >
              Copyright violations
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-0'>
            <a
              className='table_of_contents-link'
              href='#c638a5ae-e935-41b9-be94-d8d0793ccf34'
            >
              Data policy
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-1'>
            <a
              className='table_of_contents-link'
              href='#427cd77a-a43c-4c69-bfff-d0bda1c55b75'
            >
              Information collected
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-1'>
            <a
              className='table_of_contents-link'
              href='#2e7fa7e1-b265-4c16-b3db-fb2b9061fca0'
            >
              Information not collected
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-1'>
            <a
              className='table_of_contents-link'
              href='#b146b3c7-13fe-42c8-b9a6-081ee4ec9912'
            >
              Information exposed
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-1'>
            <a
              className='table_of_contents-link'
              href='#9bfad4c3-ad69-4b13-ae40-d03ad9c8fc96'
            >
              Data request
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-0'>
            <a
              className='table_of_contents-link'
              href='#3a21e7b5-4f5b-4c75-bbe2-c70f260fafe8'
            >
              Hypergraph Vault
            </a>
          </div>
          <div className='table_of_contents-item table_of_contents-indent-0'>
            <a
              className='table_of_contents-link'
              href='#98a15e55-d801-4820-adde-d7bdc4a47da3'
            >
              Jurisdiction
            </a>
          </div>
        </nav>
        <h1 id='db963312-fc5a-4737-8716-f8efbbf49080' className=''>
          MIT license
        </h1>
        <p id='c7200043-e1d4-4657-93ff-f954c58633cf' className=''>
          Permission is hereby granted, free of charge, to any person obtaining
          a copy of this software and associated documentation files (the
          &quot;Software&quot;), to deal in the Software without restriction,
          including without limitation the rights to use, copy, modify, merge,
          publish, distribute, sublicense, and/or sell copies of the Software,
          and to permit persons to whom the Software is furnished to do so,
          subject to the following conditions:
        </p>
        <p id='97a6e1a4-80c7-4aef-904a-efd76b6967d3' className=''>
          The above copyright notice and this permission notice shall be
          included in all copies or substantial portions of the Software.
        </p>
        <p id='4e2985c3-e397-4075-ba02-bcf0ffa880cd' className=''>
          THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY
          KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
          OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
          NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
          LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
          OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
          WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </p>
        <h1 id='8761bf3b-d44f-4187-85c7-905bb7de2c32' className=''>
          Usage restrictions
        </h1>
        <p id='3e6af52e-e87c-4f7e-a8a7-93c4e44f847a' className=''>
          You agree to not store, post, upload, share, or transmit any content
          that:
        </p>
        <ul id='d62f7540-c38b-48f2-bbd5-58d09c95e52c' className='bulleted-list'>
          <li>
            infringes, misappropriates or violates a third party’s patent,
            copyright, trademark, trade secret, moral rights or other
            intellectual property rights, or rights of publicity or privacy
          </li>
        </ul>
        <ul id='5eb71088-75c8-4273-a4ee-ca266ef1ece5' className='bulleted-list'>
          <li>
            violates, or encourages any conduct that would violate, any
            applicable law or regulation or would give rise to civil liability
          </li>
        </ul>
        <ul id='0e575a36-af67-4e12-811e-dc8bec14076f' className='bulleted-list'>
          <li>is fraudulent, false, misleading or deceptive</li>
        </ul>
        <ul id='4108c098-c773-4be9-bdab-c154b3da24a9' className='bulleted-list'>
          <li>is defamatory, obscene, pornographic, vulgar or offensive</li>
        </ul>
        <ul id='40f80882-d1b4-4bf9-9609-acd1526bb6ba' className='bulleted-list'>
          <li>
            promotes discrimination, bigotry, racism, hatred, harassment or harm
            against any individual or group
          </li>
        </ul>
        <ul id='1fe50528-0822-47d1-a4bf-ab8c72eec8c1' className='bulleted-list'>
          <li>
            is violent or threatening or promotes violence or actions that are
            threatening to any person or entity
          </li>
        </ul>
        <ul id='76b02075-b526-40cd-b3d1-9cb2addedf05' className='bulleted-list'>
          <li>promotes illegal or harmful activities or substances;</li>
        </ul>
        <h1 id='b5dfbe5d-5971-41ce-982e-61a03cec2aa4' className=''>
          Copyright
        </h1>
        <p id='d142db2f-520f-4a65-88d7-8db292b6ac3a' className=''>
          You agree that content you share through Hypergraph is made publicly
          available under the{' '}
          <a href='https://creativecommons.org/publicdomain/zero/1.0/legalcode'>
            CC0 Public Domain Dedication
          </a>
          . You do not waive patent rights or moral rights to the work. By
          sharing content through Hypergraph, you affirm that you are authorized
          to do so on behalf of yourself, other authors, and potential third
          parties owning copyright (e.g., employer).
        </p>
        <p id='ad78941f-ceda-4c1f-b0e2-9a0c8307767e' className=''>
          You agree to clear all relevant intellectual property rights (e.g.,
          patents, trademarks, copyrights) on the information you share. When
          sharing content that you do not hold the rights to, you agree to
          denote the relevant legal notices.
        </p>
        <p id='9c716f35-1e43-45e0-a041-c0bfb9e98d75' className=''>
          You agree to accept sole responsibility for the content you share
          through Hypergraph. You agree to not hold liable Liberate Science for
          any consequences of your use of the Hypergraph software.
        </p>
        <p id='592fed41-28fb-4a38-baf3-17bee013a4d1' className=''>
          Content provided to you under a{' '}
          <a href='https://creativecommons.org/publicdomain/zero/1.0/legalcode'>
            CC0 Public Domain Dedication
          </a>{' '}
          does not indemnify you from patent, trademark, or other intellectual
          property violations.
        </p>
        <h2 id='8e0e9654-15bb-4c38-9b84-b31609674019' className=''>
          Copyright violations
        </h2>
        <p id='88878209-1eee-4433-a072-d952b92f27c0' className=''>
          If you feel like we&#x27;ve violated your copyright, please notify us
          on <a href='mailto:copyright@libscie.org'>copyright@libscie.org</a>{' '}
          with a specific explanation as to why you consider us to be violating
          your copyrights.{' '}
        </p>
        <p id='e5f466a0-6bcd-44db-aec9-590e87a46534' className=''>
          Formal takedown notices must be sent to{' '}
          <a href='mailto:copyright@libscie.org'>copyright@libscie.org</a> and
          must enumerate all claims as exactly as possible. By sending a
          takedown notice, you agree to public disclosure of the takedown notice
          (we will redact any information regarding natural persons). We will
          not take into account any claims that do not have a{' '}
          <a href='https://en.wikipedia.org/wiki/Burden_of_proof_(law)#Preponderance_of_the_evidence'>
            preponderance of evidence
          </a>
          .{' '}
        </p>
        <p id='39d67529-a8e3-4bd6-8422-131d9882ad8f' className=''>
          For takedown notices also sent per mail, please send these to
        </p>
        <p id='45479ee2-ed71-4589-82b9-1e7ddaf8d684' className=''>
          Liberate Science GmbH
        </p>
        <p id='460db56a-cb1e-4c69-a3d3-56f59a8ffd01' className=''>
          Ebertystraße 44
        </p>
        <p id='92084482-4665-429c-97fc-c0f885a099a7' className=''>
          10249 Berlin (DEU)
        </p>
        <p id='40cb04cf-561d-4b56-9af8-67f7996dde81' className=''>
          If we assess a takedown claim as valid (or are court ordered), we will
          check our servers for copies of the relevant content and add it to our
          block-list for any services related to Hypergraph.
        </p>
        <h1 id='c638a5ae-e935-41b9-be94-d8d0793ccf34' className=''>
          Data policy
        </h1>
        <p id='3f11ebc2-56f0-4370-a801-a4a0aa77477f' className=''>
          Our policy is to minimize information we collect about you or your
          devices when you use Hypergraph. We also, within reason, minimize who
          has access to these personal data and how long we store the
          information. We make a distinction between active data collection and
          passive data collection.{' '}
        </p>
        <p id='92d13c01-3ce8-45e4-82a7-042612172854' className=''>
          We use the following third parties to provide you with functionality
          in Hypergraph and process the resulting data:
        </p>
        <ul id='857438b3-a167-466d-9c39-733317c1d16b' className='bulleted-list'>
          <li>
            <a href='https://aws.amazon.com/privacy/'>Amazon Web Services</a>
          </li>
        </ul>
        <ul id='18778524-d942-4f07-93b5-64375a4d1b15' className='bulleted-list'>
          <li>
            <a href='https://chatra.com/privacy-policy/'>Chatra</a>
          </li>
        </ul>
        <ul id='8c5cea07-af49-4976-9a56-06832bac9101' className='bulleted-list'>
          <li>
            <a href='https://cloud68.co/legal/privacy-policy'>Cloud68</a>
          </li>
        </ul>
        <ul id='47682cc6-4d2d-4e24-9a55-21c7274bd3dd' className='bulleted-list'>
          <li>
            <a href='https://www.digitalocean.com/legal/privacy-policy/'>
              DigitalOcean
            </a>
          </li>
        </ul>
        <ul id='e6650b5f-4749-4e4e-9cc5-f1a0fcfe97da' className='bulleted-list'>
          <li>
            <a href='https://policies.google.com/privacy'>Google App Suite</a>
          </li>
        </ul>
        <ul id='d314ef68-2c3f-41a4-86ae-63c69d289a05' className='bulleted-list'>
          <li>
            <a href='https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091'>
              Notion
            </a>
          </li>
        </ul>
        <ul id='10ac46a8-1b9c-44f1-9217-7e6605ac612c' className='bulleted-list'>
          <li>
            <a href='https://stripe.com/en-de/privacy'>Stripe</a>
          </li>
        </ul>
        <p id='16163bd7-8e3c-422b-8f29-6dc958e9ffb5' className=''>
          Please see their respective privacy policies to understand what
          information they store and how. We do not actively share any of the
          collected information outside Liberate Science GmbH.
        </p>
        <h2 id='427cd77a-a43c-4c69-bfff-d0bda1c55b75' className=''>
          Information collected
        </h2>
        <p id='88d8965d-1e87-4ed7-b428-e96a6dcc0df1' className=''>
          We collect statistics regarding how you use Hypergraph, except when
          you opt out during setup. We have specifically chosen to reduce
          accuracy of our statistics to optimize respect for your privacy.
          Information we collect is:
        </p>
        <ul id='c26e6825-43e9-4d23-b4ed-23a1b2bd4fa2' className='bulleted-list'>
          <li>
            Device information (browser, operating system, screen size, partial
            IP address [two bytes anonymized])
          </li>
        </ul>
        <ul id='a9096ecd-ee01-4106-b09f-5e3478d0b017' className='bulleted-list'>
          <li>Pages visited per session</li>
        </ul>
        <ul id='a9d27c93-6145-4e5e-9acd-00628cda24d6' className='bulleted-list'>
          <li>Links followed per session</li>
        </ul>
        <ul id='fe524ad0-7ffb-4ee6-8d76-605d72bce05f' className='bulleted-list'>
          <li>Duration of visit per session</li>
        </ul>
        <p id='ce660ed3-22c4-43a8-ab18-b6f4b65515cf' className=''>
          We store our raw data for 365 days, after which it is automatically
          deleted.
        </p>
        <p id='c908da8d-ff27-4d38-9d35-03ce2d803b17' className=''>
          We provide some active ways for you to share information with us. You
          can assume we store that information unless you ask us to remove it or
          use the option to remove it yourself. Specifically, we give you the
          option to...
        </p>
        <ul id='beae4ce1-e43b-48e8-889a-8a35fe062bac' className='bulleted-list'>
          <li>...share your email address with us 💌</li>
        </ul>
        <ul id='597cc953-3a24-4190-a63d-0abfcd795b52' className='bulleted-list'>
          <li>
            ...share a name and any questions you might have through our Chatra
            integration
          </li>
        </ul>
        <p id='1912e12a-d359-44c2-b412-54cc3626082a' className=''>
          Note that the services we use have passive data collection in place
          that we might have access to as well. Most notably is our Chatra
          integration, which provides us with real-time access on:
        </p>
        <ul id='84f5676e-064f-4fde-a72d-8d37240637b9' className='bulleted-list'>
          <li>Amount of users</li>
        </ul>
        <ul id='70de1f09-c283-4420-8a60-d95dbc9267aa' className='bulleted-list'>
          <li>Geographical location of user</li>
        </ul>
        <ul id='339a10c4-ea6a-4c09-9042-2797f262655b' className='bulleted-list'>
          <li>Page user is viewing</li>
        </ul>
        <ul id='7b8e0c5e-84d9-4cf4-88f0-cb8e2fa71e0c' className='bulleted-list'>
          <li>Previous page</li>
        </ul>
        <ul id='8fac647f-8ff2-4f30-80af-bd9be0065fc0' className='bulleted-list'>
          <li>Operating system</li>
        </ul>
        <h2 id='2e7fa7e1-b265-4c16-b3db-fb2b9061fca0' className=''>
          Information not collected
        </h2>
        <p id='654f61ff-f038-4dd5-ac1f-1f84eced0447' className=''>
          To protect your data and give you full control over the information we
          collect from you, we explicitly do not integrate the following on our
          Pages:
        </p>
        <ul id='e045ef65-9a9b-4e23-a747-701e613eb172' className='bulleted-list'>
          <li>...analytics cookies</li>
        </ul>
        <ul id='a1aa5d97-c532-4b06-a0d7-f7572d474fa0' className='bulleted-list'>
          <li>...cross-site trackers</li>
        </ul>
        <ul id='4d1a977b-a329-462e-a496-4382f6e198e1' className='bulleted-list'>
          <li>...fingerprinting cookies</li>
        </ul>
        <p id='b8ab6381-bb28-47fd-80fa-2bfffe091f73' className=''>
          We do not store individual level data without consent.
        </p>
        <h2 id='b146b3c7-13fe-42c8-b9a6-081ee4ec9912' className=''>
          Information exposed
        </h2>
        <p id='aae00e04-5afb-4819-9865-23a0eacbe752' className=''>
          By using Hypergraph, you publicly announce your IP address to other
          users. This means that other people can create logs of which IP is
          accessing which content. We cannot control who does so. You agree to
          not hold Liberate Science liable in any and all claims or damages that
          are the result of your usage of Hypergraph.
        </p>
        <h2 id='9bfad4c3-ad69-4b13-ae40-d03ad9c8fc96' className=''>
          Data request
        </h2>
        <p id='a32eb3fd-3f9e-4215-86e5-b3cbed79c60f' className=''>
          We think it is important for you to be in control of your data. You as
          a natural person can always reach us under{' '}
          <a href='mailto:privacy@libscie.org'>privacy@libscie.org</a> with
          questions about data regarding you. This email address also serves as
          an entry point for your GDPR requests, if you have one.
        </p>
        <p id='6e28bf56-1841-4d29-bab8-9495fcb457b0' className=''>
          The person responsible for all the data handling at Liberate Science
          GmbH is Chris Hartgerink, who you can reach directly at{' '}
          <a href='mailto:chris@libscie.org'>chris@libscie.org</a> or +49 162 68
          18 225 if you have any concerns you would like to address immediately.
        </p>
        <h1 id='3a21e7b5-4f5b-4c75-bbe2-c70f260fafe8' className=''>
          Hypergraph Vault
        </h1>
        <p id='3fc46bd9-c066-4473-8f84-198b1d6cd6e5' className=''>
          By enabling the Hypergraph Vault, you agree that we store information
          about the content you share indefinitely. You also agree that this
          information is made publicly available.
        </p>
        <p id='2d6c7a49-bde0-4759-b827-cf83d20ab079' className=''>
          Information stored includes, but is not limited to, the unique content
          address on the Hypercore protocol, time content was deposited into the
          Hypergraph Vault, and copies of all files that you shared while the
          Hypergraph Vault is enabled, including each file&#x27;s history (i.e.,
          prior versions).
        </p>
        <p id='a9739539-8fe1-4380-9e31-e764624ac239' className=''>
          You agree that by disabling the Hypergraph Vault, any content shared
          while the Hypergraph Vault was enabled, will remain part of the
          Hypergraph Vault indefinitely.
        </p>
        <p id='111af43a-846c-4489-92eb-a79f607acc78' className=''>
          In case we receive a takedown notice (see &quot;Copyright
          violations&quot; section), we may remove public access to the
          respective content from the Hypergraph Vault, in case this takedown is
          considered viable.
        </p>
        <h1 id='98a15e55-d801-4820-adde-d7bdc4a47da3' className=''>
          Jurisdiction
        </h1>
        <p id='2c47bf33-16fd-44c9-bccb-a4760fca0b79' className=''>
          You agree that this agreement with Liberate Science is governed by
          German law.{' '}
        </p>
        <p id='b23d969a-3d81-4ef7-b0f3-c43b4b9f70cf' className=''>
          You agree that legal proceedings against Liberate Science GmbH
          surrounding your use of Hypergraph will be brought and arbitrated in
          German court, in accordance with German law.{' '}
        </p>
      </div>
    </article>
  </Container>
)
