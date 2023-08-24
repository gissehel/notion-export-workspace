const { create_context } = require('./context')
const { handle_page_result } = require('./backup')
const { retrieve_pages } = require('./backup')
const { get_page } = require('./backup')
const { get_blocks } = require('./backup')

const token = process.env.TOKEN;

/**
 * Export a Notion workspace
 * 
 * @param {String} token The Notion token
 */
const export_notion_workspace = async (token) => {
    const context = await create_context(token);

    await retrieve_pages(context, handle_page_result)
    await get_blocks(context)
}

const test = async (token) => {
    const context = await create_context(token);
    await get_page(context, '6a844558-fb57-4337-a2fe-dae0ee325aca')
    await get_blocks(context)
}

export_notion_workspace(token);
// test(token)
