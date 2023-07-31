import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { OpenAIEmbeddings, OpenAIEmbeddingsParams } from 'langchain/embeddings/openai'

class LocalAIEmbedding_Embeddings implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    categoryName: string
    description: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '本地嵌入向量'
        this.name = 'localAIEmbeddings'
        this.type = '本地嵌入向量'
        this.icon = 'localai.png'
        this.category = 'Embeddings'
        this.categoryName = '嵌入向量'
        this.description = '使用本地嵌入向量模型,比如 llama.cpp'
        this.baseClasses = [this.type, 'Embeddings']
        this.inputs = [
            {
                label: '模型地址',
                name: 'basePath',
                type: 'string',
                placeholder: 'http://localhost:8080/v1'
            },
            {
                label: '模型名称',
                name: 'modelName',
                type: 'string',
                placeholder: 'text-embedding-ada-002'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const modelName = nodeData.inputs?.modelName as string
        const basePath = nodeData.inputs?.basePath as string

        const obj: Partial<OpenAIEmbeddingsParams> & { openAIApiKey?: string } = {
            modelName,
            openAIApiKey: 'sk-'
        }

        const model = new OpenAIEmbeddings(obj, { basePath })

        return model
    }
}

module.exports = { nodeClass: LocalAIEmbedding_Embeddings }
