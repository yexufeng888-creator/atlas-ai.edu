(function () {
    'use strict';

    document.querySelectorAll('[data-resource-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
            var selected = button.getAttribute('data-resource-filter');
            var cards = document.querySelectorAll('[data-category]');
            var visibleCount = 0;

            document.querySelectorAll('[data-resource-filter]').forEach(function (filter) {
                filter.setAttribute('aria-pressed', String(filter === button));
            });

            cards.forEach(function (card) {
                var visible = selected === 'all' || card.getAttribute('data-category') === selected;
                card.hidden = !visible;
                if (visible) visibleCount += 1;
            });

            var empty = document.querySelector('.resource-empty');
            if (empty) empty.hidden = visibleCount !== 0;
        });
    });

    var search = document.querySelector('[data-resource-search]');
    if (search) {
        search.addEventListener('input', function () {
            var query = search.value.trim().toLocaleLowerCase();
            var items = document.querySelectorAll('[data-search-item]');
            var visibleCount = 0;

            items.forEach(function (item) {
                var visible = item.textContent.toLocaleLowerCase().includes(query);
                item.hidden = !visible;
                if (visible) visibleCount += 1;
            });

            var empty = document.querySelector('.resource-empty');
            if (empty) empty.hidden = visibleCount !== 0;
        });
    }

    document.querySelectorAll('[data-copy-target]').forEach(function (button) {
        button.addEventListener('click', function () {
            var target = document.getElementById(button.getAttribute('data-copy-target'));
            var status = document.querySelector(button.getAttribute('data-copy-status'));
            if (!target || !navigator.clipboard || !navigator.clipboard.writeText) {
                if (status) status.textContent = '当前浏览器不支持复制，请手动选择代码。';
                return;
            }

            navigator.clipboard.writeText(target.textContent).then(function () {
                if (status) status.textContent = '代码已复制。';
            }).catch(function () {
                if (status) status.textContent = '复制未成功，请手动选择代码。';
            });
        });
    });
}());
