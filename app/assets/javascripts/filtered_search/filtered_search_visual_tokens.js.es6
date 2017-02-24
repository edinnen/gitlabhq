class FilteredSearchVisualTokens {
  static getLastVisualToken() {
    const input = document.querySelector('.filtered-search');
    const lastVisualToken = input.parentElement.previousElementSibling;

    return {
      lastVisualToken,
      isLastVisualTokenValid: lastVisualToken === null || lastVisualToken.className.indexOf('filtered-search-term') !== -1 || (lastVisualToken && lastVisualToken.querySelector('.value') !== null),
    };
  }

  static unselectTokens() {
    const otherTokens = document.querySelectorAll('.js-visual-token .selectable.selected');
    [].forEach.call(otherTokens, t => t.classList.remove('selected'));
  }

  static selectToken(tokenButton) {
    const selected = tokenButton.classList.contains('selected');
    FilteredSearchVisualTokens.unselectTokens();

    if (!selected) {
      tokenButton.classList.add('selected');
    }
  }

  static removeSelectedToken() {
    const selected = document.querySelector('.js-visual-token .selected');

    if (selected) {
      const li = selected.closest('.js-visual-token');
      li.parentElement.removeChild(li);
    }
  }

  static createVisualTokenElementHTML() {
    return `
      <div class="selectable" role="button">
        <div class="name"></div>
        <div class="value"></div>
      </div>
    `;
  }

  static addVisualTokenElement(name, value, isSearchTerm) {
    const li = document.createElement('li');
    li.classList.add('js-visual-token');
    li.classList.add(isSearchTerm ? 'filtered-search-term' : 'filtered-search-token');

    if (value) {
      li.innerHTML = FilteredSearchVisualTokens.createVisualTokenElementHTML();
      li.querySelector('.value').innerText = value;
    } else {
      li.innerHTML = '<div class="name"></div>';
    }
    li.querySelector('.name').innerText = name;

    const tokensContainer = document.querySelector('.tokens-container');
    const input = document.querySelector('.filtered-search');
    tokensContainer.insertBefore(li, input.parentElement);
  }

  static addValueToPreviousVisualTokenElement(value) {
    const { lastVisualToken } = FilteredSearchVisualTokens.getLastVisualToken();

    if (lastVisualToken.classList.contains('filtered-search-token')) {
      const name = FilteredSearchVisualTokens.getLastTokenPartial();
      lastVisualToken.innerHTML = FilteredSearchVisualTokens.createVisualTokenElementHTML();
      lastVisualToken.querySelector('.name').innerText = name;
      lastVisualToken.querySelector('.value').innerText = value;
    }
  }

  static addFilterVisualToken(tokenName, tokenValue) {
    const { lastVisualToken, isLastVisualTokenValid }
      = FilteredSearchVisualTokens.getLastVisualToken();
    const addVisualTokenElement = FilteredSearchVisualTokens.addVisualTokenElement;

    if (isLastVisualTokenValid) {
      addVisualTokenElement(tokenName, tokenValue);
    } else {
      const previousTokenName = lastVisualToken.querySelector('.name').innerText;
      const tokensContainer = document.querySelector('.tokens-container');
      tokensContainer.removeChild(lastVisualToken);

      const value = tokenValue || tokenName;
      addVisualTokenElement(previousTokenName, value);
    }
  }

  static addSearchVisualToken(searchTerm) {
    const { lastVisualToken } = FilteredSearchVisualTokens.getLastVisualToken();

    if (lastVisualToken.classList.contains('filtered-search-term')) {
      lastVisualToken.querySelector('.name').value += ` ${searchTerm}`;
    } else {
      FilteredSearchVisualTokens.addVisualTokenElement(searchTerm, null, true);
    }
  }

  static getLastTokenPartial() {
    const { lastVisualToken } = FilteredSearchVisualTokens.getLastVisualToken();

    if (!lastVisualToken) return '';

    const value = lastVisualToken.querySelector('.value');
    const name = lastVisualToken.querySelector('.name');

    const valueText = value ? value.innerText : '';
    const nameText = name ? name.innerText : '';

    return valueText || nameText;
  }

  static removeLastTokenPartial() {
    const { lastVisualToken } = FilteredSearchVisualTokens.getLastVisualToken();

    if (lastVisualToken) {
      const value = lastVisualToken.querySelector('.value');

      if (value) {
        const button = lastVisualToken.querySelector('.selectable');
        button.removeChild(value);
        lastVisualToken.innerHTML = button.innerHTML;
      } else {
        lastVisualToken.closest('.tokens-container').removeChild(lastVisualToken);
      }
    }
  }

  static tokenizeInput() {
    const input = document.querySelector('.filtered-search');
    const { isLastVisualTokenValid } = gl.FilteredSearchVisualTokens.getLastVisualToken();

    if (input.value) {
      if (isLastVisualTokenValid) {
        gl.FilteredSearchVisualTokens.addSearchVisualToken(input.value);
      } else {
        FilteredSearchVisualTokens.addValueToPreviousVisualTokenElement(input.value);
      }
    }

    input.value = '';
  }

  static editToken(token) {
    const input = document.querySelector('.filtered-search');

    FilteredSearchVisualTokens.tokenizeInput();

    const name = token.querySelector('.name');
    const value = token.querySelector('.value');

    const tokenContainer = token.parentElement;
    const inputLi = input.parentElement;
    tokenContainer.replaceChild(inputLi, token);

    if (token.classList.contains('filtered-search-token')) {
      FilteredSearchVisualTokens.addFilterVisualToken(name.innerText);
    } else {
      input.value = name.innerText;
    }

    if (value) {
      input.value = value.innerText;
    }

    input.focus();
    input.click();
  }

  static moveInputToTheRight() {
    const input = document.querySelector('.filtered-search');
    const inputLi = input.parentElement;
    const tokenContainer = document.querySelector('.tokens-container');

    if (tokenContainer.lastChild !== inputLi) {
      FilteredSearchVisualTokens.tokenizeInput();

      const { isLastVisualTokenValid } = gl.FilteredSearchVisualTokens.getLastVisualToken();
      if (!isLastVisualTokenValid) {
        const lastPartial = gl.FilteredSearchVisualTokens.getLastTokenPartial();
        gl.FilteredSearchVisualTokens.removeLastTokenPartial();
        gl.FilteredSearchVisualTokens.addSearchVisualToken(lastPartial);
      }

      tokenContainer.removeChild(inputLi);
      tokenContainer.appendChild(inputLi);
    }
  }
}

window.gl = window.gl || {};
gl.FilteredSearchVisualTokens = FilteredSearchVisualTokens;
