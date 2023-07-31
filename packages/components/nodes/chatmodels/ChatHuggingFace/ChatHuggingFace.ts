import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { HFInput, HuggingFaceInference } from './core'

class ChatHuggingFace_ChatModels implements INode {
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
        this.label = 'ChatHuggingFace'
        this.name = 'chatHuggingFace'
        this.type = 'ChatHuggingFace'
        this.icon = 'huggingface.png'
        this.category = 'Chat Models'
        this.categoryName = '对话模型'
        this.description = 'HuggingFace大语言模型'
        this.baseClasses = [this.type, 'BaseChatModel', ...getBaseClasses(HuggingFaceInference)]
        this.inputs = [
            {
                label: 'Model',
                name: 'model',
                type: 'string',
                placeholder: 'gpt2'
            },
            {
                label: 'HuggingFace Api Key',
                name: 'apiKey',
                type: 'password'
            },
            {
                label: '温度',
                name: 'temperature',
                type: 'number',
                description: '温度参数可能不适用于某些模型。请检查可用的模型参数',
                optional: true,
                additionalParams: true
            },
            {
                label: '最大Token数',
                name: 'maxTokens',
                type: 'number',
                description: '最大Token数参数可能不适用于某些模型。请检查可用的模型参数',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top Probability',
                name: 'topP',
                type: 'number',
                description: 'Top Probability参数可能不适用于某些模型。请检查可用的模型参数',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top K',
                name: 'hfTopK',
                type: 'number',
                description: 'Top K参数可能不适用于某些模型。请检查可用的模型参数',
                optional: true,
                additionalParams: true
            },
            {
                label: '频率惩罚',
                name: 'frequencyPenalty',
                type: 'number',
                description: '频率惩罚参数可能不适用于某些模型。请检查可用的模型参数',
                optional: true,
                additionalParams: true
            },
            {
                label: '端点',
                name: 'endpoint',
                type: 'string',
                placeholder: 'https://xyz.eu-west-1.aws.endpoints.huggingface.cloud/gpt2',
                description: '使用您自己的推理端点',
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as string
        const apiKey = nodeData.inputs?.apiKey as string
        const temperature = nodeData.inputs?.temperature as string
        const maxTokens = nodeData.inputs?.maxTokens as string
        const topP = nodeData.inputs?.topP as string
        const hfTopK = nodeData.inputs?.hfTopK as string
        const frequencyPenalty = nodeData.inputs?.frequencyPenalty as string
        const endpoint = nodeData.inputs?.endpoint as string

        const obj: Partial<HFInput> = {
            model,
            apiKey
        }

        if (temperature) obj.temperature = parseFloat(temperature)
        if (maxTokens) obj.maxTokens = parseInt(maxTokens, 10)
        if (topP) obj.topP = parseInt(topP, 10)
        if (hfTopK) obj.topK = parseInt(hfTopK, 10)
        if (frequencyPenalty) obj.frequencyPenalty = parseInt(frequencyPenalty, 10)
        if (endpoint) obj.endpoint = endpoint

        const huggingFace = new HuggingFaceInference(obj)
        return huggingFace
    }
}

module.exports = { nodeClass: ChatHuggingFace_ChatModels }
