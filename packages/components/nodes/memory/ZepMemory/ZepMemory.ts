import { SystemMessage } from 'langchain/schema'
import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { ZepMemory, ZepMemoryInput } from 'langchain/memory/zep'
import { ICommonObject } from '../../../src'

class ZepMemory_Memory implements INode {
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
        this.label = 'Zep存储器'
        this.name = 'ZepMemory'
        this.type = 'ZepMemory'
        this.icon = 'zep.png'
        this.category = 'Memory'
        this.categoryName = '存储器'
        this.description = '总结对话内容,并将生成的记忆存储在Zep服务中。'
        this.baseClasses = [this.type, ...getBaseClasses(ZepMemory)]
        this.inputs = [
            {
                label: 'Base URL',
                name: 'baseURL',
                type: 'string',
                default: 'http://127.0.0.1:8000'
            },
            {
                label: '自动摘要',
                name: 'autoSummary',
                type: 'boolean',
                default: true
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
                additionalParams: true,
                optional: true
            },
            {
                label: '大小',
                name: 'k',
                type: 'number',
                default: '10',
                description: '使用一个大小为k的窗口来显示最后k次对话的问答内容,作为记忆来使用。'
            },
            {
                label: '自动摘要模板',
                name: 'autoSummaryTemplate',
                type: 'string',
                default: '以下是对以下对话的摘要:\n{摘要}',
                additionalParams: true
            },
            {
                label: 'AI前缀',
                name: 'aiPrefix',
                type: 'string',
                default: 'ai',
                additionalParams: true
            },
            {
                label: '用户前缀',
                name: 'humanPrefix',
                type: 'string',
                default: 'human',
                additionalParams: true
            },
            {
                label: '存储键名',
                name: 'memoryKey',
                type: 'string',
                default: 'chat_history',
                additionalParams: true
            },
            {
                label: '输入关键字',
                name: 'inputKey',
                type: 'string',
                default: 'input',
                additionalParams: true
            },
            {
                label: '输出关键字',
                name: 'outputKey',
                type: 'string',
                default: 'text',
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const autoSummaryTemplate = nodeData.inputs?.autoSummaryTemplate as string
        const autoSummary = nodeData.inputs?.autoSummary as boolean
        const k = nodeData.inputs?.k as string

        let zep = initalizeZep(nodeData, options)

        // hack to support summary
        let tmpFunc = zep.loadMemoryVariables
        zep.loadMemoryVariables = async (values) => {
            let data = await tmpFunc.bind(zep, values)()
            if (autoSummary && zep.returnMessages && data[zep.memoryKey] && data[zep.memoryKey].length) {
                const memory = await zep.zepClient.getMemory(zep.sessionId, parseInt(k, 10) ?? 10)
                if (memory?.summary) {
                    let summary = autoSummaryTemplate.replace(/{summary}/g, memory.summary.content)
                    // eslint-disable-next-line no-console
                    console.log('[ZepMemory] auto summary:', summary)
                    data[zep.memoryKey].unshift(new SystemMessage(summary))
                }
            }
            // for langchain zep memory compatibility, or we will get "Missing value for input variable chat_history"
            if (data instanceof Array) {
                data = {
                    [zep.memoryKey]: data
                }
            }
            return data
        }
        return zep
    }

    async clearSessionMemory(nodeData: INodeData, options: ICommonObject): Promise<void> {
        const zep = initalizeZep(nodeData, options)
        zep.clear()
    }
}

const initalizeZep = (nodeData: INodeData, options: ICommonObject) => {
    const baseURL = nodeData.inputs?.baseURL as string
    const aiPrefix = nodeData.inputs?.aiPrefix as string
    const humanPrefix = nodeData.inputs?.humanPrefix as string
    const memoryKey = nodeData.inputs?.memoryKey as string
    const inputKey = nodeData.inputs?.inputKey as string

    const sessionId = nodeData.inputs?.sessionId as string
    const apiKey = nodeData.inputs?.apiKey as string

    const chatId = options?.chatId as string

    const obj: ZepMemoryInput = {
        baseURL,
        sessionId: sessionId ? sessionId : chatId,
        aiPrefix,
        humanPrefix,
        returnMessages: true,
        memoryKey,
        inputKey
    }
    if (apiKey) obj.apiKey = apiKey

    return new ZepMemory(obj)
}

module.exports = { nodeClass: ZepMemory_Memory }
