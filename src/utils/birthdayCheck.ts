import { readBirthdayList } from './readBirthdayList'

type Birthday = {
  id: string
  member: string
  tag: string
  date: string
}

function formatDate(date: string) {
  let dateFormat = new Date(date)
  let month: number | string = dateFormat.getMonth() + 1
  let dt: number | string = dateFormat.getDate()

  if (dt < 10) {
    dt = '0' + dt
  }

  if (month < 10) {
    month = '0' + month
  }

  return `${dt}/${month}`
}

export const birthdayCheck = () => {
  try {
    const checkDate = readBirthdayList()

    if (!checkDate) {
      return undefined
    }

    const date = new Date()

    const todayBirthday = checkDate.users.filter((user: Birthday) => {
      return user.date === formatDate(String(date))
    })

    if (todayBirthday.length === 0) {
      return undefined
    }

    return todayBirthday
  } catch (err) {
    console.log(err)
    return
  }
}
