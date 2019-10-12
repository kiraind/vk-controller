const group_token = process.env.GROUP_TOKEN
const group_id = 186528519

const user_token = process.env.USER_TOKEN
let user_vk = undefined

const easyvk = require('easyvk')
const { selectPostnumberCase } = require('@kiraind/russian-tools').word_utils
const numToText = require('./numToText.js')

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

    async function onCountUpdate() {
        const { vkr: response } = await vk.call('groups.getById', {
            group_id, 
            fields: 'members_count'
        })

        const count = response[0].members_count

        console.log(`upd: ${count}`)

        if(user_vk) await user_vk.call('groups.edit', {
            group_id,
            description: `завести свою группу на ${
                numToText(count)
            } ${
                selectPostnumberCase(count, ['подписчик', 'подписчика', 'подписчиков'])
            } это сейчас модно`
        })
    }

    connection.on('group_join', onCountUpdate)
    connection.on('group_leave', onCountUpdate)
})