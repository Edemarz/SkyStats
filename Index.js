//Declaring Functions;
const SI_SYMBOL = ["", "K", "M", "B", "T", "P", "E"];

function abbreviateNumber(number) {

    // what tier? (determines SI symbol)
    var tier = Math.log10(Math.abs(number)) / 3 | 0;

    // if zero, we don't need a suffix
    if (tier == 0) return number;

    // get suffix and determine scale
    var suffix = SI_SYMBOL[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(1) + suffix;
};

//Importing & requiring everything we need.
require("dotenv").config();
const Express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const colors = require("colors");
//Databases;
const PlayerDB = require("./MongoDB/PlayerDB");
//Instantiating an express client;

const App = Express();

//Configuring Express
App.set('view engine', 'ejs');
App.set('views', path.join(__dirname, "./Views"));
App.use(bodyParser.json());
App.use(bodyParser.urlencoded({
    extended: true
}));
App.use(Express.json());
App.use(Express.urlencoded({
    extended: true
}));
App.use(Express.static(path.join(__dirname, "./CSS")));
App.use(Express.static(path.join(__dirname, '/'), { dotfiles: 'allow' }));
//Instantiating Handlers;
["Database_Handler"].forEach((handler) => require(`./Handlers/${handler}`)());

//Instantiating Express Getter
App.get("/", (req, res) => {
    res.status(200).render('index')
});

App.get("/usernotfound/:username/:type", (req, res) => {
    const object = {
        error: `${req.params.type == "invalid" ? `Invalid username: ${req.params.username}` : req.params.type == "neverjoined" ? `That player has never joined SkySim!` : req.params.type == "internal" ? `Internal Server Error, Our BackEnd API has failed to respond, please make sure the player has joined skysim.` : `Failed to resolve username, Please make sure the player exist with the username: ${req.params.username}`}`
    };

    res.status(200).send(object);
});

App.get("/user/:username", async (req, res) => {
    if (!req.params.username || typeof req.params.username !== 'string' || req.params.username.length > 16 || req.params.username.length < 3) return res.redirect(`/usernotfound/${encodeURIComponent(req.params.username)}/invalid`);

    const UUID = await axios({
        method: 'get',
        url: `https://playerdb.co/api/player/minecraft/${req.params.username}`
    }).catch((err) => null);

    if (!UUID || !UUID.data || UUID.data.success === false) return res.redirect(`/usernotfound/${encodeURIComponent(req.params.username)}/internal`);

    if (UUID && UUID.data && UUID.data.code == "player.found") {
        const SkySimData = await axios({
            method: 'get',
            url: `https://api.skysim.sbs/?key=${process.env.API_KEY}&type=PLAYER_INFO&param=${UUID.data?.data?.player?.id}`
        }).catch((err) => null);

        const PlayerInventory = await axios({
            method: 'get',
            url: `https://api.skysim.sbs/?key=${process.env.API_KEY}&type=PLAYER_ITEMS&param=${UUID.data?.data?.player?.id}`
        }).catch((err) => null);

        if (SkySimData.data.error || PlayerInventory.data.error) return res.redirect(`/usernotfound/${encodeURIComponent(req.params.username)}/neverjoined`), console.log(colors.red(`Player Data Error: ${SkySimData.data.error === undefined ? "None" : SkySimData.data.error} | Player Inventory Error: ${PlayerInventory.data.error === undefined ? "None" : PlayerInventory.data.error}`));

        //Setting User Data
        let userData = {
            profile: {
                username: UUID.data?.data?.player?.username,
                uuid: UUID.data?.data?.player
            },
            coins: {
                raw: SkySimData.data.coins,
                abbrev: abbreviateNumber(SkySimData.data.coins),
                bank: {
                    raw: SkySimData.data.bankCoins,
                    abbrev: abbreviateNumber(SkySimData.data.bankCoins)
                }
            },
            bits: {
                raw: SkySimData.data.bits,
                abbrev: abbreviateNumber(SkySimData.data.bits)
            },
            stats: {
                health: SkySimData.data.health,
                defense: SkySimData.data.defense,
                strength: SkySimData.data.strength,
                crit: {
                    chance: SkySimData.data.critChance,
                    damage: SkySimData.data.critDamage
                },
                speed: SkySimData.data.speed,
                mana: SkySimData.data.intelligence,
                attackSpeed: SkySimData.data.attackSpeed,
                magicFind: SkySimData.data.magicFind,
                ferocity: SkySimData.data.ferocity,
                abilityDamage: SkySimData.data.abilityDamage,
                effectiveHP: null
            },
            skills: {
                combat: null,
                mining: null,
                enchanting: null,
                farming: null,
                foraging: null
            },
            slayers: {
                revenant: {
                    slayerXP: SkySimData.data.slayerXP[0],
                    slayerXPAbbrev: abbreviateNumber(SkySimData.data.slayerXP[0]),
                    slayerLevel: null,
                    progression: 0,
                    greyProgression: 45,
                    offset: null,
                    xp: {
                        current: 0,
                        next: 0
                    }
                },
                tarantula: {
                    slayerXP: SkySimData.data.slayerXP[1],
                    slayerXPAbbrev: abbreviateNumber(SkySimData.data.slayerXP[1]),
                    slayerLevel: null,
                    progression: 0,
                    greyProgression: 45,
                    xp: {
                        current: 0,
                        next: 0
                    }
                },
                sven: {
                    slayerXP: SkySimData.data.slayerXP[2],
                    slayerXPAbbrev: abbreviateNumber(SkySimData.data.slayerXP[2]),
                    slayerLevel: null,
                    progression: 0,
                    greyProgression: 45,
                    xp: {
                        current: 0,
                        next: 0
                    }
                },
                voidgloom: {
                    slayerXP: SkySimData.data.slayerXP[3],
                    slayerXPAbbrev: abbreviateNumber(SkySimData.data.slayerXP[3]),
                    slayerLevel: null,
                    progression: 0,
                    greyProgression: 45,
                    xp: {
                        current: 0,
                        next: 0
                    }
                }
            },
            weight: null,
            catacombs: {
                classes: {
                    archer: {
                        level: null,
                        XP: null,
                        XPAbbrev: null
                    },
                    berserker: {
                        level: null,
                        XP: null,
                        XPAbbrev: null
                    },
                    healer: {
                        level: null,
                        XP: null,
                        XPAbbrev: null
                    },
                    tank: {
                        level: null,
                        XP: null,
                        XPAbbrev: null
                    },
                    mage: {
                        level: null,
                        XP: null,
                        XPAbbrev: null
                    }
                },
                catacombXP: SkySimData.data['cataXP'],
                catacombXPAbbrev: abbreviateNumber(SkySimData.data['cataXP']),
                catacombLevel: null,
                Floors: {
                    Six: {
                        runs: {
                            total: SkySimData.data['totalfloor6run'],
                            finished: SkySimData.data['sadancollections']
                        }
                    }
                }
            }
        };

        //Skill System
        const SkillData = await require("./Functions/CalculatingSkillData")(SkySimData);

        if (typeof SkillData != "object") return res.redirect(`/usernotfound/${encodeURIComponent(userData['profile']['username'])}/invalid`);

        userData['skills'].combat = SkillData.combat;
        userData['skills'].mining = SkillData.mining;
        userData['skills'].enchanting = SkillData.enchanting;
        userData['skills'].farming = SkillData.farming;
        userData['skills'].foraging = SkillData.foraging;

        //Import

        userData.weight = await require("./Uhut/weight")(userData);

        const effHP = await require("./Uhut/ehp")(userData);

        userData['stats'].effectiveHP = {
            hp: effHP,
            abbrev: abbreviateNumber(effHP)
        };

        //Debug Section;

        //Modifying Equipped Armor;
        const ArmorAttribute = require("./Constants/ArmorTextures");
        let items = [];
        let itemsWithoutReforge = [];

        const colorCodes = require("./Constants/ColorCodes").colorCodes;

        await PlayerInventory.data.armor.forEach((armor) => {
            if (armor === null) items.push(null);
            if (armor !== null) {
                colorCodes.forEach((colorCode) => {
                    const regex = new RegExp(colorCode, 'gim');
    
                        if (armor?.name?.substring(0, 2)?.match(regex)) {
                            console.log(armor.name)
                            const index = colorCodes.findIndex((code) => code === colorCode);
    
                            const colorAttribute = require("./Constants/ColorCodes").colorAttribute[index];
    
                            const replacedArmor = armor.name.replace(regex, '');
    
                            return items.push(`${replacedArmor}-${colorAttribute}`);
                        };
                });
            };
        });

        items = [items[3], items[2], items[1], items[0]];

        PlayerInventory.data.armor.forEach(async (armor) => {
            if (armor === null) return itemsWithoutReforge.push(null);
            if (armor.material?.toLowerCase() != "skull_item") {
                if (armor !== null) {
                    const attr = armor.type?.toLowerCase()

                    const actualTextures = ArmorAttribute[attr];

                    //Building HTML Lores

                    const ColorSigns = require("./Constants/ColorCodes").colorCodes;

                    let iLore = [];

                    let recombobulated = false;

                    armor.lore.forEach((loreLine) => {
                        let completeLore = [];
                        const splittedLore = loreLine.split('§');

                        splittedLore.forEach((loreColo) => {
                            let loreColor = `§${loreColo}`;

                            if (loreColor.length < 2) return;

                            const color = loreColor.substring(0, 2);

                            const findingHexCode = ColorSigns.findIndex((c) => c?.toLowerCase() === color?.toLowerCase());

                            if (findingHexCode === -1) return;

                            const hexCode = require("./Constants/ColorCodes").colorAttribute[findingHexCode];

                            const loreText = loreColor.slice(2);

                            if (color?.toLowerCase() == "k") recombobulated = true;

                            completeLore.push(`<span style="color: ${hexCode}; font-size: 15px; font-weight: 600;"> ${loreText}`)
                        });

                        let completeLoreLength = completeLore.length;

                        for (let i = 0; i < completeLoreLength; i++) {
                            completeLore.push('</span>')
                        };

                        iLore.push(completeLore.join(''));
                    });

                    if (recombobulated === true) iLore.push(`<br><span style="color: #999999; font-weight: 600;">(Recombobulated)</span>`);

                    //Building colorName for lore;
                    let coloredName = [];

                    const starRegex = /✪/gim;

                    const armorColor = armor.name.substring(0, 2);

                    const colorIndex = ColorSigns.findIndex((c) => c?.toLowerCase() === armorColor?.toLowerCase());

                    if (colorIndex === -1) coloredName = null;
                    if (colorIndex !== -1) {
                        coloredName.push(`<span style="color: ${require("./Constants/ColorCodes").colorAttribute[colorIndex]}; font-weight:600; font-size: 15px;">${armor.name.slice(2)?.replace(/§6/gim, '')?.replace(/✪/gim, '')}</span>`);
                    };

                    if (armor.name.match(starRegex)) {
                        const splittedName = armor.name.split('');

                        splittedName.forEach((letter) => {
                            if (letter?.toLowerCase()?.match(starRegex)) coloredName.push(`<span style="color: #FFAA00;">✪</span>`)
                        });
                    };

                    //Pushing data

                    itemsWithoutReforge.push({
                        name: armor.name,
                        itemType: armor.type?.toLowerCase(),
                        itemTexture: actualTextures,
                        itemLore: `${coloredName.length < 1 ? '' : coloredName.join('')}<br><br>${iLore.join('<br>')}`
                    });
                };
            } else if (armor.material?.toLowerCase() == "skull_item") {
                const ColorSigns = require("./Constants/ColorCodes").colorNumber;
                if (armor !== null) {
                    const raw_texture = armor.texture?.split('/')[4];

                    const apiLink = `https://mc-heads.net/head/${raw_texture}`;

                    //Building HTML Lores

                    const ColorSigns = require("./Constants/ColorCodes").colorCodes;

                    let iLore = [];

                    let recombobulated = false;

                    armor.lore.forEach((loreLine) => {
                        let completeLore = [];
                        const splittedLore = loreLine.split('§');

                        splittedLore.forEach((loreColo) => {
                            let loreColor = `§${loreColo}`;

                            if (loreColor.length < 2) return;

                            const color = loreColor.substring(0, 2);

                            const findingHexCode = ColorSigns.findIndex((c) => c?.toLowerCase() === color?.toLowerCase());

                            if (findingHexCode === -1) return;

                            const regexToReplace = new RegExp(ColorSigns[findingHexCode], 'im');

                            const hexCode = require("./Constants/ColorCodes").colorAttribute[findingHexCode];

                            const loreText = loreColor.slice(2);

                            if (color?.toLowerCase() == "k") recombobulated = true;

                            completeLore.push(`<span style="color: ${hexCode}; font-size: 15px; font-weight: 600; user-select: text; visibility: visible;"> ${loreText}`)
                        });

                        let completeLoreLength = completeLore.length;

                        for (let i = 0; i < completeLoreLength; i++) {
                            completeLore.push('</span>')
                        };

                        iLore.push(completeLore.join(''));
                    });

                    if (recombobulated === true) iLore.push(`<br><span style="color: #999999; font-weight: 600; font-size: 15px;">(Recombobulated)</span>`);

                    //Building colorName for lore;
                    let coloredName = [];

                    const starRegex = /✪/gim;

                    const armorColor = armor.name.substring(0, 2);

                    const colorIndex = ColorSigns.findIndex((c) => c?.toLowerCase() === armorColor?.toLowerCase());

                    if (colorIndex === -1) coloredName = null;
                    if (colorIndex !== -1) {
                        coloredName.push(`<span style="color: ${require("./Constants/ColorCodes").colorAttribute[colorIndex]}; font-weight:600; font-size: 15px;">${armor.name.slice(2)?.replace(/§6/gim, '')?.replace(/✪/gim, '')}</span>`);
                    };

                    if (armor.name.match(starRegex)) {
                        const splittedName = armor.name.split('');

                        splittedName.forEach((letter) => {
                            if (letter?.toLowerCase()?.match(starRegex)) coloredName.push(`<span style="color: #FFAA00;">✪</span>`)
                        });
                    };

                    //Pushing data

                    itemsWithoutReforge.push({
                        name: armor.name,
                        coloredName: coloredName,
                        itemType: armor.type?.toLowerCase(),
                        itemTexture: apiLink,
                        itemLore: `${coloredName.length < 1 ? '' : coloredName.join('')}<br><br>${iLore.join('<br>')}`
                    });
                };
            };
        });

        itemsWithoutReforge = [itemsWithoutReforge[3], itemsWithoutReforge[2], itemsWithoutReforge[1], itemsWithoutReforge[0]];

        //Slayer Sections

        const SlayerData = await require("./Uhut/slayer")(userData);

        userData['slayers']['revenant']['slayerLevel'] = SlayerData['zombielvl'] === null ? 0 : SlayerData['zombielvl'];
        userData['slayers']['sven']['slayerLevel'] = SlayerData['svenlvl'] === null ? 0 : SlayerData['svenlvl'];
        userData['slayers']['voidgloom']['slayerLevel'] = SlayerData['voidgloomlvl'] === null ? 0 : SlayerData['voidgloomlvl'];
        userData['slayers']['tarantula']['slayerLevel'] = SlayerData['tarantulalvl'] === null ? 0 : SlayerData['tarantulalvl'];

        const RevenantSlayerProgression = await require("./Functions/CalculatingSlayerData")(userData, 1);

        userData['slayers']['revenant']['progression'] = RevenantSlayerProgression['completetion'];
        userData['slayers']['revenant']['greyProgression'] = RevenantSlayerProgression['greyProgress'];
        userData['slayers']['revenant']['offset'] = RevenantSlayerProgression['offset']
        userData['slayers']['revenant']['xp']['current'] = RevenantSlayerProgression['currentXP'];
        userData['slayers']['revenant']['xp']['next'] = RevenantSlayerProgression['nextLevelXP'];

        // const TarantulaSlayerProgression = await require("./Functions/CalculatingSlayerData")(userData, 2);

        //Rendering page.

        res.render('stats', {
            data: SkySimData.data,
            username: UUID.data?.data?.player?.username,
            uuidData: UUID.data?.data?.player,
            constants: {
                colorCodes: colorCodes
            },
            userData: userData,
            playerInventory: PlayerInventory.data,
            playerArmor: {
                equippedItems: items.filter((item) => item !== null).length > 0 ? true : false,
                withReforge: items,
                noReforge: itemsWithoutReforge,

            }
        });

        const fetchingPlayer = await PlayerDB.findOne({
            UUID: UUID.data?.data?.player?.id
        }).catch((err) => null);

        if (fetchingPlayer) fetchingPlayer.updateOne({
            UUID: fetchingPlayer.UUID,
            PlayerData: userData
        });

        if (!fetchingPlayer) new PlayerDB({
            UUID: UUID.data?.data?.player?.id,
            PlayerData: userData
        }).save();
    };
})

//Instantiating Express Post
App.post("/", async (req, res) => {
    if (!req.body.SkySim_Username || typeof req.body.SkySim_Username !== 'string' || req.body.SkySim_Username.length > 16 || req.body.SkySim_Username.length < 3) return res.redirect(`/usernotfound/${encodeURIComponent(req.body.SkySim_Username)}/invalid`);
    return res.redirect(`/user/${encodeURIComponent(req.body.SkySim_Username)}`);
});
//Listening to a specific port;
App.listen(3001, () => console.log(colors.green("SkyStats is now running!")));