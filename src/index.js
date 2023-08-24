const { create_context } = require('./context')
const { handle_page_result } = require('./backup')
const { retrieve_pages } = require('./backup')
const { get_blocks } = require('./backup')

const token = process.env.NOTION_TOKEN
const export_path = process.env.NOTION_EXPORT_PATH

/**
 * Export a Notion workspace
 * 
 * @param {String} token The Notion token
 */
const export_notion_workspace = async (token) => {
    const context = await create_context(token, export_path)

    await retrieve_pages(context, handle_page_result)
    await get_blocks(context)
}

export_notion_workspace(token)
