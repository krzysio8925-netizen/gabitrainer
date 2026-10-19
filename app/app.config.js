// Extends app.json. EXPO_BASE_URL is the folder the web build is served from,
// e.g. "/gabitrainer" on GitHub Pages; empty when served from the domain root.
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, baseUrl: process.env.EXPO_BASE_URL || undefined },
});
