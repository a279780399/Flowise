import { VectorStore } from 'langchain/vectorstores/base'
import { INode, INodeData, INodeParams, VectorStoreRetriever, VectorStoreRetrieverInput } from '../../../src/Interface'

class VectorStoreRetriever_Retrievers implements INode {
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
        this.label = '向量存储检索器'
        this.name = 'vectorStoreRetriever'
        this.type = '向量存储检索器'
        this.icon = 'vectorretriever.svg'
        this.category = 'Retrievers'
        this.categoryName = '检索器'
        this.description = '将向量存储模型存储为一个检索器,这样后续多提示链系统就可以查询使用这个检索器。'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: '向量存储',
                name: 'vectorStore',
                type: 'VectorStore'
            },
            {
                label: '检索器名称',
                name: 'name',
                type: 'string',
                placeholder: 'netflix电影'
            },
            {
                label: '检索器描述',
                name: 'description',
                type: 'string',
                rows: 3,
                description: '描述这个提示的作用,以及在什么情况下应该使用这个提示。',
                placeholder: '请提供任何Netflix电影相关的问题,会尽力回答。'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const name = nodeData.inputs?.name as string
        const description = nodeData.inputs?.description as string
        const vectorStore = nodeData.inputs?.vectorStore as VectorStore

        const obj = {
            name,
            description,
            vectorStore
        } as VectorStoreRetrieverInput

        const retriever = new VectorStoreRetriever(obj)
        return retriever
    }
}

module.exports = { nodeClass: VectorStoreRetriever_Retrievers }
