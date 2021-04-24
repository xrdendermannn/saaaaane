const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
const http = require("http");
const db = require("quick.db");
const moment = require("moment");
const express = require("express");
const ayarlar = require("./ayarlar.json");
const app = express();
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);
const log = message => {
  console.log(` ${message}`);
};
require("./util/eventLoader.js")(client);


var prefix = ayarlar.prefix;

//-------------Bot Eklenince Bir Kanala Mesaj Gönderme Komutu ---------------\\

const emmmmbed = new Discord.MessageEmbed()
  .setThumbnail()
  .setImage(
    "https://cdn.discordapp.com/attachments/826147560511111218/826365047252582440/standard.gif"
  )
  .addField(
    `| Teşekkürler`,
    `**Selamlar, Ben XRD-EnDeRmAn (XRD-EnDeRmAn Bot'un Geliştiricisi) Öncelikle Botumuzu Eklediğiniz ve Bize Destek Olduğunuz İçin Sizlere Teşekkürlerimi Sunarım**`
  )
  .addField(
    `| Prefix`,
    `**ZeZe 2.5 Botun Prefixi(ön eki) = \`z!\`\n\n Değiştirebilmek için \`z!prefix\` Yazabilirsiniz.**`
  )
  .addField(
    `ZeZe 2.5| Nasıl Kullanılır?`,
    `**ZeZe 2.5tüm özelliklerinden yararlanabilmek için sadece \`z!yardım\` yazmanız yeterlidir.**`
  )
  .addField(
    ` Linkler`,
    `**Sohbet Kanalına z!davet Yazmanız Yeterlidir**`
  )
  .setFooter(`ZeZe 2.5| Gelişmiş Türkçe Bot | 2021`)
  .setTimestamp();

client.on("guildCreate", guild => {
  let defaultChannel = "";
  guild.channels.cache.forEach(channel => {
    if (channel.type == "text" && defaultChannel == "") {
      if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  });

  defaultChannel.send(emmmmbed);
});

//----------------------------------------------------------------\\

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

client.on("guildMemberRemove", async member => {
  const channel = db.fetch(`sayaçKanal_${member.guild.id}`);
  if (db.has(`sayacsayı_${member.guild.id}`) == false) return;
  if (db.has(`sayaçKanal_${member.guild.id}`) == false) return;

  member.guild.channels.cache
    .get(channel)
    .send(
      `📤 **${member.user.tag}** Sunucudan ayrıldı! \`${db.fetch(
        `sayacsayı_${member.guild.id}`
      )}\` üye olmamıza son \`${db.fetch(`sayacsayı_${member.guild.id}`) -
        member.guild.memberCount}\` üye kaldı!`
    );
});
client.on("guildMemberAdd", async member => {
  const channel = db.fetch(`sayaçKanal_${member.guild.id}`);
  if (db.has(`sayacsayı_${member.guild.id}`) == false) return;
  if (db.has(`sayaçKanal_${member.guild.id}`) == false) return;

  member.guild.channels.cache
    .get(channel)
    .send(
      `📥 **${member.user.tag}** Sunucuya Katıldı! \`${db.fetch(
        `sayacsayı_${member.guild.id}`
      )}\` üye olmamıza son \`${db.fetch(`sayacsayı_${member.guild.id}`) -
        member.guild.memberCount}\` üye kaldı!`
    );
});



//otorol
client.on("guildMemberAdd", async (member, message) => {
  let rol = db.fetch(`otorol_${member.guild.id}`);
  let kanal = db.fetch(`otorollog_${member.guild.id}`);

  if (!rol) return;
  if (member.user.bot) {}
  member.roles.add(rol);
  const mesaj = new Discord.MessageEmbed()
    .setAuthor(client.user.username, client.user.avatarURL())
    .setDescription(
      `${member} Adlı Kullanıcıya  <@&${rol}> Verdim`
    );
  client.channels.cache.get(kanal).send(mesaj);
});

///////////////////////////////////SA-AS

client.on("message", async msg => {
  const i = await db.fetch(`ssaass_${msg.guild.id}`);
  if (i == "acik") {
    if (
      msg.content.toLowerCase() == "s.a",
      msg.content.toLowerCase() == "selamun aleyküm",
      msg.content.toLowerCase() == "sea",
      msg.content.toLowerCase() == "selam",
      msg.content.toLowerCase() == "slm",
      msg.content.toLowerCase() == "sa"
    ) {
      try {
        return msg.reply(
          "**Aleyküm Selam Hoşgeldin** 👻"
        );
      } catch (err) {
        console.log(err);
      }
    }
  } else if (i == "kapali") {
  }
  if (!i) return;
});

//////////////afk

const { DiscordAPIError } = require("discord.js");

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.content.includes(`afk`)) return;

  if (await db.fetch(`afk_${message.author.id}`)) {
    db.delete(`afk_${message.author.id}`);
    db.delete(`afk_süre_${message.author.id}`);

    const embed = new Discord.MessageEmbed()

      .setColor("GREEN")
      .setAuthor(message.author.username, message.author.avatarURL)
      .setDescription(`${message.author.username} Artık \`AFK\` Değilsin. <a:uzgun:829397561298255902>`);

    message.channel.send(embed);
  }

  var USER = message.mentions.users.first();
  if (!USER) return;
  var REASON = await db.fetch(`afk_${USER.id}`);

  if (REASON) {
    let süre = await db.fetch(`afk_süre_${USER.id}`);

    const afk = new Discord.MessageEmbed()

      .setColor("GOLD")
      .setDescription(
        `**BU KULLANICI AFK**\n\n**Afk Olan Kullanıcı :** \`${USER.tag}\`\n\n**Sebep :** \`${REASON}\``
      );

    message.channel.send(afk);
  }
});

/////////////////////////////////

client.on("guildDelete", guild => {
  let Crewembed = new Discord.MessageEmbed()

    .setColor("RED")
    .setTitle(" ATILDIM !")
    .addField("Sunucu Adı:", guild.name)
    .addField("Sunucu sahibi", guild.owner)
    .addField("Sunucudaki Kişi Sayısı:", guild.memberCount);

  client.channels.cache.get("832885920457162782").send(Crewembed);
});

client.on("guildCreate", guild => {
  let Crewembed = new Discord.MessageEmbed()

    .setColor("GREEN")
    .setTitle("EKLENDİM !")
    .addField("Sunucu Adı:", guild.name)
    .addField("Sunucu sahibi", guild.owner)
    .addField("Sunucudaki Kişi Sayısı:", guild.memberCount);

  client.channels.cache.get("832885862307594240").send(Crewembed);
});

//reklam
client.on('message', async message => {
  
let aktif = await db.fetch(`reklamEngelcodework_${message.channel.id}`)
if (!aktif) return 
  
let reklamlar = ["discord.app", "discord.gg" ,"discordapp","discordgg", ".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", ".party", ".rf.gd", ".az", ".cf", ".me", ".in", ".info", ".tr",]
let kelimeler = message.content.slice(" ").split(/ +/g)

if (reklamlar.some(word => message.content.toLowerCase().includes(word))) {
  
if (message.member.hasPermission("BAN_MEMBERS")) return; message.delete()
  
message.reply('Reklamları engelliyorum!').then(msg => msg.delete(7000)) 
}
});

client.on("messageUpdate", async (oldMsg, newMsg) => {
  
let aktif = await db.fetch(`reklamEngelcodework_${oldMsg.channel.id}`)
if(!aktif) return
  
let reklamlar = ["discord.app", "discord.gg","discordapp","discordgg", ".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", ".party", ".rf.gd", ".az", ".cf", ".me", ".in", ".info",".tr",]
let kelimeler = newMsg.content.slice(" ").split(/ +/g)

if (reklamlar.some(word => newMsg.content.toLowerCase().includes(word))) {
  
if (newMsg.member.hasPermission("BAN_MEMBERS")) return; newMsg.delete()
  
oldMsg.reply('Reklamları engelliyorum!').then(msg => msg.delete(7000)) 
}
});
////////////////////KÜFÜR

client.on("message", async msg => {
 const i = await db.fetch(`${msg.guild.id}.kufur`)
    if (i) {
        const kufur = ["A+Q","a+Q","a+q", "oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "mal", "sik", "yarrak", "am", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "ak", "amq",];
        if (kufur.some(word => msg.content.includes(word))) {
          try {
            if (!msg.member.permissions.has("BAN_MEMBERS")) {
                  msg.delete();
                          
                      return msg.reply('Heey! Küfür Yasak.').then(nordx => nordx.delete({timeout: 5000}))
            }              
          } catch(err) {
            console.log(err);
          }
        }
    }
    if (!i) return;
});

client.on("messageUpdate", async msg => {
 const i = db.fetch(`${msg.guild.id}.kufur`)
    if (i) {
        const kufur = ["oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "mal", "sik", "yarrak", "am", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "ak", "amq",];
        if (kufur.some(word => msg.content.includes(word))) {
          try {
            if (!msg.member.permissions.has("BAN_MEMBERS")) {
                  msg.delete();
                          
                      return msg.reply('Yakaladım Seni! Küfür Yasak.').then(nordx => nordx.delete({timeout: 1}))
            }              
          } catch(err) {
            console.log(err);
          }
        }
    }
    if (!i) return;
});



//caps engell
client.on("message", async msg => {
  if (msg.channel.type === "dm") return;
  if (msg.author.bot) return;
  if (msg.content.length > 1) {
    if (db.fetch(`capslock_${msg.guild.id}`)) {
      let caps = msg.content.toUpperCase();
      if (msg.content == caps) {
        if (!msg.member.permissions.has("ADMINISTRATOR")) {
          if (!msg.mentions.users.first()) {
            msg.delete();
            return msg.channel.send(`${msg.member}, Capslock Kapat Lütfen!`).then(nordx => nordx.delete({timeout: 5000}))
              
          }
        }
      }
    }
  }
});








//ever-here-engell
client.on("message", async msg => {
  
   var dcs = db.fetch(`dcsengel_${msg.guild.id}`);
    if (dcs== "acik") {
      const dcskelime = ["here", "@everyone"];
      if (dcskelime.some(dcss => msg.content.includes(dcss))) {
  if(!msg.member.hasPermission("ADMINISTRATOR")){
        msg.reply("Bildirim Atmayı Kes!")
        msg.delete()
      }}}
})












//////////////////////////MODLOG///////////////////
client.on("messageDelete", async message => {
  if (message.author.bot || message.channel.type == "dm") return;

  let log = message.guild.channels.cache.get(
    await db.fetch(`log_${message.guild.id}`)
  );

  if (!log) return;

  const embed = new Discord.MessageEmbed()

    .setTitle(message.author.username + " | Mesaj Silindi")

    .addField("Kullanıcı: ", message.author)

    .addField("Kanal: ", message.channel)

    .addField("Mesaj: ", "" + message.content + "");

  log.send(embed);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  let modlog = await db.fetch(`log_${oldMessage.guild.id}`);

  if (!modlog) return;

  let embed = new Discord.MessageEmbed()

    .setAuthor(oldMessage.author.username, oldMessage.author.avatarURL())

    .addField("**Eylem**", "Mesaj Düzenleme")

    .addField(
      "**Mesajın sahibi**",
      `<@${oldMessage.author.id}> === **${oldMessage.author.id}**`
    )

    .addField("**Eski Mesajı**", `${oldMessage.content}`)

    .addField("**Yeni Mesajı**", `${newMessage.content}`)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${oldMessage.guild.name} - ${oldMessage.guild.id}`,
      oldMessage.guild.iconURL()
    )

    .setThumbnail(oldMessage.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("channelCreate", async channel => {
  let modlog = await db.fetch(`log_${channel.guild.id}`);

  if (!modlog) return;

  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_CREATE" })
    .then(audit => audit.entries.first());

  let kanal;

  if (channel.type === "text") kanal = `<#${channel.id}>`;

  if (channel.type === "voice") kanal = `\`${channel.name}\``;

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Kanal Oluşturma")

    .addField("**Kanalı Oluşturan Kişi**", `<@${entry.executor.id}>`)

    .addField("**Oluşturduğu Kanal**", `${kanal}`)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${channel.guild.name} - ${channel.guild.id}`,
      channel.guild.iconURL()
    )

    .setThumbnail(channel.guild.iconUR);

  client.channels.cache.get(modlog).send(embed);
});

client.on("channelDelete", async channel => {
  let modlog = await db.fetch(`log_${channel.guild.id}`);

  if (!modlog) return;

  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_DELETE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Kanal Silme")

    .addField("**Kanalı Silen Kişi**", `<@${entry.executor.id}>`)

    .addField("**Silinen Kanal**", `\`${channel.name}\``)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${channel.guild.name} - ${channel.guild.id}`,
      channel.guild.iconURL()
    )

    .setThumbnail(channel.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("roleCreate", async role => {
  let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;

  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_CREATE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Rol Oluşturma")

    .addField("**Rolü oluşturan kişi**", `<@${entry.executor.id}>`)

    .addField("**Oluşturulan rol**", `\`${role.name}\` **=** \`${role.id}\``)

    .setTimestamp()

    .setFooter(
      `Sunucu: ${role.guild.name} - ${role.guild.id}`,
      role.guild.iconURL
    )

    .setColor("RANDOM")

    .setThumbnail(role.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("roleDelete", async role => {
  let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;

  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_DELETE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Rol Silme")

    .addField("**Rolü silen kişi**", `<@${entry.executor.id}>`)

    .addField("**Silinen rol**", `\`${role.name}\` **=** \`${role.id}\``)

    .setTimestamp()

    .setFooter(
      `Sunucu: ${role.guild.name} - ${role.guild.id}`,
      role.guild.iconURL
    )

    .setColor("RANDOM")

    .setThumbnail(role.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("emojiCreate", async emoji => {
  let modlog = await db.fetch(`log_${emoji.guild.id}`);

  if (!modlog) return;

  const entry = await emoji.guild
    .fetchAuditLogs({ type: "EMOJI_CREATE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Emoji Oluşturma")

    .addField("**Emojiyi oluşturan kişi**", `<@${entry.executor.id}>`)

    .addField("**Oluşturulan emoji**", `${emoji} - İsmi: \`${emoji.name}\``)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`,
      emoji.guild.iconURL
    )

    .setThumbnail(emoji.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("emojiDelete", async emoji => {
  let modlog = await db.fetch(`log_${emoji.guild.id}`);

  if (!modlog) return;

  const entry = await emoji.guild
    .fetchAuditLogs({ type: "EMOJI_DELETE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Emoji Silme")

    .addField("**Emojiyi silen kişi**", `<@${entry.executor.id}>`)

    .addField("**Silinen emoji**", `${emoji}`)

    .setTimestamp()

    .setFooter(
      `Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`,
      emoji.guild.iconURL
    )

    .setColor("RANDOM")

    .setThumbnail(emoji.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("emojiUpdate", async (oldEmoji, newEmoji) => {
  let modlog = await db.fetch(`log_${oldEmoji.guild.id}`);

  if (!modlog) return;

  const entry = await oldEmoji.guild
    .fetchAuditLogs({ type: "EMOJI_UPDATE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Emoji Güncelleme")

    .addField("**Emojiyi güncelleyen kişi**", `<@${entry.executor.id}>`)

    .addField(
      "**Güncellenmeden önceki emoji**",
      `${oldEmoji} - İsmi: \`${oldEmoji.name}\``
    )

    .addField(
      "**Güncellendikten sonraki emoji**",
      `${newEmoji} - İsmi: \`${newEmoji.name}\``
    )

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${oldEmoji.guild.name} - ${oldEmoji.guild.id}`,
      oldEmoji.guild.iconURL
    )

    .setThumbnail(oldEmoji.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("guildBanAdd", async (guild, user) => {
  let modlog = await db.fetch(`log_${guild.id}`);

  if (!modlog) return;

  const entry = await guild
    .fetchAuditLogs({ type: "MEMBER_BAN_ADD" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Yasaklama")

    .addField("**Kullanıcıyı yasaklayan yetkili**", `<@${entry.executor.id}>`)

    .addField("**Yasaklanan kullanıcı**", `**${user.tag}** - ${user.id}`)

    .addField("**Yasaklanma sebebi**", `${entry.reason}`)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

    .setThumbnail(guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("guildBanRemove", async (guild, user) => {
  let modlog = await db.fetch(`log_${guild.id}`);

  if (!modlog) return;

  const entry = await guild
    .fetchAuditLogs({ type: "MEMBER_BAN_REMOVE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Yasak kaldırma")

    .addField("**Yasağı kaldıran yetkili**", `<@${entry.executor.id}>`)

    .addField("**Yasağı kaldırılan kullanıcı**", `**${user.tag}** - ${user.id}`)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

    .setThumbnail(guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

//////////////////////////////MODLOG///////////////////////////


//////////////////////////////OTOROL

client.on("guildMemberAdd", member => {
  let rol = db.fetch(`autoRole_${member.guild.id}`);
  if (!rol) return;
  let kanal = db.fetch(`autoRoleChannel_${member.guild.id}`);
  if (!kanal) return;

  member.roles.add(member.guild.roles.cache.get(rol));
  let embed = new Discord.MessageEmbed()
    .setDescription(
      ">**Sunucuya yeni katılan** **" +
        member.user.username +
        "** **Kullanıcısına** <@&" +
        rol +
        "> **Rolü verildi**>"
    )
    .setColor("RANDOM"); //.setFooter(`<@member.id>`)
  member.guild.channels.cache.get(kanal).send(embed);
});

//////////////////////////////////////////////////

//seskanalbaglanma
client.on("ready", async () => {
  let botVoiceChannel = client.channels.cache.get("829399334420217896");
  console.log("Bot Ses Kanalına bağlandı!");
  if (botVoiceChannel)
    botVoiceChannel
      .join()
      .catch(err => console.error("Bot ses kanalına bağlanamadı!"));
});


///////////////////////////////




//resimli hb bb
  client.on("guildMemberRemove", async member => {
  
    if (db.has(`gçkanal_${member.guild.id}`) === false) return;
    var canvaskanal = member.guild.channels.cache.get(db.fetch(`gçkanal_${member.guild.id}`));
    if (!canvaskanal) return;
  
    const request = require("node-superfetch");
    const Canvas = require("canvas"),
      Image = Canvas.Image,
      Font = Canvas.Font,
      path = require("path");
  
    var randomMsg = ["Sunucudan Ayrıldı."];
    var randomMsg_integer =
      randomMsg[Math.floor(Math.random() * randomMsg.length)];
  
    let msj = await db.fetch(`cikisM_${member.guild.id}`);
    if (!msj) msj = `{uye}, ${randomMsg_integer}`;
  
    const canvas = Canvas.createCanvas(640, 360);
    const ctx = canvas.getContext("2d");
  
    const background = await Canvas.loadImage(
      "https://i.hizliresim.com/Wrn1XW.jpg"
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  
    ctx.strokeStyle = "#74037b";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = `#D3D3D3`;
    ctx.font = `37px "Warsaw"`;
    ctx.textAlign = "center";
    ctx.fillText(`${member.user.username}`, 300, 342);
  
    let avatarURL = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
    const { body } = await request.get(avatarURL);
    const avatar = await Canvas.loadImage(body);
  
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
    ctx.clip();
    ctx.drawImage(avatar, 250, 55, 110, 110);
  
    const attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "ro-BOT-güle-güle.png"
    );
  
      canvaskanal.send(attachment);
      canvaskanal.send(
        msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
      );
      if (member.user.bot)
        return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
    
  });
  
  client.on("guildMemberAdd", async member => {
    if (db.has(`gçkanal_${member.guild.id}`) === false) return;
    var canvaskanal = member.guild.channels.cache.get(db.fetch(`gçkanal_${member.guild.id}`));
  
    if (!canvaskanal || canvaskanal ===  undefined) return;
    const request = require("node-superfetch");
    const Canvas = require("canvas"),
      Image = Canvas.Image,
      Font = Canvas.Font,
      path = require("path");
  
    var randomMsg = ["Sunucuya Katıldı."];
    var randomMsg_integer =
      randomMsg[Math.floor(Math.random() * randomMsg.length)];
  
    let paket = await db.fetch(`pakets_${member.id}`);
    let msj = await db.fetch(`cikisM_${member.guild.id}`);
    if (!msj) msj = `{uye}, ${randomMsg_integer}`;
  
    const canvas = Canvas.createCanvas(640, 360);
    const ctx = canvas.getContext("2d");
  
    const background = await Canvas.loadImage(
      "https://i.hizliresim.com/UyVZ4f.jpg"
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  
    ctx.strokeStyle = "#74037b";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = `#D3D3D3`;
    ctx.font = `37px "Warsaw"`;
    ctx.textAlign = "center";
    ctx.fillText(`${member.user.username}`, 300, 342);
  
    let avatarURL = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) ;
    const { body } = await request.get(avatarURL);
    const avatar = await Canvas.loadImage(body);
  
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
    ctx.clip();
    ctx.drawImage(avatar, 250, 55, 110, 110);
  
    const attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "ro-BOT-hosgeldin.png"
    );
  
    canvaskanal.send(attachment);
    canvaskanal.send(
      msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
    );
    if (member.user.bot)
      return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
  });

//prefix
client.on("message", async message => {

  if (message.author.bot) return;

  if (!message.guild) return;

  let prefix = db.get(`prefix_${message.guild.id}`);

  if (prefix === null) prefix = prefix;

  if (!message.content.startsWith(prefix)) return;

  if (!message.member)

  message.member = await message.guild.fetchMember(message);

  const args = message.content

    .slice(prefix.length)

    .trim()

    .split(/ +/g);

  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;
  
  let command = client.commands.get(cmd);

  if (!command) command = client.commands.get(client.aliases.get(cmd));

  if (command) command.run(client, message, args);

});



//yapicmimietiketleme
client.on('message', message => {
 if (message.content.toLowerCase() === '<@792419247397666857>') {
 message.delete()
 message.reply("**Yapımcımı Etiketleme**").then(codework => codework.delete({timeout: 5000}));
 
}
});




//bot-ekleyice-random-kanala-mesaj
client.on("guildCreate", guild => {
  let kanal = guild.channels.cache.filter(c => c.type === "text").random();

  kanal.send(
    "Selam , Beni Eklediğiniz İçin Teşekkür Ederim. Size En İyi Şekilde Hizmet Edeceğim."
  );
});




//ready

const bot = new Discord.Client();

var oyun = [
`⚡️ Kayıt Sistemi Ekledni | z!kayıt-yardım`,
`⚡️ Sponsorum | 🌐trdiscord.com I fivemtrserverler.com`,
`✨ Yardım almak için | z!yardım`,
`🔔 Yenilenen Tasarımı İle`,
`⚡️ Botu eklemek için | z!davet`,
`🌟 Prefix ayarlamak için | z!prefix`,
]
  
client.on("ready", () => {
setInterval(function() {

         var random = Math.floor(Math.random()*(oyun.length-0+1)+0);
         client.user.setActivity(oyun[random], {"type": "PLAYING"});

        }, 2 * 5000);
});






//-----------------Etiket Prefix-----------------\\






/// OTOROL SİSTEMİ
client.on("guildMemberAdd", async member => {

  let kanal = await db.fetch(`otorolkanal_${member.guild.id}`);
  let rol = await db.fetch(`otorolrol_${member.guild.id}`);

  if (!kanal) return;
  if (!rol) return;

  let user = client.users.cache.get(member.id);

  client.channels.cache.get(kanal).send(
  new Discord.MessageEmbed()
  .setColor("BLUE")
  .setTitle(`${client.user.username} | **Oto Rol Sistemi**`)
  .setTimestamp()
  .setThumbnail(user.avatarURL({ dynamic: true, format: "png", size: 1024 }))
  .setDescription(`Sunucuya Hoşgeldin **${member}** **${rol} adlı rolun verıldı (${member.user.tag})`))
  
  member.roles.add(rol)
});






client.on('message', message => {
 if (message.content.toLowerCase() === '<@792419247397666857>') {
 message.delete()
 message.reply("**Yapımcımı Etiketleme**").then(codework => codework.delete({timeout: 5000}));
 
}
});



//prefix

client.on("message", async message => {

  if (message.author.bot) return;

  if (!message.guild) return;

  let prefix = db.get(`prefix_${message.guild.id}`);

  if (prefix === null) prefix = prefix;

  if (!message.content.startsWith(prefix)) return;

  if (!message.member)

  message.member = await message.guild.fetchMember(message);

  const args = message.content

    .slice(prefix.length)

    .trim()

    .split(/ +/g);

  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;
  
  let command = client.commands.get(cmd);

  if (!command) command = client.commands.get(client.aliases.get(cmd));

  if (command) command.run(client, message, args);

});

//resimli hgbb



  client.on("guildMemberAdd", async member => {
  const Discord = require('discord.js')
  const Canvas = require('canvas')
  const db = require('quick.db')

   const canvas = Canvas.createCanvas(640, 360);
  const rctx = canvas.getContext('2d');
  const background = await Canvas.loadImage(`
 https://cdn.discordapp.com/attachments/832252656205955113/832253724176547900/devhg.png`);

 
  rctx.drawImage(background, 0, 0, canvas.width, canvas.height); 
  rctx.font = '38px Sans-serif';
    rctx.fillStyle = '#ffffff';
    rctx.fillText(`${member.user.username}` , 200, 255);
rctx.font = '36px Sans-serif';
    rctx.fillStyle = '#ffffff';
    rctx.fillText(`#${member.guild.memberCount}. Kişi!` , 15, 75);
rctx.font = '35px Helvetica';
    rctx.fillStyle = '#000000';
    rctx.fillText(`DevilsCode` , 30, 30);
            
  rctx.beginPath()
  rctx.arc(310, 125, 85, 0, Math.PI * 2, true)
  rctx.closePath();
  rctx.clip();

  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: "jpg" }))
    rctx.drawImage(avatar, 210, 25, 200, 200);
  
  
 const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'devilscode-hg.png');
  const kanal = db.fetch(`devcanvas_${member.guild.id}`)
  var rzm = member.guild.channels.cache.get(kanal)
  if(!rzm) return;
  rzm.send(attachment)
})


client.on("guildMemberRemove", async member => {
  const Discord = require('discord.js')
  const Canvas = require('canvas')
  const db = require('quick.db')

   const canvas = Canvas.createCanvas(640, 360);
    const rctx = canvas.getContext('2d');
  const background = await Canvas.loadImage(`
 https://cdn.discordapp.com/attachments/832252656205955113/832253730296430592/devbb.png`);

rctx.strokeStyle = "#f0f0f0";
rctx.strokeRect(0, 0, canvas.width, canvas.height);
  rctx.drawImage(background, 0, 0, canvas.width, canvas.height); 
  rctx.font = '38px Sans-serif';
    rctx.fillStyle = '#ffffff';
    rctx.fillText(`${member.user.username}` , 200, 255);
rctx.font = '32px Sans-serif';
    rctx.fillStyle = '#ffffff';
    rctx.fillText(`#${member.guild.memberCount} Kişi kaldık!` , 9, 75);
rctx.font = '35px Helvetica';
    rctx.fillStyle = '#000000';
    rctx.fillText(`ZeZe 2.5` , 30, 30);
            
  rctx.beginPath()
  rctx.arc(310, 125, 85, 0, Math.PI * 2, true)
  rctx.closePath();
  rctx.clip();

  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: "jpg" }))
    rctx.drawImage(avatar, 210, 25, 200, 200);
  
 const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'devilscode-bb.png');
  const kanal = db.fetch(`devcanvas_${member.guild.id}`)
  var rzm = member.guild.channels.cache.get(kanal)
  if(!rzm) return;
  rzm.send(attachment)
})


//mute
client.on('roleDelete', async role => {
    const data = await require('quick.db').fetch(`xen-mute.${role.guild.id}`);
    if(data && data === role.id) require('quick.db').delete(`xen-mute.${role.guild.id}`); 
    });



//BOT EKTIKET MSJ


client.on("message", async message =>  {
if(message.author.bot) return
if(message.content === `<@!${client.user.id}>` || message.content === `<@${client.user.id}>`) {
let prefix = db.fetch("prefix."+message.guild.id) || ayarlar.prefix

const xen = new Discord.MessageEmbed()
.setTitle('Galiba Prefiximi Merak Etdin '+message.author.username)
.setDescription(`z! Prefixim`)
.setColor('BLUE')
.setThumbnail(message.author.avatarURL({dynamic: true}))
message.channel.send(xen)

}  

})



 

//level-sisttemi

client.on("message", message => {
  if(!message.guild) return;
  //--\\
  var gereken = db.fetch(`gerekli_${message.guild.id}`)
  if(!gereken){ var gereken = 9 }
  //--\\
  var eklenecek = db.fetch(`eklenecek_${message.guild.id}`)
  if(!eklenecek){ var eklenecek = 3 }
  //--\\
  var sınır = db.fetch(`sınır_${message.author.id + message.guild.id}`)
  if(!sınır){ var sınır = 250 }
  //--\\
  var xp = db.fetch(`xp_${message.author.id + message.guild.id}`)
  //--\\
  var seviye = db.fetch(`seviye_${message.author.id + message.guild.id}`)
  if(!seviye){ var seviye = 1 }
  //--\\
  if(message.author.bot || message.content < gereken) return;
  db.add(`xp_${message.author.id + message.guild.id}`, eklenecek)
  if(xp > sınır){
    db.delete(`xp_${message.author.id + message.guild.id}`)
    db.add(`sınır_${message.author.id + message.guild.id}`, 250)
    db.add(`seviye_${message.author.id + message.guild.id}`, 1)
  //--\\
  var log = db.fetch(`seviyelog_${message.guild.id}`)
  var logcuk = message.guild.channels.cache.get(log)
  if(!logcuk) return;
  //--\\
  logcuk.send(`${message.author} **${seviye + 1}** seviyesine ulaştı! Tebrikler ${message.author}`)
  }
})





//mod-log-2

client.on("messageDelete", async message => {
  let a = await db.fetch(`modlog_${message.guild.id}`)
  if (a) {
    const codamey2 = new Discord.MessageEmbed()
    .setTitle('Mesaj Silindi')
    .setDescription(` **${message.author.tag}** a ait **${message.content}** adlı mesajı silindi`)
    .setTimestamp()
    client.channels.cache.get(a).send(codamey2)
  }
})
client.on("channelDelete", async channel => {
  let a = await db.fetch(`modlog_${channel.guild.id}`)
  if (a) {
    const codamey2 = new Discord.MessageEmbed()
    .setTitle('Kanal Silindi')
    .setDescription(`**${channel.name}** Adlı Kanal Silindi!`)
    .setTimestamp()
    client.channels.cache.get(a).send(codamey2)
  }
})
client.on("channelCreate", async channel => {
  let a = await db.fetch(`modlog_${channel.guild.id}`)
  if (a) {
    const codamey2 = new Discord.MessageEmbed()
    .setTitle('Kanal Oluşturuldu')
    .setDescription(`**${channel.name}** Adlı Kanal Oluşturuldu!`)
    .setTimestamp()
    client.channels.cache.get(a).send(codamey2)
  }
})



//muzik

const { Player } = require("discord-player");
const player = new Player(client);
client.player = player;
client.player
.on('trackStart', (message, track) => message.channel.send(`Now playing ${track.title}`))

// Send a message when something is added to the queue
.on('trackAdd', (message, queue, track) => message.channel.send(`${track.title} has been added to the queue!`))
.on('playlistAdd', (message, queue, playlist) => message.channel.send(`${playlist.title} has been added to the queue (${playlist.tracks.length} songs)!`))

// Send messages to format search results
.on('searchResults', (message, query, tracks) => {

    const embed = new Discord.MessageEmbed()
    .setAuthor(`Here are your search results for ${query}!`)
    .setDescription(tracks.map((t, i) => `${i}. ${t.title}`))
    .setFooter('Send the number of the song you want to play!')
	.setColor('ORANGE')
    message.channel.send(embed);

})
.on('searchInvalidResponse', (message, query, tracks, content, collector) => {

    if (content === 'cancel') {
        collector.stop()
        return message.channel.send('Search cancelled!')
    }

    message.channel.send(`You must send a valid number between 1 and ${tracks.length}!`)

})
.on('searchCancel', (message, query, tracks) => message.channel.send('You did not provide a valid response... Please send the command again!'))
.on('noResults', (message, query) => message.channel.send(`No results found on YouTube for ${query}!`))

// Send a message when the music is stopped
.on('queueEnd', (message, queue) => message.channel.send('Music stopped as there is no more music in the queue!'))
.on('channelEmpty', (message, queue) => message.channel.send('Music stopped as there is no more member in the voice channel!'))
.on('botDisconnect', (message) => message.channel.send('Music stopped as I have been disconnected from the channel!'))

// Error handling
.on('error', (error, message) => {
    switch(error){
        case 'NotPlaying':
            message.channel.send('There is no music being played on this server!')
            break;
        case 'NotConnected':
            message.channel.send('You are not connected in any voice channel!')
            break;
        case 'UnableToJoin':
            message.channel.send('I am not able to join your voice channel, please check my permissions!')
            break;
        case 'LiveVideo':
            message.channel.send('YouTube lives are not supported!')
            break;
        case 'VideoUnavailable':
            message.channel.send('This YouTube video is not available!');
            break;
        default:
            message.channel.send(`Something went wrong... Error: ${error}`)
    }
})















































client.login(process.env.token);
