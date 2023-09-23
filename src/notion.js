/**
 * @typedef {import('./context').Context} Context
 */
/**
 * @typedef {import('@notionhq/client/build/src/api-endpoints').PageObjectResponse} PageObjectResponse
 * @typedef {import('@notionhq/client/build/src/api-endpoints').SelectPropertyResponse} SelectPropertyResponse
 * @typedef {import('@notionhq/client/build/src/api-endpoints').DateResponse} DateResponse
 * @typedef {import('@notionhq/client/build/src/api-endpoints').PartialUserObjectResponse} PartialUserObjectResponse
 * @typedef {import('@notionhq/client/build/src/api-endpoints').UserObjectResponse} UserObjectResponse
 * @typedef {import('@notionhq/client/build/src/api-endpoints').FormulaPropertyResponse} FormulaPropertyResponse
 * @typedef {import('@notionhq/client/build/src/api-endpoints').VerificationPropertyUnverifiedResponse} VerificationPropertyUnverifiedResponse
 * @typedef {import('@notionhq/client/build/src/api-endpoints').VerificationPropertyResponse} VerificationPropertyResponse
 * @typedef {import('@notionhq/client/build/src/api-endpoints').RichTextItemResponse} RichTextItemResponse
 * @typedef {import('@notionhq/client/build/src/api-endpoints').RollupFunction} RollupFunction
 * @typedef {import('@notionhq/client/build/src/api-endpoints').BlockObjectResponse} BlockObjectResponse
 * @typedef {import('./context').Context} Context
 */

/**
 * @typedef {import('@notionhq/client/build/src/api-endpoints').DatabaseObjectResponse} DatabaseObjectResponse
 */

const { get_notion } = require('./context')
const { write_action } = require('./repo-writer')
// const { write_debug } = require('./repo-writer')
const { delay } = require('./utils')

/**
 * @typedef {Object} NumberPropertyResponsePart
 * @property {number | null} number
 * @property {string} id
 * @property {"number"} type
 */

/**
 * @typedef {Object} UrlPropertyResponsePart
 * @property {string | null} url
 * @property {string} id
 * @property {"url"} type
 */

/**
 * @typedef {Object} SelectPropertyResponsePart
 * @property {string} id
 * @property {"select"} type
 * @property {SelectPropertyResponse} select
 */

/**
 * @typedef {Object} MultiSelectPropertyResponsePart
 * @property {string} id
 * @property {"multi_select"} type
 * @property {Array<SelectPropertyResponse>} multi_select
 */

/**
 * @typedef {Object} StatusPropertyResponsePart
 * @property {string} id
 * @property {"status"} type
 * @property {SelectPropertyResponse} status
 */

/**
 * @typedef {Object} DatePropertyResponsePart
 * @property {string} id
 * @property {"date"} type
 * @property {DateResponse} date
 */

/**
 * @typedef {Object} EmailPropertyResponsePart
 * @property {string | null} email
 * @property {string} id
 * @property {"email"} type
 */

/**
 * @typedef {Object} PhoneNumberPropertyResponsePart
 * @property {string | null} phone_number
 * @property {string} id
 * @property {"phone_number"} type
 */

/**
 * @typedef {Object} CheckboxPropertyResponsePart
 * @property {boolean} checkbox
 * @property {string} id
 * @property {"checkbox"} type
 */

/**
 * @typedef {Object} FilePropertyResponsePart
 * @property {Array<{ file: { url: string; expiry_time: string; }; name: StringRequest; type?: "file"; } | { external: { url: TextRequest; }; name: StringRequest; type?: "external"; }>} files
 * @property {string} id
 * @property {"files"} type
 */

/**
 * @typedef {Object} CreatedByPropertyResponsePart
 * @property {PartialUserObjectResponse | UserObjectResponse} created_by
 * @property {string} id
 * @property {"created_by"} type
 */

/**
 * @typedef {Object} CreatedTimePropertyResponsePart
 * @property {string} created_time
 * @property {string} id
 * @property {"created_time"} type
 */

/**
 * @typedef {Object} LastEditedByPropertyResponsePart
 * @property {PartialUserObjectResponse | UserObjectResponse} last_edited_by
 * @property {string} id
 * @property {"last_edited_by"} type
 */

/**
 * @typedef {Object} LastEditedTimePropertyResponsePart
 * @property {string} last_edited_time
 * @property {string} id
 * @property {"last_edited_time"} type
 */

/**
 * @typedef {Object} FormulaPropertyResponsePart
 * @property {FormulaPropertyResponse} formula
 * @property {string} id
 * @property {"formula"} type
 */

/**
 * @typedef {Object} UniqueIdPropertyResponsePart
 * @property {string} id
 * @property {"unique_id"} type
 * @property {{ prefix: string | null; number: number | null; }} unique_id
 */

/**
 * @typedef {Object} VerificationPropertyResponsePart
 * @property {string} id
 * @property {"verification"} type
 * @property {VerificationPropertyUnverifiedResponse | null | VerificationPropertyResponse | null} verification
 */

/**
 * @typedef {Object} TitlePropertyResponsePart
 * @property {Array<RichTextItemResponse>} title
 * @property {string} id
 * @property {"title"} type
 */

/**
 * @typedef {Object} RichTextPropertyResponsePart
 * @property {Array<RichTextItemResponse>} rich_text
 * @property {string} id
 * @property {"rich_text"} type
 */

/**
 * @typedef {Object} PeoplePropertyResponsePart
 * @property {string} id
 * @property {"people"} type
 * @property {Array<PartialUserObjectResponse | UserObjectResponse>} people
 */

/**
 * @typedef {Object} RelationPropertyResponsePart
 * @property {string} id
 * @property {"relation"} type
 * @property {Array<{ id: string; }>} relation
 */

/**
 * @typedef {Object} RollupPropertyResponsePart
 * @property {string} id
 * @property {"rollup"} type
 * @property {Object} rollup
 */

/**
 * @typedef { NumberPropertyResponsePart | UrlPropertyResponsePart | SelectPropertyResponsePart | MultiSelectPropertyResponsePart | StatusPropertyResponsePart | DatePropertyResponsePart | EmailPropertyResponsePart | PhoneNumberPropertyResponsePart | CheckboxPropertyResponsePart | FilePropertyResponsePart | CreatedByPropertyResponsePart | CreatedTimePropertyResponsePart | LastEditedByPropertyResponsePart | LastEditedTimePropertyResponsePart | FormulaPropertyResponsePart | UniqueIdPropertyResponsePart | VerificationPropertyResponsePart | TitlePropertyResponsePart | RichTextPropertyResponsePart | PeoplePropertyResponsePart | RelationPropertyResponsePart | RollupPropertyResponsePart } PropertyResponse
 */

/**
 * @typedef { Record<String, PropertyResponse> } PagePropertiesResponse
 */

/**
 * @typedef {Object} PaginatedResults<T> A paginated result
 * @property {String} object The object type of the results
 * @property {boolean} has_more The has more flag of the results
 * @property {String} next_cursor The next cursor of the results
 * @property {T[]} results The results of the call
 * @template T The type of the results
 */

/**
 * The property types that are limited in length
 * 
 * @type {String[]}
 */
const limited_property_types = ['people', 'relation', 'rich_text', 'title']

/**
 * Get a function that retrieves a page property
 * @param {Context} context The context object
 * @returns {({page_id: String, property_id: String}) => Promise<PaginatedResults<PropertyResponse>>} The function that retrieves a page property
 */
const get_page_property_getter = (context) => get_notion(context).pages.properties.retrieve

/**
 * Get a function that retrieves a page
 * 
 * @param {Context} context The context object
 * @returns {({page_id: string}) => Promise<PageObjectResponse>} The function that retrieves a page
 */
const get_page_getter = (context) => get_notion(context).pages.retrieve

/**
 * Get a function that searches for pages
 * 
 * @param {Context} context The context object
 * @returns {(struct: Object) => Promise<PaginatedResults<PageObjectResponse>>} The function that searches for pages
 */
const get_all_pages_getter = (context) => get_notion(context).search

/**
 * Get a function that retrieves a block
 * 
 * @param {Context} context The context object
 * @returns {({block_id: string}) => Promise<BlockObjectResponse>} The function that retrieves a block
 */
const get_block_getter = (context) => get_notion(context).blocks.retrieve

/**
 * Get a function that retrieves the subblocks of a block
 * 
 * @param {Context} context 
 * @returns {(struct: Object) => Promise<PaginatedResults<BlockObjectResponse>>} The function that retrieves the subblocks of a block
 */
const get_subblocks_getter = (context) => {
    const notion = get_notion(context)
    return (struct) => notion.blocks.children.list(struct)
}

/**
 * Get the title of a page
 * 
 * @param {PageObjectResponse} page_struct The page structure
 * @returns {String|undefined} The page title or undefined if the page has no title
 */

const get_title = (page_struct) => {
    const { properties } = page_struct
    if (properties === undefined) {
        return undefined
    }
    const title_substructs = Object.values(properties).filter((property) => property.type === 'title')[0].title
    return title_substructs.map((title_substruct) => title_substruct.plain_text).join('')
}

/**
 * Perform a call
 * 
 * @param {Context} context The context object
 * @param {(context: Context, struct: Object)=>Promise<Object>} call The call to make
 * @param {Object} call_properties The properties to pass to the call
 * @param {String} logid The log ID
 * @template T The type of the result
 * @returns {Promise<T>} A promise that resolves when the call is made
 */
const perform_call = async (context, call, call_properties, logid) => {
    const log_details = `${JSON.stringify(call_properties)}`
    console.log(`Calling "${logid}" with ${log_details}`)
    let result = null
    let cont = 10
    let has_error = false
    while (cont > 0) {
        try {
            result = await call({
                ...call_properties,
            })
            cont = 0
            if (has_error) {
                write_action(context, `Recovered:  ${logid}/${log_details}`)
                has_error = true
            }
        } catch (e) {
            write_action(context, `Error:  ${logid}/${log_details} ${e.message} (retries: ${cont})`)
            cont -= 1
            has_error = true
            await delay(5000)
        }
    }
    if (has_error) {
        write_action(context, `Failed:  ${logid}/${log_details}`)
    }
    // await write_debug(context, logid+'-in', call_properties)
    // await write_debug(context, logid+'-out', result)
    return result
}

/**
 * Retrieve paginated calls
 * 
 * @param {Context} context The context object
 * @param {(struct: Object)=>Promise<PaginatedResults<T>} call The call to make
 * @param {Object} call_properties The properties to pass to the call
 * @param {String} logid The log ID
 * @param {(context: Context, struct: PaginatedResults<T>)=>Promise<void>, [input]: Object} on_call? The function to call on each call
 * @param {(context: Context, struct: T, [input]:Object)=>Promise<void>} on_result The function to call on each result
 * @template T The type of the result
 * @returns {Promise<void>} A promise that resolves when all the calls are made
 */
const retrieve_paginated_cursor_calls = async (context, call, call_properties, logid, on_call, on_result) => {
    let search_results = await perform_call(context, call, call_properties, logid)

    // await write_debug(context, logid, search_results)
    if (on_call) {
        await on_call(context, search_results, call_properties)
    }
    for (const result of search_results.results) {
        await on_result(context, result, call_properties)
    }
    while (search_results.has_more) {
        const next_call_properties = {
            ...call_properties,
            start_cursor: search_results.next_cursor,
        }
        search_results = await perform_call(context, call, next_call_properties, logid+"_next")

        // await write_debug(context, logid, search_results)
        if (on_call) {
            await on_call(context, search_results, call_properties)
        }
        for (const result of search_results.results) {
            await on_result(context, result, call_properties)
        }
    }
}

/**
 * Retrieve a simple call
 * 
 * @param {Context} context The context object
 * @param {(struct: Object)=>Promise<T>} call The call to make
 * @param {Object} call_properties The properties to pass to the call
 * @param {String} logid The log ID
 * @template T The type of the result
 * @returns {Promise<T>} A promise that resolves when the call is made
 */
const retrieve_simple_call = async (context, call, call_properties, logid) => {
    return await perform_call(context, call, call_properties, logid)
}

exports.limited_property_types = limited_property_types
exports.get_page_getter = get_page_getter
exports.get_page_property_getter = get_page_property_getter
exports.get_all_pages_getter = get_all_pages_getter
exports.get_subblocks_getter = get_subblocks_getter
exports.get_block_getter = get_block_getter
exports.get_title = get_title
exports.retrieve_paginated_cursor_calls = retrieve_paginated_cursor_calls
exports.retrieve_simple_call = retrieve_simple_call
