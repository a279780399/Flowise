import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { APIChain, createOpenAPIChain } from 'langchain/chains'
import { getBaseClasses } from '../../../src/utils'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ConsoleCallbackHandler, CustomChainHandler } from '../../../src/handler'

class OpenApiChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'OpenAPI链'
        this.name = 'openApiChain'
        this.type = 'openApiChain'
        this.icon = 'openapi.png'
        this.category = '链'
        this.description = '针对OpenAPI运行查询的链'
        this.baseClasses = [this.type, ...getBaseClasses(APIChain)]
        this.inputs = [
            {
                label: 'ChatOpenAI模型',
                name: 'model',
                type: 'ChatOpenAI'
            },
            {
                label: 'YAML链接',
                name: 'yamlLink',
                type: 'string',
                placeholder: 'https://api.speak.com/openapi.yaml',
                description: '如果提供了YAML链接,上传的YAML文件将被忽略,而是使用YAML链接'
            },
            {
                label: 'YAML文件',
                name: 'yamlFile',
                type: 'file',
                fileType: '.yaml',
                description: '如果提供了YAML链接,上传的YAML文件将被忽略,而是使用YAML链接'
            },
            {
                label: 'Headers',
                name: 'headers',
                type: 'json',
                additionalParams: true,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        return await initChain(nodeData)
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const chain = await initChain(nodeData)
        const loggerHandler = new ConsoleCallbackHandler(options.logger)

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            const res = await chain.run(input, [loggerHandler, handler])
            return res
        } else {
            const res = await chain.run(input, [loggerHandler])
            return res
        }
    }
}

const initChain = async (nodeData: INodeData) => {
    const model = nodeData.inputs?.model as ChatOpenAI
    const headers = nodeData.inputs?.headers as string
    const yamlLink = nodeData.inputs?.yamlLink as string
    const yamlFileBase64 = nodeData.inputs?.yamlFile as string

    let yamlString = ''

    if (yamlLink) {
        yamlString = yamlLink
    } else {
        const splitDataURI = yamlFileBase64.split(',')
        splitDataURI.pop()
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
        yamlString = bf.toString('utf-8')
    }

    return await createOpenAPIChain(yamlString, {
        llm: model,
        headers: typeof headers === 'object' ? headers : headers ? JSON.parse(headers) : {},
        verbose: process.env.DEBUG === 'true' ? true : false
    })
}

module.exports = { nodeClass: OpenApiChain_Chains }
