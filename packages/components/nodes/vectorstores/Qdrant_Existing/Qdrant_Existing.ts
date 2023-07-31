import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { QdrantClient } from '@qdrant/js-client-rest'
import { QdrantVectorStore, QdrantLibArgs } from 'langchain/vectorstores/qdrant'
import { Embeddings } from 'langchain/embeddings/base'
import { getBaseClasses } from '../../../src/utils'

class Qdrant_Existing_VectorStores implements INode {
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
        this.label = 'Qdrant 向量加载器'
        this.name = 'qdrantExistingIndex'
        this.type = 'Qdrant'
        this.icon = 'qdrant_logo.svg'
        this.category = 'Vector Stores'
        this.categoryName = '向量存储'
        this.description = '从Qdrant向量数据库中加载已经存在的索引'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']
        this.inputs = [
            {
                label: '嵌入向量',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'Qdrant URL',
                name: 'qdrantServerUrl',
                type: 'string',
                placeholder: 'http://localhost:6333'
            },
            {
                label: 'Qdrant集合名称',
                name: 'qdrantCollection',
                type: 'string'
            },
            {
                label: 'Qdrant API密钥',
                name: 'qdrantApiKey',
                type: 'password',
                optional: true
            },
            {
                label: 'Qdrant集合配置',
                name: 'qdrantCollectionCofiguration',
                type: 'json',
                optional: true,
                additionalParams: true
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
                label: 'Qdrant 检索器',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Qdrant 向量存储',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(QdrantVectorStore)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const qdrantServerUrl = nodeData.inputs?.qdrantServerUrl as string
        const collectionName = nodeData.inputs?.qdrantCollection as string
        const qdrantApiKey = nodeData.inputs?.qdrantApiKey as string
        let qdrantCollectionCofiguration = nodeData.inputs?.qdrantCollectionCofiguration
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        // connect to Qdrant Cloud
        const client = new QdrantClient({
            url: qdrantServerUrl,
            apiKey: qdrantApiKey
        })

        const dbConfig: QdrantLibArgs = {
            client,
            collectionName
        }

        if (qdrantCollectionCofiguration) {
            qdrantCollectionCofiguration =
                typeof qdrantCollectionCofiguration === 'object' ? qdrantCollectionCofiguration : JSON.parse(qdrantCollectionCofiguration)
            dbConfig.collectionConfig = qdrantCollectionCofiguration
        }

        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, dbConfig)

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

module.exports = { nodeClass: Qdrant_Existing_VectorStores }
