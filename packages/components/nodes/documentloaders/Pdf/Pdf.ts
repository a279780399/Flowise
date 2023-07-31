import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'

class Pdf_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Pdf文件'
        this.name = 'pdfFile'
        this.type = 'Document'
        this.icon = 'pdf.svg'
        this.category = '文档加载器'
        this.description = `从PDF文件加载数据`
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Pdf文件',
                name: 'pdfFile',
                type: 'file',
                fileType: '.pdf'
            },
            {
                label: '文本切分器',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: '使用方法',
                name: 'usage',
                type: 'options',
                options: [
                    {
                        label: '每页一个文档',
                        name: 'perPage'
                    },
                    {
                        label: '每个文件一个文档',
                        name: 'perFile'
                    }
                ],
                default: 'perPage'
            },
            {
                label: '使用旧版构建',
                name: 'legacyBuild',
                type: 'boolean',
                optional: true,
                additionalParams: true
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
        const pdfFileBase64 = nodeData.inputs?.pdfFile as string
        const usage = nodeData.inputs?.usage as string
        const metadata = nodeData.inputs?.metadata
        const legacyBuild = nodeData.inputs?.legacyBuild as boolean

        let alldocs = []
        let files: string[] = []

        if (pdfFileBase64.startsWith('[') && pdfFileBase64.endsWith(']')) {
            files = JSON.parse(pdfFileBase64)
        } else {
            files = [pdfFileBase64]
        }

        for (const file of files) {
            const splitDataURI = file.split(',')
            splitDataURI.pop()
            const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
            if (usage === 'perFile') {
                const loader = new PDFLoader(new Blob([bf]), {
                    splitPages: false,
                    pdfjs: () =>
                        // @ts-ignore
                        legacyBuild ? import('pdfjs-dist/legacy/build/pdf.js') : import('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js')
                })
                if (textSplitter) {
                    const docs = await loader.loadAndSplit(textSplitter)
                    alldocs.push(...docs)
                } else {
                    const docs = await loader.load()
                    alldocs.push(...docs)
                }
            } else {
                const loader = new PDFLoader(new Blob([bf]), {
                    pdfjs: () =>
                        // @ts-ignore
                        legacyBuild ? import('pdfjs-dist/legacy/build/pdf.js') : import('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js')
                })
                if (textSplitter) {
                    const docs = await loader.loadAndSplit(textSplitter)
                    alldocs.push(...docs)
                } else {
                    const docs = await loader.load()
                    alldocs.push(...docs)
                }
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

module.exports = { nodeClass: Pdf_DocumentLoaders }
