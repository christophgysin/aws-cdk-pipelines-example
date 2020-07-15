const apiDomain = process.env.API_DOMAIN;
const apiUrl = `https://${apiDomain}`;

(async () => {
  console.log('Hello CDK!');

  const response = await fetch(apiUrl);
  const data = await response.json();

  console.log('data:', JSON.stringify(data, null, 2));
})();
