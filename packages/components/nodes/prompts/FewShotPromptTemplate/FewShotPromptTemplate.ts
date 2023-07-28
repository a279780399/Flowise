import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getInputVariables } from '../../../src/utils'
import { FewShotPromptTemplate, FewShotPromptTemplateInput, PromptTemplate } from 'langchain/prompts'
import { Example } from 'langchain/schema'
import { TemplateFormat } from 'langchain/dist/prompts/template'

class FewShotPromptTemplate_Prompts implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = '样例提示词模板'
        this.name = 'fewShotPromptTemplate'
        this.type = '样例提示词模板'
        this.icon = 'prompt.svg'
        this.category = '提示词'
        this.description = '你可以通过示例来构建提示词模板。'
        this.baseClasses = [this.type, ...getBaseClasses(FewShotPromptTemplate)]
        this.inputs = [
            {
                label: '样例',
                name: 'examples',
                type: 'string',
                rows: 4,
                placeholder: `[
  { "词语": "高兴", "反义词": "伤心" },
  { "词语": "长", "反义词": "短" },
]`
            },
            {
                label: '样例提示词',
                name: 'examplePrompt',
                type: 'PromptTemplate'
            },
            {
                label: '前缀',
                name: 'prefix',
                type: 'string',
                rows: 4,
                placeholder: `给出每个输入词语的反义词`
            },
            {
                label: '后缀',
                name: 'suffix',
                type: 'string',
                rows: 4,
                placeholder: `词语: {输入}\n反义词:`
            },
            {
                label: '分隔符示例',
                name: 'exampleSeparator',
                type: 'string',
                placeholder: `\n\n`
            },
            {
                label: '模板格式',
                name: 'templateFormat',
                type: 'options',
                options: [
                    {
                        label: 'f-string',
                        name: 'f-string'
                    },
                    {
                        label: 'jinja-2',
                        name: 'jinja-2'
                    }
                ],
                default: `f-string`
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const examplesStr = nodeData.inputs?.examples as string
        const prefix = nodeData.inputs?.prefix as string
        const suffix = nodeData.inputs?.suffix as string
        const exampleSeparator = nodeData.inputs?.exampleSeparator as string
        const templateFormat = nodeData.inputs?.templateFormat as TemplateFormat
        const examplePrompt = nodeData.inputs?.examplePrompt as PromptTemplate

        const inputVariables = getInputVariables(suffix)
        const examples: Example[] = JSON.parse(examplesStr.replace(/\s/g, ''))

        try {
            const obj: FewShotPromptTemplateInput = {
                examples,
                examplePrompt,
                prefix,
                suffix,
                inputVariables,
                exampleSeparator,
                templateFormat
            }
            const prompt = new FewShotPromptTemplate(obj)
            return prompt
        } catch (e) {
            throw new Error(e)
        }
    }
}

module.exports = { nodeClass: FewShotPromptTemplate_Prompts }
