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

const Home = () => {
  const { t, i18n } = useTranslation();
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const themeMode = useTheme();
  const setTheme = useSetTheme();
  const siteUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

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
                      <span className='home-poster-title-accent'>公益站</span>
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
                            公益 · 稳定 · 共享
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
                          Zer0by <br />
                          <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'>
                            公益站
                          </span>
                        </h1>
                        <p className='text-lg text-gray-500 dark:text-gray-400 max-w-xl mb-8 leading-relaxed'>
                          Zer0by 公益站致力于为开发者与研究者提供稳定、低门槛的 API
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
                                'https://kfc-api.sxxe.net/console/token',
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
