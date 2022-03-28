const detectType = (line: string) => {
  if (line.includes('from')) {
    return 'ramp'
  } else {
    return 'steady'
  }
}

const extractNumbers = (s: string): number[] => {
  const r = new RegExp('[0-9]+', 'g')
  const matches = s.matchAll(r)

  return [...matches].map((m) => Number(m))
}

const convertRampToMrc = (line: string, timePerUnit: number): [number, number][] => {
  const n = extractNumbers(line)
  let durationMin = 0

  if (line.includes('min')) {
    durationMin += n.shift()
  }

  if (line.includes('sec')) {
    durationMin += n.shift() / 60
  }

  if (line.includes('rpm')) {
    n.shift()
  }

  const startFtp = n.shift()
  const endFtp = n.shift()

  const units = Math.round(durationMin / timePerUnit)
  const ftpPerUnit = (endFtp - startFtp) / units

  const data: [number, number][] = []

  let time = 0
  let ftp = startFtp

  for (let i = 0; i < units; i++) {
    if (
      (ftpPerUnit > 0 && ftp + ftpPerUnit < endFtp) ||
      (ftpPerUnit < 0 && ftp - ftpPerUnit > endFtp)
    ) {
      data.push([timePerUnit, ftp])
      ftp += ftpPerUnit
      time += timePerUnit
    }
  }
  data.push([durationMin - time, endFtp])
  return data
}

const convertSteadyToMrc = (line: string): [number, number][] => {
  const n = extractNumbers(line)

  let durationMin = 0
  let repeat = 1

  if (line.includes('x')) {
    repeat = n.shift()
    const parts = line.split('x')[1].split(',')
    const lines: [number, number][] = []
    for (let i = 0; i < repeat; i++) {
      parts.forEach((p) => lines.push(...convertSteadyToMrc(p)))
    }
    return lines
  }

  if (line.includes('min')) {
    durationMin += n.shift()
  }

  if (line.includes('sec')) {
    durationMin += n.shift() / 60
  }

  if (line.includes('free ride')) {
    return [[durationMin, 0]]
  }

  if (line.includes('rpm')) {
    n.shift()
  }

  const ftp = n.shift()

  return [[durationMin, ftp]]
}

export const wozToMrc = (
  data: string,
  title = `bycycling-${new Date().toLocaleDateString()}`,
  timePerUnit = 0.5
) => {
  const lines = data.replace(/, /g, ' ').replace(/,\n/g, ',').split('\n')
  const mrcData = lines.flatMap((l) => {
    if (detectType(l) === 'ramp') {
      return convertRampToMrc(l, timePerUnit)
    } else {
      return convertSteadyToMrc(l)
    }
  })
  const courseData = [`0.00\t${mrcData[0][1].toFixed(2)}`]
  let lastMrcData: [number, number] = null
  mrcData.forEach((m) => {
    if (lastMrcData) {
      m[0] += lastMrcData[0]
      courseData.push(`${lastMrcData[0].toFixed(2)}\t${m[1].toFixed(2)}`)
    }
    courseData.push(`${m[0].toFixed(2)}\t${m[1].toFixed(2)}`)
    lastMrcData = m
  })
  courseData.pop()

  return [
    '[COURSE HEADER]',
    'VERSION = 2',
    'UNITS = ENGLISH',
    `FILE NAME = ${title}`,
    'MINUTES PERCENT',
    '[END COURSE HEADER]',
    '[COURSE DATA]',
    ...courseData,
    '[END COURSE DATA]',
  ].join('\n')
}
