import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { Replicate, ReplicateInput } from 'langchain/llms/replicate'

class Replicate_LLMs implements INode {
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
        this.label = 'Replicate'
        this.name = 'replicate'
        this.type = 'Replicate'
        this.icon = 'replicate.svg'
        this.category = 'LLMs'
        this.categoryName = '大型语言模型'
        this.description = 'Replicate大型语言模型'
        this.baseClasses = [this.type, 'BaseChatModel', ...getBaseClasses(Replicate)]
        this.inputs = [
            {
                label: 'Replicate Api密钥',
                name: 'replicateApiKey',
                type: 'password'
            },
            {
                label: '模型名称',
                name: 'model',
                type: 'string',
                placeholder: 'a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5',
                optional: true
            },
            {
                label: '温度',
                name: 'temperature',
                type: 'number',
                description: '温度参数调整生成输出的随机性,数值大于1时输出更随机,数值为0时输出是确定的,0.75是默认值.',
                default: 0.7,
                optional: true
            },
            {
                label: '最大Token数',
                name: 'maxTokens',
                type: 'number',
                description: '最大Token数是生成文本的最大词数限制。一个词通常包含2-3个token',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top Probability',
                name: 'topP',
                type: 'number',
                description: '在解码生成文本时,从最有可能的前p%的词中采样;降低p可以忽略可能性小的词。',
                optional: true,
                additionalParams: true
            },
            {
                label: '重复词惩罚',
                name: 'repetitionPenalty',
                type: 'number',
                description:
                    '重复词惩罚是对生成文本中重复词的惩罚参数。取值1则没有惩罚,大于1会抑制重复,小于1会鼓励重复。(最小值:0.01;最大值:5)',
                optional: true,
                additionalParams: true
            },
            {
                label: '附加输入',
                name: 'additionalInputs',
                type: 'json',
                description:
                    '每个模型支持的参数是不同的,需要参考具体模型所接受的输入。例如: <a target="_blank" href="https://replicate.com/a16z-infra/llama13b-v2-chat/api#inputs">llama13b-v2</a>',
                additionalParams: true,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const modelName = nodeData.inputs?.model as string
        const apiKey = nodeData.inputs?.replicateApiKey as string
        const temperature = nodeData.inputs?.temperature as string
        const maxTokens = nodeData.inputs?.maxTokens as string
        const topP = nodeData.inputs?.topP as string
        const repetitionPenalty = nodeData.inputs?.repetitionPenalty as string
        const additionalInputs = nodeData.inputs?.additionalInputs as string

        const version = modelName.split(':').pop()
        const name = modelName.split(':')[0].split('/').pop()
        const org = modelName.split(':')[0].split('/')[0]

        const obj: ReplicateInput = {
            model: `${org}/${name}:${version}`,
            apiKey
        }

        let inputs: any = {}
        if (maxTokens) inputs.max_length = parseInt(maxTokens, 10)
        if (temperature) inputs.temperature = parseFloat(temperature)
        if (topP) inputs.top_p = parseFloat(topP)
        if (repetitionPenalty) inputs.repetition_penalty = parseFloat(repetitionPenalty)
        if (additionalInputs) {
            const parsedInputs =
                typeof additionalInputs === 'object' ? additionalInputs : additionalInputs ? JSON.parse(additionalInputs) : {}
            inputs = { ...inputs, ...parsedInputs }
        }
        if (Object.keys(inputs).length) obj.input = inputs

        const model = new Replicate(obj)
        return model
    }
}

module.exports = { nodeClass: Replicate_LLMs }
