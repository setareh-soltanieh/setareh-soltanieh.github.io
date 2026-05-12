# setarehsoltanieh.github.io
Personal website

## Chatbot widget

This static GitHub Pages site includes a floating chatbot widget powered by
`assets/js/chatbot-widget.js` and `assets/css/chatbot-widget.css`.

The widget expects the FastAPI backend from
`https://github.com/setareh-soltanieh/my_chatbot` to be deployed separately.
The deployed backend origin is `https://my-chatbot-8vsz.onrender.com`.
It is configured in these HTML files:

- `index.html`
- `experience.html`
- `publications.html`
- `blog/index.html`

For local website testing, the widget will call the deployed Render backend above.
To test a local backend at `http://127.0.0.1:8000`, temporarily remove the
`data-api-url` attribute or set it to the local backend origin.
