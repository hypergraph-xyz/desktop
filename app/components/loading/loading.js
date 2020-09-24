import styled from 'styled-components'
import LoadingAnimation from './loading.svg'

const Loading = styled(LoadingAnimation)`
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -30px !important;
  height: 100%;
  width: 60px;
`
export const LoadingFlex = styled.div`
  flex: 1 1 auto;
  position: relative;
`

export default Loading
