export const parseDate = (value: string) => {
  const date = value + '/1970'

  const part = date.split('/')

  if (part.length !== 3) {
    return undefined
  }

  const dd = parseInt(part[0])
  const mm = parseInt(part[1])
  const yyyy = parseInt(part[2])

  if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12 && yyyy >= 0 && yyyy <= 9999) {
    return new Date(yyyy, mm - 1, dd).getTime()
  } else {
    return undefined
  }
}
