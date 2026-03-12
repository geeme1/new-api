/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useState } from 'react';
import { API, copy, showError, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { useActualTheme, useSetTheme, useTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import NoticeModal from '../../components/layout/NoticeModal';
import { Tabs, TabPane } from '@douyinfe/semi-ui';

const Home = () => {
  const { t, i18n } = useTranslation();
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [guideTab, setGuideTab] = useState('codex');
  const [osTab, setOsTab] = useState('windows');
  const [openClawOsTab, setOpenClawOsTab] = useState('windows');
  const isMobile = useIsMobile();
  const themeMode = useTheme();
  const setTheme = useSetTheme();
  const siteUrl =
    typeof window !== 'undefined' ? window.location.origin : '';
  const consoleTokenUrl = siteUrl ? `${siteUrl}/console/token` : '/console/token';

  const handleCopyCode = async (code) => {
    const ok = await copy(code);
    if (ok) {
      showSuccess(t('已复制到剪贴板'));
    } else {
      showError(t('复制失败'));
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyEndpoint = async () => {
    if (!siteUrl) return;
    const ok = await copy(siteUrl);
    if (ok) {
      showSuccess(t('已复制到剪贴板'));
    } else {
      showError(t('复制失败'));
    }
  };

  const cycleThemeMode = () => {
    if (themeMode === 'light') {
      setTheme('dark');
    } else if (themeMode === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  return (
    <div className='w-full overflow-x-hidden home-film'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full overflow-x-hidden'>
          {/* Banner 部分 */}
          <div className='w-full border-b border-semi-color-border min-h-[500px] md:min-h-[600px] lg:min-h-[700px] relative overflow-x-hidden home-hero'>
            {/* 背景模糊晕染球 */}
            <div className='blur-ball blur-ball-indigo' />
            <div className='blur-ball blur-ball-teal' />
            <div className='flex flex-col items-center justify-center h-full px-4 py-20 md:py-24 lg:py-32 mt-10 gap-10'>
              <div className='w-full max-w-6xl'>
                <div className='home-poster-grid'>
                  <div className='home-poster-left'>
                    <div className='home-poster-kicker'>PUBLIC BENEFIT</div>
                    <div className='home-poster-title'>
                      <span className='home-poster-title-sweep'>ZERO BY</span>
                      <span className='home-poster-title-accent'>Ai中转站</span>
                    </div>
                    <div className='home-poster-sub'>
                      COMMUNITY · STABILITY · SHARED ACCESS
                    </div>
                  </div>
                  <div className='home-poster-right'>
                    <div className='bg-white dark:bg-gray-800 rounded-3xl p-9 shadow-bento flex flex-col justify-between relative overflow-hidden group bento-card bento-hero-card'>
                      <div className='absolute top-0 right-0 w-72 h-72 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30' />
                      <div className='absolute bottom-0 left-0 w-72 h-72 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -ml-24 -mb-20 transition-all duration-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/30' />

                      <div className='relative z-10'>
                        <div className='flex justify-between items-start mb-6'>
                          <div className='inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase'>
                            AI · 稳定 · 共享
                          </div>
                          <button
                            onClick={cycleThemeMode}
                            className='p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative theme-mode-btn'
                            aria-label={t('切换主题')}
                          >
                            <span
                              className={`theme-icon ${themeMode === 'light' ? 'is-active' : ''}`}
                            >
                              L
                            </span>
                            <span
                              className={`theme-icon ${themeMode === 'dark' ? 'is-active' : ''}`}
                            >
                              D
                            </span>
                            <span
                              className={`theme-icon ${themeMode === 'auto' ? 'is-active' : ''}`}
                            >
                              A
                            </span>
                          </button>
                        </div>

                        <h1 className='text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight'>
                          Zer0by
                        </h1>
                        <p className='text-lg text-gray-500 dark:text-gray-400 max-w-xl mb-8 leading-relaxed'>
                          Zer0by Ai中转站致力于为开发者与研究者提供稳定、低门槛的 API
                          接入，聚合多家模型能力，保持清晰、可持续的服务体验。
                        </p>

                        <div className='flex flex-wrap items-center justify-between gap-4 w-full'>
                          <button
                            onClick={() => scrollToId('quick-start')}
                            className='px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center border border-transparent dark:border-gray-200'
                          >
                            开始使用
                          </button>
                          <button
                            onClick={() =>
                              window.open(
                                consoleTokenUrl,
                                '_blank',
                              )
                            }
                            className='px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center'
                          >
                            获取 Key
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='home-access-grid'>
                  <div className='home-access-card home-access-card-endpoint'>
                    <div className='home-access-header'>API Endpoint</div>
                    <div className='home-access-placeholder'>
                      内容兼容 OpenAI 格式，直接替换 Base URL 即可使用。
                    </div>
                    <div className='home-access-row'>
                      <div className='home-access-input'>
                        <span className='home-access-url'>{siteUrl}</span>
                        <button
                          type='button'
                          className='home-access-copy'
                          onClick={handleCopyEndpoint}
                          aria-label='复制 API 地址'
                        >
                          <svg
                            width='18'
                            height='18'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                            aria-hidden='true'
                          >
                            <rect
                              x='9'
                              y='9'
                              width='11'
                              height='11'
                              rx='2'
                              stroke='currentColor'
                              strokeWidth='1.6'
                            />
                            <rect
                              x='4'
                              y='4'
                              width='11'
                              height='11'
                              rx='2'
                              stroke='currentColor'
                              strokeWidth='1.6'
                              opacity='0.7'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 接入指南区块 */}
                <div className='home-access-grid' id='quick-start'>
                  <div className='home-access-card home-access-card-guide'>
                    <div className='home-access-header'>接入指南</div>
                    <div className='home-guide-content'>
                      <Tabs
                        type='line'
                        activeKey={guideTab}
                        onChange={setGuideTab}
                        className='home-guide-tabs'
                      >
                        <TabPane tab='Codex' itemKey='codex'>
                          <div className='home-guide-section'>
                            <div className='home-guide-title'>
                              CodeX CLI 配置
                            </div>
                            <div className='home-guide-subtitle'>
                              新一代 AI 命令行编程助手
                            </div>

                            <Tabs
                              type='button'
                              activeKey={osTab}
                              onChange={setOsTab}
                              className='home-guide-os-tabs'
                            >
                              <TabPane tab='Windows' itemKey='windows'>
                                <div className='home-guide-steps'>
                                  {/* 第一步 */}
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第一步：获取 API Token
                                    </div>
                                    <ul className='home-guide-list'>
                                      <li>访问 Zer0by 控制台</li>
                                      <li>创建新密钥，选择 CodeX 专用分组</li>
                                      <li>复制生成的 API Key (注意：必须是 CodeX 专用分组令牌！)</li>
                                    </ul>
                                  </div>

                                  {/* 第二步 */}
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第二步：创建配置
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      1. 创建目录 (CMD/PowerShell)：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode('mkdir %USERPROFILE%\\.codex\ncd %USERPROFILE%\\.codex')}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`mkdir %USERPROFILE%\\.codex
cd %USERPROFILE%\\.codex`}</code></pre>
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      2. 创建 config.toml (使用 UTF-8 编码)：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`model_provider = "zer0by"
model = "gpt-5.2"                      # 模型名称（代理支持的实际模型，别名或部署名）
model_reasoning_effort = "medium"      # 推荐：medium（平衡速度与推理深度）
                                       # 可选值：none（禁用推理，最快）、minimal、low、medium（默认推荐）、high、xhigh（最强推理，但更慢更贵）
network_access = "enabled"             # 启用网络访问（工具调用等）
disable_response_storage = true        # 禁用响应存储（隐私或轻量）

# 模型提供者配置
[model_providers.zer0by]
name = "Zer0by Proxy"              # 显示名称（自定义）
base_url = "${siteUrl}/v1"  # 代理基地址（OpenAI 兼容）
wire_api = "responses"                 # 使用 Responses API（推荐 GPT-5 系列，支持高级 reasoning）
requires_openai_auth = true            # 需要标准 OpenAI 风格的 API Key 认证`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`model_provider = "zer0by"
model = "gpt-5.2"                      # 模型名称（代理支持的实际模型，别名或部署名）
model_reasoning_effort = "medium"      # 推荐：medium（平衡速度与推理深度）
                                       # 可选值：none（禁用推理，最快）、minimal、low、medium（默认推荐）、high、xhigh（最强推理，但更慢更贵）
network_access = "enabled"             # 启用网络访问（工具调用等）
disable_response_storage = true        # 禁用响应存储（隐私或轻量）

# 模型提供者配置
[model_providers.zer0by]
name = "Zer0by Proxy"              # 显示名称（自定义）
base_url = "${siteUrl}/v1"  # 代理基地址（OpenAI 兼容）
wire_api = "responses"                 # 使用 Responses API（推荐 GPT-5 系列，支持高级 reasoning）
requires_openai_auth = true            # 需要标准 OpenAI 风格的 API Key 认证`}</code></pre>
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      3. 创建 auth.json：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`{
  "OPENAI_API_KEY": "粘贴为CodeX专用分组令牌key"
}`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`{
  "OPENAI_API_KEY": "粘贴为CodeX专用分组令牌key"
}`}</code></pre>
                                    </div>
                                  </div>

                                  {/* 第三步 */}
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第三步：启动
                                    </div>
                                    <div className='home-guide-step-desc'>
                                      进入工程目录并运行：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`mkdir my-codex-project
cd my-codex-project
codex`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`mkdir my-codex-project
cd my-codex-project
codex`}</code></pre>
                                    </div>
                                  </div>
                                </div>
                              </TabPane>
                              <TabPane tab='macOS' itemKey='macos'>
                                <div className='home-guide-steps'>
                                  {/* 第一步 */}
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第一步：获取 API Token
                                    </div>
                                    <ul className='home-guide-list'>
                                      <li>访问 Zer0by 控制台</li>
                                      <li>创建新密钥，选择 CodeX 专用分组</li>
                                      <li>复制生成的 API Key (注意：必须是 CodeX 专用分组令牌！)</li>
                                    </ul>
                                  </div>

                                  {/* 第二步 */}
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第二步：创建配置
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      1. 创建目录 (Terminal)：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode('mkdir -p ~/.codex\ncd ~/.codex')}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`mkdir -p ~/.codex
cd ~/.codex`}</code></pre>
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      2. 创建 config.toml (使用 UTF-8 编码)：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`model_provider = "zer0by"
model = "gpt-5.2"                      # 模型名称（代理支持的实际模型，别名或部署名）
model_reasoning_effort = "medium"      # 推荐：medium（平衡速度与推理深度）
                                       # 可选值：none（禁用推理，最快）、minimal、low、medium（默认推荐）、high、xhigh（最强推理，但更慢更贵）
network_access = "enabled"             # 启用网络访问（工具调用等）
disable_response_storage = true        # 禁用响应存储（隐私或轻量）

# 模型提供者配置
[model_providers.zer0by]
name = "Zer0by Proxy"              # 显示名称（自定义）
base_url = "${siteUrl}/v1"  # 代理基地址（OpenAI 兼容）
wire_api = "responses"                 # 使用 Responses API（推荐 GPT-5 系列，支持高级 reasoning）
requires_openai_auth = true            # 需要标准 OpenAI 风格的 API Key 认证`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`model_provider = "zer0by"
model = "gpt-5.2"                      # 模型名称（代理支持的实际模型，别名或部署名）
model_reasoning_effort = "medium"      # 推荐：medium（平衡速度与推理深度）
                                       # 可选值：none（禁用推理，最快）、minimal、low、medium（默认推荐）、high、xhigh（最强推理，但更慢更贵）
network_access = "enabled"             # 启用网络访问（工具调用等）
disable_response_storage = true        # 禁用响应存储（隐私或轻量）

# 模型提供者配置
[model_providers.zer0by]
name = "Zer0by Proxy"              # 显示名称（自定义）
base_url = "${siteUrl}/v1"  # 代理基地址（OpenAI 兼容）
wire_api = "responses"                 # 使用 Responses API（推荐 GPT-5 系列，支持高级 reasoning）
requires_openai_auth = true            # 需要标准 OpenAI 风格的 API Key 认证`}</code></pre>
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      3. 创建 auth.json：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`{
  "OPENAI_API_KEY": "粘贴为CodeX专用分组令牌key"
}`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`{
  "OPENAI_API_KEY": "粘贴为CodeX专用分组令牌key"
}`}</code></pre>
                                    </div>
                                  </div>

                                  {/* 第三步 */}
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第三步：启动
                                    </div>
                                    <div className='home-guide-step-desc'>
                                      进入工程目录并运行：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`mkdir my-codex-project
cd my-codex-project
codex`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`mkdir my-codex-project
cd my-codex-project
codex`}</code></pre>
                                    </div>
                                  </div>
                                </div>
                              </TabPane>
                              <TabPane tab='Linux (WSL)' itemKey='linux'>
                                <div className='home-guide-steps'>
                                  {/* 第一步 */}
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第一步：获取 API Token
                                    </div>
                                    <ul className='home-guide-list'>
                                      <li>访问 Zer0by 控制台</li>
                                      <li>创建新密钥，选择 CodeX 专用分组</li>
                                      <li>复制生成的 API Key (注意：必须是 CodeX 专用分组令牌！)</li>
                                    </ul>
                                  </div>

                                  {/* 第二步 */}
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第二步：创建配置
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      1. 创建目录 (Terminal)：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode('mkdir -p ~/.codex\ncd ~/.codex')}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`mkdir -p ~/.codex
cd ~/.codex`}</code></pre>
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      2. 创建 config.toml (使用 UTF-8 编码)：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`model_provider = "zer0by"
model = "gpt-5.2"                      # 模型名称（代理支持的实际模型，别名或部署名）
model_reasoning_effort = "medium"      # 推荐：medium（平衡速度与推理深度）
                                       # 可选值：none（禁用推理，最快）、minimal、low、medium（默认推荐）、high、xhigh（最强推理，但更慢更贵）
network_access = "enabled"             # 启用网络访问（工具调用等）
disable_response_storage = true        # 禁用响应存储（隐私或轻量）

# 模型提供者配置
[model_providers.zer0by]
name = "Zer0by Proxy"              # 显示名称（自定义）
base_url = "${siteUrl}/v1"  # 代理基地址（OpenAI 兼容）
wire_api = "responses"                 # 使用 Responses API（推荐 GPT-5 系列，支持高级 reasoning）
requires_openai_auth = true            # 需要标准 OpenAI 风格的 API Key 认证`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`model_provider = "zer0by"
model = "gpt-5.2"                      # 模型名称（代理支持的实际模型，别名或部署名）
model_reasoning_effort = "medium"      # 推荐：medium（平衡速度与推理深度）
                                       # 可选值：none（禁用推理，最快）、minimal、low、medium（默认推荐）、high、xhigh（最强推理，但更慢更贵）
network_access = "enabled"             # 启用网络访问（工具调用等）
disable_response_storage = true        # 禁用响应存储（隐私或轻量）

# 模型提供者配置
[model_providers.zer0by]
name = "Zer0by Proxy"              # 显示名称（自定义）
base_url = "${siteUrl}/v1"  # 代理基地址（OpenAI 兼容）
wire_api = "responses"                 # 使用 Responses API（推荐 GPT-5 系列，支持高级 reasoning）
requires_openai_auth = true            # 需要标准 OpenAI 风格的 API Key 认证`}</code></pre>
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      3. 创建 auth.json：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`{
  "OPENAI_API_KEY": "粘贴为CodeX专用分组令牌key"
}`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`{
  "OPENAI_API_KEY": "粘贴为CodeX专用分组令牌key"
}`}</code></pre>
                                    </div>
                                  </div>

                                  {/* 第三步 */}
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第三步：启动
                                    </div>
                                    <div className='home-guide-step-desc'>
                                      进入工程目录并运行：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`mkdir my-codex-project
cd my-codex-project
codex`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`mkdir my-codex-project
cd my-codex-project
codex`}</code></pre>
                                    </div>
                                  </div>
                                </div>
                              </TabPane>
                            </Tabs>
                          </div>
                        </TabPane>
                        <TabPane tab='OpenClaw' itemKey='openclaw'>
                          <div className='home-guide-section'>
                            <div className='home-guide-title'>
                              OpenClaw 配置
                            </div>
                            <div className='home-guide-subtitle'>
                              我们一起养龙虾~
                            </div>

                            <Tabs
                              type='button'
                              activeKey={openClawOsTab}
                              onChange={setOpenClawOsTab}
                              className='home-guide-os-tabs'
                            >
                              <TabPane tab='Windows' itemKey='windows'>
                                <div className='home-guide-steps'>
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第一步：获取 API Token
                                    </div>
                                    <ul className='home-guide-list'>
                                      <li>访问 Zer0by 控制台</li>
                                      <li>令牌管理创建密钥，选择对应模型分组</li>
                                      <li>复制生成的 API Key</li>
                                    </ul>
                                  </div>

                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第二步：修改配置文件
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      1. 确认配置目录存在 (PowerShell)：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode('mkdir $env:USERPROFILE\\.openclaw')}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`mkdir $env:USERPROFILE\\.openclaw`}</code></pre>
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      2. 打开 `%USERPROFILE%\\.openclaw\\openclaw.json`，在文件底部追加：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`{
  "models": {
    "mode": "merge",
    "providers": {
      // zeroby 为模型提供商名称，需与下方 agent 模型提供商名称保持一致
      "zeroby": {
        "baseUrl": "${siteUrl}/v1",
        "apiKey": "粘贴你的 API Key",
        "api": "openai-completions",
        // 模型名称与 ID 保持一致，名称可在模型广场查看
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "gpt-5.1-codex", "name": "GPT-5.1 Codex" }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      // 改成默认使用的模型别名
      "models": {
        "zeroby/gpt-5.4": { "alias": "gpt-5.4" }
      },
      // 改成默认使用的主模型
      "model": { "primary": "zeroby/gpt-5.4" }
    }
  }
}`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`{
  "models": {
    "mode": "merge",
    "providers": {
      // zeroby 为模型提供商名称，需与下方 agent 模型提供商名称保持一致
      "zeroby": {
        "baseUrl": "${siteUrl}/v1",
        "apiKey": "粘贴你的 API Key",
        "api": "openai-completions",
        // 模型名称与 ID 保持一致，名称可在模型广场查看
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "gpt-5.1-codex", "name": "GPT-5.1 Codex" }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      // 改成默认使用的模型别名
      "models": {
        "zeroby/gpt-5.4": { "alias": "gpt-5.4" }
      },
      // 改成默认使用的主模型
      "model": { "primary": "zeroby/gpt-5.4" }
    }
  }
}`}</code></pre>
                                    </div>
                                  </div>

                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第三步：启动使用
                                    </div>
                                    <div className='home-guide-step-desc'>
                                      保存配置后重新启动 OpenClaw，即可使用
                                      `gpt-5.4` 作为默认模型。
                                    </div>
                                  </div>
                                </div>
                              </TabPane>
                              <TabPane tab='macOS' itemKey='macos'>
                                <div className='home-guide-steps'>
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第一步：获取 API Token
                                    </div>
                                    <ul className='home-guide-list'>
                                      <li>访问 Zer0by 控制台</li>
                                      <li>令牌管理创建密钥，选择对应模型分组</li>
                                      <li>复制生成的 API Key</li>
                                    </ul>
                                  </div>

                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第二步：修改配置文件
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      1. 确认配置目录存在 (Terminal)：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode('mkdir -p ~/.openclaw')}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`mkdir -p ~/.openclaw`}</code></pre>
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      2. 打开 `~/.openclaw/openclaw.json`，在文件底部追加：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`{
  "models": {
    "mode": "merge",
    "providers": {
      // zeroby 为模型提供商名称，需与下方 agent 模型提供商名称保持一致
      "zeroby": {
        "baseUrl": "${siteUrl}/v1",
        "apiKey": "粘贴你的 API Key",
        "api": "openai-completions",
        // 模型名称与 ID 保持一致，名称可在模型广场查看
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "gpt-5.1-codex", "name": "GPT-5.1 Codex" }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      // 改成默认使用的模型别名
      "models": {
        "zeroby/gpt-5.4": { "alias": "gpt-5.4" }
      },
      // 改成默认使用的主模型
      "model": { "primary": "zeroby/gpt-5.4" }
    }
  }
}`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`{
  "models": {
    "mode": "merge",
    "providers": {
      // zeroby 为模型提供商名称，需与下方 agent 模型提供商名称保持一致
      "zeroby": {
        "baseUrl": "${siteUrl}/v1",
        "apiKey": "粘贴你的 API Key",
        "api": "openai-completions",
        // 模型名称与 ID 保持一致，名称可在模型广场查看
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "gpt-5.1-codex", "name": "GPT-5.1 Codex" }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      // 改成默认使用的模型别名
      "models": {
        "zeroby/gpt-5.4": { "alias": "gpt-5.4" }
      },
      // 改成默认使用的主模型
      "model": { "primary": "zeroby/gpt-5.4" }
    }
  }
}`}</code></pre>
                                    </div>
                                  </div>

                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第三步：启动使用
                                    </div>
                                    <div className='home-guide-step-desc'>
                                      保存配置后重新启动 OpenClaw，即可使用
                                      `gpt-5.4` 作为默认模型。
                                    </div>
                                  </div>
                                </div>
                              </TabPane>
                              <TabPane tab='Linux (WSL)' itemKey='linux'>
                                <div className='home-guide-steps'>
                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第一步：获取 API Token
                                    </div>
                                    <ul className='home-guide-list'>
                                      <li>访问 Zer0by 控制台</li>
                                      <li>令牌管理创建密钥，选择对应模型分组</li>
                                      <li>复制生成的 API Key</li>
                                    </ul>
                                  </div>

                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第二步（方法一）：一键添加自定义模型（推荐）
                                    </div>
                                    <div className='home-guide-step-subtitle'>
                                      1. 使用脚本快速写入 OpenClaw 配置：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() =>
                                          handleCopyCode(
                                            'bash <(curl -sL kejilion.sh) app openclaw',
                                          )
                                        }
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`bash <(curl -sL kejilion.sh) app openclaw`}</code></pre>
                                    </div>
                                  </div>

                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第二步（方法二）：手动修改配置文件
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      1. 确认配置目录存在 (Terminal)：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode('mkdir -p ~/.openclaw')}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`mkdir -p ~/.openclaw`}</code></pre>
                                    </div>

                                    <div className='home-guide-step-subtitle'>
                                      2. 打开 `~/.openclaw/openclaw.json`，在文件底部追加：
                                    </div>
                                    <div className='home-guide-code-block'>
                                      <button
                                        className='home-guide-code-copy'
                                        onClick={() => handleCopyCode(`{
  "models": {
    "mode": "merge",
    "providers": {
      // zeroby 为模型提供商名称，需与下方 agent 模型提供商名称保持一致
      "zeroby": {
        "baseUrl": "${siteUrl}/v1",
        "apiKey": "粘贴你的 API Key",
        "api": "openai-completions",
        // 模型名称与 ID 保持一致，名称可在模型广场查看
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "gpt-5.1-codex", "name": "GPT-5.1 Codex" }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      // 改成默认使用的模型别名
      "models": {
        "zeroby/gpt-5.4": { "alias": "gpt-5.4" }
      },
      // 改成默认使用的主模型
      "model": { "primary": "zeroby/gpt-5.4" }
    }
  }
}`)}
                                      >
                                        复制
                                      </button>
                                      <pre><code>{`{
  "models": {
    "mode": "merge",
    "providers": {
      // zeroby 为模型提供商名称，需与下方 agent 模型提供商名称保持一致
      "zeroby": {
        "baseUrl": "${siteUrl}/v1",
        "apiKey": "粘贴你的 API Key",
        "api": "openai-completions",
        // 模型名称与 ID 保持一致，名称可在模型广场查看
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "gpt-5.1-codex", "name": "GPT-5.1 Codex" }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      // 改成默认使用的模型别名
      "models": {
        "zeroby/gpt-5.4": { "alias": "gpt-5.4" }
      },
      // 改成默认使用的主模型
      "model": { "primary": "zeroby/gpt-5.4" }
    }
  }
}`}</code></pre>
                                    </div>
                                  </div>

                                  <div className='home-guide-step'>
                                    <div className='home-guide-step-title'>
                                      第三步：启动使用
                                    </div>
                                    <div className='home-guide-step-desc'>
                                      保存配置后重新启动 OpenClaw，即可使用
                                      `gpt-5.4` 作为默认模型。
                                    </div>
                                  </div>
                                </div>
                              </TabPane>
                            </Tabs>
                          </div>
                        </TabPane>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
