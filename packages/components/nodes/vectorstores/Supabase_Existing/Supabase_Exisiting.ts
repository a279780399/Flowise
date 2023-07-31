import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { Embeddings } from 'langchain/embeddings/base'
import { getBaseClasses } from '../../../src/utils'
import { SupabaseLibArgs, SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { createClient } from '@supabase/supabase-js'

class Supabase_Existing_VectorStores implements INode {
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
        this.label = 'Supabase 向量加载器'
        this.name = 'supabaseExistingIndex'
        this.type = 'Supabase'
        this.icon = 'supabase.svg'
        this.category = '向量存储'
        this.description = '从Supabase向量数据库中加载已经存在的索引'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']
        this.inputs = [
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
                label: 'Supabase元数据过滤',
                name: 'supabaseMetadataFilter',
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
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const supabaseMetadataFilter = nodeData.inputs?.supabaseMetadataFilter
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        const client = createClient(supabaseProjUrl, supabaseApiKey)

        const obj: SupabaseLibArgs = {
            client,
            tableName,
            queryName
        }

        if (supabaseMetadataFilter) {
            const metadatafilter = typeof supabaseMetadataFilter === 'object' ? supabaseMetadataFilter : JSON.parse(supabaseMetadataFilter)
            obj.filter = metadatafilter
        }

        const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, obj)

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

module.exports = { nodeClass: Supabase_Existing_VectorStores }
