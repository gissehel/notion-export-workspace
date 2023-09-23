/**
 * @typedef {import('./context').Context} Context
 * @typedef {import('./context').ContextRead} ContextRead
 */
const fs = require('fs/promises');
const fsorig = require('fs');

/**
 * Check if a file exists
 * 
 * @param {String} path The path to check
 * @returns {Promise<Boolean>} A promise that resolves to true if the file exists, false otherwise
 */
const file_exists = async (path) => {
    try {
        await fs.access(path)
        return true
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false
        } else {
            throw err
        }
    }
}

/**
 * create a directory
 * 
 * @param {String} path 
 * @returns {Promise<void>}
 */
const create_dir = async (path) => {
    await fs.mkdir(path, { recursive: true });
}

/**
 * Ensure that a directory exists
 * 
 * @param {Context} context The context object
 * @param {String} dir The directory to ensure
 * @returns {Promise<void>} A promise that resolves when the directory exists
 * @async
 */
const ensure_dir = (context, dir) => {
    if (context.dynamic.dir_promises[dir] === undefined) {
        context.dynamic.dir_promises[dir] = create_dir(dir);
    }
    return context.dynamic.dir_promises[dir];
}

/**
 * Write a text string to a file
 * 
 * @param {Context} context The context object
 * @param {String} subpath The subpath to write to
 * @param {String} filename The filename to write to
 * @param {String} data The text string to write
 * @returns {Promise<void>} A promise that resolves when the file is written
 */
const write_file = async (context, subpath, filename, data) => {
    const { base_path } = context.static;
    const dir = subpath ? `${base_path}/${subpath}` : base_path
    const path = `${dir}/${filename}`
    await ensure_dir(context, dir)
    await fs.writeFile(path, data)
}

/**
 * Append a text string to a file
 * 
 * @param {Context} context The context object
 * @param {String} subpath The subpath to write to
 * @param {String} filename The filename to write to
 * @param {String} data The text string to write
 * @returns {Promise<void>} A promise that resolves when the file is written
 */
const append_file = async (context, subpath, filename, data) => {
    const { base_path } = context.static;
    const dir = subpath ? `${base_path}/${subpath}` : base_path
    const path = `${dir}/${filename}`
    await ensure_dir(context, dir)
    await fs.appendFile(path, data)
}

/**
 * Create a write stream
 * 
 * @param {Context} context The context object
 * @param {String} subpath The subpath to write to
 * @param {String} filename The filename to write to
 */
const create_write_stream = async(context, subpath, filename) => {
    const { base_path } = context.static;
    const dir = subpath ? `${base_path}/${subpath}` : base_path
    const path = `${dir}/${filename}`
    await ensure_dir(context, dir)
    return fsorig.createWriteStream(path)
}

/**
 * Write an action to the action file
 * 
 * @param {Context} context The context object
 * @param {String} action_text The action text to write
 * @returns {Promise<void>} A promise that resolves when the action is written
 */
const append_timed_line = async (context, subpath, filename, line) => {
    await append_file(context, subpath, filename, `${(new Date()).toISOString().replace('T',' ').replace('Z','')} ${line}\n`)
}

/**
 * Write a JSON structure to a file
 * 
 * @param {String} filename The filename to write to
 * @param {Object} data The JSON structure to write
 * @returns {Promise<void>} A promise that resolves when the file is written
 */
const write_json = async (context, subpath, filename, data) => {
    await write_file(context, subpath, filename, JSON.stringify(data, null, 4));
}

/**
 * Read a JSON structure from a file
 * 
 * @param {ContextRead} context The context object
 * @param {String} subpath The subpath to read from
 * @param {String} filename The filename to read from
 * @returns {Promise<Object>} A promise that resolves to the JSON structure
 */
const read_json = async (context, subpath, filename) => {
    const { base_path } = context.static;
    const dir = subpath ? `${base_path}/${subpath}` : base_path
    const path = `${dir}/${filename}`
    if (!(await file_exists(path))) {
        return null
    }
    const data = await fs.readFile(path, 'utf8')
    return JSON.parse(data)
}

/**
 * List JSON files in a directory
 * 
 * @param {ContextRead} context The context object
 * @param {String} subpath The subpath to read from
 * @returns {Promise<String[]>} A promise that resolves to the JSON files in the directory
 */
const ls_json = async (context, subpath) => {
    const { base_path } = context.static;
    const dir = subpath ? `${base_path}/${subpath}` : base_path
    const files = await fs.readdir(dir)
    const json_files = files.filter((file) => file.endsWith('.json'))
    return json_files
}


exports.create_dir = create_dir
exports.write_file = write_file
exports.append_file = append_file
exports.append_timed_line = append_timed_line
exports.write_action = write_action
exports.write_json = write_json
exports.read_json = read_json
exports.create_write_stream = create_write_stream
exports.ls_json = ls_json
