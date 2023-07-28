import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { VectorDBQAChain } from 'langchain/chains'
import { BaseLanguageModel } from 'langchain/base_language'
import { VectorStore } from 'langchain/vectorstores'
import { ConsoleCallbackHandler, CustomChainHandler } from '../../../src/handler'

class VectorDBQAChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = '向量数据库问答链'
        this.name = 'vectorDBQAChain'
        this.type = 'VectorDBQAChain'
        this.icon = 'chain.svg'
        this.category = '链'
        this.description = '回答有关SQL数据库的问题'
        this.baseClasses = [this.type, ...getBaseClasses(VectorDBQAChain)]
        this.inputs = [
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: '向量存储',
                name: 'vectorStore',
                type: 'VectorStore'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const vectorStore = nodeData.inputs?.vectorStore as VectorStore

        const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
            k: (vectorStore as any)?.k ?? 4,
            verbose: process.env.DEBUG === 'true' ? true : false
        })
        return chain
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const chain = nodeData.instance as VectorDBQAChain
        const obj = {
            query: input
        }

        const loggerHandler = new ConsoleCallbackHandler(options.logger)

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            const res = await chain.call(obj, [loggerHandler, handler])
            return res?.text
        } else {
            const res = await chain.call(obj, [loggerHandler])
            return res?.text
        }
    }
}

module.exports = { nodeClass: VectorDBQAChain_Chains }
