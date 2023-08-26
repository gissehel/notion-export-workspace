const token = process.env.NOTION_TOKEN
const export_path = process.env.NOTION_EXPORT_PATH

const { export_notion_workspace } = require('./export')

export_notion_workspace(token, export_path)
