const { write_json, create_write_stream, append_timed_line } = require('./fileaccess')
const { get_fine_time_id } = require('./utils')

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
 * Write a database result
 * 
 * @param {Context} context The context object
 * @param {DatabaseObjectResponse} database_result The database result
 * @returns {Promise<void>} A promise that resolves when the database result is written
 */

const write_database_result = async (context, database_result) => {
    await write_json(context, `databases`, `${database_result.id}.json`, database_result)
}

/**
 * Write a block to a file
 * 
 * @param {Context} context The context object
 * @param {BlockObjectResponse} block_struct The block structure
 * @returns {Promise<void>} A promise that resolves when the block is written
 */
const write_block = async (context, block_struct) => {
    await write_json(context, `block`, `${block_struct.id}.json`, block_struct)
}

/**
 * Write all subblocks of a block
 * 
 * @param {Context} context The context object
 * @param {String} block_id The block ID
 * @param {String[]} subblock_ids The subblock IDs
 * @returns {Promise<void>} A promise that resolves when all the subblocks are written
 */
const write_subblocks = async (context, block_id, subblock_ids) => {
    await write_json(context, `subblocks`, `${block_id}.json`, subblock_ids)
}

/**
 * Write a file to a stream
 * 
 * @param {Context} context The context object
 * @param {String} path The path to write to
 * @param {String} filename The filename to write to
 * @param {stream.Readable} data The data to write
 * @returns {Promise<void>} A promise that resolves when the file is written
 */
const write_file_stream = (context, path, filename, data) => {
    create_write_stream(context, `file/${path}`, filename).then((stream) => {
        data.pipe(stream)
        return new Promise((resolve, reject) => {
            stream.on('finish', ()=>resolve())
            stream.on('error', ()=>reject())
        })
    })
}

/**
 * Write an action to the action file
 * 
 * @param {Context} context The context object
 * @param {String} action_text The action text to write
 * @returns {Promise<void>} A promise that resolves when the action is written
 */
const write_action = async (context, action_text) => {
    await append_timed_line(context, null, '__actions__', action_text)
}

/**
 * Write a debug file
 *  
 * @param {Context} context The context object
 * @param {String} logid The log ID
 * @param {Object} data The data to write
 * @returns {Promise<void>} A promise that resolves when the file is written
 */
const write_debug = async (context, logid, data) => {
    await write_json(context, `debug`, `${logid}-${get_fine_time_id()}.json`, data)
}    

exports.write_page = write_page
exports.write_database_result = write_database_result
exports.write_block = write_block
exports.write_subblocks = write_subblocks
exports.write_file_stream = write_file_stream
exports.write_action = write_action
exports.write_debug = write_debug

