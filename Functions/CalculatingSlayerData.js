module.exports = async (userData, type) => {
    let slayerData = {
        completetion: 0,
        greyProgress: 22.5,
        nextLevelXP: 0,
        currentXP: 0,
        offset: 0,
    };

    //zombie = type 1, spider = type 2, sven = type 3, voidgloom = type 4.

    let slayerXPs = {
        RevenantXP: [0, 5, 15, 200, 1000, 5000, 20000, 100000, 400000, 1000000],
        TarantulaXP: [5, 25, 200, 1000, 5000, 20000, 100000, 400000, 1000000],
        RestSlayerXP: [0, 10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000]
    };

    if (type === 1) {
        const check = userData['slayers']['revenant']['slayerLevel'] === null ? 0 : userData['slayers']['revenant']['slayerLevel'];

        if (check === 9) slayerData.completetion = 70, slayerData.greyProgress = 0;

        const userXP = slayerXPs['RevenantXP'][userData['slayers']['revenant']['slayerLevel'] === null ? 0 : userData['slayers']['revenant']['slayerLevel']];

        let data = {
            userCurrentSkillXP: userData['slayers']['revenant']['slayerXP'] - userXP
        };
        const slayerRev = userData.slayers.revenant.slayerLevel + 1
        slayerData['currentXP'] = data.userCurrentSkillXP;
        slayerData['nextLevelXP'] = slayerXPs.RevenantXP[slayerRev]

        if (check < 9) {
            //Calculating progress bar percentage.
<<<<<<< HEAD
            var raw_data = Math.round(((userData.slayers.revenant.slayerXP/ slayerXPs.RevenantXP[slayerRev]) * 100))
            var raw_rest = 100 - raw_data
            const percent = 3.66032210835
            slayerData['completetion'] = (raw_data / percent)

            slayerData['greyProgress'] = (raw_rest / percent)
            slayerData['offset'] = (raw_data / 3.677)
        } else {
            slayerData['greyProgess'] = 0
            slayerData['completetion'] = 100 / 3.66032210835
            slayerData['offset'] = 0
        }
=======
            let raw_data = data['userCurrentSkillXP'] / (slayerXPs['RevenantXP'][userData['slayers']['revenant']['slayerLevel'] === null ? 1 : userData['slayers']['revenant']['slayerLevel'] + 1] - slayerXPs['RevenantXP'][userData['slayers']['revenant']['slayerLevel'] === null ? 0 : userData['slayers']['revenant']['slayerLevel']]) * 100;

            if (raw_data >= 100) raw_data = 100;

            //Getting 22.5% of the bar percentage above;

            const div1 = 22.5 / 100;

            const percent_of_percentage = div1 * raw_data;

            slayerData['completetion'] = userData['slayers']['revenant']['slayerLevel'] === null ? 0 : percent_of_percentage;

            slayerData['greyProgress'] = userData['slayers']['revenant']['slayerLevel'] === null ? 22.5 : 22.5 - percent_of_percentage;

            console.log(userData['slayers']['revenant'], slayerData)
        };
>>>>>>> 0ef2e920f0abf6441009e2330abfec164be23047

        return slayerData;
    };
};