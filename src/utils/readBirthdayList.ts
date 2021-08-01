import fs from 'fs'
import path from 'path'

export const readBirthdayList = () => {
  try {
    const file = fs.readFileSync(
      path.resolve(__dirname, '..', 'data', 'birthday.json'),
      'utf8'
    )

    if (!file) {
      return undefined
    }

    return JSON.parse(file)
  } catch (err) {
    console.log(err)
    return
  }
}
