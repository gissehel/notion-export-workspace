/**
 * @typedef {import('./context').Context} Context
 */
/**
 * @typedef {import('./notion').PaginatedResults} PaginatedResults
 * @typedef {import('./notion').PropertyResponse} PropertyResponse
 * @typedef {import('./notion').PageObjectResponse} PageObjectResponse
 * @typedef {import('./notion').BlockObjectResponse} BlockObjectResponse
 */

const { write_json, create_write_stream } = require('./fileaccess')
const { write_action } = require('./fileaccess')
const { get_page_getter, get_page_property_getter } = require('./notion')
const { get_title } = require('./notion')
const { retrieve_paginated_cursor_calls } = require('./notion')
const { get_all_pages_getter } = require('./notion')
const { limited_property_types } = require('./notion')
const { add_block_id_to_fetch, mark_block_as_fetched, is_block_fetched, get_next_block_id_to_fetch } = require('./context')
const { get_subblocks_getter } = require('./notion')
const { get_block_getter } = require('./notion')
const axios = require('axios')
const stream = require('stream')
const promisify = require('util').promisify
const finished = promisify(stream.finished)

const { mark_subblock_as_fetched } = require('./context')
const { is_subblock_fetched } = require('./context')
const { add_subblock_id_to_fetch } = require('./context')
const { get_next_subblock_id_to_fetch } = require('./context')

/**
 * Write a page to a file
 * 
 * @param {Context} context The context object
 * @param {PageObjectResponse} page_struct The page structure
 * @returns {Promise<void>} A promise that resolves when the page is written
 */
const write_page = async (context, page_struct) => {
    await write_json(context, `pages`, `${page_struct.id}.json`, page_struct);
}

/**
 * Get a page property
 * 
 * @param {Context} context The context object
 * @param {String} page_id The page ID
 * @param {String} property_name The property name
 * @returns {Promise<PropertyResponse[]>} The page property values
 */
const get_page_property = async (context, page_id, property_id) => {
    /** @type{PropertyResponse[]} */
    const result = []
    const get_page_property_content = get_page_property_getter(context)

    /**
     * 
     * @param {Context} context The context object
     * @param {PaginatedResults<PropertyResponse>} call_result The function to call on each call
     */
    const on_call = async (context, call_result) => {
        await write_action(context, `Page: [${page_id}] - Property: [${property_id}] - Call: [${call_result.results.length}]`)
    }

    /**
     * Action to do on each result
     * 
     * @param {Context} context The context object
     * @param {PropertyResponse} property_struct The property structure
     */
    const on_result = async (context, property_struct) => {
        result.push(property_struct[property_struct.type])
    }

    await retrieve_paginated_cursor_calls(
        context,
        get_page_property_content,
        {
            page_id,
            property_id,
        },
        `properties-${page_id}--${property_id}`,
        on_call,
        on_result,
    )

    // await write_json(context, `properties`, `${page_id}--${property_id}.json`, result)
    return result
}

/**
 * Check the length of the properties, and fetch them if they are too long
 * 
 * @param {Context} context The context object
 * @param {PageObjectResponse} page_struct The page structure
 * @returns {Promise<void>} A promise that resolves when all the properties are checked
 */
const check_properties_length = async (context, page_struct) => {
    const { properties } = page_struct
    if (properties === undefined) {
        return
    }
    for (let property_name in properties) {
        const property = properties[property_name]
        if (limited_property_types.includes(property.type)) {
            if (property.has_more || property[property.type].length >= 25) {
                property[property.type] = await get_page_property(context, page_struct.id, property.id)
            }
        }
    }
}

/**
 * Write a page name to the action file
 * 
 * @param {Context} context The context object
 * @param {Object} page_struct The page structure
 * @returns {Promise<void>} A promise that resolves when the page name is written
 */
const write_page_name = async (context, page_struct) => {
    const { id } = page_struct
    const title = get_title(page_struct)

    if (title === undefined) {
        await write_action(context, `Page: [${id}] has no title !`)
    } else {
        await write_action(context, `Page: [${id}] - [${title}]`)
    }
}

/**
 * Handle a page result
 * 
 * @param {Context} context The context object
 * @param {PageObjectResponse} page_result The page result
 * @returns {Promise<void>} A promise that resolves when the page result is handled
 */
const handle_page_result = async (context, page_result) => {
    if (page_result) {
        const { id, object } = page_result;
        if (object === 'page') {
            if (page_result.cover) {
                handle_file(context, page_result.cover, id)
            }
            await check_properties_length(context, page_result)
            await write_page_name(context, page_result);
            await write_page(context, page_result);
            add_block_id_to_fetch(context, id);
        }
    }
}

/**
 * Explicitly get a page by ID
 * 
 * @param {Context} context The context object
 * @param {String} page_id The page ID
 * @returns {Promise<void>} A promise that resolves when the page is retrieved
 */
const get_page = async (context, page_id) => {
    const get_page_internal = get_page_getter(context)

    const page_struct = await get_page_internal({ page_id });
    await handle_page_result(context, page_struct);
}

/**
 * Retrieve all pages
 * 
 * @param {Context} context The context object
 * @param {(context: Context, result: PageObjectResponse) => void} on_result The function to call on each result
 * @returns {Promise<void>} A promise that resolves when all the pages are retrieved
 */
const retrieve_pages = async (context, on_result) => {
    search_properties = {
        filter: {
            value: 'page',
            property: 'object',
        },
    }

    const get_all_pages = get_all_pages_getter(context)
    await retrieve_paginated_cursor_calls(context, get_all_pages, search_properties, `pages`, null, on_result)
}

/**
 * List of file container names
 * 
 * @type {String[]}
 */
const file_container_names = [
    'file',
    'image',
]

/**
 * Handle downloading a file
 * 
 * @param {Context} context The context object
 * @param {Object} file_struct A block structure
 * @param {String} id The block ID to log
 * @returns {Promise<void>} A promise that resolves when the file download has started and the structure has been updated
 */

const handle_file = async (context, file_struct, id) => {
    console.log(`handle_file(${file_struct.id})`)
    if (file_struct.type === 'file') {
        console.log(`  => file[${file_struct.file.url}]`)
        const file = file_struct.file
        const new_file = {}
        if (file) {
            const { url } = file
            if (url) {
                const [path, filename] = url.split('?')[0].split('/secure.notion-static.com/')[1].split('/')
                write_action(context, `Download-Start: [${id}] - File: [${filename}] (${path})`)
                axios({ method: 'get', url, responseType: 'stream' }).then(async (response) => {
                    const stream = await create_write_stream(context, `file/${path}`, filename)
                    response.data.pipe(stream)
                    finished(stream).then(() => {
                        write_action(context, `Download-Stop : [${id}] - File: [${filename}] (${path}) downloaded`)
                    })
                })
                
                new_file.local_url = `${path}/${filename}`
                file_struct.file = new_file
            }
        }
    }
}

/**
 * Resolve external URLs
 * 
 * @param {Context} context The context object
 * @param {Object} block_struct A block structure
 * @returns {Promise<Object>} The block structure with the external URL resolved
 */
const handle_block_external_url = async (context, block_struct) => {
    console.log(`handle_block_external_url(${block_struct.id})})`)
    if (file_container_names.includes(block_struct.type)) {
        handle_file(context, block_struct[block_struct.type], block_struct.id)
    }
    return block_struct
}

/**
 * @param {Context} context The context object
 * @param {BlockObjectResponse} subblock_struct The subblock structure
 * @param {Object} input The input query object
 */
const handle_subblock_result = async (context, subblock_struct, input) => {
    if (subblock_struct) {
        await write_action(context, `Link: [${input.block_id}] -> [${subblock_struct.id}]`)
        await handle_block_external_url(context, subblock_struct)
        await write_json(context, `block`, `${subblock_struct.id}.json`, subblock_struct)
        mark_block_as_fetched(context, subblock_struct.id)
        if (subblock_struct.has_children) {
            await write_action(context, `    Subblock: [${subblock_struct.id}] has children`)
            add_subblock_id_to_fetch(context, subblock_struct.id)
        }
    }
}


/**
 * Get all subblocks of a block
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID
 * @returns {Promise<void>} A promise that resolves when all the subblocks are retrieved
 */

const retrieve_subblocks = async (context, block_id) => {
    const get_subblocks_internal = get_subblocks_getter(context)

    retrieve_subblocks_properties = {
        block_id,
    }

    /** @type {String[]} */
    const subblock_ids = []

    /**
     * @param {Context} context 
     * @param {PaginatedResults<BlockObjectResponse>} call_result
     */
    const on_call = async (context, call_result) => {
        if (call_result.results.length > 0) {
            for (let subblock_struct of call_result.results) {
                subblock_ids.push(subblock_struct.id)
            }
        }
    }

    await retrieve_paginated_cursor_calls(context, get_subblocks_internal, retrieve_subblocks_properties, `subblocks`, on_call, handle_subblock_result)
    mark_subblock_as_fetched(context, block_id)
    await write_json(context, `subblocks`, `${block_id}.json`, subblock_ids)
}

/**
 * Get a block
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID
 * @returns {Promise<void>} A promise that resolves when the block is retrieved
 */
const get_block = async (context, block_id) => {
    const get_block_internal = get_block_getter(context)

    const block_struct = await get_block_internal({ block_id });
    await handle_block_external_url(context, block_struct)
    await write_json(context, `block`, `${block_id}.json`, block_struct);
    await write_action(context, `PageBlock: [${block_id}]`)
    if (block_struct.has_children) {
        await write_action(context, `    PageBlock: [${block_id}] has children`)
        add_subblock_id_to_fetch(context, block_id)
    }
}

/**
 * Get all remaining subblocks from the context
 * 
 * @param {Context} context The context object
 * @returns {Promise<void>} A promise that resolves when all the subblocks are retrieved
 */
const get_subblocks = async (context) => {
    let subcont = true
    while (subcont) {
        const subblock_id = get_next_subblock_id_to_fetch(context)
        if (subblock_id) {
            console.log(`Getting subblock: ${subblock_id} informations`)
            if (!is_subblock_fetched(context, subblock_id)) {
                await retrieve_subblocks(context, subblock_id)
                mark_subblock_as_fetched(context, subblock_id)
            }
        } else {
            subcont = false
        }
    }
}

/**
 * Get all remaining blocks from the context
 * 
 * @param {Context} context The context object
 * @returns {Promise<void>} A promise that resolves when all the blocks are retrieved
 */
const get_blocks = async (context) => {
    await get_subblocks(context)

    let cont = true
    while (cont) {
        const block_id = get_next_block_id_to_fetch(context)
        if (block_id) {
            console.log(`Getting block: ${block_id} informations`)
            if (!is_block_fetched(context, block_id)) {
                await get_block(context, block_id)
                mark_block_as_fetched(context, block_id)
            }
            await get_subblocks(context)
        } else {
            cont = false
        }
    }
}

exports.write_page = write_page
exports.get_page_property = get_page_property
exports.check_properties_length = check_properties_length
exports.write_page_name = write_page_name
exports.handle_page_result = handle_page_result
exports.get_page = get_page
exports.retrieve_pages = retrieve_pages
exports.get_blocks = get_blocks