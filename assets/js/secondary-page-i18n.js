(function (window, document) {
  'use strict';

  const locale = (document.documentElement.lang || 'zh-CN').toLowerCase();

  function getLocaleMap(translations) {
    return translations[locale] || translations['zh-cn'] || {};
  }

  function translate(value, translations) {
    const localeMap = getLocaleMap(translations);
    const key = value.trim();
    const result = localeMap[key];
    return result ? value.replace(key, result) : value;
  }

  function apply(translations, root = document.body) {
    const localeMap = getLocaleMap(translations);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style, noscript, template, [data-i18n-skip]')) {
          return NodeFilter.FILTER_REJECT;
        }
        return localeMap[node.nodeValue.trim()]
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      node.nodeValue = translate(node.nodeValue, translations);
    });

    const translatableAttributes = ['aria-label', 'alt', 'placeholder', 'title', 'value'];
    root.querySelectorAll('*').forEach((element) => {
      translatableAttributes.forEach((attribute) => {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, translate(value, translations));
      });
    });
  }

  window.ATLASPageI18n = { locale, apply, translate };
})(window, document);
