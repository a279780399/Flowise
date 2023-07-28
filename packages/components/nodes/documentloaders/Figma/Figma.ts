import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { FigmaFileLoader, FigmaLoaderParams } from 'langchain/document_loaders/web/figma'

class Figma_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Figma'
        this.name = 'figma'
        this.type = 'Document'
        this.icon = 'figma.png'
        this.category = '文档加载器'
        this.description = '加载Figma文件'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: '访问令牌',
                name: 'accessToken',
                type: 'password',
                placeholder: '<FIGMA_ACCESS_TOKEN>'
            },
            {
                label: '文件Key',
                name: 'fileKey',
                type: 'string',
                placeholder: 'key'
            },
            {
                label: '节点IDs',
                name: 'nodeIds',
                type: 'string',
                placeholder: '0, 1, 2'
            },
            {
                label: '递归',
                name: 'recursive',
                type: 'boolean',
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
        const accessToken = nodeData.inputs?.accessToken as string
        const nodeIds = (nodeData.inputs?.nodeIds as string)?.split(',') || []
        const fileKey = nodeData.inputs?.fileKey as string

        const options: FigmaLoaderParams = {
            accessToken,
            nodeIds,
            fileKey
        }

        const loader = new FigmaFileLoader(options)
        const docs = await loader.load()

        return docs
    }
}

module.exports = { nodeClass: Figma_DocumentLoaders }
