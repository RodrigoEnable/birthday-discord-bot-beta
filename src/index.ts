import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

import path from 'path'
import {
  Client,
  Guild,
  Message,
  MessageAttachment,
  MessageEmbed,
  TextChannel,
} from 'discord.js'
import config from '../src/data/config.json'
import { setup, input, output, commands, day, list } from './commands'
import { writeConfig } from './utils/writeConfig'
import { birthdayCheck } from './utils/birthdayCheck'
import { scheduledMessage } from './utils/scheduleMessage'

export const client = new Client()

type Birthday = {
  id: string
  member: string
  tag: string
  date: string
}

client.on('ready', () => {
  const { size: us } = client.users.cache
  const { size: ch } = client.channels.cache
  const { size: se } = client.guilds.cache
  console.log(`I'm ready, ${us} user(s), ${ch} channel(s) and ${se} server(s)`)
  client.user?.setActivity('Happy birthday to you', { type: 'LISTENING' })
})

client.on('guildCreate', (guild: Guild) => {
  if (!guild) {
    return
  }

  const configChannel = {
    guildId: guild.id,
    prefix: '!',
    inputChannel: '',
    outputChannel: '',
  }

  writeConfig(configChannel)

  const bot = guild.me?.id

  if (!bot) {
    return
  }

  const channel = guild.channels.cache
    .filter((channel) => channel.type === 'text')
    .first()

  if (!channel) {
    return
  }

  const permissions = channel.permissionsFor(bot)?.toArray()

  if (!permissions?.includes('SEND_MESSAGES')) {
    return
  }

  const welcomeChannel = channel as TextChannel

  welcomeChannel.send(
    '> :robot: **BirthdayEnable chegou.**\n' +
      '> :gear: Comece por `!setup` e aprenda a me configurar por meio dos comandos `!input` e `!output`.\n' +
      '> :dart: Veja os comandos disponíveis para membros, `!commands`.'
  )
})

async function schelude() {
  const todayBirthday: Birthday[] | undefined = birthdayCheck()

  if (typeof todayBirthday === 'undefined') {
    return
  }

  const { guildId, outputChannel } = config

  if (!guildId) {
    return
  }

  const guild = await client.guilds.fetch(guildId)

  if (!guild) {
    return
  }

  const getAllMembers = await guild.members.fetch().then((members) => members.keyArray())

  if (!getAllMembers) {
    return
  }

  const birthdays = todayBirthday
    .filter((user: Birthday) => {
      return getAllMembers.includes(user.id)
    })
    .map((user: Birthday) => {
      return `> <@${user.id}>`
    })

  if (birthdays.length === 0) {
    return
  }

  const banner = new MessageAttachment(
    path.resolve(__dirname, 'assets', 'pexels-polina-tankilevitch-3905849.jpg'),
    'happyBirthday.jpg'
  )

  const messageLayout = new MessageEmbed()
    .setTitle(':clap: Parabéns!!!')
    .setDescription(
      `Muita saúde, felicidade e paz nesse dia tão especial, que seja um dia maravilhoso esteja você sozinho, com amigos ou familiares.`
    )
    .addField(':heart: Aniversariante(s) de hoje:', birthdays)
    .attachFiles([banner])
    .setImage('attachment://happyBirthday.jpg')
    .setColor('#F38F0C')

  scheduledMessage(guild, outputChannel, messageLayout)
}

setTimeout(() => schelude(), 10000)
setInterval(() => schelude(), 86400000)

client.on('message', (message: Message) => {
  if (!config) {
    return
  }

  const { prefix } = config

  const args = message.content.slice(prefix.length).split(/ +/)
  const command = args.shift()?.toLowerCase()

  const botMessage = message.guild?.me
    ?.permissionsIn(message.channel)
    .has(['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'EMBED_LINKS'])

  if (!botMessage) {
    return
  }

  const bot = client.user

  if (!bot) {
    return
  }

  if (!message.content.startsWith(prefix)) {
    return
  }

  if ([message.author.bot, message.channel.type === 'dm'].includes(true)) {
    return
  }

  const params = {
    bot,
    args,
  }

  if (command === 'setup') {
    setup.execute(message, params)
  }

  if (command === 'input') {
    input.execute(message, params)
  }

  if (command === 'output') {
    output.execute(message, params)
  }

  if (command === 'commands') {
    commands.execute(message, params)
  }

  if (command === 'day') {
    day.execute(message, params)
  }

  if (command === 'list') {
    list.execute(message, params)
  }
})

const token = process.env.BOT_TOKEN
client.login(token)
