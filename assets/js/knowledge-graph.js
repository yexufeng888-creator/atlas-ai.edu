(() => {
  const root = document.querySelector('.knowledge-graph');
  if (!(root instanceof HTMLElement)) return;

  const nodes = [...root.querySelectorAll('[data-memory-node]')];
  const edges = [...root.querySelectorAll('[data-memory-edge]')];
  const search = root.querySelector('#knowledgeSearch');
  const searchStatus = root.querySelector('#knowledgeSearchStatus');
  const category = root.querySelector('#memoryNodeCategory');
  const title = root.querySelector('#memoryNodeTitle');
  const description = root.querySelector('#memoryNodeDescription');
  const relations = root.querySelector('#memoryNodeRelations');
  const relationsTitle = root.querySelector('#memoryRelationsTitle');
  const headingEyebrow = document.querySelector('.page-header .page-eyebrow');
  const headingTitle = document.querySelector('.page-header .page-title');
  const headingDescription = document.querySelector('.page-header .page-description');
  const graphEyebrow = root.querySelector('.knowledge-graph-kicker');
  const graphTitle = root.querySelector('#knowledgeGraphTitle');
  const graphDescription = root.querySelector('.knowledge-graph-heading > div > p:last-child');
  const searchLabel = root.querySelector('label[for="knowledgeSearch"]');
  const graphNote = root.querySelector('.knowledge-graph-note');
  const cards = [...document.querySelectorAll('.memory-sections .section-card')];
  const locale = (document.documentElement.lang || 'zh-CN').toLowerCase();

  if (nodes.length !== 5 || edges.length !== 5 ||
      !(search instanceof HTMLInputElement) || !(searchStatus instanceof HTMLElement) ||
      !(category instanceof HTMLElement) || !(title instanceof HTMLElement) ||
      !(description instanceof HTMLElement) || !(relations instanceof HTMLUListElement) ||
      !(relationsTitle instanceof HTMLElement) || !(headingEyebrow instanceof HTMLElement) ||
      !(headingTitle instanceof HTMLElement) || !(headingDescription instanceof HTMLElement) ||
      !(graphEyebrow instanceof HTMLElement) || !(graphTitle instanceof HTMLElement) ||
      !(graphDescription instanceof HTMLElement) || !(searchLabel instanceof HTMLLabelElement) ||
      !(graphNote instanceof HTMLElement) || cards.length !== 4) {
    console.error('The ATLAS knowledge graph is missing required content or controls.');
    return;
  }

  const content = {
    'zh-cn': {
      eyebrow: '个人知识', pageTitle: '个人知识库',
      pageDescription: '整理个人资料、偏好、经历与项目背景，并查看它们之间的关联。',
      cards: [
        ['个人信息', '整理个人资料与重要事实'],
        ['偏好与习惯', '回看你记录的选择与偏好'],
        ['工作与项目', '按项目整理背景、目标与协作信息'],
        ['关系网络', '查看人物、项目与工作关系的示例']
      ],
      graphEyebrow: '可交互示例', graphTitle: '让信息之间的联系看得见',
      graphDescription: '选择节点查看关联内容。图谱中的资料均为示例，不代表真实用户信息。',
      searchLabel: '搜索示例节点', placeholder: '输入项目、访谈或偏好',
      showing: (count) => `显示 ${count} 个示例节点`, empty: '没有匹配的节点',
      relationsTitle: '关联内容', note: '交互仅用于浏览示例关系，不会保存或修改账户资料。',
      nodes: {
        project: ['项目', '产品评审', '示例项目，与访谈记录、设计原则和日程安排相关。', ['interviews', 'principles', 'timeline', 'preferences']],
        interviews: ['资料', '用户访谈', '示例访谈记录，包含反馈与待进一步确认的问题。', ['project', 'principles']],
        principles: ['记忆', '设计原则', '示例项目中的设计取舍，可与反馈和评审一起查看。', ['project', 'interviews']],
        timeline: ['日程', '评审时间', '示例日程信息，与项目评审和准备事项关联。', ['project']],
        preferences: ['偏好', '先看重点', '示例偏好：先看重点，再按需展开相关信息。', ['project']]
      }
    },
    'zh-hk': {
      eyebrow: '個人知識', pageTitle: '個人知識庫',
      pageDescription: '整理個人資料、偏好、經歷與項目背景，並查看它們之間的關聯。',
      cards: [
        ['個人資料', '整理個人資料與重要事實'],
        ['偏好與習慣', '回看你記錄的選擇與偏好'],
        ['工作與項目', '按項目整理背景、目標與協作資訊'],
        ['關係網絡', '查看人物、項目與工作關係的示例']
      ],
      graphEyebrow: '可互動示例', graphTitle: '看見資訊之間的聯繫',
      graphDescription: '選擇節點查看相關內容。圖譜資料均為示例，不代表真實用戶資訊。',
      searchLabel: '搜尋示例節點', placeholder: '輸入項目、訪談或偏好',
      showing: (count) => `顯示 ${count} 個示例節點`, empty: '找不到相符節點',
      relationsTitle: '相關內容', note: '互動只用於瀏覽示例關係，不會儲存或修改帳戶資料。',
      nodes: {
        project: ['項目', '產品評審', '示例項目，與訪談記錄、設計原則和日程安排相關。', ['interviews', 'principles', 'timeline', 'preferences']],
        interviews: ['資料', '用戶訪談', '示例訪談記錄，包含意見和待進一步確認的問題。', ['project', 'principles']],
        principles: ['記憶', '設計原則', '示例項目的設計取捨，可與意見和評審一起查看。', ['project', 'interviews']],
        timeline: ['日程', '評審時間', '示例日程資訊，與項目評審和準備事項相關。', ['project']],
        preferences: ['偏好', '先看重點', '示例偏好：先看重點，再按需要展開相關資訊。', ['project']]
      }
    },
    'zh-tw': {
      eyebrow: '個人知識', pageTitle: '個人知識庫',
      pageDescription: '整理個人資料、偏好、經歷與專案背景，並查看它們之間的關聯。',
      cards: [
        ['個人資訊', '整理個人資料與重要事實'],
        ['偏好與習慣', '回看你記錄的選擇與偏好'],
        ['工作與專案', '按專案整理背景、目標與協作資訊'],
        ['關係網絡', '查看人物、專案與工作關係的範例']
      ],
      graphEyebrow: '可互動範例', graphTitle: '看見資訊之間的連結',
      graphDescription: '選擇節點查看相關內容。圖譜資料均為範例，不代表真實使用者資訊。',
      searchLabel: '搜尋範例節點', placeholder: '輸入專案、訪談或偏好',
      showing: (count) => `顯示 ${count} 個範例節點`, empty: '找不到符合的節點',
      relationsTitle: '相關內容', note: '互動僅供瀏覽範例關係，不會儲存或修改帳戶資料。',
      nodes: {
        project: ['專案', '產品評審', '範例專案，與訪談記錄、設計原則和行程安排相關。', ['interviews', 'principles', 'timeline', 'preferences']],
        interviews: ['資料', '使用者訪談', '範例訪談記錄，包含意見與待進一步確認的問題。', ['project', 'principles']],
        principles: ['記憶', '設計原則', '範例專案中的設計取捨，可與意見和評審一併查看。', ['project', 'interviews']],
        timeline: ['行程', '評審時間', '範例行程資訊，與專案評審和準備事項相關。', ['project']],
        preferences: ['偏好', '先看重點', '範例偏好：先看重點，再依需要展開相關資訊。', ['project']]
      }
    },
    en: {
      eyebrow: 'PERSONAL KNOWLEDGE', pageTitle: 'Personal knowledge base',
      pageDescription: 'Organize personal notes, preferences, experiences, and project context, then explore how they relate.',
      cards: [
        ['Personal information', 'Organize profile details and important facts'],
        ['Preferences', 'Review recorded choices and preferences'],
        ['Work and projects', 'Organize context, goals, and collaboration by project'],
        ['Relationships', 'Explore sample links between people and projects']
      ],
      graphEyebrow: 'Interactive example', graphTitle: 'See how information connects',
      graphDescription: 'Select a node to explore related items. All content in this graph is sample data, not real user information.',
      searchLabel: 'Search sample nodes', placeholder: 'Try a project, interview, or preference',
      showing: (count) => `Showing ${count} sample nodes`, empty: 'No matching nodes',
      relationsTitle: 'Related information', note: 'This interaction only explores sample relationships. It does not save or change account data.',
      nodes: {
        project: ['Project', 'Product review', 'A sample project connected to interview notes, design principles, and a calendar item.', ['interviews', 'principles', 'timeline', 'preferences']],
        interviews: ['Source', 'User interviews', 'Sample interview notes with feedback and questions to follow up on.', ['project', 'principles']],
        principles: ['Memory', 'Design principles', 'Sample project decisions to review alongside feedback and the current project.', ['project', 'interviews']],
        timeline: ['Schedule', 'Review date', 'A sample calendar item related to the project review and its preparation.', ['project']],
        preferences: ['Preference', 'Start with priorities', 'A sample preference: see key points first, then open supporting details.', ['project']]
      }
    },
    ja: {
      eyebrow: 'パーソナルナレッジ', pageTitle: '個人ナレッジベース',
      pageDescription: '個人情報、好み、経験、プロジェクトの背景を整理し、関連を確認できます。',
      cards: [
        ['個人情報', 'プロフィールと重要な情報を整理'],
        ['好みと習慣', '記録した選択や好みを確認'],
        ['仕事とプロジェクト', '背景、目標、協働情報を整理'],
        ['関係ネットワーク', '人物やプロジェクトの関連例を確認']
      ],
      graphEyebrow: 'インタラクティブデモ', graphTitle: '情報のつながりを見る',
      graphDescription: 'ノードを選んで関連項目を確認できます。すべてサンプルデータです。',
      searchLabel: 'サンプルノードを検索', placeholder: 'プロジェクト、インタビュー、好み',
      showing: (count) => `サンプルノード ${count} 件を表示`, empty: '一致するノードはありません',
      relationsTitle: '関連情報', note: 'サンプル関係の閲覧のみです。アカウント情報は変更されません。',
      nodes: {
        project: ['プロジェクト', '製品レビュー', 'インタビュー、設計原則、予定に関連するサンプルです。', ['interviews', 'principles', 'timeline', 'preferences']],
        interviews: ['資料', 'ユーザーインタビュー', '意見と確認事項を含むサンプル記録です。', ['project', 'principles']],
        principles: ['記憶', '設計原則', '意見やレビューと一緒に確認できる設計判断の例です。', ['project', 'interviews']],
        timeline: ['予定', 'レビュー日程', 'プロジェクトの準備に関する予定の例です。', ['project']],
        preferences: ['好み', '要点から確認', 'まず要点を見て、必要に応じて詳細を確認する例です。', ['project']]
      }
    },
    ko: {
      eyebrow: '개인 지식', pageTitle: '개인 지식 베이스',
      pageDescription: '개인 정보, 선호, 경험 및 프로젝트 맥락을 정리하고 서로의 관계를 살펴봅니다.',
      cards: [
        ['개인 정보', '프로필과 중요한 정보 정리'],
        ['선호와 습관', '기록된 선택과 선호 확인'],
        ['업무와 프로젝트', '배경, 목표, 협업 정보 정리'],
        ['관계 네트워크', '사람과 프로젝트 간 샘플 관계 보기']
      ],
      graphEyebrow: '인터랙티브 데모', graphTitle: '정보의 연결 보기',
      graphDescription: '노드를 선택해 관련 항목을 확인하세요. 모든 내용은 샘플 데이터입니다.',
      searchLabel: '샘플 노드 검색', placeholder: '프로젝트, 인터뷰 또는 선호',
      showing: (count) => `샘플 노드 ${count}개 표시`, empty: '일치하는 노드가 없습니다',
      relationsTitle: '관련 정보', note: '샘플 관계만 살펴보며 계정 데이터를 저장하거나 변경하지 않습니다.',
      nodes: {
        project: ['프로젝트', '제품 검토', '인터뷰, 디자인 원칙 및 일정과 연결된 샘플 프로젝트입니다.', ['interviews', 'principles', 'timeline', 'preferences']],
        interviews: ['자료', '사용자 인터뷰', '피드백과 확인할 질문이 포함된 샘플 기록입니다.', ['project', 'principles']],
        principles: ['기억', '디자인 원칙', '피드백과 검토 항목을 함께 확인하는 디자인 결정 예시입니다.', ['project', 'interviews']],
        timeline: ['일정', '검토 일정', '프로젝트 검토 준비에 관한 샘플 일정입니다.', ['project']],
        preferences: ['선호', '핵심부터 보기', '핵심을 먼저 확인하고 필요할 때 세부 내용을 여는 예시입니다.', ['project']]
      }
    }
  };
  const copy = content[locale] || content[locale.split('-')[0]] || content.en;

  if (nodes.length !== 5 || edges.length !== 5 || cards.length !== 4 ||
      !(search instanceof HTMLInputElement) || !(searchStatus instanceof HTMLElement) ||
      !(category instanceof HTMLElement) || !(title instanceof HTMLElement) ||
      !(description instanceof HTMLElement) || !(relations instanceof HTMLUListElement) ||
      !(relationsTitle instanceof HTMLElement) || !(graphEyebrow instanceof HTMLElement) ||
      !(graphTitle instanceof HTMLElement) || !(graphDescription instanceof HTMLElement) ||
      !(searchLabel instanceof HTMLLabelElement) || !(graphNote instanceof HTMLElement)) {
    console.error('The ATLAS knowledge graph is missing required content or controls.');
    return;
  }

  const pageHeader = document.querySelector('.page-header');
  if (!(pageHeader instanceof HTMLElement)) {
    console.error('The ATLAS knowledge page is missing its page header.');
    return;
  }
  const pageEyebrow = pageHeader.querySelector('.page-eyebrow');
  const pageTitle = pageHeader.querySelector('.page-title');
  const pageDescription = pageHeader.querySelector('.page-description');
  if (!(pageEyebrow instanceof HTMLElement) || !(pageTitle instanceof HTMLElement) ||
      !(pageDescription instanceof HTMLElement)) {
    console.error('The ATLAS knowledge page has an incomplete page header.');
    return;
  }

  document.title = `${copy.pageTitle} - ATLAS`;
  pageEyebrow.textContent = copy.eyebrow;
  pageTitle.textContent = copy.pageTitle;
  pageDescription.textContent = copy.pageDescription;
  graphEyebrow.textContent = copy.graphEyebrow;
  graphTitle.textContent = copy.graphTitle;
  graphDescription.textContent = copy.graphDescription;
  searchLabel.textContent = copy.searchLabel;
  search.placeholder = copy.placeholder;
  relationsTitle.textContent = copy.relationsTitle;
  graphNote.textContent = copy.note;
  searchStatus.textContent = copy.showing(nodes.length);

  cards.forEach((card, index) => {
    const heading = card.querySelector('h3');
    const summary = card.querySelector('p');
    if (!(heading instanceof HTMLElement) || !(summary instanceof HTMLElement)) return;
    heading.textContent = copy.cards[index][0];
    summary.textContent = copy.cards[index][1];
  });

  const renderNode = (nodeId) => {
    const selected = copy.nodes[nodeId];
    if (!selected) {
      category.textContent = copy.empty;
      title.textContent = copy.empty;
      description.textContent = '';
      relations.replaceChildren();
      nodes.forEach((node) => node.setAttribute('aria-pressed', 'false'));
      return;
    }

    category.textContent = selected[0];
    title.textContent = selected[1];
    description.textContent = selected[2];
    relations.replaceChildren(...selected[3].map((relatedId) => {
      const item = document.createElement('li');
      item.textContent = copy.nodes[relatedId][1];
      return item;
    }));
    nodes.forEach((node) => {
      node.setAttribute('aria-pressed', String(node.dataset.memoryNode === nodeId));
    });
  };

  const applyFilter = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const visibleIds = [];
    nodes.forEach((node) => {
      const data = copy.nodes[node.dataset.memoryNode];
      const matches = [data[0], data[1], data[2]].join(' ').toLocaleLowerCase().includes(query);
      node.hidden = !matches;
      if (matches) visibleIds.push(node.dataset.memoryNode);
    });
    edges.forEach((edge) => {
      const [from, to] = edge.dataset.memoryEdge.split(' ');
      edge.hidden = !visibleIds.includes(from) || !visibleIds.includes(to);
    });
    searchStatus.textContent = visibleIds.length ? copy.showing(visibleIds.length) : copy.empty;
    const current = nodes.find((node) => node.getAttribute('aria-pressed') === 'true');
    if (!current || !visibleIds.includes(current.dataset.memoryNode)) renderNode(visibleIds[0]);
  };

  nodes.forEach((node) => {
    const data = copy.nodes[node.dataset.memoryNode];
    const label = node.querySelector('span');
    const nodeTitle = node.querySelector('strong');
    if (!data || !(label instanceof HTMLElement) || !(nodeTitle instanceof HTMLElement)) {
      console.error('The ATLAS knowledge graph contains an incomplete node.');
      return;
    }
    label.textContent = data[0];
    nodeTitle.textContent = data[1];
    node.addEventListener('click', () => renderNode(node.dataset.memoryNode));
  });
  search.addEventListener('input', applyFilter);
  renderNode('project');
})();
