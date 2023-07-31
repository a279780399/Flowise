import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { PuppeteerWebBaseLoader } from 'langchain/document_loaders/web/puppeteer'
import { test } from 'linkifyjs'
import { webCrawl, xmlScrape } from '../../../src'

class Puppeteer_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Puppeteer 网页抓取器'
        this.name = 'puppeteerWebScraper'
        this.type = 'Document'
        this.icon = 'puppeteer.svg'
        this.category = '文档加载器'
        this.description = `加载网页数据`
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'URL',
                name: 'url',
                type: 'string'
            },
            {
                label: '文本切分器',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: '获取相对链接方法',
                name: 'relativeLinksMethod',
                type: 'options',
                description: '从HTML中获取相对链接的方法',
                options: [
                    {
                        label: '网络爬虫',
                        name: 'webCrawl',
                        description: '从HTML URL爬取相对链接的方法'
                    },
                    {
                        label: '抓取XML Sitemap',
                        name: 'scrapeXMLSitemap',
                        description: '从XML Sitemap URL爬取相对链接的方法'
                    }
                ],
                optional: true,
                additionalParams: true
            },
            {
                label: '获取相对链接限制',
                name: 'limit',
                type: 'number',
                optional: true,
                additionalParams: true,
                description: '只在选择了“获取相对链接方法”时使用。设置为0可以获取所有相对链接,默认限制是10。',
                warning: `获取所有链接可能需要很长时间,而且如果流的状态发生变化(例如不同的URL、分块大小等),所有链接将会再次被插入。`
            },
            {
                label: '元数据',
                name: 'metadata',
                type: 'json',
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const metadata = nodeData.inputs?.metadata
        const relativeLinksMethod = nodeData.inputs?.relativeLinksMethod as string
        let limit = nodeData.inputs?.limit as string

        let url = nodeData.inputs?.url as string
        url = url.trim()
        if (!test(url)) {
            throw new Error('Invalid URL')
        }

        async function puppeteerLoader(url: string): Promise<any> {
            try {
                let docs = []
                const loader = new PuppeteerWebBaseLoader(url, {
                    launchOptions: {
                        args: ['--no-sandbox'],
                        headless: 'new'
                    }
                })
                if (textSplitter) {
                    docs = await loader.loadAndSplit(textSplitter)
                } else {
                    docs = await loader.load()
                }
                return docs
            } catch (err) {
                if (process.env.DEBUG === 'true') console.error(`error in PuppeteerWebBaseLoader: ${err.message}, on page: ${url}`)
            }
        }

        let docs = []
        if (relativeLinksMethod) {
            if (process.env.DEBUG === 'true') console.info(`Start ${relativeLinksMethod}`)
            if (!limit) limit = '10'
            else if (parseInt(limit) < 0) throw new Error('Limit cannot be less than 0')
            const pages: string[] =
                relativeLinksMethod === 'webCrawl' ? await webCrawl(url, parseInt(limit)) : await xmlScrape(url, parseInt(limit))
            if (process.env.DEBUG === 'true') console.info(`pages: ${JSON.stringify(pages)}, length: ${pages.length}`)
            if (!pages || pages.length === 0) throw new Error('No relative links found')
            for (const page of pages) {
                docs.push(...(await puppeteerLoader(page)))
            }
            if (process.env.DEBUG === 'true') console.info(`Finish ${relativeLinksMethod}`)
        } else {
            docs = await puppeteerLoader(url)
        }

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            let finaldocs = []
            for (const doc of docs) {
                const newdoc = {
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        ...parsedMetadata
                    }
                }
                finaldocs.push(newdoc)
            }
            return finaldocs
        }

        return docs
    }
}

module.exports = { nodeClass: Puppeteer_DocumentLoaders }
