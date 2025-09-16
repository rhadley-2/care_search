document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const input = document.getElementById('searchInput').value.trim();
  if (input) {
    const encoded = input.split(' ').join('%2520');
    const url = `https://netflixcare.sprinklr.com/care/knowledge-base?shareView=1&search=${encoded}&filters=%255B%255D&sort=%255B%255D`;
    chrome.tabs.update({ url });
  }
}