import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { OpenSearchVectorStore } from 'langchain/vectorstores/opensearch'
import { Embeddings } from 'langchain/embeddings/base'
import { Client } from '@opensearch-project/opensearch'
import { getBaseClasses } from '../../../src/utils'

class OpenSearch_Existing_VectorStores implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'OpenSearch 向量加载器'
        this.name = 'openSearchExistingIndex'
        this.type = 'OpenSearch'
        this.icon = 'opensearch.png'
        this.category = '向量存储'
        this.description = '从OpenSearch向量数据库中加载已经存在的索引'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']
        this.inputs = [
            {
                label: '嵌入向量',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'OpenSearch URL',
                name: 'opensearchURL',
                type: 'string',
                placeholder: 'http://127.0.0.1:9200'
            },
            {
                label: '索引名称',
                name: 'indexName',
                type: 'string'
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
                label: 'OpenSearch 检索器',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'OpenSearch 向量存储',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(OpenSearchVectorStore)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const opensearchURL = nodeData.inputs?.opensearchURL as string
        const indexName = nodeData.inputs?.indexName as string
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        const client = new Client({
            nodes: [opensearchURL]
        })

        const vectorStore = new OpenSearchVectorStore(embeddings, {
            client,
            indexName
        })

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

module.exports = { nodeClass: OpenSearch_Existing_VectorStores }
