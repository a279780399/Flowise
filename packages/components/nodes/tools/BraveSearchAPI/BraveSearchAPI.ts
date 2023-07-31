import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { BraveSearch } from 'langchain/tools'

class BraveSearchAPI_Tools implements INode {
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
        this.label = 'BraveSearch API'
        this.name = 'braveSearchAPI'
        this.type = 'BraveSearchAPI'
        this.icon = 'brave.svg'
        this.category = 'Tools'
        this.categoryName = '工具'
        this.description = '这是一个封装了BraveSearch API的包装器,通过它可以实时访问BraveSearch引擎的搜索结果。'
        this.inputs = [
            {
                label: 'BraveSearch API密钥',
                name: 'apiKey',
                type: 'password'
            }
        ]
        this.baseClasses = [this.type, ...getBaseClasses(BraveSearch)]
    }

    async init(nodeData: INodeData): Promise<any> {
        const apiKey = nodeData.inputs?.apiKey as string
        return new BraveSearch({ apiKey })
    }
}

module.exports = { nodeClass: BraveSearchAPI_Tools }
