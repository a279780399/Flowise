import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { Cohere, CohereInput } from './core'

class Cohere_LLMs implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    description: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Cohere'
        this.name = 'cohere'
        this.type = 'Cohere'
        this.icon = 'cohere.png'
        this.category = '大型语言模型'
        this.description = 'Cohere大型语言模型'
        this.baseClasses = [this.type, ...getBaseClasses(Cohere)]
        this.inputs = [
            {
                label: 'Cohere Api密钥',
                name: 'cohereApiKey',
                type: 'password'
            },
            {
                label: '模型名称',
                name: 'modelName',
                type: 'options',
                options: [
                    {
                        label: 'command',
                        name: 'command'
                    },
                    {
                        label: 'command-light',
                        name: 'command-light'
                    },
                    {
                        label: 'command-nightly',
                        name: 'command-nightly'
                    },
                    {
                        label: 'command-light-nightly',
                        name: 'command-light-nightly'
                    },
                    {
                        label: 'base',
                        name: 'base'
                    },
                    {
                        label: 'base-light',
                        name: 'base-light'
                    }
                ],
                default: 'command',
                optional: true
            },
            {
                label: '温度',
                name: 'temperature',
                type: 'number',
                default: 0.7,
                optional: true
            },
            {
                label: '最大Token数',
                name: 'maxTokens',
                type: 'number',
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const temperature = nodeData.inputs?.temperature as string
        const modelName = nodeData.inputs?.modelName as string
        const apiKey = nodeData.inputs?.cohereApiKey as string
        const maxTokens = nodeData.inputs?.maxTokens as string

        const obj: CohereInput = {
            apiKey
        }

        if (maxTokens) obj.maxTokens = parseInt(maxTokens, 10)
        if (modelName) obj.model = modelName
        if (temperature) obj.temperature = parseFloat(temperature)

        const model = new Cohere(obj)
        return model
    }
}

module.exports = { nodeClass: Cohere_LLMs }
