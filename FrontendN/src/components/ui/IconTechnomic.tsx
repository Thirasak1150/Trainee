import { DotLottieReact } from '@lottiefiles/dotlottie-react'


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
       src="https://lottie.host/688d5d2b-bd82-48ba-af9c-0cdf1979e947/KLqUvs9Y8v.lottie"
    loop
    autoplay
    style={{ width: width ? width : 20, height: height ? height : 20, margin: 'auto' }}
  />
    </div>
    
  )
}

export default IconTechnomic