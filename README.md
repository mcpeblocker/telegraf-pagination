# telegraf-pagination

A simplified Telegraf plugin to provide users with a great interface.

## Getting started

### Prerequisites

You need to have telegraf installed on your project to use that plugin.

```shellscript
$ npm install telegraf
```

or

```shellscript
$ yarn add telegraf
```

See [offical guide](https://github.com/telegraf/telegraf/#readme) for more info.
Once you have installed telegraf in your project, you can use telegraf-pagination.

### Installing

Run one of these commands depending on what package manager you're using:

```shellscript
$ npm install telegraf-pagination
```

or

```shellscript
$ yarn add telegraf-pagination
```

### Quick start

Default mode
```js
const { Pagination } =  require('telegraf-pagination');

let data = [...]; // define data as an array

bot.start(async ctx => {
    let pagination = new Pagination({ data });
    let text = await pagination.text();
    let keyboard = await pagination.keyboard();
    ctx.reply(text, keyboard);

    pagination.handleActions(bot);
});
```

Lazy mode
```js
const { Pagination } =  require('telegraf-pagination');

let data = [...]; // define data as an array

bot.start(async ctx => {
    let pagination = new Pagination({
        lazy: true, // switch lazy mode on
        data: (page, size) => data.slice((page-1)*size, page*size), // callback that returns items of the page. Can be asynchronous
        total: data.length // optional. can be useful when generating a header
    });
    let text = await pagination.text();
    let keyboard = await pagination.keyboard();
    ctx.reply(text, keyboard);

    pagination.handleActions(bot);
});
```

## Full Example

```js
const { Markup, Telegraf } = require("telegraf");
const { Pagination } = require("telegraf-pagination");

const TOKEN = "YOUR_BOT_TOKEN";
const bot = new Telegraf(TOKEN);

let fakeData = Array(10)
  .fill(0)
  .map((_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
  }));

bot.command("pagination", async (ctx) => {
  const pagination = new Pagination({
    data: fakeData, // array of items
    header: (currentPage, pageSize, total) =>
      `${currentPage}-page of total ${total}`, // optional. Default value: 👇
    // `Items ${(currentPage - 1) * pageSize + 1 }-${currentPage * pageSize <= total ? currentPage * pageSize : total} of ${total}`;
    format: (item, index) => `${index + 1}. ${item.title}`, // optional. Default value: 👇
    // `${index + 1}. ${item}`;
    pageSize: 8, // optional. Default value: 10
    rowSize: 4, // optional. Default value: 5 (maximum 8)
    isButtonsMode: false, // optional. Default value: false. Allows you to display names on buttons (there is support for associative arrays)
    buttonModeOptions: {
      isSimpleArray: true, // optional. Default value: true. Enables/disables support for associative arrays
      titleKey: '' // optional. Default value: null. If the associative mode is enabled (isSimply: false), determines by which key the title for the button will be taken.
    },
    isEnabledDeleteButton: true, // optional. Default value: true
    onSelect: (item, index) => {
      ctx.reply(item.title);
    }, // optional. Default value: empty function
    messages: {
      // optional
      firstPage: "First page", // optional. Default value: "❗️ That's the first page"
      lastPage: "Last page", // optional. Default value: "❗️ That's the last page"
      prev: "◀️", // optional. Default value: "⬅️"
      next: "▶️", // optional. Default value: "➡️"
      delete: "🗑", // optional. Default value: "❌"
    },
    inlineCustomButtons: [
      Markup.button.callback('Title custom button', 'your_callback_name')
    ] // optional. Default value: null
  });

  pagination.handleActions(bot); // pass bot or scene instance as a parameter

  let text = await pagination.text(); // get pagination text
  let keyboard = await pagination.keyboard(); // get pagination keyboard
  ctx.replyWithHTML(text, keyboard);
});

bot.launch().then(() => {
  console.log("Bot is running");
});
```

## ⚡️ Recent features:

- ### Buttons mode
```js
const { Pagination } =  require('telegraf-pagination');

let data = [...]; // define data as an array

bot.start(async ctx => {
    let pagination = new Pagination({
        data,
        isButtonsMode: true,
        buttonModeOptions: {
          title: "name", // the 'name' property of each item is displayed
          
          // you can implement complex combinations of item keys using function 👇
          // title: (item, i) => i + 1 + ". " + item.title,
        },
    });
    let text = await pagination.text();
    let keyboard = await pagination.keyboard();
    ctx.reply(text, keyboard);

    pagination.handleActions(bot);
});
```

## Contributing

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our code of conduct. Feel free to submit any pull request.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/mcpeblocker/telegraf-pagination/tags).

## Authors

- **Alisher Ortiqov** - _Initial work_ - [mcpeblocker](https://github.com/mcpeblocker)

See also the list of [contributors](https://github.com/mcpeblocker/telegraf-pagination/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
