import fs from 'fs'
import path from 'path'

type Config = {
  guildId: string
  prefix: string
  inputChannel: string
  outputChannel: string
}

export const writeConfig = (data: Config) => {
  try {
    fs.writeFileSync(
      path.resolve(__dirname, '..', 'data', 'config.json'),
      JSON.stringify(data, null, 2)
    )
    return data
  } catch (err) {
    console.log(err)
    return
  }
}
