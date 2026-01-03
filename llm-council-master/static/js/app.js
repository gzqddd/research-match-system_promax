/**
 * Application components and state management
 * Converted from React JSX to vanilla JavaScript
 */

import { api } from '/static/js/api.js';

// =========================================================================
// 注意：由于后续决定直接实时解析，不再需要在 HTML 中存储 Base64，
// 因此 utf8ToBase64 函数不再需要，但保留它以备将来使用。
// function utf8ToBase64(str) { ... }
// =========================================================================

// Sidebar Component (保持不变)
class Sidebar {
    constructor(container, {
        conversations = [],
        currentConversationId = null,
        onSelectConversation = () => {},
        onNewConversation = () => {},
    }) {
        this.container = container;
        this.conversations = conversations;
        this.currentConversationId = currentConversationId;
        this.onSelectConversation = onSelectConversation;
        this.onNewConversation = onNewConversation;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="sidebar">
                <div class="sidebar-header">
                    <h1>大语言模型顾问团</h1>
                    <button class="new-conversation-btn">+ 新建对话</button>
                </div>
                <div class="conversation-list">
                    ${this.conversations.length === 0 
                        ? '<div class="no-conversations">暂无对话</div>'
                        : this.conversations.map(conv => `
                            <div class="conversation-item ${conv.id === this.currentConversationId ? 'active' : ''}" data-id="${conv.id}">
                                <div class="conversation-title">${conv.title || '新建对话'}</div>
                                <div class="conversation-meta">${conv.message_count} 条消息</div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;

        this.container.querySelector('.new-conversation-btn').addEventListener('click', () => {
            this.onNewConversation();
        });

        this.container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                this.onSelectConversation(item.dataset.id);
            });
        });
    }

    update(conversations, currentConversationId) {
        this.conversations = conversations;
        this.currentConversationId = currentConversationId;
        this.render();
    }
}

// Chat Interface Component
class ChatInterface {
    constructor(container, {
        conversation = null,
        onSendMessage = () => {},
        isLoading = false,
    }) {
        this.container = container;
        this.conversation = conversation;
        this.onSendMessage = onSendMessage;
        this.isLoading = isLoading;
        this.input = '';
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="chat-interface">
                <div class="messages-container">
                    ${!this.conversation
                        ? `
                            <div class="empty-state">
                                <h2>欢迎使用大语言模型顾问团</h2>
                                <p>创建新对话以开始使用</p>
                            </div>
                        `
                        : `
                            ${this.conversation.messages.length === 0
                                ? `
                                    <div class="empty-state">
                                        <h2>开始对话</h2>
                                        <p>提出问题以咨询大语言模型顾问团</p>
                                    </div>
                                `
                                : this.conversation.messages.map((msg, index) => this.renderMessage(msg, index)).join('')
                            }
                            ${this.isLoading
                                ? `
                                    <div class="loading-indicator">
                                        <div class="spinner"></div>
                                        <span>正在咨询顾问团...</span>
                                    </div>
                                `
                                : ''
                            }
                        `
                    }
                    <div id="messages-end"></div>
                </div>
                ${this.conversation
                    ? `
                        <form class="input-form">
                            <textarea
                                class="message-input"
                                placeholder="输入你的问题...（Shift+Enter换行，Enter发送）"
                                ${this.isLoading ? 'disabled' : ''}
                                rows="3"
                            >${this.input}</textarea>
                            <button type="submit" class="send-button" ${!this.input.trim() || this.isLoading ? 'disabled' : ''}>
                                发送
                            </button>
                        </form>
                    `
                    : ''
                }
            </div>
        `;

        // Setup event listeners
        const textarea = this.container.querySelector('.message-input');
        const form = this.container.querySelector('.input-form');

        if (textarea) {
            textarea.addEventListener('input', (e) => {
                this.input = e.target.value;
                form.querySelector('.send-button').disabled = !this.input.trim() || this.isLoading;
            });

            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.dispatchEvent(new Event('submit'));
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.input.trim() && !this.isLoading) {
                    const messageToSend = this.input; 
                    this.input = ''; 
                    form.querySelector('.message-input').value = ''; // 立即清空 DOM
                    form.querySelector('.send-button').disabled = true;

                    this.onSendMessage(messageToSend);
                }
            });
        }

        // --- Tab 切换事件监听器 (保持不变) ---
        this.setupTabListeners();
        
        // --- 核心修正：仅滚动到底部 ---
        // 渲染时内容已经即时解析，无需额外的注入/解码步骤
        const messagesEnd = this.container.querySelector('#messages-end');
        if (messagesEnd) {
            messagesEnd.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // ⚠️ 移除 injectMarkdownContent 方法：不再需要，因为我们将在 renderStageX 中直接解析。

    setupTabListeners() {
        const lastAssistantMessage = this.conversation?.messages.filter(msg => msg.role === 'assistant').pop();

        if (!lastAssistantMessage) return;

        // 阶段 1: 模型独立回答 (stage1) 切换逻辑
        this.container.querySelectorAll('.stage1 .tabs .tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const stage1Container = e.target.closest('.stage1');
                const tabIndex = parseInt(e.target.dataset.stage1Tab, 10);
                const responses = lastAssistantMessage.stage1;

                if (!responses || !stage1Container) return;

                // 1. 切换按钮的 active 状态
                stage1Container.querySelectorAll('.tabs .tab').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');

                // 2. 更新内容
                const selectedResponse = responses[tabIndex];
                const tabContent = stage1Container.querySelector('.tab-content');
                const responseTextDiv = tabContent.querySelector('.response-text.markdown-content');
                
                tabContent.querySelector('.model-name').textContent = selectedResponse.model.split('/')[1] || selectedResponse.model;
                
                // 使用 marked.js 解析并注入 HTML
                responseTextDiv.innerHTML = window.marked.parse(selectedResponse.response);
            });
        });

        // 阶段 2: 模型间互评打分 (stage2) 切换逻辑
        this.container.querySelectorAll('.stage2 .tabs .tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const stage2Container = e.target.closest('.stage2');
                const tabIndex = parseInt(e.target.dataset.stage2Tab, 10);
                const rankings = lastAssistantMessage.stage2;

                if (!rankings || !stage2Container) return;

                // 1. 切换按钮的 active 状态
                stage2Container.querySelectorAll('.tabs .tab').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');

                // 2. 更新内容
                const selectedRanking = rankings[tabIndex];
                const tabContent = stage2Container.querySelector('.tab-content');
                const rankingContentDiv = tabContent.querySelector('.ranking-content.markdown-content');

                tabContent.querySelector('.ranking-model').textContent = selectedRanking.model.split('/')[1] || selectedRanking.model;
                
                // 使用 marked.js 解析并注入 HTML
                rankingContentDiv.innerHTML = window.marked.parse(selectedRanking.ranking);
            });
        });
    }

    renderMessage(msg, index) {
        if (msg.role === 'user') {
            return `
                <div class="message-group">
                    <div class="user-message">
                        <div class="message-label">你</div>
                        <div class="message-content">
                            <div class="markdown-content">
                                <p>${msg.content.replace(/\n/g, '<br>')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="message-group">
                    <div class="assistant-message">
                        <div class="message-label">大语言模型顾问团</div>
                        ${msg.loading?.stage1 ? '<div class="stage-loading"><div class="spinner"></div><span>正在运行阶段1：收集各模型独立回答...</span></div>' : ''}
                        ${msg.stage1 ? this.renderStage1(msg.stage1) : ''}
                        ${msg.loading?.stage2 ? '<div class="stage-loading"><div class="spinner"></div><span>正在运行阶段2：模型间互评打分...</span></div>' : ''}
                        ${msg.stage2 ? this.renderStage2(msg.stage2, msg.metadata) : ''}
                        ${msg.loading?.stage3 ? '<div class="stage-loading"><div class="spinner"></div><span>正在运行阶段3：生成最终综合回答...</span></div>' : ''}
                        ${msg.stage3 ? this.renderStage3(msg.stage3) : ''}
                    </div>
                </div>
            `;
        }
    }

    // 核心修正：直接在 renderStage1 中使用 marked.parse() 渲染内容
    renderStage1(responses) {
        if (!responses || responses.length === 0) return '';
        
        // 实时解析第一个模型的 Markdown，用于默认显示
        const defaultResponseHtml = window.marked.parse(responses[0].response);
        
        return `
            <div class="stage stage1">
                <h3 class="stage-title">阶段1：各模型独立回答</h3>
                <div class="tabs">
                    ${responses.map((r, i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-stage1-tab="${i}">${r.model.split('/')[1] || r.model}</button>`).join('')}
                </div>
                <div class="tab-content">
                    <div class="model-name">${responses[0].model.split('/')[1] || responses[0].model}</div>
                    <div class="response-text markdown-content">${defaultResponseHtml}</div>
                </div>
            </div>
        `;
    }

    // 核心修正：直接在 renderStage2 中使用 marked.parse() 渲染内容
    renderStage2(rankings, metadata) {
        if (!rankings || rankings.length === 0) return '';
        
        // 实时解析第一个模型的 Markdown，用于默认显示
        const defaultRankingHtml = window.marked.parse(rankings[0].ranking);

        return `
            <div class="stage stage2">
                <h3 class="stage-title">阶段2：模型间互评打分</h3>
                <h4>原始评估结果</h4>
                <div class="tabs">
                    ${rankings.map((r, i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-stage2-tab="${i}">${r.model.split('/')[1] || r.model}</button>`).join('')}
                </div>
                <div class="tab-content">
                    <div class="ranking-model">${rankings[0].model.split('/')[1] || rankings[0].model}</div>
                    <div class="ranking-content markdown-content">${defaultRankingHtml}</div>
                </div>
                ${metadata?.aggregate_rankings ? this.renderAggregateRankings(metadata.aggregate_rankings) : ''}
            </div>
        `;
    }

    renderAggregateRankings(rankings) {
        // ... (保持不变)
        return `
            <div class="aggregate-rankings">
                <h4>综合排名（可信度评分）</h4>
                <div class="aggregate-list">
                    ${rankings.map((r, i) => `
                        <div class="aggregate-item">
                            <span class="rank-position">第${i + 1}名</span>
                            <span class="rank-model">${r.model.split('/')[1] || r.model}</span>
                            <span class="rank-score">平均分：${r.average_rank.toFixed(2)}</span>
                            <span class="rank-count">（${r.rankings_count} 票）</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 核心修正：直接在 renderStage3 中使用 marked.parse() 渲染内容
    renderStage3(finalResponse) {
        if (!finalResponse) return '';

        // 实时解析最终回答的 Markdown
        const finalHtml = window.marked.parse(finalResponse.response);
        
        return `
            <div class="stage stage3">
                <h3 class="stage-title">阶段3：顾问团最终回答</h3>
                <div class="final-response">
                    <div class="chairman-label">主持模型：${finalResponse.model.split('/')[1] || finalResponse.model}</div>
                    <div class="final-text markdown-content">${finalHtml}</div>
                </div>
            </div>
        `;
    }
    
    update(conversation, isLoading) {
        this.conversation = conversation;
        this.isLoading = isLoading;
        this.render(); 
    }
}

// Main App (保持不变)
class App {
    // ... (保持不变)
    constructor(rootElement) {
        this.rootElement = rootElement;
        this.conversations = [];
        this.currentConversationId = null;
        this.currentConversation = null;
        this.isLoading = false;

        this.rootElement.classList.add('app');

        const existingSidebar = this.rootElement.querySelector('#sidebar-container');
        const existingChat = this.rootElement.querySelector('#chat-container');

        if (existingSidebar) {
            this.sidebarContainer = existingSidebar;
        } else {
            this.sidebarContainer = document.createElement('div');
            this.sidebarContainer.id = 'sidebar-container';
            this.rootElement.appendChild(this.sidebarContainer);
        }

        if (existingChat) {
            this.chatContainer = existingChat;
        } else {
            this.chatContainer = document.createElement('div');
            this.chatContainer.id = 'chat-container';
            this.rootElement.appendChild(this.chatContainer);
        }

        this.sidebar = new Sidebar(this.sidebarContainer, {
            conversations: this.conversations,
            currentConversationId: this.currentConversationId,
            onSelectConversation: (id) => this.handleSelectConversation(id),
            onNewConversation: () => this.handleNewConversation(),
        });

        this.chatInterface = new ChatInterface(this.chatContainer, {
            conversation: this.currentConversation,
            onSendMessage: (content) => this.handleSendMessage(content),
            isLoading: this.isLoading,
        });

        this.loadConversations();
    }

    async loadConversations() {
        try {
            this.conversations = await api.listConversations();
            this.sidebar.update(this.conversations, this.currentConversationId);
        } catch (error) {
            console.error('加载对话列表失败:', error);
        }
    }

    async loadConversation(id) {
        try {
            this.currentConversation = await api.getConversation(id);
            this.chatInterface.update(this.currentConversation, this.isLoading);
        } catch (error) {
            console.error('加载对话详情失败:', error);
        }
    }

    async handleNewConversation() {
        try {
            const newConv = await api.createConversation();
            this.conversations.unshift({
                id: newConv.id,
                created_at: newConv.created_at,
                title: newConv.title,
                message_count: 0
            });
            this.currentConversationId = newConv.id;
            this.sidebar.update(this.conversations, this.currentConversationId);
            await this.loadConversation(newConv.id);
        } catch (error) {
            console.error('创建新对话失败:', error);
        }
    }

    async handleSelectConversation(id) {
        this.currentConversationId = id;
        this.sidebar.update(this.conversations, this.currentConversationId);
        await this.loadConversation(id);
    }

    async handleSendMessage(content) {
        if (!this.currentConversationId) return;

        this.isLoading = true;

        // Add user message
        this.currentConversation.messages.push({ role: 'user', content });
        
        // Add assistant message placeholder
        const assistantMessage = {
            role: 'assistant',
            stage1: null,
            stage2: null,
            stage3: null,
            metadata: null,
            loading: {
                stage1: false,
                stage2: false,
                stage3: false,
            },
        };
        this.currentConversation.messages.push(assistantMessage);
        this.chatInterface.update(this.currentConversation, this.isLoading);

        try {
            await api.sendMessageStream(this.currentConversationId, content, (eventType, event) => {
                const lastMsg = this.currentConversation.messages[this.currentConversation.messages.length - 1];

                switch (eventType) {
                    case 'stage1_start':
                        lastMsg.loading.stage1 = true;
                        break;
                    case 'stage1_complete':
                        lastMsg.stage1 = event.data;
                        lastMsg.loading.stage1 = false;
                        break;
                    case 'stage2_start':
                        lastMsg.loading.stage2 = true;
                        break;
                    case 'stage2_complete':
                        lastMsg.stage2 = event.data;
                        lastMsg.metadata = event.metadata;
                        lastMsg.loading.stage2 = false;
                        break;
                    case 'stage3_start':
                        lastMsg.loading.stage3 = true;
                        break;
                    case 'stage3_complete':
                        lastMsg.stage3 = event.data;
                        lastMsg.loading.stage3 = false;
                        break;
                    case 'title_complete':
                        this.loadConversations();
                        break;
                    case 'complete':
                        this.loadConversations();
                        this.isLoading = false;
                        break;
                    case 'error':
                        console.error('流式响应错误:', event.message);
                        this.isLoading = false;
                        break;
                }

                this.chatInterface.update(this.currentConversation, this.isLoading);
            });
        } catch (error) {
            console.error('发送消息失败:', error);
            this.currentConversation.messages.pop();
            this.currentConversation.messages.pop();
            this.isLoading = false;
            this.chatInterface.update(this.currentConversation, this.isLoading);
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ 检查 window.marked 是否存在，确保 marked.js 已加载
    if (typeof window.marked === 'undefined') {
        console.error("marked.js 未加载! 请确保在 index.html 中引用了 marked.min.js。");
        // 阻止应用启动
        return; 
    }
    const root = document.getElementById('root');
    new App(root);
});