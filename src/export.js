const { create_context } = require('./context')
const { handle_page_result } = require('./backup')
const { retrieve_pages } = require('./backup')
const { get_blocks } = require('./backup')

/**
 * Export a Notion workspace
 * 
 * @param {String} token The Notion token
 * @param {String} export_path The path to the data directory
 */
const export_notion_workspace = async (token) => {
    const context = await create_context(token, export_path)

    await retrieve_pages(context, handle_page_result)
    await get_blocks(context)
}

exports.export_notion_workspace = export_notion_workspace
