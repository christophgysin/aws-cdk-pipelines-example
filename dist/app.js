(async () => {
  console.log('Hello CDK!');

  const url = 'https://api.christophgys.in';

  const response = await fetch(url);
  const data = await response.json();

  console.log('data:', JSON.stringify(data, null, 2));
})();
