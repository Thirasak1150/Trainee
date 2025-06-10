import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import React from 'react'

const IconTechnomic = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  return (
    <div>
<DotLottieReact
       src="https://lottie.host/2a49c031-6ce1-42fb-ac8c-d174b6ceb62b/epJiXq5CCr.lottie"
    loop
    autoplay
    style={{ width: width ? width : 20, height: height ? height : 20, margin: 'auto' }}
  />
    </div>
    
  )
}

export default IconTechnomic