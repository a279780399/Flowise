import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { CohereEmbeddings, CohereEmbeddingsParams } from 'langchain/embeddings/cohere'

class CohereEmbedding_Embeddings implements INode {
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
        this.label = 'Cohere 嵌入向量'
        this.name = 'cohereEmbeddings'
        this.type = 'Cohere嵌入向量'
        this.icon = 'cohere.png'
        this.category = 'Embeddings'
        this.categoryName = '嵌入向量'
        this.description = 'Cohere 提供了API接口,可以为给定的文本生成对应的嵌入向量。'
        this.baseClasses = [this.type, ...getBaseClasses(CohereEmbeddings)]
        this.inputs = [
            {
                label: 'API密钥',
                name: 'cohereApiKey',
                type: 'password'
            },
            {
                label: '模型名称',
                name: 'modelName',
                type: 'options',
                options: [
                    {
                        label: 'embed-english-v2.0',
                        name: 'embed-english-v2.0'
                    },
                    {
                        label: 'embed-english-light-v2.0',
                        name: 'embed-english-light-v2.0'
                    },
                    {
                        label: 'embed-multilingual-v2.0',
                        name: 'embed-multilingual-v2.0'
                    }
                ],
                default: 'embed-english-v2.0',
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const apiKey = nodeData.inputs?.cohereApiKey as string
        const modelName = nodeData.inputs?.modelName as string

        const obj: Partial<CohereEmbeddingsParams> & { apiKey?: string } = {
            apiKey
        }

        if (modelName) obj.modelName = modelName

        const model = new CohereEmbeddings(obj)
        return model
    }
}

module.exports = { nodeClass: CohereEmbedding_Embeddings }
