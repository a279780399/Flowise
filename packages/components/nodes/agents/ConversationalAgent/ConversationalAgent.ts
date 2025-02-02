import { ICommonObject, IMessage, INode, INodeData, INodeParams } from '../../../src/Interface'
import { initializeAgentExecutorWithOptions, AgentExecutor, InitializeAgentExecutorOptions } from 'langchain/agents'
import { Tool } from 'langchain/tools'
import { BaseChatMemory, ChatMessageHistory } from 'langchain/memory'
import { getBaseClasses } from '../../../src/utils'
import { AIMessage, HumanMessage } from 'langchain/schema'
import { BaseLanguageModel } from 'langchain/base_language'
import { flatten } from 'lodash'

class ConversationalAgent_Agents implements INode {
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
        this.label = 'Conversational'
        this.name = 'conversationalAgent'
        this.type = '代理执行器'
        this.category = 'Agents'
        this.categoryName = '代理'
        this.icon = 'agent.svg'
        this.description = '针对聊天模型的会话式代理,它将利用特定的聊天提示进行交互。'
        this.baseClasses = [this.type, ...getBaseClasses(AgentExecutor)]
        this.inputs = [
            {
                label: '可用工具',
                name: 'tools',
                type: 'Tool',
                list: true
            },
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: '存储器',
                name: 'memory',
                type: 'BaseChatMemory'
            },
            {
                label: '系统提示',
                name: 'systemMessage',
                type: 'string',
                rows: 4,
                optional: true,
                additionalParams: true
            },
            {
                label: '用户消息',
                name: 'humanMessage',
                type: 'string',
                rows: 4,
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        let tools = nodeData.inputs?.tools as Tool[]
        tools = flatten(tools)
        const memory = nodeData.inputs?.memory as BaseChatMemory
        const humanMessage = nodeData.inputs?.humanMessage as string
        const systemMessage = nodeData.inputs?.systemMessage as string

        const obj: InitializeAgentExecutorOptions = {
            agentType: 'chat-conversational-react-description',
            verbose: process.env.DEBUG === 'true' ? true : false
        }

        const agentArgs: any = {}
        if (humanMessage) {
            agentArgs.humanMessage = humanMessage
        }
        if (systemMessage) {
            agentArgs.systemMessage = systemMessage
        }

        if (Object.keys(agentArgs).length) obj.agentArgs = agentArgs

        const executor = await initializeAgentExecutorWithOptions(tools, model, obj)
        executor.memory = memory
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
        const result = await executor.call({ input })

        return result?.output
    }
}

module.exports = { nodeClass: ConversationalAgent_Agents }
