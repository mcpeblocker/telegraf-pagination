# telegraf-pagination

A simplified Telegraf plugin to provide users with a great interface.

## Gettings started

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

```js
const  Pagination  =  require('telegraf-pagination');

let data = [...]; // define data as an array

let pagination = new Pagination({ data });
let text = pagination.text;
let keyboard = pagination.keyboard;

pagination.handleActions(bot);

bot.telegram.sendMessage(ID, text, keyboard); // Replace ID with your account id or username
```

## Full Example

```js
const { Telegraf } = require("telegraf");
const Pagination = require("telegraf-pagination");

const TOKEN = "YOUR_BOT_TOKEN";
const bot = new Telegraf(TOKEN);

let fakeData = Array(10)
  .fill(0)
  .map((_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
  }));

bot.command("pagination", (ctx) => {
  const pagination = new Pagination({
    data: fakeData, // required
    header: (currentPage, pageSize, total) =>
      `${currentPage}-page of total ${total}`, // optional. Default value: 👇
    // `Items ${(currentPage - 1) * pageSize + 1 }-${currentPage * pageSize <= total ? currentPage * pageSize : total} of ${total}`;
    format: (item, index) => `${index + 1}. ${item.title}`, // optional. Default value: 👇
    // `${index + 1}. ${item}`;
    pageSize: 8, // optional. Default value: 10
    rowSize: 4, // optional. Default value: 5 (maximum 8)
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
  });

  pagination.handleActions(bot); // pass bot or scene instance as a parameter

  let text = pagination.text; // get pagination text
  let keyboard = pagination.keyboard; // get pagination keyboard
  ctx.replyWithHTML(text, keyboard);
});

bot.launch().then(() => {
  console.log("Bot is running");
});
```

## Contributing

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our code of conduct. Feel free to submit any pull request.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Alisher Ortiqov** - _Initial work_ - [mcpebloker](https://github.com/mcpeblocker)

See also the list of [contributors](https://github.com/mcpeblocker/telegraf-pagination/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
