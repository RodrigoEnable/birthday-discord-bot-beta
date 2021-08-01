import path from 'path'
import config from '../data/config.json'
import { ClientUser, Message, MessageAttachment, MessageEmbed } from 'discord.js'
import { client } from '../index'
import { writeConfig } from '../utils/writeConfig'
import { readBirthdayList } from '../utils/readBirthdayList'
import { writeBirthdayList } from '../utils/writeBirthdayList'
import { parseDate } from '../utils/parseDate'

type Birthday = {
  id: string
  member: string
  tag: string
  date: string
  ms: number
}

type Params = {
  bot: ClientUser
  args: string[] | number[]
}

type Command = {
  name: string
  description: string
  cooldown?: number
  execute(message: Message, params: Params): void
}

const cooldown = new Set()

export const setup: Command = {
  name: 'setup',
  description: 'Configure your bot',
  execute(message, params) {
    if (!message.member?.hasPermission('ADMINISTRATOR')) {
      return message.reply('você precisa ser administrador para me configurar')
    }

    const avatar = params.bot.displayAvatarURL()
    const messageLayout = new MessageEmbed()
      .setThumbnail(avatar)
      .setTitle(':tools: Configuração')
      .setDescription(
        ':tada: Se organizar direitinho todo mundo comemora, abaixo o passo a passo da configuração'
      )
      .addField(
        ':one: Etapa 1',
        '`Crie um canal ou escolha um já existente para que os membros adicionem a data de aniversário (ex: #meu-aniversario)`'
      )
      .addField(
        ':two: Etapa 2',
        '`Utilize o comando !input e escolha o canal (ex: !input #meu-aniversario)`'
      )
      .addField(
        ':three: Etapa 3',
        '`Crie um canal ou escolha um já existente para as notificações de aniversário (ex: #parabens-pra-voce)`'
      )
      .addField(
        ':four: Etapa 4',
        '`Utilize o comando !output e escolha o canal (ex: !output #parabens-pra-voce)`'
      )
      .addField(
        ':arrow_lower_right: Observação',
        '`• Por padrão as notificações de aniversário serão enviadas para o canal de mensagens do sistema, caso ele exista`\n' +
          '`• Você pode escolher um único canal para ambas as atividades (registros e notificações de aniversário)`\n' +
          '`• Caso o canal de mensagens do sistema não exista ou não seja configurado um canal para as notificações de aniversário, elas não serão enviadas`\n' +
          '`• Mantenha as permissões que o bot pede ao ser adicionado e garanta que o canal permita o bot enviar as notificações de aniversário, caso contrário elas não serão enviadas`'
      )
      .addField(
        ':calendar: E Pronto! Do restante eu cuido!',
        '`Agora a sua comunidade pode trocar parabéns`'
      )
      .setColor('#3B88C3')

    return message.reply(messageLayout)
  },
}

export const input: Command = {
  name: 'input',
  description: 'Choice input channel',
  async execute(message, params) {
    if (!message.member?.hasPermission('ADMINISTRATOR')) {
      return message.reply('você precisa ser administrador para me configurar')
    }

    const avatar = params.bot.displayAvatarURL()
    const messageLayoutError = new MessageEmbed()
      .setThumbnail(avatar)
      .setTitle(':tools: Escolha do canal de entrada')
      .setDescription(`:x: Ups, algo está errado, possíveis causas abaixo`)
      .addField('Causa 1', '`Não foi marcado um canal`')
      .addField('Causa 2', '`O canal não existe`')
      .addField('Causa 3', '`O canal existe, mas não foi marcado com a hashtag (#)`')
      .addField(
        'Observação',
        '`Para marcar um canal é necessário digitar a hashtag e escolher o canal de interesse na lista, o formato final do comando é !input #nome-do-canal`'
      )
      .setColor('#D72E43')

    if (!params.args || params.args.length !== 1) {
      return message.reply(messageLayoutError)
    }

    const [value] = params.args
    const channel = String(value)

    const channelCheck = RegExp(/^[<#].*[>]$/gim)
    if (!channelCheck.test(channel)) {
      return message.reply(messageLayoutError)
    }

    const input = channel.replace(/<|#|>/g, ' ').trim()

    if (!config) {
      return
    }

    const { guildId, prefix, outputChannel } = config

    const configChannel = {
      guildId,
      prefix,
      inputChannel: input,
      outputChannel: outputChannel ? outputChannel : '',
    }

    writeConfig(configChannel)

    const messageLayoutSuccess = new MessageEmbed()
      .setThumbnail(avatar)
      .setTitle(':tools: Escolha do canal de entrada')
      .setDescription(`:white_check_mark: O canal foi adicionado com sucesso`)
      .addField(
        'Observação',
        '`Caso deseje alterar o canal futuramente basta repetir o processo`'
      )
      .setColor('#77B255')

    return message.reply(messageLayoutSuccess)
  },
}

export const output: Command = {
  name: 'output',
  description: 'Choice output channel',
  execute(message, params) {
    if (!message.member?.hasPermission('ADMINISTRATOR')) {
      return message.reply('você precisa ser administrador para me configurar')
    }

    const avatar = params.bot.displayAvatarURL()
    const messageLayoutError = new MessageEmbed()
      .setThumbnail(avatar)
      .setTitle(':tools: Escolha do canal de saída')
      .setDescription(`:x: Ups, algo está errado, possíveis causas abaixo`)
      .addField('Causa 1', '`Não foi marcado um canal`')
      .addField('Causa 2', '`O canal não existe`')
      .addField('Causa 3', '`O canal existe, mas não foi marcado com a hashtag (#)`')
      .addField(
        'Observação',
        '`Para marcar um canal é necessário digitar a hashtag e escolher o canal de interesse na lista, o formato final do comando é !input #nome-do-canal`'
      )
      .setColor('#D72E43')

    if (!params.args || params.args.length !== 1) {
      return message.reply(messageLayoutError)
    }

    const [value] = params.args
    const channel = String(value)

    const channelCheck = RegExp(/^[<#].*[>]$/gim)
    if (!channelCheck.test(channel)) {
      return message.reply(messageLayoutError)
    }

    const output = channel.replace(/<|#|>/g, ' ').trim()

    if (!config) {
      return
    }

    const { guildId, prefix, inputChannel } = config

    const configChannel = {
      guildId,
      prefix,
      inputChannel: inputChannel ? inputChannel : '',
      outputChannel: output,
    }

    writeConfig(configChannel)

    const messageLayoutSuccess = new MessageEmbed()
      .setThumbnail(avatar)
      .setTitle(':tools: Escolha do canal de saída')
      .setDescription(`:white_check_mark: O canal foi adicionado com sucesso`)
      .addField(
        'Observação',
        '`Caso deseje alterar o canal futuramente basta repetir o processo`'
      )
      .setColor('#77B255')

    return message.reply(messageLayoutSuccess)
  },
}

export const commands: Command = {
  name: 'commands',
  description: 'All user commands',
  execute(message, params) {
    const avatar = params.bot.displayAvatarURL()
    const messageLayout = new MessageEmbed()
      .setThumbnail(avatar)
      .setTitle(':tools: Comandos')
      .setDescription(
        ':calendar: Compartilhe com a comunidade o dia do seu aniversário para que possamos comemorar juntos'
      )
      .addField('!day DD/MM', '`Para cadastrar a data de aniversário (ex: !day 11/03)`')
      .addField('!list', '`Para ver a lista com todos os aniversariantes da comunidade`')
      .setColor('#F38F0C')

    return message.reply(messageLayout)
  },
}

export const day: Command = {
  name: 'day',
  description: 'Register your birthday',
  execute(message, params) {
    if (!params.args || params.args.length !== 1) {
      return message.reply(
        'a data de aniversário deve ser registrada no seguinte formato: `!day DD/MM` (ex: !day 11/03)'
      )
    }

    const [value] = params.args
    const date = String(value)

    const dateCheck = RegExp(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))$/)
    if (config.inputChannel && message.channel.id != config.inputChannel) {
      return message.reply(
        `para registrar o seu aniversário envie a mensagem no canal <#${config.inputChannel}> :heart:`
      )
    }
    if (dateCheck.test(date)) {
      const newBirthday = {
        id: message.author.id,
        member: message.author.username,
        tag: '#' + message.author.tag.split('#')[1],
        date: date,
        ms: parseDate(date),
      }
      const birthdayList = readBirthdayList()
      try {
        if (typeof birthdayList === 'undefined') {
          const birthdayListUpdate = JSON.stringify({ users: [newBirthday] })
          writeBirthdayList(birthdayListUpdate)
          return message.reply(
            `obrigado, uma data tão especial será sempre lembrada por nós :heart:`
          )
        }
        const birthdayCheck = birthdayList.users.filter((user: Birthday) => {
          return user.id === newBirthday.id
        })
        if (birthdayCheck.length > 0) {
          return message.reply(
            `já temos a sua data de aniversário, você já cadastrou :heart:`
          )
        }
        const birthdayListUpdate = JSON.stringify({
          users: [...birthdayList.users, newBirthday],
        })
        writeBirthdayList(birthdayListUpdate)
        message.reply(
          `obrigado, uma data tão especial será sempre lembrada por nós :heart:`
        )
      } catch (err) {
        message.reply(`desculpe, ocorreu um erro no cadastro, tente mais tarde`)
      }
    } else {
      message.reply(
        'a data de aniversário deve ser registrada no seguinte formato: `!day DD/MM` (ex: !day 11/03)'
      )
    }
  },
}

export const list: Command = {
  name: 'list',
  description: 'All birthdays',
  cooldown: 120,
  async execute(message, params) {
    const cd = this.cooldown ?? 10

    if (cooldown.has(message.author.id)) {
      return message.reply(
        `por favor, aguarde ${cd / 60} minuto(s) para utilizar novamente esse comando`
      )
    }

    cooldown.add(message.author.id)

    setTimeout(() => {
      cooldown.delete(message.author.id)
    }, 1000 * cd)

    try {
      const birthdayList = readBirthdayList()

      if (!birthdayList) {
        return message.reply(
          'ainda não foram cadastrados aniversários, aproveite e seja o primeiro :heart:'
        )
      }

      const { guildId } = config

      const guild = await client.guilds.fetch(guildId)

      const getAllMembers = await guild.members
        .fetch()
        .then((members) => members.keyArray())
        .catch((err) => console.log(err))

      if (!getAllMembers) {
        return
      }

      const birthdays = birthdayList.users
        .sort((x: Birthday, y: Birthday) => x.ms - y.ms)
        .filter((user: Birthday) => {
          return getAllMembers.includes(user.id)
        })
        .map((user: Birthday) => {
          const member = guild.members.cache.get(user.id)
          return `> ${member?.user.username} :birthday: \`${user.date}\``
        })

      const image = new MessageAttachment(
        path.resolve(__dirname, '..', 'assets', 'pexels-sam-lion-5732443.jpg'),
        'birthdayList.jpg'
      )

      const avatar = params.bot.displayAvatarURL()
      const messageLayout = new MessageEmbed()
        .setTitle(':date: Listagem dos aniversários')
        .setThumbnail(avatar)
        .setDescription(
          'Segue abaixo todos os aniversariantes presentes na comunidade, comemore com cada um deles quando chegar o dia'
        )
        .attachFiles([image])
        .setImage('attachment://birthdayList.jpg')
        .setColor('#F4ABBA')
        .setFooter('Cadastre o seu aniversário, digite !commands')

      const totalFields = birthdays.length
      const lines = 10

      const birthdayArrays = new Array(Math.ceil(totalFields / lines))
        .fill('')
        .map(() => {
          return birthdays.splice(0, lines)
        }, birthdays.slice())

      birthdayArrays.map((birthdayArray) => {
        messageLayout.addField('⁝', birthdayArray)
      })

      message.channel.send(messageLayout)
    } catch (err) {
      message.reply(
        'desculpe, ocorreu um erro para listar os aniversariantes, tente mais tarde'
      )
    }
  },
}
