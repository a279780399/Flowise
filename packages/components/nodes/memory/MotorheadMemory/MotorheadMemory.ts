import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { ICommonObject } from '../../../src'
import { MotorheadMemory, MotorheadMemoryInput } from 'langchain/memory'

class MotorMemory_Memory implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Motorhead存储器'
        this.name = 'motorheadMemory'
        this.type = 'MotorheadMemory'
        this.icon = 'motorhead.png'
        this.category = '存储器'
        this.description = '保存之前的对话内容和上下文,从而更好地进行回应。'
        this.baseClasses = [this.type, ...getBaseClasses(MotorheadMemory)]
        this.inputs = [
            {
                label: 'Base URL',
                name: 'baseURL',
                type: 'string',
                optional: true,
                description: '要使用在线版本,请将URL留空。更多详情请见https://getmetal.io。'
            },
            {
                label: '存储键名',
                name: 'memoryKey',
                type: 'string',
                default: 'chat_history'
            },
            {
                label: '会话id',
                name: 'sessionId',
                type: 'string',
                description: '如果为空,将自动使用chatId',
                default: '',
                additionalParams: true,
                optional: true
            },
            {
                label: 'API密钥',
                name: 'apiKey',
                type: 'password',
                description: '仅当使用托管解决方案时需要 - https://getmetal.io',
                additionalParams: true,
                optional: true
            },
            {
                label: '客户端id',
                name: 'clientId',
                type: 'string',
                description: '仅当使用托管解决方案时需要 - https://getmetal.io',
                additionalParams: true,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        return initalizeMotorhead(nodeData, options)
    }

    async clearSessionMemory(nodeData: INodeData, options: ICommonObject): Promise<void> {
        const motorhead = initalizeMotorhead(nodeData, options)
        motorhead.clear()
    }
}

const initalizeMotorhead = (nodeData: INodeData, options: ICommonObject): MotorheadMemory => {
    const memoryKey = nodeData.inputs?.memoryKey as string
    const baseURL = nodeData.inputs?.baseURL as string
    const sessionId = nodeData.inputs?.sessionId as string
    const apiKey = nodeData.inputs?.apiKey as string
    const clientId = nodeData.inputs?.clientId as string

    const chatId = options?.chatId as string

    let obj: MotorheadMemoryInput = {
        returnMessages: true,
        sessionId: sessionId ? sessionId : chatId,
        memoryKey
    }

    if (baseURL) {
        obj = {
            ...obj,
            url: baseURL
        }
    } else {
        obj = {
            ...obj,
            apiKey,
            clientId
        }
    }

    return new MotorheadMemory(obj)
}

module.exports = { nodeClass: MotorMemory_Memory }
