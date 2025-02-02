import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { OpenSearchVectorStore } from 'langchain/vectorstores/opensearch'
import { Embeddings } from 'langchain/embeddings/base'
import { Document } from 'langchain/document'
import { Client } from '@opensearch-project/opensearch'
import { flatten } from 'lodash'
import { getBaseClasses } from '../../../src/utils'

class OpenSearchUpsert_VectorStores implements INode {
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
        this.label = 'OpenSearch 向量更新插入'
        this.name = 'openSearchUpsertDocument'
        this.type = 'OpenSearch'
        this.icon = 'opensearch.png'
        this.category = 'Vector Stores'
        this.categoryName = '向量存储'
        this.description = '将文档向量上传并合并到OpenSearch的向量索引中,如果文档已经存在就更新向量,如果不存在就插入新的向量。'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']
        this.inputs = [
            {
                label: '文档',
                name: 'document',
                type: 'Document',
                list: true
            },
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
        const docs = nodeData.inputs?.document as Document[]
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const opensearchURL = nodeData.inputs?.opensearchURL as string
        const indexName = nodeData.inputs?.indexName as string
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        const flattenDocs = docs && docs.length ? flatten(docs) : []
        const finalDocs = []
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new Document(flattenDocs[i]))
        }

        const client = new Client({
            nodes: [opensearchURL]
        })

        const vectorStore = await OpenSearchVectorStore.fromDocuments(finalDocs, embeddings, {
            client,
            indexName: indexName
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

module.exports = { nodeClass: OpenSearchUpsert_VectorStores }
