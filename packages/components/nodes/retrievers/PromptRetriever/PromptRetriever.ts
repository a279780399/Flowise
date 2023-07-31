import { INode, INodeData, INodeParams, PromptRetriever, PromptRetrieverInput } from '../../../src/Interface'

class PromptRetriever_Retrievers implements INode {
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
        this.label = '提示词检索器'
        this.name = 'promptRetriever'
        this.type = '提示词检索器'
        this.icon = 'promptretriever.svg'
        this.category = 'Retrievers'
        this.categoryName = '检索器'
        this.description = '存储提示模板以及对应的名称和描述,这样后面多提示链系统可以查询到这些提示模板。'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: '提示词名称',
                name: 'name',
                type: 'string',
                placeholder: 'physics-qa'
            },
            {
                label: '提示词描述',
                name: 'description',
                type: 'string',
                rows: 3,
                description: '描述这个提示的作用,以及在什么情况下应该使用这个提示。',
                placeholder: 'Good for answering questions about physics'
            },
            {
                label: '提示词系统提示',
                name: 'systemMessage',
                type: 'string',
                rows: 4,
                placeholder: `你是一个非常聪明的物理学教授。你能够用简洁易懂的方式很好地回答物理学问题。当你不知道问题的答案时,你会承认你不知道。`
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const name = nodeData.inputs?.name as string
        const description = nodeData.inputs?.description as string
        const systemMessage = nodeData.inputs?.systemMessage as string

        const obj = {
            name,
            description,
            systemMessage
        } as PromptRetrieverInput

        const retriever = new PromptRetriever(obj)
        return retriever
    }
}

module.exports = { nodeClass: PromptRetriever_Retrievers }
