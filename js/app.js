// =============================================================================
// app.js — 导航系统 + 所有页面逻辑
// =============================================================================

/* ===== 工具函数 ===== */
const $ = id => document.getElementById(id)

function renderMarkdown(text) {
  if (!text) return ''

  function inline(s) {
    return s
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
  }

  const lines = text.split('\n')
  let html = ''
  let inTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const nextLine = lines[i + 1] || ''

    // 表格分隔行 — 跳过（|---|---|）
    if (/^\|[\s\-:|]+\|$/.test(line)) {
      continue
    }

    // 表格数据行
    if (/^\|.+\|$/.test(line)) {
      if (!inTable) { html += '<table class="md-table">'; inTable = true }
      // 检查下一行是否是分隔行 → 当前行是 header
      const isHeader = /^\|[\s\-:|]+\|$/.test(nextLine)
      const tag = isHeader ? 'th' : 'td'
      const cells = line.split('|').slice(1, -1)
      html += '<tr>' + cells.map(c => `<${tag}>${inline(c.trim())}</${tag}>`).join('') + '</tr>'
      continue
    } else if (inTable) {
      html += '</table>'
      inTable = false
    }

    // 水平分隔线
    if (/^-{3,}$/.test(line.trim())) {
      html += '<hr style="border:none;border-top:1px solid #eee;margin:10px 0">'
      continue
    }

    // H1
    if (/^# (.+)/.test(line)) {
      html += `<h1 style="font-size:17px;font-weight:700;margin:8px 0 12px;color:var(--text)">${inline(line.slice(2))}</h1>`
      continue
    }
    // H2
    if (/^## (.+)/.test(line)) {
      html += `<h2>${inline(line.slice(3))}</h2>`
      continue
    }
    // H3
    if (/^### (.+)/.test(line)) {
      html += `<h3 style="font-size:14px;font-weight:700;margin:10px 0 4px">${inline(line.slice(4))}</h3>`
      continue
    }

    // 空行
    if (line.trim() === '') {
      html += '<br>'
      continue
    }

    // 普通行
    html += inline(line) + '<br>'
  }

  if (inTable) html += '</table>'
  return html
}

function svgIcon(name, size = 22, color = 'currentColor') {
  const icons = {
    back: `<svg width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="${color}" stroke-width="2.2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>`,
    close: `<svg width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="${color}" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    more: `<svg width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="${color}" stroke-width="2"><circle cx="5" cy="12" r="1.2" fill="${color}" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="${color}" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="${color}" stroke="none"/></svg>`,
    share: `<svg width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="${color}" stroke-width="2" stroke-linecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`,
    search: `<svg width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="${color}" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7.5"/><path d="M21 21l-4.5-4.5"/></svg>`,
    chat: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1" fill="${color}" stroke="none"/><circle cx="12" cy="10" r="1" fill="${color}" stroke="none"/><circle cx="15" cy="10" r="1" fill="${color}" stroke="none"/></svg>`,
    home: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
    store: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    msg: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    user: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    plus: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    heart: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartFill: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    star: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    mic: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    camera: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    upload: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
    edit: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    arrow: `<svg width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="${color}" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  }
  return icons[name] || ''
}

/* ===== 导航系统 ===== */
const Nav = {
  stack: ['home'],
  state: {},  // 携带数据

  push(screenId, data = {}) {
    this.state[screenId] = data
    const next = $(screenId)
    if (!next) return

    // 重置状态：清除 inline transform，让 CSS .screen { transform: translateX(100%) } 接管
    next.classList.remove('active')
    next.style.transform = ''
    next.style.display = 'flex'
    next.style.zIndex = 10 + this.stack.length + 1  // 保证新页面永远在当前页上方

    Pages[screenId] && Pages[screenId].render(data)
    next.scrollTop = 0

    requestAnimationFrame(() => {
      next.classList.add('active')
      this.stack.push(screenId)
    })
  },

  pop() {
    if (this.stack.length <= 1) return
    const current = this.currentScreen()
    const screen = $(current)
    if (screen) {
      // 先用 inline display:flex 保住可见性（保留 flex 布局），让过渡动画能播放
      screen.style.display = 'flex'
      screen.classList.remove('active')
      screen.addEventListener('transitionend', () => {
        screen.style.display = ''  // 清除 inline → CSS display:none 接管
      }, { once: true })
    }
    this.stack.pop()
    // 若返回到点点 Skills Tab，刷新内容（确保添加后的 skill 立即显示）
    const backTo = this.currentScreen()
    if (backTo === 'screen-diandian' && ddTab === 'skills') {
      renderDdTabContent()
    }
  },

  currentScreen() {
    return this.stack[this.stack.length - 1]
  },

  getData(screenId) {
    return this.state[screenId] || {}
  }
}

/* ===== HOME & MESSAGES 状态 ===== */
let homeTab = 'feed'  // 'feed' | 'messages'
let ddTab = 'chat'    // 'chat' | 'skills'
let skillsFilter = '全部'
let installedSkills = SKILLS.filter(s => s.isInstalled)
let noteDetailState = {}
let creationStep2State = { dialogueIndex: 0, waitingForAI: false, trialShown: false }

/* ===== PAGES 对象 ===== */
const Pages = {

  /* ---------- note-detail ---------- */
  'screen-note-detail': {
    render({ noteId }) {
      const note = getNote(noteId)
      if (!note) return
      noteDetailState = { note, liked: false, collected: false, followed: false }

      const skill = note.type === 'skill' ? getSkill(note.skillId) : null

      $('screen-note-detail').innerHTML = `
        <div class="top-bar">
          <div class="icon-btn" onclick="Nav.pop()">${svgIcon('back')}</div>
          <div style="display:flex;align-items:center;gap:10px;flex:1;padding:0 8px;">
            <div class="avatar" style="width:32px;height:32px;background:${note.author.avatarBg};">${note.author.emoji}</div>
            <span style="font-size:15px;font-weight:500;">${note.author.name}</span>
          </div>
          <button class="follow-btn" id="note-follow-btn" onclick="toggleNoteFollow()">${svgIcon('plus',12,'#FF2442')} 关注</button>
          <div class="icon-btn" style="margin-left:6px;">${svgIcon('share')}</div>
        </div>

        <div class="page-body">
          <div class="detail-cover-area" style="background:${note.coverBg};min-height:${note.coverH + 40}px;">
            ${note.coverEmoji}
            <div class="detail-img-counter">1/3</div>
            <div class="detail-img-dots">
              <div class="dot active"></div><div class="dot"></div><div class="dot"></div>
            </div>
          </div>

          <div style="background:white;">
            <div class="detail-body">
              <div class="detail-title">${note.title}</div>
              <div class="detail-content">${note.content.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>
              <div class="detail-tags">${note.tags.map(t=>`<span class="detail-tag">${t}</span>`).join(' ')}</div>
              <div class="detail-meta">2026-03-18 · 上海</div>
            </div>

            <div class="comments-area">
              <div class="comments-header">${formatNum(note.commentCount)} 条评论</div>
              ${note.comments.map(c => `
                <div class="comment-item">
                  <div class="comment-avatar-sm">${c.emoji}</div>
                  <div class="comment-body">
                    <div class="comment-uname">${c.name}</div>
                    <div class="comment-text">${c.text}</div>
                    <div class="comment-footer">
                      <span class="comment-time">${c.time}</span>
                      <span class="comment-like">${svgIcon('heart',12)} ${c.likes}</span>
                    </div>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <div class="detail-action-bar">
          ${note.type === 'skill' && skill ? `
            <div class="skill-btn" onclick="Nav.push('screen-skill-detail', {skillId: ${skill.id}})">
              <span style="font-size:18px;">${skill.icon}</span>
              <span class="skill-btn-text">查看 Skill 详情</span>
            </div>
          ` : `<div class="comment-input-fake">说点什么...</div>`}
          <div class="action-icons-row">
            <div class="action-icon" id="note-like-btn" onclick="toggleNoteLike()">
              ${svgIcon('heart', 22)} <span id="note-like-count">${formatNum(note.likes)}</span>
            </div>
            <div class="action-icon" id="note-collect-btn" onclick="toggleNoteCollect()">
              ${svgIcon('star', 22)} <span id="note-collect-count">${formatNum(note.collectCount)}</span>
            </div>
            <div class="action-icon">
              ${svgIcon('msg', 22)} <span>${formatNum(note.commentCount)}</span>
            </div>
          </div>
        </div>
      `
    }
  },

  /* ---------- skill-detail ---------- */
  'screen-skill-detail': {
    render({ skillId }) {
      const skill = getSkill(skillId)
      if (!skill) return
      const installed = installedSkills.find(s => s.id === skillId)

      $('screen-skill-detail').innerHTML = `
        <div class="top-bar">
          <div class="icon-btn" onclick="Nav.pop()">${svgIcon('back')}</div>
          <div class="top-bar-title">Skill 详情</div>
          <div class="icon-btn">${svgIcon('share')}</div>
        </div>

        <div class="page-body" style="background:white;">
          <!-- Hero -->
          <div class="skill-detail-hero">
            <div class="skill-detail-icon" style="background:${skill.iconBg}">${skill.icon}</div>
            <div style="flex:1;">
              <div class="skill-detail-name">${skill.name}</div>
              <div class="skill-detail-author">by ${skill.authorEmoji} ${skill.authorName}</div>
              <div class="skill-detail-stats">
                <span class="stars">${'★'.repeat(Math.floor(skill.rating))}</span>
                <span class="skill-stat">${skill.rating} (${formatNum(skill.ratingCount)}条评价)</span>
                <span class="skill-stat">👥 ${formatNum(skill.userCount)}人在用</span>
              </div>
            </div>
          </div>

          <!-- 简介 -->
          <div class="skill-detail-desc">${skill.description}</div>

          <!-- 使用说明 -->
          <div class="skill-manual-section" onclick="openManualSheet()">
            <div class="skill-manual-title">
              <span>使用说明</span>
              <span style="font-size:13px;color:var(--green);font-weight:400;">查看 →</span>
            </div>
          </div>

          <!-- 评论 -->
          <div style="padding:14px 16px;border-bottom:1px solid #f0f0f0;">
            <div style="font-size:15px;font-weight:600;margin-bottom:12px;">用户评价 (${skill.comments.length})</div>
            ${skill.comments.map(c => `
              <div style="display:flex;gap:10px;margin-bottom:14px;">
                <div style="width:36px;height:36px;border-radius:50%;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${c.userEmoji}</div>
                <div style="flex:1;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                    <span style="font-size:13px;font-weight:500;">${c.user}</span>
                    <span style="color:#FFB400;font-size:12px;">${'★'.repeat(c.rating)}</span>
                  </div>
                  <div style="font-size:13.5px;color:#555;line-height:1.6;">${c.text}</div>
                  <div style="font-size:11px;color:#ccc;margin-top:4px;">${c.time}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- 底部按钮区 -->
        <div id="skill-detail-bottom-${skillId}" style="flex-shrink:0;padding:12px 16px 20px;background:white;border-top:1px solid #f0f0f0;">
          ${renderSkillDetailBottom(skillId, !!installed)}
        </div>

        <!-- 使用说明半浮层 -->
        <div class="manual-sheet-mask" id="manual-sheet-mask" onclick="closeManualSheet()" style="display:none;"></div>
        <div class="manual-sheet" id="manual-sheet" style="display:none;">
          <div class="manual-sheet-handle"></div>
          <div class="manual-sheet-header">
            <span class="manual-sheet-title">使用说明</span>
            <span class="manual-sheet-close" onclick="closeManualSheet()">✕</span>
          </div>
          <div class="manual-sheet-body md-content">${renderMarkdown(skill.manual)}</div>
        </div>
      `
    }
  },

  /* ---------- diandian ---------- */
  'screen-diandian': {
    render() {
      $('screen-diandian').innerHTML = `
        <div class="dd-top-bar">
          <div class="icon-btn" onclick="Nav.pop()">${svgIcon('close')}</div>
          <div class="dd-name-area">
            <div class="dd-online-dot"></div>
            <div class="dd-title">点点</div>
            <span class="ai-tag">ai</span>
          </div>
          <div class="icon-btn">${svgIcon('more')}</div>
        </div>

        <div class="dd-tabs">
          <div class="dd-tab ${ddTab==='chat'?'active':''}" onclick="switchDdTab('chat')">对话</div>
          <div class="dd-tab ${ddTab==='skills'?'active':''}" onclick="switchDdTab('skills')">Skills</div>
        </div>

        <div id="dd-tab-content" style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;"></div>
      `
      renderDdTabContent()
    }
  },

  /* ---------- skill-chat ---------- */
  'screen-skill-chat': {
    render({ skillId }) {
      const skill = getSkill(skillId)
      if (!skill) return
      const messages = SKILL_CHAT_MESSAGES[skillId] || []

      $('screen-skill-chat').innerHTML = `
        <div class="top-bar skill-chat-top-bar">
          <div class="icon-btn" onclick="Nav.pop()">${svgIcon('close')}</div>
          <div class="dd-name-area">
            <div class="dd-online-dot"></div>
            <div class="dd-title">${skill.name}</div>
            <span class="ai-tag">ai</span>
          </div>
          <div class="icon-btn">${svgIcon('more')}</div>
        </div>

        <!-- 使用说明块 -->
        <div class="skill-guide-card" onclick="openManualSheet()" style="cursor:pointer;">
          <div class="skill-guide-title">
            <span>${skill.icon} 使用说明</span>
            <span class="skill-guide-toggle">查看 →</span>
          </div>
        </div>

        <div class="chat-messages page-body" id="skill-chat-messages"></div>

        <div class="chat-input-bar">
          <div class="chat-mic">${svgIcon('mic', 22, '#999')}</div>
          <input id="skill-chat-input" class="chat-input-real" placeholder="给 ${skill.name} 发消息..."
            disabled onkeydown="if(event.key==='Enter'&&!this.disabled)submitSkillChat(${skillId})">
          <div id="skill-chat-send" class="chat-send-btn" onclick="submitSkillChat(${skillId})">
            ${svgIcon('arrow', 20, 'currentColor')}
          </div>
        </div>

        <!-- 使用说明半浮层（放最后确保层叠在最上方）-->
        <div class="manual-sheet-mask" id="manual-sheet-mask" onclick="closeManualSheet()" style="display:none;"></div>
        <div class="manual-sheet" id="manual-sheet" style="display:none;">
          <div class="manual-sheet-handle"></div>
          <div class="manual-sheet-header">
            <span class="manual-sheet-title">${skill.icon} 使用说明</span>
            <span class="manual-sheet-close" onclick="closeManualSheet()">✕</span>
          </div>
          <div class="manual-sheet-body md-content">${renderMarkdown(skill.manual)}</div>
        </div>
      `

      // 对话内容逐条播放；若该 skill 有最终回复，播放完后激活输入框
      playSkillChat(messages, skill).then(() => {
        if (SKILL_CHAT_FINAL_RESPONSE[skillId]) enableSkillChatInput()
      })
    }
  },

  /* ---------- creation-1 ---------- */
  'screen-creation-1': {
    render() {
      $('screen-creation-1').innerHTML = `
        <div class="creation-top-bar">
          <div class="icon-btn" onclick="Nav.pop()">${svgIcon('back')}</div>
          <div class="top-bar-title">创建 Skill</div>
          <div class="draft-btn">存草稿</div>
        </div>

        ${renderStepProgress(1)}

        <div class="creation-form page-body">
          <div style="font-size:22px;font-weight:700;color:#1a1a1a;margin-bottom:6px;">给你的 Skill 起个名字</div>
          <div style="font-size:14px;color:#999;margin-bottom:24px;">简洁有力，让别人一眼看懂它是做什么的</div>

          <div class="form-label">Skill 名称 <span style="color:#FF2442">*</span></div>
          <input class="form-input" id="skill-name-input" type="text" placeholder="例如：菜单助手、简历优化、英语口语..." maxlength="20">
          <div class="form-hint">建议 6 字以内</div>

          <div class="form-label">简介 <span style="color:#FF2442">*</span></div>
          <textarea class="form-textarea" id="skill-desc-input" placeholder="一句话说明这个 Skill 能做什么..." maxlength="60"></textarea>
          <div class="form-hint">建议 30 字以内</div>
        </div>

        <div class="creation-next-btn">
          <button class="creation-next-btn-inner" onclick="goToCreation2()">下一步</button>
        </div>
      `
    }
  },

  /* ---------- creation-2 ---------- */
  'screen-creation-2': {
    render() {
      creationStep2State = { dialogueIndex: 0, waitingForAI: false, trialShown: false }

      $('screen-creation-2').innerHTML = `
        <div class="creation-top-bar">
          <div class="icon-btn" onclick="Nav.pop()">${svgIcon('back')}</div>
          <div class="top-bar-title">定义 Skill</div>
          <div class="draft-btn">存草稿</div>
        </div>

        ${renderStepProgress(2)}

        <div style="flex-shrink:0;padding:12px 16px 0;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;margin-bottom:0;">
          <span style="font-size:13px;color:#999;">与 AI 交互，定义你的 Skill</span>
          <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#10B981;cursor:pointer;padding:6px 10px;background:#D1FAE5;border-radius:16px;" onclick="alert('上传 SKILL.md 功能开发中')">
            ${svgIcon('upload', 14, '#10B981')} 上传 SKILL.md
          </div>
        </div>

        <div class="page-body" onclick="advanceDialogue()">
          <div class="creation-tap-hint" id="tap-hint">点击屏幕推进对话</div>
          <div class="creation-chat" id="creation-chat-area"></div>
        </div>

        <div class="creation-input-bar" onclick="event.stopPropagation()">
          <div class="chat-mic">${svgIcon('mic', 20, '#999')}</div>
          <div class="chat-input-fake" style="font-size:13px;">补充说明，或点击屏幕推进对话...</div>
          <div class="chat-camera">${svgIcon('camera', 20, '#999')}</div>
        </div>
      `

      // 自动显示第一条（用户消息）
      setTimeout(() => showDialogueMessage(0), 300)
    }
  },

  /* ---------- creation-3 ---------- */
  'screen-creation-3': {
    render() {
      $('screen-creation-3').innerHTML = `
        <div class="creation-top-bar">
          <div class="icon-btn" onclick="Nav.pop()">${svgIcon('back')}</div>
          <div class="top-bar-title">说明书审阅</div>
          <div class="draft-btn">存草稿</div>
        </div>

        ${renderStepProgress(3)}

        <div class="manual-review page-body">
          <div class="manual-review-hint" style="display:flex;justify-content:space-between;align-items:center;">
            <span>AI 已根据你的定义自动生成说明书</span>
            <button id="manual-toggle-btn" onclick="toggleManualEdit()"
              style="font-size:12px;color:#10B981;background:#D1FAE5;border:none;cursor:pointer;padding:5px 12px;border-radius:14px;font-weight:600;">
              编辑
            </button>
          </div>
          <div id="manual-preview" class="manual-preview md-content">${renderMarkdown(SKILL_MANUAL_DRAFT)}</div>
          <textarea class="manual-editor" id="manual-editor" style="display:none;">${SKILL_MANUAL_DRAFT}</textarea>
        </div>

        <div class="creation-next-btn">
          <button class="creation-next-btn-inner" onclick="Nav.push('screen-creation-4', {})">下一步 →  最终确认</button>
        </div>
      `
    }
  },

  /* ---------- creation-4 ---------- */
  'screen-creation-4': {
    render() {
      const name = $('skill-name-input') ? $('skill-name-input').value || '菜单助手' : '菜单助手'
      const desc = $('skill-desc-input') ? $('skill-desc-input').value || '每周自动规划菜单，支持打分反馈，越用越懂你口味' : '每周自动规划菜单，支持打分反馈，越用越懂你口味'

      $('screen-creation-4').innerHTML = `
        <div class="creation-top-bar">
          <div class="icon-btn" onclick="Nav.pop()">${svgIcon('back')}</div>
          <div class="top-bar-title">发布</div>
          <div style="width:36px;"></div>
        </div>

        ${renderStepProgress(4)}

        <div class="publish-review page-body">
          <div style="font-size:13px;color:#999;margin-bottom:16px;">确认以下信息无误后即可发布</div>

          <!-- Skill 卡片 -->
          <div class="publish-skill-card">
            <div class="publish-skill-icon" style="background:#FFF3E0">🍽️</div>
            <div style="flex:1;">
              <div style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:4px;" contenteditable="true">${name}</div>
              <div style="font-size:13px;color:#555;line-height:1.6;" contenteditable="true">${desc}</div>
              <div style="font-size:12px;color:#10B981;margin-top:8px;cursor:pointer;">🎨 AI 已生成图标（点击可更换）</div>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="publish-meta-list">
            <div class="publish-meta-item">
              <span class="publish-meta-key">分类</span>
              <span class="publish-meta-val">生活 · 美食</span>
            </div>
            <div class="publish-meta-item">
              <span class="publish-meta-key">命令示例</span>
              <span class="publish-meta-val">「生成本周菜单」</span>
            </div>
            <div class="publish-meta-item">
              <span class="publish-meta-key">创建时间</span>
              <span class="publish-meta-val">2026-03-18</span>
            </div>
            <div class="publish-meta-item">
              <span class="publish-meta-key">可见范围</span>
              <span class="publish-meta-val">公开（所有人可发现）</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="publish-actions">
            <button class="btn-test" onclick="alert('已生成测试链接，可发送给朋友试用')">发送给朋友测试</button>
            <button class="btn-publish" onclick="showPublishSuccess()">发 布</button>
          </div>
        </div>

        <!-- 发布成功弹层 -->
        <div class="publish-success-mask" id="publish-success-mask">
          <div class="publish-success-card">
            <div class="publish-success-icon">🎉</div>
            <div class="publish-success-title">发布成功！</div>
            <div class="publish-success-desc">
              「菜单助手」已上线 Skill 市场<br>
              也已加入你的已安装 Skills 列表<br>
              快去小红书发帖分享吧！
            </div>
            <button class="btn-green" style="width:100%" onclick="afterPublish()">去看看</button>
          </div>
        </div>
      `
    }
  }
}

/* ===== 渲染工具函数 ===== */

function renderSkillDetailBottom(skillId, installed) {
  if (installed) {
    return `
      <div style="display:flex;gap:10px;">
        <button onclick="removeSkill(${skillId})"
          style="flex:1;border:1.5px solid #ddd;border-radius:26px;padding:14px;font-size:14px;font-weight:600;cursor:pointer;background:white;color:#999;">
          取消安装
        </button>
        <button onclick="Nav.push('screen-skill-chat', {skillId:${skillId}})"
          style="flex:2;border:none;border-radius:26px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;background:#10B981;color:white;">
          去使用
        </button>
      </div>`
  }
  return `
    <button id="skill-add-btn-${skillId}" onclick="addSkill(${skillId})"
      style="width:100%;border:none;border-radius:26px;padding:14px;font-size:16px;font-weight:700;cursor:pointer;background:#10B981;color:white;">
      ＋ 添加到我的 Skill
    </button>`
}

function renderStepProgress(current) {
  const steps = [1, 2, 3, 4]
  const labels = ['基本信息', '定义 Skill', '说明书', '发布']
  return `
    <div style="padding:12px 16px 0;flex-shrink:0;">
      <div class="step-progress">
        ${steps.map((s, i) => `
          ${i > 0 ? `<div class="step-line ${s <= current ? 'done' : ''}"></div>` : ''}
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <div class="step-dot ${s < current ? 'done' : s === current ? 'active' : ''}"></div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;padding:0 0 12px;font-size:10px;color:#999;">
        ${labels.map((l, i) => `<span style="${i+1===current?'color:#10B981;font-weight:600':''}">${l}</span>`).join('')}
      </div>
    </div>
  `
}

function renderChatBubble(msg, skill) {
  if (msg.role === 'user') {
    return `
      <div class="chat-bubble-wrap user">
        <div class="chat-bubble user">${msg.text.replace(/\n/g,'<br>')}</div>
      </div>`
  }
  return `
    <div class="chat-bubble-wrap">
      <img src="docs/screenshots/diandianicon.png" class="chat-avatar-sm dd-chat-avatar">
      <div class="chat-bubble ai md-content">${renderMarkdown(msg.text)}</div>
    </div>`
}

/* ===== Skill 对话气泡追加（模块级，供动画和交互共用）===== */
function appendChatBubble(container, html) {
  const wrap = document.createElement('div')
  wrap.innerHTML = html
  const el = wrap.firstElementChild
  el.style.opacity = '0'
  el.style.transform = 'translateY(6px)'
  el.style.transition = 'opacity 0.25s ease, transform 0.25s ease'
  container.appendChild(el)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
  })
  container.scrollTop = container.scrollHeight
  return el
}

/* ===== Skill 对话动画播放 ===== */
async function playSkillChat(messages, skill) {
  const container = $('skill-chat-messages')
  if (!container) return

  const AI_TYPING_DURATION = 1300
  const GAP_AFTER_AI   = 700
  const GAP_AFTER_USER = 400

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]

    if (msg.role === 'ai') {
      const typingEl = appendChatBubble(container, `
        <div class="chat-bubble-wrap">
          <img src="docs/screenshots/diandianicon.png" class="chat-avatar-sm dd-chat-avatar">
          <div class="chat-bubble ai">
            <div class="thinking-bubble">
              <div class="thinking-dot"></div>
              <div class="thinking-dot"></div>
              <div class="thinking-dot"></div>
            </div>
          </div>
        </div>`)

      await delay(AI_TYPING_DURATION)
      typingEl.style.opacity = '0'
      await delay(150)
      typingEl.remove()
      appendChatBubble(container, `
        <div class="chat-bubble-wrap">
          <img src="docs/screenshots/diandianicon.png" class="chat-avatar-sm dd-chat-avatar">
          <div class="chat-bubble ai md-content">${renderMarkdown(msg.text)}</div>
        </div>`)

      if (i < messages.length - 1) await delay(GAP_AFTER_AI)

    } else if (msg.role === 'user') {
      appendChatBubble(container, `
        <div class="chat-bubble-wrap user">
          <div class="chat-bubble user">${msg.text.replace(/\n/g,'<br>')}</div>
        </div>`)

      if (i < messages.length - 1) await delay(GAP_AFTER_USER)
    }
  }
}

/* ===== Skill 对话输入交互 ===== */
function enableSkillChatInput() {
  const screenEl = $(Nav.currentScreen())
  if (!screenEl) return
  const input = screenEl.querySelector('#skill-chat-input')
  const sendBtn = screenEl.querySelector('#skill-chat-send')
  if (!input || !sendBtn) return
  input.disabled = false
  sendBtn.classList.add('active')
  input.focus()
}

async function submitSkillChat(skillId) {
  const screenEl = $(Nav.currentScreen())
  if (!screenEl) return
  const input = screenEl.querySelector('#skill-chat-input')
  if (!input || !input.value.trim()) return

  const text = input.value.trim()
  input.value = ''
  input.disabled = true
  const sendBtn = screenEl.querySelector('#skill-chat-send')
  if (sendBtn) sendBtn.classList.remove('active')

  const container = $('skill-chat-messages')
  if (!container) return

  // 显示用户消息
  appendChatBubble(container, `
    <div class="chat-bubble-wrap user">
      <div class="chat-bubble user">${text.replace(/\n/g,'<br>')}</div>
    </div>`)

  const finalText = SKILL_CHAT_FINAL_RESPONSE[skillId]
  if (!finalText) return

  await new Promise(r => setTimeout(r, 400))

  // 显示 AI typing
  const typingEl = appendChatBubble(container, `
    <div class="chat-bubble-wrap">
      <img src="docs/screenshots/diandianicon.png" class="chat-avatar-sm dd-chat-avatar">
      <div class="chat-bubble ai">
        <div class="thinking-bubble">
          <div class="thinking-dot"></div>
          <div class="thinking-dot"></div>
          <div class="thinking-dot"></div>
        </div>
      </div>
    </div>`)

  await new Promise(r => setTimeout(r, 1500))
  typingEl.style.opacity = '0'
  await new Promise(r => setTimeout(r, 150))
  typingEl.remove()

  appendChatBubble(container, `
    <div class="chat-bubble-wrap">
      <img src="docs/screenshots/diandianicon.png" class="chat-avatar-sm dd-chat-avatar">
      <div class="chat-bubble ai md-content">${renderMarkdown(finalText)}</div>
    </div>`)
}

function renderDdTabContent() {
  const container = $('dd-tab-content')
  if (!container) return

  if (ddTab === 'chat') {
    container.innerHTML = `
      <div class="chat-messages page-body">
        ${DIANDIAN_MESSAGES.map(m => {
          if (m.role === 'user') return `
            <div class="chat-bubble-wrap user">
              <div class="chat-bubble user">${m.text.replace(/\n/g,'<br>')}</div>
            </div>`
          return `
            <div class="chat-bubble-wrap">
              <img src="docs/screenshots/diandianicon.png" class="chat-avatar-sm dd-chat-avatar">
              <div class="chat-bubble ai md-content">${renderMarkdown(m.text)}</div>
            </div>`
        }).join('')}
      </div>
      <div class="chat-input-bar">
        <div class="chat-mic">${svgIcon('mic', 22, '#999')}</div>
        <div class="chat-input-fake">给点点发消息...</div>
        <div class="chat-camera">${svgIcon('camera', 22, '#999')}</div>
      </div>
    `
  } else {
    // Skills Tab
    const categories = ['全部', '信息追踪', '创作工具', '购物决策', '内容管理', '生活']
    const filtered = skillsFilter === '全部' ? SKILLS : SKILLS.filter(s => s.tags.includes(skillsFilter))

    container.innerHTML = `
      <div class="skills-tab-content page-body">
        <!-- 搜索 -->
        <div style="padding:12px 16px 0;">
          <div class="skill-search-bar">${svgIcon('search', 15, '#999')} 搜索 Skills...</div>
        </div>

        <!-- 我的 Skills -->
        ${installedSkills.length > 0 ? `
        <div class="my-skills-row">
          <div class="my-skills-label">我的 Skills</div>
          <div class="my-skills-scroll">
            ${installedSkills.map(s => `
              <div class="my-skill-item" onclick="Nav.push('screen-skill-chat', {skillId:${s.id}})">
                <div class="my-skill-icon" style="background:${s.iconBg}">${s.icon}</div>
                <div class="my-skill-name">${s.name}</div>
              </div>`).join('')}
          </div>
        </div>` : ''}

        <!-- 分类 -->
        <div class="filter-tags">
          ${categories.map(c => `
            <div class="filter-tag ${skillsFilter===c?'active':''}" onclick="filterSkills('${c}')">${c}</div>
          `).join('')}
        </div>

        <!-- 市场列表 -->
        <div class="skills-market-list">
          ${filtered.map(s => {
            const inst = installedSkills.find(i => i.id === s.id)
            return `
              <div class="skill-market-item" onclick="Nav.push('screen-skill-detail', {skillId:${s.id}})">
                <div class="skill-market-icon" style="background:${s.iconBg}">${s.icon}</div>
                <div class="skill-market-info">
                  <div class="skill-market-name">${s.name}</div>
                  <div class="skill-market-desc">${s.description}</div>
                  <div class="skill-market-meta">
                    <span>⭐ ${s.rating}</span>
                    <span>👥 ${formatNum(s.userCount)}人在用</span>
                  </div>
                </div>
                <button class="skill-market-btn ${inst?'installed':''}"
                  onclick="event.stopPropagation();${inst?`Nav.push('screen-skill-chat',{skillId:${s.id}})`:`addSkillFromMarket(${s.id})`}">
                  ${inst ? '去使用' : '添加'}
                </button>
              </div>`
          }).join('')}
        </div>
      </div>

      <div class="create-skill-btn">
        <button class="create-skill-btn-inner" onclick="Nav.push('screen-creation-1', {})">
          ${svgIcon('plus', 20, 'white')} 创建 Skill
        </button>
      </div>
    `
  }
}

/* ===== HOME 渲染 ===== */
function renderHome() {
  const feed = $('home-feed')
  if (!feed) return
  feed.innerHTML = NOTES.map(n => `
    <div class="note-card" onclick="Nav.push('screen-note-detail', {noteId:${n.id}})">
      <div class="card-cover" style="height:${n.coverH}px;background:${n.coverBg};">
        ${n.coverEmoji}
        ${n.isVideo ? `<div class="video-badge">${svgIcon('arrow',10,'white')}</div>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${n.title}</div>
        <div class="card-meta">
          <div class="card-author">
            <div class="avatar" style="width:18px;height:18px;font-size:9px;background:${n.author.avatarBg};">${n.author.emoji}</div>
            <span class="author-name-sm">${n.author.name}</span>
          </div>
          <div class="like-count">${svgIcon('heart',11)} ${formatNum(n.likes)}</div>
        </div>
      </div>
    </div>`).join('')
}

/* ===== MESSAGES 渲染 ===== */
function renderMessages() {
  const area = $('messages-area')
  if (!area) return

  area.innerHTML = `
    <div class="messages-screen">
      <div class="msg-header">
        <div class="msg-header-title">消息</div>
        <div class="msg-header-actions">
          ${svgIcon('search', 20)} ${svgIcon('plus', 20)}
        </div>
      </div>

      <!-- 三格分类 -->
      <div class="msg-categories">
        <div class="msg-cat">
          <div class="msg-cat-icon" style="background:#FFECEC;">${svgIcon('heart',24,'#FF2442')}</div>
          <div class="msg-cat-label">赞和收藏</div>
        </div>
        <div class="msg-cat">
          <div class="msg-cat-icon" style="background:#EEF2FF;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#5B6EB5"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          </div>
          <div class="msg-cat-label">新增关注</div>
        </div>
        <div class="msg-cat">
          <div class="msg-cat-icon" style="background:#EDFDF6;">${svgIcon('msg',24,'#10B981')}</div>
          <div class="msg-cat-label">评论和@</div>
        </div>
      </div>

      <!-- 会话列表 -->
      <div class="conv-list">
        ${CONVERSATIONS.map(c => {
          const isSkill = c.type === 'skill'
          const skill = isSkill ? getSkill(c.skillId) : null
          const onclick = isSkill
            ? `Nav.push('screen-skill-chat', {skillId:${c.skillId}})`
            : c.id === 'diandian'
            ? `Nav.push('screen-diandian', {})`
            : ''
          return `
            <div class="conv-item" onclick="${onclick}">
              <div class="conv-avatar-wrap">
                <div class="conv-avatar-text" style="background:${c.avatarBg};color:${c.avatarColor};display:flex;align-items:center;justify-content:center;font-size:${c.type==='ai-main'?'14px':'18px'};">
                  ${c.avatarEmoji}
                </div>
                ${c.aiTag ? `<div class="conv-ai-badge">ai</div>` : ''}
              </div>
              <div class="conv-info">
                <div class="conv-name-row">
                  <span class="conv-name">${c.name}</span>
                  ${c.aiTag ? `<span class="ai-tag">ai</span>` : ''}
                </div>
                <div class="conv-last">${c.lastMessage}</div>
              </div>
              <div class="conv-right">
                <span class="conv-time">${c.time}</span>
                ${c.unread ? `<div class="conv-unread"></div>` : ''}
              </div>
            </div>`
        }).join('')}
      </div>
    </div>
  `
}

/* ===== 交互函数 ===== */

function switchHomeTab(tab) {
  homeTab = tab
  document.querySelectorAll('.home-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab)
  })
  const feedArea = $('feed-area')
  const msgArea = $('messages-area')
  if (tab === 'feed') {
    feedArea.style.display = ''
    msgArea.style.display = 'none'
  } else {
    feedArea.style.display = 'none'
    msgArea.style.display = ''
    renderMessages()
  }
}

function switchDdTab(tab) {
  ddTab = tab
  document.querySelectorAll('.dd-tab').forEach(el => {
    el.classList.toggle('active', el.textContent.trim() === (tab === 'chat' ? '对话' : 'Skills'))
  })
  renderDdTabContent()
}

function filterSkills(cat) {
  skillsFilter = cat
  renderDdTabContent()
}

function getManualSheetEls() {
  // 当多个页面同时在 DOM 中（如 skill-detail + skill-chat 叠加时），
  // getElementById 会返回第一个匹配，可能命中被隐藏的页面中的元素。
  // 改为在当前栈顶 screen 内查找，确保找到可见页面里的那一个。
  const screenEl = $(Nav.currentScreen())
  if (!screenEl) return {}
  return {
    mask: screenEl.querySelector('#manual-sheet-mask'),
    sheet: screenEl.querySelector('#manual-sheet')
  }
}

function openManualSheet() {
  const { mask, sheet } = getManualSheetEls()
  if (!mask || !sheet) return
  mask.style.display = 'block'
  sheet.style.display = 'flex'
  requestAnimationFrame(() => {
    sheet.classList.add('open')
    mask.classList.add('open')
  })
}

function closeManualSheet() {
  const { mask, sheet } = getManualSheetEls()
  if (!mask || !sheet) return
  sheet.classList.remove('open')
  mask.classList.remove('open')
  sheet.addEventListener('transitionend', () => {
    sheet.style.display = 'none'
    mask.style.display = 'none'
  }, { once: true })
}

/* 添加 Skill */
function addSkill(skillId) {
  const skill = getSkill(skillId)
  if (!skill || installedSkills.find(s => s.id === skillId)) return

  installedSkills.push(skill)
  if (!CONVERSATIONS.find(c => c.skillId === skillId)) {
    CONVERSATIONS.splice(1, 0, {
      id: `skill-${skillId}`, name: skill.name, type: 'skill', skillId,
      avatarEmoji: skill.icon, avatarBg: skill.iconBg, avatarColor: '#000',
      aiTag: true, lastMessage: '点击开始使用', time: '刚刚', unread: 1
    })
  }

  // 重新渲染底部按钮区（变成"取消安装 + 去使用"）
  const bottom = $(`skill-detail-bottom-${skillId}`)
  if (bottom) bottom.innerHTML = renderSkillDetailBottom(skillId, true)

  showToast(skill.name, skillId)
}

/* 取消安装 Skill */
function removeSkill(skillId) {
  installedSkills = installedSkills.filter(s => s.id !== skillId)
  const idx = CONVERSATIONS.findIndex(c => c.skillId === skillId)
  if (idx !== -1) CONVERSATIONS.splice(idx, 1)

  // 重新渲染底部按钮区（变回"添加"按钮）
  const bottom = $(`skill-detail-bottom-${skillId}`)
  if (bottom) bottom.innerHTML = renderSkillDetailBottom(skillId, false)
}

function addSkillFromMarket(skillId) {
  addSkill(skillId)
  renderDdTabContent()  // 刷新 Skills Tab，显示"我的 Skills"模块
}

function showToast(skillName, skillId) {
  const existing = document.querySelector('.toast-bar')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = 'toast-bar'
  toast.innerHTML = `
    <span class="toast-msg">✓ 已添加「${skillName}」</span>
    <button class="toast-action" onclick="goUseSkill(${skillId})">去使用</button>
  `
  document.getElementById('app').appendChild(toast)
  setTimeout(() => toast.remove(), 4000)
}

function goUseSkill(skillId) {
  document.querySelector('.toast-bar')?.remove()
  Nav.push('screen-skill-chat', { skillId })
}

/* Note 交互 */
function toggleNoteFollow() {
  noteDetailState.followed = !noteDetailState.followed
  const btn = $('note-follow-btn')
  if (btn) {
    btn.classList.toggle('following', noteDetailState.followed)
    btn.innerHTML = noteDetailState.followed ? '已关注' : `${svgIcon('plus',12,'#FF2442')} 关注`
  }
}

function toggleNoteLike() {
  noteDetailState.liked = !noteDetailState.liked
  const btn = $('note-like-btn')
  const count = $('note-like-count')
  if (btn && count) {
    btn.classList.toggle('liked', noteDetailState.liked)
    const base = noteDetailState.note.likes
    count.textContent = formatNum(base + (noteDetailState.liked ? 1 : 0))
    btn.style.transform = 'scale(1.3)'
    setTimeout(() => btn.style.transform = '', 150)
  }
}

function toggleNoteCollect() {
  noteDetailState.collected = !noteDetailState.collected
  const btn = $('note-collect-btn')
  const count = $('note-collect-count')
  if (btn && count) {
    btn.classList.toggle('collected', noteDetailState.collected)
    const base = noteDetailState.note.collectCount
    count.textContent = formatNum(base + (noteDetailState.collected ? 1 : 0))
    btn.style.transform = 'scale(1.3)'
    setTimeout(() => btn.style.transform = '', 150)
  }
}

/* Skill 创作流程 */
function goToCreation2() {
  const name = $('skill-name-input')?.value.trim()
  const desc = $('skill-desc-input')?.value.trim()
  if (!name) {
    $('skill-name-input').style.borderColor = '#FF2442'
    $('skill-name-input').focus()
    return
  }
  Nav.push('screen-creation-2', {})
}

/* Step 2 对话推进 */
function advanceDialogue() {
  const state = creationStep2State
  if (state.waitingForAI || state.trialShown) return

  const nextIndex = state.dialogueIndex + 1
  if (nextIndex >= CREATION_DIALOGUE.length) return

  const msg = CREATION_DIALOGUE[nextIndex]
  state.dialogueIndex = nextIndex

  if (msg.role === 'ai') {
    state.waitingForAI = true
    showThinking()
    setTimeout(() => {
      removeThinking()
      showDialogueMessage(nextIndex)
      state.waitingForAI = false
    }, 1200)
  } else if (msg.role === 'user') {
    showDialogueMessage(nextIndex)
  } else if (msg.role === 'trial-card') {
    state.trialShown = true
    showTrialCard(msg.skillId)
    // 显示"下一步"按钮
    const bar = $('creation-continue-bar')
    if (bar) bar.classList.add('visible')
    // 隐藏提示
    const hint = $('tap-hint')
    if (hint) hint.style.display = 'none'
  }
}

function showDialogueMessage(index) {
  const msg = CREATION_DIALOGUE[index]
  const area = $('creation-chat-area')
  if (!area) return

  const div = document.createElement('div')
  div.className = 'fade-in'

  if (msg.role === 'user') {
    div.innerHTML = `
      <div class="chat-bubble-wrap user">
        <div class="chat-bubble user">${msg.text.replace(/\n/g,'<br>')}</div>
      </div>`
  } else if (msg.role === 'ai') {
    div.innerHTML = `
      <div class="chat-bubble-wrap">
        <img src="docs/screenshots/diandianicon.png" class="chat-avatar-sm dd-chat-avatar">
        <div class="chat-bubble ai md-content">${renderMarkdown(msg.text)}</div>
      </div>`
  }

  area.appendChild(div)
  area.scrollTop = area.scrollHeight

  // 如果是最后一条普通消息，自动推进
  if (msg.role === 'user' && index < CREATION_DIALOGUE.length - 1) {
    const next = CREATION_DIALOGUE[index + 1]
    if (next && next.role === 'ai') {
      creationStep2State.waitingForAI = true
      showThinking()
      setTimeout(() => {
        removeThinking()
        creationStep2State.dialogueIndex = index + 1
        showDialogueMessage(index + 1)
        creationStep2State.waitingForAI = false
        checkNextTrialCard(index + 1)
      }, 1200)
    }
  }
}

function checkNextTrialCard(index) {
  if (index + 1 < CREATION_DIALOGUE.length) {
    const next = CREATION_DIALOGUE[index + 1]
    if (next && next.role === 'trial-card') {
      creationStep2State.trialShown = true
      creationStep2State.dialogueIndex = index + 1
      setTimeout(() => {
        showTrialCard(next.skillId)
        const bar = $('creation-continue-bar')
        if (bar) bar.classList.add('visible')
        const hint = $('tap-hint')
        if (hint) hint.style.display = 'none'
      }, 600)
    }
  }
}

function showThinking() {
  const area = $('creation-chat-area')
  if (!area) return
  const div = document.createElement('div')
  div.id = 'thinking-indicator'
  div.className = 'chat-bubble-wrap fade-in'
  div.innerHTML = `
    <div class="chat-avatar-sm" style="background:#10B981;color:white;font-size:12px;">●</div>
    <div class="chat-bubble ai" style="padding:10px 14px;">
      <div class="thinking-bubble">
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
      </div>
    </div>`
  area.appendChild(div)
  area.scrollTop = area.scrollHeight
}

function removeThinking() {
  $('thinking-indicator')?.remove()
}

function showTrialCard(skillId) {
  const skill = getSkill(skillId)
  if (!skill) return
  const area = $('creation-chat-area')
  if (!area) return

  const div = document.createElement('div')
  div.className = 'chat-bubble-wrap fade-in'
  div.innerHTML = `
    <div class="chat-avatar-sm" style="background:#10B981;color:white;font-size:12px;">●</div>
    <div style="max-width:80%;">
      <div class="trial-card" onclick="Nav.push('screen-skill-chat', {skillId:${skill.id}})">
        <div class="trial-card-icon" style="background:${skill.iconBg}">${skill.icon}</div>
        <div class="trial-card-info">
          <div class="trial-card-name">${skill.name}</div>
          <div class="trial-card-desc">${skill.description}</div>
          <div class="trial-card-action">点击试用 →</div>
        </div>
      </div>
    </div>`
  area.appendChild(div)

  // 试用卡片之后追加「完成定义」按钮
  setTimeout(() => {
    const nextBtn = document.createElement('div')
    nextBtn.className = 'chat-bubble-wrap fade-in'
    nextBtn.style.justifyContent = 'center'
    nextBtn.innerHTML = `
      <button class="creation-finish-btn" onclick="Nav.push('screen-creation-3', {})">
        ✅ 完成定义，查看说明书 →
      </button>`
    area.appendChild(nextBtn)
    area.scrollTop = area.scrollHeight
  }, 600)

  area.scrollTop = area.scrollHeight
}

function toggleManualEdit() {
  const preview = $('manual-preview')
  const editor = $('manual-editor')
  const btn = $('manual-toggle-btn')
  if (!preview || !editor || !btn) return

  const isEditing = editor.style.display !== 'none'
  if (isEditing) {
    // 切回预览：用编辑后的内容重新渲染
    preview.innerHTML = renderMarkdown(editor.value)
    preview.style.display = ''
    editor.style.display = 'none'
    btn.textContent = '编辑'
  } else {
    // 切到编辑
    preview.style.display = 'none'
    editor.style.display = 'block'
    btn.textContent = '预览'
    editor.focus()
  }
}

function showPublishSuccess() {
  const mask = $('publish-success-mask')
  if (mask) mask.classList.add('show')
}

function afterPublish() {
  // 返回到主界面
  const mask = $('publish-success-mask')
  if (mask) mask.classList.remove('show')
  // 连续弹出直到回到首页
  while (Nav.stack.length > 1) Nav.pop()
}

/* ===== 初始化 ===== */
function init() {
  renderHome()

  // 底部导航 — 切换 feed / messages
  $('nav-home')?.addEventListener('click', () => {
    if (homeTab !== 'feed') switchHomeTab('feed')
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'))
    $('nav-home').classList.add('active')
  })
  $('nav-messages')?.addEventListener('click', () => {
    if (homeTab !== 'messages') switchHomeTab('messages')
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'))
    $('nav-messages').classList.add('active')
  })
}

document.addEventListener('DOMContentLoaded', init)
