const fs = require("fs");
const gm = require('gm');
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const json = require('json-object').setup(global);
const download = require('image-downloader');
const roundTo = require('round-to');
const async = require('async');
const urlencode = require('urlencode');

var config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
const options = {
  url: 'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/1001.png',
  dest: 'C:/jeff/Kennen-bot/photos'
}


const discord_token = config.discord_token;
const prefix = config.prefix;
const bot_controller = config.bot_controller;
const champion_gg_token = config.champion_gg_token;
const lol_api = config.lol_api;
const urlinfo = "http://api.champion.gg/v2/champions?limit=200&champData=hashes,firstitems,summoners,skills,finalitemshashfixed,masterieshash&api_key=" + champion_gg_token;
const urlchampid = "https://na1.api.riotgames.com/lol/static-data/v3/champions?locale=en_US&dataById=false&api_key=" + lol_api;
const urlitems = "https://na1.api.riotgames.com/lol/static-data/v3/items?locale=en_US&api_key=" + lol_api;
const urlitempicture = "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/";
const urlsummonerid = "https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/";
const urllivematch = "https://na1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/";
const urlgetchamp = "http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json";
const urlgetmastery = "https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/";
const urlgetrank = "https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/";
const urlrunes = "http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/rune.json";
const urlmasteries = "http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/mastery.json";
const urlsummonermastery = "https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/";

var queuearray = {
  '0': 'Custom',
  '8': 'Normal 3v3',
  '2': 'Normal 5v5 Blind Pick',
  '14': 'Normal 5v5 Draft Pick',
  '4': 'Ranked Solo 5v5',
  '6': 'Ranked Premade 5v5',
  '41': 'Ranked 3v3',
  '42': 'Ranked Team 5v5',
  '16': 'Dominion 5v5 Blind Pick',
  '17': 'Dominion 5v5 Draft Pick',
  '25': 'Dominion Coop vs Al',
  '31': 'Coop vs Al Into Bot',
  '32': 'Coop vs Al Beginner Bot',
  '61': 'Teambuilder',
  '65': 'ARAM',
  '70': 'One for All',
  '76': 'URF',
  '318': 'All Random URF',
  '325': 'All Random Games',
  '400': 'Normal 5v5 Draft Pick',
  '410': 'Ranked 5v5 Draft Pick',
  '420': 'Ranked Solo',
  '430': 'Normal Blind Pick',
  '440': 'Ranked Flex',
  '600': 'Blood Hunt Assassin',
  '610': 'Dark Star'
};
var mapname = {
  '1': `Summoner's Rift`,
  '2': `Summoner's Rift Autumn`,
  '3': 'Proving Grounds',
  '4': 'Twisted Treeline',
  '8': 'The Crystal Scar',
  '10': 'Twisted Treeline',
  '11': `Summoner's Rift`,
  '12': 'Howling Abyss',
  '14': `Butcher's Bridge`,
  '16': 'Cosmic Ruins'
};

var keystonemastery = {
  '6161': `Warlord's Bloodlust`,
  '6162': 'Fervor of Battle',
  '6164': 'Deathfire Touch',
  '6361': `Stormraider's Surge`,
  '6362': `Thunderlord's Decree`,
  '6363': `Windspeaker's Blessing`,
  '6261': 'Grasp of the Undying',
  '6262': 'Courage of the Colossus',
  '6263': 'Bond of Stone'
}

client.login(discord_token);

client.on('message', function(message) {
  const member = message.member;
  const mess = message.content.toLowerCase();
  const args = message.content.split(' ').slice(1).join(" ");
  const argstwo = message.content.split(' ').slice(1);
  const userchannel = message.channel;

  if (mess.startsWith(prefix + "info")) {
    getinfo();
  } else if (mess.startsWith(prefix + "build")) {
    getchampionID(argstwo[0], function(err, champid) {
      if (err) {
        message.reply(err);
      } else {
        console.log(champid);
        getbuild(champid, argstwo, function(err, championggobject) {
          if (err) {
            message.reply(err);
          } else {
            printbuild(message, args, championggobject);
          }
        });
      }
    });
  } else if (mess.startsWith(prefix + "bestkennen")) {
    message.reply("Hieverybod");
  } else if (mess.startsWith(prefix + "testimage")) {
    message.channel.send({
      embed: {
        color: 3447003,
        title: "This is the build from champion.gg",
        url: "http://www.champion.gg",
        fields: [{
          name: "Starting Items",
          value: "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/1001.png",
          image: "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/1001.png"
        }]
      }
    });
  } else if (mess.startsWith(prefix + "match")) {
    getsummonerid(args, function(err, summonerobject) {
      if (err) {
        message.reply(err);
      } else {
        console.log(args);
        getlivematch(summonerobject, function(err, livematchobject) {
          if (err) {
            message.reply(err);
          } else {
            //console.log(livematchobject);
            matchinfo(livematchobject, summonerobject, function(err, matchobject, summonerobject) {
              if (err) {
                message.reply(err);
              } else {
                console.log(matchobject);
                console.log(summonerobject);
                matchmessage(message, matchobject, summonerobject);
              }
            });
          }
        });
      }
    });
  } else if (mess.startsWith(prefix + 'help')) {
    const embed = new Discord.RichEmbed()
      .setTitle('Commands for Kennen-bot')
      .setColor(12717994)
      .addField("** -build **", "Type -build championname role \n**Examples:** -build kennen -build ezreal adc.\nThis command will return builds from champion.gg")
      .addField("** -match **", "Type -match summonername \n**Examples:** -match hieverybod\nThis will return the current match they are in and info about it\nOnly works for games in NA")

    message.channel.send({
      embed
    });

  } else if (mess.startsWith(prefix + 'test')) {
    console.log(args);
    message.reply(args);
  }
});



client.on('ready', function() {
  console.log('I am ready');
});



function getbuild(champid, argstwo, cb) {
  //console.log(champid);
  console.log('success');
  var champrole = argstwo.slice(1).join('_').toUpperCase();
  if (champrole == 'ADC' || champrole == 'DUOCARRY') {
    champrole = 'DUO_CARRY';
  } else if (champrole == 'DUOSUPPORT' || champrole == 'SUPPORT') {
    champrole = 'DUO_SUPPORT';
  } else if (champrole == 'MID') {
    champrole = 'MIDDLE';
  }
  console.log(champrole);
  request(urlinfo, function(error, response, body) {
    requesterror(urlinfo, response.statusCode, function(err) {
      if (err) {
        cb(err);
      } else {
        var importedJSON = JSON.parse(body);
        var championobject = {};
        var notfound = true;
        if (champrole == "") {
          for (var key in importedJSON) {
            if (importedJSON[key].championId == champid) {
              championobject = importedJSON[key];
              notfound = false;
              break;
            }
          }
        } else {
          for (var key in importedJSON) {
            if (importedJSON[key].championId == champid && importedJSON[key].role == champrole) {
              championobject = importedJSON[key];
              notfound = false;
              break;
            }
          }
        }
        if (notfound) {
          cb('can not find build for that role!');
        } else {
          var finalitemshigh = championobject.hashes.finalitemshashfixed.highestCount;
          var finalitemswin = championobject.hashes.finalitemshashfixed.highestWinrate;
          var startingitemshigh = championobject.hashes.firstitemshash.highestCount;
          var startingitemswin = championobject.hashes.firstitemshash.highestWinrate;
          var highmasteries = championobject.hashes.masterieshash.highestCount;
          var winmasteries = championobject.hashes.masterieshash.highestWinrate;
          var highskill = championobject.hashes.skillorderhash.highestCount;
          var winskill = championobject.hashes.skillorderhash.highestWinrate;
          var championggobject = {
            finalitemshighgames: finalitemshigh.count,
            finalitemshighwinrate: finalitemshigh.winrate,
            finalitemswingames: finalitemswin.count,
            finalitemswinwinrate: finalitemswin.winrate,
            startingitemshighgames: startingitemshigh.count,
            startingitemshighwinrate: startingitemshigh.winrate,
            startingitemswingames: startingitemswin.count,
            startingitemswinwinrate: startingitemswin.winrate,
            role: championobject.role,
            highmasteries: highmasteries,
            winmasteries: winmasteries,
            highskill: highskill,
            winskill: winskill,
            winrate: championobject.winRate,
            playrate: championobject.playRate,
            gamesplayed: championobject.gamesPlayed,
            percentroleplayed: championobject.percentRolePlayed,
            banrate: championobject.banRate
          }
          console.log('success');
          saveitemphotos(finalitemshigh, finalitemswin, startingitemshigh, startingitemswin, function() {
            cb(false, championggobject);
          });
        }
      }
    });
  });
}

function getchampionID(championname, cb) {
  request(urlchampid, function(error, response, body) {
    requesterror(urlchampid, response.statusCode, function(err) {
      if (err) {
        cb(err);
      } else {
        var importedJSON = JSON.parse(body);
        championname = championname.toLowerCase();
        championname = championname.charAt(0).toUpperCase() + championname.slice(1);
        if (championname == "Wukong") {
          data = 62;
        } else if (championname == "Missfortune" || championname == "Miss fortune" || championname == "Ms. fortune") {
          data = 21;
        } else if (championname == "Drmundo" || championname == "Dr mundo") {
          data = 36;
        } else if (championname == "Twistedfate" || championname == "Twisted fate") {
          data = 4;
        } else if (championname == "Masteryi" || championname == "Master yi") {
          data = 11;
        } else if (championname == "Tahmkench" || championname == "Tahm kench") {
          data = 223;
        } else if (championname == "Xinzhao" || championname == "Xin zhao") {
          data = 5;
        } else if (championname == "Aurelionsol" || championname == "Aurelion sol") {
          data = 136;
        } else if (championname == "Leesin" || championname == "Lee sin") {
          data = 64;
        } else if (championname == "Reksai" || championname == "Rek'sai") {
          data = 421;
        } else if (championname == "Jarvaniv" || championname == "Jarvan iv") {
          data = 59;
        } else if (championname == "Kogmaw" || championname == "Kog'maw") {
          data = 96;
        } else {
          try {
            var data = importedJSON.data[championname].id;
          } catch (err) {
            cb('Type a real champion name!');
            return;
          }
        }
        cb(false, data);
      }
    });
  });
}

function getsummonerid(summoner, cb) {
  request(urlsummonerid + urlencode(summoner) + "?api_key=" + lol_api, function(error, response, body) {
    requesterror(urlsummonerid, response.statusCode, function(err) {
      if (err) {
        cb(err);
      } else {
        var importedJSON = JSON.parse(body);
        var summonerid = importedJSON.id;
        var accountlvl = importedJSON.summonerLevel;
        var profileID = importedJSON.profileIconId;
        var summonername = importedJSON.name;
        var summonerobject = {
          "summonerid": summonerid,
          "accountlvl": accountlvl,
          "profileid": profileID,
          "name": summonername
        }
        cb(false, summonerobject);
      }
    });
  });
}

function getlivematch(summonerobject, cb) {
  request(urllivematch + summonerobject.summonerid + "?api_key=" + lol_api, function(error, response, body) {
    if (response.statusCode == 404) {
      cb('summoner not in a match!');
    } else {

      requesterror(urllivematch, response.statusCode, function(err) {
        if (err) {
          cb(err);
        } else {
          console.log("found match, making matchobject");
          var importedJSON = JSON.parse(body);
          var gameid = importedJSON.gameId;
          var gamemode = importedJSON.gameMode;
          var mapid = importedJSON.mapId;
          var gameType = importedJSON.gameType;
          var gametime = importedJSON.gameStartTime;
          var participants = importedJSON.participants;
          var matchobject = {
            "gameid": gameid,
            "gamemode": gamemode,
            "mapid": mapid,
            "gametype": gameType,
            "gametime": gametime,
            "participants": participants,
            "queue": importedJSON.gameQueueConfigId
          }
          cb(false, matchobject);
        }
      });
    }
  });
}

function matchinfo(livematchobject, summonerobject, cb) {
  var placeholder = livematchobject.queue;
  var gametype = queuearray[placeholder];
  placeholder = livematchobject.mapid;
  var map = mapname[placeholder];
  var matchid = livematchobject.gameid;
  var time = livematchobject.gametime;
  var milliseconds = (new Date).getTime();
  time = (time - milliseconds) * -1;
  var second = (time / 1000) % 60 - 0.5;
  var minute = (time / (1000 * 60)) % 60 - 0.5;
  var hour = (time / (1000 * 60 * 60)) - 0.5;
  second = roundTo(second, 0);
  minute = roundTo(minute, 0);
  hour = roundTo(hour, 0);
  if (hour > 100) {
    time = "Loading into";
  } else {
    time = hour + " hours, " + minute + " minutes and " + second + " seconds";
  }

  var players = livematchobject.participants;
  var blueplayers = [];
  var redplayers = [];
  var team;
  for (var i = 0; i < players.length; i++) {
    playerobject = {};
    if (players[i].teamId == 100) {
      playerobject.summonername = players[i].summonerName;
      playerobject.championid = players[i].championId;
      playerobject.summonerid = players[i].summonerId;
      playerobject.runes = players[i].runes;
      playerobject.masteries = players[i].masteries;
      playerobject.team = "BLUE";
      playerobject.mostplayed = false;
      playerobject.masterypoints = 0;
      for (var j = 0; j < players[i].masteries.length; j++) {
        if(players[i].masteries[j].masteryId == 6241){
          playerobject.insight = true;
          break;
        } else {
          playerobject.insight = false;
        }
      }
      blueplayers.push(playerobject);
      if (summonerobject.summonerid == players[i].summonerId) {
        team = 'BLUE';
      }
    } else {
      playerobject.summonername = players[i].summonerName;
      playerobject.championid = players[i].championId;
      playerobject.summonerid = players[i].summonerId;
      playerobject.runes = players[i].runes;
      playerobject.masteries = players[i].masteries;
      playerobject.team = "RED";
      playerobject.mostplayed = false;
      playerobject.masterypoints = 0;
      for (var j = 0; j < players[i].masteries.length; j++) {
        if(players[i].masteries[j].masteryId == 6241){
          playerobject.insight = true;
          break;
        } else {
          playerobject.insight = false;
        }
      }
      redplayers.push(playerobject);
      if (summonerobject.summonerid == players[i].summonerId) {
        team = 'RED';
      }
    }
  }
  matchobject = {
    'gametype': gametype,
    'map': map,
    'time': time,
    'blueplayers': blueplayers,
    'redplayers': redplayers,
    'team': team
  }
  livematchaddchampion(matchobject, function(err, newmatchobject) {
    if (err) {
      cb(err);
    } else {
      cb(false, newmatchobject, summonerobject);
    }

  });
}

function livematchaddchampion(matchobject, cb) {
  request(urlgetchamp, function(error, response, body) {
    requesterror(urlgetchamp, response.statusCode, function(err) {
      if (err) {
        cb(err);
      } else {
        var importedJSON = JSON.parse(body);
        var anothajson = importedJSON.data;
        for (var i = 0; i < matchobject.blueplayers.length; i++) {
          for (var key in anothajson) {
            if (anothajson[key].key == (matchobject.blueplayers[i].championid + "")) {
              matchobject.blueplayers[i].championname = anothajson[key].id;
            } else if (matchobject.blueplayers[i].championid == 141) {
              matchobject.blueplayers[i].championname = "Kayn";
            } else if (matchobject.blueplayers[i].championid == 498) {
              matchobject.blueplayers[i].championname = "Xayah";
            } else if (matchobject.blueplayers[i].championid == 497) {
              matchobject.blueplayers[i].championname = "Rakan";
            } else {
              continue;
            }
          }
        }
        for (var i = 0; i < matchobject.redplayers.length; i++) {
          for (var key in anothajson) {
            if (anothajson[key].key == (matchobject.redplayers[i].championid + "")) {
              matchobject.redplayers[i].championname = anothajson[key].id;
            } else if (matchobject.redplayers[i].championid == 141) {
              matchobject.redplayers[i].championname = "Kayn";
            } else if (matchobject.redplayers[i].championid == 498) {
              matchobject.redplayers[i].championname = "Xayah";
            } else if (matchobject.redplayers[i].championid == 497) {
              matchobject.redplayers[i].championname = "Rakan";
            } else {
              continue;
            }
          }
        }
      }

      livematchaddmastery(matchobject, function(err, newmatchobject) {
        if (err) {
          cb(err);
        } else {
          cb(false, newmatchobject);
        }
      })
    });

  });


}

function livematchaddmastery(matchobject, cb) {
  //console.log(matchobject);
  var teamarray;
  if (matchobject.team == 'RED') {
    teamarray = "blueplayers";
  } else {
    teamarray = "redplayers";
  }
  var loops = 0;
  async.forEachOf(matchobject[teamarray], function(value, l, callback) {
    request(urlgetmastery + matchobject[teamarray][l].summonerid + "?api_key=" + lol_api, function(error, response, body) {
      requesterror(urlgetmastery + matchobject[teamarray][l].summonerid + "?api_key=" + lol_api, response.statusCode, function(err) {
        if (err) {
          cb(err);
        } else {
          var importedJSON = JSON.parse(body);

          if (importedJSON[0].championId == matchobject[teamarray][l].championid) {
            matchobject[teamarray][l].mostplayed = true;
          }
          for (var j = 0; j < 10; j++) {
            if (importedJSON[j].championId == matchobject[teamarray][l].championid) {
              matchobject[teamarray][l].masterypoints = importedJSON[j].championPoints;
              break;
            }
          }
          loops++;
          if (loops == matchobject[teamarray].length) {
            livematchaddrank(matchobject, function(err, newmatchobject) {
              if (err) {
                cb(err);
              } else {
                cb(false, newmatchobject);
              }
            });
          }
          callback();
        }
      });

    });

  });

}


function livematchaddrank(matchobject, cb) {
  var teamarray;
  var otherarray;
  if (matchobject.team == 'RED') {
    teamarray = "blueplayers";
    otherarray = "redplayers";
  } else {
    teamarray = "redplayers";
    otherarray = "blueplayers";
  }
  var loops = 0;
  async.forEachOf(matchobject[teamarray], function(value, l, callback) {

    request(urlgetrank + matchobject[teamarray][l].summonerid + "?api_key=" + lol_api, function(error, response, body) {
      requesterror(urlgetrank + matchobject[teamarray][l].summonerid + "?api_key=" + lol_api, response.statusCode, function(err) {
        if (err) {
          cb(err);
        } else {
          var importedJSON = JSON.parse(body);
          for (var i = 0; i < importedJSON.length; i++) {
            if (matchobject.gametype == 'Ranked Solo' && importedJSON[i].queueType == 'RANKED_SOLO_5x5') {
              matchobject[teamarray][l].tier = importedJSON[i].tier;
              matchobject[teamarray][l].rank = importedJSON[i].rank;
              matchobject[teamarray][l].wins = importedJSON[i].wins;
              matchobject[teamarray][l].losses = importedJSON[i].losses;
              matchobject[teamarray][l].hotStreak = importedJSON[i].hotStreak;
              break;

            } else if (importedJSON[i].queueType == 'RANKED_SOLO_5x5') {
              matchobject[teamarray][l].tier = importedJSON[i].tier;
              matchobject[teamarray][l].rank = importedJSON[i].rank;
              matchobject[teamarray][l].wins = importedJSON[i].wins;
              matchobject[teamarray][l].losses = importedJSON[i].losses;
              matchobject[teamarray][l].hotStreak = importedJSON[i].hotStreak;
            }
          }
          if (matchobject[teamarray][l].tier == undefined) {
            matchobject[teamarray][l].tier = "UNRANKED";
            matchobject[teamarray][l].rank = "";
            matchobject[teamarray][l].wins = 0;
            matchobject[teamarray][l].losses = 1;
            matchobject[teamarray][l].hotStreak = false;
          }
          loops++;
          var loops1 = 0;
          if (loops == matchobject[teamarray].length) {
            teamarray = otherarray;
            async.forEachOf(matchobject[teamarray], function(value, j, callback) {
              request(urlgetrank + matchobject[teamarray][j].summonerid + "?api_key=" + lol_api, function(error, response, body) {
                requesterror(urlgetrank + matchobject[teamarray][j].summonerid + "?api_key=" + lol_api, response.statusCode, function(err) {
                  if (err) {
                    cb(err);
                  } else {
                    var importedJSON = JSON.parse(body);
                    for (var i = 0; i < importedJSON.length; i++) {
                      if (matchobject.gametype == 'Ranked Solo' && importedJSON[i].queueType == 'RANKED_SOLO_5x5') {
                        matchobject[teamarray][j].tier = importedJSON[i].tier;
                        matchobject[teamarray][j].rank = importedJSON[i].rank;
                        matchobject[teamarray][j].wins = importedJSON[i].wins;
                        matchobject[teamarray][j].losses = importedJSON[i].losses;
                        matchobject[teamarray][j].hotStreak = importedJSON[i].hotStreak;
                        break;
                      } else if (importedJSON[i].queueType == 'RANKED_SOLO_5x5') {
                        matchobject[teamarray][j].tier = importedJSON[i].tier;
                        matchobject[teamarray][j].rank = importedJSON[i].rank;
                        matchobject[teamarray][j].wins = importedJSON[i].wins;
                        matchobject[teamarray][j].losses = importedJSON[i].losses;
                        matchobject[teamarray][j].hotStreak = importedJSON[i].hotStreak;
                      }
                    }
                    if (matchobject[teamarray][j].tier == undefined) {
                      matchobject[teamarray][j].tier = "UNRANKED";
                      matchobject[teamarray][j].rank = "";
                      matchobject[teamarray][j].wins = 0;
                      matchobject[teamarray][j].losses = 1;
                      matchobject[teamarray][j].hotStreak = false;
                    }
                    loops1++;
                    if (loops1 == matchobject[teamarray].length) {
                      cb(false, matchobject);
                    }

                    callback();
                  }
                });

              });

            });


          }
          callback();
        }
      });

    });

  });

}

function saveitemphotos(fitems_h, fitems_w, sitems_h, sitems_w, cb) {
  var fitems_h_itemarray = fitems_h.hash.split("-");
  var fitems_w_itemarray = fitems_w.hash.split("-");
  var sitems_h_itemarray = sitems_h.hash.split("-");
  var sitems_w_itemarray = sitems_w.hash.split("-");
  saveImages(fitems_h_itemarray, function() {
    saveImages(fitems_w_itemarray, function() {
      saveImages(sitems_h_itemarray, function() {
        saveImages(sitems_w_itemarray, function() {
          sortimages(fitems_h_itemarray, fitems_w_itemarray, sitems_h_itemarray, sitems_w_itemarray, function() {
            cb();
          });
        });
      });
    });
  });
}

function saveImages(array, cb) {

  var key = 1;
  var max = array.length;
  while (key != max) {
    options.url = 'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/' + array[key] + '.png';

    download.image(options)
      .then(({
        filename,
        image
      }) => {
        console.log('File saved to', filename)
      }).catch((err) => {
        throw err

      })
    key++;
    if (key == max) {
      cb();
    }
  }

}



function sortimages(array1, array2, array3, array4, cb) {
  console.log("started combining images");
  combineimages(array1, 'playratefinal.jpg', function() {
    combineimages(array2, 'winratefinal.jpg', function() {
      combineimages(array3, 'playratestart.jpg', function() {
        combineimages(array4, 'winratestart.jpg', function() {
          cb();
        });
      });
    });
  });



  console.log(array1, array2, array3, array4);
  console.log(array1.length, array2.length, array3.length, array4.length);

}

function combineimages(array, filename, cb) {
  var num = 0
  switch (array.length) {
    case 0:
      gm()
        .in('-page', '+0+0')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
        });
      break;
    case 1:
      gm()
        .in('-page', '+0+0')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
        });
      break;
    case 2:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
        });
      break;
    case 3:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
        });
      break;
    case 4:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .in('-page', '128+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[3] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
        });
      break;
    case 5:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .in('-page', '+128+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[3] + '.png')
        .in('-page', '+192+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[4] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
        });
      break;
    case 6:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .in('-page', '+128+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[3] + '.png')
        .in('-page', '+192+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[4] + '.png')
        .in('-page', '+256+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[5] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
        });
      break;
    case 7:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .in('-page', '+128+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[3] + '.png')
        .in('-page', '+192+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[4] + '.png')
        .in('-page', '+256+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[5] + '.png')
        .in('-page', '+320+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[6] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
        });
  }
}

function test(message) {
  message.channel.send("test");
}

function getrunestring(yourarray, matchobject, summonerobject, cb) {
  var runeobject;
  var rune = "Runes for **" + summonerobject.name + "**:\n";

  for (var i = 0; i < matchobject[yourarray].length; i++) {
    if (matchobject[yourarray][i].summonerid == summonerobject.summonerid) {
      runeobject = matchobject[yourarray][i].runes;
      break;
    }
  }
  request(urlrunes, function(error, response, body) {
    requesterror(urlrunes, response.statusCode, function(err) {
      if (err) {
        cb(err);
      } else {
        var importedJSON = JSON.parse(body);
        var runename = "";
        var runeid = "";
        var runenum = "";
        var key = "";
        console.log(runeobject);
        for (var i = 0; i < runeobject.length; i++) {
          runeid = runeobject[i].runeId;
          runenum = runeobject[i].count;
          key = runeid + "";
          runename = importedJSON.data[key].name;
          rune += "**" + runenum + "x " + runename + "**\n";
        }
        cb(false, rune);
      }
    });

  });
}

function requesterror(url, response, cb) {
  if (response == 200) {
    cb(false);
  } else if (response == 400) {
    cb('400 bad request **' + url + '**');
  } else if (response == 403) {
    cb('403 Forbidden. Invalid api key **' + url + '**');
  } else if (response == 404) {
    cb('404 Not found **' + url + '**');
  } else if (response == 415) {
    cb('415 unsupported Media Type **' + url + '**');
  } else if (response == 429) {
    cb('429 Rate limit exceeded **' + url + '**');
  } else if (response == 500) {
    cb('500 internal server error **' + url + '**');
  } else if (response == 503) {
    cb('503 service unavailable **' + url + '**');
  }
}

function printskillorder(championggobject, cb) {

  var highskillwr = roundTo(championggobject.highskill.winrate * 100, 2);
  var winskillwr = roundTo(championggobject.winskill.winrate * 100, 2);
  var highskill = "Highest Play-Rate Skill Order: \n**" + championggobject.highskill.hash + "** (" + championggobject.highskill.count + " games, winrate: " + highskillwr + "%)";
  var winskill = "Highest Win-Rate Skill Order: \n**" + championggobject.winskill.hash + "** (" + championggobject.winskill.count + " games, winrate: " + winskillwr + "%)";
  var string = highskill + "\n" + winskill + "\n";
  request(urlmasteries, function(error, response, body) {
    requesterror(urlmasteries, response.statusCode, function(err) {
      if (err) {
        cb(err);
      } else {
        var ferocitynum = 0;
        var cunningnum = 0;
        var resolvenum = 0;
        var importedJSON = JSON.parse(body);
        var mastery = championggobject.highmasteries.hash.split('-');
        var ferocityarray = importedJSON.tree.Ferocity;
        var cunningarray = importedJSON.tree.Cunning;
        var resolvearray = importedJSON.tree.Resolve;
        var keystone = "";
        var found = false;
        var message = "";
        for (var i = 0; i < mastery.length; i += 2) {
          found = false;
          for (var a = 0; a < ferocityarray.length; a++) {
            if (!found) {
              for (var b = 0; b < ferocityarray[a].length; b++) {
                if (mastery[i] == ferocityarray[a][b].masteryId) {
                  ferocitynum += parseInt(mastery[i + 1]);
                  found = true;
                  break;
                }
              }
            } else {
              break;
            }
          }
          for (var c = 0; c < cunningarray.length; c++) {
            if (!found) {
              for (var d = 0; d < cunningarray[c].length; d++) {
                if (mastery[i] == cunningarray[c][d].masteryId) {
                  cunningnum += parseInt(mastery[i + 1]);
                  found = true;
                  break;
                }
              }
            } else {
              break;
            }
          }
          for (var e = 0; e < resolvearray.length; e++) {
            if (!found) {
              for (var f = 0; f < resolvearray[e].length; f++) {
                if (mastery[i] == resolvearray[e][f].masteryId) {
                  resolvenum += parseInt(mastery[i + 1]);
                  found = true;
                  break;
                }
              }
            } else {
              break;
            }
          }
          if (keystonemastery[mastery[i]] != undefined) {
            keystone = keystonemastery[mastery[i]];
          }
        }
        message = "Masteries: \n**" + ferocitynum + "-" + cunningnum + "-" + resolvenum + " **KEYSTONE: **" + keystone + "**";
        console.log(keystone);

        string += message;
        cb(false, string);
      }
    });
  });

}

function printbuild(message, args, championggobject) {
  var winrate = roundTo(championggobject.winrate * 100, 2);
  var playrate = roundTo(championggobject.playrate * 100, 2);
  var percentroleplayed = roundTo(championggobject.percentroleplayed * 100, 2);
  var banrate = roundTo(championggobject.banrate * 100, 2);
  message.reply("the builds for **" + args + " **" + "in the **" + championggobject.role + "** lane from champion.gg\n**" + args + "** has a **" + winrate + "%** winrate, **" + playrate + "%** playrate, **" + percentroleplayed + "%** playrate in this lane, and a **" + banrate + "%** banrate.");
  message.channel.send("**Highest Play-Rate Build**" + " (number of games: **" + championggobject.finalitemshighgames + "** , winrate: **" + championggobject.finalitemshighwinrate.toFixed(2) + "**% )", {
    file: 'C:/jeff/Kennen-bot/playratefinal.jpg'
  });
  message.channel.send("**Highest Win-Rate Build**" + " (number of games: **" + championggobject.finalitemswingames + "** , winrate: **" + championggobject.finalitemswinwinrate.toFixed(2) + "**% )", {
    file: 'C:/jeff/Kennen-bot/winratefinal.jpg'
  });

  message.channel.send("**Highest Play-Rate Starting Items**" + " (number of games: **" + championggobject.startingitemshighgames + "** , winrate: **" + championggobject.startingitemshighwinrate.toFixed(2) + "**% )", {
    file: 'C:/jeff/Kennen-bot/playratestart.jpg'
  });
  message.channel.send("**Highest Win-Rate Starting Items**" + " (number of games: **" + championggobject.startingitemswingames + "** , winrate: **" + championggobject.startingitemswinwinrate.toFixed(2) + "**% )", {
    file: 'C:/jeff/Kennen-bot/winratestart.jpg'
  });
  console.log(championggobject);
  printskillorder(championggobject, function(err, string) {
    console.log(string);
    if (err) {
      message.channel.send(err);
    } else {
      message.channel.send(string);
    }
  });

}

function matchmessage(message, matchobject, summonerobject) {
  var teamarray;
  var yourarray;
  if (matchobject.team == 'RED') {
    teamarray = "blueplayers";
    yourarray = "redplayers";
  } else {
    teamarray = "redplayers";
    yourarray = "blueplayers";
  }
  var enemyteam = "";
  var yourteam = "";
  var enemyteam2 = "";
  var yourteam2 = "";
  for (var i = 0; i < matchobject[teamarray].length; i++) {
    var num = matchobject[teamarray][i].wins / (matchobject[teamarray][i].losses + matchobject[teamarray][i].wins);
    var winrate = roundTo(num * 100, 2);
    enemyteam += "**" + matchobject[teamarray][i].summonername + "** - **" + matchobject[teamarray][i].championname + "**\n";
    enemyteam2 += "Rank: **" + matchobject[teamarray][i].tier + " " + matchobject[teamarray][i].rank + " ** - WR: **" + winrate + "%**" + " (" + matchobject[teamarray][i].wins + "W," + matchobject[teamarray][i].losses + "L)\n";
  }
  for (var i = 0; i < matchobject[yourarray].length; i++) {
    var num = matchobject[yourarray][i].wins / (matchobject[yourarray][i].losses + matchobject[yourarray][i].wins);
    var winrate = roundTo(num * 100, 2);
    yourteam += "**" + matchobject[yourarray][i].summonername + "** - **" + matchobject[yourarray][i].championname + "**\n";
    yourteam2 += "Rank: **" + matchobject[yourarray][i].tier + " " + matchobject[yourarray][i].rank + " ** - WR: **" + winrate + "%**" + " (" + matchobject[yourarray][i].wins + "W," + matchobject[yourarray][i].losses + "L)\n";
  }
  var watchout = "";
  var mains = "These players are playing their main: ";
  var mastery = "These players have >50000 mastery points on their champ: ";
  for (var i = 0; i < matchobject[teamarray].length; i++) {
    if (matchobject[teamarray][i].mostplayed) {
      mains += "** " + matchobject[teamarray][i].summonername + " **(**" + matchobject[teamarray][i].championname + "**), ";
    }
    if (matchobject[teamarray][i].masterypoints > 50000) {
      mastery += "** " + matchobject[teamarray][i].summonername + "** (**" + matchobject[teamarray][i].championname + ", " + matchobject[teamarray][i].masterypoints + "pts**), ";
    }
  }

  watchout += mains + "\n" + mastery;

  var highranks = "Diamond or higher:";
  for (var i = 0; i < matchobject[teamarray].length; i++) {
    if (matchobject[teamarray][i].tier == "DIAMOND" || matchobject[teamarray][i].tier == "MASTER" || matchobject[teamarray][i].tier == "CHALLENGER") {
      highranks += "**" + matchobject[teamarray][i].summonername + " **(**" + matchobject[teamarray][i].championname + "**),";
    }

  }
  var insightmastery = "Enemy Players with Insight:";
  for (var i = 0; i < matchobject[teamarray].length; i++) {
    if(matchobject[teamarray][i].insight) {
        insightmastery += " **" + matchobject[teamarray][i].summonername + " (" + matchobject[teamarray][i].championname + ")**,";
    }
  }

  getrunestring(yourarray, matchobject, summonerobject, function(err, runes) {
    if (err) {
      message.channel.send(err);
    } else {
      message.channel.send({
        "embed": {
          "title": "Live Match Info for **" + summonerobject.name + "**",
          "description": matchobject.gametype + " on " + matchobject.map + " **" + matchobject.time + " **in game",
          "color": 12717994,
          "author": {
            "name": summonerobject.name,
            "icon_url": "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + summonerobject.profileid + ".png"
          },
          "fields": [

            {
              "name": "Enemy Team",
              "value": enemyteam,
              "inline": true
            },
            {
              "name": "-",
              "value": enemyteam2,
              "inline": true
            },
            {
              "name": "Your Team",
              "value": yourteam,
              "inline": true
            },
            {
              "name": "-",
              "value": yourteam2,
              "inline": true
            },
            {
              "name": "Enemy Players to Watch",
              "value": watchout + "\n "
            },
            {
              "name": "High Ranked Enemy Players",
              "value": highranks
            },
            {
              "name": "Your Runes",
              "value": runes
            },
            {
              "name": "Insight",
              "value": insightmastery
            }

          ]
        }
      });
    }

  });


}
