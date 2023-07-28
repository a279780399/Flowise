import { INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { Embeddings } from 'langchain/embeddings/base'
import { Document } from 'langchain/document'
import { getBaseClasses } from '../../../src/utils'
import { FaissStore } from 'langchain/vectorstores/faiss'
import { flatten } from 'lodash'

class FaissUpsert_VectorStores implements INode {
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
        this.label = 'Faiss 向量更新插入'
        this.name = 'faissUpsert'
        this.type = 'Faiss'
        this.icon = 'faiss.svg'
        this.category = '向量存储'
        this.description = '将文档向量上传并合并到Faiss的向量索引中,如果文档已经存在就更新向量,如果不存在就插入新的向量。'
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
                label: 'Faiss索引路径',
                name: 'basePath',
                description: '加载faiss.index文件的路径。',
                placeholder: `C:\\Users\\Desktop`,
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
                label: 'Faiss 检索器',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Faiss 向量存储',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(FaissStore)]
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const docs = nodeData.inputs?.document as Document[]
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const output = nodeData.outputs?.output as string
        const basePath = nodeData.inputs?.basePath as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseInt(topK, 10) : 4

        const flattenDocs = docs && docs.length ? flatten(docs) : []
        const finalDocs = []
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new Document(flattenDocs[i]))
        }

        const vectorStore = await FaissStore.fromDocuments(finalDocs, embeddings)
        await vectorStore.save(basePath)

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

module.exports = { nodeClass: FaissUpsert_VectorStores }
