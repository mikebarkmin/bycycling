import { MrcChart } from '@/components/MrcChart'
import PageTitle from '@/components/PageTitle'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { wozToMrc } from '@/lib/woz-to-mrc'
import { ChangeEventHandler, useEffect, useState } from 'react'

export default function WozToMrc() {
  const [woz, setWoz] = useState(`20min from 30 to 70% FTP
10min @ 90% FTP
5min free ride
3x 30sec 120% FTP,
1min 80% FTP
10min from 70 to 30% FTP`)
  const [mrc, setMrc] = useState('')
  const [state, setState] = useState<'default' | 'error'>('default')
  const [title, setTitle] = useState('Late Sprints')

  useEffect(() => {
    try {
      setMrc(wozToMrc(woz, title))
      setState('default')
    } catch (e) {
      setState('error')
    }
  }, [woz, title])

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setWoz(e.target.value)
  }
  return (
    <>
      <PageSEO title={`Tools - ${siteMetadata.author}`} description={siteMetadata.description} />
      <div>
        <header className="pt-6 xl:pb-6">
          <div>
            <PageTitle>MRC Workout Creator</PageTitle>
          </div>
        </header>
        <p>
          This tools converts a simple definition of a workout to a MRC file, which you can use in
          various applications, like{' '}
          <a className="hover:text-primary-500" href="https://rouvy.com">
            Rouvy
          </a>
          . You can define different types of blocks, which are compatible with{' '}
          <a className="hover:text-primary-500" href="https://whatsonzwift.com">
            whatsonzwift.com
          </a>
          .
        </p>
        <p>
          <b>Steady:</b> <code>20sec @ 90% FTP</code>
        </p>
        <p>
          <b>Ramp:</b> <code>20min 30sec from 30 to 70% FTP</code>
        </p>
        <p>
          <b>Interval:</b> <code>3x 5min @ 95% FTP, 5min @ 86% FTP</code>
        </p>
        <p>
          <b>Free Ride:</b> <code>20min free ride</code>
        </p>
        {mrc && (
          <div className="my-2">
            <MrcChart mrc={mrc} allowDownload={true} title={title} />
          </div>
        )}
        {state === 'error' && <p className="text-red-500">The input has an error</p>}
        <input
          className="px-4 py-2 my-2 border rounded text-gray-800 w-full bg-white"
          placeholder="Name of the workout"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="h-96 px-4 py-2 my-2 border rounded text-gray-800 bg-white w-full"
          value={woz}
          onChange={handleChange}
        />
      </div>
    </>
  )
}
