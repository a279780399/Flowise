import { BaseLanguageModel } from 'langchain/base_language'
import { ICommonObject, IMessage, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { AIMessage, BaseRetriever, HumanMessage } from 'langchain/schema'
import { BaseChatMemory, BufferMemory, ChatMessageHistory } from 'langchain/memory'
import { PromptTemplate } from 'langchain/prompts'
import { ConsoleCallbackHandler, CustomChainHandler } from '../../../src/handler'

const default_qa_template = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`

const qa_template = `Use the following pieces of context to answer the question at the end.

{context}

Question: {question}
Helpful Answer:`

const CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language. include it in the standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`

class ConversationalRetrievalQAChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = '会话式检索问答链'
        this.name = 'conversationalRetrievalQAChain'
        this.type = 'ConversationalRetrievalQAChain'
        this.icon = 'chain.svg'
        this.category = '链'
        this.description = '文档问答 - 基于检索问答链构建,提供聊天历史组件'
        this.baseClasses = [this.type, ...getBaseClasses(ConversationalRetrievalQAChain)]
        this.inputs = [
            {
                label: '语言模型',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: '向量存储检索器',
                name: 'vectorStoreRetriever',
                type: 'BaseRetriever'
            },
            {
                label: '存储器',
                name: 'memory',
                type: 'DynamoDBChatMemory | RedisBackedChatMemory | ZepMemory',
                optional: true,
                description: '如果未连接内存,将使用默认的BufferMemory'
            },
            {
                label: '返回源文档',
                name: 'returnSourceDocuments',
                type: 'boolean',
                optional: true
            },
            {
                label: '系统提示',
                name: 'systemMessagePrompt',
                type: 'string',
                rows: 4,
                additionalParams: true,
                optional: true,
                placeholder:
                    '我希望你扮演我正在与之对话的文档。你的名字是“AI助手”。你将从给定的信息中为我提供答案。如果答案未包含在内,请准确地说“嗯,我不确定。”并在此之后停止。拒绝回答任何不关于该信息的问题。永远不要打破角色。'
            },
            {
                label: '链选项',
                name: 'chainOption',
                type: 'options',
                options: [
                    {
                        label: 'MapReduce文档链',
                        name: 'map_reduce',
                        description: '适用于较大文档上的问答任务,可以并行运行预处理步骤,减少运行时间'
                    },
                    {
                        label: '优化文档链',
                        name: 'refine',
                        description: '适用于大量文档的问答任务。'
                    },
                    {
                        label: '填充文档链',
                        name: 'stuff',
                        description: '适用于少量文档的问答任务。'
                    }
                ],
                additionalParams: true,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const vectorStoreRetriever = nodeData.inputs?.vectorStoreRetriever as BaseRetriever
        const systemMessagePrompt = nodeData.inputs?.systemMessagePrompt as string
        const returnSourceDocuments = nodeData.inputs?.returnSourceDocuments as boolean
        const chainOption = nodeData.inputs?.chainOption as string
        const memory = nodeData.inputs?.memory

        const obj: any = {
            verbose: process.env.DEBUG === 'true' ? true : false,
            qaChainOptions: {
                type: 'stuff',
                prompt: PromptTemplate.fromTemplate(systemMessagePrompt ? `${systemMessagePrompt}\n${qa_template}` : default_qa_template)
            },
            questionGeneratorChainOptions: {
                template: CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT
            }
        }
        if (returnSourceDocuments) obj.returnSourceDocuments = returnSourceDocuments
        if (chainOption) obj.qaChainOptions = { ...obj.qaChainOptions, type: chainOption }
        if (memory) {
            memory.inputKey = 'question'
            memory.outputKey = 'text'
            memory.memoryKey = 'chat_history'
            obj.memory = memory
        } else {
            obj.memory = new BufferMemory({
                memoryKey: 'chat_history',
                inputKey: 'question',
                outputKey: 'text',
                returnMessages: true
            })
        }

        const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStoreRetriever, obj)
        return chain
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string | ICommonObject> {
        const chain = nodeData.instance as ConversationalRetrievalQAChain
        const returnSourceDocuments = nodeData.inputs?.returnSourceDocuments as boolean
        const memory = nodeData.inputs?.memory

        let model = nodeData.inputs?.model

        // Temporary fix: https://github.com/hwchase17/langchainjs/issues/754
        model.streaming = false
        chain.questionGeneratorChain.llm = model

        const obj = { question: input }

        // If external memory like Zep, Redis is being used, ignore below
        if (!memory && chain.memory && options && options.chatHistory) {
            const chatHistory = []
            const histories: IMessage[] = options.chatHistory
            const memory = chain.memory as BaseChatMemory

            for (const message of histories) {
                if (message.type === 'apiMessage') {
                    chatHistory.push(new AIMessage(message.message))
                } else if (message.type === 'userMessage') {
                    chatHistory.push(new HumanMessage(message.message))
                }
            }
            memory.chatHistory = new ChatMessageHistory(chatHistory)
            chain.memory = memory
        }

        const loggerHandler = new ConsoleCallbackHandler(options.logger)

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId, undefined, returnSourceDocuments)
            const res = await chain.call(obj, [loggerHandler, handler])
            if (res.text && res.sourceDocuments) return res
            return res?.text
        } else {
            const res = await chain.call(obj, [loggerHandler])
            if (res.text && res.sourceDocuments) return res
            return res?.text
        }
    }
}

module.exports = { nodeClass: ConversationalRetrievalQAChain_Chains }
