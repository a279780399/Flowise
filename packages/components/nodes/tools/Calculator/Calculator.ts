import { INode } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { Calculator } from 'langchain/tools/calculator'

class Calculator_Tools implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]

    constructor() {
        this.label = '计算器'
        this.name = 'calculator'
        this.type = '计算器'
        this.icon = 'calculator.svg'
        this.category = '工具'
        this.description = '对系统的响应内容执行某些计算。'
        this.baseClasses = [this.type, ...getBaseClasses(Calculator)]
    }

    async init(): Promise<any> {
        return new Calculator()
    }
}

module.exports = { nodeClass: Calculator_Tools }
