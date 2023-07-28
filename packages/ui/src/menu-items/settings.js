// assets
import { IconTrash, IconFileUpload, IconFileExport, IconCopy } from '@tabler/icons'

// constant
const icons = { IconTrash, IconFileUpload, IconFileExport, IconCopy }

// ==============================|| SETTINGS MENU ITEMS ||============================== //

const settings = {
    id: 'settings',
    title: '',
    type: 'group',
    children: [
        {
            id: 'duplicateChatflow',
            title: '复制会话流程',
            type: 'item',
            url: '',
            icon: icons.IconCopy
        },
        {
            id: 'loadChatflow',
            title: '加载会话流程',
            type: 'item',
            url: '',
            icon: icons.IconFileUpload
        },
        {
            id: 'exportChatflow',
            title: '导出会话流程',
            type: 'item',
            url: '',
            icon: icons.IconFileExport
        },
        {
            id: 'deleteChatflow',
            title: '删除会话流程',
            type: 'item',
            url: '',
            icon: icons.IconTrash
        }
    ]
}

export default settings
