import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { MarkdownTextSplitter, MarkdownTextSplitterParams } from 'langchain/text_splitter'
import { NodeHtmlMarkdown } from 'node-html-markdown'

class HtmlToMarkdownTextSplitter_TextSplitters implements INode {
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
        this.label = 'HtmlToMarkdown 文本切分器'
        this.name = 'htmlToMarkdownTextSplitter'
        this.type = 'HtmlToMarkdown 文本切分器'
        this.icon = 'htmlToMarkdownTextSplitter.svg'
        this.category = 'Text Splitters'
        this.categoryName = '文本切分器'
        this.description = `将Html格式转换为Markdown格式,然后根据Markdown中的标题拆分内容成多个文档。`
        this.baseClasses = [this.type, ...getBaseClasses(HtmlToMarkdownTextSplitter)]
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

        const obj = {} as MarkdownTextSplitterParams

        if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10)
        if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10)

        const splitter = new HtmlToMarkdownTextSplitter(obj)

        return splitter
    }
}
class HtmlToMarkdownTextSplitter extends MarkdownTextSplitter implements MarkdownTextSplitterParams {
    constructor(fields?: Partial<MarkdownTextSplitterParams>) {
        {
            super(fields)
        }
    }
    splitText(text: string): Promise<string[]> {
        return new Promise((resolve) => {
            const markdown = NodeHtmlMarkdown.translate(text)
            super.splitText(markdown).then((result) => {
                resolve(result)
            })
        })
    }
}
module.exports = { nodeClass: HtmlToMarkdownTextSplitter_TextSplitters }
