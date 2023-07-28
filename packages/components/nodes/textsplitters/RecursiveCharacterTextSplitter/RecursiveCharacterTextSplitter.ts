import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { RecursiveCharacterTextSplitter, RecursiveCharacterTextSplitterParams } from 'langchain/text_splitter'

class RecursiveCharacterTextSplitter_TextSplitters implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '递归字符文本切分器'
        this.name = 'recursiveCharacterTextSplitter'
        this.type = '递归字符文本切分器'
        this.icon = 'textsplitter.svg'
        this.category = '文本切分器'
        this.description = `使用不同的字符递归地拆分文档,首先使用"\\n\\n",然后使用"\\n",最后使用" "`
        this.baseClasses = [this.type, ...getBaseClasses(RecursiveCharacterTextSplitter)]
        this.inputs = [
            {
                label: '块大小',
                name: 'chunkSize',
                type: 'number',
                default: 1000,
                optional: true
            },
            {
                label: '块重叠',
                name: 'chunkOverlap',
                type: 'number',
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const chunkSize = nodeData.inputs?.chunkSize as string
        const chunkOverlap = nodeData.inputs?.chunkOverlap as string

        const obj = {} as RecursiveCharacterTextSplitterParams

        if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10)
        if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10)

        const splitter = new RecursiveCharacterTextSplitter(obj)

        return splitter
    }
}

module.exports = { nodeClass: RecursiveCharacterTextSplitter_TextSplitters }
