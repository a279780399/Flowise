import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { Embeddings } from 'langchain/embeddings/base'
import { Document } from 'langchain/document'
import { getBaseClasses } from '../../../src/utils'
import { SingleStoreVectorStore, SingleStoreVectorStoreConfig } from 'langchain/vectorstores/singlestore'
import { flatten } from 'lodash'

class SingleStoreUpsert_VectorStores implements INode {
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
        this.label = 'SingleStore 向量更新插入'
        this.name = 'singlestoreUpsert'
        this.type = 'SingleStore'
        this.icon = 'singlestore.svg'
        this.category = 'Vector Stores'
        this.categoryName = '向量存储'
        this.description = '将文档向量上传并合并到SingleStore的向量索引中,如果文档已经存在就更新向量,如果不存在就插入新的向量。'
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
                label: '主机',
                name: 'host',
                type: 'string'
            },
            {
                label: '用户名',
                name: 'user',
                type: 'string'
            },
            {
                label: '密码',
                name: 'password',
                type: 'password'
            },
            {
                label: '数据库',
                name: 'database',
                type: 'string'
            },
            {
                label: '表名称',
                name: 'tableName',
                type: 'string',
                placeholder: 'embeddings',
                additionalParams: true,
                optional: true
            },
            {
                label: '内容字段名称',
                name: 'contentColumnName',
                type: 'string',
                placeholder: 'content',
                additionalParams: true,
                optional: true
            },
            {
                label: '向量字段名称',
                name: 'vectorColumnName',
                type: 'string',
                placeholder: 'vector',
                additionalParams: true,
                optional: true
            },
            {
                label: '元数据字段名称',
                name: 'metadataColumnName',
                type: 'string',
                placeholder: 'metadata',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Top K',
                name: 'topK',
                placeholder: '获取前K个结果,K的默认值为4。',
                type: 'number',
                additionalParams: true,
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'SingleStore 检索器',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'SingleStore 向量存储',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(SingleStoreVectorStore)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const singleStoreConnectionConfig = {
            connectionOptions: {
                host: nodeData.inputs?.host as string,
                port: 3306,
                user: nodeData.inputs?.user as string,
                password: nodeData.inputs?.password as string,
                database: nodeData.inputs?.database as string
            },
            ...(nodeData.inputs?.tableName ? { tableName: nodeData.inputs.tableName as string } : {}),
            ...(nodeData.inputs?.contentColumnName ? { contentColumnName: nodeData.inputs.contentColumnName as string } : {}),
            ...(nodeData.inputs?.vectorColumnName ? { vectorColumnName: nodeData.inputs.vectorColumnName as string } : {}),
            ...(nodeData.inputs?.metadataColumnName ? { metadataColumnName: nodeData.inputs.metadataColumnName as string } : {})
        } as SingleStoreVectorStoreConfig

        const docs = nodeData.inputs?.document as Document[]
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        const flattenDocs = docs && docs.length ? flatten(docs) : []
        const finalDocs = []
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new Document(flattenDocs[i]))
        }

        let vectorStore: SingleStoreVectorStore

        vectorStore = new SingleStoreVectorStore(embeddings, singleStoreConnectionConfig)
        vectorStore.addDocuments.bind(vectorStore)(finalDocs)

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

module.exports = { nodeClass: SingleStoreUpsert_VectorStores }
