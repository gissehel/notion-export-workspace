const { program } = require('commander');
const { export_notion_workspace } = require('./export')
const { export_pages } = require('./export')
const { export_all_databases } = require('./export')
const { read_backup } = require('./backup-reader')

program
    .version('0.0.1')
    .description('Notion workspace exporter')

program
    .command('export')
    .description('Export a Notion workspace')
    .option('-p, --path <path>', 'Export path', process.env.NOTION_EXPORT_PATH)
    .option('-t, --token <token>', 'Notion token', process.env.NOTION_TOKEN)
    .action((options) => {
        export_notion_workspace(options.token, options.path)
    })

const collect_list = (item, value) => {
    value.push(item)
    return value
}

program
    .command('export_pages')
    .description('Export Notion pages')
    .option('-p, --path <path>', 'Export path', process.env.NOTION_EXPORT_PATH)
    .option('-t, --token <token>', 'Notion token', process.env.NOTION_TOKEN)
    .option('-i, --ids <ids>', 'Page IDs', collect_list, [])
    .action((options) => {
        export_pages(options.token, options.path, options.ids)
    })

program
    .command('export_databases')
    .description('Export Notion databases')
    .option('-p, --path <path>', 'Export path', process.env.NOTION_EXPORT_PATH)
    .option('-t, --token <token>', 'Notion token', process.env.NOTION_TOKEN)
    .action((options) => {
        export_all_databases(options.token, options.path)
    })

program
    .command('read_block')
    .description('Read a Notion block')
    .option('-p, --path <path>', 'Export path', process.env.NOTION_EXPORT_PATH)
    .option('-b, --block <block>', 'Block ID', process.env.BLOCK_ID)
    .action((options) => {
        console.log({ options })
        read_backup(options.path, options.block)
    })

program.parse(process.argv)