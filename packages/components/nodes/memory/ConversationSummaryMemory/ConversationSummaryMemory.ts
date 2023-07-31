import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { ConversationSummaryMemory, ConversationSummaryMemoryInput } from 'langchain/memory'
import { BaseLanguageModel } from 'langchain/base_language'

class ConversationSummaryMemory_Memory implements INode {
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
        this.label = '对话摘要存储器'
        this.name = 'conversationSummaryMemory'
        this.type = 'ConversationSummaryMemory'
        this.icon = 'memory.svg'
        this.category = 'Memory'
        this.categoryName = '存储器'
        this.description = '总结对话内容,并将当前的摘要存储下来作为记忆。'
        this.baseClasses = [this.type, ...getBaseClasses(ConversationSummaryMemory)]
        this.inputs = [
            {
                label: '对话模型',
                name: 'model',
                type: 'BaseChatModel'
            },
            {
                label: '存储键名',
                name: 'memoryKey',
                type: 'string',
                default: 'chat_history'
            },
            {
                label: '输入关键字',
                name: 'inputKey',
                type: 'string',
                default: 'input'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const memoryKey = nodeData.inputs?.memoryKey as string
        const inputKey = nodeData.inputs?.inputKey as string

        const obj: ConversationSummaryMemoryInput = {
            llm: model,
            returnMessages: true,
            memoryKey,
            inputKey
        }

        return new ConversationSummaryMemory(obj)
    }
}

module.exports = { nodeClass: ConversationSummaryMemory_Memory }
