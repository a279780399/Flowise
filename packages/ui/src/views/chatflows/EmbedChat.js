import { useState } from 'react'
import PropTypes from 'prop-types'

import { Tabs, Tab, Box } from '@mui/material'
import { CopyBlock, atomOneDark } from 'react-code-blocks'

// Project import
import { CheckboxInput } from 'ui-component/checkbox/Checkbox'

// Const
import { baseURL } from 'store/constant'

function TabPanel(props) {
    const { children, value, index, ...other } = props
    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`attachment-tabpanel-${index}`}
            aria-labelledby={`attachment-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
        </div>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
}

function a11yProps(index) {
    return {
        id: `attachment-tab-${index}`,
        'aria-controls': `attachment-tabpanel-${index}`
    }
}

const embedPopupHtmlCode = (chatflowid) => {
    return `<script type="module">
    import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
    Chatbot.init({
        chatflowid: "${chatflowid}",
        apiHost: "${baseURL}",
    })
</script>`
}

const embedPopupReactCode = (chatflowid) => {
    return `import { BubbleChat } from 'flowise-embed-react'

const App = () => {
    return (
        <BubbleChat chatflowid="${chatflowid}" apiHost="${baseURL}" />
    );
};`
}

const embedFullpageHtmlCode = (chatflowid) => {
    return `<flowise-fullchatbot></flowise-fullchatbot>
<script type="module">
    import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
    Chatbot.initFull({
        chatflowid: "${chatflowid}",
        apiHost: "${baseURL}",
    })
</script>`
}

const embedFullpageReactCode = (chatflowid) => {
    return `import { FullPageChat } from "flowise-embed-react"

const App = () => {
    return (
        <FullPageChat
            chatflowid="${chatflowid}"
            apiHost="${baseURL}"
        />
    );
};`
}

const buttonConfig = (isReact = false) => {
    return isReact
        ? `button: {
                    backgroundColor: "#3B81F6",
                    right: 20,
                    bottom: 20,
                    size: "medium",
                    iconColor: "white",
                    customIconSrc: "https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg",
                }`
        : `button: {
                backgroundColor: "#3B81F6",
                right: 20,
                bottom: 20,
                size: "medium",
                iconColor: "white",
                customIconSrc: "https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg",
            }`
}

const chatwindowConfig = (isReact = false) => {
    return isReact
        ? `chatWindow: {
                    welcomeMessage: "Hello! This is custom welcome message",
                    backgroundColor: "#ffffff",
                    height: 700,
                    width: 400,
                    fontSize: 16,
                    poweredByTextColor: "#303235",
                    botMessage: {
                        backgroundColor: "#f7f8ff",
                        textColor: "#303235",
                        showAvatar: true,
                        avatarSrc: "https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/parroticon.png",
                    },
                    userMessage: {
                        backgroundColor: "#3B81F6",
                        textColor: "#ffffff",
                        showAvatar: true,
                        avatarSrc: "https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png",
                    },
                    textInput: {
                        placeholder: "Type your question",
                        backgroundColor: "#ffffff",
                        textColor: "#303235",
                        sendButtonColor: "#3B81F6",
                    }
                }`
        : `chatWindow: {
                welcomeMessage: "Hello! This is custom welcome message",
                backgroundColor: "#ffffff",
                height: 700,
                width: 400,
                fontSize: 16,
                poweredByTextColor: "#303235",
                botMessage: {
                    backgroundColor: "#f7f8ff",
                    textColor: "#303235",
                    showAvatar: true,
                    avatarSrc: "https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/parroticon.png",
                },
                userMessage: {
                    backgroundColor: "#3B81F6",
                    textColor: "#ffffff",
                    showAvatar: true,
                    avatarSrc: "https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png",
                },
                textInput: {
                    placeholder: "Type your question",
                    backgroundColor: "#ffffff",
                    textColor: "#303235",
                    sendButtonColor: "#3B81F6",
                }
            }`
}

const embedPopupHtmlCodeCustomization = (chatflowid) => {
    return `<script type="module">
    import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
    Chatbot.init({
        chatflowid: "${chatflowid}",
        apiHost: "${baseURL}",
        chatflowConfig: {
            // topK: 2
        },
        theme: {
            ${buttonConfig()},
            ${chatwindowConfig()}
        }
    })
</script>`
}

const embedPopupReactCodeCustomization = (chatflowid) => {
    return `import { BubbleChat } from 'flowise-embed-react'

const App = () => {
    return (
        <BubbleChat
            chatflowid="${chatflowid}"
            apiHost="${baseURL}"
            theme={{
                ${buttonConfig(true)},
                ${chatwindowConfig(true)}
            }}
        />
    );
};`
}

const embedFullpageHtmlCodeCustomization = (chatflowid) => {
    return `<flowise-fullchatbot></flowise-fullchatbot>
<script type="module">
    import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
    Chatbot.initFull({
        chatflowid: "${chatflowid}",
        apiHost: "${baseURL}",
        theme: {
            ${chatwindowConfig()}
        }
    })
</script>`
}

const embedFullpageReactCodeCustomization = (chatflowid) => {
    return `import { FullPageChat } from "flowise-embed-react"

const App = () => {
    return (
        <FullPageChat
            chatflowid="${chatflowid}"
            apiHost="${baseURL}"
            theme={{
                ${chatwindowConfig(true)}
            }}
        />
    );
};`
}

const EmbedChat = ({ chatflowid }) => {
    const codes = ['弹窗 Html', '全屏 Html', '弹窗 React', '全屏 React']
    const [value, setValue] = useState(0)
    const [embedChatCheckboxVal, setEmbedChatCheckbox] = useState(false)

    const onCheckBoxEmbedChatChanged = (newVal) => {
        setEmbedChatCheckbox(newVal)
    }

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const getCode = (codeLang) => {
        switch (codeLang) {
            case '弹窗 Html':
                return embedPopupHtmlCode(chatflowid)
            case '全屏 Html':
                return embedFullpageHtmlCode(chatflowid)
            case '弹窗 React':
                return embedPopupReactCode(chatflowid)
            case '全屏 React':
                return embedFullpageReactCode(chatflowid)
            default:
                return ''
        }
    }

    const getCodeCustomization = (codeLang) => {
        switch (codeLang) {
            case '弹窗 Html':
                return embedPopupHtmlCodeCustomization(chatflowid)
            case '全屏 Html':
                return embedFullpageHtmlCodeCustomization(chatflowid)
            case '弹窗 React':
                return embedPopupReactCodeCustomization(chatflowid)
            case '全屏 React':
                return embedFullpageReactCodeCustomization(chatflowid)
            default:
                return ''
        }
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{ flex: 80 }}>
                    <Tabs value={value} onChange={handleChange} aria-label='tabs'>
                        {codes.map((codeLang, index) => (
                            <Tab key={index} label={codeLang} {...a11yProps(index)}></Tab>
                        ))}
                    </Tabs>
                </div>
            </div>
            <div style={{ marginTop: 10 }}></div>
            {codes.map((codeLang, index) => (
                <TabPanel key={index} value={value} index={index}>
                    {(value === 0 || value === 1) && (
                        <>
                            <span>
                                将其粘贴到html文件的<code>{`<body>`}</code>标记中的任何位置。
                                <p>
                                    您也可以指定一个版本<code>{`npm/flowise-embed@<version>/dist/web.js`}</code>
                                </p>
                            </span>
                            <div style={{ height: 10 }}></div>
                        </>
                    )}
                    <CopyBlock theme={atomOneDark} text={getCode(codeLang)} language='javascript' showLineNumbers={false} wrapLines />

                    <CheckboxInput label='显示嵌入聊天配置' value={embedChatCheckboxVal} onChange={onCheckBoxEmbedChatChanged} />

                    {embedChatCheckboxVal && (
                        <CopyBlock
                            theme={atomOneDark}
                            text={getCodeCustomization(codeLang)}
                            language='javascript'
                            showLineNumbers={false}
                            wrapLines
                        />
                    )}
                </TabPanel>
            ))}
        </>
    )
}

EmbedChat.propTypes = {
    chatflowid: PropTypes.string
}

export default EmbedChat
