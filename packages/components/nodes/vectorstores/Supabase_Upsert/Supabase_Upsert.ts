import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { Embeddings } from 'langchain/embeddings/base'
import { Document } from 'langchain/document'
import { getBaseClasses } from '../../../src/utils'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { createClient } from '@supabase/supabase-js'
import { flatten } from 'lodash'

class SupabaseUpsert_VectorStores implements INode {
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
        this.label = 'Supabase 向量更新插入'
        this.name = 'supabaseUpsert'
        this.type = 'Supabase'
        this.icon = 'supabase.svg'
        this.category = 'Vector Stores'
        this.categoryName = '向量存储'
        this.description = '将文档向量上传并合并到Supabase的向量索引中,如果文档已经存在就更新向量,如果不存在就插入新的向量。'
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
                label: 'Supabase API密钥',
                name: 'supabaseApiKey',
                type: 'password'
            },
            {
                label: 'Supabase URL',
                name: 'supabaseProjUrl',
                type: 'string'
            },
            {
                label: '表名称',
                name: 'tableName',
                type: 'string'
            },
            {
                label: '查询名称',
                name: 'queryName',
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
                label: 'Supabase 检索器',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Supabase 向量存储',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(SupabaseVectorStore)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const supabaseApiKey = nodeData.inputs?.supabaseApiKey as string
        const supabaseProjUrl = nodeData.inputs?.supabaseProjUrl as string
        const tableName = nodeData.inputs?.tableName as string
        const queryName = nodeData.inputs?.queryName as string
        const docs = nodeData.inputs?.document as Document[]
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        const client = createClient(supabaseProjUrl, supabaseApiKey)

        const flattenDocs = docs && docs.length ? flatten(docs) : []
        const finalDocs = []
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new Document(flattenDocs[i]))
        }

        const vectorStore = await SupabaseVectorStore.fromDocuments(finalDocs, embeddings, {
            client,
            tableName: tableName,
            queryName: queryName
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

module.exports = { nodeClass: SupabaseUpsert_VectorStores }
