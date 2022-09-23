class Pagination {
  defaultMessages = {
    firstPage: "❗️ That's the first page",
    lastPage: "❗️ That's the last page",
    prev: "⬅️",
    next: "➡️",
    delete: "❌",
    indexKey: "order",
  };

  constructor({
    data = [],
    lazy = false,
    total,
    pageSize = 10,
    rowSize = 5,
    currentPage = 1,
    isButtonsMode = false,
    buttonModeOptions = {
      isSimpleArray: true,
      titleKey: "",
    },
    isEnabledDeleteButton = true,
    inlineCustomButtons = null,
    onSelect = () => {},
    format = (item, index) => `${index + 1}. ${item}`,
    header = (currentPage, pageSize, total) =>
      `Items ${(currentPage - 1) * pageSize + 1}-${
        currentPage * pageSize <= total ? currentPage * pageSize : total
      } of ${total}`,
    messages = this.defaultMessages,
  }) {
    this.lazy = lazy;
    if (!this.lazy && Array.isArray(data)) {
      this.data = data;
    } else if (this.lazy && typeof data === "function") {
      this.data = data;
    } else {
      throw new TypeError(
        `data must be function or array depending on value of lazy`
      );
    }
    this.pageSize = pageSize;
    this.rowSize = rowSize;
    this.currentPage = currentPage;
    this.onSelect = onSelect;
    this.format = format;
    this.header = header;
    this.messages = messages;
    this.total = this.lazy ? total ?? Infinity : this.data.length;
    this.totalPages = Math.ceil(this.total / this.pageSize);
    this.currentPage =
      currentPage && (this.lazy || currentPage < this.totalPages)
        ? currentPage
        : 1;
    this.isButtonsMode = isButtonsMode;
    this.isEnabledDeleteButton = isEnabledDeleteButton;
    this.format = format;
    this.header = header;
    this.onSelect = onSelect;
    this.messages = Object.assign(this.defaultMessages, messages);
    this.inlineCustomButtons = inlineCustomButtons;
    this.buttonModeOptions = {
      isSimpleArray: true,
      titleKey: "",
    };

    if (typeof buttonModeOptions === "object") {
      if (typeof buttonModeOptions.isSimpleArray !== "undefined") {
        const { isSimpleArray } = buttonModeOptions;
        this.buttonModeOptions.isSimpleArray = isSimpleArray;
      }

      if (typeof buttonModeOptions.titleKey !== "undefined") {
        const { titleKey } = buttonModeOptions;
        this.buttonModeOptions.titleKey = titleKey;
      }
    }

    this._callbackStr = Math.random().toString(36).slice(2);

    this.currentItems = [];
  }

  async text() {
    let items = [];

    if (false === this.isButtonsMode) {
      if (this.lazy) {
        this.currentItems = await this.data(this.currentPage, this.pageSize);
      } else {
        this.currentItems = getPageData(
          this.data,
          this.currentPage,
          this.pageSize
        );
      }

      items = this.currentItems;
    }

    const header = this.header(this.currentPage, this.pageSize, this.total);
    const itemsText = items.map(this.format).join("\n");

    return `${header}\n${itemsText}`;
  }

  async keyboard() {
    const keyboard = [];

    if (this.lazy) {
      this.currentItems = await this.data(this.currentPage, this.pageSize);
    } else {
      this.currentItems = getPageData(
        this.data,
        this.currentPage,
        this.pageSize
      );
    }
    const items = this.currentItems;

    let row = [];

    if (this.isButtonsMode === false) {
      // Pagination buttons
      for (let i = 0; i < items.length; i++) {
        if (0 === i % this.rowSize && row.length) {
          keyboard.push(row);
          row = [];
        }
        let item = items[i];
        if (this.messages.indexKey === "order") {
          item.order = i + 1;
        }
        let button = getButton(
          item[this.messages.indexKey],
          `${this._callbackStr}-${i}`
        );
        row.push(button);
      }
    } else {
      // Need to display the title from an associative array?...
      let { isSimpleArray, titleKey } = this.buttonModeOptions;

      if (isSimpleArray) {
        titleKey = 0;
      }

      // Pagination buttons
      for (let i = 0; i < items.length; i++) {
        if (0 === i % 1 && row.length) {
          keyboard.push(row);
          row = [];
        }

        let currentItem = items[i];
        let textButton =
          typeof currentItem[titleKey] !== "undefined" &&
          currentItem[titleKey] != ""
            ? currentItem[titleKey]
            : `Element #${i + 1}`;

        let button = getButton(textButton, `${this._callbackStr}-${i}`);
        row.push(button);
      }
    }

    keyboard.push(row);
    row = [];

    // Pagination Controls
    if (this.totalPages > 1) {
      row.push(getButton(this.messages.prev, `${this._callbackStr}-prev`));
      if (this.isEnabledDeleteButton) {
        row.push(
          getButton(this.messages.delete, `${this._callbackStr}-delete`)
        );
      }
      row.push(getButton(this.messages.next, `${this._callbackStr}-next`));
      keyboard.push(row);
    }

    // If needed add custom buttons
    if (
      this.inlineCustomButtons &&
      typeof this.inlineCustomButtons === "object"
    ) {
      keyboard.push(this.inlineCustomButtons);
    }

    // Give ready-to-use Telegra Markup object
    return {
      reply_markup: { inline_keyboard: keyboard },
    };
  }

  handleActions(composer) {
    composer.action(new RegExp(this._callbackStr + "-(.+)"), async (ctx) => {
      let data = ctx.match[1];
      let text;
      let keyboard;
      switch (data) {
        case "prev":
          if (this.currentPage <= 1) {
            return await ctx.answerCbQuery(this.messages.firstPage);
          }
          this.currentPage = this.currentPage - 1;
          text = await this.text();
          keyboard = await this.keyboard();
          await ctx.editMessageText(text, {
            ...keyboard,
            parse_mode: "HTML",
          });
          break;
        case "next":
          if (this.currentPage >= this.totalPages) {
            return await ctx.answerCbQuery(this.messages.lastPage);
          }
          this.currentPage = this.currentPage + 1;
          text = await this.text();
          keyboard = await this.keyboard();
          await ctx.editMessageText(text, {
            ...keyboard,
            parse_mode: "HTML",
          });
          break;
        case "delete":
          await ctx.deleteMessage();
          break;
        default:
          this.onSelect(this.currentItems[data], parseInt(data) + 1, ctx);
      }
      return await ctx.answerCbQuery();
    });
  }
}

const getPageData = (data, page, pageSize) =>
  data.slice((page - 1) * pageSize, page * pageSize);

const getButton = (text, callback_data) => ({ text, callback_data });

module.exports = { Pagination };
