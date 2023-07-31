import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { GitbookLoader } from 'langchain/document_loaders/web/gitbook'

class Gitbook_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    categoryName: string
    baseClasses: string[]
    inputs?: INodeParams[]

    constructor() {
        this.label = 'GitBook'
        this.name = 'gitbook'
        this.type = 'Document'
        this.icon = 'gitbook.svg'
        this.category = 'Document Loaders'
        this.categoryName = '文档加载器'
        this.description = `加载GitBook数据`
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Web路径',
                name: 'webPath',
                type: 'string',
                placeholder: 'https://docs.gitbook.com/product-tour/navigation',
                description: '如果要加载GitBook中的所有路径,只需要提供根路径,例如:https://docs.gitbook.com/'
            },
            {
                label: '加载所有路径',
                name: 'shouldLoadAllPaths',
                type: 'boolean',
                description: '从给定GitBook中的所有路径加载',
                optional: true
            },
            {
                label: '文本切分器',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
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
        const webPath = nodeData.inputs?.webPath as string
        const shouldLoadAllPaths = nodeData.inputs?.shouldLoadAllPaths as boolean
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const metadata = nodeData.inputs?.metadata

        const loader = shouldLoadAllPaths ? new GitbookLoader(webPath, { shouldLoadAllPaths }) : new GitbookLoader(webPath)

        const docs = textSplitter ? await loader.loadAndSplit() : await loader.load()

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            return docs.map((doc) => {
                return {
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        ...parsedMetadata
                    }
                }
            })
        }

        return docs
    }
}

module.exports = {
    nodeClass: Gitbook_DocumentLoaders
}
