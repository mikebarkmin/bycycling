import { wozToMrc } from '@/lib/woz-to-mrc'
import { MrcChart } from './MrcChart'

interface WozChartProps {
  woz: string
  title?: string
  allowDownload?: boolean
}

export const WozChart = ({ woz, title, allowDownload }: WozChartProps) => {
  return <MrcChart mrc={wozToMrc(woz)} title={title} allowDownload={allowDownload} />
}
