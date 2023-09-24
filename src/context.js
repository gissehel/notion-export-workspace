const { Client } = require('@notionhq/client');
const { get_time_id } = require('./utils.js');

/**
 * @typedef {Object} ContextStatic
 * @property {Client} notion The Notion client
 * @property {String} base_path The path to the data directory
 * @property {String[]} block_ids_to_fetch The block IDs to fetch
 * @property {String[]} subblocks_to_fetch The block IDs of the blocks whose subblocks need to be fetched
 */

/**
 * @typedef {Object} ContextDynamic
 * @property {Object.<String, Promise>} dir_promises The promises that resolve when the directories are created
 * @property {Set<String>} block_ids_fetched The block IDs that have been fetched
 * @property {Set<String>} subblocks_fetched The block IDs of the blocks whose subblocks have been fetched
 */

/**
 * @typedef {Object} Context
 * @property {ContextStatic} static The static context
 * @property {ContextDynamic} dynamic The dynamic context
 */

/**
 * @typedef {Object} ContextReadStatic
 * @property {String} base_path The path to the data directory
 */

/**
 * @typedef {Object} ContextReadDynamic
 * @property {Object.<String, String>} titles The titles of the pages by page_id
 */

/**
 * @typedef {Object} ContextRead
 * @property {ContextReadStatic} static The static context
 * @property {ContextReadDynamic} dynamic The dynamic context
 */

/**
 * Get the default base path for the data directory
 * 
 * @returns {String} The default base path for the data directory
 * @returns {String}
 */
const get_base_path = () => {
    const data_path = '../__data__'
    const base_path = `${data_path}/${get_time_id()}`;
    return base_path
}

/**
 * Create a context object
 * 
 * @param {String} token The Notion token
 * @param {String} export_path? The path to the data directory (if undefined, a default path is used)
 * @returns {Promise<Context>} The context object
 */
const create_context = async (token, export_path) => {
    const notion = new Client({ auth: token });
    const base_path = export_path || get_base_path()
    return {
        static: {
            notion,
            base_path,
            block_ids_to_fetch: [],
            subblocks_to_fetch: [],
        },
        dynamic: {
            dir_promises: {},
            block_ids_fetched: new Set(),
            subblocks_fetched: new Set(),
        },
    }
}

/**
 * Create a read context object
 * 
 * @param {String} export_path The path to the data directory
 * @returns {Promise<ContextRead>} The context object
 */
const create_read_context = async (export_path) => {
    const base_path = export_path

    return {
        static: {
            base_path,
        },
        dynamic: {
            titles: {},
        },
    }
}

/**
 * Get the titles cache from the context
 * 
 * @param {ContextRead} context The context object
 * @returns {Object.<String, String>} The titles cache
 */
const get_titles_cache = (context) => context.dynamic.titles

/**
 * Mark a block as fetched
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID to mark as fetched
 * @returns {void}
 */
const mark_block_as_fetched = (context, block_id) => {
    context.dynamic.block_ids_fetched.add(block_id);
}

/**
 * Mark subblocks of a block as fetched
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID to mark the subblocks as fetched
 * @returns {void}
 */
const mark_subblock_as_fetched = (context, block_id) => {
    context.dynamic.subblocks_fetched.add(block_id);
}

/**
 * Check if a block has been fetched
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID to check
 * @returns {Boolean} True if the block has been fetched, false otherwise
 */

const is_block_fetched = (context, block_id) => {
    return context.dynamic.block_ids_fetched.has(block_id);
}

/**
 * Check if subblocks of a block have been fetched
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID to check
 * @returns {Boolean} True if the subblocks have been fetched, false otherwise
 */
const is_subblock_fetched = (context, block_id) => {
    return context.dynamic.subblocks_fetched.has(block_id);
}

/**
 * Add a block ID to the list of block IDs to fetch
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID to add
 * @returns {void}
 */
const add_block_id_to_fetch = (context, block_id) => {
    context.static.block_ids_to_fetch.push(block_id);
}

/**
 * Add a subblock ID to the list of subblock IDs to fetch
 * 
 * @param {Context} context The context object
 * @param {String} block_id The subblock ID to add
 * @returns {void}
 */
const add_subblock_id_to_fetch = (context, block_id) => {
    context.static.subblocks_to_fetch.push(block_id);
}

/**
 * Get the next block ID to fetch
 * 
 * @param {Context} context The context object
 * @returns {String|undefined} The next block ID to fetch or undefined if there are no more block IDs to fetch
 */
const get_next_block_id_to_fetch = (context) => {
    return context.static.block_ids_to_fetch.shift();
}

/**
 * Get the next block ID to fetch subblocks of
 * 
 * @param {Context} context The context object
 * @returns {String|undefined} The next block ID to fetch subblocks of or undefined if there are no more block IDs to fetch subblocks of
 * @returns {void}
 */
const get_next_subblock_id_to_fetch = (context) => {
    return context.static.subblocks_to_fetch.shift();
}

/**
 * Get the Notion client from the context
 * 
 * @param {Context} context The context object
 * @returns {Client} The Notion client
 */
const get_notion = (context) => context.static.notion

exports.create_context = create_context
exports.mark_block_as_fetched = mark_block_as_fetched
exports.is_block_fetched = is_block_fetched
exports.add_block_id_to_fetch = add_block_id_to_fetch
exports.get_next_block_id_to_fetch = get_next_block_id_to_fetch
exports.get_notion = get_notion

exports.mark_subblock_as_fetched = mark_subblock_as_fetched
exports.is_subblock_fetched = is_subblock_fetched
exports.add_subblock_id_to_fetch = add_subblock_id_to_fetch
exports.get_next_subblock_id_to_fetch = get_next_subblock_id_to_fetch
exports.create_read_context = create_read_context
exports.get_titles_cache = get_titles_cache