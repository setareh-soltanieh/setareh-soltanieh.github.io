(function () {
	"use strict";

	var script = document.currentScript;
	var configuredApiUrl = "";

	if (window.SETAREH_CHATBOT_API_URL) {
		configuredApiUrl = window.SETAREH_CHATBOT_API_URL;
	} else if (script && script.dataset.apiUrl) {
		configuredApiUrl = script.dataset.apiUrl;
	}

	function normalizeApiUrl(value) {
		if (!value || value.indexOf("your-chatbot-backend") !== -1) {
			return "";
		}

		return value.replace(/\/+$/, "");
	}

	function getApiBaseUrl() {
		var explicitUrl = normalizeApiUrl(configuredApiUrl);

		if (explicitUrl) {
			return explicitUrl;
		}

		if (
			window.location.protocol === "file:" ||
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1"
		) {
			return "http://127.0.0.1:8000";
		}

		return "";
	}

	function createElement(tagName, className, text) {
		var element = document.createElement(tagName);
		if (className) {
			element.className = className;
		}
		if (text) {
			element.textContent = text;
		}
		return element;
	}

	function addMessage(messagesEl, role, content) {
		var message = createElement("div", "chatbot-message " + role, content);
		messagesEl.appendChild(message);
		messagesEl.scrollTop = messagesEl.scrollHeight;
		return message;
	}

	function setLoading(inputEl, sendButton, isLoading) {
		inputEl.disabled = isLoading;
		sendButton.disabled = isLoading;
	}

	function autoResize(inputEl) {
		inputEl.style.height = "auto";
		inputEl.style.height = Math.min(inputEl.scrollHeight, 112) + "px";
	}

	async function readError(response) {
		try {
			var data = await response.clone().json();
			if (data.detail) {
				return data.detail;
			}
		} catch (error) {
			// Fall back to text below.
		}

		return (await response.text()) || "The chatbot could not respond.";
	}

	function initChatbot() {
		if (document.querySelector(".chatbot-widget")) {
			return;
		}

		var apiBaseUrl = getApiBaseUrl();
		var conversation = [];

		var widget = createElement("div", "chatbot-widget");
		var toggle = createElement("button", "chatbot-toggle");
		toggle.type = "button";
		toggle.setAttribute("aria-expanded", "false");
		toggle.setAttribute("aria-label", "Open chatbot");
		toggle.innerHTML = '<span class="fa fa-comments-o" aria-hidden="true"></span><span>Chat</span>';

		var panel = createElement("section", "chatbot-panel");
		panel.setAttribute("aria-label", "Chatbot");

		var header = createElement("div", "chatbot-header");
		var title = createElement("h2", "chatbot-title", "Ask Setareh");
		var closeButton = createElement("button", "chatbot-close", "x");
		closeButton.type = "button";
		closeButton.setAttribute("aria-label", "Close chatbot");
		header.appendChild(title);
		header.appendChild(closeButton);

		var messages = createElement("div", "chatbot-messages");
		var form = createElement("form", "chatbot-form");
		var input = createElement("textarea", "chatbot-input");
		input.rows = 1;
		input.placeholder = "Ask a question...";
		var sendButton = createElement("button", "chatbot-send");
		sendButton.type = "submit";
		sendButton.setAttribute("aria-label", "Send message");
		sendButton.innerHTML = '<span class="fa fa-paper-plane-o" aria-hidden="true"></span>';

		form.appendChild(input);
		form.appendChild(sendButton);
		panel.appendChild(header);
		panel.appendChild(messages);
		panel.appendChild(form);
		widget.appendChild(panel);
		widget.appendChild(toggle);
		document.body.appendChild(widget);

		addMessage(messages, "bot", "Hi, I am Setareh's chatbot. Ask me a question about her work, projects, or experience.");

		if (!apiBaseUrl) {
			addMessage(
				messages,
				"status",
				"The chatbot frontend is installed. Connect it to your deployed FastAPI backend by setting data-api-url on assets/js/chatbot-widget.js."
			);
		}

		function openWidget() {
			widget.classList.add("is-open");
			toggle.setAttribute("aria-expanded", "true");
			window.setTimeout(function () {
				input.focus();
			}, 50);
		}

		function closeWidget() {
			widget.classList.remove("is-open");
			toggle.setAttribute("aria-expanded", "false");
			toggle.focus();
		}

		toggle.addEventListener("click", function () {
			if (widget.classList.contains("is-open")) {
				closeWidget();
			} else {
				openWidget();
			}
		});

		closeButton.addEventListener("click", closeWidget);

		input.addEventListener("input", function () {
			autoResize(input);
		});

		input.addEventListener("keydown", function (event) {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				form.requestSubmit();
			}
		});

		form.addEventListener("submit", async function (event) {
			event.preventDefault();

			var text = input.value.trim();
			if (!text) {
				return;
			}

			if (!apiBaseUrl) {
				addMessage(messages, "error", "The chatbot backend URL has not been configured yet.");
				return;
			}

			input.value = "";
			autoResize(input);
			addMessage(messages, "user", text);
			conversation.push({ role: "user", content: text });
			setLoading(input, sendButton, true);

			var thinkingMessage = addMessage(messages, "bot", "Thinking...");

			try {
				var response = await fetch(apiBaseUrl + "/chat", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ messages: conversation })
				});

				if (!response.ok) {
					throw new Error(await readError(response));
				}

				var data = await response.json();
				var reply = data.reply || "I received a response, but it did not include a reply.";
				thinkingMessage.textContent = reply;
				conversation.push({ role: "assistant", content: reply });
			} catch (error) {
				thinkingMessage.remove();
				addMessage(messages, "error", error.message || "The chatbot could not respond.");
			} finally {
				setLoading(input, sendButton, false);
				input.focus();
			}
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initChatbot);
	} else {
		initChatbot();
	}
})();
