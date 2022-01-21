class Pagination {
    data = [];
    onSelect = () => { };
    pageSize = 10;
    rowSize = 5;
    totalPages = 0;
    currentPage = 1;
    currentItems = [];
    format = (item, index) => `${index + 1}. ${item}`;
    header = (currentPage, pageSize, total) => `Items ${(currentPage - 1) * pageSize + 1 }-${currentPage * pageSize <= total ? currentPage * pageSize : total} of ${total}`;
    messages = {
        firstPage: "❗️ That's the first page",
        lastPage: "❗️ That's the last page",
        prev: "⬅️",
        next: "➡️",
        delete: "❌"
    };

    constructor(options) {
        if (options) {
            this.data = options.data;
            this.pageSize = options.pageSize || this.pageSize;
            this.rowSize = options.rowSize || this.rowSize;
            this.totalPages = Math.ceil(this.data.length / this.pageSize);
            this.currentPage = (options.currentPage && options.currentPage < this.totalPages)
                ?
                options.currentPage
                :
                this.currentPage;
            this.format = options.format || this.format;
            this.header = options.header || this.header;
            this.onSelect = options.onSelect || this.onSelect;
            this.messages = Object.assign(this.messages, options.messages);
        }

        this._callbackStr = Math.random().toString(36).slice(2);
    }

    get text() {
        this.currentItems = getPageData(this.data, this.currentPage, this.pageSize);
        const items = this.currentItems;

        const header = this.header(this.currentPage, this.pageSize, this.data.length);
        const itemsText = items.map(this.format).join('\n');

        return `${header}\n${itemsText}`;
    }

    get keyboard() {
        const keyboard = [];

        this.currentItems = getPageData(this.data, this.currentPage, this.pageSize);
        const items = this.currentItems;

        let row = [];
        // Pagination buttons
        for (let i = 0; i < items.length; i++) {
            if (
                !(i % this.rowSize)
                && row.length
            ) {
                keyboard.push(row);
                row = [];
            }
            let button = getButton(
                `${i + 1}`,
                `${this._callbackStr}-${i}`
            )
            row.push(button);
        }
        keyboard.push(row);
        row = [];

        // Pagination Controls
        row.push(getButton(this.messages.prev, `${this._callbackStr}-prev`));
        row.push(getButton(this.messages.delete, `${this._callbackStr}-delete`));
        row.push(getButton(this.messages.next, `${this._callbackStr}-next`));
        keyboard.push(row);

        // Give ready-to-use Telegra Markup object
        return {
            reply_markup: { inline_keyboard: keyboard }
        };
    }

    handleActions(composer) {
        composer.action(new RegExp(this._callbackStr + "-(.+)"), async (ctx) => {
            let data = ctx.match[1];
            let text;
            let keyboard;
            switch (data) {
                case 'prev':
                    if (this.currentPage <= 1) {
                        return await ctx.answerCbQuery(this.messages.firstPage);
                    }
                    this.currentPage = this.currentPage - 1;
                    text = this.text;
                    keyboard = this.keyboard;
                    await ctx.editMessageText(text, {
                        ...keyboard,
                        parse_mode: 'HTML'
                    });
                    break;
                case 'next':
                    let totalPages = Math.ceil(this.data.length / this.pageSize);
                    if (this.currentPage >= totalPages) {
                        return await ctx.answerCbQuery(this.messages.lastPage);
                    }
                    this.currentPage = this.currentPage + 1;
                    text = this.text;
                    keyboard = this.keyboard;
                    await ctx.editMessageText(text, {
                        ...keyboard,
                        parse_mode: 'HTML'
                    });
                    break;
                case 'delete':
                    await ctx.deleteMessage();
                    break;
                default:
                    this.onSelect(this.currentItems[data], parseInt(data) + 1);
            };
            return await ctx.answerCbQuery();
        })
    }
};

const getPageData = (data, page, pageSize) => data.slice((page - 1) * pageSize, page * pageSize);

const getButton = (text, callback_data) => ({ text, callback_data });

module.exports = Pagination;