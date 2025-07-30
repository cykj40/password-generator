# Password Generator

## Description

This project is now a **Next.js Progressive Web App (PWA)** that allows users to generate secure passwords based on specified criteria. Built with Next.js, it offers fast performance, modern React features, and is installable as a PWA for offline use. The app provides a convenient way to create strong passwords on any device.

## Features

- Built with [Next.js](https://nextjs.org/) and React.
- Choose a password length between 8-30 characters.
- Include uppercase letters, lowercase letters, numbers, and special characters.
- Responsive design for optimal viewing on any device.
- Installable as a Progressive Web App (PWA) for offline use.
- Fast, server-side rendered and statically generated pages.
- SEO-friendly routes.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [PWA Installation](#pwa-installation)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Questions](#questions)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cykj40/password-generator.git
   cd password-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click the "Generate Password" button.
2. Choose your password criteria (length, character types, etc.).
3. Your new random password will be generated and displayed.

## PWA Installation

1. Open the application in your browser (deployed URL or local).
2. Click on the install button in the address bar (typically appears as a "+" icon) or use your browser's "Add to Home Screen" feature.
3. Follow the prompts to add the app to your home screen or desktop.

### Manifest Configuration

Here is a typical `manifest.json` configuration for a Next.js PWA:

```json
{
  "name": "Password Generator",
  "short_name": "PassGen",
  "description": "A secure password generator with strength meter",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111827",
  "theme_color": "#111827",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

*Note: Next.js PWA support is typically added using the `next-pwa` package. Make sure your `next.config.js` is configured accordingly.*

## Development

To run the project locally in development mode:

```bash
npm run dev
```

To build and start the production version:

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! If you have suggestions for improvements, please fork the repository and create a pull request. You can also open an issue with your ideas.

## License

This application is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Questions

If you have any questions, feel free to contact me:
- Email: cyrusk81@gmail.com
- GitHub: [cykj40](https://github.com/cykj40)

---



