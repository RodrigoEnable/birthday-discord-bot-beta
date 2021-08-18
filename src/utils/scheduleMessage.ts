import { Guild, MessageEmbed, PermissionResolvable } from 'discord.js'
import cron from 'cron'

export const scheduledMessage = (
  guild: Guild,
  outputChannel: string,
  message: MessageEmbed
) => {
  new cron.CronJob('00 50 19 * * *', () => {
    const bot = guild.me?.id

    if (!bot) {
      return
    }

    const systemChannelMsg = guild.systemChannelID
      ? guild.channels.cache.get(guild.systemChannelID)
      : undefined

    const outputChannelMsg = outputChannel
      ? guild.channels.cache.get(outputChannel)
      : undefined

    const permissions: PermissionResolvable = [
      'VIEW_CHANNEL',
      'SEND_MESSAGES',
      'READ_MESSAGE_HISTORY',
      'EMBED_LINKS',
      'MENTION_EVERYONE',
    ]

    if (
      outputChannelMsg?.isText() &&
      outputChannelMsg.permissionsFor(bot)?.has(permissions)
    ) {
      outputChannelMsg.send(`**Hoje é um dia especial @everyone**`)
      outputChannelMsg.send(message)
      return
    } else if (
      systemChannelMsg?.isText() &&
      systemChannelMsg.permissionsFor(bot)?.has(permissions)
    ) {
      systemChannelMsg.send(`**Hoje é um dia especial @everyone**`)
      systemChannelMsg.send(message)
      return
    } else {
      return
    }
  }).start()
}
