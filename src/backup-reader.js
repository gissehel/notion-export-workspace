/**
 * @typedef {import('./context').Context} Context
 */
/**
 * @typedef {import('./notion').BlockObjectResponse} BlockObjectResponse
 */
/**
 * @typedef {Object} RecursiveBlock A block and its children
 * @property {BlockObjectResponse} block The block
 * @property {RecursiveBlock[]} children The children of the block
 */
/**
 * @typedef {Object.<String, Object>} PageProperties The properties of a page
 */
/**
 * @typedef {Object} PageAndContent The page and its content
 * @property {Object} page The page
 * @property {RecursiveBlock} content The content of the page
 * @property {PageProperties} properties The properties of the page
 */
const { read_json } = require('./fileaccess')
const { ls_json } = require('./fileaccess')
const { create_read_context } = require('./context')

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
 * Get the value of a property
 * 
 * @param {Context} context The context object
 * @param {Object} property The property to get the value of
 * @returns {Promise<Object>} A promise that resolves to the value of the property
 */
const get_property_value = async (context, property) => {
    const { type } = property
    switch (type) {
        case 'title':
            return property.title.map((title_part) => title_part.plain_text).join('')
        case 'rich_text':
            return property.rich_text.map((rich_text_part) => rich_text_part.plain_text).join('')
        case 'number':
            return property.number
        case 'select':
            return property.select.name
        case 'multi_select':
            return property.multi_select.map((select) => select.name)
        case 'date':
            return property.date.start
        case 'formula':
            return property.formula.string
        case 'relation':
            return property.relation.map((relation) => relation.id)
        case 'rollup':
            return property.rollup.array.map((rollup) => rollup.value)
        case 'people':
            return property.people.map((person) => person.id)
        case 'files':
            return property.files.map((file) => file.name)
        case 'checkbox':
            return property.checkbox
        case 'url':
            return property.url
        case 'email':
            return property.email
        case 'phone_number':
            return property.phone_number
        case 'created_time':
            return property.created_time
        case 'created_by':
            return property.created_by.id
        case 'last_edited_time':
            return property.last_edited_time
        case 'last_edited_by':
            return property.last_edited_by.id
        default:
            return null
    }
}

/**
 * Read the properties of a page from the backup
 * 
 * @param {Context} context The context object
 * @param {String} page_id The page ID to read the properties of
 * @returns {Promise<PageProperties>} A promise that resolves to the properties of the page
 */
const read_properties = async (context, page_id) => {
    const page = await read_json(context, 'pages', `${page_id}.json`)
    const { properties } = page
    const result = {}
    for (let property_name in properties) {
        const property = properties[property_name]
        const property_value = await get_property_value(context, property)
        result[property_name] = property_value
    }
    return result
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
    const properties = await read_properties(context, page_id)
    return {
        page,
        content,
        properties,
    }
}

/**
 * Export a rich text part as markdown
 * 
 * @param {Context} context The context object
 * @param {Object} rich_text_part The rich text part to export
 * @returns {Promise<String>} A promise that resolves to the markdown representation of the rich text part
 */
const export_rich_text_part_as_markdown = async (context, rich_text_part) => {
    let plain_text = rich_text_part.plain_text
    if (rich_text_part.annotations.bold) {
        plain_text = `**${plain_text}**`
    }
    if (rich_text_part.annotations.italic) {
        plain_text = `*${plain_text}*`
    }
    if (rich_text_part.annotations.strikethrough) {
        plain_text = `~~${plain_text}~~`
    }
    if (rich_text_part.annotations.underline) {
        plain_text = `__${plain_text}__`
    }
    if (rich_text_part.annotations.code) {
        plain_text = `\`${plain_text}\``
    }
    if (rich_text_part.annotations.color && rich_text_part.annotations.color !== 'default') {
        plain_text = `<span style="color: ${rich_text_part.annotations.color}">${plain_text}</span>`
    }
    if (rich_text_part.href) {
        if (rich_text_part.type === 'mention' && rich_text_part.mention && rich_text_part.mention.type === 'page') {
            const page_title = await get_page_title(context, rich_text_part.mention.page.id)
            if (page_title) {
                plain_text = page_title
            }
        }
        plain_text = `[${plain_text}](${rich_text_part.href})`
    }
    return plain_text
}

/**
 * Export rich text as markdown
 * 
 * @param {Context} context The context object
 * @param {Object[]} rich_text The rich text to export
 * @returns {Promise<String>} A promise that resolves to the markdown representation of the rich text
 */
const export_rich_text_as_markdown = async (context, rich_text) => {
    return await Promise.all(rich_text.map(async (rich_text_part) => await export_rich_text_part_as_markdown(context, rich_text_part))).then((parts) => parts.join(''))
}

/**
 * Export a caption as markdown
 * 
 * @param {Context} context The context object
 * @param {Object} caption The caption to export
 * @param {String} default_value The default value to use if the caption is empty
 * @returns {Promise<String>} A promise that resolves to the markdown representation of the caption
 */
const export_caption_as_markdown = async (context, caption, default_value) => {
    let caption_text = await export_rich_text_as_markdown(context, caption)
    if (!caption_text || caption_text === '') {
        return default_value
    }
    return caption_text
}

/**
 * Get the title of a page
 * 
 * @param {Context} context The context object
 * @param {String} page_id The page ID to get the title of
 * @returns {Promise<String>} A promise that resolves to the title of the page
 */
const get_page_title = async (context, page_id) => {
    const block = await read_block(context, page_id)
    if (!block) {
        return null
    }
    if (!block.type) {
        return null
    }
    if (block.type !== 'child_page') {
        return null
    }
    if (!block.child_page) {
        return null
    }
    if (!block.child_page.title) {
        return null
    }
    if (block.child_page.title.length === 0) {
        return null
    }
    return block.child_page.title
}

/**
 * Export the children of a block as markdown
 * 
 * @param {Context} context The context object
 * @param {RecursiveBlock[]} children The children to export
 * @param {Object} options The options to use
 * @param {String[]} level The level of the children
 * @returns {Promise<String[]>} A promise that resolves to the markdown representation of the children
 */
const export_children_blocks_as_markdown = async (context, children, options, level) => {
    const child_promises = children.map(async (child) => await export_block_as_markdown(context, child, options, level))
    const lines = (await Promise.all(child_promises)).flat()
    return lines
}

/**
 * Export a block as markdown
 * 
 * @param {Context} context The context object
 * @param {RecursiveBlock} recusive_block The block to export
 * @param {Object} options The options to use
 * @param {String[]} level The level of the block
 * @returns {Promise<String[]>} A promise that resolves to the markdown representation of the block
 */
const export_block_as_markdown = async (context, recusive_block, options, level) => {
    if (!level) {
        level = []
    }
    // console.log({ recusive_block })
    const block = recusive_block.block
    const children = recusive_block.children
    const block_type = block.type
    const block_id = block.id
    let line = null
    let lines = null
    let caption = null
    switch (block_type) {
        case 'paragraph':
            return [level.join('') + await export_rich_text_as_markdown(context, block.paragraph.rich_text), level.join('')]
        case 'quote':
            line = level.join('') + '> ' + await export_rich_text_as_markdown(context, block.quote.rich_text)
            lines = await export_children_blocks_as_markdown(context, children, options, [...level, '> '])
            return [line, [level, '> '].join(''), ...lines, level.join('')]
        case 'child_page':
            line = level.join('') + '# ' + block.child_page.title
            lines = await export_children_blocks_as_markdown(context, children, options, level)
            return [line, level.join(''), ...lines]
        case 'heading_1':
            line = level.join('') + '# ' + await export_rich_text_as_markdown(context, block.heading_1.rich_text)
            return [line, '']
        case 'synced_block':
            lines = await export_children_blocks_as_markdown(context, children, options, level)
            return [...lines]
        case 'bulleted_list_item':
            line = level.join('') + '* ' + await export_rich_text_as_markdown(context, block.bulleted_list_item.rich_text)
            return [line]
        case 'toggle':
            line = level.join('') + '- ' + await export_rich_text_as_markdown(context, block.toggle.rich_text)
            lines = await export_children_blocks_as_markdown(context, children, options, [...level, '  '])
            return [line, level.join(''), ...lines]
        case 'divider':
            return [level.join('') + '---']
        case 'image':
            caption = await export_caption_as_markdown(context, block.image.caption, block.image.file.local_url.split('/').pop())
            line = level.join('') + `![${caption}](${block.image.file.local_url})`
            return [line]
        case 'embed':
            caption = await export_caption_as_markdown(context, block.embed.caption, block.embed.url)
            line = level.join('') + `![${caption}](${block.embed.url})`
            return [line]
    }
    return `Unknown block type: ${block_type} (${block_id})`
}

/**
 * Export a page as markdown
 * 
 * @param {Context} context The context object
 * @param {PageAndContent} page_and_content The page to export
 * @returns {Promise<String>} A promise that resolves to the markdown representation of the page
 */
const export_page_as_markdown = async (context, page_and_content) => {
    const lines = await export_block_as_markdown(context, page_and_content.content, {}, [])
    // console.log({ lines })
    return lines.join('\n')
}

/**
 * Read a Notion workspace
 * 
 * @param {String} export_path The path to the data directory
 * @param {String} block_id The block ID to read
 * @returns {Promise<void>} A promise that resolves when the workspace is read
 */
const read_backup = async (export_path, block_id) => {
    const context = await create_read_context(export_path)

    const block_ids = await page_ls(context)
    if (block_ids.indexOf(block_id) > -1) {
        const page_and_content = await page_read_recursive(context, block_id)
        JSON.stringify(page_and_content, null, 4).split('\n').forEach((line) => console.log(line))
        const result = await export_page_as_markdown(context, page_and_content)
        console.log(result)
    }
}

exports.page_ls = page_ls
exports.page_read = page_read
exports.block_ls = block_ls
exports.read_block = read_block
exports.recursive_block_read = recursive_block_read
exports.page_read_recursive = page_read_recursive
exports.export_page_as_markdown = export_page_as_markdown
exports.read_backup = read_backup