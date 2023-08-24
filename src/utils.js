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

exports.get_time_id = get_time_id;
exports.get_fine_time_id = get_fine_time_id;
    