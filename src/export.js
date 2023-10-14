const { create_context } = require('./context')
const { handle_page_result } = require('./backup')
const { handle_database_result } = require('./backup')
const { retrieve_pages } = require('./backup')
const { retrieve_databases } = require('./backup')
const { get_page } = require('./backup')
const { get_blocks } = require('./backup')

/**
 * Export a Notion workspace
 * 
 * @param {String} token The Notion token
 * @param {String} export_path The path to the data directory
 */
const export_notion_workspace = async (token, export_path, instant) => {
    const context = await create_context(token, export_path)

    await retrieve_pages(context, handle_page_result, instant)
    await retrieve_databases(context, handle_database_result)
    await get_blocks(context)
}

/**
 * Export a Notion page
 *
 * @param {String} token The Notion token
 * @param {String} export_path The path to the data directory
 * @param {String} page_id The page ID
 * @returns {Promise} A promise that resolves when the page is exported
 */
const export_pages = async (token, export_path, page_ids) => {
    const context = await create_context(token, export_path)

    for (const page_id of page_ids) {
        await get_page(context, page_id)
    }

    await get_blocks(context)
}

/**
 * Export all databases in a Notion workspace
 * 
 * @param {String} token The Notion token
 * @param {String} export_path The path to the data directory
 * @returns {Promise} A promise that resolves when the databases are exported
 */
const export_all_databases = async (token, export_path) => {
    const context = await create_context(token, export_path)

    await retrieve_databases(context, handle_database_result)
}


exports.export_notion_workspace = export_notion_workspace
exports.export_pages = export_pages
exports.export_all_databases = export_all_databases
