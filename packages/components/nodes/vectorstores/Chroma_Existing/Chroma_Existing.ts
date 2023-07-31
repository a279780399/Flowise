import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { Chroma } from 'langchain/vectorstores/chroma'
import { Embeddings } from 'langchain/embeddings/base'
import { getBaseClasses } from '../../../src/utils'

class Chroma_Existing_VectorStores implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    categoryName: string
    baseClasses: string[]
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'Chroma 向量加载器'
        this.name = 'chromaExistingIndex'
        this.type = 'Chroma'
        this.icon = 'chroma.svg'
        this.category = 'Vector Stores'
        this.categoryName = '向量存储'
        this.description = '从Chroma向量数据库中加载已经存在的索引'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']
        this.inputs = [
            {
                label: '嵌入向量',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: '集合名称',
                name: 'collectionName',
                type: 'string'
            },
            {
                label: 'Chroma URL',
                name: 'chromaURL',
                type: 'string',
                optional: true
            },
            {
                label: 'Top K',
                name: 'topK',
                description: '获取前K个结果,K的默认值为4。',
                placeholder: '4',
                type: 'number',
                additionalParams: true,
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'Chroma 检索器',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Chroma 向量存储',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(Chroma)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const collectionName = nodeData.inputs?.collectionName as string
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const chromaURL = nodeData.inputs?.chromaURL as string
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        const obj: {
            collectionName: string
            url?: string
        } = { collectionName }
        if (chromaURL) obj.url = chromaURL

        const vectorStore = await Chroma.fromExistingCollection(embeddings, obj)

        if (output === 'retriever') {
            const retriever = vectorStore.asRetriever(k)
            return retriever
        } else if (output === 'vectorStore') {
            ;(vectorStore as any).k = k
            return vectorStore
        }
        return vectorStore
    }
}

module.exports = { nodeClass: Chroma_Existing_VectorStores }
