//@ts-check
const Discord = require("discord.js")
const { findMemberInEvent } = require("../util")
const lang = require("../../lang/lang.js").prefixed("cmd.stats.")
const hugrecords = require("../../database/records/hugrecords"),
    Action = hugrecords.Action

const DELETE_AFTER = 1000 * 10

/**
 * 
 * @param {Discord.Message} event 
 * @param {Discord.GuildMember} member 
 */
async function showHugStatsFor(event, member) {
    const hugsReceived = await hugrecords.getTotalActions(event.guild.id, member.id, false, Action.HUG, true)
    const self = event.author.id === member.id
    if (hugsReceived == 0) {
        const message = await event.channel.send(lang(self ? "self-never" : "never-hugged", "user", event.author.toString(), "found", member.displayName))
        if (message instanceof Discord.Message && message.deletable) message.delete(DELETE_AFTER)
        return
    }
    const hugs = hugsReceived + " hug" + (hugsReceived == 1 ? "" : "s")

    /**@type {Discord.Message|Discord.Message[]} */
    let message;
    if (self)
        message = await event.channel.send(lang("self-received", "user", event.author.toString(), "hugs", hugs))
    else message = await event.channel.send(lang("other-received", "user", event.author.toString(), "hugs", hugs, "found", member.displayName))

    if (message instanceof Discord.Message && message.deletable) message.delete(DELETE_AFTER)
}

module.exports = {
    cmd: "hugs",
    /**
     * @param {Discord.Message} message
     * @param {Array<string>} args
     */
    async call(message, args) {
        if (message.deletable)
            message.delete()
        if (args.length == 0) {
            let member = message.member
            if (!member) member = await message.guild.fetchMember(message.author)
            showHugStatsFor(message, member);
        } else {
            const targetting = args.join(" ")
            const member = await findMemberInEvent(message, args)
            if (member)
                showHugStatsFor(message, member)
            else message.channel.send(
                lang("nofind", "user", message.author.toString(), "finding", targetting)
            );
        }
    }
}