import { ICommonObject, IMessage, INode, INodeData, INodeParams } from '../../../src/Interface'
import { initializeAgentExecutorWithOptions, AgentExecutor } from 'langchain/agents'
import { getBaseClasses } from '../../../src/utils'
import { BaseLanguageModel } from 'langchain/base_language'
import { flatten } from 'lodash'
import { BaseChatMemory, ChatMessageHistory } from 'langchain/memory'
import { AIMessage, HumanMessage } from 'langchain/schema'
import { ConsoleCallbackHandler, CustomChainHandler } from '../../../src/handler'

class OpenAIFunctionAgent_Agents implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    categoryName: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'OpenAI函数代理'
        this.name = 'openAIFunctionAgent'
        this.type = '代理执行器'
        this.category = 'Agents'
        this.categoryName = '代理'
        this.icon = 'openai.png'
        this.description = `这个代理利用了OpenAI的函数调用功能,来选择需要调用的工具以及相应的调用参数。`
        this.baseClasses = [this.type, ...getBaseClasses(AgentExecutor)]
        this.inputs = [
            {
                label: '可用工具',
                name: 'tools',
                type: 'Tool',
                list: true
            },
            {
                label: '存储器',
                name: 'memory',
                type: 'BaseChatMemory'
            },
            {
                label: 'OpenAI聊天模型',
                name: 'model',
                description:
                    '仅适用于 gpt-3.5-turbo-0613 和 gpt-4-0613。请参考 <a target="_blank" href="https://platform.openai.com/docs/guides/gpt/function-calling">docs</a> for more info',
                type: 'BaseChatModel'
            },
            {
                label: '系统提示',
                name: 'systemMessage',
                type: 'string',
                rows: 4,
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const memory = nodeData.inputs?.memory as BaseChatMemory
        const systemMessage = nodeData.inputs?.systemMessage as string

        let tools = nodeData.inputs?.tools
        tools = flatten(tools)

        const executor = await initializeAgentExecutorWithOptions(tools, model, {
            agentType: 'openai-functions',
            verbose: process.env.DEBUG === 'true' ? true : false,
            agentArgs: {
                prefix: systemMessage ?? `You are a helpful AI assistant.`
            }
        })
        if (memory) executor.memory = memory

        return executor
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const executor = nodeData.instance as AgentExecutor
        const memory = nodeData.inputs?.memory as BaseChatMemory

        if (options && options.chatHistory) {
            const chatHistory = []
            const histories: IMessage[] = options.chatHistory

            for (const message of histories) {
                if (message.type === 'apiMessage') {
                    chatHistory.push(new AIMessage(message.message))
                } else if (message.type === 'userMessage') {
                    chatHistory.push(new HumanMessage(message.message))
                }
            }
            memory.chatHistory = new ChatMessageHistory(chatHistory)
            executor.memory = memory
        }

        const loggerHandler = new ConsoleCallbackHandler(options.logger)

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            const result = await executor.run(input, [loggerHandler, handler])
            return result
        } else {
            const result = await executor.run(input, [loggerHandler])
            return result
        }
    }
}

module.exports = { nodeClass: OpenAIFunctionAgent_Agents }
