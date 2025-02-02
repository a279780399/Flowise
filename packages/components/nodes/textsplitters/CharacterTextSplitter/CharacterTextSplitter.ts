import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { CharacterTextSplitter, CharacterTextSplitterParams } from 'langchain/text_splitter'

class CharacterTextSplitter_TextSplitters implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    categoryName: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '字符文本切分器'
        this.name = 'characterTextSplitter'
        this.type = '字符文本拆分器'
        this.icon = 'textsplitter.svg'
        this.category = 'Text Splitters'
        this.categoryName = '文本切分器'
        this.description = `根据特定字符来实现,默认使用两个连续的换行符(\\n\\n)作为拆分标志。`
        this.baseClasses = [this.type, ...getBaseClasses(CharacterTextSplitter)]
        this.inputs = [
            {
                label: '分隔符',
                name: 'separator',
                type: 'string',
                optional: true
            },
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
        const separator = nodeData.inputs?.separator as string
        const chunkSize = nodeData.inputs?.chunkSize as string
        const chunkOverlap = nodeData.inputs?.chunkOverlap as string

        const obj = {} as CharacterTextSplitterParams

        if (separator) obj.separator = separator
        if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10)
        if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10)

        const splitter = new CharacterTextSplitter(obj)

        return splitter
    }
}

module.exports = { nodeClass: CharacterTextSplitter_TextSplitters }
