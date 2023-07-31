import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { TextLoader } from 'langchain/document_loaders/fs/text'

class Text_DocumentLoaders implements INode {
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
        this.label = 'Text文件'
        this.name = 'textFile'
        this.type = 'Document'
        this.icon = 'textFile.svg'
        this.category = 'Document Loaders'
        this.categoryName = '文档加载器'
        this.description = `从text文件加载数据`
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Txt文件',
                name: 'txtFile',
                type: 'file',
                fileType: '.txt'
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
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const txtFileBase64 = nodeData.inputs?.txtFile as string
        const metadata = nodeData.inputs?.metadata

        let alldocs = []
        let files: string[] = []

        if (txtFileBase64.startsWith('[') && txtFileBase64.endsWith(']')) {
            files = JSON.parse(txtFileBase64)
        } else {
            files = [txtFileBase64]
        }

        for (const file of files) {
            const splitDataURI = file.split(',')
            splitDataURI.pop()
            const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
            const blob = new Blob([bf])
            const loader = new TextLoader(blob)

            if (textSplitter) {
                const docs = await loader.loadAndSplit(textSplitter)
                alldocs.push(...docs)
            } else {
                const docs = await loader.load()
                alldocs.push(...docs)
            }
        }

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            let finaldocs = []
            for (const doc of alldocs) {
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
        return alldocs
    }
}

module.exports = { nodeClass: Text_DocumentLoaders }
