import { CSSProperties } from 'react'

interface MrcChartProps {
  mrc: string
  title?: string
  allowDownload?: boolean
  height?: CSSProperties['height']
}

interface FtpBarProps {
  maxDuration: number
  duration: number
  ftp: number
  maxFtp: number
}

const zoneColors = ['grey', '#338cff', '#59bf59', 'yellow', 'orange', 'red']

const zoneColor = (ftp: number) => {
  let color = zoneColors[0]
  if (ftp >= 118) {
    color = zoneColors[5]
  } else if (ftp >= 105) {
    color = zoneColors[4]
  } else if (ftp >= 90) {
    color = zoneColors[3]
  } else if (ftp >= 76) {
    color = zoneColors[2]
  } else if (ftp >= 60) {
    color = zoneColors[1]
  }

  return color
}

export const FtpBar = ({ ftp, maxFtp, duration, maxDuration }: FtpBarProps) => {
  const color = zoneColor(ftp)
  return (
    <div
      title={`${ftp}% FTP`}
      style={{
        flex: duration / maxDuration,
        borderRadius: '10px',
        backgroundColor: color,
        height: (ftp / maxFtp) * 100 + '%',
      }}
    />
  )
}

export const MrcChart = ({
  title = `bycycling-${new Date().toLocaleDateString()}`,
  mrc,
  allowDownload = false,
  height = '400px',
}: MrcChartProps) => {
  const courseData: [number, number][] = mrc
    .split('\n')
    .slice(7, mrc.split('\n').length - 1)
    .map((v) => {
      const r = v.split('\t')
      return [Number(r[0]), Number(r[1])]
    })

  const seriesData: [number, number][] = []
  const zoneDuration = [0, 0, 0, 0, 0, 0]
  for (let i = 0; i < courseData.length - 2; i += 2) {
    const start = courseData[i][0]
    const end = courseData[i + 1][0]
    const ftp = courseData[i][1]
    const duration = end - start
    seriesData.push([duration, ftp])
    if (ftp >= 118) {
      zoneDuration[5] += duration
    } else if (ftp >= 105) {
      zoneDuration[4] += duration
    } else if (ftp >= 90) {
      zoneDuration[3] += duration
    } else if (ftp >= 76) {
      zoneDuration[2] += duration
    } else if (ftp >= 60) {
      zoneDuration[1] += duration
    } else {
      zoneDuration[0] += duration
    }
  }

  const maxDuration = seriesData.reduce((v, s) => v + s[0], 0)
  const maxFtp = Math.max(...seriesData.map((s) => s[1]))
  const avgFtp = seriesData.reduce((v, s) => v + s[1] * s[0], 0) / maxDuration

  const download = () => {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(mrc))
    element.setAttribute('download', `${title}.mrc`)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  }

  return (
    <div style={{ position: 'relative', height, display: 'flex', flexDirection: 'column' }}>
      <div className="font-bold text-lg">{title}</div>
      {allowDownload && (
        <button
          className={`py-2 sm:py-1 bg-primary-500 px-2 rounded-md font-medium text-white`}
          style={{ position: 'absolute', right: 0, top: 0 }}
          onClick={download}
          title="Download as MRC"
        >
          <span role="img" aria-label="download">
            💾
          </span>
        </button>
      )}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'end',
          gap: '0.1%',
          marginBottom: '1rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {seriesData.map((s, i) => (
          <FtpBar key={i} ftp={s[1]} maxFtp={maxFtp} duration={s[0]} maxDuration={maxDuration} />
        ))}
      </div>
      <p>Zone Distribution</p>
      <div style={{ display: 'flex' }}>
        {zoneDuration.map((z, i) => (
          <div
            style={{
              backgroundColor: zoneColors[i],
              flex: z,
              textAlign: 'center',
              color: 'black',
              paddingLeft: 2,
              paddingRight: 2,
            }}
            key={i}
            title={`Duration: ${z}min`}
          >
            {Math.round((z / maxDuration) * 100)}%
          </div>
        ))}
      </div>
      <p className="mt-4">
        Duration: {maxDuration}min, IF: {Math.round(avgFtp) / 100}
      </p>
    </div>
  )
}
