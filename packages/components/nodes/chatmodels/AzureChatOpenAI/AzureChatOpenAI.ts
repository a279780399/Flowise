import { OpenAIBaseInput } from 'langchain/dist/types/openai-types'
import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { AzureOpenAIInput, ChatOpenAI } from 'langchain/chat_models/openai'

class AzureChatOpenAI_ChatModels implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    description: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Azure'
        this.name = 'azureChatOpenAI'
        this.type = 'AzureChatOpenAI'
        this.icon = 'Azure.svg'
        this.category = '对话模型'
        this.description = '封装了Azure OpenAI的大型语言模型服务,通过Chat endpoint来使用这些模型进行聊天交互。'
        this.baseClasses = [this.type, ...getBaseClasses(ChatOpenAI)]
        this.inputs = [
            {
                label: 'Azure Api密钥',
                name: 'azureOpenAIApiKey',
                type: 'password'
            },
            {
                label: '模型名称',
                name: 'modelName',
                type: 'options',
                options: [
                    {
                        label: 'gpt-4',
                        name: 'gpt-4'
                    },
                    {
                        label: 'gpt-4-32k',
                        name: 'gpt-4-32k'
                    },
                    {
                        label: 'gpt-35-turbo',
                        name: 'gpt-35-turbo'
                    },
                    {
                        label: 'gpt-35-turbo-16k',
                        name: 'gpt-35-turbo-16k'
                    }
                ],
                default: 'gpt-35-turbo',
                optional: true
            },
            {
                label: '温度',
                name: 'temperature',
                type: 'number',
                default: 0.9,
                optional: true
            },
            {
                label: 'Azure Api实例名称',
                name: 'azureOpenAIApiInstanceName',
                type: 'string',
                placeholder: 'YOUR-INSTANCE-NAME'
            },
            {
                label: 'Azure Api部署名称',
                name: 'azureOpenAIApiDeploymentName',
                type: 'string',
                placeholder: 'YOUR-DEPLOYMENT-NAME'
            },
            {
                label: 'Azure Api版本号',
                name: 'azureOpenAIApiVersion',
                type: 'string',
                placeholder: '2023-06-01-preview',
                description:
                    '支持的 API 版本说明。请参考 <a target="_blank" href="https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#chat-completions">examples</a>'
            },
            {
                label: '最大Token数',
                name: 'maxTokens',
                type: 'number',
                optional: true,
                additionalParams: true
            },
            {
                label: '频率惩罚',
                name: 'frequencyPenalty',
                type: 'number',
                optional: true,
                additionalParams: true
            },
            {
                label: '存在惩罚',
                name: 'presencePenalty',
                type: 'number',
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
        const modelName = nodeData.inputs?.modelName as string
        const temperature = nodeData.inputs?.temperature as string
        const azureOpenAIApiInstanceName = nodeData.inputs?.azureOpenAIApiInstanceName as string
        const azureOpenAIApiDeploymentName = nodeData.inputs?.azureOpenAIApiDeploymentName as string
        const azureOpenAIApiVersion = nodeData.inputs?.azureOpenAIApiVersion as string
        const maxTokens = nodeData.inputs?.maxTokens as string
        const frequencyPenalty = nodeData.inputs?.frequencyPenalty as string
        const presencePenalty = nodeData.inputs?.presencePenalty as string
        const timeout = nodeData.inputs?.timeout as string
        const streaming = nodeData.inputs?.streaming as boolean

        const obj: Partial<AzureOpenAIInput> & Partial<OpenAIBaseInput> = {
            temperature: parseFloat(temperature),
            modelName,
            azureOpenAIApiKey,
            azureOpenAIApiInstanceName,
            azureOpenAIApiDeploymentName,
            azureOpenAIApiVersion,
            streaming: streaming ?? true
        }

        if (maxTokens) obj.maxTokens = parseInt(maxTokens, 10)
        if (frequencyPenalty) obj.frequencyPenalty = parseInt(frequencyPenalty, 10)
        if (presencePenalty) obj.presencePenalty = parseInt(presencePenalty, 10)
        if (timeout) obj.timeout = parseInt(timeout, 10)

        const model = new ChatOpenAI(obj)
        return model
    }
}

module.exports = { nodeClass: AzureChatOpenAI_ChatModels }
