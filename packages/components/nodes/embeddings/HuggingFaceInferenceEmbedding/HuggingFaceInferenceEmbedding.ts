import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { HuggingFaceInferenceEmbeddings, HuggingFaceInferenceEmbeddingsParams } from './core'

class HuggingFaceInferenceEmbedding_Embeddings implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    description: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'HuggingFace 嵌入向量'
        this.name = 'huggingFaceInferenceEmbeddings'
        this.type = 'HuggingFace嵌入向量'
        this.icon = 'huggingface.png'
        this.category = '嵌入向量'
        this.description = 'HuggingFace 提供了API接口,可以为给定的文本生成对应的嵌入向量。'
        this.baseClasses = [this.type, ...getBaseClasses(HuggingFaceInferenceEmbeddings)]
        this.inputs = [
            {
                label: 'Api密钥',
                name: 'apiKey',
                type: 'password'
            },
            {
                label: '模型名称',
                name: 'modelName',
                type: 'string',
                optional: true
            },
            {
                label: '端点',
                name: 'endpoint',
                type: 'string',
                placeholder: 'https://xyz.eu-west-1.aws.endpoints.huggingface.cloud/sentence-transformers/all-MiniLM-L6-v2',
                description: '使用自定义的推理端点',
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const apiKey = nodeData.inputs?.apiKey as string
        const modelName = nodeData.inputs?.modelName as string
        const endpoint = nodeData.inputs?.endpoint as string

        const obj: Partial<HuggingFaceInferenceEmbeddingsParams> = {
            apiKey
        }

        if (modelName) obj.model = modelName
        if (endpoint) obj.endpoint = endpoint

        const model = new HuggingFaceInferenceEmbeddings(obj)
        return model
    }
}

module.exports = { nodeClass: HuggingFaceInferenceEmbedding_Embeddings }
