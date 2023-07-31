import { ICommonObject, INode, INodeData, INodeParams, getBaseClasses } from '../../../src'
import { DynamoDBChatMessageHistory } from 'langchain/stores/message/dynamodb'
import { BufferMemory } from 'langchain/memory'

class DynamoDb_Memory implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'DynamoDB存储器'
        this.name = 'DynamoDBChatMemory'
        this.type = 'DynamoDBChatMemory'
        this.icon = 'dynamodb.svg'
        this.category = '存储器'
        this.description = '将对话内容存储在DynamoDB的数据库表中。'
        this.baseClasses = [this.type, ...getBaseClasses(BufferMemory)]
        this.inputs = [
            {
                label: '表名称',
                name: 'tableName',
                type: 'string'
            },
            {
                label: '分区键',
                name: 'partitionKey',
                type: 'string'
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
                label: '区域',
                name: 'region',
                type: 'string',
                description: '表所在的aws区域',
                placeholder: 'us-east-1'
            },
            {
                label: 'Access Key',
                name: 'accessKey',
                type: 'password'
            },
            {
                label: 'Secret Access Key',
                name: 'secretAccessKey',
                type: 'password'
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
        return initalizeDynamoDB(nodeData, options)
    }

    async clearSessionMemory(nodeData: INodeData, options: ICommonObject): Promise<void> {
        const dynamodbMemory = initalizeDynamoDB(nodeData, options)
        dynamodbMemory.clear()
    }
}

const initalizeDynamoDB = (nodeData: INodeData, options: ICommonObject): BufferMemory => {
    const tableName = nodeData.inputs?.tableName as string
    const partitionKey = nodeData.inputs?.partitionKey as string
    const sessionId = nodeData.inputs?.sessionId as string
    const region = nodeData.inputs?.region as string
    const accessKey = nodeData.inputs?.accessKey as string
    const secretAccessKey = nodeData.inputs?.secretAccessKey as string
    const memoryKey = nodeData.inputs?.memoryKey as string

    const chatId = options.chatId

    const dynamoDb = new DynamoDBChatMessageHistory({
        tableName,
        partitionKey,
        sessionId: sessionId ? sessionId : chatId,
        config: {
            region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey
            }
        }
    })

    const memory = new BufferMemory({
        memoryKey,
        chatHistory: dynamoDb,
        returnMessages: true
    })
    return memory
}

module.exports = { nodeClass: DynamoDb_Memory }
