import { ZapierNLAWrapper, ZapierNLAWrapperParams } from 'langchain/tools'
import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { ZapierToolKit } from 'langchain/agents'

class ZapierNLA_Tools implements INode {
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
        this.label = 'Zapier NLA'
        this.name = 'zapierNLA'
        this.type = 'ZapierNLA'
        this.icon = 'zapier.png'
        this.category = 'Tools'
        this.categoryName = '工具'
        this.description = '通过自然语言的API接口,可以访问Zapier平台上面的应用程序和工作流操作。'
        this.inputs = [
            {
                label: 'Zapier NLA Api密钥',
                name: 'apiKey',
                type: 'password'
            }
        ]
        this.baseClasses = [this.type, 'Tool']
    }

    async init(nodeData: INodeData): Promise<any> {
        const apiKey = nodeData.inputs?.apiKey as string

        const obj: Partial<ZapierNLAWrapperParams> = {
            apiKey
        }
        const zapier = new ZapierNLAWrapper(obj)
        const toolkit = await ZapierToolKit.fromZapierNLAWrapper(zapier)

        return toolkit.tools
    }
}

module.exports = { nodeClass: ZapierNLA_Tools }
