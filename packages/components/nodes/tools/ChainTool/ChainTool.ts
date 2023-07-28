import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { BaseChain } from 'langchain/chains'
import { ChainTool } from './core'

class ChainTool_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '链工具'
        this.name = 'chainTool'
        this.type = '链工具'
        this.icon = 'chaintool.svg'
        this.category = '工具'
        this.description = '将一个工具链设置为某个代理程序允许调用或使用的工具之一。'
        this.baseClasses = [this.type, ...getBaseClasses(ChainTool)]
        this.inputs = [
            {
                label: '链名称',
                name: 'name',
                type: 'string',
                placeholder: 'state-of-union-qa'
            },
            {
                label: '链描述',
                name: 'description',
                type: 'string',
                rows: 3,
                placeholder: '国情咨文问答，当您需要询问关于最新国情咨文的问题时非常有用。'
            },
            {
                label: '直接返回',
                name: 'returnDirect',
                type: 'boolean',
                optional: true
            },
            {
                label: '基链',
                name: 'baseChain',
                type: 'BaseChain'
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const name = nodeData.inputs?.name as string
        const description = nodeData.inputs?.description as string
        const baseChain = nodeData.inputs?.baseChain as BaseChain
        const returnDirect = nodeData.inputs?.returnDirect as boolean

        const obj = {
            name,
            description,
            chain: baseChain
        } as any

        if (returnDirect) obj.returnDirect = returnDirect

        const tool = new ChainTool(obj)

        return tool
    }
}

module.exports = { nodeClass: ChainTool_Tools }
