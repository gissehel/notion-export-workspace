/**
 * Get a time ID
 * 
 * @returns {String} A time ID
 */
const get_time_id = () => (new Date()).toISOString().replace('T', '_').replaceAll('-', '').replaceAll(':', '').split('.')[0]

/**
 * Get a time ID
 * 
 * @returns {String} A time ID
 */
const get_fine_time_id = () => {
    const [base, ext] = (new Date()).toISOString().replace('T', '_').replaceAll('-', '').replaceAll(':', '').replace('Z', '').split('.')
    return `${base}_${ext.padStart(3, '0')}`
}

/**
 * Delay a promise
 * 
 * @param {Number} timeout The timeout in milliseconds
 * @returns {Promise<void>} A promise that resolves when the timeout is complete
 */
const delay = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

exports.get_time_id = get_time_id;
exports.get_fine_time_id = get_fine_time_id;
exports.delay = delay;
