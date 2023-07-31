import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { RequestParameters, desc, RequestsPostTool } from './core'

class RequestsPost_Tools implements INode {
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
        this.label = 'Post请求'
        this.name = 'requestsPost'
        this.type = 'RequestsPost'
        this.icon = 'requestspost.svg'
        this.category = 'Tools'
        this.categoryName = '工具'
        this.description = '执行http Post请求'
        this.baseClasses = [this.type, ...getBaseClasses(RequestsPostTool)]
        this.inputs = [
            {
                label: 'URL',
                name: 'url',
                type: 'string',
                description: '代理会调用指定的完整URL,如果没有指定URL但提供了AIPlugin,代理会从该插件中推断出调用的URL。',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Body',
                name: 'body',
                type: 'json',
                description: '这是POST请求的JSON格式 body。如果没有指定,而且有AIPlugin,代理会从该插件中推断出JSONbody。',
                additionalParams: true,
                optional: true
            },
            {
                label: '描述',
                name: 'description',
                type: 'string',
                rows: 4,
                default: desc,
                description: '这句话起到提示的作用,告诉代理在什么情况下该使用这个自定义工具。',
                additionalParams: true,
                optional: true
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
        const headers = nodeData.inputs?.headers as string
        const url = nodeData.inputs?.url as string
        const description = nodeData.inputs?.description as string
        const body = nodeData.inputs?.body as string

        const obj: RequestParameters = {}
        if (url) obj.url = url
        if (description) obj.description = description
        if (headers) {
            const parsedHeaders = typeof headers === 'object' ? headers : JSON.parse(headers)
            obj.headers = parsedHeaders
        }
        if (body) {
            const parsedBody = typeof body === 'object' ? body : JSON.parse(body)
            obj.body = parsedBody
        }

        return new RequestsPostTool(obj)
    }
}

module.exports = { nodeClass: RequestsPost_Tools }
