import { AzureOpenAIInput } from 'langchain/chat_models/openai'
import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { OpenAIEmbeddings, OpenAIEmbeddingsParams } from 'langchain/embeddings/openai'

class AzureOpenAIEmbedding_Embeddings implements INode {
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
        this.label = 'Azure 嵌入向量'
        this.name = 'azureOpenAIEmbeddings'
        this.type = 'Azure嵌入向量'
        this.icon = 'Azure.svg'
        this.category = 'Embeddings'
        this.categoryName = '嵌入向量'
        this.description = 'Azure OpenAI 提供了API接口,可以为给定的文本生成对应的嵌入向量。'
        this.baseClasses = [this.type, ...getBaseClasses(OpenAIEmbeddings)]
        this.inputs = [
            {
                label: 'Api密钥',
                name: 'azureOpenAIApiKey',
                type: 'password'
            },
            {
                label: 'Api实例名称',
                name: 'azureOpenAIApiInstanceName',
                type: 'string',
                placeholder: 'YOUR-INSTANCE-NAME'
            },
            {
                label: 'Api部署名称',
                name: 'azureOpenAIApiDeploymentName',
                type: 'string',
                placeholder: 'YOUR-DEPLOYMENT-NAME'
            },
            {
                label: 'Api版本号',
                name: 'azureOpenAIApiVersion',
                type: 'string',
                placeholder: '2023-03-15-preview',
                description:
                    'Description of Supported API Versions. Please refer <a target="_blank" href="https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#embeddings">examples</a>'
            },
            {
                label: '批量大小',
                name: 'batchSize',
                type: 'number',
                default: '1',
                optional: true,
                additionalParams: true
            },
            {
                label: '超时时间',
                name: 'timeout',
                type: 'number',
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const azureOpenAIApiKey = nodeData.inputs?.azureOpenAIApiKey as string
        const azureOpenAIApiInstanceName = nodeData.inputs?.azureOpenAIApiInstanceName as string
        const azureOpenAIApiDeploymentName = nodeData.inputs?.azureOpenAIApiDeploymentName as string
        const azureOpenAIApiVersion = nodeData.inputs?.azureOpenAIApiVersion as string
        const batchSize = nodeData.inputs?.batchSize as string
        const timeout = nodeData.inputs?.timeout as string

        const obj: Partial<OpenAIEmbeddingsParams> & Partial<AzureOpenAIInput> = {
            azureOpenAIApiKey,
            azureOpenAIApiInstanceName,
            azureOpenAIApiDeploymentName,
            azureOpenAIApiVersion
        }

        if (batchSize) obj.batchSize = parseInt(batchSize, 10)
        if (timeout) obj.timeout = parseInt(timeout, 10)

        const model = new OpenAIEmbeddings(obj)
        return model
    }
}

module.exports = { nodeClass: AzureOpenAIEmbedding_Embeddings }
