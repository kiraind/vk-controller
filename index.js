const group_token = process.env.GROUP_TOKEN
const group_id = 186528519

const user_token = process.env.USER_TOKEN
let user_vk = undefined

const fsPromises = require('fs').promises

const easyvk = require('easyvk')
const {
    selectPostnumberCase,
    textifyNumber
} = require('@kiraind/russian-tools').word_utils

easyvk({
    access_token: user_token
}).then(async vk => user_vk = vk)

easyvk({
    access_token: group_token,
    utils: {
        bots: true
    },
}).then(async vk => {
    const { connection } = await vk.bots.longpoll.connect()

    async function onCountUpdate(params) {
        const { user_id } = params

        const { vkr: response } = await vk.call('groups.getById', {
            group_id, 
            fields: 'members_count'
        })

        const count = response[0].members_count

        console.log(`upd: ${count}`)

        let word = selectPostnumberCase(
            count,
            ['подписчик', 'подписчика', 'подписчиков']
        )
        let number = textifyNumber(count)

        if(word === 'подписчик') {
            word = 'подписчика'
            number = number
                .split(' ')
                .slice(0, -1)
                .concat('одного')
                .join(' ')
        }

        if(user_vk) {
            await user_vk.call('groups.edit', {
                group_id,
                description: `завести свою группу на ${
                    number
                } ${
                    word
                } это сейчас модно`
            })
        }

        await saveLog( (new Date()).toISOString() + ';' + count + ';' + user_id + '\n')
    }

    connection.on('group_join', onCountUpdate)
    connection.on('group_leave', onCountUpdate)
})

async function saveLog(str) {
    await fsPromises.appendFile('history.csv', str, 'utf8')
}