import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { ICommonObject } from '../../../src'
import { BufferMemory } from 'langchain/memory'
import { RedisChatMessageHistory, RedisChatMessageHistoryInput } from 'langchain/stores/message/redis'
import { createClient } from 'redis'

class RedisBackedChatMemory_Memory implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Redis存储器'
        this.name = 'RedisBackedChatMemory'
        this.type = 'RedisBackedChatMemory'
        this.icon = 'redis.svg'
        this.category = '存储器'
        this.description = '总结对话内容,并将生成的记忆存储在Redis服务器中。'
        this.baseClasses = [this.type, ...getBaseClasses(BufferMemory)]
        this.inputs = [
            {
                label: 'Base URL',
                name: 'baseURL',
                type: 'string',
                default: 'redis://localhost:6379'
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
                label: '会话过期时间',
                name: 'sessionTTL',
                type: 'number',
                description: '如果不指定这个参数,那么会话就永远不会过期。',
                optional: true
            },
            {
                label: '存储键名',
                name: 'memoryKey',
                type: 'string',
                default: 'chat_history'
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        return initalizeRedis(nodeData, options)
    }

    async clearSessionMemory(nodeData: INodeData, options: ICommonObject): Promise<void> {
        const redis = initalizeRedis(nodeData, options)
        redis.clear()
    }
}

const initalizeRedis = (nodeData: INodeData, options: ICommonObject): BufferMemory => {
    const baseURL = nodeData.inputs?.baseURL as string
    const sessionId = nodeData.inputs?.sessionId as string
    const sessionTTL = nodeData.inputs?.sessionTTL as number
    const memoryKey = nodeData.inputs?.memoryKey as string

    const chatId = options?.chatId as string

    const redisClient = createClient({ url: baseURL })
    let obj: RedisChatMessageHistoryInput = {
        sessionId: sessionId ? sessionId : chatId,
        client: redisClient
    }

    if (sessionTTL) {
        obj = {
            ...obj,
            sessionTTL
        }
    }

    let redisChatMessageHistory = new RedisChatMessageHistory(obj)
    let redis = new BufferMemory({ memoryKey, chatHistory: redisChatMessageHistory, returnMessages: true })

    return redis
}

module.exports = { nodeClass: RedisBackedChatMemory_Memory }
