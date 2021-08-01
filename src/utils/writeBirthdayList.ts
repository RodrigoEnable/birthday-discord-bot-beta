import fs from 'fs'
import path from 'path'

export const writeBirthdayList = (data: string) => {
  try {
    fs.writeFileSync(
      path.resolve(__dirname, '..', 'data', 'birthday.json'),
      JSON.stringify(JSON.parse(data), null, 2)
    )
    return data
  } catch (err) {
    console.log(err)
    return
  }
}
