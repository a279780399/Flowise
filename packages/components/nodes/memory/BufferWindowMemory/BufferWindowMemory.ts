import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { BufferWindowMemory, BufferWindowMemoryInput } from 'langchain/memory'

class BufferWindowMemory_Memory implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '窗口缓冲存储器'
        this.name = 'bufferWindowMemory'
        this.type = 'BufferWindowMemory'
        this.icon = 'memory.svg'
        this.category = '存储器'
        this.description = '使用一个大小为k的窗口来显示最后k次对话的问答内容,作为记忆来使用。'
        this.baseClasses = [this.type, ...getBaseClasses(BufferWindowMemory)]
        this.inputs = [
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
            },
            {
                label: '大小',
                name: 'k',
                type: 'number',
                default: '4',
                description: '使用一个大小为k的窗口来显示最后k次对话的问答内容,作为记忆来使用。'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const memoryKey = nodeData.inputs?.memoryKey as string
        const inputKey = nodeData.inputs?.inputKey as string
        const k = nodeData.inputs?.k as string

        const obj: Partial<BufferWindowMemoryInput> = {
            returnMessages: true,
            memoryKey: memoryKey,
            inputKey: inputKey,
            k: parseInt(k, 10)
        }

        return new BufferWindowMemory(obj)
    }
}

module.exports = { nodeClass: BufferWindowMemory_Memory }
