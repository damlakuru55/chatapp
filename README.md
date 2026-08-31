# Chat App

A simple and modern chat application built with a clean and user-friendly interface.

## Features

- Send and receive messages
- Dynamic message display
- Clean and responsive design
- Easy-to-use controls
- Keyboard-friendly interaction
- Clear conversation states

## Accessibility

The interface should keep message controls keyboard-friendly, provide clear focus states, and use descriptive labels for interactive elements.

## Message UX

Messages should appear in a predictable order and the composer should provide immediate feedback when an empty message is submitted. Dynamic content should be rendered safely rather than treating user text as HTML.

## Conversation States

The chat interface should distinguish between an empty conversation, an active conversation, and a message-send error. This makes the UI state explicit and gives users useful feedback when an action cannot be completed.

## Error Handling

Message failures should preserve the user's entered text when possible and explain what happened. The send control should return to an actionable state after a failed operation.

## Message Ordering

New messages should be appended in a consistent order so the conversation remains easy to follow. If automatic scrolling is used, users should still be able to review earlier messages.

## Technologies

- HTML
- CSS
- JavaScript

## Getting Started

Clone the repository and open the project in a modern browser.

## Purpose

This project was created to practice user interaction, DOM manipulation, dynamic message handling, validation, ordering, and responsive frontend development.

## License

This project is open source and available under the MIT License.
