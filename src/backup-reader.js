/**
 * @typedef {import('./context').Context} Context
 */
/**
 * @typedef {import('./notion').BlockObjectResponse} BlockObjectResponse
 */
/**
 * @typedef {Object} RecursiveBlock
 * @property {BlockObjectResponse} block The block
 * @property {RecursiveBlock[]} children The children of the block
 */
/**
 * @typedef {Object} PageAndContent
 * @property {Object} page The page
 * @property {RecursiveBlock} content The content of the page
 */
const { create_read_context } = require('./context')
const { read_json } = require('./fileaccess')
const { ls_json } = require('./fileaccess')

/**
 * List the page_ids of the pages in the backup
 * 
 * @param {Context} context The context object
 */
const page_ls = async (context) => {
    const files = await ls_json(context, 'pages')
    return files.map((file) => file.replace('.json', ''))
}

/**
 * Read a page from the backup
 * 
 * @param {Context} context The context object
 * @param {String} page_id The page ID to read
 */
const page_read = async (context, page_id) => {
    return await read_json(context, 'pages', `${page_id}.json`)
}

/**
 * List the sub block_ids of a block in the backup
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID to list the sub blocks of
 */
const block_ls = async (context, block_id) => {
    const subblocks = await read_json(context, `subblocks`, `${block_id}.json`)
    return subblocks ? subblocks.map((file) => file.replace('.json', '')) : []
}

/**
 * Read a block from the backup
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID to read
 * @returns {Promise<Object>} A promise that resolves to the block
 */
const read_block = async (context, block_id) => {
    return await read_json(context, `block`, `${block_id}.json`)
}

/**
 * Read a block from the backup
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID to read
 * @returns {Promise<RecursiveBlock>} A promise that resolves to the block and its children
 */
const recursive_block_read = async (context, block_id) => {
    /** @type{BlockObjectResponse} */
    const block = await read_block(context, block_id)
    const children_list = await block_ls(context, block_id)
    const children = await Promise.all(children_list.map(async (child_id) => await recursive_block_read(context, child_id)))
    return {
        block,
        children,
    }
}

/**
 * Read a page and its content from the backup
 * 
 * @param {Context} context The context object
 * @param {String} page_id The page ID to read
 * @returns {Promise<PageAndContent>} A promise that resolves to the page and its content
 */
const page_read_recursive = async (context, page_id) => {
    const page = await page_read(context, page_id)
    const content = await recursive_block_read(context, page_id)
    return {
        page,
        content,
    }
}

exports.page_ls = page_ls
exports.page_read = page_read
exports.block_ls = block_ls
exports.read_block = read_block
exports.recursive_block_read = recursive_block_read
exports.page_read_recursive = page_read_recursive
