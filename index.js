const Command = require('command'),
Long = require("long"),
DATAPATH = __dirname+'\\data.json',
DEBUG = false

module.exports = function appearanceCopyPaster(dispatch) {
    const command = Command(dispatch)
    let sLoginData = { gender: null, race: null, job: null, app: null, details: null}
    let fs = require('fs')

    command.add('acp', (option) => {
		switch (option) {
            case 'save': 
                fs.writeFileSync(DATAPATH, JSON.stringify(sLoginData))
                command.message('[Appearance CopyPaster] Current appearance saved')
				break
            case 'clean':
                fs.unlinkSync(DATAPATH)
                command.message('[Appearance CopyPaster] Saved appearance deleted')
				break
            case 'apply': {
                   let data = JSON.parse(fs.readFileSync(DATAPATH, 'utf8'))
                    dispatch.hookOnce('C_CREATE_USER',1, event => {
                        if(DEBUG) console.log('[Appearance CopyPaster] Loaded object:', data)
                        if(DEBUG) console.log('[Appearance CopyPaster] Data from packet::', event.race, event.gender, event.class)
                        if(event.race == data.race && event.class == data.job && event.gender == data.gender ) {
                            if(DEBUG) console.log('Characters basic data matched. Injected...')
                            event.details = Buffer.from(data.details) 
                            event.appearance = new Long(data.app.low, data.app.high, data.app.unsigned)
                            return true
                        }
                    })
                    command.message('[Appearance CopyPaster] Next created character will have saved appearance')
                }
				break
		}
    });
    
    dispatch.hook('S_LOGIN', 1, event => {
      
        let tmp = GetCharacterInfo(event.model)

        sLoginData.race = tmp[0]
        sLoginData.gender = tmp[1]
        sLoginData.job = tmp[2]

        sLoginData.app = event.appearance
        sLoginData.details = Buffer.from(event.details)

        if(DEBUG) console.log('[Appearance CopyPaster] S_LOGIN Object:', sLoginData)
	})

    function GetCharacterInfo(model)
    {
        let race = Math.floor((model - 100) / 200 % 50)
        let job = (model - 10101) % 100
        let gender = Math.floor(model / 100 % 2) +1
        return [race,gender,job]
    }
}