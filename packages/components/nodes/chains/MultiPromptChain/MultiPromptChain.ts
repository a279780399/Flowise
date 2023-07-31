import { BaseLanguageModel } from 'langchain/base_language'
import { ICommonObject, INode, INodeData, INodeParams, PromptRetriever } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { MultiPromptChain } from 'langchain/chains'
import { ConsoleCallbackHandler, CustomChainHandler } from '../../../src/handler'

class MultiPromptChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    categoryName: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = '多提示词模板链'
        this.name = 'multiPromptChain'
        this.type = 'MultiPromptChain'
        this.icon = 'chain.svg'
        this.category = 'Chains'
        this.categoryName = '链'
        this.description = '链自动从多个提示词模板中选择合适的提示'
        this.baseClasses = [this.type, ...getBaseClasses(MultiPromptChain)]
        this.inputs = [
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: '提示词检索器',
                name: 'promptRetriever',
                type: 'PromptRetriever',
                list: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const promptRetriever = nodeData.inputs?.promptRetriever as PromptRetriever[]
        const promptNames = []
        const promptDescriptions = []
        const promptTemplates = []

        for (const prompt of promptRetriever) {
            promptNames.push(prompt.name)
            promptDescriptions.push(prompt.description)
            promptTemplates.push(prompt.systemMessage)
        }

        const chain = MultiPromptChain.fromLLMAndPrompts(model, {
            promptNames,
            promptDescriptions,
            promptTemplates,
            llmChainOpts: { verbose: process.env.DEBUG === 'true' ? true : false }
        })

        return chain
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const chain = nodeData.instance as MultiPromptChain
        const obj = { input }

        const loggerHandler = new ConsoleCallbackHandler(options.logger)

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId, 2)
            const res = await chain.call(obj, [loggerHandler, handler])
            return res?.text
        } else {
            const res = await chain.call(obj, [loggerHandler])
            return res?.text
        }
    }
}

module.exports = { nodeClass: MultiPromptChain_Chains }
