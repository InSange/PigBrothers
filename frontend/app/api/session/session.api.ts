async function fetchData() {
  const data = await fetch('api/session');
  return data.json();
}
